# Changelog — MuaraKu (.id)

All notable changes to the MuaraKu platform will be documented in this file.
The format is based on Keep a Changelog, adhering to the project's verification standards.

---

## [Unreleased] - 2026-10-11

### Added
- **Stitch Design System Assets:** Extracted and saved comprehensive Google Stitch HTML/CSS specifications into `stitch_specs/` covering:
  - Landing Page Publik (Home)
  - Sidebar Component (Light/Dark, Expanded 240px / Collapsed 76px)
  - Discover Feed (Social Home)
  - Seeker (Lost Items & AI Matching)
  - Finder (Found Items & Claims Management)
  - Search N2L (Natural Language Search & Filter Drawer)
  - Report Detail (Item details, photo gallery, safe claim flow)
  - Modal Autentikasi & Verifikasi OTP (Login & Register)
  - Modal Alur Lapor Barang & Klaim Kepemilikan Privat
  - Private Messages (Two-pane conversation with report context)
  - Global Chat Komunitas (Public moderated community room)
- **Dependency:** Installed `lucide-react` for application-wide icon consistency matching `DESIGN.md`.
- **Environment Configuration:** Duplicated `.env .local` to `.env.local` to ensure seamless native Next.js environment variable resolution while preserving the original file.

### Fixed
- **ESLint Configuration (`eslint.config.mjs`):** Added `types/**` to `globalIgnores` to resolve 29 lint errors triggered by auto-generated Next.js validator type declarations. `npm run lint` now passes with 0 errors.
- **Git Synchronization:** Fast-forwarded local branch with remote repository (`origin/main`).

### Database
- **Schema & Remote Verification:** Verified non-destructively that all 28 tables, 4 Storage buckets (`report-images`, `claim-evidence`, `message-attachments`, `avatars`), and 12 seeded report categories (`elektronik`, `dompet-kartu`, `tas-ransel`, `buku-dokumen`, `kunci-aksesori`, etc.) are actively deployed and functioning in the connected Supabase instance (`zpoznosjgdcngnptdohl.supabase.co`).
