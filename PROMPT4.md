# MuaraKu — Prompt AI Coding Agent: Sesi 4 (v2.4)

> **Scope sesi:** Fitur Chat, Notifikasi & Community Trust, ditambah empat perbaikan integrasi yang diminta pengguna: redirect setelah login, penghapusan dummy data, penyelarasan form laporan, dan section developer di About.
>
> **Jangan deploy. Jangan mengubah database/schema secara langsung. Jangan menghapus data asli pengguna.** Selesaikan hanya scope sesi ini, jalankan verifikasi yang tersedia, perbarui `CHANGELOG.md`, lalu berhenti untuk review pengguna.

## Prompt siap salin ke AI Coding Agent lokal

Kerjakan **Sesi 4 saja** untuk proyek MuaraKu. Sebelum coding, audit repo dan implementasi yang benar-benar ada; jangan mengasumsikan struktur file atau route masih sama dengan dokumentasi lama.

### 0. Pemeriksaan awal wajib

1. Periksa `git status`, branch aktif, perubahan yang belum di-commit, lockfile, `package.json`, route aktual, callback autentikasi, form laporan, halaman About, dan seluruh source data yang dikonsumsi UI. Jangan menimpa atau menghapus perubahan pengguna.
2. Baca `AGENTS.md`, `DESIGN.md`, keputusan produk, PRD yang relevan, `CHANGELOG.md`, dokumentasi database/relasi, serta prompt Sesi 3 terbaru jika file tersedia.
3. Untuk schema, gunakan `database/source/MuaraKu_Fresh_Install_v2.2.sql` sebagai referensi final schema MVP v2.2. `database/source/muaraku_supabase_schema(2).sql` merupakan arsip schema lama, bukan dasar untuk menulis query baru. Verifikasi struktur secara read-only bila koneksi tersedia. **Jangan menjalankan SQL/migration, `DROP`, reset, atau perubahan schema pada Supabase.** Jangan mengarang tabel atau kolom.
4. Pastikan hasil patch pra-Sesi 4 dan Sesi 3 sudah ditinjau. Jika ditemukan blocker schema/performance penting yang membuat fitur Sesi 4 tidak aman, selesaikan hanya bagian yang langsung diperlukan untuk sesi ini bila dapat dilakukan tanpa perubahan schema; selain itu tandai `BLOCKED`, jelaskan bukti, dan lanjutkan tugas mandiri yang aman. Jangan menyatakan blocker sudah selesai tanpa tes.
5. Ikuti route yang benar-benar tersedia dan target routing yang ditetapkan PRD. Catat pemetaan route saat ini sebelum mengubah redirect atau navigasi.

---

## A. Perbaiki redirect setelah login

Masalah yang dilaporkan: setelah login, pengguna diarahkan ke URL `localhost` atau lokasi yang salah, bukan ke halaman aplikasi yang semestinya.

1. Telusuri seluruh alur email/password, OTP, Google OAuth, callback route, `redirectTo`, `router.push/replace`, serta konfigurasi URL Supabase. Temukan titik penyebabnya dengan bukti kode/log; jangan sekadar mengganti string secara global.
2. Jangan hard-code `http://localhost:3000` sebagai URL tujuan login di kode aplikasi. Gunakan mekanisme base URL/environment yang sudah ada; jika belum ada, tentukan satu nama environment yang konsisten, dokumentasikan di `.env.example`, dan baca hanya dari tempat yang sesuai. Jangan menampilkan secret ke client.
3. Untuk development lokal, gunakan origin development aktif secara konfigurasi; untuk production, redirect harus memakai domain aplikasi yang dikonfigurasi. `localhost` hanya valid ketika memang origin yang digunakan saat development, bukan URL production.
4. OAuth harus mengarah ke callback aplikasi yang benar, kemudian callback memvalidasi/menyimpan sesi Supabase dan meneruskan pengguna ke halaman aplikasi yang dituju. Pilih satu target pasca-login yang benar berdasarkan routing/PRD (misalnya `/discover` apabila route itu sudah menjadi route utama; jika repo masih memakai route lain, gunakan route aktif yang tepat dan dokumentasikan pemetaannya). Jangan membuat `/app` atau `/discover` baru tanpa memeriksa struktur aktual.
5. Gunakan allowlist redirect yang aman. Tolak `next`/redirect tujuan eksternal yang tidak diizinkan untuk mencegah open redirect. Jangan menghilangkan validasi sesi, middleware/guard, atau penanganan error. Tangani cancel/error OAuth dan kasus callback tanpa code/session.
6. Periksa konfigurasi `Site URL` dan `Redirect URLs` Supabase jika dokumentasi/config repo bisa dibaca. Agent tidak boleh mengubah dashboard eksternal atau menebak domain production. Jika perlu perubahan manual di Supabase/Google Console, berikan langkah spesifik yang harus dilakukan pengguna.
7. Verifikasi email/password, OTP, dan OAuth sesuai alat yang tersedia, termasuk redirect lokal dan pemetaan domain production berdasarkan konfigurasi. Jika OAuth tidak bisa dijalankan karena credential/dashboard, laporkan `BLOCKED` dan jelaskan tes yang belum bisa dilakukan; jangan memalsukan keberhasilan.

