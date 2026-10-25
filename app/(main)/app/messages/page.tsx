"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import {
  ArrowLeft,
  Ban,
  Flag,
  Loader2,
  MessageSquare,
  RefreshCw,
  Send,
  ShieldAlert,
} from "lucide-react";
import {
  ChatMessage,
  ConversationSummary,
  blockUser,
  fetchBlockedUserIds,
  fetchConversationMessages,
  fetchConversations,
  sendConversationMessage,
  unblockUser,
} from "@/lib/supabase/messages";
import { EmptyPattern } from "@/components/ui/patterns/EmptyPattern";
import { ErrorPattern } from "@/components/ui/patterns/ErrorPattern";
import { SafetyReportModal } from "@/components/safety/SafetyReportModal";

function formatTime(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function formatBubbleTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export default function MessagesPage() {
  const { user } = useAuth();

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [threadError, setThreadError] = useState<string | null>(null);

  const [composer, setComposer] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [reportTarget, setReportTarget] = useState<{ id: string; preview: string } | null>(null);
  const [userReportTarget, setUserReportTarget] = useState<string | null>(null);

  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());
  const [blockBusy, setBlockBusy] = useState(false);
  const [blockError, setBlockError] = useState<string | null>(null);
  const [confirmBlock, setConfirmBlock] = useState(false);

  const [listReloadKey, setListReloadKey] = useState(0);
  const [threadReloadKey, setThreadReloadKey] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const activeConversation = conversations.find((c) => c.id === activeId) || null;
  const partnerUserId = activeConversation?.partner_user_id || null;
  const partnerBlocked = partnerUserId ? blockedIds.has(partnerUserId) : false;

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetchBlockedUserIds().then((res) => {
      if (cancelled) return;
      if (res.error) {
        setBlockError(res.error.message);
        return;
      }
      setBlockedIds(res.data);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const res = await fetchConversations();
      if (cancelled) return;

      if (res.error) {
        setListError(res.error.message);
        setConversations([]);
        setActiveId(null);
      } else {
        setConversations(res.data);
        setListError(null);
        setActiveId((current) =>
          current && res.data.some((conversation) => conversation.id === current)
            ? current
            : null
        );

        // Support deep links from a report page: /app/messages?conversation=<id>
        if (typeof window !== "undefined") {
          const requested = new URLSearchParams(window.location.search).get("conversation");
          if (requested && res.data.some((conversation) => conversation.id === requested)) {
            setActiveId(requested);
            setLoadingThread(true);
            const url = new URL(window.location.href);
            url.searchParams.delete("conversation");
            window.history.replaceState({}, "", `${url.pathname}${url.search}`);
          }
        }
      }
      setLoadingList(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [listReloadKey]);

  useEffect(() => {
    if (!activeId) return;

    let cancelled = false;

    const load = async () => {
      const res = await fetchConversationMessages(activeId);
      if (cancelled) return;

      if (res.error) {
        setThreadError(res.error.message);
        setMessages([]);
      } else {
        setMessages(res.data);
        setThreadError(null);
      }
      setLoadingThread(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [activeId, threadReloadKey]);

  useEffect(() => {
    if (messages.length === 0) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeId || sending) return;

    const body = composer.trim();
    if (!body) return;

    setSending(true);
    setSendError(null);

    const res = await sendConversationMessage(activeId, body);
    if (res.error || !res.data) {
      setSendError(res.error?.message || "Gagal mengirim pesan");
      setSending(false);
      return;
    }

    const sent = {
      ...res.data,
      sender_name: res.data.is_own ? "Anda" : res.data.sender_name,
    };

    setMessages((prev) => [...prev, sent]);
    setComposer("");
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === activeId
          ? {
              ...conversation,
              last_message: body,
              last_message_at: sent.created_at,
              last_sender_id: sent.sender_id,
              unread: false,
            }
          : conversation
      )
    );
    setSending(false);
  };

  const handleRefreshList = () => {
    setLoadingList(true);
    setListError(null);
    setListReloadKey((key) => key + 1);
  };

  const handleSelectConversation = (conversationId: string) => {
    setActiveId(conversationId);
    setMessages([]);
    setThreadError(null);
    setSendError(null);
    setLoadingThread(true);
  };

  const handleRefreshThread = () => {
    if (!activeId) return;
    setThreadError(null);
    setLoadingThread(true);
    setThreadReloadKey((key) => key + 1);
  };

  const closeThread = () => {
    setActiveId(null);
    setMessages([]);
    setSendError(null);
    setBlockError(null);
    setConfirmBlock(false);
  };

  const handleBlockToggle = async () => {
    if (!partnerUserId || blockBusy) return;
    setBlockBusy(true);
    setBlockError(null);

    if (partnerBlocked) {
      const res = await unblockUser(partnerUserId);
      if (res.error) {
        setBlockError(res.error.message);
      } else {
        setBlockedIds((prev) => {
          const next = new Set(prev);
          next.delete(partnerUserId);
          return next;
        });
        setConfirmBlock(false);
      }
    } else {
      const res = await blockUser(partnerUserId);
      if (res.error) {
        setBlockError(res.error.message);
      } else {
        setBlockedIds((prev) => new Set(prev).add(partnerUserId));
        setConfirmBlock(false);
      }
    }

    setBlockBusy(false);
  };

  return (
    <div className="flex h-[calc(100dvh-11.75rem-env(safe-area-inset-bottom))] md:h-[calc(100vh-8rem)] flex-col gap-4 sm:gap-6 max-w-6xl mx-auto animate-fade-in">
      <div className="shrink-0 flex items-end justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Pesan
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Percakapan privat yang terhubung dengan laporan Anda
          </p>
        </div>
        <span className="text-xs text-zinc-500 tabular-nums">
          {conversations.length} percakapan
        </span>
      </div>

      <div className="flex flex-1 min-h-0 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214] overflow-hidden">
        {/* Conversation list */}
        <div
          className={`${
            activeId ? "hidden md:flex" : "flex"
          } w-full md:w-80 md:flex-shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-800`}
        >
          <div className="px-3 py-2.5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Daftar Percakapan
            </span>
            <button
              onClick={handleRefreshList}
              title="Muat ulang percakapan"
              aria-label="Muat ulang percakapan"
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-zinc-100 dark:divide-zinc-800/70">
            {loadingList ? (
              <div className="p-3 space-y-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 animate-pulse">
                    <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
                      <div className="h-2.5 w-full rounded bg-zinc-100 dark:bg-zinc-800/70" />
                    </div>
                  </div>
                ))}
              </div>
            ) : listError ? (
              <div className="p-4">
                <ErrorPattern message={listError} onRetry={handleRefreshList} />
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-4">
                <EmptyPattern
                  icon={<MessageSquare className="w-6 h-6" />}
                  title="Belum ada percakapan"
                  description="Percakapan privat akan muncul di sini setelah Anda terhubung dengan pemilik atau penemu barang melalui laporan."
                  className="border-0 bg-transparent dark:bg-transparent p-4"
                />
              </div>
            ) : (
              conversations.map((conversation) => {
                const isActive = conversation.id === activeId;
                return (
                  <button
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation.id)}
                    className={`w-full text-left flex items-start gap-3 px-3 py-3 min-h-[64px] transition-colors ${
                      isActive
                        ? "bg-orange-500/10 dark:bg-orange-500/15"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-semibold flex-shrink-0 border border-orange-500/20">
                      {conversation.partner_name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs truncate ${
                            conversation.unread
                              ? "font-bold text-zinc-900 dark:text-zinc-100"
                              : "font-semibold text-zinc-800 dark:text-zinc-200"
                          }`}
                        >
                          {conversation.partner_name}
                        </span>
                        <span className="text-[10px] text-zinc-400 whitespace-nowrap tabular-nums">
                          {formatTime(conversation.last_message_at)}
                        </span>
                      </div>

                      {conversation.context_report_title && (
                        <p className="text-[10px] text-orange-600 dark:text-orange-400 truncate mt-0.5">
                          {conversation.context_report_title}
                        </p>
                      )}

                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p
                          className={`text-[11px] truncate ${
                            conversation.unread
                              ? "text-zinc-700 dark:text-zinc-300 font-medium"
                              : "text-zinc-500 dark:text-zinc-400"
                          }`}
                        >
                          {conversation.last_message || "Belum ada pesan"}
                        </p>
                        {conversation.unread && (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0"
                            aria-label="Belum dibaca"
                          />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Thread */}
        <div className={`${activeId ? "flex" : "hidden md:flex"} flex-1 flex-col min-w-0`}>
          {activeConversation ? (
            <>
              <div className="px-3 sm:px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 bg-white dark:bg-[#121214]">
                <div className="flex items-center gap-2 min-w-0">
                  <button
                    onClick={closeThread}
                    aria-label="Kembali ke daftar percakapan"
                    className="md:hidden p-1.5 -ml-1 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {activeConversation.partner_name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {activeConversation.partner_name}
                    </p>
                    {activeConversation.context_report_title && activeConversation.context_report_id ? (
                      <Link
                        href={`/app/reports/${activeConversation.context_report_id}`}
                        className="text-[10px] text-orange-600 dark:text-orange-400 hover:underline truncate block"
                      >
                        Terkait: {activeConversation.context_report_title}
                      </Link>
                    ) : (
                      <p className="text-[10px] text-zinc-400">Percakapan privat</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {partnerUserId && (
                    <>
                      <button
                        onClick={() => setUserReportTarget(partnerUserId)}
                        title="Laporkan pengguna ini"
                        aria-label="Laporkan pengguna ini"
                        className="p-2 rounded-lg text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmBlock((value) => !value)}
                        title={partnerBlocked ? "Buka blokir pengguna" : "Blokir pengguna"}
                        aria-label={partnerBlocked ? "Buka blokir pengguna" : "Blokir pengguna"}
                        aria-pressed={partnerBlocked}
                        className={`p-2 rounded-lg transition-colors ${
                          partnerBlocked
                            ? "text-rose-600 bg-rose-50 dark:bg-rose-950/40"
                            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleRefreshThread}
                    title="Muat ulang pesan"
                    aria-label="Muat ulang pesan"
                    className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {(blockError || confirmBlock) && (
                <div className="px-3 sm:px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-[11px] space-y-2">
                  {blockError && (
                    <p className="text-rose-600 dark:text-rose-400 flex items-start gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <span>{blockError}</span>
                    </p>
                  )}
                  {confirmBlock && !blockError && (
                    <>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        {partnerBlocked
                          ? "Buka blokir pengguna ini? Kalian dapat mengirim pesan lagi setelah blokir dibuka."
                          : "Blokir pengguna ini? Kalian tidak dapat saling mengirim pesan selama blokir aktif."}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleBlockToggle}
                          disabled={blockBusy}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {blockBusy && <Loader2 className="w-3 h-3 animate-spin" />}
                          <span>{partnerBlocked ? "Buka Blokir" : "Blokir"}</span>
                        </button>
                        <button
                          onClick={() => setConfirmBlock(false)}
                          disabled={blockBusy}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800"
                        >
                          Batal
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="flex-1 overflow-y-auto custom-scrollbar px-3 sm:px-5 py-4 space-y-3 bg-zinc-50/40 dark:bg-[#18181B]">
                {loadingThread ? (
                  <div className="h-full flex flex-col items-center justify-center gap-2 text-zinc-400 text-xs">
                    <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                    <span>Memuat pesan...</span>
                  </div>
                ) : threadError ? (
                  <ErrorPattern message={threadError} onRetry={handleRefreshThread} />
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center gap-2 px-6">
                    <MessageSquare className="w-7 h-7 text-zinc-300 dark:text-zinc-700" />
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Belum ada pesan
                    </p>
                    <p className="text-[11px] text-zinc-500 max-w-xs">
                      Mulai percakapan dengan pesan yang sopan. Jangan meminta tebusan atau
                      membagikan data pribadi.
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`group flex flex-col ${message.is_own ? "items-end" : "items-start"}`}
                    >
                      {!message.is_own && (
                        <span className="text-[10px] text-zinc-500 mb-1 px-1">
                          {message.sender_name}
                        </span>
                      )}

                      <div
                        className={`max-w-[85%] sm:max-w-[70%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                          message.is_own
                            ? "bg-orange-500 text-white rounded-br-sm"
                            : "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-700/80 rounded-bl-sm"
                        } ${message.deleted_at ? "italic opacity-70" : ""}`}
                      >
                        {message.deleted_at
                          ? "Pesan ini telah dihapus"
                          : message.message_kind === "text"
                          ? message.body
                          : `Lampiran ${message.message_kind}`}
                      </div>

                      <div
                        className={`flex items-center gap-1.5 mt-1 px-1 text-[10px] text-zinc-400 ${
                          message.is_own ? "flex-row-reverse" : ""
                        }`}
                      >
                        <span className="tabular-nums">{formatBubbleTime(message.created_at)}</span>
                        {!message.is_own && !message.deleted_at && (
                          <button
                            onClick={() =>
                              setReportTarget({
                                id: message.id,
                                preview: message.body.slice(0, 60),
                              })
                            }
                            title="Laporkan pesan ini"
                            aria-label="Laporkan pesan ini"
                            className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1 rounded hover:text-rose-600"
                          >
                            <Flag className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={handleSend}
                className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214] p-2.5 sm:p-3"
              >
                {sendError && (
                  <p className="mb-2 text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{sendError}</span>
                  </p>
                )}

                {partnerBlocked && (
                  <p className="mb-2 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Ban className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Anda memblokir pengguna ini. Buka blokir untuk mengirim pesan.</span>
                  </p>
                )}

                <div className="flex items-end gap-2">
                  <textarea
                    rows={1}
                    value={composer}
                    onChange={(e) => setComposer(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    maxLength={5000}
                    disabled={partnerBlocked}
                    placeholder={
                      partnerBlocked
                        ? "Blokir aktif — pesan tidak dapat dikirim"
                        : "Tulis pesan yang sopan..."
                    }
                    className="flex-1 px-3 py-2.5 max-h-28 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={sending || partnerBlocked || !composer.trim()}
                    className="h-11 w-11 flex items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-40 transition-colors flex-shrink-0"
                    aria-label="Kirim pesan"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-3">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Pilih percakapan
              </p>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                Pilih salah satu percakapan di samping untuk membaca pesan.
              </p>
            </div>
          )}
        </div>
      </div>

      {user && reportTarget && (
        <SafetyReportModal
          isOpen={Boolean(reportTarget)}
          onClose={() => setReportTarget(null)}
          targetType="message"
          targetId={reportTarget.id}
          targetTitle={`Pesan: "${reportTarget.preview}..."`}
        />
      )}

      {user && userReportTarget && (
        <SafetyReportModal
          isOpen={Boolean(userReportTarget)}
          onClose={() => setUserReportTarget(null)}
          targetType="user"
          targetId={userReportTarget}
          targetTitle={activeConversation?.partner_name}
        />
      )}
    </div>
  );
}
