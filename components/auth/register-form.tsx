"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
} from "react";
import { useRouter } from "next/navigation";

import { registerAction } from "@/lib/auth/actions";
import {
  formatDateInputValue,
  getLatestAllowedBirthDate,
  MINIMUM_BIRTH_DATE,
  MINIMUM_REGISTRATION_AGE,
  registerSchema,
  type AuthActionState,
} from "@/lib/validators/auth";

import AuthSubmitButton from "./auth-submit-button";
import TermsAndConditionsModal from "./terms-and-conditions-modal";

type RegisterFormProps = {
  redirectTo?: string;
};

type RegisterField =
  | "firstName"
  | "lastName"
  | "birthDate"
  | "country"
  | "username"
  | "email"
  | "password"
  | "confirmPassword"
  | "acceptTerms";

type FieldErrors = Record<string, string[] | undefined>;

const initialState: AuthActionState = {};

function parseString(value: FormDataEntryValue | null, trim = true): string {
  if (typeof value !== "string") return "";

  return trim ? value.trim() : value;
}

function parseCheckbox(value: FormDataEntryValue | null): boolean {
  return value === "on" || value === "true" || value === "1";
}

function buildRegisterPayload(form: HTMLFormElement) {
  const formData = new FormData(form);

  return {
    firstName: parseString(formData.get("firstName")),
    lastName: parseString(formData.get("lastName")),
    birthDate: parseString(formData.get("birthDate")),
    username: parseString(formData.get("username")),
    email: parseString(formData.get("email")),
    password: parseString(formData.get("password"), false),
    confirmPassword: parseString(formData.get("confirmPassword"), false),
    country: parseString(formData.get("country")),
    acceptTerms: parseCheckbox(formData.get("acceptTerms")),
    redirectTo: parseString(formData.get("redirectTo")) || undefined,
  };
}

function withoutFieldErrors(
  fieldErrors: FieldErrors | undefined,
  field: RegisterField,
): FieldErrors | undefined {
  if (!fieldErrors?.[field]) return fieldErrors;

  const nextErrors = { ...fieldErrors };
  delete nextErrors[field];

  return nextErrors;
}

function fieldErrorId(field: RegisterField): string {
  return `register-${field}-error`;
}

function FieldErrorMessages({
  field,
  errors,
}: {
  field: RegisterField;
  errors: string[] | undefined;
}) {
  if (!errors?.length) return null;

  return (
    <ul
      id={fieldErrorId(field)}
      className="mt-1.5 space-y-1 text-xs font-medium text-red-700"
      aria-live="polite"
    >
      {errors.map((error) => (
        <li key={error}>{error}</li>
      ))}
    </ul>
  );
}

function EyeIcon({ crossed = false }: { crossed?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {crossed ? <path d="M4 4l16 16" /> : null}
    </svg>
  );
}

function PasswordInput({
  id,
  name,
  label,
  autoComplete,
  errors,
  onFieldChange,
}: {
  id: string;
  name: "password" | "confirmPassword";
  label: string;
  autoComplete: InputHTMLAttributes<HTMLInputElement>["autoComplete"];
  errors: string[] | undefined;
  onFieldChange: (field: RegisterField) => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const labelForAction = name === "password" ? "contraseña" : "confirmación";

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-zinc-900"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={isVisible ? "text" : "password"}
          required
          autoComplete={autoComplete}
          className="sb-input pr-12"
          aria-invalid={Boolean(errors)}
          aria-describedby={errors?.length ? fieldErrorId(name) : undefined}
          onChange={() => onFieldChange(name)}
        />
        <button
          type="button"
          aria-label={
            isVisible
              ? `Ocultar ${labelForAction}`
              : `Mostrar ${labelForAction}`
          }
          aria-pressed={isVisible}
          onClick={() => setIsVisible((current) => !current)}
          className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg border border-zinc-300/70 bg-zinc-100/70 text-zinc-800 transition hover:border-emerald-600 hover:text-zinc-900"
        >
          <EyeIcon crossed={isVisible} />
        </button>
      </div>
      <FieldErrorMessages field={name} errors={errors} />
    </div>
  );
}

