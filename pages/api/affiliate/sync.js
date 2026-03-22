import { fetchTrendingTopics, upsertAffiliateLinks } from '../../../lib/services/affiliateService';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }
    try {
        const topics = await fetchTrendingTopics();
        await upsertAffiliateLinks(topics);
        res.status(200).json({ synced: topics.length, topics });
    } catch (e) {
        console.error('Affiliate sync error', e);
        res.status(500).json({ message: 'Sync failed' });
    }
}
