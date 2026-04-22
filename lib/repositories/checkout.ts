import "server-only";

import { AddressType, type Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/db";
import { withDatabaseFallback } from "@/lib/repositories/safe-query";
import {
  emptyCheckoutAddress,
  type CheckoutAddress,
  type CheckoutAddressInput,
} from "@/lib/validators/checkout";

const REGION_SEPARATOR = " | ";

type UserAddressRecord = {
  id: string;
  type: AddressType;
  recipientName: string;
  line1: string;
  line2: string | null;
  city: string;
  region: string | null;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
  updatedAt: Date;
};

type CheckoutPrefill = {
  shipping: CheckoutAddressInput;
  billing: CheckoutAddressInput;
  useSameAddress: boolean;
};

function splitRecipientName(
  recipientName: string | null | undefined,
): { firstName: string; lastName: string } {
  const trimmed = recipientName?.trim();
  if (!trimmed) {
    return { firstName: "", lastName: "" };
  }

  const [firstName, ...rest] = trimmed.split(/\s+/);
  return {
    firstName: firstName ?? "",
    lastName: rest.join(" "),
  };
}

function splitStoredRegion(value: string | null | undefined): {
  province: string;
  region: string;
} {
  const normalized = value?.trim();
  if (!normalized) {
    return {
      province: "",
      region: "",
    };
  }

  if (!normalized.includes(REGION_SEPARATOR)) {
    return {
      province: normalized,
      region: normalized,
    };
  }

  const [province, region] = normalized.split(REGION_SEPARATOR);

  return {
    province: province?.trim() ?? "",
    region: region?.trim() ?? "",
  };
}

function encodeStoredRegion(address: CheckoutAddress): string {
  return `${address.province.trim()}${REGION_SEPARATOR}${address.region.trim()}`;
}

function mapAddressRecordToCheckout(address: UserAddressRecord): CheckoutAddressInput {
  const recipient = splitRecipientName(address.recipientName);
  const region = splitStoredRegion(address.region);

  return {
    firstName: recipient.firstName,
    lastName: recipient.lastName,
    address1: address.line1,
    address2: address.line2 ?? "",
    city: address.city,
    province: region.province,
    region: region.region,
    country: address.country,
    postalCode: address.postalCode,
    phone: address.phone ?? "",
  };
}

function withUserDefaults(
  value: CheckoutAddressInput,
  user: {
    firstName: string;
    lastName: string;
    country: string;
    phone: string | null;
  },
): CheckoutAddressInput {
  return {
    ...value,
    firstName: value.firstName || user.firstName,
    lastName: value.lastName || user.lastName,
    country: value.country || user.country,
    phone: value.phone || user.phone || "",
  };
}

function pickPreferredAddress(
  addresses: UserAddressRecord[],
  type: AddressType,
): UserAddressRecord | null {
  const candidates = addresses.filter((address) => address.type === type);
  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    if (a.isDefault === b.isDefault) {
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    }
    return a.isDefault ? -1 : 1;
  });

  return candidates[0] ?? null;
}

function areAddressesEquivalent(
  left: CheckoutAddressInput,
  right: CheckoutAddressInput,
): boolean {
  return (
    left.firstName === right.firstName &&
    left.lastName === right.lastName &&
    left.address1 === right.address1 &&
    left.address2 === right.address2 &&
    left.city === right.city &&
    left.province === right.province &&
    left.region === right.region &&
    left.country === right.country &&
    left.postalCode === right.postalCode &&
    left.phone === right.phone
  );
}

async function upsertDefaultAddress(params: {
  tx: Prisma.TransactionClient;
  userId: string;
  type: AddressType;
  address: CheckoutAddress;
}) {
  const { tx, userId, type, address } = params;
  const recipientName = `${address.firstName} ${address.lastName}`.trim();
  const region = encodeStoredRegion(address);

  await tx.address.updateMany({
    where: {
      userId,
      type,
      isDefault: true,
    },
    data: {
      isDefault: false,
    },
  });

  const existing = await tx.address.findFirst({
    where: {
      userId,
      type,
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
    },
  });

  const commonData = {
    type,
    label: type === "SHIPPING" ? "Envio principal" : "Facturacion principal",
    recipientName,
    line1: address.address1,
    line2: address.address2 || null,
    city: address.city,
    region,
    postalCode: address.postalCode,
    country: address.country,
    phone: address.phone,
    isDefault: true,
  };

  if (!existing) {
    await tx.address.create({
      data: {
        ...commonData,
        userId,
      },
    });
    return;
  }

  await tx.address.update({
    where: {
      id: existing.id,
    },
    data: commonData,
  });
}

export async function getCheckoutPrefill(userId: string): Promise<CheckoutPrefill> {
  const user = await withDatabaseFallback(
    () =>
      prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          firstName: true,
          lastName: true,
          country: true,
          phone: true,
          addresses: {
            select: {
              id: true,
              type: true,
              recipientName: true,
              line1: true,
              line2: true,
              city: true,
              region: true,
              postalCode: true,
              country: true,
              phone: true,
              isDefault: true,
              updatedAt: true,
            },
          },
        },
      }),
    null,
  );

  if (!user) {
    return {
      shipping: { ...emptyCheckoutAddress },
      billing: { ...emptyCheckoutAddress },
      useSameAddress: false,
    };
  }

  const shippingRecord = pickPreferredAddress(user.addresses, "SHIPPING");
  const billingRecord = pickPreferredAddress(user.addresses, "BILLING");

  const shipping = withUserDefaults(
    shippingRecord
      ? mapAddressRecordToCheckout(shippingRecord)
      : { ...emptyCheckoutAddress },
    user,
  );

  const billing = withUserDefaults(
    billingRecord
      ? mapAddressRecordToCheckout(billingRecord)
      : { ...shipping },
    user,
  );

  return {
    shipping,
    billing,
    useSameAddress: areAddressesEquivalent(shipping, billing),
  };
}

export async function saveCheckoutAddresses(params: {
  userId: string;
  shipping: CheckoutAddress;
  billing: CheckoutAddress;
  useSameAddress: boolean;
}) {
  const shipping = params.shipping;
  const billing = params.useSameAddress ? params.shipping : params.billing;

  await prisma.$transaction(async (tx) => {
    await upsertDefaultAddress({
      tx,
      userId: params.userId,
      type: "SHIPPING",
      address: shipping,
    });

    await upsertDefaultAddress({
      tx,
      userId: params.userId,
      type: "BILLING",
      address: billing,
    });

    await tx.user.update({
      where: {
        id: params.userId,
      },
      data: {
        country: shipping.country,
        phone: shipping.phone,
      },
    });
  });
}
