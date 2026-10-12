# MuaraKu — Master Prompt untuk AI Agent

**Repository:** `https://github.com/Konatsu13/muaraku-project`  
**Branch target:** `fathan-lab`  
**Snapshot audit awal:** commit `ee095300c2627541f01054dcfaf884058f68677d`  
**Tujuan:** memperbaiki bug, menyelesaikan alur penting, meningkatkan UI/UX, dan menjaga dokumentasi agar pekerjaan dapat dilanjutkan agent lain.

> **Instruksi pemilik proyek:** Lakukan implementasi pada repository/branch yang ditentukan setelah pemeriksaan awal. Jangan menganggap temuan snapshot ini masih mutakhir sebelum memeriksanya. Jangan menghapus atau menimpa perubahan pengguna. Jangan melakukan perubahan database produksi yang destruktif.

---

## 0. Peran dan prinsip kerja

Kamu bertindak sebagai senior full-stack engineer, UI/UX engineer, security reviewer, dan performance engineer untuk MuaraKu, platform lost-and-found berbasis komunitas di Indonesia.

Gunakan urutan kerja berikut: **audit → verifikasi akar masalah → prioritaskan → implementasikan dalam potongan kecil → uji → dokumentasikan → handoff**. Jangan hanya menyusun rencana lalu berhenti, kecuali akses/kredensial yang benar-benar dibutuhkan tidak tersedia atau ada keputusan destruktif yang memerlukan persetujuan.

Prinsip produk yang tidak boleh dilanggar:
- **Trust before virality:** kepercayaan dan keamanan lebih penting daripada membuat feed tampak ramai.
- **AI assists; people decide:** AI tidak membuktikan kepemilikan barang, tidak menyetujui klaim, dan tidak menjatuhkan ban permanen sendirian.
- **Privacy by default:** jangan menampilkan petunjuk kepemilikan privat, bukti klaim, informasi pribadi, atau metadata sensitif ke publik.
- **No fake functionality:** jangan membuat tombol dekoratif, hasil integrasi palsu, statistik fiktif, atau status sukses tanpa operasi nyata.
- **No fake activity:** halaman awal database kosong harus benar-benar kosong dari laporan/pesan buatan yang seolah-olah nyata.
- **Preserve working code:** jangan membangun ulang seluruh project atau mengganti stack tanpa bukti kuat dan alasan yang terdokumentasi.

## 1. Wajib audit repository sebelum coding

Target repository dan branch dapat berubah; selalu pastikan kondisi saat mulai:

1. Verifikasi repository, branch aktif, commit HEAD, `git status`, dan `git diff`. Jangan menghapus, reset, checkout paksa, atau menimpa perubahan pengguna.
2. Enumerasi dan baca **semua file `.md` yang dilacak** pada branch, termasuk file di subfolder. Pada snapshot awal yang sudah diperiksa, ada 10 file:
   - `AGENTS.md`
   - `CHANGELOG.md`
   - `CLAUDE.md`
   - `DESIGN.md`
   - `HANDOFF.md`
   - `PANDUAN.md`
   - `PRD.md`
   - `PROMPT.md`
   - `README.md`
   - `TASKS.md`

   Enumeration di atas adalah snapshot, bukan batasan permanen. Jika file Markdown lain ditemukan, baca juga.
3. `CLAUDE.md` pada snapshot hanya berisi `@AGENTS.md`; ikuti instruksi `AGENTS.md`. Instruksi tersebut secara khusus meminta agent memeriksa dokumentasi Next.js yang tersedia di instalasi project (`node_modules/next/dist/docs/`) sebelum coding karena versi Next.js yang dipakai memiliki perubahan API. Verifikasi path dokumentasi lokal setelah dependencies tersedia.
4. Baca `PRD.md`, `DESIGN.md`, `PROMPT.md`, `TASKS.md`, `CHANGELOG.md`, `HANDOFF.md`, `README.md`, `PANDUAN.md`, `AGENTS.md`, dan instruksi agent lainnya. Catat konflik antar dokumen, termasuk status yang berbeda-beda.
5. Periksa seluruh folder `Inspirations/`, terutama `Inspirations/landing.png`, `Inspirations/Explore.png`, dan referensi sidebar di `Inspirations/UI Lomba/`. Cari pula folder `stitch_specs/` yang dirujuk dokumentasi dan changelog; pastikan benar-benar ada pada branch saat ini.
6. Periksa `package.json`, lockfile, `next.config.ts`, Tailwind config/style, route tree, Supabase client, auth context, schema SQL, migration, RLS, Storage policy, API routes, dan sumber data tiap halaman.
7. Catat baseline lint, type-check, test, build, serta kegagalan yang sudah ada sebelum perubahan. Jangan menyebut test pass jika tidak benar-benar dijalankan.
8. Jangan membaca atau menyalin secret dari `.env.local` ke output/log. Jangan commit env lokal. `.env.example` hanya boleh berisi nama variabel dan nilai placeholder.
9. Buat ringkasan audit berdasarkan kode aktual: masalah, akar penyebab yang terkonfirmasi, lokasi kode, dependensi, risiko keamanan, fitur yang sudah bekerja, dan fitur yang masih berupa mock.

### Snapshot temuan awal yang wajib diverifikasi ulang

Temuan berikut berasal dari pembacaan kode pada `fathan-lab` di commit yang ditulis di awal dokumen. Jangan menganggapnya pasti belum berubah:

