"use client";

import type { CheckoutAddressInput } from "@/lib/validators/checkout";

type AddressFieldName = keyof CheckoutAddressInput;

type CheckoutAddressFieldsProps = {
  section: "shipping" | "billing";
  title: string;
  description: string;
  values: CheckoutAddressInput;
  errors: Record<string, string>;
  disabled?: boolean;
  onFieldChange: (field: AddressFieldName, value: string) => void;
};

function FieldError({
  fieldId,
  error,
}: {
  fieldId: string;
  error?: string;
}) {
  if (!error) return null;
  return (
    <p id={`${fieldId}-error`} className="mt-1 text-xs text-red-700">
      {error}
    </p>
  );
}

function InputField({
  section,
  field,
  label,
  value,
  error,
  disabled,
  onFieldChange,
  autoComplete,
  optional,
}: {
  section: "shipping" | "billing";
  field: AddressFieldName;
  label: string;
  value: string;
  error?: string;
  disabled?: boolean;
  onFieldChange: (field: AddressFieldName, value: string) => void;
  autoComplete?: string;
  optional?: boolean;
}) {
  const inputId = `${section}-${field}`;
  const hasError = Boolean(error);

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-sm font-semibold text-zinc-800"
      >
        {label}
        {optional ? (
          <span className="ml-1 text-xs font-medium text-zinc-500">(opcional)</span>
        ) : null}
      </label>
      <input
        id={inputId}
        name={inputId}
        type="text"
        value={value}
        autoComplete={autoComplete}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${inputId}-error` : undefined}
        disabled={disabled}
        onChange={(event) => onFieldChange(field, event.target.value)}
        className={`sb-input ${
          hasError
            ? "border-red-300 bg-red-50 focus:border-red-400"
            : ""
        } ${disabled ? "cursor-not-allowed bg-zinc-100 text-zinc-500" : ""}`}
      />
      <FieldError fieldId={inputId} error={error} />
    </div>
  );
}

export default function CheckoutAddressFields({
  section,
  title,
  description,
  values,
  errors,
  disabled,
  onFieldChange,
}: CheckoutAddressFieldsProps) {
  return (
    <fieldset
      disabled={disabled}
      className="sb-panel rounded-2xl p-4 disabled:opacity-90"
    >
      <legend className="px-1 text-base font-bold text-zinc-900">{title}</legend>
      <p className="mb-4 text-sm text-zinc-600">{description}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          section={section}
          field="firstName"
          label="Nombre"
          value={values.firstName}
          error={errors[`${section}.firstName`]}
          autoComplete={section === "shipping" ? "shipping given-name" : "billing given-name"}
          disabled={disabled}
          onFieldChange={onFieldChange}
        />
        <InputField
          section={section}
          field="lastName"
          label="Apellido"
          value={values.lastName}
          error={errors[`${section}.lastName`]}
          autoComplete={section === "shipping" ? "shipping family-name" : "billing family-name"}
          disabled={disabled}
          onFieldChange={onFieldChange}
        />
      </div>

      <div className="mt-4 grid gap-4">
        <InputField
          section={section}
          field="address1"
          label="Direccion 1"
          value={values.address1}
          error={errors[`${section}.address1`]}
          autoComplete={section === "shipping" ? "shipping address-line1" : "billing address-line1"}
          disabled={disabled}
          onFieldChange={onFieldChange}
        />
        <InputField
          section={section}
          field="address2"
          label="Direccion 2"
          value={values.address2}
          error={errors[`${section}.address2`]}
          autoComplete={section === "shipping" ? "shipping address-line2" : "billing address-line2"}
          optional
          disabled={disabled}
          onFieldChange={onFieldChange}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <InputField
          section={section}
          field="city"
          label="Ciudad"
          value={values.city}
          error={errors[`${section}.city`]}
          autoComplete={section === "shipping" ? "shipping address-level2" : "billing address-level2"}
          disabled={disabled}
          onFieldChange={onFieldChange}
        />
        <InputField
          section={section}
          field="province"
          label="Provincia"
          value={values.province}
          error={errors[`${section}.province`]}
          disabled={disabled}
          onFieldChange={onFieldChange}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <InputField
          section={section}
          field="region"
          label="Comunidad / Region"
          value={values.region}
          error={errors[`${section}.region`]}
          autoComplete={section === "shipping" ? "shipping address-level1" : "billing address-level1"}
          disabled={disabled}
          onFieldChange={onFieldChange}
        />
        <InputField
          section={section}
          field="country"
          label="Pais"
          value={values.country}
          error={errors[`${section}.country`]}
          autoComplete={section === "shipping" ? "shipping country-name" : "billing country-name"}
          disabled={disabled}
          onFieldChange={onFieldChange}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <InputField
          section={section}
          field="postalCode"
          label="Codigo postal"
          value={values.postalCode}
          error={errors[`${section}.postalCode`]}
          autoComplete={section === "shipping" ? "shipping postal-code" : "billing postal-code"}
          disabled={disabled}
          onFieldChange={onFieldChange}
        />
        <InputField
          section={section}
          field="phone"
          label="Telefono"
          value={values.phone}
          error={errors[`${section}.phone`]}
          autoComplete={section === "shipping" ? "shipping tel" : "billing tel"}
          disabled={disabled}
          onFieldChange={onFieldChange}
        />
      </div>
    </fieldset>
  );
}
