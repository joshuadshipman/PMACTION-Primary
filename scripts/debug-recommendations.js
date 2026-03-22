require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testRecommendations() {
    console.log("🤖 Testing AI Recommendations...");

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("❌ Mising API Key");
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
        Act as an expert ADHD Coach.
        User Context:
        - Recent Moods: ["stressed", "overwhelmed"]
        - Interests: ["Productivity", "Mindfulness"]
        - Recent Wins: []

        Recommend:
        1. An article topic (title).
        2. A specific reason why this article fits their mood.
        3. A recommended Challenge ID from this list: [focus_flow_builder_2, physiology_first, crisis_control].
        4. A reason for the challenge.

        Return strictly JSON:
        {
            "articleTopic": "string",
            "articleReason": "string",
            "challengeId": "string",
            "challengeReason": "string"
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("📝 Raw Response:", text);

        try {
            // Clean markdown code blocks if present
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const json = JSON.parse(cleanText);
            console.log("✅ Parsed JSON:", json);
        } catch (e) {
            console.error("❌ JSON Parse Failed:", e.message);
        }

    } catch (error) {
        console.error("❌ API Error:", error.message);
    }
}

testRecommendations();
