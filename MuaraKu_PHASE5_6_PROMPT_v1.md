# MuaraKu — Combined Coding Prompt: Phase 5 + Phase 6 (v1.0)

> **Objective:** complete Phase 5 (Admin, Support, Muara AI) and then execute Phase 6 (integration, security, QA, responsive/accessibility, and release-readiness) in this same work session.
>
> **Important:** perform Phase 5 first, checkpoint it, then run Phase 6 against the actual result. Do not stop after Phase 5 unless a critical security/schema blocker makes the remaining work unsafe. Do not deploy. Do not reset Git, database, or production data. Do not change the database schema directly.

## 0. Role and quality bar

Act as a senior full-stack engineer, product-minded UX engineer, and application security reviewer. Work on the existing MuaraKu repository—not a fresh scaffold. Deliver reliable functionality and a coherent, human-centered interface rather than a generic AI-generated dashboard.

Use the existing stack and conventions found in the repository. Do not introduce a new framework, UI library, AI provider, or state-management package unless the repo lacks a reasonable equivalent and the need is documented first.

## 1. Preflight — mandatory before editing

1. Inspect `git status`, the current branch, uncommitted diff, recent commits if available, package scripts, lockfile, route tree, and current implementation. Never discard the user's edits or run destructive Git commands.
2. Read the available project instructions and specs: `AGENTS.md`, `DESIGN.md`, PRD, `PRODUCT_DECISIONS.md`, `CHANGELOG.md`, task/session docs, architecture/database docs, and relevant Phase 4 implementation notes.
3. Inspect the actual installed schema **read-only** where credentials and tools permit. Identify the authoritative, latest-approved schema file and compare it with the live database. Do not execute SQL, apply migrations, drop tables, reset data, or edit the source schema.
4. **Schema integrity warning:** prior project artifacts may disagree about whether the final schema is the simplified 22-table model or an older schema that still includes `locations`, `notification_preferences`, `moderation_actions`, `moderation_appeals`, `location_staff_verifications`, `report_translations`, `report_matches`, and `audit_logs`. Do not blindly trust a filename or silently code against the wrong version. Use the latest explicit project decision plus read-only live schema as evidence. If the repo's “final schema” docs and the live database conflict, document the exact conflict and mark only the affected work `BLOCKED`; continue independent safe work. Never run the simplification migration automatically.
5. Check whether Phase 4 requirements are actually implemented: chat/blocking/notifications/safety reports; OTP and OAuth redirect fixes; Google OAuth password setup; fake data removal; route-group cleanup; Admin navigation; report form UX; About developer section. Do not assume prior prompts were completed. Carry forward any open items found in `TASKS.md`, `CHANGELOG.md`, issues, or code.
6. Read and follow the Taste Skill `design-taste-frontend` if OpenCode can detect it. Look for the real `SKILL.md` and read it before designing. If absent and network/install is permitted, try `npx skills add https://github.com/Leonxlnx/taste-skill -a opencode`, then locate and read the installed `design-taste-frontend/SKILL.md`. If the installer lists skill names first, select the current frontend-design skill provided by that repository. If it is unavailable, say so explicitly and follow `DESIGN.md`; never claim the skill was used when it was not.
7. Establish the baseline: run the relevant existing lint/type-check/test/build commands before changing code when feasible. Record baseline failures separately so pre-existing issues are not misreported as new regressions.

## 2. Scope and execution order

Execute the following in order, in one combined run:

- **Part A — finish Phase 5:** staff/Admin workflows, moderation, Support tickets, Muara AI support, and approved AI search/matching only where supported by actual schema and configured services.
- **Part B — Phase 6 audit and stabilization:** regression tests, security/RLS/Storage review, responsive/accessibility QA, performance, SEO, error/empty/loading states, docs, and release recommendation.
- Re-test Part A after any fixes made during Part B.

Do not add unrelated features. No deployment, no production writes, no schema changes, no fake data, and no unsupported product claims.

---

# Part A — Phase 5: Admin, Support & Muara AI

## A1. Admin information architecture and authorization

Build or finish Admin functionality based on the routes/components that already exist. Use a staff-specific navigation layout without breaking the public/app navigation. Suggested modules, only where the schema and existing product scope support them:

