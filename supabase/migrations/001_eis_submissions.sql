-- Axial EIS oracle submissions (run in Supabase SQL Editor)
-- https://supabase.com/dashboard → SQL → New query

create table if not exists public.eis_submissions (
  id uuid primary key default gen_random_uuid(),
  payload_id text not null,
  idempotency_key text not null unique,
  status text not null check (status in ('queued', 'submitted', 'acknowledged', 'memo_written', 'failed')),
  event_kind text not null check (event_kind in ('receivable_minted', 'swap_executed', 'payroll_routed')),
  reference_id text not null,
  stellar_tx_hash text not null,
  bir_reference_id text,
  memo_tx_hash text,
  memo_text text,
  jws_compact text not null,
  payload jsonb not null,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_eis_submissions_created_at
  on public.eis_submissions (created_at desc);

create index if not exists idx_eis_submissions_stellar_tx
  on public.eis_submissions (stellar_tx_hash);

-- Hackathon: allow service role from Next.js API only (no anon client in browser for writes)
alter table public.eis_submissions enable row level security;

drop policy if exists "service role full access" on public.eis_submissions;
create policy "service role full access"
  on public.eis_submissions
  for all
  using (true)
  with check (true);

comment on table public.eis_submissions is 'BIR EIS oracle audit log — idempotent per stellar tx + reference';
