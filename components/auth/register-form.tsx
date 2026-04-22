"use client";

import { useActionState } from "react";

import { registerAction } from "@/lib/auth/actions";
import type { AuthActionState } from "@/lib/validators/auth";

import AuthSubmitButton from "./auth-submit-button";

type RegisterFormProps = {
  redirectTo?: string;
};

const initialState: AuthActionState = {};

export default function RegisterForm({ redirectTo }: RegisterFormProps) {
  const [state, formAction] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirectTo" value={redirectTo ?? ""} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="register-first-name"
            className="mb-1.5 block text-sm font-medium text-zinc-800"
          >
            Nombre
          </label>
          <input
            id="register-first-name"
            name="firstName"
            type="text"
            required
            minLength={2}
            autoComplete="given-name"
            className="sb-input"
          />
          {state.fieldErrors?.firstName ? (
            <p className="mt-1 text-xs text-red-600">
              {state.fieldErrors.firstName[0]}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="register-last-name"
            className="mb-1.5 block text-sm font-medium text-zinc-800"
          >
            Apellidos
          </label>
          <input
            id="register-last-name"
            name="lastName"
            type="text"
            required
            minLength={2}
            autoComplete="family-name"
            className="sb-input"
          />
          {state.fieldErrors?.lastName ? (
            <p className="mt-1 text-xs text-red-600">
              {state.fieldErrors.lastName[0]}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="register-birth-date"
            className="mb-1.5 block text-sm font-medium text-zinc-800"
          >
            Fecha de nacimiento
          </label>
          <input
            id="register-birth-date"
            name="birthDate"
            type="date"
            required
            autoComplete="bday"
            className="sb-input"
          />
          {state.fieldErrors?.birthDate ? (
            <p className="mt-1 text-xs text-red-600">
              {state.fieldErrors.birthDate[0]}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="register-country"
            className="mb-1.5 block text-sm font-medium text-zinc-800"
          >
            Pais
          </label>
          <input
            id="register-country"
            name="country"
            type="text"
            required
            minLength={2}
            maxLength={70}
            autoComplete="country-name"
            placeholder="Espana"
            className="sb-input"
          />
          {state.fieldErrors?.country ? (
            <p className="mt-1 text-xs text-red-600">
              {state.fieldErrors.country[0]}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label
          htmlFor="register-username"
          className="mb-1.5 block text-sm font-medium text-zinc-800"
        >
          Nombre de usuario
        </label>
        <input
          id="register-username"
          name="username"
          type="text"
          required
          minLength={3}
          maxLength={30}
          autoComplete="username"
          className="sb-input"
        />
        {state.fieldErrors?.username ? (
          <p className="mt-1 text-xs text-red-600">
            {state.fieldErrors.username[0]}
          </p>
        ) : (
          <p className="mt-1 text-xs text-zinc-500">
            Usa letras, numeros y los simbolos . _ -
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="register-email"
          className="mb-1.5 block text-sm font-medium text-zinc-800"
        >
          Email
        </label>
        <input
          id="register-email"
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="register-password"
            className="mb-1.5 block text-sm font-medium text-zinc-800"
          >
            Contrasena
          </label>
          <input
            id="register-password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="sb-input"
          />
          {state.fieldErrors?.password ? (
            <p className="mt-1 text-xs text-red-600">
              {state.fieldErrors.password[0]}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="register-confirm-password"
            className="mb-1.5 block text-sm font-medium text-zinc-800"
          >
            Confirmar contrasena
          </label>
          <input
            id="register-confirm-password"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="sb-input"
          />
          {state.fieldErrors?.confirmPassword ? (
            <p className="mt-1 text-xs text-red-600">
              {state.fieldErrors.confirmPassword[0]}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label className="flex items-start gap-2 text-sm text-zinc-700">
          <input
            name="acceptTerms"
            type="checkbox"
            required
            className="sb-checkbox mt-0.5 h-4 w-4 rounded border-zinc-300"
          />
          <span>Acepto los terminos y condiciones</span>
        </label>
        {state.fieldErrors?.acceptTerms ? (
          <p className="mt-1 text-xs text-red-600">
            {state.fieldErrors.acceptTerms[0]}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      ) : null}

      <AuthSubmitButton
        label="Crear cuenta"
        pendingLabel="Creando cuenta..."
      />
    </form>
  );
}
