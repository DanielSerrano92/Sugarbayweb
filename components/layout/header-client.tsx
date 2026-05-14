"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import AuthModalPanel, { type AuthMode } from "@/components/auth/auth-modal-panel";
import CartDrawer from "@/components/cart/cart-drawer";
import GlobalSearch from "@/components/layout/global-search";
import { logoutAction } from "@/lib/auth/actions";
import {
  AUTH_MODAL_OPEN_EVENT,
  type AuthModalOpenEventDetail,
} from "@/lib/auth/events";
import { CART_CLEARED_EVENT } from "@/lib/cart/events";
import { mainNavigation, type NavItem } from "@/lib/services/navigation";

type HeaderClientProps = {
  cartCount: number;
  cart: {
    currency: string;
    totalItems: number;
    subtotal: number;
    items: Array<{
      id: string;
      quantity: number;
      lineTotal: number;
      product: {
        name: string;
        slug: string;
        currency: string;
        coverImage: string | null;
      };
      variant: {
        title: string | null;
        size: string;
      };
    }>;
  } | null;
  currentUser: {
    firstName: string;
    email: string;
  } | null;
};

function CartIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="square"
      strokeLinejoin="miter"
      shapeRendering="crispEdges"
    >
      <circle cx="9" cy="20" r="1.25" />
      <circle cx="18" cy="20" r="1.25" />
      <path d="M3 4h2l2.3 10.2a1 1 0 0 0 1 .8h9.8a1 1 0 0 0 1-.7L21 7H7" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="square"
      strokeLinejoin="miter"
      shapeRendering="crispEdges"
    >
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}

const desktopNavItemClass =
  "sb-header-tab focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40";

const headerIconLargeClass =
  "sb-header-icon-pop inline-grid h-auto w-auto place-items-center border-0 bg-transparent p-0 text-black shadow-none hover:bg-transparent focus-visible:outline-none focus-visible:ring-0 [&>svg]:!h-[3.25rem] [&>svg]:!w-[3.25rem] sm:[&>svg]:!h-[3.6rem] sm:[&>svg]:!w-[3.6rem] xl:[&>svg]:!h-[4rem] xl:[&>svg]:!w-[4rem]";
const profileMenuItemClass =
  "win-button sb-header-profile-menu-item";

const LEFT_NAVIGATION_HREFS = ["/concerts", "/band/news", "/musica"];
const RIGHT_NAVIGATION_HREFS = ["/media/photos", "/fanclub", "/store"];
const HEADER_LOGO_SRC = "https://ik.imagekit.io/gq1enkszp/fotos/logo.png";

function sortNavigationByOrder(items: NavItem[], order: string[]): NavItem[] {
  return [...items].sort((left, right) => order.indexOf(left.href) - order.indexOf(right.href));
}

function getHeaderLabel(item: NavItem): string {
  if (item.href === "/musica") return "Musica";
  if (item.href === "/fanclub") return "FanClub";
  return item.label;
}

function HeaderLogoImage() {
  return (
    <Image
      src={HEADER_LOGO_SRC}
      alt="Sugarbay"
      fill
      priority
      sizes="(max-width: 639px) 70px, (max-width: 1560px) 106px, 156px"
      className="sb-header-logo-image"
    />
  );
}