- `package.json` menunjukkan Next.js `16.3.7`, React `19.2.8`, TypeScript, Tailwind CSS v4, `@supabase/ssr`, `@supabase/supabase-js`, dan `lucide-react`. Scripts yang terdaftar: `dev`, `build`, `start`, `lint`; belum terlihat script `test`.
- `app/page.tsx` mengimpor `initialSampleReports` dan menampilkan kartu laporan contoh. Bagian hero juga memuat simulasi “Live Match Radar”, angka “88% Cocok”, serta contoh laporan dan lokasi yang bukan hasil data live terverifikasi.
- `app/app/page.tsx` juga mengimpor `initialSampleReports`. Ini kemungkinan salah satu sumber data palsu di Discover.
- `app/app/community/page.tsx` menginisialisasi `messages` dari array hardcoded, dan mengirim pesan dengan `setMessages`; belum terlihat persistence ke Supabase pada file tersebut.
- `components/auth/AuthModal.tsx` memiliki handler signup, login password, verify OTP, resend OTP, forgot password, dan show/hide password. Verifikasi mencoba `type: "signup"` kemudian fallback `type: "email"`; resend memakai `type: "signup"`. Agent wajib memeriksa apakah strategi type fallback benar untuk alur yang dipakai, bukan sekadar mengganti nilai secara coba-coba.
- `AuthModal.tsx` yang diperiksa tidak memperlihatkan handler/tombol OAuth atau integrasi Turnstile. Password show/hide sudah ada, tetapi indikator kekuatan password belum terlihat pada bagian yang diperiksa.
- Checkbox syarat pendaftaran menggunakan satu string terjemahan untuk seluruh label; link `Ketentuan Layanan` dan `Kebijakan Privasi` belum terpisah sebagai anchor pada kode yang diperiksa.
- `lib/i18n/index.tsx` sudah mempunyai locale `id`/`en`, dictionary ID/EN, dan menyimpan pilihan ke `localStorage`. Namun, persistensi hanya di browser belum menjamin preference user tersimpan di profil; audit semua halaman untuk hardcoded strings, coverage bahasa, dan mixed-language UI.
- `app/app/settings/page.tsx` memiliki state lokal untuk notifikasi dan daftar blocked users, termasuk akun contoh `SpammerAccount99`. Periksa apakah data tersebut belum tersambung ke persistence nyata; jangan tampilkan contoh sebagai data akun sebenarnya.
- `components/reports/ReportCard.tsx` memakai kartu terang/gelap, tetapi memiliki fallback emoji dan beberapa label hardcoded. Desain final harus mengikuti referensi kartu terang yang disukai pemilik proyek dan anti-pattern di `DESIGN.md`.
- `CHANGELOG.md`, `TASKS.md`, `HANDOFF.md`, `PRD.md`, dan `README.md` berpotensi tidak konsisten. Contohnya, `HANDOFF.md` menyebut konfigurasi Turnstile tersedia, sedangkan checklist auth masih belum selesai; `README.md` menyebut Neon/Prisma/Cloudinary, sementara kode/dependencies yang diperiksa menunjukkan Supabase. Periksa kondisi aktual sebelum memperbaiki dokumentasi.
- `PRD.md` menetapkan FastAPI sebagai service AI terpisah dan dua AI feature awal (Natural Language Search dan Muara AI CS), sedangkan snapshot `app/api/ai/chat/route.ts` memanggil OpenAI dan Gemini langsung dari Next.js. Jangan migrasi arsitektur secara besar-besaran diam-diam: laporkan gap, cek dokumentasi/config aktual, dan lakukan perubahan bertahap dengan alasan, tests, dan dampak deployment yang jelas.

---

## 2. Urutan prioritas implementasi

Kerjakan berurutan berdasarkan risiko dan dependensi. Jangan mengerjakan semua UI sekaligus sebelum alur inti dan data source dipastikan.

### P0 — Keamanan, autentikasi, dan data yang benar
1. Auth flows (OTP, OAuth jika provider tersedia, CAPTCHA/Turnstile, protected routes, password UX, checkbox legal).
2. Hilangkan demo reports/messages dari tampilan seolah-olah data nyata; empty states yang benar.
3. Pastikan server-side authorization, Supabase RLS, dan kebijakan Storage benar.
4. Cegah error autentikasi/DB disamarkan sebagai sukses atau empty state.
5. Sinkronkan bahasa, theme, profile preferences dengan persistence sebenarnya.

### P1 — Pengalaman utama dan desain
6. Redesign landing page mengikuti inspirasi `Inspirations/landing.png` dengan konten MuaraKu.
7. Refinement navbar sesuai referensi di `Inspirations/`.
8. Report cards dengan layout terang dari `Inspirations/Explore.png`.
9. Global Chat dengan hierarki pesan seperti aplikasi messaging.
10. Responsiveness, accessibility, light theme, dan performance.

### P2 — Integrasi tambahan
11. Terjemahan postingan on-demand via Google Cloud Translation API, cache di Supabase, budget/rate control.
12. Kelengkapan edit profil, gender saat signup, verification request/staff badge, dan settings yang benar-benar tersimpan.
13. Dokumen setup, test, changelog, tasks, dan handoff yang akurat.

Jika bug P0 memengaruhi keamanan atau menutupi data, selesaikan sebelum styling kosmetik.

---

## 3. Perbaiki autentikasi

### 3.1 OTP invalid/expired

Investigasi root cause. Jangan langsung menaikkan expiration untuk menutupi masalah.

