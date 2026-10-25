# MuaraKu Phase 5–6: Status dan QA

**Rekomendasi rilis: NOT READY.** Fitur dan pemeriksaan lokal di bawah ini tidak
membuktikan bahwa Supabase live menerima operasi atau memakai schema/RLS yang
sama dengan file lokal.

### Follow-up landing feed (2026-10-25)

- Query feed publik berhasil diuji read-only setelah key di `.env.local`
  disamakan dengan key yang terdaftar untuk URL project; file lokal bernama
  `.env .local` (memakai spasi) memiliki key valid tetapi tidak dimuat Next.js.
  Endpoint `/api/public/reports` kini HTTP 200 dan mengembalikan 6 laporan
  `approved`.
- Ini hanya membuktikan pembacaan terbatas untuk feed publik. Login, CRUD
  Finder/Seeker, operasi tulis, role, dan isolasi RLS lintas pengguna belum
  diuji ulang.
- Taste Skill production inspector landing (1440/768/390): 0 FAIL, 3 WARN.
  Screenshot final pada semua viewport telah dibuka; tidak ada screenshot
  landing yang mengklaim alur login/staf.

## Batas dan kesimpulan utama

- Tidak ada deployment, SQL yang dijalankan, atau perubahan schema yang
  diterapkan selama pekerjaan ini.
- Pembacaan feed publik live berhasil, tetapi Supabase live lainnya belum
  terverifikasi. Script pengujian inti sebelumnya gagal dengan `Unregistered
  API key` sebelum key aktif diperbaiki; pengujian auth dan operasi database
  lain belum dijalankan ulang.
- `MuaraKu_Fresh_Install_v2.2.sql` dan dokumentasi schema adalah referensi lokal,
  bukan bukti schema, grant, atau policy aktif di proyek Supabase.
- Seluruh fitur database di bawah berstatus implementasi kode saja sampai diuji
  dengan konfigurasi dan schema live yang terverifikasi.

## Matriks fitur

| Area | Status | Yang tersedia | Batas / bukti yang belum ada |
|---|---|---|---|
| Akses Admin | PARTIAL | Halaman Admin dan workspace staf memiliki pemeriksaan role; guest diarahkan ke login. | Guest guard diuji, tetapi role admin/support nyata dan query ber-role belum diuji live. |
| Overview Admin | IMPLEMENTED LOCALLY | Angka laporan pending, kasus keamanan open/reviewing, dan tiket aktif dihitung dari query; ada loading/error/empty state. | Hasil angka dan izin query belum diverifikasi pada Supabase live. |
| Review laporan | READ-ONLY | Antrean laporan dibatasi 50 dan hanya menampilkan field laporan publik. | Tidak ada aksi moderasi karena jalur perubahan status + audit atomik belum tersedia di grant/schema lokal yang dipakai. |
| Safety queue | READ-ONLY | Membaca kasus `open`/`reviewing`, dibatasi 50; tidak ada klaim aksi yang tidak tersimpan. | Assign/resolve/dismiss belum diaktifkan; role dan policy live belum diuji. |
| Akun terbatas | READ-ONLY | Daftar status akun nonaktif dibatasi 50. | Tidak ada aksi suspend/ban/unban. |
| Audit aktivitas | READ-ONLY | Membaca field aman dari 50 log terbaru. | Penulisan audit untuk aksi moderasi belum tersedia; proposal transaksi atomik ada di `database/proposals/phase5-safety-audit-rpc.md`. |
| Tiket Support pengguna | IMPLEMENTED LOCALLY | Pembuatan tiket lewat route server dengan sesi, validasi input/origin, batas ukuran, rate limit; UI menyediakan riwayat dan percakapan pemilik. | Buat tiket, balasan, kepemilikan, dan RLS belum diuji end-to-end di live. |
| Workspace Support staf | IMPLEMENTED LOCALLY | Filter status/prioritas/kategori, pencarian subject, paginasi 50, thread pesan publik, dan balasan. Catatan internal dikecualikan dari query tampilan. | Belum ada akun staf nyata untuk inspeksi visual atau pengujian policy. Perubahan status/prioritas/assignee belum dibuat. |
| Muara AI | IMPLEMENTED LOCALLY | Login wajib, validasi input, rate limit, timeout provider, parser respons, error/retry UI, fallback panduan statis terbatas, dan arah ke Support manusia. | Sukses provider serta auth live tidak diuji. Riwayat percakapan bersifat sementara, tidak dipersistenkan. |
| AI search/matching | NOT IMPLEMENTED | Tidak mengklaim pencarian atau pencocokan berbantuan AI. | Tidak ada dukungan schema/layanan yang terverifikasi untuk membangunnya. |
| Usage/token AI | NOT IMPLEMENTED | Tidak menampilkan saldo atau statistik token fiktif. | Tidak ada pencatatan usage tepercaya yang terverifikasi. |
| CRUD Finder/Seeker | BLOCKED FOR LIVE VERIFICATION | Tidak ada perubahan schema atau klaim perbaikan operasi live pada laporan ini. | Koneksi API key dan schema/RLS Supabase live belum terverifikasi. |

