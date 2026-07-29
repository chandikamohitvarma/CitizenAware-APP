/*
  # Create schemes and applications tables

  1. New Tables
    - `schemes`: Store government schemes/programs
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `category` (text)
      - `eligibility` (jsonb)
      - `documents_required` (text array)
      - `featured` (boolean)
      - `created_at` (timestamp)

    - `applications`: Store user applications
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `scheme_id` (uuid, references schemes)
      - `status` (text: draft, submitted, approved, rejected)
      - `current_step` (integer)
      - `personal_data` (jsonb)
      - `address_data` (jsonb)
      - `bank_data` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `saved_schemes`: Store user's saved schemes
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `scheme_id` (uuid, references schemes)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Users can only view schemes
    - Users can only access their own applications and saved schemes
*/

-- Create schemes table
CREATE TABLE IF NOT EXISTS schemes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  eligibility jsonb,
  documents_required text[] DEFAULT '{}',
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheme_id uuid NOT NULL REFERENCES schemes(id),
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  current_step integer DEFAULT 1,
  personal_data jsonb,
  address_data jsonb,
  bank_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create saved_schemes table
CREATE TABLE IF NOT EXISTS saved_schemes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheme_id uuid NOT NULL REFERENCES schemes(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, scheme_id)
);

-- Enable RLS
ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_schemes ENABLE ROW LEVEL SECURITY;

-- Schemes: Public read access
CREATE POLICY "Anyone can view schemes"
  ON schemes FOR SELECT
  TO authenticated
  USING (true);

-- Applications: Users can only access their own
CREATE POLICY "Users can view own applications"
  ON applications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create applications"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
  ON applications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Saved schemes: Users can only access their own
CREATE POLICY "Users can view own saved schemes"
  ON saved_schemes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save schemes"
  ON saved_schemes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove saved schemes"
  ON saved_schemes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_scheme_id ON applications(scheme_id);
CREATE INDEX IF NOT EXISTS idx_saved_schemes_user_id ON saved_schemes(user_id);
CREATE INDEX IF NOT EXISTS idx_schemes_category ON schemes(category);
