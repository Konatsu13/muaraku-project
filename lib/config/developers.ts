/**
 * Developer and core team profile configuration for the MuaraKu About page.
 *
 * NOTE FOR PROJECT OWNERS:
 * Fill this list with the 3 real people behind MuaraKu before public launch.
 * Do not invent dummy names, mock photos, or placeholder social links.
 * Each entry requires:
 *  - name: string
 *  - role: string
 *  - photo: string | null (path in /public/team/... or confirmed https URL)
 *  - linkedinUrl: string | null (valid https://linkedin.com/... URL)
 *  - instagramUrl: string | null (valid https://instagram.com/... URL)
 */

export interface DeveloperProfile {
  /** Full name as it should appear publicly */
  name: string;
  /** Role in the project, e.g. "Lead Developer", "Product Designer" */
  role: string;
  /** Local path under /public or confirmed https URL. Aspect ratio should be 1:1. */
  photo: string | null;
  /** Confirmed LinkedIn profile URL, or null */
  linkedinUrl: string | null;
  /** Confirmed Instagram profile URL, or null */
  instagramUrl: string | null;
}

export const developers: DeveloperProfile[] = [
  {
    // TODO(owner): Isi data pengembang 1 (nama, peran, foto 1:1, linkedin, instagram)
    name: "",
    role: "",
    photo: null,
    linkedinUrl: null,
    instagramUrl: null,
  },
  {
    // TODO(owner): Isi data pengembang 2 (nama, peran, foto 1:1, linkedin, instagram)
    name: "",
    role: "",
    photo: null,
    linkedinUrl: null,
    instagramUrl: null,
  },
  {
    // TODO(owner): Isi data pengembang 3 (nama, peran, foto 1:1, linkedin, instagram)
    name: "",
    role: "",
    photo: null,
    linkedinUrl: null,
    instagramUrl: null,
  },
];

/** Return true only if an entry has the minimum complete profile data */
export function isDeveloperComplete(dev: DeveloperProfile): boolean {
  return dev.name.trim().length > 0 && dev.role.trim().length > 0;
}

/** Returns all active complete developer entries */
export function getCompleteDevelopers(): DeveloperProfile[] {
  return developers.filter(isDeveloperComplete);
}

/** Verifies that a given URL is a safe external https URL */
export function isSafeSocialUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && parsed.hostname.length > 0;
  } catch {
    return false;
  }
}
