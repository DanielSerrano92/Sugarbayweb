"use client";

import { useActionState } from "react";

import { loginAction } from "@/lib/auth/actions";
import type { AuthActionState } from "@/lib/validators/auth";

import AuthSubmitButton from "./auth-submit-button";

type LoginFormProps = {
  redirectTo?: string;
};

const initialState: AuthActionState = {};

export default function LoginForm({ redirectTo }: LoginFormProps) {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirectTo" value={redirectTo ?? ""} />

      <div>
        <label
          htmlFor="login-email"
          className="mb-1.5 block text-sm font-medium text-zinc-900"
        >
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="sb-input"
        />
        {state.fieldErrors?.email ? (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.email[0]}</p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="login-password"
          className="mb-1.5 block text-sm font-medium text-zinc-900"
        >
          Contrasena
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="sb-input"
        />
        {state.fieldErrors?.password ? (
          <p className="mt-1 text-xs text-red-600">
            {state.fieldErrors.password[0]}
          </p>
        ) : null}
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-900">
        <input
          id="login-remember"
          name="remember"
          type="checkbox"
          className="sb-checkbox h-4 w-4 rounded border-zinc-300"
        />
        Recordar credenciales
      </label>

      {state.message ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      ) : null}

      <AuthSubmitButton label="Entrar" pendingLabel="Validando..." />
    </form>
  );
}
