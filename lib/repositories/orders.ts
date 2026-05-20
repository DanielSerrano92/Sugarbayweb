import "server-only";

import type { AddressType, Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/db";
import { withDatabaseFallback } from "@/lib/repositories/safe-query";
import { getStripeClient } from "@/lib/services/stripe";
import { resolveStoreProductImageUrl } from "@/lib/store/product-image-overrides";

const cartForOrderInclude = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          currency: true,
          basePrice: true,
          images: {
            select: {
              imageUrl: true,
              isPrimary: true,
              sortOrder: true,
            },
            orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
            take: 1,
          },
        },
      },
      productVariant: {
        select: {
          id: true,
          title: true,
          size: true,
          color: true,
          stock: true,
          sku: true,
          priceOverride: true,
        },
      },
    },
    orderBy: [{ createdAt: "desc" }],
  },
} satisfies Prisma.CartInclude;

type OrderCartRecord = Prisma.CartGetPayload<{
  include: typeof cartForOrderInclude;
}>;

type AddressSnapshot = {
  recipientName: string;
  line1: string;
  line2: string | null;
  city: string;
  region: string | null;
  postalCode: string;
  country: string;
  phone: string | null;
};

type OrderMappedItem = {
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product: {
    id: string;
    name: string;
    slug: string;
    currency: string;
    coverImage: string | null;
  };
  variant: {
    id: string;
    title: string | null;
    size: string;
    sku: string;
  };
};

export type StripeCheckoutOrder = {
  id: string;
  orderNumber: number;
  userId: string;
  currency: string;
  totalAmount: number;
  items: Array<{
    productName: string;
    unitPrice: number;
    quantity: number;
    imageUrl: string | null;
  }>;
};

export type OrderPaymentSummary = {
  id: string;
  orderNumber: number;
  status: "PLACED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
  paymentStatus:
    | "UNPAID"
    | "PENDING"
    | "PAID"
    | "PARTIALLY_REFUNDED"
    | "REFUNDED"
    | "FAILED";
  totalAmount: number;
  currency: string;
  checkoutSessionId: string | null;
  paidAt: Date | null;
};

function decimalToNumber(value: Prisma.Decimal | number | string | null): number {
  if (value === null) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapCartItems(cart: OrderCartRecord): OrderMappedItem[] {
  return cart.items.map((item) => {
    const unitPrice = decimalToNumber(item.unitPriceSnapshot);
    const lineTotal = unitPrice * item.quantity;

    return {
      quantity: item.quantity,
      unitPrice,
      lineTotal,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        currency: item.product.currency,
        coverImage: resolveStoreProductImageUrl(
          item.product.slug,
          item.product.images[0]?.imageUrl ?? null,
          item.product.name,
        ),
      },
      variant: {
        id: item.productVariant.id,
        title: item.productVariant.title,
        size: item.productVariant.size,
        sku: item.productVariant.sku,
      },
    };
  });
}

function addressFromUser(
  user: {
    firstName: string;
    lastName: string;
    country: string;
    addresses: Array<{
      recipientName: string;
      line1: string;
      line2: string | null;
      city: string;
      region: string | null;
      postalCode: string;
      country: string;
      phone: string | null;
      type: AddressType;
      isDefault: boolean;
      createdAt: Date;
    }>;
  },
  type: AddressType,
): AddressSnapshot {
  const candidate = user.addresses
    .filter((address) => address.type === type)
    .sort((a, b) => {
      if (a.isDefault === b.isDefault) {
        return b.createdAt.getTime() - a.createdAt.getTime();
      }
      return a.isDefault ? -1 : 1;
    })[0];

  if (!candidate) {
    const recipientName = `${user.firstName} ${user.lastName}`.trim();
    return {
      recipientName: recipientName || "Sugarbay Fan",
      line1: "Direccion pendiente",
      line2: null,
      city: "Pendiente",
      region: null,
      postalCode: "00000",
      country: user.country,
      phone: null,
    };
  }

  return {
    recipientName: candidate.recipientName,
    line1: candidate.line1,
    line2: candidate.line2,
    city: candidate.city,
    region: candidate.region,
    postalCode: candidate.postalCode,
    country: candidate.country,
    phone: candidate.phone,
  };
}

