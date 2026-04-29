import Image from "next/image";
import type { ReactNode } from "react";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export default function PageHero({
  title,
  eyebrow,
  description,
  actions,
}: PageHeroProps) {
  return (
    <section className="-mt-6 lg:-mt-10">
      <div
        className="relative block w-screen overflow-hidden"
        style={{ marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)" }}
      >
        <Image
          src="https://ik.imagekit.io/gq1enkszp/fotos/proximos.png?tr=w-2400,h-690,cm-extract,fo-top&updatedAt=1777405652441"
          alt={`Hero ${title}`}
          width={2400}
          height={760}
          priority
          sizes="100vw"
          className="block h-auto w-full"
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
    </section>
  );
}
