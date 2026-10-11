import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';

export const SupportPage: React.FC = () => {
  const { showToast } = useToast();
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    showToast('Tiket pengaduan bantuan berhasil dikirim ke koordinator layanan sekolah.', 'success');
    setTicketSubject('');
    setTicketMessage('');
  };

  return (
    <main className="flex-1 px-4 sm:px-8 py-7 max-w-[1080px] w-full mx-auto space-y-7 animate-fade-in-up">
      {/* Header Banner */}
      <div className="card-premium p-6 sm:p-8 rounded-3xl border border-border-subtle/80 dark:border-white/10 inner-light">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
            <span className="material-symbols-outlined text-[22px]">contact_support</span>
          </div>
          <div>
            <h1 className="font-headline-md text-xl sm:text-2xl font-extrabold text-on-surface dark:text-surface-white tracking-tight">
              Pusat Bantuan & Layanan Sipil
            </h1>
            <p className="text-xs text-secondary-ink dark:text-muted-text mt-0.5">
              Protokol serah terima aman, hotline 24 jam posko satpam, dan formulir pengaduan resmi civitas sekolah.
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Hotlines Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="card-premium p-6 rounded-3xl border border-border-subtle/80 dark:border-white/10 space-y-3 inner-light">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-primary-container flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-[24px]">shield</span>
          </div>
          <h3 className="font-bold text-sm text-on-surface dark:text-surface-white">Posko Satpam Sekolah</h3>
          <p className="text-xs text-secondary-ink dark:text-muted-text">Buka 24 Jam di Gerbang Utama & Pos Posko P1</p>
          <p className="text-xs font-mono font-bold text-primary-container pt-1">(021) 7890-1122 • Ext. 104</p>
        </div>

        <div className="card-premium p-6 rounded-3xl border border-border-subtle/80 dark:border-white/10 space-y-3 inner-light">
          <div className="w-12 h-12 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-[24px]">local_library</span>
          </div>
          <h3 className="font-bold text-sm text-on-surface dark:text-surface-white">Meja Sirkulasi Perpustakaan</h3>
          <p className="text-xs text-secondary-ink dark:text-muted-text">Penitipan laptop, buku paket, tumbler, & kartu pelajar</p>
          <p className="text-xs font-mono font-bold text-secondary pt-1">perpus@sekolah.id</p>
        </div>

        <div className="card-premium p-6 rounded-3xl border border-border-subtle/80 dark:border-white/10 space-y-3 inner-light">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-[24px]">train</span>
          </div>
          <h3 className="font-bold text-sm text-on-surface dark:text-surface-white">Pos Transit KRL & Halte</h3>
          <p className="text-xs text-secondary-ink dark:text-muted-text">Mitra Pengamanan Jalur Transportasi Sekolah</p>
          <p className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 pt-1">1500-TEMU (Bebas Pulsa)</p>
        </div>
      </div>

      {/* Safety SOP */}
      <section className="card-premium p-6 sm:p-7 rounded-3xl border border-border-subtle/80 dark:border-white/10 space-y-4 inner-light">
        <h2 className="font-title-md text-base font-bold text-on-surface dark:text-surface-white flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[22px]">verified</span>
          <span>Protokol Keamanan Serah Terima Barang Temuan</span>
        </h2>
        <ul className="space-y-3 text-xs text-secondary-ink dark:text-muted-text leading-relaxed">
          <li className="flex items-start gap-3">
            <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">check_circle</span>
            <span><strong className="text-on-surface dark:text-surface-white">Bebas Biaya Tebusan (Rp 0):</strong> Sistem MuaraKu beroperasi atas integritas sipil. Segera laporkan jika ada pihak yang meminta tebusan uang, pulsa, atau imbalan paksa.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">check_circle</span>
            <span><strong className="text-on-surface dark:text-surface-white">Titik Serah Terima Terverifikasi:</strong> Pertemukan penemu dan pemilik di lokasi resmi seperti pos satpam gerbang, meja piket guru, atau ruang tata usaha.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">check_circle</span>
            <span><strong className="text-on-surface dark:text-surface-white">Wajib Verifikasi Ciri Rahasia:</strong> Pencari barang wajib membuktikan kepemilikan dengan ciri rahasia SHA-256 yang cocok sebelum fisik diserahkan.</span>
          </li>
        </ul>
      </section>

      {/* Submit Help Ticket Form */}
      <section className="card-premium p-6 sm:p-7 rounded-3xl border border-border-subtle/80 dark:border-white/10 space-y-5 inner-light">
        <h2 className="font-title-md text-base font-bold text-on-surface dark:text-surface-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-container text-[22px]">support_agent</span>
          <span>Kirim Tiket Pengaduan atau Pertanyaan Resmi</span>
        </h2>

        <form onSubmit={handleSubmitTicket} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-on-surface dark:text-surface-white">
              Subjek Masalah
            </label>
            <input
              type="text"
              required
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
              placeholder="Misal: Kendala verifikasi barang di pos satpam gerbang utama"
              className="input-premium w-full px-4 py-2.5 rounded-xl text-xs text-on-surface dark:text-surface-white outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-on-surface dark:text-surface-white">
              Pesan / Keterangan Kendala
            </label>
            <textarea
              rows={3}
              required
              value={ticketMessage}
              onChange={(e) => setTicketMessage(e.target.value)}
              placeholder="Tuliskan kendala teknis atau pengaduan keamanan yang Anda temui secara lengkap..."
              className="input-premium w-full px-4 py-2.5 rounded-xl text-xs text-on-surface dark:text-surface-white outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            className="btn-premium px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
            <span>Kirim Pengaduan</span>
          </button>
        </form>
      </section>
    </main>
  );
};

export default SupportPage;
