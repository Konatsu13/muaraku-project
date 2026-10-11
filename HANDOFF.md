# Handoff Documentation — MuaraKu (.id)

> **Dokumen Panduan Handoff AI Agent**  
> Terakhir diperbarui: 2026-10-11  
> Status: Fase 1 Selesai (Fondasi, Audit, dan Ekstraksi Desain), melanjutkan ke Fase 2-4.

---

## A. Project Context

### 1. Tujuan Proyek
MuaraKu (`muaraku.id`) adalah platform Lost & Found komunitas dan kampus di Indonesia yang aman, terpercaya, dan didukung kecerdasan buatan (AI Matching & Natural Language Search). Prinsip utama produk:
- **Trust before virality:** Lindungi rincian sensitif barang hilang dari klaim palsu.
- **AI assists, people decide:** AI memberikan rekomendasi dan mempermudah pencarian, tetapi tidak pernah menjadi bukti mutlak kepemilikan.
- **Privacy by default:** Informasi verifikasi rahasia (nomor seri, ciri tersembunyi) dipisahkan dari deskripsi publik.

### 2. Arsitektur & Teknologi yang Terverifikasi
- **Framework & Router:** Next.js `16.3.7` (App Router, Turbopack, React 19 canary `19.2.8`).
- **Bahasa & Compiler:** TypeScript `5.x`, strict mode.
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss` v4).
- **Icons:** `lucide-react` (terpasang).
- **Backend / BaaS:** Supabase (`@supabase/ssr` `0.12.7`, `@supabase/supabase-js` `2.117.2`).
  - **URL:** `https://zpoznosjgdcngnptdohl.supabase.co`
  - **Tabel:** 28 tabel lengkap telah aktif (lihat `muaraku_supabase_schema.sql`).
  - **Storage Buckets:** 4 bucket aktif (`report-images`, `claim-evidence`, `message-attachments`, `avatars`).
  - **Kategori:** 12 kategori barang hilang/temuan ter-seed otomatis.
- **AI Services:** Gemini API (`GEMINI_API_KEY`) dan OpenAI API (`OPENAI_API_KEY`) terkonfigurasi di `.env.local`.
- **Security & Bot Protection:** Cloudflare Turnstile (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`).

### 3. Referensi Dokumen
- `PROMPT.md` — Master implementation prompt & aturan agent.
- `PRD.md` — Kontrak spesifikasi produk lengkap.
- `DESIGN.md` — Sistem desain, token warna, tipografi, dan arsitektur halaman.
- `muaraku_supabase_schema.sql` — Schema resmi database Supabase.
- `stitch_specs/` — Berisi 11 file HTML hasil generate Google Stitch untuk setiap layar.

---

## B. Current State & Verified Components

1. **Build & Lint Status:**
   - `npm run lint` -> **PASS (0 errors, 0 warnings)**.
   - `npm run build` -> **PASS (Static pages generated cleanly)**.
   - `npx tsc --noEmit` -> **PASS (Clean typecheck)**.
2. **Database:**
   - Terkoneksi non-destruktif ke Supabase remote.
   - 28 tabel, RLS, trigger, dan bucket storage terverifikasi aktif.
3. **Desain Stitch:**
   - 11 template layar telah diunduh dari Google Stitch ke `stitch_specs/` untuk referensi detail CSS, struktur kartu, palet warna, dan tata letak.

---

## C. Active Blockers & Decisions Requiring Input

- **Tidak ada blocker aktif.**
- Semua kredensial Supabase dan AI API sudah tersedia di `.env.local`.
- Klien dapat menggunakan mode tamu (guest browsing) untuk feed publik dan modal autentikasi untuk aksi yang memerlukan sesi masuk.

---

## D. Immediate Next Steps for Next AI Agent

1. **Implementasi Fase 2:**
   - Perbarui `app/globals.css` dengan token warna resmi MuaraKu (`#FB923C`, `#FFFCF8`, `#18181B`, `#EAB308`).
   - Buat helper Supabase client di `lib/supabase/client.ts` & `lib/supabase/server.ts`.
   - Buat `lib/i18n/` (dictionary ID dan EN) serta `I18nProvider`.
   - Buat `ThemeProvider` dan `AuthProvider`.
2. **Implementasi Fase 3 (Website Publik):**
   - Public Navbar & Footer.
   - Landing Page (`app/page.tsx`) berbasis spesifikasi Stitch `Landing_Page_Publik__Home__MuaraKu.html`.
   - Halaman `/about`, `/support`, `/privacy`, `/terms`.
3. **Implementasi Fase 4 (App Shell & Sidebar):**
   - Sidebar responsive sesuai `DESIGN.md` dan `Komponen_Sidebar_MuaraKu...html`.
   - Topbar dengan shortcut `⌘F`, language pill, theme switcher, dan profil.
4. **Implementasi Fase 5 & 6 (Discover, Seeker, Finder, Report Detail, Modals):**
   - Feeds sosial, modal lapor dengan rahasia anti-fraud terpisah, dan alur klaim.
