# MuaraKu — Design System & Google Stitch Brief

> **Purpose:** This file is the single source of truth for generating and revising MuaraKu UI in Google Stitch. Read it together with the three user-provided references: (1) the long, narrow finance landing-page screenshot for visual/section inspiration only, (2) `Explore.png` for the current MuaraKu Explore/Discover concept, and (3) `UI Lomba.zip` for the current sidebar states (light expanded, light collapsed, dark expanded, dark collapsed). The references have different roles; do not copy the finance product's content or branding.

## 0. Project Context — Preserve These Decisions

MuaraKu (`muaraku.id`) is a trusted community lost-and-found platform for Indonesia. Its goal is to help people report, discover, verify, and return lost items with less friction and less fear of scams. The metaphor of a **muara** (river mouth / meeting point) represents information and people converging at a safe, calm, useful destination. The logo is already prepared by the user: **do not redesign, redraw, recolor, distort, or replace it**. Use the supplied logo asset when available; otherwise leave a clear logo placeholder and ask for the asset rather than inventing one.

MuaraKu should feel like a polished, modern product—not a generic admin template and not a crypto/fintech website. Visual character: trustworthy, welcoming, quietly intelligent, community-first, contemporary Indonesian product. It may borrow the reference landing page's pacing, section variety, whitespace control, and polished hierarchy, but all content and imagery must be about lost-and-found.

### Product architecture: two distinct website areas

1. **Public / Branding Website** — public-facing marketing and information pages.
   - Navbar: `Home` | `About` | `Support`.
   - Footer: `Privacy Policy` | `Terms of Service` | `© 2026 MuaraKu`.
   - A clear `Masuk` / `Login` and/or `Mulai` / `Get started` action may appear as a CTA, without changing the required three main nav labels.
   - Use the user-provided finance landing page screenshot as a **layout and visual-quality reference only**. Replace every finance-specific section, statistic, chart, pricing card, country list, download prompt, and copy with relevant MuaraKu content. Do not copy its brand, wording, or financial imagery.

2. **Main Application** — signed-in product, using the existing sidebar as a starting point.
   - `Discover` (Explore / social home feed)
   - `Seeker` (lost-item feed + lost-report management dashboard)
   - `Finder` (found-item feed + found-report management dashboard)
   - `Search` (a dedicated page, **not** a search input embedded in the sidebar)
   - `Global Chat` (community chat)
   - `Messages` (private one-to-one conversations)
   - `Profile`
   - `Settings` (put Theme and Language here, not as separate top-level sidebar items)
   - `Help & Support` (in-app help; can connect to public Support page)
   - `Muara AI` customer-service assistant as a floating/widget entry point available throughout the app, not necessarily another permanent sidebar row.
   - A separate, restricted **Admin / Moderation Dashboard** for authorized staff.

### Key distinction between Discover, Seeker, and Finder

- **Discover is the default social-style homepage after login**, similar in concept to Instagram Home: a mixed feed of relevant community posts from both Seekers and Finders. It is for browsing, discovery, and recommendations, not primarily for managing one's own reports.
- **Seeker is focused on lost items**. It combines a focused lost-item community feed with a clearly separated area to create, view, edit, track, and manage the current user's own lost reports. It can show AI Matching candidates for their lost items.
- **Finder is focused on found items**. It combines a focused found-item community feed with a clearly separated area to create, view, edit, track, and manage the current user's own found reports. It can show relevant claims / matching candidates and return progress.
- Community reports and personal reports must be visually distinguishable. Do not imply that every public post belongs to the signed-in user.
- Seeker and Finder should not be mere duplicate pages with only a heading changed; each needs role-specific empty states, actions, statuses, and dashboard summaries.

### Core AI/product capabilities to reflect when relevant

- **Natural-language Search (N2L):** people can search naturally, e.g. “dompet hitam dekat perpustakaan kemarin”, then refine using filters. Search is its own page with a clear query field and filter controls.
- **AI Matching:** suggests possible lost/found report matches based on item type, color, brand, description, time, location, and optionally image similarity. Present results as candidates, never as proof that an item belongs to someone.
- **Muara AI:** customer support/help assistant; clear and friendly, not intrusive.
- **On-demand translation:** users deliberately click to translate a post; provide “Lihat teks asli / Show original” control. Never silently replace original user content.
- **Global Chat moderation:** safety-aware reporting, blocking, and moderation. UI should communicate community rules and reporting paths without making unsupported accusations.
- **Account verification:** registration includes an OTP verification step. The delivery channel (email or phone) is configurable and must match the actual backend; never imply verification has succeeded before the code is validated.
- **Report & Block:** signed-in users can report posts, profiles, and messages, and block accounts. Every report has a clear submission confirmation and a staff-side review path.
- **Notifications:** a Notification Center can surface new messages, likely matches, claims, report status changes, and moderation outcomes according to user preferences.
- **Trusted-location verification:** a yellow verification check/marker can identify an authorized worker associated with a location (for example, staff working at a campus/library/venue). This is not a generic paid badge and must be labelled clearly with a tooltip or explanation such as “Petugas lokasi terverifikasi”. Do not make the marker look like an ordinary user status.

## 1. Visual Theme & Atmosphere

Create a **premium, calm, trustworthy, social-product interface**. Think of a well-designed community service with the clarity of a modern SaaS product and the warmth of a local community platform. Keep screens crisp, structured, and information-rich without becoming cramped. Use purposeful asymmetry and clear grouping; avoid both excessive empty space and dense walls of controls.

