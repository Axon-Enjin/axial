-- Settlement guardrails: settling status + USDC face / lockbox inflow attribution

ALTER TABLE public.factoring_invoices
  DROP CONSTRAINT IF EXISTS factoring_invoices_collection_status_check;

ALTER TABLE public.factoring_invoices
  ADD CONSTRAINT factoring_invoices_collection_status_check
  CHECK (collection_status IN ('awaiting_payer', 'open', 'settling', 'collected'));

ALTER TABLE public.factoring_invoices
  ADD COLUMN IF NOT EXISTS face_usdc numeric,
  ADD COLUMN IF NOT EXISTS attributed_inflow_usdc numeric;

COMMENT ON COLUMN public.factoring_invoices.face_usdc IS
  'PHP face converted to whole USDC units for Soroban i128 demos';
COMMENT ON COLUMN public.factoring_invoices.attributed_inflow_usdc IS
  'Sum of lockbox fund builds attributed to this invoice (whole USDC units)';
