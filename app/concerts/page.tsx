import { redirect } from "next/navigation";

export default function ConcertsRootPage() {
  redirect("/concerts/upcoming");
}
