import { getSessionUser } from "@/lib/auth/dal";
import { clearSession } from "@/lib/auth/session";
import { deactivateAccount } from "@/lib/repositories/account";
import {
  deleteAccountSchema,
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

  const parsed = deleteAccountSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      {
        message: "No se pudo confirmar la eliminacion",
        fieldErrors: mapAccountIssuesToFieldErrors(parsed.error.issues),
      },
      { status: 422 },
    );
  }

  const disabled = await deactivateAccount(session.userId);
  if (!disabled) {
    return Response.json({ message: "Cuenta no disponible" }, { status: 404 });
  }

  await clearSession();

  return Response.json({
    message: "Cuenta desactivada correctamente.",
  });
}
