import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/supabase';
import { Report, ItemCategory } from '../types';

interface SearchPageProps {
  initialQuery?: string;
  onSelectReport: (report: Report) => void;
  onOpenClaimModal: (report: Report) => void;
}

const SAMPLE_PROMPTS = [
  'Dompet cokelat stasiun kemarin',
  'Kunci motor Beat parkiran barat',
  'Earphone TWS perpustakaan lantai 2',
  'Tumbler biru di kantin utama',
  'Kalkulator Casio lab komputer',
  'Kartu Pelajar OSIS ruang TU',
];

const CATEGORIES: ('Semua' | ItemCategory)[] = [
  'Semua',
  'Dompet & Kartu',
  'Elektronik',
  'Kunci & Aksesori',
  'Buku & Dokumen',
  'Tas & Pakaian',
  'Lainnya',
];

export const SearchPage: React.FC<SearchPageProps> = ({
  initialQuery = '',
  onSelectReport,
  onOpenClaimModal,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [reportType, setReportType] = useState<'all' | 'lost' | 'found'>('all');
  const [category, setCategory] = useState<'Semua' | ItemCategory>('Semua');
  const [selectedLocation, setSelectedLocation] = useState<string>('Semua Lokasi');
  const [results, setResults] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Shortcut listener CMD+K
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

  useEffect(() => {
    executeSearch();
  }, [query, reportType, category, selectedLocation]);

  const executeSearch = async () => {
    setLoading(true);
    const data = await db.getReports({
      query,
      type: reportType,
      category,
    });

    let filtered = data;
    if (selectedLocation !== 'Semua Lokasi') {
      filtered = data.filter((item) =>
        item.facility_location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    setResults(filtered);
    setLoading(false);
  };

  // Distinct locations for multi-facet filter
  const locations = [
    'Semua Lokasi',
    'Pos Satpam Gerbang Utama',
    'Perpustakaan',
    'Kantin',
    'Gedung Olahraga (GOR)',
    'Laboratorium Komputer',
    'Ruang Tata Usaha (TU)',
  ];

  const hasActiveFilters = query.trim() !== '' || reportType !== 'all' || category !== 'Semua' || selectedLocation !== 'Semua Lokasi';

  const handleResetFilters = () => {
    setQuery('');
    setReportType('all');
    setCategory('Semua');
    setSelectedLocation('Semua Lokasi');
  };

  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8">
      {/* ================= SPOTLIGHT COMMAND CENTER (Apple & Linear Aesthetic) ================= */}
      <section className="relative rounded-3xl glass-surface border border-border-subtle/80 dark:border-white/10 p-6 sm:p-10 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.04)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.55)] overflow-hidden space-y-7 inner-light bg-hero-glow-light dark:bg-hero-glow-dark">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-400/10 dark:bg-orange-500/12 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-600 dark:text-orange-400 text-xs font-semibold shadow-xs">
            <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
            <span>Natural Language Processing (N2L) Bahasa Indonesia Terintegrasi</span>
          </div>

          <h1 className="font-headline-xl text-2xl sm:text-4xl md:text-5xl font-extrabold text-on-surface dark:text-surface-white tracking-tight leading-[1.15]">
            Pencarian Cerdas Spotlight & NLP
          </h1>

          <p className="font-body-md text-xs sm:text-sm md:text-base text-secondary-ink dark:text-muted-text leading-relaxed">
            Ketikkan deskripsi dalam bahasa sehari-hari. Mesin pencarian kami mengekstraksi objek, ciri warna, lokasi pos, dan konteks waktu secara cerdas.
          </p>
        </div>

        {/* Large Spotlight Search Box with Hotkey Pill */}
        <div className="relative max-w-3xl group">
          <div className="relative rounded-2xl p-1 bg-gradient-to-b from-orange-500/20 via-border-subtle/40 dark:via-white/10 to-transparent transition-all focus-within:from-orange-500 focus-within:to-amber-500/40 shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_18px_50px_rgba(0,0,0,0.7)]">
            <div className="relative glass-surface rounded-xl p-2 flex items-center gap-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl">
              <span className="material-symbols-outlined text-muted-text group-focus-within:text-orange-500 text-[24px] pl-3 transition-colors">
                search
              </span>
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ketik apa yang Anda ingat (misal: 'dompet kulit cokelat stasiun kemarin')..."
                className="w-full h-11 bg-transparent text-on-surface dark:text-surface-white text-sm sm:text-base font-medium placeholder:text-muted-text focus:outline-none"
              />

              {/* Hotkey Hint Pill */}
              <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-muted-text px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 shrink-0 pointer-events-none select-none">
                <span>⌘</span>
                <span>K</span>
              </div>

              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1.5 rounded-lg text-muted-text hover:text-on-surface hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-all"
                  title="Hapus kueri"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="space-y-2.5 relative z-10">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-text">
            <span className="material-symbols-outlined text-[15px] text-orange-500">sparkles</span>
            <span>Contoh Pertanyaan Cepat NLP:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => setQuery(prompt)}
                className="px-3.5 py-1.5 rounded-full glass-surface hover:border-orange-500/40 hover:text-orange-500 border border-border-subtle/80 dark:border-white/10 text-xs text-secondary-ink dark:text-muted-text transition-all flex items-center gap-1.5 active:scale-95 shadow-xs bg-white/50 dark:bg-zinc-800/50"
              >
                <span className="material-symbols-outlined text-[13px] text-orange-500/70">history</span>
                <span>"{prompt}"</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ================= MULTI-FACET FILTER CONTROLS ================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-surface p-4 sm:p-5 rounded-3xl border border-border-subtle/80 dark:border-white/10 inner-light shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Type Segmented Pill Toggle */}
          <div className="flex items-center gap-1 p-1 glass-surface rounded-2xl border border-border-subtle/80 dark:border-white/10 shadow-xs">
            <button
              onClick={() => setReportType('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                reportType === 'all'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs'
                  : 'text-secondary-ink dark:text-muted-text hover:text-on-surface dark:hover:text-surface-white'
              }`}
            >
              Semua ({results.length})
            </button>
            <button
              onClick={() => setReportType('found')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                reportType === 'found'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                  : 'text-secondary-ink dark:text-muted-text hover:text-on-surface dark:hover:text-surface-white'
              }`}
            >
              Temuan
            </button>
            <button
              onClick={() => setReportType('lost')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                reportType === 'lost'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                  : 'text-secondary-ink dark:text-muted-text hover:text-on-surface dark:hover:text-surface-white'
              }`}
            >
              Kehilangan
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="appearance-none px-4 py-2 pr-9 rounded-2xl border border-border-subtle/80 dark:border-white/10 glass-surface text-xs font-semibold text-secondary-ink dark:text-surface-white focus:outline-none focus:border-orange-500 shadow-xs cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  Kategori: {cat}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-text text-[16px] pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Location Facet Dropdown */}
          <div className="relative">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="appearance-none px-4 py-2 pr-9 rounded-2xl border border-border-subtle/80 dark:border-white/10 glass-surface text-xs font-semibold text-secondary-ink dark:text-surface-white focus:outline-none focus:border-orange-500 shadow-xs cursor-pointer"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  Lokasi: {loc}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-text text-[16px] pointer-events-none">
              location_on
            </span>
          </div>
        </div>

        {/* Clear Filter button if filters active */}
        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1.5 self-start lg:self-auto"
          >
            <span className="material-symbols-outlined text-[15px]">filter_alt_off</span>
            <span>Reset Semua Filter</span>
          </button>
        )}
      </div>

      {/* ================= RESULTS SECTION ================= */}
      <section className="space-y-5">
        <div className="flex items-center justify-between text-xs text-muted-text px-1">
          <span className="font-medium">
            Menampilkan <strong className="text-on-surface dark:text-surface-white font-bold">{results.length}</strong> hasil laporan sesuai pencarian
          </span>
          <span className="font-mono text-[11px]">Diurutkan berdasarkan relevansi semantik</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="glass-surface rounded-3xl border border-border-subtle/80 dark:border-white/10 p-4 animate-pulse space-y-4"
              >
                <div className="aspect-[16/10] bg-zinc-200/60 dark:bg-zinc-800/60 rounded-2xl"></div>
                <div className="h-4 bg-zinc-200/60 dark:bg-zinc-800/60 rounded w-3/4"></div>
                <div className="h-3 bg-zinc-200/60 dark:bg-zinc-800/60 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="p-16 text-center glass-surface rounded-3xl border border-border-subtle/80 dark:border-white/10 space-y-4 max-w-lg mx-auto inner-light">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[32px]">search_off</span>
            </div>
            <h3 className="font-bold text-base sm:text-lg text-on-surface dark:text-surface-white">
              Tidak ditemukan kecocokan untuk "{query || 'kriteria filter'}"
            </h3>
            <p className="text-xs text-secondary-ink dark:text-muted-text leading-relaxed">
              Coba gunakan kata kunci yang lebih umum seperti "dompet", "kunci", atau pilih lokasi lain.
            </p>
            {hasActiveFilters && (
              <div className="pt-2">
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-semibold shadow-md shadow-orange-500/25 active:scale-95 transition-all"
                >
                  Reset Semua Filter
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((item) => (
              <article
                key={item.id}
                className="group glass-surface card-elevation rounded-3xl border border-border-subtle/80 dark:border-white/10 overflow-hidden flex flex-col justify-between inner-light hover:border-orange-500/40 transition-all"
              >
                <div>
                  <div
                    className="relative aspect-[16/10] overflow-hidden bg-soft-surface group cursor-pointer"
                    onClick={() => onSelectReport(item)}
                  >
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Type and Category Badges */}
                    <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                      <span
                        className={`px-3 py-1 rounded-xl text-white text-[11px] font-bold shadow-xs ${
                          item.report_type === 'found'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                        }`}
                      >
                        {item.report_type === 'found' ? 'Temuan' : 'Kehilangan'}
                      </span>
                      <span className="px-2.5 py-1 rounded-xl backdrop-blur-md bg-black/50 text-white text-[11px] font-medium border border-white/20">
                        {item.category}
                      </span>
                    </div>

                    <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg text-[10px] font-mono backdrop-blur-md bg-black/65 text-white">
                      {item.report_code}
                    </span>
                  </div>

                  <div className="p-5 sm:p-6 space-y-3">
                    {/* Semantic Match Highlight Tag */}
                    {query && (
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-bold">
                        <span className="material-symbols-outlined text-[12px]">check_circle</span>
                        <span>Sesuai Kueri Pencarian</span>
                      </div>
                    )}

                    <h3
                      onClick={() => onSelectReport(item)}
                      className="font-bold text-base text-on-surface dark:text-surface-white line-clamp-1 hover:text-orange-500 cursor-pointer transition-colors"
                    >
                      {item.title}
                    </h3>

                    <p className="text-xs text-secondary-ink dark:text-muted-text line-clamp-2 leading-relaxed">
                      {item.public_description}
                    </p>

                    <div className="pt-2 border-t border-border-subtle/70 dark:border-white/10 flex items-center gap-1.5 text-xs text-muted-text truncate">
                      <span className="material-symbols-outlined text-[15px] text-orange-500 shrink-0">
                        location_on
                      </span>
                      <span className="truncate font-medium">{item.facility_location}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6 pt-0 flex items-center gap-2">
                  {item.report_type === 'found' ? (
                    <button
                      onClick={() => onOpenClaimModal(item)}
                      className="flex-1 h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      <span>Klaim Milik Saya</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onSelectReport(item)}
                      className="flex-1 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">handshake</span>
                      <span>Bantu Cari / Detail</span>
                    </button>
                  )}

                  <button
                    onClick={() => onSelectReport(item)}
                    className="h-10 px-3.5 rounded-xl glass-surface border border-border-subtle/80 dark:border-white/10 hover:text-on-surface text-secondary-ink dark:text-muted-text active:scale-95 transition-all flex items-center justify-center shadow-xs cursor-pointer"
                    title="Lihat Detail"
                  >
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default SearchPage;