## Matriks integrasi dan keamanan

| Pemeriksaan | Hasil | Catatan |
|---|---|---|
| Koneksi feed/Auth Supabase | PARTIAL | Feed endpoint HTTP 200 mengembalikan 6 laporan approved setelah key aktif diperbaiki. Auth dan script pengujian inti belum dijalankan ulang. |
| RLS, grants, Storage policies live | NOT RUN | Tidak ada akses read-only terverifikasi ke schema/policy proyek live. |
| Pengujian lintas pengguna A/B | NOT RUN | Tidak ada dua identitas uji yang dapat dipakai dengan konfigurasi live yang valid. |
| Akses guest ke Admin | PASS | Route Admin dan Support staf mengarahkan guest ke alur login. Ini bukan bukti role authorization live. |
| Secret service-role di browser | PASS (static review) | Pencarian kode tidak menemukan service-role key di komponen browser. Client admin dibatasi pada modul server dan dipakai route feed publik; route mengembalikan kolom laporan yang diizinkan saja. |
| Privasi antrean Support | PARTIAL (static review) | Query UI mengecualikan `is_internal`; RLS live dan akses lintas pengguna belum dibuktikan. |
| Origin, validasi, timeout | PASS (code review) | Route Support dan AI melakukan pemeriksaan yang relevan; ini bukan pengujian penetrasi atau jaminan runtime live. |
| Rate limit | PARTIAL | Implementasi in-memory per proses/runtime; bukan limit terdistribusi dan perlu solusi server-side bersama sebelum dianggap cukup untuk skala produksi. |
| Aksi moderasi + audit | BLOCKED | Tidak diaktifkan karena update dan audit terpisah dapat menghasilkan tindakan tanpa catatan. Proposal RPC atomik disediakan, belum diterapkan. |
| OAuth, OTP, klaim, chat dua pengguna, upload | NOT RUN / BLOCKED | Tidak dapat dibuktikan tanpa API key valid dan identitas uji; jangan anggap PASS. |

## Matriks QA

| Area | Hasil |
|---|---|
| ESLint file yang disentuh | PASS |
| `npm run lint` | PASS tanpa error; 29 warning pada file lain, tidak diperbaiki karena di luar scope. |
| `npx next typegen` + `npx tsc --noEmit` | PASS |
| `npm run build` | PASS |
| Production Taste Skill Inspector landing, 1440/768/390 px | PASS: 0 FAIL, 3 WARN; screenshot final dibuka dan feed menunjukkan laporan database nyata. |
| Production Taste Skill Inspector Support, 1440/768/390 px | PASS: 0 FAIL, 0 WARN. Yang diperiksa adalah halaman guest; bukan isi tiket login atau workspace staf. |
| Screenshot final Support | Dilihat pada tiga viewport. Tidak ada klaim inspeksi visual untuk Admin/workspace staf ber-role. |
| Support, robots, sitemap HTTP smoke tests | PASS (HTTP 200) |
| Guest Admin route guard | PASS |
| Pengujian autentikasi/database live selain feed publik | NOT RUN setelah key feed diperbaiki. |
| Viewport 360/390/768/1024/desktop seluruh aplikasi | PARTIAL; hanya Support guest yang diperiksa dengan inspector pada 1440/768/390. |
| Screen reader dan audit WCAG formal | NOT RUN; bukan sertifikasi WCAG. |

