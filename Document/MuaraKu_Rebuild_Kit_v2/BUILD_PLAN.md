# MuaraKu — Rencana Rebuild dan Prompt Enam Sesi

**Cara pakai:** minta agent menjalankan satu sesi spesifik, misalnya `Jalankan Sesi 1 saja`. Agent harus membaca hanya bagian sesi tersebut plus file yang disebutkan; jangan memuat seluruh PRD/SQL bila cukup membaca bagian relevan. Setelah review dan persetujuan pengguna, baru jalankan sesi berikutnya.

## Progress

- [x] Sesi 1 — Audit dan fondasi
- [x] Sesi 2 — Auth, profil dan Settings overlay
- [ ] Sesi 3 — Core Lost & Found
- [ ] Sesi 4 — Chat, notifikasi dan trust
- [ ] Sesi 5 — Admin, Support dan AI
- [ ] Sesi 6 — QA akhir

---

## Sesi 1 — Audit, fondasi dan langsung desain di kode

**Baca:** `AGENTS.md`, `DESIGN.md`, ringkasan/section PRD yang relevan, struktur repo dan skrip proyek.

**Prompt:**
> Kerjakan Sesi 1 saja. Audit keadaan repo, branch, git status, dependencies, skrip test/build dan aset yang ada. Rebuild fondasi aplikasi dengan struktur yang rapi berdasarkan keputusan produk dan arsitektur pada `AGENTS.md`; jangan menyalin membabi buta kode lama. Buat base layout, tokens, komponen dasar, error/loading/empty pattern, serta landing page skeleton yang responsif. Desain langsung di kode berdasarkan `DESIGN.md` dan referensi pengguna jika sudah tersedia. Jika referensi Navbar/sidebar belum diberikan, jangan finalisasi detailnya; sisakan komponen yang mudah disesuaikan dan lanjutkan pekerjaan fondasi yang tidak bergantung pada referensi. Jangan implementasikan fitur domain atau ubah SQL di sesi ini.

**Selesai bila:** fondasi buildable, struktur jelas, design tokens terpusat, layout responsif awal, keputusan/asumsi tercatat, dan tes yang tersedia dilaporkan.

## Sesi 2 — Auth, profil, role dan Settings

**Baca:** `AGENTS.md`, bagian auth/profile/settings dari PRD, dan `DATABASE.md` bagian profil/role/RLS.

**Prompt:**
> Kerjakan Sesi 2 saja. Implementasikan Supabase Auth, alur login/registrasi sesuai konfigurasi yang benar-benar tersedia, callback/session guard, profil, preferensi bahasa/tema bila termasuk scope PRD, serta pengecekan role. Jangan mengarang konfigurasi OAuth/SMTP yang belum ada. Implementasikan Settings sebagai overlay berisi hanya `Switch Account` dan `Home` menuju `/`; jangan membuat halaman Settings. Definisikan `Switch Account` dengan alur aman sesuai model sesi yang tersedia; jika UX multi-akun belum jelas, jangan membuat session manager fiktif. Gunakan nama tabel/kolom SQL persis dan patuhi RLS/grants; jangan mengubah SQL.

**Selesai bila:** auth dan redirect diuji, user tidak dapat menaikkan role sendiri, profil hanya dapat diedit pemiliknya, Settings sesuai keputusan, dan error/loading state ada.

## Sesi 3 — Lost & Found Core

**Baca:** bagian report/search/claim dari PRD dan bagian terkait di `DATABASE.md`.

**Prompt:**
> Kerjakan Sesi 3 saja: CRUD laporan lost/found, upload media, Discover, Seeker, Finder, Search/filter, saved reports dan alur claim yang masuk scope PRD. Pakai `database/source/muaraku_supabase_schema(2).sql` sebagai satu-satunya sumber schema. Hormati `case_status` vs `moderation_status`, triggers, RLS, grants, Storage path/policy, dan aturan klaim. Jangan kirim `report_private_details`, clue pemilik, kontak privat atau claim evidence ke feed/search publik. Jangan membuat seed/demo palsu, skor match palsu, fitur translate postingan, atau tabel embedding/vector tanpa migration yang disetujui. Jika skema tidak mendukung kebutuhan, ajukan proposal terpisah.

