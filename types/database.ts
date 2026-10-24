/**
 * Schema types corresponding to the 22 canonical public tables in MuaraKu_Fresh_Install_v2.2.sql
 */

export interface DBUserProfile {
  user_id: string;
  username: string | null;
  display_name: string;
  avatar_path: string | null;
  bio: string | null;
  preferred_language: "id" | "en";
  theme: "light" | "dark" | "system";
  gender?: "male" | "female" | "unspecified" | null;
  created_at: string;
  updated_at: string;
}

export interface DBUserAccountControls {
  user_id: string;
  status: "active" | "restricted" | "suspended" | "banned";
  public_message: string | null;
  effective_until: string | null;
  updated_by: string | null;
  updated_at: string;
  // Notification preference columns integrated directly into user_account_controls
  notify_in_app_messages: boolean;
  notify_in_app_matches: boolean;
  notify_in_app_claim_updates: boolean;
  notify_in_app_moderation_updates: boolean;
  notify_email_messages: boolean;
  notify_email_matches: boolean;
  notify_email_claim_updates: boolean;
  notify_email_moderation_updates: boolean;
}

export interface DBStaffRole {
  id: string;
  user_id: string;
  role: "admin" | "moderator" | "support" | "location_verifier";
  granted_by: string | null;
  created_at: string;
}

export interface DBReportCategory {
  id: string;
  slug: string;
  name_id: string;
  name_en: string;
  icon_name: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface DBReport {
  id: string;
  reporter_user_id: string | null;
  report_type: "lost" | "found";
  title: string;
  description: string;
  category_id: string | null;
  location_label: string | null;
  city: string | null;
  occurred_at: string | null;
  color: string | null;
  brand: string | null;
  model: string | null;
  item_attributes: Record<string, unknown>;
  case_status: "open" | "match_pending" | "claim_in_progress" | "returned" | "closed";
  moderation_status: "pending_review" | "approved" | "flagged" | "removed";
  content_version: number;
  closed_at: string | null;
  returned_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBReportPrivateDetails {
  report_id: string;
  private_description: string | null;
  owner_only_clues: string | null;
  private_location_note: string | null;
  contact_preference: "in_app" | "email" | "other";
  private_contact: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBReportMedia {
  id: string;
  report_id: string;
  object_path: string;
  alt_text: string | null;
  sort_order: number;
  uploaded_by: string;
  created_at: string;
}

export interface DBClaim {
  id: string;
  found_report_id: string;
  lost_report_id: string;
  claimant_user_id: string;
  claimant_message: string | null;
  status: "submitted" | "under_review" | "more_info_requested" | "approved" | "rejected" | "withdrawn" | "completed";
  public_response: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBClaimEvidence {
  id: string;
  claim_id: string;
  uploaded_by: string;
  storage_path: string;
  note: string | null;
  created_at: string;
}

export interface DBSavedReport {
  user_id: string;
  report_id: string;
  created_at: string;
}

export interface DBAdminActivityLog {
  id: string;
  actor_id: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}
