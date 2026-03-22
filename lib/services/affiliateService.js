import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

/**
 * Fetch trending topics using Brave Search API.
 * Returns an array of topic strings.
 */
export async function fetchTrendingTopics() {
    const apiKey = process.env.BRAVE_SEARCH_API_KEY;
    if (!apiKey) {
        console.error('BRAVE_SEARCH_API_KEY not set');
        return [];
    }
    try {
        const response = await fetch('https://api.search.brave.com/res/v1/web/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                q: 'self improvement trends',
                count: 10,
                safeSearch: true,
            }),
        });
        const data = await response.json();
        // Assume data.web.results is an array of result objects with a title field
        const topics = (data?.web?.results || []).map(r => r.title).filter(Boolean);
        return topics;
    } catch (err) {
        console.error('Error fetching trending topics:', err);
        return [];
    }
}

/**
 * Upsert affiliate links for given topics.
 * Each topic creates an Amazon affiliate URL (placeholder).
 */
export async function upsertAffiliateLinks(topics) {
    const inserts = topics.map(topic => ({
        keyword: topic,
        affiliate_url: `https://www.amazon.com/s?k=${encodeURIComponent(topic)}`,
        source: 'brave-search',
    }));
    const { error } = await supabase.from('affiliate_links').upsert(inserts, { onConflict: 'keyword' });
    if (error) {
        console.error('Upsert affiliate links error:', error);
    } else {
        console.log(`Upserted ${inserts.length} affiliate links`);
    }
}