**Kriteria selesai:** tidak ada production URL yang hard-coded ke localhost; alur pasca-login menuju route aplikasi yang benar; sesi tetap aktif; callback/error/cancel memiliki state yang benar; konfigurasi manual yang belum dilakukan dituliskan jelas.

---

## B. Hapus dummy data dari UI runtime

Audit semua halaman/komponen/hook/API yang menampilkan laporan, user, profile, foto, chat, pesan, notifikasi, claim, hasil pencarian, statistik, atau status sukses.

1. Hapus data palsu/mock/demo/fallback yang digunakan oleh UI runtime untuk berpura-pura bahwa data aplikasi ada. Hapus juga fallback yang diam-diam mengganti error Supabase dengan array statis atau toast sukses palsu.
2. Gunakan data sungguhan dari Supabase sesuai schema final dan RLS. Jika query sukses dengan hasil kosong, tampilkan empty state yang jelas; jika query gagal, tampilkan error state dan tindakan retry yang wajar. Jangan menyamarkan kedua keadaan itu sebagai data contoh.
3. Jangan menambahkan dummy reports/users/messages/notifications untuk membuat halaman terlihat ramai. Global Chat boleh menggunakan row percakapan global yang disediakan schema, tetapi **jangan membuat seed pesan palsu**.
4. Jangan menghapus fixture yang khusus dipakai unit/integration test apabila jelas terisolasi di lingkungan test. Pastikan fixtures tidak diimpor ke bundle atau jalur runtime produksi.
5. Jangan menghapus data pengguna sungguhan, menjalankan `DELETE`/truncate, mengosongkan database, mengubah seed database, atau menghapus kategori sistem yang memang merupakan data referensi sah. Tugas ini adalah membersihkan mock/fallback di kode/UI, bukan melakukan penghapusan data remote.
6. Pastikan placeholder avatar/gambar tidak disamarkan sebagai foto pengguna asli. Gunakan fallback visual netral jika profil memang tidak memiliki foto.

**Kriteria selesai:** UI runtime tidak menyajikan laporan/chat/notifikasi/user buatan; empty/error state berasal dari hasil dan error nyata; tidak ada destructive DB action.

---

## C. Selaraskan form create/edit laporan Lost & Found

Periksa seluruh form membuat dan mengedit laporan di Discover/Seeker/Finder serta komponen form bersama. Hindari menduplikasi implementasi form yang sama jika komponen bersama sudah cocok.

### Field dan perilaku UI

- **Wajib:** nama barang/judul (`title`), kategori (`category_id`), tanggal kejadian (`occurred_at`), lokasi teks (`location_label`), kota (`city`), dan deskripsi publik (`description`).
- **Opsional:** waktu kejadian, foto/media, warna (`color`), merek (`brand`), dan model (`model`).
- Tipe laporan (`report_type`) harus ditentukan oleh konteks halaman/aksi lost atau found dan tidak dapat diubah secara sembarang melalui payload klien.
- Gunakan label dan pesan validasi yang mudah dipahami dalam bahasa yang sedang aktif (Indonesia/Inggris) sesuai sistem i18n yang sudah ada.
- Validasi panjang/input harus sesuai constraint schema aktual, termasuk batas judul 3–140 karakter dan deskripsi publik 5–5000 karakter bila constraint tersebut cocok dengan schema yang telah diterapkan.
- Field waktu harus benar-benar opsional di UI. Karena schema menggunakan `occurred_at` sebagai timestamp, periksa cara penyimpanan dan rendering date-only yang telah ada. Jangan mengarang jam kejadian, jangan menggeser tanggal karena konversi zona waktu, dan jangan mengubah schema diam-diam. Jika schema yang tersedia tidak dapat merepresentasikan tanggal tanpa waktu dengan tepat, terapkan solusi aplikasi yang aman jika didukung field yang ada; jika tidak, dokumentasikan keterbatasan dan ajukan proposal terpisah tanpa menerapkan migration.
- Foto adalah opsional. Saat ada file, validasi tipe/ukuran berdasarkan kebijakan bucket yang nyata, tampilkan progress/error, dan bersihkan upload yang gagal disimpan sebagai metadata sesuai mekanisme aman yang sudah ada. Jangan membuat gambar contoh.
- Warna, merek, dan model tidak boleh menjadi wajib.
- Jika produk memiliki informasi privat/petunjuk pemilik, simpan hanya di `report_private_details` sesuai schema/RLS yang benar. Jangan masukkan clue privat, kontak privat, atau evidence ke deskripsi publik, feed, search, log, props yang tidak diperlukan, ataupun payload AI. Jangan menambah field privat ke tabel `reports` tanpa persetujuan perubahan schema.
- Pada edit, prefill hanya dengan data milik laporan yang benar-benar diizinkan untuk dibaca user. Tampilkan error nyata jika update/upload gagal; jangan menganggap simpan berhasil.

