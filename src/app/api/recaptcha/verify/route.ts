import { NextResponse } from "next/server";

export const runtime = "nodejs";

type GoogleVerifyResponse = {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
};

function getSecret() {
  return (process.env.RECAPTCHA_SECRET_KEY ?? "").trim();
}

/**
 * POST /api/recaptcha/verify
 * Body: { token: string }
 */
export async function POST(req: Request) {
  const secret = getSecret();
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "reCAPTCHA is not configured on the server." },
      { status: 503 },
    );
  }

  let token = "";
  try {
    const body = (await req.json()) as { token?: string };
    token = String(body?.token ?? "").trim();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  if (!token) {
    return NextResponse.json(
      { ok: false, error: "Complete the reCAPTCHA challenge." },
      { status: 400 },
    );
  }

  const params = new URLSearchParams();
  params.set("secret", secret);
  params.set("response", token);
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim();
  if (ip) params.set("remoteip", ip);

  let data: GoogleVerifyResponse;
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    data = (await res.json()) as GoogleVerifyResponse;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not verify reCAPTCHA. Try again." },
      { status: 502 },
    );
  }

  if (!data.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "reCAPTCHA failed. Please try again.",
        codes: data["error-codes"] ?? [],
      },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
