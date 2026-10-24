# MuaraKu — Prompt AI Coding Agent: Sesi 3 (v2.3)

> **Prasyarat:** gunakan SQL gabungan `database/source/MuaraKu_Fresh_Install_v2.2.sql` sebagai definisi final untuk fresh install. File ini menggabungkan schema sumber asli dan penyederhanaan menjadi target 22 tabel public. Pengguna harus menjalankan seluruh file itu sendiri hanya pada project Supabase kosong/development, lalu memastikan eksekusi berhasil. Jangan menjalankan SQL, migration, DROP, atau perubahan schema pada project remote atas inisiatif agent. Jika SQL belum berhasil diterapkan atau schema tidak bisa diverifikasi, jangan menebak struktur dan jangan menulis kode yang bergantung pada tabel/kolom yang belum terkonfirmasi; laporkan blocker secara tepat. Jangan jalankan fresh-install SQL pada database yang sudah berisi data.

## Prompt siap salin

Kerjakan **Sesi 3 saja — Lost & Found Core**. Sebelum coding, periksa `git status`, perubahan Sesi 2, file database, dependency, dan route/komponen yang sudah ada. Jangan menghapus atau menulis ulang pekerjaan Sesi 2 tanpa alasan yang terdokumentasi. Pertahankan `database/source/muaraku_supabase_schema(2).sql` sebagai arsip schema sumber yang tidak diedit. Gunakan `database/source/MuaraKu_Fresh_Install_v2.2.sql` sebagai referensi final schema fresh-install v2.2; jangan menganggap migration penyederhanaan lama sudah diterapkan hanya karena file migration tersedia di repo. Verifikasi metadata schema secara read-only bila koneksi Supabase tersedia. Jangan menjalankan SQL, mengarang tabel/kolom baru, atau mengubah schema dalam sesi ini. Jika ada kebutuhan schema yang benar-benar belum terdukung, ajukan proposal migration terpisah dan lanjutkan hanya bagian yang tidak bergantung pada perubahan itu.

Implementasikan:

1. CRUD laporan barang hilang (`report_type = 'lost'`) dan barang ditemukan (`report_type = 'found'`), termasuk validasi form, pesan error yang nyata, ownership, loading/success/error state, dan edit/delete hanya sesuai aturan akses database.
2. Discover feed, halaman Seeker, dan halaman Finder menggunakan data Supabase sungguhan. Empty state harus berasal dari hasil query kosong, bukan placeholder. Feed umum hanya menampilkan laporan yang boleh dilihat—terutama laporan dengan `moderation_status = 'approved'`; pemilik tetap dapat melihat laporan miliknya sesuai RLS.
3. Unggah, tampilkan, ubah, dan hapus media laporan melalui bucket privat `report-images`, mengikuti Storage policy dan path convention dari schema: `<auth.uid()>/<report_id>/<filename>`. Jangan membuat bucket publik atau membuat URL privat permanen. Gunakan signed URL atau metode resmi yang sesuai dengan policy.
4. Search/filter berdasarkan data nyata: kata kunci untuk kolom yang didukung full-text index saat ini (`title`, `description`, `brand`, `color`), serta filter terpisah untuk `report_type`, kategori, kota, lokasi teks (`location_label`), tanggal, dan field yang tersedia. Jangan mengklaim `location_label` sudah termasuk full-text index apabila query/index tidak mendukungnya. Gunakan pagination yang stabil dan hindari mengambil seluruh tabel.
5. Saved reports memakai tabel `saved_reports`; cegah duplikasi dan pastikan pengguna hanya membaca/menambah/menghapus daftar simpan miliknya sendiri.
6. Alur claim menggunakan `claims` dan `claim_evidence` sesuai schema, grants, RLS, trigger, dan Storage policy. Claim harus menghubungkan satu laporan found dengan satu laporan lost; claimant harus pemilik laporan lost dan tidak boleh pemilik laporan found. Hanya izinkan claim pada laporan yang memenuhi status dan relasi valid. Bukti klaim dan `report_private_details` tidak boleh masuk feed, hasil search publik, prop browser yang tidak perlu, log, analytics, atau prompt AI.

### Schema MVP yang berlaku

Hanya gunakan 22 tabel target berikut untuk implementasi MVP:

- Identitas/profil/otorisasi: `user_profiles`, `user_account_controls`, `staff_roles`
- Laporan: `report_categories`, `reports`, `report_private_details`, `report_media`
- Klaim dan simpanan: `claims`, `claim_evidence`, `saved_reports`
- Chat (milik Sesi 4; jangan implementasikan pada Sesi 3): `conversations`, `conversation_members`, `messages`, `user_blocks`
- Notifikasi/keamanan (fitur lanjutan): `notifications`, `safety_reports`, `admin_activity_logs`
- Support/AI/ketentuan (fitur lanjutan): `support_tickets`, `support_ticket_messages`, `muara_ai_sessions`, `muara_ai_messages`, `terms_acceptances`

`auth.users` adalah identitas Auth resmi Supabase dan tidak termasuk 22 tabel public di atas. Jangan membuat tabel `users`, `passwords`, `otp_codes`, atau `sessions` sendiri. `user_profiles.user_id` dan tabel aplikasi pengguna harus terhubung ke `auth.users.id` sesuai foreign key yang ada. Preferensi notifikasi yang sebelumnya berada di `notification_preferences` sekarang ada sebagai kolom privat `notify_*` pada `user_account_controls`; jangan menggunakan nama tabel lama.

`reports.location_id` sudah dihapus. Simpan lokasi laporan di `location_label` dan `city`; jangan membuat ulang tabel `locations` untuk Sesi 3. Tabel `report_matches`, `report_translations`, `moderation_appeals`, dan `location_staff_verifications` sengaja tidak termasuk MVP saat ini. Jangan memanggil atau membuat alur yang membutuhkan tabel tersebut. Tidak ada fitur terjemahan postingan dan tidak ada skor match buatan. AI Search/matching bukan bagian Sesi 3; gunakan query database yang sebenarnya.

### Aturan keamanan dan kualitas

- Pertahankan perbedaan `case_status` dan `moderation_status`. Insert laporan baru harus mengikuti nilai awal dan aturan review dari database; jangan set status approved dari client atau mengklaim laporan langsung tayang bila masih `pending_review`.
- Jangan melewati RLS/grants menggunakan `service_role` di browser. `service_role`/secret hanya boleh ada di server-only environment.
- Jangan memakai `user_metadata` sebagai sumber otorisasi. Jangan mempercayai `reporter_user_id`, status, atau user ID yang dikirim client tanpa memeriksa sesi dan kebijakan database.
- Jangan membuat mock report, fake users, fake chat, fake notification, fake match score, fake success toast, atau fallback yang menutupi kegagalan database.
- Tangani kesalahan Supabase secara eksplisit. Jangan menelan error lalu menampilkan sukses. Untuk upload, pastikan rollback/cleanup jika row metadata gagal dibuat.
- Periksa semua query/komponen Sesi 2 yang masih membaca `notification_preferences` atau `reports.location_id`; selaraskan referensinya dengan schema final v2.2 (`user_account_controls.notify_*`, `reports.location_label`, dan `reports.city`) dan dokumentasikan perubahan kompatibilitasnya. Jangan menambahkan kembali tabel/kolom lama.
- Jaga desain konsisten dengan `DESIGN.md` dan komponen fondasi yang sudah dibuat. Prioritaskan responsivitas, aksesibilitas, keyboard/focus state, serta konsistensi loading/empty/error. Jangan finalisasi ulang Navbar/sidebar di luar kebutuhan fitur.

### Acceptance criteria dan pelaporan akhir

Sesi ini baru dianggap selesai setelah:

- Create/read/update/delete laporan teruji dengan database sungguhan dan dua pengguna uji yang berbeda.
- Pengguna A tidak bisa mengedit/menghapus laporan milik Pengguna B dengan mengganti ID atau payload.
- Laporan `pending_review` tidak tampil di feed publik, namun pemilik dapat melihat status laporan miliknya.
- Upload dan akses media menghormati path, bucket, dan policy; private clues dan claim evidence tidak bisa dibaca pengguna yang tidak berhak.
- Search, filter, pagination, saved reports, dan claim menghasilkan state sesuai respons database.
- Empty state benar-benar mencerminkan data kosong; tidak ada mock/fake success.
- Jalankan lint, type-check, tests, dan build yang tersedia. Catat hasil `PASS`, `FAIL`, `NOT RUN`, atau `BLOCKED` secara jujur.

Di akhir, berikan ringkasan pekerjaan, daftar file yang berubah, tes beserta hasil, hal yang belum bisa diuji, risiko/proposal schema (jika ada), dan checklist Sesi 3. Perbarui `CHANGELOG.md` berdasarkan perubahan nyata, lalu **berhenti dan tunggu review pengguna** sebelum Sesi 4.
