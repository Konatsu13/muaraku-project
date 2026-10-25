# MuaraKu — Prompt AI Coding Agent: Sesi 4 (v2.5)

> **Scope sesi:** Fitur Chat, Notifikasi & Community Trust, ditambah perbaikan OTP, redirect OAuth, password untuk pengguna Google OAuth, penghapusan dummy data termasuk Admin, restrukturisasi route group, navigasi Admin, redesign form laporan, section tiga developer di About, serta penggunaan Taste Skill.
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

## A. Gunakan Taste Skill dan rapikan struktur folder/route group

### Taste Skill wajib dipakai untuk audit dan perbaikan UI

1. Periksa apakah skill `design-taste-frontend` dari Taste Skill sudah tersedia di repo/lingkungan agent. Baca `SKILL.md` dan ikuti instruksi yang relevan, bukan hanya menyebut namanya.
2. Jika belum terpasang dan lingkungan mengizinkan instalasi, gunakan perintah resmi berikut:

   ```bash
   npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
   ```

   Jika command tidak tersedia, network diblokir, atau skill tidak dapat dimuat, jangan berpura-pura sudah menggunakannya. Laporkan blocker dan lanjutkan hanya dengan prinsip desain yang sudah ada di `DESIGN.md`.
3. Gunakan Taste Skill sebagai proses audit dan art direction untuk area yang memang disentuh sesi ini: form laporan, About/developer cards, top navbar, bottom navbar, dan Admin page. Jangan melakukan redesign total aplikasi atau menimpa identitas MuaraKu.
4. Pertahankan arah visual MuaraKu: bersih, profesional, responsif, sederhana, bukan template generik/“AI slop”; warna aksen orange `#FB923C` serta warna brand yang telah dikonfirmasi dalam `DESIGN.md`; jangan menambahkan gradient/efek dekoratif besar tanpa dasar desain.
5. Gunakan design tokens dan komponen yang sudah ada. Periksa hierarchy, spacing, typography, contrast, focus/hover/disabled/loading/error states, responsive layout, serta aksesibilitas keyboard. Motion harus ringan, mengurangi gerakan bila sistem/request prefers-reduced-motion.
6. Jika tersedia browser/visual inspection Taste Skill, jalankan pemeriksaan pada halaman yang diubah dan betulkan temuan yang teridentifikasi. Jangan mengklaim inspeksi visual dilakukan jika browser tidak tersedia.

### Struktur route group yang dituju

Audit terlebih dahulu isi `src/app` atau `app` yang benar-benar dipakai. Target pengelompokan logis adalah:

- `(landing)` untuk halaman publik: Home, About, Support, Privacy, Terms.
- `(auth)` untuk login, register, OTP/verify, reset password, dan set-password onboarding.
- `(admin)` untuk Admin page dan subhalamannya.
- `(app)/(main)` untuk aplikasi utama: Discover, Seeker, Finder, Search, Profile, chat, notifications, dan fitur aplikasi yang sudah tersedia.
- Pertahankan callback OAuth pada route yang URL-nya tetap `/auth/callback` jika kode/config sekarang bergantung pada path itu. Jangan memindahkannya sehingga URL callback berubah tanpa memperbarui seluruh konfigurasi.

Penting: nama folder dalam tanda kurung pada Next.js App Router adalah **route groups** dan tidak muncul dalam URL. Sebelum refactor, buat route map current → target. Pertahankan kontrak URL yang sedang dipakai (misalnya `/app/discover`, `/app/seeker`, `/admin`, `/auth/callback`) kecuali PRD dan seluruh call sites memang mengharuskan perubahan. Jika URL harus tetap `/app/discover`, sediakan segmen URL `app` yang nyata di dalam route group; jangan mengira folder `(app)` otomatis menghasilkan `/app`.

Aturan refactor:

