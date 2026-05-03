import IconNavigationLink from "@/components/ui/icon-navigation-link";

type ConcertsNavigationLinkProps = {
  href: string;
  label: string;
};

export default function ConcertsNavigationLink({
  href,
  label,
}: ConcertsNavigationLinkProps) {
  return <IconNavigationLink href={href} label={label} />;
}
