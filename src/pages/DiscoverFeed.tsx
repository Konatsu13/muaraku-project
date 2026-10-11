import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/supabase';
import { Report, ItemCategory } from '../types';

interface DiscoverFeedProps {
  onSelectReport: (report: Report) => void;
  onOpenClaimModal: (report: Report) => void;
  onOpenReportModal: () => void;
}

const CATEGORIES: ('Semua' | ItemCategory)[] = [
  'Semua',
  'Dompet & Kartu',
  'Elektronik',
  'Kunci & Aksesori',
  'Buku & Dokumen',
  'Tas & Pakaian',
  'Lainnya',
];

export const DiscoverFeed: React.FC<DiscoverFeedProps> = ({
  onSelectReport,
  onOpenClaimModal,
  onOpenReportModal,
}) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'Semua' | ItemCategory>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFeed();
  }, [typeFilter, categoryFilter, searchQuery]);

  // Global hotkey listener for CMD+K / CTRL+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadFeed = async () => {
    setLoading(true);
    const data = await db.getReports({
      type: typeFilter,
      category: categoryFilter,
      query: searchQuery,
    });
    setReports(data);
    setLoading(false);
  };

  const samplePrompts = [
    'Kunci Motor Vario',
    'Dompet Kulit Cokelat',
    'Kartu Pelajar OSIS',
    'Headphone Wireless',
    'Botol Minum Corkcicle',
    'Kalkulator Casio',
  ];

  // Calculate live counts
  const foundCount = reports.filter((r) => r.report_type === 'found').length;
  const lostCount = reports.filter((r) => r.report_type === 'lost').length;
  const returnedCount = reports.filter((r) => r.status === 'Returned' || r.status === 'Closed').length;

  // Category counts map
  const getCategoryCount = (cat: 'Semua' | ItemCategory) => {
    if (cat === 'Semua') return reports.length;
    return reports.filter((r) => r.category === cat).length;
  };

  const hasActiveFilters = typeFilter !== 'all' || categoryFilter !== 'Semua' || searchQuery.trim() !== '';

  const handleResetFilters = () => {
    setTypeFilter('all');
    setCategoryFilter('Semua');
    setSearchQuery('');
  };

  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto space-y-8 sm:space-y-10">
      {/* ================= HERO SPOTLIGHT BANNER (Linear & Apple Design Language) ================= */}
      <section className="relative rounded-3xl glass-surface p-6 sm:p-10 md:p-12 border border-border-subtle/80 dark:border-white/10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.04)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.55)] inner-light bg-hero-glow-light dark:bg-hero-glow-dark">
        {/* Ambient Top Light Beam */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-2xl h-36 bg-gradient-to-b from-orange-500/20 via-amber-500/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -top-24 right-10 w-64 h-64 bg-amber-400/10 dark:bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-10 w-72 h-72 bg-emerald-500/10 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
          {/* Interactive Live Indicator Badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full glass-surface border border-orange-500/30 text-on-surface dark:text-surface-white text-xs font-semibold shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="tracking-wide">Jaringan Temu Kembali Sekolah Terverifikasi • Langsung Tanpa Login</span>
          </div>

          {/* Editorial Headline */}
          <h1 className="font-headline-xl text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-on-surface dark:text-surface-white leading-[1.12]">
            Temukan Kembali Barang Berhargamu{' '}
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent underline decoration-orange-400/30 decoration-wavy decoration-from-font underline-offset-8">
              di Sekolah.
            </span>
          </h1>

          <p className="font-body-md text-xs sm:text-sm md:text-base text-secondary-ink dark:text-muted-text max-w-2xl leading-relaxed">
            Platform sipil resmi pos satpam, tata usaha, perpustakaan, dan warga sekolah. Laporkan temuan atau cari barang hilang seketika dengan enkripsi ciri rahasia anti-klaim palsu.
          </p>

          {/* Linear-grade Command-Bar Spotlight Search Box */}
          <div className="w-full max-w-2xl pt-2">
            <div className="relative group rounded-2xl p-1 bg-gradient-to-b from-orange-500/20 via-border-subtle/40 dark:via-white/10 to-transparent transition-all focus-within:from-orange-500 focus-within:to-amber-500/30 shadow-[0_10px_35px_rgba(0,0,0,0.06)] dark:shadow-[0_16px_45px_rgba(0,0,0,0.7)]">
              <div className="relative glass-surface rounded-xl p-1.5 flex items-center gap-2.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl">
                <div className="flex items-center pl-3 text-muted-text group-focus-within:text-orange-500 transition-colors">
                  <span className="material-symbols-outlined text-[22px]">search</span>
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ketik apa saja: dompet, kunci, ransel, pos satpam, nama..."
                  className="w-full py-2.5 px-1 bg-transparent text-sm text-on-surface dark:text-surface-white placeholder:text-muted-text focus:outline-none"
                />

                {/* Hotkey Pill indicator */}
                <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-muted-text px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 shrink-0 pointer-events-none select-none">
                  <span>⌘</span>
                  <span>K</span>
                </div>

                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 rounded-lg text-muted-text hover:text-on-surface hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Hapus pencarian"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                )}

                <button
                  onClick={onOpenReportModal}
                  className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white text-xs font-bold shadow-md shadow-orange-500/25 shrink-0 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add_circle</span>
                  <span>+ Lapor</span>
                </button>
              </div>
            </div>

            {/* Suggestion Chips */}
            <div className="flex items-center justify-center gap-1.5 mt-3 flex-wrap">
              <span className="text-[11px] text-muted-text font-medium mr-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-orange-500">sparkles</span>
                Saran:
              </span>
              {samplePrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => setSearchQuery(p)}
                  className="px-2.5 py-1 rounded-lg glass-surface border border-border-subtle/60 dark:border-white/10 text-[11px] text-secondary-ink dark:text-muted-text hover:text-orange-500 hover:border-orange-500/40 hover:bg-orange-500/5 transition-all active:scale-95"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* ================= LIVE BENTO STAT COUNTERS ================= */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 w-full max-w-4xl pt-4">
            {/* Card 1: Found Items */}
            <div className="glass-surface p-4 sm:p-5 rounded-2xl border border-border-subtle/80 dark:border-white/10 text-left inner-light relative overflow-hidden group hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-secondary-ink dark:text-muted-text tracking-wide uppercase">
                  Ditemukan
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-extrabold text-2xl sm:text-3xl text-on-surface dark:text-surface-white font-headline-sm">
                  {foundCount}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  Siap Klaim
                </span>
              </div>
              <p className="text-[11px] text-muted-text mt-1 truncate">Tersimpan aman di posko</p>
            </div>

            {/* Card 2: Lost Items */}
            <div className="glass-surface p-4 sm:p-5 rounded-2xl border border-border-subtle/80 dark:border-white/10 text-left inner-light relative overflow-hidden group hover:border-blue-500/40 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-secondary-ink dark:text-muted-text tracking-wide uppercase">
                  Sedang Dicari
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[18px]">search</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-extrabold text-2xl sm:text-3xl text-on-surface dark:text-surface-white font-headline-sm">
                  {lostCount}
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-500/10 px-1.5 py-0.5 rounded">
                  Radar Aktif
                </span>
              </div>
              <p className="text-[11px] text-muted-text mt-1 truncate">Menunggu informasi temu</p>
            </div>

            {/* Card 3: Verification Accuracy */}
            <div className="glass-surface p-4 sm:p-5 rounded-2xl border border-border-subtle/80 dark:border-white/10 text-left inner-light relative overflow-hidden group hover:border-orange-500/40 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-secondary-ink dark:text-muted-text tracking-wide uppercase">
                  Akurasi AI & ZK
                </span>
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-extrabold text-2xl sm:text-3xl text-orange-600 dark:text-orange-400 font-headline-sm">
                  98.4%
                </span>
                <span className="text-[10px] text-orange-600 dark:text-orange-400 font-bold bg-orange-500/10 px-1.5 py-0.5 rounded">
                  Zero-Leak
                </span>
              </div>
              <p className="text-[11px] text-muted-text mt-1 truncate">Validasi ciri rahasia</p>
            </div>

            {/* Card 4: Official Security Posts */}
            <div className="glass-surface p-4 sm:p-5 rounded-2xl border border-border-subtle/80 dark:border-white/10 text-left inner-light relative overflow-hidden group hover:border-amber-500/40 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-secondary-ink dark:text-muted-text tracking-wide uppercase">
                  Posko Siaga
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[18px]">local_police</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-extrabold text-2xl sm:text-3xl text-amber-600 dark:text-amber-400 font-headline-sm">
                  4 Pos
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
                  24 Jam
                </span>
              </div>
              <p className="text-[11px] text-muted-text mt-1 truncate">Gerbang Utama, TU, Perpustakaan</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FILTER CONTROLS BAR ================= */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Segmented Type Toggle Pills */}
          <div className="flex items-center gap-1.5 p-1 glass-surface rounded-2xl border border-border-subtle/80 dark:border-white/10 inner-light overflow-x-auto no-scrollbar shadow-xs">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                typeFilter === 'all'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/25'
                  : 'text-secondary-ink dark:text-muted-text hover:text-on-surface dark:hover:text-surface-white'
              }`}
            >
              <span>Semua Laporan</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${typeFilter === 'all' ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/10 text-muted-text'}`}>
                {reports.length}
              </span>
            </button>

            <button
              onClick={() => setTypeFilter('found')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                typeFilter === 'found'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/25'
                  : 'text-secondary-ink dark:text-muted-text hover:text-on-surface dark:hover:text-surface-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Barang Ditemukan</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${typeFilter === 'found' ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/10 text-muted-text'}`}>
                {foundCount}
              </span>
            </button>

            <button
              onClick={() => setTypeFilter('lost')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                typeFilter === 'lost'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-600/25'
                  : 'text-secondary-ink dark:text-muted-text hover:text-on-surface dark:hover:text-surface-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>Barang Hilang</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${typeFilter === 'lost' ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/10 text-muted-text'}`}>
                {lostCount}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="px-3.5 py-2 rounded-xl glass-surface border border-border-subtle/80 dark:border-white/10 text-xs font-semibold text-secondary-ink dark:text-muted-text hover:text-orange-500 hover:border-orange-500/30 transition-all flex items-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                <span>Reset Filter</span>
              </button>
            )}

            {/* Mobile Lapor CTA */}
            <button
              onClick={onOpenReportModal}
              className="sm:hidden flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-md shadow-orange-500/25 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>+ Buat Laporan Barang</span>
            </button>
          </div>
        </div>

        {/* Categories Scrollable Pills with Count Badges */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-1">
          {CATEGORIES.map((cat) => {
            const count = getCategoryCount(cat);
            const isSelected = categoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/25'
                    : 'glass-surface border border-border-subtle/80 dark:border-white/10 text-secondary-ink dark:text-muted-text hover:text-on-surface dark:hover:text-surface-white'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/10 text-muted-text'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ================= REPORT CARDS GRID (Apple / Modern SaaS) ================= */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="glass-surface rounded-3xl border border-border-subtle/80 dark:border-white/10 p-4 animate-pulse space-y-4"
            >
              <div className="aspect-[16/10] bg-zinc-200/60 dark:bg-zinc-800/60 rounded-2xl"></div>
              <div className="h-4 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-lg w-3/4"></div>
              <div className="h-3 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-lg w-full"></div>
              <div className="h-3 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-lg w-1/2"></div>
              <div className="h-10 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="p-12 sm:p-16 text-center glass-surface rounded-3xl border border-border-subtle/80 dark:border-white/10 space-y-4 max-w-lg mx-auto shadow-sm inner-light">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto shadow-inner">
            <span className="material-symbols-outlined text-[32px]">
              {hasActiveFilters ? 'search_off' : 'inventory_2'}
            </span>
          </div>
          <h3 className="font-title-md text-lg font-bold text-on-surface dark:text-surface-white tracking-tight">
            {hasActiveFilters ? 'Tidak ada laporan yang sesuai' : 'Belum Ada Laporan Barang'}
          </h3>
          <p className="text-xs text-secondary-ink dark:text-muted-text leading-relaxed">
            {hasActiveFilters
              ? 'Barang yang Anda cari mungkin belum dilaporkan, atau kata kunci pencarian terlalu spesifik.'
              : 'Belum ada laporan barang yang tersimpan dalam sistem database. Jadilah yang pertama membuat laporan untuk membantu sesama warga sekolah!'}
          </p>
          <div className="pt-2 flex justify-center gap-2.5">
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl glass-surface border border-border-subtle text-secondary-ink dark:text-muted-text text-xs font-semibold hover:text-on-surface dark:hover:text-surface-white active:scale-[0.98] transition-all"
              >
                Reset Filter
              </button>
            )}
            <button
              onClick={onOpenReportModal}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-semibold shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>+ Buat Laporan Barang</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((item, index) => {
            const isReturned = item.status === 'Returned' || item.status === 'Closed';
            return (
              <article
                key={item.id}
                className={`group glass-surface rounded-3xl border overflow-hidden flex flex-col justify-between card-elevation inner-light transition-all ${
                  isReturned
                    ? 'border-emerald-500/40 bg-emerald-500/[0.02]'
                    : index === 0 && !hasActiveFilters
                    ? 'border-orange-500/50 shadow-[0_16px_40px_rgba(251,146,60,0.12)]'
                    : 'border-border-subtle/80 dark:border-white/10 hover:border-orange-500/40'
                }`}
              >
                <div>
                  {/* Visual Imagery Container with Overlaid Frosted Badges */}
                  <div
                    className="relative aspect-[16/10] bg-soft-surface dark:bg-dark-canvas overflow-hidden cursor-pointer"
                    onClick={() => onSelectReport(item)}
                  >
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />

                    {/* Gradient Overlay for Top Badges */}
                    <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none" />

                    {/* Floating Badges */}
                    <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap z-10">
                      <span
                        className={`px-3 py-1 rounded-xl text-white text-[11px] font-bold tracking-wide shadow-md flex items-center gap-1.5 backdrop-blur-md ${
                          item.report_type === 'found'
                            ? 'bg-gradient-to-r from-emerald-600/90 to-teal-600/90'
                            : 'bg-gradient-to-r from-blue-600/90 to-indigo-600/90'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        <span>{item.report_type === 'found' ? 'Ditemukan' : 'Kehilangan'}</span>
                      </span>

                      <span className="px-2.5 py-1 rounded-xl backdrop-blur-md bg-black/50 text-white text-[11px] font-medium border border-white/20">
                        {item.category}
                      </span>
                    </div>

                    {/* Returned Badge or Code */}
                    {isReturned ? (
                      <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg backdrop-blur-md bg-emerald-600/90 text-white font-bold text-[10px] border border-emerald-400/30 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">check_circle</span>
                        <span>TERKEMBALIKAN</span>
                      </span>
                    ) : (
                      <span className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-lg backdrop-blur-md bg-black/65 text-white font-mono text-[10px] border border-white/15">
                        {item.report_code}
                      </span>
                    )}
                  </div>

                  {/* Card Information Body */}
                  <div className="p-5 sm:p-6 space-y-3">
                    {/* Reporter & Verification Tag */}
                    <div className="flex items-center justify-between text-xs">
                      {item.reporter_is_staff ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-400/20">
                          <span
                            className="material-symbols-outlined text-[15px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            verified
                          </span>
                          <span>{item.reporter_staff_badge || 'Petugas Pos Terverifikasi'}</span>
                        </span>
                      ) : (
                        <span className="text-secondary-ink dark:text-muted-text flex items-center gap-1 font-medium">
                          <span className="material-symbols-outlined text-[15px]">person</span>
                          <span>{item.reporter_name}</span>
                        </span>
                      )}

                      <span className="text-[11px] text-muted-text font-mono">
                        {new Date(item.incident_time).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>

                    {/* Title */}
                    <h2
                      onClick={() => onSelectReport(item)}
                      className="font-title-md text-base sm:text-lg font-bold text-on-surface dark:text-surface-white line-clamp-1 group-hover:text-orange-500 cursor-pointer transition-colors tracking-tight"
                    >
                      {item.title}
                    </h2>

                    {/* Description */}
                    <p className="text-secondary-ink dark:text-muted-text text-xs line-clamp-2 leading-relaxed">
                      {item.public_description}
                    </p>

                    {/* Zero-Knowledge Privacy & Location Details */}
                    <div className="pt-3 border-t border-border-subtle/70 dark:border-white/10 space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5 text-secondary-ink dark:text-muted-text truncate">
                        <span className="material-symbols-outlined text-[16px] text-orange-500 shrink-0">
                          location_on
                        </span>
                        <span className="truncate font-medium">{item.facility_location}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        <span className="material-symbols-outlined text-[14px]">lock</span>
                        <span>Enkripsi Ciri Rahasia Aktif</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* High-Contrast Action Buttons */}
                <div className="p-5 sm:p-6 pt-0 flex gap-2">
                  {item.report_type === 'found' ? (
                    <button
                      onClick={() => onOpenClaimModal(item)}
                      disabled={isReturned}
                      className={`flex-1 h-10 rounded-xl text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                        isReturned
                          ? 'bg-zinc-400 dark:bg-zinc-700 cursor-not-allowed opacity-60'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 active:scale-[0.98] shadow-md shadow-emerald-600/20'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      <span>{isReturned ? 'Sudah Diambil' : 'Klaim Milik Saya'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onSelectReport(item)}
                      className="flex-1 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 active:scale-[0.98] text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20"
                    >
                      <span className="material-symbols-outlined text-[16px]">handshake</span>
                      <span>Bantu / Ada Info</span>
                    </button>
                  )}

                  <button
                    onClick={() => onSelectReport(item)}
                    className="h-10 px-3.5 rounded-xl glass-surface border border-border-subtle/80 dark:border-white/10 text-secondary-ink dark:text-muted-text hover:text-on-surface dark:hover:text-surface-white active:scale-[0.98] flex items-center justify-center transition-all shadow-xs"
                    title="Lihat Detail Lengkap"
                  >
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default DiscoverFeed;
