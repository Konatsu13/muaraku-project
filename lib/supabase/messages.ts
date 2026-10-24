import { createClient } from "./client";

/**
 * Real conversation & message queries for the private Messages surface.
 * Only the 22 canonical MVP tables are used:
 * conversations, conversation_members, messages, user_profiles, reports.
 *
 * There is no profile-embedding in these queries: the schema only links both
 * `messages.sender_id` and `user_profiles.user_id` to `auth.users`, so profiles
 * are resolved with one explicit batched lookup instead of relying on a
 * PostgREST relationship that may not exist.
 */

export interface ConversationSummary {
  id: string;
  kind: "direct" | "report" | "global";
  title: string | null;
  context_report_id: string | null;
  context_report_title: string | null;
  partner_name: string;
  partner_avatar: string | null;
  last_message: string | null;
  last_message_at: string | null;
  last_sender_id: string | null;
  unread: boolean;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string | null;
  body: string;
  message_kind: "text" | "image" | "file" | "system";
  attachment_path: string | null;
  moderation_status: "approved" | "flagged" | "removed";
  deleted_at: string | null;
  created_at: string;
  is_own: boolean;
}

const MESSAGE_COLUMNS =
  "id, conversation_id, sender_id, body, message_kind, attachment_path, moderation_status, deleted_at, edited_at, created_at";

function resolveProfileMap(
  rows: Array<{ user_id: string; display_name: string | null; avatar_path: string | null }> | null
): Map<string, { display_name: string | null; avatar_path: string | null }> {
  const map = new Map<string, { display_name: string | null; avatar_path: string | null }>();
  for (const row of rows || []) {
    map.set(row.user_id, {
      display_name: row.display_name,
      avatar_path: row.avatar_path,
    });
  }
  return map;
}

/**
 * Fetch the conversations the current user is a member of, excluding the
 * Global Chat room (which has its own page).
 */
export async function fetchConversations(): Promise<{
  data: ConversationSummary[];
  error: Error | null;
}> {
  const supabase = createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: [], error: new Error("Sesi pengguna tidak ditemukan. Silakan masuk kembali.") };
    }

    const { data: memberships, error: memberError } = await supabase
      .from("conversation_members")
      .select("conversation_id, last_read_at")
      .eq("user_id", user.id);

    if (memberError) {
      return { data: [], error: new Error(memberError.message) };
    }

    const myMemberships = (memberships || []) as Array<{
      conversation_id: string;
      last_read_at: string | null;
    }>;

    if (myMemberships.length === 0) {
      return { data: [], error: null };
    }

    const lastReadMap = new Map<string, string | null>();
    for (const row of myMemberships) {
      lastReadMap.set(row.conversation_id, row.last_read_at);
    }

    const membershipIds = myMemberships.map((m) => m.conversation_id);

    const { data: conversations, error: conversationError } = await supabase
      .from("conversations")
      .select("id, kind, title, context_report_id, updated_at")
      .in("id", membershipIds)
      .in("kind", ["direct", "report"]);

    if (conversationError) {
      return { data: [], error: new Error(conversationError.message) };
    }

    const conversationRows = (conversations || []) as Array<{
      id: string;
      kind: "direct" | "report" | "global";
      title: string | null;
      context_report_id: string | null;
      updated_at: string;
    }>;

    if (conversationRows.length === 0) {
      return { data: [], error: null };
    }

    const conversationIds = conversationRows.map((c) => c.id);
    const reportIds = Array.from(
      new Set(conversationRows.map((c) => c.context_report_id).filter((id): id is string => Boolean(id)))
    );

    // Participants of every visible conversation. RLS allows this because the
    // current user can view the conversation.
    const [participantsRes, latestMessagesRes, reportsRes] = await Promise.all([
      supabase
        .from("conversation_members")
        .select("conversation_id, user_id")
        .in("conversation_id", conversationIds),
      supabase
        .from("messages")
        .select("conversation_id, sender_id, body, created_at, deleted_at")
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: false })
        .limit(200),
      reportIds.length > 0
        ? supabase.from("reports").select("id, title").in("id", reportIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (participantsRes.error) {
      return { data: [], error: new Error(participantsRes.error.message) };
    }
    if (latestMessagesRes.error) {
      return { data: [], error: new Error(latestMessagesRes.error.message) };
    }
    if (reportsRes.error) {
      return { data: [], error: new Error(reportsRes.error.message) };
    }

    const participants = (participantsRes.data || []) as Array<{
      conversation_id: string;
      user_id: string;
    }>;
    const participantIds = Array.from(new Set(participants.map((p) => p.user_id)));

    const { data: profiles, error: profileError } = await supabase
      .from("user_profiles")
      .select("user_id, display_name, avatar_path")
      .in("user_id", participantIds);

    if (profileError) {
      return { data: [], error: new Error(profileError.message) };
    }

    const profileMap = resolveProfileMap(
      (profiles || []) as Array<{
        user_id: string;
        display_name: string | null;
        avatar_path: string | null;
      }>
    );

    const reportTitleMap = new Map<string, string>();
    for (const report of (reportsRes.data || []) as Array<{ id: string; title: string }>) {
      reportTitleMap.set(report.id, report.title);
    }

    const partnerByConversation = new Map<string, string>();
    for (const participant of participants) {
      if (participant.user_id === user.id) continue;
      if (!partnerByConversation.has(participant.conversation_id)) {
        partnerByConversation.set(participant.conversation_id, participant.user_id);
      }
    }

    const latestByConversation = new Map<
      string,
      { sender_id: string; body: string; created_at: string; deleted_at: string | null }
    >();
    for (const message of (latestMessagesRes.data || []) as Array<{
      conversation_id: string;
      sender_id: string;
      body: string;
      created_at: string;
      deleted_at: string | null;
    }>) {
      if (latestByConversation.has(message.conversation_id)) continue;
      latestByConversation.set(message.conversation_id, message);
    }

    const items: ConversationSummary[] = conversationRows
      .map((conversation) => {
        const partnerId = partnerByConversation.get(conversation.id) || null;
        const partnerProfile = partnerId ? profileMap.get(partnerId) : undefined;
        const latest = latestByConversation.get(conversation.id);
        const lastReadAt = lastReadMap.get(conversation.id) || null;

        const unread = Boolean(
          latest &&
            latest.sender_id !== user.id &&
            (!lastReadAt || new Date(latest.created_at).getTime() > new Date(lastReadAt).getTime())
        );

        const partnerName =
          partnerProfile?.display_name?.trim() ||
          (conversation.kind === "report" ? "Percakapan Laporan" : "Pengguna MuaraKu");

        return {
          id: conversation.id,
          kind: conversation.kind,
          title: conversation.title,
          context_report_id: conversation.context_report_id,
          context_report_title: conversation.context_report_id
            ? reportTitleMap.get(conversation.context_report_id) || null
            : null,
          partner_name: partnerName,
          partner_avatar: partnerProfile?.avatar_path || null,
          last_message: latest
            ? latest.deleted_at
              ? "Pesan telah dihapus"
              : latest.body
            : null,
          last_message_at: latest?.created_at || null,
          last_sender_id: latest?.sender_id || null,
          unread,
        };
      })
      .sort((a, b) => {
        const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
        const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
        return bTime - aTime;
      });

    return { data: items, error: null };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Gagal memuat daftar percakapan");
    return { data: [], error };
  }
}

