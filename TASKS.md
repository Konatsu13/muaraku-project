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
- [ ] Konfigurasi Tailwind v4 & Design Tokens di `globals.css` (Warm Canvas `#FFFCF8`, Muara Orange `#FB923C`, Verified Yellow `#EAB308`, Dark Canvas `#18181B`)
- [ ] Client Supabase SSR & Browser Helper (`lib/supabase/client.ts`, `lib/supabase/server.ts`)
- [ ] Sistem Internasionalisasi (i18n) Bilingual (`id` & `en`) dengan React Context (`lib/i18n/`)
- [ ] Theme Provider (`light`, `dark`, `system`) dengan persistensi
- [ ] Auth Provider (`AuthProvider`, `useAuth`) mengelola sesi Supabase, user_profiles, account controls, dan roles
- [ ] Mock / Seed data provider untuk demonstration bila user belum login

---

## Fase 3: Public Website & Shared Layouts
- [ ] Public Navigation Bar (`Home`, `About`, `Support`, CTA Masuk/Daftar)
- [ ] Public Footer (`Privacy Policy`, `Terms of Service`, copyright)
- [ ] Landing Page (`/`):
  - [ ] Hero dengan ilustrasi/preview kartu kehilangan & penemuan
  - [ ] Pilihan peran Seeker vs Finder ("Bagaimana Cara Kerja")
  - [ ] Live / Contextual Preview Discover Feed
  - [ ] Fitur AI (Natural Language Search & AI Matching preview)
  - [ ] Prinsip Keamanan & Privasi Komunitas
  - [ ] FAQ interaktif & Final CTA
- [ ] Halaman Tentang Kami (`/about`)
- [ ] Halaman Bantuan & Dukungan Publik (`/support`)
- [ ] Halaman Kebijakan Privasi (`/privacy`)
- [ ] Halaman Syarat Ketentuan (`/terms`)

---

## Fase 4: App Shell, Sidebar & Navigation
- [ ] App Shell Layout (`/app/layout.tsx`) dengan header & responsive sidebar
- [ ] Komponen Sidebar (`components/layout/AppSidebar.tsx`):
  - [ ] Brand lockup dengan logo MuaraKu
  - [ ] Mode Desktop Expanded (240px) vs Collapsed (76px)
  - [ ] Mode Mobile Drawer / Bottom navigation bar
  - [ ] Item Navigasi Utama: Discover, Seeker, Finder, Search, Global Chat, Messages
  - [ ] Item Navigasi Sekunder: Profile, Settings, Help & Support, Admin (jika staf)
  - [ ] Shortcut keyboard `⌘F` menuju halaman Search
- [ ] Top Header Bar:
  - [ ] Quick Search trigger
  - [ ] Notification Bell dengan unread indicator
  - [ ] Language toggle switcher (`ID` / `EN`)
  - [ ] Theme mode toggle (`Light` / `Dark`)
  - [ ] User avatar pill & dropdown menu

---

## Fase 5: Autentikasi & Modal Overlays
- [ ] Modal Dialog Autentikasi terpadu (`components/auth/AuthModal.tsx`):
  - [ ] Tab Masuk (Login) dengan email/password & show/hide toggle
  - [ ] Tab Daftar (Register) dengan validasi password & terms acknowledgment
  - [ ] Langkah Verifikasi OTP interaktif dengan timer cooldown & resend
  - [ ] Overlay Lupa Kata Sandi (Forgot Password) dengan notifikasi pemulihan netral
- [ ] Protected route guards & session redirection

---

## Fase 6: Core Lost-and-Found Workflows
- [ ] Discover Feed (`/app/page.tsx` atau `/app/discover`):
  - [ ] Feed campuran Seeker & Finder bergaya sosial
  - [ ] Filter pills kategori dinamis (`Semua`, `Barang Hilang`, `Barang Ditemukan`, etc.)
  - [ ] Kartu Laporan (`ReportCard`): foto 16:10, tag status, lokasi, waktu relatif, pembuat, badge verifikasi petugas, CTA "Chat sekarang" / "Lihat detail"
- [ ] Seeker Dashboard & Feed (`/app/seeker/page.tsx`):
  - [ ] Tab `Jelajahi Kehilangan`, `Laporan Saya`, `Kandidat Kecocokan`
  - [ ] Tombol CTA Buat Laporan Kehilangan
- [ ] Finder Dashboard & Feed (`/app/finder/page.tsx`):
  - [ ] Tab `Jelajahi Temuan`, `Laporan Saya`, `Klaim Masuk`
  - [ ] Tombol CTA Buat Laporan Penemuan
  - [ ] Dukungan badge kuning `Petugas lokasi terverifikasi`
