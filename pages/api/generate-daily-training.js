import { generateDailyTraining } from '../../lib/services/geminiService';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { moods, recentWins, focusAreas } = req.body;

        // Call the Gemini service to generate adaptive training
        const dailyTraining = await generateDailyTraining({
            moods,
            recentWins,
            focusAreas
        });

        if (!dailyTraining) {
            return res.status(500).json({ message: 'Failed to generate daily training' });
        }

        res.status(200).json(dailyTraining);
    } catch (error) {
        console.error('API Error in /api/generate-daily-training:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
