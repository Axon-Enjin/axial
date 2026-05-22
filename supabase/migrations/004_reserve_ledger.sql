-- Reserve & recourse ledger + on-chain lockbox tracking (RFC CLS-07/08)
-- Companion to 003_closed_loop.sql. One row per funded invoice.

create table if not exists public.reserve_ledger (
  id                uuid primary key default gen_random_uuid(),
  receivable_id     text not null unique,
  face_amount       numeric(18,2) not null,
  advance_amount    numeric(18,2) not null,
  reserve_held      numeric(18,2) not null,
  funder_address    text not null,
  msme_address      text not null,
  lockbox_address   text not null,
  settlement_tx_hash text,
  collected_amount  numeric(18,2),
  shortfall         numeric(18,2) not null default 0,
  due_date          date,
  recourse_status   text not null default 'none'
    check (recourse_status in ('none', 'triggered', 'recovered', 'written_off')),
  leakage_detected_at timestamptz,
  released_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_reserve_ledger_receivable
  on public.reserve_ledger (receivable_id);
create index if not exists idx_reserve_ledger_due_date
  on public.reserve_ledger (due_date)
  where recourse_status = 'none';

alter table public.reserve_ledger enable row level security;
drop policy if exists "service role full access" on public.reserve_ledger;
create policy "service role full access" on public.reserve_ledger
  for all using (true) with check (true);

comment on table public.reserve_ledger is
  'Per-invoice reserve & recourse accounting. One row per funded receivable.';
comment on column public.reserve_ledger.lockbox_address is
  'Settlement contract address — the ONLY valid payment destination per NoA.';
comment on column public.reserve_ledger.shortfall is
  'Funder advance not recovered. Non-zero triggers recourse.';