- [ ] Modal Buat/Edit Laporan (`components/reports/ReportModal.tsx`):
  - [ ] Bidang publik: Judul, kategori, deskripsi umum, lokasi tempat/kampus, tanggal/waktu, unggah foto
  - [ ] **Langkah Bukti Kepemilikan Privat (Anti-Fraud)**: input rahasia (nomor seri, ciri tersembunyi) yang tidak pernah tampil di feed publik
- [ ] Detail Laporan Barang (`/app/reports/[id]/page.tsx`):
  - [ ] Galeri foto resolusi tinggi, status badge, metadata lengkap
  - [ ] Aksi kontekstual: "Klaim Kepemilikan", "Hubungi Penemu/Pelapor", "Laporkan Postingan"
  - [ ] Tombol terjemahan on-demand ("Terjemahkan" / "Lihat teks asli")
- [ ] Modal Klaim Kepemilikan (`components/reports/ClaimModal.tsx`):
  - [ ] Input bukti verifikasi rahasia, catatan klaim, upload bukti
  - [ ] Disclaimer bahwa AI matching bukan bukti mutlak

---

## Fase 7: Komunikasi & Keamanan Komunitas
- [ ] Pesan Pribadi / Private Messages (`/app/messages/page.tsx`):
  - [ ] Dua panel desktop (daftar percakapan & jendela obrolan aktif)
  - [ ] Kartu konteks barang yang sedang dikoordinasikan di atas obrolan
  - [ ] Pengiriman pesan teks & lampiran aman
  - [ ] Menu keamanan: "Laporkan Pesan", "Laporkan Pengguna", "Blokir Pengguna"
- [ ] Global Chat Komunitas (`/app/community/page.tsx`):
  - [ ] Stream pesan publik komunitas dengan panduan etika & keamanan
  - [ ] Pelaporan pesan spam/pelanggaran
- [ ] Modal Pelaporan Keamanan (`components/safety/SafetyReportModal.tsx`):
  - [ ] Pilihan target (post, user, message), opsi alasan (spam, scam, pelecehan, info palsu), input detail

---

## Fase 8: Search N2L, Muara AI Assistant & Matching
- [ ] Halaman Search N2L (`/app/search/page.tsx`):
  - [ ] Input pencarian Natural Language ("dompet hitam dekat perpustakaan")
  - [ ] Rekomendasi kata kunci populer
  - [ ] Filter laci/drawer: Jenis (Hilang/Temukan), Kategori, Rentang Tanggal, Lokasi
  - [ ] Hasil pencarian dengan kartu indikator kemungkinan cocok
- [ ] Floating Muara AI Assistant Widget (`components/ai/MuaraAIChatWidget.tsx`):
  - [ ] Launcher mengambang di pojok kanan bawah
  - [ ] Percakapan ramah panduan cara lapor aman, etika serah terima, kuis kepemilikan
  - [ ] Integrasi endpoint API `/api/ai/chat` (OpenAI / Gemini)
- [ ] AI Matching API Endpoint / Helper (`/api/ai/match`):
  - [ ] Analisis kesamaan teks/atribut laporan

---

## Fase 9: Profil Pengguna, Pengaturan & Notifikasi
- [ ] Halaman Profil (`/app/profile/page.tsx`):
  - [ ] Avatar, display name, handle, bio, reputasi komunitas
  - [ ] Riwayat laporan publik pengguna
- [ ] Halaman Pengaturan (`/app/settings/page.tsx`):
  - [ ] Ubah data profil
  - [ ] Pilihan Bahasa (`Bahasa Indonesia` / `English`)
  - [ ] Pilihan Tema (`Terang` / `Gelap` / `Sistem`)
  - [ ] Pengaturan Notifikasi
  - [ ] Daftar Pengguna yang Diblokir (dengan tombol Buka Blokir)
  - [ ] Tombol Keluar (Sign Out)
- [ ] Panel Notifikasi (`/app/notifications/page.tsx` atau dropdown header):
  - [ ] Notifikasi klaim baru, pesan masuk, kecocokan AI, status laporan

---

## Fase 10: Admin & Moderation Dashboard
- [ ] Admin Console (`/admin/page.tsx`):
  - [ ] Proteksi hak akses role staf (`admin`, `moderator`)
  - [ ] Antrean Laporan Keamanan (Safety Reports Queue) untuk review pos/user
  - [ ] Aksi moderasi: Peringatan, Pembatasan Sementara, Pemblokiran Permanen dengan alasan & audit trail
  - [ ] Verifikasi Petugas Lokasi (Approve/Reject permintaan badge kuning)
  - [ ] Log Audit Aktivitas Moderasi
