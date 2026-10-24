import { redirect } from "next/navigation";

// Per AGENTS.md: Settings adalah overlay, bukan route/halaman.
// Route /app/settings dialihkan langsung ke /app.
export default function SettingsRedirect() {
  redirect("/app");
}
