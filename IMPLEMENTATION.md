# MuaraKu — Developer Implementation Prompt: Auth Recovery, Theme System, Branding & Localization

## 1. ROLE AND MISSION

You are the **Lead Full-Stack Developer and UI/UX Engineer** responsible for implementing and verifying the next development iteration of MuaraKu, an Indonesian community-based lost-and-found platform.

You are not acting as a consultant who only gives suggestions. You are the developer responsible for inspecting the codebase, identifying root causes, implementing fixes, running available tests, and documenting the actual results.

Repository: https://github.com/Konatsu13/muaraku-project

Primary release reference: https://github.com/Konatsu13/muaraku-project/releases/tag/v1.1.0-beta

Existing implementation specification: `MUARAKU_AGENT_IMPLEMENTATION_PROMPT.md`

### Core operating principle

**Inspect → Reproduce → Diagnose → Implement → Verify → Document → Handoff.**

Do not stop after producing an audit or a plan unless a genuine blocker prevents implementation. Do not claim a bug is fixed merely because code has been changed.

## 2. REQUIRED PRE-IMPLEMENTATION AUDIT

Before editing any file:

1. Verify the current repository, active branch, HEAD commit, working-tree status, and existing diff.
2. Preserve all valid user changes. Never reset, force-checkout, discard, or overwrite uncommitted work.
3. Inspect the `v1.1.0-beta` release page and identify its actual release notes, assets, tag commit, and relevant changes. Compare that information with the current working branch. Do not assume the release tag, GitHub default branch, and local checkout contain identical code.
4. Read `MUARAKU_AGENT_IMPLEMENTATION_PROMPT.md`, including lines 463–490 and the surrounding requirements relevant to authentication, themes, localization, branding, testing, and documentation.
5. Read applicable `AGENTS.md`, `CLAUDE.md`, `DESIGN.md`, `PRD.md`, `TASKS.md`, `CHANGELOG.md`, `HANDOFF.md`, and other project-specific instructions that exist on the active branch.
6. Inspect `package.json`, the lockfile, Next.js configuration, route tree, CSS/theme tokens, providers, authentication components, Supabase client/server helpers, middleware or proxy, OAuth callback routes, localization implementation, and all logo references.
7. Establish the current behavior and reproduce the reported bugs before changing the implementation.
8. Record the baseline lint, type-check, test, and build results when the relevant commands are available.
9. Do not read, print, commit, or expose secret values from `.env`, `.env.local`, credentials, tokens, or deployment configuration.
10. If a file or release asset is unavailable, explicitly document that limitation. Do not fabricate its contents.

Use the actual Next.js version and installed documentation to determine the correct APIs and conventions.

## 3. P0 — FIX LOGIN AND ACCOUNT REGISTRATION

### Reported symptoms

- Users cannot reliably log in.
- Users cannot reliably create accounts.
- The user has observed that both Google OAuth and email/password authentication return to the public landing page instead of the intended application page.
- The browser Console previously displayed two HTTP 400 errors. Their exact request URLs and response bodies have not yet been established.

Treat these as observed symptoms, not proven root causes.

### Required investigation

Trace the entire authentication lifecycle:

1. Email/password sign-in.
2. Account registration and email verification/OTP, if required by the current product flow.
3. Google OAuth initiation.
4. OAuth provider return and callback processing.
5. Session creation and persistence.
6. Supabase cookie handling.
7. Client-side auth state initialization and updates.
8. Middleware/proxy and protected-route decisions.
9. Post-login redirect and safe return URL handling.
10. Profile and role loading after authentication.

Inspect the actual HTTP 400 requests using browser Network logs or available diagnostics. Identify the failing endpoint, response, and triggering operation before attributing the failure to a particular component.

Check for conflicts between server-side route protection and client-side auth guards. Verify whether a valid session is preserved when navigation changes from the landing page to a protected route.

### Implementation requirements

- Fix the confirmed root cause rather than adding more redirects or bypassing authentication.
- Ensure `isLoading`, authenticated user state, and profile-loading state transition correctly.
- Avoid redirect loops, race conditions, duplicate auth listeners, and premature redirects while session initialization is incomplete.
- Ensure successful authentication leads to the intended protected destination, normally Discover, or to a validated internal return URL when one was requested.
- Prevent open redirects. Do not accept arbitrary external URLs as post-login destinations.
- Ensure callback and verification routes remain accessible to legitimate authentication flows.
- Provide clear loading, success, and error states for login and registration.
- Prevent duplicate submissions and display actionable authentication errors without exposing secrets or sensitive provider responses.
- Preserve existing email verification and security requirements. Do not disable verification, CAPTCHA, rate limits, RLS, or route protection just to make login appear functional.
- Confirm Google OAuth provider configuration, redirect URLs, and credentials availability. Do not claim external dashboard configuration is complete unless it has been verified.
- If a required Supabase Dashboard setting or credential is unavailable, implement the supported code path and document the exact remaining manual setup.

