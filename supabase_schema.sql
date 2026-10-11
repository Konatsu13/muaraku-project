-- ==========================================================
-- MUARAKU (LOST & FOUND SEKOLAH & KOMUNITAS) SUPABASE SCHEMA
-- Standar Produksi 2026: Auth, RLS, Storage, & Database Triggers
-- ==========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (Terkoneksi langsung dengan auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null,
  phone text,
  role text not null default 'student' check (role in ('student', 'teacher', 'staff', 'admin')),
  institution text default 'SMA Negeri 1 / Lingkungan Sekolah',
  is_verified_staff boolean default false,
  staff_authority_id text,
  avatar_url text,
  civic_karma integer default 100,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger Otomatis: Buat Profil saat Pengguna Mendaftar di Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'https://api.dicebear.com/7.x/initials/svg?seed=' || encode(coalesce(new.raw_user_meta_data->>'name', new.email)::bytea, 'escape'),
    'student'
  )
  on conflict (id) do update set
    name = excluded.name,
    email = excluded.email;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. REPORTS TABLE (LOST & FOUND)
create table if not exists public.reports (
  id text primary key,
  report_code text unique not null,
  report_type text not null check (report_type in ('lost', 'found')),
  title text not null,
  category text not null check (category in ('Dompet & Kartu', 'Elektronik', 'Kunci & Aksesori', 'Buku & Dokumen', 'Tas & Pakaian', 'Lainnya')),
  facility_location text not null,
  location_detail text,
  incident_time timestamp with time zone not null,
  public_description text not null,
  image_url text not null,
  additional_images text[],
  
  -- Zero-Knowledge private clues (untuk pencocokan klaim)
  secret_clue text,
  secret_serial text,
  is_dropped_at_staff_pos boolean default false,
  
  status text not null default 'Open' check (status in ('Open', 'Potential Match', 'Claim in Progress', 'Returned', 'Closed')),
  
  reporter_id text not null,
  reporter_name text not null,
  reporter_avatar text,
  reporter_is_staff boolean default false,
  reporter_staff_badge text,
  
  match_percentage integer,
  match_candidate_id text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. CLAIMS TABLE
create table if not exists public.claims (
  id text primary key,
  report_id text references public.reports(id) on delete cascade not null,
  report_title text not null,
  claimant_id text not null,
  claimant_name text not null,
  claimant_avatar text,
  proof_description text not null,
  proof_serial text,
  proof_image_url text,
  status text not null default 'Pending Review' check (status in ('Pending Review', 'Approved', 'Rejected', 'Completed')),
  meeting_location text,
  handover_qr text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  reviewed_at timestamp with time zone,
  review_notes text
);

-- 4. GLOBAL CHAT MESSAGES
create table if not exists public.global_chat_messages (
  id text primary key,
  user_id text not null,
  user_name text not null,
  user_avatar text,
  is_verified_staff boolean default false,
  role_tag text,
  content text not null,
  channel text not null check (channel in ('Umum', 'Kampus & Sekolah', 'Stasiun & Pos')),
  timestamp text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. CONVERSATIONS & PRIVATE MESSAGES
create table if not exists public.conversations (
  id text primary key,
  claim_id text,
  report_id text,
  report_title text not null,
  report_code text not null,
  other_user_id text not null,
  other_user_name text not null,
  other_user_avatar text,
  other_user_is_staff boolean default false,
  last_message text not null,
  last_message_time text not null,
  unread_count integer default 0,
  is_blocked boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.private_messages (
  id text primary key,
  conversation_id text references public.conversations(id) on delete cascade not null,
  sender_id text not null,
  sender_name text not null,
  sender_avatar text,
  content text not null,
  timestamp text not null,
  is_read boolean default false,
  attachment_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. NOTIFICATIONS
create table if not exists public.notifications (
  id text primary key,
  user_id text not null,
  title text not null,
  description text not null,
  time_ago text not null,
  is_read boolean default false,
  type text not null check (type in ('claim', 'match', 'message', 'status', 'security')),
  link_route text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. MODERATION REPORTS
create table if not exists public.moderation_reports (
  id text primary key,
  reporter_id text not null,
  reporter_name text not null,
  target_type text not null check (target_type in ('report', 'user', 'message')),
  target_id text not null,
  target_title text,
  reason text not null check (reason in ('spam', 'scam', 'harassment', 'false_info', 'privacy_exposure', 'other')),
  notes text,
  status text not null default 'Pending' check (status in ('Pending', 'Reviewing', 'Action Taken', 'Dismissed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

alter table public.profiles enable row level security;
alter table public.reports enable row level security;
alter table public.claims enable row level security;
alter table public.global_chat_messages enable row level security;
alter table public.conversations enable row level security;
alter table public.private_messages enable row level security;
alter table public.notifications enable row level security;
alter table public.moderation_reports enable row level security;

-- 1. Profiles Policies
create policy "Profiles viewable by authenticated users" 
  on public.profiles for select 
  using (auth.role() = 'authenticated');

create policy "Users can insert own profile" 
  on public.profiles for insert 
  with check (auth.uid() = id);

create policy "Users can update own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

-- 2. Reports Policies
create policy "Reports are viewable by authenticated users" 
  on public.reports for select 
  using (auth.role() = 'authenticated');

create policy "Authenticated users can create reports" 
  on public.reports for insert 
  with check (
    auth.role() = 'authenticated' and 
    auth.uid()::text = reporter_id
  );

-- Hanya pemilik laporan atau staf/admin yang dapat mengubah laporan
create policy "Reporters or Staff can update reports" 
  on public.reports for update 
  using (
    auth.uid()::text = reporter_id or 
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() 
      and profiles.role in ('staff', 'admin')
    )
  );

-- Hanya pemilik laporan atau admin yang dapat menghapus laporan
create policy "Reporters or Admin can delete reports" 
  on public.reports for delete 
  using (
    auth.uid()::text = reporter_id or 
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() 
      and profiles.role = 'admin'
    )
  );

-- 3. Claims Policies
create policy "Claims viewable by involved parties and staff" 
  on public.claims for select 
  using (
    auth.uid()::text = claimant_id or 
    exists (
      select 1 from public.reports 
      where reports.id = claims.report_id 
      and reports.reporter_id = auth.uid()::text
    ) or 
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() 
      and profiles.role in ('staff', 'admin')
    )
  );

create policy "Authenticated users can submit claims" 
  on public.claims for insert 
  with check (
    auth.role() = 'authenticated' and 
    auth.uid()::text = claimant_id
  );

create policy "Involved parties or staff can update claims" 
  on public.claims for update 
  using (
    auth.uid()::text = claimant_id or 
    exists (
      select 1 from public.reports 
      where reports.id = claims.report_id 
      and reports.reporter_id = auth.uid()::text
    ) or 
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() 
      and profiles.role in ('staff', 'admin')
    )
  );

-- 4. Global Chat Policies
create policy "Global chat readable by authenticated" 
  on public.global_chat_messages for select 
  using (auth.role() = 'authenticated');

create policy "Global chat writable by authenticated" 
  on public.global_chat_messages for insert 
  with check (
    auth.role() = 'authenticated' and 
    auth.uid()::text = user_id
  );

-- 5. Private Messages & Conversations Policies
create policy "Conversations accessible by participants" 
  on public.conversations for all 
  using (
    auth.uid()::text = other_user_id or 
    exists (
      select 1 from public.claims 
      where claims.id = conversations.claim_id 
      and (
        claims.claimant_id = auth.uid()::text or 
        exists (
          select 1 from public.reports 
          where reports.id = claims.report_id 
          and reports.reporter_id = auth.uid()::text
        )
      )
    )
  );

create policy "Messages accessible by conversation participants" 
  on public.private_messages for select 
  using (
    exists (
      select 1 from public.conversations 
      where conversations.id = private_messages.conversation_id 
      and (
        conversations.other_user_id = auth.uid()::text or 
        exists (
          select 1 from public.claims 
          where claims.id = conversations.claim_id 
          and claims.claimant_id = auth.uid()::text
        )
      )
    )
  );

create policy "Messages insertable by sender" 
  on public.private_messages for insert 
  with check (
    auth.role() = 'authenticated' and 
    auth.uid()::text = sender_id
  );

-- 6. Notifications Policies
create policy "Notifications accessible by recipient" 
  on public.notifications for all 
  using (auth.uid()::text = user_id);

-- 7. Moderation Reports Policies
create policy "Moderation reports insertable by authenticated" 
  on public.moderation_reports for insert 
  with check (auth.role() = 'authenticated');

create policy "Moderation reports manageable by staff and admin" 
  on public.moderation_reports for select 
  using (
    auth.uid()::text = reporter_id or 
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() 
      and profiles.role in ('staff', 'admin')
    )
  );

-- ==========================================================
-- STORAGE BUCKETS (REPORT IMAGES)
-- ==========================================================

insert into storage.buckets (id, name, public) 
values ('report-images', 'report-images', true)
on conflict (id) do nothing;

create policy "Public Access to Report Images"
  on storage.objects for select
  using (bucket_id = 'report-images');

create policy "Authenticated users can upload report images"
  on storage.objects for insert
  with check (
    bucket_id = 'report-images' and 
    auth.role() = 'authenticated'
  );
