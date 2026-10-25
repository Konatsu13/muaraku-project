/**
 * Single source of truth for the application's public URL and post-login
 * redirect targets.
 *
 * `NEXT_PUBLIC_SITE_URL` must be the origin that Supabase/Google redirect back
 * to. In local development it can stay unset and the active browser origin is
 * used; in production it must be the deployed domain (never localhost).
 */

export const PRODUCTION_SITE_URL = "https://muaraku.id";
export const DEFAULT_POST_LOGIN_PATH = "/app";

const ALLOWED_REDIRECT_PREFIXES = [
  "/app",
  "/admin",
  "/about",
  "/support",
  "/privacy",
  "/terms",
] as const;

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

/**
 * Returns the configured public origin, or the current browser origin during
 * local development. Guarantees that production never resolves to localhost.
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    // Local development in browser
    if (host === "localhost" || host === "127.0.0.1") {
      return window.location.origin;
    }
    // Production custom domain in browser
    if (host === "muaraku.id" || host.endsWith(".muaraku.id")) {
      return window.location.origin;
    }
    // If configured explicitly and not pointing to localhost while running outside localhost
    if (configured && !configured.includes("localhost") && !configured.includes("127.0.0.1")) {
      return stripTrailingSlash(configured);
    }
    return window.location.origin;
  }

  // Server-side
  if (configured) {
    if (
      process.env.NODE_ENV === "production" &&
      (configured.includes("localhost") || configured.includes("127.0.0.1"))
    ) {
      return PRODUCTION_SITE_URL;
    }
    return stripTrailingSlash(configured);
  }

  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_SITE_URL;
  }

  return "http://localhost:3000";
}

/**
 * Resolves the public base origin from an incoming server-side request,
 * taking into account reverse proxy headers (e.g. Vercel, Cloudflare, Nginx).
 */
export function resolveRequestOrigin(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";

  if (forwardedHost) {
    const host = forwardedHost.split(",")[0].trim();
    if (host) {
      return `${forwardedProto}://${host}`;
    }
  }

  const hostHeader = request.headers.get("host");
  if (hostHeader && !hostHeader.includes("localhost") && !hostHeader.includes("127.0.0.1")) {
    const proto = hostHeader.startsWith("localhost") ? "http" : "https";
    return `${proto}://${hostHeader}`;
  }

  const siteUrl = getSiteUrl();
  if (siteUrl) return siteUrl;

  try {
    const parsed = new URL(request.url);
    if (parsed.origin && !parsed.origin.includes("localhost") && !parsed.origin.includes("127.0.0.1")) {
      return parsed.origin;
    }
  } catch {
    // ignore
  }

  return process.env.NODE_ENV === "production" ? PRODUCTION_SITE_URL : "http://localhost:3000";
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
