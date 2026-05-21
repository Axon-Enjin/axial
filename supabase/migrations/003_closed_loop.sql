-- Closed-loop settlement tables (RFC CLS-01)
-- Payer registry, invoice confirmations, and notices of assignment.
-- Gates: no receivable is fundable without a verified payer + confirmed invoice + acknowledged NoA.

create table if not exists public.payers (
  id            uuid primary key default gen_random_uuid(),
  org_id        text not null,
  legal_name    text not null,
  tin           text not null,
  contact_email text not null,
  kyb_status    text not null default 'pending'
    check (kyb_status in ('pending', 'verified', 'rejected')),
  kyb_verified_at timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_payers_org_id
  on public.payers (org_id);

-- Payer's explicit confirmation that the invoice, amount, and due date are owed.
create table if not exists public.invoice_confirmations (
  id               uuid primary key default gen_random_uuid(),
  receivable_id    text not null,
  payer_id         uuid not null references public.payers(id),
  confirmed_amount numeric(18,2) not null,
  due_date         date not null,
  status           text not null default 'pending'
    check (status in ('pending', 'confirmed', 'disputed')),
  auth_token       text not null unique,
  confirmed_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_invoice_confirmations_receivable
  on public.invoice_confirmations (receivable_id);
create index if not exists idx_invoice_confirmations_token
  on public.invoice_confirmations (auth_token);

-- Notice of Assignment + payer e-acknowledgement. Legal core (Civil Code 1624–1635).
-- The lockbox_address here is the ONLY valid payment instruction once issued.
create table if not exists public.notices_of_assignment (
  id                uuid primary key default gen_random_uuid(),
  receivable_id     text not null unique,
  payer_id          uuid not null references public.payers(id),
  noa_document_ref  text not null,
  lockbox_address   text not null,
  ack_status        text not null default 'issued'
    check (ack_status in ('issued', 'acknowledged', 'refused')),
  ack_method        text check (ack_method in ('in_app', 'signed_pdf')),
  acknowledged_at   timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_noas_receivable_id
  on public.notices_of_assignment (receivable_id);

-- RLS: service role full access on all three tables
alter table public.payers enable row level security;
drop policy if exists "service role full access" on public.payers;
create policy "service role full access" on public.payers
  for all using (true) with check (true);

alter table public.invoice_confirmations enable row level security;
drop policy if exists "service role full access" on public.invoice_confirmations;
create policy "service role full access" on public.invoice_confirmations
  for all using (true) with check (true);

alter table public.notices_of_assignment enable row level security;
drop policy if exists "service role full access" on public.notices_of_assignment;
create policy "service role full access" on public.notices_of_assignment
  for all using (true) with check (true);

comment on table public.payers is 'Enterprise payer (debtor) registry — KYB gate for receivable funding';
comment on table public.invoice_confirmations is 'Payer explicit confirmation of invoice terms; auth token scoped per receivable';
comment on table public.notices_of_assignment is 'NoA issued to payer; lockbox_address is the sole valid payment instruction';
