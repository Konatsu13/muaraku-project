/**
 * Single source of truth for the application's public URL and post-login
 * redirect targets.
 *
 * `NEXT_PUBLIC_SITE_URL` must be the origin that Supabase/Google redirect back
 * to. In local development it can stay unset and the active browser origin is
 * used; in production it must be the deployed domain (never localhost).
 */

export const DEFAULT_POST_LOGIN_PATH = "/app";

const ALLOWED_REDIRECT_PREFIXES = [
  "/app",
  "/admin",
  "/about",
  "/support",
  "/privacy",
  "/terms",
  "/auth/set-password",
  "/set-password",
] as const;

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

/**
 * Returns the configured public origin, or the current browser origin during
 * local development. Returns an empty string on the server when the variable
 * is not configured so callers can fall back to the request origin.
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return stripTrailingSlash(configured);

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "";
}

/**
 * Build an absolute URL for auth callbacks. When the site URL is configured it
 * is always used, so production never falls back to whatever host the request
 * happened to arrive on.
 */
export function getAuthCallbackUrl(nextPath: string = DEFAULT_POST_LOGIN_PATH): string {
  const base = getSiteUrl();
  const next = sanitizeNextPath(nextPath);
  const path = `/auth/callback?next=${encodeURIComponent(next)}`;

  return base ? `${base}${path}` : path;
}

/**
 * Only allow same-origin, internal destinations under known app routes.
 * Rejects absolute URLs, protocol-relative URLs, backslash tricks and
 * double-encoded variants.
 */
export function sanitizeNextPath(
  value: string | null | undefined,
  fallback: string = DEFAULT_POST_LOGIN_PATH
): string {
  if (!value) return fallback;

  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return fallback;
  }

  if (
    !decoded.startsWith("/") ||
    decoded.startsWith("//") ||
    decoded.startsWith("/\\") ||
    decoded.includes("\\") ||
    /[\u0000-\u001F\u007F]/.test(decoded)
  ) {
    return fallback;
  }

  let parsed: URL;
  try {
    parsed = new URL(decoded, "https://muaraku.invalid");
  } catch {
    return fallback;
  }

  if (parsed.origin !== "https://muaraku.invalid") return fallback;

  const path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
  const allowed = ALLOWED_REDIRECT_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}?`)
  );

  return allowed ? path : fallback;
}