### UX dan keamanan

- Buat form responsif, label jelas, petunjuk ringkas, validasi inline, focus/error state, dan loading/submitting state. Jangan membangun modal panjang yang sulit dipakai; kelompokkan field opsional dalam bagian lanjutan/collapsible jika sesuai desain yang ada.
- Pertahankan visual sesuai `DESIGN.md`; jangan redesign seluruh situs.
- Query/insert/update wajib memakai kolom final schema, termasuk `location_label` dan `city`. Jangan menghidupkan kembali `reports.location_id`, `locations`, atau nama tabel/kolom lama.
- Jangan menerima `reporter_user_id`, status moderasi, atau ownership dari klien tanpa validasi server/RLS. Jangan mempromosikan laporan ke approved dari UI.

**Kriteria selesai:** semua form create/edit mengikuti field wajib/opsional di atas, terhubung ke Supabase yang sebenarnya, tidak bocor data privat, dan gagal secara jujur saat validasi/storage/database error.

---

## D. Tambahkan section developer pada halaman About

Tambahkan satu section baru pada halaman About yang memperkenalkan developer/team MuaraKu. Letakkan di bawah section About yang paling logis menurut layout saat ini; pertahankan urutan halaman yang sudah ada dan desain yang responsif.

Setiap kartu developer harus mendukung:

- Foto/avatar developer.
- Nama.
- Role di tim/proyek.
- Link LinkedIn.
- Link Instagram.

Instruksi implementasi:

1. Periksa isi repo dan aset lokal untuk nama, foto, role, dan URL sosial yang benar-benar diberikan. Gunakan hanya informasi yang telah ada/terkonfirmasi; **jangan mengarang nama, foto, role, atau link**.
2. Simpan konten section sebagai data terstruktur yang mudah diedit (gunakan pola/config konten yang sudah ada; jika belum ada, buat modul konfigurasi bertipe seperti `src/config/developers.ts` atau lokasi ekuivalen yang sesuai struktur repo). Schema entri minimal: `name`, `role`, `photo`, `linkedinUrl`, `instagramUrl`.
3. Bila informasi developer belum tersedia, implementasikan layout dan sumber data tanpa profil palsu. Tambahkan komentar `TODO` yang jelas agar pemilik proyek mengisi data asli; tampilkan empty state yang rapi atau sembunyikan kartu yang belum lengkap tanpa menghilangkan section/heading.
4. Gunakan foto lokal yang tersedia jika memang milik developer dan sudah jelas, atau URL foto yang dikonfirmasi. Jangan menarik gambar acak dari internet. Fallback avatar harus netral dan tidak terlihat sebagai identitas asli.
5. Link sosial opsional jika belum ada, tetapi bila ditampilkan harus mengarah ke URL valid. Buka tab baru dengan atribut keamanan yang tepat (`rel="noopener noreferrer"`). Jangan merender ikon/link mati jika URL kosong.
6. Gunakan komponen kartu yang sesuai design tokens; layout desktop boleh multi-column dan mobile menjadi satu kolom atau grid kecil. Tambahkan alt text dan aksesibilitas keyboard/focus.
7. Ikuti i18n yang ada untuk heading/intro section. Hindari menambah database table atau dashboard pengelolaan tim; daftar statis terstruktur sudah cukup kecuali produk saat ini memang punya pola konten yang berbeda.

