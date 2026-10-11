"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import {
  Users,
  ShieldCheck,
  Send,
  Flag,
} from "lucide-react";
import { SafetyReportModal } from "@/components/safety/SafetyReportModal";

interface CommunityMessage {
  id: string;
  author: string;
  author_role?: string;
  text: string;
  time: string;
}

export default function CommunityChatPage() {
  const { user, profile } = useAuth();
  const { t } = useI18n();

  const [messages, setMessages] = useState<CommunityMessage[]>([
    {
      id: "cm-1",
      author: "Pak Bambang (Keamanan)",
      author_role: "Petugas Terverifikasi",
      text: "Selamat pagi semuanya. Di pos satpam barat baru saja dititipkan kunci motor Honda Vario gantungan biru. Pemilik silakan koordinasi lewat menu Finder ya.",
      time: "08:30 WIB",
    },
    {
      id: "cm-2",
      author: "Nadia Rahma",
      text: "Halo teman-teman, apakah ada yang melihat dompet cokelat lipat di sekitar perpus lantai 2 tadi siang? KTP dan kartu saya di situ semua 🙏",
      time: "11:15 WIB",
    },
    {
      id: "cm-3",
      author: "Dimas Aditya",
      text: "Halo Nadia, coba cek postingan temuan barusan deh, tadi ada yang laporin dompet juga di sekitar perpustakaan.",
      time: "11:20 WIB",
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [safetyModalOpen, setSafetyModalOpen] = useState(false);
  const [reportedMsg, setReportedMsg] = useState<string | null>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: CommunityMessage = {
      id: `cm-${Date.now()}`,
      author: profile?.display_name || user?.email?.split("@")[0] || "Warga MuaraKu",
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " WIB",
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              {t.community.title}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t.community.subtitle}
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Ruang Publik Terpantau
        </span>
      </div>

      {/* Community Guidelines Banner */}
      <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200/80 dark:border-zinc-800 flex items-start gap-3 text-xs text-zinc-600 dark:text-zinc-400">
        <ShieldCheck className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">{t.community.banner_title}:</strong>{" "}
          {t.community.banner_desc}
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4 custom-scrollbar bg-[#FFFCF8] dark:bg-[#18181B]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="p-4 rounded-2xl bg-white dark:bg-zinc-800/90 border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-orange-500/20 text-orange-600 font-bold text-xs flex items-center justify-center">
                  {msg.author.charAt(0)}
                </div>
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {msg.author}
                </span>
                {msg.author_role && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    {msg.author_role}
                  </span>
                )}
                <span className="text-[10px] text-zinc-400">• {msg.time}</span>
              </div>

              {/* Message Flag */}
              <button
                onClick={() => {
                  setReportedMsg(msg.text);
                  setSafetyModalOpen(true);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-rose-500 transition-opacity"
                title="Laporkan Pesan Ini"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed pl-9">
              {msg.text}
            </p>
          </div>
        ))}
      </div>

      {/* Message Composer */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-3"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t.community.type_placeholder}
          className="flex-1 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-40 transition-colors shadow-sm"
        >
          <Send className="w-4 h-4" />
          <span>{t.community.send}</span>
        </button>
      </form>

      {/* Safety Report Modal */}
      <SafetyReportModal
        isOpen={safetyModalOpen}
        onClose={() => setSafetyModalOpen(false)}
        targetType="message"
        targetId="global-chat-msg"
        targetTitle={reportedMsg || "Pesan Global Chat"}
      />
    </div>
  );
}
