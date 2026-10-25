/**
 * `reports.occurred_at` is a timestamptz, but the product only requires a date
 * and treats time as optional. To represent a date without inventing a local
 * clock time we store UTC midnight and mark the precision in
 * `reports.item_attributes` (no schema change required).
 */

export const OCCURRED_AT_PRECISION_KEY = "occurred_at_precision";

export type OccurredAtPrecision = "date" | "datetime";

export interface OccurredAtParts {
  date: string;
  time: string;
  precision: OccurredAtPrecision;
}

export function getOccurredAtPrecision(
  attributes: Record<string, unknown> | null | undefined
): OccurredAtPrecision {
  return attributes?.[OCCURRED_AT_PRECISION_KEY] === "date" ? "date" : "datetime";
}

export function splitOccurredAt(
  occurredAt: string | null | undefined,
  attributes: Record<string, unknown> | null | undefined
): OccurredAtParts {
  if (!occurredAt) return { date: "", time: "", precision: "date" };

  const parsed = new Date(occurredAt);
  if (Number.isNaN(parsed.getTime())) {
    return { date: "", time: "", precision: "date" };
  }

  const precision = getOccurredAtPrecision(attributes);

  if (precision === "date") {
    // Stored as UTC midnight: read the calendar date in UTC so it never shifts.
    const date = [
      parsed.getUTCFullYear(),
      String(parsed.getUTCMonth() + 1).padStart(2, "0"),
      String(parsed.getUTCDate()).padStart(2, "0"),
    ].join("-");
    return { date, time: "", precision: "date" };
  }

  const date = [
    parsed.getFullYear(),
    String(parsed.getMonth() + 1).padStart(2, "0"),
    String(parsed.getDate()).padStart(2, "0"),
  ].join("-");
  const time = [
    String(parsed.getHours()).padStart(2, "0"),
    String(parsed.getMinutes()).padStart(2, "0"),
  ].join(":");

  return { date, time, precision: "datetime" };
}

export function buildOccurredAt(
  date: string,
  time: string
): { occurred_at: string; attributes: Record<string, unknown> } | { error: string } {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { error: "Tanggal kejadian wajib diisi." };
  }

  if (time && !/^\d{2}:\d{2}$/.test(time)) {
    return { error: "Format waktu kejadian tidak valid." };
  }

  if (time) {
    const local = new Date(`${date}T${time}:00`);
    if (Number.isNaN(local.getTime())) {
      return { error: "Tanggal atau waktu kejadian tidak valid." };
    }
    return {
      occurred_at: local.toISOString(),
      attributes: { [OCCURRED_AT_PRECISION_KEY]: "datetime" },
    };
  }

  const dateOnly = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(dateOnly.getTime())) {
    return { error: "Tanggal kejadian tidak valid." };
  }

  // Reject impossible dates such as 2026-02-31 (Date silently rolls over).
  if (dateOnly.toISOString().slice(0, 10) !== date) {
    return { error: "Tanggal kejadian tidak valid." };
  }

  return {
    occurred_at: dateOnly.toISOString(),
    attributes: { [OCCURRED_AT_PRECISION_KEY]: "date" },
  };
}

export function formatOccurredAt(
  occurredAt: string | null | undefined,
  attributes: Record<string, unknown> | null | undefined,
  locale: string = "id-ID"
): { date: string; time: string | null; weekday: string | null } {
  if (!occurredAt) return { date: "-", time: null, weekday: null };

  const parsed = new Date(occurredAt);
  if (Number.isNaN(parsed.getTime())) return { date: "-", time: null, weekday: null };

  const precision = getOccurredAtPrecision(attributes);

  if (precision === "date") {
    return {
      date: parsed.toLocaleDateString(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }),
      time: null,
      weekday: parsed.toLocaleDateString(locale, { weekday: "long", timeZone: "UTC" }),
    };
  }

  return {
    date: parsed.toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    time: parsed.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    }),
    weekday: parsed.toLocaleDateString(locale, { weekday: "long" }),
  };
}
