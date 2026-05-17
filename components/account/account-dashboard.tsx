"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";

import PasswordInputWithToggle from "@/components/auth/password-input-with-toggle";
import { formatCurrency, formatDate } from "@/lib/utils";

type SectionId = "profile" | "orders" | "addresses" | "security" | "support";
type LoadStatus = "idle" | "loading" | "success" | "error";
type FieldErrors = Record<string, string>;

type Feedback = {
  kind: "success" | "error" | "warning";
  message: string;
};

type ProfileData = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string | null;
  country: string;
  birthDate: string;
  createdAt: string;
  role: "USER" | "ADMIN" | "MANAGER";
};

type ProfileFormState = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  country: string;
  phone: string;
};

type OrderStatus = "PLACED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
type PaymentStatus =
  | "UNPAID"
  | "PENDING"
  | "PAID"
  | "PARTIALLY_REFUNDED"
  | "REFUNDED"
  | "FAILED";

type OrderData = {
  id: string;
  orderNumber: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentProvider: string;
  totalAmount: number;
  currency: string;
  placedAt: string;
  shippingAddress: {
    recipientName: string;
    line1: string;
    line2: string | null;
    city: string;
    region: string | null;
    postalCode: string;
    country: string;
    phone: string | null;
  };
  items: Array<{
    id: string;
    productName: string;
    variantName: string | null;
    sku: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    imageUrl: string | null;
  }>;
};

type AddressType = "SHIPPING" | "BILLING";
type AddressFormType = "SHIPPING" | "BILLING" | "BOTH";

type AddressData = {
  id: string;
  type: AddressType;
  label: string | null;
  recipientName: string;
  line1: string;
  line2: string | null;
  city: string;
  region: string | null;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

type AddressFormState = {
  type: AddressFormType;
  label: string;
  recipientName: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
};

type PasswordFormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type SupportFormState = {
  subject: string;
  message: string;
};

type SupportRequestStatus = "OPEN" | "IN_PROGRESS" | "CLOSED";

type SupportRequestData = {
  id: string;
  subject: string;
  message: string;
  status: SupportRequestStatus;
  createdAt: string;
  updatedAt: string;
};

type ApiErrorPayload = {
  message?: string;
  fieldErrors?: Record<string, string>;
};

type ApiResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      status: number;
      message: string;
      fieldErrors: FieldErrors;
    };

const SECTION_OPTIONS: Array<{ id: SectionId; label: string; description: string }> = [
  {
    id: "profile",
    label: "Perfil",
    description: "Datos personales y datos de cuenta",
  },
  {
    id: "orders",
    label: "Mis pedidos",
    description: "Historial y estado de compras",
  },
  {
    id: "addresses",
    label: "Direcciones",
    description: "Envio, facturacion y predeterminadas",
  },
  {
    id: "security",
    label: "Seguridad",
    description: "Contrasena y cierre de cuenta",
  },
  {
    id: "support",
    label: "Ayuda / Soporte",
    description: "Contacto y asistencia",
  },
];

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PLACED: "Recibido",
  PROCESSING: "Procesando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  UNPAID: "Sin pagar",
  PENDING: "Pendiente",
  PAID: "Pagado",
  PARTIALLY_REFUNDED: "Reembolso parcial",
  REFUNDED: "Reembolsado",
  FAILED: "Pago fallido",
};

const ADDRESS_TYPE_LABELS: Record<AddressType, string> = {
  SHIPPING: "Envio",
  BILLING: "Facturacion",
};

const SUPPORT_STATUS_LABELS: Record<SupportRequestStatus, string> = {
  OPEN: "Abierta",
  IN_PROGRESS: "En progreso",
  CLOSED: "Cerrada",
};

const DEFAULT_ADDRESS_FORM_STATE: AddressFormState = {
  type: "SHIPPING",
  label: "",
  recipientName: "",
  line1: "",
  line2: "",
  city: "",
  region: "",
  postalCode: "",
  country: "ES",
  phone: "",
  isDefault: false,
};

const DEFAULT_PASSWORD_FORM_STATE: PasswordFormState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const DEFAULT_SUPPORT_FORM_STATE: SupportFormState = {
  subject: "",
  message: "",
};

async function requestJson<T>(url: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, init);
    let payload: unknown = null;

    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const parsedPayload = (payload ?? {}) as ApiErrorPayload;

      return {
        ok: false,
        status: response.status,
        message: parsedPayload.message ?? "No se pudo completar la solicitud.",
        fieldErrors: parsedPayload.fieldErrors ?? {},
      };
    }

    return {
      ok: true,
      data: payload as T,
    };
  } catch {
    return {
      ok: false,
      status: 500,
      message: "Error de red. Revisa tu conexion e intentalo de nuevo.",
      fieldErrors: {},
    };
  }
}

function FeedbackBox({ feedback }: { feedback: Feedback }) {
  const isProfileSaveConflict =
    feedback.kind === "error" &&
    /no se pudieron guardar los cambios del perfil/i.test(feedback.message);
  const isProfileSaveSuccess =
    feedback.kind === "success" &&
    /perfil actualizado correctamente/i.test(feedback.message);
  const isAddressSaveSuccess =
    feedback.kind === "success" &&
    /direccion (actualizada|guardada|predeterminada actualizada) correctamente/i.test(
      feedback.message,
    );
  const isPasswordUpdateSuccess =
    feedback.kind === "success" &&
    /contrasena actualizada correctamente/i.test(feedback.message);
  const isSupportRequestSuccess =
    feedback.kind === "success" &&
    /solicitud enviada correctamente/i.test(feedback.message);
  const isSecurityErrorDanger =
    feedback.kind === "error" &&
    /revisa los datos de seguridad|la contrasena actual no es correcta/i.test(
      feedback.message,
    );

  return (
    <p
      className={`rounded-xl border px-3 py-2 text-sm ${
        isProfileSaveConflict
          ? "border-[#d3478b] bg-[#ffd9ec] font-black text-[#9d004f]"
          : isProfileSaveSuccess
            ? "border-[#2a9d62] bg-[#d9ffe9] font-black text-[#0b5d36]"
          : isAddressSaveSuccess
            ? "border-[#2a9d62] bg-[#d9ffe9] font-black text-[#0b5d36]"
          : isPasswordUpdateSuccess
            ? "border-[#2a9d62] bg-[#d9ffe9] font-black text-[#0b5d36]"
          : isSupportRequestSuccess
            ? "border-[#2a9d62] bg-[#d9ffe9] font-black text-[#0b5d36]"
          : isSecurityErrorDanger
            ? "border-[#d3478b] bg-[#ffd9ec] font-black text-[#9d004f]"
          : feedback.kind === "success"
          ? "border-emerald-300 bg-emerald-100 text-emerald-900"
          : feedback.kind === "warning"
            ? "border-amber-300 bg-amber-100 text-amber-900"
            : "border-red-300 bg-red-100 text-red-900"
      }`}
      aria-live="polite"
    >
      {feedback.message}
    </p>
  );
}

