-- RLS policies: users can only read/write their own sessions

drop policy if exists "insert own sessions" on public.sessions;
create policy "insert own sessions"
on public.sessions for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "select own sessions" on public.sessions;
create policy "select own sessions"
on public.sessions for select
to authenticated
using (user_id = auth.uid());
