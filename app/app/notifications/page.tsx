"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCircle2,
  Loader2,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  fetchNotifications,
  markAllNotificationsRead,
  NotificationItem,
  NotificationType,
} from "@/lib/supabase/notifications";
import { EmptyPattern } from "@/components/ui/patterns/EmptyPattern";
import { ErrorPattern } from "@/components/ui/patterns/ErrorPattern";

const TYPE_LABEL: Record<NotificationType, string> = {
  new_message: "Pesan baru",
  possible_match: "Kemungkinan kecocokan",
  new_claim: "Klaim baru",
  claim_update: "Pembaruan klaim",
  report_update: "Pembaruan laporan",
  safety_report_update: "Pembaruan laporan keamanan",
  moderation_notice: "Pemberitahuan moderasi",
  support_reply: "Balasan dukungan",
  system: "Sistem",
};

function formatRelativeTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diffSeconds = Math.round((Date.now() - date.getTime()) / 1000);

  if (diffSeconds < 60) return "Baru saja";
  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function notificationHref(item: NotificationItem): string {
  if (item.report_id) return `/app/reports/${item.report_id}`;
  switch (item.notification_type) {
    case "new_message":
      return "/app/messages";
    case "new_claim":
    case "claim_update":
      return "/app/finder";
    case "support_reply":
      return "/support";
    case "safety_report_update":
    case "moderation_notice":
      return "/app/profile";
    default:
      return "/app";
  }
}

function NotificationIcon({ type }: { type: NotificationType }) {
  const base = "w-4 h-4";
  switch (type) {
    case "new_message":
      return <MessageSquare className={`${base} text-sky-600 dark:text-sky-400`} />;
    case "possible_match":
      return <Sparkles className={`${base} text-orange-600 dark:text-orange-400`} />;
    case "new_claim":
    case "claim_update":
      return <ShieldCheck className={`${base} text-emerald-600 dark:text-emerald-400`} />;
    case "report_update":
      return <CheckCircle2 className={`${base} text-emerald-600 dark:text-emerald-400`} />;
    case "safety_report_update":
    case "moderation_notice":
      return <AlertTriangle className={`${base} text-amber-600 dark:text-amber-400`} />;
    case "support_reply":
      return <MessageSquare className={`${base} text-zinc-600 dark:text-zinc-300`} />;
    default:
      return <Bell className={`${base} text-zinc-600 dark:text-zinc-300`} />;
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [marking, setMarking] = useState(false);
  const [markError, setMarkError] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const res = await fetchNotifications();
      if (cancelled) return;

      if (res.error) {
        setErrorMsg(res.error.message);
        setNotifications([]);
      } else {
        setNotifications(res.data);
        setErrorMsg(null);
      }
      setLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const unreadCount = notifications.filter((item) => !item.read_at).length;
  const visibleNotifications =
    tab === "unread" ? notifications.filter((item) => !item.read_at) : notifications;

  const handleMarkAllRead = async () => {
    if (marking || unreadCount === 0) return;
    setMarking(true);
    setMarkError(null);

    const res = await markAllNotificationsRead();

    if (res.error) {
      setMarkError(res.error.message);
      setMarking(false);
      return;
    }

    const readAt = new Date().toISOString();
    setNotifications((prev) =>
      prev.map((item) => (item.read_at ? item : { ...item, read_at: readAt }))
    );
    setMarking(false);
    window.dispatchEvent(new Event("muaraku_notifications_changed"));
  };

  const handleRefresh = () => {
    setLoading(true);
    setErrorMsg(null);
    setMarkError(null);
    setReloadKey((key) => key + 1);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in pb-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Notifikasi
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Pembaruan terkait laporan, klaim, pesan, dan moderasi Anda
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleRefresh}
            title="Muat ulang notifikasi"
            aria-label="Muat ulang notifikasi"
            className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={marking}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
            >
              {marking ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>Tandai dibaca</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setTab("all")}
          className={`px-3 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors ${
            tab === "all"
              ? "border-orange-500 text-zinc-900 dark:text-zinc-100"
              : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          Semua
          <span className="ml-1.5 text-[10px] font-medium text-zinc-400 tabular-nums">
            {notifications.length}
          </span>
        </button>
        <button
          onClick={() => setTab("unread")}
          className={`px-3 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors ${
            tab === "unread"
              ? "border-orange-500 text-zinc-900 dark:text-zinc-100"
              : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          Belum dibaca
          <span className="ml-1.5 text-[10px] font-medium text-zinc-400 tabular-nums">
            {unreadCount}
          </span>
        </button>
      </div>

      {markError && (
        <div className="rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 px-3.5 py-2.5 text-[11px] text-rose-700 dark:text-rose-300">
          Gagal menandai notifikasi: {markError}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214] divide-y divide-zinc-100 dark:divide-zinc-800/70">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-start gap-3 p-4 animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-2.5 w-full rounded bg-zinc-100 dark:bg-zinc-800/70" />
                <div className="h-2.5 w-1/3 rounded bg-zinc-100 dark:bg-zinc-800/70" />
              </div>
            </div>
          ))}
        </div>
      ) : errorMsg ? (
        <ErrorPattern message={errorMsg} onRetry={handleRefresh} />
      ) : visibleNotifications.length === 0 ? (
        <EmptyPattern
          icon={<Bell className="w-6 h-6" />}
          title={tab === "unread" ? "Tidak ada notifikasi belum dibaca" : "Belum ada notifikasi"}
          description={
            tab === "unread"
              ? "Semua notifikasi Anda sudah ditandai dibaca."
              : "Notifikasi akan muncul di sini saat ada pesan, klaim, kecocokan, atau pembaruan status laporan Anda."
          }
        />
      ) : (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214] overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800/70">
          {visibleNotifications.map((item) => {
            const isUnread = !item.read_at;
            return (
              <Link
                key={item.id}
                href={notificationHref(item)}
                className={`flex items-start gap-3 p-4 min-h-[72px] transition-colors ${
                  isUnread
                    ? "bg-orange-500/[0.04] dark:bg-orange-500/[0.08] hover:bg-orange-500/[0.07] dark:hover:bg-orange-500/[0.12]"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <NotificationIcon type={item.notification_type} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h2
                      className={`text-xs sm:text-sm ${
                        isUnread
                          ? "font-bold text-zinc-900 dark:text-zinc-100"
                          : "font-semibold text-zinc-800 dark:text-zinc-200"
                      }`}
                    >
                      {item.title}
                    </h2>
                    <span className="text-[10px] text-zinc-400 whitespace-nowrap tabular-nums flex-shrink-0">
                      {formatRelativeTime(item.created_at)}
                    </span>
                  </div>

                  {item.body && (
                    <p className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mt-0.5">
                      {item.body}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                      {TYPE_LABEL[item.notification_type] || "Notifikasi"}
                    </span>
                    {isUnread && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                        <span className="text-[10px] font-semibold text-orange-600 dark:text-orange-400">
                          Belum dibaca
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
