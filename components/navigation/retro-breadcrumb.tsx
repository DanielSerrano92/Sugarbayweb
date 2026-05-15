import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
  active?: boolean;
};

type RetroBreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string;
  ariaLabel?: string;
};

export default function RetroBreadcrumb({
  items,
  className,
  ariaLabel = "Ruta de navegacion",
}: RetroBreadcrumbProps) {
  if (items.length === 0) return null;

  const lastIndex = items.length - 1;

  return (
    <nav
      aria-label={ariaLabel}
      className={["retro-breadcrumb-shell", className].filter(Boolean).join(" ")}
    >
      <ol className="retro-breadcrumb-list">
        {items.map((item, index) => {
          const isActive = item.active || index === lastIndex;
          const key = `${item.label}-${index}`;

          return (
            <li key={key} className="retro-breadcrumb-item">
              {!isActive && item.href ? (
                <Link href={item.href} className="retro-breadcrumb-link">
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isActive ? "retro-breadcrumb-current" : "retro-breadcrumb-text"}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
              {index < lastIndex ? (
                <span className="retro-breadcrumb-separator" aria-hidden="true">
                  {">"}
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