1. **Overview:** actual counts of pending/reviewable reports, open safety reports, open support tickets, and recent staff actions. Every number must come from a real query. If no data exists, show an honest zero/empty state. Do not seed or hard-code example users, charts, activity, reports, token balances, or “live” statuses.
2. **Report review:** list and inspect reports relevant to moderation; expose status and action controls only when the backend allows the action. Make the item's public description distinct from private owner-verification clues. Do not reveal private details to staff roles that do not need them.
3. **Safety queue:** list `safety_reports` from the actual schema and support the statuses that schema actually defines. Make reporter, target type, reason, date, and current status easy to scan. Only permitted staff may assign, resolve, dismiss, or close a case. Require a clear reason for moderation actions where appropriate.
4. **User/account review:** show minimal profile details needed for a decision. Account status changes (restrict/suspend/ban/unban) must use a trusted server-side action and current staff permission checks. Do not let a browser client directly elevate its own permissions or change its own status.
5. **Staff activity/audit:** read from the authoritative audit table (`admin_activity_logs` if that is the approved/live schema). Show actor, action, target, timestamp, and safe metadata. Do not expose secrets or internal payloads to unauthorized roles.
6. **Staff roles:** only implement role-management UI if the current product/schema already supports it securely. Admins may manage staff roles only through a trusted server path; moderators/support staff cannot manage roles. Do not infer roles from email domains, client metadata, or UI state.

### Role-based access

- Check role authorization on the server for every Admin page, data query, Server Action, and route handler. A Next.js route group or hidden navigation entry is not a security boundary.
- Determine role via the approved `staff_roles` source/server helper and enforce least privilege for `admin`, `moderator`, `support`, and `location_verifier` as actually defined. Do not give every staff role access to every module.
- The Admin navbar/bottom-nav item added in a prior phase must remain visible only to eligible staff, but direct URL access must still be denied server-side for ordinary users.
- If no approved staff role exists for the developer's account, do not grant it from code or provide a hidden backdoor. Document a safe, manual, SQL-console step only after verifying the exact table/column constraints in the actual schema.
- Record staff actions to the currently authoritative audit log wherever the schema supports it. If reliable logging is missing, do not quietly claim complete auditing; document a proposal instead of adding columns/tables.

## A2. Moderation workflow and safety

- Apply only workflow statuses supported by the real schema. Avoid actions that appear interactive but do not persist.
- Destructive or high-impact actions (ban, delete/hide a report, resolve a safety case) need a clear confirmation step, a human-readable target summary, and a reason where the schema supports it.
- Distinguish reversible actions from permanent ones. Prefer a supported status-based removal over permanent deletion when the product/schema defines that behavior. Never physically delete a user's data merely to make the UI look clean.
- AI can summarize context or offer suggestions; it must not autonomously impose a ban, determine guilt, or make high-impact moderation decisions.
- **Do not build formal appeals or location-staff verification as active products in this session if the approved current Phase 4 decision defers them.** Existing legacy tables do not by themselves mean these workflows are approved. Do not make a deferred feature look operational.
- Never expose private claims evidence, owner-only clues, private chat, or unrelated personal data just because an operator has access to an Admin screen. Apply least privilege and reveal only what's needed for the current task.

## A3. Support Center

Implement a usable support workflow for the existing public Support/contact area and staff ticket workspace using the tables/columns that actually exist (expected concepts include `support_tickets` and `support_ticket_messages`, but verify actual schema first).

- User-facing ticket creation validates subject, category, contact details, and message length. Preserve the message on validation failure and show field-level errors.
- Users may view only tickets they own/are permitted to access. Staff access is role-gated and server-enforced.
- Staff queue supports real status/priority filters, search by appropriate fields, assignment only if supported, and pagination/limited queries.
- Ticket detail presents a readable message timeline and an anchored composer. Make status and priority visible without turning every field into a large card.
- If the schema has `is_internal`, internal notes must only be visible to staff. User-facing ticket queries and responses must explicitly exclude internal notes; never rely only on hiding them in the client.
- Validate sender identity and ticket membership on the server. Do not trust a client-supplied `sender_user_id`, `owner_user_id`, role, or ticket status.
- Prevent duplicate submission, apply limits to large message payloads, and show truthful loading/error/success states. Do not use mock ticket conversations.

