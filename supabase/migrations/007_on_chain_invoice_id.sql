-- Persist the chain-scoped invoice id used by settlement::register_invoice / settle
-- so mark_collected can settle the same lockbox record that was registered at swap time.
alter table public.factoring_invoices
  add column if not exists on_chain_invoice_id text;

comment on column public.factoring_invoices.on_chain_invoice_id is
  'Soroban lockbox invoice id (register_invoice / settle); may differ from factoring row id';
