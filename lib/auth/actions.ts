"use server";

import type { AuthActionState } from "@/lib/validators/auth";
import { Prisma } from "@/app/generated/prisma/client";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import {
  areUsernamesTooSimilar,
  loginSchema,
  registerSchema,
  USERNAME_UNAVAILABLE_MESSAGE,
} from "@/lib/validators/auth";

import { clearSession, setSession } from "./session";

function parseString(value: FormDataEntryValue | null, trim = true): string {
  if (typeof value !== "string") return "";

  return trim ? value.trim() : value;
}

function parseCheckbox(value: FormDataEntryValue | null): boolean {
  return value === "on" || value === "true" || value === "1";
}

function hasFieldErrors(fieldErrors: AuthActionState["fieldErrors"]): boolean {
  return Boolean(
    fieldErrors &&
      Object.values(fieldErrors).some((messages) => messages && messages.length > 0),
  );
}

function duplicateFieldErrors(
  error: Prisma.PrismaClientKnownRequestError,
): AuthActionState["fieldErrors"] | null {
  if (error.code !== "P2002") return null;

  const target = Array.isArray(error.meta?.target) ? error.meta?.target : [];
  const fieldErrors: AuthActionState["fieldErrors"] = {};

  if (target.includes("email")) {
    fieldErrors.email = ["Este email ya está registrado."];
  }

  if (target.includes("username")) {
    fieldErrors.username = [USERNAME_UNAVAILABLE_MESSAGE];
  }

  return hasFieldErrors(fieldErrors)
    ? fieldErrors
    : {
        email: ["Ya existe una cuenta con esos datos."],
      };
}

function missingSessionSecretMessage(): string {
  return "Configuracion pendiente: falta SESSION_SECRET en el servidor.";
}

function logAuthError(scope: string, error: unknown): void {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error(scope, {
      code: error.code,
      target: error.meta?.target,
    });
    return;
  }

  if (error instanceof Error) {
    console.error(scope, {
      name: error.name,
      message: error.message,
    });
    return;
  }

  console.error(scope, "Unknown error");
}

async function validateRegistrationIdentifiers(params: {
  email: string;
  username: string;
}): Promise<AuthActionState["fieldErrors"]> {
  const existingUsers = await prisma.user.findMany({
    select: {
      email: true,
      username: true,
    },
  });
  const requestedEmail = params.email.toLowerCase();
  const fieldErrors: AuthActionState["fieldErrors"] = {};

  if (
    existingUsers.some((user) => user.email.toLowerCase() === requestedEmail)
  ) {
    fieldErrors.email = ["Este email ya está registrado."];
  }

  if (
    existingUsers.some((user) =>
      areUsernamesTooSimilar(params.username, user.username),
    )
  ) {
    fieldErrors.username = [USERNAME_UNAVAILABLE_MESSAGE];
  }

  return fieldErrors;
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
    username: parseString(formData.get("username")),
    email: parseString(formData.get("email")),
    password: parseString(formData.get("password"), false),
    confirmPassword: parseString(formData.get("confirmPassword"), false),
    country: parseString(formData.get("country")),
    acceptTerms: parseCheckbox(formData.get("acceptTerms")),
    redirectTo: parseString(formData.get("redirectTo")) || undefined,
  };

  const parsed = registerSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const fieldErrors = await validateRegistrationIdentifiers({
      email: parsed.data.email,
      username: parsed.data.username,
    });

    if (hasFieldErrors(fieldErrors)) {
      return {
        status: "error",
        message: "Revisa los campos marcados.",
        fieldErrors,
      };
    }

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

    return {
      status: "success",
      message: "Cuenta creada correctamente. Redirigiendo...",
      redirectTo: parsed.data.redirectTo ?? "/",
    };
  } catch (error) {
    logAuthError("registerAction failed", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const fieldErrors = duplicateFieldErrors(error);
      if (fieldErrors) {
        return {
          status: "error",
          message: "Revisa los campos marcados.",
          fieldErrors,
        };
      }
    }

    return {
      status: "error",
      message: "No se pudo crear la cuenta. Intentalo de nuevo.",
    };
  }
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
    email: parseString(formData.get("email")),
    password: parseString(formData.get("password"), false),
    remember: parseCheckbox(formData.get("remember")),
    redirectTo: parseString(formData.get("redirectTo")) || undefined,
  };

  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      status: "error",
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
      status: "error",
      message: "Email o contrasena incorrectos",
    };
  }

  const isValid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!isValid) {
    return {
      status: "error",
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
    logAuthError("loginAction failed while setting session", error);
    return {
      status: "error",
      message: "No se pudo iniciar sesion por configuracion del servidor.",
    };
  }

  redirect(parsed.data.redirectTo ?? "/");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}
