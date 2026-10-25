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
export const revalidate = 60;

export async function GET() {
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Public feed is not configured (missing SUPABASE_SECRET_KEY)." },
      { status: 500 }
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
      report_categories:category_id ( name_id, name_en )
    `
    )
    .eq("moderation_status", "approved")
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data || []).map((r) => {
    const cat = Array.isArray(r.report_categories)
      ? r.report_categories[0]
      : r.report_categories;
    return {
      id: r.id,
      report_type: r.report_type,
      title: r.title,
      city: r.city,
      location_label: r.location_label,
      occurred_at: r.occurred_at,
      created_at: r.created_at,
      category_name: cat?.name_id ?? cat?.name_en ?? null,
    };
  });

  return NextResponse.json({ data: rows });
}
