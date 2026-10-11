"use client";

import React, { useState } from "react";
import { useI18n } from "@/lib/i18n";
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Loader2,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  time: string;
}

let chatCounter = 0;
function nextMessageId(prefix: string): string {
  chatCounter += 1;
  return `${prefix}-${chatCounter}`;
}

export function MuaraAIChatWidget() {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "ai",
      text: t.muara_ai.greeting,
      time: "Baru saja",
    },
  ]);

  const quickPrompts = [
    t.muara_ai.quick_1,
    t.muara_ai.quick_2,
    t.muara_ai.quick_3,
  ];

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: nextMessageId("usr"),
      sender: "user",
      text: textToSend.trim(),
      time: "Baru saja",
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInput("");
    setLoading(true);

    try {
      // Connect to AI API route or use knowledge-base fallback
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          id: nextMessageId("ai"),
          sender: "ai",
          text: data.reply,
          time: "Baru saja",
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error("Fallback needed");
      }
    } catch {
      // Intelligent built-in knowledge response fallback
      let reply = "Saya memahami pertanyaan Anda. Di MuaraKu, keamanan dan privasi adalah prioritas utama.";
      const lower = textToSend.toLowerCase();

      if (lower.includes("lapor") || lower.includes("hilang")) {
        reply = "Untuk melaporkan barang hilang, klik tombol '+ Buat Laporan' di sidebar atau header. Masukkan ciri umum untuk publik, lalu tuliskan ciri rahasia (nomor seri, isi tersembunyi) di kolom Bukti Privat agar tidak diketahui orang lain.";
      } else if (lower.includes("serah terima") || lower.includes("tips") || lower.includes("aman")) {
        reply = "Tips serah terima aman: 1) Bertemu di lokasi publik yang ramai (lobi kampus, posko keamanan), 2) Jangan pernah transfer uang muka atau tebusan, 3) Verifikasi ciri rahasia sebelum barang diserahkan.";
      } else if (lower.includes("klaim") || lower.includes("verifikasi")) {
        reply = "Untuk mengklaim barang, buka detail laporan barang temuan lalu klik 'Klaim Kepemilikan'. Anda akan diminta mengisi bukti kepemilikan privat yang hanya dapat dibaca oleh penemu barang.";
      } else if (lower.includes("petugas") || lower.includes("kuning")) {
        reply = "Badge kuning 'Petugas lokasi terverifikasi' menandakan staf resmi kampus, perpustakaan, atau stasiun yang telah diaudit oleh admin MuaraKu.";
      }

      const aiMsg: ChatMessage = {
        id: nextMessageId("ai"),
        sender: "ai",
        text: reply,
        time: "Baru saja",
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5"
          title="Buka Asisten Muara AI"
        >
          <Sparkles className="w-5 h-5 text-amber-200" />
          <span className="text-xs font-bold tracking-wide">Muara AI</span>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="w-[340px] sm:w-[380px] h-[520px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scale-up">
          {/* Header */}
          <div className="p-4 bg-orange-500 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">
                  {t.muara_ai.widget_title}
                </h3>
                <p className="text-[10px] text-orange-100">
                  {t.muara_ai.widget_subtitle}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#FFFCF8]/60 dark:bg-zinc-900/60 custom-scrollbar text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${
                  m.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${
                    m.sender === "user"
                      ? "bg-zinc-800 text-white"
                      : "bg-orange-500 text-white"
                  }`}
                >
                  {m.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>
                <div
                  className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                    m.sender === "user"
                      ? "bg-orange-500 text-white rounded-tr-xs"
                      : "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700/80 rounded-tl-xs shadow-xs"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-zinc-400 p-2 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                <span>Muara AI sedang mengetik...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-300 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
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
                placeholder={t.muara_ai.input_placeholder}
                className="flex-1 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl disabled:opacity-40 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <p className="text-[10px] text-zinc-400 text-center mt-2 leading-tight">
              {t.muara_ai.disclaimer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