- Periksa nilai Email OTP Expiration di Supabase Auth dan cocokkan dengan pengalaman aktual.
- Periksa delay Resend/SMTP, resend cooldown, request ganda, tombol yang bisa diklik berkali-kali, React effect/render, alur signup, dan jenis verification token.
- Pastikan request verify menggunakan `type` yang benar untuk request OTP yang benar-benar dibuat. Hindari mencoba type lain secara membabi buta setelah error; berikan error yang tepat dan log diagnostik tanpa token/secret.
- Pastikan email OTP template dan flow sesuai, dan pengguna memahami agar memasukkan kode terbaru.
- Tambahkan status loading, disabled state, expired/invalid message, timer resend yang jelas, cegah double submission, dan penanganan error jaringan.
- Jangan menampilkan OTP, password, access token, atau secret pada log maupun pesan error.
- Jangan menonaktifkan verifikasi email atau rate limits.
- Uji signup → email received → verify valid; kode salah; kode expired; kode lama setelah resend; spam klik resend; request duplikat; login; reset password jika terkait.

### 3.2 OAuth

- Audit provider yang dikonfigurasi di Supabase dan credentials/redirect yang tersedia; mulai dengan Google OAuth bila memang dipilih dan tersedia.
- Tambahkan tombol OAuth nyata di login/register yang memanggil Supabase OAuth flow, dengan loading, error, pembatalan, callback, serta safe redirect.
- Jangan mengarang bahwa provider sudah dikonfigurasi. Jika credential harus dimasukkan manual, buat UI dan kode siap pakai lalu dokumentasikan konfigurasi yang belum dilakukan.
- Pastikan callback URL, allowed redirect URLs, route guards, dan post-login redirect tidak saling bertentangan.

### 3.3 Cloudflare Turnstile

- Pastikan widget sungguhan tampil di form auth dan token benar-benar dipakai pada request yang didukung Supabase CAPTCHA integration.
- Pisahkan site key publik dan secret key server-side/Supabase-side sesuai alur resmi.
- Periksa konfigurasi localhost dan domain produksi, serta expiry/error/reset widget.
- Jangan menganggap adanya kotak visual sebagai bukti CAPTCHA bekerja. Tes endpoint auth saat token absent/invalid dan valid jika environment tersedia.
- Jika konfigurasi Dashboard memerlukan tindakan manual, dokumentasikan langkah tepat serta nama variable yang diperlukan; jangan pernah meminta secret untuk ditaruh di frontend.

### 3.4 Password

- Pertahankan show/hide password yang sudah ada, audit apakah state dan tombol berfungsi di semua form.
- Tambahkan indikator kekuatan password yang dapat diakses, dengan panduan yang tidak mengungkap password ke server pihak ketiga. Password tetap dievaluasi di client untuk feedback dan oleh provider/server sesuai aturan keamanan.
- Definisikan syarat yang konsisten dengan Supabase Auth; jangan menjanjikan kekuatan absolut hanya berdasarkan panjang.
- Tambahkan password-change di Profile/Settings dengan flow Supabase yang tepat, konfirmasi password baru, loading, success/error, dan reauthentication jika perlu.

### 3.5 Checkbox Ketentuan Layanan / Kebijakan Privasi

- Buat checkbox custom/accessibility-friendly; gunakan input label yang benar, visible focus, keyboard support, dan hit-area memadai.
- Pisahkan `Ketentuan Layanan` dan `Kebijakan Privasi` menjadi tautan yang dapat diklik, **berwarna biru** pada light/dark theme dan memiliki hover/focus jelas.
- Link harus mengarah ke route yang benar (`/terms` dan `/privacy`) tanpa men-toggle checkbox secara tak sengaja.
- Tetap validasi consent sebelum signup, dengan terjemahan ID/EN.

### 3.6 Gender saat daftar

- Tambahkan pilihan `Laki-laki`, `Perempuan`, `Memilih tidak memberi tahu`.
- Periksa schema `user_profiles` terlebih dahulu. Jika kolom tidak ada, buat migration aditif yang aman, constraint yang sesuai, dan types update; jangan hanya menyimpan metadata tanpa rencana membaca/persistence.
- Nilai dapat null/unspecified sesuai pilihan; jangan menyimpulkan gender dari nama atau avatar.
- Buat field opsional atau wajib hanya berdasarkan keputusan produk yang sudah disepakati; jika tidak dijelaskan, gunakan optional dengan pilihan “Memilih tidak memberi tahu”.
- Support label English dengan value database yang stabil.

---

## 4. Protected routes: app hanya untuk pengguna login

Keputusan produk terbaru: **pengguna tidak boleh masuk ke Discover atau halaman aplikasi sebelum login**.

- Landing/Home, About, Support, Terms, dan Privacy tetap dapat diakses sebagai visitor.
- `/app` dan seluruh child routes aplikasi (Discover, Seeker, Finder, Search, Global Chat, Messages, Profile, Settings, notifications) harus menolak akses visitor dan mengarahkan ke login dengan safe return URL.
- Admin routes memerlukan role/permission khusus, bukan sekadar login.
- Terapkan guard di server/middleware/layout sesuai Next.js version dan pola Supabase SSR yang benar; jangan hanya hide link di client.
- Periksa setiap API route dan RLS untuk mencegah pemanggilan langsung tanpa akses.
- Setelah login sukses, kembalikan user ke intended destination yang allowlisted. Hindari open redirect.
- Pastikan route guard tidak menghalangi callback OAuth atau verifikasi OTP.

---

## 5. Empty states — tidak ada laporan awal palsu

Ini requirement eksplisit. Pada database atau akun baru tanpa laporan real, daftar laporan harus kosong.

