"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  MessageSquare,
  ShieldCheck,
  CheckCircle,
  Check,
} from "lucide-react";

interface NotificationItem {
  id: string;
  type: "match" | "message" | "claim" | "status";
  title: string;
  description: string;
  time: string;
  read: boolean;
  href: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "notif-1",
      type: "match",
      title: "Kecocokan AI Ditemukan (88%)",
      description: "Ada laporan temuan 'Dompet Lipat Kulit BB' yang cocok dengan laporan kehilangan Anda.",
      time: "25 menit lalu",
      read: false,
      href: "/app/reports/rep-002",
    },
    {
      id: "notif-2",
      type: "message",
      title: "Pesan Baru dari Pak Bambang",
      description: "Kunci sekarang disimpan di pos keamanan barat ya mas...",
      time: "1 jam lalu",
      read: false,
      href: "/app/messages",
    },
    {
      id: "notif-3",
      type: "claim",
      title: "Klaim Masuk Perlu Ditinjau",
      description: "Budi Santoso mengajukan klaim kepemilikan atas 'Kunci Motor Honda Vario'.",
      time: "2 jam lalu",
      read: true,
      href: "/app/finder",
    },
    {
      id: "notif-4",
      type: "status",
      title: "Barang Berhasil Dikembalikan",
      description: "Laporan 'KTM & Flazz BCA' telah ditandai selesai dan dikembalikan kepada pemilik.",
      time: "Kemarin",
      read: true,
      href: "/app/reports/rep-005",
    },
  ]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "match":
        return <Sparkles className="w-4 h-4 text-orange-500" />;
      case "message":
        return <MessageSquare className="w-4 h-4 text-emerald-600" />;
      case "claim":
        return <ShieldCheck className="w-4 h-4 text-amber-500" />;
      case "status":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 animate-fade-in pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Notifikasi Saya
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Pembaruan terkini terkait kecocokan AI, klaim kepemilikan, dan pesan Anda.
          </p>
        </div>

        <button
          onClick={markAllRead}
          className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Tandai Semua Dibaca</span>
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((notif) => (
          <Link
            key={notif.id}
            href={notif.href}
            className={`block p-4 sm:p-5 rounded-2xl border transition-all ${
              notif.read
                ? "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                : "bg-orange-500/[0.04] dark:bg-orange-500/[0.08] border-orange-500/30 text-zinc-900 dark:text-zinc-100 shadow-2xs"
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    {notif.title}
                  </h3>
                  <span className="text-[10px] text-zinc-400 whitespace-nowrap">
                    {notif.time}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {notif.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