1. Jangan memindahkan semua file sekaligus tanpa mengecek route collision, layout nesting, loading/error boundaries, middleware, server actions, API routes, dan import path.
2. Jangan menaruh semua halaman di satu `page.tsx` atau membuat layout baru yang menduplikasi navbar/provider. Pisahkan layout landing, auth, admin, dan main sesuai tanggung jawabnya.
3. Jangan ubah URL publik, callback URL, metadata SEO, auth redirect, atau deep link secara diam-diam. Perbarui internal links dan tests bila memang ada perubahan route yang disetujui.
4. API routes (`src/app/api/...`) harus tetap pada URL aktualnya. Jangan masukkan API endpoint ke route group jika itu mengubah URL atau membuat konflik.
5. Jangan menghapus file lama sebelum seluruh import, route, dan referensinya dipetakan; setelah pemindahan jalankan lint, type-check, test, dan build yang tersedia.

**Kriteria selesai:** route group terorganisasi sesuai pembagian tersebut sejauh aman dilakukan, URL aplikasi tetap konsisten, callback OAuth tidak rusak, dan seluruh perubahan dicatat dalam `CHANGELOG.md`.


## B. Perbaiki redirect setelah login

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

## C. Perbaiki OTP email yang selalu dianggap tidak valid

Masalah pengguna: kode OTP email terkadang/selalu ditolak sebagai tidak valid. Cari penyebab di alur pengiriman dan verifikasi, bukan menghilangkan validasi.

1. Petakan semua alur yang menggunakan OTP: registrasi akun baru, login email, verifikasi email, pemulihan password, dan resend. Pastikan tiap alur menggunakan `signInWithOtp`, `verifyOtp`, dan nilai `type` yang cocok dengan alur itu serta template email yang benar-benar dipakai. Jangan menyatukan `signup`, `email`, dan `recovery` jika semantik alurnya berbeda.
2. Periksa apakah email dinormalisasi secara konsisten (trim dan aturan casing yang sesuai), apakah form mengirim token paling baru, apakah resend menimpa kode sebelumnya, apakah OTP kadaluarsa/terpakai, dan apakah template Resend/Supabase menampilkan token OTP yang benar, bukan link yang berbeda dari UI.
3. Periksa konfigurasi expiry, rate limits, dan response errors yang nyata dari Supabase Auth. Jangan menebak, jangan menerima kode lama setelah resend, jangan mengabaikan exception, dan jangan membuat kode OTP sendiri di client.
4. Pastikan jumlah digit/format input sesuai template yang benar-benar dikirim; input harus mendukung paste kode, auto-focus yang dapat diakses, tombol resend dengan cooldown, status loading, dan pesan error yang jelas. Jangan menyimpan OTP di localStorage atau log.
5. Jangan mencatat token OTP, password, access token, refresh token, atau isi sensitif ke console/server logs. Log hanya metadata aman seperti tahap alur dan kategori error yang sudah disanitasi.
6. Uji kasus: kode benar, kode salah, kadaluarsa, telah dipakai, kode lama setelah resend, email salah, jaringan gagal, dan verify request ganda. Jangan mengubah Supabase dashboard/SMTP secara otomatis. Jika akar masalah ada di template atau dashboard, sebutkan setting yang harus diperiksa manual.
7. Jangan mengakali masalah dengan menonaktifkan OTP, menerima kode apa pun, memberi sesi tanpa verifikasi, atau membuat mock success.

**Kriteria selesai:** token yang benar untuk alur dan periode berlaku diterima; invalid/expired/error ditangani dengan benar; pesan UI tidak menyesatkan; tidak ada kode rahasia dalam log. Jika pengujian email nyata membutuhkan kredensial/dashboard yang tidak tersedia, beri status `BLOCKED`.

---

## D. Setelah login Google OAuth, wajibkan pembuatan password satu kali

Kebutuhan produk: akun yang masuk melalui Google OAuth harus diarahkan ke alur membuat password sebelum menggunakan halaman inti aplikasi. Setelah password berhasil dibuat, pengguna tidak perlu mengulang langkah ini pada login berikutnya.

