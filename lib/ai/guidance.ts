export type AiLocale = "id" | "en";

export function getMuaraGuidanceReply(
  message: string,
  locale: AiLocale
): string | null {
  const normalized = message.toLocaleLowerCase(locale);

  if (
    /(lapor|barang hilang|lost item|report.*item|found item)/i.test(normalized)
  ) {
    return locale === "id"
      ? "Buka menu Seeker untuk barang yang hilang atau Finder untuk barang yang ditemukan. Isi judul, deskripsi umum, lokasi, dan tanggal. Simpan ciri rahasia hanya di bagian bukti privat; jangan menuliskannya pada deskripsi publik."
      : "Open Seeker for a lost item or Finder for an item you found. Add a title, public description, location, and date. Keep private identifying clues in the private-proof section, not in the public description.";
  }

  if (/(serah|aman|tebusan|handoff|hand.?over|ransom|safe meeting)/i.test(normalized)) {
    return locale === "id"
      ? "Bertemu di tempat umum yang ramai, jangan membayar uang tebusan atau biaya sebelum barang diperiksa, dan cocokkan ciri rahasia sebelum penyerahan. Jika merasa terancam, batalkan pertemuan dan hubungi pihak berwenang."
      : "Meet in a busy public place, never pay a ransom or fee before inspecting the item, and verify private details before handoff. If you feel unsafe, cancel the meeting and contact local authorities.";
  }

  if (/(klaim|pemilik|verifikasi|claim|ownership|verify)/i.test(normalized)) {
    return locale === "id"
      ? "Ajukan klaim dari halaman laporan barang temuan dan jelaskan bukti kepemilikan secara privat. Penemu dan pengklaim tetap perlu memverifikasi bukti secara langsung; MuaraKu tidak menentukan kepemilikan."
      : "Submit a claim from the found-item report and provide ownership evidence privately. The finder and claimant still need to verify the evidence themselves; MuaraKu does not decide ownership.";
  }

  if (/(biaya|bayar|fee|payment|scam|penipuan)/i.test(normalized)) {
    return locale === "id"
      ? "MuaraKu tidak meminta biaya untuk mengembalikan barang. Jangan transfer uang atau membagikan kode OTP. Laporkan permintaan mencurigakan melalui fitur Laporkan atau kirim tiket ke Pusat Bantuan."
      : "MuaraKu does not charge a fee to return an item. Do not transfer money or share an OTP. Report suspicious requests with the Report action or send a ticket through the Help Center.";
  }

  return null;
}
