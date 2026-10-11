# MuaraKu — Platform Lost & Found Sekolah & Komunitas Civitas Akademika

> Implementasi Full-Stack Website Lost & Found berdasarkan spesifikasi desain resmi **Google Stitch UI** (`design.md`).

---

## 🌟 Tentang MuaraKu
**MuaraKu** (`muaraku.id`) adalah platform Lost & Found terpadu khusus lingkungan sekolah dan civitas akademika (siswa, guru, tenaga kependidikan, dan petugas keamanan sekolah). Website ini dirancang untuk mengatasi masalah barang tercecer dan hilang secara terstruktur, aman, transparan, dan anti-penipuan.

### 🎨 Identitas Visual & Desain Stitch
- **Primary Accent**: `#FB923C` (Muara Orange)
- **Surfaces**: `#FFFCF8` (Warm Canvas), `#FFFFFF` (Card Clean), `#18181B` (Dark Ink)
- **Border System**: 1px subtle neutral `#E4E4E7` / `#27272A`
- **Tipografi**: `Geist Sans`, `JetBrains Mono` (Data/ID tags), `Material Symbols Outlined` (Ikon Google)
- **Logo Resmi**: SVG gelombang muara geometris oranye dengan badge status aktif

---

## 🚀 Fitur Unggulan

1. **Alur Lapor Zero-Knowledge (Dual-Tier Privacy)**:
   - *Public Tier*: Foto publik, kategori, tanggal, lokasi umum (misal: "Kantin Gedung B").
   - *Private Proof Tier*: Petunjuk rahasia terselubung (nomor seri, warna gantungan kunci tersembunyi, isi dompet) yang di-hash dengan SHA-256 untuk verifikasi klaim tanpa mengekspos detail ke publik.

2. **AI Matching Radar (98% Match Potential)**:
   - Komparasi otomatis antara atribut laporan kehilangan (*Seeker*) dan penemuan (*Finder*) secara real-time.

3. **Verifikasi Klaim Bertingkat & Titik Serah Terima Aman**:
   - Kuiz verifikasi kepemilikan anti-fraud.
   - Pilihan titik temu terverifikasi: Ruang Tata Usaha (TU), Pos Satpam Gerbang Barat, Meja Piket Guru, Perpustakaan Lantai 2.

4. **Natural Language Search (N2L)**:
   - Pencarian cerdas memahami query percakapan bahasa Indonesia: *"botol minum tupperware biru kemarin di lab komputer"*, *"kacamata frame hitam dekat musholla"*.

5. **Multi-Channel Community Room & Private Chat Terenkripsi**:
   - Ruang chat publik komunitas terbagi: `#publik`, `#kehilangan-hari-ini`, `#pengumuman-staf`.
   - Direct message private yang terikat langsung ke ID tiket klaim untuk koordinasi pengembalian barang.

6. **Role-Based Persona Switcher (Testing Langsung)**:
   - Beralih dengan mudah antara:
     - 🎓 **Siswa** (Siti Rahma - NISN 202488102)
     - 🛡️ **Staf Terverifikasi** (Bambang Soedirjo - NIP 19820412)
     - ⚙️ **Admin Sekolah** (Admin Pusat MuaraKu)

7. **Koneksi Database Supabase & Resilient Offline Storage**:
   - Siap terhubung ke Supabase PostgreSQL & Supabase Storage.
   - Dilengkapi *failover* otomatis ke browser `localStorage` dengan *mock data* sekolah Indonesia yang realistis, sehingga aplikasi langsung berfungsi penuh 100% tanpa konfigurasi wajib di awal.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React & Google Material Symbols
- **Build Tool**: Vite 6 (Fast HMR & Optimized Bundler)
- **State & Storage**: React Context (`AuthContext`, `ToastContext`), Supabase JS SDK v2, Browser LocalStorage Fallback Repository
- **Backend / Database**: Supabase (PostgreSQL, Row Level Security, Storage Buckets)

---

## 📦 Panduan Instalasi & Menjalankan Proyek

### Prasyarat
- Node.js versi 18+ atau 20+ (Direkomendasikan Node.js v20+)
- npm atau pnpm atau yarn

### 1. Clone atau Buka Folder Proyek
```bash
cd c:\Users\tania\Downloads\stitch_ui_design_system_implementation
```

### 2. Install Dependencies
```bash
npm install
```
*(Di Windows PowerShell, gunakan `npm.cmd install` jika policy script aktif)*

