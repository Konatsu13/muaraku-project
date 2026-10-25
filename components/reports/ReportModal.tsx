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
  PackageSearch,
  PackageCheck,
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

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 8 * 1024 * 1024;

type FieldErrors = Partial<
  Record<"title" | "category_id" | "occurred_date" | "location_label" | "city" | "description", string>
>;

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: "lost" | "found";
  editReport?: ReportDetailItem | null;
  onSuccess?: (report: ReportDetailItem) => void;
}

export function ReportModal({
  isOpen,
  onClose,
  defaultType = "lost",
  editReport,
  onSuccess,
}: ReportModalProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // `report_type` is fixed by the page context (or the report being edited).
  // It is never user-switchable inside the form.
  const reportType: "lost" | "found" = editReport ? editReport.report_type : defaultType;

  const [categories, setCategories] = useState<ReportCategory[]>([]);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

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
  const [color, setColor] = useState(editReport?.color || "");
  const [brand, setBrand] = useState(editReport?.brand || "");
  const [model, setModel] = useState(editReport?.model || "");

  // Private details
  const [ownerOnlyClues, setOwnerOnlyClues] = useState(
    editReport?.private_details?.owner_only_clues || ""
  );
  const [privateContact, setPrivateContact] = useState(
    editReport?.private_details?.private_contact || ""
  );
  const [contactPreference, setContactPreference] = useState<"in_app" | "email" | "other">(
    editReport?.private_details?.contact_preference || "in_app"
  );

  // File uploads
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Load categories when modal is opened
  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    fetchCategories().then((res) => {
      if (!mounted) return;
      if (res.error) {
        setCategoriesError(res.error.message);
        return;
      }
      setCategories(res.data || []);
    });
    return () => {
      mounted = false;
    };
  }, [isOpen]);

  const previewUrlsRef = useRef<string[]>([]);
  useEffect(() => {
    previewUrlsRef.current = previewUrls;
  }, [previewUrls]);

  // Cleanup object URLs on unmount to prevent browser memory leaks
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

  // Sync editReport state if provided
  useEffect(() => {
    if (editReport) {
      setTitle(editReport.title);
      setDescription(editReport.description);
      setCategoryId(editReport.category_id || "");
      setLocationLabel(editReport.location_label || "");
      setCity(editReport.city || "");
      const parts = splitOccurredAt(editReport.occurred_at, editReport.item_attributes);
      setOccurredDate(parts.date);
      setOccurredTime(parts.time);
      setColor(editReport.color || "");
      setBrand(editReport.brand || "");
      setModel(editReport.model || "");
      setOwnerOnlyClues(editReport.private_details?.owner_only_clues || "");
      setPrivateContact(editReport.private_details?.private_contact || "");
      setContactPreference(editReport.private_details?.contact_preference || "in_app");
    }
  }, [editReport]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setErrorMsg(null);

    const validFiles: File[] = [];
    for (const f of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(f.type)) {
        setErrorMsg(`Berkas "${f.name}" harus berformat JPG, PNG, atau WEBP.`);
        e.target.value = "";
        return;
      }
      if (f.size > MAX_FILE_SIZE) {
        setErrorMsg(`Berkas "${f.name}" melebihi ukuran batas 8MB.`);
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

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();

    if (trimmedTitle.length < 3 || trimmedTitle.length > 140) {
      errors.title = "Judul harus antara 3 dan 140 karakter.";
    }
    if (!categoryId) {
      errors.category_id = "Pilih kategori barang.";
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
      errors.city = "Kota wajib diisi.";
    } else if (city.trim().length > 100) {
      errors.city = "Kota maksimal 100 karakter.";
    }
    if (trimmedDesc.length < 5 || trimmedDesc.length > 5000) {
      errors.description = "Deskripsi harus antara 5 dan 5000 karakter.";
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!user) {
      setErrorMsg("Anda harus masuk terlebih dahulu untuk membuat atau mengubah laporan.");
      return;
    }

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setErrorMsg("Periksa kembali kolom yang ditandai sebelum melanjutkan.");
      return;
    }

    const occurred = buildOccurredAt(occurredDate, occurredTime);
    if ("error" in occurred) {
      setFieldErrors({ occurred_date: occurred.error });
      setErrorMsg(occurred.error);
      return;
    }

    // Preserve any unrelated item attributes already stored on the report and
    // only overwrite the occurrence-precision marker.
    const itemAttributes: Record<string, unknown> = {
      ...(editReport?.item_attributes || {}),
      ...occurred.attributes,
    };

    setLoading(true);

    try {
      if (editReport) {
        // UPDATE existing report
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
          }
        );

        if (!res.success || res.error) {
          throw new Error(res.error?.message || "Gagal memperbarui laporan");
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
        // CREATE new report
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
          throw new Error(res.error?.message || "Gagal membuat laporan");
        }

        setSuccessMsg("Laporan berhasil dibuat dan sedang menunggu peninjauan moderator.");
        if (onSuccess) {
          onSuccess(res.data);
        }
      }

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat memproses laporan";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputClass = (hasError: boolean) =>
    `w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 ${
      hasError
        ? "border-rose-400 dark:border-rose-700"
        : "border-zinc-200 dark:border-zinc-800"
    }`;

  const fieldError = (key: keyof FieldErrors) =>
    fieldErrors[key] ? (
      <span className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 block">
        {fieldErrors[key]}
      </span>
    ) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#121214] w-full max-w-2xl rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {editReport
                ? "Edit Laporan"
                : reportType === "lost"
                ? "Buat Laporan Kehilangan"
                : "Buat Laporan Temuan"}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {editReport
                ? "Perbarui rincian informasi laporan barang Anda"
                : "Isi data dengan akurat agar mempercepat proses verifikasi temu kembali"}
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup modal"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl text-xs bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Fixed report type indicator */}
          <div className="flex items-center gap-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2.5">
            {reportType === "lost" ? (
              <PackageSearch className="w-4 h-4 text-rose-500 flex-shrink-0" />
            ) : (
              <PackageCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            )}
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
              Jenis laporan:{" "}
              <strong className="text-zinc-900 dark:text-zinc-100">
                {reportType === "lost" ? "Barang Hilang" : "Barang Ditemukan"}
              </strong>
              . Jenis ditentukan oleh halaman tempat laporan dibuat.
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Judul Barang <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={140}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Dompet Kulit Coklat merk Bifold"
              aria-invalid={Boolean(fieldErrors.title)}
              className={inputClass(Boolean(fieldErrors.title))}
            />
            {fieldError("title") || (
              <span className="text-[10px] text-zinc-400 mt-1 block">3 - 140 karakter</span>
            )}
          </div>

          {/* Category & Occurred At Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Kategori <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                aria-invalid={Boolean(fieldErrors.category_id)}
                className={inputClass(Boolean(fieldErrors.category_id))}
              >
                <option value="">Pilih Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_id}
                  </option>
                ))}
              </select>
              {fieldError("category_id")}
              {categoriesError && (
                <span className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 block">
                  Gagal memuat kategori: {categoriesError}
                </span>
              )}
              {!categoriesError && categories.length === 0 && (
                <span className="text-[10px] text-zinc-400 mt-1 block">
                  Daftar kategori belum tersedia.
                </span>
              )}
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Tanggal Kejadian <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={occurredDate}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setOccurredDate(e.target.value)}
                  aria-invalid={Boolean(fieldErrors.occurred_date)}
                  className={inputClass(Boolean(fieldErrors.occurred_date))}
                />
                {fieldError("occurred_date")}
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Waktu <span className="text-zinc-400 font-normal">(opsional)</span>
                </label>
                <input
                  type="time"
                  value={occurredTime}
                  onChange={(e) => setOccurredTime(e.target.value)}
                  className={inputClass(false)}
                />
              </div>
            </div>
          </div>

          {/* Location & City Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Lokasi Spesifik / Tempat <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={200}
                value={locationLabel}
                onChange={(e) => setLocationLabel(e.target.value)}
                placeholder="Contoh: Stasiun Gambir Gate 2"
                aria-invalid={Boolean(fieldErrors.location_label)}
                className={inputClass(Boolean(fieldErrors.location_label))}
              />
              {fieldError("location_label")}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Kota <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Contoh: Jakarta Pusat"
                aria-invalid={Boolean(fieldErrors.city)}
                className={inputClass(Boolean(fieldErrors.city))}
              />
              {fieldError("city")}
            </div>
          </div>

          {/* Color, Brand, Model Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Warna <span className="text-zinc-400 font-normal">(opsional)</span>
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Misal: Cokelat tua"
                className={inputClass(false)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Merek / Brand <span className="text-zinc-400 font-normal">(opsional)</span>
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Misal: Fossil"
                className={inputClass(false)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Model / Seri <span className="text-zinc-400 font-normal">(opsional)</span>
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Misal: Derrick RFID"
                className={inputClass(false)}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Deskripsi Publik <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              minLength={5}
              maxLength={5000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan ciri umum barang yang dapat dilihat oleh publik..."
              aria-invalid={Boolean(fieldErrors.description)}
              className={inputClass(Boolean(fieldErrors.description))}
            />
            {fieldError("description") || (
              <span className="text-[10px] text-zinc-400 mt-1 block">
                Jangan tulis ciri rahasia atau kontak pribadi di sini.
              </span>
            )}
          </div>

          {/* Photo Upload Area */}
          {!editReport && (
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Foto Barang <span className="text-zinc-400 font-normal">(opsional, maks. 8MB/foto)</span>
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-zinc-50/50 dark:bg-zinc-900/50"
              >
                <Upload className="w-5 h-5 text-zinc-400 mb-1.5" />
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Pilih foto dari perangkat
                </span>
                <span className="text-[10px] text-zinc-400 mt-0.5">
                  Format JPG, PNG, atau WEBP. Disimpan di bucket privat terenkripsi.
                </span>
              </div>

              {previewUrls.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {previewUrls.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-black text-white rounded-md text-[10px]"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Private Verification Clues Section */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-3.5 h-3.5 text-orange-500" />
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Ciri Rahasia &amp; Privasi Pemilik
              </h3>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed">
              Informasi di bawah ini hanya dapat dilihat oleh Anda dan moderator saat proses klaim. Informasi ini <strong>tidak akan</strong> muncul pada feed atau pencarian publik.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Ciri Rahasia Khusus (Owner Clues)
                </label>
                <textarea
                  rows={2}
                  maxLength={2000}
                  value={ownerOnlyClues}
                  onChange={(e) => setOwnerOnlyClues(e.target.value)}
                  placeholder="Misal: Nomor seri tersembunyi, foto di balik case, goresan di sudut kiri..."
                  className={inputClass(false)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Preferensi Kontak
                  </label>
                  <select
                    value={contactPreference}
                    onChange={(e) => setContactPreference(e.target.value as "in_app" | "email" | "other")}
                    className={inputClass(false)}
                  >
                    <option value="in_app">Melalui Pesan Aplikasi (MuaraKu Chat)</option>
                    <option value="email">Melalui Email</option>
                    <option value="other">Kontak Lain</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Kontak Tambahan (Privat)
                  </label>
                  <input
                    type="text"
                    maxLength={250}
                    value={privateContact}
                    onChange={(e) => setPrivateContact(e.target.value)}
                    placeholder="Misal: nomor WhatsApp atau Telegram"
                    className={inputClass(false)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-orange-600 hover:bg-orange-500 text-white disabled:opacity-50 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{editReport ? "Simpan Perubahan" : "Terbitkan Laporan"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
