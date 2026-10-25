import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

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

  // Protect /app routes - requires logged-in user
  if (pathname.startsWith("/app")) {
    if (!user) {
      const returnUrl = encodeURIComponent(pathname + request.nextUrl.search);
      const redirectUrl = new URL(`/?auth=login&next=${returnUrl}`, request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Protect /admin routes - requires logged-in user with staff role
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const returnUrl = encodeURIComponent(pathname + request.nextUrl.search);
      const redirectUrl = new URL(`/?auth=login&next=${returnUrl}`, request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Server-side check for staff authorization in staff_roles
    const { data: staffData } = await supabase
      .from("staff_roles")
      .select("role")
      .eq("user_id", user.id);

    const roles = (staffData || []).map((r: { role: string }) => r.role);
    const isSupportRoute =
      pathname === "/admin/support" || pathname.startsWith("/admin/support/");
    const hasAdminAccess = isSupportRoute
      ? roles.includes("admin") || roles.includes("support")
      : roles.includes("admin") || roles.includes("moderator");

    if (!hasAdminAccess) {
      return NextResponse.redirect(new URL("/app?error=unauthorized_admin", request.url));
    }

    if (pathname === "/admin" && roles.includes("support") && !roles.includes("admin")) {
      return NextResponse.redirect(new URL("/admin/support", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};
