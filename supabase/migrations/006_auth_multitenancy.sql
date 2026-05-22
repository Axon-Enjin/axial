-- =============================================================================
-- 006_auth_multitenancy.sql
--
-- Auth + multi-tenancy foundation for Axial.
-- Adds: orgs, org_memberships, org_invites tables.
-- Extends: eis_submissions, factoring_invoices, payers, reserve_ledger
--          with org_id (nullable for backwards compat with pre-auth data).
-- Enables: RLS on all data tables, scoped to org membership.
--
-- Trigger: auto-create org + owner membership on new auth.users row.
--
-- Run on the Supabase project: ifzyntqwymmgimnxtguz
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Orgs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orgs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  plan        TEXT NOT NULL DEFAULT 'starter',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;

-- Org members can read their org
CREATE POLICY "orgs: members can read" ON orgs
  FOR SELECT USING (
    id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid()
        AND accepted_at IS NOT NULL
    )
  );

-- ---------------------------------------------------------------------------
-- 2. Org memberships
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS org_memberships (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'member',   -- 'owner' | 'admin' | 'member'
  invited_by  UUID REFERENCES auth.users(id),
  accepted_at TIMESTAMPTZ,                      -- NULL = pending invite
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, user_id)
);

ALTER TABLE org_memberships ENABLE ROW LEVEL SECURITY;

-- Members can see their own memberships
CREATE POLICY "org_memberships: self read" ON org_memberships
  FOR SELECT USING (user_id = auth.uid());

-- Admins/owners can see all members in their org
CREATE POLICY "org_memberships: admin read" ON org_memberships
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid()
        AND role IN ('owner','admin')
        AND accepted_at IS NOT NULL
    )
  );

-- Only owners/admins can insert memberships (invites)
CREATE POLICY "org_memberships: admin insert" ON org_memberships
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid()
        AND role IN ('owner','admin')
        AND accepted_at IS NOT NULL
    )
  );

-- Members can update their own acceptance
CREATE POLICY "org_memberships: self update" ON org_memberships
  FOR UPDATE USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 3. Org invites
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS org_invites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'member',
  token       TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  invited_by  UUID NOT NULL REFERENCES auth.users(id),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE org_invites ENABLE ROW LEVEL SECURITY;

-- Admins/owners manage invites
CREATE POLICY "org_invites: admin read" ON org_invites
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid()
        AND role IN ('owner','admin')
        AND accepted_at IS NOT NULL
    )
  );

CREATE POLICY "org_invites: admin insert" ON org_invites
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE user_id = auth.uid()
        AND role IN ('owner','admin')
        AND accepted_at IS NOT NULL
    )
  );

-- Anyone with the token can read (for invite acceptance) — service role used in API
-- Accept is handled by the server API route (service role bypasses RLS)

-- ---------------------------------------------------------------------------
-- 4. Extend existing data tables with org_id
-- ---------------------------------------------------------------------------

ALTER TABLE eis_submissions
  ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES orgs(id);

ALTER TABLE factoring_invoices
  ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES orgs(id);

ALTER TABLE payers
  ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES orgs(id);

ALTER TABLE reserve_ledger
  ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES orgs(id);

-- Indexes for common org-scoped queries
CREATE INDEX IF NOT EXISTS idx_eis_org        ON eis_submissions (org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_org   ON factoring_invoices (org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payers_org     ON payers (org_id);
CREATE INDEX IF NOT EXISTS idx_reserve_org    ON reserve_ledger (org_id);

-- ---------------------------------------------------------------------------
-- 5. RLS helper: current user's active org_ids
-- ---------------------------------------------------------------------------
-- Used in data table policies to avoid N+1 subqueries.
CREATE OR REPLACE FUNCTION auth_org_ids()
RETURNS SETOF UUID
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT org_id FROM org_memberships
  WHERE user_id = auth.uid()
    AND accepted_at IS NOT NULL;
$$;

-- ---------------------------------------------------------------------------
-- 6. RLS on data tables (additive — preserves service-role bypass)
-- ---------------------------------------------------------------------------

-- eis_submissions
ALTER TABLE eis_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "eis: org members read" ON eis_submissions
  FOR SELECT USING (
    org_id IS NULL -- pre-auth rows visible to all authenticated users
    OR org_id IN (SELECT auth_org_ids())
  );

CREATE POLICY "eis: org members write" ON eis_submissions
  FOR ALL USING (
    org_id IS NULL
    OR org_id IN (SELECT auth_org_ids())
  );

-- factoring_invoices
ALTER TABLE factoring_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices: org members read" ON factoring_invoices
  FOR SELECT USING (
    org_id IS NULL
    OR org_id IN (SELECT auth_org_ids())
  );

CREATE POLICY "invoices: org members write" ON factoring_invoices
  FOR ALL USING (
    org_id IS NULL
    OR org_id IN (SELECT auth_org_ids())
  );

-- payers
ALTER TABLE payers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payers: org members read" ON payers
  FOR SELECT USING (
    org_id IS NULL
    OR org_id IN (SELECT auth_org_ids())
  );

CREATE POLICY "payers: org members write" ON payers
  FOR ALL USING (
    org_id IS NULL
    OR org_id IN (SELECT auth_org_ids())
  );

-- reserve_ledger
ALTER TABLE reserve_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reserve: org members read" ON reserve_ledger
  FOR SELECT USING (
    org_id IS NULL
    OR org_id IN (SELECT auth_org_ids())
  );

CREATE POLICY "reserve: org members write" ON reserve_ledger
  FOR ALL USING (
    org_id IS NULL
    OR org_id IN (SELECT auth_org_ids())
  );

-- ---------------------------------------------------------------------------
-- 7. Trigger: auto-create org + owner membership on new auth.users
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id  UUID;
  org_name    TEXT;
  org_slug    TEXT;
  base_slug   TEXT;
  counter     INT := 0;
BEGIN
  -- Derive org name from user metadata or email
  org_name := COALESCE(
    NEW.raw_user_meta_data->>'org_name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );

  -- Generate a unique slug
  base_slug := lower(regexp_replace(org_name, '[^a-z0-9]', '-', 'gi'));
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := btrim(base_slug, '-');
  base_slug := substring(base_slug, 1, 40);
  org_slug  := base_slug;

  LOOP
    EXIT WHEN NOT EXISTS (SELECT 1 FROM orgs WHERE slug = org_slug);
    counter  := counter + 1;
    org_slug := base_slug || '-' || counter;
  END LOOP;

  -- Create org
  INSERT INTO orgs (name, slug)
  VALUES (org_name, org_slug)
  RETURNING id INTO new_org_id;

  -- Create owner membership (auto-accepted)
  INSERT INTO org_memberships (org_id, user_id, role, accepted_at)
  VALUES (new_org_id, NEW.id, 'owner', now());

  -- Store org_id in user metadata for fast access
  UPDATE auth.users
  SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('org_id', new_org_id)
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

-- Only create trigger if it doesn't exist (idempotent re-run)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'on_auth_user_created'
      AND tgrelid = 'auth.users'::regclass
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
  END IF;
END;
$$;