export default function RegisterForm({ redirectTo }: RegisterFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(registerAction, initialState);
  const [clientFieldErrors, setClientFieldErrors] = useState<FieldErrors>();
  const [clientMessage, setClientMessage] = useState<string>();
  const [editedServerFields, setEditedServerFields] = useState<Set<string>>(
    () => new Set(),
  );
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const isSuccessful = state.status === "success";
  const minBirthDate = useMemo(
    () => formatDateInputValue(MINIMUM_BIRTH_DATE),
    [],
  );
  const maxBirthDate = useMemo(
    () => formatDateInputValue(getLatestAllowedBirthDate()),
    [],
  );

  useEffect(() => {
    if (!isSuccessful) return;

    const timeoutId = window.setTimeout(() => {
      router.replace(state.redirectTo ?? "/");
      router.refresh();
    }, 900);

    return () => window.clearTimeout(timeoutId);
  }, [isSuccessful, router, state.redirectTo]);

  const getFieldErrors = (field: RegisterField) => {
    const clientErrors = clientFieldErrors?.[field];
    if (clientErrors?.length) return clientErrors;
    if (editedServerFields.has(field)) return undefined;

    return state.fieldErrors?.[field];
  };

  const handleFieldChange = (field: RegisterField) => {
    setClientMessage(undefined);
    setClientFieldErrors((current) => withoutFieldErrors(current, field));
    setEditedServerFields((current) => {
      const nextFields = new Set(current);
      nextFields.add(field);
      return nextFields;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const parsed = registerSchema.safeParse(
      buildRegisterPayload(event.currentTarget),
    );

    setEditedServerFields(new Set());

    if (!parsed.success) {
      event.preventDefault();
      setClientMessage("Revisa los campos marcados.");
      setClientFieldErrors(parsed.error.flatten().fieldErrors);
      return;
    }

    setClientMessage(undefined);
    setClientFieldErrors(undefined);
  };

  const firstNameErrors = getFieldErrors("firstName");
  const lastNameErrors = getFieldErrors("lastName");
  const birthDateErrors = getFieldErrors("birthDate");
  const countryErrors = getFieldErrors("country");
  const usernameErrors = getFieldErrors("username");
  const emailErrors = getFieldErrors("email");
  const passwordErrors = getFieldErrors("password");
  const confirmPasswordErrors = getFieldErrors("confirmPassword");
  const acceptTermsErrors = getFieldErrors("acceptTerms");
  const message = clientMessage ?? state.message;

  return (
    <>
      <form action={formAction} onSubmit={handleSubmit} noValidate className="space-y-4">
        <input type="hidden" name="redirectTo" value={redirectTo ?? ""} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="register-first-name"
              className="mb-1.5 block text-sm font-medium text-zinc-900"
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
              aria-invalid={Boolean(firstNameErrors)}
              aria-describedby={
                firstNameErrors?.length ? fieldErrorId("firstName") : undefined
              }
              onChange={() => handleFieldChange("firstName")}
            />
            <FieldErrorMessages field="firstName" errors={firstNameErrors} />
          </div>

          <div>
            <label
              htmlFor="register-last-name"
              className="mb-1.5 block text-sm font-medium text-zinc-900"
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
              aria-invalid={Boolean(lastNameErrors)}
              aria-describedby={
                lastNameErrors?.length ? fieldErrorId("lastName") : undefined
              }
              onChange={() => handleFieldChange("lastName")}
            />
            <FieldErrorMessages field="lastName" errors={lastNameErrors} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="register-birth-date"
              className="mb-1.5 block text-sm font-medium text-zinc-900"
            >
              Fecha de nacimiento
            </label>
            <input
              id="register-birth-date"
              name="birthDate"
              type="date"
              required
              min={minBirthDate}
              max={maxBirthDate}
              autoComplete="bday"
              className="sb-input"
              aria-invalid={Boolean(birthDateErrors)}
              aria-describedby={
                birthDateErrors?.length
                  ? fieldErrorId("birthDate")
                  : "register-birth-date-hint"
              }
              onChange={() => handleFieldChange("birthDate")}
            />
            <FieldErrorMessages field="birthDate" errors={birthDateErrors} />
            {!birthDateErrors?.length ? (
              <p id="register-birth-date-hint" className="mt-1 text-xs text-zinc-600">
                Edad mínima: {MINIMUM_REGISTRATION_AGE} años.
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="register-country"
              className="mb-1.5 block text-sm font-medium text-zinc-900"
            >
              País
            </label>
            <input
              id="register-country"
              name="country"
              type="text"
              required
              minLength={2}
              maxLength={70}
              autoComplete="country-name"
              placeholder="España"
              className="sb-input"
              aria-invalid={Boolean(countryErrors)}
              aria-describedby={
                countryErrors?.length ? fieldErrorId("country") : undefined
              }
              onChange={() => handleFieldChange("country")}
            />
            <FieldErrorMessages field="country" errors={countryErrors} />
          </div>
        </div>

        <div>
          <label
            htmlFor="register-username"
            className="mb-1.5 block text-sm font-medium text-zinc-900"
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
            aria-invalid={Boolean(usernameErrors)}
            aria-describedby={
              usernameErrors?.length
                ? fieldErrorId("username")
                : "register-username-hint"
            }
            onChange={() => handleFieldChange("username")}
          />
          <FieldErrorMessages field="username" errors={usernameErrors} />
          {!usernameErrors?.length ? (
            <p id="register-username-hint" className="mt-1 text-xs text-zinc-600">
              Usa letras, números, punto, guion y guion bajo. Se bloquean
              variantes demasiado parecidas.
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="register-email"
            className="mb-1.5 block text-sm font-medium text-zinc-900"
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
            aria-invalid={Boolean(emailErrors)}
            aria-describedby={
              emailErrors?.length ? fieldErrorId("email") : undefined
            }
            onChange={() => handleFieldChange("email")}
          />
          <FieldErrorMessages field="email" errors={emailErrors} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <PasswordInput
            id="register-password"
            name="password"
            label="Contraseña"
            autoComplete="new-password"
            errors={passwordErrors}
            onFieldChange={handleFieldChange}
          />

          <PasswordInput
            id="register-confirm-password"
            name="confirmPassword"
            label="Confirmar contraseña"
            autoComplete="new-password"
            errors={confirmPasswordErrors}
            onFieldChange={handleFieldChange}
          />
        </div>

        <div>
          <div className="flex items-start gap-2 text-sm text-zinc-800">
            <input
              id="register-accept-terms"
              name="acceptTerms"
              type="checkbox"
              required
              className="sb-checkbox mt-0.5 h-4 w-4 rounded border-zinc-300"
              aria-invalid={Boolean(acceptTermsErrors)}
              aria-describedby={
                acceptTermsErrors?.length
                  ? fieldErrorId("acceptTerms")
                  : undefined
              }
              onChange={() => handleFieldChange("acceptTerms")}
            />
            <p>
              <label htmlFor="register-accept-terms">Acepto los </label>
              <button
                type="button"
                onClick={() => setIsTermsOpen(true)}
                className="font-semibold text-emerald-600 underline decoration-emerald-600/50 underline-offset-4 hover:text-emerald-500"
              >
                términos y condiciones
              </button>
            </p>
          </div>
          <FieldErrorMessages field="acceptTerms" errors={acceptTermsErrors} />
        </div>

        {message ? (
          <p
            className={`rounded-xl border px-3 py-2 text-sm ${
              isSuccessful
                ? "border-emerald-300/70 bg-emerald-100/50 text-zinc-900"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
            aria-live="polite"
          >
            {message}
          </p>
        ) : null}

        <AuthSubmitButton
          label="Crear cuenta"
          pendingLabel="Creando cuenta..."
          disabled={isSuccessful}
        />
      </form>

      <TermsAndConditionsModal
        open={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />
    </>
  );
}
