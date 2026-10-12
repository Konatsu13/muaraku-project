# 🌊 MuaraKu (.id)

> *“Muara bagi barang yang berkelana, titik temu bagi yang terpisah.”*

**MuaraKu** adalah platform *Lost & Found* sipil dan komunitas terpercaya di Indonesia yang dirancang khusus untuk ekosistem fasilitas publik, transportasi, dan kampus. Mengusung antarmuka yang bersih (*Civic Minimalist Design*), sistem verifikasi privasi tinggi, serta asisten cerdas, MuaraKu hadir sebagai solusi aman dalam menjembatani penemu dan pemilik barang hilang tanpa rasa cemas terhadap penipuan.

---

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

---

## 🛠️ Stack Teknologi (Tech Stack)

- **Frontend & Framework:** Next.js 16 (App Router, Turbopack, React 19)
- **Bahasa:** TypeScript 5.x (Strict Mode)
- **Styling & Icons:** Tailwind CSS v4, Lucide Icons
- **Backend & Database:** Supabase PostgreSQL (28 tabel, Row Level Security, Storage Buckets)
- **Autentikasi & Keamanan:** Supabase Auth (Email OTP & Google OAuth) + Cloudflare Turnstile
- **Penerjemahan:** Google Cloud Translation API v2 dengan caching pintar di PostgreSQL
- **Asisten AI:** Gemini API & OpenAI API

---

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
