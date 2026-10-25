/**
 * Developer/team profiles shown in the About page.
 *
 * TODO(owner): fill this list with the real people behind MuaraKu before
 * launch. Do not add placeholder names, roles, photos or social links — the
 * About section hides incomplete entries and shows an honest empty state until
 * confirmed data exists.
 */
export interface DeveloperProfile {
  /** Full name as it should appear publicly. */
  name: string;
  /** Role in the project, e.g. "Product Lead", "Frontend Engineer". */
  role: string;
  /** Local path under /public or a confirmed absolute https URL. */
  photo: string | null;
  /** Confirmed LinkedIn profile URL, or null. */
  linkedinUrl: string | null;
  /** Confirmed Instagram profile URL, or null. */
  instagramUrl: string | null;
}

export const developers: DeveloperProfile[] = [];

/** Entries are only rendered when name, role and a usable photo are present. */
export function getCompleteDevelopers(): DeveloperProfile[] {
  return developers.filter(
    (developer) =>
      developer.name.trim().length > 0 &&
      developer.role.trim().length > 0 &&
      Boolean(developer.photo)
  );
}

export function isSafeSocialUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && parsed.hostname.length > 0;
  } catch {
    return false;
  }
}