export async function createPendingOrderFromCart(
  userId: string,
): Promise<StripeCheckoutOrder | null> {
  return prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({
      where: {
        userId,
      },
      include: cartForOrderInclude,
    });

    if (!cart || cart.items.length === 0) return null;

    const user = await tx.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        firstName: true,
        lastName: true,
        country: true,
        addresses: {
          select: {
            recipientName: true,
            line1: true,
            line2: true,
            city: true,
            region: true,
            postalCode: true,
            country: true,
            phone: true,
            type: true,
            isDefault: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) return null;

    const shipping = addressFromUser(user, "SHIPPING");
    const billing = addressFromUser(user, "BILLING");
    const mappedItems = mapCartItems(cart);

    const subtotal = mappedItems.reduce((acc, item) => acc + item.lineTotal, 0);
    const shippingAmount = 0;
    const taxAmount = 0;
    const discountAmount = 0;
    const totalAmount = subtotal + shippingAmount + taxAmount - discountAmount;

    const order = await tx.order.create({
      data: {
        userId,
        cartId: null,
        status: "PLACED",
        paymentStatus: "PENDING",
        paymentProvider: "STRIPE",
        currency: cart.currency,
        subtotal,
        shippingAmount,
        taxAmount,
        discountAmount,
        totalAmount,
        shippingRecipientName: shipping.recipientName,
        shippingLine1: shipping.line1,
        shippingLine2: shipping.line2,
        shippingCity: shipping.city,
        shippingRegion: shipping.region,
        shippingPostalCode: shipping.postalCode,
        shippingCountry: shipping.country,
        shippingPhone: shipping.phone,
        billingRecipientName: billing.recipientName,
        billingLine1: billing.line1,
        billingLine2: billing.line2,
        billingCity: billing.city,
        billingRegion: billing.region,
        billingPostalCode: billing.postalCode,
        billingCountry: billing.country,
        billingPhone: billing.phone,
        items: {
          create: mappedItems.map((item) => ({
            productId: item.product.id,
            productVariantId: item.variant.id,
            productNameSnapshot: item.product.name,
            variantNameSnapshot: item.variant.title ?? item.variant.size,
            skuSnapshot: item.variant.sku,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            lineTotal: item.lineTotal,
            imageUrlSnapshot: item.product.coverImage,
          })),
        },
      },
      include: {
        items: {
          select: {
            productNameSnapshot: true,
            unitPrice: true,
            quantity: true,
            imageUrlSnapshot: true,
          },
        },
      },
    });

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId,
      currency: order.currency,
      totalAmount: decimalToNumber(order.totalAmount),
      items: order.items.map((item) => ({
        productName: item.productNameSnapshot,
        unitPrice: decimalToNumber(item.unitPrice),
        quantity: item.quantity,
        imageUrl: item.imageUrlSnapshot,
      })),
    };
  });
}

export async function attachStripeCheckoutSessionToOrder(params: {
  orderId: string;
  checkoutSessionId: string;
  paymentIntentId?: string;
}) {
  await prisma.order.update({
    where: {
      id: params.orderId,
    },
    data: {
      checkoutSessionId: params.checkoutSessionId,
      paymentIntentId: params.paymentIntentId,
      paymentStatus: "PENDING",
      status: "PLACED",
    },
  });
}

async function clearCartByUserId(tx: Prisma.TransactionClient, userId: string) {
  await tx.cartItem.deleteMany({
    where: {
      cart: {
        userId,
      },
    },
  });
}

