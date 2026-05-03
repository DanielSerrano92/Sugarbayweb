import type { Metadata } from "next";
import CheckoutFlow from "@/components/checkout/checkout-flow";
import EmptyState from "@/components/ui/empty-state";
import PageShell from "@/components/ui/page-shell";
import { requireSession } from "@/lib/auth/dal";
import { getCartForUser } from "@/lib/repositories/cart";
import { getCheckoutPrefill } from "@/lib/repositories/checkout";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Finaliza tu compra con envio, facturacion y pago seguro.",
};

type CheckoutPageProps = {
  searchParams: Promise<{ payment?: string | string[] }>;
};

function pickSingleValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const session = await requireSession("/checkout");
  const params = await searchParams;
  const paymentQuery = pickSingleValue(params.payment);
  const paymentErrorMessage =
    paymentQuery === "cancelled"
      ? "Has cancelado el pago. Puedes revisar tus datos y volver a intentarlo."
      : paymentQuery === "failed"
        ? "El pago no pudo completarse. Revisa tu metodo de pago e intentalo de nuevo."
        : null;
  const [cart, checkoutPrefill] = await Promise.all([
    getCartForUser(session.userId),
    getCheckoutPrefill(session.userId),
  ]);

  return (
    <PageShell
      eyebrow="Checkout"
      title="Finalizar compra"
      description="Valida envio y facturacion antes de pasar al pago seguro con Stripe."
    >
      {paymentErrorMessage ? (
        <p className="sb-panel-soft rounded-2xl border border-amber-200 px-4 py-3 text-sm text-amber-900">
          {paymentErrorMessage}
        </p>
      ) : null}

      {cart.items.length === 0 ? (
        <EmptyState
          title="No hay productos para pagar"
          description="Anade productos al carrito para continuar con el checkout."
        />
      ) : (
        <CheckoutFlow
          cart={cart}
          initialShipping={checkoutPrefill.shipping}
          initialBilling={checkoutPrefill.billing}
          initialUseSameAddress={checkoutPrefill.useSameAddress}
        />
      )}
    </PageShell>
  );
}

