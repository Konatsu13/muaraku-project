# 🌊 MuaraKu (.id)

> *“Muara bagi barang yang berkelana, titik temu bagi yang terpisah.”*

**MuaraKu** adalah platform *Lost & Found* cerdas berstandar modern yang dirancang khusus untuk ekosistem komunitas dan kampus di Indonesia. Mengusung antarmuka yang bersih (*Apple-inspired UI/UX*), sistem verifikasi privasi tinggi, serta teknologi kecerdasan buatan (*AI-powered similarity matching*), MuaraKu hadir sebagai solusi aman dan tepercaya dalam menjembatani penemu dan pemilik barang hilang.

 Proyek ini dikembangkan dalam rangka kompetisi **.id DeveloperDay**.

---

## ✨ Fitur Unggulan (Key Features)

- 🎨 **Minimalist & System-Adaptive UI**  
  Desain antarmuka berkelas dengan estetika *glassmorphism*, tipografi presisi, serta dukungan otomatis *Light/Dark Mode* yang adaptif terhadap preferensi sistem pengguna.

- 🔒 **Sistem Verifikasi Kepemilikan (Anti-Fraud)**  
  Mengamankan rincian sensitif barang hilang dari klaim palsu. Penemu cukup mengunggah barang, dan pengklaim wajib menyelesaikan kuis verifikasi kepemilikan sebelum kontak penemu dibagikan.

- 🌐 **Integritas Identitas Digital Domain `.id`**  
  Memanfaatkannya sebagai pondasi autentikasi identitas pengguna guna memastikan reputasi dan keaslian data dalam ekosistem.

---

## 🤖 Integrasi Fitur AI (AI-Powered Engine)

MuaraKu mengintegrasikan teknologi *Artificial Intelligence* pada inti operasinya untuk mempercepat dan mempermudah proses pencarian barang:

1. **Automatic Image Feature Extraction (AI Vision)**  
   Pengguna tidak perlu mengetik deskripsi panjang. Saat penemu mengunggah foto barang, AI Multimodal secara otomatis mengekstrak atribut penting seperti kategori, warna utama, perkiraan merek, hingga ciri visual khusus.

2. **Vector Similarity Matching (`pgvector`)**  
   - Setiap data visual dan teks dari laporan barang hilang/ditemukan dikonversi menjadi *vector embeddings*.
   - Menggunakan kalkulasi *vector similarity search* (misal: *Cosine Similarity*) langsung di level database PostgreSQL untuk menghitung persentase kemiripan laporan secara *real-time*.

3. **Smart Duplicate & Fraud Filter**  
   Mencegah spasial spamming atau pengunggahan ulang barang yang sama dengan menganalisis kecocokan *vector* laporan baru terhadap *database* yang ada.

---

## 🛠️ Stack Teknologi (Tech Stack)

- **Frontend & Framework:** Next.js (TypeScript) / React
- **Styling:** Tailwind CSS (Apple Minimalist Design System)
- **Database:** PostgreSQL via **Neon.tech** (dilengkapi ekstensi `pgvector`)
- **ORM / Database Client:** Prisma ORM & Prisma Studio
- **AI / Embeddings:** OpenAI Vision / Gemini API & Multimodal Embeddings
- **Storage & Asset Hosting:** Cloudinary / Uploadthing
- **Domain & Infrastructure:** Managed via **Cloudflare DNS** & **Cloudflare Email Routing**
- **Transactional Emails:** **Resend API** (untuk kode OTP & notifikasi verifikasi dari `support@muaraku.id`)

---

## 📂 Struktur Subdomain

- `muaraku.id` — Platform Web Utama & Landing Page
- `api.muaraku.id` — Service Endpoint & AI Matching Server
- `auth.muaraku.id` — Layanan Autentikasi & Digital Identity

---

## 🚀 Panduan Memulai (Getting Started)

### Prerequisites

Pastikan kamu sudah menginstal **Node.js** (v18+) dan **npm/pnpm/yarn**.

