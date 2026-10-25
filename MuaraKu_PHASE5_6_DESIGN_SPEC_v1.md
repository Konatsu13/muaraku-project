# MuaraKu — Phase 5 & 6 UI/UX Design Spec (v1.0)

This spec guides the implementation of Admin, Support, Muara AI, and the final QA pass. It is not permission to redesign every page or bypass existing product decisions. Check the live UI and `DESIGN.md` first, then reconcile differences with the latest user-approved decision.

## 1. Design principle

**Make the next safe action obvious.** MuaraKu is a community Lost & Found product, not a BI dashboard. Users need clarity and trust; staff need to resolve actual cases accurately. Visual simplicity should come from strong hierarchy and sensible density—not from removing useful information.

### Brand tokens

| Token | Value | Usage |
|---|---|---|
| Brand orange | `#FB923C` | Primary action, selected brand accent; use with adequate contrast |
| Brand blue | `#2563EB` | Links, secondary action, selected interactive states |
| Main text | `#171717` | Main reading text |
| Secondary text | `#737373` | Metadata and supporting copy |
| Page canvas | `#F8F9FA` | App/page background |
| Surface | `#FFFFFF` | Dialogs, forms, table/list surface |
| Muted surface | `#F4F4F5` | Hover/secondary sections |
| Border | `#E4E4E7` | Subtle separators and field borders |
| Focus ring | `#C96A1B` | Visible keyboard focus; test contrast |
| Success | `#15803D` | Confirmed success only |
| Warning | `#B45309` | Needs attention/pending risk |
| Danger | `#B91C1C` | Destructive or high-risk state |

Status text/icon/shape must accompany color so the meaning is never color-only. Prefer the tokens already in the project if equivalent tokens exist; do not create duplicate token names.

## 2. Type, spacing and surfaces

- Keep body copy at a comfortably readable size (normally 14–16px); field labels should not be smaller than necessary. Use a restrained title scale, with no oversized marketing hero typography inside app/admin screens.
- Prefer an 8px spacing rhythm, with 4px adjustments for tight inline layouts.
- Use card surfaces only when grouping needs clear boundaries. Don't wrap every field, statistic, or list row inside a separate rounded card.
- Corners should be consistent and restrained; do not assign a giant radius to every element.
- Avoid decorative gradients, glow, glassmorphism, heavy shadows, neon, ornamental illustrations, fake live indicators, and generic chart filler.
- Use the existing icon library consistently; do not use emoji as UI icons.
- Keep motion quick and purposeful, and respect `prefers-reduced-motion`.

## 3. Admin shell and overview

### Structure

Use the existing global shell and route patterns. Within `/admin`, a compact staff navigation may provide these destinations when implemented and authorized: **Overview, Report Review, Safety Reports, Support, Activity Log**. Add **Staff Roles** only if role management already exists and is secure. Do not invent extra menu entries just to fill space.

- Desktop: staff navigation stays compact; the content area is wide enough for tables/details. The page header shows the module title and a small contextual description.
- Mobile: navigation becomes an accessible menu or compact navigation pattern; don't squash desktop tables into unreadable columns. Convert rows to stacked summaries with a detail view where needed.
- The Admin entry in app top/bottom navigation remains visible only for authorized staff and is still protected on the server.

### Overview hierarchy

1. Small page title: `Admin overview` / localized equivalent, plus a short line explaining the work queue.
2. A compact row of real actionable counts (e.g. open safety cases, reports awaiting review, support tickets). Keep it to the few numbers that help triage work; no KPI card wall.
3. Main area focused on **Needs attention**: a real queue sorted by urgency/age/status, with clear type, short title, status, creation time, and action to open.
4. Secondary section for recent staff activity, only if supported by the actual audit log.
5. First-use empty state: explain there are no pending items and show a useful next action. Never insert sample records.

No chart should be added unless it answers a concrete operational question and the required data truly exists.

## 4. Report review and safety cases

### List view

- Use a clear page title and one-line purpose statement.
- Place search and status/type filters above the queue with compact spacing; filters should be keyboard accessible and work on mobile.
- Each row/item should surface: target/type, reason or report title, reported/created time, status, and a clear `Review` action.
- Use neutral status labels with a small semantic color marker. Status changes must correspond to real persisted values.
- Use pagination or a limited “Load more” behavior. Do not fetch every case at once.

### Review detail

- Lead with the report/case identity and current status.
- Group evidence/context in an easy scan order. Distinguish **public report content** from **private owner clue/evidence** and only render private data when the current staff role has an approved need and access policy.
- Explain the target and prior relevant actions without oversharing unrelated user data.
- Place allowed actions together in a clearly labelled action area. High-impact actions require a confirmation dialog that names the action and target and asks for a reason if supported.
- Provide success/error feedback that reflects the server result; don't optimistically display a completed action if the server rejects it.
- AI-generated summaries (if any) must be labelled as assistance, cite what records/fields they summarize where feasible, and never decide the sanction.

