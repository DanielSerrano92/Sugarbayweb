import type { AddressType, Prisma, VariantSize } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/db";
import { withDatabaseFallback } from "@/lib/repositories/safe-query";

const cartWithItemsInclude = {
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

type CartRecord = Prisma.CartGetPayload<{
  include: typeof cartWithItemsInclude;
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

export type CartItemView = {
  id: string;
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
    size: VariantSize;
    color: string | null;
    stock: number;
    sku: string;
  };
};

export type CartView = {
  id: string;
  userId: string;
  currency: string;
  items: CartItemView[];
  totalItems: number;
  subtotal: number;
};

function decimalToNumber(value: Prisma.Decimal | number | string | null): number {
  if (value === null) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapCart(cart: CartRecord): CartView {
  const items = cart.items.map((item) => {
    const unitPrice = decimalToNumber(item.unitPriceSnapshot);
    const lineTotal = unitPrice * item.quantity;

    return {
      id: item.id,
      quantity: item.quantity,
      unitPrice,
      lineTotal,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        currency: item.product.currency,
        coverImage: item.product.images[0]?.imageUrl ?? null,
      },
      variant: {
        id: item.productVariant.id,
        title: item.productVariant.title,
        size: item.productVariant.size,
        color: item.productVariant.color,
        stock: item.productVariant.stock,
        sku: item.productVariant.sku,
      },
    };
  });

  const subtotal = items.reduce((acc, item) => acc + item.lineTotal, 0);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return {
    id: cart.id,
    userId: cart.userId,
    currency: cart.currency,
    items,
    totalItems,
    subtotal,
  };
}

function normalizeQuantity(quantity = 1): number {
  return Math.max(1, Math.min(20, quantity));
}

export async function ensureCartForUser(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function getCartForUser(userId: string): Promise<CartView> {
  const cart = await withDatabaseFallback(
    () =>
      prisma.cart.findUnique({
        where: { userId },
        include: cartWithItemsInclude,
      }),
    null,
  );

  if (!cart) {
    return {
      id: "",
      userId,
      currency: "EUR",
      items: [],
      totalItems: 0,
      subtotal: 0,
    };
  }

  return mapCart(cart);
}

export async function getCartCount(userId: string): Promise<number> {
  const aggregate = await withDatabaseFallback(
    () =>
      prisma.cartItem.aggregate({
        where: {
          cart: {
            userId,
          },
        },
        _sum: {
          quantity: true,
        },
      }),
    {
      _sum: {
        quantity: 0,
      },
    },
  );

  return aggregate._sum.quantity ?? 0;
}

export async function addItemToCart(params: {
  userId: string;
  productId: string;
  productVariantId?: string;
  quantity?: number;
}) {
  const normalizedQuantity = normalizeQuantity(params.quantity);
  await ensureCartForUser(params.userId);

  return prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({
      where: { userId: params.userId },
      select: { id: true },
    });

    if (!cart) {
      throw new Error("No se pudo crear el carrito");
    }

    const product = await tx.product.findFirst({
      where: {
        id: params.productId,
        isPublished: true,
      },
      select: {
        id: true,
        basePrice: true,
      },
    });

    if (!product) {
      throw new Error("Producto no disponible");
    }

    const selectedVariant = params.productVariantId
      ? await tx.productVariant.findFirst({
          where: {
            id: params.productVariantId,
            productId: product.id,
            isActive: true,
          },
          select: {
            id: true,
            stock: true,
            priceOverride: true,
          },
        })
      : await tx.productVariant.findFirst({
          where: {
            productId: product.id,
            isActive: true,
          },
          orderBy: [{ stock: "desc" }, { createdAt: "asc" }],
          select: {
            id: true,
            stock: true,
            priceOverride: true,
          },
        });

    if (!selectedVariant) {
      throw new Error("No hay variantes disponibles para este producto");
    }

    if (selectedVariant.stock <= 0) {
      throw new Error("No hay stock disponible");
    }

    const existing = await tx.cartItem.findUnique({
      where: {
        cartId_productVariantId: {
          cartId: cart.id,
          productVariantId: selectedVariant.id,
        },
      },
      select: {
        id: true,
        quantity: true,
      },
    });

    const nextQuantity = Math.min(
      selectedVariant.stock,
      (existing?.quantity ?? 0) + normalizedQuantity,
    );

    const snapshotPrice = decimalToNumber(
      selectedVariant.priceOverride ?? product.basePrice,
    );

    if (existing) {
      await tx.cartItem.update({
        where: {
          id: existing.id,
        },
        data: {
          quantity: nextQuantity,
          unitPriceSnapshot: snapshotPrice,
        },
      });
      return;
    }

    await tx.cartItem.create({
      data: {
        cartId: cart.id,
        productId: product.id,
        productVariantId: selectedVariant.id,
        quantity: nextQuantity,
        unitPriceSnapshot: snapshotPrice,
      },
    });
  });
}

export async function updateCartItemQuantity(
  userId: string,
  cartItemId: string,
  quantity: number,
) {
  const normalizedQuantity = normalizeQuantity(quantity);

  const cartItem = await prisma.cartItem.findFirst({
    where: {
      id: cartItemId,
      cart: {
        userId,
      },
    },
    include: {
      productVariant: {
        select: {
          stock: true,
        },
      },
    },
  });

  if (!cartItem) return;

  const maxQuantity = Math.max(1, cartItem.productVariant.stock);

  await prisma.cartItem.update({
    where: {
      id: cartItem.id,
    },
    data: {
      quantity: Math.min(normalizedQuantity, maxQuantity),
    },
  });
}

export async function removeCartItem(userId: string, cartItemId: string) {
  const cartItem = await prisma.cartItem.findFirst({
    where: {
      id: cartItemId,
      cart: {
        userId,
      },
    },
    select: {
      id: true,
    },
  });

  if (!cartItem) return;

  await prisma.cartItem.delete({
    where: {
      id: cartItem.id,
    },
  });
}

export async function clearCartForUser(userId: string) {
  await prisma.cartItem.deleteMany({
    where: {
      cart: {
        userId,
      },
    },
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
        return a.createdAt.getTime() - b.createdAt.getTime();
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

export async function persistOrderFromCart(params: {
  userId: string;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  paymentStatus: "PENDING" | "PAID";
}) {
  return prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({
      where: { userId: params.userId },
      include: cartWithItemsInclude,
    });

    if (!cart || cart.items.length === 0) return null;

    const user = await tx.user.findUnique({
      where: {
        id: params.userId,
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
    const mapped = mapCart(cart);

    const subtotal = mapped.subtotal;
    const shippingAmount = 0;
    const taxAmount = 0;
    const discountAmount = 0;
    const totalAmount = subtotal + shippingAmount + taxAmount - discountAmount;

    const order = await tx.order.create({
      data: {
        userId: params.userId,
        cartId: cart.id,
        status: params.paymentStatus === "PAID" ? "PROCESSING" : "PLACED",
        paymentStatus: params.paymentStatus,
        paymentProvider: "STRIPE",
        paymentIntentId: params.stripePaymentIntentId,
        checkoutSessionId: params.stripeCheckoutSessionId,
        currency: mapped.currency,
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
        paidAt: params.paymentStatus === "PAID" ? new Date() : null,
        items: {
          create: mapped.items.map((item) => ({
            productId: item.product.id,
            productVariantId: item.variant.id,
            productNameSnapshot: item.product.name,
            variantNameSnapshot: item.variant.title,
            skuSnapshot: item.variant.sku,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            lineTotal: item.lineTotal,
            imageUrlSnapshot: item.product.coverImage,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    await tx.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return order;
  });
}
