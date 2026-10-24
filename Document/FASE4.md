# MuaraKu — Patch Pasca-Fase 3 Sebelum Fase 4

## Prompt untuk AI Coding Agent

Kerjakan **PATCH PASCA-FASE 3 saja**. Jangan mulai Fase 4, jangan deploy, dan jangan melakukan rewrite besar tanpa bukti bahwa itu diperlukan.

### Konteks dan sumber kebenaran

Implementasi Fase 3 sebelumnya dibuat tanpa referensi schema database terbaru, dan website sekarang terasa sangat berat sampai browser menampilkan **Page Not Responding**. Tugasmu adalah mengaudit dan memperbaiki ketidaksesuaian schema serta penyebab performa yang benar-benar ditemukan.

1. Baca `AGENTS.md`, keputusan produk yang relevan, struktur proyek, `git status`, perubahan belum di-commit, `CHANGELOG.md`, dan kode Fase 3 yang sudah dibuat. Jangan menghapus perubahan pengguna.
2. Gunakan `database/source/MuaraKu_Fresh_Install_v2.2.sql` sebagai **sumber final schema database aplikasi**. File `database/source/muaraku_supabase_schema(2).sql` hanya arsip schema lama, bukan sumber final untuk menulis query.
3. Jika file SQL terbaru belum ada pada path tersebut, berhenti pada bagian yang membutuhkan schema dan laporkan blocker. Jangan menebak tabel atau kolom.
4. Jangan jalankan SQL, migration, `DROP`, atau perubahan schema pada Supabase. Jangan membuat tabel/kolom baru. Jika koneksi Supabase tersedia, pemeriksaan schema harus read-only.

### Bagian A — Sinkronisasi kode dengan schema final

Audit semua query, types, form, hooks, server actions/routes, dan komponen Fase 3. Betulkan referensi lama agar sesuai SQL final. Secara khusus, periksa agar kode aplikasi tidak lagi bergantung pada:

- `reports.location_id` atau tabel `locations`;
- tabel `report_matches` dan `report_translations`;
- tabel `moderation_appeals` dan `location_staff_verifications`;
- tabel `notification_preferences`;
- tabel `moderation_actions` atau `audit_logs` dengan nama lama.

Gunakan `reports.location_label` dan `reports.city` untuk lokasi, kolom preferensi `notify_*` pada `user_account_controls`, dan nama final `admin_activity_logs` untuk log admin. Jangan gunakan fitur atau tabel yang sengaja tidak termasuk schema MVP final.

Schema final menargetkan 22 tabel public: `user_profiles`, `user_account_controls`, `staff_roles`, `report_categories`, `reports`, `report_private_details`, `report_media`, `claims`, `claim_evidence`, `saved_reports`, `conversations`, `conversation_members`, `messages`, `user_blocks`, `notifications`, `safety_reports`, `admin_activity_logs`, `support_tickets`, `support_ticket_messages`, `muara_ai_sessions`, `muara_ai_messages`, dan `terms_acceptances`. Identitas pengguna tetap berasal dari Supabase Auth (`auth.users`). Jangan menambahkan tabel `users`, OTP, password, atau session buatan sendiri.

Untuk scope patch ini, fokus pada fitur Fase 3: CRUD laporan, Discover, Seeker, Finder, search/filter, media, saved reports, dan claim/evidence yang telah diimplementasikan. Jangan mengimplementasikan Global Chat, Private Chat, blocking, notifikasi, ataupun fitur baru Fase 4. Jangan membuka data privat seperti `report_private_details`, petunjuk pemilik, atau `claim_evidence` ke feed/search publik.

### Bagian B — Temukan akar masalah performa

Jangan langsung menebak penyebab dan jangan hanya menambahkan `useMemo` atau `useCallback` secara massal. Temukan akar masalah berdasarkan kode dan bukti yang tersedia. Periksa:

- React render/effect loop: `useEffect` yang memicu state/fetch berulang, dependency yang salah, callback yang terus berubah, atau request yang berjalan berulang ketika komponen render;
- query Supabase duplikat, request bersarang per kartu (N+1), fetch saat mount yang dipanggil dua kali karena implementasi, polling/timer yang tidak dibersihkan, dan race condition saat pengguna berpindah halaman;
- query terlalu luas seperti `.select('*')`, query tanpa filter/limit/pagination, mengambil seluruh laporan lalu memfilter di browser, payload besar, atau join yang tidak diperlukan;
- pembuatan signed URL berulang di setiap render, upload/download gambar besar, gambar tanpa ukuran yang stabil, komponen berat yang dimuat padahal belum dibutuhkan;
- proses sinkron mahal di main thread, filter/sort berulang atas dataset besar, bundle/dependency berat, hydration error, error runtime, dan request database yang lambat.

