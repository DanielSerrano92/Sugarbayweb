import "server-only";

import type {
  AddressType,
  OrderStatus,
  PaymentStatus,
  Prisma,
  SupportRequestStatus,
  UserRole,
} from "@/app/generated/prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db";
import { resolveStoreProductImageUrl } from "@/lib/store/product-image-overrides";
import type {
  ProfileUpdateInput,
  SupportRequestInput,
  UpsertAddressInput,
} from "@/lib/validators/account";

type AccountProfileRecord = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string | null;
  country: string;
  birthDate: Date;
  createdAt: Date;
  role: UserRole;
};

export type AccountProfile = AccountProfileRecord;

export type AccountOrder = {
  id: string;
  orderNumber: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentProvider: string;
  totalAmount: number;
  currency: string;
  placedAt: Date;
  shippingAddress: {
    recipientName: string;
    line1: string;
    line2: string | null;
    city: string;
    region: string | null;
    postalCode: string;
    country: string;
    phone: string | null;
  };
  items: Array<{
    id: string;
    productName: string;
    variantName: string | null;
    sku: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    imageUrl: string | null;
  }>;
};

export type AccountAddress = {
  id: string;
  type: AddressType;
  label: string | null;
  recipientName: string;
  line1: string;
  line2: string | null;
  city: string;
  region: string | null;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ChangePasswordResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "invalid_current" };

export type AccountSupportRequest = {
  id: string;
  subject: string;
  message: string;
  status: SupportRequestStatus;
  createdAt: Date;
  updatedAt: Date;
};

function decimalToNumber(value: Prisma.Decimal | number | string | null): number {
  if (value === null) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toAddressPayload(input: UpsertAddressInput) {
  return {
    label: input.label,
    recipientName: input.recipientName,
    line1: input.line1,
    line2: input.line2,
    city: input.city,
    region: input.region,
    postalCode: input.postalCode,
    country: input.country,
    phone: input.phone,
    isDefault: input.isDefault,
  };
}

function resolveAddressTypes(inputType: UpsertAddressInput["type"]): AddressType[] {
  if (inputType === "BOTH") return ["SHIPPING", "BILLING"];
  return [inputType];
}

function otherAddressType(type: AddressType): AddressType {
  return type === "SHIPPING" ? "BILLING" : "SHIPPING";
}

async function clearDefaultForTypes(
  tx: Prisma.TransactionClient,
  userId: string,
  types: AddressType[],
) {
  if (types.length === 0) return;

  await tx.address.updateMany({
    where: {
      userId,
      type: {
        in: types,
      },
      isDefault: true,
    },
    data: {
      isDefault: false,
    },
  });
}

export async function getAccountProfile(userId: string): Promise<AccountProfile | null> {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      email: true,
      phone: true,
      country: true,
      birthDate: true,
      createdAt: true,
      role: true,
    },
  });
}

export async function updateAccountProfile(
  userId: string,
  input: ProfileUpdateInput,
): Promise<AccountProfile> {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      username: input.username,
      email: input.email,
      country: input.country,
      phone: input.phone,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      email: true,
      phone: true,
      country: true,
      birthDate: true,
      createdAt: true,
      role: true,
    },
  });
}

export async function listAccountOrders(userId: string): Promise<AccountOrder[]> {
  const orders = await prisma.order.findMany({
    where: {
      userId,
    },
    orderBy: [{ placedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      paymentProvider: true,
      totalAmount: true,
      currency: true,
      placedAt: true,
      shippingRecipientName: true,
      shippingLine1: true,
      shippingLine2: true,
      shippingCity: true,
      shippingRegion: true,
      shippingPostalCode: true,
      shippingCountry: true,
      shippingPhone: true,
      items: {
        orderBy: [{ createdAt: "asc" }],
        select: {
          id: true,
          productNameSnapshot: true,
          variantNameSnapshot: true,
          skuSnapshot: true,
          quantity: true,
          unitPrice: true,
          lineTotal: true,
          imageUrlSnapshot: true,
        },
      },
    },
    take: 30,
  });

  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentProvider: order.paymentProvider,
    totalAmount: decimalToNumber(order.totalAmount),
    currency: order.currency,
    placedAt: order.placedAt,
    shippingAddress: {
      recipientName: order.shippingRecipientName,
      line1: order.shippingLine1,
      line2: order.shippingLine2,
      city: order.shippingCity,
      region: order.shippingRegion,
      postalCode: order.shippingPostalCode,
      country: order.shippingCountry,
      phone: order.shippingPhone,
    },
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productNameSnapshot,
      variantName: item.variantNameSnapshot,
      sku: item.skuSnapshot,
      quantity: item.quantity,
      unitPrice: decimalToNumber(item.unitPrice),
      lineTotal: decimalToNumber(item.lineTotal),
      imageUrl: resolveStoreProductImageUrl(
        null,
        item.imageUrlSnapshot,
        item.productNameSnapshot,
      ),
    })),
  }));
}

