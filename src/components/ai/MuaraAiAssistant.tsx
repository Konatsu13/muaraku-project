'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export const MuaraAiAssistant: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Halo! Saya Muara AI, asisten sistem temu kembali sipil. Ada yang bisa saya bantu terkait pelaporan barang hilang, alur penemuan, atau pos petugas keamanan sekolah?',
    },
  ]);

  const quickPrompts = [
    'Bagaimana cara lapor barang hilang?',
    'Di mana pos penitipan resmi?',
    'Cara verifikasi klaim kepemilikan?',
    'Buka pencarian pintar N2L',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg: Message = { sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // Generate intelligent civic lost & found response
    setTimeout(() => {
      let aiReply = '';
      const lower = text.toLowerCase();

      if (lower.includes('hilang') || lower.includes('lapor')) {
        aiReply =
          'Untuk melaporkan barang hilang, Anda bisa mengklik tombol "+ Lapor Barang" di navbar atau tab Seeker. Pastikan mengisi bagian 1 (deskripsi publik) dan bagian 2 (ciri khusus rahasia terenkripsi) agar saat penemu mendaftarkan barang, sistem AI Matching dapat mencocokkan secara otomatis!';
      } else if (lower.includes('pos') || lower.includes('titip') || lower.includes('lokasi')) {
        aiReply =
          'Pos penitipan barang terverifikasi di sekolah/kampus berada di Pos Satpam Gerbang Utama, Meja Sirkulasi Perpustakaan Pusat, dan Ruang Tata Usaha. Seluruh penyerahan fisik tercatat dengan tanda terima digital resmi tanpa biaya pungutan.';
      } else if (lower.includes('klaim') || lower.includes('verifikasi')) {
        aiReply =
          'Pada kartu barang yang Anda temukan cocok, klik "Klaim Milik Saya". Anda akan diminta menjawab kuis ciri rahasia (misalnya isi dompet, jumlah uang, atau stiker tersembunyi). Jika jawaban valid, Anda akan terhubung ke chat privat dengan penemu.';
      } else if (lower.includes('cari') || lower.includes('n2l') || lower.includes('search')) {
        aiReply =
          'Anda dapat menggunakan menu "Cari Barang (N2L)". Anda bisa mengetik dengan bahasa kasual, contoh: "kunci motor beat dekat parkiran kemarin".';
        onNavigate('search');
      } else {
        aiReply =
          'Terima kasih atas pertanyaannya. MuaraKu dirancang untuk menghubungkan pencari (Seeker) dan penemu (Finder) secara aman tanpa risiko penipuan. Silakan periksa feed Eksplorasi atau buat laporan baru kapan saja.';
      }

      setIsTyping(false);
      setMessages((prev) => [...prev, { sender: 'ai', text: aiReply }]);
    }, 700);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 select-none">
      {/* Floating launcher trigger */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 sm:px-5 py-3.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 hover:brightness-110 active:scale-95 text-white font-semibold text-sm rounded-full shadow-[0_10px_30px_rgba(251,146,60,0.4)] hover:shadow-[0_14px_40px_rgba(251,146,60,0.55)] transition-all group ring-2 ring-white/50 dark:ring-white/15"
          title="Buka Asisten Muara AI"
        >
          <div className="relative flex items-center justify-center">
            <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center group-hover:rotate-12 transition-transform">
              <span className="material-symbols-outlined text-[19px]">smart_toy</span>
            </div>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 ring-1 ring-white" />
            </span>
          </div>
          <span className="font-semibold tracking-tight">Tanya Muara AI</span>
        </button>
      )}

      {/* Expandable chat panel */}
      {isOpen && (
        <div className="w-[330px] sm:w-[390px] h-[530px] max-h-[85vh] glass-header-premium bg-surface-white/95 dark:bg-dark-surface/95 backdrop-blur-2xl rounded-3xl border border-border-subtle/90 dark:border-white/10 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 inner-light">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner ring-1 ring-white/30">
                <span className="material-symbols-outlined text-[20px]">smart_toy</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm leading-tight tracking-tight">Muara AI Assistant</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white/40" />
                </div>
                <p className="text-[11px] text-white/85 leading-none mt-0.5">
                  Panduan Sipil & Temu Kembali Cerdas
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors active:scale-95"
              title="Tutup Chat"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Quick suggestions chips */}
          <div className="p-2.5 border-b border-border-subtle/70 dark:border-white/10 flex gap-1.5 overflow-x-auto no-scrollbar bg-soft-surface/50 dark:bg-dark-canvas/50">
            {quickPrompts.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap px-2.5 py-1 text-[11px] rounded-full glass-surface border border-border-subtle/80 dark:border-white/10 hover:border-primary-container/40 text-secondary-ink dark:text-muted-text hover:text-primary-container font-medium shrink-0 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-3.5">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-primary-container/15 text-primary-container flex items-center justify-center shrink-0 mt-0.5 border border-primary-container/20">
                    <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-tr-none font-medium'
                      : 'glass-surface border border-border-subtle/80 dark:border-white/10 text-on-surface dark:text-surface-white rounded-tl-none'
                  }`}
                >
                  {m.text}
                </div>
                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-soft-surface dark:bg-dark-border text-muted-text flex items-center justify-center shrink-0 mt-0.5 border border-border-subtle/80">
                    <span className="material-symbols-outlined text-[16px]">person</span>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-lg bg-primary-container/15 text-primary-container flex items-center justify-center shrink-0 mt-0.5 border border-primary-container/20">
                  <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                </div>
                <div className="glass-surface border border-border-subtle/80 dark:border-white/10 rounded-2xl rounded-tl-none px-4 py-2.5 flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input field */}
          <div className="p-3 border-t border-border-subtle/80 dark:border-white/10 bg-surface-white/80 dark:bg-dark-surface/80">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanyakan status atau cara klaim..."
                className="flex-1 h-9 px-3.5 text-xs rounded-xl input-premium text-on-surface dark:text-surface-white placeholder:text-muted-text focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-9 h-9 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 active:scale-95 text-white flex items-center justify-center shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                title="Kirim"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MuaraAiAssistant;
