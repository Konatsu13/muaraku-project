import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl, sanitizeNextPath } from "@/lib/config/site";

function buildRedirect(path: string, requestUrl: URL): URL {
  const base = getSiteUrl() || requestUrl.origin;
  return new URL(path, base);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  // Prevent open redirects: only internal paths under known app routes.
  const safeNext = sanitizeNextPath(requestUrl.searchParams.get("next"));

  // 1. Handle OAuth provider errors or user cancellations
  if (error || errorDescription) {
    console.warn("OAuth provider callback returned error:", {
      error,
      errorDescription,
    });
    const message = encodeURIComponent(
      errorDescription || "Login dengan penyedia pihak ketiga dibatalkan atau gagal."
    );
    return NextResponse.redirect(buildRedirect(`/?auth=login&error=${message}`, requestUrl));
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
      return NextResponse.redirect(buildRedirect(`/?auth=login&error=${message}`, requestUrl));
    }

    // Confirmed session: redirect to the validated internal target.
    return NextResponse.redirect(buildRedirect(safeNext, requestUrl));
  }

  // 3. Neither code nor error: invalid direct hit
  return NextResponse.redirect(
    buildRedirect("/?auth=login&error=invalid_callback", requestUrl)
  );
}
