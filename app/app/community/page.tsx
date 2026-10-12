"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import {
  Users,
  ShieldCheck,
  Send,
  Flag,
  Loader2,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { SafetyReportModal } from "@/components/safety/SafetyReportModal";

const GLOBAL_CONVERSATION_ID = "00000000-0000-4000-8000-000000000001";

interface DBMessage {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
  sender_name: string;
  sender_avatar?: string | null;
  is_verified_staff?: boolean;
}

export default function CommunityChatPage() {
  const { user, profile } = useAuth();
  const { t, locale } = useI18n();
  const supabase = createClient();

  const [messages, setMessages] = useState<DBMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Safety report modal
  const [safetyModalOpen, setSafetyModalOpen] = useState(false);
  const [reportedMsg, setReportedMsg] = useState<{ id: string; text: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);

  // Scroll to bottom helper
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Track if user scrolled up
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 80;
    userScrolledUpRef.current = !isAtBottom;
  };

  // Load messages from Supabase
  const loadMessages = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          id,
          sender_id,
          body,
          created_at,
          moderation_status,
          user_profiles:sender_id (
            display_name,
            avatar_path
          )
        `)
        .eq("conversation_id", GLOBAL_CONVERSATION_ID)
        .order("created_at", { ascending: true });

      if (error) {
        setErrorMsg(error.message);
      } else if (data) {
        const formatted: DBMessage[] = (data as Array<Record<string, unknown>>).map((m) => {
          const rawProf = m.user_profiles;
          const prof = (Array.isArray(rawProf) ? rawProf[0] : rawProf) as { display_name?: string; avatar_path?: string } | null;
          return {
            id: String(m.id),
            sender_id: String(m.sender_id),
            body: String(m.body || ""),
            created_at: String(m.created_at),
            sender_name: prof?.display_name || "Warga MuaraKu",
            sender_avatar: prof?.avatar_path || null,
            is_verified_staff: false,
          };
        });
        setMessages(formatted);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memuat pesan";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Initial load
  useEffect(() => {
    let isMounted = true;
    (async () => {
      await loadMessages();
      if (isMounted) {
        scrollToBottom("auto");
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [loadMessages]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("public-global-chat")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${GLOBAL_CONVERSATION_ID}`,
        },
        async (payload) => {
          const newMsg = payload.new as {
            id: string;
            sender_id: string;
            body: string;
            created_at: string;
          };

          // Fetch sender profile
          const { data: profData } = await supabase
            .from("user_profiles")
            .select("display_name, avatar_path")
            .eq("user_id", newMsg.sender_id)
            .maybeSingle();

          const incoming: DBMessage = {
            id: newMsg.id,
            sender_id: newMsg.sender_id,
            body: newMsg.body,
            created_at: newMsg.created_at,
            sender_name: profData?.display_name || "Warga MuaraKu",
            sender_avatar: profData?.avatar_path || null,
            is_verified_staff: false,
          };

          setMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev;
            return [...prev, incoming];
          });

          if (!userScrolledUpRef.current) {
            setTimeout(() => scrollToBottom("smooth"), 50);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Handle Send Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || sending) return;

    if (!user) {
      setErrorMsg("Silakan masuk terlebih dahulu untuk mengirim pesan.");
      return;
    }

    const textToSend = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: GLOBAL_CONVERSATION_ID,
          sender_id: user.id,
          body: textToSend,
          message_kind: "text",
          moderation_status: "approved",
        })
        .select()
        .single();

      if (error) {
        setErrorMsg(error.message);
        setInputText(textToSend); // Restore unsent text
      } else if (data) {
        const optimistic: DBMessage = {
          id: data.id,
          sender_id: user.id,
          body: textToSend,
          created_at: data.created_at,
          sender_name: profile?.display_name || "Anda",
          sender_avatar: profile?.avatar_path || null,
        };

        setMessages((prev) => {
          if (prev.some((m) => m.id === optimistic.id)) return prev;
          return [...prev, optimistic];
        });

        userScrolledUpRef.current = false;
        setTimeout(() => scrollToBottom("smooth"), 50);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengirim pesan";
      setErrorMsg(msg);
      setInputText(textToSend);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-[calc(100vh-7.5rem)] flex flex-col rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 bg-white dark:bg-zinc-900 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold shadow-2xs">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
              <span>{t.community.title}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t.community.subtitle}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
          Reset Harian 00:00 WIB
        </span>
      </div>

      {/* Community Guidelines Banner */}
      <div className="px-5 py-2.5 bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-200/80 dark:border-zinc-800 flex items-start gap-3 text-xs text-zinc-600 dark:text-zinc-400">
        <ShieldCheck className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">{t.community.banner_title}:</strong>{" "}
          {t.community.banner_desc}
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="mx-4 mt-3 flex items-center justify-between p-3 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-[11px] font-bold underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Messages Stream */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3.5 bg-[#FFFCF8] dark:bg-[#18181B] custom-scrollbar"
      >
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-3 text-zinc-400">
            <Loader2 className="w-7 h-7 animate-spin text-orange-500" />
            <p className="text-xs">Memuat percakapan publik...</p>
          </div>
        ) : messages.length > 0 ? (
          messages.map((msg) => {
            const isOwn = user?.id === msg.sender_id;
            const timeStr = new Date(msg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 group ${isOwn ? "justify-end" : "justify-start"}`}
              >
                {/* Other user's avatar */}
                {!isOwn && (
                  <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-700 dark:text-zinc-300 flex-shrink-0 mt-1">
                    {msg.sender_avatar ? (
                      <img src={msg.sender_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      msg.sender_name.charAt(0).toUpperCase()
                    )}
                  </div>
                )}

                {/* Message Bubble Container */}
                <div className={`max-w-[82%] sm:max-w-[70%] space-y-1 ${isOwn ? "items-end" : "items-start"}`}>
                  {/* Sender metadata for other users */}
                  {!isOwn && (
                    <div className="flex items-center gap-1.5 pl-1">
                      <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
                        {msg.sender_name}
                      </span>
                      {msg.is_verified_staff && (
                        <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Petugas
                        </span>
                      )}
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={`relative p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                      isOwn
                        ? "bg-orange-500 text-white rounded-tr-xs"
                        : "bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-800 dark:text-zinc-100 rounded-tl-xs"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.body}</p>

                    <div
                      className={`flex items-center justify-end gap-1.5 mt-1 text-[10px] ${
                        isOwn ? "text-orange-100" : "text-zinc-400"
                      }`}
                    >
                      <span>{timeStr}</span>
                      {/* Flag action */}
                      {!isOwn && (
                        <button
                          onClick={() => {
                            setReportedMsg({ id: msg.id, text: msg.body });
                            setSafetyModalOpen(true);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-rose-500"
                          title="Laporkan pesan ini"
                        >
                          <Flag className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-200/60 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              Belum Ada Pesan Hari Ini
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
              Global Chat dibersihkan otomatis setiap pergantian hari. Sapa warga atau tanyakan info barang tertinggal dengan santun.
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 sm:p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-end gap-2.5"
      >
        <div className="flex-1 relative">
          <textarea
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              user
                ? locale === "en"
                  ? "Write a message... (Enter to send, Shift+Enter for new line)"
                  : "Ketik pesan publik... (Enter untuk kirim, Shift+Enter baris baru)"
                : "Masuk terlebih dahulu untuk mengirim pesan"
            }
            disabled={!user || sending}
            className="w-full px-4 py-3 max-h-32 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none transition-all disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={!inputText.trim() || sending || !user}
          className="h-11 px-5 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 disabled:opacity-40 transition-all shadow-sm flex-shrink-0"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">{t.community.send}</span>
        </button>
      </form>

      {/* Safety Report Modal */}
      <SafetyReportModal
        isOpen={safetyModalOpen}
        onClose={() => setSafetyModalOpen(false)}
        targetType="message"
        targetId={reportedMsg?.id || "global-chat-msg"}
        targetTitle={reportedMsg?.text ? `Pesan: "${reportedMsg.text.slice(0, 40)}..."` : "Pesan Global Chat"}
      />
    </div>
  );
}
