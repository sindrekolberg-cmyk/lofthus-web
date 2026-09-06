import { NextRequest, NextResponse } from "next/server";

/** Contract for a future FastAPI /api/push/subscribe endpoint.
 *  This route records the payload shape only — it does not send notifications. */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Ugyldig JSON" }, { status: 400 });
  }
  const payload = body as {
    subscription?: { endpoint?: string };
    prefs?: Record<string, boolean>;
    entry_id?: number | null;
  };
  if (!payload.subscription?.endpoint) {
    return NextResponse.json({ ok: false, error: "Mangler subscription" }, { status: 400 });
  }
  return NextResponse.json({
    ok: true,
    stored: false,
    message: "Varsler er ikke slått på ennå. Abonnementet er ikke lagret.",
  });
}
