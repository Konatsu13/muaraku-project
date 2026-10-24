-- ============================================================================
-- MuaraKu — FRESH INSTALL (22 public application tables), v2.2
-- Use this file ONLY when starting from an empty Supabase project/schema.
-- It installs the user's original schema, then applies the v2.2 simplification.
-- The original source file is not modified.
-- Supabase must already provide its managed auth.users and storage schemas.
-- Run the ENTIRE file in Supabase SQL Editor; do not run the migration file alone.
-- ============================================================================

DO $$
BEGIN
  IF to_regclass('auth.users') IS NULL THEN
    RAISE EXCEPTION 'MuaraKu setup stopped: auth.users is missing. Run this only in a Supabase project with Supabase Auth enabled.';
  END IF;
  IF to_regclass('storage.objects') IS NULL OR to_regclass('storage.buckets') IS NULL THEN
    RAISE EXCEPTION 'MuaraKu setup stopped: Supabase Storage tables are missing. Ensure Storage is enabled in this Supabase project.';
  END IF;
END;
$$;

-- ============================================================================
-- MuaraKu — Supabase/PostgreSQL starter schema
-- Target: Supabase + Next.js (App Router or Pages Router)
-- Version: 1.0 | Generated: 2026-10-11
--
-- IMPORTANT BEFORE RUNNING
-- 1. This combined file creates the original schema, then simplifies it to v2.2.
-- 2. Run the entire file only in a new/empty public schema of a Supabase project.
-- 3. It does not create or replace Supabase-managed auth.users.
-- 4. Supabase Auth manages OTP/tokens/sessions. Never store raw OTP codes here.
-- 5. Keep service_role/secret, Resend, and AI keys server-side.
-- 6. Report images, message attachments, claim evidence, and avatars use separate
--    private Storage buckets; private evidence must NEVER be uploaded to a
--    public report-image bucket.
-- 7. Never expose the service-role/secret key in the browser.
-- ============================================================================

begin;

-- --------------------------------------------------------------------------
-- 0. Small utility function used by updated_at triggers
-- --------------------------------------------------------------------------
create or replace function public.muaraku_set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- --------------------------------------------------------------------------
-- 1. User profile and account controls
-- Supabase Auth remains the source of truth for login credentials and OTP.
-- --------------------------------------------------------------------------
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text,
  display_name text not null default 'Pengguna MuaraKu',
  avatar_path text,
  bio text not null default '' check (char_length(bio) <= 500),
  preferred_language text not null default 'id' check (preferred_language in ('id','en')),
  theme text not null default 'system' check (theme in ('light','dark','system')),
  profile_visibility text not null default 'public' check (profile_visibility in ('public','private')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_profiles_username_format check (
    username is null or username ~ '^[A-Za-z0-9_.]{3,30}$'
  ),
  constraint user_profiles_display_name_length check (
    char_length(trim(display_name)) between 1 and 80
  )
);
create unique index if not exists user_profiles_username_lower_uq
  on public.user_profiles (lower(username)) where username is not null;
create index if not exists user_profiles_display_name_idx
  on public.user_profiles using btree (display_name);

-- Account restrictions are private; users cannot set their own account status.
create table if not exists public.user_account_controls (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'active'
    check (status in ('active','restricted','suspended','banned')),
  public_message text,
  effective_until timestamptz,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

-- Staff roles are separate from profile fields so a user cannot self-promote.
create table if not exists public.staff_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','moderator','support','location_verifier')),
  granted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
create index if not exists staff_roles_user_idx on public.staff_roles(user_id);

-- --------------------------------------------------------------------------
-- 2. Categories and structured locations
-- --------------------------------------------------------------------------
create table if not exists public.report_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_id text not null,
  name_en text not null,
  icon_name text,
  sort_order integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint category_slug_format check (slug ~ '^[a-z0-9-]{2,60}$')
);

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.locations(id) on delete set null,
  name text not null,
  location_type text not null default 'place'
    check (location_type in ('country','province','city','campus','building','venue','area','place')),
  address text,
  city text,
  province text,
  latitude double precision check (latitude is null or latitude between -90 and 90),
  longitude double precision check (longitude is null or longitude between -180 and 180),
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists locations_parent_idx on public.locations(parent_id);
create index if not exists locations_city_idx on public.locations(city);
create index if not exists locations_name_search_idx on public.locations using gin (to_tsvector('simple', name));

insert into public.report_categories (slug, name_id, name_en, icon_name, sort_order) values
  ('elektronik','Elektronik','Electronics','smartphone',10),
  ('dompet-kartu','Dompet & kartu','Wallets & cards','wallet',20),
  ('tas-ransel','Tas & ransel','Bags & backpacks','backpack',30),
  ('buku-dokumen','Buku & dokumen','Books & documents','book-open',40),
  ('kunci-aksesori','Kunci & aksesori','Keys & accessories','key-round',50),
  ('perhiasan','Perhiasan','Jewelry','gem',60),
  ('pakaian','Pakaian','Clothing','shirt',70),
  ('kendaraan','Kendaraan','Vehicles','bike',80),
  ('perlengkapan','Perlengkapan','Personal items','package',90),
  ('identitas','Identitas','Identification','id-card',100),
  ('hewan','Hewan','Animals','paw-print',110),
  ('lainnya','Lainnya','Other','ellipsis',120)
on conflict (slug) do nothing;

-- --------------------------------------------------------------------------
-- 3. Lost and found reports
-- Case status and moderation status are deliberately separate.
-- Keep owner-only clues/contact information in report_private_details instead.
-- --------------------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid references auth.users(id) on delete set null,
  report_type text not null check (report_type in ('lost','found')),
  title text not null check (char_length(trim(title)) between 3 and 140),
  description text not null check (char_length(trim(description)) between 5 and 5000),
  category_id uuid references public.report_categories(id) on delete set null,
  location_id uuid references public.locations(id) on delete set null,
  location_label text,
  city text,
  occurred_at timestamptz,
  color text,
  brand text,
  model text,
  item_attributes jsonb not null default '{}'::jsonb check (jsonb_typeof(item_attributes) = 'object'),
  case_status text not null default 'open'
    check (case_status in ('open','match_pending','claim_in_progress','returned','closed')),
  moderation_status text not null default 'pending_review'
    check (moderation_status in ('pending_review','approved','flagged','removed')),
  content_version integer not null default 1 check (content_version > 0),
  closed_at timestamptz,
  returned_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reports_location_label_length check (location_label is null or char_length(location_label) <= 200),
  constraint reports_city_length check (city is null or char_length(city) <= 100)
);
create index if not exists reports_feed_idx on public.reports(moderation_status, report_type, created_at desc);
create index if not exists reports_owner_idx on public.reports(reporter_user_id, created_at desc);
create index if not exists reports_category_idx on public.reports(category_id);
create index if not exists reports_location_idx on public.reports(location_id, city);
create index if not exists reports_case_status_idx on public.reports(case_status);
create index if not exists reports_color_lower_idx on public.reports(lower(color)) where color is not null;
create index if not exists reports_brand_lower_idx on public.reports(lower(brand)) where brand is not null;
create index if not exists reports_item_attributes_gin_idx on public.reports using gin(item_attributes);
create index if not exists reports_search_idx on public.reports using gin (
  to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(brand,'') || ' ' || coalesce(color,''))
);

-- Private verification clues and contact preferences are not part of public report queries.
create table if not exists public.report_private_details (
  report_id uuid primary key references public.reports(id) on delete cascade,
  private_description text,
  owner_only_clues text,
  private_location_note text,
  contact_preference text not null default 'in_app'
    check (contact_preference in ('in_app','email','other')),
  private_contact text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint private_details_length check (
    (private_description is null or char_length(private_description) <= 3000) and
    (owner_only_clues is null or char_length(owner_only_clues) <= 2000) and
    (private_location_note is null or char_length(private_location_note) <= 1000) and
    (private_contact is null or char_length(private_contact) <= 250)
  )
);

-- Stored object paths point to the private `report-images` Storage bucket.
create table if not exists public.report_media (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  object_path text not null unique,
  alt_text text,
  sort_order integer not null default 0,
  uploaded_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint report_media_alt_length check (alt_text is null or char_length(alt_text) <= 250)
);
create index if not exists report_media_report_idx on public.report_media(report_id, sort_order);

-- --------------------------------------------------------------------------
-- 4. AI match candidates, claims, and private claim evidence
-- Match scores are suggestions and are not proof of ownership.
-- --------------------------------------------------------------------------
create table if not exists public.report_matches (
  id uuid primary key default gen_random_uuid(),
  lost_report_id uuid not null references public.reports(id) on delete cascade,
  found_report_id uuid not null references public.reports(id) on delete cascade,
  overall_score numeric(5,4) check (overall_score is null or overall_score between 0 and 1),
  attribute_scores jsonb not null default '{}'::jsonb check (jsonb_typeof(attribute_scores) = 'object'),
  explanation text,
  match_status text not null default 'suggested'
    check (match_status in ('suggested','reviewing','accepted','dismissed','resolved')),
  model_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lost_report_id, found_report_id),
  constraint report_matches_not_same check (lost_report_id <> found_report_id)
);
create index if not exists report_matches_lost_idx on public.report_matches(lost_report_id, overall_score desc);
create index if not exists report_matches_found_idx on public.report_matches(found_report_id, overall_score desc);

create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  found_report_id uuid not null references public.reports(id) on delete restrict,
  lost_report_id uuid not null references public.reports(id) on delete restrict,
  claimant_user_id uuid not null references auth.users(id) on delete restrict,
  claimant_message text,
  status text not null default 'submitted'
    check (status in ('submitted','under_review','more_info_requested','approved','rejected','withdrawn','completed')),
  public_response text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint claims_message_length check (claimant_message is null or char_length(claimant_message) <= 2000),
  constraint claims_response_length check (public_response is null or char_length(public_response) <= 2000),
  constraint claims_reports_differ check (found_report_id <> lost_report_id)
);
create index if not exists claims_claimant_idx on public.claims(claimant_user_id, created_at desc);
create index if not exists claims_found_report_idx on public.claims(found_report_id, status, created_at desc);
create index if not exists claims_lost_report_idx on public.claims(lost_report_id, status, created_at desc);

