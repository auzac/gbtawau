-- Create feedback table for church member submissions
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS feedback (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN ('Request', 'Improvement', 'General')),
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Closed')),
  notes       TEXT DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Authenticated staff: can read all feedback
CREATE POLICY "Authenticated users can view feedback"
  ON feedback FOR SELECT
  USING (auth.role() = 'authenticated');

-- Authenticated staff: can insert (for testing)
CREATE POLICY "Authenticated users can insert feedback"
  ON feedback FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Authenticated staff: can update (change status, add notes)
CREATE POLICY "Authenticated users can update feedback"
  ON feedback FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Public: anyone can insert (for the public form)
CREATE POLICY "Anyone can insert feedback"
  ON feedback FOR INSERT
  WITH CHECK (true);
