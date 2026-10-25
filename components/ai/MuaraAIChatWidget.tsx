"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bot, Send, Sparkles, User, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface ChatMessage {
  id: number;
  sender: "user" | "assistant";
  text: string;
  source?: string | null;
}

export function MuaraAIChatWidget() {
  const { t, locale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState("");
  const [lastFailedQuestion, setLastFailedQuestion] = useState("");
  const messageId = useRef(0);
  const historyRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [t.muara_ai.quick_1, t.muara_ai.quick_2, t.muara_ai.quick_3];

  useEffect(() => {
    const history = historyRef.current;
    if (history) history.scrollTop = history.scrollHeight;
  }, [messages, loading]);

  const sendQuestion = async (question: string, addUserMessage: boolean) => {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setError("");
    setLastFailedQuestion("");
    setLoading(true);
    if (addUserMessage) {
      setMessages((previous) => [
        ...previous,
        { id: ++messageId.current, sender: "user", text: trimmed },
      ]);
      setInput("");
    }

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, locale }),
      });
      const result = (await response.json()) as {
        error_code?: string;
        reply?: string;
        source?: string | null;
      };

      if (!response.ok || typeof result.reply !== "string" || !result.reply.trim()) {
        const message =
          response.status === 429
            ? t.muara_ai.rate_limited
            : response.status === 401
              ? t.muara_ai.sign_in_required
              : t.muara_ai.error;
        setError(message);
        setLastFailedQuestion(trimmed);
        return;
      }

      setMessages((previous) => [
        ...previous,
        {
          id: ++messageId.current,
          sender: "assistant",
          text: result.reply!.trim(),
          source: result.source,
        },
      ]);
    } catch {
      setError(t.muara_ai.error);
      setLastFailedQuestion(trimmed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] right-4 z-40 md:bottom-6 md:right-5">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-zinc-950 hover:bg-orange-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          <span>{t.muara_ai.widget_title}</span>
        </button>
      ) : (
        <section
          role="dialog"
          aria-labelledby="muara-ai-title"
          onKeyDown={(event) => {
            if (event.key === "Escape") setIsOpen(false);
          }}
          className="flex h-[min(34rem,calc(100dvh-8rem-env(safe-area-inset-bottom)))] w-[calc(100vw-2rem)] max-w-[380px] flex-col overflow-hidden rounded-xl border border-subtle bg-canvas text-main-text"
        >
          <header className="flex items-center justify-between gap-3 border-b border-subtle px-4 py-3">
            <div>
              <h2 id="muara-ai-title" className="text-sm font-semibold">
                {t.muara_ai.widget_title}
              </h2>
              <p className="mt-1 text-xs text-secondary-text">
                {t.muara_ai.widget_subtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
              aria-label={t.common.close}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </header>

          <div
            ref={historyRef}
            className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
            role="log"
            aria-live="polite"
            aria-relevant="additions text"
            aria-label={t.muara_ai.widget_title}
          >
            {messages.length === 0 ? (
              <div className="space-y-4">
                <p className="text-sm leading-6 text-secondary-text">
                  {t.muara_ai.first_use}
                </p>
                <div className="flex flex-col items-start gap-2">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      disabled={loading}
                      onClick={() => void sendQuestion(prompt, true)}
                      className="min-h-11 max-w-full rounded-md border border-subtle px-3 py-2 text-left text-sm hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] disabled:opacity-60"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-2.5 ${
                    message.sender === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <span
                    className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface text-secondary-text"
                    aria-hidden="true"
                  >
                    {message.sender === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </span>
                  <div
                    className={`max-w-[84%] rounded-lg px-3 py-2.5 text-sm leading-6 ${
                      message.sender === "user"
                        ? "bg-brand text-zinc-950"
                        : "bg-surface text-main-text"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.text}</p>
                    {message.source === "muaraku_help_safety" && (
                      <p className="mt-2 text-xs text-secondary-text">
                        {t.muara_ai.source_guidance}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}

            {loading && (
              <p className="text-sm text-secondary-text" role="status">
                {t.muara_ai.pending}
              </p>
            )}
          </div>

          <div className="space-y-3 border-t border-subtle p-3">
            {error && (
              <div className="space-y-2" role="alert">
                <p className="text-sm text-red-700">{error}</p>
                {lastFailedQuestion && (
                  <button
                    type="button"
                    onClick={() => void sendQuestion(lastFailedQuestion, false)}
                    disabled={loading}
                    className="min-h-11 text-sm font-medium text-trust underline-offset-4 hover:underline disabled:opacity-60"
                  >
                    {t.muara_ai.retry}
                  </button>
                )}
              </div>
            )}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void sendQuestion(input, true);
              }}
              className="flex items-center gap-2"
            >
              <label className="sr-only" htmlFor="muara-ai-input">
                {t.muara_ai.input_label}
              </label>
              <input
                id="muara-ai-input"
                type="text"
                value={input}
                maxLength={2_000}
                onChange={(event) => setInput(event.target.value)}
                placeholder={t.muara_ai.input_placeholder}
                className="min-h-11 min-w-0 flex-1 rounded-md border border-subtle bg-canvas px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                aria-label={t.muara_ai.send}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-brand text-zinc-950 hover:bg-orange-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-secondary-text">
              <p>{t.muara_ai.disclaimer}</p>
              <Link
                href="/support"
                className="min-h-11 inline-flex items-center font-medium text-trust underline-offset-4 hover:underline"
              >
                {t.muara_ai.human_support}
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
