import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const next = requestUrl.searchParams.get("next") || "/app";

  // Prevent open redirects: validate that 'next' is a relative path
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/app";

  // 1. Handle OAuth provider errors or user cancellations
  if (error || errorDescription) {
    console.warn("OAuth provider callback returned error:", {
      error,
      errorDescription,
    });
    const message = encodeURIComponent(
      errorDescription || "Login dengan penyedia pihak ketiga dibatalkan atau gagal."
    );
    return NextResponse.redirect(
      new URL(`/?auth=login&error=${message}`, requestUrl.origin)
    );
  }

  // 2. Exchange authorization code for authenticated session
  if (code) {
    const supabase = await createClient();
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError || !data.session) {
      console.error(
        "Supabase auth exchangeCodeForSession failed:",
        exchangeError?.message || "No session returned"
      );
      const message = encodeURIComponent(
        exchangeError?.message || "Gagal mengonfirmasi sesi autentikasi."
      );
      return NextResponse.redirect(
        new URL(`/?auth=login&error=${message}`, requestUrl.origin)
      );
    }

    // Auto-provision admin role for fathan.pageraji@gmail.com if this is their login
    const userEmail = data.session.user.email?.toLowerCase().trim();
    if (userEmail === "fathan.pageraji@gmail.com") {
      try {
        const origin = requestUrl.origin;
        // Trigger server-side provisioner
        await fetch(`${origin}/api/auth/provision-admin`, {
          method: "POST",
          headers: {
            cookie: request.headers.get("cookie") || "",
          },
        });
      } catch (err) {
        console.warn("Auto-provision admin fetch error in callback:", err);
      }
    }

    // Confirmed session: redirect to target protected page
    return NextResponse.redirect(new URL(safeNext, requestUrl.origin));
  }

  // 3. Neither code nor error: invalid direct hit
  return NextResponse.redirect(
    new URL(`/?auth=login&error=invalid_callback`, requestUrl.origin)
  );
}
