-- Add missing columns to applications table
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS scheme_name TEXT,
  ADD COLUMN IF NOT EXISTS total_steps INTEGER DEFAULT 6,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ DEFAULT now();

-- Create application_documents table
CREATE TABLE IF NOT EXISTS application_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_uploaded'
    CHECK (status = ANY (ARRAY['not_uploaded', 'pending', 'verified', 'rejected'])),
  file_url TEXT,
  rejection_reason TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_docs" ON application_documents FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_docs" ON application_documents FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_docs" ON application_documents FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_docs" ON application_documents FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