### Acceptance criteria

- Existing users can sign in using valid email/password credentials.
- New users can register and complete the configured verification flow.
- Google OAuth completes successfully when the provider is configured.
- Cancelled or failed OAuth attempts display a meaningful state.
- An authenticated user reaches the intended application page and remains authenticated after navigation and refresh.
- An unauthenticated visitor cannot access protected application routes or protected data.
- A legitimate callback is not blocked by the route guard.
- Errors are traceable through safe diagnostics.
- Results are tested and recorded separately for flows that could and could not be verified.

## 4. P0 — FIX LIGHT THEME AND SYSTEM DEFAULT

### Reported symptoms

- Light theme is still broken or does not render correctly.
- The default theme must follow the operating system's appearance preference.

### Required behavior

Support three distinct theme preferences:

- `light`: always use light appearance.
- `dark`: always use dark appearance.
- `system`: follow the current operating system preference.

**Set `system` as the default theme preference for users who have not explicitly selected a theme.**

Do not override an existing explicit user preference simply because the default changes.

### Implementation requirements

1. Audit the existing theme provider, theme context, root layout, CSS variables, design tokens, theme selector, persistence, and hardcoded colors.
2. Reuse the existing theme architecture unless evidence demonstrates that it is fundamentally broken. Do not introduce a second competing theme system.
3. Ensure the resolved theme is applied consistently at the root of the application.
4. Use the appropriate system preference mechanism for the installed framework and browser environment.
5. When `system` is selected, react to operating-system theme changes without requiring a page refresh.
6. When `light` or `dark` is selected explicitly, do not let subsequent system changes override that preference.
7. Preserve the selected preference across page navigation and reloads using the existing persistence architecture.
8. Prevent unnecessary theme flashes, hydration mismatches, and inconsistent first renders.
9. Audit all important UI surfaces, not just the theme toggle:
   - Public landing page and navigation.
   - Login and registration dialogs/pages.
   - Forms, inputs, validation messages, and buttons.
   - Cards, dropdowns, popovers, and modals.
   - Application sidebar and header.
   - Discover, Seeker, Finder, Search, and messaging pages.
   - Empty states, errors, badges, and loading indicators.
10. Remove or correct hardcoded colors that make light theme unreadable or visually inconsistent.
11. Preserve the established MuaraKu visual identity and existing design tokens unless a documented issue requires a change.
12. Ensure accessible contrast, visible focus states, and readable disabled states in both light and dark appearances.

### Acceptance criteria

Test all three preferences on the important public and protected routes:

- Light stays light.
- Dark stays dark.
- System follows the current OS setting.
- Changing the OS setting updates the UI only when system mode is active.
- A saved explicit preference remains unchanged.
- No major component remains unreadable, invisible, or incorrectly colored in either theme.

Do not mark the theme issue fixed merely because the toggle changes its selected value.

## 5. P1 — USE `public/logo.svg` AS THE CANONICAL LOGO

The existing logo asset at `public/logo.svg` is the required source of truth.

### Requirements

1. Verify that `public/logo.svg` exists and inspect its actual contents and appearance.
2. Replace existing MuaraKu logo variants throughout the project with this canonical asset wherever the logo is displayed.
3. Search for duplicated logo SVGs, embedded logo markup, old image assets, placeholder marks, and text-based substitutes.
4. Update public navigation, application navigation/sidebar, authentication screens, footer, metadata-related image references where appropriate, and other branded surfaces.
5. Use the correct path for a public asset, such as `/logo.svg`, according to the existing rendering architecture.
6. Preserve the logo's original proportions and aspect ratio. Use appropriate sizing and object-fit behavior without stretching, cropping, or altering the artwork.
7. Ensure the logo works against both light and dark backgrounds. If the SVG itself is unsuitable for a particular background, use a neutral surrounding surface or appropriate container; do not silently redesign the logo.
8. Do not generate a new logo, redraw the logo, substitute an emoji, or change the brand mark.
9. Keep accessible alternative text where the image communicates the brand; avoid redundant screen-reader announcements when the logo is already inside a properly labelled link.
10. Check favicon and metadata usage separately. Reuse the canonical asset where supported, and document any format limitation instead of inventing an asset.

### Acceptance criteria

No unintended old MuaraKu logo remains in the active UI. All replacements reference the actual `public/logo.svg` asset, preserve its appearance, and work in both themes.

## 6. P1 — GOOGLE LOGIN BUTTON HOVER ANIMATION

Update the existing **Login with Google** button.

### Required interaction