- Density: **5/10** — balanced, efficient app UI.
- Layout variance: **6/10** — controlled asymmetry and varied content sections, while keeping navigation predictable.
- Motion: **4/10** — restrained, useful micro-interactions; no distracting perpetual animation.
- Overall feel: confident, approachable, clean, modern, safe, practical.
- Prefer authentic item photography, location/context imagery, and realistic community content. Avoid stock imagery that makes the app feel like a bank, crypto exchange, or generic corporate template.
- Use clear page hierarchy and real content density. Do not fill the interface with empty decorative whitespace just to look minimal.

## 2. Color Palette & Roles

**Required secondary/accent color:** `#FB923C`. Treat this as the primary brand accent for primary calls to action, selected navigation, focus states, and key highlights. Keep it controlled and legible. Do not introduce another competing saturated accent.

- **Muara Orange** — `#FB923C`: primary accent, main CTA, active navigation indicator, selected chips, meaningful highlights.
- **Warm Canvas** — `#FFFCF8`: subtle warm app/page background where a warmer tone helps the brand; use consistently rather than mixing many gray temperatures.
- **Surface White** — `#FFFFFF`: cards, dialogs, menus, forms, and main content surfaces.
- **Primary Ink** — `#18181B`: primary text and headings; never use pure black `#000000`.
- **Secondary Ink** — `#52525B`: body copy and supporting labels.
- **Muted Text** — `#71717A`: metadata, timestamps, helper text; maintain sufficient contrast.
- **Border** — `#E4E4E7`: subtle outlines, separators, input borders.
- **Soft Surface** — `#F4F4F5`: secondary backgrounds, neutral icon wells, inactive controls.
- **Success** — `#16A34A`: success/returned states only, not a second brand accent.
- **Warning / verification** — `#EAB308`: the yellow trusted-location verification marker only, with text/icon and accessible contrast.
- **Error** — `#DC2626`: errors, destructive confirmation, safety warnings.
- **Dark theme:** use a coherent Zinc/Charcoal palette with `#18181B` or similar as a dark surface, elevated surfaces clearly distinct, readable muted text, and the same `#FB923C` accent. Do not simply invert every color. Keep both light and dark modes consistent with the supplied sidebar references.

### Color rules
- Use `#FB923C` consistently; do not substitute bright red/orange randomly between pages.
- Orange is the main accent. Green is reserved for positive status; yellow for trusted-location verification; red for destructive/error states.
- No neon glow, no purple/blue AI gradient aesthetic, no oversaturated multicolor gradients.
- Gradients are optional and rare; use only subtle warm tonal transitions on public landing-page artwork if needed. App dashboards should mostly use flat surfaces.
- Check contrast for text, controls, badges, and focus rings.

## 3. Typography

Use **Geist Sans** as the preferred typeface, with a clean system sans-serif fallback. Use **Geist Mono** only for IDs, reference codes, and dense numeric/technical metadata when helpful. Do not use serif fonts in application/dashboard interfaces.

Suggested desktop scale:
- Marketing hero heading: 44–60 px, line-height 1.0–1.1; responsive with `clamp()`.
- Public page H1: 36–48 px.
- App page heading: 28–32 px, semibold.
- Section heading: 20–24 px, semibold.
- Card title: 16–18 px, semibold.
- Body: 14–16 px; default app body 15–16 px.
- Metadata/helper/caption: 12–14 px; avoid going below 12 px except compact decorative labels.
- Button and input text: 14–16 px.

Rules:
- Clear hierarchy by weight, spacing, and color—not oversized type everywhere.
- Body copy should be readable and concise, with line lengths around 45–75 characters where practical.
- Do not use all-caps for long labels. Use sentence case in Indonesian UI.
- Use Indonesian as the default UI language, but design text containers so English translations can fit without clipping.

## 4. Layout, Grid & Spacing

### Main application shell
- Design desktop first for the supplied current app direction, then adapt mobile intentionally.
- Use a stable app shell: sidebar + main content region. Main content should have a reasonable max-width (roughly 1200–1440 px depending on page) and not stretch text/cards across ultrawide screens.
- Sidebar width target: **232–248 px expanded**, about **72–80 px collapsed**. Keep consistent with the supplied sidebar asset where possible.
- Reduce sidebar whitespace: navigation rows should be compact and consistent, with roughly 40–44 px row height, 8–12 px horizontal padding, 8–12 px icon-label gap, and 4–6 px between rows. Avoid huge vertical gaps and oversized empty logo areas.
- Use grouped navigation with clear hierarchy and at most one subtle divider between primary navigation and account/help items.
- The Search item is a normal navigable page row with a search icon. **Do not put a text input inside the sidebar.**
- Page content padding: 24–32 px desktop, 16–20 px tablet, 16 px mobile.
- Common spacing rhythm: 4, 8, 12, 16, 24, 32, 40, 48 px. Avoid arbitrary one-off gaps.
- Use CSS/grid-like predictable alignment. Use asymmetry in marketing sections, not at the cost of app usability.

### Cards and feed
- Use cards when they group a report or action meaningfully, not as decoration around every element.
- Report cards should align image, type/status labels, title, brief description, location, time, author identity, and actions with a clear hierarchy.
- Use consistent image ratio within a given feed; default item imagery around 4:3 or 16:10, with a stable crop. Never distort images.
- Feed grids can use responsive 3-column desktop, 2-column tablet, and 1-column mobile where content permits; do not force equal cards if a list is more useful. The anti-pattern ban on generic equal-card rows applies especially to marketing feature sections, not to useful repeated result grids.
- Use compact metadata chips with short one-word or short category labels; do not create excessively wide pills.
- Avoid duplicate repeated feed sections that make a page unnecessarily long. A featured feed plus a clearly different recent/list view is acceptable only if it adds real value.

