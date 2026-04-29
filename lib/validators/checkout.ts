import { z } from "zod";

const phonePattern = /^[0-9+().\-\s]{7,20}$/;
const postalCodePattern = /^[A-Za-z0-9\-\s]{3,12}$/;

const requiredText = (label: string, min = 2, max = 120) =>
  z
    .string()
    .trim()
    .min(min, `${label} es obligatorio`)
    .max(max, `${label} es demasiado largo`);

const optionalText = (max = 120) =>
  z.string().trim().max(max, `El campo no puede superar ${max} caracteres`);

export const checkoutAddressSchema = z.object({
  firstName: requiredText("El nombre", 2, 70),
  lastName: requiredText("El apellido", 2, 120),
  address1: requiredText("La direccion", 3, 140),
  address2: optionalText(140).optional().default(""),
  city: requiredText("La ciudad", 2, 90),
  province: requiredText("La provincia", 2, 90),
  region: requiredText("La region", 2, 90),
  country: requiredText("El pais", 2, 70),
  postalCode: z
    .string()
    .trim()
    .min(3, "El codigo postal es obligatorio")
    .max(12, "El codigo postal es demasiado largo")
    .regex(postalCodePattern, "Introduce un codigo postal valido"),
  phone: z
    .string()
    .trim()
    .min(7, "El telefono es obligatorio")
    .max(20, "El telefono es demasiado largo")
    .regex(phonePattern, "Introduce un telefono valido"),
});

const relaxedCheckoutAddressSchema = z.object({
  firstName: z.string().trim().max(70).default(""),
  lastName: z.string().trim().max(120).default(""),
  address1: z.string().trim().max(140).default(""),
  address2: optionalText(140).optional().default(""),
  city: z.string().trim().max(90).default(""),
  province: z.string().trim().max(90).default(""),
  region: z.string().trim().max(90).default(""),
  country: z.string().trim().max(70).default(""),
  postalCode: z.string().trim().max(12).default(""),
  phone: z.string().trim().max(20).default(""),
});

export const checkoutPayloadSchema = z
  .object({
    shipping: checkoutAddressSchema,
    billing: relaxedCheckoutAddressSchema,
    useSameAddress: z.boolean().default(false),
    paymentMethod: z.enum(["card", "paypal"]).default("card"),
  })
  .superRefine((value, context) => {
    if (value.useSameAddress) {
      return;
    }

    const parsedBilling = checkoutAddressSchema.safeParse(value.billing);
    if (parsedBilling.success) {
      return;
    }

    for (const issue of parsedBilling.error.issues) {
      context.addIssue({
        ...issue,
        path: ["billing", ...issue.path],
      });
    }
  })
  .transform((value) => ({
    ...value,
    billing: value.useSameAddress
      ? value.shipping
      : checkoutAddressSchema.parse(value.billing),
  }));

export type CheckoutAddressInput = z.infer<typeof checkoutAddressSchema>;
export type CheckoutAddress = z.infer<typeof checkoutAddressSchema>;
export type CheckoutPayload = z.output<typeof checkoutPayloadSchema>;
export type CheckoutPaymentMethod = z.input<
  typeof checkoutPayloadSchema
>["paymentMethod"];

export type CheckoutFieldErrors = Record<string, string>;

export const emptyCheckoutAddress: CheckoutAddressInput = {
  firstName: "",
  lastName: "",
  address1: "",
  address2: "",
  city: "",
  province: "",
  region: "",
  country: "",
  postalCode: "",
  phone: "",
};

export function mapCheckoutIssuesToFieldErrors(
  issues: z.ZodIssue[],
): CheckoutFieldErrors {
  const errors: CheckoutFieldErrors = {};

  for (const issue of issues) {
    const key = issue.path.join(".");
    if (!key || errors[key]) continue;
    errors[key] = issue.message;
  }

  return errors;
}
