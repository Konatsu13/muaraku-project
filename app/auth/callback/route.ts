import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/app";

  // Prevent open redirects: validate that 'next' is a relative path
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/app";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(safeNext, requestUrl.origin));
    }
    console.error("Auth callback error:", error.message);
  }

  // Return to home page with login error notice
  return NextResponse.redirect(
    new URL(`/?auth=login&error=auth_callback_failed`, requestUrl.origin)
  );
}