## 5. Component Styling & States

### Buttons
- Primary: Muara Orange `#FB923C`, high-contrast readable text (choose dark ink or white based on contrast testing), medium radius (10–12 px), clear hover/pressed/focus states.
- Secondary: white or soft-neutral surface with border; tertiary: text/ghost.
- Destructive actions use error color and always ask for confirmation when irreversible.
- Minimum interactive target: 44×44 px on touch screens. Show disabled/loading states and prevent duplicate submissions.
- No neon glow, no excessive pill buttons, no fake glassmorphism.

### Inputs and forms
- Label above input; placeholder is an example, not the only label.
- Input height around 44–48 px, radius 10–12 px, border `#E4E4E7`.
- Provide helper text, clear validation, visible focus state, and inline error beneath the relevant field.
- Support long descriptions, optional image upload, location, time/date, category, and privacy-sensitive fields as relevant.
- Do not expose private verification clues in public-facing report forms.

### Dialogs / overlay forms
- **Login/register must open as an overlay/modal without navigating away from the current page.** Preserve the current route and intended action after authentication; for example, if the user clicks Claim on a report, close the modal after login and resume that report/action.
- Use a centered dialog on desktop with a clear backdrop, accessible close button, focus management, and scrollable content when needed. On mobile use a near-full-screen sheet/dialog with safe-area padding.
- Use the same overlay pattern for create/edit report forms and other focused tasks when appropriate. For long, multi-step forms, use a wide modal or responsive full-screen dialog—not a tiny cramped popover.
- Keep form title, purpose, progress/steps (if any), required/optional labels, validation, primary action, and cancel/close action clear.
- Warn before discarding unsaved changes. Do not reset a form unexpectedly when validation fails.
- Include designed states for loading, disabled submission, validation errors, server errors, success, and retry. Prevent accidental double submission.

### OTP verification component
- Design a clear OTP step within the registration overlay; do not navigate to an unrelated standalone page unless the existing app architecture requires it.
- Show the delivery channel and masked destination, e.g. `Kode dikirim ke k***@email.com`, based on the actual destination returned by the system. Do not invent a destination.
- Use a six-digit numeric code input as a single accessible field or coordinated segmented visual input. Support paste, keyboard navigation, and mobile numeric keyboard; do not make screen readers read six unrelated unlabeled boxes.
- Include `Verifikasi`, a visible resend countdown, `Kirim ulang kode` when allowed, `Ubah email/nomor`, and a back path to registration without losing valid entered data unnecessarily.
- Required states: sending, code sent, incomplete, invalid code, expired code, too many attempts/temporarily locked, resend cooldown, network/server failure, verifying, success, and retry.
- Never display the OTP itself in UI or logs. Do not claim the account is verified until the backend confirms success. Exact OTP expiry, retry limits, and resend policy are backend/security decisions, not made-up design copy.

### Report statuses and badges
- Separate **case status** from **moderation status** in the UI.
- Case status examples: `Open`, `Potential match`, `Claim in progress`, `Returned`, `Closed`.
- Moderation status examples (staff-facing): `Pending review`, `Approved`, `Flagged`, `Removed`.
- Use both text and icon/color; never communicate critical status by color alone.
- The yellow checkmark means authorized/verified location staff only. Include an accessible tooltip/label and use only after a staff verification process.

### Search and filters
- Search page must include a prominent natural-language query input and an adjacent or clearly accessible filter panel.
- Filters may include report type (lost/found), category, color, brand, location/radius, date/time range, status, and image availability where applicable.
- Provide applied-filter chips, a clear-all option, result count, sort order, and an empty state that suggests how to broaden the query.
- On desktop, use a filter sidebar/panel plus result area when it fits. On mobile, filters open in a drawer/bottom sheet with a visible Apply and Reset action.
- Search results should clearly distinguish lost from found and may show a subtle “Possible match” label only when backed by matching logic.

### Cards, tables, lists
- Use a list/table for dense admin data; use cards for report discovery and key summaries.
- Prefer clear separators over many nested cards.
- Use realistic Indonesian sample data, plausible but explicitly fictional sample identities, and natural Indonesian copy. Do not use generic “John Doe”, “Acme”, or invented statistics presented as real.
- If metrics are shown in mockups, label them as sample/demo data or use plausible non-assertive placeholders; do not claim product outcomes without evidence.

### Loading, empty, error, and success
- Loading: skeletons matching the final component geometry; avoid generic spinners as the only feedback.
- Empty: helpful, context-specific guidance plus one relevant action, e.g. “Belum ada laporan kehilangan” + “Buat laporan”.
- Error: explain what failed and how to retry; preserve entered form data.
- Success: concise confirmation and next step.

## 6. Responsive Behavior

All screens must be designed for desktop, tablet, and mobile—not merely scaled down.

- Desktop: sidebar expanded by default where viewport allows; provide a collapsed state. Keep page content aligned to a grid.
- Tablet: sidebar may collapse to icons or become a drawer depending on width; preserve readable content and usable filters.
- Mobile (below 768 px): collapse multi-column layouts to one column unless a compact horizontal scroller genuinely improves discovery; no accidental horizontal overflow.
- Mobile navigation: use an accessible drawer or compact bottom navigation only if it suits the existing app architecture; do not display a full desktop sidebar squeezed into a narrow screen.
- Touch targets at least 44 px; ensure modal actions remain visible and reachable.
- Feed cards become single-column; image crops remain consistent; metadata wraps gracefully.
- Search filters become a bottom sheet/drawer. Tables become responsive rows/cards or horizontally scroll only when absolutely necessary and clearly indicated.
- Use fluid typography and responsive spacing; respect device safe areas.
- Test long Indonesian/English labels, long locations, no-avatar states, and large text settings.

