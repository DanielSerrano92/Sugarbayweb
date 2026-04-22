"use client";

import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";

import AuthModal from "./auth-modal";

export type AuthMode = "login" | "register";

type AuthModalPanelProps = {
  open: boolean;
  mode: AuthMode;
  redirectTo?: string;
  onClose: () => void;
  onModeChange: (nextMode: AuthMode) => void;
};

export default function AuthModalPanel({
  open,
  mode,
  redirectTo,
  onClose,
  onModeChange,
}: AuthModalPanelProps) {
  return (
    <AuthModal
      open={open}
      onClose={onClose}
      title={mode === "login" ? "Inicia sesion" : "Crea tu cuenta"}
      description="Accede a tu perfil Sugarbay para carrito, checkout y contenido personalizado."
    >
      <div className="mb-5 inline-flex rounded-xl border border-zinc-300 bg-zinc-50 p-1">
        <button
          type="button"
          onClick={() => onModeChange("login")}
          aria-pressed={mode === "login"}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            mode === "login"
              ? "bg-emerald-700 text-white shadow-[0_10px_20px_rgba(55,37,134,0.45)]"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => onModeChange("register")}
          aria-pressed={mode === "register"}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            mode === "register"
              ? "bg-emerald-700 text-white shadow-[0_10px_20px_rgba(55,37,134,0.45)]"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          Registro
        </button>
      </div>

      {mode === "login" ? (
        <LoginForm redirectTo={redirectTo} />
      ) : (
        <RegisterForm redirectTo={redirectTo} />
      )}

      <p className="mt-4 text-sm text-zinc-600">
        {mode === "login" ? "No tienes cuenta?" : "Ya tienes cuenta?"}{" "}
        <button
          type="button"
          onClick={() =>
            onModeChange(mode === "login" ? "register" : "login")
          }
          className="font-semibold text-emerald-600 hover:text-emerald-500"
        >
          {mode === "login" ? "Crear cuenta" : "Inicia sesion"}
        </button>
      </p>
    </AuthModal>
  );
}
