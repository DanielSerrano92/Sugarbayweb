import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { prisma } from "@/lib/db";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

import { decodeSessionToken } from "./session";

export const getSessionUser = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  return decodeSessionToken(token);
});

export const getCurrentUser = cache(async () => {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return null;

  try {
    return await prisma.user.findUnique({
      where: {
        id: sessionUser.userId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        birthDate: true,
        country: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  } catch {
    return null;
  }
});

export async function requireSession(redirectPath = "/account") {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect(`/login?redirect=${encodeURIComponent(redirectPath)}`);
  }

  return sessionUser;
}
