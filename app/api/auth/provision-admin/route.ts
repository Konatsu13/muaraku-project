import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Sesi tidak ditemukan atau belum login." },
        { status: 401 }
      );
    }

    const adminEmail = "fathan.pageraji@gmail.com";
    const userEmail = user.email?.toLowerCase().trim();

    // Check if the current user is fathan.pageraji@gmail.com
    if (userEmail !== adminEmail.toLowerCase()) {
      return NextResponse.json(
        { message: "Pengguna bukan fathan.pageraji@gmail.com, lewati auto-admin." },
        { status: 200 }
      );
    }

    const serviceKey = process.env.SUPABASE_SECRET_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceKey || !supabaseUrl) {
      return NextResponse.json(
        { error: "SUPABASE_SECRET_KEY tidak tersedia di server." },
        { status: 500 }
      );
    }

    const adminSupabase = createAdminClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    let assignedTable = "";

    // 1. Try staff_roles (from official muaraku_supabase_schema(2).sql)
    const { error: staffError } = await adminSupabase
      .from("staff_roles")
      .upsert(
        {
          user_id: user.id,
          role: "admin",
        },
        { onConflict: "user_id,role" }
      );

    if (!staffError) {
      assignedTable = "staff_roles";
    }

    // 2. Also try user_roles (compatibility with existing database tables)
    const { error: roleError } = await adminSupabase
      .from("user_roles")
      .upsert(
        {
          user_id: user.id,
          role: "admin",
        },
        { onConflict: "user_id,role" }
      );

    if (!roleError) {
      assignedTable = assignedTable ? `${assignedTable} & user_roles` : "user_roles";
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil menetapkan status admin untuk ${adminEmail} pada tabel: ${assignedTable}`,
      userId: user.id,
      email: adminEmail,
      assignedTable,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
