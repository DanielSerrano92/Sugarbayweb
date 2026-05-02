import Image from "next/image";
import Link from "next/link";

type ConcertsNavigationLinkProps = {
  href: string;
  label: string;
};

const NAV_ICON_SRC = "https://ik.imagekit.io/gq1enkszp/fotos/nav.png?tr=w-192,h-192";

export default function ConcertsNavigationLink({
  href,
  label,
}: ConcertsNavigationLinkProps) {
  return (
    <div className="mt-12 flex justify-center">
      <Link
        href={href}
        className="group inline-flex flex-col items-center rounded-2xl bg-white/5 px-5 py-4 text-center text-white transition duration-200 ease-out hover:bg-[rgba(255,0,180,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pink-300"
      >
        <Image
          src={NAV_ICON_SRC}
          alt=""
          width={192}
          height={192}
          className="h-28 w-28 object-contain transition duration-200 ease-out group-hover:scale-[1.08] sm:h-36 sm:w-36"
          sizes="(min-width: 640px) 144px, 112px"
        />
        <span className="mt-2 font-retro-pixel text-sm font-black text-white drop-shadow-[0_2px_6px_rgba(255,0,180,0.7)] transition duration-200 ease-out group-hover:scale-[1.08]">
          {label}
        </span>
      </Link>
    </div>
  );
}
