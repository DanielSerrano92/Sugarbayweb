import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import RegisterForm from "@/components/auth/register-form";
import PageShell from "@/components/ui/page-shell";
import { getSessionUser } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "Registro",
  description: "Crea tu cuenta para comprar y gestionar pedidos en Sugarbay.",
};

type RegisterPageProps = {
  searchParams: Promise<{ redirect?: string | string[] }>;
};

function pickRedirect(value: string | string[] | undefined): string | undefined {
  const redirectValue = Array.isArray(value) ? value[0] : value;
  if (!redirectValue?.startsWith("/")) return undefined;
  return redirectValue;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const session = await getSessionUser();
  if (session) redirect("/");

  const params = await searchParams;
  const redirectTo = pickRedirect(params.redirect);

  return (
    <PageShell
      eyebrow="Registro"
      title="Crea tu cuenta Sugarbay"
      description="Registrate para comprar en tienda, guardar tu carrito y completar checkout."
    >
      <section className="mx-auto w-full max-w-2xl sb-window rounded-2xl p-6">
        <RegisterForm redirectTo={redirectTo} />
        <p className="mt-4 text-sm text-zinc-600">
          Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-500">
            Inicia sesion
          </Link>
        </p>
      </section>
    </PageShell>
  );
}




