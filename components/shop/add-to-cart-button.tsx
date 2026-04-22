"use client";

import { useFormStatus } from "react-dom";

type AddToCartButtonProps = {
  compact?: boolean;
};

export default function AddToCartButton({ compact }: AddToCartButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`sb-btn-primary font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
        compact ? "px-3 py-2 text-sm" : "px-4 py-2.5 text-sm"
      }`}
    >
      {pending ? "Aadiendo..." : "Aadir al carrito"}
    </button>
  );
}

