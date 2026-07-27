import { redirect } from "next/navigation";

/** Ensures http://localhost:3000 resolves into the default locale app. */
export default function RootPage() {
  redirect("/en");
}
