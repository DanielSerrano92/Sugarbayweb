import { getSessionUser } from "@/lib/auth/dal";
import { getImageKitClient } from "@/lib/services/imagekit-server";

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return Response.json({ message: "No autenticado" }, { status: 401 });
  }

  try {
    const imageKit = getImageKitClient();
    const authParams = imageKit.helper.getAuthenticationParameters();
    return Response.json(authParams);
  } catch {
    return Response.json(
      { message: "ImageKit no esta configurado correctamente" },
      { status: 500 },
    );
  }
}



