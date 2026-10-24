# Changelog — MuaraKu Rebuild Kit

## 2026-10-24 — Sesi 1: Audit, Fondasi, & Desain Langsung di Kode
- **Audit Proyek & Git**: Memeriksa branch `third_version`, status git, dependency (Next.js 16.3.7, React 19.2.8, Tailwind CSS v4, Lucide React), skrip build/lint, serta aset gambar `Document/Inspiration/`.
- **Eslint Fix**: Mengabaikan folder external `.agents/**` dan `Document/**` pada `eslint.config.mjs` sehingga linting proyek bersih tanpa false-positive hook error dari tool luar.
- **Design Tokens**: Mengonfigurasi token resmi pada `app/globals.css` sesuai `DESIGN.md` (Canvas `#F8F9FA`/`#121214`, Surface `#FFFFFF`/`#18181B`, Text `#121212`/`#F4F4F5`, Border `#E4E4E7`/`#27272A`, Brand Orange `#FB923C`/`#EA580C`, Focus `#C96A1B`, serta `prefers-reduced-motion` dan accessible focus).
- **Komponen Dasar (UI Primitives)**: Membuat `Button`, `Input`, `Badge`, dan `Card` di `components/ui/` dengan target sentuh mobile minimal 44px dan focus ring yang jelas.
- **Pola Standar (Loading / Empty / Error)**: Mengimplementasikan `SkeletonLine`/`SkeletonCard`/`SkeletonFeed` (`LoadingPattern`), `EmptyPattern` (jujur tanpa data palsu), dan `ErrorPattern` dengan tombol retry di `components/ui/patterns/`.
- **Settings Overlay**: Mengimplementasikan `components/overlays/SettingsOverlay.tsx` yang hanya memuat `Switch Account` dan `Home` (navigasi ke `/`) sesuai keputusan produk di `AGENTS.md`.
- **Navigasi Berbasis Referensi Pengguna**:
  - `PublicNavbar` diselaraskan langsung dengan `Document/Inspiration/Navbar.png` (Logo M+MuaraKu, menu Home/About/Support/Terms, switch tema [ ☼ ☾ ], switch bahasa [ 🌐 EN/ID ], dan CTA Login/Open App).
  - `AppSidebar` diselaraskan dengan `Sidebar-light.png` dan `sidebar-dark.png` (Main Menu, Discover aktif, trigger Settings overlay, dan kartu profil pengguna).
- **Landing Page Skeleton & Responsif**: Membangun ulang `app/page.tsx` menggunakan prinsip anti-slop taste skill, tanpa template generik, menampilkan arsitektur privasi/keamanan (ciri rahasia terlindungi, tanpa tebusan), FAQ transparan, dan pratinjau skeleton yang jujur.
- **Build & Quality Check**: Memverifikasi `npm run lint` (0 error) dan `npm run build` (lulus tanpa error TypeScript/Turbopack, seluruh 21 route sukses ter-generate).

## 2026-10-24 — Rebuild Kit v2
- Menetapkan AI coding agent sebagai perancang dan implementer UI langsung di kode berdasarkan `DESIGN.md` dan referensi yang diberikan pengguna.
- Menggabungkan instruksi agent/keputusan/arsitektur dalam `AGENTS.md`.
- Menggabungkan enam prompt sesi dan checklist dalam `BUILD_PLAN.md`.
- Menggabungkan peta relasi SQL dan catatan review dalam `DATABASE.md`.
- Mempertahankan SQL yang diunggah pengguna tanpa perubahan dan PRD v1.1 sebagai dokumen referensi.
- Menegaskan tidak ada translate postingan dan Settings hanya overlay `Switch Account` + `Home`.
