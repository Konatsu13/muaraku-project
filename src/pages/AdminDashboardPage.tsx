import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { db } from '../lib/supabase';
import { ModerationReport, Report, User } from '../types';

export const AdminDashboardPage: React.FC<{ onSelectReport: (report: Report) => void }> = ({
  onSelectReport,
}) => {
  const { currentUser, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [reports, setReports] = useState<Report[]>([]);
  const [modReports, setModReports] = useState<ModerationReport[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'queue' | 'staff' | 'content'>('queue');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const rList = await db.getReports();
    const mList = await db.getModerationReports();
    const uList = await db.getUsers();
    setReports(rList);
    setModReports(mList);
    setUsers(uList);
    setLoading(false);
  };

  const handleUpdateModStatus = async (id: string, status: ModerationReport['status']) => {
    await db.updateModerationStatus(id, status);
    showToast(`Status laporan moderasi diperbarui menjadi: ${status}`, 'success');
    loadData();
  };

  const handleDeletePost = async (reportId: string) => {
    if (confirm('Yakin ingin menghapus laporan ini dari publik?')) {
      await db.deleteReport(reportId);
      showToast('Laporan berhasil dihapus dari sistem.', 'info');
      loadData();
    }
  };

  const isAuthorized = isAuthenticated && (currentUser?.role === 'staff' || currentUser?.role === 'admin');

  if (!isAuthorized) {
    return (
      <main className="flex-1 px-4 sm:px-8 py-16 max-w-md w-full mx-auto text-center space-y-4 animate-fade-in-up">
        <div className="card-premium rounded-3xl p-8 backdrop-blur-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px]">admin_panel_settings</span>
          </div>
          <h2 className="font-headline-md text-xl font-bold text-on-surface dark:text-surface-white">
            Akses Terbatas: Pos Satpam & Tata Usaha
          </h2>
          <p className="text-xs text-secondary-ink dark:text-muted-text leading-relaxed">
            Halaman konsol ini hanya dapat diakses oleh akun petugas pos satpam sekolah atau staf tata usaha terverifikasi.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 sm:px-8 py-6 max-w-[1440px] w-full mx-auto space-y-6">
      {/* Header */}
      <div className="glass-surface p-6 sm:p-7 rounded-3xl border border-border-subtle/80 dark:border-white/10 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4 inner-light">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
              KONSOL ADMINISTRATOR
            </span>
            <span className="text-xs text-muted-text">• Pengawasan Tata Usaha & Kesiswaan</span>
          </div>
          <h1 className="font-headline-md text-2xl font-bold text-on-surface dark:text-surface-white tracking-tight">
            Panel Moderasi & Otoritas Petugas
          </h1>
          <p className="text-xs text-secondary-ink dark:text-muted-text mt-0.5">
            Dikelola oleh: <strong className="text-on-surface dark:text-surface-white">{currentUser?.name}</strong> ({currentUser?.role.toUpperCase()})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-2xl bg-soft-surface/80 dark:bg-dark-canvas/80 text-xs font-mono border border-border-subtle dark:border-dark-border text-secondary-ink dark:text-muted-text flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-secondary">verified_user</span>
            Sesi Aman SSL #ADM-2026
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-elevation glass-surface p-5 rounded-3xl border border-border-subtle/80 dark:border-white/10 text-center sm:text-left inner-light">
          <span className="text-[11px] text-muted-text font-medium">Total Laporan Masuk</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-on-surface dark:text-surface-white mt-1 tracking-tight">
            {reports.length}
          </p>
          <span className="text-[10px] text-primary-container font-semibold mt-0.5 inline-block">Tersimpan di Database</span>
        </div>

        <div className="card-elevation glass-surface p-5 rounded-3xl border border-border-subtle/80 dark:border-white/10 text-center sm:text-left inner-light">
          <span className="text-[11px] text-muted-text font-medium">Barang Dikembalikan</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-secondary mt-1 tracking-tight">
            {reports.filter((r) => r.status === 'Returned').length}
          </p>
          <span className="text-[10px] text-secondary font-semibold mt-0.5 inline-block">Sukses Temu Kembali</span>
        </div>

        <div className="card-elevation glass-surface p-5 rounded-3xl border border-border-subtle/80 dark:border-white/10 text-center sm:text-left inner-light">
          <span className="text-[11px] text-muted-text font-medium">Terverifikasi Petugas</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1 tracking-tight">
            {reports.filter((r) => r.is_dropped_at_staff_pos).length}
          </p>
          <span className="text-[10px] text-amber-600 font-semibold mt-0.5 inline-block">Tersimpan di Pos Satpam</span>
        </div>

        <div className="card-elevation glass-surface p-5 rounded-3xl border border-border-subtle/80 dark:border-white/10 text-center sm:text-left inner-light">
          <span className="text-[11px] text-muted-text font-medium">Antrean Pengaduan</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-error-destructive mt-1 tracking-tight">
            {modReports.filter((m) => m.status === 'Pending').length}
          </p>
          <span className="text-[10px] text-error-destructive font-semibold mt-0.5 inline-block">Perlu Tinjauan</span>
        </div>
      </div>

      {/* Segmented Filter Tabs */}
      <div className="p-1.5 glass-surface rounded-2xl border border-border-subtle/80 dark:border-white/10 inline-flex flex-wrap gap-1.5 inner-light">
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'queue'
              ? 'bg-gradient-to-r from-primary-container to-amber-600 text-white shadow-md shadow-primary-container/20'
              : 'text-secondary-ink dark:text-muted-text hover:bg-soft-surface dark:hover:bg-dark-canvas'
          }`}
        >
          Antrean Pengaduan Moderasi ({modReports.length})
        </button>

        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'content'
              ? 'bg-gradient-to-r from-primary-container to-amber-600 text-white shadow-md shadow-primary-container/20'
              : 'text-secondary-ink dark:text-muted-text hover:bg-soft-surface dark:hover:bg-dark-canvas'
          }`}
        >
          Manajemen Semua Konten ({reports.length})
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'staff'
              ? 'bg-gradient-to-r from-primary-container to-amber-600 text-white shadow-md shadow-primary-container/20'
              : 'text-secondary-ink dark:text-muted-text hover:bg-soft-surface dark:hover:bg-dark-canvas'
          }`}
        >
          Verifikasi Otoritas Petugas ({users.filter((u) => u.is_verified_staff).length})
        </button>
      </div>

      {/* TAB CONTENT */}
      {loading ? (
        <div className="p-12 text-center text-xs text-muted-text animate-pulse">
          Memuat konsol pengawas...
        </div>
      ) : activeTab === 'queue' ? (
        /* MODERATION QUEUE */
        <div className="space-y-4">
          {modReports.length === 0 ? (
            <div className="p-12 text-center glass-surface rounded-3xl border border-border-subtle/80 dark:border-white/10 space-y-2 inner-light">
              <span className="material-symbols-outlined text-[36px] text-secondary">verified</span>
              <p className="text-sm font-semibold text-on-surface dark:text-surface-white">
                Tidak ada pengaduan aktif
              </p>
              <p className="text-xs text-muted-text">
                Semua laporan warga dan pesan komunitas dalam kondisi tertib dan aman.
              </p>
            </div>
          ) : (
            modReports.map((mod) => (
              <div
                key={mod.id}
                className="card-elevation glass-surface border border-border-subtle/80 dark:border-white/10 rounded-3xl p-5 shadow-xs space-y-3.5 inner-light"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-error-destructive/15 text-error-destructive border border-error-destructive/20">
                      {mod.reason.toUpperCase()}
                    </span>
                    <span className="text-xs text-muted-text">
                      Pelapor: <strong className="text-on-surface dark:text-surface-white">{mod.reporter_name}</strong>
                    </span>
                  </div>
                  <span className="text-xs font-mono text-muted-text">{new Date(mod.created_at).toLocaleDateString()}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-warm-canvas/60 dark:bg-dark-canvas/60 border border-border-subtle dark:border-dark-border text-xs text-secondary-ink dark:text-muted-text">
                  <p><strong>Sasaran:</strong> {mod.target_type} (ID: {mod.target_id})</p>
                  {mod.notes && <p className="mt-1"><strong>Keterangan:</strong> {mod.notes}</p>}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle/70 dark:border-dark-border">
                  <button
                    onClick={() => handleUpdateModStatus(mod.id, 'Dismissed')}
                    className="px-4 py-2 rounded-xl border border-border-subtle text-xs text-secondary-ink dark:text-muted-text hover:bg-soft-surface transition-all font-medium"
                  >
                    Abaikan (Tidak Ada Pelanggaran)
                  </button>
                  <button
                    onClick={() => handleUpdateModStatus(mod.id, 'Action Taken')}
                    className="px-4 py-2 rounded-xl bg-error-destructive text-white text-xs font-semibold hover:brightness-110 active:scale-95 shadow-md shadow-error-destructive/20 transition-all"
                  >
                    Tindak Lanjut / Hapus
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : activeTab === 'staff' ? (
        /* STAFF VERIFICATION */
        <div className="glass-surface rounded-3xl border border-border-subtle/80 dark:border-white/10 overflow-hidden shadow-xs inner-light">
          <div className="p-5 border-b border-border-subtle/80 dark:border-dark-border">
            <h3 className="font-bold text-sm text-on-surface dark:text-surface-white">
              Daftar Petugas Lokasi Terverifikasi (Tanda Pengenal Kuning)
            </h3>
            <p className="text-xs text-muted-text mt-0.5">
              Akun yang berhak mencatat dan menyimpan fisik barang di brankas pos satpam/tata usaha.
            </p>
          </div>

          <div className="divide-y divide-border-subtle/60 dark:divide-dark-border/60 text-xs">
            {users
              .filter((u) => u.is_verified_staff)
              .map((u) => (
                <div key={u.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-soft-surface/50 dark:hover:bg-dark-canvas/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar_url} alt={u.name} className="w-11 h-11 rounded-full object-cover border border-border-subtle shadow-xs" />
                    <div>
                      <p className="font-bold text-on-surface dark:text-surface-white flex items-center gap-1.5">
                        {u.name}
                        <span className="material-symbols-outlined text-[16px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                          verified
                        </span>
                      </p>
                      <p className="text-muted-text">{u.institution}</p>
                      <p className="text-muted-text font-mono text-[10px] mt-0.5">ID: {u.staff_authority_id}</p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                    Otoritas Aktif
                  </span>
                </div>
              ))}
          </div>
        </div>
      ) : (
        /* CONTENT MANAGEMENT */
        <div className="glass-surface rounded-3xl border border-border-subtle/80 dark:border-white/10 overflow-hidden shadow-xs inner-light">
          <div className="p-5 border-b border-border-subtle/80 dark:border-dark-border">
            <h3 className="font-bold text-sm text-on-surface dark:text-surface-white">
              Daftar Laporan Publik Aktif
            </h3>
          </div>

          <div className="divide-y divide-border-subtle/60 dark:divide-dark-border/60 text-xs">
            {reports.map((r) => (
              <div key={r.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-soft-surface/50 dark:hover:bg-dark-canvas/50 transition-colors">
                <div className="flex items-center gap-3.5 min-w-0">
                  <img src={r.image_url} alt={r.title} className="w-12 h-12 rounded-2xl object-cover border border-border-subtle shrink-0 shadow-xs" />
                  <div className="min-w-0">
                    <p className="font-bold text-on-surface dark:text-surface-white truncate">{r.title}</p>
                    <p className="text-muted-text font-mono text-[11px] mt-0.5">{r.report_code} • {r.facility_location}</p>
                    <span className="text-[10px] text-secondary font-semibold mt-0.5 inline-block">Status: {r.status}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onSelectReport(r)}
                    className="px-3.5 py-1.5 rounded-xl border border-border-subtle text-xs hover:bg-soft-surface text-secondary-ink dark:text-muted-text font-medium transition-all"
                  >
                    Detail
                  </button>
                  <button
                    onClick={() => handleDeletePost(r.id)}
                    className="p-1.5 rounded-xl text-error-destructive hover:bg-error-destructive/10 transition-colors"
                    title="Hapus Laporan"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
};
