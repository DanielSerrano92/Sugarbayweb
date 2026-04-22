import "server-only";

import { UserRole } from "@/app/generated/prisma/client";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { z } from "zod";

import { env, requireEnv } from "@/lib/env";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

type SessionRole = (typeof UserRole)[keyof typeof UserRole];

const sessionCookieSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email(),
  role: z.nativeEnum(UserRole),
  firstName: z.string().min(1),
});

export type SessionUser = {
  userId: string;
  email: string;
  role: SessionRole;
  firstName: string;
};

const DEFAULT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;
const REMEMBER_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function getSessionSecret() {
  return new TextEncoder().encode(
    requireEnv(env.SESSION_SECRET, "SESSION_SECRET"),
  );
}

function resolveSessionMaxAge(remember = false): number {
  return remember
    ? REMEMBER_SESSION_MAX_AGE_SECONDS
    : DEFAULT_SESSION_MAX_AGE_SECONDS;
}

export async function createSessionToken(
  payload: SessionUser,
  maxAgeSeconds = DEFAULT_SESSION_MAX_AGE_SECONDS,
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(getSessionSecret());
}

export async function decodeSessionToken(
  token: string,
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecret(), {
      algorithms: ["HS256"],
    });

    const parsed = sessionCookieSchema.safeParse(payload);
    if (!parsed.success) return null;

    return parsed.data;
  } catch {
    return null;
  }
}

export async function setSession(
  payload: SessionUser,
  options?: { remember?: boolean },
) {
  const maxAge = resolveSessionMaxAge(options?.remember ?? false);
  const token = await createSessionToken(payload, maxAge);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
