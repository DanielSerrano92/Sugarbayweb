import Image from "next/image";
import type { ReactNode } from "react";

type PageShellProps = {
  title: string;
  eyebrow?: string;
  description?: string;
  actions?: ReactNode;
  headerImageSrc?: string;
  children: ReactNode;
  contentClassName?: string;
  sectionClassName?: string;
};

const DEFAULT_CONTENT_CLASS_NAME = "space-y-6";
const PAGE_HEADER_IMAGE_SRC =
  "https://ik.imagekit.io/gq1enkszp/fotos/proximos.png?tr=w-2400,h-760,cm-extract,fo-top&updatedAt=1777405652441";

export default function PageShell({
  title,
  eyebrow,
  description,
  actions,
  headerImageSrc,
  children,
  contentClassName,
  sectionClassName,
}: PageShellProps) {
  const sectionClasses = [
    "page-background",
    "relative",
    "flex-1",
    "w-screen",
    sectionClassName,
  ]
    .filter(Boolean)
    .join(" ");

  const contentClasses = [
    "page-content-wrapper",
    contentClassName ?? DEFAULT_CONTENT_CLASS_NAME,
  ].join(" ");

  return (
    <section
      className={sectionClasses}
      style={{
        marginLeft: "calc(50% - 50vw)",
        marginRight: "calc(50% - 50vw)",
      }}
    >
      <div className="page-header-image">
        <Image
          src={headerImageSrc ?? PAGE_HEADER_IMAGE_SRC}
          alt={`Cabecera ${title}`}
          width={2400}
          height={760}
          priority
          sizes="100vw"
          unoptimized
          className="page-header-img"
        />
      </div>
      <h1 className="sr-only">{title}</h1>
      {eyebrow || description || actions ? (
        <div className="sr-only">
          {eyebrow ? <p>{eyebrow}</p> : null}
          {description ? <p>{description}</p> : null}
          {actions ? <div>{actions}</div> : null}
        </div>
      ) : null}
      <div className={contentClasses}>{children}</div>
    </section>
  );
}
