import { getSessionUser } from "@/lib/auth/dal";
import { changeAccountPassword } from "@/lib/repositories/account";
import {
  changePasswordSchema,
  mapAccountIssuesToFieldErrors,
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

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) {
    return Response.json({ message: "No autenticado" }, { status: 401 });
  }

  const payload = await parseJsonBody(request);
  if (!payload) {
    return Response.json({ message: "Payload invalido" }, { status: 400 });
  }

  const parsed = changePasswordSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      {
        message: "Revisa los datos de seguridad",
        fieldErrors: mapAccountIssuesToFieldErrors(parsed.error.issues),
      },
      { status: 422 },
    );
  }

  const result = await changeAccountPassword(
    session.userId,
    parsed.data.currentPassword,
    parsed.data.newPassword,
  );

  if (!result.ok) {
    if (result.reason === "invalid_current") {
      return Response.json(
        {
          message: "La contrasena actual no es correcta.",
          fieldErrors: {
            currentPassword: "La contrasena actual no es correcta.",
          },
        },
        { status: 400 },
      );
    }

    return Response.json({ message: "Usuario no disponible" }, { status: 404 });
  }

  return Response.json({
    message: "Contrasena actualizada correctamente.",
  });
}
