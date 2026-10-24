# MuaraKu

> **The Safe Haven for Lost & Found**

**MuaraKu** adalah platform *Lost & Found* sipil dan komunitas terpercaya di Indonesia yang dirancang khusus untuk ekosistem fasilitas publik, transportasi, dan kampus. Mengusung antarmuka yang bersih (*Civic Minimalist Design*), sistem verifikasi privasi tinggi, serta asisten cerdas, MuaraKu hadir sebagai solusi aman dalam menjembatani penemu dan pemilik barang hilang tanpa rasa cemas terhadap penipuan.

MuaraKu is an AI-assisted lost-and-found platform designed to connect people who have lost belongings with people who have found them through a safer, more organized, and community-driven digital ecosystem.

Built with a focus on trust, privacy, and accessibility, MuaraKu aims to simplify the process of reporting lost items, discovering found belongings, and reconnecting people with their property.

## Overview

## ✨ Fitur Utama (Core Features)

- 🔒 **Perlindungan Akses & Rute Otentikasi**  
  Seluruh area operasional `/app/*` dan konsol moderator `/admin/*` dilindungi middleware sesi terenkripsi dengan alur masuk aman.
- 🛡️ **Verifikasi Kepemilikan Privat (Anti-Fraud)**  
  Ciri rahasia barang (nomor seri, isi saku tersembunyi, gantungan khusus) disimpan di brankas privat dan tidak pernah diumbar ke publik. Pengklaim wajib menjawab kuis kepemilikan sebelum nomor kontak dibuka.
- 🌐 **Integritas Data Riil (Zero Fake Activity)**  
  Menjunjung integritas sipil: tidak ada metrik palsu atau laporan mock yang menyamar sebagai aktivitas aktif saat database kosong. Setiap halaman menampilkan *genuine empty state* yang informatif.
- 💬 **Obrolan Komunitas Realtime**  
  Ruang percakapan komunitas global yang terhubung langsung ke WebSocket Supabase Realtime dengan moderasi transparan.
- 🌍 **Lokalisasi Sesuai Permintaan (On-Demand Translation)**  
  Didukung Google Cloud Translation API v2 dengan penyimpanan cache otomatis pada basis data untuk efisiensi penggunaan API.

Losing an item can be stressful. Finding its owner can be just as difficult. Existing approaches often rely on scattered social media posts, unstructured group chats, or manual inquiries.

MuaraKu aims to bring these interactions into one platform, combining structured reports, community participation, privacy-conscious communication, and AI-assisted discovery.

## Core Features

- **Lost & Found Reports** — Create and manage reports for lost or found belongings.
- **Discovery & Search** — Browse community reports and find relevant items using descriptions and search tools.
- **Community Interaction** — Connect with other users through community conversations and private messaging.
- **Muara AI** — AI-assisted support and discovery, designed to complement rather than replace human judgment.
- **Trust & Safety** — Privacy-conscious workflows, reporting mechanisms, and moderation features.
- **Localization** — Support for Indonesian and English, with translation workflows designed around user choice.

*Feature availability and implementation status may change as development progresses.*

## 🛠️ Stack Teknologi (Tech Stack)

- **Frontend & Framework:** Next.js 16 (App Router, Turbopack, React 19)
- **Bahasa:** TypeScript 5.x (Strict Mode)
- **Styling & Icons:** Tailwind CSS v4, Lucide Icons
- **Backend & Database:** Supabase PostgreSQL (28 tabel, Row Level Security, Storage Buckets)
- **Autentikasi & Keamanan:** Supabase Auth (Email OTP & Google OAuth) + Cloudflare Turnstile
- **Penerjemahan:** Google Cloud Translation API v2 dengan caching pintar di PostgreSQL
- **Asisten AI:** Gemini API & OpenAI API


## Technology Stack

| Area | Technology |
|---|---|
| Frontend | Next.js App Router, React, TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| AI integration | OpenAI API, with a separate Python service planned |
| Security | Server-side authorization, database access policies, and applicable anti-abuse controls |

