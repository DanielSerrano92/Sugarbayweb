import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import LoginForm from "@/components/auth/login-form";
import PageHero from "@/components/ui/page-hero";
import PageShell from "@/components/ui/page-shell";
import { getSessionUser } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "Login",
  description: "Inicia sesion en tu cuenta de Sugarbay.",
};

type LoginPageProps = {
  searchParams: Promise<{ redirect?: string | string[] }>;
};

function pickRedirect(value: string | string[] | undefined): string | undefined {
  const redirectValue = Array.isArray(value) ? value[0] : value;
  if (!redirectValue?.startsWith("/")) return undefined;
  return redirectValue;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSessionUser();
  if (session) redirect("/");

  const params = await searchParams;
  const redirectTo = pickRedirect(params.redirect);

  return (
    <PageShell
      hero={(
        <PageHero
          eyebrow="Acceso"
          title="Inicia sesion"
          description="Accede a tu cuenta para gestionar carrito, checkout y tu perfil."
        />
      )}
    >
      <section className="mx-auto w-full max-w-lg sb-window rounded-2xl p-6">
        <LoginForm redirectTo={redirectTo} />
        <p className="mt-4 text-sm text-zinc-600">
          No tienes cuenta?{" "}
          <Link href="/registro" className="font-semibold text-emerald-600 hover:text-emerald-500">
            Crear cuenta
          </Link>
        </p>
      </section>
    </PageShell>
  );
}




