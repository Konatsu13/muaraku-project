"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import {
  Send,
  ShieldAlert,
  Paperclip,
  Flag,
  UserX,
  CheckCheck,
  Search,
  MessageSquare,
} from "lucide-react";
import { SafetyReportModal } from "@/components/safety/SafetyReportModal";

interface Conversation {
  id: string;
  partner_name: string;
  partner_role?: string;
  partner_avatar?: string | null;
  report_title: string;
  report_id: string;
  last_message: string;
  last_time: string;
  unread: boolean;
  messages: {
    id: string;
    sender: "me" | "them";
    text: string;
    time: string;
  }[];
}

export default function MessagesPage() {
  const { t } = useI18n();

  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "conv-1",
      partner_name: "Pak Bambang (Keamanan)",
      partner_role: "Petugas Lokasi Terverifikasi",
      report_title: "Kunci Motor Honda Vario Gantungan Doraemon",
      report_id: "rep-001",
      last_message: "Kunci sekarang disimpan di pos keamanan barat ya mas.",
      last_time: "10:14 WIB",
      unread: true,
      messages: [
        {
          id: "m-1",
          sender: "them",
          text: "Halo mas, apakah betul ini kunci motor yang dicari?",
          time: "10:05",
        },
        {
          id: "m-2",
          sender: "me",
          text: "Iya betul pak, gantungan kunci Doraemon biru dengan alarm Honda.",
          time: "10:08",
        },
        {
          id: "m-3",
          sender: "them",
          text: "Baik, kunci sekarang disimpan di pos keamanan barat ya mas. Bisa diambil dengan membawa STNK asli.",
          time: "10:14",
        },
      ],
    },
    {
      id: "conv-2",
      partner_name: "Nadia Rahma",
      report_title: "Dompet Kulit Cokelat Braun Buffel",
      report_id: "rep-002",
      last_message: "Terima kasih banyak sudah membantu mencari dompet saya!",
      last_time: "Kemarin",
      unread: false,
      messages: [
        {
          id: "m-201",
          sender: "them",
          text: "Halo, saya melihat laporan temuan dompet mirip punya saya.",
          time: "Kemarin 14:20",
        },
        {
          id: "m-202",
          sender: "me",
          text: "Bisa sebutkan kartu apa saja yang ada di dalamnya?",
          time: "Kemarin 14:25",
        },
        {
          id: "m-203",
          sender: "them",
          text: "Terima kasih banyak sudah membantu mencari dompet saya!",
          time: "Kemarin 15:00",
        },
      ],
    },
  ]);

  const [activeConvId, setActiveConvId] = useState("conv-1");
  const [inputText, setInputText] = useState("");
  const [safetyModalOpen, setSafetyModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const activeConv = conversations.find((c) => c.id === activeConvId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: "me" as const,
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConvId) {
          return {
            ...c,
            last_message: newMsg.text,
            last_time: newMsg.time,
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    setInputText("");
  };

  const handleBlockUser = () => {
    if (confirm(`Yakin ingin memblokir ${activeConv?.partner_name}?`)) {
      alert("Pengguna telah diblokir.");
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden animate-fade-in">
      {/* LEFT PANEL: Conversation List */}
      <div className="w-full sm:w-80 md:w-96 border-r border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 space-y-3">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
            {t.messages.title}
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari obrolan..."
              className="w-full pl-9 pr-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/80 custom-scrollbar">
          {conversations.map((conv) => {
            const isSelected = conv.id === activeConvId;
            return (
              <button
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`w-full p-4 text-left flex items-start gap-3 transition-colors ${
                  isSelected
                    ? "bg-orange-500/10 dark:bg-orange-500/15"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                  {conv.partner_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {conv.partner_name}
                    </span>
                    <span className="text-[10px] text-zinc-400 whitespace-nowrap">
                      {conv.last_time}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 truncate mb-1">
                    {conv.report_title}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {conv.last_message}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL: Active Chat Conversation */}
      <div className="hidden sm:flex flex-1 flex-col justify-between bg-[#FFFCF8] dark:bg-[#18181B]">
        {activeConv ? (
          <>
            {/* Header: Partner & Linked Report Context */}
            <div className="p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-sm">
                  {activeConv.partner_name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                    <span>{activeConv.partner_name}</span>
                    {activeConv.partner_role && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold">
                        Petugas
                      </span>
                    )}
                  </h3>
                  <Link
                    href={`/app/reports/${activeConv.report_id}`}
                    className="text-xs text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
                  >
                    <span>Terkait: {activeConv.report_title}</span>
                  </Link>
                </div>
              </div>

              {/* Actions: Report & Block */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSafetyModalOpen(true)}
                  className="p-2 text-zinc-400 hover:text-rose-600 rounded-lg transition-colors"
                  title={t.messages.report_chat}
                >
                  <Flag className="w-4 h-4" />
                </button>
                <button
                  onClick={handleBlockUser}
                  className="p-2 text-zinc-400 hover:text-red-600 rounded-lg transition-colors"
                  title={t.messages.block_partner}
                >
                  <UserX className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Safety Reminder Banner */}
            <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{t.messages.safety_notice}</span>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
              {activeConv.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === "me" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`p-3.5 rounded-2xl max-w-md text-xs sm:text-sm leading-relaxed ${
                      msg.sender === "me"
                        ? "bg-orange-500 text-white rounded-br-xs"
                        : "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-bl-xs shadow-xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-1 px-1 flex items-center gap-1">
                    {msg.time}
                    {msg.sender === "me" && <CheckCheck className="w-3 h-3 text-orange-500" />}
                  </span>
                </div>
              ))}
            </div>

            {/* Message Composer */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-3"
            >
              <button
                type="button"
                className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg"
                title="Lampirkan Dokumen"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t.messages.type_placeholder}
                className="flex-1 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl disabled:opacity-40 transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-400">
            <MessageSquare className="w-12 h-12 mb-3 text-zinc-300 dark:text-zinc-700" />
            <p className="text-sm">{t.messages.select_chat}</p>
          </div>
        )}
      </div>

      {/* Safety Report Modal */}
      <SafetyReportModal
        isOpen={safetyModalOpen}
        onClose={() => setSafetyModalOpen(false)}
        targetType="message"
        targetId={activeConvId}
        targetTitle={activeConv?.partner_name}
      />
    </div>
  );
}