See the project configuration and architecture documentation for the current implementation details.

## Project Structure

The application is being organized around clear boundaries between routes, reusable components, feature logic, and shared infrastructure.

```text
muaraku-project/
├── src/
│   ├── app/
│   │   ├── (landing)/
│   │   ├── (user)/
│   │   ├── (admin)/
│   │   └── api/
│   ├── components/
│   ├── features/
│   ├── lib/
│   └── types/
├── docs/
│   ├── architecture/
│   ├── policies/
│   ├── security/
│   └── development/
├── public/
├── README.md
├── PRD.md
├── DESIGN.md
└── AGENTS.md
```

## 🚀 Memulai Pengembangan Lokal (Getting Started)

### 1. Prasyarat
- Node.js 20+
- npm / yarn / pnpm

### 2. Konfigurasi Lingkungan
Salin berkas konfigurasi template:
```bash
cp .env.example .env.local
```
Lengkapi nilai kunci Supabase dan kredensial API yang diperlukan di dalam `.env.local`.

### 3. Instalasi & Menjalankan Server
```bash
npm install
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) pada peramban Anda.

### 4. Pengecekan Kualitas Kode
```bash
# Validasi tipe TypeScript
npx tsc --noEmit

# Pengecekan linting ESLint
npm run lint

# Verifikasi build produksi
npm run build
```

---

## 📄 Lisensi & Hak Cipta
© 2026 MuaraKu (.id). Seluruh hak cipta dilindungi undang-undang.

This is the intended organizational direction; the repository should be updated and verified as the restructuring progresses.

## Getting Started

### Prerequisites

- Node.js compatible with the project configuration
- npm
- A Supabase project and the credentials required by the features being developed

### Installation

```bash
git clone https://github.com/Konatsu13/muaraku-project.git
cd muaraku-project
npm install
```

### Environment Configuration

Create a local environment file using the project's environment template, if available:

```bash
cp .env.example .env.local
```

Configure the required environment variables using the project's setup documentation. Never commit secrets, API keys, service-role keys, or private credentials to Git.

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Quality Checks

Run the checks supported by the current project configuration before submitting changes:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

If a command is unavailable or fails, investigate the actual project configuration and report the result rather than assuming the check passed.

## Documentation

Project documentation should remain the source of truth for its respective areas.

| Document | Purpose |
|---|---|
| [PRD](PRD.md) | Product requirements, scope, and planned behavior |
| [DESIGN](DESIGN.md) | Visual direction, design system, and interface guidelines |
| [AGENTS](AGENTS.md) | Instructions for AI coding agents |
| [CHANGELOG](CHANGELOG.md) | Record of meaningful project changes |
| `docs/architecture/` | Application architecture and database design |
| `docs/policies/` | User policies and platform rules |
| `docs/security/` | Security practices and reporting procedures |
| `docs/development/` | Coding standards and contribution workflow |

Documentation links should be updated as files are created, moved, or consolidated.

## Security

Security is an ongoing development priority.

- Enforce authorization on the server and at the database level.
- Apply appropriate Row Level Security policies to Supabase data.
- Keep private conversations and sensitive item details accessible only to authorized parties.
- Validate user input and apply suitable anti-abuse protections.
- Never expose secrets in client-side code or public repositories.

If you discover a security vulnerability, avoid publishing exploitable details in a public issue. Use the project's designated private reporting channel once it is established.

## Development Status

MuaraKu is under active development. Its interface, database design, AI capabilities, and security workflows may evolve as the project moves toward its next major iteration.

Do not assume a feature is production-ready solely because it is described in this document. Consult the current implementation and project tasks for verified status.

## License

Copyright © 2026 MuaraKu.

Unless a license is explicitly included in the repository, all rights are reserved. No permission to redistribute or reuse the project is granted by this notice alone.
