"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import {
  ShieldCheck,
  Calendar,
  FileText,
  Edit3,
  Save,
  Loader2,
  Mail,
} from "lucide-react";
import { ReportCard, ReportItem } from "@/components/reports/ReportCard";
import { fetchReports } from "@/lib/supabase/reports";

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const supabase = createClient();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || "Pengguna MuaraKu");
  const [bio, setBio] = useState(profile?.bio || "");
  const [saving, setSaving] = useState(false);
  const [myReports, setMyReports] = useState<ReportItem[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  React.useEffect(() => {
    let isMounted = true;
    async function loadUserReports() {
      if (!user) return;
      const res = await fetchReports({ reporter_user_id: user.id });
      if (isMounted) {
        setMyReports(res.data || []);
        setLoadingReports(false);
      }
    }
    loadUserReports();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      await supabase
        .from("user_profiles")
        .update({
          display_name: displayName.trim(),
          bio: bio.trim(),
        })
        .eq("user_id", user.id);

      await refreshProfile();
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-orange-500/20 text-orange-600 dark:text-orange-400 font-extrabold text-2xl flex items-center justify-center ring-4 ring-orange-500/10 flex-shrink-0">
              {profile?.avatar_path ? (
                <img src={profile.avatar_path} alt="" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                (profile?.display_name || user?.email || "U").charAt(0).toUpperCase()
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
                  {profile?.display_name || "Pengguna MuaraKu"}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Warga Terverifikasi
                </span>
              </div>

              <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{user?.email || "Belum masuk akun"}</span>
              </p>

              <p className="text-xs text-zinc-400 flex items-center gap-1.5 pt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Bergabung sejak Oktober 2026</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 flex items-center gap-1.5 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? "Batal" : "Sunting Profil"}</span>
          </button>
        </div>

        {/* Bio / Edit Form */}
        <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Nama Tampilan
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Bio Singkat
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Ceritakan sedikit tentang Anda..."
                  className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Perubahan</span>
              </button>
            </form>
          ) : (
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
              {profile?.bio ||
                "Peduli sesama warga kampus. Siap membantu mengembalikan barang yang tertinggal."}
            </p>
          )}
        </div>
      </div>

      {/* Report History */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-orange-500" />
          <span>Riwayat Laporan Saya ({myReports.length})</span>
        </h2>

        {myReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-400">
            Belum ada riwayat laporan yang dibuat.
          </div>
        )}
      </div>
    </div>
  );
}
