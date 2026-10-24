import { ReportDetailItem } from "@/lib/supabase/reports";

export const initialSampleReports: ReportDetailItem[] = [
  {
    id: "rep-001",
    reporter_user_id: "00000000-0000-0000-0000-000000000001",
    report_type: "found",
    title: "Kunci Motor Honda Vario Gantungan Doraemon",
    description: "Ditemukan tergeletak di meja semen dekat parkiran timur. Gantungan kunci warna biru berbentuk Doraemon dengan remote alarm.",
    category_name: "Kunci & aksesori",
    location_label: "Parkiran Timur Gedung Kuliah Bersama, Kampus Telkom",
    occurred_at: new Date().toISOString(),
    case_status: "open",
    moderation_status: "approved",
    content_version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author_name: "Pak Bambang (Keamanan)",
    author_avatar: null,
    media: [],
    primary_image_url: null,
  },
];
