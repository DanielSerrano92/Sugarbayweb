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
      title={mode === "login" ? "Login" : "Registro"}
      description="Accede a tu perfil Sugarbay para carrito, checkout y contenido personalizado."
    >
      <div className="auth-retro-panel">
        <div className="auth-retro-form-wrap">
          {mode === "login" ? (
            <LoginForm redirectTo={redirectTo} />
          ) : (
            <RegisterForm redirectTo={redirectTo} />
          )}
        </div>

        <p className="auth-retro-mode-hint mt-4 text-sm">
          {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button
            type="button"
            onClick={() =>
              onModeChange(mode === "login" ? "register" : "login")
            }
            className="auth-retro-mode-link"
          >
            {mode === "login" ? "Crear cuenta" : "Inicia sesión"}
          </button>
        </p>
      </div>
    </AuthModal>
  );
}
