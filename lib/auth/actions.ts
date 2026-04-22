"use server";

import type { AuthActionState } from "@/lib/validators/auth";
import { Prisma } from "@/app/generated/prisma/client";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { loginSchema, registerSchema } from "@/lib/validators/auth";

import { clearSession, setSession } from "./session";

function parseString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseCheckbox(value: FormDataEntryValue | null): boolean {
  return value === "on" || value === "true" || value === "1";
}

function duplicateFieldMessage(
  error: Prisma.PrismaClientKnownRequestError,
): string | null {
  if (error.code !== "P2002") return null;

  const target = Array.isArray(error.meta?.target) ? error.meta?.target : [];

  if (target.includes("email")) return "Ya existe una cuenta con ese email";
  if (target.includes("username")) {
    return "Ese nombre de usuario ya esta en uso";
  }

  return "Ya existe una cuenta con esos datos";
}

function missingSessionSecretMessage(): string {
  return "Configuracion pendiente: falta SESSION_SECRET en el servidor.";
}

export async function registerAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!env.SESSION_SECRET) {
    return {
      message: missingSessionSecretMessage(),
    };
  }

  const payload = {
    firstName: parseString(formData.get("firstName")),
    lastName: parseString(formData.get("lastName")),
    birthDate: parseString(formData.get("birthDate")),
    username: parseString(formData.get("username")).toLowerCase(),
    email: parseString(formData.get("email")).toLowerCase(),
    password: parseString(formData.get("password")),
    confirmPassword: parseString(formData.get("confirmPassword")),
    country: parseString(formData.get("country")).toUpperCase(),
    acceptTerms: parseCheckbox(formData.get("acceptTerms")),
    redirectTo: parseString(formData.get("redirectTo")) || undefined,
  };

  const parsed = registerSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      message: "Revisa los campos marcados",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await prisma.user.create({
      data: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        birthDate: parsed.data.birthDate,
        username: parsed.data.username,
        email: parsed.data.email,
        passwordHash,
        country: parsed.data.country,
        termsAcceptedAt: new Date(),
        role: "USER",
        cart: {
          create: {},
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        role: true,
      },
    });

    await setSession(
      {
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        role: user.role,
      },
      { remember: true },
    );
  } catch (error) {
    console.error("registerAction failed", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const duplicateMessage = duplicateFieldMessage(error);
      if (duplicateMessage) {
        return {
          message: duplicateMessage,
        };
      }
    }

    return {
      message: "No se pudo crear la cuenta. Intentalo de nuevo.",
    };
  }

  redirect("/");
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!env.SESSION_SECRET) {
    return {
      message: missingSessionSecretMessage(),
    };
  }

  const payload = {
    email: parseString(formData.get("email")).toLowerCase(),
    password: parseString(formData.get("password")),
    remember: parseCheckbox(formData.get("remember")),
    redirectTo: parseString(formData.get("redirectTo")) || undefined,
  };

  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      message: "Revisa tus credenciales",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      email: parsed.data.email,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      role: true,
      isActive: true,
      passwordHash: true,
    },
  });

  if (!user || !user.isActive) {
    return {
      message: "Email o contrasena incorrectos",
    };
  }

  const isValid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!isValid) {
    return {
      message: "Email o contrasena incorrectos",
    };
  }

  try {
    await setSession(
      {
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        role: user.role,
      },
      { remember: parsed.data.remember },
    );
  } catch (error) {
    console.error("loginAction failed while setting session", error);
    return {
      message: "No se pudo iniciar sesion por configuracion del servidor.",
    };
  }

  redirect("/");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}
