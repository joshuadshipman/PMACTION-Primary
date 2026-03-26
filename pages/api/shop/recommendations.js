import { getAffiliateRecommendations } from '../../../lib/services/affiliateService';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { userProfile } = req.body;

        const recommendations = await getAffiliateRecommendations(userProfile);

        if (!recommendations) {
            return res.status(500).json({ message: 'Failed to generate recommendations' });
        }

        res.status(200).json(recommendations);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