- Telusuri seluruh sumber laporan: `lib/data/sampleReports.ts`, `app/page.tsx`, `app/app/page.tsx`, Search, Seeker, Finder, detail, rekomendasi, statistik, AI preview, dan komponen bersama.
- Hapus penggunaan mock/seed/demo data di production UI atau tandai contoh dengan jelas sebagai ilustrasi UI statis, bukan aktivitas nyata. Jangan seed data palsu ke database production.
- Landing page tidak boleh mengklaim “Live Match Radar”, persen kecocokan, active users, report counts, sukses pengembalian, atau testimoni kecuali berasal dari sumber real, tervalidasi, dan disetujui. Jika tidak ada real data, gunakan visual produk ilustratif yang jelas dilabeli “Contoh tampilan”, mockup perangkat non-interaktif, ilustrasi alur, dan penjelasan fitur.
- Pastikan Discover/Seeker/Finder/Search menampilkan empty state, CTA sesuai, filter yang tetap terlihat, dan petunjuk ringkas ketika data kosong.
- Bedakan `success + no rows` dari error query/network: error harus punya pesan/retry, bukan berpura-pura kosong.
- Seed data hanya boleh ada pada fixture/test environment yang eksplisit, tidak di production auto-run.
- Jangan pernah truncate/delete data pengguna yang sudah ada.

---

## 6. Terjemahan UI Indonesia/Inggris (i18n)

Project sudah memiliki `lib/i18n/index.tsx` serta dictionary `lib/i18n/dictionaries/id.ts` dan `en.ts` pada snapshot, tetapi coverage harus diaudit menyeluruh.

- Pertahankan satu sistem i18n; jangan memasang library kedua sebelum mengevaluasi implementasi yang ada.
- Audit semua route, navbar/sidebar, report cards, auth/OTP, form validations, errors/success, settings, notifications, Global Chat, AI widget, admin, aria-label, `title`, dan toast.
- Hilangkan hardcoded string di komponen yang harus diterjemahkan, termasuk FAQ tambahan dan teks form yang tidak lewat dictionary.
- Pastikan EN benar-benar natural English, bukan sekadar punya key yang cocok dengan ID. Tipe `typeof id` tidak membuktikan semua konten semantik sudah diterjemahkan.
- Language choice saat ini diketahui disimpan ke `localStorage`; evaluasi persistensi lintas perangkat untuk pengguna login dan fallback tamu. Simpan preferensi di profil hanya setelah schema/RLS diaudit.
- Pastikan perubahan bahasa reaktif di seluruh UI, tidak menampilkan campuran ID/EN, dan tidak menyebabkan hydration flicker atau mematahkan callback OAuth.
- Tanggal/jam/angka format mengikuti locale. Jangan menerjemahkan nama, deskripsi postingan, atau pesan pengguna secara otomatis.
- Tambahkan tes/scrutiny untuk string yang hilang dan alur ganti bahasa.

---

## 7. Theme / Light mode

Theme provider dan pengaturan `light`, `dark`, `system` sudah ada pada snapshot, jadi jangan langsung menggantinya sebelum menemukan root cause bug.

- Audit `lib/theme/`, `components/providers/AppProviders.tsx`, root layout, CSS tokens, dan kelas hardcoded `dark:`.
- Pastikan class/attribute theme pada root konsisten dengan state `resolvedTheme`, settings, navbar, dan seluruh page.
- Cari warna yang hanya cocok di dark mode atau terlalu pudar di light mode; prioritaskan forms, cards, popovers, modal, chat, navbar/sidebar, badges, empty/error states.
- Persist preference, handle system changes bila `system` dipilih, cegah flash/hydration mismatch, dan pastikan pilihan berlaku lintas halaman.
- Uji tiga mode secara manual/e2e pada halaman kritis. Jangan tandai selesai hanya karena tombol theme berubah state.

---

## 8. UI direction dan referensi visual

### 8.1 Prinsip visual

Baca `DESIGN.md` utuh. Pertahankan brand MuaraKu dan design tokens yang ada: warm canvas `#FFFCF8`, orange `#FB923C`, dark canvas `#18181B`, verified yellow `#EAB308`, Geist Sans, ikon konsisten (Lucide). Hindari AI slop: visual generik, gradient dekoratif berlebihan, kartu seragam tanpa hierarki, whitespace yang tak punya fungsi, label campuran bahasa, data fiktif, dan elemen dekoratif yang mengganggu fungsi.

Jangan mengubah logo atau makna logo. Jangan menambahkan emoji sebagai ikon UI; `DESIGN.md` secara eksplisit melarang emoji icons.

### 8.2 Navbar — referensi folder inspiration

- Temukan dan ikuti navbar reference yang ada di folder `Inspirations/` atau file design yang dirujuk. Jika folder itu hanya memuat referensi sidebar/landing, cari navbar specs di `DESIGN.md`/`stitch_specs/` dan dokumentasikan referensi yang dipakai.
- Adaptasikan identitasnya ke navigasi MuaraKu, bukan copy-paste elemen/fitur dari produk lain.
- Public nav: Home, About, Support, serta CTA Login/Register.
- App nav: pertahankan sidebar yang ada/referensi `Inspirations/UI Lomba/`; item utama Discover, Seeker, Finder, Search, Global Chat, Messages. Profile, Settings, Help & Support sebagai secondary entries. Theme/Language berada dalam Settings atau header control sesuai desain; jangan tambahkan redundansi tanpa alasan.
- Buat responsive mobile nav yang benar; jangan mengecilkan desktop sidebar hingga tidak terbaca.

