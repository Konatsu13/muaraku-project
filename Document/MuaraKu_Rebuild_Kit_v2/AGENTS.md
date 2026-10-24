# MuaraKu — Instruksi Utama AI Agent

> Baca ini dahulu. Kerjakan hanya satu sesi dari `BUILD_PLAN.md` atas instruksi pengguna.

## Sumber kebenaran

1. Instruksi terbaru pengguna.
2. `AGENTS.md` untuk aturan kerja dan keputusan produk yang telah disetujui.
3. `DESIGN.md` untuk UI; referensi visual pengguna yang ditempatkan di `references/` memperbarui detail desain setelah dianalisis.
4. `reference/PRD_v1.1_Draft.docx` untuk requirement produk. Baca hanya bagian yang relevan dengan sesi aktif, bukan seluruh dokumen jika tidak diperlukan.
5. `database/source/muaraku_supabase_schema(2).sql` adalah satu-satunya sumber relasi/schema SQL. `DATABASE.md` adalah peta bantu, bukan pengganti SQL.

Jika ada konflik, ikuti urutan di atas. Jangan menyimpulkan sebuah fitur selesai hanya karena disebut dalam PRD.

## Keputusan produk wajib

- Rebuild dilakukan bertahap dalam **enam sesi**. Jangan otomatis menjalankan sesi berikutnya.
- **Tidak ada fitur translate postingan/laporan.** Jangan buat tombol, endpoint, job, cache atau UI terjemahan postingan. SQL sumber masih memuat `report_translations`; jangan gunakan atau hapus tabel itu tanpa persetujuan.
- **Settings adalah overlay**, bukan route/halaman. Isinya hanya `Switch Account` dan `Home`. `Home` menuju landing page `/`. Jangan menambahkan item lain tanpa izin.
- Referensi Navbar, navigasi aplikasi, dan elemen tertentu akan diberikan pengguna. AI mendesain dan mengimplementasikan langsung di kode berdasarkan referensi pengguna. Jangan finalisasi detail yang secara eksplisit menunggu referensi.
- Jangan menampilkan postingan, pesan, notifikasi, profil, skor match, token balance, atau status palsu. Jika data kosong, tampilkan empty state yang jujur. Seed hanya boleh dibuat bila diminta dan jelas untuk development.
- Jangan membuat/mengubah schema, kolom, FK, function, trigger, RLS, grants, atau Storage policy sendiri. Untuk kebutuhan yang tidak ditampung SQL, buat usulan migration terpisah beserta alasan, dampak dan rollback; tunggu persetujuan.
- Jangan menggunakan SQL buatan assistant atau ingatan sebagai pengganti SQL pengguna. Jangan mengganti nama tabel/kolom agar cocok dengan ORM.
- Jangan menaruh secret, service-role key, provider API key, SMTP key, atau token di client/browser atau `NEXT_PUBLIC_*`.

## Arsitektur dan folder target

Baseline teknis yang pernah digunakan adalah Next.js App Router, TypeScript, React, Tailwind CSS, dan Supabase. Verifikasi repo/dependency aktual sebelum mengubahnya. Rancangan AI sebelumnya menggunakan Python + FastAPI terpisah; implementasikan hanya sesuai scope dan konfigurasi yang disetujui.

Target pengelompokan route (sesuaikan dengan struktur App Router yang valid):

```text
src/app/
  (landing)/     # route `/`, about, support, privacy, terms
  (main)/        # discover, seeker, finder, search, profile, messages, muara-ai
  (admin)/       # area admin; perlu pemeriksaan role pada server dan data
src/components/  # ui, landing, navigation, reports, chat, overlays
src/features/    # auth, profiles, reports, claims, messaging, notifications, moderation, support, muara-ai
src/lib/         # supabase, permissions, validation, errors
src/i18n/        # terjemahan teks UI id/en saja
services/ai-service/ # FastAPI bila disetujui/ada dalam implementasi
```

Route group `(admin)` bukan pengaman dengan sendirinya. Jangan mengasumsikan folder tree ini mengharuskan pemindahan besar-besaran sebelum audit; sesuaikan implementasi berdasarkan repo aktual.

## Standar implementasi

- Validasi input di server; gunakan user-scoped Supabase client untuk aksi pengguna dan RLS sebagai lapisan enforcement. Service role hanya di trusted server/job.
- Lindungi `report_private_details`, clue pemilik, kontak privat, `claim_evidence`, percakapan pribadi, AI history, notifikasi dan log berdasarkan izin masing-masing.
- `report_matches.overall_score` hanya rekomendasi, bukan bukti kepemilikan. AI tidak menjatuhkan sanksi berat sendirian.
- AI hanya dipanggil dari backend, dengan timeout, rate/cost limit, validasi payload, serta minimisasi data pribadi. Jangan mengirim clue privat/evidence ke model tanpa kebutuhan dan otorisasi eksplisit.
- Semua fitur harus memiliki state loading, empty, error, success, permission-denied yang relevan. Backend harus mengonfirmasi keberhasilan sebelum UI menyatakan sukses.
- UI mobile-first, aksesibel dengan keyboard, fokus terlihat, semantic HTML, target sentuh minimal 44px, dan menghormati `prefers-reduced-motion`.

## Protokol satu sesi

1. Baca hanya instruksi dan sumber yang relevan dengan sesi aktif.
2. Periksa branch, `git status`, struktur file dan skrip test yang benar-benar tersedia.
3. Sebutkan scope/file yang akan dikerjakan, lalu kerjakan sesi itu saja.
4. Jalankan lint, type-check, test dan build yang tersedia serta relevan. Jangan mengarang command.
5. Perbarui `CHANGELOG.md` hanya dengan perubahan nyata. Checklist dan status sesi dicatat dalam `BUILD_PLAN.md`; jangan tandai selesai jika belum diuji.
6. Ringkas file berubah, tes yang lolos/gagal/tidak dapat dijalankan, risiko terbuka dan migration proposal bila ada. Berhenti dan tunggu instruksi pengguna.
