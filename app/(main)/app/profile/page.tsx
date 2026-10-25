"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import {
  ShieldCheck,
  Calendar,
  FileText,
  Bookmark,
  Edit3,
  Save,
  Loader2,
  Mail,
} from "lucide-react";
import { ReportCard } from "@/components/reports/ReportCard";
import { fetchReports, fetchSavedReports, ReportDetailItem } from "@/lib/supabase/reports";
import { LoadingPattern } from "@/components/ui/patterns/LoadingPattern";
import { EmptyPattern } from "@/components/ui/patterns/EmptyPattern";
import { ErrorPattern } from "@/components/ui/patterns/ErrorPattern";
import { AlertCircle } from "lucide-react";

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<"my_reports" | "saved">("my_reports");
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [myReports, setMyReports] = useState<ReportDetailItem[]>([]);
  const [savedReports, setSavedReports] = useState<ReportDetailItem[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState<string | null>(null);

  // Sync state
  const startEditing = () => {
    if (!isEditing) {
      setDisplayName(profile?.display_name || "");
      setBio(profile?.bio || "");
      setSaveError(null);
    }
    setIsEditing(!isEditing);
  };

  const loadData = useCallback(async (isCancelledRef?: { current: boolean }) => {
    const userId = user?.id;
    if (!userId) {
      if (isCancelledRef?.current) return;
      setLoadingReports(false);
      return;
    }
    if (isCancelledRef?.current) return;
    setLoadingReports(true);
    setReportsError(null);

    try {
      // 1. Fetch user's own reports and saved reports in parallel
      const [myRes, savedRes] = await Promise.all([
        fetchReports({ reporter_user_id: userId }),
        fetchSavedReports(userId),
      ]);

      if (isCancelledRef?.current) return;

      const firstError = myRes.error || savedRes.error;
      if (firstError) {
        setReportsError(firstError.message);
      }

      if (myRes.data) {
        setMyReports(myRes.data);
      }
      if (savedRes.data) {
        setSavedReports(savedRes.data);
      }
    } catch (err) {
      if (isCancelledRef?.current) return;
      setReportsError(
        err instanceof Error ? err.message : "Gagal memuat laporan profil"
      );
    } finally {
      if (isCancelledRef?.current) return;
      setLoadingReports(false);
    }
  }, [user?.id]);

  useEffect(() => {
    const isCancelledRef = { current: false };
    // Defer one tick: the loader resets loading/error state synchronously,
    // which must not run during the effect body.
    const timer = setTimeout(() => {
      if (!isCancelledRef.current) loadData(isCancelledRef);
    }, 0);
    return () => {
      isCancelledRef.current = true;
      clearTimeout(timer);
    };
  }, [loadData]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaveError(null);

    const trimmedName = displayName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 80) {
      setSaveError("Nama tampilan harus antara 2 dan 80 karakter.");
      setSaving(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("user_profiles")
        .update({
          display_name: trimmedName,
          bio: bio.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) {
        setSaveError(error.message);
        setSaving(false);
        return;
      }

      await refreshProfile();
      setIsEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Gagal menyimpan profil");
    } finally {
      setSaving(false);
    }
  };

  const handleSavedChange = (reportId: string, isSaved: boolean) => {
    if (!isSaved) {
      setSavedReports((prev) => prev.filter((r) => r.id !== reportId));
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-fade-in pb-12">
      {/* Profile Header Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold text-xl flex items-center justify-center border border-orange-500/20 flex-shrink-0">
              {(profile?.display_name || user?.email || "U").charAt(0).toUpperCase()}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {profile?.display_name || user?.email?.split("@")[0] || "Warga MuaraKu"}
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Warga Terdaftar
                </span>
              </div>

              <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{user?.email || "Belum masuk akun"}</span>
              </p>

              <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Akun Aktif</span>
              </p>
            </div>
          </div>

          <button
            onClick={startEditing}
            className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 flex items-center gap-1.5 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? "Batal" : "Sunting Profil"}</span>
          </button>
        </div>

        {/* Bio / Edit Form */}
        <div className="mt-5 pt-5 border-t border-zinc-100 dark:border-zinc-800/80">
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-3 max-w-md">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Nama Tampilan
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Bio Singkat
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Ceritakan sedikit tentang Anda..."
                  className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Perubahan</span>
              </button>

              {saveError && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>{saveError}</span>
                </p>
              )}
            </form>
          ) : (
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
              {profile?.bio?.trim() || "Belum ada bio. Tambahkan deskripsi singkat tentang Anda melalui tombol Sunting Profil."}
            </p>
          )}
        </div>
      </div>

      {/* Tabs: My Reports vs Saved */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
          <button
            onClick={() => setActiveTab("my_reports")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "my_reports"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Laporan Saya ({myReports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("saved")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "saved"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Laporan Disimpan ({savedReports.length})</span>
          </button>
        </div>

        {/* Content */}
        {loadingReports ? (
          <LoadingPattern />
        ) : reportsError ? (
          <ErrorPattern
            message={reportsError}
            onRetry={() => loadData()}
          />
        ) : activeTab === "my_reports" ? (
          myReports.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          ) : (
            <EmptyPattern
              title="Belum ada laporan yang Anda buat"
              description="Semua laporan kehilangan dan temuan yang Anda daftarkan akan tertera di sini."
            />
          )
        ) : savedReports.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onSavedChange={handleSavedChange}
              />
            ))}
          </div>
        ) : (
          <EmptyPattern
            title="Belum ada laporan yang disimpan"
            description="Tandai laporan penting menggunakan tombol simpan agar mudah diakses kembali di sini."
          />
        )}
      </div>
    </div>
  );
}
