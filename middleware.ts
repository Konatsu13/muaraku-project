import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { resolveRequestOrigin } from "@/lib/config/site";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zpoznosjgdcngnptdohl.supabase.co";
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_EMKZv55CbZZrUN3SXDgOXg_6i0ui71K";

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const baseOrigin = resolveRequestOrigin(request);

  // Protect /app routes - requires logged-in user
  if (pathname.startsWith("/app") && !user) {
    const returnUrl = encodeURIComponent(pathname + request.nextUrl.search);
    const redirectUrl = new URL(`/?auth=login&next=${returnUrl}`, baseOrigin);
    return NextResponse.redirect(redirectUrl);
  }

  // Protect /admin routes - requires logged-in user
  if (pathname.startsWith("/admin") && !user) {
    const returnUrl = encodeURIComponent(pathname + request.nextUrl.search);
    const redirectUrl = new URL(`/?auth=login&next=${returnUrl}`, baseOrigin);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};
