"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

import AppModal from "@/components/ui/app-modal";

type StoreProductModalShellProps = {
  title: string;
  children: ReactNode;
};

export default function StoreProductModalShell({
  title,
  children,
}: StoreProductModalShellProps) {
  const router = useRouter();

  return (
    <AppModal
      title={title}
      onClose={() => router.back()}
      maxWidth="1220px"
      overlayOpacity={0.3}
    >
      {children}
    </AppModal>
  );
}
