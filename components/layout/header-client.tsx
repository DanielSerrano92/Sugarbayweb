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
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="20" r="1.25" />
      <circle cx="18" cy="20" r="1.25" />
      <path d="M3 4h2l2.3 10.2a1 1 0 0 0 1 .8h9.8a1 1 0 0 0 1-.7L21 7H7" />
    </svg>
  );
}

function isCurrentPath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

const navItemClass =
  "rounded-xl border px-3 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none";

const headerActionHoverClass =
  "hover:!border-[#8a5dff] hover:!bg-[#7f52ff] hover:!text-white";

const headerMenuItemHoverClass =
  "hover:!border-[#8a5dff] hover:!bg-[#7f52ff] hover:!text-white";

const LEFT_NAVIGATION_HREFS = ["/concerts", "/band/news", "/musica"];
const RIGHT_NAVIGATION_HREFS = ["/media", "/fanclub", "/store"];

function sortNavigationByOrder(items: NavItem[], order: string[]): NavItem[] {
  return [...items].sort((left, right) => order.indexOf(left.href) - order.indexOf(right.href));
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

    if (!item.children?.length) {
      return (
        <Link
          key={item.href}
          href={item.href}
          className={`${navItemClass} ${
            active
              ? "border-emerald-500 bg-emerald-700 text-white shadow-[0_10px_24px_rgba(58,35,140,0.45)] hover:!border-[#8a5dff] hover:!bg-[#7f52ff] hover:!text-white"
              : "border-zinc-300 bg-zinc-50 text-zinc-800 hover:!border-[#8a5dff] hover:!bg-[#7f52ff] hover:!text-white"
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
          className={`${navItemClass} ${
            active
              ? "border-emerald-500 bg-emerald-700 text-white shadow-[0_10px_24px_rgba(58,35,140,0.45)] hover:!border-[#8a5dff] hover:!bg-[#7f52ff] hover:!text-white"
              : "border-zinc-300 bg-zinc-50 text-zinc-800 hover:!border-[#8a5dff] hover:!bg-[#7f52ff] hover:!text-white"
          }`}
        >
          {item.label}
        </Link>
        <div
          className="sb-window pointer-events-none invisible absolute left-0 top-full mt-2 w-56 rounded-xl p-2 opacity-0 transition group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100"
        >
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={`block rounded-lg border border-transparent px-3 py-2 text-sm text-zinc-700 transition ${headerMenuItemHoverClass}`}
            >
              {child.label}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="z-40 w-full">
        <div className="sb-window w-full overflow-visible rounded-none border-x-0 border-t-0 bg-[linear-gradient(90deg,#6f4ad6_0%,#3ca7ff_57%,#ff8d4b_100%)]">
          <div className="flex items-center gap-3 px-4 py-3 lg:px-5">
            <Link
              href="/"
              className="shrink-0 text-lg font-black uppercase tracking-[0.24em] text-white lg:hidden"
            >
              Sugarbay
            </Link>

            <div className="hidden flex-1 items-center justify-center gap-2 lg:flex">
              <nav className="flex items-center gap-2">
                {leftNavigation.map((item) => renderDesktopNavItem(item))}
              </nav>

              <Link
                href="/"
                className="mx-3 shrink-0 text-lg font-black uppercase tracking-[0.24em] text-white xl:text-xl"
              >
                Sugarbay
              </Link>

              <nav className="flex items-center gap-2">
                {rightNavigation.map((item) => renderDesktopNavItem(item))}
              </nav>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <GlobalSearch
                className={`sb-btn-secondary inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-900 ${headerActionHoverClass}`}
              />

              <div className="hidden items-center gap-2 lg:flex">
                <div ref={profileMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileMenuOpen((value) => !value)}
                    aria-expanded={profileMenuOpen}
                    aria-haspopup="menu"
                    aria-controls={profileMenuId}
                    className={`sb-btn-primary px-3 py-2 text-sm font-semibold ${headerActionHoverClass}`}
                  >
                    Perfil
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
                  className={`sb-btn-secondary inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-zinc-900 ${headerActionHoverClass}`}
                  aria-label={`Abrir carrito con ${cartCount} items`}
                >
                  <CartIcon />
                  <span>Carrito ({cartCount})</span>
                </button>
              </div>

              <div className="flex items-center gap-2 lg:hidden">
                <button
                  type="button"
                  onClick={() => setCartDrawerOpen(true)}
                  className={`sb-btn-secondary inline-flex items-center gap-1 px-3 py-2 text-sm font-semibold text-zinc-900 ${headerActionHoverClass}`}
                  aria-label={`Abrir carrito con ${cartCount} items`}
                >
                  <CartIcon />
                  <span>{cartCount}</span>
                </button>
                <button
                  type="button"
                  className={`sb-btn-secondary inline-flex px-3 py-2 text-sm font-semibold text-zinc-900 ${headerActionHoverClass}`}
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
            className={`border-t border-zinc-300 px-4 py-4 lg:hidden ${
              mobileOpen ? "block" : "hidden"
            }`}
          >
            <div className="space-y-2">
              {headerNavigation.map((item) => (
                <div key={item.href} className="sb-panel-soft rounded-xl p-2">
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
                className={`sb-btn-secondary inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-900 ${headerActionHoverClass}`}
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
                    className={`sb-btn-primary px-3 py-2 text-sm font-semibold ${headerActionHoverClass}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    Cuenta
                  </Link>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className={`sb-btn-secondary px-3 py-2 text-sm font-medium text-zinc-900 ${headerActionHoverClass}`}
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
                    className={`sb-btn-primary w-full px-3 py-2 text-sm font-semibold ${headerActionHoverClass}`}
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