export async function markOrderAsPaid(params: {
  checkoutSessionId: string;
  paymentIntentId?: string;
  orderIdFromMetadata?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: {
        OR: [
          params.orderIdFromMetadata
            ? {
                id: params.orderIdFromMetadata,
              }
            : undefined,
          {
            checkoutSessionId: params.checkoutSessionId,
          },
        ].filter(Boolean) as Prisma.OrderWhereInput[],
      },
      select: {
        id: true,
        userId: true,
        paymentStatus: true,
      },
    });

    if (!order) return null;

    if (order.paymentStatus !== "PAID") {
      await tx.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: "PROCESSING",
          paymentStatus: "PAID",
          checkoutSessionId: params.checkoutSessionId,
          paymentIntentId: params.paymentIntentId,
          paidAt: new Date(),
          cancelledAt: null,
        },
      });
    }

    await clearCartByUserId(tx, order.userId);

    return order.id;
  });
}

export async function markOrderAsFailed(params: {
  checkoutSessionId: string;
  paymentIntentId?: string;
  orderIdFromMetadata?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: {
        OR: [
          params.orderIdFromMetadata
            ? {
                id: params.orderIdFromMetadata,
              }
            : undefined,
          {
            checkoutSessionId: params.checkoutSessionId,
          },
        ].filter(Boolean) as Prisma.OrderWhereInput[],
      },
      select: {
        id: true,
        paymentStatus: true,
      },
    });

    if (!order) return null;
    if (order.paymentStatus === "PAID") return order.id;

    await tx.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: "CANCELLED",
        paymentStatus: "FAILED",
        paymentIntentId: params.paymentIntentId,
        cancelledAt: new Date(),
      },
    });

    return order.id;
  });
}

export async function markOrderAsFailedByPaymentIntent(paymentIntentId: string) {
  await prisma.order.updateMany({
    where: {
      paymentIntentId,
      paymentStatus: {
        not: "PAID",
      },
    },
    data: {
      status: "CANCELLED",
      paymentStatus: "FAILED",
      cancelledAt: new Date(),
    },
  });
}

export async function getOrderSummaryBySession(params: {
  userId: string;
  checkoutSessionId: string;
}): Promise<OrderPaymentSummary | null> {
  const order = await withDatabaseFallback(
    () =>
      prisma.order.findFirst({
        where: {
          userId: params.userId,
          checkoutSessionId: params.checkoutSessionId,
        },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          totalAmount: true,
          currency: true,
          checkoutSessionId: true,
          paidAt: true,
        },
      }),
    null,
  );

  if (!order) return null;

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    totalAmount: decimalToNumber(order.totalAmount),
    currency: order.currency,
    checkoutSessionId: order.checkoutSessionId,
    paidAt: order.paidAt,
  };
}

export async function syncOrderWithStripeCheckoutSession(
  checkoutSessionId: string,
): Promise<OrderPaymentSummary | null> {
  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);

    const orderIdFromMetadata =
      typeof session.metadata?.orderId === "string" && session.metadata.orderId.length > 0
        ? session.metadata.orderId
        : undefined;
    const paymentIntentId =
      typeof session.payment_intent === "string" ? session.payment_intent : undefined;

    if (session.payment_status === "paid") {
      await markOrderAsPaid({
        checkoutSessionId: session.id,
        paymentIntentId,
        orderIdFromMetadata,
      });
    } else if (session.status === "expired" || session.payment_status === "unpaid") {
      await markOrderAsFailed({
        checkoutSessionId: session.id,
        paymentIntentId,
        orderIdFromMetadata,
      });
    }
  } catch {
    return null;
  }

  const order = await withDatabaseFallback(
    () =>
      prisma.order.findFirst({
        where: {
          checkoutSessionId,
        },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          totalAmount: true,
          currency: true,
          checkoutSessionId: true,
          paidAt: true,
        },
      }),
    null,
  );

  if (!order) return null;

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    totalAmount: decimalToNumber(order.totalAmount),
    currency: order.currency,
    checkoutSessionId: order.checkoutSessionId,
    paidAt: order.paidAt,
  };
}

export async function markOrderAsFailedByOrderId(orderId: string) {
  await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      status: "CANCELLED",
      paymentStatus: "FAILED",
      cancelledAt: new Date(),
    },
  });
}
