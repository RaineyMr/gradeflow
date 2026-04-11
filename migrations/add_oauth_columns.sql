-- Add OAuth columns to teachers table
-- This migration adds columns needed for Google OAuth onboarding

-- Add auth_id column to store the OAuth user ID (UUID from Supabase auth)
ALTER TABLE teachers 
ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE;

-- Add provider column to track OAuth provider
ALTER TABLE teachers 
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'email';

-- Add avatar_url column to store profile picture from OAuth
ALTER TABLE teachers 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add onboarded_at column to track when user completed onboarding
ALTER TABLE teachers 
ADD COLUMN IF NOT EXISTS onboarded_at TIMESTAMP WITH TIME ZONE;

-- Add index on auth_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_teachers_auth_id ON teachers(auth_id);

-- Add index on provider for filtering
CREATE INDEX IF NOT EXISTS idx_teachers_provider ON teachers(provider);

-- Comments for documentation
COMMENT ON COLUMN teachers.auth_id IS 'OAuth provider user ID (UUID from Supabase auth.users)';
COMMENT ON COLUMN teachers.provider IS 'Authentication provider: email, google, etc.';
COMMENT ON COLUMN teachers.avatar_url IS 'Profile picture URL from OAuth provider';
COMMENT ON COLUMN teachers.onboarded_at IS 'Timestamp when user completed onboarding process';

-- RLS Policy Update (if needed)
-- This ensures users can only access their own records
CREATE POLICY IF NOT EXISTS "users_can_view_own_oauth_profile" ON teachers
FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY IF NOT EXISTS "users_can_update_own_oauth_profile" ON teachers
FOR UPDATE USING (auth.uid() = auth_id);

CREATE POLICY IF NOT EXISTS "users_can_insert_own_oauth_profile" ON teachers
FOR INSERT WITH CHECK (auth.uid() = auth_id);