## 7. Motion & Interaction

Use restrained, purposeful motion to confirm state changes and make the app feel polished.
- Typical transitions: 140–220 ms, ease-out; dialogs may use a subtle spring-like scale/fade.
- Animate opacity and transform where possible; avoid layout-jumping animations.
- Hover: slight background/tint change, subtle elevation only when appropriate.
- Press: small tactile feedback (e.g. translateY 1 px) and clear pressed state.
- Modal: fade backdrop + subtle translate/scale; respect `prefers-reduced-motion`.
- Skeleton shimmer only while loading; no perpetual pulse on ordinary dashboard elements.
- Do not add animation if it makes reporting, filtering, moderation, or chat slower to use.

## 8. Information Architecture & Page Requirements

Generate a consistent family of screens. Use the supplied logo and existing sidebar assets where provided. Keep the same app shell, typography, color tokens, component patterns, and navigation behavior across app screens.

### A. Public / Branding Website

#### 1. Home / Landing Page
- Use the first image (long finance landing page) as inspiration for polished long-page storytelling, varied section rhythm, clear content hierarchy, and strong footer composition.
- Hero should immediately explain MuaraKu: a trusted place to report, find, and return lost items. Use a distinctive left-aligned or split layout rather than a generic centered SaaS hero by default.
- Include one primary CTA such as `Mulai cari barang` or `Gabung MuaraKu`, and a secondary text link only if necessary.
- Use relevant visuals: lost/found item cards, safe handoff, campus/public-place contexts, or a product UI preview. Do not use banking dashboards, currency charts, or financial app screens.
- Suggested sections: hero; how MuaraKu works (Seeker/Finder); Discover/Search/AI Matching preview; trust and safety; community use cases; FAQ; final CTA.
- Do not invent adoption numbers, success rates, partnerships, or verified outcomes.
- Navbar exactly includes `Home`, `About`, `Support`; auth CTA may be separate.
- Footer exactly includes `Privacy Policy`, `Terms of Service`, `© 2026 MuaraKu` plus logo/brief brand note if space permits.

#### 2. About
- Explain the problem, mission, “muara” metaphor, how Seeker and Finder cooperate, and trust-first product principles.
- Use editorial but product-focused sections; avoid long generic corporate prose.
- Include clear navigation back to Home and a route to Support.

#### 3. Support
- Searchable/help topic layout or grouped FAQs, contact/support form, report a problem, account/login help, item return safety, and community guidelines.
- Avoid promising 24/7 or specific response times unless provided by the project owner.

#### 4. Privacy Policy and Terms of Service
- Design readable long-form legal document pages with table of contents, clear headings, last-updated label, and mobile-friendly line length. This is UI only; do not invent legally final policy language. Use placeholder copy that is visibly marked for owner/legal review if actual policy text is not supplied.

### B. Authentication & Overlay Forms

#### 5. Login Modal
- Overlay on top of the current page; no route change just to display the modal.
- Email/username and password, show/hide password, forgot-password link, login CTA, register link, clear error and loading states.
- Preserve return destination and intended action after successful login.
- Include accessible labels and keyboard/focus behavior.

#### 6. Register Modal + OTP Verification
- Consistent visual language with login; collect only essential initial fields, such as display name, email/phone (depending on the configured verification channel), password, and required terms/privacy acknowledgment. Do not overload registration with every profile field.
- Make the sequence explicit: enter details → request OTP → verify code → account created/verified → return to the original destination or continue to Discover.
- Provide password guidance, field validation, show/hide password, password mismatch/error states where applicable, and clear submit loading states.
- OTP verification is a step/state within the same overlay flow. The user must be able to understand where the code was sent and request another code only when permitted.
- Include resend cooldown, invalid/expired code feedback, attempt-limit/temporary lock state, edit-destination option, and successful verification state.
- If account creation requires verification before the account is active, make the status clear. If the user closes the overlay mid-flow, handle the return state safely and do not imply an unverified account is verified.

#### 7. Forgot / Reset Password Overlay
- Add a `Lupa kata sandi?` route within the existing auth overlay pattern, with request-reset, code/link sent, invalid/expired token, set-new-password, and success states as supported by the real auth backend.
- Do not reveal whether an arbitrary email/phone is registered. Use neutral confirmation copy such as “Jika akun cocok, instruksi pemulihan akan dikirim”.

#### 8. Report Create/Edit Modal
- Reusable responsive overlay for lost and found reports, with context-specific title and fields.
- Fields may include title, category, description, location, time/date, images, and optional details.
- Separate public description from private ownership-verification hints/evidence. Never show private clues publicly.
- For edit mode, prefill current data and support editing selected fields without forcing users to re-enter every field.
- Include photo upload preview, remove/replace, upload progress/error, and clear privacy guidance for photos.
- Add private ownership clues/evidence as a separate, clearly private step/section that never flows into public post content.
- Confirm before discarding unsaved changes. If the report is under moderation review or has an active claim, explain which edits are allowed.

#### 9. Claim / Ownership Verification Modal or Flow
- Clearly explain that AI suggestions do not prove ownership.
- Allow safe, private verification steps without revealing hidden verification details to other claimants.
- Show status/progress and next step. Do not expose sensitive evidence in a public report card.
- Show who needs to act next, a secure message entry point, and a safe meeting/hand-off reminder where relevant.
- Support competing claims: each claim is reviewed separately, and sensitive verification evidence is never visible to other claimants.
- Include cancel/withdraw claim, rejected claim with neutral explanation where safe, dispute/report escalation, and returned/closed confirmation states.

