import "server-only";

import { z } from "zod";

const optionalEnvField = <Schema extends z.ZodTypeAny>(schema: Schema) =>
  z.preprocess((value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  }, schema.optional());

const requiredEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
});

const optionalEnvSchema = z.object({
  DIRECT_URL: optionalEnvField(z.string().min(1)),
  SESSION_SECRET: optionalEnvField(z.string().min(32)),
  NEXT_PUBLIC_APP_URL: optionalEnvField(z.string().url()),
  SUPPORT_EMAIL: optionalEnvField(z.string().email()),
  STRIPE_SECRET_KEY: optionalEnvField(z.string().min(1)),
  STRIPE_WEBHOOK_SECRET: optionalEnvField(z.string().min(1)),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optionalEnvField(z.string().min(1)),
  NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: optionalEnvField(z.string().url()),
  IMAGEKIT_PUBLIC_KEY: optionalEnvField(z.string().min(1)),
  IMAGEKIT_PRIVATE_KEY: optionalEnvField(z.string().min(1)),
});

const requiredEnv = requiredEnvSchema.parse(process.env);
const optionalEnv = optionalEnvSchema.parse(process.env);

export const env = {
  ...requiredEnv,
  ...optionalEnv,
};

export function requireEnv(value: string | undefined, key: string): string {
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
}
