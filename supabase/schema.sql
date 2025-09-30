-- Sessions table: stores completed Pomodoro work/break blocks
create table if not exists public.sessions (
  id            bigserial primary key,
  user_id       uuid not null references auth.users(id) on delete cascade,
  started_at    timestamptz not null,
  duration_min  int not null check (duration_min between 1 and 180),
  kind          text not null default 'work' check (kind in ('work','break')),
  created_at    timestamptz default now()
);

-- Index for efficient user-scoped queries sorted by time
create index if not exists sessions_user_started_idx
  on public.sessions (user_id, started_at desc);

-- Enable Row Level Security
alter table public.sessions enable row level security;
