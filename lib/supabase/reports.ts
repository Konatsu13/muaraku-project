import { createClient } from "./client";
import { ReportItem } from "@/components/reports/ReportCard";

export interface CreateReportInput {
  report_type: "lost" | "found";
  title: string;
  description: string;
  category_id?: string | null;
  location_label?: string | null;
  city?: string | null;
  occurred_at?: string | null;
  color?: string | null;
  brand?: string | null;
  private_description?: string | null;
  owner_only_clues?: string | null;
  image_urls?: string[];
}

export interface FetchReportsFilter {
  type?: "lost" | "found" | "all";
  category_slug?: string;
  reporter_user_id?: string;
  search_query?: string;
}

export async function fetchReports(filters?: FetchReportsFilter): Promise<{
  data: ReportItem[];
  error: Error | null;
}> {
  const supabase = createClient();

  try {
    let query = supabase
      .from("reports")
      .select(`
        id,
        report_type,
        title,
        description,
        location_label,
        city,
        occurred_at,
        case_status,
        moderation_status,
        created_at,
        reporter_user_id,
        category_id,
        user_profiles:reporter_user_id (
          display_name,
          avatar_path
        ),
        report_categories:category_id (
          name_id,
          name_en,
          slug
        ),
        report_media (
          object_path
        )
      `)
      .order("created_at", { ascending: false });

    // In production, only show approved or user's own reports
    // RLS handles visibility, but we can also filter for case_status
    if (filters?.type && filters.type !== "all") {
      query = query.eq("report_type", filters.type);
    }

    if (filters?.reporter_user_id) {
      query = query.eq("reporter_user_id", filters.reporter_user_id);
    }

    if (filters?.search_query && filters.search_query.trim().length > 0) {
      query = query.ilike("title", `%${filters.search_query.trim()}%`);
    }

    const { data, error } = await query;

    if (error) {
      return { data: [], error: new Error(error.message) };
    }

    if (!data || data.length === 0) {
      return { data: [], error: null };
    }

    const mapped: ReportItem[] = (data as Array<Record<string, unknown>>).map((r) => {
      // Map case_status to ReportItem status
      let itemStatus: "active" | "claimed" | "returned" | "closed" = "active";
      if (r.case_status === "claim_in_progress") itemStatus = "claimed";
      else if (r.case_status === "returned") itemStatus = "returned";
      else if (r.case_status === "closed") itemStatus = "closed";

      // Relative or formatted date
      const dateRaw = (r.occurred_at || r.created_at || new Date().toISOString()) as string;
      const dateObj = new Date(dateRaw);
      const formattedDate = dateObj.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      // Media URL
      let imageUrl: string | null = null;
      const mediaList = r.report_media as Array<{ object_path?: string }> | null;
      if (Array.isArray(mediaList) && mediaList.length > 0 && mediaList[0].object_path) {
        const path = mediaList[0].object_path;
        if (path.startsWith("http://") || path.startsWith("https://")) {
          imageUrl = path;
        } else {
          const { data: publicUrlData } = supabase.storage
            .from("report-images")
            .getPublicUrl(path);
          imageUrl = publicUrlData.publicUrl;
        }
      }

      const rawProf = r.user_profiles;
      const profileData = (Array.isArray(rawProf) ? rawProf[0] : rawProf) as { display_name?: string; avatar_path?: string } | null;
      const rawCat = r.report_categories;
      const categoryData = (Array.isArray(rawCat) ? rawCat[0] : rawCat) as { name_id?: string; name_en?: string } | null;

      const locationLabel = (typeof r.location_label === "string" ? r.location_label : "") ||
        (typeof r.city === "string" ? r.city : "") ||
        "Indonesia";

      return {
        id: String(r.id),
        type: (r.report_type === "found" ? "found" : "lost") as "lost" | "found",
        title: String(r.title || ""),
        description: String(r.description || ""),
        category: categoryData?.name_id || "Lainnya",
        location_name: locationLabel,
        incident_date: formattedDate,
        status: itemStatus,
        image_url: imageUrl,
        author_name: profileData?.display_name || "Warga MuaraKu",
        author_avatar: profileData?.avatar_path || null,
        is_verified_staff: false,
      };
    });

    return { data: mapped, error: null };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Gagal mengambil data laporan");
    return { data: [], error };
  }
}
