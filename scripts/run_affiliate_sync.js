require('dotenv').config({ path: '.env.local' });

(async () => {
    try {
        const { fetchTrendingTopics, upsertAffiliateLinks } = await import('../lib/services/affiliateService.js');
        const topics = await fetchTrendingTopics();
        console.log('Fetched topics:', topics.length);
        await upsertAffiliateLinks(topics);
        console.log('Upsert completed');
    } catch (e) {
        console.error('Error during sync:', e);
    }
})();
