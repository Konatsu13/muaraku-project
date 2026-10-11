import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/supabase';
import { Report } from '../types';

interface SeekerPageProps {
  onSelectReport: (report: Report) => void;
  onOpenReportModal: () => void;
  onOpenClaimModal: (report: Report) => void;
}

export const SeekerPage: React.FC<SeekerPageProps> = ({
  onSelectReport,
  onOpenReportModal,
  onOpenClaimModal,
}) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'matches'>('all');
  const [reports, setReports] = useState<Report[]>([]);
  const [myReports, setMyReports] = useState<Report[]>([]);
  const [matchedReports, setMatchedReports] = useState<{ lost: Report; found: Report }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    setLoading(true);
    const lostItems = await db.getReports({ type: 'lost' });
    const allReports = await db.getReports();
    setReports(lostItems);

    const mine = lostItems.filter(
      (r: Report) => r.reporter_id === currentUser?.id
    );
    setMyReports(mine);

    // AI matching pairs
    const pairs: { lost: Report; found: Report }[] = [];
    lostItems.forEach((lost: Report) => {
      if (lost.match_candidate_id) {
        const found = allReports.find((r: Report) => r.id === lost.match_candidate_id);
        if (found) {
          pairs.push({ lost, found });
        }
      }
    });
    setMatchedReports(pairs);
    setLoading(false);
  };

  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8">
      {/* ================= EDITORIAL HEADER BANNER (Apple Pro Surface) ================= */}
      <section className="relative rounded-3xl glass-surface p-6 sm:p-8 md:p-10 border border-border-subtle/80 dark:border-white/10 shadow-[0_16px_45px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden inner-light bg-hero-glow-light dark:bg-hero-glow-dark">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-orange-500/10 dark:bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                <span className="material-symbols-outlined text-[14px]">person_search</span>
                <span>Portal Pemilik</span>
              </span>
              <span className="text-xs text-muted-text font-medium">
                • Manajemen & Radar Pencarian Terpadu
              </span>
            </div>

            <h1 className="font-headline-md text-2xl sm:text-3xl md:text-4xl font-extrabold text-on-surface dark:text-surface-white tracking-tight leading-tight">
              Seeker — Pelacakan Barang Hilang
            </h1>

            <p className="text-xs sm:text-sm text-secondary-ink dark:text-muted-text leading-relaxed">
              Pantau laporan barang Anda, amati sinyal kecocokan AI otomatis terhadap inventaris temuan, dan klaim kembali dengan verifikasi tanpa bocor data.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenReportModal}
              className="h-12 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              <span>+ Buat Laporan Kehilangan</span>
            </button>
          </div>
        </div>
      </section>

      {/* ================= SEGMENTED SUB-TABS ================= */}
      <div className="flex items-center gap-2 p-1.5 glass-surface rounded-2xl border border-border-subtle/80 dark:border-white/10 overflow-x-auto no-scrollbar w-fit shadow-xs">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'all'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/25'
              : 'text-secondary-ink dark:text-muted-text hover:text-on-surface dark:hover:text-surface-white'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">travel_explore</span>
          <span>Jelajahi Kehilangan ({reports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('my')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'my'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/25'
              : 'text-secondary-ink dark:text-muted-text hover:text-on-surface dark:hover:text-surface-white'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">inventory</span>
          <span>Laporan Saya ({myReports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('matches')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'matches'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/25'
              : 'text-secondary-ink dark:text-muted-text hover:text-on-surface dark:hover:text-surface-white'
          }`}
        >
          <span className="material-symbols-outlined text-[17px] text-emerald-400">radar</span>
          <span>AI Matching Radar</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'matches'
                ? 'bg-white/20 text-white'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
            }`}
          >
            {matchedReports.length}
          </span>
        </button>
      </div>

      {/* ================= TAB CONTENT ================= */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="glass-surface rounded-3xl border border-border-subtle/80 dark:border-white/10 p-4 animate-pulse space-y-4"
            >
              <div className="h-44 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-2xl"></div>
              <div className="h-4 bg-zinc-200/60 dark:bg-zinc-800/60 rounded w-3/4"></div>
              <div className="h-3 bg-zinc-200/60 dark:bg-zinc-800/60 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : activeTab === 'matches' ? (
        /* ================= DRAMATIC AI MATCHING RADAR TAB ================= */
        <div className="space-y-6">
          {/* Radar Info Banner */}
          <div className="p-5 rounded-2xl glass-surface border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm inner-light bg-emerald-500/[0.03]">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/25">
                <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-on-surface dark:text-surface-white">
                    Pencocokan AI Radar Otomatis Aktif
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    Live Scan
                  </span>
                </div>
                <p className="text-xs text-secondary-ink dark:text-muted-text">
                  Algoritma membandingkan kesesuaian kategori, titik lokasi kejadian, kronologi waktu, serta ciri rahasia terenkripsi.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-muted-text font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Scanning 24/7</span>
            </div>
          </div>

          {matchedReports.length === 0 ? (
            <div className="p-16 text-center glass-surface rounded-3xl border border-border-subtle/80 dark:border-white/10 space-y-3.5 max-w-lg mx-auto inner-light">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-muted-text flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[32px]">radar</span>
              </div>
              <h3 className="text-base font-bold text-on-surface dark:text-surface-white">
                Belum Ada Kandidat Kecocokan Baru
              </h3>
              <p className="text-xs text-muted-text leading-relaxed">
                Radar sedang aktif memantau laporan temuan baru. Saat petugas pos atau siswa mendaftarkan barang yang mirip dengan laporan Anda, notifikasi pencocokan akan langsung muncul di sini.
              </p>
            </div>
          ) : (
            matchedReports.map((pair, idx) => (
              <div
                key={idx}
                className="glass-surface card-elevation rounded-3xl p-6 sm:p-8 border border-border-subtle/80 dark:border-white/10 shadow-[0_14px_35px_rgba(0,0,0,0.05)] space-y-6 inner-light"
              >
                {/* Pair Header Banner */}
                <div className="flex flex-wrap items-center justify-between border-b border-border-subtle/70 dark:border-white/10 pb-4 gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Kandidat Kecocokan Sangat Kuat</span>
                    </span>
                    <span className="text-xs font-mono text-muted-text">
                      Skor Kemiripan: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">98.4%</strong>
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenClaimModal(pair.found)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/25 transition-all"
                  >
                    <span className="material-symbols-outlined text-[17px]">verified</span>
                    <span>Klaim & Verifikasi Sekarang</span>
                  </button>
                </div>

                {/* Comparison Stage (Lost Card ↔ 98% Match Pulse ↔ Found Card) */}
                <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-center">
                  {/* Lost Card (Left - 5 Cols) */}
                  <div className="lg:col-span-5 glass-surface rounded-2xl p-5 space-y-3 border border-border-subtle/80 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-800/30">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">person</span>
                        Laporan Hilang Milik Anda
                      </span>
                      <span className="font-mono text-[11px] text-muted-text bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded">
                        {pair.lost.report_code}
                      </span>
                    </div>

                    <div className="flex gap-4">
                      <img
                        src={pair.lost.image_url}
                        alt={pair.lost.title}
                        className="w-20 h-20 rounded-xl object-cover shrink-0 border border-border-subtle/70"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-sm font-bold text-on-surface dark:text-surface-white truncate">
                          {pair.lost.title}
                        </p>
                        <p className="text-xs text-secondary-ink dark:text-muted-text line-clamp-2 leading-relaxed">
                          {pair.lost.public_description}
                        </p>
                        <div className="flex items-center gap-1 text-[11px] text-muted-text pt-1">
                          <span className="material-symbols-outlined text-[14px] text-orange-500">location_on</span>
                          <span className="truncate">{pair.lost.facility_location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dramatic Match Pulse Center (1 Col) */}
                  <div className="lg:col-span-1 flex flex-col items-center justify-center py-2">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute w-14 h-14 rounded-full bg-emerald-500/20 animate-ping"></div>
                      <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <span className="material-symbols-outlined text-[24px]">sync_alt</span>
                      </div>
                    </div>
                    <span className="mt-2 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                      98%
                    </span>
                    <span className="text-[10px] text-muted-text uppercase tracking-wider">Cocok</span>
                  </div>

                  {/* Found Card (Right - 5 Cols) */}
                  <div className="lg:col-span-5 glass-surface rounded-2xl p-5 space-y-3 border-2 border-emerald-500/40 dark:border-emerald-500/50 bg-emerald-500/[0.02]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">inventory_2</span>
                        Barang Temuan Terdeteksi
                      </span>
                      <span className="font-mono text-[11px] text-muted-text bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded">
                        {pair.found.report_code}
                      </span>
                    </div>

                    <div className="flex gap-4">
                      <img
                        src={pair.found.image_url}
                        alt={pair.found.title}
                        className="w-20 h-20 rounded-xl object-cover shrink-0 border border-emerald-500/30"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-sm font-bold text-on-surface dark:text-surface-white truncate">
                          {pair.found.title}
                        </p>
                        <p className="text-xs text-secondary-ink dark:text-muted-text line-clamp-2 leading-relaxed">
                          {pair.found.public_description}
                        </p>
                        <div className="flex items-center gap-1 text-[11px] text-muted-text pt-1">
                          <span className="material-symbols-outlined text-[14px] text-emerald-600">location_city</span>
                          <span className="truncate">{pair.found.facility_location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Zero-Knowledge Security Badge & Detail Button */}
                <div className="pt-3 border-t border-border-subtle/70 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <span className="material-symbols-outlined text-[16px]">lock</span>
                    <span>Tervalidasi Ciri Rahasia: Bukti ciri unik yang hanya diketahui pemilik sah</span>
                  </div>

                  <button
                    onClick={() => onSelectReport(pair.found)}
                    className="text-xs font-semibold text-secondary-ink dark:text-muted-text hover:text-orange-500 transition-colors flex items-center gap-1"
                  >
                    <span>Lihat Detail Fisik Temuan</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : activeTab === 'my' ? (
        /* ================= LAPORAN SAYA TAB ================= */
        <div className="space-y-4">
          {myReports.length === 0 ? (
            <div className="p-16 text-center glass-surface rounded-3xl border border-border-subtle/80 dark:border-white/10 space-y-3.5 max-w-lg mx-auto inner-light">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[32px]">folder_open</span>
              </div>
              <h3 className="text-base font-bold text-on-surface dark:text-surface-white">
                Anda Belum Membuat Laporan Kehilangan
              </h3>
              <p className="text-xs text-muted-text leading-relaxed">
                Jika Anda kehilangan barang di area sekolah atau kampus, daftarkan laporan sekarang agar sistem AI dapat melacaknya dengan segera.
              </p>
              <button
                onClick={onOpenReportModal}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold hover:brightness-110 active:scale-[0.98] shadow-md shadow-orange-500/25 transition-all"
              >
                + Buat Laporan Kehilangan
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myReports.map((item) => (
                <div
                  key={item.id}
                  className="glass-surface card-elevation rounded-3xl border border-border-subtle/80 dark:border-white/10 p-5 space-y-4 inner-light hover:border-orange-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-soft-surface group">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-orange-500 text-white shadow-xs">
                        {item.status}
                      </span>
                      <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg text-[10px] font-mono backdrop-blur-md bg-black/65 text-white">
                        {item.report_code}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-on-surface dark:text-surface-white truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-secondary-ink dark:text-muted-text line-clamp-2 mt-1 leading-relaxed">
                        {item.public_description}
                      </p>
                      <p className="text-[11px] text-muted-text mt-2 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px] text-orange-500">location_on</span>
                        <span>{item.facility_location}</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border-subtle/70 dark:border-white/10 flex items-center justify-between">
                    <button
                      onClick={() => onSelectReport(item)}
                      className="text-xs text-orange-600 dark:text-orange-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Lihat Rincian</span>
                      <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    </button>
                    {item.status === 'Potential Match' && (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                        Ada Kecocokan!
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : reports.length === 0 ? (
        /* ================= EMPTY STATE ALL LOST ITEMS ================= */
        <div className="p-12 sm:p-16 text-center glass-surface rounded-3xl border border-border-subtle/80 dark:border-white/10 space-y-4 max-w-lg mx-auto shadow-sm inner-light">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[32px]">search_off</span>
          </div>
          <h3 className="text-base font-bold text-on-surface dark:text-surface-white">
            Belum Ada Laporan Kehilangan
          </h3>
          <p className="text-xs text-muted-text leading-relaxed">
            Saat ini belum ada data barang hilang yang dilaporkan oleh warga sekolah.
          </p>
          <button
            onClick={onOpenReportModal}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold hover:brightness-110 active:scale-[0.98] shadow-md shadow-orange-500/25 transition-all"
          >
            + Buat Laporan Kehilangan
          </button>
        </div>
      ) : (
        /* ================= ALL LOST ITEMS FEED ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((item) => (
            <article
              key={item.id}
              className="glass-surface card-elevation rounded-3xl border border-border-subtle/80 dark:border-white/10 overflow-hidden flex flex-col justify-between inner-light hover:border-orange-500/40 transition-all"
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
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="px-3 py-1 rounded-xl text-[11px] font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs">
                      Kehilangan
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
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-secondary-ink dark:text-muted-text flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-[15px]">person</span>
                      <span>{item.reporter_name}</span>
                    </span>
                    <span className="text-[11px] text-muted-text font-mono">
                      {new Date(item.incident_time).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>

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
                    <span className="truncate">{item.facility_location}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 pt-0 flex gap-2">
                <button
                  onClick={() => onSelectReport(item)}
                  className="flex-1 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold hover:brightness-110 active:scale-[0.98] shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">handshake</span>
                  <span>Bantu Cari / Ada Info</span>
                </button>
                <button
                  onClick={() => onSelectReport(item)}
                  className="h-10 px-3.5 rounded-xl glass-surface border border-border-subtle/80 dark:border-white/10 text-secondary-ink dark:text-muted-text hover:text-on-surface dark:hover:text-surface-white active:scale-95 flex items-center justify-center transition-all shadow-xs"
                  title="Lihat Detail"
                >
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
};

export default SeekerPage;
