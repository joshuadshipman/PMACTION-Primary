import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI;
let model;

// Lazy initializer
function getModel() {
    if (!model) {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("❌ Missing Gemini API Key");
            return null; // Handle gracefully
        }
        genAI = new GoogleGenerativeAI(apiKey);
        model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }
    return model;
}

/**
 * Gets a daily affirmation.
 */
export const getDailyAffirmation = async () => {
    try {
        const model = getModel();
        if (!model) return "You are capable of amazing things.";

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: "Generate a short, positive affirmation for the day." }] }],
            generationConfig: { temperature: 0.9 }
        });
        const response = await result.response;
        return response.text().trim().replace(/"/g, '');
    } catch (error) {
        console.error("Error fetching daily affirmation:", error);
        return "You are capable of amazing things.";
    }
};

/**
 * Generates a blog post.
 */
export const generateBlogPost = async (topic) => {
    try {
        const model = getModel();
        if (!model) throw new Error("AI unavailable");

        const prompt = `Write a short, uplifting blog post about "${topic}". Start with a title on the first line, like "# My Title".
        The tone should be supportive and informative.
        
        You MUST include the following sections at the end:
        **Actionable Item**
        **Quick Examples**
        **Journal Prompt**`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating blog post:", error);
        throw error;
    }
};

/**
 * Generates Content Recommendations (Fixing the reported issue)
 */
export const generateContentRecommendations = async ({ moods, recentWins, interests }) => {
    try {
        const model = getModel();
        if (!model) return null;

        const prompt = `
        Act as an expert ADHD Coach.
        User Context:
        - Recent Moods: ${JSON.stringify(moods)}
        - Interests: ${JSON.stringify(interests)}
        - Recent Wins: ${JSON.stringify(recentWins)}

        Recommend:
        1. An article topic.
        2. A specific reason.
        3. A recommended Challenge ID from list: [focus_flow_builder_2, physiology_first, crisis_control, thought_detective].
        
        Return strictly JSON:
        {
            "articleTopic": "string",
            "articleReason": "string",
            "challengeId": "string",
            "challengeReason": "string"
        }
        `;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });

        const response = await result.response;
        const text = response.text();
        return JSON.parse(text);

    } catch (error) {
        console.error("Error generating recommendations:", error);
        return null;
    }
};

/**
 * Generates educational content.
 */
export const generateEducationalContent = async (topic, audience) => {
    try {
        const model = getModel();
        if (!model) return "Content currently unavailable.";

        const prompt = `Write a brief, easy-to-understand educational piece about "${topic}" for "${audience}".`;
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Error generating educational content:", error);
        return "Content currently unavailable.";
    }
};

/**
 * Generates action plan.
 */
export const generateActionPlan = async (skill) => {
    try {
        const model = getModel();
        if (!model) return null;

        const prompt = `Create a simple guided exercise for "${skill}". Return JSON: { "title": "string", "steps": ["string"] }`;
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });

        const parsed = JSON.parse(result.response.text());
        if (parsed.title && Array.isArray(parsed.steps)) {
            return parsed;
        } else {
            return {
                title: `An Exercise for ${skill}`,
                steps: ["Take a deep breath.", "Focus on your current surroundings.", "Acknowledge your feelings without judgment.", "Think of one small, positive action you can take right now."]
            };
        }
    } catch (error) {
        console.error("Error generating action plan:", error);
        return {
            title: `Error Generating Exercise`,
            steps: [`We could not generate an exercise for "${skill}" at this moment. Please try again.`]
        };
    }
};

/**
 * Generates self-care ideas for the SelfCarePage.
 */
export const generateSelfCareIdeas = async (prompt) => {
    try {
        const model = getModel();
        if (!model) return [];
        const response = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: `Generate 3 simple, actionable self-care ideas for someone who is feeling ${prompt}. Return ONLY valid JSON with this structure: { "ideas": [{ "title": "string", "steps": ["string"] }] }.` }] }],
            generationConfig: { responseMimeType: "application/json" }
        });
        const result = await response.response;
        const parsed = JSON.parse(result.text());
        return parsed.ideas;
    } catch (error) {
        console.error("Error generating self care ideas:", error);
        return [];
    }
};

/**
 * Creates a new chat instance for the AICoachModal.
 */
export const createChat = () => {
    const model = getModel();
    if (!model) throw new Error("AI not initialized");
    return model.startChat({
        systemInstruction: 'You are a friendly and supportive AI wellness coach. Your goal is to listen, offer encouragement, and provide general wellness tips. Do not provide medical advice. Keep your responses concise.',
    });
};

/**
 * Performs a deep dive analysis on a topic using Gemini.
 */
export const getGeminiDeepDive = async (prompt) => {
    try {
        const model = getModel();
        if (!model) return "AI currently unavailable.";
        const response = await model.generateContent(prompt);
        const result = await response.response;
        return result.text();
    } catch (error) {
        console.error("Error performing deep dive:", error);
        throw error; // Re-throw to be handled by the component
    }
};

// --- NEW METHODS ---

/**
 * Generates a new quiz on a specific topic.
 */
