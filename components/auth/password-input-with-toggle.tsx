"use client";

import { useState, type InputHTMLAttributes } from "react";

type PasswordInputWithToggleProps = {
  id: string;
  name: string;
  autoComplete?: InputHTMLAttributes<HTMLInputElement>["autoComplete"];
  required?: boolean;
  inputClassName?: string;
  actionLabel: string;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
  onChange?: InputHTMLAttributes<HTMLInputElement>["onChange"];
};

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

export default function PasswordInputWithToggle({
  id,
  name,
  autoComplete,
  required = true,
  inputClassName = "sb-input",
  actionLabel,
  ariaInvalid,
  ariaDescribedBy,
  onChange,
}: PasswordInputWithToggleProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={isVisible ? "text" : "password"}
        required={required}
        autoComplete={autoComplete}
        className={`${inputClassName} auth-password-input`}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        onChange={onChange}
      />
      <button
        type="button"
        aria-label={isVisible ? `Ocultar ${actionLabel}` : `Mostrar ${actionLabel}`}
        aria-pressed={isVisible}
        onClick={() => setIsVisible((current) => !current)}
        className="auth-password-toggle absolute inset-y-0 right-0 inline-flex items-center justify-center"
      >
        <EyeIcon crossed={isVisible} />
      </button>
    </div>
  );
}
