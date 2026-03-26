-- ============================================================================
-- 🚀 PMACTION PLATFORM - AI VECTOR & CRISIS ENHANCEMENT
-- ============================================================================

-- 1. Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add embedding columns
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS embedding vector(1536);
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- 3. Add crisis flag metadata to profiles for real-time monitoring
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_crisis_score DECIMAL(5,4) DEFAULT 0.0000;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS crisis_alert_active BOOLEAN DEFAULT false;

-- 4. Create indexes for vector search
CREATE INDEX ON journal_entries USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX ON blog_posts USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 5. Add AI Search Helper Function
CREATE OR REPLACE FUNCTION match_blog_posts (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id int,
  title text,
  slug text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    blog_posts.id,
    blog_posts.title,
    blog_posts.slug,
    1 - (blog_posts.embedding <=> query_embedding) AS similarity
  FROM blog_posts
  WHERE 1 - (blog_posts.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
