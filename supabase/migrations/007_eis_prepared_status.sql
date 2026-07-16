-- Phase 2 EIS Co-Pilot: allow `prepared` (awaiting human review) status.
-- Drops/recreates the status check constraint to include prepared.

ALTER TABLE eis_submissions DROP CONSTRAINT IF EXISTS eis_submissions_status_check;
ALTER TABLE eis_submissions ADD CONSTRAINT eis_submissions_status_check
  CHECK (status IN ('queued', 'prepared', 'submitted', 'acknowledged', 'memo_written', 'failed'));

COMMENT ON CONSTRAINT eis_submissions_status_check ON eis_submissions IS
  'queued (legacy) | prepared (human gate) → submitted → acknowledged → memo_written | failed';
