"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getSessionUser, requireSession } from "@/lib/auth/dal";
import {
  addItemToCart,
  clearCartForUser,
  removeCartItem,
  updateCartItemQuantity,
} from "@/lib/repositories/cart";

const addToCartSchema = z.object({
  productId: z.string().min(1),
  productVariantId: z.string().min(1).optional(),
  quantity: z.coerce.number().int().min(1).max(20).default(1),
  redirectTo: z.string().optional(),
  authRedirectTo: z.string().optional(),
});

const updateQuantitySchema = z.object({
  cartItemId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(20),
});

const removeItemSchema = z.object({
  cartItemId: z.string().min(1),
});

function normalizeRedirect(value: string | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith("/")) return null;
  return value;
}

function revalidateCartSurfaces() {
  revalidatePath("/");
  revalidatePath("/store");
  revalidatePath("/checkout");
}

export type AddToCartActionState = {
  status?: "idle" | "success" | "auth_required" | "error";
  message?: string;
  redirectTo?: string;
};

export async function addToCartAction(
  _previousState: AddToCartActionState,
  formData: FormData,
): Promise<AddToCartActionState> {
  const parsed = addToCartSchema.safeParse({
    productId: formData.get("productId"),
    productVariantId: formData.get("productVariantId") || undefined,
    quantity: formData.get("quantity"),
    redirectTo: formData.get("redirectTo"),
    authRedirectTo: formData.get("authRedirectTo"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "No se pudo anadir el producto al carrito.",
    };
  }

  const nextPath = normalizeRedirect(parsed.data.redirectTo);
  const authRedirectTo = normalizeRedirect(parsed.data.authRedirectTo);
  const session = await getSessionUser();

  if (!session) {
    return {
      status: "auth_required",
      message: "Inicia sesion para anadir productos al carrito.",
      redirectTo: authRedirectTo ?? nextPath ?? "/store",
    };
  }

  await addItemToCart({
    userId: session.userId,
    productId: parsed.data.productId,
    productVariantId: parsed.data.productVariantId,
    quantity: parsed.data.quantity,
  });
  revalidateCartSurfaces();

  if (nextPath) redirect(nextPath);

  return {
    status: "success",
    message: "Producto anadido al carrito.",
  };
}

export async function updateCartItemAction(formData: FormData) {
  const parsed = updateQuantitySchema.safeParse({
    cartItemId: formData.get("cartItemId"),
    quantity: formData.get("quantity"),
  });

  if (!parsed.success) return;

  const session = await requireSession("/store?cart=open");
  await updateCartItemQuantity(
    session.userId,
    parsed.data.cartItemId,
    parsed.data.quantity,
  );
  revalidateCartSurfaces();
}

export async function removeCartItemAction(formData: FormData) {
  const parsed = removeItemSchema.safeParse({
    cartItemId: formData.get("cartItemId"),
  });

  if (!parsed.success) return;

  const session = await requireSession("/store?cart=open");
  await removeCartItem(session.userId, parsed.data.cartItemId);
  revalidateCartSurfaces();
}

export async function clearCartAction() {
  const session = await requireSession("/store?cart=open");
  await clearCartForUser(session.userId);
  revalidateCartSurfaces();
}
