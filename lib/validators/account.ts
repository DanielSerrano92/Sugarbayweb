import { z } from "zod";

const phonePattern = /^[0-9+().\-\s]{7,20}$/;
const postalCodePattern = /^[A-Za-z0-9\-\s]{3,12}$/;
const usernamePattern = /^[a-zA-Z0-9_.-]{3,30}$/;
const usernameAlphanumericPattern = /[a-zA-Z0-9]/;
const uppercasePattern = /[A-Z]/;
const numberPattern = /[0-9]/;
const specialCharacterPattern = /[^A-Za-z0-9\s]/;

const requiredText = (label: string, min = 2, max = 120) =>
  z
    .string()
    .trim()
    .min(min, `${label} es obligatorio`)
    .max(max, `${label} es demasiado largo`);

const optionalText = (max = 120) =>
  z
    .string()
    .trim()
    .max(max, `El campo no puede superar ${max} caracteres`);

const nullablePhoneSchema = z
  .string()
  .trim()
  .max(20, "El telefono es demasiado largo")
  .refine((value) => value.length === 0 || phonePattern.test(value), {
    message: "Introduce un telefono valido",
  })
  .transform((value) => (value.length === 0 ? null : value));

const passwordSchema = z
  .string()
  .min(8, "La contrasena debe tener al menos 8 caracteres.")
  .regex(uppercasePattern, "Debe incluir al menos una letra mayuscula.")
  .regex(numberPattern, "Debe incluir al menos un numero.")
  .regex(specialCharacterPattern, "Debe incluir al menos un caracter especial.");

export const accountAddressTypeSchema = z.enum(["SHIPPING", "BILLING", "BOTH"]);

export const updateProfileSchema = z.object({
  firstName: requiredText("El nombre", 2, 70),
  lastName: requiredText("Los apellidos", 2, 120),
  username: z
    .string()
    .trim()
    .min(1, "El nombre de usuario es obligatorio.")
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres.")
    .max(30, "El nombre de usuario es demasiado largo.")
    .regex(
      usernamePattern,
      "Solo se permiten letras, numeros, punto, guion y guion bajo.",
    )
    .regex(
      usernameAlphanumericPattern,
      "El nombre de usuario debe incluir al menos una letra o un numero.",
    )
    .transform((value) => value.toLowerCase()),
  email: z
    .string()
    .trim()
    .min(1, "El email es obligatorio.")
    .email("Introduce un email valido.")
    .transform((value) => value.toLowerCase()),
  country: requiredText("El pais", 2, 70).transform((value) => value.toUpperCase()),
  phone: nullablePhoneSchema,
});

export const upsertAddressSchema = z.object({
  type: accountAddressTypeSchema.default("SHIPPING"),
  label: optionalText(60)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
  recipientName: requiredText("El nombre completo", 2, 120),
  line1: requiredText("La direccion", 3, 140),
  line2: optionalText(140)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
  city: requiredText("La ciudad", 2, 90),
  region: requiredText("La provincia", 2, 90),
  postalCode: z
    .string()
    .trim()
    .min(3, "El codigo postal es obligatorio")
    .max(12, "El codigo postal es demasiado largo")
    .regex(postalCodePattern, "Introduce un codigo postal valido"),
  country: requiredText("El pais", 2, 70).transform((value) => value.toUpperCase()),
  phone: nullablePhoneSchema,
  isDefault: z.boolean().default(false),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "La contrasena actual es obligatoria."),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirma la nueva contrasena."),
  })
  .superRefine((value, context) => {
    if (value.newPassword !== value.confirmPassword) {
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Las contrasenas no coinciden.",
      });
    }

    if (value.currentPassword === value.newPassword) {
      context.addIssue({
        code: "custom",
        path: ["newPassword"],
        message: "La nueva contrasena no puede ser igual a la actual.",
      });
    }
  });

export const deleteAccountSchema = z.object({
  confirmation: z.literal("ELIMINAR", {
    message: "Debes escribir ELIMINAR para confirmar.",
  }),
});

export const supportRequestSchema = z.object({
  subject: requiredText("El asunto", 3, 120),
  message: requiredText("El mensaje", 10, 2000),
});

export type ProfileUpdateInput = z.infer<typeof updateProfileSchema>;
export type UpsertAddressInput = z.infer<typeof upsertAddressSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
export type SupportRequestInput = z.infer<typeof supportRequestSchema>;
export type AccountFieldErrors = Record<string, string>;

export function mapAccountIssuesToFieldErrors(issues: z.ZodIssue[]): AccountFieldErrors {
  const errors: AccountFieldErrors = {};

  for (const issue of issues) {
    const key = issue.path.join(".");
    if (!key || errors[key]) continue;
    errors[key] = issue.message;
  }

  return errors;
}