### 3. Setup Konfigurasi Environment (Opsional untuk Supabase Live)
Salin `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi konfigurasi Supabase Anda:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```
> **Catatan**: Jika tidak diisi, MuaraKu otomatis berjalan dalam mode **Offline-First & Local Storage Repository**, lengkap dengan data barang sekolah, chat, klaim, dan notifikasi!

### 4. Eksekusi Skrip Database Supabase (Opsional)
Jika menggunakan Supabase, buka menu **SQL Editor** pada dashboard Supabase dan jalankan seluruh query dari file [`supabase_schema.sql`](file:///c:/Users/tania/Downloads/stitch_ui_design_system_implementation/supabase_schema.sql).

### 5. Jalankan Development Server
```bash
npm run dev
```
Buka browser pada alamat: **http://localhost:5173**

### 6. Build Production
```bash
npm run build
npm run preview
```

---

## 📁 Struktur Direktori Proyek

```
stitch_ui_design_system_implementation/
├── dist/                              # Output build siap deploy (HTML, CSS, JS teroptimasi)
├── src/
│   ├── components/
│   │   ├── ai/
│   │   │   └── MuaraAiAssistant.tsx   # Asisten AI pencarian interaktif
│   │   ├── layout/
│   │   │   ├── Header.tsx             # Header navigasi, quick search, notifikasi & persona
│   │   │   ├── Sidebar.tsx            # Sidebar responsif (Expanded 240px / Collapsed 76px)
│   │   │   └── MobileNav.tsx          # Navigasi bawah mobile drawer
│   │   └── modals/
│   │       ├── AuthModal.tsx          # Modal Login, Register & 6-digit OTP
│   │       ├── ReportModal.tsx        # Modal Lapor Barang Zero-Knowledge
│   │       ├── ClaimModal.tsx         # Modal Verifikasi Klaim Bertingkat
│   │       └── ModerationModal.tsx    # Modal Pelaporan Pelanggaran / Spam
│   ├── context/
│   │   ├── AuthContext.tsx            # Autentikasi, Persona Switcher & Theme Manager
│   │   └── ToastContext.tsx           # Toast Notifikasi Transaksional
│   ├── lib/
│   │   ├── mockData.ts                # Data awal sekolah Indonesia yang kaya & realistis
│   │   └── supabase.ts                # Client Supabase & Local Fallback Repository
│   ├── pages/
│   │   ├── LandingPage.tsx            # Halaman Publik Hero & Storytelling
│   │   ├── DiscoverFeed.tsx           # Feed 3 Kolom & Filter Kategori
│   │   ├── SeekerPage.tsx             # Portal Kehilangan & AI Matching Radar
│   │   ├── FinderPage.tsx             # Portal Penemuan & Verifikasi Staf
│   │   ├── SearchPage.tsx             # Halaman Pencarian Natural Language (N2L)
│   │   ├── ReportDetailPage.tsx       # Detail Barang, Gallery & Security Notice
│   │   ├── GlobalChatPage.tsx         # Komunitas Diskusi Publik Real-time
│   │   ├── PrivateMessagesPage.tsx    # Pesan Pribadi Terenkripsi Tiket Klaim
│   │   ├── ProfilePage.tsx            # Profil Pengguna & Skor Civic Karma
│   │   ├── SettingsPage.tsx           # Pengaturan Tema, Privasi & Notifikasi
│   │   ├── SupportPage.tsx            # Pusat Bantuan, SOP & Kontak Darurat
│   │   └── AdminDashboardPage.tsx     # Dashboard Pengawasan Moderasi & Laporan
│   ├── types/
│   │   └── index.ts                   # Definisi Data TypeScript Lengkap
│   ├── App.tsx                        # Router & Shell Utama Aplikasi
│   ├── main.tsx                       # Entrypoint React 18
│   └── index.css                      # Styling Tailwind CSS & Desain Token Stitch
├── supabase_schema.sql                # DDL Database PostgreSQL & RLS Policies
├── design.md                          # Dokumentasi Referensi Desain Asli Stitch
├── .env.example                       # Contoh Konfigurasi Environment
├── package.json                       # Konfigurasi Dependensi Proyek
├── tailwind.config.js                 # Konfigurasi Desain Sistem Tailwind
├── tsconfig.json                      # Konfigurasi TypeScript Compiler
└── vite.config.ts                     # Konfigurasi Bundler Vite
```

---

## 🛡️ Hak Cipta & Lisensi
Dikembangkan berdasarkan spesifikasi desain **Google Stitch UI System** untuk **MuaraKu Lost & Found Indonesia**. Semua aset desain asli dipertahankan secara utuh.
