import { getSessionUser } from "@/lib/auth/dal";
import {
  createAccountAddress,
  deleteAccountAddress,
  listAccountAddresses,
  updateAccountAddress,
} from "@/lib/repositories/account";
import {
  mapAccountIssuesToFieldErrors,
  upsertAddressSchema,
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

function pickAddressId(request: Request): string | null {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return null;

  const normalized = id.trim();
  return normalized.length > 0 ? normalized : null;
}

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return Response.json({ message: "No autenticado" }, { status: 401 });
  }

  const addresses = await listAccountAddresses(session.userId);
  return Response.json({ addresses });
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

  const parsed = upsertAddressSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      {
        message: "Revisa los datos de la direccion",
        fieldErrors: mapAccountIssuesToFieldErrors(parsed.error.issues),
      },
      { status: 422 },
    );
  }

  await createAccountAddress(session.userId, parsed.data);
  const addresses = await listAccountAddresses(session.userId);

  return Response.json({
    message: "Direccion guardada correctamente.",
    addresses,
  });
}

export async function PATCH(request: Request) {
  const session = await getSessionUser();
  if (!session) {
    return Response.json({ message: "No autenticado" }, { status: 401 });
  }

  const addressId = pickAddressId(request);
  if (!addressId) {
    return Response.json({ message: "Falta el id de direccion" }, { status: 400 });
  }

  const payload = await parseJsonBody(request);
  if (!payload) {
    return Response.json({ message: "Payload invalido" }, { status: 400 });
  }

  const parsed = upsertAddressSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      {
        message: "Revisa los datos de la direccion",
        fieldErrors: mapAccountIssuesToFieldErrors(parsed.error.issues),
      },
      { status: 422 },
    );
  }

  const updated = await updateAccountAddress(session.userId, addressId, parsed.data);
  if (!updated) {
    return Response.json({ message: "Direccion no encontrada" }, { status: 404 });
  }

  const addresses = await listAccountAddresses(session.userId);
  return Response.json({
    message: "Direccion actualizada correctamente.",
    addresses,
  });
}

export async function DELETE(request: Request) {
  const session = await getSessionUser();
  if (!session) {
    return Response.json({ message: "No autenticado" }, { status: 401 });
  }

  const addressId = pickAddressId(request);
  if (!addressId) {
    return Response.json({ message: "Falta el id de direccion" }, { status: 400 });
  }

  const deleted = await deleteAccountAddress(session.userId, addressId);
  if (!deleted) {
    return Response.json({ message: "Direccion no encontrada" }, { status: 404 });
  }

  const addresses = await listAccountAddresses(session.userId);
  return Response.json({
    message: "Direccion eliminada correctamente.",
    addresses,
  });
}
