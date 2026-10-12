'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { db } from '../lib/supabase';
import { Report, Claim } from '../types';

interface ProfilePageProps {
  onSelectReport: (report: Report) => void;
  onOpenReportModal?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onSelectReport,
  onOpenReportModal,
}) => {
  const { currentUser, isAuthenticated, openAuthModal, setTargetRedirect } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'reports' | 'claims'>('reports');
  const [filterType, setFilterType] = useState<'all' | 'lost' | 'found'>('all');
  const [myReports, setMyReports] = useState<Report[]>([]);
  const [myClaims, setMyClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const loadUserData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      // Load all reports to find current user's reports
      const allReports = await db.getReports();
      const userReports = allReports.filter(
        (r) => r.reporter_id === currentUser.id
      );
      setMyReports(userReports);

      // Load claims submitted by this user
      const userClaims = await db.getClaimsForUser(currentUser.id);
      setMyClaims(userClaims);
    } catch (err) {
      console.warn('Error loading user profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reportId: string, newStatus: Report['status']) => {
    try {
      await db.updateReport(reportId, { status: newStatus });
      showToast(`Status laporan berhasil diubah menjadi: ${newStatus}`, 'success');
      loadUserData();
    } catch (err: any) {
      showToast(err?.message || 'Gagal memperbarui status laporan.', 'error');
    }
  };

  const handleDeleteReport = async (reportId: string, title: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus laporan "${title}"?`)) {
      try {
        await db.deleteReport(reportId);
        showToast('Laporan berhasil dihapus.', 'info');
        loadUserData();
      } catch (err: any) {
        showToast(err?.message || 'Gagal menghapus laporan.', 'error');
      }
    }
  };

  if (!isAuthenticated || !currentUser) {
    return (
      <main className="flex-1 px-4 sm:px-8 py-12 max-w-lg w-full mx-auto text-center space-y-6">
        <div className="card-premium rounded-3xl p-8 backdrop-blur-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-container/10 text-primary-container mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px]">account_circle</span>
          </div>
          <h2 className="font-headline-md text-xl font-bold text-on-surface dark:text-surface-white">
            Masuk untuk Melihat Profil
          </h2>
          <p className="text-xs text-secondary-ink dark:text-muted-text">
            Halaman profil dan dashboard pengelolaan laporan memerlukan autentikasi akun warga.
          </p>
          <button
            onClick={() => {
              setTargetRedirect?.('profile');
              openAuthModal?.('login');
            }}
            className="btn-premium w-full py-3 px-4 rounded-xl text-white font-semibold text-xs flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">login</span>
            <span>Masuk Sekarang</span>
          </button>
        </div>
      </main>
    );
  }

  const lostCount = myReports.filter((r) => r.report_type === 'lost').length;
  const foundCount = myReports.filter((r) => r.report_type === 'found').length;
  const filteredReports = myReports.filter((r) => {
    if (filterType === 'all') return true;
    return r.report_type === filterType;
  });

  return (
    <main className="flex-1 px-4 sm:px-8 py-7 max-w-[1200px] w-full mx-auto space-y-8 animate-fade-in-up">
      {/* Profile Header Card with Apple Frosted Aesthetic */}
      <div className="card-premium rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 inner-light">
        <div className="relative shrink-0">
          <img
            src={
              currentUser.avatar_url ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
            }
            alt={currentUser.name}
            className="w-24 h-24 rounded-2xl object-cover ring-4 ring-primary-container/20 border-2 border-surface-white dark:border-dark-surface shadow-md"
          />
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-secondary text-white flex items-center justify-center ring-2 ring-surface-white dark:ring-dark-surface shadow-xs">
            <span className="material-symbols-outlined text-[16px]">verified</span>
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2.5 min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <h1 className="font-headline-md text-xl sm:text-2xl font-extrabold text-on-surface dark:text-surface-white tracking-tight">
              {currentUser.name}
            </h1>
            {currentUser.is_verified_staff ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                Petugas Lokasi Terverifikasi
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-secondary/15 text-secondary border border-secondary/25">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                Warga Terverifikasi KTP/NIS
              </span>
            )}
          </div>

          <p className="text-xs text-secondary-ink dark:text-muted-text">
            {currentUser.institution || 'SMA Negeri 1 Jakarta / Kampus Sekolah'} • {currentUser.email}
          </p>

          <p className="text-xs text-muted-text font-mono">
            ID Akun: {currentUser.staff_authority_id || `#WARGA-${currentUser.id.slice(0, 8).toUpperCase()}`}
          </p>

          {/* Civic Karma & Privacy Badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <div className="px-3.5 py-1.5 rounded-2xl bg-primary-container/10 border border-primary-container/20 text-on-primary-container text-xs font-semibold flex items-center gap-2 shadow-xs">
              <span className="material-symbols-outlined text-primary-container text-[18px]">
                military_tech
              </span>
              <span>Civic Karma: {currentUser.civic_karma ?? 100} Poin Kejujuran</span>
            </div>

            <div className="px-3.5 py-1.5 rounded-2xl glass-surface border border-border-subtle/80 dark:border-white/10 text-xs text-secondary-ink dark:text-muted-text flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-secondary">lock</span>
              <span>Enkripsi UU PDP 2022 Aktif</span>
            </div>
          </div>
        </div>

        {onOpenReportModal && (
          <button
            onClick={onOpenReportModal}
            className="btn-premium px-5 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-500/25 shrink-0 sm:self-start"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ Buat Laporan</span>
          </button>
        )}
      </div>

      {/* Metrics Row (Dynamic Live Counts) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-premium p-5 rounded-2xl text-center sm:text-left inner-light">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-text font-medium">Laporan Kehilangan</span>
            <span className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">search</span>
            </span>
          </div>
          <p className="font-headline-sm text-3xl font-extrabold text-on-surface dark:text-surface-white mt-1 tracking-tight">
            {lostCount}
          </p>
          <span className="text-[11px] text-muted-text mt-1 inline-block">
            {myReports.filter((r) => r.report_type === 'lost' && r.status === 'Open').length} masih aktif dicari
          </span>
        </div>

        <div className="card-premium p-5 rounded-2xl text-center sm:text-left inner-light">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-text font-medium">Barang Temuan Dilaporkan</span>
            <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            </span>
          </div>
          <p className="font-headline-sm text-3xl font-extrabold text-on-surface dark:text-surface-white mt-1 tracking-tight">
            {foundCount}
          </p>
          <span className="text-[11px] text-secondary font-semibold mt-1 inline-block">
            {myReports.filter((r) => r.report_type === 'found' && r.status === 'Returned').length} telah dikembalikan
          </span>
        </div>

        <div className="card-premium p-5 rounded-2xl text-center sm:text-left inner-light">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-text font-medium">Pengajuan Klaim Anda</span>
            <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </span>
          </div>
          <p className="font-headline-sm text-3xl font-extrabold text-amber-500 mt-1 tracking-tight">
            {myClaims.length}
          </p>
          <span className="text-[11px] text-muted-text mt-1 inline-block">
            {myClaims.filter((c) => c.status === 'Pending Review').length} sedang ditinjau
          </span>
        </div>
      </div>

      {/* Main Tabbed Management Dashboard */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle/70 dark:border-dark-border">
          {/* Main Tabs: Laporan Saya vs Klaim Saya */}
          <div className="flex items-center gap-1.5 p-1 glass-surface rounded-2xl border border-border-subtle/80 dark:border-white/10 inner-light w-fit">
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'reports'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs'
                  : 'text-secondary-ink dark:text-muted-text hover:text-on-surface dark:hover:text-surface-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">list_alt</span>
              <span>Kelola Laporan Saya ({myReports.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('claims')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'claims'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs'
                  : 'text-secondary-ink dark:text-muted-text hover:text-on-surface dark:hover:text-surface-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>Klaim Saya ({myClaims.length})</span>
            </button>
          </div>

          {/* Sub-filter for reports */}
          {activeTab === 'reports' && (
            <div className="flex items-center gap-1 text-xs">
              <span className="text-muted-text text-[11px] mr-1">Tipe:</span>
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterType === 'all'
                    ? 'bg-primary-container text-white'
                    : 'glass-surface border border-border-subtle/80 text-muted-text hover:text-on-surface'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterType('lost')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterType === 'lost'
                    ? 'bg-blue-600 text-white'
                    : 'glass-surface border border-border-subtle/80 text-muted-text hover:text-on-surface'
                }`}
              >
                Hilang
              </button>
              <button
                onClick={() => setFilterType('found')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterType === 'found'
                    ? 'bg-emerald-600 text-white'
                    : 'glass-surface border border-border-subtle/80 text-muted-text hover:text-on-surface'
                }`}
              >
                Temuan
              </button>
            </div>
          )}
        </div>

        {/* Tab 1: Kelola Laporan Saya */}
        {activeTab === 'reports' && (
          <div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="card-premium rounded-2xl p-4 animate-pulse space-y-3">
                    <div className="h-40 bg-soft-surface dark:bg-dark-canvas rounded-xl" />
                    <div className="h-4 bg-soft-surface dark:bg-dark-canvas rounded w-3/4" />
                    <div className="h-3 bg-soft-surface dark:bg-dark-canvas rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="card-premium rounded-3xl p-12 text-center max-w-md mx-auto space-y-3.5 inner-light">
                <span className="material-symbols-outlined text-[44px] text-muted-text">folder_open</span>
                <h3 className="font-title-md text-base font-bold text-on-surface dark:text-surface-white">
                  Belum Ada Laporan
                </h3>
                <p className="text-xs text-muted-text leading-relaxed">
                  Anda belum menerbitkan laporan barang {filterType !== 'all' ? filterType : ''}. Laporan yang Anda buat akan muncul di sini untuk dikelola.
                </p>
                {onOpenReportModal && (
                  <button
                    onClick={onOpenReportModal}
                    className="btn-premium px-5 py-2.5 rounded-xl text-white text-xs font-semibold shadow-xs"
                  >
                    + Buat Laporan Sekarang
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map((item) => (
                  <div
                    key={item.id}
                    className="card-premium rounded-2xl overflow-hidden flex flex-col justify-between group inner-light"
                  >
                    <div>
                      {/* Image header */}
                      <div
                        className="relative aspect-[16/10] bg-soft-surface dark:bg-dark-canvas overflow-hidden cursor-pointer"
                        onClick={() => onSelectReport(item)}
                      >
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex gap-1.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-white text-[10px] font-bold shadow-xs ${
                              item.report_type === 'found'
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                            }`}
                          >
                            {item.report_type === 'found' ? 'Ditemukan' : 'Kehilangan'}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg backdrop-blur-md bg-black/50 text-white text-[10px]">
                            {item.status}
                          </span>
                        </div>
                        <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md backdrop-blur-md bg-black/60 text-white font-mono text-[10px]">
                          {item.report_code}
                        </span>
                      </div>

                      {/* Info body */}
                      <div className="p-4 space-y-2">
                        <h3
                          onClick={() => onSelectReport(item)}
                          className="font-bold text-sm text-on-surface dark:text-surface-white truncate cursor-pointer hover:text-primary-container transition-colors"
                        >
                          {item.title}
                        </h3>
                        <p className="text-xs text-secondary-ink dark:text-muted-text line-clamp-2 leading-relaxed">
                          {item.public_description}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-text pt-1">
                          <span className="material-symbols-outlined text-[14px] text-primary-container">location_on</span>
                          <span className="truncate">{item.facility_location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Management actions */}
                    <div className="p-4 pt-2 border-t border-border-subtle/70 dark:border-dark-border/70 space-y-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectReport(item)}
                          className="flex-1 py-1.5 rounded-lg glass-surface border border-border-subtle text-xs font-semibold text-on-surface dark:text-surface-white hover:border-primary-container/40 transition-colors text-center"
                        >
                          Lihat Detail
                        </button>
                        <button
                          onClick={() => handleDeleteReport(item.id, item.title)}
                          className="p-1.5 rounded-lg border border-border-subtle hover:bg-error-destructive/10 text-muted-text hover:text-error-destructive transition-colors"
                          title="Hapus Laporan"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>

                      {/* Quick status management */}
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-muted-text">Ubah status:</span>
                        <div className="flex gap-1">
                          {item.status !== 'Returned' && (
                            <button
                              onClick={() => handleUpdateStatus(item.id, 'Returned')}
                              className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-semibold hover:bg-emerald-500/20 transition-colors"
                              title="Tandai telah dikembalikan"
                            >
                              Selesai (Returned)
                            </button>
                          )}
                          {item.status !== 'Closed' && item.status !== 'Returned' && (
                            <button
                              onClick={() => handleUpdateStatus(item.id, 'Closed')}
                              className="px-2 py-0.5 rounded bg-zinc-500/10 text-muted-text font-semibold hover:bg-zinc-500/20 transition-colors"
                              title="Tutup laporan"
                            >
                              Tutup (Closed)
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Klaim Saya */}
        {activeTab === 'claims' && (
          <div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((n) => (
                  <div key={n} className="card-premium rounded-2xl p-4 animate-pulse h-24" />
                ))}
              </div>
            ) : myClaims.length === 0 ? (
              <div className="card-premium rounded-3xl p-12 text-center max-w-md mx-auto space-y-3 inner-light">
                <span className="material-symbols-outlined text-[44px] text-muted-text">verified</span>
                <h3 className="font-title-md text-base font-bold text-on-surface dark:text-surface-white">
                  Belum Ada Klaim Diajukan
                </h3>
                <p className="text-xs text-muted-text leading-relaxed">
                  Jika Anda melihat barang yang cocok di daftar barang temuan, ajukan klaim kepemilikan untuk memulai proses verifikasi dengan penemu atau pos satpam.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="card-premium rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 inner-light"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            claim.status === 'Approved'
                              ? 'bg-emerald-500/15 text-emerald-600'
                              : claim.status === 'Completed'
                              ? 'bg-secondary/15 text-secondary'
                              : claim.status === 'Rejected'
                              ? 'bg-error-destructive/15 text-error-destructive'
                              : 'bg-amber-500/15 text-amber-600'
                          }`}
                        >
                          {claim.status}
                        </span>
                        <span className="text-[11px] text-muted-text font-mono">
                          {new Date(claim.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-on-surface dark:text-surface-white truncate">
                        Klaim: {claim.report_title}
                      </h4>
                      <p className="text-xs text-secondary-ink dark:text-muted-text line-clamp-2 leading-relaxed">
                        Bukti kepemilikan Anda: {claim.proof_description}
                      </p>
                      {claim.meeting_location && (
                        <p className="text-[11px] text-muted-text flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px] text-primary-container">location_on</span>
                          <span>Titik Pertemuan: {claim.meeting_location}</span>
                        </p>
                      )}
                      {claim.review_notes && (
                        <div className="p-2.5 rounded-xl bg-soft-surface dark:bg-dark-canvas text-[11px] text-secondary-ink dark:text-muted-text mt-2 border border-border-subtle">
                          <strong>Catatan Petugas: </strong>
                          {claim.review_notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
};