### Kritik visual akhir — Support guest

Direction yang dipakai: **framed-sheet**, seed **1207243783**; tidak ada redraw.

ROUND 1
Seen in one second: Pusat bantuan.
Idea (one sentence): Tiket bantuan menjadi lembar kasus yang menyimpan percakapan dan status di akun pemilik.
Live thing: CTA membawa guest ke login; setelah autentikasi, form tiket dan thread tersedia menurut implementasi, tetapi alur database belum terbukti live.
Layout words by section: hero=title / bantuan=split / footer=columns
Scores: design 7 · usability 8 · creativity 6 · content 7 → overall 7.0
Caps applied: Creativity dibatasi 6 karena komposisi Support masih kategori yang dikenal; skor ini hanya untuk tampilan guest yang diuji.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. `desktop-fold.jpg` dan `mobile-fold.jpg`: guest belum dapat melihat form sampai login; CTA login menjelaskan jalurnya, tetapi isi utama tiket tidak terlihat sebelum masuk. Pertahankan guard privasi, dan jelaskan singkat di dekat CTA bahwa formulir dan riwayat tersedia setelah login.
2. `desktop-page-*.jpg`: setelah konten bantuan, sisa ruang menuju footer terasa sebagai jeda lebar. Pada iterasi desain berikutnya, rapatkan tinggi minimum halaman bila tidak mengganggu footer.
3. `mobile-page-*.jpg`: layar guest tidak memperlihatkan keadaan sukses, error, atau percakapan tiket. Ambil screenshot ulang untuk state tersebut setelah Supabase dan akun uji tersedia; jangan mengisi state dengan data contoh.

Skor ini tidak menilai workspace staf, alur pengguna yang login, atau kualitas respons database. Tidak ada gambar/klip eksternal yang ditambahkan untuk layar Support.

## SEO, dokumentasi, dan blocker rilis

- Metadata Support, `robots.txt`, dan `sitemap.xml` diuji pada build lokal. Sitemap berisi halaman publik, bukan route privat. Tidak dilakukan pemeriksaan indeksasi di mesin pencari.
- Build Next.js 16 berhasil tetapi memberi peringatan deprecation `middleware`; migrasi ke `proxy` belum dilakukan dan sebaiknya menjadi pekerjaan terpisah setelah membaca panduan versi Next.js yang terpasang.
- Screenshot/inspector dan request lokal tidak menggantikan uji role serta RLS di lingkungan Supabase yang sesungguhnya.

### Blocker berprioritas

1. **Tinggi — Auth dan akses database live:** Feed publik berhasil setelah `.env.local` disinkronkan dengan key yang terdaftar; auth, Finder/Seeker CRUD, operasi tulis, dan RLS tetap harus diuji memakai identitas terpisah. Jangan kirim nilai secret.
2. **Tinggi — Schema/policy live belum diketahui:** bandingkan tabel, kolom, grants, RLS, serta Storage policies aktif dengan installer yang disetujui menggunakan akses read-only sebelum rilis.
3. **Tinggi — Aksi moderasi belum aman untuk diaktifkan:** siapkan dan tinjau jalur transaksi/RPC update + audit, lalu uji dengan role terpisah; proposal lokal belum diterapkan.
4. **Sedang — Role dan alur end-to-end:** sediakan identitas uji user, support, moderator, dan admin untuk menguji akses, privasi, Support, laporan, safety, dan AI secara nyata.
5. **Sedang — Rate limiting produksi:** ganti/bungkus Map in-memory dengan pembatas terdistribusi bila aplikasi berjalan pada beberapa instance.
6. **Rendah — Peringatan framework:** rencanakan migrasi `middleware` ke `proxy` berdasarkan dokumentasi Next.js yang terpasang.

## Rekomendasi sebelum rilis

Jangan rilis perubahan yang bergantung pada operasi live sampai API key valid, schema/RLS aktual sudah dicocokkan secara read-only, dan alur role diuji dengan akun khusus. Setelah blocker tersebut ditangani, jalankan ulang test regresi lintas pengguna serta QA visual untuk keadaan Support login dan workspace staf. Tidak ada deploy atau SQL yang dijalankan sebagai bagian dari pekerjaan ini.
