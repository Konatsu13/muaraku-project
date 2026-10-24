import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (!secretKey) {
      // If Turnstile is not configured in this environment, allow with warning
      return NextResponse.json({
        success: true,
        warning: "Turnstile secret key not configured on server",
      });
    }

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token verifikasi Turnstile tidak ditemukan." },
        { status: 400 }
      );
    }

    // Verify token with Cloudflare Turnstile API
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);

    const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("cf-connecting-ip");
    if (clientIp) {
      formData.append("remoteip", clientIp.split(",")[0].trim());
    }

    const verifyRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const verifyData = await verifyRes.json();

    if (!verifyData.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Verifikasi bot gagal atau token telah kadaluarsa.",
          codes: verifyData["error-codes"],
        },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
