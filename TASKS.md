# Task Checklist — MuaraKu Implementation

Legend:
- `[x]` Selesai dan terverifikasi
- `[~]` Sedang dikerjakan atau baru selesai sebagian
- `[ ]` Belum dikerjakan
- `[!]` Terblokir atau memerlukan perhatian

---

## Fase 1: Audit, Konfigurasi & Fondasi Arsitektur
- [x] Audit komprehensif repository, dependencies, linting, dan build Next.js 16 App Router
- [x] Perbaikan `eslint.config.mjs` untuk mengabaikan auto-generated types Next.js
- [x] Sinkronisasi git branch dengan `origin/main`
- [x] Verifikasi non-destruktif database remote Supabase (28 tabel, 4 storage bucket, 12 kategori)
- [x] Penyelarasan file `.env.local` dan instalasi `lucide-react`
- [x] Ekstraksi 11 spesifikasi HTML Google Stitch ke dalam `stitch_specs/`
- [x] Pembuatan dokumen wajib `CHANGELOG.md`, `TASKS.md`, dan `HANDOFF.md`

---

## Fase 2: Design Tokens, i18n & Context Providers
- [x] Konfigurasi Tailwind v4 & Design Tokens di `globals.css` (Warm Canvas `#FFFCF8`, Muara Orange `#FB923C`, Verified Yellow `#EAB308`, Dark Canvas `#18181B`)
- [x] Client Supabase SSR & Browser Helper (`lib/supabase/client.ts`, `lib/supabase/server.ts`) dengan dual-key support (`PUBLISHABLE_KEY` dan `ANON_KEY`)
- [x] Sistem Internasionalisasi (i18n) Bilingual (`id` & `en`) dengan React Context (`lib/i18n/`)
- [x] Theme Provider (`light`, `dark`, `system`) dengan persistensi lokal dan profil
- [x] Auth Provider (`AuthProvider`, `useAuth`) mengelola sesi Supabase, user_profiles, gender, account controls, dan roles
- [x] Database Migration non-destruktif: `20261012_add_gender_to_user_profiles.sql`

---

## Fase 3: Public Website & Shared Layouts
- [x] Public Navigation Bar (`Home`, `About`, `Support`, CTA Masuk/Daftar) dengan responsive mobile menu
- [x] Public Footer (`Privacy Policy`, `Terms of Service`, copyright)
- [x] Landing Page (`/`):
  - [x] Hero dengan alur pencarian cerdas tanpa data palsu / persentase manipulatif
  - [x] Interactive product workflow preview berlabel simulasi transparan
  - [x] Pilihan peran Seeker vs Finder ("Dua Pilar Ekosistem")
  - [x] Live Preview Discover Feed terhubung langsung ke database Supabase riil dengan genuine empty state
  - [x] Bento grid infrastruktur sipil (N2L, Verified Staff, Anti-Tebusan, Privasi Maksimal)
  - [x] FAQ interaktif akordeon & Final CTA Banner
- [x] Halaman Tentang Kami (`/about`)
- [x] Halaman Bantuan & Dukungan Publik (`/support`)
- [x] Halaman Kebijakan Privasi (`/privacy`)
- [x] Halaman Syarat Ketentuan (`/terms`)

---

## Fase 4: App Shell, Sidebar & Route Protection (P0)
- [x] Route Protection Middleware (`middleware.ts`) mengamankan `/app/*` dan `/admin/*` dengan redirect login cerdas
- [x] App Shell Layout (`/app/layout.tsx`) dengan header & responsive sidebar + client session verification
- [x] Admin Role Guard (`/admin/page.tsx`) membatasi akses hanya untuk pengguna berstatus admin atau moderator
- [x] Komponen Sidebar (`components/layout/AppSidebar.tsx`):
  - [x] Brand lockup dengan logo MuaraKu
  - [x] Mode Desktop Expanded (240px) vs Collapsed (76px)
  - [x] Mode Mobile Drawer / Bottom navigation bar
  - [x] Item Navigasi Utama: Discover, Seeker, Finder, Search, Global Chat, Messages
  - [x] Item Navigasi Sekunder: Profile, Settings, Help & Support, Admin (jika staf)
  - [x] Shortcut keyboard `⌘F` menuju halaman Search
- [x] Top Header Bar dengan quick search trigger dan notifikasi

---

## Fase 5: Data Integrity & Realtime Features (P0/P1)
- [x] Service layer Supabase Reports (`lib/supabase/reports.ts`) untuk query terpadu ke `public.reports`, `report_categories`, `report_media`, dan `user_profiles`
- [x] Pembersihan total `initialSampleReports` dari halaman operasional:
  - [x] Discover Feed (`/app`) terhubung ke database riil + genuine empty state
  - [x] Seeker Hub (`/app/seeker`) terhubung ke database riil + genuine empty state
  - [x] Finder Hub (`/app/finder`) terhubung ke database riil + genuine empty state
  - [x] Search N2L (`/app/search`) terhubung ke database riil + genuine empty state
  - [x] Profile Page (`/app/profile`) terhubung ke riwayat laporan user asli
  - [x] Report Detail (`/app/reports/[id]`) terhubung ke data spesifik report dengan fallback 404
- [x] Global Chat Komunitas (`/app/community`):
  - [x] Terhubung ke room global `00000000-0000-4000-8000-000000000001`
  - [x] Realtime subscription via Supabase channel WebSocket
  - [x] Bubble pesan responsif (kanan oranye untuk user aktif, kiri netral untuk warga lain)
  - [x] Keyboard handling (Enter kirim, Shift+Enter baris baru) dan non-intrusive auto-scroll
- [x] Pengaturan Akun (`/app/settings`):
  - [x] Pengelolaan blokir pengguna terhubung ke tabel `public.user_blocks` (tanpa data tiruan SpammerAccount99)
  - [x] Preferensi notifikasi terhubung ke `public.notification_preferences`
  - [x] Form ganti kata sandi fungsional via `supabase.auth.updateUser`

---

## Fase 6: Localization & Translation On-Demand (P2)
- [x] Server Route `/api/translate`:
  - [x] Caching cerdas di tabel `public.report_translations` (0 API call jika sudah pernah diterjemahkan)
  - [x] Integrasi Google Cloud Translation API v2 menggunakan server-only key `GOOGLE_TRANSLATE_API_KEY`
  - [x] Cache write-back otomatis ke `report_translations`
  - [x] Validasi input ketat (maks 5000 karakter, target language `id`/`en`) dan fallback aman
- [x] Pembuatan `.env.example` lengkap dengan instruksi keamanan
- [x] Verifikasi akhir: `npm run lint` (0 error) dan `npm run build` (Clean production build)
