import { createClient } from "./client";

/**
 * Real notification rows for the current user. `notifications` is readable
 * only by its recipient (RLS notifications_read_own) and is written by trusted
 * backend events, never by fabricated client data.
 */

export type NotificationType =
  | "new_message"
  | "possible_match"
  | "new_claim"
  | "claim_update"
  | "report_update"
  | "safety_report_update"
  | "moderation_notice"
  | "support_reply"
  | "system";

export interface NotificationItem {
  id: string;
  notification_type: NotificationType;
  title: string;
  body: string | null;
  report_id: string | null;
  claim_id: string | null;
  message_id: string | null;
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export interface NotificationPreferences {
  notify_in_app_messages: boolean;
  notify_in_app_matches: boolean;
  notify_in_app_claim_updates: boolean;
  notify_in_app_moderation_updates: boolean;
  notify_email_messages: boolean;
  notify_email_matches: boolean;
  notify_email_claim_updates: boolean;
  notify_email_moderation_updates: boolean;
}

const PREFERENCE_COLUMNS =
  "notify_in_app_messages, notify_in_app_matches, notify_in_app_claim_updates, notify_in_app_moderation_updates, notify_email_messages, notify_email_matches, notify_email_claim_updates, notify_email_moderation_updates";

export async function fetchNotifications(limit = 50): Promise<{
  data: NotificationItem[];
  unreadCount: number;
  error: Error | null;
}> {
  const supabase = createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: [], unreadCount: 0, error: new Error("Sesi pengguna tidak ditemukan. Silakan masuk kembali.") };
    }

    const { data, error } = await supabase
      .from("notifications")
      .select(
        "id, notification_type, title, body, report_id, claim_id, message_id, payload, read_at, created_at"
      )
      .eq("recipient_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(Math.max(1, Math.min(100, limit)));

    if (error) {
      return { data: [], unreadCount: 0, error: new Error(error.message) };
    }

    const items = ((data || []) as NotificationItem[]).map((row) => ({
      ...row,
      payload: (row.payload as Record<string, unknown>) || {},
    }));

    return {
      data: items,
      unreadCount: items.filter((item) => !item.read_at).length,
      error: null,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Gagal memuat notifikasi");
    return { data: [], unreadCount: 0, error };
  }
}

/**
 * Attempt a user-scoped mark-as-read through RLS.
 *
 * The schema grants `update (read_at)` to authenticated users but declares no
 * UPDATE row-level policy for `public.notifications`, so this may legitimately
 * affect zero rows. We report that honestly instead of bypassing RLS with a
 * service-role key. A migration proposal is documented separately.
 */
export async function markAllNotificationsRead(): Promise<{
  updated: number;
  error: Error | null;
}> {
  const supabase = createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { updated: 0, error: new Error("Sesi pengguna tidak ditemukan. Silakan masuk kembali.") };
    }

    const { data, error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("recipient_user_id", user.id)
      .is("read_at", null)
      .select("id");

    if (error) {
      return { updated: 0, error: new Error(error.message) };
    }

    const updated = (data || []).length;

    if (updated === 0) {
      return {
        updated: 0,
        error: new Error(
          "Status baca tidak dapat disimpan karena kebijakan database belum mengizinkan pembaruan notifikasi. Notifikasi tetap ditandai belum dibaca."
        ),
      };
    }

    return { updated, error: null };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Gagal menandai notifikasi");
    return { updated: 0, error };
  }
}

export async function fetchNotificationPreferences(): Promise<{
  data: NotificationPreferences | null;
  error: Error | null;
}> {
  const supabase = createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: new Error("Sesi pengguna tidak ditemukan. Silakan masuk kembali.") };
    }

    const { data, error } = await supabase
      .from("user_account_controls")
      .select(PREFERENCE_COLUMNS)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    if (!data) {
      return { data: null, error: null };
    }

    return { data: data as NotificationPreferences, error: null };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Gagal memuat preferensi notifikasi");
    return { data: null, error };
  }
}

export async function updateNotificationPreferences(
  patch: Partial<NotificationPreferences>
): Promise<{ success: boolean; error: Error | null }> {
  const supabase = createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: new Error("Sesi pengguna tidak ditemukan. Silakan masuk kembali.") };
    }

    if (Object.keys(patch).length === 0) {
      return { success: true, error: null };
    }

    const { data, error } = await supabase
      .from("user_account_controls")
      .update(patch)
      .eq("user_id", user.id)
      .select("user_id");

    if (error) {
      return { success: false, error: new Error(error.message) };
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        error: new Error("Preferensi tidak tersimpan. Pastikan akun Anda aktif dan coba lagi."),
      };
    }

    return { success: true, error: null };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Gagal menyimpan preferensi notifikasi");
    return { success: false, error };
  }
}