### 8.3 Report cards — utamakan `Inspirations/Explore.png`

Pemilik proyek lebih menyukai kartu terang dalam gambar referensi Explore dibanding kartu gelap dari screenshot lain.

- Gunakan surface putih/light, border subtle, radius konsisten, image ratio terjaga, judul/deskripsi terbaca, label lost/found dan kategori, metadata lokasi/waktu, avatar/petugas verified, dan actions teratur.
- Terapkan konsisten pada Discover, Search, Seeker, Finder, related posts, dan landing preview bila preview ditampilkan.
- Buat dark variant yang tetap terlihat baik, tetapi default visual yang diminta ialah light.
- Hilangkan emoji fallback untuk ikon, gunakan neutral placeholder illustration/icon tanpa berpura-pura sebagai foto barang.
- Jangan membuat tombol “Chat” melakukan aksi palsu. Bila login dibutuhkan, arahkan ke login dan kembalikan ke tujuan aman.
- Pastikan data card berasal dari query real yang terotorisasi; jangan melakukan duplicate list sections yang membingungkan.

### 8.4 Global Chat — Telegram/WhatsApp-style UX

- Perbaiki `app/app/community/page.tsx` yang pada snapshot menampilkan array hardcoded dan menambahkan pesan menggunakan state lokal. Hubungkan ke backend/schema existing yang benar setelah audit; jangan menambah table duplikat jika tabel chat sudah tersedia.
- Bedakan jelas pesan user sendiri dengan orang lain: alignment, bubble shape/color, avatar, nama, waktu, status petugas verified, dan date separators bila perlu.
- Pesan sendiri boleh berada di sisi kanan dengan brand accent yang terkontrol; pesan pengguna lain di sisi kiri dengan neutral surface. Tetap prioritaskan kontras dan aksesibilitas.
- Perbaiki composer, send/loading/failed state, retry yang tidak menduplikasi pesan, empty state, keyboard Enter/Shift+Enter, scroll-to-latest yang tidak memaksa scroll saat pengguna membaca pesan lama, dan responsive behavior.
- Tampilkan identitas/label verified hanya dari data trusted; jangan mengizinkan self-assigned badge.
- Terapkan membership/session/authorization untuk posting, report, block, realtime dan attachments bila ada.
- Global Chat dihapus/expire pada 00:00 `Asia/Jakarta` hanya sesuai kebijakan PRD jika job itu bagian scope aktif. Jangan pernah menghapus Private Chat. Implementasi reset harus memakai scheduler trusted server/database, idempotent, dan dites terhadap tipe conversation.
- Jangan mengirim Global Chat ke LLM untuk moderasi pada rilis awal; PRD membatasi dua AI feature awal ke Search dan CS.

---

## 9. Profile, settings, dan verifikasi petugas

Periksa schema/profile editor yang ada sebelum mengimplementasikan:

- Edit display name, bio, foto profil: upload, preview, ganti, remove bila diizinkan, validasi MIME/size, randomized storage paths, dan policies yang aman.
- Ganti password memakai flow Supabase yang benar.
- Gender field yang ditambahkan saat signup dapat diperbarui bila memang diizinkan oleh product rules; jaga privasinya.
- Request verifikasi petugas/lokasi: input organisasi/lokasi, role, bukti yang dibutuhkan, status pending/approved/rejected/revoked, reviewer, reason, expiry/reverification bila diperlukan.
- Yellow badge hanya ditampilkan setelah keputusan reviewer/admin yang berwenang dan harus menyatakan afiliasi/lokasi, bukan jaminan semua pernyataan pengguna benar.
- Sinkronkan preferensi theme, locale, dan notifikasi dengan database/profile jika fitur tersebut diharapkan persisten. Jangan memakai mock `blockedUsers` atau local notification state sebagai data akun nyata.
- Lakukan validasi dan authorization di server, RLS, dan Storage; jangan percaya user ID/role dari client.

---

## 10. Google Cloud Translation — on-demand dan hemat biaya

Fitur ini untuk menerjemahkan **teks postingan laporan publik** hanya jika user menekan tombol. Ini bukan bagian dari UI localization dan tidak boleh menerjemahkan isi postingan secara otomatis.

### 10.1 Desain interaksi

- Tombol per postingan/detail: `Terjemahkan` atau `Translate` sesuai bahasa UI.
- Sebelum ditekan, tampilkan teks asli saja; jangan prefetch atau menerjemahkan setiap card saat page load, scroll, locale switch, atau render.
- Setelah klik, tampilkan loading state dan hasil terjemahan tanpa mengubah teks asli yang tersimpan.
- Sediakan `Tampilkan teks asli` / `Show original`.
- Label terjemahan mesin dengan jelas. Error API harus memungkinkan retry tanpa kehilangan state.
- Jangan menerjemahkan private chat, claim evidence, secret ownership clues, moderation notes, atau field lain yang tidak ditujukan untuk publik.

### 10.2 Provider dan secret handling

- Implementasikan provider adapter di backend/server route; jangan memanggil Google API langsung dari browser.
- Gunakan Cloud Translation API yang disetujui dan dokumentasikan endpoint/version yang dipilih. Basic v2 dapat memakai API key; pilih sesuai kebutuhan dan autentikasi project, tanpa menyebarkan key.
- Nama env yang disepakati: `GOOGLE_TRANSLATE_API_KEY` (server-only). Tidak boleh memakai prefix `NEXT_PUBLIC_`, tidak boleh masuk bundle, client log, query URL, atau Git.
- Validasi target language hanya `id`/`en`, validasi report ID, cek akses dan status report, batasi ukuran teks, rate limit user/IP, timeout, dan handler untuk quota/error provider.
- Jangan klaim external setup berhasil jika agent tidak punya akses ke Google Cloud Console/key. Kode boleh dibangun dengan env check, tapi integrasi belum terverifikasi sampai test memakai credentials/environment tersedia.