create table if not exists public.claim_evidence (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.claims(id) on delete cascade,
  uploaded_by uuid not null references auth.users(id) on delete restrict,
  storage_path text not null unique,
  note text,
  created_at timestamptz not null default now(),
  constraint claim_evidence_note_length check (note is null or char_length(note) <= 1500)
);
create index if not exists claim_evidence_claim_idx on public.claim_evidence(claim_id, created_at);

-- --------------------------------------------------------------------------
-- 5. Saved reports
-- --------------------------------------------------------------------------
create table if not exists public.saved_reports (
  user_id uuid not null references auth.users(id) on delete cascade,
  report_id uuid not null references public.reports(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, report_id)
);

-- --------------------------------------------------------------------------
-- 6. Conversations, private messages, and user blocks
-- Global Chat uses one seeded global conversation row.
-- --------------------------------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('direct','global','report')),
  title text,
  context_report_id uuid references public.reports(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint global_conversation_no_context check (kind <> 'global' or context_report_id is null)
);
create index if not exists conversations_context_report_idx on public.conversations(context_report_id);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  member_role text not null default 'member' check (member_role in ('member','owner')),
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  primary key (conversation_id, user_id)
);
create index if not exists conversation_members_user_idx on public.conversation_members(user_id, joined_at desc);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete restrict,
  body text not null default '',
  message_kind text not null default 'text' check (message_kind in ('text','image','file','system')),
  attachment_path text,
  moderation_status text not null default 'approved'
    check (moderation_status in ('approved','flagged','removed')),
  edited_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  constraint messages_body_length check (char_length(body) <= 5000),
  constraint messages_not_empty check (char_length(trim(body)) > 0 or attachment_path is not null)
);
create index if not exists messages_conversation_created_idx on public.messages(conversation_id, created_at desc);
create index if not exists messages_sender_idx on public.messages(sender_id, created_at desc);

create table if not exists public.user_blocks (
  blocker_user_id uuid not null references auth.users(id) on delete cascade,
  blocked_user_id uuid not null references auth.users(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now(),
  primary key (blocker_user_id, blocked_user_id),
  constraint user_blocks_no_self_block check (blocker_user_id <> blocked_user_id),
  constraint user_blocks_reason_length check (reason is null or char_length(reason) <= 500)
);
create index if not exists user_blocks_blocked_idx on public.user_blocks(blocked_user_id);

-- Stable ID for the application's one shared Global Chat.
insert into public.conversations (id, kind, title)
values ('00000000-0000-4000-8000-000000000001', 'global', 'MuaraKu Global Chat')
on conflict (id) do nothing;

-- --------------------------------------------------------------------------
-- 7. Notifications and preferences
-- --------------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid not null references auth.users(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  notification_type text not null check (notification_type in (
    'new_message','possible_match','new_claim','claim_update','report_update',
    'safety_report_update','moderation_notice','support_reply','system'
  )),
  report_id uuid references public.reports(id) on delete set null,
  claim_id uuid references public.claims(id) on delete set null,
  message_id uuid references public.messages(id) on delete set null,
  title text not null check (char_length(title) <= 160),
  body text check (body is null or char_length(body) <= 500),
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_recipient_created_idx on public.notifications(recipient_user_id, created_at desc);
create index if not exists notifications_unread_idx on public.notifications(recipient_user_id, created_at desc) where read_at is null;

create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  in_app_messages boolean not null default true,
  in_app_matches boolean not null default true,
  in_app_claim_updates boolean not null default true,
  in_app_moderation_updates boolean not null default true,
  email_messages boolean not null default false,
  email_matches boolean not null default false,
  email_claim_updates boolean not null default true,
  email_moderation_updates boolean not null default true,
  updated_at timestamptz not null default now()
);

-- --------------------------------------------------------------------------
-- 8. Report/Block safety reporting, moderation, and appeals
-- A safety report is separate from a lost/found item report.
-- --------------------------------------------------------------------------
create table if not exists public.safety_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid not null references auth.users(id) on delete restrict,
  target_type text not null check (target_type in ('user','item_report','message')),
  target_user_id uuid references auth.users(id) on delete set null,
  target_report_id uuid references public.reports(id) on delete set null,
  target_message_id uuid references public.messages(id) on delete set null,
  reason text not null check (reason in (
    'scam_or_fraud','forced_payment','harassment','spam','impersonation',
    'unsafe_content','false_report','privacy_violation','other'
  )),
  details text,
  status text not null default 'open' check (status in ('open','reviewing','actioned','dismissed','closed')),
  assigned_to uuid references auth.users(id) on delete set null,
  resolution_message text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint safety_reports_exactly_one_target check (
    (target_type = 'user' and target_user_id is not null and target_report_id is null and target_message_id is null) or
    (target_type = 'item_report' and target_user_id is null and target_report_id is not null and target_message_id is null) or
    (target_type = 'message' and target_user_id is null and target_report_id is null and target_message_id is not null)
  ),
  constraint safety_reports_no_self_target check (target_user_id is null or target_user_id <> reporter_user_id),
  constraint safety_reports_details_length check (details is null or char_length(details) <= 3000),
  constraint safety_reports_resolution_length check (resolution_message is null or char_length(resolution_message) <= 2000)
);
create index if not exists safety_reports_status_idx on public.safety_reports(status, created_at desc);
create index if not exists safety_reports_reporter_idx on public.safety_reports(reporter_user_id, created_at desc);
create index if not exists safety_reports_target_user_idx on public.safety_reports(target_user_id);

create table if not exists public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  action_type text not null check (action_type in (
    'warning','restrict','suspend','ban','unban','remove_post','restore_post',
    'remove_message','verify_location_staff','revoke_location_staff','other'
  )),
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  target_user_id uuid references auth.users(id) on delete set null,
  target_report_id uuid references public.reports(id) on delete set null,
  target_message_id uuid references public.messages(id) on delete set null,
  safety_report_id uuid references public.safety_reports(id) on delete set null,
  reason text not null check (char_length(trim(reason)) between 3 and 2000),
  public_message text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  constraint moderation_actions_public_message_length check (public_message is null or char_length(public_message) <= 2000)
);
create index if not exists moderation_actions_target_user_idx on public.moderation_actions(target_user_id, created_at desc);
create index if not exists moderation_actions_target_report_idx on public.moderation_actions(target_report_id, created_at desc);

create table if not exists public.moderation_appeals (
  id uuid primary key default gen_random_uuid(),
  moderation_action_id uuid not null references public.moderation_actions(id) on delete restrict,
  appellant_user_id uuid not null references auth.users(id) on delete restrict,
  reason text not null check (char_length(trim(reason)) between 10 and 3000),
  status text not null default 'submitted' check (status in ('submitted','reviewing','accepted','rejected','withdrawn')),
  response text,
  reviewer_user_id uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (moderation_action_id, appellant_user_id),
  constraint moderation_appeal_response_length check (response is null or char_length(response) <= 2000)
);
create index if not exists moderation_appeals_status_idx on public.moderation_appeals(status, created_at desc);

-- --------------------------------------------------------------------------
-- 9. Trusted location staff verification (yellow badge)
-- --------------------------------------------------------------------------
create table if not exists public.location_staff_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete restrict,
  organization_name text,
  public_label text not null default 'Petugas lokasi terverifikasi',
  status text not null default 'pending' check (status in ('pending','verified','rejected','revoked','expired')),
  verified_by uuid references auth.users(id) on delete set null,
  valid_until timestamptz,
  reviewer_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, location_id),
  constraint location_staff_org_length check (organization_name is null or char_length(organization_name) <= 200),
  constraint location_staff_message_length check (reviewer_message is null or char_length(reviewer_message) <= 1500)
);
create index if not exists location_staff_status_idx on public.location_staff_verifications(status, location_id);
create index if not exists location_staff_user_idx on public.location_staff_verifications(user_id, status);

-- --------------------------------------------------------------------------
-- 10. Support center and ticket conversation
-- Guest support submissions should go through a server route, not an open
-- anonymous table INSERT. A Next.js server route can use a server-only key.
-- --------------------------------------------------------------------------
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete set null,
  contact_email text not null check (char_length(contact_email) <= 320),
  category text not null default 'general' check (category in ('general','account','report','claim','safety','privacy','technical','other')),
  subject text not null check (char_length(trim(subject)) between 3 and 180),
  initial_message text not null check (char_length(trim(initial_message)) between 10 and 5000),
  status text not null default 'open' check (status in ('open','in_progress','waiting_for_user','resolved','closed')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);
create index if not exists support_tickets_owner_idx on public.support_tickets(owner_user_id, created_at desc);
create index if not exists support_tickets_status_idx on public.support_tickets(status, priority, created_at);

create table if not exists public.support_ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  sender_user_id uuid references auth.users(id) on delete set null,
  body text not null check (char_length(trim(body)) between 1 and 5000),
  is_internal boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists support_ticket_messages_ticket_idx on public.support_ticket_messages(ticket_id, created_at);

-- --------------------------------------------------------------------------
-- 11. Translation cache, terms acceptance, and audit log
-- --------------------------------------------------------------------------
create table if not exists public.report_translations (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  source_content_version integer not null,
  target_language text not null check (target_language in ('id','en')),
  translated_title text not null,
  translated_description text not null,
  provider text,
  model text,
  created_at timestamptz not null default now(),
  unique (report_id, source_content_version, target_language)
);
create index if not exists report_translations_report_idx on public.report_translations(report_id, target_language);

-- Optional persisted Muara AI assistant history. Only the owner can read it;
-- trusted server routes write messages after validating the authenticated user.
create table if not exists public.muara_ai_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Percakapan Muara AI' check (char_length(title) <= 160),
  status text not null default 'active' check (status in ('active','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists muara_ai_sessions_user_idx on public.muara_ai_sessions(user_id, updated_at desc);

create table if not exists public.muara_ai_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.muara_ai_sessions(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null check (char_length(content) between 1 and 12000),
  provider text,
  model text,
  input_tokens integer check (input_tokens is null or input_tokens >= 0),
  output_tokens integer check (output_tokens is null or output_tokens >= 0),
  feedback_score smallint check (feedback_score is null or feedback_score between 1 and 5),
  feedback_text text check (feedback_text is null or char_length(feedback_text) <= 1000),
  created_at timestamptz not null default now()
);
create index if not exists muara_ai_messages_session_idx on public.muara_ai_messages(session_id, created_at);

create table if not exists public.terms_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_type text not null check (document_type in ('terms_of_service','privacy_policy','community_guidelines')),
  document_version text not null check (char_length(document_version) <= 40),
  accepted_at timestamptz not null default now(),
  unique (user_id, document_type, document_version)
);
create index if not exists terms_acceptances_user_idx on public.terms_acceptances(user_id, accepted_at desc);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null check (char_length(action) between 2 and 120),
  target_type text,
  target_id text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  request_id text,
  created_at timestamptz not null default now()
);
create index if not exists audit_logs_actor_idx on public.audit_logs(actor_user_id, created_at desc);
create index if not exists audit_logs_target_idx on public.audit_logs(target_type, target_id, created_at desc);
create index if not exists audit_logs_created_idx on public.audit_logs(created_at desc);