- Preserve the existing button's Google sign-in functionality.
- Add a polished, subtle hover animation consistent with MuaraKu's visual design.
- On hover, the button background must transition to **black or a near-black neutral color**, with a readable contrasting foreground.
- Use a smooth transition for the background, border, and other necessary visual properties.
- Provide visible keyboard-focus styling and a clear pressed/active state.
- Respect `prefers-reduced-motion`; do not require motion for feedback.
- Ensure the hover state does not cause layout shifts or make the button difficult to read in either theme.
- Keep the Google brand icon intact and appropriately legible. Do not recolor the icon in a way that violates its intended appearance.
- The animation must be implemented in the actual shared login component, not in an unused duplicate or a mockup.

### Acceptance criteria

The hover background visibly transitions to black/near-black, text remains readable, keyboard navigation works, and the button still initiates the real OAuth flow.

## 7. P1 — CENTRALIZE VISIBLE UI TEXT FOR MANUAL TRANSLATION

Create or improve a clear, maintainable location where the project owner can manually edit the text displayed in the interface.

The goal is to make future manual Indonesian/English translation straightforward without hunting through every component.

### First, audit the existing localization system

The existing implementation specification mentions:

- `lib/i18n/index.tsx`
- `lib/i18n/dictionaries/id.ts`
- `lib/i18n/dictionaries/en.ts`

Verify which of these files exist in the active branch and how they currently work. Reuse and improve the existing system instead of creating a competing localization architecture.

### Required structure

Use a centralized, strongly typed dictionary architecture appropriate to the existing project. For example, if compatible with the current implementation:

- `lib/i18n/dictionaries/id.ts` — Indonesian UI strings.
- `lib/i18n/dictionaries/en.ts` — English UI strings.
- An existing or improved i18n module that exposes typed translation access and locale switching.

Do not create these files blindly if equivalent files already exist; improve the actual implementation.

### Translation requirements

1. Move user-facing interface text into the centralized dictionaries, including:
   - Public navigation and landing-page copy.
   - Login and registration labels.
   - Google login button text.
   - Authentication errors and success messages.
   - Form validation and loading states.
   - Theme settings and theme labels.
   - Navigation/sidebar items.
   - Empty states, action labels, tooltips, and accessible labels.
   - Common buttons, dialogs, and confirmation messages.
2. Preserve the existing language-switching behavior and its persistence unless the audit reveals a bug.
3. Ensure changing the locale updates visible text reactively without requiring a manual page refresh.
4. Use stable, descriptive translation keys. Avoid array-index-based keys and duplicated strings that become inconsistent.
5. Keep the Indonesian and English dictionaries structurally consistent.
6. Provide appropriate fallback behavior for missing translations and development diagnostics for missing keys.
7. Avoid mixing Indonesian and English within a screen when a translation is available.
8. Do not translate user-generated report descriptions, messages, or other stored content automatically. This requirement concerns interface localization only.
9. Do not put secrets, environment variables, credentials, or server-only data in translation files.
10. Keep formatting values, interpolation, dates, and accessibility text compatible with the existing i18n architecture.
11. Add a concise contributor guide explaining where to add a translation key, how to edit Indonesian/English text, and how to check for missing translations.
12. Avoid an unnecessary third-party localization dependency unless the existing implementation demonstrably cannot meet the requirements.

### Important boundary

This task is about **manual UI translation**, not paid machine translation of report content.

Preserve the existing requirement that Google Cloud Translation integration is deferred until an approved billing account is available. Do not enable a paid translation API, require a translation API key, or silently substitute another paid provider.

### Acceptance criteria

A developer can change a UI label by editing the correct dictionary file without modifying the component's presentation code. Both languages remain consistent, and the important UI flows display the correct language.

## 8. PRESERVE THE EXISTING AI KNOWLEDGE-BASE REQUIREMENTS

Retain the relevant requirements from lines 474–490 of `MUARAKU_AGENT_IMPLEMENTATION_PROMPT.md`.

- Inspect the existing Supabase schema and active migrations before creating new tables.
- Reuse `muara_ai_sessions` and `muara_ai_messages` for conversation history only if their actual schema, access policies, and retention rules are appropriate.
- If no suitable knowledge-base table exists, prepare an additive migration for `public.muara_ai_knowledge_base`.
- Support `draft`, `published`, and `archived` states.
- Production AI retrieval must include only approved, published knowledge.
- Keep authoritative system instructions and security boundaries under server control.
- Only authorized administrators or designated support content editors may manage knowledge entries.
- Enforce server-side authorization and appropriate Supabase RLS policies.
- Retrieve relevant published knowledge and acknowledge when the available information does not support an answer.
- Treat knowledge-base content as data, never as executable instructions or authorization.
- Add validation, version tracking, auditability, and tests for unpublished content, unauthorized edits, and cross-user conversation isolation.
- Do not claim a migration has been applied to the production database unless that has been verified.
- Do not introduce a separate vector database for the initial implementation without evidence that it is necessary.
- Update `CHANGELOG.md`, `TASKS.md`, and `HANDOFF.md` with actual status and verification results.