function FieldErrorText({ error, id }: { error?: string; id: string }) {
  if (!error) return null;

  const isDuplicateIdentityError = /ya esta registrado por otro usuario/i.test(error);

  return (
    <p
      id={id}
      className={`mt-1 text-xs ${
        isDuplicateIdentityError
          ? "rounded-[2px] border border-[#d3478b] bg-[#ffd9ec] px-2 py-1 font-black text-[#9d004f]"
          : "auth-retro-error-text font-semibold text-[#b1005b]"
      }`}
    >
      {error}
    </p>
  );
}

function LoadingPanel({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <article className="retro-concert-card min-h-0 overflow-hidden">
      <div className="retro-concert-header">{title}</div>
      <div className="retro-concert-body">
        <p className="retro-concert-description">{message}</p>
      </div>
    </article>
  );
}

function ErrorPanel({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry: () => void;
}) {
  return (
    <article className="retro-concert-card min-h-0 overflow-hidden border-red-400">
      <div className="retro-concert-header">{title}</div>
      <div className="retro-concert-body">
        <p className="retro-concert-description text-red-700">{message}</p>
        <button type="button" onClick={onRetry} className="win-button w-fit">
          Reintentar
        </button>
      </div>
    </article>
  );
}

type AccountDashboardProps = {
  initialUserName?: string;
  initialProfile: ProfileData | null;
  initialOrders: OrderData[];
  initialAddresses: AddressData[];
  initialSupportRequests: SupportRequestData[];
  initialSupportEmail: string | null;
};

