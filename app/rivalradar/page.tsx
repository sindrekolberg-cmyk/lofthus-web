import { redirect } from "next/navigation";

export default async function RivalRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const me = typeof sp.me === "string" ? sp.me : "";
  const rival = typeof sp.rival === "string" ? sp.rival : "";
  const qs = new URLSearchParams();
  if (me) qs.set("me", me);
  if (rival) qs.set("rival", rival);
  redirect(`/analyse/rivalradar${qs.toString() ? `?${qs}` : ""}`);
}
