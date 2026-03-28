import { GoogleGenerativeAI } from "@google/generative-ai";
import { getPersonaPromptContext, getBlogSpec } from '../personalization/personaEngine';

let genAI;
let model;

// Lazy initializer with model-switching capability
function getModel(tier = 'flash') {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ Missing Gemini API Key");
        return null;
    }
    genAI = new GoogleGenerativeAI(apiKey);
    
    // Switch between flash (speed/cost) and pro (high intelligence/Ultra)
    const modelName = tier === 'pro' ? "gemini-1.5-pro" : "gemini-1.5-flash";
    return genAI.getGenerativeModel({ model: modelName });
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
export const generateBlogPost = async (topic, persona = null) => {
    try {
        const model = getModel('pro'); // Use High Intelligence for Blogs
        if (!model) throw new Error("AI unavailable");

        const blogSpec = persona ? getBlogSpec(persona) : null;
        const personaContext = persona ? getPersonaPromptContext(persona) : '';
        const wordRange = blogSpec ? `${blogSpec.wordCount[0]}-${blogSpec.wordCount[1]}` : '400-800';
        const format = blogSpec ? blogSpec.format : 'informative';

        const prompt = `Write a ${format} blog post about "${topic}". Target word count: ${wordRange} words. Start with a title on the first line, like "# My Title".
        The tone should be supportive and informative.
        ${personaContext}
        
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
export const generateContentRecommendations = async ({ moods, recentWins, interests, persona = null }) => {
    try {
        const model = getModel();
        if (!model) return null;

        const personaContext = persona ? getPersonaPromptContext(persona) : '';

        const prompt = `
        Act as an expert ADHD Coach.
        ${personaContext}
        User Context:
        - Recent Moods: ${JSON.stringify(moods)}
        - Interests: ${JSON.stringify(interests)}
        - Recent Wins: ${JSON.stringify(recentWins)}

        Recommend:
        1. An article topic adapted to this user's generation and content preferences.
        2. A specific reason why this content matters for their age group.
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
 * Generates a full Supabase-ready Assessment on a specific topic.
 */
export const generateFullAssessment = async (topic, persona = null) => {
    try {
        const model = getModel();
        if (!model) return null;

        const personaContext = persona ? getPersonaPromptContext(persona) : '';

        const prompt = `Create a high-quality, scientifically-informed self-assessment about "${topic}".
        ${personaContext}

        Return ONLY valid JSON with this structure matching the Supabase 'assessments' and 'assessment_questions' tables:
        {
            "assessment": {
                "slug": "string-slug",
                "name": "Human Readable Name",
                "description": "Engaging description",
                "category": "adhd" | "anxiety" | "depression" | "wellness",
                "total_questions": 10,
                "scoring_method": "sum",
                "interpretation_ranges": {
                    "0-5": "Wellness",
                    "6-15": "Moderate",
                    "16-25": "Action Required"
                }
            },
            "questions": [
                {
                    "question_text": "text",
                    "response_type": "likert",
                    "response_options": [
                        {"value": 0, "label": "Not at all"},
                        {"value": 1, "label": "Sometimes"},
                        {"value": 2, "label": "Often"},
                        {"value": 3, "label": "Always"}
                    ]
                }
            ]
        }
        ADAPTATION: Use vocabulary and references appropriate for the user's generation. 
        CRITICAL: Do not use modern slang (e.g., "no cap", "bet", "skibidi") for adult personas (Millennials, Gen X, Boomers).
        Generate 10 questions. Be insightful. Ensure slug is unique using current time: ${Date.now()}.`;

        const response = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.response.text());
    } catch (error) {
        console.error("Error generating full assessment:", error);
        return null;
    }
};

/**
 * Generates a full Supabase-ready Challenge (e.g., 7 or 21 days).
 */
export const generateFullChallenge = async (topic, duration = 7, persona = null) => {
    try {
        const model = getModel();
        if (!model) return null;

        const personaContext = persona ? getPersonaPromptContext(persona) : '';

        const prompt = `Create a ${duration}-day developmental challenge about "${topic}".
        ${personaContext}

        Return ONLY valid JSON structure matching the Supabase 'challenges' and 'challenge_tasks' tables:
        {
            "challenge": {
                "slug": "string-slug",
                "title": "Title",
                "description": "Engaging description",
                "category": "habits" | "mindfulness" | "adhd" | "wellness",
                "difficulty": "beginner" | "intermediate" | "advanced",
                "duration_days": ${duration},
                "total_tasks": ${duration},
                "icon": "emoji",
                "cover_image_url": "https://picsum.photos/800/400"
            },
            "tasks": [
                {
                    "day_number": 1,
                    "title": "Task 1",
                    "instructions": "Full markdown instructions",
                    "reflection_prompt": "What did you learn?",
                    "estimated_minutes": 10
                }
            ]
        }
        ADAPTATION: Use word choice and cultural references that resonate with the designated generation.
        CRITICAL: Do not use slang from other generations. If generating for Gen X, keep it direct and professional. 
        Ensure slug is unique using current time: ${Date.now()}. Tasks must be progressive.`;

        const response = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.response.text());
    } catch (error) {
        console.error("Error generating full challenge:", error);
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
export const generateDailyTraining = async ({ moods, recentWins, focusAreas, persona = null }) => {
    try {
        const model = getModel();
        if (!model) return null;

        const personaContext = persona ? getPersonaPromptContext(persona) : '';

        const prompt = `You are the PMAction AI Coach. Generate a highly personalized Daily Training Module for the user.
        ${personaContext}
        
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
        }
        CRITICAL: Match the vocabulary and tone to the specified generation. Avoid mismatched slang.`;

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

/**
 * Generates AI-driven merchandise recommendations.
 * Recommends branded items or affiliate products based on user issues/traits.
 */
export const generateMerchandiseRecommendations = async ({ traits, concerns, recentActivities }) => {
    try {
        const model = getModel();
        if (!model) return [];

        const prompt = `Act as the PMAction Curatorial AI. Based on the user's data, suggest 3-4 items (either branded "PMAction" merch or high-quality non-branded/affiliate products) that would genuinely help them.
        
        User Context:
        - Traits: ${JSON.stringify(traits || [])}
        - Recent Concerns: ${JSON.stringify(concerns || [])}
        - Recent Activities: ${JSON.stringify(recentActivities || [])}

        Potential Branded Items: "Mindfulness Hoodie", "Daily Win Journal", "Focus-Enhancing Desk Pad", "Sensory-Soft T-Shirt".
        Potential Non-Branded Items: "Visual Timer", "Noise-canceling headphones", "Focus Fidget", "Ergonomic chair".

        Return ONLY valid JSON with this structure:
        {
            "recommendations": [
                {
                    "id": "string",
                    "title": "string",
                    "description": "Short explanation of WHY this helps their specific traits.",
                    "type": "Branded" | "Affiliate",
                    "estimatedPrice": "string",
                    "icon": "emoji"
                }
            ]
        }`;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });

        const parsed = JSON.parse(result.response.text());
        return parsed.recommendations;

    } catch (error) {
        console.error("Error generating merchandise recommendations:", error);
        return [];
    }
};

/**
 * Generates SEO/AEO/GEO optimized social media posts for multiple platforms.
 */
export const generateOptimizedSocialPosts = async (topic, persona) => {
    try {
        const model = getModel('pro'); // Use High Intelligence for Optimization
        if (!model) return null;

        const personaContext = getPersonaPromptContext(persona);
        const aeoHint = `AEO Keywords: ${persona.aeoKeywords.join(', ')}`;
        const geoHint = `GEO Trigger: ${persona.geoTriggers}`;

        const prompt = `Act as an expert Social Media & Growth Strategist (AEO/GEO Specialist).
        Topic: "${topic}"
        ${personaContext}
        Optimization Directives:
        - ${aeoHint}
        - ${geoHint}

        TASK: Generate a bundle of high-conversion social media posts optimized for both human engagement AND search/answer engine visibility.
        
        REQUIRED JSON STRUCTURE:
        {
            "twitter": {
                "thread": ["tweet 1 (hook)", "tweet 2 (value)", "tweet 3 (value)", "tweet 4 (CTA)"],
                "seoKeywords": ["list", "of", "hashtags"]
            },
            "instagram": {
                "carouselSlides": [
                    {"title": "Slide 1 Hook", "body": "Short text"},
                    {"title": "Slide 2 Value", "body": "Short text"}
                ],
                "caption": "Full IG caption with emojis",
                "seoKeywords": ["list", "of", "hashtags"]
            },
            "linkedin": {
                "post": "Professional, insightful post using formatting like bullet points.",
                "seoKeywords": ["list", "of", "hashtags"]
            },
            "aeoSummary": "A 50-word highly structured summary of the topic designed to be picked up as a 'featured snippet' or AI answer."
        }
        
        STRATEGY: Use "semantic clusters" and "expert tone" to trigger GEO/AEO ranking. Do not use generic clickbait. Offer genuine value.`;

        const response = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });
        
        return JSON.parse(response.response.text());
    } catch (error) {
        console.error("Error generating optimized social posts:", error);
        return null;
    }
};// Alias: generateQuiz is equivalent to generateFullAssessment (fixes import in self-care.js)
export const generateQuiz = generateFullAssessment;