1. Audit model Supabase Auth, callback OAuth, user/session object, pola profile saat ini, server helpers, serta mekanisme metadata/flag yang tersedia. Definisikan dengan jelas bagaimana sistem membedakan akun yang belum menyelesaikan setup password dengan akun yang sudah selesai.
2. Setelah Google OAuth berhasil dan sesi valid, arahkan pengguna yang belum menyelesaikan setup ke halaman khusus (misalnya `/set-password` atau route auth set-password yang konsisten dengan route map). Jangan arahkan mereka ke `/app/discover` dahulu. Pengguna yang sudah menyelesaikan setup diarahkan ke `next` yang tervalidasi atau route utama aplikasi.
3. Buat halaman form password dengan password baru + konfirmasi, validasi minimal mengikuti kebijakan password yang sudah berlaku di produk, show/hide password yang aksesibel, error/loading state, dan pesan bahasa Indonesia/Inggris melalui i18n yang sudah ada. Jangan meminta atau menyimpan ulang password Google.
4. Gunakan metode Supabase Auth yang didukung untuk mengatur password bagi sesi pengguna yang telah login (misalnya `supabase.auth.updateUser({ password })` sesuai SDK dan flow yang terpasang). Jangan membuat record password sendiri, jangan menyimpan password secara plain text, dan jangan menggunakan API tidak resmi.
5. Gate route harus konsisten dengan SSR/middleware/server guard yang sudah ada: user yang belum menyelesaikan password setup tidak boleh mengakses bagian utama app sebelum melalui langkah ini, tetapi tetap boleh membuka route set-password, callback, logout, dan error. Hindari redirect loop dan pastikan session tetap utuh setelah set-password.
6. Flag “password setup complete” harus ditetapkan dengan mekanisme yang dapat dipercaya. Prioritaskan marker server-controlled yang sudah tersedia atau `app_metadata` yang hanya ditulis dari server tepercaya jika pola/service client server-only sudah dikonfigurasi dengan aman. Jangan mengandalkan `user_metadata` yang bisa diedit pengguna sebagai bukti keamanan atau menaruh service-role key di browser. Jangan menambah kolom/tabel atau menjalankan migration pada sesi ini. Jika repository/schema tidak menyediakan cara aman untuk menyimpan dan memeriksa flag, implementasikan bagian UX yang aman, dokumentasikan blocker dan proposal minimum, lalu jangan menyamarkan flag client-side sebagai enforcement yang tepercaya.
7. Definisikan kebijakan untuk Google users yang sudah ada saat fitur dirilis: jika belum ada marker yang dapat dipercaya, gunakan alur onboarding satu kali yang konsisten dan jelaskan bahwa akun Google lama mungkin perlu membuat password pada login berikutnya. Jangan membuat akun Supabase kedua untuk email yang sama atau mencoba link akun secara otomatis tanpa flow yang aman.
8. Email/password users yang sudah memiliki password tidak perlu dipaksa membuat password lagi. Jangan memblokir signup/login normal atau password recovery. Setelah password berhasil diset, lanjutkan ke tujuan aplikasi yang tervalidasi dan simpan event/update yang diperlukan tanpa mencatat password/token ke log.
9. Sertakan test untuk Google user tanpa marker, Google user yang sudah selesai, email/password user, sesi expired, password mismatch, password lemah, update gagal, callback reload, dan direct URL ke route main sebelum setup. Tes eksternal yang tidak bisa dijalankan harus dilabeli `BLOCKED`.

**Kriteria selesai:** pengguna Google yang belum menyelesaikan setup melihat form set-password sebelum masuk ke app; sesudah berhasil, flag yang dapat dipercaya mencegah langkah itu berulang; guard tidak menciptakan loop; tidak ada perubahan schema otomatis atau secret di client.


## E. Hapus dummy data dari UI runtime termasuk Admin

Audit semua halaman/komponen/hook/API yang menampilkan laporan, user, profile, foto, chat, pesan, notifikasi, claim, hasil pencarian, statistik, kartu dashboard Admin, chart, jumlah laporan/pengguna, recent activity, daftar pengguna, moderation queue, atau status sukses.

