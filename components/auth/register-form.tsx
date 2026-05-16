"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
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
import PasswordInputWithToggle from "./password-input-with-toggle";
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
      className="auth-retro-error-text mt-1.5 space-y-1 text-xs font-medium"
      aria-live="polite"
    >
      {errors.map((error) => (
        <li key={error}>{error}</li>
      ))}
    </ul>
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
          <div>
            <label
              htmlFor="register-password"
              className="mb-1.5 block text-sm font-medium text-zinc-900"
            >
              Contraseña
            </label>
            <PasswordInputWithToggle
              id="register-password"
              name="password"
              autoComplete="new-password"
              inputClassName="sb-input"
              actionLabel="contraseña"
              ariaInvalid={Boolean(passwordErrors)}
              ariaDescribedBy={
                passwordErrors?.length ? fieldErrorId("password") : undefined
              }
              onChange={() => handleFieldChange("password")}
            />
            <FieldErrorMessages field="password" errors={passwordErrors} />
          </div>

          <div>
            <label
              htmlFor="register-confirm-password"
              className="mb-1.5 block text-sm font-medium text-zinc-900"
            >
              Confirmar contraseña
            </label>
            <PasswordInputWithToggle
              id="register-confirm-password"
              name="confirmPassword"
              autoComplete="new-password"
              inputClassName="sb-input"
              actionLabel="confirmación de contraseña"
              ariaInvalid={Boolean(confirmPasswordErrors)}
              ariaDescribedBy={
                confirmPasswordErrors?.length
                  ? fieldErrorId("confirmPassword")
                  : undefined
              }
              onChange={() => handleFieldChange("confirmPassword")}
            />
            <FieldErrorMessages
              field="confirmPassword"
              errors={confirmPasswordErrors}
            />
          </div>
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
                : "auth-retro-error-box"
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
