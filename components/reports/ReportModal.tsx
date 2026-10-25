"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import {
  X,
  Lock,
  Upload,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Check,
  PackageSearch,
  PackageCheck,
  ChevronDown,
  Trash2,
} from "lucide-react";
import {
  createReport,
  updateReport,
  fetchCategories,
  ReportCategory,
  ReportDetailItem,
  CreateReportInput,
} from "@/lib/supabase/reports";
import { buildOccurredAt, splitOccurredAt } from "@/lib/reports/occurred-at";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

type FieldErrors = Partial<
  Record<
    | "title"
    | "category_id"
    | "occurred_date"
    | "occurred_time"
    | "location_label"
    | "city"
    | "description"
    | string,
    string
  >
>;

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: "lost" | "found";
  editReport?: ReportDetailItem | null;
  onSuccess?: (report: ReportDetailItem) => void;
}

function ReportModalInner({
  onClose,
  defaultType = "lost",
  editReport,
  onSuccess,
}: Omit<ReportModalProps, "isOpen">) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // `report_type` is fixed by context/page; cannot be arbitrarily changed
  const reportType: "lost" | "found" = editReport ? editReport.report_type : defaultType;

  const [categories, setCategories] = useState<ReportCategory[]>([]);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Expandable optional sections (progressive disclosure)
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [showPrivateClues, setShowPrivateClues] = useState(false);
  const [showContactOptions, setShowContactOptions] = useState(false);

  // --- Required fields (Section 1 & 2 & 3) ---
  const [title, setTitle] = useState(editReport?.title || "");
  const [description, setDescription] = useState(editReport?.description || "");
  const [categoryId, setCategoryId] = useState<string>(editReport?.category_id || "");

  const initialOccurred = splitOccurredAt(
    editReport?.occurred_at,
    editReport?.item_attributes
  );
  const [occurredDate, setOccurredDate] = useState(initialOccurred.date);
  const [occurredTime, setOccurredTime] = useState(initialOccurred.time);

  const [locationLabel, setLocationLabel] = useState(editReport?.location_label || "");
  const [city, setCity] = useState(editReport?.city || "");

  // --- Optional fields (Section 1 extended) ---
  const [color, setColor] = useState(editReport?.color || "");
  const [brand, setBrand] = useState(editReport?.brand || "");
  const [model, setModel] = useState(editReport?.model || "");

  // --- File uploads ---
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [removedMediaIds, setRemovedMediaIds] = useState<string[]>([]);
  const keptExistingMedia = (editReport?.media || []).filter(
    (m) => !removedMediaIds.includes(m.id)
  );

  // --- Private verification clues (Section 4) ---
  const [ownerOnlyClues, setOwnerOnlyClues] = useState(
    editReport?.private_details?.owner_only_clues || ""
  );
  const [privateContact, setPrivateContact] = useState(
    editReport?.private_details?.private_contact || ""
  );
  const [contactPreference, setContactPreference] = useState<"in_app" | "email" | "other">(
    editReport?.private_details?.contact_preference || "in_app"
  );

  // --- UI state ---
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Load categories
  useEffect(() => {
    let mounted = true;
    fetchCategories().then((res) => {
      if (!mounted) return;
      if (res.error) {
        setCategoriesError(res.error.message);
      } else {
        setCategories(res.data || []);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  // Object URL cleanup
  const previewUrlsRef = useRef<string[]>([]);
  useEffect(() => {
    previewUrlsRef.current = previewUrls;
  }, [previewUrls]);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore
        }
      });
      previewUrlsRef.current = [];
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setErrorMsg(null);

    const validFiles: File[] = [];
    for (const f of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(f.type)) {
        setErrorMsg(`Format berkas "${f.name}" tidak didukung. Harap gunakan format JPG, PNG, atau WEBP.`);
        e.target.value = "";
        return;
      }
      if (f.size > MAX_FILE_SIZE) {
        setErrorMsg(`Ukuran berkas "${f.name}" melebihi batas maksimal 8MB.`);
        e.target.value = "";
        return;
      }
      validFiles.push(f);
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    const newPreviews = validFiles.map((f) => URL.createObjectURL(f));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
    e.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleRemoveKeptMedia = (mediaId: string) => {
    setRemovedMediaIds((prev) => [...prev, mediaId]);
  };

  // Validate all required fields (single-page form)
  const validateForm = (): boolean => {
    const errors: FieldErrors = {};
    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();

    if (trimmedTitle.length < 3 || trimmedTitle.length > 140) {
      errors.title = "Nama / judul barang wajib antara 3 dan 140 karakter.";
    }
    if (!categoryId) {
      errors.category_id = "Kategori barang wajib dipilih.";
    }
    if (!occurredDate) {
      errors.occurred_date = "Tanggal kejadian wajib diisi.";
    }
    if (!locationLabel.trim()) {
      errors.location_label = "Lokasi kejadian wajib diisi.";
    } else if (locationLabel.trim().length > 200) {
      errors.location_label = "Lokasi maksimal 200 karakter.";
    }
    if (!city.trim()) {
      errors.city = "Kota kejadian wajib diisi.";
    } else if (city.trim().length > 100) {
      errors.city = "Nama kota maksimal 100 karakter.";
    }
    if (trimmedDesc.length < 5 || trimmedDesc.length > 5000) {
      errors.description = "Deskripsi publik wajib antara 5 dan 5000 karakter.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!user) {
      setErrorMsg("Anda harus masuk terlebih dahulu untuk membuat atau mengubah laporan.");
      return;
    }

    if (!validateForm()) {
      setErrorMsg("Harap periksa kembali kolom wajib yang ditandai tanda bintang (*).");
      return;
    }

    const occurred = buildOccurredAt(occurredDate, occurredTime);
    if ("error" in occurred) {
      setFieldErrors({ occurred_date: occurred.error });
      setErrorMsg(occurred.error);
      return;
    }

    const itemAttributes: Record<string, unknown> = {
      ...(editReport?.item_attributes || {}),
      ...occurred.attributes,
    };

    setLoading(true);

    try {
      if (editReport) {
        const res = await updateReport(
          editReport.id,
          {
            title: title.trim(),
            description: description.trim(),
            category_id: categoryId,
            location_label: locationLabel.trim(),
            city: city.trim(),
            occurred_at: occurred.occurred_at,
            item_attributes: itemAttributes,
            color: color.trim() || null,
            brand: brand.trim() || null,
            model: model.trim() || null,
          },
          {
            owner_only_clues: ownerOnlyClues.trim() || null,
            private_contact: privateContact.trim() || null,
            contact_preference: contactPreference,
          },
          selectedFiles.length > 0 || removedMediaIds.length > 0
            ? {
                filesToAdd: selectedFiles,
                mediaIdsToRemove: removedMediaIds,
              }
            : undefined
        );

        if (!res.success || res.error) {
          throw new Error(res.error?.message || "Gagal memperbarui laporan.");
        }

        setSuccessMsg("Laporan berhasil diperbarui.");
        if (onSuccess) {
          onSuccess({
            ...editReport,
            title: title.trim(),
            description: description.trim(),
            category_id: categoryId,
            location_label: locationLabel.trim(),
            city: city.trim(),
            occurred_at: occurred.occurred_at,
            item_attributes: itemAttributes,
            color: color.trim() || null,
            brand: brand.trim() || null,
            model: model.trim() || null,
          });
        }
      } else {
        const input: CreateReportInput = {
          report_type: reportType,
          title: title.trim(),
          description: description.trim(),
          category_id: categoryId,
          location_label: locationLabel.trim(),
          city: city.trim(),
          occurred_at: occurred.occurred_at,
          item_attributes: itemAttributes,
          color: color.trim() || null,
          brand: brand.trim() || null,
          model: model.trim() || null,
          owner_only_clues: ownerOnlyClues.trim() || null,
          private_contact: privateContact.trim() || null,
          contact_preference: contactPreference,
        };

        const res = await createReport(input, selectedFiles);

        if (res.error || !res.data) {
          throw new Error(res.error?.message || "Gagal membuat laporan.");
        }

        setSuccessMsg("Laporan berhasil dibuat dan sedang menunggu peninjauan moderator.");
        if (onSuccess) {
          onSuccess(res.data);
        }
      }

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan laporan.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-3.5 py-2.5 bg-surface dark:bg-zinc-900 border rounded-lg text-xs sm:text-sm text-main-text dark:text-zinc-100 placeholder-secondary-text focus:outline-hidden focus:ring-2 focus:ring-brand focus:border-brand transition-colors ${
      hasError
        ? "border-error dark:border-error bg-error/10"
        : "border-subtle dark:border-zinc-800"
    }`;

  const renderFieldError = (key: keyof FieldErrors) =>
    fieldErrors[key] ? (
      <span className="text-[11px] font-medium text-error dark:text-error mt-1 block">
        {fieldErrors[key]}
      </span>
    ) : null;

  const requiredLabel = (label: React.ReactNode) => (
    <span className="flex items-center gap-1">
      {label}
      <span className="text-error font-bold text-xs">*</span>
    </span>
  );

  const optionalLabel = (label: React.ReactNode) => (
    <span className="flex items-center gap-1">
      {label}
      <span className="text-secondary-text text-xs font-normal">(opsional)</span>
    </span>
  );

  const sectionTitle = (title: string, subtitle?: string) => (
    <div className="mb-4">
      <h3 className="text-base font-bold text-main-text mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-secondary-text leading-relaxed">{subtitle}</p>}
    </div>
  );

  const isLost = reportType === "lost";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-fade-in"
    >
      <div
        className="bg-surface dark:bg-[#121214] w-full max-w-2xl rounded-xl border border-subtle dark:border-zinc-800 shadow-xl flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-subtle dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              isLost ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : "bg-trust/10 text-trust dark:text-trust"
            }`}>
              {isLost ? (
                <PackageSearch className="w-5 h-5" />
              ) : (
                <PackageCheck className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2
                id="report-modal-title"
                className="text-base sm:text-lg font-bold text-main-text"
              >
                {editReport
                  ? "Edit Laporan Barang"
                  : reportType === "lost"
                    ? "Laporkan Barang Hilang"
                    : "Laporkan Barang Ditemukan"}
              </h2>
              <p className="text-xs text-secondary-text">
                {reportType === "lost"
                  ? "Jelaskan barang yang kamu cari agar komunitas bisa membantu menemukannya."
                  : "Jelaskan barang yang kamu temukan agar pemiliknya dapat mengklaimnya."}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup form"
            className="p-2 rounded-lg text-secondary-text hover:text-main-text dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl text-xs bg-error/10 dark:bg-error/20 text-error dark:text-error border border-error/30 dark:border-error/40 flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl text-xs bg-success/10 dark:bg-success/20 text-success dark:text-success border border-success/30 dark:border-success/40 flex items-start gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ================= SECTION 1: CERITAKAN BARANG ================= */}
          <div className="space-y-4 animate-fade-in">
            {sectionTitle(
              "Ceritakan barangmu",
              "Masukkan informasi dasar agar orang lain dapat mengenali barang ini."
            )}

            {/* Title */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-main-text">{requiredLabel("Nama / Judul Barang")}</label>
              <input
                type="text"
                required
                autoFocus
                minLength={3}
                maxLength={140}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Dompet kulit cokelat"
                className={inputClass(!!fieldErrors.title)}
                aria-invalid={!!fieldErrors.title}
                aria-errormessage={fieldErrors.title ? "title-error" : undefined}
              />
              {renderFieldError("title")}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-main-text">{requiredLabel("Kategori")}</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={inputClass(!!fieldErrors.category_id)}
                aria-invalid={!!fieldErrors.category_id}
              >
                <option value="">Pilih kategori barang</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_id}
                  </option>
                ))}
              </select>
              {renderFieldError("category_id")}
            </div>

            {/* Optional: Color, Brand, Model in one row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-main-text">{optionalLabel("Warna")}</label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Contoh: cokelat, hitam, biru"
                  className={inputClass(false)}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-main-text">{optionalLabel("Merek")}</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Contoh: Samsonite"
                  className={inputClass(false)}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-main-text">{optionalLabel("Model / Ciri Khusus")}</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Contoh: Vario 150, iPhone 13"
                  className={inputClass(false)}
                />
              </div>
            </div>

            {/* Photo upload */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-main-text">{optionalLabel("Foto Barang")}</label>
              <p className="text-[11px] text-secondary-text">
                Foto membantu orang mengenali barang. Ambil foto jelas dari beberapa sudut. Maksimal 8MB per berkas (JPG, PNG, WEBP).
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-subtle">
                    <img
                      src={previewUrls[index]}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      aria-label={`Hapus foto ${file.name}`}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-lg p-1 hover:bg-black/80 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {keptExistingMedia.map((media) => (
                  <div key={media.id} className="relative aspect-square rounded-lg overflow-hidden border border-subtle bg-zinc-100 dark:bg-zinc-800">
                    <span className="absolute inset-0 flex items-center justify-center text-zinc-500 dark:text-zinc-400 text-[10px]">
                      Foto tersimpan
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeptMedia(media.id)}
                      aria-label="Hapus foto tersimpan"
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-lg p-1 hover:bg-black/80 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="aspect-square rounded-lg border border-dashed border-subtle bg-zinc-50/50 dark:bg-zinc-800/50 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  <Upload className="w-5 h-5 text-secondary-text" />
                  <span className="text-[10px] font-medium text-secondary-text">Tambah Foto</span>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="sr-only"
                    aria-label="Pilih foto barang"
                  />
                </label>
              </div>
              {selectedFiles.length + keptExistingMedia.length > 0 && (
                <p className="text-[11px] text-secondary-text mt-1">
                  {selectedFiles.length} foto baru, {keptExistingMedia.length} foto tersimpan.
                </p>
              )}
            </div>
          </div>

          {/* ================= SECTION 2: WAKTU & LOKASI ================= */}
          <div className="space-y-4 animate-fade-in">
            {sectionTitle(
              "Di mana dan kapan?",
              "Lokasi yang spesifik membantu orang lain mengenali tempat kejadian barang."
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-main-text">{requiredLabel("Tanggal Kejadian")}</label>
                <input
                  type="date"
                  required
                  value={occurredDate}
                  onChange={(e) => setOccurredDate(e.target.value)}
                  className={inputClass(!!fieldErrors.occurred_date)}
                  aria-invalid={!!fieldErrors.occurred_date}
                />
                {renderFieldError("occurred_date")}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-main-text">{optionalLabel("Waktu Kejadian")}</label>
                <input
                  type="time"
                  value={occurredTime}
                  onChange={(e) => setOccurredTime(e.target.value)}
                  className={inputClass(false)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-main-text">{requiredLabel("Lokasi Spesifik")}</label>
              <input
                type="text"
                required
                maxLength={200}
                value={locationLabel}
                onChange={(e) => setLocationLabel(e.target.value)}
                placeholder="Contoh: Stasiun Gambir, dekat Gate 2"
                className={inputClass(!!fieldErrors.location_label)}
                aria-invalid={!!fieldErrors.location_label}
              />
              {renderFieldError("location_label")}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-main-text">{requiredLabel("Kota")}</label>
              <input
                type="text"
                required
                maxLength={100}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Contoh: Jakarta Pusat"
                className={inputClass(!!fieldErrors.city)}
                aria-invalid={!!fieldErrors.city}
              />
              {renderFieldError("city")}
            </div>
          </div>

          {/* ================= SECTION 3: DESKRIPSI PUBLIK ================= */}
          <div className="space-y-4 animate-fade-in">
            {sectionTitle(
              "Bantu orang mengenalinya",
              "Ceritakan ciri yang terlihat oleh orang lain. Simpan detail rahasia untuk verifikasi pemilik di bagian berikutnya."
            )}

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-main-text">{requiredLabel("Deskripsi Publik")}</label>
              <textarea
                required
                minLength={5}
                maxLength={5000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Contoh: Dompet kulit cokelat dengan beberapa kartu di dalamnya. Terakhir terlihat di sekitar stasiun."
                className={inputClass(!!fieldErrors.description)}
                aria-invalid={!!fieldErrors.description}
              />
              {renderFieldError("description")}
            </div>
          </div>

          {/* ================= SECTION 4: PETUNJUK PRIBADI (COLLAPSIBLE) ================= */}
          <div className="animate-fade-in">
            <button
              type="button"
              onClick={() => setShowPrivateClues(!showPrivateClues)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-subtle bg-zinc-50/50 dark:bg-zinc-800/50 text-xs font-semibold text-main-text hover:bg-surface transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4" />
                Petunjuk Pribadi untuk Verifikasi
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showPrivateClues ? "rotate-180" : ""}`}
              />
            </button>

            {showPrivateClues && (
              <div className="mt-3 space-y-3 rounded-lg border border-subtle bg-zinc-50/50 dark:bg-zinc-800/50 p-4">
                <p className="text-xs text-secondary-text leading-relaxed mb-3">
                  Tambahkan ciri yang hanya diketahui pemilik asli. Informasi ini <b className="text-main-text">tidak ditampilkan pada laporan publik</b> dan dapat membantu proses verifikasi klaim.
                </p>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-main-text">{optionalLabel("Ciri yang Tidak Dipublikasikan")}</label>
                  <textarea
                    value={ownerOnlyClues}
                    onChange={(e) => setOwnerOnlyClues(e.target.value)}
                    rows={3}
                    placeholder="Contoh: Detail pada bagian belakang barang yang tidak terlihat di foto."
                    className="w-full px-3.5 py-2.5 bg-surface dark:bg-zinc-900 border rounded-lg text-xs sm:text-sm text-main-text dark:text-zinc-100 placeholder-secondary-text focus:outline-hidden focus:ring-2 focus:ring-brand transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-main-text">{optionalLabel("Kontak Tambahan")}</label>
                  <input
                    type="text"
                    value={privateContact}
                    onChange={(e) => setPrivateContact(e.target.value)}
                    maxLength={250}
                    placeholder="Contoh: kontak melalui MuaraKu chat saja"
                    className="w-full px-3.5 py-2.5 bg-surface dark:bg-zinc-900 border rounded-lg text-xs sm:text-sm text-main-text dark:text-zinc-100 placeholder-secondary-text focus:outline-hidden focus:ring-2 focus:ring-brand transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-main-text">{optionalLabel("Preferensi Kontak")}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["in_app", "email", "other"] as const).map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setContactPreference(val)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
                          contactPreference === val
                            ? "bg-brand text-orange-900 border-brand"
                            : "bg-surface text-main-text border-subtle hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        {val === "in_app" ? "Chat MuaraKu" : val === "email" ? "Email" : "Lainnya"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Footer */}
          <div className="mt-2 flex items-center justify-end gap-2 pt-4 border-t border-subtle dark:border-zinc-800">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={onClose}
              className="px-4"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loading}
              className="px-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Mengirim...
                </>
              ) : (
                "Publikasikan Laporan"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ReportModal({
  isOpen,
  onClose,
  defaultType,
  editReport,
  onSuccess,
}: ReportModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" aria-hidden="true">
      <ReportModalInner
        onClose={onClose}
        defaultType={defaultType}
        editReport={editReport}
        onSuccess={onSuccess}
      />
    </div>
  );
}

ReportModal.displayName = "ReportModal";
