import { generateContentRecommendations } from '../../lib/services/geminiService';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { moods, recentWins, interests, persona } = req.body;

        // Server-side call (Can access GEMINI_API_KEY)
        const recommendations = await generateContentRecommendations({
            moods,
            recentWins,
            interests,
            persona
        });

        if (!recommendations) {
            return res.status(500).json({ message: 'Failed to generate recommendations' });
        }

        res.status(200).json(recommendations);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
