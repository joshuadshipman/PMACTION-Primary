-- Production RLS Hardening & Feedback Table setup (Revised)

-- 1. Ensure RLS is enabled for all existing user tables
ALTER TABLE IF EXISTS user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS wins ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_challenges ENABLE ROW LEVEL SECURITY;

-- 2. Clean up potentially loose existing policies
DROP POLICY IF EXISTS "Public Profile Access" ON user_profiles;
DROP POLICY IF EXISTS "Allow public read" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON user_profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON user_profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON user_profiles;

DROP POLICY IF EXISTS "Users can read own wins" ON wins;
DROP POLICY IF EXISTS "Users can insert own wins" ON wins;

-- 3. Strictly enforce RLS on user_profiles
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_profiles') THEN
        CREATE POLICY "Users can only select their own profile" 
        ON user_profiles FOR SELECT 
        USING (auth.uid() = user_id);

        CREATE POLICY "Users can update their own profile" 
        ON user_profiles FOR UPDATE 
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- 4. Strictly enforce RLS on wins
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'wins') THEN
        CREATE POLICY "Users can only see their own wins" 
        ON wins FOR SELECT 
        USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert their own wins" 
        ON wins FOR INSERT 
        WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can delete their own wins" 
        ON wins FOR DELETE 
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- 5. Strictly enforce RLS on journal_entries
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'journal_entries') THEN
        CREATE POLICY "Users can only see their own journal" 
        ON journal_entries FOR SELECT 
        USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert their own journal" 
        ON journal_entries FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 6. Strictly enforce RLS on habits
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'habits') THEN
        CREATE POLICY "Users can select own habits" 
        ON habits FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can modify own habits" 
        ON habits FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- 7. Create the unified feedback table
CREATE TABLE IF NOT EXISTS user_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('bug', 'feature_request', 'general')),
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own feedback" ON user_feedback;
CREATE POLICY "Users can insert their own feedback" 
ON user_feedback FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can see their own feedback" ON user_feedback;
CREATE POLICY "Users can see their own feedback" 
ON user_feedback FOR SELECT 
USING (auth.uid() = user_id);
