"use client";

import { useActionState } from "react";

import { loginAction } from "@/lib/auth/actions";
import type { AuthActionState } from "@/lib/validators/auth";

import AuthSubmitButton from "./auth-submit-button";
import PasswordInputWithToggle from "./password-input-with-toggle";

type LoginFormProps = {
  redirectTo?: string;
};

const initialState: AuthActionState = {};

export default function LoginForm({ redirectTo }: LoginFormProps) {
  const [state, formAction] = useActionState(loginAction, initialState);
  const emailError = state.fieldErrors?.email?.[0];
  const passwordError = state.fieldErrors?.password?.[0];

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
          aria-invalid={Boolean(emailError)}
          aria-describedby={emailError ? "login-email-error" : undefined}
        />
        {emailError ? (
          <p id="login-email-error" className="auth-retro-error-text mt-1 text-xs">
            {emailError}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="login-password"
          className="mb-1.5 block text-sm font-medium text-zinc-900"
        >
          Contraseña
        </label>
        <PasswordInputWithToggle
          id="login-password"
          name="password"
          autoComplete="current-password"
          inputClassName="sb-input"
          actionLabel="contraseña"
          ariaInvalid={Boolean(passwordError)}
          ariaDescribedBy={passwordError ? "login-password-error" : undefined}
        />
        {passwordError ? (
          <p id="login-password-error" className="auth-retro-error-text mt-1 text-xs">
            {passwordError}
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
        <p className="auth-retro-error-box rounded-xl border px-3 py-2 text-sm" aria-live="polite">
          {state.message}
        </p>
      ) : null}

      <AuthSubmitButton label="Entrar" pendingLabel="Validando..." />
    </form>
  );
}