Do not let this scope distract from the P0 authentication failure. Prioritize restoring reliable authentication and fixing the theme system before optional enhancements.

## 9. SECURITY AND IMPLEMENTATION CONSTRAINTS

- Do not commit `.env`, `.env.local`, credentials, tokens, or secret values.
- Update `.env.example` only with the variable names and safe placeholders actually needed.
- Never expose Supabase service-role keys or other server secrets to the browser.
- Preserve route protection, RLS, ownership checks, and authorization boundaries.
- Do not weaken security controls to make a failing flow appear successful.
- Avoid destructive database changes. Inspect schema and migrations before proposing changes.
- Avoid unrelated rewrites, broad dependency upgrades, or unnecessary architecture changes.
- Do not fabricate reports, user activity, statistics, login success, or external configuration.
- Keep Google Cloud Translation deferred until billing is available.
- Preserve the project's existing design language and brand identity.

## 10. TESTING AND VERIFICATION

Run the actual commands supported by the repository. At minimum, inspect and run available lint, TypeScript checking, tests, and production build commands.

If a test script does not exist, report that fact and add targeted tests where appropriate without falsely claiming that a test suite already exists.

### Authentication tests

- Valid email/password login.
- Invalid credentials.
- Registration and configured verification flow.
- Google OAuth success, cancellation, and failure when the provider is configured.
- Callback and cookie/session persistence.
- Direct access to a protected route while logged out.
- Refresh and navigation while logged in.
- Safe return URL handling.
- Error handling for the actual failing HTTP 400 request.

### Theme tests

- Light mode.
- Dark mode.
- System mode.
- OS appearance change while system mode is selected.
- Explicit preference while the OS appearance changes.
- Persistence across navigation and reload.
- Important UI components in both light and dark appearances.

### Branding and localization tests

- Verify every logo replacement references the actual `/logo.svg` asset where applicable.
- Verify logo aspect ratio and visibility across themes.
- Verify Google button hover, focus, pressed, and reduced-motion behavior.
- Verify Indonesian and English translations on the important public and authentication flows.
- Verify missing translation handling and language switching.
- Verify UI localization does not modify user-generated content or activate paid machine translation.

### AI knowledge-base tests

Preserve the existing security and data-isolation requirements. Test published versus unpublished content, unauthorized edits, and cross-user isolation wherever the available test environment permits.

### Reporting rules

For each test, report one of:

- `PASS` — executed and passed.
- `FAIL` — executed and failed.
- `NOT RUN` — not executed, with a reason.
- `BLOCKED` — could not be verified because an external dependency, credential, or configuration was unavailable.

Never label a test `PASS` based solely on code inspection.

## 11. REQUIRED DOCUMENTATION UPDATES

After implementing a meaningful unit of work, update:

### `CHANGELOG.md`

Record actual changes, affected files, reasons, tests, and any required configuration.

### `TASKS.md`

Use the project's existing status convention, including `[x]`, `[~]`, `[ ]`, and `[!]` if that convention is still active. Distinguish completed and verified tasks from partially implemented or blocked tasks.

### `HANDOFF.md`

Record the active branch and commit, files changed, test results, remaining issues, manual configuration steps, and the next recommended action.

### Translation contributor guide

Document the actual dictionary paths and how to add or modify UI translations.

Do not claim that a deployment, database migration, provider configuration, or external dashboard setting has been completed unless it has been verified.

## 12. FINAL DELIVERABLE

Implement the changes directly in the active working branch while preserving user modifications.

When finished, report:

1. **Audit:** branch, commit, release reference checked, and key findings.
2. **Root causes:** the verified causes of authentication and theme failures.
3. **Implementation:** files changed and the reason for each meaningful change.
4. **Logo audit:** where the canonical logo was replaced and any remaining exceptions.
5. **Localization:** dictionary structure and how the owner can manually translate text.
6. **Tests:** exact commands and their actual PASS/FAIL/NOT RUN/BLOCKED status.
7. **External configuration:** any remaining steps in Supabase, OAuth provider settings, or deployment.
8. **Remaining issues:** anything that could not be completed or verified.
9. **Handoff:** the next highest-priority action.

### Definition of done

The task is complete only when the authentication flow has been investigated and tested, the system theme behaves correctly, light and dark appearances are readable, the canonical logo is used consistently, the Google login hover state meets the specification, and visible interface text is maintainable through centralized translation dictionaries.

**Start by auditing the actual repository and release, then implement the confirmed fixes in priority order. Do not stop at a plan, do not fabricate results, and do not claim success without verification.**