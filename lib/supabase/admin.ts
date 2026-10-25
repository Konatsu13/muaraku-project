import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * SERVER-ONLY Supabase client using the service secret.
 *
 * Rules (do not break):
 * - Never import this module from a client component ("use client").
 * - Never send SUPABASE_SECRET_KEY (service role) to the browser.
 * - Use only for narrowly scoped, read-mostly operations that the product
 *   explicitly needs; keep RLS for everything user-facing by default.
 *
 * Env documented in `.env.example`.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_ROLE_KEY;

  if (!url || !key) return null;

  return createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