1. Hapus data palsu/mock/demo/fallback yang digunakan oleh UI runtime untuk berpura-pura bahwa data aplikasi ada. Hapus juga fallback yang diam-diam mengganti error Supabase dengan array statis atau toast sukses palsu.
2. Gunakan data sungguhan dari Supabase sesuai schema final dan RLS. Jika query sukses dengan hasil kosong, tampilkan empty state yang jelas; jika query gagal, tampilkan error state dan tindakan retry yang wajar. Jangan menyamarkan kedua keadaan itu sebagai data contoh.
3. Jangan menambahkan dummy reports/users/messages/notifications untuk membuat halaman terlihat ramai. Global Chat boleh menggunakan row percakapan global yang disediakan schema, tetapi **jangan membuat seed pesan palsu**.
4. Jangan menghapus fixture yang khusus dipakai unit/integration test apabila jelas terisolasi di lingkungan test. Pastikan fixtures tidak diimpor ke bundle atau jalur runtime produksi.
5. Jangan menghapus data pengguna sungguhan, menjalankan `DELETE`/truncate, mengosongkan database, mengubah seed database, atau menghapus kategori sistem yang memang merupakan data referensi sah. Tugas ini adalah membersihkan mock/fallback di kode/UI, bukan melakukan penghapusan data remote.
6. Pastikan placeholder avatar/gambar tidak disamarkan sebagai foto pengguna asli. Gunakan fallback visual netral jika profil memang tidak memiliki foto.
7. Audit Admin page secara khusus: hapus angka statistik, user, laporan, activity log, chart, badge jumlah, dan moderation item yang dikodekan sebagai mock. Dashboard hanya boleh menampilkan data dari query nyata dan hanya yang boleh dilihat role tersebut. Untuk data kosong tampilkan empty state; untuk query gagal tampilkan error yang berbeda.
8. Jangan menghapus/menonaktifkan komponen Admin yang sah hanya karena query kosong. Pisahkan “belum ada data” dari “fitur belum diimplementasikan” dan “gagal memuat”. Jangan menampilkan tombol aksi yang belum terhubung ke handler nyata sebagai seolah-olah bekerja.

**Kriteria selesai:** UI runtime tidak menyajikan laporan/chat/notifikasi/user buatan; empty/error state berasal dari hasil dan error nyata; tidak ada destructive DB action.

---

## F. Redesign form create/edit laporan Lost & Found agar lebih UX-friendly

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

- Redesign form create/edit berdasarkan Taste Skill sebagai form produk yang benar-benar mudah dipakai, bukan sekadar mengubah warna. Tetap konsisten dengan design tokens/`DESIGN.md` dan jangan redesign seluruh situs.
- Buat alur bertahap yang ringkas: (1) detail inti barang; (2) waktu/foto dan detail opsional; (3) review dan submit bila pola produk saat ini mendukungnya. Jangan menambahkan banyak step jika justru memperberat laporan.
- Di bagian pertama, prioritaskan judul/nama barang, kategori, tanggal kejadian, lokasi, kota, dan deskripsi publik. Tandai field wajib dengan jelas dan beri contoh singkat yang membantu tanpa membuat isi dummy tersimpan.
- Letakkan waktu kejadian dan detail warna/merek/model di bagian opsional/“Detail tambahan”; foto tetap opsional, dengan preview lokal, hapus/ganti gambar, ukuran file, tipe file, progress/error upload, dan state retry yang jelas. Jangan membuat field opsional terkesan wajib.
- Jangan membuat modal dengan scroll panjang sebagai pilihan default. Gunakan halaman atau panel responsif dengan section yang jelas; bila modal memang sudah merupakan pola produk, jaga tingginya wajar, aksesibilitas dialog, scroll internal yang terkontrol, dan tombol submit tetap mudah ditemukan.
- Gunakan label persistente (bukan placeholder sebagai satu-satunya label), pesan validasi dekat field, error summary jika perlu, loading state yang mencegah double-submit, serta success feedback hanya setelah operasi server benar-benar berhasil.
- Pastikan responsif pada desktop dan ponsel, tab order wajar, focus ring terlihat, kontras memadai, target sentuh nyaman, error tidak hanya ditandai dengan warna, serta reduced-motion dihormati. Jalankan visual inspection jika lingkungan mendukung.
- Pertahankan visual sesuai `DESIGN.md`; jangan redesign seluruh situs.
- Query/insert/update wajib memakai kolom final schema, termasuk `location_label` dan `city`. Jangan menghidupkan kembali `reports.location_id`, `locations`, atau nama tabel/kolom lama.
- Jangan menerima `reporter_user_id`, status moderasi, atau ownership dari klien tanpa validasi server/RLS. Jangan mempromosikan laporan ke approved dari UI.