### 10.3 Cache dan invalidation

- Periksa schema sebelum membuat migration. Reuse existing translation cache bila ada.
- Jika diperlukan, buat table cache yang menyimpan report ID, content hash, source language, target language, translated public title/description (atau field public lain yang memang disetujui), created/updated timestamps, dan status/metadata minimum.
- Unique key setidaknya membedakan report, hash versi sumber, source language, dan target language. Terapkan unique constraint supaya race/upsert aman.
- Hitung SHA-256 hash di server dari payload source yang kanonis (misalnya title + public description + source language + translation schema version). Jangan percaya hash yang dikirim client.
- Pada klik: auth check sesuai aturan produk → load authorized public content → hitung hash → lookup cache → jika hit, return cached text tanpa provider request → jika miss, call Google → validate response → store/upsert successful result → return translated fields.
- Jika source content berubah, hash berubah dan cache lama tidak akan dipakai untuk konten baru. Buat invalidation/cleanup policy atau biarkan stale hash tidak dipilih dan bersihkan berkala jika perlu.
- Cache hanya sukses; jangan menyimpan provider error sebagai hasil terjemahan valid.
- Reuse cache publik lintas pengguna boleh dilakukan bila report memang publik, tidak termasuk data privat, dan kebijakan akses mengizinkannya.
- Jangan mengandalkan cache client sebagai satu-satunya cache karena setiap user/perangkat berbeda.
- Tambahkan test provider call count: cache miss → satu API call; cache hit → nol API call; source changed → cache miss; same source + language → reuse cache; provider error → graceful error/no false cache success; concurrent click → tidak membuat duplicate billable calls jika bisa dicegah secara aman.

### 10.4 Google Cloud Console setup yang harus didokumentasikan

Dalam docs setup (bukan commit secret), jelaskan kepada pemilik proyek:
1. Pilih/buat Google Cloud project.
2. Aktifkan billing dan Cloud Translation API.
3. Buat API key khusus server dan batasi API restriction hanya ke Cloud Translation API.
4. Sesuaikan application restrictions dengan hosting backend dan lakukan uji request.
5. Atur quota/budget alerts; billing alerts tidak sama dengan hard spending cap.
6. Tambahkan `GOOGLE_TRANSLATE_API_KEY` di `.env.local` untuk development dan environment server/VPS untuk production secara terpisah.
7. Jangan menaruh secret pada client/`NEXT_PUBLIC_*`; restart/redeploy server setelah perubahan env.
8. Jelaskan pricing berdasarkan karakter/kuota, dan catat link dokumentasi resmi harga serta API.

Jangan otomatis menyalin `.env.local` lokal ke server. Jangan mengubah routing/deployment hanya demi translation.

---

## 11. Landing page baru dari `Inspirations/landing.png`

Gunakan gambar landing page yang ada di `Inspirations/landing.png` sebagai inspirasi kualitas, urutan section, visual rhythm, dan presentasi produk, **bukan untuk menyalin branding maupun konten finansial**.

### Arah desain

- Rancang landing page panjang yang terasa produk nyata dan matang, bukan template SaaS generik.
- Boleh mengganti palet warna, objek HP, ilustrasi, screenshot device, serta komposisi sesuai brand MuaraKu. Default tetap warm cream/white, orange accent, dark sections secukupnya, Geist Sans, icon consistency, dan aksesibilitas.
- Hero headline harus langsung menjelaskan manfaat; gunakan pesan brand seperti **“Hilang Di Mana Saja. Ketemu Di MuaraKu.”** atau copy yang lebih natural berdasarkan `DESIGN.md`.
- CTA utama: cari barang hilang / laporkan barang temuan / daftar akun. Visitor tidak boleh masuk ke protected app sebelum login.
- Gunakan mockup ponsel yang menampilkan UI MuaraKu yang sebenarnya atau ilustrasi yang jelas disebut contoh. Jangan tempel screenshot sebagai background penuh; buat komponen responsif.
- Susunan section yang disarankan:
  1. Public navbar.
  2. Hero dan phone/product mockup.
  3. Preview fungsional fitur tanpa data palsu yang diklaim live.
  4. Penjelasan alur Seeker dan Finder.
  5. Bagaimana laporan dan pencarian bekerja.
  6. Safety/privacy dan verifikasi kepemilikan.
  7. Community/verified staff jika fitur nyata sudah tersedia.
  8. FAQ dan safety tips.
  9. Final CTA.
  10. Footer dengan About/Support/Privacy/Terms sesuai route.
- Hindari komponen marketing yang berulang tanpa tujuan, terlalu banyak kartu dengan ukuran sama, stats cards yang tidak relevan, dan elemen finansial dari inspirasi.
- Jangan tampilkan grafik saldo, kartu bank, pricing subscription, country availability, atau logo partner dari referensi finansial.
- Jangan gunakan angka pengguna, jumlah barang kembali, rating, testimonial, atau klaim keberhasilan yang dibuat-buat.
- `app/page.tsx` saat snapshot memiliki banyak section yang berguna; audit dan reuse bagian yang bagus, jangan menghapusnya tanpa alasan.
- FAQ dan setiap copy visible harus mengikuti i18n id/en.
- Pastikan mobile, tablet, desktop; metadata SEO, alt text, focus states, dan performance.

