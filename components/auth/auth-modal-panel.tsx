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
      title={mode === "login" ? "LOGIN" : "MI CUENTA"}
      description="Accede a tu perfil Sugarbay para carrito, checkout y contenido personalizado."
    >
      <div className="auth-retro-panel">
        <div className="auth-retro-mode-switch mb-4 inline-flex gap-2 p-2">
          <button
            type="button"
            onClick={() => onModeChange("login")}
            aria-pressed={mode === "login"}
            className={`win-button auth-retro-mode-button ${mode === "login" ? "is-active" : ""}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => onModeChange("register")}
            aria-pressed={mode === "register"}
            className={`win-button auth-retro-mode-button ${mode === "register" ? "is-active" : ""}`}
          >
            Registro
          </button>
        </div>

        <div className="auth-retro-form-wrap">
          {mode === "login" ? (
            <LoginForm redirectTo={redirectTo} />
          ) : (
            <RegisterForm redirectTo={redirectTo} />
          )}
        </div>

        <p className="auth-retro-mode-hint mt-4 text-sm">
          {mode === "login" ? "No tienes cuenta?" : "Ya tienes cuenta?"}{" "}
          <button
            type="button"
            onClick={() =>
              onModeChange(mode === "login" ? "register" : "login")
            }
            className="auth-retro-mode-link"
          >
            {mode === "login" ? "Crear cuenta" : "Inicia sesion"}
          </button>
        </p>
      </div>
    </AuthModal>
  );
}