export async function listAccountAddresses(userId: string): Promise<AccountAddress[]> {
  return prisma.address.findMany({
    where: {
      userId,
    },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      type: true,
      label: true,
      recipientName: true,
      line1: true,
      line2: true,
      city: true,
      region: true,
      postalCode: true,
      country: true,
      phone: true,
      isDefault: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function createAccountAddress(
  userId: string,
  input: UpsertAddressInput,
): Promise<AccountAddress[]> {
  const types = resolveAddressTypes(input.type);
  const baseAddress = toAddressPayload(input);

  return prisma.$transaction(async (tx) => {
    if (input.isDefault) {
      await clearDefaultForTypes(tx, userId, types);
    }

    const created: AccountAddress[] = [];
    for (const type of types) {
      const address = await tx.address.create({
        data: {
          userId,
          type,
          ...baseAddress,
          isDefault: input.isDefault,
        },
        select: {
          id: true,
          type: true,
          label: true,
          recipientName: true,
          line1: true,
          line2: true,
          city: true,
          region: true,
          postalCode: true,
          country: true,
          phone: true,
          isDefault: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      created.push(address);
    }

    return created;
  });
}

export async function updateAccountAddress(
  userId: string,
  addressId: string,
  input: UpsertAddressInput,
): Promise<AccountAddress[] | null> {
  const baseAddress = toAddressPayload(input);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
      select: {
        id: true,
        type: true,
      },
    });

    if (!existing) return null;

    if (input.type !== "BOTH") {
      if (input.isDefault) {
        await clearDefaultForTypes(tx, userId, [input.type]);
      }

      const updated = await tx.address.update({
        where: {
          id: existing.id,
        },
        data: {
          type: input.type,
          ...baseAddress,
          isDefault: input.isDefault,
        },
        select: {
          id: true,
          type: true,
          label: true,
          recipientName: true,
          line1: true,
          line2: true,
          city: true,
          region: true,
          postalCode: true,
          country: true,
          phone: true,
          isDefault: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return [updated];
    }

    if (input.isDefault) {
      await clearDefaultForTypes(tx, userId, ["SHIPPING", "BILLING"]);
    }

    const primaryUpdated = await tx.address.update({
      where: {
        id: existing.id,
      },
      data: {
        type: existing.type,
        ...baseAddress,
        isDefault: input.isDefault,
      },
      select: {
        id: true,
        type: true,
        label: true,
        recipientName: true,
        line1: true,
        line2: true,
        city: true,
        region: true,
        postalCode: true,
        country: true,
        phone: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const siblingType = otherAddressType(existing.type);
    const sibling = await tx.address.findFirst({
      where: {
        userId,
        type: siblingType,
      },
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
      select: {
        id: true,
      },
    });

    if (sibling) {
      const siblingUpdated = await tx.address.update({
        where: {
          id: sibling.id,
        },
        data: {
          type: siblingType,
          ...baseAddress,
          isDefault: input.isDefault,
        },
        select: {
          id: true,
          type: true,
          label: true,
          recipientName: true,
          line1: true,
          line2: true,
          city: true,
          region: true,
          postalCode: true,
          country: true,
          phone: true,
          isDefault: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return [primaryUpdated, siblingUpdated];
    }

    const siblingCreated = await tx.address.create({
      data: {
        userId,
        type: siblingType,
        ...baseAddress,
        isDefault: input.isDefault,
      },
      select: {
        id: true,
        type: true,
        label: true,
        recipientName: true,
        line1: true,
        line2: true,
        city: true,
        region: true,
        postalCode: true,
        country: true,
        phone: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return [primaryUpdated, siblingCreated];
  });
}

export async function deleteAccountAddress(
  userId: string,
  addressId: string,
): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
      select: {
        id: true,
        type: true,
        isDefault: true,
      },
    });

    if (!existing) return false;

    await tx.address.delete({
      where: {
        id: existing.id,
      },
    });

    if (existing.isDefault) {
      const fallback = await tx.address.findFirst({
        where: {
          userId,
          type: existing.type,
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
        },
      });

      if (fallback) {
        await tx.address.update({
          where: {
            id: fallback.id,
          },
          data: {
            isDefault: true,
          },
        });
      }
    }

    return true;
  });
}

export async function changeAccountPassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<ChangePasswordResult> {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      isActive: true,
      passwordHash: true,
    },
  });

  if (!user || !user.isActive) {
    return { ok: false, reason: "not_found" };
  }

  const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValidCurrentPassword) {
    return { ok: false, reason: "invalid_current" };
  }

  const nextHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      passwordHash: nextHash,
    },
  });

  return { ok: true };
}

export async function deactivateAccount(userId: string): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
      },
    });

    if (!user) return false;

    const now = Date.now();
    const anonymizedEmail = `deleted-${user.id}-${now}@deleted.local`;
    const anonymizedUsername = `deleted_${user.id.slice(-6)}_${now}`;

    await tx.cartItem.deleteMany({
      where: {
        cart: {
          userId,
        },
      },
    });

    await tx.address.deleteMany({
      where: {
        userId,
      },
    });

    await tx.user.update({
      where: {
        id: user.id,
      },
      data: {
        isActive: false,
        email: anonymizedEmail,
        username: anonymizedUsername,
        firstName: "Cuenta",
        lastName: "Eliminada",
        phone: null,
      },
    });

    return true;
  });
}

export async function listAccountSupportRequests(
  userId: string,
): Promise<AccountSupportRequest[]> {
  return prisma.supportRequest.findMany({
    where: {
      userId,
    },
    orderBy: [{ createdAt: "desc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      subject: true,
      message: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
    take: 100,
  });
}

export async function createAccountSupportRequest(
  userId: string,
  input: SupportRequestInput,
): Promise<AccountSupportRequest> {
  return prisma.supportRequest.create({
    data: {
      userId,
      subject: input.subject,
      message: input.message,
    },
    select: {
      id: true,
      subject: true,
      message: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
