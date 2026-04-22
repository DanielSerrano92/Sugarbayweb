import { z } from "zod";

const usernamePattern = /^[a-zA-Z0-9_.-]{3,30}$/;

const minBirthDate = new Date("1900-01-01T00:00:00.000Z");

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(70, "El nombre es demasiado largo"),
    lastName: z
      .string()
      .min(2, "Los apellidos deben tener al menos 2 caracteres")
      .max(120, "Los apellidos son demasiado largos"),
    birthDate: z
      .string()
      .min(1, "La fecha de nacimiento es obligatoria")
      .refine((value) => !Number.isNaN(Date.parse(value)), {
        message: "Introduce una fecha de nacimiento valida",
      })
      .transform((value) => new Date(value))
      .refine((date) => date >= minBirthDate, {
        message: "Introduce una fecha de nacimiento valida",
      })
      .refine((date) => date <= new Date(), {
        message: "La fecha de nacimiento no puede ser futura",
      }),
    username: z
      .string()
      .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
      .max(30, "El nombre de usuario es demasiado largo")
      .regex(
        usernamePattern,
        "Solo se permiten letras, numeros y ._- en el nombre de usuario",
      ),
    email: z.string().email("Introduce un email valido"),
    password: z
      .string()
      .min(8, "La contrasena debe tener al menos 8 caracteres")
      .regex(/[A-Za-z]/, "Debe incluir al menos una letra")
      .regex(/[0-9]/, "Debe incluir al menos un numero"),
    confirmPassword: z.string().min(1, "Confirma tu contrasena"),
    country: z
      .string()
      .min(2, "Introduce un pais valido")
      .max(70, "El pais es demasiado largo"),
    acceptTerms: z.literal(true, {
      message: "Debes aceptar los terminos",
    }),
    redirectTo: z.string().optional(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Las contrasenas no coinciden",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Introduce un email valido"),
  password: z.string().min(1, "La contrasena es obligatoria"),
  remember: z.boolean().default(false),
  redirectTo: z.string().optional(),
});

export type AuthActionState = {
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};