export default function HeaderClient({
  cartCount,
  cart,
  currentUser,
}: HeaderClientProps) {
  const [visibleCart, setVisibleCart] = useState(cart);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authRedirectTo, setAuthRedirectTo] = useState<string | undefined>();
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuId = "header-profile-menu";
  const headerNavigation = mainNavigation.filter((item) => item.href !== "/");
  const leftNavigation = sortNavigationByOrder(
    headerNavigation.filter((item) => LEFT_NAVIGATION_HREFS.includes(item.href)),
    LEFT_NAVIGATION_HREFS,
  );
  const rightNavigation = sortNavigationByOrder(
    headerNavigation.filter((item) => RIGHT_NAVIGATION_HREFS.includes(item.href)),
    RIGHT_NAVIGATION_HREFS,
  );
  const visibleCartCount = visibleCart?.totalItems ?? cartCount;

  useEffect(() => {
    setVisibleCart(cart);
  }, [cart]);

  useEffect(() => {
    function handleCartCleared() {
      setVisibleCart((currentCart) =>
        currentCart
          ? {
              ...currentCart,
              totalItems: 0,
              subtotal: 0,
              items: [],
            }
          : currentCart,
      );
    }

    window.addEventListener(CART_CLEARED_EVENT, handleCartCleared);
    return () => window.removeEventListener(CART_CLEARED_EVENT, handleCartCleared);
  }, []);

  useEffect(() => {
    if (!profileMenuOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [profileMenuOpen]);

  const resolveCurrentPath = useCallback((): string => {
    if (typeof window === "undefined") return "/";

    return `${window.location.pathname}${window.location.search}`;
  }, []);

  const openAuthModal = useCallback((mode: AuthMode, redirectTo?: string) => {
    setAuthMode(mode);
    setAuthRedirectTo(redirectTo ?? resolveCurrentPath());
    setAuthModalOpen(true);
  }, [resolveCurrentPath]);

  useEffect(() => {
    const handleAuthModalOpen = (event: Event) => {
      const customEvent = event as CustomEvent<AuthModalOpenEventDetail>;
      const requestedMode = customEvent.detail?.mode ?? "login";
      const requestedRedirect = customEvent.detail?.redirectTo;

      setProfileMenuOpen(false);
      setCartDrawerOpen(false);
      openAuthModal(requestedMode, requestedRedirect);
    };

    window.addEventListener(AUTH_MODAL_OPEN_EVENT, handleAuthModalOpen);
    return () =>
      window.removeEventListener(AUTH_MODAL_OPEN_EVENT, handleAuthModalOpen);
  }, [openAuthModal]);

  function renderDesktopNavItem(item: NavItem) {
    const isBandTab = item.href === "/band/news";

    if (!item.children?.length) {
      return (
        <Link
          key={item.href}
          href={item.href}
          className={`${desktopNavItemClass} ${isBandTab ? "sb-header-tab-band" : ""}`}
        >
          {getHeaderLabel(item)}
        </Link>
      );
    }

    return (
      <div key={item.href} className="sb-header-nav-item group relative">
        <Link
          href={item.href}
          className={`${desktopNavItemClass} ${isBandTab ? "sb-header-tab-band" : ""}`}
        >
          {getHeaderLabel(item)}
        </Link>
        <div
          className="sb-header-dropdown pointer-events-none invisible absolute left-1/2 top-full z-40 mt-0 w-full min-w-full max-w-full -translate-x-1/2 rounded-none p-0 opacity-0 transition-opacity duration-100 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100"
        >
          {item.children.map((child) => {
            return (
              <Link
                key={child.href}
                href={child.href}
                className="sb-header-dropdown-item"
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="relative z-40 w-full">
        <div className="sb-header-shell w-full max-w-full rounded-none">
          <div className="sb-header-row relative flex w-full min-w-0 items-center">
            <GlobalSearch
              className="sb-header-search-pixel sb-header-icon-pop inline-grid h-auto w-auto shrink-0 place-items-center border-0 bg-transparent p-0 text-black shadow-none hover:bg-transparent focus-visible:outline-none focus-visible:ring-0 [&>span]:hidden [&>svg]:origin-center [&>svg]:scale-[1.12] [&>svg]:translate-y-[2px] [&>svg]:!h-[3.25rem] [&>svg]:!w-[3.25rem] sm:[&>svg]:!h-[3.6rem] sm:[&>svg]:!w-[3.6rem] xl:[&>svg]:!h-[4rem] xl:[&>svg]:!w-[4rem]"
            />

            <div className="sb-header-desktop-nav min-w-0 flex-1 items-center justify-center">
              <nav className="sb-header-nav-track sb-header-nav-left flex min-w-0 items-center">
                {leftNavigation.map((item) => renderDesktopNavItem(item))}
              </nav>

              <span className="sb-header-logo-spacer" aria-hidden="true" />

              <nav className="sb-header-nav-track sb-header-nav-right flex min-w-0 items-center">
                {rightNavigation.map((item) => renderDesktopNavItem(item))}
              </nav>
            </div>

            <Link
              href="/"
              className="sb-header-logo-slot sb-header-logo-link pointer-events-auto absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 shrink-0"
              aria-label="Ir a Home"
            >
              <HeaderLogoImage />
            </Link>

            <div className="sb-header-actions ml-auto flex shrink-0 items-center">
              <div ref={profileMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((value) => !value)}
                  aria-expanded={profileMenuOpen}
                  aria-haspopup="menu"
                  aria-controls={profileMenuId}
                  className={`${headerIconLargeClass} sb-header-profile-icon-btn`}
                  aria-label={
                    currentUser ? `Abrir menu de perfil de ${currentUser.firstName}` : "Abrir menu de perfil"
                  }
                >
                  <UserIcon />
                </button>
                <div
                  id={profileMenuId}
                  role="menu"
                  className={`win-window sb-header-profile-menu absolute right-0 mt-2 w-56 overflow-hidden p-0 ${
                    profileMenuOpen ? "block" : "hidden"
                  }`}
                >
                  <div className="sb-header-profile-menu-titlebar px-3 py-1.5">
                    Perfil
                  </div>
                  <div className="sb-header-profile-menu-body p-2">
                    {currentUser ? (
                      <>
                        <p className="sb-header-profile-menu-greeting px-3 py-2 text-sm">
                          Hola {currentUser.firstName}
                        </p>
                        <Link
                          href="/account"
                          role="menuitem"
                          className={`${profileMenuItemClass} mt-1`}
                        >
                          Cuenta
                        </Link>
                        <form action={logoutAction} className="mt-1">
                          <button
                            type="submit"
                            role="menuitem"
                            className={`${profileMenuItemClass} w-full text-left`}
                          >
                            Cerrar sesion
                          </button>
                        </form>
                      </>
                    ) : (
                      <div className="space-y-1">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setProfileMenuOpen(false);
                            openAuthModal("login");
                          }}
                          className={`${profileMenuItemClass} w-full text-left`}
                        >
                          Login
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setProfileMenuOpen(false);
                            openAuthModal("register");
                          }}
                          className={`${profileMenuItemClass} w-full text-left`}
                        >
                          Registro
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCartDrawerOpen(true)}
                className={`${headerIconLargeClass} sb-header-cart-icon-btn relative`}
                aria-label={`Abrir carrito con ${visibleCartCount} items`}
              >
                <CartIcon />
                {visibleCartCount > 0 ? (
                  <span className="sb-header-cart-badge" aria-hidden="true">
                    {visibleCartCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>
        </div>

        <AuthModalPanel
          open={authModalOpen}
          mode={authMode}
          redirectTo={authRedirectTo}
          onModeChange={setAuthMode}
          onClose={() => {
            setAuthModalOpen(false);
            setAuthRedirectTo(undefined);
          }}
        />
      </header>

      <CartDrawer
        open={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        currentUserFirstName={currentUser?.firstName}
        cart={visibleCart}
      />
    </>
  );
}
