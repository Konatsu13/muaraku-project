import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { db } from '../lib/supabase';
import { Report, Claim } from '../types';

interface FinderPageProps {
  onSelectReport: (report: Report) => void;
  onOpenReportModal: () => void;
  onOpenChatWithClaimant?: () => void;
}

export const FinderPage: React.FC<FinderPageProps> = ({
  onSelectReport,
  onOpenReportModal,
  onOpenChatWithClaimant,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'claims' | 'found' | 'completed'>('claims');
  const [foundReports, setFoundReports] = useState<Report[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    setLoading(true);
    const reports = await db.getReports({ type: 'found' });
    setFoundReports(reports);

    // Load claims for found reports
    let allClaims: Claim[] = [];
    for (const r of reports) {
      const cList = await db.getClaimsForReport(r.id);
      allClaims = [...allClaims, ...cList];
    }
    setClaims(allClaims);
    setLoading(false);
  };

  const handleApproveClaim = async (claimId: string) => {
    await db.updateClaimStatus(claimId, 'Approved', 'Bukti verifikasi cocok. Silakan ambil di pos.');
    showToast('Klaim disetujui! Pemilik telah diberi tahu untuk serah terima di pos.', 'success');
    loadData();
  };

  const handleCompleteHandover = async (claimId: string) => {
    await db.updateClaimStatus(claimId, 'Completed', 'Serah terima fisik selesai dan terverifikasi.');
    showToast('Status barang diperbarui menjadi "Dikembalikan" (Returned)!', 'success');
    loadData();
  };

  const handleRejectClaim = async (claimId: string) => {
    await db.updateClaimStatus(claimId, 'Rejected', 'Bukti rahasia tidak cocok dengan fisik barang.');
    showToast('Klaim ditolak secara netral demi keamanan barang.', 'warning');
    loadData();
  };

  const pendingClaims = claims.filter((c) => c.status === 'Pending Review');
  const approvedClaims = claims.filter((c) => c.status === 'Approved');
  const completedClaims = claims.filter((c) => c.status === 'Completed');

  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8">
      {/* ================= PAGE HEADER BANNER ================= */}
      <section className="relative rounded-3xl glass-surface p-6 sm:p-8 md:p-10 border border-border-subtle/80 dark:border-white/10 shadow-[0_16px_45px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden inner-light bg-hero-glow-light dark:bg-hero-glow-dark">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="material-symbols-outlined text-[14px]">shield</span>
                <span>Finder Hub</span>
              </span>
              <span className="text-xs text-muted-text font-medium">
                • Manajemen Temuan & Verifikasi Hak Milik
              </span>
            </div>

            <h1 className="font-headline-md text-2xl sm:text-3xl md:text-4xl font-extrabold text-on-surface dark:text-surface-white tracking-tight leading-tight">
              Finder — Penanganan Barang Temuan
            </h1>

            <p className="text-xs sm:text-sm text-secondary-ink dark:text-muted-text leading-relaxed">
              Kelola barang yang diamankan di pos satpam atau meja piket, periksa kecocokan bukti klaim secara obyektif, dan dokumentasikan serah terima fisik secara resmi.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenReportModal}
              className="h-12 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              <span>+ Lapor Barang Ditemukan</span>
            </button>
          </div>
        </div>
      </section>

      {/* ================= VERIFIED PARTNER CARD (Amber Shield Banner) ================= */}
      <section className="relative rounded-3xl glass-surface border border-amber-400/50 dark:border-amber-500/40 p-6 sm:p-7 overflow-hidden shadow-[0_12px_36px_rgba(251,146,60,0.06)] inner-light bg-gradient-to-r from-amber-500/[0.04] via-transparent to-orange-500/[0.03]">
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-amber-400 via-orange-500 to-amber-500"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pl-2 sm:pl-3">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-400/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 shadow-sm">
              <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-400/30">
                  <span className="material-symbols-outlined text-[15px]">security</span>
                  <span>Petugas Pos Resmi — Pos Satpam Gerbang & Tata Usaha</span>
                </span>
                <span className="font-mono text-xs text-muted-text bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-md">
                  ID Otoritas: #POSKO-SEKOLAH-04
                </span>
              </div>

              <h2 className="font-title-md text-base sm:text-lg font-bold text-on-surface dark:text-surface-white tracking-tight">
                Protokol Resmi Penitipan & Serah Terima Barang Sekolah
              </h2>

              <p className="text-xs text-secondary-ink dark:text-muted-text max-w-3xl leading-relaxed">
                Setiap laporan penemuan dilindungi SOP pengamanan sipil. Barang disimpan dalam loker aman posko. Penyerahan kepada pemilik sah wajib mencocokkan ciri rahasia serta bukti kartu identitas/kartu pelajar.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5 pl-18 lg:pl-0 shrink-0 border-t lg:border-t-0 border-border-subtle/70 dark:border-white/10 pt-4 lg:pt-0">
            <div className="flex flex-col text-left lg:text-right">
              <span className="text-[11px] text-muted-text font-medium">Tingkat Serah Terima Sah</span>
              <span className="font-headline-sm text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                98.4% Terverifikasi
              </span>
            </div>

            <div className="h-10 w-px bg-border-subtle/70 dark:border-white/10 hidden sm:block"></div>

            <span className="px-4 py-2 glass-surface border border-border-subtle/80 dark:border-white/10 rounded-xl text-xs font-semibold text-secondary-ink dark:text-surface-white shadow-xs">
              SOP Bebas Biaya
            </span>
          </div>
        </div>
      </section>

      {/* ================= TABS NAVIGATION ================= */}
      <div className="flex items-center gap-2 p-1.5 glass-surface rounded-2xl border border-border-subtle/80 dark:border-white/10 overflow-x-auto no-scrollbar w-fit shadow-xs">
        <button
          onClick={() => setActiveTab('claims')}
          className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'claims'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/25'
              : 'text-secondary-ink dark:text-muted-text hover:text-on-surface dark:hover:text-surface-white'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">pending_actions</span>
          <span>Daftar Pengajuan Klaim</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'claims' ? 'bg-white/20 text-white' : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
            }`}
          >
            {pendingClaims.length + approvedClaims.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('found')}
          className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'found'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/25'
              : 'text-secondary-ink dark:text-muted-text hover:text-on-surface dark:hover:text-surface-white'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">inventory_2</span>
          <span>Barang Diamankan ({foundReports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'completed'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/25'
              : 'text-secondary-ink dark:text-muted-text hover:text-on-surface dark:hover:text-surface-white'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>Riwayat Serah Terima ({completedClaims.length})</span>
        </button>
      </div>

      {/* ================= TAB CONTENT ================= */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="glass-surface rounded-3xl border border-border-subtle/80 dark:border-white/10 p-6 animate-pulse space-y-4"
            >
              <div className="h-6 bg-zinc-200/60 dark:bg-zinc-800/60 rounded w-1/2"></div>
              <div className="h-20 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-xl"></div>
              <div className="h-10 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : activeTab === 'claims' ? (
        /* ================= CLAIMS REVIEW TAB ================= */
        <div className="space-y-5">
          {pendingClaims.length === 0 && approvedClaims.length === 0 ? (
            <div className="p-16 text-center glass-surface rounded-3xl border border-border-subtle/80 dark:border-white/10 space-y-3.5 max-w-lg mx-auto inner-light">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[32px]">task_alt</span>
              </div>
              <h3 className="text-base font-bold text-on-surface dark:text-surface-white">
                Semua Klaim Telah Ditinjau
              </h3>
              <p className="text-xs text-muted-text leading-relaxed">
                Tidak ada klaim baru yang menunggu verifikasi saat ini. Sistem akan memberitahu saat ada pemohon baru.
              </p>
            </div>
          ) : (
            [...pendingClaims, ...approvedClaims].map((claim) => (
              <div
                key={claim.id}
                className="glass-surface card-elevation rounded-3xl p-6 sm:p-7 border border-border-subtle/80 dark:border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.04)] space-y-5 inner-light"
              >
                {/* Claimant Profile & Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle/70 dark:border-white/10">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={
                        claim.claimant_avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
                      }
                      alt={claim.claimant_name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-orange-500/20 border border-border-subtle shadow-xs"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-on-surface dark:text-surface-white">
                          {claim.claimant_name}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            claim.status === 'Approved'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20'
                          }`}
                        >
                          {claim.status === 'Approved' ? 'Disetujui — Menunggu Ambil' : 'Menunggu Review'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-text mt-0.5">
                        Mengajukan klaim untuk:{' '}
                        <strong className="text-on-surface dark:text-surface-white font-semibold">
                          {claim.report_title}
                        </strong>
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] text-muted-text font-mono bg-black/5 dark:bg-white/10 px-3 py-1 rounded-lg self-start sm:self-auto">
                    Diajukan: {new Date(claim.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>

                {/* Submitted Proof Description & Match Information */}
                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-border-subtle/80 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-on-surface dark:text-surface-white flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-orange-500">lock</span>
                      <span>Keterangan Bukti Ciri Rahasia dari Pengklaim:</span>
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                      Enkripsi Ciri Valid
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-secondary-ink dark:text-zinc-200 font-mono glass-surface p-4 rounded-xl border border-border-subtle/70 dark:border-white/10 leading-relaxed italic bg-white/70 dark:bg-zinc-900/70">
                    "{claim.proof_description}"
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                    {claim.proof_serial && (
                      <div className="p-2.5 rounded-xl glass-surface border border-border-subtle/70 dark:border-white/10 text-muted-text">
                        <span>Nomor Seri / ID: </span>
                        <strong className="text-on-surface dark:text-surface-white font-mono">
                          {claim.proof_serial}
                        </strong>
                      </div>
                    )}
                    {claim.meeting_location && (
                      <div className="p-2.5 rounded-xl glass-surface border border-border-subtle/70 dark:border-white/10 text-muted-text flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px] text-orange-500">location_on</span>
                        <span>Lokasi Serah Terima: </span>
                        <strong className="text-on-surface dark:text-surface-white">
                          {claim.meeting_location}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
                  {onOpenChatWithClaimant && (
                    <button
                      onClick={onOpenChatWithClaimant}
                      className="px-4 py-2.5 rounded-xl glass-surface border border-border-subtle/80 dark:border-white/10 text-xs font-bold text-secondary-ink dark:text-surface-white hover:text-orange-500 hover:border-orange-500/30 active:scale-95 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[17px]">forum</span>
                      <span>Hubungi Pemohon</span>
                    </button>
                  )}

                  {claim.status === 'Pending Review' ? (
                    <>
                      <button
                        onClick={() => handleRejectClaim(claim.id)}
                        className="px-4 py-2.5 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-500/10 active:scale-95 transition-all cursor-pointer"
                      >
                        Tolak Klaim
                      </button>
                      <button
                        onClick={() => handleApproveClaim(claim.id)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[17px]">check</span>
                        <span>Setujui Klaim (Bukti Cocok)</span>
                      </button>
                    </>
                  ) : claim.status === 'Approved' ? (
                    <button
                      onClick={() => handleCompleteHandover(claim.id)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/25 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[17px]">handshake</span>
                      <span>Konfirmasi Serah Terima Selesai</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl">
                      <span className="material-symbols-outlined text-[17px]">check_circle</span>
                      <span>Serah Terima Selesai</span>
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : activeTab === 'completed' ? (
        /* ================= COMPLETED HANDOVERS TAB ================= */
        <div className="space-y-4">
          {completedClaims.length === 0 ? (
            <div className="p-16 text-center glass-surface rounded-3xl border border-border-subtle/80 dark:border-white/10 space-y-3.5 max-w-lg mx-auto inner-light">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-muted-text flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[32px]">history_edu</span>
              </div>
              <h3 className="text-base font-bold text-on-surface dark:text-surface-white">
                Belum Ada Riwayat Pengembalian Selesai
              </h3>
              <p className="text-xs text-muted-text leading-relaxed">
                Klaim yang telah selesai diserahterimakan dan ditandatangani akan tercatat rapi di sini sebagai arsip sekolah.
              </p>
            </div>
          ) : (
            completedClaims.map((claim) => (
              <div
                key={claim.id}
                className="glass-surface border border-emerald-500/30 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 inner-light hover:border-emerald-500/50 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      DIKEMBALIKAN RESMI
                    </span>
                    <h3 className="font-bold text-base text-on-surface dark:text-surface-white">
                      {claim.report_title}
                    </h3>
                  </div>
                  <p className="text-xs text-secondary-ink dark:text-muted-text">
                    Diserahkan kepada:{' '}
                    <strong className="text-on-surface dark:text-surface-white">{claim.claimant_name}</strong>{' '}
                    di {claim.meeting_location || 'Pos Satpam'}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <span className="material-symbols-outlined text-[24px]">verified</span>
                  <span>Terdokumentasi</span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : foundReports.length === 0 ? (
        /* ================= EMPTY STATE FOUND ITEMS ================= */
        <div className="p-12 sm:p-16 text-center glass-surface rounded-3xl border border-border-subtle/80 dark:border-white/10 space-y-4 max-w-lg mx-auto shadow-sm inner-light">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[32px]">inventory_2</span>
          </div>
          <h3 className="text-base font-bold text-on-surface dark:text-surface-white">
            Belum Ada Barang Ditemukan
          </h3>
          <p className="text-xs text-muted-text leading-relaxed">
            Belum ada barang temuan yang diamankan di pos atau dilaporkan warga. Jika Anda menemukan barang, laporkan sekarang untuk membantu pemiliknya.
          </p>
          <button
            onClick={onOpenReportModal}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold hover:brightness-110 active:scale-[0.98] shadow-md shadow-emerald-600/25 transition-all"
          >
            + Lapor Barang Ditemukan
          </button>
        </div>
      ) : (
        /* ================= FOUND ITEMS TAB ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foundReports.map((item) => (
            <article
              key={item.id}
              className="glass-surface card-elevation rounded-3xl border border-border-subtle/80 dark:border-white/10 overflow-hidden flex flex-col justify-between inner-light hover:border-orange-500/40 transition-all"
            >
              <div className="space-y-3.5">
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
                    <span className="px-3 py-1 rounded-xl text-[11px] font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs">
                      Barang Ditemukan
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
                  <h3
                    onClick={() => onSelectReport(item)}
                    className="font-bold text-base text-on-surface dark:text-surface-white line-clamp-1 hover:text-orange-500 cursor-pointer transition-colors"
                  >
                    {item.title}
                  </h3>
                  <p className="text-xs text-secondary-ink dark:text-muted-text line-clamp-2 leading-relaxed">
                    {item.public_description}
                  </p>
                  <p className="text-[11px] text-muted-text mt-2 flex items-center gap-1.5 truncate">
                    <span className="material-symbols-outlined text-[15px] text-orange-500">location_on</span>
                    <span className="truncate">{item.facility_location}</span>
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-6 pt-0 border-t border-border-subtle/70 dark:border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Status: {item.status}
                </span>
                <button
                  onClick={() => onSelectReport(item)}
                  className="text-xs text-orange-600 dark:text-orange-400 font-bold hover:underline flex items-center gap-1"
                >
                  <span>Detail Laporan</span>
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
};

export default FinderPage;
