"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import AuthModalPanel, { type AuthMode } from "@/components/auth/auth-modal-panel";
import CartDrawer from "@/components/cart/cart-drawer";
import GlobalSearch from "@/components/layout/global-search";
import { logoutAction } from "@/lib/auth/actions";
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

function isCurrentPath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

const desktopNavItemClass =
  "sb-header-tab focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40";

const headerMenuItemHoverClass = "hover:!border-[#8a5dff] hover:!bg-[#7f52ff] hover:!text-white";
const headerIconLargeClass =
  "inline-grid h-auto w-auto place-items-center border-0 bg-transparent p-0 text-black shadow-none hover:bg-transparent hover:text-black focus-visible:outline-none focus-visible:ring-0 [&>svg]:h-10 [&>svg]:w-10";

const LEFT_NAVIGATION_HREFS = ["/concerts", "/band/news", "/musica"];
const RIGHT_NAVIGATION_HREFS = ["/media", "/fanclub", "/store"];

function sortNavigationByOrder(items: NavItem[], order: string[]): NavItem[] {
  return [...items].sort((left, right) => order.indexOf(left.href) - order.indexOf(right.href));
}

function normalizeHrefPath(href: string): string {
  return href.split("?")[0] ?? href;
}

export default function HeaderClient({
  cartCount,
  cart,
  currentUser,
}: HeaderClientProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileProfileMenuOpen, setMobileProfileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
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

  function openAuthModal(mode: AuthMode) {
    setAuthMode(mode);
    setAuthModalOpen(true);
  }

  function renderDesktopNavItem(item: NavItem) {
    const active = isCurrentPath(pathname, item.href);
    const isBandTab = item.href === "/band/news";

    if (!item.children?.length) {
      return (
        <Link
          key={item.href}
          href={item.href}
          className={`${desktopNavItemClass} ${active ? "sb-header-tab-active" : ""} ${
            isBandTab ? "sb-header-tab-band" : ""
          }`}
        >
          {item.label}
        </Link>
      );
    }

    return (
      <div key={item.href} className="group relative">
        <Link
          href={item.href}
          className={`${desktopNavItemClass} ${active ? "sb-header-tab-active" : ""} ${
            isBandTab ? "sb-header-tab-band" : ""
          }`}
        >
          {item.label}
        </Link>
        <div
          className="sb-header-dropdown pointer-events-none invisible absolute left-1/2 top-full z-40 mt-1 min-w-full w-max -translate-x-1/2 rounded-none p-1 opacity-0 transition group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100"
        >
          {item.children.map((child) => {
            const childPath = normalizeHrefPath(child.href);
            const isChildActive = isCurrentPath(pathname, childPath);

            return (
            <Link
              key={child.href}
              href={child.href}
              className={`sb-header-dropdown-item block px-2 py-1.5 text-sm ${
                isChildActive ? "sb-header-dropdown-item-active" : ""
              }`}
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
      <header className="z-40 w-full">
        <div className="sb-header-shell w-full overflow-visible rounded-none border-x-0 border-t-0">
          <div className="sb-header-row flex items-center gap-3 px-3 py-2 lg:px-4">
            <Link
              href="/"
              className="sb-header-brand-mobile shrink-0 lg:hidden"
            >
              Sugarbay
            </Link>

            <GlobalSearch
              className="sb-header-search-pixel inline-grid h-auto w-auto place-items-center border-0 bg-transparent p-0 text-black shadow-none hover:bg-transparent hover:text-black focus-visible:outline-none focus-visible:ring-0 [&>span]:hidden [&>svg]:h-10 [&>svg]:w-10"
            />

            <div className="hidden flex-1 items-center justify-center gap-3 lg:flex">
              <nav className="sb-header-nav-track flex items-start gap-2">
                {leftNavigation.map((item) => renderDesktopNavItem(item))}
              </nav>

              <Link
                href="/"
                className="sb-header-brand mx-1 shrink-0"
                aria-label="Ir al inicio Sugarbay"
              >
                <span className="sb-header-brand-label">
                  Sugar
                  <br />
                  Bay
                </span>
              </Link>

              <nav className="sb-header-nav-track flex items-start gap-2">
                {rightNavigation.map((item) => renderDesktopNavItem(item))}
              </nav>
            </div>

            <div className="flex items-center gap-2 lg:gap-1.5">
              <div className="hidden items-center gap-1.5 lg:flex">
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
                    className={`sb-window absolute right-0 mt-2 w-56 rounded-xl p-2 ${
                      profileMenuOpen ? "block" : "hidden"
                    }`}
                  >
                    {currentUser ? (
                      <>
                        <p className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-900">
                          Hola {currentUser.firstName}
                        </p>
                        <Link
                          href="/account"
                          role="menuitem"
                          className={`mt-1 block rounded-lg px-3 py-2 text-sm text-zinc-700 ${headerMenuItemHoverClass}`}
                        >
                          Cuenta
                        </Link>
                        <form action={logoutAction} className="mt-1">
                          <button
                            type="submit"
                            role="menuitem"
                            className={`block w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-700 ${headerMenuItemHoverClass}`}
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
                          className={`block w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-700 ${headerMenuItemHoverClass}`}
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
                          className={`block w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-700 ${headerMenuItemHoverClass}`}
                        >
                          Registro
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCartDrawerOpen(true)}
                  className={`${headerIconLargeClass} sb-header-cart-icon-btn relative`}
                  aria-label={`Abrir carrito con ${cartCount} items`}
                >
                  <CartIcon />
                  {cartCount > 0 ? (
                    <span className="sb-header-cart-badge" aria-hidden="true">
                      {cartCount}
                    </span>
                  ) : null}
                </button>
              </div>

              <div className="flex items-center gap-2 lg:hidden">
                <button
                  type="button"
                  onClick={() => setCartDrawerOpen(true)}
                  className={`${headerIconLargeClass} sb-header-cart-icon-btn relative`}
                  aria-label={`Abrir carrito con ${cartCount} items`}
                >
                  <CartIcon />
                  {cartCount > 0 ? (
                    <span className="sb-header-cart-badge" aria-hidden="true">
                      {cartCount}
                    </span>
                  ) : null}
                </button>
                <button
                  type="button"
                  className="sb-header-menu-btn px-3 py-2 text-sm font-semibold"
                  onClick={() => {
                    setMobileOpen((value) => !value);
                    setMobileProfileMenuOpen(false);
                  }}
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-navigation"
                >
                  Menu
                </button>
              </div>
            </div>
          </div>

          <div
            id="mobile-navigation"
            className={`border-t border-black/20 px-3 py-3 lg:hidden ${
              mobileOpen ? "block" : "hidden"
            }`}
          >
            <div className="space-y-2">
              {headerNavigation.map((item) => (
                <div key={item.href} className="sb-header-mobile-item rounded-lg p-2">
                  <Link
                    href={item.href}
                    className={`block rounded-lg px-2 py-2 text-sm font-semibold text-zinc-900 ${headerMenuItemHoverClass}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                  {item.children?.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`block rounded-lg px-2 py-2 text-sm text-zinc-700 ${headerMenuItemHoverClass}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setCartDrawerOpen(true);
                }}
                className="sb-header-menu-btn inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-900"
              >
                <CartIcon />
                <span>Carrito ({cartCount})</span>
              </button>
              {currentUser ? (
                <>
                  <p className="sb-panel-soft w-full rounded-lg px-3 py-2 text-sm text-zinc-700">
                    Hola {currentUser.firstName}
                  </p>
                  <Link
                    href="/account"
                    className="sb-header-menu-btn px-3 py-2 text-sm font-semibold"
                    onClick={() => setMobileOpen(false)}
                  >
                    Cuenta
                  </Link>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="sb-header-menu-btn px-3 py-2 text-sm font-medium text-zinc-900"
                    >
                      Cerrar sesion
                    </button>
                  </form>
                </>
              ) : (
                <div className="w-full">
                  <button
                    type="button"
                    onClick={() => setMobileProfileMenuOpen((value) => !value)}
                    className="sb-header-menu-btn w-full px-3 py-2 text-sm font-semibold"
                  >
                    Perfil
                  </button>
                  {mobileProfileMenuOpen ? (
                    <div className="sb-panel-soft mt-2 space-y-1 rounded-lg p-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileProfileMenuOpen(false);
                          setMobileOpen(false);
                          openAuthModal("login");
                        }}
                        className={`block w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-700 ${headerMenuItemHoverClass}`}
                      >
                        Login
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileProfileMenuOpen(false);
                          setMobileOpen(false);
                          openAuthModal("register");
                        }}
                        className={`block w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-700 ${headerMenuItemHoverClass}`}
                      >
                        Registro
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>

        <AuthModalPanel
          open={authModalOpen}
          mode={authMode}
          onModeChange={setAuthMode}
          onClose={() => setAuthModalOpen(false)}
        />
      </header>

      <CartDrawer
        open={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        currentUserFirstName={currentUser?.firstName}
        cart={cart}
      />
    </>
  );
}
