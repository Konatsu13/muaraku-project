import { createClient } from "./client";

export interface ReportCategory {
  id: string;
  name_id: string;
  name_en: string;
  slug: string;
}

export interface ReportMediaItem {
  id: string;
  object_path: string;
  alt_text?: string | null;
  sort_order: number;
  signed_url?: string | null;
}

export interface ReportPrivateDetails {
  report_id: string;
  private_description?: string | null;
  owner_only_clues?: string | null;
  private_location_note?: string | null;
  contact_preference: "in_app" | "email" | "other";
  private_contact?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportDetailItem {
  id: string;
  reporter_user_id: string;
  report_type: "lost" | "found";
  title: string;
  description: string;
  category_id?: string | null;
  category_name?: string | null;
  category_slug?: string | null;
  location_label?: string | null;
  city?: string | null;
  occurred_at?: string | null;
  color?: string | null;
  brand?: string | null;
  model?: string | null;
  item_attributes?: Record<string, unknown>;
  case_status: "open" | "match_pending" | "claim_in_progress" | "returned" | "closed";
  moderation_status: "pending_review" | "approved" | "flagged" | "removed";
  content_version: number;
  closed_at?: string | null;
  returned_at?: string | null;
  created_at: string;
  updated_at: string;
  author_name: string;
  author_avatar?: string | null;
  media: ReportMediaItem[];
  primary_image_url?: string | null;
  private_details?: ReportPrivateDetails | null;
  is_saved?: boolean;
}

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
  model?: string | null;
  private_description?: string | null;
  owner_only_clues?: string | null;
  private_location_note?: string | null;
  contact_preference?: "in_app" | "email" | "other";
  private_contact?: string | null;
}

export interface UpdateReportInput {
  title?: string;
  description?: string;
  category_id?: string | null;
  location_label?: string | null;
  city?: string | null;
  occurred_at?: string | null;
  color?: string | null;
  brand?: string | null;
  model?: string | null;
  case_status?: "open" | "match_pending" | "claim_in_progress" | "returned" | "closed";
}

export interface FetchReportsFilter {
  type?: "lost" | "found" | "all";
  category_id?: string;
  category_slug?: string;
  reporter_user_id?: string;
  report_ids?: string[];
  city?: string;
  location_label?: string;
  search_query?: string;
  start_date?: string;
  end_date?: string;
  case_status?: string;
  page?: number;
  pageSize?: number;
  sort_by?: "latest" | "title" | "occurred_at";
}

export interface ClaimItem {
  id: string;
  found_report_id: string;
  lost_report_id: string;
  claimant_user_id: string;
  claimant_message?: string | null;
  status: "submitted" | "under_review" | "more_info_requested" | "approved" | "rejected" | "withdrawn" | "completed";
  public_response?: string | null;
  created_at: string;
  updated_at: string;
  lost_report?: {
    id: string;
    title: string;
    location_label?: string | null;
  };
  found_report?: {
    id: string;
    title: string;
    location_label?: string | null;
  };
  claimant_profile?: {
    display_name?: string | null;
    avatar_path?: string | null;
  };
  evidence?: Array<{
    id: string;
    storage_path: string;
    note?: string | null;
    signed_url?: string | null;
  }>;
}

// In-memory cache for signed URLs to minimize round-trips
const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

export async function getSignedMediaUrl(path: string, bucket: string = "report-images"): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const cacheKey = `${bucket}:${path}`;
  const now = Date.now();
  const cached = signedUrlCache.get(cacheKey);
  if (cached && cached.expiresAt > now + 60000) {
    return cached.url;
  }

  const supabase = createClient();
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) {
    return null;
  }

  signedUrlCache.set(cacheKey, {
    url: data.signedUrl,
    expiresAt: now + 3500 * 1000,
  });
  return data.signedUrl;
}

/**
 * Batch resolve signed URLs for multiple storage paths in a single network request
 */
export async function getSignedMediaUrlsBatch(
  paths: string[],
  bucket: string = "report-images"
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (!paths || paths.length === 0) return result;

  const now = Date.now();
  const toFetch: string[] = [];

  for (const path of paths) {
    if (!path) continue;
    if (path.startsWith("http://") || path.startsWith("https://")) {
      result.set(path, path);
      continue;
    }
    const cacheKey = `${bucket}:${path}`;
    const cached = signedUrlCache.get(cacheKey);
    if (cached && cached.expiresAt > now + 60000) {
      result.set(path, cached.url);
    } else {
      toFetch.push(path);
    }
  }

  if (toFetch.length > 0) {
    const supabase = createClient();
    const uniquePaths = Array.from(new Set(toFetch));
    try {
      const { data, error } = await supabase.storage.from(bucket).createSignedUrls(uniquePaths, 3600);
      if (!error && data) {
        for (const item of data) {
          const itemPath = item.path;
          const signed = item.signedUrl || item.signedURL;
          if (itemPath && signed) {
            const cacheKey = `${bucket}:${itemPath}`;
            signedUrlCache.set(cacheKey, {
              url: signed,
              expiresAt: now + 3500 * 1000,
            });
            result.set(itemPath, signed);
          }
        }
      }
    } catch (e) {
      console.warn("Error batch signing media urls:", e);
    }
  }

  return result;
}

