# MuaraKu — Design System Contract

Sumber kebenaran token: `app/globals.css` (`:root` / `.dark`). Semua halaman wajib mengikuti nilai di sini; jangan menulis warna hex baru di komponen.

## Warna (light)

| Peran | Token | Nilai |
|---|---|---|
| Background / canvas | `--canvas` → `bg-canvas` | `#FFFFFF` |
| Surface (panel/strip sekunder) | `--surface` → `bg-surface` | `#F9FAFB` |
| Teks utama | `--main-text` → `text-main-text` | `#171717` |
| Teks sekunder | `--secondary-text` → `text-secondary-text` | `#737373` |
| Border | `--border` → `border-subtle` | `#E5E7EB` |
| Brand utama (aksi) | `--brand-accent` → `bg-brand`, `text-orange-*` | `#FB923C` (hover `#EA580C`) |
| Brand sekunder (informasi/temuan) | `--trust-blue` → `text-trust`, `bg-trust` | `#2563EB` |
| Success | `--success` | `#16A34A` |
| Error | `--error` | `#DC2626` |

Dark mode: token `.dark` di `globals.css` tetap berlaku (canvas `#121214`, surface `#18181B`). Tidak diubah oleh palet light.

## Aturan pemakaian

1. **Orange = aksi**, bukan status. Tombol utama, link aktif, fokus. Sisa UI netral.
2. **Blue = informasi/status temuan.** Chip "Ditemukan", ikon informatif.
3. Tanpa gradient, glow, blur dekoratif. `backdrop-blur` hanya: navbar sticky & bottom nav di atas konten bergerak.
4. Status semantik: success `#16A34A`, error `#DC2626`, warning `#EAB308`. Jangan pakai warna baru.
5. **Radius skala**: chip/input/kartu kecil `rounded-md`–`rounded-lg`, kartu/panel `rounded-lg`/`rounded-xl`, modal besar `rounded-2xl` maks. Tidak ada `rounded-3xl`.
6. Bayangan: tanpa shadow di landing/surface publik; `shadow-xs` max di kontrol app. Modal boleh `shadow-2xl`.
7. Tipografi: Geist Sans (`next/font`). Heading `font-bold tracking-tight` — **tanpa `font-extrabold`**, tanpa label ALL-CAPS dekoratif, tanpa kata berwarna di headline. Body `text-sm`/`text-base`, sekunder `text-secondary-text`.
8. Ikon: outline Lucide, warna `text-secondary-text`/token semantik. `Sparkles` hanya untuk konteks AI yang memang bermakna.
9. Teks dekoratif `01/02/03` dilarang. Penomoran hanya jika benar-benar urutan langkah.
10. `prefers-reduced-motion` dan `:focus-visible` (outline `--focus`) sudah di `globals.css` — jangan dibuat state hover/fokus mati.

## Struktur halaman publik

- Navbar publik: sticky, `bg-canvas/90` + blur, border bawah `border-subtle`. CTA login: orange solid (oral teks), radius default sistem.
- Hero: satu kolom naratif kiri (max-w-2xl), tanpa kartu data palsu; kanan/konten di bawah hanya info produk yang nyata.
- Section "assuransi"/prinsip: kolom flat dengan border pemisah (`border-l`/`border-t`), ikon kecil netral, judul `text-sm font-semibold` — bukan kartu.
- FAQ: dividers `border-y` + chevron, bukan kotak per pertanyaan.
- Footer: 4 kolom standar token, border atas.

## Section developer (About)

Data di `lib/config/developers.ts` (`name`, `role`, `photo`, `linkedinUrl`, `instagramUrl`). Foto frame `aspect-square`, `object-cover`, radius sistem, fallback netral; link sosial hanya dirender jika URL https valid; jangan mengarang identitas. Entri kosong menampilkan empty state, bukan dummy.
