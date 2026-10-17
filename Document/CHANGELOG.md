# Changelog — MuaraKu (.id)

All notable changes to the MuaraKu platform are documented in this file.
The format is based on Keep a Changelog, adhering to the project's strict verification standards.

---

## [Unreleased] - 2026-10-12

### Added
- **Route Protection Middleware (`middleware.ts`):** Edge-compatible route guard for `/app/:path*` and `/admin/:path*`, enforcing session authentication and redirecting unauthenticated visitors to `/?auth=login&next=...`.
- **Role Clearance Guard (`app/admin/page.tsx`):** Server and client verification for `isAdmin` and `isModerator` roles with restricted access fallback UI ("Akses Terbatas").
- **Database Migration (`supabase/migrations/20261012_add_gender_to_user_profiles.sql`):** Non-destructive additive migration adding `gender text check (gender in ('male', 'female', 'unspecified'))` to `public.user_profiles`.
- **Google Cloud Translation On-Demand Route (`app/api/translate/route.ts`):**
  - Integrated Google Cloud Translation API v2 with server-only key `GOOGLE_TRANSLATE_API_KEY`.
  - Implemented smart query cache lookup into `public.report_translations` (cache hits = 0 API costs).
  - Automatically caches new translations back into `report_translations` keyed by `(report_id, source_content_version, target_language)`.
  - Added request validation (max 5000 characters, allowed languages `id` & `en`) and fallback gracefully.
- **Environment Template (`.env.example`):** Complete production variable template covering Supabase, Cloudflare Turnstile, Google Translation, OpenAI, and Gemini.
- **Supabase Reports Service (`lib/supabase/reports.ts`):** Complete typed querying for `public.reports` with joined categories, user profiles, and storage media URLs, replacing all mock and sample reports across the application.
- **Realtime Community Chat (`app/app/community/page.tsx`):** Live WebSocket subscription to seeded global room `00000000-0000-4000-8000-000000000001` in `public.messages` with responsive message bubbles (right for sender, left for others).

### Changed
- **AuthModal (`components/auth/AuthModal.tsx`):**
  - Added full Google OAuth flow.
  - Added Turnstile CAPTCHA readiness badge and handling.
  - Added client-side accessible password strength meter (4 strict criteria).
  - Added separate, clickable Terms and Privacy links with `stopPropagation`.
  - Added gender radio selector during registration.
  - Added 60s cooldown timer and masked destination (`k***@email.com`) for OTP verification.
- **Public Landing Page (`app/page.tsx`):**
  - Completely aligned with Stitch specs (`Landing_Page_Publik__Home__MuaraKu.html`) and design guidelines.
  - Removed simulated misleading match numbers from the hero; replaced with an interactive product workflow preview clearly labeled as an illustrative walkthrough.
  - Replaced fake metric claims with civic trust highlights.
  - Integrated real Supabase feed preview with genuine empty state.
- **Discover, Seeker, Finder, Search, and Profile:**
  - Removed all fake `initialSampleReports` imports and mock reports.
  - Switched to real Supabase database records with authentic empty states and retry error states.
- **Settings Page (`app/app/settings/page.tsx`):**
  - Replaced mock user `SpammerAccount99` with real Supabase queries for `user_blocks` and `notification_preferences`.
  - Added functional password update form via `supabase.auth.updateUser`.
- **ReportCard (`components/reports/ReportCard.tsx`):** Replaced emoji fallbacks with Lucide icons (`Search`, `Package`) and polished card styling.

### Fixed
- **Compile & TypeScript Errors:**
  - Fixed missing `FileCheck` import and missing `profile` destructuring in `app/app/finder/page.tsx`.
  - Fixed React Hook cascading render warnings (`react-hooks/set-state-in-effect`) across `app/app/seeker`, `app/app/finder`, `app/app/page`, `app/app/community`, and `app/app/profile`.
  - Fixed strict typing in `lib/supabase/reports.ts` for database response parsing.
- **Dual Supabase Key Support:** Updated `lib/supabase/client.ts` and `lib/supabase/server.ts` to support both `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and fallback `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

---

## [Unreleased] - 2026-10-11

### Added
- **Stitch Design System Assets:** Extracted Google Stitch HTML/CSS specifications into `stitch_specs/`.
- **Dependency:** Installed `lucide-react` for application-wide icon consistency matching `DESIGN.md`.
- **Environment Configuration:** Duplicated `.env .local` to `.env.local`.

### Database
- **Schema & Remote Verification:** Verified non-destructively that all 28 tables, 4 Storage buckets (`report-images`, `claim-evidence`, `message-attachments`, `avatars`), and 12 seeded report categories are actively deployed in Supabase instance (`zpoznosjgdcngnptdohl.supabase.co`).