---

## 12. Performance dan responsive QA

- Ukur sebelum optimasi; jangan mengklaim cepat tanpa hasil pengukuran.
- Optimalkan penggunaan gambar (next/image jika sesuai config/version), ukuran asset, lazy loading di bawah fold, fonts, bundle, render, query Supabase, pagination, caching yang aman, dan duplicate requests.
- Jangan mengirim semua reports/messages sekaligus. Implementasikan pagination untuk feed/chat/list.
- Elakkan layout shift, horizontal overflow, clipped modal, nested scroll yang tak perlu, dan tap targets terlalu kecil.
- Uji minimal viewport mobile sempit, tablet, dan desktop.
- Pastikan chat autoscroll tidak memaksa user saat membaca riwayat lama.
- Gunakan lint/typecheck/build. Karena snapshot `package.json` belum mencantumkan `test`, audit testing stack dan tambahkan script/test runner seperlunya; jangan hanya mengklaim “tested” tanpa test harness.
- Jangan memasang dependencies besar hanya untuk fitur sederhana tanpa alasan.

---

## 13. Database, Supabase, dan keamanan

Sebelum menulis SQL/migration:

1. Baca `muaraku_supabase_schema.sql`, folder migration, dan schema remote melalui read-only/non-destructive inspection bila diizinkan.
2. Cocokkan table/column/type/foreign keys/indexes/RLS/Storage; file SQL bukan bukti bahwa database live cocok.
3. Reuse tabel yang tersedia; jangan membuat duplicate `profiles`, `messages`, `conversations`, atau `reports` hanya karena nama yang berbeda di asumsi agent.
4. Buat migration aditif dan document rollback bila memungkinkan. Hindari destructive migration, DROP, TRUNCATE, reset remote, atau delete data pengguna.
5. Set RLS untuk akses antar user. Private conversations dan evidence wajib membership/permission check di server dan DB; UUID URL bukan akses.
6. Service/secret keys harus server-only. Jangan melewati RLS tanpa alasan terdokumentasi dan guard authorization yang tepat.
7. Lindungi upload dengan MIME/size validation, randomized path, bucket policy, dan signed URL untuk konten privat.
8. Jangan menulis API keys, access tokens, OTP, password, private clues, atau full chat content ke docs/commit/log.
9. Uji access isolation menggunakan user A dan user B bila environment test tersedia.

---

## 14. Documentation dan handoff — wajib di setiap unit kerja

Pelihara tiga file berikut setelah setiap unit pekerjaan yang bermakna:

### `CHANGELOG.md`
Catat hanya perubahan yang benar-benar dibuat. Tulis tanggal, kategori (Added/Changed/Fixed/Security/Performance/Database/Tests), file/component, alasan, hasil test, dan env/migration yang dibutuhkan. Jangan menulis “fixed” hanya karena kode ditulis.

### `TASKS.md`
Gunakan status konsisten:
- `[x]` selesai dan diverifikasi.
- `[~]` sebagian/berjalan.
- `[ ]` belum dimulai.
- `[!]` terblokir/perlu perhatian.

Catat prioritas, file relevan, dependensi, metode verifikasi, hasil, dan blocker. Selaraskan checklist yang sudah stale, namun pertahankan history yang berguna.

### `HANDOFF.md`
Catat branch/commit saat handoff, keadaan aktual, fitur selesai vs parsial, file terakhir diubah, perintah/test beserta hasil, error tersisa, env names yang diperlukan tanpa values, migration applied vs pending, blocker, serta satu next action yang paling tepat.

### Dokumentasi pendukung
- Perbaiki `README.md` jika stack/startup/config tidak sesuai kode aktual. Pada snapshot, README menyebut Neon/Prisma/Cloudinary sementara dependencies/kode yang diperiksa mengarah ke Supabase; jangan hanya mengganti kata-kata tanpa memverifikasi arsitektur.
- `PANDUAN.md` saat snapshot masih merupakan template generik Create Next App. Putuskan apakah perlu diganti dengan panduan lokal MuaraKu; pertahankan informasi standar yang masih berguna.
- Rekonsiliasi status yang bertentangan antara `CHANGELOG.md`, `TASKS.md`, `HANDOFF.md`, `PRD.md`, dan `README.md`. Jangan menyatakan Turnstile, OAuth, schema, tests, atau fitur lain sudah aktif jika belum dibuktikan.
- Update `.env.example` dengan variable names/placeholders yang benar-benar dipakai; jangan commit secrets.

### Saat mendekati limit
Hentikan fitur baru yang belum perlu, simpan pekerjaan valid, periksa diff, tulis detail pekerjaan parsial dan next steps, jalankan test paling relevan yang memungkinkan, lalu update ketiga file. Jika sesi terputus tanpa handoff, agent selanjutnya harus memverifikasi code diff dahulu; jangan percaya catatan yang mungkin kedaluwarsa.

---

## 15. Test matrix dan acceptance criteria

### Auth
- Signup email, OTP valid/invalid/expired, resend cooldown, repeated click, network failure.
- OAuth success/cancel/error/callback jika provider tersedia.
- Turnstile token valid/expired/invalid ketika configured.
- Show/hide password, strength hint, reset password, change password.
- Legal links bekerja tanpa merusak checkbox; consent benar-benar divalidasi.
- Gender options terkirim dan tersimpan sesuai schema.
- Anonymous visitor tidak bisa masuk `/app/*` atau API terlindungi; safe redirect pascalogin.

