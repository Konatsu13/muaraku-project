"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

type TicketStatus =
  | "open"
  | "in_progress"
  | "waiting_for_user"
  | "resolved"
  | "closed";
type TicketPriority = "low" | "normal" | "high" | "urgent";
type TicketCategory =
  | "general"
  | "account"
  | "report"
  | "claim"
  | "safety"
  | "privacy"
  | "technical"
  | "other";

interface SupportTicket {
  id: string;
  owner_user_id: string | null;
  contact_email: string;
  category: TicketCategory;
  subject: string;
  initial_message: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_user_id: string | null;
  body: string;
  created_at: string;
}

const pageSize = 50;
const statuses: Array<TicketStatus | "all"> = [
  "all",
  "open",
  "in_progress",
  "waiting_for_user",
  "resolved",
  "closed",
];
const priorities: Array<TicketPriority | "all"> = [
  "all",
  "urgent",
  "high",
  "normal",
  "low",
];
const categories: Array<TicketCategory | "all"> = [
  "all",
  "general",
  "account",
  "report",
  "claim",
  "safety",
  "privacy",
  "technical",
  "other",
];

export function SupportWorkspace() {
  const { user } = useAuth();
  const { t, locale } = useI18n();
  const supabase = useMemo(() => createClient(), []);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<TicketCategory | "all">("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [listError, setListError] = useState(false);
  const [messageError, setMessageError] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const listRequestId = useRef(0);
  const messageRequestId = useRef(0);
  const selectedTicketId = useRef<string | null>(null);

  const loadPage = useCallback(
    async (nextPage: number, append: boolean) => {
      const requestId = ++listRequestId.current;

      let query = supabase
        .from("support_tickets")
        .select(
          "id, owner_user_id, contact_email, category, subject, initial_message, status, priority, assigned_to, created_at, updated_at"
        )
        .order("updated_at", { ascending: false })
        .range(nextPage * pageSize, nextPage * pageSize + pageSize - 1);

      if (statusFilter !== "all") query = query.eq("status", statusFilter);
      if (priorityFilter !== "all") query = query.eq("priority", priorityFilter);
      if (categoryFilter !== "all") query = query.eq("category", categoryFilter);
      if (search) query = query.ilike("subject", `%${search}%`);

      try {
        const { data, error } = await query;
        if (requestId !== listRequestId.current) return;
        if (error) {
          setListError(true);
        } else {
          const rows = (data || []) as SupportTicket[];
          setListError(false);
          setTickets((current) => (append ? [...current, ...rows] : rows));
          setPage(nextPage);
          setHasMore(rows.length === pageSize);
        }
      } catch (error) {
        console.error("Staff ticket list load failed:", error);
        if (requestId === listRequestId.current) setListError(true);
      } finally {
        if (requestId === listRequestId.current) setLoading(false);
      }
    },
    [categoryFilter, priorityFilter, search, statusFilter, supabase]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true);
      setTickets([]);
      setSelectedTicket(null);
      selectedTicketId.current = null;
      setSearch(searchInput.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    // loadPage performs its state updates after the Supabase query settles.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPage(0, false);
    return () => {
      listRequestId.current += 1;
    };
  }, [loadPage]);

  const loadMessages = useCallback(
    async (ticket: SupportTicket) => {
      const requestId = ++messageRequestId.current;
      try {
        const { data, error } = await supabase
          .from("support_ticket_messages")
          .select("id, ticket_id, sender_user_id, body, created_at")
          .eq("ticket_id", ticket.id)
          .eq("is_internal", false)
          .order("created_at", { ascending: false })
          .limit(50);

        if (requestId !== messageRequestId.current) return;
        if (error) {
          setMessageError(true);
        } else {
          setMessageError(false);
          setMessages(((data || []) as SupportMessage[]).reverse());
        }
      } catch (error) {
        console.error("Support ticket message load failed:", error);
        if (requestId === messageRequestId.current) setMessageError(true);
      } finally {
        if (requestId === messageRequestId.current) setLoadingMessages(false);
      }
    },
    [supabase]
  );

  useEffect(() => {
    selectedTicketId.current = selectedTicket?.id ?? null;
    // loadMessages performs its state updates after the Supabase query settles.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (selectedTicket) void loadMessages(selectedTicket);
    return () => {
      messageRequestId.current += 1;
    };
  }, [loadMessages, selectedTicket]);

  const sendReply = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !selectedTicket || !reply.trim() || sending) return;

    setSending(true);
    setMessageError(false);
    const ticketId = selectedTicket.id;
    try {
      const { data, error } = await supabase
        .from("support_ticket_messages")
        .insert({
          ticket_id: ticketId,
          sender_user_id: user.id,
          body: reply.trim(),
        })
        .select("id, ticket_id, sender_user_id, body, created_at")
        .single();

      if (error || !data) {
        setMessageError(true);
      } else if (selectedTicketId.current === ticketId) {
        setMessages((previous) => [...previous, data as SupportMessage]);
        setReply("");
      }
    } catch (error) {
      console.error("Support ticket reply failed:", error);
      setMessageError(true);
    } finally {
      setSending(false);
    }
  };

  const dateLocale = locale === "id" ? "id-ID" : "en-US";
  const categoryLabels: Record<TicketCategory, string> = {
    general: t.support_form.category_general,
    account: t.support_form.category_account,
    report: t.support_form.category_report,
    claim: t.support_form.category_claim,
    safety: t.support_form.category_safety,
    privacy: t.support_form.category_privacy,
    technical: t.support_form.category_technical,
    other: t.support_form.category_other,
  };
  const priorityLabels: Record<TicketPriority, string> = {
    low: t.staff_support.priority_low,
    normal: t.staff_support.priority_normal,
    high: t.staff_support.priority_high,
    urgent: t.staff_support.priority_urgent,
  };

  return (
    <main className="min-h-screen bg-surface p-2 text-main-text sm:p-4">
      <div className="mx-auto min-h-[calc(100dvh-2rem)] max-w-[1440px] rounded-xl border border-subtle bg-canvas p-4 sm:p-6">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/app"
              aria-label={t.common.back}
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-subtle hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {t.staff_support.title}
              </h1>
              <p className="mt-1 text-sm text-secondary-text">
                {t.staff_support.description}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              void loadPage(0, false);
            }}
            disabled={loading}
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-subtle px-3 text-sm font-medium hover:bg-surface disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
            {t.support_form.history_retry}
          </button>
        </header>

        <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_repeat(3,minmax(150px,0.45fr))]">
          <div>
            <label htmlFor="staff-ticket-search" className="mb-1.5 block text-sm font-medium">
              {t.staff_support.search}
            </label>
            <input
              id="staff-ticket-search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={t.staff_support.search_placeholder}
              className="min-h-11 w-full rounded-md border border-subtle bg-canvas px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
            />
          </div>
          <FilterSelect
            label={t.staff_support.status}
            value={statusFilter}
            onChange={(value) => {
              setLoading(true);
              setTickets([]);
              setSelectedTicket(null);
              selectedTicketId.current = null;
              setStatusFilter(value as TicketStatus | "all");
            }}
            options={statuses.map((value) => ({
              value,
              label: value === "all" ? t.staff_support.all_statuses : t.support_form[`status_${value}`],
            }))}
          />
          <FilterSelect
            label={t.staff_support.priority}
            value={priorityFilter}
            onChange={(value) => {
              setLoading(true);
              setTickets([]);
              setSelectedTicket(null);
              selectedTicketId.current = null;
              setPriorityFilter(value as TicketPriority | "all");
            }}
            options={priorities.map((value) => ({
              value,
              label: value === "all" ? t.staff_support.all_priorities : priorityLabels[value],
            }))}
          />
          <FilterSelect
            label={t.staff_support.category}
            value={categoryFilter}
            onChange={(value) => {
              setLoading(true);
              setTickets([]);
              setSelectedTicket(null);
              selectedTicketId.current = null;
              setCategoryFilter(value as TicketCategory | "all");
            }}
            options={categories.map((value) => ({
              value,
              label: value === "all" ? t.staff_support.all_categories : categoryLabels[value],
            }))}
          />
        </div>

        {listError && (
          <p className="mb-4 text-sm text-red-700" role="alert">
            {t.staff_support.load_error}
          </p>
        )}

        <div className="grid min-h-[60vh] gap-4 md:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.5fr)]">
          <section
            aria-label={t.staff_support.title}
            className={`min-w-0 rounded-lg border border-subtle ${
              selectedTicket ? "hidden md:block" : "block"
            }`}
          >
            <ul className="divide-y divide-subtle">
              {tickets.map((ticket) => (
                <li key={ticket.id}>
                  <button
                    type="button"
                    onClick={() => {
                      selectedTicketId.current = ticket.id;
                      setMessages([]);
                      setReply("");
                      setLoadingMessages(true);
                      setSelectedTicket(ticket);
                    }}
                    aria-current={selectedTicket?.id === ticket.id ? "true" : undefined}
                    className={`min-h-[76px] w-full px-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--focus)] ${
                      selectedTicket?.id === ticket.id ? "bg-surface" : "hover:bg-surface"
                    }`}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{ticket.subject}</span>
                        <span className="mt-1 block truncate text-xs text-secondary-text">
                          {categoryLabels[ticket.category]} · {ticket.contact_email}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs text-secondary-text">
                        {new Date(ticket.updated_at).toLocaleDateString(dateLocale)}
                      </span>
                    </span>
                    <span className="mt-2 flex flex-wrap gap-2 text-xs text-secondary-text">
                      <span>{t.support_form[ `status_${ticket.status}` ]}</span>
                      {ticket.priority !== "normal" && (
                        <span>· {priorityLabels[ticket.priority]}</span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {loading && <p className="p-4 text-sm text-secondary-text" role="status">{t.staff_support.loading}</p>}
            {!loading && !listError && tickets.length === 0 && (
              <p className="p-4 text-sm text-secondary-text">{t.staff_support.no_tickets}</p>
            )}
            {hasMore && (
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  void loadPage(page + 1, true);
                }}
                disabled={loading}
                className="min-h-11 w-full border-t border-subtle px-4 text-sm font-medium hover:bg-surface disabled:opacity-60"
              >
                {t.staff_support.load_more}
              </button>
            )}
          </section>

          <section
            aria-label={selectedTicket?.subject || t.staff_support.select_ticket}
            className={`flex min-h-[60vh] min-w-0 flex-col rounded-lg border border-subtle ${
              selectedTicket ? "flex" : "hidden md:flex"
            }`}
          >
            {selectedTicket ? (
              <>
                <header className="border-b border-subtle p-4">
                  <button
                    type="button"
                    onClick={() => {
                      selectedTicketId.current = null;
                      setSelectedTicket(null);
                      setMessages([]);
                      setReply("");
                    }}
                    className="mb-3 min-h-11 text-sm font-medium text-trust hover:underline md:hidden"
                  >
                    {t.staff_support.back_to_list}
                  </button>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="break-words text-base font-semibold">{selectedTicket.subject}</h2>
                      <p className="mt-1 break-all text-sm text-secondary-text">
                        {t.staff_support.customer}: {selectedTicket.contact_email}
                      </p>
                    </div>
                    <span className="rounded-md bg-surface px-2.5 py-1 text-xs text-secondary-text">
                      {t.support_form[`status_${selectedTicket.status}`]}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-secondary-text">
                    {categoryLabels[selectedTicket.category]} · {priorityLabels[selectedTicket.priority]}
                  </p>
                </header>

                <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
                  <article className="max-w-2xl rounded-lg bg-surface p-4">
                    <p className="mb-2 text-xs text-secondary-text">
                      {new Date(selectedTicket.created_at).toLocaleString(dateLocale)}
                    </p>
                    <p className="whitespace-pre-wrap break-words text-sm leading-6">
                      {selectedTicket.initial_message}
                    </p>
                  </article>
                  {loadingMessages && (
                    <p className="text-sm text-secondary-text" role="status">
                      {t.staff_support.loading}
                    </p>
                  )}
                  {messageError && (
                    <p className="text-sm text-red-700" role="alert">
                      {t.staff_support.reply_error}
                    </p>
                  )}
                  {!loadingMessages && !messageError && messages.length === 0 && (
                    <p className="text-sm text-secondary-text">{t.staff_support.messages_empty}</p>
                  )}
                  {messages.map((message) => (
                    <article
                      key={message.id}
                      className={`max-w-2xl rounded-lg p-4 ${
                        message.sender_user_id === selectedTicket.owner_user_id
                          ? "bg-surface"
                          : "ml-auto bg-brand/10"
                      }`}
                    >
                      <p className="mb-2 text-xs text-secondary-text">
                        {new Date(message.created_at).toLocaleString(dateLocale)}
                      </p>
                      <p className="whitespace-pre-wrap break-words text-sm leading-6">
                        {message.body}
                      </p>
                    </article>
                  ))}
                </div>

                <form onSubmit={sendReply} className="space-y-3 border-t border-subtle p-4">
                  <label htmlFor="support-reply" className="block text-sm font-medium">
                    {t.staff_support.reply}
                  </label>
                  <textarea
                    id="support-reply"
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    maxLength={5000}
                    minLength={1}
                    required
                    rows={3}
                    disabled={selectedTicket.status === "resolved" || selectedTicket.status === "closed"}
                    placeholder={t.staff_support.reply_placeholder}
                    className="w-full resize-y rounded-md border border-subtle bg-canvas px-3 py-2.5 text-sm leading-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] disabled:opacity-60"
                  />
                  {messageError && (
                    <p className="text-sm text-red-700" role="alert">
                      {t.staff_support.reply_error}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="max-w-lg text-xs text-secondary-text">
                      {t.staff_support.status_readonly}
                    </p>
                    <button
                      type="submit"
                      disabled={
                        !reply.trim() ||
                        sending ||
                        selectedTicket.status === "resolved" ||
                        selectedTicket.status === "closed"
                      }
                      className="min-h-11 rounded-md bg-brand px-4 text-sm font-semibold text-zinc-950 hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {sending ? t.staff_support.sending : t.staff_support.send_reply}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="hidden flex-1 items-center justify-center p-6 text-sm text-secondary-text md:flex">
                {t.staff_support.select_ticket}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  const id = `filter-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 w-full rounded-md border border-subtle bg-canvas px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
