# Proposal: atomic safety moderation and audit

**Status:** proposal only; no SQL was run and no database schema was changed.

## Why this is needed

The local v2.2 installer gives `admin` and `moderator` permission to update
`safety_reports.status`, `assigned_to`, `resolution_message`, and `resolved_at`.
The final `admin_activity_logs` grants authenticated users `SELECT` only; writes
are reserved for `service_role`. A browser update followed by a separate audit
write can therefore leave an unaudited moderation change, and the browser cannot
write the audit row under the documented grants. The Admin UI currently leaves
these transitions read-only rather than reporting a false success.

The live Supabase schema and policies were not queried in this work. Verify that
they match the local installer before designing or applying any migration.

## Proposed trusted operation

Add one narrowly-scoped PostgreSQL RPC for safety-case transitions, for example
`admin_transition_safety_report(report_id, next_status, resolution_message)`.
The final function name and signature must be reviewed against the live schema.
Within one transaction, it should:

1. Require a non-null `auth.uid()` and verify that caller has the
   `admin` or `moderator` role through the approved `staff_roles` helper.
2. Validate the case exists, the requested status is in the schema-supported
   set (`reviewing`, `actioned`, `dismissed`, `closed`), and the transition is
   permitted from the current status. Require a bounded human explanation for
   terminal actions; do not let AI decide or execute the transition.
3. Update only the allowed `safety_reports` fields, setting `resolved_at`
   consistently for terminal states.
4. Insert one `admin_activity_logs` record with actor, action, target type/id,
   and minimal safe metadata (old/new status and a bounded reason). Do not copy
   report evidence, private owner clues, secrets, or unrelated personal data.
5. Return a minimal result only after both writes succeed. Any failure must roll
   back both writes.

Use `SECURITY DEFINER` only if required for the table grants, set a fixed safe
`search_path`, use fully-qualified object names, and derive the actor exclusively
from `auth.uid()` (never accept an actor ID from the caller). Revoke direct
authenticated writes to the protected fields if the RPC becomes the sole
supported path. Grant `EXECUTE` only to `authenticated`; role checks stay inside
the function. Do not expose a service-role key to browser code.

## Data impact and rollout

- No table or row backfill should be needed; the function only handles new
  transitions and appends one audit row per successful transition.
- Before rollout, confirm the live table names, column grants, constraints,
  helper function behavior, RLS policies, audit schema, and exact status values.
- Apply only after a reviewed migration, staging validation, and an approved
  maintenance window. This proposal is not an instruction to run SQL now.

## Required tests

- No session and non-staff user are rejected.
- `support` and `location_verifier` are rejected; `moderator` and `admin` are
  permitted only for allowed transitions.
- Invalid status, missing case, oversized/empty reason, and illegal transition
  leave both tables unchanged.
- A forced audit insert failure rolls back the safety-case update.
- Successful transition creates exactly one audit row with the authenticated
  actor and correct target; metadata contains no private evidence.
- Direct client update cannot bypass the RPC/audit path after rollout.
- Verify behavior with owner, admin, moderator, support, and anonymous database
  roles against the actual live policies.

## Rollback

If the application path fails, disable the moderation controls and return the
UI to read-only. Revoke the RPC execute grant and remove the function only
through a reviewed rollback migration. Do not delete audit rows or silently
re-enable direct updates that bypass logging.
