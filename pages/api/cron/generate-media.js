import { generateBlogPost } from '../../../lib/services/geminiService';
import { createClient } from '@supabase/supabase-js';

// Vercel Cron or Manual Trigger
export default async function handler(req, res) {
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // Basic security for cron (can be configured with a Vercel Cron Secret)
    const authHeader = req.headers.authorization;
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Topics array to pick from (can be expanded to pull from trends API)
        const possibleTopics = [
            "Overcoming Analysis Paralysis",
            "Morning Routines for Neurodivergent Minds",
            "The Power of Small Wins",
            "Managing Emotional Dysregulation",
            "How to Build Resilience after a Setback",
            "Harnessing Hyperfocus for Productivity"
        ];

        const randomTopic = possibleTopics[Math.floor(Math.random() * possibleTopics.length)];

        // 1. Generate Content via Gemini
        const rawContent = await generateBlogPost(randomTopic);

        // Parse title and content from markdown
        const lines = rawContent.split('\n');
        let title = randomTopic;
        if (lines[0].startsWith('# ')) {
            title = lines[0].replace('# ', '').trim();
            lines.shift();
        }

        const content = lines.join('\n').trim();
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        // 2. Save to Supabase
        // Use service role key to bypass RLS for automated backend inserts.
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        const { data, error } = await supabaseAdmin
            .from('blog_posts')
            .insert([{
                title,
                slug,
                content,
                category: 'Mental Wealth',
                tags: ['PMA', 'Self-Improvement', 'AI-Generated'],
                author_name: 'PMAction AI Coach',
                published_at: new Date().toISOString()
            }])
            .select();

        if (error) {
            console.error("Supabase Error saving blog post:", error);
            // If slug conflict, just drop it or handle it gracefully
            if (error.code === '23505') {
                return res.status(200).json({ message: 'Blog post slug already exists, skipped.' });
            }
            throw error;
        }

        res.status(200).json({
            success: true,
            message: `Generated and saved blog post: ${title}`,
            url: `/blog/${slug}`
        });

    } catch (error) {
        console.error('API Error in /api/cron/generate-media:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
