import { z } from "zod";

const usernamePattern = /^[a-zA-Z0-9_.-]{3,30}$/;
const usernameAlphanumericPattern = /[a-zA-Z0-9]/;
const uppercasePattern = /[A-Z]/;
const numberPattern = /[0-9]/;
const specialCharacterPattern = /[^A-Za-z0-9\s]/;
const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

export const MINIMUM_REGISTRATION_AGE = 16;
export const MINIMUM_BIRTH_DATE = new Date("1900-01-01T00:00:00.000Z");
export const USERNAME_UNAVAILABLE_MESSAGE =
  "Este nombre de usuario ya existe o es demasiado parecido a uno registrado.";

function toDateOnlyUtc(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function formatDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getTodayDateOnly(referenceDate = new Date()): Date {
  return toDateOnlyUtc(referenceDate);
}

export function getLatestAllowedBirthDate(referenceDate = new Date()): Date {
  const today = getTodayDateOnly(referenceDate);

  return new Date(
    Date.UTC(
      today.getUTCFullYear() - MINIMUM_REGISTRATION_AGE,
      today.getUTCMonth(),
      today.getUTCDate(),
    ),
  );
}

export function parseDateOnly(value: string): Date | null {
  if (!dateOnlyPattern.test(value)) return null;

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return parsed;
}

export function normalizeUsernameForComparison(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function areUsernamesTooSimilar(
  requestedUsername: string,
  existingUsername: string,
): boolean {
  const requestedKey = normalizeUsernameForComparison(requestedUsername);
  const existingKey = normalizeUsernameForComparison(existingUsername);

  return requestedKey.length > 0 && requestedKey === existingKey;
}

export function normalizeAuthRedirect(value: string | undefined): string | undefined {
  if (!value) return undefined;
  if (!value.startsWith("/") || value.startsWith("//")) return undefined;

  return value;
}

const birthDateSchema = z
  .string()
  .trim()
  .superRefine((value, context) => {
    if (!value) {
      context.addIssue({
        code: "custom",
        message: "La fecha de nacimiento es obligatoria.",
      });
      return;
    }

    const parsedDate = parseDateOnly(value);
    if (!parsedDate) {
      context.addIssue({
        code: "custom",
        message: "Introduce una fecha de nacimiento válida.",
      });
      return;
    }

    if (parsedDate < MINIMUM_BIRTH_DATE) {
      context.addIssue({
        code: "custom",
        message: "Introduce una fecha de nacimiento válida.",
      });
      return;
    }

    if (parsedDate > getTodayDateOnly()) {
      context.addIssue({
        code: "custom",
        message: "La fecha de nacimiento no puede ser futura.",
      });
      return;
    }

    if (parsedDate > getLatestAllowedBirthDate()) {
      context.addIssue({
        code: "custom",
        message: `Debes tener al menos ${MINIMUM_REGISTRATION_AGE} años para registrarte.`,
      });
    }
  })
  .transform((value) => parseDateOnly(value) as Date);

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres.")
      .max(70, "El nombre es demasiado largo."),
    lastName: z
      .string()
      .trim()
      .min(2, "Los apellidos deben tener al menos 2 caracteres.")
      .max(120, "Los apellidos son demasiado largos."),
    birthDate: birthDateSchema,
    username: z
      .string()
      .trim()
      .min(1, "El nombre de usuario es obligatorio.")
      .min(3, "El nombre de usuario debe tener al menos 3 caracteres.")
      .max(30, "El nombre de usuario es demasiado largo.")
      .regex(
        usernamePattern,
        "Solo se permiten letras, números, punto, guion y guion bajo.",
      )
      .regex(
        usernameAlphanumericPattern,
        "El nombre de usuario debe incluir al menos una letra o un número.",
      )
      .transform((value) => value.toLowerCase()),
    email: z
      .string()
      .trim()
      .min(1, "El email es obligatorio.")
      .email("Introduce un email válido.")
      .transform((value) => value.toLowerCase()),
    password: z
      .string()
      .min(1, "La contraseña es obligatoria.")
      .min(8, "La contraseña debe tener al menos 8 caracteres.")
      .regex(uppercasePattern, "Debe incluir al menos una letra mayúscula.")
      .regex(numberPattern, "Debe incluir al menos un número.")
      .regex(
        specialCharacterPattern,
        "Debe incluir al menos un carácter especial.",
      ),
    confirmPassword: z.string().min(1, "Confirma tu contraseña."),
    country: z
      .string()
      .trim()
      .min(2, "Introduce un país válido.")
      .max(70, "El país es demasiado largo.")
      .transform((value) => value.toUpperCase()),
    acceptTerms: z.literal(true, {
      message: "Debes aceptar los términos y condiciones para registrarte.",
    }),
    redirectTo: z
      .string()
      .optional()
      .transform((value) => normalizeAuthRedirect(value)),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El email es obligatorio.")
    .email("Introduce un email válido.")
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1, "La contraseña es obligatoria."),
  remember: z.boolean().default(false),
  redirectTo: z
    .string()
    .optional()
    .transform((value) => normalizeAuthRedirect(value)),
});

export type AuthActionState = {
  status?: "error" | "success";
  message?: string;
  redirectTo?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};
