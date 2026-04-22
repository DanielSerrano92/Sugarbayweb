import { env, requireEnv } from "@/lib/env";
import {
  markOrderAsFailed,
  markOrderAsFailedByPaymentIntent,
  markOrderAsPaid,
} from "@/lib/repositories/orders";
import { getStripeClient } from "@/lib/services/stripe";

export const runtime = "nodejs";

function parseOrderMetadata(
  metadata: Record<string, string> | null | undefined,
): string | undefined {
  if (!metadata) return undefined;
  const orderId = metadata.orderId;
  return typeof orderId === "string" && orderId.length > 0 ? orderId : undefined;
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ message: "Missing stripe-signature" }, { status: 400 });
  }

  let event;

  try {
    const rawBody = await request.text();
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      requireEnv(env.STRIPE_WEBHOOK_SECRET, "STRIPE_WEBHOOK_SECRET"),
    );
  } catch {
    return Response.json({ message: "Invalid Stripe signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    await markOrderAsPaid({
      checkoutSessionId: session.id,
      paymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : undefined,
      orderIdFromMetadata: parseOrderMetadata(session.metadata),
    });
  }

  if (
    event.type === "checkout.session.async_payment_failed" ||
    event.type === "checkout.session.expired"
  ) {
    const session = event.data.object;
    await markOrderAsFailed({
      checkoutSessionId: session.id,
      paymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : undefined,
      orderIdFromMetadata: parseOrderMetadata(session.metadata),
    });
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object;
    await markOrderAsFailedByPaymentIntent(paymentIntent.id);
  }

  return Response.json({ received: true });
}
