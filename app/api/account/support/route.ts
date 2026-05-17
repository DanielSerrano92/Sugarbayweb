import { getSessionUser } from "@/lib/auth/dal";
import {
  createAccountSupportRequest,
  listAccountSupportRequests,
} from "@/lib/repositories/account";
import {
  mapAccountIssuesToFieldErrors,
  supportRequestSchema,
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

  const parsed = supportRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      {
        message: "Revisa los datos del formulario de soporte",
        fieldErrors: mapAccountIssuesToFieldErrors(parsed.error.issues),
      },
      { status: 422 },
    );
  }

  const supportRequest = await createAccountSupportRequest(session.userId, parsed.data);

  return Response.json({
    message: "Solicitud enviada correctamente.",
    supportRequest,
  });
}

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return Response.json({ message: "No autenticado" }, { status: 401 });
  }

  const supportRequests = await listAccountSupportRequests(session.userId);
  return Response.json({ supportRequests });
}
