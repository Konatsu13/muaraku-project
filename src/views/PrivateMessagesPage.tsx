'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { db } from '../lib/supabase';
import { Conversation, PrivateMessage } from '../types';

export const PrivateMessagesPage: React.FC<{ onOpenModerationModal: (id: string) => void }> = ({
  onOpenModerationModal,
}) => {
  const { currentUser, isAuthenticated, openAuthModal, setTargetRedirect } = useAuth();
  const { showToast } = useToast();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>('conv-1');
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    }
  }, [currentUser, isAuthenticated]);

  useEffect(() => {
    if (activeConvId && isAuthenticated) {
      loadMessages(activeConvId);
    }
  }, [activeConvId, isAuthenticated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    setLoading(true);
    const convs = await db.getConversations();
    setConversations(convs);
    if (convs.length > 0 && !activeConvId) {
      setActiveConvId(convs[0].id);
    }
    setLoading(false);
  };

  const loadMessages = async (convId: string) => {
    const list = await db.getPrivateMessages(convId);
    setMessages(list);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser) return;

    try {
      const newMsg = await db.sendPrivateMessage(activeConvId, inputText, currentUser);
      setMessages((prev) => [...prev, newMsg]);
      setInputText('');
      loadConversations(); // refresh last message
    } catch {
      showToast('Gagal mengirim pesan.', 'error');
    }
  };

  if (!isAuthenticated || !currentUser) {
    return (
      <main className="flex-1 px-4 sm:px-8 py-16 max-w-md w-full mx-auto text-center space-y-4 animate-fade-in-up">
        <div className="card-premium rounded-3xl p-8 backdrop-blur-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-container/10 text-primary-container mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px]">forum</span>
          </div>
          <h2 className="font-headline-md text-xl font-bold text-on-surface dark:text-surface-white">
            Masuk untuk Mengakses Pesan
          </h2>
          <p className="text-xs text-secondary-ink dark:text-muted-text leading-relaxed">
            Percakapan privat seputar klaim barang dan serah terima memerlukan login akun warga terverifikasi.
          </p>
          <button
            onClick={() => {
              setTargetRedirect?.('messages');
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

  const activeConv = conversations.find((c) => c.id === activeConvId);

  return (
    <main className="flex-1 px-4 sm:px-8 py-6 max-w-[1440px] w-full mx-auto flex flex-col h-[calc(100vh-4rem)]">
      {/* Security Status Bar */}
      <div className="h-12 glass-surface border border-border-subtle/80 dark:border-white/10 px-4 sm:px-6 rounded-2xl flex items-center justify-between shrink-0 mb-4 shadow-sm inner-light">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-secondary/15 border border-secondary/25 text-secondary text-xs font-semibold">
            <span className="material-symbols-outlined text-[15px]">lock</span>
            <span>Saluran Terenkripsi E2EE Sipil</span>
          </div>
          <span className="text-muted-text text-xs hidden sm:inline">•</span>
          <span className="text-xs text-secondary-ink dark:text-muted-text hidden sm:inline">
            Setiap komunikasi tercatat pada audit integritas nomor klaim
          </span>
        </div>
      </div>

      {/* 2-Panel Messenger Container */}
      <div className="flex-1 glass-surface rounded-3xl border border-border-subtle/80 dark:border-white/10 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col md:flex-row inner-light">
        {/* Left: Conversation List (Width 320px) */}
        <div className="w-full md:w-80 border-r border-border-subtle/80 dark:border-dark-border flex flex-col bg-warm-canvas/40 dark:bg-dark-canvas/40 shrink-0">
          <div className="p-4 border-b border-border-subtle/80 dark:border-dark-border flex items-center justify-between">
            <h2 className="font-bold text-sm text-on-surface dark:text-surface-white tracking-tight">
              Percakapan Terkait Klaim
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-soft-surface dark:bg-dark-canvas text-secondary-ink dark:text-muted-text border border-border-subtle">
              {conversations.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-border-subtle/60 dark:divide-dark-border/60">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-text">
                Belum ada percakapan klaim aktif.
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = conv.id === activeConvId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`w-full p-4 text-left flex items-start gap-3 transition-all ${
                      isActive
                        ? 'bg-surface-white dark:bg-dark-surface border-l-4 border-primary-container shadow-xs'
                        : 'hover:bg-soft-surface/60 dark:hover:bg-dark-surface/40'
                    }`}
                  >
                    <img
                      src={
                        conv.other_user_avatar ||
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'
                      }
                      alt={conv.other_user_name}
                      className="w-10 h-10 rounded-full object-cover border border-border-subtle/80 shrink-0 mt-0.5 shadow-xs"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-on-surface dark:text-surface-white truncate">
                          {conv.other_user_name}
                        </span>
                        <span className="text-[10px] text-muted-text font-mono">{conv.last_message_time}</span>
                      </div>
                      <p className="text-[11px] font-mono text-primary-container font-semibold mt-0.5">
                        {conv.report_code}
                      </p>
                      <p className="text-xs text-secondary-ink dark:text-muted-text truncate mt-1">
                        {conv.last_message}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Message Workspace */}
        <div className="flex-1 flex flex-col justify-between bg-surface-white/60 dark:bg-dark-surface/60 min-w-0">
          {activeConv ? (
            <>
              {/* Active Conversation Header */}
              <div className="p-4 border-b border-border-subtle/80 dark:border-dark-border flex items-center justify-between bg-surface-white/80 dark:bg-dark-surface/80 backdrop-blur-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={
                      activeConv.other_user_avatar ||
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'
                    }
                    alt={activeConv.other_user_name}
                    className="w-10 h-10 rounded-full object-cover border border-border-subtle shrink-0 shadow-xs"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-on-surface dark:text-surface-white truncate">
                        {activeConv.other_user_name}
                      </span>
                      {activeConv.other_user_is_staff && (
                        <span
                          className="material-symbols-outlined text-amber-500 text-[16px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                          title="Petugas Pos Terverifikasi"
                        >
                          verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-text truncate">
                      Klaim Tiket: <strong className="text-on-surface dark:text-surface-white font-mono">{activeConv.report_code}</strong> — {activeConv.report_title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenModerationModal(activeConv.id)}
                    className="p-2 rounded-xl border border-border-subtle dark:border-dark-border hover:bg-soft-surface text-muted-text hover:text-error-destructive transition-colors"
                    title="Laporkan / Blokir Pengguna"
                  >
                    <span className="material-symbols-outlined text-[18px]">more_vert</span>
                  </button>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-4 bg-warm-canvas/40 dark:bg-dark-canvas/40 text-xs">
                {/* Security Advisory Badge */}
                <div className="p-3.5 rounded-2xl bg-primary-container/[0.04] border border-primary-container/20 text-center max-w-md mx-auto text-[11px] text-secondary-ink dark:text-muted-text inner-light">
                  <span className="material-symbols-outlined text-[16px] text-primary-container inline align-middle mr-1.5">
                    security
                  </span>
                  Jangan pernah mentransfer biaya tebusan atau uang muka. Serah terima resmi hanya berlangsung di pos satpam fasilitas ber-QR code.
                </div>

                {messages.map((msg) => {
                  const isMe = msg.sender_id === currentUser?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`p-3.5 rounded-2xl max-w-[85%] sm:max-w-lg leading-relaxed shadow-xs ${
                          isMe
                            ? 'bg-gradient-to-r from-primary-container to-amber-600 text-white rounded-br-xs'
                            : 'glass-surface border border-border-subtle/80 dark:border-white/10 text-on-surface dark:text-surface-white rounded-bl-xs'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-muted-text font-mono mt-1 px-1">{msg.timestamp}</span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Composer */}
              <form onSubmit={handleSend} className="p-3.5 border-t border-border-subtle/80 dark:border-dark-border flex items-center gap-2 bg-surface-white/80 dark:bg-dark-surface/80 backdrop-blur-xs">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ketik pesan koordinasi serah terima..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-warm-canvas/60 dark:bg-dark-canvas/60 border border-border-subtle dark:border-dark-border text-xs text-on-surface dark:text-surface-white focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
                />
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-gradient-to-r from-primary-container to-amber-600 hover:brightness-110 active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-primary-container/20 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  <span>Kirim</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-xs text-muted-text">
              Pilih percakapan di bilah kiri untuk memulai koordinasi klaim aman.
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