/**
 * Fetch the most recent messages of one conversation (bounded, oldest first).
 */
export async function fetchConversationMessages(
  conversationId: string,
  limit = 100
): Promise<{ data: ChatMessage[]; error: Error | null }> {
  if (!conversationId) {
    return { data: [], error: new Error("Percakapan tidak dipilih") };
  }

  const supabase = createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: [], error: new Error("Sesi pengguna tidak ditemukan. Silakan masuk kembali.") };
    }

    const { data, error } = await supabase
      .from("messages")
      .select(MESSAGE_COLUMNS)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(Math.max(1, Math.min(200, limit)));

    if (error) {
      return { data: [], error: new Error(error.message) };
    }

    const rows = ((data || []) as Array<Record<string, unknown>>).reverse();
    const senderIds = Array.from(new Set(rows.map((row) => String(row.sender_id))));

    const { data: profiles, error: profileError } = await supabase
      .from("user_profiles")
      .select("user_id, display_name, avatar_path")
      .in("user_id", senderIds);

    if (profileError) {
      return { data: [], error: new Error(profileError.message) };
    }

    const profileMap = resolveProfileMap(
      (profiles || []) as Array<{
        user_id: string;
        display_name: string | null;
        avatar_path: string | null;
      }>
    );

    const items: ChatMessage[] = rows.map((row) => {
      const senderId = String(row.sender_id);
      const profile = profileMap.get(senderId);
      return {
        id: String(row.id),
        conversation_id: String(row.conversation_id),
        sender_id: senderId,
        sender_name: profile?.display_name?.trim() || "Warga MuaraKu",
        sender_avatar: profile?.avatar_path || null,
        body: String(row.body || ""),
        message_kind: (row.message_kind as ChatMessage["message_kind"]) || "text",
        attachment_path: (row.attachment_path as string | null) || null,
        moderation_status:
          (row.moderation_status as ChatMessage["moderation_status"]) || "approved",
        deleted_at: (row.deleted_at as string | null) || null,
        created_at: String(row.created_at),
        is_own: senderId === user.id,
      };
    });

    return { data: items, error: null };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Gagal memuat pesan");
    return { data: [], error };
  }
}

/**
 * Send a real text message. The database policy enforces membership, blocks,
 * sender identity, and approved moderation status.
 */
export async function sendConversationMessage(
  conversationId: string,
  body: string
): Promise<{ data: ChatMessage | null; error: Error | null }> {
  const trimmed = body.trim();
  if (!trimmed) {
    return { data: null, error: new Error("Pesan tidak boleh kosong") };
  }
  if (trimmed.length > 5000) {
    return { data: null, error: new Error("Pesan maksimal 5000 karakter") };
  }

  const supabase = createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: new Error("Sesi pengguna tidak ditemukan. Silakan masuk kembali.") };
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        body: trimmed,
        message_kind: "text",
      })
      .select(MESSAGE_COLUMNS)
      .single();

    if (error || !data) {
      return { data: null, error: new Error(error?.message || "Gagal mengirim pesan") };
    }

    const row = data as Record<string, unknown>;
    return {
      data: {
        id: String(row.id),
        conversation_id: String(row.conversation_id),
        sender_id: String(row.sender_id),
        sender_name: "Anda",
        sender_avatar: null,
        body: String(row.body || trimmed),
        message_kind: "text",
        attachment_path: null,
        moderation_status: "approved",
        deleted_at: null,
        created_at: String(row.created_at),
        is_own: true,
      },
      error: null,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Gagal mengirim pesan");
    return { data: null, error };
  }
}
