-- Production RLS Hardening & Feedback Table setup

-- 1. Ensure RLS is enabled for all user tables
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS wins ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_challenges ENABLE ROW LEVEL SECURITY;

-- 2. Clean up potentially loose existing policies
DROP POLICY IF EXISTS "Public Profile Access" ON profiles;
DROP POLICY IF EXISTS "Allow public read" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

DROP POLICY IF EXISTS "Users can read own wins" ON wins;
DROP POLICY IF EXISTS "Users can insert own wins" ON wins;

-- 3. Strictly enforce RLS on profiles (Using auth.uid() = id instead of auth.uid() = user_id)
CREATE POLICY "Users can only select their own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- 4. Strictly enforce RLS on wins
CREATE POLICY "Users can only see their own wins" 
ON wins FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wins" 
ON wins FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wins" 
ON wins FOR DELETE 
USING (auth.uid() = user_id);

-- 5. Strictly enforce RLS on journal_entries
CREATE POLICY "Users can only see their own journal" 
ON journal_entries FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal" 
ON journal_entries FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal" 
ON journal_entries FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal" 
ON journal_entries FOR DELETE 
USING (auth.uid() = user_id);

-- 6. Strictly enforce RLS on user_points
CREATE POLICY "Users can select own points" 
ON user_points FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own points" 
ON user_points FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own points" 
ON user_points FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 7. Strictly enforce RLS on user_challenges
CREATE POLICY "Users can select own challenges" 
ON user_challenges FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges" 
ON user_challenges FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenges" 
ON user_challenges FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 8. Create the unified feedback table
CREATE TABLE IF NOT EXISTS user_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('bug', 'feature_request', 'general')),
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own feedback" 
ON user_feedback FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can see their own feedback" 
ON user_feedback FOR SELECT 
USING (auth.uid() = user_id);
