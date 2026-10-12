# Handoff Documentation — MuaraKu (.id)

> **Dokumen Panduan Handoff AI Agent**  
> Terakhir diperbarui: 2026-10-12  
> Status: Fase 1 s/d Fase 6 Selesai & Terverifikasi (Build Clean, 0 Lint Error, Data Integritas Penuh).

---

## A. Project Context

### 1. Tujuan Proyek
MuaraKu (`muaraku.id`) adalah platform Lost & Found sipil dan komunitas terpercaya di Indonesia yang aman dan didukung kecerdasan buatan. Prinsip utama produk:
- **Trust before virality:** Lindungi rincian sensitif barang hilang dari klaim palsu.
- **AI assists, people decide:** AI memberikan rekomendasi dan mempermudah pencarian, tetapi tidak pernah menjadi bukti mutlak kepemilikan.
- **Privacy by default:** Informasi verifikasi rahasia (nomor seri, ciri tersembunyi) dipisahkan dari deskripsi publik.
- **Zero fake functionality:** Tidak menampilkan metrik palsu, testimoni karangan, atau laporan mock yang berpura-pura menjadi aktivitas langsung jika database sedang kosong.

### 2. Arsitektur & Teknologi yang Terverifikasi
- **Framework & Router:** Next.js `16.3.7` (App Router, Turbopack, React 19).
- **Bahasa & Compiler:** TypeScript `5.x`, strict mode (`npx tsc --noEmit` PASS).
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss` v4).
- **Icons:** `lucide-react` (tanpa emoji icons).
- **Backend / BaaS:** Supabase (`@supabase/ssr` `0.12.7`, `@supabase/supabase-js` `2.117.2`).
  - **Instance:** `https://zpoznosjgdcngnptdohl.supabase.co`
  - **Tabel:** 28 tabel aktif + migrasi penambahan kolom `gender` pada `public.user_profiles`.
  - **Storage Buckets:** 4 bucket aktif (`report-images`, `claim-evidence`, `message-attachments`, `avatars`).
  - **Kategori:** 12 kategori barang hilang/temuan ter-seed otomatis.
- **Security & Route Protection:**
  - `middleware.ts`: Mengamankan seluruh path `/app/*` dan `/admin/*` dengan redirect login cerdas.
  - Role clearance guard di `app/admin/page.tsx` membatasi akses khusus `isAdmin || isModerator`.
  - Cloudflare Turnstile CAPTCHA readiness.
- **On-Demand Localization:**
  - `/api/translate`: Terhubung ke Google Cloud Translation API v2 (`GOOGLE_TRANSLATE_API_KEY`) dengan query caching ke `public.report_translations`.
- **Environment & Templates:**
  - `.env.local` aktif secara privat.
  - `.env.example` terdokumentasi dan siap untuk deployment tim.

---

## B. Current State & Verification Metrics

1. **Build & Lint Status:**
   - `npm run lint` -> **PASS (0 errors)**.
   - `npx tsc --noEmit` -> **PASS (0 errors)**.
   - `npm run build` -> **PASS (All 20 static & dynamic routes compiled cleanly)**.
2. **Data Integrity:**
   - Seluruh halaman operasional (`/app`, `/app/seeker`, `/app/finder`, `/app/search`, `/app/profile`, `/app/reports/[id]`) membaca langsung data dari `lib/supabase/reports.ts`.
   - `initialSampleReports` dihapus dari konsumsi halaman produksi.
   - Genuine empty states ditampilkan saat data laporan kosong.
3. **Komunikasi Realtime:**
   - Global chat (`/app/community`) terhubung ke percakapan `00000000-0000-4000-8000-000000000001` via Supabase Realtime channel WebSocket.

---

## C. Next Steps & Development Roadmap

1. **AI Matching Background Worker:** Mengimplementasikan proses webhook / background worker yang menghitung skor kesamaan `pgvector` dan mencatatnya ke `public.report_matches`.
2. **Claim Submission Flow:** Menyelesaikan submit dialog klaim kepemilikan privat ke `public.claims` dan pengunggahan bukti kepemilikan ke bucket `claim-evidence`.
3. **Turnstile Production Hook:** Mengaktifkan secret verification Cloudflare Turnstile di endpoint login/register setelah domain produksi `muaraku.id` terhubung.
