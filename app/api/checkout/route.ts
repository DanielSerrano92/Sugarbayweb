import { getSessionUser } from "@/lib/auth/dal";
import { env } from "@/lib/env";
import { saveCheckoutAddresses } from "@/lib/repositories/checkout";
import {
  attachStripeCheckoutSessionToOrder,
  createPendingOrderFromCart,
  markOrderAsFailedByOrderId,
} from "@/lib/repositories/orders";
import { resolveImageUrl } from "@/lib/services/imagekit";
import { getStripeClient } from "@/lib/services/stripe";
import {
  checkoutPayloadSchema,
  mapCheckoutIssuesToFieldErrors,
} from "@/lib/validators/checkout";

async function parseCheckoutPayload(request: Request): Promise<unknown | null> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return Response.json({ message: "No autenticado" }, { status: 401 });
  }

  const payload = await parseCheckoutPayload(request);
  if (!payload) {
    return Response.json(
      { message: "Faltan los datos de envio y facturacion" },
      { status: 400 },
    );
  }

  const parsedPayload = checkoutPayloadSchema.safeParse(payload);
  if (!parsedPayload.success) {
    return Response.json(
      {
        message: "Revisa los datos del formulario",
        fieldErrors: mapCheckoutIssuesToFieldErrors(parsedPayload.error.issues),
      },
      { status: 422 },
    );
  }

  await saveCheckoutAddresses({
    userId: sessionUser.userId,
    shipping: parsedPayload.data.shipping,
    billing: parsedPayload.data.billing,
    useSameAddress: parsedPayload.data.useSameAddress,
  });

  if (parsedPayload.data.paymentMethod !== "card") {
    return Response.json(
      {
        message: "PayPal estara disponible proximamente. Usa tarjeta para completar tu compra.",
      },
      { status: 400 },
    );
  }

  const pendingOrder = await createPendingOrderFromCart(sessionUser.userId);

  if (!pendingOrder || pendingOrder.items.length === 0) {
    return Response.json({ message: "El carrito esta vacio" }, { status: 400 });
  }

  try {
    const stripe = getStripeClient();
    const baseUrl = env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      client_reference_id: pendingOrder.id,
      customer_email: sessionUser.email,
      line_items: pendingOrder.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: pendingOrder.currency.toLowerCase(),
          unit_amount: Math.round(item.unitPrice * 100),
          product_data: {
            name: item.productName,
            images: item.imageUrl
              ? [resolveImageUrl(item.imageUrl)]
              : [],
          },
        },
      })),
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout?payment=cancelled`,
      metadata: {
        userId: String(sessionUser.userId),
        orderId: pendingOrder.id,
      },
    });

    if (!checkoutSession.url) {
      return Response.json(
        { message: "No se pudo crear la URL de checkout" },
        { status: 500 },
      );
    }

    await attachStripeCheckoutSessionToOrder({
      orderId: pendingOrder.id,
      checkoutSessionId: checkoutSession.id,
      paymentIntentId:
        typeof checkoutSession.payment_intent === "string"
          ? checkoutSession.payment_intent
          : undefined,
    });

    return Response.json({ url: checkoutSession.url });
  } catch {
    try {
      await markOrderAsFailedByOrderId(pendingOrder.id);
    } catch {
      // noop: preserve primary Stripe error response
    }

    return Response.json(
      { message: "Error al crear la sesion de pago de Stripe" },
      { status: 500 },
    );
  }
}