**Kriteria selesai:** semua form create/edit mengikuti field wajib/opsional di atas, terhubung ke Supabase yang sebenarnya, tidak bocor data privat, dan gagal secara jujur saat validasi/storage/database error.

---

## G. Section Tentang Pengembang di halaman About — tiga kartu developer

Tambahkan satu section baru pada halaman About yang memperkenalkan developer/team MuaraKu. Letakkan di bawah section About yang paling logis menurut layout saat ini; pertahankan urutan halaman yang sudah ada dan desain yang responsif.

Setiap kartu developer harus mendukung:

- Foto/avatar developer.
- Nama.
- Role di tim/proyek.
- Link LinkedIn.
- Link Instagram.

Instruksi implementasi:

1. Periksa isi repo dan aset lokal untuk nama, foto, role, dan URL sosial yang benar-benar diberikan. Gunakan hanya informasi yang telah ada/terkonfirmasi; **jangan mengarang nama, foto, role, atau link**.
2. Simpan konten section sebagai data terstruktur yang mudah diedit (gunakan pola/config konten yang sudah ada; jika belum ada, buat modul konfigurasi bertipe seperti `src/config/developers.ts` atau lokasi ekuivalen yang sesuai struktur repo). Schema entri minimal: `name`, `role`, `photo`, `linkedinUrl`, `instagramUrl`. Siapkan array untuk tiga entri, tetapi jangan mengarang nilai orang nyata.
3. Foto setiap orang harus berada pada frame persegi `aspect-ratio: 1 / 1`, ukuran konsisten, dengan `object-fit: cover`, crop yang sopan, radius mengikuti sistem desain, dan fallback netral jika foto belum tersedia. Jangan menggunakan foto acak/AI seolah-olah foto asli developer.
4. Bila informasi developer belum tersedia, implementasikan layout dan sumber data tanpa profil palsu. Tambahkan komentar `TODO` yang jelas agar pemilik proyek mengisi data asli; tampilkan empty state yang rapi atau sembunyikan kartu yang belum lengkap tanpa menghilangkan section/heading.
5. Gunakan foto lokal yang tersedia jika memang milik developer dan sudah jelas, atau URL foto yang dikonfirmasi. Jangan menarik gambar acak dari internet. Fallback avatar harus netral dan tidak terlihat sebagai identitas asli.
6. Link sosial opsional jika belum ada, tetapi bila ditampilkan harus mengarah ke URL valid. Buka tab baru dengan atribut keamanan yang tepat (`rel="noopener noreferrer"`). Jangan merender ikon/link mati jika URL kosong.
7. Gunakan komponen kartu yang sesuai design tokens; layout desktop boleh multi-column dan mobile menjadi satu kolom atau grid kecil. Tambahkan alt text dan aksesibilitas keyboard/focus.
8. Ikuti i18n yang ada untuk heading/intro section. Hindari menambah database table atau dashboard pengelolaan tim; daftar statis terstruktur sudah cukup kecuali produk saat ini memang punya pola konten yang berbeda.

**Kriteria selesai:** section About memiliki tiga slot/kartu developer; masing-masing menyediakan frame foto 1:1, nama, role, LinkedIn, dan Instagram; tidak ada identitas/link buatan; konten mudah diperbarui tanpa mengubah layout.


---

## H. Tambahkan akses Admin di top navbar dan bottom navbar

