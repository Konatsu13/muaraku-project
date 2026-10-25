import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/server/rate-limit";

const categories = new Set([
  "general",
  "account",
  "report",
  "claim",
  "safety",
  "privacy",
  "technical",
  "other",
]);

function response(
  body: Record<string, unknown>,
  status = 200,
  headers?: HeadersInit
) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  let sameOrigin = false;
  try {
    sameOrigin = Boolean(origin) && new URL(origin!).origin === new URL(request.url).origin;
  } catch {
    sameOrigin = false;
  }
  if (!sameOrigin) {
    return response({ error_code: "origin_invalid" }, 403);
  }

  const contentLengthHeader = request.headers.get("content-length");
  const contentLength = contentLengthHeader ? Number(contentLengthHeader) : 0;
  if (!Number.isFinite(contentLength) || contentLength > 8_000) {
    return response({ error_code: "request_too_large" }, 413);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return response({ error_code: "invalid_request" }, 400);
  }

  if (!body || typeof body !== "object") {
    return response({ error_code: "invalid_request" }, 400);
  }

  const values = body as Record<string, unknown>;
  const category = values.category;
  const subject = typeof values.subject === "string" ? values.subject.trim() : "";
  const message =
    typeof values.message === "string" ? values.message.trim() : "";
  const email = typeof values.email === "string" ? values.email.trim() : "";

  if (
    typeof category !== "string" ||
    !categories.has(category) ||
    subject.length < 3 ||
    subject.length > 180 ||
    message.length < 10 ||
    message.length > 5_000 ||
    email.length > 320 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return response({ error_code: "invalid_fields" }, 400);
  }

  let supabase: Awaited<ReturnType<typeof createClient>>;
  try {
    supabase = await createClient();
  } catch (error) {
    console.error("Support ticket auth client initialization failed:", error);
    return response({ error_code: "service_unavailable" }, 503);
  }

  let userId: string | null = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error) userId = data.user?.id ?? null;
  } catch (error) {
    console.error("Support ticket authentication lookup failed:", error);
    return response({ error_code: "service_unavailable" }, 503);
  }

  if (!userId) {
    return response({ error_code: "unauthorized" }, 401);
  }

  const rateLimit = checkRateLimit(`support-ticket:${userId}`, 3, 10 * 60_000);
  if (!rateLimit.allowed) {
    return response(
      { error_code: "rate_limited" },
      429,
      { "Retry-After": String(rateLimit.retryAfterSeconds) }
    );
  }

  const { data: ticket, error } = await supabase
    .from("support_tickets")
    .insert({
      owner_user_id: userId,
      contact_email: email,
      category,
      subject,
      initial_message: message,
    })
    .select("id, category, subject, initial_message, status, created_at, updated_at")
    .single();

  if (error) {
    console.error("Support ticket creation failed:", error.code);
    return response(
      { error_code: "save_failed" },
      503
    );
  }

  return response({ ticket }, 201);
}