// In-memory cache for report categories
let cachedCategories: ReportCategory[] | null = null;

/**
 * Fetch all available categories from `report_categories`
 */
export async function fetchCategories(): Promise<{ data: ReportCategory[]; error: Error | null }> {
  if (cachedCategories && cachedCategories.length > 0) {
    return { data: cachedCategories, error: null };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("report_categories")
    .select("id, name_id, name_en, slug")
    .order("name_id", { ascending: true });

  if (error) {
    return { data: [], error: new Error(error.message) };
  }
  cachedCategories = (data as ReportCategory[]) || [];
  return { data: cachedCategories, error: null };
}

/**
 * Fetch reports with filtering, searching, and pagination.
 */
export async function fetchReports(filters?: FetchReportsFilter): Promise<{
  data: ReportDetailItem[];
  count: number;
  totalPages: number;
  error: Error | null;
}> {
  const supabase = createClient();
  const page = Math.max(1, filters?.page || 1);
  const pageSize = Math.max(1, Math.min(50, filters?.pageSize || 12));
  const offset = (page - 1) * pageSize;

  try {
    let query = supabase
      .from("reports")
      .select(
        `
        id,
        reporter_user_id,
        report_type,
        title,
        description,
        category_id,
        location_label,
        city,
        occurred_at,
        color,
        brand,
        model,
        item_attributes,
        case_status,
        moderation_status,
        content_version,
        closed_at,
        returned_at,
        created_at,
        updated_at,
        user_profiles:reporter_user_id (
          display_name,
          avatar_path
        ),
        report_categories:category_id (
          id,
          name_id,
          name_en,
          slug
        ),
        report_media (
          id,
          object_path,
          alt_text,
          sort_order
        )
      `,
        { count: "exact" }
      );

    // Filter by type
    if (filters?.type && filters.type !== "all") {
      query = query.eq("report_type", filters.type);
    }

    // Filter by reporter (e.g. My Reports tab)
    if (filters?.reporter_user_id) {
      query = query.eq("reporter_user_id", filters.reporter_user_id);
    }

    // Filter by specific report_ids
    if (filters?.report_ids && filters.report_ids.length > 0) {
      query = query.in("id", filters.report_ids);
    }

    // Filter by category_id
    if (filters?.category_id) {
      query = query.eq("category_id", filters.category_id);
    }

    // Filter by city
    if (filters?.city && filters.city.trim().length > 0) {
      query = query.ilike("city", `%${filters.city.trim()}%`);
    }

    // Filter by location_label
    if (filters?.location_label && filters.location_label.trim().length > 0) {
      query = query.ilike("location_label", `%${filters.location_label.trim()}%`);
    }

    // Filter by case_status
    if (filters?.case_status) {
      query = query.eq("case_status", filters.case_status);
    }

    // Date filters
    if (filters?.start_date) {
      query = query.gte("occurred_at", filters.start_date);
    }
    if (filters?.end_date) {
      query = query.lte("occurred_at", filters.end_date);
    }

    // Text search on full-text index columns (title, description, brand, color)
    if (filters?.search_query && filters.search_query.trim().length > 0) {
      const q = filters.search_query.trim();
      query = query.or(
        `title.ilike.%${q}%,description.ilike.%${q}%,brand.ilike.%${q}%,color.ilike.%${q}%`
      );
    }

    // Sorting
    if (filters?.sort_by === "title") {
      query = query.order("title", { ascending: true });
    } else if (filters?.sort_by === "occurred_at") {
      query = query.order("occurred_at", { ascending: false, nullsFirst: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    // Pagination
    query = query.range(offset, offset + pageSize - 1);

    const { data, count, error } = await query;

    if (error) {
      return { data: [], count: 0, totalPages: 0, error: new Error(error.message) };
    }

    if (!data || data.length === 0) {
      return { data: [], count: 0, totalPages: 0, error: null };
    }

    // Check saved reports for the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let savedReportIds = new Set<string>();
    if (user) {
      const reportIds = data.map((d: { id: string }) => d.id);
      const { data: savedData } = await supabase
        .from("saved_reports")
        .select("report_id")
        .eq("user_id", user.id)
        .in("report_id", reportIds);

      if (savedData) {
        savedReportIds = new Set(savedData.map((s: { report_id: string }) => s.report_id));
      }
    }

    // Collect all media object_paths to fetch signed URLs in 1 batch
    const allPaths: string[] = [];
    for (const r of data as Array<Record<string, unknown>>) {
      const mediaList = (r.report_media as Array<{ object_path: string }>) || [];
      for (const m of mediaList) {
        if (m.object_path) allPaths.push(m.object_path);
      }
    }

    const signedUrlMap = await getSignedMediaUrlsBatch(allPaths);

    // Resolve media signed URLs synchronously using batch map
    const items: ReportDetailItem[] = (data as Array<Record<string, unknown>>).map((r) => {
      const rawMedia = (r.report_media as Array<{
        id: string;
        object_path: string;
        alt_text?: string | null;
        sort_order: number;
      }>) || [];

      // Sort media
      const sortedMedia = [...rawMedia].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

      let primaryImageUrl: string | null = null;
      const mediaWithUrls: ReportMediaItem[] = [];

      for (let i = 0; i < sortedMedia.length; i++) {
        const m = sortedMedia[i];
        const signedUrl = signedUrlMap.get(m.object_path) || null;
        mediaWithUrls.push({
          id: m.id,
          object_path: m.object_path,
          alt_text: m.alt_text,
          sort_order: m.sort_order,
          signed_url: signedUrl,
        });
        if (i === 0) {
          primaryImageUrl = signedUrl;
        }
      }

        const rawProf = r.user_profiles;
        const prof = (Array.isArray(rawProf) ? rawProf[0] : rawProf) as {
          display_name?: string;
          avatar_path?: string;
        } | null;

        const rawCat = r.report_categories;
        const cat = (Array.isArray(rawCat) ? rawCat[0] : rawCat) as {
          id: string;
          name_id: string;
          name_en: string;
          slug: string;
        } | null;

        return {
          id: String(r.id),
          reporter_user_id: String(r.reporter_user_id),
          report_type: (r.report_type === "found" ? "found" : "lost") as "lost" | "found",
          title: String(r.title || ""),
          description: String(r.description || ""),
          category_id: r.category_id as string | null,
          category_name: cat?.name_id || null,
          category_slug: cat?.slug || null,
          location_label: (r.location_label as string | null) || null,
          city: (r.city as string | null) || null,
          occurred_at: (r.occurred_at as string | null) || null,
          color: (r.color as string | null) || null,
          brand: (r.brand as string | null) || null,
          model: (r.model as string | null) || null,
          item_attributes: (r.item_attributes as Record<string, unknown>) || {},
          case_status: r.case_status as ReportDetailItem["case_status"],
          moderation_status: r.moderation_status as ReportDetailItem["moderation_status"],
          content_version: Number(r.content_version) || 1,
          closed_at: (r.closed_at as string | null) || null,
          returned_at: (r.returned_at as string | null) || null,
          created_at: String(r.created_at),
          updated_at: String(r.updated_at),
          author_name: prof?.display_name || "Warga MuaraKu",
          author_avatar: prof?.avatar_path || null,
          media: mediaWithUrls,
          primary_image_url: primaryImageUrl,
          is_saved: savedReportIds.has(String(r.id)),
        };
      }
    );

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      data: items,
      count: totalCount,
      totalPages,
      error: null,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Gagal mengambil daftar laporan");
    return { data: [], count: 0, totalPages: 0, error };
  }
}

/**
 * Fetch a single report by ID.
 * If user is the owner, also fetch report_private_details.
 */
export async function fetchReportById(reportId: string): Promise<{
  data: ReportDetailItem | null;
  error: Error | null;
}> {
  const supabase = createClient();

  try {
    const { data: r, error } = await supabase
      .from("reports")
      .select(
        `
        id,
        reporter_user_id,
        report_type,
        title,
        description,
        category_id,
        location_label,
        city,
        occurred_at,
        color,
        brand,
        model,
        item_attributes,
        case_status,
        moderation_status,
        content_version,
        closed_at,
        returned_at,
        created_at,
        updated_at,
        user_profiles:reporter_user_id (
          display_name,
          avatar_path
        ),
        report_categories:category_id (
          id,
          name_id,
          name_en,
          slug
        ),
        report_media (
          id,
          object_path,
          alt_text,
          sort_order
        )
      `
      )
      .eq("id", reportId)
      .maybeSingle();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    if (!r) {
      return { data: null, error: new Error("Laporan tidak ditemukan") };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Check if saved
    let isSaved = false;
    if (user) {
      const { data: savedData } = await supabase
        .from("saved_reports")
        .select("report_id")
        .eq("user_id", user.id)
        .eq("report_id", reportId)
        .maybeSingle();
      if (savedData) isSaved = true;
    }

    // If owner, fetch private details
    let privateDetails: ReportPrivateDetails | null = null;
    if (user && user.id === r.reporter_user_id) {
      const { data: pData } = await supabase
        .from("report_private_details")
        .select("*")
        .eq("report_id", reportId)
        .maybeSingle();

      if (pData) {
        privateDetails = pData as ReportPrivateDetails;
      }
    }

    // Resolve media signed URLs
    const rawMedia = (r.report_media as Array<{
      id: string;
      object_path: string;
      alt_text?: string | null;
      sort_order: number;
    }>) || [];

    const sortedMedia = [...rawMedia].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    const allPaths = sortedMedia.map((m) => m.object_path).filter(Boolean);
    const signedUrlMap = await getSignedMediaUrlsBatch(allPaths);

    let primaryImageUrl: string | null = null;
    const mediaWithUrls: ReportMediaItem[] = [];

    for (let i = 0; i < sortedMedia.length; i++) {
      const m = sortedMedia[i];
      const signedUrl = signedUrlMap.get(m.object_path) || null;
      mediaWithUrls.push({
        id: m.id,
        object_path: m.object_path,
        alt_text: m.alt_text,
        sort_order: m.sort_order,
        signed_url: signedUrl,
      });
      if (i === 0) {
        primaryImageUrl = signedUrl;
      }
    }

    const rawProf = r.user_profiles;
    const prof = (Array.isArray(rawProf) ? rawProf[0] : rawProf) as {
      display_name?: string;
      avatar_path?: string;
    } | null;

    const rawCat = r.report_categories;
    const cat = (Array.isArray(rawCat) ? rawCat[0] : rawCat) as {
      id: string;
      name_id: string;
      name_en: string;
      slug: string;
    } | null;

    const reportDetail: ReportDetailItem = {
      id: String(r.id),
      reporter_user_id: String(r.reporter_user_id),
      report_type: (r.report_type === "found" ? "found" : "lost") as "lost" | "found",
      title: String(r.title || ""),
      description: String(r.description || ""),
      category_id: r.category_id as string | null,
      category_name: cat?.name_id || null,
      category_slug: cat?.slug || null,
      location_label: (r.location_label as string | null) || null,
      city: (r.city as string | null) || null,
      occurred_at: (r.occurred_at as string | null) || null,
      color: (r.color as string | null) || null,
      brand: (r.brand as string | null) || null,
      model: (r.model as string | null) || null,
      item_attributes: (r.item_attributes as Record<string, unknown>) || {},
      case_status: r.case_status as ReportDetailItem["case_status"],
      moderation_status: r.moderation_status as ReportDetailItem["moderation_status"],
      content_version: Number(r.content_version) || 1,
      closed_at: (r.closed_at as string | null) || null,
      returned_at: (r.returned_at as string | null) || null,
      created_at: String(r.created_at),
      updated_at: String(r.updated_at),
      author_name: prof?.display_name || "Warga MuaraKu",
      author_avatar: prof?.avatar_path || null,
      media: mediaWithUrls,
      primary_image_url: primaryImageUrl,
      private_details: privateDetails,
      is_saved: isSaved,
    };

    return { data: reportDetail, error: null };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Gagal mengambil detail laporan");
    return { data: null, error };
  }
}

/**
 * Create a new lost or found report with media upload and private details.
 */
export async function createReport(
  input: CreateReportInput,
  files?: File[]
): Promise<{ data: ReportDetailItem | null; error: Error | null }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error("Harap masuk terlebih dahulu untuk membuat laporan") };
  }

  // Client validation per database constraints
  const trimmedTitle = input.title.trim();
  if (trimmedTitle.length < 3 || trimmedTitle.length > 140) {
    return { data: null, error: new Error("Judul laporan harus memiliki panjang antara 3 dan 140 karakter") };
  }

  const trimmedDesc = input.description.trim();
  if (trimmedDesc.length < 5 || trimmedDesc.length > 5000) {
    return { data: null, error: new Error("Deskripsi laporan harus memiliki panjang antara 5 dan 5000 karakter") };
  }

  if (input.location_label && input.location_label.length > 200) {
    return { data: null, error: new Error("Label lokasi maksimal 200 karakter") };
  }

  if (input.city && input.city.length > 100) {
    return { data: null, error: new Error("Nama kota maksimal 100 karakter") };
  }

  const uploadedStoragePaths: string[] = [];

  try {
    // 1. Insert into reports (relying on table defaults for case_status and moderation_status)
    const { data: newReport, error: reportError } = await supabase
      .from("reports")
      .insert({
        reporter_user_id: user.id,
        report_type: input.report_type,
        title: trimmedTitle,
        description: trimmedDesc,
        category_id: input.category_id || null,
        location_label: input.location_label?.trim() || null,
        city: input.city?.trim() || null,
        occurred_at: input.occurred_at || new Date().toISOString(),
        color: input.color?.trim() || null,
        brand: input.brand?.trim() || null,
        model: input.model?.trim() || null,
      })
      .select()
      .single();

    if (reportError || !newReport) {
      throw new Error(reportError?.message || "Gagal membuat laporan di database");
    }

    const reportId = newReport.id;

    // 2. Insert into report_private_details if provided
    const hasPrivateDetails =
      input.private_description ||
      input.owner_only_clues ||
      input.private_location_note ||
      input.private_contact;

    if (hasPrivateDetails) {
      const { error: privateError } = await supabase.from("report_private_details").insert({
        report_id: reportId,
        private_description: input.private_description?.trim() || null,
        owner_only_clues: input.owner_only_clues?.trim() || null,
        private_location_note: input.private_location_note?.trim() || null,
        contact_preference: input.contact_preference || "in_app",
        private_contact: input.private_contact?.trim() || null,
      });

      if (privateError) {
        console.error("Warning: Failed to save private details:", privateError.message);
      }
    }

    // 3. Upload media files if provided
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 8388608) {
          throw new Error(`Ukuran file "${file.name}" melebihi batas 8MB`);
        }

        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const cleanName = `${Date.now()}_${i}.${ext}`;
        // Bucket policy convention: <auth.uid()>/<report_id>/<filename>
        const storagePath = `${user.id}/${reportId}/${cleanName}`;

        const { error: uploadError } = await supabase.storage
          .from("report-images")
          .upload(storagePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Gagal mengunggah foto: ${uploadError.message}`);
        }

        uploadedStoragePaths.push(storagePath);

        // Insert into report_media
        const { error: mediaError } = await supabase.from("report_media").insert({
          report_id: reportId,
          object_path: storagePath,
          alt_text: trimmedTitle.slice(0, 200),
          sort_order: i,
          uploaded_by: user.id,
        });

        if (mediaError) {
          throw new Error(`Gagal menyimpan referensi media: ${mediaError.message}`);
        }
      }
    }

    // Return the newly created report item
    const detail = await fetchReportById(reportId);
    return { data: detail.data, error: null };
  } catch (err: unknown) {
    // Rollback uploaded files if any
    if (uploadedStoragePaths.length > 0) {
      try {
        await supabase.storage.from("report-images").remove(uploadedStoragePaths);
      } catch (cleanupErr) {
        console.error("Storage cleanup failed:", cleanupErr);
      }
    }

    const error = err instanceof Error ? err : new Error("Gagal membuat laporan");
    return { data: null, error };
  }
}

/**
 * Update an existing report.
 */
export async function updateReport(
  reportId: string,
  updates: UpdateReportInput,
  privateUpdates?: {
    private_description?: string | null;
    owner_only_clues?: string | null;
    private_location_note?: string | null;
    contact_preference?: "in_app" | "email" | "other";
    private_contact?: string | null;
  }
): Promise<{ success: boolean; error: Error | null }> {
  const supabase = createClient();

  try {
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.title !== undefined) updatePayload.title = updates.title.trim();
    if (updates.description !== undefined) updatePayload.description = updates.description.trim();
    if (updates.category_id !== undefined) updatePayload.category_id = updates.category_id;
    if (updates.location_label !== undefined) updatePayload.location_label = updates.location_label?.trim() || null;
    if (updates.city !== undefined) updatePayload.city = updates.city?.trim() || null;
    if (updates.occurred_at !== undefined) updatePayload.occurred_at = updates.occurred_at;
    if (updates.color !== undefined) updatePayload.color = updates.color?.trim() || null;
    if (updates.brand !== undefined) updatePayload.brand = updates.brand?.trim() || null;
    if (updates.model !== undefined) updatePayload.model = updates.model?.trim() || null;
    if (updates.case_status !== undefined) {
      updatePayload.case_status = updates.case_status;
      if (updates.case_status === "closed") {
        updatePayload.closed_at = new Date().toISOString();
      } else if (updates.case_status === "returned") {
        updatePayload.returned_at = new Date().toISOString();
      }
    }

    const { error } = await supabase
      .from("reports")
      .update(updatePayload)
      .eq("id", reportId);

    if (error) {
      return { success: false, error: new Error(error.message) };
    }

    // Update private details if provided
    if (privateUpdates) {
      const { error: pErr } = await supabase
        .from("report_private_details")
        .upsert({
          report_id: reportId,
          private_description: privateUpdates.private_description?.trim() || null,
          owner_only_clues: privateUpdates.owner_only_clues?.trim() || null,
          private_location_note: privateUpdates.private_location_note?.trim() || null,
          contact_preference: privateUpdates.contact_preference || "in_app",
          private_contact: privateUpdates.private_contact?.trim() || null,
          updated_at: new Date().toISOString(),
        });

      if (pErr) {
        console.error("Warning: private details update error:", pErr.message);
      }
    }

    return { success: true, error: null };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Gagal memperbarui laporan");
    return { success: false, error };
  }
}

/**
 * Delete a report (and its media).
 */
export async function deleteReport(reportId: string): Promise<{ success: boolean; error: Error | null }> {
  const supabase = createClient();

  try {
    // 1. Fetch media to remove from storage
    const { data: media } = await supabase
      .from("report_media")
      .select("object_path")
      .eq("report_id", reportId);

    if (media && media.length > 0) {
      const paths = (media as Array<{ object_path: string }>).map((m) => m.object_path);
      await supabase.storage.from("report-images").remove(paths);
    }

    // 2. Delete report from reports table (cascade takes care of report_media and private_details)
    const { error } = await supabase.from("reports").delete().eq("id", reportId);

    if (error) {
      return { success: false, error: new Error(error.message) };
    }

    return { success: true, error: null };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Gagal menghapus laporan");
    return { success: false, error };
  }
}

/**
 * Toggle bookmark/save for a report in `saved_reports`.
 */
export async function toggleSaveReport(reportId: string): Promise<{ isSaved: boolean; error: Error | null }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isSaved: false, error: new Error("Masuk untuk menyimpan laporan ini") };
  }

  try {
    // Check if currently saved
    const { data: existing } = await supabase
      .from("saved_reports")
      .select("report_id")
      .eq("user_id", user.id)
      .eq("report_id", reportId)
      .maybeSingle();

    if (existing) {
      // Remove
      const { error } = await supabase
        .from("saved_reports")
        .delete()
        .eq("user_id", user.id)
        .eq("report_id", reportId);

      if (error) throw new Error(error.message);
      return { isSaved: false, error: null };
    } else {
      // Insert
      const { error } = await supabase.from("saved_reports").insert({
        user_id: user.id,
        report_id: reportId,
      });

      if (error) throw new Error(error.message);
      return { isSaved: true, error: null };
    }
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Gagal memperbarui status simpan");
    return { isSaved: false, error };
  }
}

/**
 * Submit a claim for a found report linked to claimant's lost report.
 */
export interface CreateClaimInput {
  found_report_id: string;
  lost_report_id: string;
  claimant_message?: string;
  evidence_file?: File;
  evidence_note?: string;
}

export async function createClaim(
  input: CreateClaimInput
): Promise<{ data: ClaimItem | null; error: Error | null }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error("Harap masuk untuk mengajukan klaim") };
  }

  if (input.found_report_id === input.lost_report_id) {
    return { data: null, error: new Error("Laporan temuan dan laporan kehilangan tidak boleh sama") };
  }

  let uploadedEvidencePath: string | null = null;

  try {
    // Verify user owns the lost report
    const { data: lostRep, error: lostErr } = await supabase
      .from("reports")
      .select("reporter_user_id, report_type")
      .eq("id", input.lost_report_id)
      .single();

    if (lostErr || !lostRep) {
      throw new Error("Laporan kehilangan Anda tidak valid");
    }

    if (lostRep.reporter_user_id !== user.id) {
      throw new Error("Anda harus menjadi pemilik laporan kehilangan yang dipilih");
    }

    if (lostRep.report_type !== "lost") {
      throw new Error("Laporan penaut harus bertipe 'lost'");
    }

    // Verify found report
    const { data: foundRep, error: foundErr } = await supabase
      .from("reports")
      .select("reporter_user_id, report_type")
      .eq("id", input.found_report_id)
      .single();

    if (foundErr || !foundRep) {
      throw new Error("Laporan temuan tidak ditemukan");
    }

    if (foundRep.reporter_user_id === user.id) {
      throw new Error("Anda tidak dapat mengajukan klaim pada laporan temuan Anda sendiri");
    }

    if (foundRep.report_type !== "found") {
      throw new Error("Target klaim harus berupa laporan temuan ('found')");
    }

    // Insert claim (relying on table default 'submitted' for status)
    const { error: claimErr } = await supabase
      .from("claims")
      .insert({
        found_report_id: input.found_report_id,
        lost_report_id: input.lost_report_id,
        claimant_user_id: user.id,
        claimant_message: input.claimant_message?.trim() || null,
      });

    if (claimErr) {
      throw new Error(claimErr.message || "Gagal menyimpan klaim di database");
    }

    // Fetch the newly created claim
    const { data: newClaim, error: fetchClaimErr } = await supabase
      .from("claims")
      .select("id, found_report_id, lost_report_id, claimant_user_id, claimant_message, status, public_response, created_at, updated_at")
      .eq("found_report_id", input.found_report_id)
      .eq("claimant_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchClaimErr || !newClaim) {
      throw new Error(fetchClaimErr?.message || "Gagal memverifikasi klaim yang baru dibuat");
    }

    // Evidence file upload if provided
    if (input.evidence_file) {
      const file = input.evidence_file;
      if (file.size > 8388608) {
        throw new Error("Ukuran berkas bukti klaim melebihi batas 8MB");
      }

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const cleanName = `${Date.now()}.${ext}`;
      const storagePath = `${user.id}/${newClaim.id}/${cleanName}`;

      const { error: upErr } = await supabase.storage.from("claim-evidence").upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (upErr) {
        throw new Error(`Gagal mengunggah bukti klaim: ${upErr.message}`);
      }

      uploadedEvidencePath = storagePath;

      const { error: evErr } = await supabase.from("claim_evidence").insert({
        claim_id: newClaim.id,
        uploaded_by: user.id,
        storage_path: storagePath,
        note: input.evidence_note?.trim() || null,
      });

      if (evErr) {
        throw new Error(`Gagal menyimpan catatan bukti klaim: ${evErr.message}`);
      }
    }

    return {
      data: {
        id: newClaim.id,
        found_report_id: newClaim.found_report_id,
        lost_report_id: newClaim.lost_report_id,
        claimant_user_id: newClaim.claimant_user_id,
        claimant_message: newClaim.claimant_message,
        status: newClaim.status,
        public_response: newClaim.public_response,
        created_at: newClaim.created_at,
        updated_at: newClaim.updated_at,
      },
      error: null,
    };
  } catch (err: unknown) {
    if (uploadedEvidencePath) {
      try {
        await supabase.storage.from("claim-evidence").remove([uploadedEvidencePath]);
      } catch (cleanupErr) {
        console.error("Claim evidence cleanup failed:", cleanupErr);
      }
    }

    const error = err instanceof Error ? err : new Error("Gagal memproses klaim");
    return { data: null, error };
  }
}

/**
 * Fetch claims for a specific report or current user.
 */
export async function fetchClaimsForReport(reportId: string): Promise<{ data: ClaimItem[]; error: Error | null }> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("claims")
      .select(
        `
        id,
        found_report_id,
        lost_report_id,
        claimant_user_id,
        claimant_message,
        status,
        public_response,
        created_at,
        updated_at,
        lost_report:lost_report_id (
          id,
          title,
          location_label
        ),
        user_profiles:claimant_user_id (
          display_name,
          avatar_path
        ),
        claim_evidence (
          id,
          storage_path,
          note
        )
      `
      )
      .or(`found_report_id.eq.${reportId},lost_report_id.eq.${reportId}`)
      .order("created_at", { ascending: false });

    if (error) {
      return { data: [], error: new Error(error.message) };
    }

    // Collect all evidence paths to batch resolve signed URLs
    const allPaths: string[] = [];
    for (const c of data as Array<Record<string, unknown>>) {
      const rawEv = (c.claim_evidence as Array<{ storage_path: string }>) || [];
      for (const ev of rawEv) {
        if (ev.storage_path) allPaths.push(ev.storage_path);
      }
    }
    const signedUrlMap = await getSignedMediaUrlsBatch(allPaths, "claim-evidence");

    // Resolve evidence signed URLs
    const items: ClaimItem[] = (data as Array<Record<string, unknown>>).map((c) => {
      const rawEv = (c.claim_evidence as Array<{ id: string; storage_path: string; note?: string | null }>) || [];
      const evidenceWithUrls = rawEv.map((ev) => {
        const signedUrl = signedUrlMap.get(ev.storage_path) || null;
        return {
          id: ev.id,
          storage_path: ev.storage_path,
          note: ev.note,
          signed_url: signedUrl,
        };
      });

      const rawLost = c.lost_report as { id: string; title: string; location_label?: string | null } | null;
      const rawProf = c.user_profiles as { display_name?: string | null; avatar_path?: string | null } | null;

      return {
        id: String(c.id),
        found_report_id: String(c.found_report_id),
        lost_report_id: String(c.lost_report_id),
        claimant_user_id: String(c.claimant_user_id),
        claimant_message: c.claimant_message as string | null,
        status: c.status as ClaimItem["status"],
        public_response: c.public_response as string | null,
        created_at: String(c.created_at),
        updated_at: String(c.updated_at),
        lost_report: rawLost || undefined,
        claimant_profile: rawProf || undefined,
        evidence: evidenceWithUrls,
      };
    });

    return { data: items, error: null };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Gagal memuat klaim");
    return { data: [], error };
  }
}

/**
 * Fetch reports saved by a specific user directly from saved_reports joined with reports.
 */
export async function fetchSavedReports(userId: string): Promise<{
  data: ReportDetailItem[];
  count: number;
  error: Error | null;
}> {
  if (!userId) return { data: [], count: 0, error: null };
  const supabase = createClient();

  try {
    const { data: savedRows, error: savedError } = await supabase
      .from("saved_reports")
      .select("report_id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (savedError) {
      return { data: [], count: 0, error: new Error(savedError.message) };
    }

    if (!savedRows || savedRows.length === 0) {
      return { data: [], count: 0, error: null };
    }

    const reportIds = (savedRows as Array<{ report_id: string }>).map((s) => s.report_id);

    const { data, error } = await supabase
      .from("reports")
      .select(
        `
        id,
        reporter_user_id,
        report_type,
        title,
        description,
        category_id,
        location_label,
        city,
        occurred_at,
        color,
        brand,
        model,
        item_attributes,
        case_status,
        moderation_status,
        content_version,
        closed_at,
        returned_at,
        created_at,
        updated_at,
        user_profiles:reporter_user_id (
          display_name,
          avatar_path
        ),
        report_categories:category_id (
          id,
          name_id,
          name_en,
          slug
        ),
        report_media (
          id,
          object_path,
          alt_text,
          sort_order
        )
      `
      )
      .in("id", reportIds);

    if (error) {
      return { data: [], count: 0, error: new Error(error.message) };
    }

    if (!data || data.length === 0) {
      return { data: [], count: 0, error: null };
    }

    // Collect all media paths to batch resolve signed URLs
    const allPaths: string[] = [];
    for (const r of data as Array<Record<string, unknown>>) {
      const mediaList = (r.report_media as Array<{ object_path: string }>) || [];
      for (const m of mediaList) {
        if (m.object_path) allPaths.push(m.object_path);
      }
    }

    const signedUrlMap = await getSignedMediaUrlsBatch(allPaths);

    const items: ReportDetailItem[] = (data as Array<Record<string, unknown>>).map((r) => {
      const rawMedia = (r.report_media as Array<{
        id: string;
        object_path: string;
        alt_text?: string | null;
        sort_order: number;
      }>) || [];

      const sortedMedia = [...rawMedia].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

      let primaryImageUrl: string | null = null;
      const mediaWithUrls: ReportMediaItem[] = [];

      for (let i = 0; i < sortedMedia.length; i++) {
        const m = sortedMedia[i];
        const signedUrl = signedUrlMap.get(m.object_path) || null;
        mediaWithUrls.push({
          id: m.id,
          object_path: m.object_path,
          alt_text: m.alt_text,
          sort_order: m.sort_order,
          signed_url: signedUrl,
        });
        if (i === 0) {
          primaryImageUrl = signedUrl;
        }
      }

      const rawProf = r.user_profiles;
      const prof = (Array.isArray(rawProf) ? rawProf[0] : rawProf) as {
        display_name?: string;
        avatar_path?: string;
      } | null;

      const rawCat = r.report_categories;
      const cat = (Array.isArray(rawCat) ? rawCat[0] : rawCat) as {
        id: string;
        name_id: string;
        name_en: string;
        slug: string;
      } | null;

      return {
        id: String(r.id),
        reporter_user_id: String(r.reporter_user_id),
        report_type: (r.report_type === "found" ? "found" : "lost") as "lost" | "found",
        title: String(r.title || ""),
        description: String(r.description || ""),
        category_id: r.category_id as string | null,
        category_name: cat?.name_id || null,
        category_slug: cat?.slug || null,
        location_label: (r.location_label as string | null) || null,
        city: (r.city as string | null) || null,
        occurred_at: (r.occurred_at as string | null) || null,
        color: (r.color as string | null) || null,
        brand: (r.brand as string | null) || null,
        model: (r.model as string | null) || null,
        item_attributes: (r.item_attributes as Record<string, unknown>) || {},
        case_status: r.case_status as ReportDetailItem["case_status"],
        moderation_status: r.moderation_status as ReportDetailItem["moderation_status"],
        content_version: Number(r.content_version) || 1,
        closed_at: (r.closed_at as string | null) || null,
        returned_at: (r.returned_at as string | null) || null,
        created_at: String(r.created_at),
        updated_at: String(r.updated_at),
        author_name: prof?.display_name || "Warga MuaraKu",
        author_avatar: prof?.avatar_path || null,
        media: mediaWithUrls,
        primary_image_url: primaryImageUrl,
        is_saved: true,
      };
    });

    return {
      data: items,
      count: items.length,
      error: null,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Gagal mengambil laporan tersimpan");
    return { data: [], count: 0, error };
  }
}
