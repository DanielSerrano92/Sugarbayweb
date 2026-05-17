import { getSessionUser } from "@/lib/auth/dal";
import { listAccountOrders } from "@/lib/repositories/account";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return Response.json({ message: "No autenticado" }, { status: 401 });
  }

  const orders = await listAccountOrders(session.userId);
  return Response.json({ orders });
}
