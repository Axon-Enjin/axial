-- Migration 005: Add T+3 deadline tracking fields to eis_submissions
-- Adds due_by (T+3 deadline timestamp) and submitted_at (actual dispatch time)
-- Both columns are nullable for backward compatibility with existing rows.
-- The index on (status, due_by) powers the worker's retry/expiry queries.

ALTER TABLE eis_submissions
  ADD COLUMN IF NOT EXISTS due_by TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;

-- Index for the T+3 worker: quickly find submissions needing retry or expiry
CREATE INDEX IF NOT EXISTS idx_eis_retry_candidates
  ON eis_submissions (status, due_by)
  WHERE status IN ('queued', 'failed');

COMMENT ON COLUMN eis_submissions.due_by IS
  'T+3 BIR EIS deadline: transaction_date + 3 calendar days. Submissions not '
  'in memo_written status by this timestamp are considered expired.';

COMMENT ON COLUMN eis_submissions.submitted_at IS
  'ISO timestamp when the BIR submission was dispatched (status → submitted).';