export const generateQuiz = async (topic) => {
    try {
        const model = getModel();
        if (!model) return null;
        const prompt = `Create a short, engaging 5-question self-assessment quiz about "${topic}". 
        Return ONLY valid JSON with this structure:
        {
            "id": "gen-${Date.now()}",
            "title": "${topic} Assessment",
            "description": "A quick check-in on your ${topic}.",
            "timeToComplete": "2 mins",
            "source": "AI Generated",
            "questions": ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"],
            "scoring": [
                { "range": [0, 5], "level": "Low", "interpretation": "Seems low.", "recommendation": "Keep it up." },
                { "range": [6, 15], "level": "Medium", "interpretation": "Moderate levels.", "recommendation": "Monitor closely." },
                { "range": [16, 25], "level": "High", "interpretation": "High levels.", "recommendation": "Seek support." }
            ]
        }`;

        const response = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });
        const result = await response.response;
        return JSON.parse(result.text());
    } catch (error) {
        console.error("Error generating quiz:", error);
        return null;
    }
};

/**
 * Generates a gratitude journal prompt.
 */
export const generateGratitudePrompt = async () => {
    try {
        const model = getModel();
        if (!model) return "What is one thing that made you smile today?";
        const response = await model.generateContent("Generate a unique, thought-provoking gratitude journal prompt. Return raw text only.");
        const result = await response.response;
        return result.text();
    } catch (error) {
        console.error("Error generating gratitude prompt:", error);
        return "What is one thing that made you smile today?";
    }
};

/**
 * Generates personalized insights based on user data.
 */
export const generatePersonalizedInsights = async ({ moods, history, reading }) => {
    try {
        const model = getModel();
        if (!model) return "Not enough data to generate insights yet. Keep logging your moods and activities!";
        const prompt = `Analyze this user data and provide 3 personalized mental wellness insights/suggestions.
        
        Recent Moods: ${JSON.stringify(moods?.slice(0, 5) || [])}
        Assessment History: ${JSON.stringify(history?.slice(0, 3) || [])}
        Reading Interests: ${JSON.stringify(reading?.slice(0, 3) || [])}

        Format as a markdown list. Be encouraging and specific. Use bolding for key terms.`;

        const response = await model.generateContent(prompt);
        const result = await response.response;
        return result.text();
    } catch (error) {
        console.error("Error generating insights:", error);
        return "Not enough data to generate insights yet. Keep logging your moods and activities!";
    }
};

/**
 * Generates blog posts based on YouTube video data, grouped by theme.
 */
export const generateBlogFromVideoData = async (videos) => {
    try {
        const model = getModel();
        if (!model) throw new Error("AI not configured");
        const videoSummaries = videos.map(v => `- Title: ${v.title}. Description: ${v.description ? v.description.substring(0, 200) + '...' : 'No description'}`).join('\n');

        const prompt = `I have a list of YouTube videos that I've watched or saved. 
        
        **Goal:** Analyze these videos, group them by distinct themes (e.g., "ADHD Strategies", "Relationship Advice", "Coding tutorials"), and generate a separate, insightful blog post for EACH theme.
        
        Here are the videos:
        ${videoSummaries}
        
        **Instructions:**
        1.  **Cluster:** Group videos by topic. If a topic has only 1 insignificant video, skip it. Focus on clusters of 2+ videos or single, deep-dive topics.
        2.  **Generate:** For each cluster, write a blog post (400-600 words) synthesizing the lessons.
        3.  **Format:** Return ONLY valid JSON with no markdown wrapping. Structure:
        {
            "posts": [
                {
                    "title": "# Title Here",
                    "content": "Full markdown content here...",
                    "tags": ["Topic Name", "YouTube Insight"]
                }
            ]
        }
        
        **Content Structure for each post:**
        *   **Introduction:** Hook the reader.
        *   **Key Insights:** Synthesize the videos.
        *   **Actionable Advice:** What can the reader DO?
        *   **Video Reference:** "Inspired by videos on [Topic]..."`;

        const response = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });
        const result = await response.response;

        return JSON.parse(result.text());
    } catch (error) {
        console.error("Error generating video blog:", error);
        throw error;
    }
};/**
 * Generates daily adaptive training content (PMAction Core Feature).
 * Creates a personalized mini-course or mission based on user data.
 */
export const generateDailyTraining = async ({ moods, recentWins, focusAreas }) => {
    try {
        const model = getModel();
        if (!model) return null;

        const prompt = `You are the PMAction AI Coach. Generate a highly personalized Daily Training Module for the user.
        
        User Context:
        - Recent Moods: ${JSON.stringify(moods || [])}
        - Recent Wins/Activities: ${JSON.stringify(recentWins || [])}
        - Focus Areas/Struggles: ${JSON.stringify(focusAreas || [])}

        The module must be dynamic and adaptive, focusing on "Positive Mental Actions". Vary the format slightly (e.g., short read, interactive challenge, or actionable mission) to keep neurodivergent (e.g., ADHD) users engaged.

        Return ONLY valid JSON with this structure:
        {
            "id": "daily-${Date.now()}",
            "title": "Module Title",
            "format": "5-Minute Read" | "Actionable Mission" | "Reflection Prompt",
            "hook": "A short, engaging opening sentence.",
            "content": "The main training content (use markdown). If it's a mission, list specific steps.",
            "actionStep": "One immediate, small physical or mental action the user can take right now."
        }`;

        const response = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });
        const result = await response.response;

        return JSON.parse(result.text());
    } catch (error) {
        console.error("Error generating daily training:", error);
        return null;
    }
};
