import type { ReactNode } from "react";

type PageShellProps = {
  hero: ReactNode;
  children: ReactNode;
  contentClassName?: string;
  sectionClassName?: string;
};

const DEFAULT_CONTENT_CLASS_NAME = "space-y-6";

export default function PageShell({
  hero,
  children,
  contentClassName,
  sectionClassName,
}: PageShellProps) {
  const sectionClasses = [
    "sb-home-content-background",
    "relative",
    "flex-1",
    "w-screen",
    sectionClassName,
  ]
    .filter(Boolean)
    .join(" ");

  const contentClasses = [
    "relative",
    "z-10",
    "mx-auto",
    "w-full",
    "max-w-7xl",
    "px-4",
    "py-6",
    "lg:px-8",
    "lg:py-8",
    contentClassName ?? DEFAULT_CONTENT_CLASS_NAME,
  ].join(" ");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      {hero}
      <section
        className={sectionClasses}
        style={{
          marginLeft: "calc(50% - 50vw)",
          marginRight: "calc(50% - 50vw)",
        }}
      >
        <div className={contentClasses}>{children}</div>
      </section>
    </div>
  );
}
