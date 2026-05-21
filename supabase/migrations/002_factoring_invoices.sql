-- Active factoring invoices (Liquidity table + pagination demo)

create table if not exists public.factoring_invoices (
  id text primary key,
  party text not null,
  terms text not null default 'Net 60',
  face numeric not null check (face > 0),
  immediate numeric,
  status text not null check (status in ('awaiting_payer', 'fundable', 'settled')),
  payer_confirmed boolean not null default false,
  noa_acknowledged boolean not null default false,
  lockbox_address text,
  lockbox_memo text,
  collection_status text not null default 'awaiting_payer'
    check (collection_status in ('awaiting_payer', 'open', 'collected')),
  mint_tx_hash text,
  swap_tx_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_factoring_invoices_updated_at
  on public.factoring_invoices (updated_at desc);

alter table public.factoring_invoices enable row level security;

drop policy if exists "service role full access" on public.factoring_invoices;
create policy "service role full access"
  on public.factoring_invoices
  for all
  using (true)
  with check (true);

comment on table public.factoring_invoices is 'MSME factoring pipeline rows — API-backed Active Factoring table';
