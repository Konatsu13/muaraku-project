import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Public approved reports feed (landing page).
 *
 * The `reports` table is not readable by anonymous roles (RLS: reports_read_
 * approved_own_or_staff is `to authenticated`), so the landing page fetches
 * this endpoint instead. The route reads with the server-only admin client
 * and returns ONLY approved rows and public-safe columns — no private
 * details, no media paths, no reporter identity.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Feed laporan belum tersedia. Silakan coba lagi nanti." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const { data, error } = await admin
    .from("reports")
    .select(
      `
      id,
      report_type,
      title,
      city,
      location_label,
      occurred_at,
      created_at,
      category:report_categories ( name_id, name_en )
    `
    )
    .eq("moderation_status", "approved")
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    console.error("Public reports feed query failed:", error);
    return NextResponse.json(
      { error: "Feed laporan gagal dimuat. Silakan coba lagi." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }

  const rows = (data || []).map((r) => {
    const cat = Array.isArray(r.category) ? r.category[0] : r.category;
    return {
      id: r.id,
      report_type: r.report_type,
      title: r.title,
      city: r.city,
      location_label: r.location_label,
      occurred_at: r.occurred_at,
      created_at: r.created_at,
      category_name_id: cat?.name_id ?? null,
      category_name_en: cat?.name_en ?? null,
    };
  });

  return NextResponse.json(
    { data: rows },
    { headers: { "Cache-Control": "no-store" } }
  );
}
