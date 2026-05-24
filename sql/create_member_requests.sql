-- Create member_requests table for public registration
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS member_requests (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  address     TEXT,
  dob         TEXT,
  sex         TEXT,
  marital_status TEXT,
  notes       TEXT,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  reviewed_notes TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE member_requests ENABLE ROW LEVEL SECURITY;

-- Public: anyone can insert (for the registration form)
CREATE POLICY "Anyone can insert member_requests"
  ON member_requests FOR INSERT
  WITH CHECK (true);

-- Authenticated staff: can view all requests
CREATE POLICY "Authenticated users can view member_requests"
  ON member_requests FOR SELECT
  USING (auth.role() = 'authenticated');

-- Authenticated staff: can update (approve/reject)
CREATE POLICY "Authenticated users can update member_requests"
  ON member_requests FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
