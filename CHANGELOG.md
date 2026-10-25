# CHANGELOG — MuaraKu

## [Phase 5–6: Admin, Support, Muara AI, dan kesiapan rilis] — 2026-10-25

Scope: menyelesaikan alur Admin/Support/Muara AI yang didukung kode dan schema
lokal, lalu menjalankan QA integrasi, keamanan statis, SEO, aksesibilitas, dan
responsivitas. Rincian status serta blocker ada di
[`MuaraKu_PHASE5_6_STATUS.md`](./MuaraKu_PHASE5_6_STATUS.md).

- Support login dapat membuat tiket melalui route server yang memeriksa sesi,
  origin, input, ukuran permintaan, dan rate limit; pemilik dapat melihat
  riwayat serta percakapan tiketnya. Workspace staf memuat tiket dengan filter,
  pencarian, paginasi, dan balasan publik.
- Overview Admin memakai hitungan query nyata; antrean laporan dan kasus
  keamanan, akun terbatas, serta log aktivitas membaca data dengan batas query.
  Aksi moderasi/status tetap read-only karena grant audit pada schema lokal
  belum menyediakan jalur update + audit yang atomik. Proposal RPC tersedia di
  `database/proposals/phase5-safety-audit-rpc.md`.
- Muara AI memerlukan sesi login, membatasi permintaan, memvalidasi respons
  provider, memberi timeout/error eksplisit, dan menyediakan panduan statis
  terbatas saat provider tidak dikonfigurasi. Riwayat dan usage AI tidak
  dipersistenkan; fitur pencarian/matching AI belum dibuat.
- Sitemap/robots dan metadata publik diperbarui; route privat tidak dimasukkan
  ke sitemap.
- Tidak ada SQL yang dijalankan, perubahan schema yang diterapkan, atau deploy.
  Supabase live belum terverifikasi: pengujian feed/auth gagal dengan
  `Unregistered API key`. Jangan anggap CRUD tiket, reply, AI, atau RLS live
  sudah lulus.

### Verifikasi Phase 5–6

- Targeted ESLint dan Taste Skill lint: PASS; lint proyek: tanpa error, 29
  warning yang tersisa berada di file lain.
- `npx next typegen` lalu `npx tsc --noEmit`: PASS.
- `npm run build`: PASS; Next.js 16 memberi peringatan deprecation untuk
  `middleware`, yang belum dimigrasikan.
- Inspector production Support (1440/768/390 px): 0 FAIL, 0 WARN. Screenshot
  yang diperiksa adalah tampilan guest; alur tiket login dan workspace staf
  belum dapat diuji secara visual dengan akun ber-role.
- Smoke test halaman Support, robots, sitemap, serta guard guest Admin:
  berhasil. Pengujian integrasi Supabase live terblokir oleh API key.
- Rekomendasi rilis: **NOT READY** sampai koneksi Supabase, schema/RLS live,
  dan alur ber-role diuji dengan identitas nyata.

## [UI De-slop: public site (landing) + design tokens] — 2026-10-25

Scope: redesign halaman publik `(landing)` memakai skill `avoid-ai-design`
(mode detect lalu rewrite), dengan palet token brand. Mengikuti PROMPT4.md §A/G.
Tidak ada perubahan fungsi, autentikasi, routing, query, atau RLS.

### Design tokens (`app/globals.css`, `app/layout.tsx`)

- Palet light sesuai aturan warna pemilik: canvas `#FFFFFF`, surface `#F9FAFB`,
  teks `#171717`/`#737373`, border `#E5E7EB`, trust-blue `#377EEF` → `#2563EB`;
  brand orange `#FB923C`, success/error tidak berubah. Dark mode tidak diubah.
- `--muted-surface` kini alias `--surface` (belum pernah dipakai di kode).
- Semua `bg-[#FFFCF8]` (krem ad-hoc) di 9 file kini `bg-canvas` agar satu canvas
  di landing/about/support/term/privacy/auth/admin/main. `DESIGN.md` dibuat
  sebagai kontrak desain (referensinya sudah dipakai CHANGELOG/PROMPT4
  sebelumnya, tapi filenya belum ada).

### Landing page `app/(landing)/page.tsx`

