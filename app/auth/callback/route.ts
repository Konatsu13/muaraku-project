import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { resolveRequestOrigin, sanitizeNextPath, DEFAULT_POST_LOGIN_PATH, PRODUCTION_SITE_URL } from "@/lib/config/site";

export async function GET(request: NextRequest) {
  let baseOrigin = PRODUCTION_SITE_URL;
  try {
    baseOrigin = resolveRequestOrigin(request);
  } catch (err) {
    console.warn("Failed to resolve request origin, falling back to default:", err);
  }

  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const error = requestUrl.searchParams.get("error");
    const errorDescription = requestUrl.searchParams.get("error_description");

    // Prevent open redirects: only internal paths under known app routes.
    const safeNext = sanitizeNextPath(requestUrl.searchParams.get("next"), DEFAULT_POST_LOGIN_PATH);

    // 1. Handle OAuth provider errors or user cancellations
    if (error || errorDescription) {
      console.warn("OAuth provider callback returned error:", {
        error,
        errorDescription,
      });
      const message = encodeURIComponent(
        errorDescription || "Login dengan penyedia pihak ketiga dibatalkan atau gagal."
      );
      return NextResponse.redirect(new URL(`/?auth=login&error=${message}`, baseOrigin));
    }

    // 2. Exchange authorization code for authenticated session
    if (code) {
      const supabaseUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zpoznosjgdcngnptdohl.supabase.co";
      const supabaseKey =
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        "sb_publishable_EMKZv55CbZZrUN3SXDgOXg_6i0ui71K";

      // Attach cookies directly to the redirect response so the browser receives them immediately
      const targetUrl = new URL(safeNext, baseOrigin);
      const redirectResponse = NextResponse.redirect(targetUrl);

      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() {
            try {
              return request.cookies.getAll();
            } catch (cookieErr) {
              console.warn("Error reading incoming cookies in callback:", cookieErr);
              return [];
            }
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                redirectResponse.cookies.set(name, value, options);
              } catch (setCookieErr) {
                console.warn(`Error setting cookie "${name}" on redirect response:`, setCookieErr);
              }
            });
          },
        },
      });

      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError || !data.session) {
        console.error(
          "Supabase auth exchangeCodeForSession failed:",
          exchangeError?.message || "No session returned"
        );
        const message = encodeURIComponent(
          exchangeError?.message || "Gagal mengonfirmasi sesi autentikasi."
        );
        return NextResponse.redirect(new URL(`/?auth=login&error=${message}`, baseOrigin));
      }

      // Confirmed session: redirect to the validated internal target carrying cookies
      return redirectResponse;
    }

    // 3. Neither code nor error: invalid direct hit
    return NextResponse.redirect(
      new URL("/?auth=login&error=invalid_callback", baseOrigin)
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Terjadi kesalahan internal server.";
    console.error("Critical uncaught exception in OAuth callback handler:", err);
    return NextResponse.redirect(
      new URL(`/?auth=login&error=${encodeURIComponent(errorMsg)}`, baseOrigin)
    );
  }
}