### C. Main Application (use existing sidebar)

#### 10. Discover (Social Home Feed)
- Default signed-in landing page, inspired by a useful social feed rather than a metrics-first admin dashboard.
- Mixed Seeker + Finder posts, recent community activity, relevant recommendations, and possible matches where appropriate.
- Include a clear feed mode/filter (e.g. `Semua`, `Barang hilang`, `Barang ditemukan`) and accessible entry to Search.
- Each post should show lost/found type, image, title, concise description, category, location, date/time, author, status, and appropriate action.
- Avoid invented metrics as the dominant top section. If showing summary stats, make them contextual, compact, and grounded in actual/sample data.
- Keep the main content area purposeful; no unnecessary huge empty whitespace. User has supplied `Explore.png` as the current design concept: use it as a starting point, not as a rigid layout. Reconsider duplicate “Temuan terbaru” sections and ensure Discover contains both lost and found posts, not only found-item examples.
- Do not place the app sidebar inside the page screenshot as duplicate content; the app shell owns it.

#### 11. Seeker
- Focused lost-item feed plus an unmistakable `Laporan saya` / `My reports` management area.
- Useful tabs or sub-navigation: `Jelajahi kehilangan`, `Laporan saya`, `Kandidat kecocokan` (if needed).
- Create lost report CTA, report status, edit/cancel actions, match suggestions, and progress for claims/returns.
- Clearly separate community posts from the user's own reports.
- Provide realistic empty/loading/error states.

#### 12. Finder
- Focused found-item feed plus `Laporan saya` / `My reports` management area.
- Useful tabs or sub-navigation: `Jelajahi temuan`, `Laporan saya`, `Klaim & kecocokan` (if needed).
- Create found report CTA, report status, edit/cancel actions, safe claimant communications, and return progress.
- Include the yellow verified-location-staff marker only when appropriate and explain what it means.
- Clearly separate community posts from the user's own reports.

#### 13. Search (dedicated page)
- This is a full page selected from the sidebar, not a sidebar input.
- Prominent natural-language query input, example suggestions, advanced filters, results count, sort, applied chips, and clear filters.
- Results may include a mixed list/grid of lost and found reports with a distinct “possible match” presentation.
- Include empty state for no matches, query correction suggestions, and a way to broaden filters.
- Responsive filter drawer/bottom sheet on mobile.

#### 14. Report Detail
- Large item photo/gallery, title, report type, status, description, location/time, category, author identity, and safe next action.
- Actions depend on context: contact/chat, claim item, edit own report, **Report**, save/bookmark only if that feature is actually planned.
- Make `Laporkan` available from the post overflow menu and/or a restrained secondary action. Do not visually compete with the primary claim/contact action.
- The report flow must identify the target (post/account/message) and let the user choose a reason: spam, suspected scam/forced payment, harassment/threats, suspicious or misleading listing, exposure of personal information, or other. Allow optional details/evidence, show a review notice, and confirm successful submission without revealing another user's private case data.
- After a report is submitted, avoid repeatedly prompting the user to report the same target; offer Block as a separate, explicit choice.
- Keep sensitive verification cues and private evidence out of public detail.
- Provide translation-on-demand control when source language differs from current preference.

#### 15. Global Chat
- Community room with readable message stream, composer, member/context info, community guidelines, report/block controls, and moderation notice when relevant.
- Make public-vs-private communication obvious.
- Each message should expose a `Laporkan pesan` action via contextual menu. Keep report and block actions accessible without crowding the composer.
- Avoid displaying sensitive contact information in prominent public UI; include a warning before sharing personal data where suitable.
- Include empty, loading, connection-error, message-deleted, and muted/restricted states.

#### 16. Private Messages
- Two-panel desktop layout (conversation list + active conversation) where space permits; responsive single-conversation mobile layout.
- Clear sender identity, timestamp, message grouping, safe attachment affordances, report/block controls, and context link to relevant item report.
- Keep moderation/report flows discreet but discoverable. Do not imitate a generic messenger without the lost-and-found context.
- Provide `Laporkan pesan`, `Laporkan pengguna`, and `Blokir pengguna` actions with clear target labels and a confirmation step for blocking.
- After blocking, explain that the interaction is restricted and reflect the state in the conversation list. Do not expose the other user's private details.

#### 17. Profile
- Avatar, display name, optional bio, member-since metadata, user activity/report history, trust indicators only when earned, and profile edit action.
- Avoid public exposure of email, phone, exact home address, or private evidence by default.
- Show report history in a way that respects privacy and item safety.

#### 18. Settings
- Account and security; notification preferences; theme (light/dark/system); language; privacy controls; blocked users; session/logout actions.
- Theme and Language belong under Settings, not separate sidebar items.
- Use accessible toggles/selects and clear save feedback.
- Include a `Pengguna yang diblokir` list with an intentional unblock action and confirmation when needed.
- Security area should expose active-session/logout controls only to the level supported by the auth backend; do not invent security features that are not implemented.

#### 19. Help & Support (in-app)
- Quick help, FAQ, community safety, contact support, report a technical issue, and links to public Support/Terms/Privacy.
- Keep it secondary to the primary lost-and-found tasks.

#### 20. Muara AI Assistant Widget
- Floating launcher available across app pages, with a compact chat panel that does not obscure core actions.
- Help with navigation, explaining safe return steps, and clarifying how to use the platform. It must not claim to verify ownership or guarantee a match.
- Provide concise suggestions and an easy close/minimize control; responsive full-screen panel on small screens.

