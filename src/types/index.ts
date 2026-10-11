export type ReportType = 'lost' | 'found';

export type ItemCategory = 
  | 'Dompet & Kartu'
  | 'Elektronik'
  | 'Kunci & Aksesori'
  | 'Buku & Dokumen'
  | 'Tas & Pakaian'
  | 'Lainnya';

export type ReportStatus = 
  | 'Open'
  | 'Potential Match'
  | 'Claim in Progress'
  | 'Returned'
  | 'Closed';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'student' | 'teacher' | 'staff' | 'admin';
  institution?: string; // e.g., 'SMA Negeri 1', 'Universitas Indonesia', 'Perpustakaan Pusat'
  is_verified_staff?: boolean;
  staff_authority_id?: string;
  avatar_url?: string;
  civic_karma?: number;
  created_at: string;
}

export interface Report {
  id: string;
  report_code: string; // e.g. #HIL-2024-8291 or #TEM-2024-8841
  report_type: ReportType;
  title: string;
  category: ItemCategory;
  facility_location: string;
  location_detail?: string;
  incident_time: string;
  public_description: string;
  image_url: string;
  additional_images?: string[];
  
  // Zero-Knowledge Private Clues
  secret_clue?: string;
  secret_serial?: string;
  is_dropped_at_staff_pos?: boolean;
  
  status: ReportStatus;
  
  reporter_id: string;
  reporter_name: string;
  reporter_avatar?: string;
  reporter_is_staff?: boolean;
  reporter_staff_badge?: string;
  
  // AI Matching details
  match_percentage?: number;
  match_candidate_id?: string;
  
  created_at: string;
  updated_at?: string;
}

export interface Claim {
  id: string;
  report_id: string;
  report_title: string;
  claimant_id: string;
  claimant_name: string;
  claimant_avatar?: string;
  proof_description: string;
  proof_serial?: string;
  proof_image_url?: string;
  status: 'Pending Review' | 'Approved' | 'Rejected' | 'Completed';
  meeting_location?: string;
  handover_qr?: string;
  created_at: string;
  reviewed_at?: string;
  review_notes?: string;
}

export interface GlobalChatMessage {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  is_verified_staff?: boolean;
  role_tag?: string;
  content: string;
  channel: 'Umum' | 'Kampus & Sekolah' | 'Stasiun & Pos';
  timestamp: string;
}

export interface PrivateMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  timestamp: string;
  is_read: boolean;
  attachment_url?: string;
}

export interface Conversation {
  id: string;
  claim_id?: string;
  report_id?: string;
  report_title: string;
  report_code: string;
  other_user_id: string;
  other_user_name: string;
  other_user_avatar?: string;
  other_user_is_staff?: boolean;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  is_blocked?: boolean;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  description: string;
  time_ago: string;
  is_read: boolean;
  type: 'claim' | 'match' | 'message' | 'status' | 'security';
  link_route?: string;
}

export interface ModerationReport {
  id: string;
  reporter_id: string;
  reporter_name: string;
  target_type: 'report' | 'user' | 'message';
  target_id: string;
  target_title?: string;
  reason: 'spam' | 'scam' | 'harassment' | 'false_info' | 'privacy_exposure' | 'other';
  notes?: string;
  status: 'Pending' | 'Reviewing' | 'Action Taken' | 'Dismissed';
  created_at: string;
}
