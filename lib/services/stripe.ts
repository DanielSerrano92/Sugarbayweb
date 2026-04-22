import "server-only";

import Stripe from "stripe";

import { env, requireEnv } from "@/lib/env";

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (stripeClient) return stripeClient;

  stripeClient = new Stripe(
    requireEnv(env.STRIPE_SECRET_KEY, "STRIPE_SECRET_KEY"),
  );

  return stripeClient;
}