#### 21. Notification Center
- Provide a dedicated notification list/page reachable from a familiar notification-bell entry in the app header; it does not need another crowded permanent sidebar item.
- Notification types: new private message, possible AI match, claim received/updated, report status changed, item marked returned, response to a submitted report, and account/security notices. Show only notification types the product actually supports.
- Each notification has a meaningful title, short context, timestamp, read/unread state, and a destination that takes the user to the relevant report, claim, conversation, or settings screen.
- Include mark-as-read, mark-all-as-read, empty state, loading/error states, and a simple unread indicator. Avoid fake urgent notifications.
- Notification preferences live in Settings. Respect blocked users and user preferences; avoid exposing private report/evidence details in lock-screen-style previews.

### D. Admin / Moderation Dashboard (restricted access for authorized administrators, moderators, or staff)

#### 22. Admin Overview
- Separate restricted console, not visible as a normal user feature. Grant access only to authorized roles (e.g. administrators, moderators, or specifically permitted developers); being a developer does not automatically grant moderation rights. Use dense but readable tables and clear moderation workflows.
- Show actionable queues: flagged posts, user reports, pending staff verification, appeals, and recent moderation actions. Avoid vanity metrics.
- Use realistic demo data clearly marked as demo; no fabricated real-world performance claims.

#### 23. User Management / Ban & Restriction
- Searchable table with user, account status, reason/category, report history summary, last activity, and actions.
- Actions may include warning, temporary restriction/suspension, permanent ban, unban/restore, and view case. Include reason, duration where relevant, affected capabilities, and audit log.
- Distinguish warning, temporary limits, suspension, and permanent ban in both wording and consequence previews.
- Ban/destructive actions require confirmation and a reason; explain consequences. Provide appeal/review status. A permanent ban should require an explicit second confirmation or review step.
- Do not make permanent bans one-click, and do not imply AI alone decides punishment. Risk flags should prioritize human review.

#### 24. Post / Report Moderation
- Review queue with report/post/message preview, reporting reason, reporter, target account, timestamps, relevant account history, flagged reason, and actions to dismiss, warn, hide/remove, request edits, restrict, or escalate as appropriate.
- For each item, show report case state (new, triaged, reviewing, action taken, dismissed, appealed) separately from content moderation state (pending review, approved, flagged, removed).
- Display user-submitted evidence only to staff who need it; support notes and escalation without leaking reporter identity unnecessarily.
- Keep case status separate from moderation status. Include a reason and audit trail for actions.
- Bulk actions should be limited and require confirmation where destructive.

#### 25. Trusted Location Staff Verification
- Staff workflow to verify that a user is authorized to work at a named location (e.g. school, campus, library, station, venue).
- Fields: location/organization, role, verification method/evidence, reviewer, review status, expiry/reverification date if applicable.
- Admin can approve/reject/revoke verification with a reason and audit trail.
- When approved, display a **yellow check marker** beside the user with tooltip/label `Petugas lokasi terverifikasi` and the associated location where appropriate.
- This badge verifies affiliation/role only; it does not automatically certify every statement or guarantee that an item is safe.
- Design pending, approved, rejected, expired, and revoked states.

#### 26. Moderation Case Detail / Audit Log
- Timeline of report, evidence/attachments where authorized, reviewer notes, actions, dates, appeals, and final disposition.
- Include an appeal submission and review state for affected users when a moderation action is appealable; give concise, neutral status feedback.
- Restrict sensitive data to authorized staff. Show only data necessary for the case.
- Provide filters, pagination, and a clear case status. Include export action only if required by the project; do not design it as a public feature.


## 9. Navigation & Sidebar Rules

Use the uploaded sidebar reference assets from `UI Lomba.zip` as the starting point. Retain the logo and general identity but refine spacing, hierarchy, selected state, and information architecture.

Suggested expanded sidebar order:
1. Discover
2. Seeker
3. Finder
4. Search
5. Global Chat
6. Messages

Then a subtle divider:
7. Profile
8. Settings
9. Help & Support

Muara AI should be a floating assistant or a compact contextual entry, not necessarily a permanent top-level nav row. Notification Center should be reachable from a notification-bell control in the app header so the sidebar does not become crowded. Admin navigation appears only to authorized admin/staff users and may use a separate admin shell or clearly separated staff section.

- Use consistent icons from one coherent icon family (e.g. Lucide-style outline icons); no emoji icons.
- Selected state: subtle orange-tinted surface or clear orange indicator, not a huge saturated block that dominates the sidebar.
- Use concise labels, accessible tooltip in collapsed mode, visible keyboard focus, and active-page semantics.
- Compact vertical spacing; no large empty gaps between every item. Logo/header area should not consume excessive height.
- Support expanded/collapsed and light/dark variants based on supplied references.
- On mobile, use a drawer or intentionally designed compact navigation; never shrink the desktop sidebar text into unreadability.

## 10. Public Page Visual Storytelling

For the public Home page, use the long finance screenshot only to learn from:
- its complete page rhythm from hero to feature/story sections, FAQ, closing CTA, and footer;
- alternating light/soft-tinted sections;
- a mixture of imagery, product previews, compact metrics/benefits, FAQ, and final CTA;
- strong contrast between content blocks without excessive decoration.

