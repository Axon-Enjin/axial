-- =============================================================================
-- 010_telegram_links.sql
-- MSME ops Telegram bot identity: chat ↔ org membership.
-- =============================================================================

CREATE TABLE IF NOT EXISTS telegram_links (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id           TEXT NOT NULL,
  user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  chat_id          BIGINT NOT NULL UNIQUE,
  telegram_user_id BIGINT,
  role             TEXT NOT NULL DEFAULT 'member',
  linked_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_telegram_links_org
  ON telegram_links (org_id);

CREATE TABLE IF NOT EXISTS telegram_link_codes (
  code        TEXT PRIMARY KEY,
  org_id      TEXT NOT NULL,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'member',
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_telegram_link_codes_expires
  ON telegram_link_codes (expires_at);

ALTER TABLE telegram_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_link_codes ENABLE ROW LEVEL SECURITY;

-- Service role / admin client used by API routes; no anon policies needed.
COMMENT ON TABLE telegram_links IS 'Maps Telegram chat_id to Axial org for MSME ops bot';
COMMENT ON TABLE telegram_link_codes IS 'One-time codes for linking Telegram from Settings';
