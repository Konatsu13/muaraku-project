begin;

drop policy if exists reports_delete_own_editable on public.reports;
create policy reports_delete_own_editable on public.reports for delete to authenticated
using (
  reporter_user_id = auth.uid()
  and case_status in ('open', 'match_pending')
  and moderation_status <> 'removed'
);
grant delete on public.reports to authenticated;

create or replace function public.muaraku_set_owned_report_status(
  p_report_id uuid,
  p_case_status text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target_report public.reports%rowtype;
begin
  if auth.uid() is null or not public.muaraku_is_current_user_active() then
    raise exception 'An active signed-in account is required';
  end if;

  if p_case_status is null or p_case_status not in ('open', 'returned') then
    raise exception 'Unsupported report status';
  end if;

  select * into target_report
  from public.reports
  where id = p_report_id
  for update;

  if not found
     or target_report.reporter_user_id is distinct from auth.uid()
     or target_report.moderation_status = 'removed' then
    raise exception 'Report not found or not editable';
  end if;

  if p_case_status = 'returned'
     and target_report.case_status not in ('open', 'match_pending') then
    raise exception 'Report cannot be marked returned from its current status';
  end if;

  if p_case_status = 'open'
     and target_report.case_status <> 'returned' then
    raise exception 'Only returned reports can be reopened';
  end if;

  update public.reports
  set case_status = p_case_status,
      returned_at = case when p_case_status = 'returned' then now() else null end
  where id = p_report_id;
end;
$$;

create or replace function public.muaraku_edit_global_message(
  p_message_id uuid,
  p_body text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target_message public.messages%rowtype;
  target_conversation_kind text;
  trimmed_body text := trim(coalesce(p_body, ''));
begin
  if auth.uid() is null or not public.muaraku_is_current_user_active() then
    raise exception 'An active signed-in account is required';
  end if;

  if char_length(trimmed_body) not between 1 and 5000 then
    raise exception 'Message must be between 1 and 5000 characters';
  end if;

  select m, c.kind into target_message, target_conversation_kind
  from public.messages m
  join public.conversations c on c.id = m.conversation_id
  where m.id = p_message_id
  for update of m;

  if not found
     or target_message.sender_id is distinct from auth.uid()
     or target_conversation_kind <> 'global'
     or target_message.deleted_at is not null
     or target_message.moderation_status <> 'approved'
     or target_message.message_kind <> 'text' then
    raise exception 'Message not found or not editable';
  end if;

  update public.messages
  set body = trimmed_body,
      edited_at = now()
  where id = p_message_id;
end;
$$;

create or replace function public.muaraku_delete_global_message(p_message_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target_message public.messages%rowtype;
  target_conversation_kind text;
begin
  if auth.uid() is null or not public.muaraku_is_current_user_active() then
    raise exception 'An active signed-in account is required';
  end if;

select m.*
into target_message
from public.messages m
join public.conversations c on c.id = m.conversation_id
where m.id = p_message_id
for update of m;

target_conversation_kind := null;

if found then
  select c.kind
  into target_conversation_kind
  from public.conversations c
  where c.id = target_message.conversation_id;
end if;

  if not found
     or target_message.sender_id is distinct from auth.uid()
     or target_conversation_kind <> 'global'
     or target_message.deleted_at is not null
     or target_message.moderation_status <> 'approved'
     or target_message.message_kind <> 'text' then
    raise exception 'Message not found or not deletable';
  end if;

  update public.messages
  set body = 'Pesan ini telah dihapus.',
      deleted_at = now()
  where id = p_message_id;
end;
$$;

revoke all on function public.muaraku_set_owned_report_status(uuid, text) from public, anon;
revoke all on function public.muaraku_edit_global_message(uuid, text) from public, anon;
revoke all on function public.muaraku_delete_global_message(uuid) from public, anon;
grant execute on function public.muaraku_set_owned_report_status(uuid, text) to authenticated, service_role;
grant execute on function public.muaraku_edit_global_message(uuid, text) to authenticated, service_role;
grant execute on function public.muaraku_delete_global_message(uuid) to authenticated, service_role;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'messages'
     ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end;
$$;

commit;
