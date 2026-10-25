"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import {
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  Info,
} from "lucide-react";

interface SafetyReportRow {
  id: string;
  reporter_user_id: string;
  target_type: "user" | "item_report" | "message";
  target_user_id: string | null;
  target_report_id: string | null;
  target_message_id: string | null;
  reason: string;
  details: string | null;
  status: "open" | "reviewing" | "actioned" | "dismissed" | "closed";
  assigned_to: string | null;
  resolution_message: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

interface AdminActivityLogRow {
  id: string;
  actor_user_id: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  created_at: string;
}

interface RestrictedAccountRow {
  user_id: string;
  status: string;
  public_message: string | null;
  effective_until: string | null;
  updated_at: string;
}

interface PendingReportRow {
  id: string;
  reporter_user_id: string;
  report_type: "lost" | "found";
  title: string;
  description: string;
  location_label: string | null;
  city: string | null;
  moderation_status: string;
  created_at: string;
}

function QueueCount({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export default function AdminPage() {
  const { user, roles, isAdmin, isModerator, isLoading } = useAuth();
  const supabase = React.useMemo(() => createClient(), []);

  const [activeTab, setActiveTab] = useState<"queue" | "reports" | "users" | "audit" | "info">("queue");

  // Real data states
  const [safetyReports, setSafetyReports] = useState<SafetyReportRow[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminActivityLogRow[]>([]);
  const [restrictedAccounts, setRestrictedAccounts] = useState<RestrictedAccountRow[]>([]);
  const [pendingReports, setPendingReports] = useState<PendingReportRow[]>([]);
  const [safetyReportsError, setSafetyReportsError] = useState(false);
  const [pendingReportsError, setPendingReportsError] = useState(false);
  const [pendingReportsLoading, setPendingReportsLoading] = useState(true);
  const [restrictedAccountsError, setRestrictedAccountsError] = useState(false);
  const [auditLogsError, setAuditLogsError] = useState(false);
  const [overviewCounts, setOverviewCounts] = useState<{
    pendingReports: number;
    openSafetyReports: number;
    openSupportTickets: number;
  } | null>(null);
  const [overviewError, setOverviewError] = useState(false);

  // Loading & error states
  const [loadingData, setLoadingData] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch real safety reports
  const loadReports = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("safety_reports")
        .select("id, reporter_user_id, target_type, target_user_id, target_report_id, target_message_id, reason, details, status, assigned_to, resolution_message, resolved_at, created_at, updated_at")
        .in("status", ["open", "reviewing"])
        .order("created_at", { ascending: true })
        .limit(50);

      if (error) {
        setSafetyReportsError(true);
        setErrorMsg("Gagal memuat antrean laporan keamanan. Coba segarkan halaman.");
      } else {
        setSafetyReportsError(false);
        setSafetyReports((data || []) as SafetyReportRow[]);
      }
    } catch (err: unknown) {
      console.error("Safety report queue load failed:", err);
      setSafetyReportsError(true);
      setErrorMsg("Gagal memuat antrean laporan keamanan. Coba segarkan halaman.");
    } finally {
      setLoadingData(false);
    }
  }, [supabase, user]);

  const loadPendingReports = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("id, reporter_user_id, report_type, title, description, location_label, city, moderation_status, created_at")
        .eq("moderation_status", "pending_review")
        .order("created_at", { ascending: true })
        .limit(50);

      if (error) {
        setPendingReports([]);
        setPendingReportsError(true);
        setErrorMsg("Gagal memuat laporan yang menunggu moderasi. Coba segarkan halaman.");
      } else {
        setPendingReportsError(false);
        setPendingReports((data || []) as PendingReportRow[]);
      }
    } catch (error) {
      console.error("Pending report review load failed:", error);
      setPendingReports([]);
      setPendingReportsError(true);
      setErrorMsg("Gagal memuat laporan yang menunggu moderasi. Coba segarkan halaman.");
    } finally {
      setPendingReportsLoading(false);
    }
  }, [supabase, user]);

  // Fetch real audit logs
  const loadAuditLogs = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("admin_activity_logs")
        .select("id, actor_user_id, action, target_type, target_id, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        setAuditLogsError(true);
        setErrorMsg("Gagal memuat log aktivitas. Coba segarkan halaman.");
      } else {
        setAuditLogsError(false);
        setAuditLogs((data || []) as AdminActivityLogRow[]);
      }
    } catch (err: unknown) {
      console.error("Admin activity load failed:", err);
      setAuditLogsError(true);
      setErrorMsg("Gagal memuat log aktivitas. Coba segarkan halaman.");
    }
  }, [supabase, user]);

  // Fetch restricted accounts
  const loadRestrictedAccounts = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("user_account_controls")
        .select("user_id, status, public_message, effective_until, updated_at")
        .neq("status", "active")
        .order("updated_at", { ascending: false })
        .limit(50);

      if (error) {
        setRestrictedAccountsError(true);
        setErrorMsg("Gagal memuat akun terbatas. Coba segarkan halaman.");
      } else {
        setRestrictedAccountsError(false);
        setRestrictedAccounts((data || []) as RestrictedAccountRow[]);
      }
    } catch (err: unknown) {
      console.error("Restricted account list load failed:", err);
      setRestrictedAccountsError(true);
      setErrorMsg("Gagal memuat akun terbatas. Coba segarkan halaman.");
    }
  }, [supabase, user]);

  const loadOverview = useCallback(async () => {
    if (!user) return;

    try {
      const [reports, safety, support] = await Promise.all([
        supabase
          .from("reports")
          .select("id", { count: "exact", head: true })
          .eq("moderation_status", "pending_review"),
        supabase
          .from("safety_reports")
          .select("id", { count: "exact", head: true })
          .in("status", ["open", "reviewing"]),
        supabase
          .from("support_tickets")
          .select("id", { count: "exact", head: true })
          .in("status", ["open", "in_progress", "waiting_for_user"]),
      ]);

      if (reports.error || safety.error || support.error) {
        setOverviewCounts(null);
        setOverviewError(true);
        setErrorMsg("Gagal memuat ringkasan antrean. Coba segarkan halaman.");
        return;
      }

      setOverviewError(false);
      setOverviewCounts({
        pendingReports: reports.count || 0,
        openSafetyReports: safety.count || 0,
        openSupportTickets: support.count || 0,
      });
    } catch (error) {
      console.error("Admin queue overview load failed:", error);
      setOverviewCounts(null);
      setOverviewError(true);
      setErrorMsg("Gagal memuat ringkasan antrean. Coba segarkan halaman.");
    }
  }, [supabase, user]);

  useEffect(() => {
    if (user && (isAdmin || isModerator)) {
      // These loaders update state only after their asynchronous Supabase requests settle.
      void Promise.all([
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadReports(),
        loadPendingReports(),
        loadOverview(),
        loadRestrictedAccounts(),
        isAdmin ? loadAuditLogs() : Promise.resolve(),
      ]);
    }
  }, [
    user,
    isAdmin,
    isModerator,
    loadReports,
    loadPendingReports,
    loadOverview,
    loadRestrictedAccounts,
    loadAuditLogs,
  ]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas text-main-text">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!user || (!isAdmin && !isModerator)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-canvas text-main-text">
        <div className="max-w-md w-full text-center space-y-4 p-8 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <ShieldCheck className="w-6 h-6 mx-auto text-secondary-text" aria-hidden="true" />
          <h2 className="text-xl font-bold">Akses Terbatas</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Halaman konsol moderasi dan administrasi ini hanya dapat diakses oleh staf berwenang yang tercatat pada sistem otorisasi MuaraKu. Akun Anda tidak memiliki peran staf yang sesuai.
          </p>
          <div className="pt-2">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:opacity-90"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke Aplikasi
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pendingCount = safetyReports.length;

  return (
    <div className="min-h-screen bg-canvas text-main-text p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
              title="Kembali ke Aplikasi"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-orange-500" />
                <span>Konsol Moderasi &amp; Staf MuaraKu</span>
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Pusat pengawasan keamanan komunitas dan peninjauan laporan pelanggaran.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setLoadingData(true);
                setPendingReportsLoading(true);
                setErrorMsg(null);
                setOverviewError(false);
                setSafetyReportsError(false);
                setPendingReportsError(false);
                setRestrictedAccountsError(false);
                setAuditLogsError(false);
                void loadReports();
                void loadPendingReports();
                void loadOverview();
                void loadRestrictedAccounts();
                if (isAdmin) void loadAuditLogs();
              }}
              disabled={loadingData}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Segarkan data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Segarkan</span>
            </button>
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
              {isAdmin ? "Admin" : "Moderator"}
            </span>
            {(isAdmin || roles.includes("support")) && (
              <Link
                href="/admin/support"
                className="min-h-11 inline-flex items-center rounded-md border border-zinc-200 px-3 text-xs font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Antrean bantuan
              </Link>
            )}
          </div>
        </div>

        {/* Global Feedback Banners */}
        {errorMsg && (
          <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        <section aria-label="Ringkasan antrean kerja" className="grid gap-3 sm:grid-cols-3">
          {overviewCounts ? (
            <>
              <QueueCount label="Laporan menunggu moderasi" value={overviewCounts.pendingReports} />
              <QueueCount label="Laporan keamanan terbuka" value={overviewCounts.openSafetyReports} />
              <QueueCount label="Tiket bantuan aktif" value={overviewCounts.openSupportTickets} />
            </>
          ) : (
            <p className="text-sm text-zinc-500" role="status">
              {overviewError
                ? "Ringkasan antrean tidak dapat dimuat. Coba segarkan halaman."
                : "Memuat ringkasan antrean dari database..."}
            </p>
          )}
        </section>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 self-start">
          <button
            onClick={() => setActiveTab("queue")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === "queue"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            Antrean Laporan ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === "reports"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            Laporan menunggu ({overviewCounts?.pendingReports ?? "…"})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === "users"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            Pembatasan Akun ({restrictedAccounts.length})
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab("audit")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                activeTab === "audit"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              Log Audit Aktivitas ({auditLogs.length})
            </button>
          )}
          <button
            onClick={() => setActiveTab("info")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === "info"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            Catatan Ruang Lingkup MVP
          </button>
        </div>

        {/* 1. SAFETY REPORT QUEUE */}
        {activeTab === "queue" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Antrean Peninjauan Laporan Keamanan
              </h2>
              <span className="text-xs text-zinc-500">
                Maksimal 50 laporan terbuka terlama
              </span>
            </div>

            {loadingData && safetyReports.length === 0 ? (
              <div className="p-8 text-center rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-500 mb-2" />
                <p className="text-xs text-zinc-500">Memuat laporan dari database...</p>
              </div>
            ) : safetyReports.length === 0 ? (
              safetyReportsError ? (
                <p className="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300" role="alert">
                  Antrean laporan keamanan tidak dapat dimuat. Coba segarkan halaman.
                </p>
              ) : (
              <div className="p-8 text-center rounded-lg bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-700 space-y-2">
                <ShieldCheck className="w-10 h-10 mx-auto text-emerald-500/80 mb-2" />
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  Tidak Ada Laporan Pelanggaran
                </h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Semua laporan keamanan telah selesai diproses atau belum ada keluhan yang masuk dari pengguna.
                </p>
              </div>
              )
            ) : (
              <div className="space-y-3">
                {safetyReports.map((report) => {
                  const isPending = report.status === "open" || report.status === "reviewing";
                  const targetId =
                    report.target_user_id || report.target_report_id || report.target_message_id;
                  return (
                    <div
                      key={report.id}
                      className="p-5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                            {report.target_type}
                          </span>
                          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            Alasan: {report.reason.replace(/_/g, " ")}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(report.created_at).toLocaleString("id-ID")}</span>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Pelapor: {report.reporter_user_id} · Target: {targetId || "tidak tersedia"}
                      </p>

                      {report.details && (
                        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 text-xs text-zinc-700 dark:text-zinc-300">
                          <strong>Keterangan Pelapor:</strong> {report.details}
                        </div>
                      )}

                      {report.resolution_message && (
                        <div className="p-3 rounded-xl bg-emerald-500/10 text-xs text-emerald-800 dark:text-emerald-300">
                          <strong>Tindakan Penyelesaian:</strong> {report.resolution_message}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-zinc-500">Status:</span>
                          <span
                            className={`rounded-md px-2 py-1 text-xs font-medium ${
                              isPending
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : report.status === "actioned"
                                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                            }`}
                          >
                            {report.status}
                          </span>
                        </div>

                        {(report.status === "open" || report.status === "reviewing") && (
                          <p className="max-w-xl text-xs leading-5 text-amber-800 dark:text-amber-300" role="note">
                            Tindakan status dinonaktifkan sampai tersedia jalur moderasi yang menulis audit secara aman. Belum ada perubahan yang dilakukan.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "reports" && (
          <section className="space-y-4">
            <header>
              <h2 className="text-base font-semibold">Laporan menunggu peninjauan</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Hanya informasi publik laporan yang ditampilkan. Bukti kepemilikan privat tidak dimuat di halaman ini.
              </p>
            </header>
            {pendingReportsLoading ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400" role="status">
                Memuat laporan...
              </p>
            ) : pendingReportsError ? (
              <p className="text-sm text-rose-700 dark:text-rose-300" role="alert">
                Laporan tidak dapat dimuat. Coba segarkan halaman.
              </p>
            ) : pendingReports.length === 0 ? (
              <div className="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                Tidak ada laporan yang menunggu peninjauan.
              </div>
            ) : (
              <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white px-4 dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
                {pendingReports.map((report) => (
                  <li key={report.id} className="py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold">{report.title}</h3>
                          <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                            {report.report_type === "lost" ? "Barang hilang" : "Barang ditemukan"}
                          </span>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                          {report.description}
                        </p>
                        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                          {[report.location_label, report.city].filter(Boolean).join(" · ") || "Lokasi tidak dicantumkan"}
                        </p>
                        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                          Pelapor: {report.reporter_user_id}
                        </p>
                      </div>
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        {new Date(report.created_at).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {pendingReports.length === 50 && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Menampilkan 50 laporan tertua yang menunggu moderasi.
              </p>
            )}
          </section>
        )}

        {/* 2. USER RESTRICTIONS */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Pengawasan Akun Terbatas
            </h2>
            {restrictedAccountsError ? (
              <p className="text-sm text-rose-700 dark:text-rose-300" role="alert">
                Daftar akun terbatas tidak dapat dimuat. Coba segarkan halaman.
              </p>
            ) : restrictedAccounts.length === 0 ? (
              <div className="p-6 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Tidak Ada Akun dalam Pembatasan
                </h3>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  Semua pengguna terdaftar saat ini berada dalam status normal (active).
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {restrictedAccounts.map((acc) => (
                  <div
                    key={acc.user_id}
                    className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs text-zinc-500">
                        ID: <code>{acc.user_id}</code>
                      </p>
                      <p className="text-sm font-medium text-rose-600 mt-0.5">
                        Status: {acc.status}
                      </p>
                      {acc.public_message && (
                        <p className="text-xs text-zinc-400 mt-1">{acc.public_message}</p>
                      )}
                    </div>
                    {acc.effective_until && (
                      <span className="text-xs text-zinc-500">
                        Hingga: {new Date(acc.effective_until).toLocaleDateString("id-ID")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. AUDIT LOGS */}
        {activeTab === "audit" && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Log Audit Aktivitas Staf
            </h2>
            {auditLogsError ? (
              <p className="text-sm text-rose-700 dark:text-rose-300" role="alert">
                Log audit tidak dapat dimuat. Coba segarkan halaman.
              </p>
            ) : auditLogs.length === 0 ? (
              <div className="p-6 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center">
                <p className="text-xs text-zinc-500">
                  Belum ada catatan aktivitas admin yang terekam pada tabel admin_activity_logs.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
                {auditLogs.map((log) => (
                  <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {log.action}
                      </span>
                      <span className="ml-2 text-zinc-500">
                        oleh {log.actor_user_id || "staf tidak diketahui"}
                      </span>
                      {log.target_type && (
                        <span className="text-zinc-400 ml-2">
                          ({log.target_type}: {log.target_id || "-"})
                        </span>
                      )}
                    </div>
                    <span className="text-zinc-400 text-[11px]">
                      {new Date(log.created_at).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. SCOPE INFO */}
        {activeTab === "info" && (
          <div className="p-6 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center gap-2 text-orange-500">
              <Info className="w-5 h-5" />
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Status Fitur Moderasi Sesuai PRD MVP v2.2
              </h2>
            </div>
            <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <p>
                Sesuai batasan resmi PRD dan 22 tabel schema canonical MVP v2.2:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>
                  <strong>Tabel Verifikasi Staf Pos Lokasi (location_staff_verifications):</strong> Sengaja ditunda dari cakupan rilis MVP v2.2. Tidak ada dummy request yang disimulasikan.
                </li>
                <li>
                  <strong>Banding Moderasi (moderation_appeals):</strong> Tidak termasuk MVP v2.2.
                </li>
                <li>
                  <strong>Pemberian Sanksi:</strong> Tidak dieksekusi secara otomatis oleh AI. Semua tindakan memerlukan intervensi moderator manusia.
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
