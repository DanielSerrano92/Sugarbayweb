import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { requireSession } from "@/lib/auth/dal";
import {
  getOrderSummaryBySession,
  syncOrderWithStripeCheckoutSession,
} from "@/lib/repositories/orders";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Resultado del pago",
  description: "Estado final de tu pedido y pago en Sugarbay.",
};

type CheckoutSuccessPageProps = {
  searchParams: Promise<{ session_id?: string | string[] }>;
};

function pickSessionId(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const session = await requireSession("/checkout/success");
  const params = await searchParams;
  const sessionId = pickSessionId(params.session_id);

  if (!sessionId) {
    redirect("/checkout");
  }

  await syncOrderWithStripeCheckoutSession(sessionId);
  const order = await getOrderSummaryBySession({
    userId: session.userId,
    checkoutSessionId: sessionId,
  });
  const isPaid = order?.paymentStatus === "PAID";
  const isFailed = order?.paymentStatus === "FAILED";

  return (
    <section
      className={`mx-auto max-w-3xl rounded-3xl border p-8 text-center shadow-[0_20px_36px_rgba(6,3,18,0.52)] ${
        isPaid
          ? "border-emerald-200 bg-emerald-50"
          : isFailed
            ? "border-red-200 bg-red-50"
            : "border-amber-200 bg-amber-50"
      }`}
    >
      <p
        className={`text-xs uppercase tracking-[0.3em] ${
          isPaid
            ? "text-emerald-700"
            : isFailed
              ? "text-red-700"
              : "text-amber-700"
        }`}
      >
        {isPaid
          ? "Pago confirmado"
          : isFailed
            ? "Pago no completado"
            : "Procesando pago"}
      </p>
      <h1
        className={`mt-2 text-3xl font-black ${
          isPaid
            ? "text-emerald-900"
            : isFailed
              ? "text-red-900"
              : "text-amber-900"
        }`}
      >
        {isPaid
          ? "Gracias por tu compra"
          : isFailed
            ? "No pudimos confirmar tu pago"
            : "Estamos confirmando tu pedido"}
      </h1>

      {order ? (
        <p
          className={`mt-3 text-sm ${
            isPaid
              ? "text-emerald-900/80"
              : isFailed
                ? "text-red-900/80"
                : "text-amber-900/80"
          }`}
        >
          Pedido #{order.orderNumber} por{" "}
          {formatCurrency(order.totalAmount, order.currency)}.
        </p>
      ) : (
        <p className="mt-3 text-sm text-zinc-700">
          Aun no encontramos el pedido asociado. Si acabas de pagar, refresca en
          unos segundos.
        </p>
      )}

      {sessionId ? (
        <p className="mt-2 text-xs text-zinc-600">Session: {sessionId}</p>
      ) : null}

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/account"
          className="sb-btn-primary px-4 py-2.5 text-sm font-semibold"
        >
          Ver mi cuenta
        </Link>
        <Link
          href={isFailed ? "/checkout?payment=failed" : "/store"}
          className="sb-btn-secondary px-4 py-2.5 text-sm font-semibold text-zinc-200"
        >
          {isFailed ? "Reintentar checkout" : "Volver a la tienda"}
        </Link>
      </div>
    </section>
  );
}