1. Tambahkan entry/tombol navigasi ke `/admin` pada top navbar dan bottom navbar/responsive navigation yang memang digunakan proyek. Jaga ukuran, spacing, label/ikon, active state, keyboard focus, dan layout mobile agar tidak bertabrakan dengan item lain.
2. Tampilkan entry Admin hanya kepada pengguna yang mempunyai role staff yang berhak membuka Admin page. Ambil role dari sumber tepercaya yang digunakan guard server (contohnya `staff_roles`) dan samakan dengan aturan akses halaman Admin. Jangan menentukan role dari `user_metadata`, query client yang dapat dimanipulasi, atau email/domain semata.
3. Link hanya untuk navigasi; ini bukan kontrol akses. Pertahankan/benahi proteksi server-side Admin page dan semua API/server actions terkait. Pengguna biasa yang memaksa membuka `/admin` secara langsung tetap harus ditolak/diarahkan dengan aman.
4. Jangan menampilkan tombol admin disabled untuk semua pengguna sebagai dekorasi, dan jangan memberi akses admin secara otomatis demi menguji UI. Jika belum ada role yang ditetapkan untuk akun pengembang, laporkan langkah manual yang aman untuk memberikan role pada `staff_roles` setelah memastikan schema yang benar.
5. Jika role check membutuhkan query, hindari request loop pada setiap render; gunakan pola server/session yang sudah berlaku dan invalidate/refresh state secara wajar setelah role berubah.

**Kriteria selesai:** staf yang berwenang melihat akses Admin di kedua navigasi sesuai breakpoint; pengguna biasa tidak melihat entry dan tetap tidak dapat melewati server guard; tidak ada self-promotion.


## I. Implementasi Sesi 4 — Chat, Notifikasi & Community Trust

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

## J. Aturan schema, kualitas, dan keamanan yang berlaku untuk semua tugas

- Schema MVP target memiliki 22 tabel public: `user_profiles`, `user_account_controls`, `staff_roles`, `report_categories`, `reports`, `report_private_details`, `report_media`, `claims`, `claim_evidence`, `saved_reports`, `conversations`, `conversation_members`, `messages`, `user_blocks`, `notifications`, `safety_reports`, `admin_activity_logs`, `support_tickets`, `support_ticket_messages`, `muara_ai_sessions`, `muara_ai_messages`, dan `terms_acceptances`. Identitas tetap berasal dari `auth.users`.
- Gunakan field final seperti `reports.location_label`, `reports.city`, `reports.occurred_at`, `reports.color`, `reports.brand`, `reports.model`, `user_account_controls.notify_*`, dan nama final `admin_activity_logs` sesuai file SQL final yang telah diaplikasikan. Jangan menebak jika database aktual belum sesuai.
- Jangan menggunakan `service_role` di browser, jangan expose API key/secret, jangan memercayai `user_metadata` untuk otorisasi, dan jangan bypass RLS dengan fallback query.
- Tidak boleh mengubah schema, menjalankan destructive SQL, menambah tabel baru, atau membuat migration otomatis di sesi ini. Jika fitur membutuhkan perubahan schema, siapkan proposal migration terpisah berisi alasan, dampak, policy/RLS, strategi data, dan rollback; lanjutkan bagian lain yang aman.
- Jangan menambah dependency besar atau melakukan rewrite total tanpa bukti. Pertahankan bahasa/tema dan komponen yang sudah ada.

---

## K. Verifikasi wajib

Gunakan package manager dari lockfile dan scripts yang benar-benar tersedia. Jalankan secara terpisah lint, type-check, test, dan build jika tersedia. Catat hasil masing-masing sebagai `PASS`, `FAIL`, `NOT RUN`, atau `BLOCKED`.

Uji area berikut jika alat dan lingkungan mengizinkan:

1. Login email/password, OTP (kode benar/salah/expired/resend/type yang sesuai), Google OAuth callback/redirect, mandatory set-password gate, refresh/restore session, logout, serta route guard.
2. Redirect tidak hard-coded ke localhost untuk production dan selalu mengarah ke route app yang sesuai. Jangan menyatakan production OAuth terverifikasi jika credential/domain production tidak dapat diuji.
3. Discover/Seeker/Finder: form create/edit, field wajib/opsional, tanggal/timezone, media opsional, error state, dan empty state.
4. Tidak ada mock/fake reports, users, chat, messages, notifications, atau fallback sukses di runtime.
5. About: tepat tiga slot/kartu developer responsif, frame foto 1:1, data tanpa identitas palsu, link LinkedIn/Instagram valid atau tidak ditampilkan bila kosong, alt text dan focus state.
6. Global Chat dan private chat dengan dua akun berbeda bila memungkinkan; cek membership, block, RLS, dan data separation.
7. Notifications hanya untuk recipient; mark-as-read sesuai policy aktual.
8. Navbar dan bottom navbar: Admin entry hanya terlihat untuk role yang berhak; akses langsung oleh non-staff ditolak di server.
9. Route groups `(landing)`, `(auth)`, `(admin)`, `(app)/(main)` tidak menyebabkan route collision atau mengubah URL yang sudah digunakan tanpa rencana.
10. Taste Skill: skill benar-benar dibaca/dipakai dan inspeksi visual dilakukan jika tool tersedia; jika tidak, tulis batasannya.
11. Pindah halaman berulang, membuka/menutup form, mengirim pesan, dan melakukan search tidak menciptakan fetch/render/subscription loop.
12. Console/server logs tidak memiliki error berulang yang diketahui; jangan mengarang pengukuran yang tidak dilakukan.

Jangan menyatakan fitur “aman”, “selesai”, atau “lulus” tanpa bukti. Jika tes lintas pengguna atau OAuth belum dapat dilakukan, tulis persis apa yang belum diuji dan mengapa.

---

## L. Laporan akhir dan batas sesi

Sebelum berhenti:

1. Perbarui `CHANGELOG.md` hanya dengan perubahan yang benar-benar dibuat.
2. Berikan daftar file berubah dan alasan tiap kelompok perubahan.
3. Jelaskan akar masalah redirect localhost yang ditemukan, perubahan yang dilakukan, konfigurasi manual Supabase/Google yang masih dibutuhkan, dan hasil tes.
3a. Jelaskan akar masalah OTP tidak valid, alur `type`/template yang diperbaiki, dan tes yang dapat/tidak dapat dilakukan.
3b. Jelaskan gate set-password untuk Google OAuth, bagaimana status setup disimpan dan diverifikasi secara tepercaya, serta perlakuan untuk akun Google lama. Jika tidak bisa diimplementasikan dengan aman tanpa perubahan schema, laporkan BLOCKED beserta opsi yang direkomendasikan.
3c. Cantumkan route map sebelum/sesudah refactor, URL yang dipertahankan, dan route group yang belum dapat dipindah dengan aman.
3d. Laporkan hasil penggunaan Taste Skill dan hasil inspeksi visual; jangan mengklaim penggunaan bila skill tidak tersedia.
4. Laporkan data dummy yang dibuang dari runtime (termasuk Admin dashboard, metric, chart, recent activity, user/report rows) beserta lokasi sumbernya; pastikan tidak ada data database asli yang dihapus.
4a. Laporkan penambahan entry Admin di top navbar dan bottom navbar, aturan role visibility, serta hasil pemeriksaan server-side guard.
5. Laporkan perubahan form serta bagaimana tanggal tanpa waktu ditangani, atau dokumentasikan blocker bila schema tidak mendukungnya dengan benar.
6. Laporkan section About untuk tiga developer, frame foto 1:1, lokasi config datanya, serta nama/foto/role/LinkedIn/Instagram mana yang masih perlu diberikan pemilik proyek.
7. Cantumkan hasil tes dalam format `PASS` / `FAIL` / `NOT RUN` / `BLOCKED`, risiko yang tersisa, dan proposal schema/policy bila ada.
8. Tandai Sesi 4 selesai hanya bila acceptance criteria yang relevan terbukti. **Jangan mulai Sesi 5, jangan deploy, dan berhenti menunggu review pengguna.**