## A4. Muara AI — support assistant

Implement a helpful Muara AI experience based on available server-side AI configuration and approved product content.

- Ground answers in actual MuaraKu FAQ, Terms, Privacy Policy, Community Guidelines, and other approved public support content available in the repository. If source content is absent, report this and create a clear content TODO; do not invent policy.
- Use the existing approved architecture/provider and configuration. If the project uses a separate FastAPI `backend-ai`, integrate through the established service path rather than duplicating AI logic inside multiple Next.js components. Keep provider API keys server-only.
- Treat user messages and retrieved content as untrusted input. Ignore prompt-injection attempts embedded in user messages or retrieved material. Never disclose system prompts, environment variables, secrets, internal instructions, private report clues, claim evidence, private messages, staff-only notes, or another user's AI history.
- Persist chat sessions/messages only if the current approved schema and retention behavior support it. Every session/message operation must enforce ownership in the trusted server layer as well as database policy where applicable.
- Show clear states for first use, loading, provider unavailable, rate limited, and request failure. Never fake an AI response or simulate “thinking” indefinitely. Give a retry action only when safe.
- Keep the conversation history as the scrollable region; keep the composer anchored and usable. Do not make users scroll through a long list of prompt conditions before they can ask a question. Provide a few genuine starter prompts only if they map to supported tasks.
- Add server-side rate limiting, request-size limits, timeouts, cancellation handling where possible, and safe observability that does not log conversation secrets.
- AI responses must be presented as guidance, not legal/security certainty. Provide a path to human Support for unresolved account, safety, or disputed-return cases.

## A5. Muara AI — search/matching

- Implement only the matching/search capabilities the current schema and code can actually support. Inspect indexes and current search functions before choosing the retrieval approach.
- The current approved product direction prioritizes permitted report fields such as title, public description, category, city/location label, brand/color/model where available. Never search or send private owner clues, claim evidence, phone/email private contact, private chats, or hidden moderation information to AI.
- If only full-text/keyword search exists, describe it as such; do not call it vector/semantic AI search. If `report_matches`, vector columns, or RPCs are absent in the authoritative schema, do not fabricate them. Matching scores are advisory signals, never proof of ownership.
- Use pagination/limits, query validation, debouncing in the UI where appropriate, and safe empty/error states. Never return huge unbounded result sets.

## A6. Token / usage reporting

- A stored token wallet/balance is not assumed. Do not display fake credits, estimates disguised as real billing, or an invented remaining balance.
- If actual token counts are persisted per AI message, you may show a clearly labelled usage summary computed from those persisted fields (for example, tokens used in a selected period) after verifying that the values are written by the trusted AI service. Distinguish provider token usage from money/cost.
- If trustworthy usage tracking cannot be implemented from existing data, leave balance UI out and create a short schema/architecture proposal for approval. Do not add tables/columns in this prompt.

---

# Part B — Phase 6: Integration, QA, Security & Release Readiness

## B1. Regression journeys

Inspect actual commands and flows, then test as much as the environment permits:

1. Registration, email/password login, OTP valid/invalid/expired/resend, Google OAuth callback/redirect, Google password-setup gate if implemented, session refresh, logout, and route guards.
2. Profile update and language/theme preferences if available.
3. Lost and found report create/edit/view, optional media upload, validation, public/private field separation, Discover, Seeker/Finder, search/filter, saved reports, and claim flow.
4. Global Chat and direct/private chat with two distinct test users, blocks, message authorization, notification creation/read behavior where schema permits.
5. Safety reporting, moderation permissions, real status transitions, account restrictions, staff audit events, support ticket create/reply/status flow, and Muara AI success/failure/rate-limit states.
6. Public landing/About/Support/Privacy/Terms, three developer-card slots, responsive navigation including staff-only Admin entry, and Settings overlay.
7. Confirm Settings remains an overlay containing only `Switch Account` and `Home`; `Home` goes to `/`. Do not add extra Settings items.
8. Search the repository/runtime views for dummy/fake records, hard-coded dashboard counters, placeholder notifications, fake activity, mock matching scores, fabricated token balance, and post-translation UI/API. Remove any surviving fake runtime data without deleting actual database rows.