**Selesai bila:** create/read/edit/flows yang diizinkan diuji terhadap database, status moderasi ditaati, media terlindungi, empty state nyata, dan relasi claim lolos tes.

## Sesi 4 — Chat, notifikasi dan kepercayaan

**Baca:** bagian messaging/trust dari PRD dan `DATABASE.md`.

**Prompt:**
> Kerjakan Sesi 4 saja: Global Chat, direct/private chat, user block, notifikasi, safety reports dan alur moderation/appeal yang didukung SQL. Gunakan global conversation UUID yang disediakan SQL, tetapi jangan seed pesan. Direct conversation harus dibuat melalui RPC `muaraku_create_direct_conversation(...)` atau wrapper tepercaya yang sesuai. Pastikan peserta percakapan diverifikasi di server dan RLS. Uji fitur mark-as-read; jangan mengubah SQL diam-diam jika policy kurang. Pembersihan Global Chat pukul 00.00 WIB hanya boleh dibuat setelah definisi retensi disepakati dan memakai job backend tepercaya—bukan menyembunyikan pesan di UI. AI tidak memutuskan sanksi berat sendirian.

**Selesai bila:** tes lintas dua pengguna membuktikan privasi chat, blocking, isolasi notifikasi dan role staf; risiko policy dicatat.

## Sesi 5 — Admin, Support dan AI

**Baca:** bagian admin/support/AI dari PRD, `DATABASE.md`, dan `DESIGN.md`.

**Prompt:**
> Kerjakan Sesi 5 saja: dashboard admin/moderator/support/location verifier sesuai role SQL; support tickets dan pemisahan pesan internal; Muara AI untuk bantuan berdasarkan FAQ/policy resmi; AI Search berbasis field laporan yang diizinkan. Rancangan AI service sebelumnya menggunakan Python + FastAPI terpisah, tetapi periksa PRD/konfigurasi sebelum menambah service/dependency. API key hanya di backend. Jangan mengirim clue privat/evidence ke model; jangan expose system prompt/secret; terapkan validasi, timeout, rate/cost limit dan error state. SQL memiliki full-text search index dan `report_matches`, tetapi tidak memiliki embedding/vector table yang terlihat; jelaskan pendekatan retrieval nyata dan ajukan migration jika perlu. `muara_ai_messages` mencatat token per pesan, bukan token wallet/balance; jangan tampilkan saldo fiktif. Jangan implementasikan translate postingan.

**Selesai bila:** akses admin dan support teruji, AI tidak mengakses data tak berwenang, output/search sesuai kemampuan sebenarnya, dan error/limit dilaporkan.

## Sesi 6 — QA dan kesiapan rilis

**Baca:** `AGENTS.md`, seluruh checklist di dokumen ini, `DATABASE.md`, `DESIGN.md`, `CHANGELOG.md`, dan status task.

**Prompt:**
> Kerjakan Sesi 6 saja; ini audit, bukan izin rewrite bebas. Periksa git diff, jalankan lint, type-check, tests, build dan E2E yang memang tersedia. Uji signup/login/logout, profile, report CRUD, search, claim/evidence, Global/Private Chat dua pengguna, blocking, notification, moderation/support, AI error, Settings overlay dan halaman responsif. Verifikasi RLS/Storage dengan konteks akun berbeda jika memungkinkan. Cari secret, dummy data, fake success, fake score, dan fitur translate-post. Jangan edit SQL sumber. Jika butuh perubahan schema, tulis proposal migration dengan alasan, dampak dan rollback. Perbarui checklist/changelog akurat, klasifikasikan temuan blocker/high/medium/low, lalu berikan rekomendasi release berbasis bukti. Jangan deploy.

**Selesai bila:** hasil test/area tak teruji terdokumentasi, temuan punya severity dan langkah reproduksi, dan rekomendasi rilis jelas.

---

## Aturan penutupan tiap sesi

Agent wajib merangkum: (1) yang dikerjakan, (2) file berubah, (3) perintah/tes dan hasilnya, (4) hal yang belum teruji, (5) risiko/proposal yang menunggu persetujuan. Perbarui checkbox sesi hanya jika kriteria selesai terbukti; catat perubahan nyata dalam `CHANGELOG.md`; berhenti menunggu instruksi pengguna.
