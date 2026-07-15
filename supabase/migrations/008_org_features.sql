-- 008_org_features.sql — trust boundary, org TIN profile, freeze, notifications, disputes

ALTER TABLE orgs
  ADD COLUMN IF NOT EXISTS trust_boundary_acked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS seller_tin TEXT,
  ADD COLUMN IF NOT EXISTS seller_name TEXT,
  ADD COLUMN IF NOT EXISTS seller_address TEXT,
  ADD COLUMN IF NOT EXISTS buyer_tin_default TEXT,
  ADD COLUMN IF NOT EXISTS buyer_name_default TEXT,
  ADD COLUMN IF NOT EXISTS buyer_address_default TEXT,
  ADD COLUMN IF NOT EXISTS frozen_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS freeze_reason TEXT;

ALTER TABLE invoice_confirmations
  ADD COLUMN IF NOT EXISTS dispute_reason TEXT,
  ADD COLUMN IF NOT EXISTS disputed_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID REFERENCES orgs(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  href        TEXT,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_org_created
  ON notifications (org_id, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications: org members read" ON notifications
  FOR SELECT USING (
    org_id IS NULL
    OR org_id IN (SELECT auth_org_ids())
  );

CREATE POLICY "notifications: org members update read" ON notifications
  FOR UPDATE USING (
    org_id IS NULL
    OR org_id IN (SELECT auth_org_ids())
  );

COMMENT ON COLUMN orgs.trust_boundary_acked_at IS 'MSME acknowledged Trust & Boundary before first tokenize';
COMMENT ON COLUMN orgs.frozen_at IS 'Leakage recourse freeze — blocks new funding';
