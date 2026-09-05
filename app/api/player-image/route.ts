import { NextRequest, NextResponse } from "next/server";

const ALLOWED = new Set([
  "resources.premierleague.com",
  "fantasy.premierleague.com",
]);

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("u") || "";
  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json({ error: "Ugyldig bilde-URL" }, { status: 400 });
  }
  if (!ALLOWED.has(target.hostname) || target.protocol !== "https:") {
    return NextResponse.json({ error: "Kilden er ikke tillatt" }, { status: 400 });
  }
  const res = await fetch(target.toString(), {
    headers: { Accept: "image/*" },
    next: { revalidate: 86400 },
  });
  if (!res.ok) {
    return NextResponse.json({ error: "Bildet kunne ikke hentes" }, { status: 502 });
  }
  const buf = await res.arrayBuffer();
  const type = res.headers.get("content-type") || "image/jpeg";
  return new NextResponse(buf, {
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
