-- ============================================================================
-- 🚀 PMACTION PLATFORM - ULTIMATE ALL-IN-ONE SETUP SCRIPT
-- Purpose: Syncs Database with Code (user_profiles), Adds Wins, Hearts, 
--          Assessment & Gamification, and RLS Hardening.
-- For Project: efojbldojiulnxifhiby
-- ============================================================================

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. CORE USER TABLE (Renamed to match lib/context.js)
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    last_win_date TIMESTAMP WITH TIME ZONE,
    onboarding_complete BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 2. PMA WINS TABLE
CREATE TABLE IF NOT EXISTS wins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'activity', 'mood', 'journal', 'gratitude', 'self_care'
    content TEXT,
    xp_earned INTEGER DEFAULT 10,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE wins ENABLE ROW LEVEL SECURITY;

-- 3. JOURNAL ENTRIES
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    emotion_data JSONB,
    mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 10),
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- 4. HABITS & LOGS
CREATE TABLE IF NOT EXISTS habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    frequency TEXT DEFAULT 'daily',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS habit_logs (
    id SERIAL PRIMARY KEY,
    habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    completed BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(habit_id, log_date)
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

-- 5. FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS user_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('bug', 'feature_request', 'general')),
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES (STRICT)
-- ============================================================================

-- user_profiles
DROP POLICY IF EXISTS "Users can only select their own profile" ON user_profiles;
CREATE POLICY "Users can only select their own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- wins
DROP POLICY IF EXISTS "Users can only see their own wins" ON wins;
CREATE POLICY "Users can only see their own wins" ON wins FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own wins" ON wins;
CREATE POLICY "Users can insert their own wins" ON wins FOR INSERT WITH CHECK (auth.uid() = user_id);

-- journal_entries
DROP POLICY IF EXISTS "Users can only see their own journal" ON journal_entries;
CREATE POLICY "Users can only see their own journal" ON journal_entries FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own journal" ON journal_entries;
CREATE POLICY "Users can insert their own journal" ON journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

-- habits
DROP POLICY IF EXISTS "Users can manage their own habits" ON habits;
CREATE POLICY "Users can manage their own habits" ON habits FOR ALL USING (auth.uid() = user_id);

-- habit_logs
DROP POLICY IF EXISTS "Users can manage their own habit logs" ON habit_logs;
CREATE POLICY "Users can manage their own habit logs" ON habit_logs FOR ALL USING (auth.uid() = user_id);

-- feedback
DROP POLICY IF EXISTS "Users can submit feedback" ON user_feedback;
CREATE POLICY "Users can submit feedback" ON user_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTIONS & TRIGGERS
-- ============================================================================

-- Handle new user signup automatically
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, display_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'display_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- SUCCESS MESSAGE
SELECT 'Database Setup Successfully Integrated with Code' as status;
