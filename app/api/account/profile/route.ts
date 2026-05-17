import { Prisma } from "@/app/generated/prisma/client";
import { getSessionUser } from "@/lib/auth/dal";
import { env } from "@/lib/env";
import { prisma } from "@/lib/db";
import { getAccountProfile, updateAccountProfile } from "@/lib/repositories/account";
import {
  mapAccountIssuesToFieldErrors,
  updateProfileSchema,
} from "@/lib/validators/account";

async function parseJsonBody(request: Request): Promise<unknown | null> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return null;

  try {
    return await request.json();
  } catch {
    return null;
  }
}

function duplicateFieldErrors(
  error: Prisma.PrismaClientKnownRequestError,
): Record<string, string> {
  const target = Array.isArray(error.meta?.target) ? error.meta.target : [];
  const fieldErrors: Record<string, string> = {};

  if (target.includes("email")) {
    fieldErrors.email = "Este email ya esta registrado por otro usuario.";
  }

  if (target.includes("username")) {
    fieldErrors.username = "Este nombre de usuario ya esta registrado por otro usuario.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return fieldErrors;
  }

  return {
    email: "Ya existe una cuenta con esos datos.",
  };
}

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return Response.json({ message: "No autenticado" }, { status: 401 });
  }

  const profile = await getAccountProfile(session.userId);
  if (!profile) {
    return Response.json({ message: "Perfil no encontrado" }, { status: 404 });
  }

  return Response.json({
    profile,
    supportEmail: env.SUPPORT_EMAIL ?? null,
  });
}

export async function PATCH(request: Request) {
  const session = await getSessionUser();
  if (!session) {
    return Response.json({ message: "No autenticado" }, { status: 401 });
  }

  const payload = await parseJsonBody(request);
  if (!payload) {
    return Response.json({ message: "Payload invalido" }, { status: 400 });
  }

  const parsed = updateProfileSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      {
        message: "Revisa los campos del perfil",
        fieldErrors: mapAccountIssuesToFieldErrors(parsed.error.issues),
      },
      { status: 422 },
    );
  }

  const existingUsers = await prisma.user.findMany({
    where: {
      id: {
        not: session.userId,
      },
    },
    select: {
      email: true,
      username: true,
    },
  });

  const fieldErrors: Record<string, string> = {};
  if (
    existingUsers.some(
      (user) => user.email.toLowerCase() === parsed.data.email.toLowerCase(),
    )
  ) {
    fieldErrors.email = "Este email ya esta registrado por otro usuario.";
  }

  if (
    existingUsers.some(
      (user) => user.username.toLowerCase() === parsed.data.username.toLowerCase(),
    )
  ) {
    fieldErrors.username = "Este nombre de usuario ya esta registrado por otro usuario.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return Response.json(
      {
        message: "No se pudieron guardar los cambios del perfil.",
        fieldErrors,
      },
      { status: 409 },
    );
  }

  try {
    const profile = await updateAccountProfile(session.userId, parsed.data);
    return Response.json({
      message: "Perfil actualizado correctamente.",
      profile,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return Response.json(
        {
          message: "No se pudieron guardar los cambios del perfil.",
          fieldErrors: duplicateFieldErrors(error),
        },
        { status: 409 },
      );
    }

    throw error;
  }
}
