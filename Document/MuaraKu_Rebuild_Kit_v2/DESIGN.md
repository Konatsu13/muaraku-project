# MuaraKu — Design System

**Status: provisional.** Ini baseline kerja, bukan keputusan final atas Navbar/sidebar atau semua detail visual. AI coding agent mendesain dan mengimplementasikan langsung di kode berdasarkan referensi yang akan diberikan pengguna. Jika referensi belum ada, kerjakan fondasi visual yang aman tetapi tandai komponen yang belum disetujui sebagai provisional.

## Arah visual

MuaraKu ialah platform lost-and-found berbasis komunitas yang harus terasa tenang, aman, mudah dipahami, modern dan tepercaya—bukan template marketplace atau dashboard AI generik. Pertahankan kesederhanaan ala produk Apple yang pernah disukai pengguna, tanpa meniru produk/branding spesifik. Prioritas: hierarki informasi, whitespace yang disengaja, kejelasan status laporan, dan interaksi yang tidak mengejutkan.

## Token awal

| Token | Nilai awal | Penggunaan |
|---|---|---|
| Canvas | `#F8F9FA` | Latar halaman |
| Surface | `#FFFFFF` | Panel/form utama |
| Muted surface | `#F4F4F5` | Latar sekunder |
| Main text | `#121212` | Teks utama; bukan pure black |
| Secondary text | `#71717A` | Deskripsi/metadata |
| Border | `#E4E4E7` | Divider dan border |
| Brand accent | `#FB923C` | CTA/active/focus dengan kontras yang sesuai |
| Focus | `#C96A1B` | Focus ring yang jelas |

Token di atas berasal dari arah desain yang pernah dibahas dan boleh disempurnakan setelah referensi pengguna diterima. Logo final tidak menggunakan gradient. Jangan memakai neon, outer glow, atau kombinasi aksen berlebihan. Tema gelap harus memakai pasangan token yang diuji, bukan membalik warna otomatis.

## Tipografi, layout, komponen

- Geist Sans adalah pilihan sementara untuk UI; Geist Mono hanya untuk data teknis/angka jika membantu. Prioritas referensi pengguna lebih tinggi daripada pilihan font sementara.
- Gunakan skala spacing 4/8px, grid responsif, batas lebar konten yang masuk akal, dan hierarchy melalui ukuran/weight/spacing—bukan headline raksasa.
- Hindari tiga kartu identik sebagai layout default. Gunakan card hanya jika elevasi membantu hierarki; untuk daftar padat, utamakan alignment, whitespace dan divider.
- Navbar/sidebar: **menunggu referensi pengguna**. Saat referensi datang, jelaskan prinsip layout/spacing/hierarchy/behavior yang diambil lalu implementasikan langsung. Jangan mengunci compact state, tinggi, icon set atau mobile collapse dari tebakan sebelum pemeriksaan referensi.
- Settings hanya overlay dengan dua aksi: `Switch Account` dan `Home`; `Home` mengarah ke `/`. Jangan menambah menu.
- Form: label di atas input, helper/error dekat field, focus-visible jelas, error menjelaskan perbaikan. Tombol memiliki hover/active/disabled/loading state yang wajar.
- Report card: judul, tipe lost/found, kategori, lokasi dan waktu mudah dipindai; jangan menampilkan clue privat, kontak privat, data palsu atau match score tanpa hasil nyata.
- Chat menampilkan pesan aktual saja. Status terkirim/dibaca hanya jika didukung backend.
- Loading menggunakan skeleton yang meniru layout; empty state mengatakan belum ada data dan memberi tindakan relevan; error menjelaskan kegagalan dan retry bila aman.

## Responsivitas, motion, aksesibilitas

- Uji desktop dan mobile; tidak boleh ada horizontal overflow. Layout multi-kolom umumnya menjadi satu kolom di bawah 768px kecuali ada alasan dan pengujian.
- Target sentuh sekurangnya 44×44px. Gunakan semantic HTML, label kontrol, keyboard navigation, visible focus, dialog yang mengelola fokus/Escape dengan benar, dan kontras setara WCAG AA sebagai target.
- Motion harus fungsional dan ringan; utamakan transform/opacity. Hormati `prefers-reduced-motion` dan hindari perpetual motion dekoratif, scroll hijacking atau layout shift.

## Jangan dilakukan

Jangan gunakan dummy data sebagai data nyata; fake live status/match score/token balance; fitur translate postingan; gradient logo; neon/glow; pure black `#000000`; emoji sebagai ikon UI; placeholder nama generik; filler seperti “Scroll to explore”; layout overlap untuk memperbaiki struktur yang salah; atau menyatakan sukses sebelum backend mengonfirmasi.

## Proses referensi desain

Saat pengguna mengirim screenshot/URL/file, simpan referensi asli pada `references/` bila tersedia. Catat untuk setiap referensi: komponen/halaman, aspek yang dipelajari (hierarki, spacing, typography, density, behavior, responsive), hal yang tidak perlu ditiru, dan status persetujuan. Jangan menyalin identitas/aset proprietary tanpa izin. Perbarui dokumen ini setelah keputusan desain disetujui dan catat perubahan di `CHANGELOG.md`.
