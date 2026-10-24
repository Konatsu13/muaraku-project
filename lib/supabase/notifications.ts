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
 * Mark the current user's unread notifications as read through a server route.
 * The schema grants `update (read_at)` but declares no UPDATE RLS policy, so the
 * route verifies the session and filters by recipient_user_id on the server.
 */
export async function markAllNotificationsRead(): Promise<{
  updated: number;
  error: Error | null;
}> {
  try {
    const res = await fetch("/api/notifications/read", { method: "POST" });
    const payload = (await res.json().catch(() => null)) as
      | { updated?: number; error?: string }
      | null;

    if (!res.ok) {
      return { updated: 0, error: new Error(payload?.error || "Gagal menandai notifikasi") };
    }

    return { updated: payload?.updated || 0, error: null };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Gagal menandai notifikasi");
    return { updated: 0, error };
  }
}
