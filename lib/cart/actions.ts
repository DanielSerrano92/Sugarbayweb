"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireSession } from "@/lib/auth/dal";
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
  revalidatePath("/carrito");
  revalidatePath("/checkout");
}

export async function addToCartAction(formData: FormData) {
  const parsed = addToCartSchema.safeParse({
    productId: formData.get("productId"),
    productVariantId: formData.get("productVariantId") || undefined,
    quantity: formData.get("quantity"),
    redirectTo: formData.get("redirectTo"),
  });

  if (!parsed.success) return;

  const nextPath = normalizeRedirect(parsed.data.redirectTo);
  const session = await requireSession(nextPath ?? "/carrito");

  await addItemToCart({
    userId: session.userId,
    productId: parsed.data.productId,
    productVariantId: parsed.data.productVariantId,
    quantity: parsed.data.quantity,
  });
  revalidateCartSurfaces();

  if (nextPath) redirect(nextPath);
}

export async function updateCartItemAction(formData: FormData) {
  const parsed = updateQuantitySchema.safeParse({
    cartItemId: formData.get("cartItemId"),
    quantity: formData.get("quantity"),
  });

  if (!parsed.success) return;

  const session = await requireSession("/carrito");
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

  const session = await requireSession("/carrito");
  await removeCartItem(session.userId, parsed.data.cartItemId);
  revalidateCartSurfaces();
}

export async function clearCartAction() {
  const session = await requireSession("/carrito");
  await clearCartForUser(session.userId);
  revalidateCartSurfaces();
}