Replace finance content with MuaraKu storytelling, for example:
1. Hero: “Barang hilang? Mulai pencarianmu di MuaraKu.”
2. Explain the two sides: Seeker and Finder.
3. Show Discover feed and natural-language Search preview.
4. Explain AI Matching as a helpful candidate finder, not a guarantee.
5. Explain safer communication, reporting, and verified location staff.
6. Explain how reporting and return works in three or four steps.
7. FAQ / safety tips.
8. Final CTA to explore or sign up.
9. Required footer.

Keep this content as draft copy that can be revised; do not present invented statistics or fake testimonials as true.

## 11. Accessibility, Privacy & Trust

- Target WCAG AA contrast for essential text and controls.
- Visible keyboard focus; semantic heading order; form labels; accessible dialog behavior; screen-reader labels for icon-only controls.
- Never rely on color alone for case/moderation status.
- Protect personal contact details and ownership-verification clues. Public post content should not reveal the answer to verification questions.
- Report/block actions should be accessible from relevant user, post, and conversation contexts. Clearly confirm what is being reported and never imply that a report automatically proves wrongdoing.
- OTPs and account recovery tokens must never be shown again after submission, included in screenshots/mock data, or placed in application logs. Show masked destinations and neutral account-recovery responses.
- Reporters should receive confirmation and their own case status where supported, but must not see private enforcement notes or another user's personal data.
- Notification previews must avoid revealing sensitive claim evidence, exact private locations, or message contents when privacy settings call for concealment.
- Do not label a user a criminal solely because someone requested payment; use neutral safety language and review processes.
- Admin decisions should have a reason and audit trail. AI flags are decision support, not automatic proof or automatic punishment.
- Translation must preserve the original text and be user-triggered.

## 12. Explicit Anti-Patterns — Never Generate These

- Do not redesign or invent the MuaraKu logo.
- Do not copy finance branding, financial content, bank cards, money charts, pricing plans, or country availability from the landing-page reference.
- Do not make Discover a stats-first admin dashboard; it is a mixed community feed.
- Do not make Seeker and Finder identical pages with only the title changed.
- Do not put the Search input inside the sidebar; Search is a dedicated page.
- Do not put Theme or Language as separate main sidebar entries; place them inside Settings.
- Do not add a second/duplicate sidebar inside page content.
- Do not leave huge, unexplained blank areas or use whitespace as a substitute for content hierarchy.
- Do not use a generic three-equal-card marketing feature row by default; vary section structure when useful.
- No emojis in the UI; use consistent vector icons.
- No Inter font; prefer Geist Sans. No serif in app/dashboard screens.
- No pure black, neon glow, AI purple/blue gradients, oversaturated multicolor accents, or heavy glassmorphism.
- No fake metrics, fake partner logos, fabricated testimonials, or claims of verified success.
- No “John Doe”, “Acme”, “Nexus”, or generic placeholder branding.
- No lorem ipsum in final mockups; use concise, plausible Indonesian copy.
- No modal that navigates away from the page or loses the user's intended action.
- No registration flow that skips OTP verification when OTP is required by the product; no fake verification-success state.
- No OTP UI without invalid, expired, resend-cooldown, loading, and error states.
- No report button that submits instantly without target identification, reason selection, and confirmation feedback.
- No automatic permanent ban from a single report or solely from an AI score.
- No notification badge filled with fake urgency or fabricated live activity.
- No tiny mobile tap targets, clipped long labels, or horizontal overflow.
- No one-click permanent ban, no moderation action without reason/audit trail, and no AI-only decision to permanently punish a user.
- No public display of private verification clues or unnecessary personal information.

## 13. Recommended Design Generation Workflow

Generate in deliberate groups so that all screens stay consistent. Treat `DESIGN.md` as the shared design contract, not as a request to squeeze every feature into one page.

**Phase 1 — Foundation & shell**
1. Establish design tokens, typography, button/input/form states, report cards, status badges, dialogs, notification bell, and responsive app shell.
2. Revise the sidebar from `UI Lomba.zip`: expanded/collapsed and light/dark states, tighter vertical spacing, and Search as a normal page link.

**Phase 2 — Critical user journeys**
3. Discover mixed social feed.
4. Seeker lost-item feed + clearly separate `Laporan saya` management dashboard.
5. Finder found-item feed + clearly separate `Laporan saya`, claims, and return dashboard.
6. Search page with natural-language search, filtering, sorting, and results/empty states.
7. Report detail, Report action/modal, Block confirmation, claim/ownership verification, and safe handoff/returned states.
8. Login, Register + OTP, forgot/reset-password, and session/error states as overlays.
9. Create/Edit report overlays with image upload, validation, privacy hints, and unsaved-change protection.

**Phase 3 — Communication, safety, and account**
10. Private Messages with report/block message/user actions.
11. Global Chat with community rules and moderation states.
12. Notification Center and preference controls.
13. Profile and Settings, including blocked-user management, theme, language, privacy, and notification preferences.
14. Help & Support and Muara AI assistant widget.

**Phase 4 — Public website**
15. Home landing page using the first screenshot's section rhythm but with MuaraKu content.
16. About and Support.
17. Privacy Policy and Terms of Service layouts with content placeholders marked for owner/legal review.

**Phase 5 — Staff/admin**
18. Admin overview and moderation queue.
19. User management with warning/restriction/ban flows and confirmation.
20. Post/message moderation, report-case review, and appeals.
21. Trusted-location staff verification.
22. Audit log and case-detail timeline.

For every phase, reuse the same tokens and components. Design the primary desktop layout plus tablet and mobile variants for critical journeys. Include normal, hover/focus, loading, empty, error, success, disabled, and permission-denied states where relevant.

### Product implementation priorities (for design emphasis)