**Kriteria selesai:** section developer tampil pada About, setiap kartu dapat menampung foto/nama/role/LinkedIn/Instagram, tidak ada identitas/link buatan, dan konten mudah diperbarui tanpa mengubah layout.

---

## E. Implementasi Sesi 4 — Chat, Notifikasi & Community Trust

Kerjakan fitur berikut sesuai schema final dan aturan produk. Jangan memulai fitur admin/support/AI penuh milik Sesi 5.

### Global Chat

- Gunakan row Global Chat yang sudah ditetapkan schema: conversation ID `00000000-0000-4000-8000-000000000001`, setelah memastikan row tersebut benar-benar ada pada database yang digunakan.
- Jangan membuat contoh pesan atau pengguna palsu. Jika belum ada pesan, tampilkan empty state.
- Pastikan pengiriman, pagination/loading pesan, error state, dan identitas pengirim menggunakan sesi dan data Supabase yang sebenarnya. Jangan menambahkan polling agresif. Jika memakai realtime, subscribe hanya pada channel yang diperlukan dan bersihkan subscription saat unmount.
- Pembatasan, format, dan akses pesan harus sesuai RLS serta status akun. Jangan menganggap menyembunyikan pesan di frontend sebagai kontrol akses.

### Direct/Private Chat dan report-related conversation

- Buat direct conversation hanya melalui RPC `public.muaraku_create_direct_conversation(...)` atau wrapper server terpercaya yang sesuai signature dan aturan schema aktual. Jangan mengizinkan client menambahkan anggota percakapan arbitrer.
- Pastikan identitas pengguna diambil dari sesi tepercaya, bukan ID bebas dari payload. Validasi apakah peserta diblokir satu sama lain, status akun aktif, anggota percakapan, dan konteks laporan sesuai alur produk.
- Terapkan route guard dan query isolation. Pengguna yang bukan anggota tidak boleh membaca thread, pesan, signed media, atau metadata privat.
- Jangan membuat private chat palsu atau tampilan pesan awal yang tidak pernah dikirim.

### Blocks dan safety reports

- Implementasikan block/unblock dan report user/content sesuai tabel, policy, serta field yang benar-benar ada. Verifikasi bahwa blokir mencegah interaksi yang dilarang sesuai keputusan produk.
- Tindakan sensitif harus melewati RLS atau server-side handler tepercaya; client tidak boleh mengubah status akunnya sendiri atau menaikkan role.
- Jangan menambahkan halaman/flow formal untuk fitur yang memang ditunda dari schema MVP (misalnya appeals formal atau verifikasi petugas lokasi) seolah-olah fitur tersebut berfungsi.

### Notifications

- Hanya tampilkan notifikasi yang benar-benar berasal dari tabel `notifications` dan milik recipient yang sedang login.
- Preferensi notifikasi tersimpan sebagai kolom `notify_*` di `user_account_controls`, bukan tabel `notification_preferences`. Izinkan perubahan hanya terhadap kolom preferensi yang boleh diedit pengguna; jangan izinkan perubahan status akun atau kolom kontrol lain.
- Mark-as-read harus dites terhadap policy/grants aktual. Jika kebijakan update `read_at` tidak tersedia atau schema tidak mengizinkannya, jangan melewati RLS dan jangan mengedit SQL sendiri. Dokumentasikan temuan serta buat proposal migration/policy minimum terpisah untuk persetujuan.

### Global Chat retention / clearing

- Jangan menyembunyikan pesan di UI agar terlihat seperti pesan terhapus.
- Jangan membuat job penghapusan otomatis pada database produksi selama arti “clear”, retensi, backup, dan moderasi belum didefinisikan dan disetujui. Jika kebutuhan penghapusan pukul 00.00 WIB tetap berlaku, sediakan proposal singkat yang menjelaskan apakah pesan dihapus permanen, diarsipkan, atau hanya tidak ditampilkan pada sesi hari berikutnya; implementasikan scheduler hanya setelah kebijakan disetujui dan melalui backend tepercaya.

### Staff actions

- Jika moderasi dasar telah masuk scope sesi ini, validasi staff role dari tabel `staff_roles` di sisi server/database. Catat tindakan melalui `admin_activity_logs` jika schema dan flow yang tersedia mendukungnya.
- AI tidak boleh menentukan sanksi berat secara otomatis. Jangan membuat panel admin/AI lengkap jika hal tersebut menjadi scope Sesi 5.

---

## F. Aturan schema, kualitas, dan keamanan yang berlaku untuk semua tugas

