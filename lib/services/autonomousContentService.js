import { generateBlogPost, generateFullAssessment, generateMerchandiseRecommendations, generateOptimizedSocialPosts } from './geminiService.js';
import { firestoreAdmin } from '../firebaseAdmin.js';

/**
 * PMAction Autonomous Content Service
 * Automates the creation of blog posts, quizzes, and merchandise updates.
 */
export const autonomousContentService = {
    /**
     * Triggers a "Freshness Cycle" to update the platform with new AI-generated content.
     */
    async runDailyContentCycle() {
        console.log("🚀 Starting Daily Autonomous Content Cycle...");

        try {
            // 1. Identify Today's Topic (Trending in Wellness/Neurodiversity)
            const topic = "Executive Function & Visual Clarity"; // In real scenario, AI picks from a trending list.

            // 2. Generate Blog Post (SEO/AEO Booster)
            console.log("📝 Generating Daily Article...");
            const blogContent = await generateBlogPost(topic);
            
            // 3. Generate New Quiz
            console.log("📝 Generating Daily Quiz...");
            const quiz = await generateFullAssessment(topic);

            // 4. Save to Firestore
            const blogRef = firestoreAdmin.collection('blog').doc(`${topic.toLowerCase().replace(/ /g, '-')}-${Date.now()}`);
            await blogRef.set({
                title: topic,
                content: blogContent,
                publishedAt: new Date().toISOString(),
                status: 'published'
            });

            // Assessments are handled by contentGenerator separately in some flows, 
            // but here we ensure the logic is mapped.

            // 5. Generate Merchandise Picks for Today
            console.log("🛍️ Scanning Merch/Affiliates for Daily Feature...");
            const currentPicks = await generateMerchandiseRecommendations({
                traits: ["ADHD", "Visual Thinker"],
                concerns: [topic],
                recentActivities: ["Searching for focus tools"]
            });

            return {
                topic,
                blogContent,
                quiz,
                merchPicks: currentPicks,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error("❌ Autonomous Cycle Failed:", error);
            throw error;
        }
    },

    /**
     * Generates a "Social Media Blast" for new content.
     */
    async generateSocialBlasts(content, persona = null) {
        if (!persona) {
            // Default to Millennial if not provided
            const { PERSONAS } = await import('../personalization/personaEngine.js');
            persona = PERSONAS.millennial;
        }

        console.log(`📣 Generating Optimized Social Media Bundle for: ${content.topic} (Persona: ${persona.label})...`);
        const blast = await generateOptimizedSocialPosts(content.topic, persona);
        return blast;
    }
};