-- --------------------------------------------------------------------------
-- 12. Security-definer helpers. These avoid recursive RLS checks and centralize
-- permissions. They return only the minimum needed for policies/RPCs.
-- --------------------------------------------------------------------------
create or replace function public.muaraku_has_staff_role(required_role text default null)
returns boolean
language sql stable security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.staff_roles sr
    where sr.user_id = auth.uid()
      and (required_role is null or sr.role = required_role)
  );
$$;

create or replace function public.muaraku_is_active_user(check_user_id uuid default auth.uid())
returns boolean
language sql stable security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.user_account_controls uac
    where uac.user_id = check_user_id
      and (uac.status = 'active' or (uac.status in ('restricted','suspended') and uac.effective_until is not null and uac.effective_until <= now()))
  );
$$;

create or replace function public.muaraku_is_current_user_active()
returns boolean
language sql stable security definer
set search_path = public, pg_temp
as $$
  select public.muaraku_is_active_user(auth.uid());
$$;

create or replace function public.muaraku_is_report_owner(check_report_id uuid)
returns boolean
language sql stable security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.reports r
    where r.id = check_report_id and r.reporter_user_id = auth.uid()
  );
$$;

create or replace function public.muaraku_are_users_blocked(user_a uuid, user_b uuid)
returns boolean
language sql stable security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.user_blocks b
    where (b.blocker_user_id = user_a and b.blocked_user_id = user_b)
       or (b.blocker_user_id = user_b and b.blocked_user_id = user_a)
  );
$$;

create or replace function public.muaraku_is_conversation_member(check_conversation_id uuid, check_user_id uuid default auth.uid())
returns boolean
language sql stable security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id = check_conversation_id and cm.user_id = check_user_id
  );
$$;

create or replace function public.muaraku_can_view_conversation(check_conversation_id uuid)
returns boolean
language sql stable security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.conversations c
    where c.id = check_conversation_id
      and (
        (c.kind = 'global' and public.muaraku_is_current_user_active())
        or public.muaraku_is_conversation_member(c.id, auth.uid())
        or public.muaraku_has_staff_role('admin')
      )
  );
$$;

create or replace function public.muaraku_can_send_message(check_conversation_id uuid)
returns boolean
language sql stable security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.conversations c
    where c.id = check_conversation_id
      and public.muaraku_is_current_user_active()
      and (
        c.kind = 'global'
        or (
          public.muaraku_is_conversation_member(c.id, auth.uid())
          and not exists (
            select 1 from public.conversation_members cm
            where cm.conversation_id = c.id
              and cm.user_id <> auth.uid()
              and public.muaraku_are_users_blocked(auth.uid(), cm.user_id)
          )
        )
      )
  );
$$;

create or replace function public.muaraku_can_view_claim(check_claim_id uuid)
returns boolean
language sql stable security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.claims c
    join public.reports fr on fr.id = c.found_report_id
    where c.id = check_claim_id
      and (
        c.claimant_user_id = auth.uid()
        or fr.reporter_user_id = auth.uid()
        or public.muaraku_has_staff_role('admin')
      )
  );
$$;

-- Create/reuse a direct conversation through a controlled RPC, rather than
-- allowing a client to add arbitrary users to conversation_members.
create or replace function public.muaraku_create_direct_conversation(
  other_user_id uuid,
  context_report_id uuid default null
)
returns uuid
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid := auth.uid();
  new_conversation_id uuid;
  report_owner_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;
  if other_user_id is null or other_user_id = current_user_id then
    raise exception 'Choose another user';
  end if;
  if not public.muaraku_is_active_user(current_user_id) or not public.muaraku_is_active_user(other_user_id) then
    raise exception 'Conversation is not available';
  end if;
  if public.muaraku_are_users_blocked(current_user_id, other_user_id) then
    raise exception 'Conversation is not available';
  end if;
  if context_report_id is not null then
    select r.reporter_user_id into report_owner_id
    from public.reports r
    where r.id = context_report_id
      and r.moderation_status = 'approved';
    if report_owner_id is null or report_owner_id not in (current_user_id, other_user_id) then
      raise exception 'Report is not available for this conversation';
    end if;
  end if;

  select c.id into new_conversation_id
  from public.conversations c
  where c.kind = 'direct'
    and c.context_report_id is not distinct from context_report_id
    and exists (select 1 from public.conversation_members cm where cm.conversation_id=c.id and cm.user_id=current_user_id)
    and exists (select 1 from public.conversation_members cm where cm.conversation_id=c.id and cm.user_id=other_user_id)
    and (select count(*) from public.conversation_members cm where cm.conversation_id=c.id) = 2
  limit 1;

  if new_conversation_id is not null then
    return new_conversation_id;
  end if;

  insert into public.conversations(kind, context_report_id, created_by)
  values ('direct', context_report_id, current_user_id)
  returning id into new_conversation_id;

  insert into public.conversation_members(conversation_id, user_id, member_role)
  values
    (new_conversation_id, current_user_id, 'owner'),
    (new_conversation_id, other_user_id, 'member');

  return new_conversation_id;
end;
$$;

create or replace function public.muaraku_withdraw_claim(claim_id_to_withdraw uuid)
returns void
language plpgsql security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  update public.claims c
  set status = 'withdrawn', updated_at = now()
  where c.id = claim_id_to_withdraw
    and c.claimant_user_id = auth.uid()
    and c.status in ('submitted','under_review','more_info_requested');
  if not found then raise exception 'Claim cannot be withdrawn'; end if;
end;
$$;

-- Enforce that a claim joins one found report and one lost report owned by the claimant.
create or replace function public.muaraku_validate_claim_relationship()
returns trigger
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  found_type text;
  found_owner uuid;
  lost_type text;
  lost_owner uuid;
begin
  select report_type, reporter_user_id into found_type, found_owner
  from public.reports where id = new.found_report_id;
  select report_type, reporter_user_id into lost_type, lost_owner
  from public.reports where id = new.lost_report_id;
  if found_type is distinct from 'found' or lost_type is distinct from 'lost' then
    raise exception 'Claim must connect one found report and one lost report';
  end if;
  if TG_OP = 'INSERT' then
    if not exists (select 1 from public.reports r where r.id = new.found_report_id and r.moderation_status = 'approved' and r.case_status not in ('returned','closed'))
       or not exists (select 1 from public.reports r where r.id = new.lost_report_id and r.moderation_status = 'approved' and r.case_status not in ('returned','closed')) then
      raise exception 'Reports are not available for claiming';
    end if;
  elsif new.found_report_id is distinct from old.found_report_id
     or new.lost_report_id is distinct from old.lost_report_id
     or new.claimant_user_id is distinct from old.claimant_user_id then
    if not exists (select 1 from public.reports r where r.id = new.found_report_id and r.moderation_status = 'approved' and r.case_status not in ('returned','closed'))
       or not exists (select 1 from public.reports r where r.id = new.lost_report_id and r.moderation_status = 'approved' and r.case_status not in ('returned','closed')) then
      raise exception 'Reports are not available for claiming';
    end if;
  end if;
  if lost_owner is distinct from new.claimant_user_id then
    raise exception 'Claimant must own the linked lost report';
  end if;
  if found_owner is null or found_owner = new.claimant_user_id then
    raise exception 'Claim is not available';
  end if;
  return new;
end;
$$;

create or replace function public.muaraku_validate_match_relationship()
returns trigger
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare lost_type text; found_type text;
begin
  select report_type into lost_type from public.reports where id = new.lost_report_id;
  select report_type into found_type from public.reports where id = new.found_report_id;
  if lost_type is distinct from 'lost' or found_type is distinct from 'found' then
    raise exception 'AI match must connect one lost report and one found report';
  end if;
  if TG_OP = 'INSERT' then
    if not exists (select 1 from public.reports r where r.id=new.lost_report_id and r.moderation_status='approved')
       or not exists (select 1 from public.reports r where r.id=new.found_report_id and r.moderation_status='approved') then
      raise exception 'Only approved reports can be matched';
    end if;
  elsif new.lost_report_id is distinct from old.lost_report_id or new.found_report_id is distinct from old.found_report_id then
    if not exists (select 1 from public.reports r where r.id=new.lost_report_id and r.moderation_status='approved')
       or not exists (select 1 from public.reports r where r.id=new.found_report_id and r.moderation_status='approved') then
      raise exception 'Only approved reports can be matched';
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.muaraku_bump_report_content_version()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if row(new.title, new.description, new.category_id, new.location_id, new.location_label, new.city,
         new.occurred_at, new.color, new.brand, new.model, new.item_attributes)
     is distinct from
     row(old.title, old.description, old.category_id, old.location_id, old.location_label, old.city,
         old.occurred_at, old.color, old.brand, old.model, old.item_attributes) then
    new.content_version := old.content_version + 1;
    new.moderation_status := 'pending_review';
  end if;
  return new;
end;
$$;