- Schema MVP target memiliki 22 tabel public: `user_profiles`, `user_account_controls`, `staff_roles`, `report_categories`, `reports`, `report_private_details`, `report_media`, `claims`, `claim_evidence`, `saved_reports`, `conversations`, `conversation_members`, `messages`, `user_blocks`, `notifications`, `safety_reports`, `admin_activity_logs`, `support_tickets`, `support_ticket_messages`, `muara_ai_sessions`, `muara_ai_messages`, dan `terms_acceptances`. Identitas tetap berasal dari `auth.users`.
- Gunakan field final seperti `reports.location_label`, `reports.city`, `reports.occurred_at`, `reports.color`, `reports.brand`, `reports.model`, `user_account_controls.notify_*`, dan nama final `admin_activity_logs` sesuai file SQL final yang telah diaplikasikan. Jangan menebak jika database aktual belum sesuai.
- Jangan menggunakan `service_role` di browser, jangan expose API key/secret, jangan memercayai `user_metadata` untuk otorisasi, dan jangan bypass RLS dengan fallback query.
- Tidak boleh mengubah schema, menjalankan destructive SQL, menambah tabel baru, atau membuat migration otomatis di sesi ini. Jika fitur membutuhkan perubahan schema, siapkan proposal migration terpisah berisi alasan, dampak, policy/RLS, strategi data, dan rollback; lanjutkan bagian lain yang aman.
- Jangan menambah dependency besar atau melakukan rewrite total tanpa bukti. Pertahankan bahasa/tema dan komponen yang sudah ada.

---

## G. Verifikasi wajib

Gunakan package manager dari lockfile dan scripts yang benar-benar tersedia. Jalankan secara terpisah lint, type-check, test, dan build jika tersedia. Catat hasil masing-masing sebagai `PASS`, `FAIL`, `NOT RUN`, atau `BLOCKED`.

Uji area berikut jika alat dan lingkungan mengizinkan:

1. Login email/password, OTP, OAuth callback/redirect, refresh/restore session, logout, serta route guard.
2. Redirect tidak hard-coded ke localhost untuk production dan selalu mengarah ke route app yang sesuai. Jangan menyatakan production OAuth terverifikasi jika credential/domain production tidak dapat diuji.
3. Discover/Seeker/Finder: form create/edit, field wajib/opsional, tanggal/timezone, media opsional, error state, dan empty state.
4. Tidak ada mock/fake reports, users, chat, messages, notifications, atau fallback sukses di runtime.
5. About: section developer responsif, data tanpa profil palsu, link sosial valid, alt text dan focus state.
6. Global Chat dan private chat dengan dua akun berbeda bila memungkinkan; cek membership, block, RLS, dan data separation.
7. Notifications hanya untuk recipient; mark-as-read sesuai policy aktual.
8. Pindah halaman berulang, membuka/menutup form, mengirim pesan, dan melakukan search tidak menciptakan fetch/render/subscription loop.
9. Console/server logs tidak memiliki error berulang yang diketahui; jangan mengarang pengukuran yang tidak dilakukan.

Jangan menyatakan fitur “aman”, “selesai”, atau “lulus” tanpa bukti. Jika tes lintas pengguna atau OAuth belum dapat dilakukan, tulis persis apa yang belum diuji dan mengapa.

---

## H. Laporan akhir dan batas sesi

Sebelum berhenti:

1. Perbarui `CHANGELOG.md` hanya dengan perubahan yang benar-benar dibuat.
2. Berikan daftar file berubah dan alasan tiap kelompok perubahan.
3. Jelaskan akar masalah redirect localhost yang ditemukan, perubahan yang dilakukan, konfigurasi manual Supabase/Google yang masih dibutuhkan, dan hasil tes.
4. Laporkan data dummy yang dibuang dari runtime beserta lokasi sumbernya; pastikan tidak ada data database asli yang dihapus.
5. Laporkan perubahan form serta bagaimana tanggal tanpa waktu ditangani, atau dokumentasikan blocker bila schema tidak mendukungnya dengan benar.
6. Laporkan section developer, lokasi config datanya, serta data nama/foto/role/URL mana yang masih harus diisi oleh pemilik proyek.
7. Cantumkan hasil tes dalam format `PASS` / `FAIL` / `NOT RUN` / `BLOCKED`, risiko yang tersisa, dan proposal schema/policy bila ada.
8. Tandai Sesi 4 selesai hanya bila acceptance criteria yang relevan terbukti. **Jangan mulai Sesi 5, jangan deploy, dan berhenti menunggu review pengguna.**
