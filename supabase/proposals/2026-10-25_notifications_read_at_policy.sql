-- ============================================================================
-- PROPOSAL ONLY — DO NOT EXECUTE WITHOUT OWNER APPROVAL
-- ============================================================================
-- File: 2026-10-25_notifications_read_at_policy.sql
-- Scope: Sesi 4 — notification mark-as-read
--
-- Problem
-- -------
-- `public.notifications` grants `update (read_at)` to authenticated users, but
-- the final schema declares only a SELECT policy (`notifications_read_own`).
-- With no UPDATE policy, a user-scoped `update ... where recipient_user_id =
-- auth.uid()` affects zero rows. The application now reports this honestly and
-- does NOT bypass RLS with a service-role key.
--
-- Why this migration
-- ------------------
-- Marking one's own notifications as read is a legitimate recipient action. The
-- narrowest policy is recipient-scoped UPDATE. The column grant already limits
-- writable columns to `read_at`, so the policy does not need a column list.
--
-- Impact
-- ------
-- * Adds one RLS policy. No table, column, grant, trigger or data change.
-- * Only the recipient can update their own notification rows.
-- * Trusted backend event writers keep using the service role; this policy is
--   not required for them.
-- * Anonymous users receive no access (policy is `to authenticated`).
--
-- Rollback
-- --------
-- drop policy if exists notifications_update_own_read_at on public.notifications;
--
-- Verification after applying
-- ---------------------------
-- 1. Sign in as a user with unread notifications.
-- 2. Run the app's "Tandai dibaca" action.
-- 3. Confirm the rows' `read_at` changed and the UI no longer shows unread.
-- 4. Confirm another user cannot update those rows (RLS should return 0 rows).
-- ============================================================================

begin;

drop policy if exists notifications_update_own_read_at on public.notifications;
create policy notifications_update_own_read_at
  on public.notifications
  for update
  to authenticated
  using (recipient_user_id = auth.uid())
  with check (recipient_user_id = auth.uid());

commit;
