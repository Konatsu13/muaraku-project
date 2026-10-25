interface RateLimitEntry {
  count: number;
  expiresAt: number;
  lastSeenAt: number;
}

const entries = new Map<string, RateLimitEntry>();
let operations = 0;

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now()
): { allowed: boolean; retryAfterSeconds: number } {
  operations += 1;

  if (operations % 128 === 0 || entries.size >= 4096) {
    for (const [entryKey, entry] of entries) {
      if (entry.expiresAt <= now) entries.delete(entryKey);
    }
    while (entries.size >= 4096) {
      const oldestKey = entries.keys().next().value;
      if (!oldestKey) break;
      entries.delete(oldestKey);
    }
  }

  const current = entries.get(key);
  if (!current || current.expiresAt <= now) {
    entries.set(key, {
      count: 1,
      expiresAt: now + windowMs,
      lastSeenAt: now,
    });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  current.lastSeenAt = now;
  if (current.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.expiresAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