export default function AccountDashboard({
  initialUserName = "Fan",
  initialProfile,
  initialOrders,
  initialAddresses,
  initialSupportRequests,
  initialSupportEmail,
}: AccountDashboardProps) {
  const [activeSection, setActiveSection] = useState<SectionId>("profile");

  const [profileStatus, setProfileStatus] = useState<LoadStatus>(
    initialProfile ? "success" : "error",
  );
  const [profile, setProfile] = useState<ProfileData | null>(initialProfile);
  const [profileForm, setProfileForm] = useState<ProfileFormState>(() => ({
    firstName: initialProfile?.firstName ?? "",
    lastName: initialProfile?.lastName ?? "",
    username: initialProfile?.username ?? "",
    email: initialProfile?.email ?? "",
    country: initialProfile?.country ?? "ES",
    phone: initialProfile?.phone ?? "",
  }));
  const [profileFieldErrors, setProfileFieldErrors] = useState<FieldErrors>({});
  const [profileFeedback, setProfileFeedback] = useState<Feedback | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);

  const [ordersStatus, setOrdersStatus] = useState<LoadStatus>("success");
  const [orders, setOrders] = useState<OrderData[]>(initialOrders);
  const [ordersFeedback, setOrdersFeedback] = useState<Feedback | null>(null);

  const [addressesStatus, setAddressesStatus] = useState<LoadStatus>("success");
  const [addresses, setAddresses] = useState<AddressData[]>(initialAddresses);
  const [addressForm, setAddressForm] = useState<AddressFormState>({
    ...DEFAULT_ADDRESS_FORM_STATE,
    country: initialProfile?.country ?? DEFAULT_ADDRESS_FORM_STATE.country,
  });
  const [addressFieldErrors, setAddressFieldErrors] = useState<FieldErrors>({});
  const [addressFeedback, setAddressFeedback] = useState<Feedback | null>(null);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressDeletingId, setAddressDeletingId] = useState<string | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const [passwordForm, setPasswordForm] = useState<PasswordFormState>(DEFAULT_PASSWORD_FORM_STATE);
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<FieldErrors>({});
  const [passwordFeedback, setPasswordFeedback] = useState<Feedback | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteFieldErrors, setDeleteFieldErrors] = useState<FieldErrors>({});
  const [deleteFeedback, setDeleteFeedback] = useState<Feedback | null>(null);
  const [deleteSaving, setDeleteSaving] = useState(false);

  const [supportForm, setSupportForm] = useState<SupportFormState>(DEFAULT_SUPPORT_FORM_STATE);
  const [supportFieldErrors, setSupportFieldErrors] = useState<FieldErrors>({});
  const [supportFeedback, setSupportFeedback] = useState<Feedback | null>(null);
  const [supportSaving, setSupportSaving] = useState(false);
  const [supportStatus, setSupportStatus] = useState<LoadStatus>("success");
  const [supportRequests, setSupportRequests] =
    useState<SupportRequestData[]>(initialSupportRequests);
  const [supportEmail, setSupportEmail] = useState<string | null>(initialSupportEmail);

  const userDisplayName = useMemo(() => {
    if (!profile) return initialUserName;
    return profile.firstName || initialUserName;
  }, [initialUserName, profile]);

  const resetAddressForm = useCallback((country = "ES") => {
    setAddressForm({
      ...DEFAULT_ADDRESS_FORM_STATE,
      country,
    });
    setEditingAddressId(null);
    setAddressFieldErrors({});
  }, []);

  const loadProfile = useCallback(async () => {
    setProfileStatus("loading");

    const result = await requestJson<{ profile: ProfileData; supportEmail: string | null }>(
      "/api/account/profile",
    );
    if (!result.ok) {
      setProfileStatus("error");
      setProfileFeedback({
        kind: "error",
        message: result.message,
      });
      return;
    }

    const nextProfile = result.data.profile;
    setProfile(nextProfile);
    setSupportEmail(result.data.supportEmail);
    setProfileForm({
      firstName: nextProfile.firstName,
      lastName: nextProfile.lastName,
      username: nextProfile.username,
      email: nextProfile.email,
      country: nextProfile.country,
      phone: nextProfile.phone ?? "",
    });
    setProfileFieldErrors({});
    setProfileFeedback(null);
    setProfileStatus("success");

    setAddressForm((current) => ({
      ...current,
      country: current.country || nextProfile.country,
    }));
  }, []);

  const loadOrders = useCallback(async () => {
    setOrdersStatus("loading");

    const result = await requestJson<{ orders: OrderData[] }>("/api/account/orders");
    if (!result.ok) {
      setOrdersStatus("error");
      setOrdersFeedback({
        kind: "error",
        message: result.message,
      });
      return;
    }

    setOrders(result.data.orders);
    setOrdersFeedback(null);
    setOrdersStatus("success");
  }, []);

  const loadAddresses = useCallback(async () => {
    setAddressesStatus("loading");

    const result = await requestJson<{ addresses: AddressData[] }>("/api/account/addresses");
    if (!result.ok) {
      setAddressesStatus("error");
      setAddressFeedback({
        kind: "error",
        message: result.message,
      });
      return;
    }

    setAddresses(result.data.addresses);
    setAddressFeedback(null);
    setAddressesStatus("success");
  }, []);

  const loadSupport = useCallback(async () => {
    setSupportStatus("loading");

    const result = await requestJson<{ supportRequests: SupportRequestData[] }>(
      "/api/account/support",
    );
    if (!result.ok) {
      setSupportStatus("error");
      setSupportFeedback({
        kind: "error",
        message: result.message,
      });
      return;
    }

    setSupportRequests(result.data.supportRequests);
    setSupportFeedback(null);
    setSupportStatus("success");
  }, []);

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileSaving(true);
    setProfileFieldErrors({});
    setProfileFeedback(null);

    const result = await requestJson<{ profile: ProfileData; message: string }>(
      "/api/account/profile",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileForm),
      },
    );

    setProfileSaving(false);

    if (!result.ok) {
      setProfileFieldErrors(result.fieldErrors);
      setProfileFeedback({
        kind: "error",
        message: result.message,
      });
      return;
    }

    setProfile(result.data.profile);
    setProfileForm({
      firstName: result.data.profile.firstName,
      lastName: result.data.profile.lastName,
      username: result.data.profile.username,
      email: result.data.profile.email,
      country: result.data.profile.country,
      phone: result.data.profile.phone ?? "",
    });
    setProfileFeedback({
      kind: "success",
      message: result.data.message,
    });
  }

  function startAddressEdition(address: AddressData) {
    setEditingAddressId(address.id);
    setAddressForm({
      type: address.type,
      label: address.label ?? "",
      recipientName: address.recipientName,
      line1: address.line1,
      line2: address.line2 ?? "",
      city: address.city,
      region: address.region ?? "",
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone ?? "",
      isDefault: address.isDefault,
    });
    setAddressFieldErrors({});
    setAddressFeedback(null);
  }

  async function handleAddressSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAddressSaving(true);
    setAddressFieldErrors({});
    setAddressFeedback(null);

    const isEditing = Boolean(editingAddressId);
    const query = isEditing ? `?id=${encodeURIComponent(editingAddressId ?? "")}` : "";
    const endpoint = `/api/account/addresses${query}`;

    const result = await requestJson<{ message: string; addresses: AddressData[] }>(endpoint, {
      method: isEditing ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(addressForm),
    });

    setAddressSaving(false);

    if (!result.ok) {
      setAddressFieldErrors(result.fieldErrors);
      setAddressFeedback({
        kind: "error",
        message: result.message,
      });
      return;
    }

    setAddresses(result.data.addresses);
    resetAddressForm(profile?.country ?? "ES");
    setAddressFeedback({
      kind: "success",
      message: result.data.message,
    });
  }

  async function handleAddressDelete(addressId: string) {
    const isConfirmed = window.confirm(
      "Vas a eliminar esta direccion. Esta accion no se puede deshacer.",
    );
    if (!isConfirmed) return;

    setAddressDeletingId(addressId);
    setAddressFeedback(null);

    const result = await requestJson<{ message: string; addresses: AddressData[] }>(
      `/api/account/addresses?id=${encodeURIComponent(addressId)}`,
      {
        method: "DELETE",
      },
    );

    setAddressDeletingId(null);

    if (!result.ok) {
      setAddressFeedback({
        kind: "error",
        message: result.message,
      });
      return;
    }

    if (editingAddressId === addressId) {
      resetAddressForm(profile?.country ?? "ES");
    }
    setAddresses(result.data.addresses);
    setAddressFeedback({
      kind: "success",
      message: result.data.message,
    });
  }

  async function handleSetAddressDefault(address: AddressData) {
    setAddressSaving(true);
    setAddressFieldErrors({});
    setAddressFeedback(null);

    const payload: AddressFormState = {
      type: address.type,
      label: address.label ?? "",
      recipientName: address.recipientName,
      line1: address.line1,
      line2: address.line2 ?? "",
      city: address.city,
      region: address.region ?? "",
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone ?? "",
      isDefault: true,
    };

    const result = await requestJson<{ message: string; addresses: AddressData[] }>(
      `/api/account/addresses?id=${encodeURIComponent(address.id)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    setAddressSaving(false);

    if (!result.ok) {
      setAddressFeedback({
        kind: "error",
        message: result.message,
      });
      return;
    }

    setAddresses(result.data.addresses);
    setAddressFeedback({
      kind: "success",
      message: "Direccion predeterminada actualizada.",
    });
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordSaving(true);
    setPasswordFeedback(null);
    setPasswordFieldErrors({});

    const result = await requestJson<{ message: string }>("/api/account/security/password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(passwordForm),
    });

    setPasswordSaving(false);

    if (!result.ok) {
      setPasswordFieldErrors(result.fieldErrors);
      setPasswordFeedback({
        kind: "error",
        message: result.message,
      });
      return;
    }

    setPasswordForm(DEFAULT_PASSWORD_FORM_STATE);
    setPasswordFeedback({
      kind: "success",
      message: result.data.message,
    });
  }

  async function handleDeleteAccountSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDeleteSaving(true);
    setDeleteFieldErrors({});
    setDeleteFeedback(null);

    const result = await requestJson<{ message: string }>("/api/account/security/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        confirmation: deleteConfirmation,
      }),
    });

    setDeleteSaving(false);

    if (!result.ok) {
      setDeleteFieldErrors(result.fieldErrors);
      setDeleteFeedback({
        kind: "error",
        message: result.message,
      });
      return;
    }

    setDeleteFeedback({
      kind: "success",
      message: "Cuenta desactivada. Redirigiendo al inicio...",
    });

    window.setTimeout(() => {
      window.location.assign("/");
    }, 700);
  }

  async function handleSupportSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSupportSaving(true);
    setSupportFieldErrors({});
    setSupportFeedback(null);

    const result = await requestJson<{
      message: string;
      supportRequest: SupportRequestData;
    }>("/api/account/support", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(supportForm),
    });

    setSupportSaving(false);

    if (!result.ok) {
      setSupportFieldErrors(result.fieldErrors);
      setSupportFeedback({
        kind: "error",
        message: result.message,
      });
      return;
    }

    setSupportRequests((current) => [result.data.supportRequest, ...current]);
    setSupportStatus("success");
    setSupportForm(DEFAULT_SUPPORT_FORM_STATE);
    setSupportFeedback({
      kind: "success",
      message: result.data.message,
    });
  }

  function renderProfileSection() {
    if (profileStatus === "loading" || profileStatus === "idle") {
      return (
        <LoadingPanel
          title="Perfil"
          message="Cargando perfil..."
        />
      );
    }

    if (profileStatus === "error") {
      return (
        <ErrorPanel
          title="Perfil"
          message={profileFeedback?.message ?? "No se pudo cargar tu perfil."}
          onRetry={() => {
            void loadProfile();
          }}
        />
      );
    }

    return (
      <article className="retro-concert-card min-h-0 overflow-hidden">
        <div className="retro-concert-header">Perfil</div>
        <div className="retro-concert-body">
          <div className="retro-concert-title-block">
            <h2 className="retro-concert-title">Datos personales</h2>
          </div>

          <form className="grid gap-4" noValidate onSubmit={handleProfileSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="account-firstName" className="mb-1.5 block text-sm font-medium text-[#121212]">
                  Nombre
                </label>
                <input
                  id="account-firstName"
                  name="firstName"
                  type="text"
                  className="win-input"
                  value={profileForm.firstName}
                  onChange={(event) => {
                    setProfileForm((current) => ({
                      ...current,
                      firstName: event.target.value,
                    }));
                  }}
                  aria-invalid={Boolean(profileFieldErrors.firstName)}
                  aria-describedby={
                    profileFieldErrors.firstName ? "account-firstName-error" : undefined
                  }
                />
                <FieldErrorText id="account-firstName-error" error={profileFieldErrors.firstName} />
              </div>

              <div>
                <label htmlFor="account-lastName" className="mb-1.5 block text-sm font-medium text-[#121212]">
                  Apellidos
                </label>
                <input
                  id="account-lastName"
                  name="lastName"
                  type="text"
                  className="win-input"
                  value={profileForm.lastName}
                  onChange={(event) => {
                    setProfileForm((current) => ({
                      ...current,
                      lastName: event.target.value,
                    }));
                  }}
                  aria-invalid={Boolean(profileFieldErrors.lastName)}
                  aria-describedby={profileFieldErrors.lastName ? "account-lastName-error" : undefined}
                />
                <FieldErrorText id="account-lastName-error" error={profileFieldErrors.lastName} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="account-email" className="mb-1.5 block text-sm font-medium text-[#121212]">
                  Email
                </label>
                <input
                  id="account-email"
                  name="email"
                  type="email"
                  className="win-input"
                  value={profileForm.email}
                  onChange={(event) => {
                    setProfileForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }));
                  }}
                  aria-invalid={Boolean(profileFieldErrors.email)}
                  aria-describedby={profileFieldErrors.email ? "account-email-error" : undefined}
                />
                <FieldErrorText id="account-email-error" error={profileFieldErrors.email} />
              </div>

              <div>
                <label htmlFor="account-phone" className="mb-1.5 block text-sm font-medium text-[#121212]">
                  Telefono
                </label>
                <input
                  id="account-phone"
                  name="phone"
                  type="text"
                  className="win-input"
                  value={profileForm.phone}
                  onChange={(event) => {
                    setProfileForm((current) => ({
                      ...current,
                      phone: event.target.value,
                    }));
                  }}
                  aria-invalid={Boolean(profileFieldErrors.phone)}
                  aria-describedby={profileFieldErrors.phone ? "account-phone-error" : undefined}
                />
                <FieldErrorText id="account-phone-error" error={profileFieldErrors.phone} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="account-country" className="mb-1.5 block text-sm font-medium text-[#121212]">
                  Pais
                </label>
                <input
                  id="account-country"
                  name="country"
                  type="text"
                  className="win-input"
                  value={profileForm.country}
                  onChange={(event) => {
                    setProfileForm((current) => ({
                      ...current,
                      country: event.target.value,
                    }));
                  }}
                  aria-invalid={Boolean(profileFieldErrors.country)}
                  aria-describedby={profileFieldErrors.country ? "account-country-error" : undefined}
                />
                <FieldErrorText id="account-country-error" error={profileFieldErrors.country} />
              </div>

              <div>
                <label htmlFor="account-username" className="mb-1.5 block text-sm font-medium text-[#121212]">
                  Usuario
                </label>
                <input
                  id="account-username"
                  name="username"
                  type="text"
                  className="win-input"
                  value={profileForm.username}
                  onChange={(event) => {
                    setProfileForm((current) => ({
                      ...current,
                      username: event.target.value,
                    }));
                  }}
                  aria-invalid={Boolean(profileFieldErrors.username)}
                  aria-describedby={
                    profileFieldErrors.username ? "account-username-error" : undefined
                  }
                />
                <FieldErrorText id="account-username-error" error={profileFieldErrors.username} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="retro-concert-meta-item">
                <span className="retro-concert-meta-label">Fecha de nacimiento</span>
                <span className="font-retro-ui text-sm font-bold text-[#171717]">
                  {profile ? formatDate(profile.birthDate) : "-"}
                </span>
              </div>
              <div className="retro-concert-meta-item">
                <span className="retro-concert-meta-label">Miembro desde</span>
                <span className="font-retro-ui text-sm font-bold text-[#171717]">
                  {profile ? formatDate(profile.createdAt) : "-"}
                </span>
              </div>
            </div>

            {profileFeedback ? <FeedbackBox feedback={profileFeedback} /> : null}

            <div className="flex flex-wrap gap-2">
              <button type="submit" className="win-button" disabled={profileSaving}>
                {profileSaving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      </article>
    );
  }

  function renderOrdersSection() {
    if (ordersStatus === "loading" || ordersStatus === "idle") {
      return <LoadingPanel title="Mis pedidos" message="Cargando pedidos..." />;
    }

    if (ordersStatus === "error") {
      return (
        <ErrorPanel
          title="Mis pedidos"
          message={ordersFeedback?.message ?? "No se pudieron cargar tus pedidos."}
          onRetry={() => {
            void loadOrders();
          }}
        />
      );
    }

    if (orders.length === 0) {
      return (
        <article className="retro-concert-card min-h-0 overflow-hidden">
          <div className="retro-concert-header">Mis pedidos</div>
          <div className="retro-concert-body">
            <p className="retro-concert-description">Todavia no tienes pedidos.</p>
          </div>
        </article>
      );
    }

    return (
      <article className="retro-concert-card min-h-0 overflow-hidden">
        <div className="retro-concert-header">Mis pedidos</div>
        <div className="retro-concert-body">
          <div className="grid gap-4">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-lg border border-[#9aa2c8] bg-[#ece8f6] p-3 shadow-[inset_1px_1px_0_rgba(255,255,255,0.6),inset_-1px_-1px_0_rgba(109,109,109,0.45)]"
              >
                <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-start">
                  <div>
                    <p className="retro-concert-meta-label">Pedido #{order.orderNumber}</p>
                    <p className="text-sm font-semibold text-[#111]">{formatDate(order.placedAt)}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-black text-[#111]">
                      {formatCurrency(order.totalAmount, order.currency)}
                    </p>
                    <p className="text-xs text-[#3b3b4d]">
                      {ORDER_STATUS_LABELS[order.status]} · {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid gap-2">
                  <p className="retro-concert-meta-label">Productos</p>
                  <ul className="grid gap-2">
                    {order.items.map((item) => (
                      <li key={item.id} className="rounded border border-[#b2b7ce] bg-[#f6f4fb] px-2 py-1.5 text-sm text-[#141414]">
                        <p className="font-semibold">
                          {item.productName} x{item.quantity}
                        </p>
                        <p className="text-xs text-[#373750]">
                          {item.variantName ? `${item.variantName} · ` : ""}
                          {formatCurrency(item.unitPrice, order.currency)} c/u
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-3 grid gap-2 text-xs text-[#30304a] sm:grid-cols-2">
                  <p>Metodo de pago: {order.paymentProvider}</p>
                  <p className="sm:text-right">
                    Envio: {order.shippingAddress.city}, {order.shippingAddress.country}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </article>
    );
  }

  function renderAddressesSection() {
    if (addressesStatus === "loading" || addressesStatus === "idle") {
      return <LoadingPanel title="Direcciones" message="Cargando direcciones..." />;
    }

    if (addressesStatus === "error") {
      return (
        <ErrorPanel
          title="Direcciones"
          message={addressFeedback?.message ?? "No se pudieron cargar tus direcciones."}
          onRetry={() => {
            void loadAddresses();
          }}
        />
      );
    }

    return (
      <div className="grid gap-4">
        <article className="retro-concert-card min-h-0 overflow-hidden">
          <div className="retro-concert-header">Direcciones guardadas</div>
          <div className="retro-concert-body">
            {addresses.length === 0 ? (
              <p className="retro-concert-description">No tienes direcciones guardadas.</p>
            ) : (
              <div className="grid gap-3">
                {addresses.map((address) => (
                  <article
                    key={address.id}
                    className="rounded-lg border border-[#9aa2c8] bg-[#ece8f6] p-3 shadow-[inset_1px_1px_0_rgba(255,255,255,0.6),inset_-1px_-1px_0_rgba(109,109,109,0.45)]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="retro-concert-meta-label">
                          {ADDRESS_TYPE_LABELS[address.type]}
                          {address.isDefault ? " · Predeterminada" : ""}
                        </p>
                        <p className="font-semibold text-[#111]">{address.recipientName}</p>
                        <p className="text-sm text-[#1f1f2b]">
                          {address.line1}
                          {address.line2 ? `, ${address.line2}` : ""}
                        </p>
                        <p className="text-sm text-[#1f1f2b]">
                          {address.postalCode} · {address.city} · {address.region ?? "-"}
                        </p>
                        <p className="text-sm text-[#1f1f2b]">
                          {address.country}
                          {address.phone ? ` · Tel: ${address.phone}` : ""}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="win-button"
                          onClick={() => startAddressEdition(address)}
                        >
                          Editar
                        </button>
                        {!address.isDefault ? (
                          <button
                            type="button"
                            className="win-button"
                            disabled={addressSaving}
                            onClick={() => {
                              void handleSetAddressDefault(address);
                            }}
                          >
                            Predeterminada
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="win-button"
                          disabled={addressDeletingId === address.id}
                          onClick={() => {
                            void handleAddressDelete(address.id);
                          }}
                        >
                          {addressDeletingId === address.id ? "Eliminando..." : "Eliminar"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </article>

        <article className="retro-concert-card min-h-0 overflow-hidden">
          <div className="retro-concert-header">
            {editingAddressId ? "Editar direccion" : "Nueva direccion"}
          </div>
          <div className="retro-concert-body">
            <form className="grid gap-4" noValidate onSubmit={handleAddressSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="address-type" className="mb-1.5 block text-sm font-medium text-[#121212]">
                    Tipo
                  </label>
                  <select
                    id="address-type"
                    className="win-input"
                    value={addressForm.type}
                    onChange={(event) => {
                      setAddressForm((current) => ({
                        ...current,
                        type: event.target.value as AddressFormType,
                      }));
                    }}
                  >
                    <option value="SHIPPING">Envio</option>
                    <option value="BILLING">Facturacion</option>
                    <option value="BOTH">Ambas</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="address-label" className="mb-1.5 block text-sm font-medium text-[#121212]">
                    Alias (opcional)
                  </label>
                  <input
                    id="address-label"
                    type="text"
                    className="win-input"
                    value={addressForm.label}
                    onChange={(event) => {
                      setAddressForm((current) => ({
                        ...current,
                        label: event.target.value,
                      }));
                    }}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="address-recipientName" className="mb-1.5 block text-sm font-medium text-[#121212]">
                    Nombre completo
                  </label>
                  <input
                    id="address-recipientName"
                    className="win-input"
                    value={addressForm.recipientName}
                    onChange={(event) => {
                      setAddressForm((current) => ({
                        ...current,
                        recipientName: event.target.value,
                      }));
                    }}
                    aria-invalid={Boolean(addressFieldErrors.recipientName)}
                    aria-describedby={
                      addressFieldErrors.recipientName ? "address-recipientName-error" : undefined
                    }
                  />
                  <FieldErrorText
                    id="address-recipientName-error"
                    error={addressFieldErrors.recipientName}
                  />
                </div>

                <div>
                  <label htmlFor="address-phone" className="mb-1.5 block text-sm font-medium text-[#121212]">
                    Telefono
                  </label>
                  <input
                    id="address-phone"
                    className="win-input"
                    value={addressForm.phone}
                    onChange={(event) => {
                      setAddressForm((current) => ({
                        ...current,
                        phone: event.target.value,
                      }));
                    }}
                    aria-invalid={Boolean(addressFieldErrors.phone)}
                    aria-describedby={addressFieldErrors.phone ? "address-phone-error" : undefined}
                  />
                  <FieldErrorText id="address-phone-error" error={addressFieldErrors.phone} />
                </div>
              </div>

              <div className="grid gap-4">
                <div>
                  <label htmlFor="address-line1" className="mb-1.5 block text-sm font-medium text-[#121212]">
                    Calle y numero
                  </label>
                  <input
                    id="address-line1"
                    className="win-input"
                    value={addressForm.line1}
                    onChange={(event) => {
                      setAddressForm((current) => ({
                        ...current,
                        line1: event.target.value,
                      }));
                    }}
                    aria-invalid={Boolean(addressFieldErrors.line1)}
                    aria-describedby={addressFieldErrors.line1 ? "address-line1-error" : undefined}
                  />
                  <FieldErrorText id="address-line1-error" error={addressFieldErrors.line1} />
                </div>
                <div>
                  <label htmlFor="address-line2" className="mb-1.5 block text-sm font-medium text-[#121212]">
                    Piso / Puerta / Detalles
                  </label>
                  <input
                    id="address-line2"
                    className="win-input"
                    value={addressForm.line2}
                    onChange={(event) => {
                      setAddressForm((current) => ({
                        ...current,
                        line2: event.target.value,
                      }));
                    }}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="address-city" className="mb-1.5 block text-sm font-medium text-[#121212]">
                    Ciudad
                  </label>
                  <input
                    id="address-city"
                    className="win-input"
                    value={addressForm.city}
                    onChange={(event) => {
                      setAddressForm((current) => ({
                        ...current,
                        city: event.target.value,
                      }));
                    }}
                    aria-invalid={Boolean(addressFieldErrors.city)}
                    aria-describedby={addressFieldErrors.city ? "address-city-error" : undefined}
                  />
                  <FieldErrorText id="address-city-error" error={addressFieldErrors.city} />
                </div>

                <div>
                  <label htmlFor="address-region" className="mb-1.5 block text-sm font-medium text-[#121212]">
                    Provincia
                  </label>
                  <input
                    id="address-region"
                    className="win-input"
                    value={addressForm.region}
                    onChange={(event) => {
                      setAddressForm((current) => ({
                        ...current,
                        region: event.target.value,
                      }));
                    }}
                    aria-invalid={Boolean(addressFieldErrors.region)}
                    aria-describedby={addressFieldErrors.region ? "address-region-error" : undefined}
                  />
                  <FieldErrorText id="address-region-error" error={addressFieldErrors.region} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="address-postalCode" className="mb-1.5 block text-sm font-medium text-[#121212]">
                    Codigo postal
                  </label>
                  <input
                    id="address-postalCode"
                    className="win-input"
                    value={addressForm.postalCode}
                    onChange={(event) => {
                      setAddressForm((current) => ({
                        ...current,
                        postalCode: event.target.value,
                      }));
                    }}
                    aria-invalid={Boolean(addressFieldErrors.postalCode)}
                    aria-describedby={addressFieldErrors.postalCode ? "address-postalCode-error" : undefined}
                  />
                  <FieldErrorText id="address-postalCode-error" error={addressFieldErrors.postalCode} />
                </div>

                <div>
                  <label htmlFor="address-country" className="mb-1.5 block text-sm font-medium text-[#121212]">
                    Pais
                  </label>
                  <input
                    id="address-country"
                    className="win-input"
                    value={addressForm.country}
                    onChange={(event) => {
                      setAddressForm((current) => ({
                        ...current,
                        country: event.target.value,
                      }));
                    }}
                    aria-invalid={Boolean(addressFieldErrors.country)}
                    aria-describedby={addressFieldErrors.country ? "address-country-error" : undefined}
                  />
                  <FieldErrorText id="address-country-error" error={addressFieldErrors.country} />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm font-medium text-[#1b1b1b]">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(event) => {
                    setAddressForm((current) => ({
                      ...current,
                      isDefault: event.target.checked,
                    }));
                  }}
                  className="h-4 w-4 accent-[#254bd4]"
                />
                Marcar como predeterminada
              </label>

              {addressFeedback ? <FeedbackBox feedback={addressFeedback} /> : null}

              <div className="flex flex-wrap gap-2">
                <button type="submit" className="win-button" disabled={addressSaving}>
                  {addressSaving ? "Guardando..." : editingAddressId ? "Guardar direccion" : "Crear direccion"}
                </button>
                {editingAddressId ? (
                  <button
                    type="button"
                    className="win-button"
                    onClick={() => resetAddressForm(profile?.country ?? "ES")}
                  >
                    Cancelar edicion
                  </button>
                ) : null}
              </div>
            </form>
          </div>
        </article>
      </div>
    );
  }

  function renderSecuritySection() {
    return (
      <div className="grid gap-4">
        <article className="retro-concert-card min-h-0 overflow-hidden">
          <div className="retro-concert-header">Cambiar contrasena</div>
          <div className="retro-concert-body">
            <form className="grid gap-4" noValidate onSubmit={handlePasswordSubmit}>
              <div>
                <label htmlFor="security-current-password" className="mb-1.5 block text-sm font-medium text-[#121212]">
                  Contrasena actual
                </label>
                <PasswordInputWithToggle
                  id="security-current-password"
                  name="security-current-password"
                  autoComplete="current-password"
                  actionLabel="contrasena actual"
                  inputClassName="win-input"
                  value={passwordForm.currentPassword}
                  ariaInvalid={Boolean(passwordFieldErrors.currentPassword)}
                  ariaDescribedBy={
                    passwordFieldErrors.currentPassword
                      ? "security-current-password-error"
                      : undefined
                  }
                  onChange={(event) => {
                    const value = event.target.value;
                    setPasswordForm((current) => ({
                      ...current,
                      currentPassword: value,
                    }));
                  }}
                />
                <FieldErrorText
                  id="security-current-password-error"
                  error={passwordFieldErrors.currentPassword}
                />
              </div>

              <div>
                <label htmlFor="security-new-password" className="mb-1.5 block text-sm font-medium text-[#121212]">
                  Nueva contrasena
                </label>
                <PasswordInputWithToggle
                  id="security-new-password"
                  name="security-new-password"
                  autoComplete="new-password"
                  actionLabel="nueva contrasena"
                  inputClassName="win-input"
                  value={passwordForm.newPassword}
                  ariaInvalid={Boolean(passwordFieldErrors.newPassword)}
                  ariaDescribedBy={
                    passwordFieldErrors.newPassword ? "security-new-password-error" : undefined
                  }
                  onChange={(event) => {
                    const value = event.target.value;
                    setPasswordForm((current) => ({
                      ...current,
                      newPassword: value,
                    }));
                  }}
                />
                <FieldErrorText
                  id="security-new-password-error"
                  error={passwordFieldErrors.newPassword}
                />
              </div>

              <div>
                <label htmlFor="security-confirm-password" className="mb-1.5 block text-sm font-medium text-[#121212]">
                  Repetir nueva contrasena
                </label>
                <PasswordInputWithToggle
                  id="security-confirm-password"
                  name="security-confirm-password"
                  autoComplete="new-password"
                  actionLabel="confirmacion de nueva contrasena"
                  inputClassName="win-input"
                  value={passwordForm.confirmPassword}
                  ariaInvalid={Boolean(passwordFieldErrors.confirmPassword)}
                  ariaDescribedBy={
                    passwordFieldErrors.confirmPassword
                      ? "security-confirm-password-error"
                      : undefined
                  }
                  onChange={(event) => {
                    const value = event.target.value;
                    setPasswordForm((current) => ({
                      ...current,
                      confirmPassword: value,
                    }));
                  }}
                />
                <FieldErrorText
                  id="security-confirm-password-error"
                  error={passwordFieldErrors.confirmPassword}
                />
              </div>

              {passwordFeedback ? <FeedbackBox feedback={passwordFeedback} /> : null}

              <div className="flex flex-wrap gap-2">
                <button type="submit" className="win-button" disabled={passwordSaving}>
                  {passwordSaving ? "Actualizando..." : "Actualizar contrasena"}
                </button>
              </div>
            </form>
          </div>
        </article>

        <article className="retro-concert-card min-h-0 overflow-hidden border-red-400">
          <div className="retro-concert-header bg-gradient-to-r from-[#8e2039] to-[#cb2f5a] text-white">
            Zona de peligro
          </div>
          <div className="retro-concert-body">
            <p className="rounded-[2px] border border-[#9d2f55] bg-[#ffdbe9] px-3 py-2 text-sm font-black text-[#6f1638]">
              Esta accion desactiva tu cuenta, cierra sesion y puede ser irreversible.
              Tus pedidos se conservaran por integridad historica.
            </p>

            <form className="mt-3 grid gap-3" noValidate onSubmit={handleDeleteAccountSubmit}>
              <div>
                <label htmlFor="delete-confirmation" className="mb-1.5 block text-sm font-medium text-[#121212]">
                  Escribe ELIMINAR para confirmar
                </label>
                <input
                  id="delete-confirmation"
                  className="win-input"
                  value={deleteConfirmation}
                  onChange={(event) => setDeleteConfirmation(event.target.value)}
                  aria-invalid={Boolean(deleteFieldErrors.confirmation)}
                  aria-describedby={deleteFieldErrors.confirmation ? "delete-confirmation-error" : undefined}
                />
                <FieldErrorText id="delete-confirmation-error" error={deleteFieldErrors.confirmation} />
              </div>

              {deleteFeedback ? <FeedbackBox feedback={deleteFeedback} /> : null}

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="win-button"
                  disabled={deleteSaving || deleteConfirmation !== "ELIMINAR"}
                >
                  {deleteSaving ? "Eliminando..." : "Eliminar cuenta"}
                </button>
              </div>
            </form>
          </div>
        </article>
      </div>
    );
  }

  function renderSupportSection() {
    const hasSupportEmail = Boolean(supportEmail);

    return (
      <article className="retro-concert-card min-h-0 overflow-hidden">
        <div className="retro-concert-header">Ayuda / Soporte</div>
        <div className="retro-concert-body">
          <div className="retro-concert-copy">
            <p className="retro-concert-description">
              Si tienes dudas sobre pedidos, perfil o acceso, usa este formulario.
            </p>
            <p className="retro-concert-description">
              Tiempo de respuesta recomendado: 24 a 48 horas.
            </p>
            <p className="retro-concert-description">
              Canal alternativo por email:{" "}
              {hasSupportEmail ? supportEmail : "No configurado en este entorno"}.
            </p>
          </div>

          <form className="grid gap-4" noValidate onSubmit={handleSupportSubmit}>
            <div>
              <label htmlFor="support-subject" className="mb-1.5 block text-sm font-medium text-[#121212]">
                Asunto
              </label>
              <input
                id="support-subject"
                className="win-input"
                value={supportForm.subject}
                onChange={(event) => {
                  setSupportForm((current) => ({
                    ...current,
                    subject: event.target.value,
                  }));
                }}
                aria-invalid={Boolean(supportFieldErrors.subject)}
                aria-describedby={supportFieldErrors.subject ? "support-subject-error" : undefined}
              />
              <FieldErrorText id="support-subject-error" error={supportFieldErrors.subject} />
            </div>

            <div>
              <label htmlFor="support-message" className="mb-1.5 block text-sm font-medium text-[#121212]">
                Mensaje
              </label>
              <textarea
                id="support-message"
                className="win-input min-h-[9rem]"
                value={supportForm.message}
                onChange={(event) => {
                  setSupportForm((current) => ({
                    ...current,
                    message: event.target.value,
                  }));
                }}
                aria-invalid={Boolean(supportFieldErrors.message)}
                aria-describedby={supportFieldErrors.message ? "support-message-error" : undefined}
              />
              <FieldErrorText id="support-message-error" error={supportFieldErrors.message} />
            </div>

            {supportFeedback ? <FeedbackBox feedback={supportFeedback} /> : null}

            <div className="flex flex-wrap gap-2">
              <button type="submit" className="win-button" disabled={supportSaving}>
                {supportSaving ? "Enviando..." : "Enviar solicitud"}
              </button>
            </div>
          </form>

          <div className="mt-5 border-t border-[#9aa2c8] pt-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h3 className="retro-concert-meta-label text-sm font-black text-[#252541]">
                Solicitudes enviadas
              </h3>
              <button
                type="button"
                className="win-button text-xs"
                disabled={supportStatus === "loading"}
                onClick={() => {
                  void loadSupport();
                }}
              >
                {supportStatus === "loading" ? "Actualizando..." : "Actualizar listado"}
              </button>
            </div>

            {supportStatus === "loading" || supportStatus === "idle" ? (
              <p className="retro-concert-description">Cargando solicitudes...</p>
            ) : supportStatus === "error" ? (
              <div className="grid gap-2 rounded border border-[#d3478b] bg-[#ffd9ec] p-3 text-sm text-[#9d004f]">
                <p className="font-black">
                  No se pudieron cargar tus solicitudes de soporte.
                </p>
                <p>{supportFeedback?.message ?? "Reintenta para recuperar el historial."}</p>
              </div>
            ) : supportRequests.length === 0 ? (
              <p className="retro-concert-description">
                Todavia no has enviado solicitudes de soporte.
              </p>
            ) : (
              <div className="grid gap-3">
                {supportRequests.map((supportRequest) => (
                  <article
                    key={supportRequest.id}
                    className="rounded-lg border border-[#9aa2c8] bg-[#ece8f6] p-3 shadow-[inset_1px_1px_0_rgba(255,255,255,0.6),inset_-1px_-1px_0_rgba(109,109,109,0.45)]"
                  >
                    <div className="grid gap-1 sm:grid-cols-[1fr_auto] sm:items-start">
                      <p className="text-sm font-black text-[#17172f]">{supportRequest.subject}</p>
                      <p className="rounded border border-[#7c84ad] bg-[#dcd9ef] px-2 py-0.5 text-xs font-black text-[#232343]">
                        {SUPPORT_STATUS_LABELS[supportRequest.status]}
                      </p>
                    </div>
                    <p className="mt-2 whitespace-pre-line text-sm text-[#1d1d36]">
                      {supportRequest.message}
                    </p>
                    <div className="mt-3 grid gap-1 text-xs text-[#323255] sm:grid-cols-2">
                      <p>Creada: {formatDate(supportRequest.createdAt)}</p>
                      <p className="sm:text-right">
                        Actualizada: {formatDate(supportRequest.updatedAt)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </article>
    );
  }

  function renderCurrentSection() {
    if (activeSection === "profile") return renderProfileSection();
    if (activeSection === "orders") return renderOrdersSection();
    if (activeSection === "addresses") return renderAddressesSection();
    if (activeSection === "security") return renderSecuritySection();
    return renderSupportSection();
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="retro-concert-card h-fit min-h-0 overflow-hidden">
        <div className="retro-concert-header">Panel de cuenta</div>
        <div className="retro-concert-body">
          <div className="retro-concert-copy">
            <p className="retro-concert-description">Hola, {userDisplayName}.</p>
          </div>

          <div className="grid gap-2 lg:hidden">
            <label htmlFor="account-section-select" className="retro-concert-meta-label">
              Seccion activa
            </label>
            <select
              id="account-section-select"
              className="win-input"
              value={activeSection}
              onChange={(event) => {
                setActiveSection(event.target.value as SectionId);
              }}
            >
              {SECTION_OPTIONS.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.label}
                </option>
              ))}
            </select>
          </div>

          <nav className="hidden gap-2 lg:grid">
            {SECTION_OPTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`win-button w-full justify-start text-left ${
                  activeSection === section.id
                    ? "bg-[#92bfff] text-[#00163f] shadow-[inset_2px_2px_0_#ffffff,inset_-2px_-2px_0_#4b73b2]"
                    : ""
                }`}
              >
                {section.label}
              </button>
            ))}
          </nav>

          <div className="retro-concert-meta-item">
            <p className="retro-concert-meta-label">
              {SECTION_OPTIONS.find((section) => section.id === activeSection)?.label}
            </p>
            <p className="font-retro-ui text-sm font-bold text-[#171717]">
              {SECTION_OPTIONS.find((section) => section.id === activeSection)?.description}
            </p>
          </div>
        </div>
      </aside>

      <div className="grid gap-4">{renderCurrentSection()}</div>
    </section>
  );
}