Use two or more test identities for permission-sensitive flows where possible. If test identities or production dashboard credentials are unavailable, mark those tests `BLOCKED` or `NOT RUN`, not `PASS`.

## B2. RLS, authorization, privacy and security review

- Inspect actual RLS policies, grants, RPC signatures, and Storage policies against the current schema. Do not assume the existence of a policy from a comment or frontend guard.
- Verify User A cannot read User B's private messages/conversations, AI session history, private report details, claim evidence, private notifications, or ticket data.
- Verify an ordinary user cannot read staff-only activity, support internal notes, safety cases, or hidden moderation context; cannot set staff role; and cannot change account status or assign themselves another ticket.
- Verify the server resolves actor identity from the authenticated session and never trusts client-supplied IDs/roles/statuses for privileged actions.
- Review OAuth `next`/redirect handling for allowlisted local paths and no open redirect; no production URL should be hard-coded to localhost.
- Review input validation, XSS, SQL injection risks (use parameterized Supabase queries/RPC args), unsafe file uploads, MIME/size limits, public storage access, exposure of service-role/API keys, overly verbose errors, and sensitive logs.
- Review CSRF/origin protection for custom state-changing routes/actions where applicable, rate limits on OTP resend, chat posting, support creation, report submission, and AI requests.
- Never weaken RLS, remove a failing security test, or move privileged writes into the browser merely to make a feature pass.
- If a schema/policy change is required, do not apply it. Write a proposal in `database/proposals/` containing the rationale, affected tables/policies, migration outline, data impact, tests, and rollback plan, then mark dependent items `BLOCKED`.

## B3. Responsive and visual QA

Use the accepted `DESIGN.md` and the design spec in `MuaraKu_PHASE5_6_DESIGN_SPEC_v1.md` as guidance, subject to newer explicit project decisions.

- Check representative screens at approximately 360px, 390px, 768px, 1024px, and desktop width using the available browser tooling. These are test viewport sizes, not fixed layout requirements.
- No horizontal overflow, clipped dialogs, inaccessible bottom action buttons, or text hidden beneath sticky navbars.
- Ensure form fields, table/list rows, dialogs, dropdowns, tabs, popovers, chat composer, and toast messages work on touch and keyboard.
- Admin tables should transform into readable mobile lists/details, not compress desktop columns until text becomes unusable.
- AI chat must keep the composer reachable when the conversation history grows.
- Verify empty, loading, error, success, and disabled states. Use real data or honest zero/empty states; no example records.
- Follow reduced-motion settings; do not use decorative animation as a substitute for clear feedback.
- Use Taste Skill visual/browser evaluation if available; record which pages were actually inspected and what was corrected.

## B4. Accessibility

Target WCAG 2.2 AA as a quality goal where feasible; do not claim formal certification.

- Semantic landmarks/headings, logical focus order, keyboard reachability, visible focus, dialog focus management and Escape behavior, proper labels, meaningful alt text, accessible status/error announcements, and contrast checks.
- Minimum touch target guidance of roughly 44×44 CSS px for primary interactive controls when layout allows.
- Do not rely on color alone for statuses, moderation severity, required fields, or success/error state.
- Test common screen reader and keyboard paths when tools are available; otherwise document what was manually checked and what was not tested.

## B5. Performance and reliability

- Find and address actual sources of excess renders, effect loops, duplicated queries/subscriptions, N+1 requests, unbounded fetches, large unoptimized images, and long main-thread work.
- Use pagination and sensible query limits on Admin, tickets, safety reports, messages, and search results. Debounce text search where useful; clean up subscriptions, listeners, and timers on unmount.
- Use Next.js image/font/loading conventions already present. Avoid unnecessary client components and giant bundles. Do not optimize by removing security or validation.
- Ensure API timeout/error paths return safe, understandable responses. Never retry non-idempotent writes in a way that duplicates records without idempotency safeguards.
- Run the available lint, type-check, tests, and production build after changes. If a command is absent, don't invent a PASS—record `NOT AVAILABLE`.

## B6. SEO, privacy routes and docs

