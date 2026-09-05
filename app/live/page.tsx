import { redirect } from "next/navigation";

export default function LiveRedirect() {
  redirect("/liga?view=live");
}
