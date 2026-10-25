"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { useAuth } from "@/lib/auth";
import { useI18n, type Dictionary } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

type TicketStatus =
  | "open"
  | "in_progress"
  | "waiting_for_user"
  | "resolved"
  | "closed";

interface SupportTicket {
  id: string;
  category: string;
  subject: string;
  initial_message: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
}

interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_user_id: string | null;
  body: string;
  created_at: string;
}

const ticketCategories = [
  "general",
  "account",
  "report",
  "claim",
  "safety",
  "privacy",
  "technical",
  "other",
] as const;

const categoryLabelKeys: Record<
  (typeof ticketCategories)[number],
  keyof Dictionary["support_form"]
> = {
  general: "category_general",
  account: "category_account",
  report: "category_report",
  claim: "category_claim",
  safety: "category_safety",
  privacy: "category_privacy",
  technical: "category_technical",
  other: "category_other",
};

const statusLabels: Record<TicketStatus, keyof Dictionary["support_form"]> = {
  open: "status_open",
  in_progress: "status_in_progress",
  waiting_for_user: "status_waiting_for_user",
  resolved: "status_resolved",
  closed: "status_closed",
};

export default function SupportPage() {
  const { user, roles, isAdmin } = useAuth();
  const { t, locale } = useI18n();
  const supabase = useMemo(() => createClient(), []);
  const [emailOverride, setEmailOverride] = useState<{ userId: string; value: string } | null>(null);
  const [category, setCategory] = useState<(typeof ticketCategories)[number]>("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedTicket, setSavedTicket] = useState<SupportTicket | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [historyError, setHistoryError] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketMessages, setTicketMessages] = useState<TicketMessage[]>([]);
  const [ticketReply, setTicketReply] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const messageRequestId = useRef(0);
  const selectedTicketId = useRef<string | null>(null);
  const email =
    emailOverride && user && emailOverride.userId === user.id
      ? emailOverride.value
      : user?.email || "";

  const loadTickets = useCallback(async () => {
    if (!user) {
      setTickets([]);
      return;
    }

    setLoadingTickets(true);
    setHistoryError(false);
    const { data, error: queryError } = await supabase
      .from("support_tickets")
      .select("id, category, subject, initial_message, status, created_at, updated_at")
      .eq("owner_user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(10);

    if (queryError) {
      setHistoryError(true);
    } else {
      setTickets((data || []) as SupportTicket[]);
    }
    setLoadingTickets(false);
  }, [supabase, user]);

  const loadTicketMessages = useCallback(async (ticket: SupportTicket) => {
    const requestId = ++messageRequestId.current;
    try {
      const { data, error: queryError } = await supabase
        .from("support_ticket_messages")
        .select("id, ticket_id, sender_user_id, body, created_at")
        .eq("ticket_id", ticket.id)
        .eq("is_internal", false)
        .order("created_at", { ascending: true })
        .limit(50);

      if (requestId !== messageRequestId.current) return;
      if (queryError) {
        setMessagesError(true);
      } else {
        setMessagesError(false);
        setTicketMessages((data || []) as TicketMessage[]);
      }
    } catch (error) {
      console.error("Support ticket conversation load failed:", error);
      if (requestId === messageRequestId.current) setMessagesError(true);
    } finally {
      if (requestId === messageRequestId.current) setLoadingMessages(false);
    }
  }, [supabase]);

  useEffect(() => {
    // The loader updates state after its Supabase request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    selectedTicketId.current = selectedTicket?.id ?? null;
    // The loader updates state after its Supabase request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (selectedTicket) void loadTicketMessages(selectedTicket);
    return () => {
      messageRequestId.current += 1;
    };
  }, [loadTicketMessages, selectedTicket]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || saving) return;

    setSaving(true);
    setError("");
    setSavedTicket(null);

    try {
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });
      const result = (await response.json()) as {
        error_code?: string;
        ticket?: SupportTicket;
      };

      if (!response.ok || !result.ticket) {
        setError(
          response.status === 429
            ? t.support_form.too_many_requests
            : response.status === 400
              ? t.support_form.invalid_fields
              : t.support_form.submit_error
        );
        return;
      }

      setSavedTicket(result.ticket);
      selectedTicketId.current = result.ticket.id;
      setSelectedTicket(result.ticket);
      setTicketMessages([]);
      setLoadingMessages(true);
      setSubject("");
      setMessage("");
      await loadTickets();
    } catch {
      setError(t.support_form.submit_error);
    } finally {
      setSaving(false);
    }
  };

  const handleReply = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !selectedTicket || !ticketReply.trim() || sendingReply) return;

    const ticketId = selectedTicket.id;
    setSendingReply(true);
    setMessagesError(false);
    try {
      const { data, error: insertError } = await supabase
        .from("support_ticket_messages")
        .insert({
          ticket_id: ticketId,
          sender_user_id: user.id,
          body: ticketReply.trim(),
        })
        .select("id, ticket_id, sender_user_id, body, created_at")
        .single();

      if (insertError || !data) {
        setMessagesError(true);
      } else if (selectedTicketId.current === ticketId) {
        setTicketMessages((previous) => [...previous, data as TicketMessage]);
        setTicketReply("");
      }
    } catch (error) {
      console.error("Support ticket reply failed:", error);
      setMessagesError(true);
    } finally {
      setSendingReply(false);
    }
  };

  const dateLocale = locale === "id" ? "id-ID" : "en-US";
  const hasSupportAccess = isAdmin || roles.includes("support");

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-main-text">
      <PublicNavbar />
      <main className="flex-1 py-10 sm:py-14">
        <div className="mx-auto w-full max-w-5xl space-y-8 px-4 sm:px-6">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl space-y-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {t.support_form.title}
              </h1>
              <p className="text-sm leading-6 text-secondary-text">
                {t.support_form.description}
              </p>
            </div>
            {hasSupportAccess && (
              <Link
                href="/admin/support"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-subtle px-4 text-sm font-semibold hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
              >
                {t.staff_support.title}
              </Link>
            )}
          </header>

          <div className="grid items-start gap-6 lg:grid-cols-[0.78fr_1.22fr]">
            <aside className="space-y-6">
              <section className="border-l-2 border-brand pl-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-trust" aria-hidden="true" />
                  <h2 className="text-base font-semibold">
                    {t.support_form.safety_title}
                  </h2>
                </div>
                <p className="mt-2 text-sm leading-6 text-secondary-text">
                  {t.support_form.safety_body}
                </p>
              </section>

              {user && (
                <section aria-labelledby="support-history-title">
                  <div className="flex items-center justify-between gap-3">
                    <h2 id="support-history-title" className="text-base font-semibold">
                      {t.support_form.history_title}
                    </h2>
                    <button
                      type="button"
                      onClick={() => void loadTickets()}
                      disabled={loadingTickets}
                      className="min-h-11 px-2 text-sm font-medium text-trust underline-offset-4 hover:underline disabled:opacity-60"
                    >
                      {t.support_form.history_retry}
                    </button>
                  </div>

                  {loadingTickets && (
                    <p className="mt-3 text-sm text-secondary-text" role="status">
                      {t.support_form.loading}
                    </p>
                  )}
                  {!loadingTickets && historyError && (
                    <p className="mt-3 text-sm text-secondary-text" role="alert">
                      {t.support_form.history_error}
                    </p>
                  )}
                  {!loadingTickets && !historyError && tickets.length === 0 && (
                    <p className="mt-3 text-sm text-secondary-text">
                      {t.support_form.history_empty}
                    </p>
                  )}
                  {!loadingTickets && !historyError && tickets.length > 0 && (
                    <ul className="mt-3 divide-y divide-subtle border-y border-subtle">
                      {tickets.map((ticket) => (
                        <li key={ticket.id} className="py-3">
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedTicket?.id === ticket.id) return;
                              selectedTicketId.current = ticket.id;
                              setTicketMessages([]);
                              setTicketReply("");
                              setMessagesError(false);
                              setLoadingMessages(true);
                              setSelectedTicket(ticket);
                            }}
                            aria-current={selectedTicket?.id === ticket.id ? "true" : undefined}
                            className="flex min-h-11 w-full items-start justify-between gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{ticket.subject}</p>
                              <p className="mt-1 text-xs text-secondary-text">
                                {new Date(ticket.updated_at).toLocaleDateString(dateLocale)}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-md bg-surface px-2 py-1 text-xs text-secondary-text">
                              {t.support_form[statusLabels[ticket.status]]}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}
            </aside>

            <section className="rounded-xl border border-subtle bg-surface p-5 sm:p-7">
              <h2 className="text-lg font-semibold">{t.support_form.form_title}</h2>

              {!user ? (
                <div className="mt-5 space-y-3">
                  <p className="text-sm leading-6 text-secondary-text">
                    {t.support_form.sign_in_body}
                  </p>
                  <Link
                    href="/?auth=login&next=%2Fsupport"
                    className="inline-flex min-h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-zinc-950 hover:bg-orange-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
                  >
                    {t.support_form.sign_in_action}
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  <div>
                    <label htmlFor="support-email" className="mb-2 block text-sm font-medium">
                      {t.support_form.email}
                    </label>
                    <input
                      id="support-email"
                      type="email"
                      required
                      maxLength={320}
                      autoComplete="email"
                      value={email}
                      onChange={(event) =>
                        user && setEmailOverride({ userId: user.id, value: event.target.value })
                      }
                      className="min-h-11 w-full rounded-md border border-subtle bg-canvas px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
                    />
                  </div>

                  <div>
                    <label htmlFor="support-category" className="mb-2 block text-sm font-medium">
                      {t.support_form.category}
                    </label>
                    <select
                      id="support-category"
                      value={category}
                      onChange={(event) =>
                        setCategory(event.target.value as (typeof ticketCategories)[number])
                      }
                      className="min-h-11 w-full rounded-md border border-subtle bg-canvas px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
                    >
                      {ticketCategories.map((value) => (
                        <option key={value} value={value}>
                          {t.support_form[categoryLabelKeys[value]]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="support-subject" className="mb-2 block text-sm font-medium">
                      {t.support_form.subject}
                    </label>
                    <input
                      id="support-subject"
                      type="text"
                      required
                      minLength={3}
                      maxLength={180}
                      value={subject}
                      onChange={(event) => setSubject(event.target.value)}
                      placeholder={t.support_form.subject_placeholder}
                      className="min-h-11 w-full rounded-md border border-subtle bg-canvas px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
                    />
                  </div>

                  <div>
                    <label htmlFor="support-message" className="mb-2 block text-sm font-medium">
                      {t.support_form.message}
                    </label>
                    <textarea
                      id="support-message"
                      required
                      minLength={10}
                      maxLength={5000}
                      rows={5}
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder={t.support_form.message_placeholder}
                      className="w-full resize-y rounded-md border border-subtle bg-canvas px-3 py-2.5 text-sm leading-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
                    />
                  </div>

                  {error && (
                    <p className="flex items-start gap-2 text-sm text-red-700" role="alert">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      {error}
                    </p>
                  )}
                  {savedTicket && (
                    <div className="space-y-2 rounded-md bg-surface p-4" role="status" aria-live="polite">
                      <p className="flex items-center gap-2 text-sm font-semibold">
                        <CheckCircle2 className="h-4 w-4 text-green-700" aria-hidden="true" />
                        {t.support_form.success_title}
                      </p>
                      <p className="text-sm text-secondary-text">{t.support_form.success_body}</p>
                      <code className="block break-all text-xs text-main-text">{savedTicket.id}</code>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-zinc-950 hover:bg-orange-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {saving ? t.support_form.submitting : t.support_form.submit}
                  </button>
                </form>
              )}
              {user && selectedTicket && (
                <section className="mt-8 border-t border-subtle pt-6" aria-labelledby="ticket-thread-title">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 id="ticket-thread-title" className="text-base font-semibold">
                        {t.support_form.ticket_thread}
                      </h3>
                      <p className="mt-1 break-words text-sm text-secondary-text">
                        {selectedTicket.subject}
                      </p>
                    </div>
                    <span className="rounded-md bg-surface px-2 py-1 text-xs text-secondary-text">
                      {t.support_form[statusLabels[selectedTicket.status]]}
                    </span>
                  </div>
                  <div className="mt-4 max-h-80 space-y-3 overflow-y-auto" aria-live="polite">
                    <article className="rounded-lg bg-surface p-3">
                      <p className="mb-2 text-xs text-secondary-text">
                        {new Date(selectedTicket.created_at).toLocaleString(dateLocale)}
                      </p>
                      <p className="whitespace-pre-wrap break-words text-sm leading-6">
                        {selectedTicket.initial_message}
                      </p>
                    </article>
                    {loadingMessages && (
                      <p className="text-sm text-secondary-text" role="status">
                        {t.support_form.loading}
                      </p>
                    )}
                    {messagesError && (
                      <p className="text-sm text-red-700" role="alert">
                        {t.support_form.reply_error}
                      </p>
                    )}
                    {!loadingMessages && !messagesError && ticketMessages.length === 0 && (
                      <p className="text-sm text-secondary-text">
                        {t.support_form.messages_empty}
                      </p>
                    )}
                    {ticketMessages.map((ticketMessage) => (
                      <article
                        key={ticketMessage.id}
                        className={`rounded-lg p-3 ${
                          ticketMessage.sender_user_id === user.id
                            ? "ml-8 bg-brand/10"
                            : "mr-8 bg-surface"
                        }`}
                      >
                        <p className="mb-2 text-xs text-secondary-text">
                          {new Date(ticketMessage.created_at).toLocaleString(dateLocale)}
                        </p>
                        <p className="whitespace-pre-wrap break-words text-sm leading-6">
                          {ticketMessage.body}
                        </p>
                      </article>
                    ))}
                  </div>
                  <form onSubmit={handleReply} className="mt-4 space-y-3">
                    <label htmlFor="support-ticket-reply" className="block text-sm font-medium">
                      {t.support_form.ticket_reply}
                    </label>
                    <textarea
                      id="support-ticket-reply"
                      value={ticketReply}
                      onChange={(event) => setTicketReply(event.target.value)}
                      maxLength={5000}
                      minLength={1}
                      required
                      rows={3}
                      disabled={
                        selectedTicket.status === "resolved" ||
                        selectedTicket.status === "closed"
                      }
                      placeholder={t.support_form.ticket_reply_placeholder}
                      className="w-full resize-y rounded-md border border-subtle bg-canvas px-3 py-2.5 text-sm leading-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] disabled:opacity-60"
                    />
                    {selectedTicket.status === "resolved" || selectedTicket.status === "closed" ? (
                      <p className="text-sm text-secondary-text">{t.support_form.reply_closed}</p>
                    ) : (
                      <button
                        type="submit"
                        disabled={!ticketReply.trim() || sendingReply}
                        className="inline-flex min-h-11 items-center justify-center rounded-md bg-brand px-4 text-sm font-semibold text-zinc-950 hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {sendingReply
                          ? t.support_form.sending_reply
                          : t.support_form.send_reply}
                      </button>
                    )}
                  </form>
                </section>
              )}
            </section>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
