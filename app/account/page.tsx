import type { Metadata } from "next";

import AccountDashboard from "@/components/account/account-dashboard";
import PageShell from "@/components/ui/page-shell";
import { requireSession } from "@/lib/auth/dal";
import { env } from "@/lib/env";
import {
  getAccountProfile,
  listAccountAddresses,
  listAccountOrders,
  listAccountSupportRequests,
} from "@/lib/repositories/account";

export const metadata: Metadata = {
  title: "Mi cuenta",
  description: "Gestiona perfil, pedidos, direcciones, seguridad y soporte.",
};

const ACCOUNT_PAGE_HEADER_IMAGE_SRC =
  "https://ik.imagekit.io/gq1enkszp/fotos/mi-cuenta.png?tr=w-2400,h-760,cm-extract,fo-top";

export default async function AccountPage() {
  const session = await requireSession("/account");
  const [profile, orders, addresses, supportRequests] = await Promise.all([
    getAccountProfile(session.userId),
    listAccountOrders(session.userId),
    listAccountAddresses(session.userId),
    listAccountSupportRequests(session.userId),
  ]);

  const initialProfile = profile
    ? {
        ...profile,
        birthDate: profile.birthDate.toISOString(),
        createdAt: profile.createdAt.toISOString(),
      }
    : null;

  const initialOrders = orders.map((order) => ({
    ...order,
    placedAt: order.placedAt.toISOString(),
  }));

  const initialAddresses = addresses.map((address) => ({
    ...address,
    createdAt: address.createdAt.toISOString(),
    updatedAt: address.updatedAt.toISOString(),
  }));

  const initialSupportRequests = supportRequests.map((supportRequest) => ({
    ...supportRequest,
    createdAt: supportRequest.createdAt.toISOString(),
    updatedAt: supportRequest.updatedAt.toISOString(),
  }));

  return (
    <PageShell
      eyebrow="Mi cuenta"
      title={`Hola, ${profile?.firstName ?? "Fan"}`}
      description="Gestiona tu perfil, tus pedidos, direcciones, seguridad y soporte."
      headerImageSrc={ACCOUNT_PAGE_HEADER_IMAGE_SRC}
    >
      <AccountDashboard
        initialUserName={profile?.firstName ?? "Fan"}
        initialProfile={initialProfile}
        initialOrders={initialOrders}
        initialAddresses={initialAddresses}
        initialSupportRequests={initialSupportRequests}
        initialSupportEmail={env.SUPPORT_EMAIL ?? null}
      />
    </PageShell>
  );
}