Gunakan browser console/network, log dev server, profiler, atau alat lain yang tersedia **jika bisa diakses**. Jika tidak bisa mengaksesnya, lakukan audit kode dan tandai hal yang belum terukur—jangan mengarang hasil profiling. Catat langkah reproduksi, gejala, akar penyebab yang didukung bukti, dan perubahan yang ditujukan untuk mengatasinya.

### Bagian C — Perbaiki dengan perubahan terkecil yang tepat

- Tambahkan query Supabase yang spesifik pada kolom yang dipakai, filter di database, dan limit/pagination stabil. Jangan mengambil seluruh tabel laporan ke browser. Untuk daftar laporan, gunakan ukuran halaman yang wajar (misalnya 12–24 item) kecuali pola pagination yang ada dan telah diuji lebih sesuai.
- Debounce input search sekitar 300 ms jika request saat mengetik menjadi sumber beban. Batalkan atau abaikan hasil request lama agar respons search tidak saling menimpa.
- Hindari query tambahan untuk setiap kartu bila bisa diambil secara aman dalam query terkontrol; jangan mengambil data privat hanya demi mengisi UI publik.
- Pastikan effect, subscription, timer, dan event listener dibersihkan ketika komponen unmount. Jangan menambah polling/realtime hanya untuk membuat UI terasa hidup.
- Optimalkan gambar dan impor komponen berat hanya ketika bukti menunjukkan hal tersebut ikut menyebabkan masalah. Pertahankan perilaku, desain, aksesibilitas, loading/empty/error state, dan keamanan yang sudah benar.
- Jangan menambahkan dependency besar, mengganti framework, merombak seluruh UI, mengubah business logic tanpa kebutuhan, atau menyembunyikan error database dengan mock data/fake success.
- Semua perbaikan harus menghormati RLS, ownership, moderation status, storage policy dan prinsip server/client yang sudah ada. Jangan mengekspos `service_role` atau secret ke browser.

### Bagian D — Verifikasi sebelum Fase 4

Gunakan package manager yang ditentukan oleh lockfile dan scripts yang benar-benar ada di `package.json`. Jalankan lint, type-check, test, dan build yang tersedia secara terpisah. Uji paling tidak:

1. Discover, Seeker, Finder, Search, pembuatan/edit/hapus laporan, detail laporan, media, saved reports, dan claim yang telah diimplementasikan.
2. Pindah halaman dan kembali beberapa kali, mengetik search dengan cepat, berpindah filter, scroll daftar, serta membuka/menutup form. Pastikan tidak ada fetch tanpa akhir atau render loop.
3. Pagination tetap stabil, filter/query memakai field schema final, dan empty/error state tidak berubah menjadi data palsu.
4. Kepemilikan dan privasi tetap utuh: pengguna tidak dapat mengubah laporan milik pengguna lain, laporan pending tidak tampil di feed publik, dan clue/evidence privat tidak bocor.
5. Console/network atau log yang tersedia tidak menunjukkan error berulang atau request berulang tanpa alasan. Bandingkan temuan sebelum/sesudah jika alat memungkinkan.

Jangan klaim “Page Not Responding sudah pasti selesai” bila tidak berhasil mereproduksi dan menguji masalah tersebut. Catat tes sebagai `PASS`, `FAIL`, `NOT RUN`, atau `BLOCKED` secara jujur.

### Batas akhir dan laporan

Sebelum selesai:

- Perbarui `CHANGELOG.md` berdasarkan perubahan nyata; jangan menandai Fase 3 selesai hanya karena patch telah dibuat.
- Berikan ringkasan akar penyebab, bukti yang ditemukan, perbaikan yang dilakukan, daftar file berubah, hasil setiap tes, area yang belum teruji, dan risiko tersisa.
- Jika ditemukan perubahan schema yang diperlukan, tulis proposal terpisah; jangan menerapkannya.
- **Berhenti setelah patch ini dan tunggu review pengguna. Jangan mulai Fase 4.**
