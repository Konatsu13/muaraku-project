"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import {
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

interface SafetyReportQueueItem {
  id: string;
  target_title: string;
  target_type: "report" | "message" | "user";
  reason: string;
  details: string;
  reporter: string;
  reported_at: string;
  status: "pending" | "action_taken" | "dismissed";
}

interface StaffVerificationRequest {
  id: string;
  user_name: string;
  email: string;
  institution: string;
  role: string;
  submitted_at: string;
  status: "pending" | "approved" | "rejected";
}

export default function AdminPage() {
  const { user, isAdmin, isModerator, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"queue" | "staff" | "users" | "audit">("queue");

  const [safetyQueue, setSafetyQueue] = useState<SafetyReportQueueItem[]>([
    {
      id: "sr-01",
      target_title: "iPhone 15 Pro Max Dijual Murah (Klaim Tebusan)",
      target_type: "report",
      reason: "Dugaan Penipuan / Pemerasan Imbalan",
      details: "Pelapor memaksa minta transfer uang muka 500rb sebelum barang dikirim.",
      reporter: "Rian Pratama",
      reported_at: "10 menit lalu",
      status: "pending",
    },
    {
      id: "sr-02",
      target_title: "Pesan spam penawaran pinjol di Global Chat",
      target_type: "message",
      reason: "Spam / Iklan yang Tidak Relevan",
      details: "Mengirim link tautan eksternal mencurigakan berkali-kali.",
      reporter: "Siti Nurhaliza",
      reported_at: "1 jam lalu",
      status: "pending",
    },
  ]);

  const [staffRequests, setStaffRequests] = useState<StaffVerificationRequest[]>([
    {
      id: "vr-1",
      user_name: "Pak Bambang Suhartono",
      email: "bambang.satpam@telkomuniversity.ac.id",
      institution: "Universitas Telkom - Pos Keamanan Barat",
      role: "Komandan Regu Pengamanan",
      submitted_at: "2 jam lalu",
      status: "pending",
    },
  ]);

  const handleQueueAction = (id: string, action: "dismissed" | "action_taken") => {
    setSafetyQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: action } : item))
    );
  };

  const handleStaffVerification = (id: string, action: "approved" | "rejected") => {
    setStaffRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: action } : req))
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFCF8] dark:bg-[#18181B] text-zinc-900 dark:text-zinc-100">
        <p className="text-sm text-zinc-500">Memeriksa izin akses admin...</p>
      </div>
    );
  }

  if (!user || (!isAdmin && !isModerator)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FFFCF8] dark:bg-[#18181B] text-zinc-900 dark:text-zinc-100">
        <div className="max-w-md w-full text-center space-y-4 p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold">Akses Terbatas</h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Halaman konsol administrasi ini khusus diperuntukkan bagi Administrator dan Moderator resmi MuaraKu. Akun Anda tidak memiliki peran staf yang sesuai.
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

  return (
    <div className="min-h-screen bg-[#FFFCF8] dark:bg-[#18181B] text-zinc-900 dark:text-zinc-100 p-4 sm:p-8 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Navigation */}
        <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300"
              title="Kembali ke Aplikasi"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-orange-500" />
                <span>MuaraKu Console Moderasi &amp; Admin</span>
              </h1>
              <p className="text-xs text-zinc-500">
                Akses Terbatas: Administrator &amp; Tim Moderasi Resmi
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
            {isAdmin ? "Super Admin" : isModerator ? "Moderator" : user ? user.email : "Staff Clearance"}
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 self-start overflow-x-auto">
          <button
            onClick={() => setActiveTab("queue")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "queue"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Antrean Laporan ({safetyQueue.filter((q) => q.status === "pending").length})
          </button>
          <button
            onClick={() => setActiveTab("staff")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "staff"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Verifikasi Petugas Pos ({staffRequests.filter((s) => s.status === "pending").length})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "users"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Manajemen Pembatasan Akun
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "audit"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Log Audit Aktivitas
          </button>
        </div>

        {/* 1. SAFETY REPORT QUEUE */}
        {activeTab === "queue" && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Antrean Peninjauan Laporan Keamanan
            </h2>

            {safetyQueue.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {item.target_title}
                    </h3>
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-0.5">
                      Alasan: {item.reason}
                    </p>
                  </div>
                  <span className="text-[11px] text-zinc-400">
                    Pelapor: <strong>{item.reporter}</strong> • {item.reported_at}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 text-xs text-zinc-700 dark:text-zinc-300">
                  <strong>Bukti/Keterangan:</strong> {item.details}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-semibold text-zinc-500">
                    Status: <strong className="uppercase">{item.status}</strong>
                  </span>

                  {item.status === "pending" ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQueueAction(item.id, "dismissed")}
                        className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100"
                      >
                        Abaikan (Dismiss)
                      </button>
                      <button
                        onClick={() => handleQueueAction(item.id, "action_taken")}
                        className="px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
                      >
                        Takedown &amp; Peringatkan User
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-emerald-600 font-bold">
                      Kasus Telah Diproses
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. STAFF LOCATION VERIFICATION */}
        {activeTab === "staff" && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Pengajuan Lencana Petugas Lokasi Terverifikasi (Kuning)
            </h2>

            {staffRequests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {req.user_name}
                    </h3>
                    <p className="text-xs text-zinc-500">{req.email}</p>
                  </div>
                  <span className="text-xs text-zinc-400">{req.submitted_at}</span>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-950 dark:text-amber-200 space-y-1">
                  <p><strong>Instansi:</strong> {req.institution}</p>
                  <p><strong>Jabatan:</strong> {req.role}</p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-zinc-500">
                    Status: <strong className="uppercase">{req.status}</strong>
                  </span>

                  {req.status === "pending" ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStaffVerification(req.id, "rejected")}
                        className="px-3 py-1.5 border border-zinc-200 text-xs font-semibold rounded-lg text-zinc-600"
                      >
                        Tolak Permintaan
                      </button>
                      <button
                        onClick={() => handleStaffVerification(req.id, "approved")}
                        className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg"
                      >
                        Berikan Lencana Petugas Kuning
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-emerald-600 font-bold">
                      Permintaan Disetujui
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. USER MANAGEMENT */}
        {activeTab === "users" && (
          <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Kebijakan Pembatasan &amp; Penalti Pengguna
            </h2>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-xl">
              Sesuai aturan PRD &amp; DESIGN.md, penalti akun (peringatan, pembatasan 7 hari, suspensi, ban permanen) memerlukan alasan eksplisit dan tidak pernah dieksekusi secara otomatis oleh AI tanpa konfirmasi manusia.
            </p>
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-600 dark:text-zinc-300">
              Tidak ada akun yang sedang dalam masa peninjauan sanksi darurat saat ini.
            </div>
          </div>
        )}

        {/* 4. AUDIT LOG */}
        {activeTab === "audit" && (
          <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Audit Trail Moderasi
            </h2>
            <div className="space-y-2 text-xs text-zinc-500">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-between">
                <span>[2026-10-11 14:10] Inisialisasi Database MuaraKu &amp; 28 Tabel</span>
                <span className="font-mono">SYS-ADMIN</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-between">
                <span>[2026-10-11 15:02] Seeding 12 Kategori Barang Hilang &amp; Temuan</span>
                <span className="font-mono">SYS-ADMIN</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