### Data & reports
- DB kosong → empty states di Discover/Seeker/Finder/Search.
- DB ada data nyata → hanya laporan yang eligible/visible muncul.
- Query error → error state + retry, bukan fake report/empty sukses.
- Tidak ada fake sample reports di production feed.
- Private ownership clues tidak ada di public payload/page source.

### Design
- Navbar sesuai inspiration dan route rules.
- Light/dark/system theme konsisten.
- Report card mengikuti Explore.png light-card preference dan responsif.
- Landing page mengikuti visual rhythm `landing.png`, tapi semua copy/imagery relevan dengan MuaraKu dan tanpa stats palsu.
- Global Chat membedakan own vs other messages dengan jelas dan data tidak hanya local component state.
- Terms/Privacy link biru dan accessible.
- ID/EN coverage meliputi semua state.

### Translation
- Tidak ada request sebelum tombol translate ditekan.
- Cache miss membuat satu provider request yang tervalidasi.
- Cache hit tidak membuat provider request.
- Content change menyebabkan hash berbeda/cache miss.
- Asli selalu bisa dilihat lagi; tidak menimpa isi postingan.
- Unsupported target, empty input, excessive input, provider errors, quota exceeded, unauthorized IDs, dan rate limits ditangani aman.
- API key tidak tersedia dari browser/bundle/log.

### Quality
- `npm run lint`, TypeScript typecheck, tests, `npm run build` — jalankan dan catat hasil aktual.
- Jika FastAPI sudah ada/ditambahkan, jalankan formatting/type/lint/tests sesuai tooling repo.
- Uji desktop/tablet/mobile dan keyboard focus pada alur kritis.
- Verifikasi tidak ada perubahan tak disengaja pada Private Chat, RLS, migrations, env, atau production data.

Fitur hanya boleh berstatus selesai jika acceptance criteria terkait telah diverifikasi. Jika credential atau dashboard eksternal tidak tersedia, tulis blocker secara akurat dan jangan berpura-pura integrasi telah diuji.

---

## 16. Format laporan akhir AI Agent

Setelah fase implementasi, berikan ringkasan dengan format berikut:

1. **Audit** — branch, commit, jumlah/file Markdown yang dibaca, baseline tests, temuan utama.
2. **Root cause** — bug dan penyebab aktual (jangan cuma mengulang daftar gejala).
3. **Changes** — file berubah, migrations, dependencies, dan alasan.
4. **Tests** — perintah persis dan hasil aktual; pisahkan PASS, FAIL, NOT RUN.
5. **External configuration** — hal yang masih perlu dilakukan pemilik proyek di Supabase, Google Cloud Console, Cloudflare, Resend, atau hosting.
6. **Security/performance** — apa yang diverifikasi serta batasan pengukuran.
7. **Remaining issues** — status per task tanpa klaim berlebihan.
8. **Handoff** — next action yang paling penting untuk agent berikutnya.

**Mulai sekarang:** validasi branch dan baca semua dokumentasi/folder inspiration, verifikasi temuan awal di atas terhadap kode terkini, lalu implementasikan perbaikan P0 dalam unit kecil. Jangan mengedit dokumen sebelum memahami perbedaan antara intended design, status yang diklaim dokumentasi, dan kode yang benar-benar berjalan.


### Scope Update: Defer Google Cloud Translation

Google Cloud Translation API integration is deferred because a billing account is not yet available.

- Do not implement or activate Google Cloud Translation API calls.
- Do not require a Google Translation API key or billing configuration for the application to build and run.
- Preserve the original report text and existing Indonesian/English interface localization.
- Keep the on-demand report-translation feature documented as deferred, not completed.
- Do not automatically substitute another paid AI provider for translation.
- Update TASKS.md and HANDOFF.md to record the dependency: translation integration awaits an available and approved billing account.

### Muara AI CS Knowledge Base

Implement a structured, maintainable knowledge base for Muara AI CS.

1. Inspect the existing Supabase schema and active migrations before creating new tables.
2. Reuse `muara_ai_sessions` and `muara_ai_messages` for conversation history if their actual schema, access policies, and retention rules are suitable.
3. If no suitable knowledge-base table exists, prepare an additive migration for `public.muara_ai_knowledge_base`.
4. Store approved product facts, FAQs, feature instructions, safety guidance, and official policies separately from personal conversation history.
5. Support draft, published, and archived states. Only approved, published knowledge may be retrieved by the production AI.
6. Keep authoritative system instructions and security boundaries in server-controlled backend configuration. Never allow ordinary users to edit system instructions through the knowledge-base interface.
7. Enforce RLS and server-side authorization for knowledge management. Only authorized administrators or designated support content editors may create, update, publish, archive, or delete knowledge entries.
8. Ensure the AI retrieves only relevant published entries and clearly acknowledges when the answer is not supported by available knowledge.
9. Do not treat knowledge-base text as executable instructions or grant database permissions based on its contents.
10. Add validation, version tracking, auditability, and tests for unpublished content, unauthorized edits, and cross-user conversation isolation.
11. Do not assume the migration has been applied to the live Supabase project. Report the migration separately from verified deployment.
12. Do not add a separate vector database for the initial implementation unless the existing knowledge volume demonstrably requires it.
13. Update CHANGELOG.md, TASKS.md, and HANDOFF.md with actual implementation status, verification results, and the next recommended task.