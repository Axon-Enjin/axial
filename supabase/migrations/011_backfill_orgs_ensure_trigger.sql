-- =============================================================================
-- 011_backfill_orgs_ensure_trigger.sql
-- Fix: users signed up before handle_new_user trigger → no org_id → Telegram "Org required"
-- =============================================================================

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
  org_name := COALESCE(
    NEW.raw_user_meta_data->>'org_name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1),
    'org'
  );

  base_slug := lower(regexp_replace(org_name, '[^a-z0-9]', '-', 'gi'));
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := btrim(base_slug, '-');
  base_slug := substring(base_slug, 1, 40);
  IF base_slug IS NULL OR base_slug = '' THEN
    base_slug := 'org';
  END IF;
  org_slug  := base_slug;

  LOOP
    EXIT WHEN NOT EXISTS (SELECT 1 FROM orgs WHERE slug = org_slug);
    counter  := counter + 1;
    org_slug := base_slug || '-' || counter;
  END LOOP;

  INSERT INTO orgs (name, slug)
  VALUES (org_name, org_slug)
  RETURNING id INTO new_org_id;

  INSERT INTO org_memberships (org_id, user_id, role, accepted_at)
  VALUES (new_org_id, NEW.id, 'owner', now());

  UPDATE auth.users
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb)
    || jsonb_build_object('org_id', new_org_id)
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Backfill existing users missing org_id
DO $$
DECLARE
  u RECORD;
  new_org_id UUID;
  org_name TEXT;
  org_slug TEXT;
  base_slug TEXT;
  counter INT;
BEGIN
  FOR u IN
    SELECT id, email, raw_user_meta_data
    FROM auth.users
    WHERE raw_user_meta_data->>'org_id' IS NULL
       OR raw_user_meta_data->>'org_id' = ''
  LOOP
    IF EXISTS (SELECT 1 FROM org_memberships WHERE user_id = u.id) THEN
      SELECT org_id INTO new_org_id FROM org_memberships WHERE user_id = u.id LIMIT 1;
      UPDATE auth.users
      SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb)
        || jsonb_build_object('org_id', new_org_id)
      WHERE id = u.id;
      CONTINUE;
    END IF;

    org_name := COALESCE(
      u.raw_user_meta_data->>'org_name',
      u.raw_user_meta_data->>'full_name',
      split_part(u.email, '@', 1),
      'org'
    );
    base_slug := lower(regexp_replace(org_name, '[^a-z0-9]', '-', 'gi'));
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := btrim(base_slug, '-');
    base_slug := substring(base_slug, 1, 40);
    IF base_slug IS NULL OR base_slug = '' THEN
      base_slug := 'org';
    END IF;
    org_slug := base_slug;
    counter := 0;
    LOOP
      EXIT WHEN NOT EXISTS (SELECT 1 FROM orgs WHERE slug = org_slug);
      counter := counter + 1;
      org_slug := base_slug || '-' || counter;
    END LOOP;

    INSERT INTO orgs (name, slug) VALUES (org_name, org_slug) RETURNING id INTO new_org_id;
    INSERT INTO org_memberships (org_id, user_id, role, accepted_at)
    VALUES (new_org_id, u.id, 'owner', now());
    UPDATE auth.users
    SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb)
      || jsonb_build_object('org_id', new_org_id)
    WHERE id = u.id;
  END LOOP;
END;
$$;