- Confirm public landing/About/Support pages have unique titles/descriptions and correct canonical/base URL behavior according to existing conventions.
- `robots.txt`/`sitemap.xml` should describe public pages only. Do not index authenticated app pages, private chat, account pages, Admin, or support ticket details. Do not expose private route parameters or user data in sitemap output.
- Do not change DNS, deployment, Supabase dashboard, production data, or secrets. Deployment is out of scope.
- Update `README.md`, `.env.example`, architecture/setup docs, `TASKS.md` if available, and `CHANGELOG.md` with only verified facts. Never write secret values into docs.

---

# Design direction and required UI outcomes

Use `MuaraKu_PHASE5_6_DESIGN_SPEC_v1.md` as an implementation companion.

- Brand colors: orange `#FB923C` and blue `#2563EB`. Use neutral surfaces and typography for most of the interface. No gradient logo, glow, neon, or decorative effects without a functional reason.
- Visual quality should come from hierarchy, typography, spacing, content clarity, restrained color, and correct interaction states—not from piles of cards, oversized headings, generic charts, or excessive rounded surfaces.
- Preserve existing UI patterns where they work. Don't redesign unrelated landing/app screens during this task.
- Admin dashboard must prioritize work queues and next actions over decorative KPI cards.
- Moderation actions need a clear consequence and audit trail.
- Support should feel like a calm conversation and clear case workflow, not an ERP table.
- Muara AI should look like a trustworthy help surface, not an omniscient AI control center.
- Ensure the top navbar/bottom navbar changes from Phase 4 remain consistent. Admin navigation must still be role-aware and securely enforced.
- Use actual language resources/i18n patterns. Avoid adding untranslated English strings in Indonesian mode.

# Schema rules — non-negotiable

1. Do not run any SQL/migrations or alter the Supabase schema.
2. Do not add/drop/rename tables, columns, functions, triggers, grants, or RLS policies directly.
3. Use the latest approved simplified-schema decision where it matches the live database, including these intended concepts when present: `user_profiles`, `user_account_controls` with `notify_*`, `staff_roles`, `report_categories`, `reports` using `location_label` and `city`, `report_private_details`, `report_media`, `claims`, `claim_evidence`, `saved_reports`, `conversations`, `conversation_members`, `messages`, `user_blocks`, `notifications`, `safety_reports`, `admin_activity_logs`, `support_tickets`, `support_ticket_messages`, `muara_ai_sessions`, `muara_ai_messages`, and `terms_acceptances`.
4. This list is not permission to assume that a table or field exists in the deployed DB. Read the actual DDL/policies and verify the live schema where possible. If the source file still represents the legacy layout, identify the discrepancy before relying on it.
5. Do not implement post translation, formal appeals, or location-staff verification as active features when those are still deferred by the current product decisions. Do not use legacy table existence as approval.
6. If needed functionality is not supported, implement other safe independent areas and document a migration/policy proposal; do not fake success or bypass RLS.

# Definition of done

The combined task is complete only when the final report contains all of the following:

- [ ] Phase 5 status for each Admin, moderation, Support, AI support, search/matching, and usage subfeature: `PASS`, `PARTIAL`, `BLOCKED`, or `NOT IMPLEMENTED`, with evidence.
- [ ] Phase 6 test matrix showing command/flow, status, and concise result; include lint, type-check, unit/integration/E2E tests and build where available.
- [ ] RLS/privacy review results, tested actors, and known gaps.
- [ ] Responsive/accessibility review, viewport sizes/pages inspected, and visual changes made.
- [ ] List of files changed and rationale; no unexplained mass refactor.
- [ ] List of remaining blockers classified as `BLOCKER`, `HIGH`, `MEDIUM`, or `LOW`, with reproduction/impact and recommended next action.
- [ ] Schema/policy proposals separately recorded where necessary; no schema was changed.
- [ ] `CHANGELOG.md` and task/status docs updated accurately.
- [ ] Final release recommendation: `NOT READY`, `READY WITH KNOWN ISSUES`, or `READY FOR HUMAN REVIEW`—never “production ready” unless production deployment/security validation was actually performed and explicitly approved.

Do not deploy. Stop after reporting results and wait for human review.
