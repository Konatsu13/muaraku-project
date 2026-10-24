import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

/**
 * Mark the signed-in user's unread notifications as read.
 *
 * `public.notifications` grants `update (read_at)` to authenticated users but
 * the schema has no UPDATE row-level policy, so a client update is rejected.
 * This trusted server route verifies the session first and only touches rows
 * whose recipient_user_id is the authenticated user. The service role key is
 * never exposed to the browser.
 */
export async function POST() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Sesi tidak ditemukan atau belum login." }, { status: 401 });
    }

    const serviceKey = process.env.SUPABASE_SECRET_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceKey || !supabaseUrl) {
      return NextResponse.json(
        { error: "Konfigurasi server untuk notifikasi belum tersedia." },
        { status: 500 }
      );
    }

    const adminSupabase = createAdminClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await adminSupabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("recipient_user_id", user.id)
      .is("read_at", null)
      .select("id");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ updated: data?.length || 0 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
