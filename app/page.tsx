"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { ReportCard, ReportItem } from "@/components/reports/ReportCard";
import { fetchReports } from "@/lib/supabase/reports";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import {
  ShieldCheck,
  Search,
  Sparkles,
  ArrowRight,
  Lock,
  UserCheck,
  ChevronDown,
  CheckCircle2,
  FileText,
  Users,
  MapPin,
  Building,
  Shield,
  Languages,
  BadgeCheck,
  Package,
  Layers,
  Inbox,
  Clock,
  Compass,
} from "lucide-react";

export default function HomePage() {
  const { openAuthModal } = useAuth();
  const { t } = useI18n();
  const [feedFilter, setFeedFilter] = useState<"all" | "lost" | "found">("all");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadReports() {
      setLoadingReports(true);
      const { data } = await fetchReports({ type: feedFilter });
      if (isMounted) {
        setReports(data || []);
        setLoadingReports(false);
      }
    }
    loadReports();
    return () => {
      isMounted = false;
    };
  }, [feedFilter]);

  const faqs = [
    {
      q: "Apakah ada biaya tebusan atau pungutan biaya saat barang ditemukan?",
      a: "Sama sekali tidak ada. MuaraKu beroperasi atas dasar prinsip ketulusan sipil dan integritas pelayanan umum. Siapapun yang meminta biaya tebusan, biaya administrasi ilegal, atau transfer pulsa dapat langsung dilaporkan dan akunnya akan diblokir permanen.",
    },
    {
      q: "Bagaimana cara memverifikasi pemilik sah tanpa membocorkan ciri rahasia?",
      a: "Saat mendaftarkan barang temuan, penemu menyembunyikan 1–2 detail spesifik (misal: isi saku tersembunyi, warna gantungan kunci di dalam, atau nomor seri). Ketika seorang pencari ingin mengklaim, sistem menyajikan kuis kepemilikan privat tanpa pernah membocorkan ciri tersebut ke publik.",
    },
    {
      q: "Siapa saja mitra petugas lokasi terverifikasi saat ini?",
      a: "Mitra resmi mencakup petugas pengamanan stasiun KRL Jabodetabek, pengawas halte TransJakarta, staf perpustakaan perguruan tinggi negeri & swasta terdaftar, serta tim sekuriti gedung publik yang telah melalui proses validasi identitas instansi.",
    },
    {
      q: "Apa yang harus saya lakukan jika menemukan barang berharga tinggi (laptop, dompet, uang)?",
      a: "Kami menyarankan Anda untuk tidak menyimpannya secara pribadi. Gunakan opsi serah terima ke posko mitra resmi MuaraKu (seperti pos pengamanan stasiun atau pusat keamanan kampus) dan catat tanda terima digital di aplikasi.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFCF8] dark:bg-[#18181B] text-zinc-900 dark:text-zinc-100 transition-colors">
      <PublicNavbar />

      <main className="flex-1" id="home">
        {/* ==================== HERO SECTION ==================== */}
        <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden border-b border-zinc-200/80 dark:border-zinc-800">
          {/* Subtle Ambient Tint Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#FB923C_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.06] pointer-events-none" />

          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 relative">
            <div className="text-center max-w-3xl mx-auto mb-14">
              {/* Civic Trust Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-semibold mb-6">
                <ShieldCheck className="w-4 h-4 text-orange-500" />
                <span>Jaringan Temu Kembali Fasilitas Publik &amp; Kampus Nasional</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight mb-6 leading-[1.15]">
                Barang Hilang atau Ditemukan? <span className="text-orange-500">MuaraKu</span> Titik Temunya.
              </h1>

              <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 mb-8 leading-relaxed max-w-2xl mx-auto">
                Platform sipil dan komunitas terpercaya Indonesia untuk melaporkan, mencocokkan, dan mengembalikan barang tertinggal dengan aman tanpa rasa was-was penipuan.
              </p>

              {/* Action CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <button
                  onClick={() => openAuthModal("login")}
                  className="w-full sm:w-auto h-12 px-7 rounded-xl bg-orange-500 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-orange-600 shadow-sm transition-all transform hover:-translate-y-0.5"
                >
                  <Search className="w-4 h-4" />
                  <span>Cari &amp; Lapor Barang</span>
                </button>

                <a
                  href="#cara-kerja"
                  className="w-full sm:w-auto h-12 px-6 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-700/60 transition-all"
                >
                  <span>Pelajari Cara Kerja</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <Link
                  href="/app"
                  className="w-full sm:w-auto h-12 px-5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-semibold text-sm flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Compass className="w-4 h-4" />
                  <span>Jelajahi Feed Publik</span>
                </Link>
              </div>
            </div>

            {/* ==================== HERO INTERACTIVE WORKFLOW PREVIEW ==================== */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-5xl mx-auto relative">
              {/* Top Bar */}
              <div className="flex flex-wrap items-center justify-between pb-6 border-b border-zinc-100 dark:border-zinc-800 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="font-mono text-xs text-zinc-400 ml-2">muaraku.id/live-hub</span>
                </div>

                <div className="flex-1 max-w-md hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs">
                  <Search className="w-4 h-4 text-zinc-400" />
                  <span className="truncate">Cari: &ldquo;Dompet kulit cokelat tertinggal di KRL Manggarai...&rdquo;</span>
                  <span className="ml-auto px-1.5 py-0.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-[10px] font-mono text-zinc-400">
                    ⌘F
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Simulasi Alur Verifikasi</span>
                </div>
              </div>

              {/* Matching Engine Cards Comparison (Walkthrough) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6 items-center">
                {/* Sisi Kiri: Laporan Kehilangan (Seeker) */}
                <div className="md:col-span-5 bg-[#FFFCF8] dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl p-5 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold">
                      Laporan Hilang #HIL-8291
                    </span>
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>20 Menit lalu</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    Dompet Lipat Kulit Kartu Identitas
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 mb-4 leading-relaxed">
                    &ldquo;Terjatuh saat turun di Peron 3 Stasiun Manggarai arah Bogor sekitar jam 07:45 WIB.&rdquo;
                  </p>

                  <div className="space-y-2 border-t border-zinc-200/60 dark:border-zinc-700/60 pt-3 text-xs">
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                      <span>KRL Commuter Line • Manggarai</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <Lock className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="italic">Ciri rahasia tersimpan di vault verifikasi</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between text-xs text-zinc-500">
                    <span>Pelapor: <strong className="text-zinc-800 dark:text-zinc-200">Budi S.</strong></span>
                    <span className="font-mono text-[11px]">ID: W-4412</span>
                  </div>
                </div>

                {/* Bagian Tengah: Match Connector */}
                <div className="md:col-span-2 flex flex-col items-center justify-center py-2 text-center">
                  <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="mt-2 text-xs font-bold text-orange-600 dark:text-orange-400">
                    Pencocokan Cerdas
                  </span>
                  <span className="text-[11px] text-zinc-400 mt-0.5">
                    Ilustrasi Alur Sinergi
                  </span>
                </div>

                {/* Sisi Kanan: Laporan Temuan (Finder - Staff Verified) */}
                <div className="md:col-span-5 bg-white dark:bg-zinc-800/90 border-2 border-orange-500/30 rounded-xl p-5 relative shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                      Temuan #TEM-3104
                    </span>
                    {/* Verified Staff Badge */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      <span>Petugas Terverifikasi</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    Dompet Pria Warna Cokelat Tua
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 mb-4 leading-relaxed">
                    &ldquo;Ditemukan di bangku tunggu peron 3 arah Depok. Diserahkan ke Ruang Pos Pelayanan Stasiun.&rdquo;
                  </p>

                  <div className="space-y-2 border-t border-zinc-200/60 dark:border-zinc-700/60 pt-3 text-xs">
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <Building className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Posko Satpam Stasiun Manggarai</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Aman dalam brankas dinas fasilitas</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Penyimpan: <strong className="text-zinc-800 dark:text-zinc-200">Petugas Stasiun</strong></span>
                    <button
                      onClick={() => openAuthModal("login")}
                      className="px-3 py-1 rounded-lg bg-orange-500 text-white font-semibold text-xs hover:bg-orange-600 transition-colors"
                    >
                      Klaim Milik
                    </button>
                  </div>
                </div>
              </div>

              {/* Explanatory footer note */}
              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-center">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-emerald-500" />
                  Alur di atas merupakan ilustrasi tata kelola verifikasi: kuis kepemilikan privat melindungi barang dari klaim palsu sebelum nomor kontak dibuka.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== DUA PILAR EKOSISTEM (ABOUT) ==================== */}
        <section className="py-20 bg-white dark:bg-[#121214] border-b border-zinc-200/80 dark:border-zinc-800 transition-colors" id="about">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400">
                Arsitektur Dua Sisi
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
                Ekosistem Adil bagi Pencari dan Penemu
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                MuaraKu menghilangkan rasa cemas dari kedua belah pihak dengan alur validasi yang melindungi identitas serta kepemilikan riil barang berharga.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Pilar Seeker */}
              <div className="bg-[#FFFCF8] dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 hover:shadow-md transition-all space-y-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <Search className="w-6 h-6" />
                </div>
                <span className="inline-block px-3 py-1 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-semibold">
                  Pilar 01 • Sisi Pencari (Seeker)
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Laporkan Kehilangan, Cocokkan Otomatis dengan Pencarian Aman
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Tidak perlu lagi memposting nomor HP atau foto KTP di media sosial terbuka. Cukup laporkan deskripsi umum dan simpan ciri rahasia di brankas terenkripsi untuk proses pencocokan.
                </p>
                <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <span>Notifikasi langsung saat barang berkarakteristik mirip didaftarkan.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <span>Terlindungi dari pesan spam penipuan bermodus meminta uang pulsa atau tebusan palsu.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <span>Bukti pelaporan digital resmi untuk keperluan pos pengamanan atau kepolisian.</span>
                  </li>
                </ul>
              </div>

              {/* Pilar Finder */}
              <div className="bg-[#FFFCF8] dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 hover:shadow-md transition-all space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Package className="w-6 h-6" />
                </div>
                <span className="inline-block px-3 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                  Pilar 02 • Sisi Penemu (Finder)
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Amankan Barang Temuan, Validasi Bukti Rahasia, Titipkan ke Posko Resmi
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Niat baik Anda dijamin aman. Cukup titipkan barang temuan di pos mitra resmi MuaraKu terdekat tanpa perlu repot menyimpan atau menghadapi penipu beritikad buruk.
                </p>
                <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Verifikasi kepemilikan otomatis: hanya pemilik asli yang bisa menjawab kuis rahasia.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Integrasi drop-point pos satpam stasiun, halte TransJakarta, kantin &amp; perpustakaan.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Apresiasi Civic Karma atas kontribusi kejujuran masyarakat sipil.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== CARA KERJA (3 LANGKAH TRANSPARAN) ==================== */}
        <section className="py-20 bg-[#FFFCF8] dark:bg-[#18181B] border-b border-zinc-200/80 dark:border-zinc-800 transition-colors" id="cara-kerja">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400">
                Metode MuaraKu
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
                3 Langkah Temu Kembali yang Bersih &amp; Transparan
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                Didesain khusus untuk menggantikan keruwetan grup chat dan postingan medsos yang rentan manipulasi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Step 1 */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 relative space-y-4">
                <div className="w-10 h-10 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center text-lg">
                  1
                </div>
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Buat Laporan Cepat (Bahasa Sehari-hari N2L)
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Tulis kronologi seperti bercerita ke teman: &ldquo;Tas punggung hitam laptop tertinggal di gerbong 5 KRL Manggarai jam 6 sore&rdquo;. Sistem mengekstrak waktu, lokasi, dan objek secara otomatis.
                </p>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/80 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 font-mono text-[11px] text-zinc-600 dark:text-zinc-300">
                  Natural Language Parsing &rarr; Geo-tag: Manggarai &rarr; Objek: Ransel Kerja
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 relative space-y-4">
                <div className="w-10 h-10 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center text-lg">
                  2
                </div>
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Verifikasi Kepemilikan Privat
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Ciri rahasia (seperti isi dompet, gantungan kunci di dalam, atau 4 digit nomor) tidak pernah diumbar ke publik. Hanya pemilik sah yang dapat menjawab kuis verifikasi rahasia.
                </p>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/80 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 font-mono text-[11px] text-zinc-600 dark:text-zinc-300">
                  Privasi Terjaga • Zero-Knowledge Owner Clues
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 relative space-y-4">
                <div className="w-10 h-10 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center text-lg">
                  3
                </div>
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Serah Terima di Pos Petugas Terverifikasi
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Tidak ada pertemuan di tempat sunyi. Penyerahan dilakukan langsung di pos satpam stasiun, pos pengamanan kampus, atau loket stasiun mitra dengan tanda serah terima digital resmi.
                </p>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/80 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 font-mono text-[11px] text-zinc-600 dark:text-zinc-300">
                  Lokasi: Pos Pengamanan Resmi • Legalitas Aman
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== BENTO INFRASTRUKTUR TEKNOLOGI & TRUST ==================== */}
        <section className="py-20 bg-white dark:bg-[#121214] border-b border-zinc-200/80 dark:border-zinc-800 transition-colors">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400">
                Infrastruktur Sipil
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
                Kepercayaan Didukung Teknologi Bersih
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                Dibangun tanpa iklan menjebak, tanpa spekulasi berbayar, berfokus murni pada utilitas sosial dan kenyamanan warga.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Bento 1: N2L Search (2 cols on md) */}
              <div className="md:col-span-2 bg-[#FFFCF8] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-6">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    Natural Language Search (N2L) Bahasa Indonesia
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
                    Tak perlu mencari berdasarkan format kaku. Ketikkan apa yang Anda ingat dengan bahasa kasual, sinonim sehari-hari, atau nama rute transportasi (KRL Manggarai, JakLingko 31, Gedung D Kampus).
                  </p>
                </div>
                <div className="bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-xl p-4 flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-600 dark:text-zinc-300">Query: &ldquo;earphone putih casing ada tempelan kucing di peron 1&rdquo;</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">&rarr; Terindeks Akurat</span>
                </div>
              </div>

              {/* Bento 2: Petugas Lokasi Terverifikasi */}
              <div className="bg-[#FFFCF8] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    Petugas Lokasi Terverifikasi
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Tanda pengenal kuning resmi untuk petugas stasiun, sekuriti mal, dan koordinator kampus yang menjaga fisik barang temuan.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 pt-4 border-t border-zinc-200/60 dark:border-zinc-800 text-xs font-semibold text-amber-700 dark:text-amber-400">
                  <BadgeCheck className="w-4 h-4" />
                  <span>Otoritas Fisik Terdaftar</span>
                </div>
              </div>

              {/* Bento 3: Anti-Tebusan */}
              <div className="bg-[#FFFCF8] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-6">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    Anti-Tebusan &amp; Anti-Pemerasan
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Sistem ketat mendeteksi dan memblokir pihak yang meminta transfer uang muka atau biaya tebusan sebelum barang diverifikasi secara resmi.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 pt-4 border-t border-zinc-200/60 dark:border-zinc-800 text-xs font-semibold text-rose-600 dark:text-rose-400">
                  <Lock className="w-4 h-4" />
                  <span>Protokol Nol-Biaya Wajib</span>
                </div>
              </div>

              {/* Bento 4: Privasi Maksimal (2 cols on md) */}
              <div className="md:col-span-2 bg-[#FFFCF8] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    Privasi Maksimal &amp; Perlindungan Data Warga
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
                    Identitas KTP, nomor WhatsApp pribadi, dan alamat tinggal tidak dibuka di ruang publik. Komunikasi dilakukan melalui chat terenkripsi sampai validasi serah terima disepakati.
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-zinc-200/60 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>No Spam Call</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Masking Nomor HP</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Audit Log Serah Terima</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== COMMUNITY PREVIEW FEED (REAL DATABASE) ==================== */}
        <section className="py-20 bg-[#FFFCF8] dark:bg-[#18181B] border-b border-zinc-200/80 dark:border-zinc-800 transition-colors" id="eksplorasi">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400">
                  Laporan Terkini
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight mt-2">
                  Jelajahi Laporan Komunitas Nyata
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Semua data berasal langsung dari sistem basis data riil tanpa rekayasa.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60">
                <button
                  onClick={() => setFeedFilter("all")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    feedFilter === "all"
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  {t.discover.filter_all}
                </button>
                <button
                  onClick={() => setFeedFilter("lost")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    feedFilter === "lost"
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  {t.discover.filter_lost}
                </button>
                <button
                  onClick={() => setFeedFilter("found")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    feedFilter === "found"
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  {t.discover.filter_found}
                </button>
              </div>
            </div>

            {/* Cards Grid / Empty State */}
            {loadingReports ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className="h-64 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 animate-pulse border border-zinc-200/60 dark:border-zinc-700/60"
                  />
                ))}
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 max-w-2xl mx-auto space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto">
                  <Inbox className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Belum Ada Laporan Aktif
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                  Basis data saat ini belum memiliki laporan untuk kategori ini. Jadilah yang pertama melaporkan barang hilang atau ditemukan.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => openAuthModal("login")}
                    className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-xs shadow-sm transition-all"
                  >
                    Mulai Buat Laporan
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.slice(0, 6).map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onChatClick={() => openAuthModal("login")}
                  />
                ))}
              </div>
            )}

            {/* View Full Discover Button */}
            <div className="mt-12 text-center">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors"
              >
                <span>Buka Seluruh Discover Feed</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ==================== FAQ ACCORDION ==================== */}
        <section className="py-20 bg-white dark:bg-[#121214] border-b border-zinc-200/80 dark:border-zinc-800 transition-colors" id="support">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 space-y-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400">
                Tanya Jawab
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
                Pertanyaan Umum Seputar MuaraKu
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Transparansi prosedur untuk menjamin setiap proses temu kembali berjalan dengan rasa aman.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-[#FFFCF8] dark:bg-zinc-900 overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-zinc-900 dark:text-zinc-100 hover:text-orange-500 transition-colors"
                    >
                      <span className="text-sm sm:text-base">{faq.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-zinc-400 flex-shrink-0 transition-transform ${
                          isOpen ? "rotate-180 text-orange-500" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 pt-4">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==================== FINAL CTA BANNER ==================== */}
        <section className="py-20 bg-orange-500 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Semangat Gotong Royong Warga Digital</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Bantu Komunitasmu Menemukan Kembali Yang Berharga.
            </h2>
            <p className="text-base sm:text-lg text-orange-100 max-w-xl mx-auto">
              Bergabung dengan ribuan warga jujur, petugas stasiun, dan civitas kampus. Menghadirkan kembali ketenangan di ruang publik kita.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => openAuthModal("register")}
                className="w-full sm:w-auto px-8 py-4 bg-white text-orange-600 hover:bg-orange-50 font-bold rounded-2xl shadow-lg text-sm sm:text-base transition-all transform hover:-translate-y-0.5"
              >
                Daftar Gratis Warga
              </button>
              <button
                onClick={() => openAuthModal("login")}
                className="w-full sm:w-auto px-7 py-4 bg-orange-600/80 hover:bg-orange-600 text-white font-semibold rounded-2xl border border-white/20 text-sm sm:text-base transition-all"
              >
                Masuk ke Akun
              </button>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
