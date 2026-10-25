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
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { SafetyReportModal } from "@/components/safety/SafetyReportModal";
import { deleteGlobalMessage, editGlobalMessage } from "@/lib/supabase/messages";

const GLOBAL_CONVERSATION_ID = "00000000-0000-4000-8000-000000000001";

interface DBMessage {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
  sender_name: string;
  edited_at: string | null;
  deleted_at: string | null;
}

export default function CommunityChatPage() {
  const { user, profile } = useAuth();
  const { t } = useI18n();
  const supabase = React.useMemo(() => createClient(), []);

  const [messages, setMessages] = useState<DBMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingMessageText, setEditingMessageText] = useState("");
  const [messageActionBusy, setMessageActionBusy] = useState<string | null>(null);

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
      // Verify the canonical Global Chat row exists before querying messages.
      const { data: conversation, error: conversationError } = await supabase
        .from("conversations")
        .select("id")
        .eq("id", GLOBAL_CONVERSATION_ID)
        .eq("kind", "global")
        .maybeSingle();

      if (conversationError) {
        setErrorMsg(conversationError.message);
        setLoading(false);
        return;
      }

      if (!conversation) {
        setErrorMsg(
          "Ruang Global Chat belum tersedia pada database ini. Hubungi administrator."
        );
        setLoading(false);
        return;
      }

      // Bounded read: latest 100 messages, then display oldest-first.
      const { data, error } = await supabase
        .from("messages")
        .select("id, sender_id, body, created_at, moderation_status, edited_at, deleted_at")
        .eq("conversation_id", GLOBAL_CONVERSATION_ID)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        setErrorMsg(error.message);
      } else if (data) {
        const rows = [...(data as Array<Record<string, unknown>>)].reverse();
        const senderIds = Array.from(new Set(rows.map((m) => String(m.sender_id))));

        const { data: profiles, error: profileError } = senderIds.length
          ? await supabase
              .from("user_profiles")
              .select("user_id, display_name")
              .in("user_id", senderIds)
          : { data: [], error: null };

        if (profileError) {
          setErrorMsg(profileError.message);
          setLoading(false);
          return;
        }

        const nameMap = new Map<string, string>();
        for (const profile of (profiles || []) as Array<{
          user_id: string;
          display_name: string | null;
        }>) {
          if (profile.display_name?.trim()) {
            nameMap.set(profile.user_id, profile.display_name.trim());
          }
        }

        const formatted: DBMessage[] = rows.map((m) => ({
          id: String(m.id),
          sender_id: String(m.sender_id),
          body: String(m.body || ""),
          created_at: String(m.created_at),
          sender_name: nameMap.get(String(m.sender_id)) || "Warga MuaraKu",
          edited_at: (m.edited_at as string | null) || null,
          deleted_at: (m.deleted_at as string | null) || null,
        }));
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
        async (payload: { new: Record<string, unknown> }) => {
          const newMsg = payload.new as {
            id: string;
            sender_id: string;
            body: string;
            created_at: string;
            edited_at: string | null;
            deleted_at: string | null;
          };

          // Fetch sender profile
          const { data: profData } = await supabase
            .from("user_profiles")
            .select("display_name")
            .eq("user_id", newMsg.sender_id)
            .maybeSingle();

          const incoming: DBMessage = {
            id: newMsg.id,
            sender_id: newMsg.sender_id,
            body: newMsg.body,
            created_at: newMsg.created_at,
            sender_name: profData?.display_name || "Warga MuaraKu",
            edited_at: newMsg.edited_at || null,
            deleted_at: newMsg.deleted_at || null,
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
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${GLOBAL_CONVERSATION_ID}`,
        },
        (payload: { new: Record<string, unknown> }) => {
          const changed = payload.new;
          setMessages((prev) =>
            prev.map((message) =>
              message.id === String(changed.id)
                ? {
                    ...message,
                    body: String(changed.body || ""),
                    edited_at: (changed.edited_at as string | null) || null,
                    deleted_at: (changed.deleted_at as string | null) || null,
                  }
                : message
            )
          );
        }
      )
      .subscribe((status: string) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setErrorMsg("Koneksi pesan langsung terputus. Muat ulang halaman untuk menyambung kembali.");
        }
      });

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
    if (textToSend.length > 5000) {
      setErrorMsg("Pesan maksimal 5000 karakter.");
      return;
    }
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
        })
        .select("id, created_at")
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
          edited_at: null,
          deleted_at: null,
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

  const handleEditMessage = async (e: React.FormEvent, messageId: string) => {
    e.preventDefault();
    if (messageActionBusy) return;

    setMessageActionBusy(messageId);
    setErrorMsg(null);
    const nextBody = editingMessageText.trim();
    const res = await editGlobalMessage(messageId, nextBody);
    if (res.error) {
      setErrorMsg(res.error.message);
    } else {
      const now = new Date().toISOString();
      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId
            ? { ...message, body: nextBody, edited_at: now }
            : message
        )
      );
      setEditingMessageId(null);
      setEditingMessageText("");
    }
    setMessageActionBusy(null);
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (messageActionBusy || !confirm("Hapus pesan ini dari Global Chat?")) return;

    setMessageActionBusy(messageId);
    setErrorMsg(null);
    const res = await deleteGlobalMessage(messageId);
    if (res.error) {
      setErrorMsg(res.error.message);
    } else {
      const now = new Date().toISOString();
      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId
            ? { ...message, body: "Pesan ini telah dihapus.", deleted_at: now }
            : message
        )
      );
      if (editingMessageId === messageId) {
        setEditingMessageId(null);
        setEditingMessageText("");
      }
    }
    setMessageActionBusy(null);
  };

  return (
    <div className="h-[calc(100dvh-11.75rem-env(safe-area-inset-bottom))] md:h-[calc(100vh-7.5rem)] flex flex-col rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 bg-white dark:bg-zinc-900 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold shadow-2xs">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              <span>{t.community.title}</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t.community.subtitle}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
          Ruang publik
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
        className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3.5 bg-canvas dark:bg-[#18181B] custom-scrollbar"
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
                    {msg.sender_name.charAt(0).toUpperCase()}
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
                    {editingMessageId === msg.id ? (
                      <form
                        onSubmit={(e) => handleEditMessage(e, msg.id)}
                        className="min-w-56 space-y-2"
                      >
                        <textarea
                          autoFocus
                          rows={2}
                          maxLength={5000}
                          value={editingMessageText}
                          onChange={(e) => setEditingMessageText(e.target.value)}
                          aria-label="Edit isi pesan"
                          className="w-full resize-y rounded-lg border border-white/30 bg-black/10 px-2.5 py-2 text-inherit outline-none focus:ring-2 focus:ring-white/50"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingMessageId(null);
                              setEditingMessageText("");
                            }}
                            className="inline-flex min-h-8 items-center gap-1 rounded-md px-2 text-[11px] hover:bg-black/10"
                          >
                            <X className="h-3.5 w-3.5" />
                            Batal
                          </button>
                          <button
                            type="submit"
                            disabled={!editingMessageText.trim() || messageActionBusy === msg.id}
                            className="inline-flex min-h-8 items-center gap-1 rounded-md bg-black/15 px-2 text-[11px] font-semibold disabled:opacity-50"
                          >
                            {messageActionBusy === msg.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                            Simpan
                          </button>
                        </div>
                      </form>
                    ) : (
                      <p className={`whitespace-pre-wrap break-words ${msg.deleted_at ? "italic opacity-75" : ""}`}>
                        {msg.deleted_at ? "Pesan ini telah dihapus." : msg.body}
                      </p>
                    )}

                    <div
                      className={`flex items-center justify-end gap-1.5 mt-1 text-[10px] ${
                        isOwn ? "text-orange-100" : "text-zinc-400"
                      }`}
                    >
                      <span>{timeStr}</span>
                      {msg.edited_at && !msg.deleted_at && <span>· diedit</span>}
                      {/* Flag action */}
                      {!isOwn && (
                        <button
                          onClick={() => {
                            setReportedMsg({ id: msg.id, text: msg.body });
                            setSafetyModalOpen(true);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-rose-500"
                          title="Laporkan pesan ini"
                          aria-label="Laporkan pesan ini"
                        >
                          <Flag className="w-3 h-3" />
                        </button>
                      )}
                      {isOwn && !msg.deleted_at && editingMessageId !== msg.id && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setErrorMsg(null);
                              setEditingMessageId(msg.id);
                              setEditingMessageText(msg.body);
                            }}
                            disabled={messageActionBusy === msg.id}
                            title="Edit pesan"
                            aria-label="Edit pesan"
                            className="rounded p-1 hover:bg-black/10"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(msg.id)}
                            disabled={messageActionBusy === msg.id}
                            title="Hapus pesan"
                            aria-label="Hapus pesan"
                            className="rounded p-1 hover:text-rose-500"
                          >
                            {messageActionBusy === msg.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </button>
                        </>
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
              Belum ada pesan
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
              Belum ada pesan di Global Chat. Sapa warga atau tanyakan info barang tertinggal dengan santun.
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
                ? t.community.type_placeholder_hint
                : t.community.type_placeholder_guest
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

      {/* Safety Report Modal — only rendered when a real message is the
          target, so no placeholder id can ever be submitted */}
      {reportedMsg && (
        <SafetyReportModal
          isOpen={safetyModalOpen}
          onClose={() => setSafetyModalOpen(false)}
          targetType="message"
          targetId={reportedMsg.id}
          targetTitle={`Pesan: "${reportedMsg.text.slice(0, 40)}..."`}
        />
      )}
    </div>
  );
}