- Hapus section "Pola Aliran Laporan Komunitas" yang render rusak (SkeletonFeed
  tunggal di dalam grid-cols-3; ⅔ area kosong di desktop) dan copy internal
  "di Sesi 3" di halaman publik.
- Hapus kartu hero berisi 2 laporan fiktif ("Dompet Kulit Hitam", "Kunci Motor
  Vario") — dummy data di UI runtime. RLS `reports` tidak membuka select anonim,
  jadi preview feed nyata tidak memungkinkan; hero kini murni naratif + CTA.
- Hapus tiga kartu pilar identik bernomor 01/02/03 + chip ikon; kontennya
  menjadi tiga kolom flat ber-pemisah border di section "Dirancang untuk
  integritas & rasa aman".
- Hapus kata beraksen atauanye di headline (SD5), label ALL-CAPS + Sparkles di
  badge hero, ikon trust berwarna-warni (kini ikon netral satu warna teks).
- Banner CTA near-black diganti panel surface flat + tombol orange (tanpa
  gradient/glow). FAQ dipecah pakai border-y + chevron tanpa kotak per item.
- Radius disengaja: chip `rounded-lg`, panel `rounded-xl`; `rounded-3xl`
  dihapus dari halaman publik.

### Navbar/Footer/About/support

- Navbar & footer memakai token canvas/border; tidak ada perubahan fungsi.
- About: panel filosofi & estado kosong `rounded-3xl` → `rounded-xl`, prinsip
  3 kartu → kolom flat dengan pemisah, kartu developer `rounded-2xl` →
  `rounded-xl` (frame foto tetap `aspect-square`, fallback netral, sosial hanya
  muncul bila URL https valid — perubahan desain saja). `config/lib/config
  developers.ts` tidak diisi (menunggu data pemilik; TODO ada di file).
- Support: badge pill uppercase + centered hero dihapus, `font-extrabold` →
  `font-bold`, `rounded-3xl` → `rounded-xl`, label form tidak lagi ALL-CAPS.
  Fungsi form/submitted state tidak diubah.

### Verifikasi

- `eslint --quiet`: PASS.
- Scanner `avoid-ai-design` (detect): `app/(landing)/page.tsx` 0 temuan;
  sisa P1/P2 adalah pilihan brief (brand orange, emerald untuk semantik
  success, blur hanya di navbar sticky, Geist via next/font) yang ditandai
  `avoid-ai-design-ignore` di `globals.css`.
- Inspeksi visual (Chrome headless + CDP, emulasi 1440 & 390, light+dark):
  landing desktop/mobile/dark + about/developer scoped section + admin route
  guard — tidak ada overflow horizontal (scrollWidth == viewport 390), tidak
  ada data dummy, FAQ & CTA berfungsi. Sidebar app & form laporan belum
  diinspeksi (scope landing).

---

## [Sesi 4 (v2.5)] — 2026-10-25

Scope: Chat, Notifikasi & Community Trust; perbaikan OTP; redirect pasca-login;
password wajib untuk pengguna Google OAuth; penghapusan dummy data; route group;
navigasi Admin; redesign form laporan; section developer di About; Taste Skill.

> Semua perubahan sesi ini masih di working tree (belum di-commit). Tidak ada
> perubahan schema/database yang dijalankan; tidak ada deploy.

### A. Route group + Taste Skill

- Refactor `app/` ke route group tanpa mengubah URL: `app/(landing)` (/, /about,
  /support, /privacy, /terms), `app/(auth)` (/auth/callback, /auth/set-password),
  `app/(admin)` (/admin), `app/(main)` (/app, /app/community, /app/finder,
  /app/help, /app/messages, /app/notifications, /app/profile, /app/reports/[id],
  /app/search, /app/seeker, /app/settings). API `app/api/**` tetap pada URL
  aslinya. `/auth/callback` tidak dipindah URL-nya.
- `types/validator.ts` (hasil generate lama Next.js) terhapus otomatis oleh
  regenerasi route map; tidak ada import tersisa.
- Taste Skill `design-taste-frontend` terpasang di `.agents/skills/`. `SKILL.md`
  dibaca lalu dijalankan: `lint.mjs` pada file UI sesi ini (0 FAIL setelah
  perbaikan: eyebrow pill dihapus di About, emoji 🌊/✓ diganti ikon lucide,
  `font-mono` → `tabular-nums`, `transition-all` → properti eksplisit), dan
  `inspect.mjs` dijalankan pada build produksi `/about` (1440/768/390):
  **0 FAIL, 1 WARN** tersisa (ragged-row kartu prinsip ±47px — dipertahankan
  sadar desain: menyamakan tinggi dengan stretch justru menghasilkan panel
  kosong ±50px yang sebelumnya di-FAIL oleh meter).
- Perbaikan dari inspeksi visual: kontras tombol `Login`/`Open App` di
  navbar publik dan CTA About dari putih-di-oranye (2.3:1) menjadi teks gelap
  di-oranye (≥4.5:1); ikon tidak lagi dalam kotak berwarna; headline About
  dipangkas menjadi "Titik Temu bagi yang Terpisah." (≤1 baris di semua
  breakpoint, ≤32px); label footer kecil huruf-kapital diganti sentence case
  `text-sm`.

### B. Redirect pasca-login

- Akar masalah: URL tujuan diasosiasikan dengan `localhost` tanpa satu sumber
  kebenaran. Sekarang satu-satunya sumber adalah `lib/config/site.ts`:
  `NEXT_PUBLIC_SITE_URL` (fallback origin browser hanya untuk dev).
- `sanitizeNextPath()` = allowlist internal (`/app`, `/admin`, `/about`,
  `/support`, `/privacy`, `/terms`, `/auth/set-password`), menolak URL absolut,
  `//`, backslash, kontrol & double-encode. Dipakai semua tempat
  (`AuthModal`, middleware, callback).
- `/auth/callback` memvalidasi sesi (`exchangeCodeForSession`) sebelum routing;
  cancel/error OAuth dan akses langsung tanpa `code` memiliki state error.
- Tidak ada string `localhost` di runtime code (hanya `.env.example`).

### C. OTP email

- Akar masalah lama: `verifyOtp` dicoba berturut-turut dengan type berbeda.
  Kini `OtpFlow` (`signup`/`email`/`recovery`) dipetakan ke `type` tunggal yang
  tepat; resend per alur (`resend(signup)`, `resend(email_change)`,
  `resetPasswordForEmail`); email dinormalisasi (`trim().toLowerCase()`); kode
  dikosongkan setelah resend; error 429/expired/already-confirmed ditangani
  terpisah; tidak ada token/OTP/password di log.
- Link pemulihan password kini menuju `/auth/set-password?recovery=1`
  (sebelumnya `/app/profile` tanpa form — macet).

### D. Password Google opsional

- Login OAuth langsung masuk ke tujuan yang diminta; pembuatan password tidak
  lagi menjadi syarat sebelum membuka `/app/**`.
- Halaman `/auth/set-password` tetap tersedia untuk recovery password atau
  pengguna Google yang ingin menambahkan password secara opsional.
- Alur tersebut tidak membutuhkan admin API key atau penulisan `password_set`.

### E. Penghapusan dummy data

- Semua UI runtime kini dari Supabase nyata (reports, chat, notifications,
  admin page, profile, search, finder/seeker/discover). Empty state nyata untuk
  data kosong, tanpa seed pesan palsu di Global Chat.
- Pengerjaan sesi ini: `catch { // ignore }` di Admin page diganti menampilkan
  error ("Gagal memuat: …") supaya "belum ada data" tidak menyamar menjadi
  "gagal memuat"; SafetyReportModal Community kini hanya dirender dengan ID
  pesan nyata (fallback string `"global-chat-msg"` dihapus).

### F. Form laporan (create/edit)

- 3 langkah ringkas (inti → foto/ciri opsional → ciri rahasia), validasi sesuai
  constraint schema (judul 3–140, deskripsi 5–5000), `report_type` dikunci oleh
  konteks halaman, tanggal date-only disimpan sebagai UTC midnight dengan
  precision di `item_attributes` (tanpa mengarang jam / geser timezone),
  foto opsional (JPG/PNG/WEBP ≤8MB, rollback upload gagal), ciri privat hanya
  di `report_private_details`.
- Pengerjaan sesi ini: mode edit kini mendukung foto — foto existing dapat
  dihapus, file baru dapat diunggah; `updateReport()` menerima
  `mediaChanges` (hapus row `report_media` + objek storage, tambah file dengan
  rollback), semua lewat RLS.
- Sisa gap: label/validasi modal belum terhubung i18n (id/en) — masih teks
  Indonesia; upload belum menampilkan progress bar (hanya error + rollback).

### G. Section developer di About

- `lib/config/developers.ts` (typed, 3 entri TODO untuk diisi pemilik proyek:
  nama/foto 1:1/role/LinkedIn/Instagram) + kartu aspect-square, object-cover,
  link sosial `rel="noopener noreferrer"` hanya jika URL valid, empty state
  tanpa identitas buatan.

### H. Akses Admin di navigasi

- Entry Admin (hanya `admin`/`moderator` dari tabel `staff_roles`) ditambahkan
  di AppHeader, AppBottomNav, dan PublicNavbar; role dibaca dari
  `staff_roles` (bukan `user_metadata`); guard server tetap di middleware
  `/app/**`, `/admin/**`; pengguna biasa yang memaksa `/admin` diarahkan ke
  `/app?error=unauthorized_admin`.

### I. Chat, Notifikasi & Community Trust

- Global Chat (conversation `00000000-0000-4000-8000-000000000001`) dengan
  realtime INSERT + `removeChannel` saat unmount, tanpa seed pesan.
- Private chat via RPC `public.muaraku_create_direct_conversation`;
  membership/RLS dipakai untuk isolation.
- Block/unblock + safety reports (`safety_reports`) dari chat dan pesan;
  moderasi di Admin menulis `admin_activity_logs`.
- Notifikasi hanya milik recipient; preferensi menyimpan di kolom
  `notify_*` `user_account_controls`; mark-as-read gagal jujur jika policy
  belum mengizinkan (lihat proposal).
- Tidak ada job penghapusan chat 00.00 WIB — menunggu kebijakan disetujui.

### K. Verifikasi

| Check | Hasil |
| --- | --- |
| `npm run lint` | PASS (0 error; 25 warning lama: `<img>`, unused import) |
| `npx tsc --noEmit` | PASS |
| `npm run build` | PASS (23 route, URL tetap) |
| Inspeksi visual `/about` (build produksi, 1440/768/390) | PASS 0 FAIL, 1 WARN |
| OTP / OAuth / set-password nyata (2 akun, email & template) | NOT RUN — butuh kredensial Supabase/Google & akses dashboard |
| Chat dua akun, RLS, block | NOT RUN — butuh 2 akun uji |
| Mark-as-read vs policy aktual | BLOCKED — butuh apply proposal policy |
| Domain production OAuth | BLOCKED — konfigurasi manual di bawah |

### Konfigurasi manual yang masih diperlukan

1. Supabase Dashboard → Auth → URL Configuration: `Site URL` = domain produksi;
   `Redirect URLs` menambahkan `<domain>/auth/callback`.
2. Google Cloud Console → OAuth client: authorized redirect URI
   `<domain>/auth/callback`.
3. Set `NEXT_PUBLIC_SITE_URL` (dan `SUPABASE_SECRET_KEY`) di env produksi.
4. Terapkan proposal `supabase/proposals/2026-10-25_notifications_read_at_policy.sql`
   (review dulu) agar mark-as-read berfungsi.
5. Beri role di `staff_roles` (insert row manual) untuk akun yang berhak.
6. Isi data asli developer di `lib/config/developers.ts`.
7. Hygiene lokal: file `.env .local` (nama mengandung spasi) duplikat dari
   `.env.local` — boleh dihapus.
8. Google user lama (sebelum fitur) akan diminta membuat password satu kali
   pada login berikutnya — perilaku yang disengaja.

### Sisa risiko/pekerjaan

- Label modal laporan belum i18n; upload foto belum ada progress bar.
- Private chat belum realtime (refresh manual); Global Chat realtime baru
  menangani INSERT.
- AI chat widget/API masih punya fallback balikan rule-based saat API gagal
  (bukan data DB palsu, tapi perlu error state lebih jujur).
