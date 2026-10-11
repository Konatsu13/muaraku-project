import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { db } from '../lib/supabase';
import { GlobalChatMessage } from '../types';

export const GlobalChatPage: React.FC<{ onOpenModerationModal: (msgId: string) => void }> = ({
  onOpenModerationModal,
}) => {
  const { currentUser, isAuthenticated, openAuthModal, setTargetRedirect } = useAuth();
  const { showToast } = useToast();

  const [channel, setChannel] = useState<GlobalChatMessage['channel']>('Umum');
  const [messages, setMessages] = useState<GlobalChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadChat();
  }, [channel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChat = async () => {
    setLoading(true);
    const data = await db.getGlobalChatMessages(channel);
    setMessages(data);
    setLoading(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (!isAuthenticated || !currentUser) {
      setTargetRedirect?.('global-chat');
      openAuthModal?.('login');
      showToast('Silakan masuk terlebih dahulu untuk mengirim pesan.', 'info');
      return;
    }

    try {
      const sent = await db.sendGlobalChatMessage({
        user_id: currentUser.id,
        user_name: currentUser.name,
        user_avatar: currentUser.avatar_url,
        is_verified_staff: currentUser.is_verified_staff,
        role_tag: currentUser.role === 'staff' ? 'Petugas Lokasi' : 'Siswa',
        content: inputText,
        channel,
      });

      setMessages((prev) => [...prev, sent]);
      setInputText('');
    } catch {
      showToast('Gagal mengirim pesan chat.', 'error');
    }
  };

  return (
    <main className="flex-1 px-4 sm:px-8 py-7 max-w-[1440px] w-full mx-auto flex flex-col h-[calc(100vh-4.5rem)]">
      {/* Header with Channels with Apple Frosted Polish */}
      <div className="glass-surface p-5 sm:p-6 rounded-3xl border border-border-subtle/80 dark:border-dark-border/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 shrink-0 inner-light">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-headline-sm text-xl font-extrabold text-on-surface dark:text-surface-white tracking-tight">
              Global Chat Komunitas
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs">
              LIVE ROOM
            </span>
          </div>
          <p className="text-xs text-secondary-ink dark:text-muted-text mt-0.5">
            Saluran diskusi publik dan koordinasi temu kembali termoderasi 24 jam.
          </p>
        </div>

        {/* Channel selector */}
        <div className="flex items-center gap-1.5 p-1 glass-surface rounded-2xl border border-border-subtle/70 dark:border-dark-border/70">
          {(['Umum', 'Kampus & Sekolah', 'Stasiun & Pos'] as const).map((ch) => (
            <button
              key={ch}
              onClick={() => setChannel(ch)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                channel === ch
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs'
                  : 'text-secondary-ink dark:text-muted-text hover:text-on-surface'
              }`}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-3.5 glass-surface bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3 text-xs text-on-surface dark:text-surface-white mb-4 shrink-0 inner-light">
        <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[20px] shrink-0">
          shield
        </span>
        <p className="text-[11px] text-secondary-ink dark:text-muted-text leading-snug">
          <strong>Aturan Keselamatan Komunitas:</strong> Dilarang membagikan nomor rekening, meminta uang tebusan, atau membagikan kontak pribadi di ruang publik. Pelanggaran akan berakibat pemblokiran akun permanen.
        </p>
      </div>

      {/* Chat Stream Window */}
      <div className="flex-1 glass-surface rounded-3xl border border-border-subtle/80 dark:border-dark-border/80 shadow-[0_16px_40px_-10px_rgba(24,24,27,0.06)] p-5 sm:p-6 overflow-y-auto custom-scrollbar flex flex-col justify-between inner-light">
        <div className="space-y-4">
          {loading ? (
            <div className="p-8 text-center text-xs text-muted-text animate-pulse">
              Memuat siaran pesan...
            </div>
          ) : messages.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-text">
              Belum ada pesan di kanal ini. Mulailah menyapa komunitas!
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.user_id === currentUser?.id;
              return (
                <div key={msg.id} className="flex items-start gap-3.5 group">
                  <img
                    src={
                      msg.user_avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
                    }
                    alt={msg.user_name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-primary-container/20 border border-border-subtle shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-on-surface dark:text-surface-white">
                        {msg.user_name}
                      </span>
                      {msg.is_verified_staff && (
                        <span
                          className="material-symbols-outlined text-tertiary-container text-[14px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                          title="Petugas Lokasi Terverifikasi"
                        >
                          verified
                        </span>
                      )}
                      {msg.role_tag && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-soft-surface dark:bg-dark-canvas text-secondary-ink dark:text-muted-text border border-border-subtle/70 dark:border-dark-border">
                          {msg.role_tag}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-text">{msg.timestamp}</span>

                      {/* Flag report button on hover */}
                      {!isMe && (
                        <button
                          onClick={() => onOpenModerationModal(msg.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-muted-text hover:text-error-destructive transition-opacity"
                          title="Laporkan Pesan Ini"
                        >
                          <span className="material-symbols-outlined text-[14px]">flag</span>
                        </button>
                      )}
                    </div>

                    <div className="mt-1.5 p-3.5 rounded-2xl glass-surface border border-border-subtle/70 dark:border-dark-border text-xs text-on-surface dark:text-surface-white max-w-2xl leading-relaxed shadow-xs">
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Composer Form */}
        <form onSubmit={handleSend} className="pt-4 mt-4 border-t border-border-subtle/70 dark:border-dark-border flex items-center gap-2.5">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Tulis pesan di kanal #${channel}...`}
            className="flex-1 px-4 py-2.5 rounded-2xl glass-surface border border-border-subtle/80 dark:border-dark-border text-xs text-on-surface dark:text-surface-white focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all"
          />
          <button
            type="submit"
            className="h-10 px-5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
            <span>Kirim</span>
          </button>
        </form>
      </div>
    </main>
  );
};
export default GlobalChatPage;