- **P0 — MVP / essential flows:** registration with OTP, login/recovery, Discover, Seeker/Finder reports, dedicated Search + filters, report detail, safe claim/verification, private messaging, Report/Block, and basic staff moderation. These paths must be coherent before advanced AI features are treated as complete.
- **P1 — Core differentiators:** AI Matching, Natural Language Search, Notification Center, Global Chat moderation, verified-location staff, and moderation audit/appeal workflows.
- **P2 — Extensions:** richer Muara AI, on-demand translation, image similarity, advanced analytics, and expanded notification channels.

This priority list guides prototyping and implementation; it does not require every P1/P2 feature to be visually absent. If a feature is important for a demo, a prototype can show it while clearly distinguishing concept UI from working backend behavior.

### Handoff to Google Antigravity (vibe coding)

After the design is approved in Stitch, give Google Antigravity this file together with the existing project archive/repository and the chosen design exports/screenshots. Ask it to inspect the existing codebase first and then implement incrementally.

- Preserve the current framework, routing, components, authentication, database schema, and working behavior unless a change is explicitly justified. Do not replace the whole project or change the stack just to match generated markup.
- Treat screenshots as visual references and `DESIGN.md` as the design/UX contract. Recreate reusable components and responsive behavior rather than using full-page screenshots as backgrounds.
- Before coding, report the detected stack, routes, relevant components, data entities, auth flow, and integration risks. Then propose a small implementation plan.
- Build in vertical slices: shared shell/tokens → auth + OTP → core reports/search → claim/chat/report-block → notifications → admin moderation → AI integrations. Verify each slice before moving on.
- Never place API keys, OTP secrets, private evidence, or service credentials in client code. Enforce permissions and moderation actions on the server, not only by hiding UI controls.
- Do not invent endpoints, database fields, environment variables, or completed backend features. If something is missing, identify the gap and offer a minimal implementation that matches the existing architecture.
- Add or update tests for authentication, report permissions, claims, report/block, and staff-only routes where the project setup supports it. Run the available lint/build/test commands and fix regressions.
- Do not claim that a screen or feature is functional merely because it looks correct in a screenshot. Distinguish implemented, mocked, and pending integration states.

## 14. Master Prompt for Google Stitch

Use this instruction alongside `DESIGN.md` and all three references:

> You are a senior product designer designing MuaraKu, a trustworthy Indonesian lost-and-found community platform. Read `DESIGN.md` as the source of truth before generating screens. Use the long finance landing-page screenshot only for marketing-page rhythm and polish; replace all finance content and visuals with MuaraKu stories. Use `Explore.png` as the initial Discover concept to refine, ensuring the feed includes both lost and found reports and does not duplicate sections unnecessarily. Use `UI Lomba.zip` as the current sidebar reference to revise rather than replace arbitrarily. Preserve the supplied MuaraKu logo without modification. Use `#FB923C` as the single brand accent, Geist Sans, compact purposeful spacing, accessible controls, realistic Indonesian copy, consistent light/dark variants, and responsive layouts.
>
> Design the public Home/About/Support website with navbar `Home | About | Support` and footer `Privacy Policy | Terms of Service | © 2026 MuaraKu`. In the main application, Discover is the mixed social-style home feed; Seeker and Finder each combine a focused feed with a separate management area for the signed-in user's own reports. Search is a dedicated page with natural-language query and rich filters, never an input inside the sidebar. Login, Register + OTP, password recovery, and report create/edit flows use responsive overlays that preserve the current page and intended action. Include OTP delivery, resend, invalid/expired, cooldown, and success states; do not invent OTP policies or claim verification before validation.
>
> Include Report and Block actions for relevant posts, accounts, and messages; a safe claim and ownership-verification flow; Private Messages; moderated Global Chat; a Notification Center; Profile; Settings; Help & Support; on-demand post translation; and a floating Muara AI assistant. Create a separate staff-only admin/moderation dashboard for report review, user warnings/restrictions/bans, post/message moderation, appeals/audit history, and yellow verified-location-worker markers. AI matching produces candidates, not proof. Moderation AI supports human review and must not automatically make irreversible decisions.
>
> Keep the UI visually premium, modern, clean, and practical. Avoid excessive whitespace, fake metrics, fake testimonials, invented partnerships, fabricated activity, finance content, redesigned logos, private verification clues, and generic AI-looking decoration. Generate screens in coherent groups, include important loading/empty/error/success/permission states, and maintain one consistent design system across every page.

## 15. Open Decisions / Safe Defaults

These are not blockers for initial visual generation; use the defaults below unless the project owner specifies otherwise:
- Product name in footer: `MuaraKu`.
- Default UI language: Indonesian; leave enough room for English.
- Default theme: light; also provide a coherent dark theme based on existing sidebar references.
- Main app shell: reuse/refine existing sidebar.
- Admin route and permissions: staff-only; exact role names and backend authorization are implementation decisions.
- Trusted-location badge: yellow, with clear explanatory tooltip and a verified affiliation/location label.
- Modal behavior: preserve current route and resume intended action after auth.
- OTP channel: use the channel supported by the real authentication design (email or phone). Until confirmed, design the destination label and input step flexibly without hardcoding a provider.
- OTP validity, retry limits, resend cooldown, and account lock policy: set from backend/security requirements, not from invented design defaults.
- Report categories and escalation policy: use the product owner's community policy; suggested categories in this document are initial UI options, not legal conclusions.
- Notification channels: begin with in-app notifications unless email/push has been implemented and approved.
- AI matching and moderation availability: show integration states honestly; use demo labels when the backend is mocked.
- Data in generated mockups: clearly fictional sample data, not claims about actual users, returns, or platform metrics.
