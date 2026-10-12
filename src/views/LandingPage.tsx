'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onNavigate: (route: string) => void;
  onOpenReportModal: () => void;
}

type SimulatorTab = 'matching' | 'radar' | 'vault';

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenReportModal }) => {
  const { isAuthenticated } = useAuth();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<SimulatorTab>('matching');
  const [activeScenario, setActiveScenario] = useState<number>(0);
  const [simulatedMatchProgress, setSimulatedMatchProgress] = useState<number>(98);

  const scenarios = [
    {
      id: 'wallet',
      title: 'Dompet Lipat Kulit Pelajar',
      category: 'Dompet & Kartu',
      seeker: {
        id: '#HIL-8291',
        title: 'Dompet Lipat Kulit Kartu Pelajar',
        desc: '"Terjatuh di bangku tunggu peron stasiun menuju sekolah sekitar pk 07:45 WIB."',
        location: 'Stasiun KRL / Halte Sekolah',
        time: '20 Menit lalu',
        secretNote: 'Ciri Rahasia: Ada stiker foto polaroid di kompartemen saku dalam',
      },
      finder: {
        id: '#TEM-3104',
        title: 'Dompet Pria Warna Cokelat Tua',
        desc: '"Ditemukan di bangku tunggu peron stasiun. Langsung diserahkan ke Pos Satpam."',
        location: 'Pos Pengamanan Gerbang Utama',
        officer: 'Bripka Bambang (Satpam Siaga)',
        status: 'Brankas Kunci Tersegel',
      },
      matchPercent: 98.4,
      aiConfidence: 'Tinggi Sekali (98.4%)',
      auditNote: 'Algoritma mendeteksi kesamaan lokasi (99%), timestamp (96%), dan kategori tekstur kulit.',
    },
    {
      id: 'keys',
      title: 'Kunci Motor Honda Smart Key',
      category: 'Kunci & Kendaraan',
      seeker: {
        id: '#HIL-9042',
        title: 'Kunci Smart Key Honda Vario 160',
        desc: '"Tergantung gantungan rajut alpaka warna hijau toska. Tercecer seputar area parkir timur."',
        location: 'Area Parkir Timur Sekolah',
        time: '45 Menit lalu',
        secretNote: 'Ciri Rahasia: Terdapat goresan kecil angka 7 di sudut belakang remote',
      },
      finder: {
        id: '#TEM-3118',
        title: 'Remote Smart Key Hitam Gantungan Rajut',
        desc: '"Ditemukan di trotoar jalur motor gerbang barat. Diamankan di loket piket satpam."',
        location: 'Pos Jaga Parkir & Gerbang',
        officer: 'Pak Suyanto (Koordinator)',
        status: 'Fisik Tersimpan di Loker 04',
      },
      matchPercent: 99.1,
      aiConfidence: 'Sangat Valid (99.1%)',
      auditNote: 'Pencocokan NLP gantungan rajut hijau toska cocok 100% dengan database temuan.',
    },
    {
      id: 'bottle',
      title: 'Tumbler Corkcicle Canteen 16oz',
      category: 'Perlengkapan Pribadi',
      seeker: {
        id: '#HIL-7721',
        title: 'Tumbler Biru Doff Corkcicle',
        desc: '"Tertinggal di meja perpustakaan lantai 2 saat belajar kelompok jam istirahat kedua."',
        location: 'Perpustakaan Gedung A Lt 2',
        time: '2 Jam lalu',
        secretNote: 'Ciri Rahasia: Ada inisial "AZ" berukir tipis pada bagian dasar botol',
      },
      finder: {
        id: '#TEM-3092',
        title: 'Botol Minum Biru Doff Stainless',
        desc: '"Diserahkan oleh petugas kebersihan perpus ke meja sirkulasi staf tata usaha."',
        location: 'Meja Sirkulasi Perpustakaan',
        officer: 'Ibu Ratna (Pustakawati)',
        status: 'Tercatat di Buku Induk Temuan',
      },
      matchPercent: 96.8,
      aiConfidence: 'Valid (96.8%)',
      auditNote: 'Waktu kejadian dan lokasi perpustakaan gedung A berhimpitan akurat.',
    },
  ];

  const currentScenario = scenarios[activeScenario];

  // Animate match score pulse slightly on scenario change
  useEffect(() => {
    setSimulatedMatchProgress(Math.floor(currentScenario.matchPercent));
  }, [activeScenario, currentScenario.matchPercent]);

  const liveFeeds = [
    { text: 'Ahmad baru saja mengklaim dompet di Pos Satpam Gerbang Utama', time: '1m lalu', type: 'klaim' },
    { text: 'Kunci motor Honda diamankan di Pos Jaga Barat oleh Pak Suyanto', time: '3m lalu', type: 'temuan' },
    { text: 'Siti memverifikasi kepemilikan kalkulator ilmiah di Lab Fisika Lt 2', time: '7m lalu', type: 'klaim' },
    { text: 'Kartu Pelajar SMA atas nama Rendy ditemukan di Koridor Kantin', time: '11m lalu', type: 'temuan' },
    { text: 'Laptop Asus ROG terselamatkan dengan enkripsi ciri rahasia SHA-256', time: '18m lalu', type: 'vault' },
  ];

  const faqs = [
    {
      q: 'Apakah ada biaya tebusan atau pungutan biaya saat barang ditemukan?',
      a: 'Sama sekali tidak ada. MuaraKu beroperasi atas dasar prinsip ketulusan sipil dan integritas pelayanan sekolah/komunitas. Siapapun yang meminta biaya tebusan, biaya administrasi ilegal, atau transfer pulsa dapat langsung dilaporkan dan akunnya akan diblokir permanen serta diteruskan ke dewan etik.',
    },
    {
      q: 'Bagaimana cara memverifikasi pemilik sah tanpa membocorkan ciri rahasia?',
      a: 'Saat penemu mendaftarkan barang, sistem meminta penemu mencatat 1–2 detail spesifik yang dienkripsi secara aman (Zero-Knowledge Hash). Ketika seorang pencari ingin mengklaim, sistem akan menguji kecocokan jawaban tersebut secara privat tanpa pernah menampilkannya ke publik atau siapapun yang tidak berwenang.',
    },
    {
      q: 'Siapa saja mitra petugas lokasi terverifikasi di sekolah/kampus?',
      a: 'Mitra resmi kami mencakup petugas pengamanan satpam sekolah, staf tata usaha, petugas sirkulasi perpustakaan, koordinator laboratorium, serta pengelola pos stasiun dan halte transportasi publik mitra dengan tanda verifikasi resmi.',
    },
    {
      q: 'Apa yang harus saya lakukan jika menemukan barang berharga tinggi (laptop/uang/ponsel)?',
      a: 'Kami menyarankan Anda untuk tidak menyimpannya secara pribadi. Gunakan opsi "Titip ke Pos Petugas Mitra Terdekat" di MuaraKu. Bawa barang ke pos satpam gerbang sekolah atau ruang tata usaha, lakukan pencatatan bersama petugas, dan biarkan sistem mengeluarkan tanda terima digital ber-QR code.',
    },
    {
      q: 'Apakah saya bisa mengakses dan mencari barang tanpa membuat akun?',
      a: 'Tentu bisa. Feed penemuan dan fitur pencarian cerdas terbuka secara bebas untuk umum. Akun hanya diperlukan saat Anda mengajukan klaim verifikasi atau mempublikasikan laporan baru demi menjamin keamanan dan akuntabilitas komunitas.',
    },
  ];

  const securityPosts = [
    { name: 'Pos Gerbang Utama', status: 'Siaga 24 Jam', officer: 'Bripka Bambang & Tim', items: '18 Barang Aktif', icon: 'security' },
    { name: 'Ruang Tata Usaha (TU)', status: 'Jam Kerja (07:00 - 16:00)', officer: 'Ibu Ratna & Staf', items: '7 Dokumen/Kartu', icon: 'domain' },
    { name: 'Sirkulasi Perpustakaan', status: 'Aktif Hari Sekolah', officer: 'Pustakawan Piket', items: '12 Buku & Alat Tulis', icon: 'local_library' },
    { name: 'Pos Jaga Parkir Barat', status: 'Siaga Pagi - Sore', officer: 'Pak Suyanto', items: '5 Kunci Kendaraan', icon: 'local_parking' },
  ];

  return (
    <div className="min-h-screen text-on-surface dark:text-surface-white flex flex-col relative selection:bg-orange-500/20 selection:text-orange-950 font-sans">
      {/* Background Ambient Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-orange-400/15 via-amber-300/10 to-transparent blur-3xl rounded-full" />
        <div className="absolute top-[35%] -left-32 w-[600px] h-[600px] bg-orange-500/5 blur-[120px] rounded-full" />
        <div className="absolute top-[60%] -right-32 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full" />
      </div>

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 glass-header-premium transition-all border-b border-border-subtle/80 dark:border-white/10 backdrop-blur-xl">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo Lockup */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-400 flex items-center justify-center text-white shadow-md shadow-orange-500/25 ring-1 ring-white/20">
              <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M7 19C5.34315 19 4 20.3431 4 22C4 23.6569 5.34315 25 7 25C8.65685 25 10 23.6569 10 22L12.5 13.5L16 20.5L19.5 13.5L22 22C22 23.6569 23.3431 25 25 25C26.6569 25 28 23.6569 28 22C28 20.3431 26.6569 19 25 19"
                  stroke="white"
                  strokeWidth="2.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="16" cy="7.5" r="3" stroke="white" strokeWidth="2.5" />
                <path
                  d="M13.5 13C14.2 11.8 15 11 16 11C17 11 17.8 11.8 18.5 13"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-headline-sm text-base font-extrabold tracking-tight text-on-surface dark:text-surface-white">
                  MuaraKu
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                  v2.6
                </span>
              </div>
              <span className="text-[11px] text-muted-text -mt-1 hidden sm:block tracking-wide">
                Sistem Temu Kembali Sekolah & Sipil
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            <a href="#simulator" className="text-sm font-semibold text-secondary-ink dark:text-muted-text hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
              AI Match Engine
            </a>
            <a href="#about" className="text-sm font-medium text-secondary-ink dark:text-muted-text hover:text-on-surface dark:hover:text-surface-white transition-colors">
              Arsitektur Dua Sisi
            </a>
            <a href="#bento" className="text-sm font-medium text-secondary-ink dark:text-muted-text hover:text-on-surface dark:hover:text-surface-white transition-colors">
              Fitur Platform
            </a>
            <a href="#cara-kerja" className="text-sm font-medium text-secondary-ink dark:text-muted-text hover:text-on-surface dark:hover:text-surface-white transition-colors">
              Alur Kerja
            </a>
            <a href="#faq" className="text-sm font-medium text-secondary-ink dark:text-muted-text hover:text-on-surface dark:hover:text-surface-white transition-colors">
              Bantuan
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => onNavigate('discover')}
              className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl border border-border-subtle/80 dark:border-white/10 glass-surface text-secondary-ink dark:text-muted-text text-xs font-semibold hover:text-on-surface dark:hover:text-surface-white active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[17px]">explore</span>
              <span className="hidden sm:inline">Jelajahi Feed</span>
            </button>

            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => onNavigate('login')}
                  className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl text-secondary-ink dark:text-muted-text hover:text-on-surface dark:hover:text-surface-white text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                >
                  Masuk
                </button>
                <button
                  onClick={() => onNavigate('signup')}
                  className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl border border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 text-xs font-bold active:scale-[0.98] transition-all cursor-pointer hidden md:flex items-center gap-1"
                >
                  Daftar
                </button>
              </>
            ) : null}

            <button
              onClick={onOpenReportModal}
              className="btn-premium h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl text-white text-xs font-bold shadow-md shadow-orange-500/25 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">add_circle</span>
              <span>+ Lapor Barang</span>
            </button>
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden z-10">
        {/* Floating Interactive Pill Badges around Hero */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 relative">
          {/* Ambient Badges Floating */}
          <div className="hidden xl:flex items-center justify-between max-w-6xl mx-auto absolute inset-x-0 top-12 pointer-events-none">
            <div className="pointer-events-auto transform -rotate-2 hover:rotate-0 transition-transform duration-300">
              <div className="glass-surface border border-emerald-500/30 dark:border-emerald-500/40 px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-2 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  Pos Keamanan Gerbang Utama • Siaga 24 Jam
                </span>
              </div>
            </div>

            <div className="pointer-events-auto transform rotate-2 hover:rotate-0 transition-transform duration-300">
              <div className="glass-surface border border-orange-500/30 dark:border-orange-500/40 px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-2 backdrop-blur-md">
                <span className="material-symbols-outlined text-[15px] text-orange-500">psychology</span>
                <span className="text-[11px] font-bold text-orange-700 dark:text-orange-400">
                  AI Match Engine 2.6 • 98.4% Akurasi
                </span>
              </div>
            </div>
          </div>

          <div className="text-center max-w-4xl mx-auto mb-14 relative z-10">
            {/* Top Micro-Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-surface border border-orange-500/30 text-on-surface dark:text-surface-white text-xs font-semibold mb-6 shadow-sm">
              <span className="px-1.5 py-0.5 rounded-md bg-orange-500 text-white font-mono text-[10px] font-bold tracking-wider uppercase">
                Zero Ransom
              </span>
              <span className="text-secondary-ink dark:text-muted-text">
                Jaringan Temu Kembali Terverifikasi Civitas Sekolah & Ruang Publik
              </span>
              <span className="material-symbols-outlined text-[15px] text-orange-500">verified_user</span>
            </div>

            {/* Editorial Title */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.08] text-on-surface dark:text-surface-white">
              Barang Hilang atau Ditemukan? <br />
              <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent">
                MuaraKu Titik Temunya.
              </span>
            </h1>

            <p className="text-base sm:text-xl text-secondary-ink dark:text-muted-text mb-8 leading-relaxed max-w-2xl mx-auto font-normal">
              Platform modern lingkungan sekolah dan komunitas sipil. Laporkan kehilangan, pencocokan instan bertenaga AI, dan serah terima aman melalui jaringan Pos Satpam tanpa risiko penipuan.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
              <button
                onClick={() => onNavigate('discover')}
                className="btn-premium w-full sm:w-auto h-13 px-8 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2.5 cursor-pointer shadow-premium hover:shadow-premium-hover active:scale-[0.98] transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">search</span>
                <span>Cari Barang Sekarang</span>
              </button>

              <button
                onClick={onOpenReportModal}
                className="w-full sm:w-auto h-13 px-7 rounded-2xl glass-surface border border-border-subtle/80 dark:border-white/15 text-on-surface dark:text-surface-white font-bold text-sm flex items-center justify-center gap-2 hover:border-orange-500/40 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[20px] text-orange-500">add_box</span>
                <span>Laporkan Barang (Hilang / Temu)</span>
              </button>

              <a
                href="#cara-kerja"
                className="w-full sm:w-auto h-13 px-5 rounded-2xl text-secondary-ink dark:text-muted-text hover:text-on-surface dark:hover:text-surface-white font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
              >
                <span>Pelajari Prosedur</span>
                <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
              </a>
            </div>

            {/* Sub-hero trust pills */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-secondary-ink dark:text-muted-text">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-emerald-500">lock</span>
                <span>Enkripsi SHA-256 Vault</span>
              </div>
              <span className="text-border-subtle">•</span>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-orange-500">military_tech</span>
                <span>Bebas Biaya Tebusan Sipil</span>
              </div>
              <span className="text-border-subtle">•</span>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-amber-500">verified</span>
                <span>Petugas Pos Resmi Terakreditasi</span>
              </div>
            </div>
          </div>

          {/* ================= LIVE AI MATCHING INTERACTIVE RADAR & SHOWCASE ================= */}
          <div id="simulator" className="card-premium rounded-3xl p-5 sm:p-8 max-w-5xl mx-auto shadow-2xl border border-border-subtle/80 dark:border-white/10 relative overflow-hidden backdrop-blur-2xl">
            {/* Top Bar with Simulator Navigation */}
            <div className="flex flex-wrap items-center justify-between pb-5 border-b border-border-subtle/70 dark:border-white/10 gap-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                </div>
                <span className="font-mono text-xs text-muted-text ml-2 hidden sm:inline">
                  muaraku.id/ai-engine-radar
                </span>
              </div>

              {/* Interactive Tabs */}
              <div className="flex items-center p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-border-subtle/60 dark:border-white/10">
                <button
                  onClick={() => setActiveTab('matching')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'matching'
                      ? 'bg-white dark:bg-zinc-800 text-orange-600 dark:text-orange-400 shadow-sm'
                      : 'text-secondary-ink dark:text-muted-text hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">sync_alt</span>
                  <span>Pencocokan Otomatis</span>
                </button>
                <button
                  onClick={() => setActiveTab('radar')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'radar'
                      ? 'bg-white dark:bg-zinc-800 text-orange-600 dark:text-orange-400 shadow-sm'
                      : 'text-secondary-ink dark:text-muted-text hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">radar</span>
                  <span>Radar Pos Satpam</span>
                </button>
                <button
                  onClick={() => setActiveTab('vault')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'vault'
                      ? 'bg-white dark:bg-zinc-800 text-orange-600 dark:text-orange-400 shadow-sm'
                      : 'text-secondary-ink dark:text-muted-text hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">vpn_key</span>
                  <span>Verifikasi Ciri Rahasia</span>
                </button>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[11px] font-mono">Engine Active</span>
              </div>
            </div>

            {/* TAB CONTENT 1: AI MATCHING SHOWCASE */}
            {activeTab === 'matching' && (
              <div className="mt-6">
                {/* Scenario Selector Pills */}
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 text-xs">
                  <span className="text-muted-text font-semibold mr-1">Simulasi Kasus:</span>
                  {scenarios.map((sc, idx) => (
                    <button
                      key={sc.id}
                      onClick={() => setActiveScenario(idx)}
                      className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        activeScenario === idx
                          ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                          : 'bg-warm-canvas dark:bg-zinc-900 border border-border-subtle/80 dark:border-white/10 text-secondary-ink dark:text-muted-text hover:border-orange-500/30'
                      }`}
                    >
                      {sc.title}
                    </button>
                  ))}
                </div>

                {/* Cards Comparison Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                  {/* Seeker Card */}
                  <div className="lg:col-span-5 rounded-2xl p-5 border border-red-500/20 bg-red-500/[0.02] dark:bg-red-500/[0.04] shadow-sm relative group hover:border-red-500/40 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 text-[11px] font-bold">
                          {currentScenario.seeker.id}
                        </span>
                        <span className="text-[11px] font-medium text-red-600/80 dark:text-red-400/80">Laporan Kehilangan</span>
                      </div>
                      <span className="text-[11px] text-muted-text font-mono">{currentScenario.seeker.time}</span>
                    </div>

                    <h3 className="text-base font-bold text-on-surface dark:text-surface-white mb-2">
                      {currentScenario.seeker.title}
                    </h3>
                    <p className="text-xs text-secondary-ink dark:text-muted-text mb-4 leading-relaxed italic bg-white/40 dark:bg-zinc-900/40 p-2.5 rounded-xl border border-border-subtle/40 dark:border-white/5">
                      {currentScenario.seeker.desc}
                    </p>

                    <div className="space-y-2 border-t border-border-subtle/60 dark:border-white/10 pt-3 text-xs">
                      <div className="flex items-center gap-1.5 text-secondary-ink dark:text-muted-text">
                        <span className="material-symbols-outlined text-[16px] text-orange-500">near_me</span>
                        <span>{currentScenario.seeker.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 bg-red-500/5 px-2.5 py-1.5 rounded-lg border border-red-500/15">
                        <span className="material-symbols-outlined text-[16px]">fingerprint</span>
                        <span className="text-[11px] font-medium truncate">{currentScenario.seeker.secretNote}</span>
                      </div>
                    </div>
                  </div>

                  {/* Center Match Pulse Gauge */}
                  <div className="lg:col-span-2 flex flex-col items-center justify-center py-4">
                    <div className="relative group">
                      <div className="absolute inset-0 rounded-full bg-orange-500/25 animate-ping"></div>
                      <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-400 text-white flex flex-col items-center justify-center shadow-lg shadow-orange-500/35 border-2 border-white/30">
                        <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
                      </div>
                    </div>

                    <div className="mt-3 text-center">
                      <span className="text-base font-black text-orange-600 dark:text-orange-400 font-mono">
                        {simulatedMatchProgress}% Match
                      </span>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider block mt-0.5">
                        Terkonfirmasi AI
                      </p>
                    </div>

                    {/* Progress micro-bar */}
                    <div className="w-20 bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${simulatedMatchProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Finder Card */}
                  <div className="lg:col-span-5 rounded-2xl p-5 border border-emerald-500/30 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.04] shadow-sm relative group hover:border-emerald-500/50 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
                          {currentScenario.finder.id}
                        </span>
                        <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Temuan di Pos</span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                        <span className="material-symbols-outlined text-[13px]">verified</span>
                        <span>Pos Satpam Terverifikasi</span>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-on-surface dark:text-surface-white mb-2">
                      {currentScenario.finder.title}
                    </h3>
                    <p className="text-xs text-secondary-ink dark:text-muted-text mb-4 leading-relaxed bg-white/40 dark:bg-zinc-900/40 p-2.5 rounded-xl border border-border-subtle/40 dark:border-white/5">
                      {currentScenario.finder.desc}
                    </p>

                    <div className="space-y-2 border-t border-border-subtle/60 dark:border-white/10 pt-3 text-xs">
                      <div className="flex items-center gap-1.5 text-secondary-ink dark:text-muted-text">
                        <span className="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-400">room</span>
                        <span>{currentScenario.finder.location}</span>
                      </div>
                      <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 bg-emerald-500/5 px-2.5 py-1.5 rounded-lg border border-emerald-500/15">
                        <span className="text-[11px] font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px]">badge</span>
                          <span>Petugas: {currentScenario.finder.officer}</span>
                        </span>
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-emerald-500/20 rounded">
                          {currentScenario.finder.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audit & NLP Breakdown Bar */}
                <div className="mt-5 p-3.5 rounded-xl bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-secondary-ink dark:text-muted-text">
                    <span className="material-symbols-outlined text-[18px] text-orange-500">rule</span>
                    <span>
                      <strong className="text-on-surface dark:text-surface-white font-semibold">AI Audit Log:</strong>{' '}
                      {currentScenario.auditNote}
                    </span>
                  </div>
                  <button
                    onClick={() => onNavigate('discover')}
                    className="self-start sm:self-auto text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <span>Buka Feed Lengkap</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: RADAR POS SATPAM */}
            {activeTab === 'radar' && (
              <div className="mt-6">
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-on-surface dark:text-surface-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-orange-500">local_police</span>
                    <span>Jaringan Posko Pengamanan Terpadu Lingkungan Sekolah</span>
                  </h4>
                  <p className="text-xs text-secondary-ink dark:text-muted-text mt-1">
                    Setiap barang temuan langsung dialihkan ke loket fisik terverifikasi. Tidak ada pertemuan pribadi atau transaksi jalanan yang tidak aman.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {securityPosts.map((post, i) => (
                    <div
                      key={i}
                      className="rounded-2xl p-4 border border-border-subtle/80 dark:border-white/10 bg-white/60 dark:bg-zinc-900/60 shadow-xs hover:border-orange-500/40 transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-3">
                        <span className="material-symbols-outlined text-[22px]">{post.icon}</span>
                      </div>
                      <h5 className="font-bold text-sm text-on-surface dark:text-surface-white mb-1">
                        {post.name}
                      </h5>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 mb-2">
                        {post.status}
                      </span>
                      <div className="space-y-1 text-[11px] text-secondary-ink dark:text-muted-text border-t border-border-subtle/50 dark:border-white/5 pt-2">
                        <p>PJ: {post.officer}</p>
                        <p className="font-semibold text-orange-600 dark:text-orange-400">{post.items}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: ZERO-KNOWLEDGE VAULT */}
            {activeTab === 'vault' && (
              <div className="mt-6">
                <div className="max-w-2xl mx-auto rounded-2xl p-6 border border-amber-500/30 bg-amber-500/5 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center mx-auto mb-4 shadow-md shadow-orange-500/25">
                    <span className="material-symbols-outlined text-[28px]">lock_reset</span>
                  </div>
                  <h4 className="text-base font-bold text-on-surface dark:text-surface-white mb-2">
                    Protokol Verifikasi Ciri Rahasia (Zero-Knowledge Claim)
                  </h4>
                  <p className="text-xs text-secondary-ink dark:text-muted-text leading-relaxed mb-6">
                    Hanya penemu dan sistem yang tahu pertanyaan uji validitas (misal: "Apa warna strap gantungan kunci?" atau "Berapa lembar uang tunai di saku belakang?"). Jawaban pemohon diuji secara instan tanpa pernah membocorkan data kepada publik.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                    <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-border-subtle/70 dark:border-white/10">
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold block mb-1">
                        01. ENKRIPSI SISTEM
                      </span>
                      <p className="text-xs font-semibold text-on-surface dark:text-surface-white">
                        Hash SHA-256 dibuat saat pendaftaran temuan
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-border-subtle/70 dark:border-white/10">
                      <span className="text-[10px] font-mono text-orange-600 dark:text-orange-400 font-bold block mb-1">
                        02. PERLINDUNGAN PEMILIK
                      </span>
                      <p className="text-xs font-semibold text-on-surface dark:text-surface-white">
                        Mencegah orang lain mengaku-ngaku barang Anda
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= COMMUNITY TICKER / MARQUEE BAR ================= */}
        <div className="mt-14 border-y border-border-subtle/80 dark:border-white/10 bg-warm-canvas/80 dark:bg-zinc-900/80 backdrop-blur-md py-3 overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 flex items-center gap-4">
            <div className="flex items-center gap-2 shrink-0 pr-4 border-r border-border-subtle/80 dark:border-white/10">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                Aktivitas Terkini
              </span>
            </div>

            <div className="flex-1 overflow-hidden relative">
              <div className="flex items-center gap-8 animate-marquee whitespace-nowrap text-xs text-secondary-ink dark:text-muted-text">
                {liveFeeds.map((feed, idx) => (
                  <div key={idx} className="inline-flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                    <span className="font-medium text-on-surface dark:text-surface-white">{feed.text}</span>
                    <span className="text-[10px] text-muted-text font-mono">({feed.time})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= METRICS & TRUST BAR ================= */}
      <section className="py-12 border-b border-border-subtle/70 dark:border-white/10 relative z-10 bg-surface-white/40 dark:bg-zinc-900/30">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-black text-on-surface dark:text-surface-white tracking-tight mb-1 font-mono">
                450<span className="text-orange-500">+</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-secondary-ink dark:text-muted-text">
                Barang Terdata & Terarsip
              </p>
              <span className="text-[10px] text-muted-text mt-0.5 block">Akumulasi civitas sekolah</span>
            </div>

            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight mb-1 font-mono">
                98.2<span className="text-emerald-500">%</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-secondary-ink dark:text-muted-text">
                Tingkat Kembali Sah
              </p>
              <span className="text-[10px] text-muted-text mt-0.5 block">Tervalidasi ciri rahasia</span>
            </div>

            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-black text-amber-500 tracking-tight mb-1 font-mono">
                4<span className="text-orange-500">+</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-secondary-ink dark:text-muted-text">
                Posko Pengamanan Siaga
              </p>
              <span className="text-[10px] text-muted-text mt-0.5 block">Pos satpam & ruang TU</span>
            </div>

            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-black text-orange-600 dark:text-orange-400 tracking-tight mb-1 font-mono">
                Rp 0
              </div>
              <p className="text-xs sm:text-sm font-semibold text-secondary-ink dark:text-muted-text">
                Biaya Tebusan (100% Gratis)
              </p>
              <span className="text-[10px] text-muted-text mt-0.5 block">Prinsip integritas sipil</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= DUA PILAR UTAMA ================= */}
      <section className="py-24 relative overflow-hidden z-10" id="about">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 relative">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest">
              Arsitektur Dua Sisi
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-on-surface dark:text-surface-white mt-2 mb-4 tracking-tight">
              Ekosistem Adil bagi Pencari dan Penemu
            </h2>
            <p className="text-sm sm:text-base text-secondary-ink dark:text-muted-text leading-relaxed">
              MuaraKu menghilangkan rasa cemas dari kedua belah pihak dengan alur validasi yang melindungi kerahasiaan identitas serta kepemilikan riil barang berharga.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Seeker Pillar */}
            <div className="card-premium rounded-3xl p-8 lg:p-10 border border-border-subtle/80 dark:border-white/10 hover:border-orange-500/40 transition-all duration-300 relative group flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-6 shadow-xs group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[30px]">search_hands</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-700 dark:text-orange-400 text-xs font-bold mb-3">
                  <span>Pilar 01</span>
                  <span>•</span>
                  <span>Sisi Pencari (Seeker)</span>
                </div>
                <h3 className="text-xl font-bold text-on-surface dark:text-surface-white mb-3 tracking-tight">
                  Laporkan Kehilangan, Cocokkan Otomatis dengan AI Matching Aman
                </h3>
                <p className="text-xs sm:text-sm text-secondary-ink dark:text-muted-text mb-6 leading-relaxed">
                  Tidak perlu lagi menyebar nomor HP pribadi atau identitas sensitif di grup WhatsApp publik. Cukup laporkan deskripsi umum dan simpan ciri rahasia di brankas digital.
                </p>
                <ul className="space-y-3 text-xs sm:text-sm text-secondary-ink dark:text-muted-text mb-6">
                  <li className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-orange-500 text-[18px] shrink-0 mt-0.5">check_circle</span>
                    <span>Notifikasi instan saat ada barang sejenis terdaftar di posko terdekat.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-orange-500 text-[18px] shrink-0 mt-0.5">check_circle</span>
                    <span>Bebas dari pesan spam penipuan bermodus uang tebusan palsu atau pulsa.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-orange-500 text-[18px] shrink-0 mt-0.5">check_circle</span>
                    <span>Pengambilan barang langsung di pos satpam dengan bukti tanda terima resmi.</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onNavigate('seeker')}
                className="w-full h-11 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-orange-500/20"
              >
                <span>Lihat Alur Pencari</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            {/* Finder Pillar */}
            <div className="card-premium rounded-3xl p-8 lg:p-10 border border-border-subtle/80 dark:border-white/10 hover:border-emerald-500/40 transition-all duration-300 relative group flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 shadow-xs group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[30px]">inventory_2</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-3">
                  <span>Pilar 02</span>
                  <span>•</span>
                  <span>Sisi Penemu (Finder)</span>
                </div>
                <h3 className="text-xl font-bold text-on-surface dark:text-surface-white mb-3 tracking-tight">
                  Amankan Barang Temuan, Validasi Bukti, Titip ke Pos Resmi
                </h3>
                <p className="text-xs sm:text-sm text-secondary-ink dark:text-muted-text mb-6 leading-relaxed">
                  Niat baik Anda dijamin aman secara legalitas. Cukup bawa barang ke pos satpam atau loket tata usaha terdekat tanpa repot menyimpan sendiri di rumah.
                </p>
                <ul className="space-y-3 text-xs sm:text-sm text-secondary-ink dark:text-muted-text mb-6">
                  <li className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-emerald-500 text-[18px] shrink-0 mt-0.5">check_circle</span>
                    <span>Verifikasi kepemilikan otomatis: hanya pemilik asli yang dapat menjawab kuis rahasia.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-emerald-500 text-[18px] shrink-0 mt-0.5">check_circle</span>
                    <span>Drop-point resmi pos satpam dan perpustakaan menjaga keamanan Anda.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-emerald-500 text-[18px] shrink-0 mt-0.5">check_circle</span>
                    <span>Raih Civic Karma Score sebagai apresiasi integritas kejujuran komunitas.</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onNavigate('finder')}
                className="w-full h-11 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-emerald-500/20"
              >
                <span>Lihat Alur Penemu</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3-STEP PROCESS SECTION ================= */}
      <section className="py-24 bg-surface-white/60 dark:bg-zinc-900/40 relative z-10 border-y border-border-subtle/70 dark:border-white/10" id="cara-kerja">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest">
              Metode MuaraKu
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-on-surface dark:text-surface-white mt-2 mb-4 tracking-tight">
              3 Langkah Temu Kembali yang Bersih & Transparan
            </h2>
            <p className="text-sm sm:text-base text-secondary-ink dark:text-muted-text leading-relaxed">
              Didesain khusus untuk menggantikan keruwetan pengumuman manual yang rentan manipulasi dan pemalsuan kepemilikan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto relative">
            {/* Step 1 */}
            <div className="card-premium rounded-3xl p-7 border border-border-subtle/80 dark:border-white/10 relative group hover:border-orange-500/40 transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-extrabold flex items-center justify-center text-lg shadow-md shadow-orange-500/25">
                  01
                </div>
                <span className="text-[11px] font-mono font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded">
                  Input Cepat
                </span>
              </div>
              <h3 className="text-lg font-bold text-on-surface dark:text-surface-white mb-2 tracking-tight">
                Lapor dengan Bahasa Sehari-hari (N2L Engine)
              </h3>
              <p className="text-xs sm:text-sm text-secondary-ink dark:text-muted-text leading-relaxed mb-4">
                Tulis kronologi seperti bercerita biasa: <em>"Tempat pensil tertinggal di lab komputer lt 3 setelah jam praktek"</em>. Sistem otomatis mengekstrak waktu, lokasi, dan objek.
              </p>
              <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border-subtle/50 dark:border-white/5 text-[11px] font-mono text-secondary-ink dark:text-muted-text">
                <span className="text-orange-500">▶ NLP Parser:</span> [Objek: Alat Tulis] • [Lokasi: Lab Komputer]
              </div>
            </div>

            {/* Step 2 */}
            <div className="card-premium rounded-3xl p-7 border border-border-subtle/80 dark:border-white/10 relative group hover:border-orange-500/40 transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-extrabold flex items-center justify-center text-lg shadow-md shadow-orange-500/25">
                  02
                </div>
                <span className="text-[11px] font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                  Enkripsi Vault
                </span>
              </div>
              <h3 className="text-lg font-bold text-on-surface dark:text-surface-white mb-2 tracking-tight">
                Verifikasi Kepemilikan Privat (Zero-Knowledge)
              </h3>
              <p className="text-xs sm:text-sm text-secondary-ink dark:text-muted-text leading-relaxed mb-4">
                Ciri rahasia tidak pernah diumbar ke publik. Hanya pemilik sah yang dapat menjawab kuis detail spesifik yang telah dienkripsi sistem saat barang didaftarkan.
              </p>
              <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border-subtle/50 dark:border-white/5 text-[11px] font-mono text-secondary-ink dark:text-muted-text">
                <span className="text-amber-500">▶ Security:</span> SHA-256 Hash Matching (Zero Leak)
              </div>
            </div>

            {/* Step 3 */}
            <div className="card-premium rounded-3xl p-7 border border-border-subtle/80 dark:border-white/10 relative group hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-500 text-white font-extrabold flex items-center justify-center text-lg shadow-md shadow-emerald-500/25">
                  03
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Serah Terima
                </span>
              </div>
              <h3 className="text-lg font-bold text-on-surface dark:text-surface-white mb-2 tracking-tight">
                Serah Terima Aman di Pos Petugas Terverifikasi
              </h3>
              <p className="text-xs sm:text-sm text-secondary-ink dark:text-muted-text leading-relaxed mb-4">
                Tidak ada pertemuan di tempat sepi atau transaksi berisiko. Penyerahan fisik dilakukan langsung di Pos Satpam Sekolah dengan berita acara resmi ber-QR code.
              </p>
              <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border-subtle/50 dark:border-white/5 text-[11px] font-mono text-secondary-ink dark:text-muted-text">
                <span className="text-emerald-500">▶ Handover:</span> Tanda Terima Digital QR Code Terbit
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BENTO GRID FEATURE SHOWCASE ================= */}
      <section className="py-24 relative z-10" id="bento">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest">
              Teknologi & Standar Keamanan
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-on-surface dark:text-surface-white mt-2 mb-4 tracking-tight">
              Inovasi Platform Temu Kembali Generasi Baru
            </h2>
            <p className="text-sm sm:text-base text-secondary-ink dark:text-muted-text leading-relaxed">
              Ditenagai arsitektur modern untuk menjamin privasi, akurasi data, dan ketenangan seluruh warga sekolah.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-5xl mx-auto">
            {/* Bento Card 1: Zero-Knowledge Vault (7 cols) */}
            <div className="md:col-span-7 card-premium rounded-3xl p-7 lg:p-8 border border-border-subtle/80 dark:border-white/10 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-[28px]">shield</span>
              </div>
              <span className="text-xs font-mono font-bold text-orange-500 uppercase tracking-wider block mb-1">
                Kerahasiaan Tertinggi
              </span>
              <h3 className="text-xl font-bold text-on-surface dark:text-surface-white mb-2">
                Zero-Knowledge Secret Feature Vault
              </h3>
              <p className="text-xs sm:text-sm text-secondary-ink dark:text-muted-text leading-relaxed mb-6">
                Data spesifik barang (nomor seri tersembunyi, tulisan memo, atau isi kompartemen rahasia) disimpan dalam bentuk hash terenkripsi. Publik hanya melihat siluet dan kategori umum.
              </p>
              <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-border-subtle/60 dark:border-white/10 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] text-muted-text">
                  <span>Enkripsi Hash:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">SHA-256 Verified</span>
                </div>
                <div className="bg-white/80 dark:bg-zinc-900/80 p-2 rounded-lg border border-border-subtle/40 dark:border-white/5 text-[11px] text-secondary-ink dark:text-muted-text truncate">
                  e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                </div>
              </div>
            </div>

            {/* Bento Card 2: Live Pos Satpam Security Network (5 cols) */}
            <div className="md:col-span-5 card-premium rounded-3xl p-7 lg:p-8 border border-border-subtle/80 dark:border-white/10 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-[28px]">local_police</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-wider block mb-1">
                Jaringan Fisik Siaga
              </span>
              <h3 className="text-xl font-bold text-on-surface dark:text-surface-white mb-2">
                Jaringan Pos Satpam Terintegrasi
              </h3>
              <p className="text-xs sm:text-sm text-secondary-ink dark:text-muted-text leading-relaxed mb-6">
                Penyerahan fisik terhubung langsung dengan petugas keamanan gerbang, pos piket guru, dan loket tata usaha resmi.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-xs">
                  <span className="font-semibold text-on-surface dark:text-surface-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-emerald-500">check_circle</span>
                    Pos Gerbang Utama
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">Standby</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-xs">
                  <span className="font-semibold text-on-surface dark:text-surface-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-emerald-500">check_circle</span>
                    Ruang Tata Usaha
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">Standby</span>
                </div>
              </div>
            </div>

            {/* Bento Card 3: Civic Karma Honesty Score (5 cols) */}
            <div className="md:col-span-5 card-premium rounded-3xl p-7 lg:p-8 border border-border-subtle/80 dark:border-white/10 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-[28px]">military_tech</span>
              </div>
              <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider block mb-1">
                Kultur Kejujuran
              </span>
              <h3 className="text-xl font-bold text-on-surface dark:text-surface-white mb-2">
                Civic Karma Honesty Score
              </h3>
              <p className="text-xs sm:text-sm text-secondary-ink dark:text-muted-text leading-relaxed mb-6">
                Setiap tindakan mengembalikan barang mencatatkan poin reputasi sipil transparan tanpa pamrih komersial.
              </p>
              <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-border-subtle/60 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white text-xs font-black">
                    ⭐
                  </div>
                  <div>
                    <span className="text-xs font-bold text-on-surface dark:text-surface-white block">Warga Berintegritas</span>
                    <span className="text-[10px] text-muted-text">Level 4 • 980 Poin Kejujuran</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400">
                  Lencana Emas
                </span>
              </div>
            </div>

            {/* Bento Card 4: Natural Language Search Engine (7 cols) */}
            <div className="md:col-span-7 card-premium rounded-3xl p-7 lg:p-8 border border-border-subtle/80 dark:border-white/10 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-[28px]">manage_search</span>
              </div>
              <span className="text-xs font-mono font-bold text-orange-500 uppercase tracking-wider block mb-1">
                Pencarian Semantik Cerdas
              </span>
              <h3 className="text-xl font-bold text-on-surface dark:text-surface-white mb-2">
                Natural Language Search Engine (N2L)
              </h3>
              <p className="text-xs sm:text-sm text-secondary-ink dark:text-muted-text leading-relaxed mb-6">
                Cari menggunakan percakapan natural tanpa harus mencocokkan kata kunci kaku. Mesin menguraikan konteks waktu, warna, tempat, dan tipe objek secara adaptif.
              </p>
              <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-border-subtle/60 dark:border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-xs text-secondary-ink dark:text-muted-text">
                  <span className="material-symbols-outlined text-[16px] text-orange-500">search</span>
                  <span className="italic">"Kunci motor Vario hilang pas apel pagi di lapangan upacara"</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-mono font-bold">
                    [Entitas: Kunci Motor]
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-mono font-bold">
                    [Waktu: Pagi / Apel]
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold">
                    [Lokasi: Lapangan Upacara]
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FAQ ACCORDION ================= */}
      <section className="py-24 bg-surface-white/60 dark:bg-zinc-900/40 relative z-10 border-t border-border-subtle/70 dark:border-white/10" id="faq">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest">
              Tanya Jawab
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-on-surface dark:text-surface-white mt-2 mb-4 tracking-tight">
              Pertanyaan Umum Seputar MuaraKu
            </h2>
            <p className="text-sm sm:text-base text-secondary-ink dark:text-muted-text leading-relaxed">
              Transparansi prosedur untuk menjamin setiap proses temu kembali berjalan dengan rasa aman dan akuntabel.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3.5">
            {faqs.map((faq, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <div
                  key={i}
                  className={`card-premium rounded-2xl overflow-hidden border transition-all duration-200 ${
                    isOpen
                      ? 'border-orange-500/40 shadow-sm'
                      : 'border-border-subtle/80 dark:border-white/10 hover:border-orange-500/20'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                    className="w-full px-6 py-4.5 text-left flex items-center justify-between text-sm font-semibold text-on-surface dark:text-surface-white cursor-pointer group"
                  >
                    <span className="pr-4 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-relaxed">
                      {faq.q}
                    </span>
                    <span
                      className={`material-symbols-outlined text-[22px] text-muted-text transition-transform duration-300 shrink-0 ${
                        isOpen ? 'rotate-180 text-orange-500' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-xs sm:text-sm text-secondary-ink dark:text-muted-text border-t border-border-subtle/60 dark:border-white/10 pt-3.5 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= DRAMATIC CALL TO ACTION (CTA) ================= */}
      <section className="py-24 relative overflow-hidden z-10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="relative card-premium rounded-3xl p-8 sm:p-14 lg:p-16 text-center max-w-4xl mx-auto shadow-2xl border border-orange-500/30 dark:border-orange-500/40 overflow-hidden bg-gradient-to-b from-orange-500/[0.05] via-amber-500/[0.03] to-transparent">
            {/* Deep Ambient Radial Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-radial from-orange-500/20 via-amber-400/10 to-transparent blur-3xl pointer-events-none" />

            {/* Top Floating Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-700 dark:text-orange-400 text-xs font-bold mb-6">
              <span className="material-symbols-outlined text-[16px]">celebration</span>
              <span>Mulai Wujudkan Lingkungan Bebas Khawatir</span>
            </div>

            <h2 className="relative z-10 text-3xl sm:text-5xl font-black text-on-surface dark:text-surface-white mb-4 tracking-tight leading-tight">
              Bantu Komunitasmu Menemukan Kembali Yang Berharga.
            </h2>
            <p className="relative z-10 text-sm sm:text-base text-secondary-ink dark:text-muted-text max-w-xl mx-auto mb-8 leading-relaxed">
              Bergabung bersama ribuan siswa, guru, petugas satpam, dan staf sekolah. Menghadirkan kembali rasa aman, kepedulian, dan kejujuran di lingkungan kita.
            </p>

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onNavigate('signup')}
                className="btn-premium w-full sm:w-auto h-12 px-8 rounded-xl text-white font-bold text-sm shadow-premium hover:shadow-premium-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">person_add</span>
                <span>Daftar Akun Warga Sekolah</span>
              </button>
              <button
                onClick={() => onNavigate('discover')}
                className="w-full sm:w-auto h-12 px-6 rounded-xl glass-surface border border-border-subtle/80 dark:border-white/10 text-secondary-ink dark:text-muted-text hover:text-on-surface dark:hover:text-surface-white font-semibold text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">explore</span>
                <span>Eksplorasi Feed Barang</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MODERN FOOTER ================= */}
      <footer className="glass-header-premium border-t border-border-subtle/80 dark:border-white/10 pt-16 pb-12 relative z-10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-border-subtle/60 dark:border-white/10">
            {/* Col 1: Brand Info */}
            <div className="md:col-span-2 space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                  <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M7 19C5.34315 19 4 20.3431 4 22C4 23.6569 5.34315 25 7 25C8.65685 25 10 23.6569 10 22L12.5 13.5L16 20.5L19.5 13.5L22 22C22 23.6569 23.3431 25 25 25C26.6569 25 28 23.6569 28 22C28 20.3431 26.6569 19 25 19"
                      stroke="white"
                      strokeWidth="2.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-base text-on-surface dark:text-surface-white">
                    MuaraKu.id
                  </span>
                  <span className="text-[11px] text-muted-text -mt-0.5">Sistem Temu Kembali Sekolah & Komunitas</span>
                </div>
              </div>
              <p className="text-xs text-secondary-ink dark:text-muted-text max-w-sm leading-relaxed">
                Ekosistem temu kembali sipil berbasis kejujuran dan verifikasi terenkripsi untuk lingkungan sekolah, kampus, dan fasilitas umum di Indonesia.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Semua Sistem Operasional • Standar Sipil 2026</span>
              </div>
            </div>

            {/* Col 2: Navigasi Cepat */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-on-surface dark:text-surface-white uppercase tracking-wider">
                Navigasi Cepat
              </span>
              <ul className="space-y-2.5 text-xs text-secondary-ink dark:text-muted-text">
                <li><button onClick={() => onNavigate('discover')} className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer">Feed Barang Temuan</button></li>
                <li><button onClick={() => onNavigate('seeker')} className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer">Alur Pencari (Seeker)</button></li>
                <li><button onClick={() => onNavigate('finder')} className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer">Alur Penemu (Finder)</button></li>
                <li><button onClick={() => onNavigate('search')} className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer">Pencarian Cerdas N2L</button></li>
              </ul>
            </div>

            {/* Col 3: Akses Warga */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-on-surface dark:text-surface-white uppercase tracking-wider">
                Akses Warga
              </span>
              <ul className="space-y-2.5 text-xs text-secondary-ink dark:text-muted-text">
                <li><button onClick={() => onNavigate('login')} className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer">Masuk Akun</button></li>
                <li><button onClick={() => onNavigate('signup')} className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer">Daftar Akun Baru</button></li>
                <li><button onClick={() => onNavigate('forgot-password')} className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer">Pemulihan Sandi</button></li>
                <li><button onClick={() => onNavigate('support')} className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer">Pusat Bantuan & Regulasi</button></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-secondary-ink dark:text-muted-text">
            <span>© 2026 MuaraKu Lost & Found System. Hak Cipta Dilindungi Undang-Undang.</span>
            <div className="flex items-center gap-4">
              <span className="hover:underline cursor-pointer">Kebijakan Privasi</span>
              <span>•</span>
              <span className="hover:underline cursor-pointer">Ketentuan Layanan</span>
              <span>•</span>
              <span className="hover:underline cursor-pointer">Protokol Keamanan SHA-256</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
