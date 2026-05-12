export const AUTH_MODAL_OPEN_EVENT = "sugarbay:auth-modal-open";

export type AuthModalRequestMode = "login" | "register";

export type AuthModalOpenEventDetail = {
  mode: AuthModalRequestMode;
  redirectTo?: string;
};

export function dispatchAuthModalOpen(detail: AuthModalOpenEventDetail): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<AuthModalOpenEventDetail>(AUTH_MODAL_OPEN_EVENT, {
      detail,
    }),
  );
}