-- Create a profile/account-control/preferences row when a Supabase Auth user is created.
create or replace function public.muaraku_handle_new_auth_user()
returns trigger
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  derived_name text;
begin
  derived_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(split_part(coalesce(new.email, 'pengguna'), '@', 1), ''),
    'Pengguna MuaraKu'
  );
  insert into public.user_profiles(user_id, display_name)
  values (new.id, left(derived_name, 80))
  on conflict (user_id) do nothing;
  insert into public.user_account_controls(user_id, status)
  values (new.id, 'active')
  on conflict (user_id) do nothing;
  insert into public.notification_preferences(user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

-- --------------------------------------------------------------------------
-- 13. Triggers
-- --------------------------------------------------------------------------
drop trigger if exists user_profiles_set_updated_at on public.user_profiles;
create trigger user_profiles_set_updated_at before update on public.user_profiles
for each row execute function public.muaraku_set_updated_at();

drop trigger if exists locations_set_updated_at on public.locations;
create trigger locations_set_updated_at before update on public.locations
for each row execute function public.muaraku_set_updated_at();

drop trigger if exists reports_set_updated_at on public.reports;
create trigger reports_set_updated_at before update on public.reports
for each row execute function public.muaraku_set_updated_at();
drop trigger if exists reports_bump_content_version on public.reports;
create trigger reports_bump_content_version before update on public.reports
for each row execute function public.muaraku_bump_report_content_version();

drop trigger if exists report_private_details_set_updated_at on public.report_private_details;
create trigger report_private_details_set_updated_at before update on public.report_private_details
for each row execute function public.muaraku_set_updated_at();
drop trigger if exists report_matches_set_updated_at on public.report_matches;
create trigger report_matches_set_updated_at before update on public.report_matches
for each row execute function public.muaraku_set_updated_at();
drop trigger if exists claims_validate_relationship on public.claims;
create trigger claims_validate_relationship before insert or update on public.claims
for each row execute function public.muaraku_validate_claim_relationship();
drop trigger if exists claims_set_updated_at on public.claims;
create trigger claims_set_updated_at before update on public.claims
for each row execute function public.muaraku_set_updated_at();
drop trigger if exists report_matches_validate_relationship on public.report_matches;
create trigger report_matches_validate_relationship before insert or update on public.report_matches
for each row execute function public.muaraku_validate_match_relationship();
drop trigger if exists conversations_set_updated_at on public.conversations;
create trigger conversations_set_updated_at before update on public.conversations
for each row execute function public.muaraku_set_updated_at();
drop trigger if exists notification_preferences_set_updated_at on public.notification_preferences;
create trigger notification_preferences_set_updated_at before update on public.notification_preferences
for each row execute function public.muaraku_set_updated_at();
drop trigger if exists safety_reports_set_updated_at on public.safety_reports;
create trigger safety_reports_set_updated_at before update on public.safety_reports
for each row execute function public.muaraku_set_updated_at();
drop trigger if exists moderation_appeals_set_updated_at on public.moderation_appeals;
create trigger moderation_appeals_set_updated_at before update on public.moderation_appeals
for each row execute function public.muaraku_set_updated_at();
drop trigger if exists location_staff_verifications_set_updated_at on public.location_staff_verifications;
create trigger location_staff_verifications_set_updated_at before update on public.location_staff_verifications
for each row execute function public.muaraku_set_updated_at();
drop trigger if exists support_tickets_set_updated_at on public.support_tickets;
create trigger support_tickets_set_updated_at before update on public.support_tickets
for each row execute function public.muaraku_set_updated_at();

drop trigger if exists on_auth_user_created_muaraku on auth.users;
create trigger on_auth_user_created_muaraku
after insert on auth.users
for each row execute function public.muaraku_handle_new_auth_user();

-- --------------------------------------------------------------------------
-- 14. Enable Row Level Security on all application tables
-- --------------------------------------------------------------------------
alter table public.user_profiles enable row level security;
alter table public.user_account_controls enable row level security;
alter table public.staff_roles enable row level security;
alter table public.report_categories enable row level security;
alter table public.locations enable row level security;
alter table public.reports enable row level security;
alter table public.report_private_details enable row level security;
alter table public.report_media enable row level security;
alter table public.report_matches enable row level security;
alter table public.claims enable row level security;
alter table public.claim_evidence enable row level security;
alter table public.saved_reports enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.user_blocks enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.safety_reports enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.moderation_appeals enable row level security;
alter table public.location_staff_verifications enable row level security;
alter table public.support_tickets enable row level security;
alter table public.support_ticket_messages enable row level security;
alter table public.report_translations enable row level security;
alter table public.muara_ai_sessions enable row level security;
alter table public.muara_ai_messages enable row level security;
alter table public.terms_acceptances enable row level security;
alter table public.audit_logs enable row level security;

-- --------------------------------------------------------------------------
-- 15. RLS policies
-- --------------------------------------------------------------------------
-- Profiles: only public-facing fields are in this table; private status is separate.
drop policy if exists profiles_read_visible on public.user_profiles;
create policy profiles_read_visible on public.user_profiles for select to authenticated
using (user_id = auth.uid() or (profile_visibility = 'public') or public.muaraku_has_staff_role('admin'));
drop policy if exists profiles_update_own on public.user_profiles;
create policy profiles_update_own on public.user_profiles for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists account_controls_read_own_or_staff on public.user_account_controls;
create policy account_controls_read_own_or_staff on public.user_account_controls for select to authenticated
using (user_id = auth.uid() or public.muaraku_has_staff_role('admin') or public.muaraku_has_staff_role('moderator'));
drop policy if exists account_controls_staff_update on public.user_account_controls;
create policy account_controls_staff_update on public.user_account_controls for update to authenticated
using (public.muaraku_has_staff_role('admin') or public.muaraku_has_staff_role('moderator'))
with check (public.muaraku_has_staff_role('admin') or public.muaraku_has_staff_role('moderator'));

-- Roles: users can inspect their own role assignments, but cannot self-assign.
drop policy if exists staff_roles_read_self_or_admin on public.staff_roles;
create policy staff_roles_read_self_or_admin on public.staff_roles for select to authenticated
using (user_id = auth.uid() or public.muaraku_has_staff_role('admin'));
drop policy if exists staff_roles_admin_insert on public.staff_roles;
create policy staff_roles_admin_insert on public.staff_roles for insert to authenticated
with check (public.muaraku_has_staff_role('admin') and granted_by = auth.uid());
drop policy if exists staff_roles_admin_delete on public.staff_roles;
create policy staff_roles_admin_delete on public.staff_roles for delete to authenticated
using (public.muaraku_has_staff_role('admin'));

-- Reference data.
drop policy if exists categories_public_read on public.report_categories;
create policy categories_public_read on public.report_categories for select to anon, authenticated using (is_active = true or public.muaraku_has_staff_role('admin'));
drop policy if exists categories_staff_manage on public.report_categories;
create policy categories_staff_manage on public.report_categories for all to authenticated
using (public.muaraku_has_staff_role('admin') or public.muaraku_has_staff_role('moderator'))
with check (public.muaraku_has_staff_role('admin') or public.muaraku_has_staff_role('moderator'));
drop policy if exists locations_public_read on public.locations;
create policy locations_public_read on public.locations for select to anon, authenticated using (is_active = true or public.muaraku_has_staff_role('admin'));
drop policy if exists locations_staff_manage on public.locations;
create policy locations_staff_manage on public.locations for all to authenticated
using (public.muaraku_has_staff_role('admin') or public.muaraku_has_staff_role('location_verifier'))
with check (public.muaraku_has_staff_role('admin') or public.muaraku_has_staff_role('location_verifier'));

-- Reports: public app feed shows approved content; owner can always view own reports.
drop policy if exists reports_read_approved_own_or_staff on public.reports;
create policy reports_read_approved_own_or_staff on public.reports for select to authenticated
using (
  (moderation_status = 'approved' and public.muaraku_is_current_user_active())
  or reporter_user_id = auth.uid()
  or public.muaraku_has_staff_role('admin')
  or public.muaraku_has_staff_role('moderator')
);
drop policy if exists reports_insert_own_pending on public.reports;
create policy reports_insert_own_pending on public.reports for insert to authenticated
with check (
  reporter_user_id = auth.uid()
  and public.muaraku_is_current_user_active()
  and case_status = 'open'
  and moderation_status = 'pending_review'
);
drop policy if exists reports_update_own_editable on public.reports;
create policy reports_update_own_editable on public.reports for update to authenticated
using (reporter_user_id = auth.uid() and case_status in ('open','match_pending') and moderation_status <> 'removed')
with check (reporter_user_id = auth.uid() and case_status in ('open','match_pending') and moderation_status <> 'removed');
drop policy if exists reports_staff_update on public.reports;
create policy reports_staff_update on public.reports for update to authenticated
using (public.muaraku_has_staff_role('admin') or public.muaraku_has_staff_role('moderator'))
with check (public.muaraku_has_staff_role('admin') or public.muaraku_has_staff_role('moderator'));
-- Private report details: owner only from the client. Authorized staff workflows should use a vetted server route.
drop policy if exists private_details_owner_read on public.report_private_details;
create policy private_details_owner_read on public.report_private_details for select to authenticated
using (public.muaraku_is_report_owner(report_id));
drop policy if exists private_details_owner_insert on public.report_private_details;
create policy private_details_owner_insert on public.report_private_details for insert to authenticated
with check (public.muaraku_is_report_owner(report_id));
drop policy if exists private_details_owner_update on public.report_private_details;
create policy private_details_owner_update on public.report_private_details for update to authenticated
using (public.muaraku_is_report_owner(report_id)) with check (public.muaraku_is_report_owner(report_id));
drop policy if exists private_details_owner_delete on public.report_private_details;
create policy private_details_owner_delete on public.report_private_details for delete to authenticated
using (public.muaraku_is_report_owner(report_id));

-- Report media metadata follows report visibility/ownership.
drop policy if exists report_media_read_visible on public.report_media;
create policy report_media_read_visible on public.report_media for select to authenticated
using (
  exists (select 1 from public.reports r where r.id = report_id and
    (r.moderation_status = 'approved' or r.reporter_user_id = auth.uid() or public.muaraku_has_staff_role('admin') or public.muaraku_has_staff_role('moderator')))
);
drop policy if exists report_media_owner_insert on public.report_media;
create policy report_media_owner_insert on public.report_media for insert to authenticated
with check (uploaded_by = auth.uid() and public.muaraku_is_report_owner(report_id));
drop policy if exists report_media_owner_delete on public.report_media;
create policy report_media_owner_delete on public.report_media for delete to authenticated
using (uploaded_by = auth.uid() or public.muaraku_has_staff_role('admin'));

-- AI matches are only visible to owners of either participating report.
drop policy if exists report_matches_participants_read on public.report_matches;
create policy report_matches_participants_read on public.report_matches for select to authenticated
using (public.muaraku_is_report_owner(lost_report_id) or public.muaraku_is_report_owner(found_report_id) or public.muaraku_has_staff_role('admin') or public.muaraku_has_staff_role('moderator'));

-- Claims: claimant, owner of found report, and authorized reviewers only.
drop policy if exists claims_participants_read on public.claims;
create policy claims_participants_read on public.claims for select to authenticated
using (public.muaraku_can_view_claim(id));
drop policy if exists claims_claimant_insert on public.claims;
create policy claims_claimant_insert on public.claims for insert to authenticated
with check (claimant_user_id = auth.uid() and status = 'submitted' and public.muaraku_is_current_user_active());
drop policy if exists claims_staff_update on public.claims;
create policy claims_staff_update on public.claims for update to authenticated
using (public.muaraku_has_staff_role('admin') or public.muaraku_has_staff_role('moderator'))
with check (public.muaraku_has_staff_role('admin') or public.muaraku_has_staff_role('moderator'));

-- Claim evidence metadata is private to claim participants and moderators.
drop policy if exists claim_evidence_participants_read on public.claim_evidence;
create policy claim_evidence_participants_read on public.claim_evidence for select to authenticated
using (public.muaraku_can_view_claim(claim_id));
drop policy if exists claim_evidence_claimant_insert on public.claim_evidence;
create policy claim_evidence_claimant_insert on public.claim_evidence for insert to authenticated
with check (
  uploaded_by = auth.uid()
  and exists (select 1 from public.claims c where c.id = claim_id and c.claimant_user_id = auth.uid()
    and c.status in ('submitted','under_review','more_info_requested'))
);
drop policy if exists claim_evidence_uploader_delete on public.claim_evidence;
create policy claim_evidence_uploader_delete on public.claim_evidence for delete to authenticated
using (uploaded_by = auth.uid() and exists (select 1 from public.claims c where c.id=claim_id and c.claimant_user_id=auth.uid() and c.status in ('submitted','under_review','more_info_requested')));

-- Saved reports.
drop policy if exists saved_reports_read_own on public.saved_reports;
create policy saved_reports_read_own on public.saved_reports for select to authenticated using (user_id = auth.uid());
drop policy if exists saved_reports_insert_own on public.saved_reports;
create policy saved_reports_insert_own on public.saved_reports for insert to authenticated
with check (user_id = auth.uid() and exists (select 1 from public.reports r where r.id=report_id and r.moderation_status='approved'));
drop policy if exists saved_reports_delete_own on public.saved_reports;
create policy saved_reports_delete_own on public.saved_reports for delete to authenticated using (user_id = auth.uid());

-- Direct conversations and messages. Direct conversations are created via RPC.
drop policy if exists conversations_read_member_or_global on public.conversations;
create policy conversations_read_member_or_global on public.conversations for select to authenticated
using (public.muaraku_can_view_conversation(id));
drop policy if exists conversation_members_read_participants on public.conversation_members;
create policy conversation_members_read_participants on public.conversation_members for select to authenticated
using (user_id = auth.uid() or public.muaraku_can_view_conversation(conversation_id) or public.muaraku_has_staff_role('admin'));
drop policy if exists messages_read_conversation on public.messages;
create policy messages_read_conversation on public.messages for select to authenticated
using (public.muaraku_can_view_conversation(conversation_id) and (moderation_status <> 'removed' or sender_id = auth.uid() or public.muaraku_has_staff_role('admin') or public.muaraku_has_staff_role('moderator')));
drop policy if exists messages_insert_allowed on public.messages;
create policy messages_insert_allowed on public.messages for insert to authenticated
with check (sender_id = auth.uid() and moderation_status = 'approved' and public.muaraku_can_send_message(conversation_id));
drop policy if exists messages_sender_soft_delete on public.messages;
create policy messages_sender_soft_delete on public.messages for update to authenticated
using (sender_id = auth.uid()) with check (sender_id = auth.uid());
drop policy if exists messages_staff_update on public.messages;
create policy messages_staff_update on public.messages for update to authenticated
using (public.muaraku_has_staff_role('admin') or public.muaraku_has_staff_role('moderator'))
with check (public.muaraku_has_staff_role('admin') or public.muaraku_has_staff_role('moderator'));

-- Blocks are owned by the blocker; blocking prevents new direct messages via RPC/policy.
drop policy if exists blocks_read_own on public.user_blocks;
create policy blocks_read_own on public.user_blocks for select to authenticated using (blocker_user_id = auth.uid());
drop policy if exists blocks_insert_own on public.user_blocks;
create policy blocks_insert_own on public.user_blocks for insert to authenticated
with check (blocker_user_id = auth.uid() and public.muaraku_is_current_user_active());
drop policy if exists blocks_delete_own on public.user_blocks;
create policy blocks_delete_own on public.user_blocks for delete to authenticated using (blocker_user_id = auth.uid());

-- Notifications are written by trusted backend events; users can only mark as read.
drop policy if exists notifications_read_own on public.notifications;
create policy notifications_read_own on public.notifications for select to authenticated using (recipient_user_id = auth.uid());
drop policy if exists notification_preferences_read_own on public.notification_preferences;
create policy notification_preferences_read_own on public.notification_preferences for select to authenticated using (user_id = auth.uid());
drop policy if exists notification_preferences_insert_own on public.notification_preferences;
create policy notification_preferences_insert_own on public.notification_preferences for insert to authenticated with check (user_id = auth.uid());
drop policy if exists notification_preferences_update_own on public.notification_preferences;
create policy notification_preferences_update_own on public.notification_preferences for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Safety reports: own reports readable by reporter; staff can review all.
drop policy if exists safety_reports_read_reporter_or_staff on public.safety_reports;
create policy safety_reports_read_reporter_or_staff on public.safety_reports for select to authenticated
using (reporter_user_id = auth.uid() or public.muaraku_has_staff_role('admin') or public.muaraku_has_staff_role('moderator'));
drop policy if exists safety_reports_insert_own on public.safety_reports;
create policy safety_reports_insert_own on public.safety_reports for insert to authenticated
with check (reporter_user_id = auth.uid() and public.muaraku_is_current_user_active() and status = 'open');
drop policy if exists safety_reports_staff_update on public.safety_reports;
create policy safety_reports_staff_update on public.safety_reports for update to authenticated
using (public.muaraku_has_staff_role('admin') or public.muaraku_has_staff_role('moderator'))
with check (public.muaraku_has_staff_role('admin') or public.muaraku_has_staff_role('moderator'));

-- Moderation actions/audit are staff-only and append-oriented.
drop policy if exists moderation_actions_staff_read on public.moderation_actions;
drop policy if exists moderation_actions_target_or_staff_read on public.moderation_actions;
create policy moderation_actions_target_or_staff_read on public.moderation_actions for select to authenticated
using (target_user_id = auth.uid() or public.muaraku_has_staff_role('admin') or public.muaraku_has_staff_role('moderator'));
drop policy if exists moderation_actions_staff_insert on public.moderation_actions;
create policy moderation_actions_staff_insert on public.moderation_actions for insert to authenticated
with check (actor_user_id = auth.uid() and (public.muaraku_has_staff_role('admin') or public.muaraku_has_staff_role('moderator')));
drop policy if exists moderation_appeals_read_appellant_or_staff on public.moderation_appeals;
create policy moderation_appeals_read_appellant_or_staff on public.moderation_appeals for select to authenticated
using (appellant_user_id = auth.uid() or public.muaraku_has_staff_role('admin') or public.muaraku_has_staff_role('moderator'));
drop policy if exists moderation_appeals_insert_appellant on public.moderation_appeals;
create policy moderation_appeals_insert_appellant on public.moderation_appeals for insert to authenticated
with check (
  appellant_user_id = auth.uid()
  and status = 'submitted'
  and exists (select 1 from public.moderation_actions ma where ma.id=moderation_action_id and ma.target_user_id=auth.uid()
    and ma.action_type in ('warning','restrict','suspend','ban'))
);
drop policy if exists moderation_appeals_staff_update on public.moderation_appeals;
create policy moderation_appeals_staff_update on public.moderation_appeals for update to authenticated
using (public.muaraku_has_staff_role('admin') or public.muaraku_has_staff_role('moderator'))
with check (public.muaraku_has_staff_role('admin') or public.muaraku_has_staff_role('moderator'));

-- Location staff status can be requested by a user, but only staff can verify/revoke it.
drop policy if exists location_staff_read_self_verified_or_staff on public.location_staff_verifications;
create policy location_staff_read_self_verified_or_staff on public.location_staff_verifications for select to authenticated
using (user_id = auth.uid() or status = 'verified' or public.muaraku_has_staff_role('admin') or public.muaraku_has_staff_role('location_verifier'));
drop policy if exists location_staff_insert_own_pending on public.location_staff_verifications;
create policy location_staff_insert_own_pending on public.location_staff_verifications for insert to authenticated
with check (user_id = auth.uid() and status = 'pending' and verified_by is null and public.muaraku_is_current_user_active());
drop policy if exists location_staff_staff_update on public.location_staff_verifications;
create policy location_staff_staff_update on public.location_staff_verifications for update to authenticated
using (public.muaraku_has_staff_role('admin') or public.muaraku_has_staff_role('location_verifier'))
with check (public.muaraku_has_staff_role('admin') or public.muaraku_has_staff_role('location_verifier'));

-- Support tickets.
drop policy if exists support_tickets_read_owner_or_staff on public.support_tickets;
create policy support_tickets_read_owner_or_staff on public.support_tickets for select to authenticated
using (owner_user_id = auth.uid() or public.muaraku_has_staff_role('admin') or public.muaraku_has_staff_role('support') or public.muaraku_has_staff_role('moderator'));
drop policy if exists support_tickets_insert_own on public.support_tickets;
create policy support_tickets_insert_own on public.support_tickets for insert to authenticated
with check (owner_user_id = auth.uid() and status = 'open');
drop policy if exists support_tickets_staff_update on public.support_tickets;
create policy support_tickets_staff_update on public.support_tickets for update to authenticated
using (public.muaraku_has_staff_role('admin') or public.muaraku_has_staff_role('support'))
with check (public.muaraku_has_staff_role('admin') or public.muaraku_has_staff_role('support'));
drop policy if exists support_ticket_messages_read_participants on public.support_ticket_messages;
create policy support_ticket_messages_read_participants on public.support_ticket_messages for select to authenticated
using (
  exists (select 1 from public.support_tickets t where t.id=ticket_id and
    (t.owner_user_id=auth.uid() or public.muaraku_has_staff_role('admin') or public.muaraku_has_staff_role('support') or public.muaraku_has_staff_role('moderator')))
  and (is_internal = false or public.muaraku_has_staff_role('admin') or public.muaraku_has_staff_role('support'))
);
drop policy if exists support_ticket_messages_insert_owner_or_staff on public.support_ticket_messages;
create policy support_ticket_messages_insert_owner_or_staff on public.support_ticket_messages for insert to authenticated
with check (
  sender_user_id = auth.uid()
  and is_internal = false
  and exists (select 1 from public.support_tickets t where t.id=ticket_id and t.status not in ('resolved','closed')
    and (t.owner_user_id=auth.uid() or public.muaraku_has_staff_role('admin') or public.muaraku_has_staff_role('support')))
);

-- Translation cache is readable only when the associated report is readable.
drop policy if exists translations_read_visible_report on public.report_translations;
create policy translations_read_visible_report on public.report_translations for select to authenticated
using (exists (select 1 from public.reports r where r.id=report_id and
  (r.moderation_status='approved' or r.reporter_user_id=auth.uid() or public.muaraku_has_staff_role('admin') or public.muaraku_has_staff_role('moderator'))));

-- Muara AI chat history: owner-only reading; creation and model replies use a
-- trusted Next.js server route so users cannot impersonate assistant messages.
drop policy if exists muara_ai_sessions_read_own on public.muara_ai_sessions;
create policy muara_ai_sessions_read_own on public.muara_ai_sessions for select to authenticated using (user_id = auth.uid());
drop policy if exists muara_ai_messages_read_own on public.muara_ai_messages;
create policy muara_ai_messages_read_own on public.muara_ai_messages for select to authenticated
using (exists (select 1 from public.muara_ai_sessions s where s.id=session_id and s.user_id=auth.uid()));
drop policy if exists muara_ai_messages_feedback_own on public.muara_ai_messages;
create policy muara_ai_messages_feedback_own on public.muara_ai_messages for update to authenticated
using (role='assistant' and exists (select 1 from public.muara_ai_sessions s where s.id=session_id and s.user_id=auth.uid()))
with check (role='assistant' and exists (select 1 from public.muara_ai_sessions s where s.id=session_id and s.user_id=auth.uid()));

-- Terms/privacy acceptance records.
drop policy if exists terms_acceptances_read_own_or_admin on public.terms_acceptances;
create policy terms_acceptances_read_own_or_admin on public.terms_acceptances for select to authenticated
using (user_id=auth.uid() or public.muaraku_has_staff_role('admin'));
drop policy if exists terms_acceptances_insert_own on public.terms_acceptances;
create policy terms_acceptances_insert_own on public.terms_acceptances for insert to authenticated
with check (user_id=auth.uid());

-- Audit log can only be read by admins; insert via trusted server/service role.
drop policy if exists audit_logs_admin_read on public.audit_logs;
create policy audit_logs_admin_read on public.audit_logs for select to authenticated using (public.muaraku_has_staff_role('admin'));

-- --------------------------------------------------------------------------
-- 16. Column grants and table grants
-- Start restrictive for authenticated clients; trusted server/service role can
-- perform backend jobs. RLS remains enabled even with broad authenticated grants.
-- --------------------------------------------------------------------------
revoke all on public.user_profiles from anon, authenticated;
grant select on public.user_profiles to authenticated;
grant update (username, display_name, avatar_path, bio, preferred_language, theme, profile_visibility) on public.user_profiles to authenticated;

revoke all on public.user_account_controls from anon, authenticated;
grant select on public.user_account_controls to authenticated;
grant update (status, public_message, effective_until, updated_by) on public.user_account_controls to authenticated;

revoke all on public.staff_roles from anon, authenticated;
grant select, insert, delete on public.staff_roles to authenticated;

revoke all on public.report_categories from anon, authenticated;
grant select on public.report_categories to anon, authenticated;
grant insert, update, delete on public.report_categories to authenticated;
revoke all on public.locations from anon, authenticated;
grant select on public.locations to anon, authenticated;
grant insert, update, delete on public.locations to authenticated;

revoke all on public.reports from anon, authenticated;
grant select on public.reports to authenticated;
grant insert (reporter_user_id, report_type, title, description, category_id, location_id, location_label, city, occurred_at, color, brand, model, item_attributes) on public.reports to authenticated;
grant update (title, description, category_id, location_id, location_label, city, occurred_at, color, brand, model, item_attributes) on public.reports to authenticated;
-- Case and moderation status are changed through trusted Next.js server routes,
-- so clients cannot approve/close their own reports or delete history.

revoke all on public.report_private_details from anon, authenticated;
grant select, insert, update, delete on public.report_private_details to authenticated;
revoke all on public.report_media from anon, authenticated;
grant select, insert, delete on public.report_media to authenticated;
revoke all on public.report_matches from anon, authenticated;
grant select on public.report_matches to authenticated;
revoke all on public.claims from anon, authenticated;
grant select on public.claims to authenticated;
grant insert (found_report_id, lost_report_id, claimant_user_id, claimant_message) on public.claims to authenticated;
grant update (status, public_response, reviewed_by, reviewed_at) on public.claims to authenticated;
revoke all on public.claim_evidence from anon, authenticated;
grant select, insert, delete on public.claim_evidence to authenticated;
revoke all on public.saved_reports from anon, authenticated;
grant select, insert, delete on public.saved_reports to authenticated;

revoke all on public.conversations from anon, authenticated;
grant select on public.conversations to authenticated;
revoke all on public.conversation_members from anon, authenticated;
grant select on public.conversation_members to authenticated;
revoke all on public.messages from anon, authenticated;
grant select on public.messages to authenticated;
grant insert (conversation_id, sender_id, body, message_kind, attachment_path) on public.messages to authenticated;
grant update (deleted_at) on public.messages to authenticated;
revoke all on public.user_blocks from anon, authenticated;
grant select, insert, delete on public.user_blocks to authenticated;

revoke all on public.notifications from anon, authenticated;
grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;
revoke all on public.notification_preferences from anon, authenticated;
grant select, insert, update on public.notification_preferences to authenticated;

revoke all on public.safety_reports from anon, authenticated;
grant select on public.safety_reports to authenticated;
grant insert (reporter_user_id, target_type, target_user_id, target_report_id, target_message_id, reason, details) on public.safety_reports to authenticated;
grant update (status, assigned_to, resolution_message, resolved_at) on public.safety_reports to authenticated;
revoke all on public.moderation_actions from anon, authenticated;
grant select, insert on public.moderation_actions to authenticated;
revoke all on public.moderation_appeals from anon, authenticated;
grant select, insert on public.moderation_appeals to authenticated;
grant update (status, response, reviewer_user_id, reviewed_at) on public.moderation_appeals to authenticated;
revoke all on public.location_staff_verifications from anon, authenticated;
grant select, insert on public.location_staff_verifications to authenticated;
grant update (status, verified_by, valid_until, reviewer_message, public_label, organization_name) on public.location_staff_verifications to authenticated;

revoke all on public.support_tickets from anon, authenticated;
grant select on public.support_tickets to authenticated;
grant insert (owner_user_id, contact_email, category, subject, initial_message) on public.support_tickets to authenticated;
grant update (status, priority, assigned_to, closed_at) on public.support_tickets to authenticated;
revoke all on public.support_ticket_messages from anon, authenticated;
grant select on public.support_ticket_messages to authenticated;
grant insert (ticket_id, sender_user_id, body) on public.support_ticket_messages to authenticated;
revoke all on public.report_translations from anon, authenticated;
grant select on public.report_translations to authenticated;
revoke all on public.muara_ai_sessions from anon, authenticated;
grant select on public.muara_ai_sessions to authenticated;
revoke all on public.muara_ai_messages from anon, authenticated;
grant select on public.muara_ai_messages to authenticated;
grant update (feedback_score, feedback_text) on public.muara_ai_messages to authenticated;
revoke all on public.terms_acceptances from anon, authenticated;
grant select on public.terms_acceptances to authenticated;
grant insert (user_id, document_type, document_version) on public.terms_acceptances to authenticated;
revoke all on public.audit_logs from anon, authenticated;
grant select on public.audit_logs to authenticated;

-- Server-side Supabase clients using the service_role/secret key are trusted
-- code paths. Keep this key in server-only environment variables; never in NEXT_PUBLIC_*.
grant all on public.user_profiles, public.user_account_controls, public.staff_roles, public.report_categories, public.locations, public.reports, public.report_private_details, public.report_media, public.report_matches, public.claims, public.claim_evidence, public.saved_reports, public.conversations, public.conversation_members, public.messages, public.user_blocks, public.notifications, public.notification_preferences, public.safety_reports, public.moderation_actions, public.moderation_appeals, public.location_staff_verifications, public.support_tickets, public.support_ticket_messages, public.report_translations, public.muara_ai_sessions, public.muara_ai_messages, public.terms_acceptances, public.audit_logs to service_role;

-- Functions callable by authenticated app users. Trigger functions are not RPC APIs.
revoke all on function public.muaraku_has_staff_role(text) from public, anon;
revoke all on function public.muaraku_is_active_user(uuid) from public, anon, authenticated;
revoke all on function public.muaraku_is_current_user_active() from public, anon;
revoke all on function public.muaraku_is_report_owner(uuid) from public, anon;
revoke all on function public.muaraku_are_users_blocked(uuid, uuid) from public, anon, authenticated;
revoke all on function public.muaraku_is_conversation_member(uuid, uuid) from public, anon, authenticated;
revoke all on function public.muaraku_can_view_conversation(uuid) from public, anon;
revoke all on function public.muaraku_can_send_message(uuid) from public, anon;
revoke all on function public.muaraku_can_view_claim(uuid) from public, anon;
revoke all on function public.muaraku_create_direct_conversation(uuid, uuid) from public, anon;
revoke all on function public.muaraku_withdraw_claim(uuid) from public, anon;
grant execute on function public.muaraku_has_staff_role(text) to anon, authenticated, service_role;
grant execute on function public.muaraku_is_current_user_active() to authenticated, service_role;
grant execute on function public.muaraku_is_active_user(uuid) to service_role;
grant execute on function public.muaraku_is_report_owner(uuid) to authenticated, service_role;
grant execute on function public.muaraku_are_users_blocked(uuid, uuid) to service_role;
grant execute on function public.muaraku_is_conversation_member(uuid, uuid) to service_role;
grant execute on function public.muaraku_can_view_conversation(uuid) to authenticated, service_role;
grant execute on function public.muaraku_can_send_message(uuid) to authenticated, service_role;
grant execute on function public.muaraku_can_view_claim(uuid) to authenticated, service_role;
grant execute on function public.muaraku_create_direct_conversation(uuid, uuid) to authenticated, service_role;
grant execute on function public.muaraku_withdraw_claim(uuid) to authenticated, service_role;

-- --------------------------------------------------------------------------
-- 17. Supabase Storage buckets and access policies
-- All buckets are private. Use authenticated access/signed URLs for downloads.
-- Existing buckets are not overwritten by this seed.
-- --------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('report-images','report-images',false,8388608,array['image/jpeg','image/png','image/webp']),
  ('claim-evidence','claim-evidence',false,8388608,array['image/jpeg','image/png','image/webp','application/pdf']),
  ('message-attachments','message-attachments',false,10485760,array['image/jpeg','image/png','image/webp','application/pdf']),
  ('avatars','avatars',false,2097152,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- Report image paths must be: <user_id>/<report_id>/<filename>
drop policy if exists muaraku_report_images_read_visible on storage.objects;
create policy muaraku_report_images_read_visible on storage.objects for select to authenticated
using (
  bucket_id = 'report-images'
  and exists (
    select 1 from public.report_media rm
    join public.reports r on r.id = rm.report_id
    where rm.object_path = name
      and (r.moderation_status='approved' or r.reporter_user_id=auth.uid() or public.muaraku_has_staff_role('admin') or public.muaraku_has_staff_role('moderator'))
  )
);
drop policy if exists muaraku_report_images_insert_owner on storage.objects;
create policy muaraku_report_images_insert_owner on storage.objects for insert to authenticated
with check (
  bucket_id='report-images'
  and (storage.foldername(name))[1]=auth.uid()::text
  and exists (select 1 from public.reports r where r.id::text=(storage.foldername(name))[2] and r.reporter_user_id=auth.uid())
);
drop policy if exists muaraku_report_images_update_owner on storage.objects;
create policy muaraku_report_images_update_owner on storage.objects for update to authenticated
using (bucket_id='report-images' and (storage.foldername(name))[1]=auth.uid()::text)
with check (bucket_id='report-images' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists muaraku_report_images_delete_owner on storage.objects;
create policy muaraku_report_images_delete_owner on storage.objects for delete to authenticated
using (bucket_id='report-images' and (storage.foldername(name))[1]=auth.uid()::text);

-- Claim evidence paths: <claimant_user_id>/<claim_id>/<filename>. Only claim
-- participants can download evidence; never expose this bucket as public.
drop policy if exists muaraku_claim_evidence_read_participants on storage.objects;
create policy muaraku_claim_evidence_read_participants on storage.objects for select to authenticated
using (
  bucket_id='claim-evidence'
  and exists (select 1 from public.claim_evidence ce where ce.storage_path=name and public.muaraku_can_view_claim(ce.claim_id))
);
drop policy if exists muaraku_claim_evidence_insert_claimant on storage.objects;
create policy muaraku_claim_evidence_insert_claimant on storage.objects for insert to authenticated
with check (
  bucket_id='claim-evidence'
  and (storage.foldername(name))[1]=auth.uid()::text
  and exists (select 1 from public.claims c where c.id::text=(storage.foldername(name))[2]
    and c.claimant_user_id=auth.uid() and c.status in ('submitted','under_review','more_info_requested'))
);
drop policy if exists muaraku_claim_evidence_delete_claimant on storage.objects;
create policy muaraku_claim_evidence_delete_claimant on storage.objects for delete to authenticated
using (bucket_id='claim-evidence' and (storage.foldername(name))[1]=auth.uid()::text);

-- Message attachment paths: <sender_user_id>/<conversation_id>/<filename>
drop policy if exists muaraku_message_attachments_read_conversation on storage.objects;
create policy muaraku_message_attachments_read_conversation on storage.objects for select to authenticated
using (
  bucket_id='message-attachments'
  and exists (select 1 from public.messages m where m.attachment_path=name and public.muaraku_can_view_conversation(m.conversation_id))
);
drop policy if exists muaraku_message_attachments_insert_sender on storage.objects;
create policy muaraku_message_attachments_insert_sender on storage.objects for insert to authenticated
with check (
  bucket_id='message-attachments'
  and (storage.foldername(name))[1]=auth.uid()::text
  and exists (select 1 from public.conversations c where c.id::text=(storage.foldername(name))[2] and public.muaraku_can_send_message(c.id))
);
drop policy if exists muaraku_message_attachments_delete_sender on storage.objects;
create policy muaraku_message_attachments_delete_sender on storage.objects for delete to authenticated
using (bucket_id='message-attachments' and (storage.foldername(name))[1]=auth.uid()::text);

-- Avatar paths: <user_id>/<filename>. Private bucket, signed URLs may be used.
drop policy if exists muaraku_avatars_read_profile on storage.objects;
create policy muaraku_avatars_read_profile on storage.objects for select to authenticated
using (
  bucket_id='avatars'
  and exists (select 1 from public.user_profiles p where p.avatar_path=name and
    (p.user_id=auth.uid() or p.profile_visibility='public' or public.muaraku_has_staff_role('admin')))
);
drop policy if exists muaraku_avatars_insert_own on storage.objects;
create policy muaraku_avatars_insert_own on storage.objects for insert to authenticated
with check (bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists muaraku_avatars_update_own on storage.objects;
create policy muaraku_avatars_update_own on storage.objects for update to authenticated
using (bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text)
with check (bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists muaraku_avatars_delete_own on storage.objects;
create policy muaraku_avatars_delete_own on storage.objects for delete to authenticated
using (bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);

commit;

-- ============================================================================
-- POST-INSTALL NOTES
-- 1. Add an initial administrator from Supabase SQL Editor only after the user
--    account exists. Replace the UUID with the trusted account's auth.users id:
--      insert into public.staff_roles(user_id, role)
--      values ('YOUR_AUTH_USER_UUID', 'admin') on conflict do nothing;
--    Do not expose an admin registration switch in the frontend.
--
-- 2. Report image upload path: <auth.uid()>/<report_id>/<filename>
--    Claim evidence path:       <auth.uid()>/<claim_id>/<filename>
--    Message attachment path:   <auth.uid()>/<conversation_id>/<filename>
--    Avatar path:               <auth.uid()>/<filename>
--
-- 3. Reports are inserted with moderation_status='pending_review'; they do not
--    appear in the community feed until approved. A trusted server/moderation
--    workflow must approve/flag/remove them. Do not let clients set these fields.
--
-- 4. AI service writes report_matches and report_translations through a trusted
--    backend/service client. Never trust client-supplied match scores.
--
-- 5. Support form submissions from signed-out visitors must call a rate-limited
--    Next.js server route. Do not grant open anonymous INSERT on support_tickets.
--
-- 6. Muara AI conversation history is persisted in muara_ai_sessions/messages.
--    The trusted backend must validate session ownership before writes and apply
--    a retention/deletion policy. Never save OTPs, API keys, or hidden claim clues.
--
-- 7. Supabase Auth owns OTP state, expiry, rate limits, verification and sessions.
--    Configure Resend as Supabase custom SMTP later; no OTP table/API key is
--    required in this database schema.
--
-- 8. This starter schema does not replace a security review, application tests,
--    Storage policy review, backup plan, or a data retention/deletion workflow.
-- ============================================================================


-- ============================================================================
-- MuaraKu — simplify application schema to 22 public tables
-- Migration from the user's original schema: muaraku_supabase_schema(2).sql
--
-- IMPORTANT:
-- 1. In this combined file, the source schema was created in the previous section.
-- 2. This section is not intended to be run by itself on an empty database.
-- 3. The transaction is guarded: deferred tables with data stop the migration.
-- 4. Supabase Auth continues to own identity, credentials, OTP, and sessions.
-- 5. The final public application schema has 22 tables; removed tables are empty
--    in a fresh install, and the source data file above remains unchanged.
-- ============================================================================

begin;

-- --------------------------------------------------------------------------
-- 0. Preflight: require original schema and prevent silent loss from deferred
--    tables that are not yet part of the MVP.
-- --------------------------------------------------------------------------
do $$
declare
  required_table text;
  deferred_count bigint;
begin
  foreach required_table in array array[
    'user_profiles', 'user_account_controls', 'staff_roles', 'report_categories',
    'locations', 'reports', 'report_private_details', 'report_media',
    'report_matches', 'claims', 'claim_evidence', 'saved_reports',
    'conversations', 'conversation_members', 'messages', 'user_blocks',
    'notifications', 'notification_preferences', 'safety_reports',
    'moderation_actions', 'moderation_appeals', 'location_staff_verifications',
    'support_tickets', 'support_ticket_messages', 'report_translations',
    'muara_ai_sessions', 'muara_ai_messages', 'terms_acceptances', 'audit_logs'
  ] loop
    if to_regclass('public.' || required_table) is null then
      raise exception 'Migration cancelled: expected original table public.% is missing. Compare the live database with the source schema first.', required_table;
    end if;
  end loop;

  select count(*) into deferred_count
  from public.notification_preferences np
  left join public.user_account_controls uac on uac.user_id = np.user_id
  where uac.user_id is null;
  if deferred_count > 0 then
    raise exception 'Migration cancelled: % notification preference rows have no user_account_controls row. Reconcile these users before migrating preferences.', deferred_count;
  end if;

  select count(*) into deferred_count
  from public.locations l
  where not exists (select 1 from public.reports r where r.location_id = l.id);
  if deferred_count > 0 then
    raise exception 'Migration cancelled: public.locations contains % location-catalog rows not referenced by any report. Export/review this catalogue before removing the locations table.', deferred_count;
  end if;

  select count(*) into deferred_count
  from public.locations l
  where l.parent_id is not null
     or l.address is not null
     or l.province is not null
     or l.latitude is not null
     or l.longitude is not null
     or l.is_active = false
     or l.created_by is not null;
  if deferred_count > 0 then
    raise exception 'Migration cancelled: public.locations contains % rows with hierarchy/address/coordinates/admin-state fields that are not represented in the simpler reports.location_label + city model. Export/review them before continuing.', deferred_count;
  end if;

  select count(*) into deferred_count from public.report_matches;
  if deferred_count > 0 then
    raise exception 'Migration cancelled: public.report_matches contains % rows. Export/review these matches before removing this deferred table.', deferred_count;
  end if;

  select count(*) into deferred_count from public.report_translations;
  if deferred_count > 0 then
    raise exception 'Migration cancelled: public.report_translations contains % rows. Export/review these rows before removing the deferred translation cache.', deferred_count;
  end if;

  select count(*) into deferred_count from public.moderation_appeals;
  if deferred_count > 0 then
    raise exception 'Migration cancelled: public.moderation_appeals contains % rows. Preserve/review appeals before deferring this feature.', deferred_count;
  end if;

  select count(*) into deferred_count from public.location_staff_verifications;
  if deferred_count > 0 then
    raise exception 'Migration cancelled: public.location_staff_verifications contains % rows. Preserve/review verification records before deferring this feature.', deferred_count;
  end if;
end;
$$;

-- --------------------------------------------------------------------------
-- 1. Merge notification preferences into the existing private one-row-per-user
--    account-controls row. Do NOT put these columns on user_profiles, because
--    profiles can be visible to other users and preferences are private.
-- --------------------------------------------------------------------------
alter table public.user_account_controls
  add column if not exists notify_in_app_messages boolean not null default true,
  add column if not exists notify_in_app_matches boolean not null default true,
  add column if not exists notify_in_app_claim_updates boolean not null default true,
  add column if not exists notify_in_app_moderation_updates boolean not null default true,
  add column if not exists notify_email_messages boolean not null default false,
  add column if not exists notify_email_matches boolean not null default false,
  add column if not exists notify_email_claim_updates boolean not null default true,
  add column if not exists notify_email_moderation_updates boolean not null default true;

update public.user_account_controls uac
set notify_in_app_messages = np.in_app_messages,
    notify_in_app_matches = np.in_app_matches,
    notify_in_app_claim_updates = np.in_app_claim_updates,
    notify_in_app_moderation_updates = np.in_app_moderation_updates,
    notify_email_messages = np.email_messages,
    notify_email_matches = np.email_matches,
    notify_email_claim_updates = np.email_claim_updates,
    notify_email_moderation_updates = np.email_moderation_updates,
    updated_at = now()
from public.notification_preferences np
where np.user_id = uac.user_id;

-- Replace the Auth signup trigger function so it no longer writes to the table
-- that is being removed. The existing auth.users trigger remains attached.
create or replace function public.muaraku_handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  derived_name text;
begin
  derived_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(split_part(coalesce(new.email, 'pengguna'), '@', 1), ''),
    'Pengguna MuaraKu'
  );

  insert into public.user_profiles(user_id, display_name)
  values (new.id, left(derived_name, 80))
  on conflict (user_id) do nothing;

  insert into public.user_account_controls(user_id, status)
  values (new.id, 'active')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- --------------------------------------------------------------------------
-- 2. Replace structured location foreign key with report-level location text.
--    Existing display labels/city values are retained; missing ones are copied
--    from the referenced location before the foreign key is removed.
-- --------------------------------------------------------------------------
update public.reports r
set location_label = coalesce(nullif(trim(r.location_label), ''), l.name),
    city = coalesce(nullif(trim(r.city), ''), nullif(trim(l.city), ''))
from public.locations l
where r.location_id = l.id
  and (nullif(trim(r.location_label), '') is null or nullif(trim(r.city), '') is null);

drop index if exists public.reports_location_idx;

-- Replace the trigger function before removing the old foreign-key column so no
-- executable trigger code continues to refer to reports.location_id.
create or replace function public.muaraku_bump_report_content_version()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if row(new.title, new.description, new.category_id, new.location_label, new.city,
         new.occurred_at, new.color, new.brand, new.model, new.item_attributes)
     is distinct from
     row(old.title, old.description, old.category_id, old.location_label, old.city,
         old.occurred_at, old.color, old.brand, old.model, old.item_attributes) then
    new.content_version := old.content_version + 1;
    new.moderation_status := 'pending_review';
  end if;
  return new;
end;
$$;

alter table public.reports drop column if exists location_id;

-- Update column-level client grants to match the new reports shape.
revoke all on public.reports from anon, authenticated;
grant select on public.reports to authenticated;
grant insert (reporter_user_id, report_type, title, description, category_id,
              location_label, city, occurred_at, color, brand, model, item_attributes)
  on public.reports to authenticated;
grant update (title, description, category_id, location_label, city, occurred_at,
              color, brand, model, item_attributes)
  on public.reports to authenticated;

-- --------------------------------------------------------------------------
-- 3. Merge moderation actions into the general audit log, then rename the
--    resulting table to admin_activity_logs. Moderation reasons/messages/expiry
--    and source IDs are preserved in JSON metadata.
-- --------------------------------------------------------------------------
insert into public.audit_logs
  (actor_user_id, action, target_type, target_id, metadata, created_at)
select
  ma.actor_user_id,
  left('moderation:' || ma.action_type, 120),
  case
    when ma.target_user_id is not null then 'user'
    when ma.target_report_id is not null then 'report'
    when ma.target_message_id is not null then 'message'
    when ma.safety_report_id is not null then 'safety_report'
    else null
  end,
  coalesce(ma.target_user_id::text, ma.target_report_id::text,
           ma.target_message_id::text, ma.safety_report_id::text),
  jsonb_strip_nulls(jsonb_build_object(
    'source_table', 'moderation_actions',
    'source_id', ma.id,
    'action_type', ma.action_type,
    'reason', ma.reason,
    'public_message', ma.public_message,
    'expires_at', ma.expires_at,
    'target_user_id', ma.target_user_id,
    'target_report_id', ma.target_report_id,
    'target_message_id', ma.target_message_id,
    'safety_report_id', ma.safety_report_id
  )),
  ma.created_at
from public.moderation_actions ma;

-- --------------------------------------------------------------------------
-- 4. Drop the deferred empty tables. All related policies, triggers and indexes
--    are removed with their parent tables. Foreign key dependencies are dropped
--    in dependency-safe order.
-- --------------------------------------------------------------------------
drop table public.moderation_appeals;
drop table public.location_staff_verifications;
drop table public.report_matches;
drop table public.report_translations;
drop table public.notification_preferences;
drop table public.moderation_actions;
drop table public.locations;

drop function if exists public.muaraku_validate_match_relationship();

-- --------------------------------------------------------------------------
-- 5. Rename the surviving audit table and refresh the access rules/grants.
-- --------------------------------------------------------------------------
alter table public.audit_logs rename to admin_activity_logs;

alter index if exists public.audit_logs_actor_idx rename to admin_activity_logs_actor_idx;
alter index if exists public.audit_logs_target_idx rename to admin_activity_logs_target_idx;
alter index if exists public.audit_logs_created_idx rename to admin_activity_logs_created_idx;

drop policy if exists audit_logs_admin_read on public.admin_activity_logs;
drop policy if exists admin_activity_logs_admin_read on public.admin_activity_logs;
create policy admin_activity_logs_admin_read
  on public.admin_activity_logs for select to authenticated
  using (public.muaraku_has_staff_role('admin'));

revoke all on public.admin_activity_logs from anon, authenticated;
grant select on public.admin_activity_logs to authenticated;
grant all on public.admin_activity_logs to service_role;

-- Preferences remain private in user_account_controls. A narrow column grant plus
-- an owner-only RLS policy lets users update preferences without editing status.
drop policy if exists account_controls_preferences_update_own on public.user_account_controls;
create policy account_controls_preferences_update_own
  on public.user_account_controls for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Remove old client-side update rights for account status. The owner-only policy
-- below must not be usable to change status/ban fields. Preferences are client-
-- editable; status/restriction fields are changed only by a trusted server route.
revoke update on public.user_account_controls from anon, authenticated;
revoke update (status, public_message, effective_until, updated_by)
  on public.user_account_controls from authenticated;
grant update (
  notify_in_app_messages,
  notify_in_app_matches,
  notify_in_app_claim_updates,
  notify_in_app_moderation_updates,
  notify_email_messages,
  notify_email_matches,
  notify_email_claim_updates,
  notify_email_moderation_updates
) on public.user_account_controls to authenticated;

drop trigger if exists user_account_controls_set_updated_at on public.user_account_controls;
create trigger user_account_controls_set_updated_at before update on public.user_account_controls
for each row execute function public.muaraku_set_updated_at();

-- Keep the retained app tables enabled for RLS; this is explicit documentation
-- and makes the intended final shape easy to verify during review.
alter table public.user_profiles enable row level security;
alter table public.user_account_controls enable row level security;
alter table public.staff_roles enable row level security;
alter table public.report_categories enable row level security;
alter table public.reports enable row level security;
alter table public.report_private_details enable row level security;
alter table public.report_media enable row level security;
alter table public.claims enable row level security;
alter table public.claim_evidence enable row level security;
alter table public.saved_reports enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.user_blocks enable row level security;
alter table public.notifications enable row level security;
alter table public.safety_reports enable row level security;
alter table public.admin_activity_logs enable row level security;
alter table public.support_tickets enable row level security;
alter table public.support_ticket_messages enable row level security;
alter table public.muara_ai_sessions enable row level security;
alter table public.muara_ai_messages enable row level security;
alter table public.terms_acceptances enable row level security;

-- --------------------------------------------------------------------------
-- 6. Final structural assertion: the 22 target application tables must exist.
--    This checks the named target set, not unrelated tables in public schema.
-- --------------------------------------------------------------------------
do $$
declare
  retained_count integer;
begin
  select count(*) into retained_count
  from information_schema.tables
  where table_schema = 'public'
    and table_type = 'BASE TABLE'
    and table_name in (
      'user_profiles', 'user_account_controls', 'staff_roles', 'report_categories',
      'reports', 'report_private_details', 'report_media', 'claims', 'claim_evidence',
      'saved_reports', 'conversations', 'conversation_members', 'messages', 'user_blocks',
      'notifications', 'safety_reports', 'admin_activity_logs', 'support_tickets',
      'support_ticket_messages', 'muara_ai_sessions', 'muara_ai_messages', 'terms_acceptances'
    );

  if retained_count <> 22 then
    raise exception 'Migration verification failed: expected 22 retained MuaraKu tables, found %.', retained_count;
  end if;
end;
$$;

commit;

-- Verification query: expected result is 22 rows.
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_type = 'BASE TABLE'
  and table_name in (
    'user_profiles', 'user_account_controls', 'staff_roles', 'report_categories',
    'reports', 'report_private_details', 'report_media', 'claims', 'claim_evidence',
    'saved_reports', 'conversations', 'conversation_members', 'messages', 'user_blocks',
    'notifications', 'safety_reports', 'admin_activity_logs', 'support_tickets',
    'support_ticket_messages', 'muara_ai_sessions', 'muara_ai_messages', 'terms_acceptances'
  )
order by table_name;