## 5. Support center

### User-facing ticket flow

The user should feel they are asking for help, not filling a bureaucratic form.

- Short heading such as `How can we help?` / localized equivalent.
- Ask for a small number of clear fields: category, subject, message, and contact email only where required by the schema/auth state.
- Provide example prompts in the UI only if they are labels/placeholders, not records submitted to the database.
- Explain what happens after submission in one short sentence. Don't promise response times unless the team has committed to them.
- Show the generated ticket reference only if it is real; provide a link to the user's own ticket history where supported.

### Staff ticket workspace

- Default to an inbox-like list with status, priority, category, subject, updated time and assignee (only if field exists).
- Support filters: status, priority, category. Include search only on fields permitted by the backend.
- On desktop, show a readable case list and detail pane only if the actual screen width supports both; otherwise use list → detail navigation.
- Message thread uses clear but restrained separation between user messages and staff replies. Internal notes must be visually unmistakable and must be filtered server-side from user views.
- Keep the reply composer anchored at the bottom of the ticket panel. Prevent send button overlap with mobile keyboards and safe-area insets.
- Status/priority controls should look like controls, not decorative badges. Require server success before updating the displayed state.

## 6. Muara AI support UI

### First-use state

- Title: `Muara AI`.
- Short description: `Ask about reporting an item, searching for a match, or using MuaraKu safely.` (localize with existing translation files).
- Show 3–4 useful starter prompts only when they map to real FAQ/policy content, such as how to report a found item or what to do when someone requests a fee. Starter prompts are shortcuts to real questions, not synthetic messages preloaded as history.
- Do not show a fake “AI online” indicator or fabricated past conversations.

### Conversation state

- The message history is the scrollable region; the message composer remains anchored and reachable.
- Messages must have good readable line length, whitespace, visible timestamps only if persisted/needed, and clear distinction between user and assistant.
- Use a subtle response/source hint such as `Based on MuaraKu Help & Safety guidance` only if the answer actually used approved source content.
- Provide an accessible send button, disabled/loading behavior, retry for safe failures, and a path to contact a human support team.
- Don't expose prompt settings, long “AI conditions”, raw chain-of-thought, provider internals, or token/cost claims to ordinary users.
- Do not add a giant floating robot illustration, neon gradient, typing animation that never ends, or huge pill-shaped bubble styles.

## 7. AI-assisted search and match results

- Search is the user's task—not a showcase of model capability. Let users enter a natural-language query and refine with existing filters.
- Present results using the existing report list/card language: title, lost/found type, category, city/location label, time/date, and allowed public attributes.
- If a match explanation exists, keep it short and specific to public attributes (e.g. category, color, brand); do not reveal private clues or imply certainty.
- A match score must be shown only if a real supported algorithm produces it. If its meaning cannot be explained, omit it.
- Empty state should suggest changing query/filter or creating a report, depending on the actual page capabilities. Never show fake result cards.

## 8. Visual QA behaviors

For all touched routes, define and verify these states:

- Initial/loading: skeleton or stable progress indicator with roughly correct layout.
- Success: reflects the confirmed server response.
- Empty: plain-language explanation plus a contextually relevant action.
- Error: explains what failed and how to retry or correct input, without leaking internals.
- Disabled/pending: disabled controls are visually distinguishable and keyboard/screen-reader states are correct.
- Permission denied: a clear redirect or access-denied state that does not reveal protected content.

## 9. Responsive layout checklist

Check representative widths of 360px, 390px, 768px, 1024px, and desktop. They are QA widths, not fixed breakpoints.

- No horizontal page overflow.
- Dialogs fit on screen and preserve a reachable close/action control.
- Tables reflow to a list/detail presentation on small screens when necessary.
- Filters wrap or collapse accessibly.
- Chat composer remains visible and doesn't hide the latest message behind a bottom nav.
- Touch controls remain comfortably tappable and are not too close together.
- Sticky headers/bottom navigation do not cover focus targets or page content.

## 10. What “not AI slop” means for this redesign

The UI should avoid generic templates by using the real needs of each page to guide its structure. Do not use:

- A dashboard filled with unrelated metrics and charts.
- Three or four identical summary cards simply because space is available.
- Large empty gradients or decorative “AI” motifs.
- Repeated card-in-card nesting.
- Unnecessary icons before every line of text.
- Huge title + tiny helper copy + giant blank space as a universal page pattern.
- Artificial user names, report rows, ticket histories, charts, matching results, or activity events.
- A one-size-fits-all layout applied to Admin, support, and AI chat.

Every element must help the user scan information, make a decision, or complete a task.
