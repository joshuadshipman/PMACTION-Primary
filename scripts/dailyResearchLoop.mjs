import { contentGenerator } from '../lib/ai/contentGenerator.js';
import { autonomousContentService } from '../lib/services/autonomousContentService.js';
import { generateBlogPost } from '../lib/services/geminiService.js';
import { runTrendIntelligenceCycle, saveTrendReport } from '../lib/services/trendIntelligenceService.js';
import { discoverInfluencers, saveInfluencerProspects } from '../lib/services/influencerRadar.js';
import { PERSONAS } from '../lib/personalization/personaEngine.js';

/**
 * PMAction Daily Research & Growth Loop
 * Runs at 4:00 AM daily via Vercel Cron.
 * 
 * Pipeline:
 * 1. LIVE Trend Research (Reddit, AI, Hashtags)
 * 2. Generate persona-targeted content (Blog, Quiz, Challenge)
 * 3. Influencer Discovery & Tracking
 * 4. Social Media Lead Magnets per persona
 */
async function runDailyLoop() {
    console.log("🌅 [4:00 AM] Starting PMAction Daily Growth Cycle...");
    const startTime = Date.now();

    try {
        // --- STEP 1: LIVE TREND INTELLIGENCE ---
        console.log("🔍 Running Real-Time Trend Intelligence...");
        const trendReport = await runTrendIntelligenceCycle();
        await saveTrendReport(trendReport);

        const primaryTrend = trendReport.trends[0];
        const secondaryTrend = trendReport.trends[1];
        console.log(`✨ Primary Trend: "${primaryTrend?.topic}" (score: ${primaryTrend?.score})`);
        console.log(`✨ Secondary Trend: "${secondaryTrend?.topic}" (score: ${secondaryTrend?.score})`);
        console.log(`📊 Total signals collected: ${trendReport.trends.length} trends, ${trendReport.hashtags.length} hashtags`);

        // --- STEP 2: GENERATE CONTENT ECOSYSTEM (Adaptive Factory) ---
        console.log("\n🏗️ Building persona-targeted content ecosystem...");
        
        const primaryTopic = primaryTrend?.topic || "Executive Function & Daily Planning";
        const targetPersonas = Object.keys(PERSONAS);
        
        const results = {
            assessments: [],
            challenges: [],
            blogs: []
        };

        for (const personaId of targetPersonas) {
            const persona = PERSONAS[personaId];
            console.log(`\n💎 Generating variant for: ${persona.label}`);

            // A. Assessment (persona-specific variant)
            const assessment = await contentGenerator.createAssessment(primaryTopic, persona);
            results.assessments.push(assessment.id);
            console.log(`   ✅ [Quiz] ${assessment.name}`);

            // B. Challenge (persona-specific variant)
            const challenge = await contentGenerator.createChallenge(primaryTopic, 7, persona);
            results.challenges.push(challenge.id);
            console.log(`   ✅ [Challenge] ${challenge.title}`);

            // C. Blog Post (persona-specific variant)
            const blog = await contentGenerator.createBlogPost(primaryTopic, persona);
            results.blogs.push(blog.slug);
            console.log(`   ✅ [Blog] ${primaryTopic} (${persona.blogSpec.wordCount[0]}-${persona.blogSpec.wordCount[1]} words)`);
        }

        // --- STEP 3: INFLUENCER DISCOVERY ---
        console.log("\n👥 Running Influencer Radar...");
        const prospects = await discoverInfluencers();
        const saved = await saveInfluencerProspects(prospects);
        console.log(`✅ Found ${prospects.length} prospects, ${saved} new saves`);

        // --- STEP 4: SOCIAL MEDIA BLASTS (AEO/GEO Optimized) ---
        console.log("\n📣 Generating optimized 'Lead Magnets' per persona...");
        const blasts = {};
        for (const personaId of targetPersonas) {
            const persona = PERSONAS[personaId];
            const blast = await autonomousContentService.generateSocialBlasts({
                topic: primaryTopic,
                slug: results.assessments[0]
            }, persona);
            blasts[personaId] = blast;
            console.log(`   ✅ [Social Blast: ${persona.label}] Thread: ${blast?.twitter?.thread?.length || 0} tweets, IG Slides: ${blast?.instagram?.carouselSlides?.length || 0}`);
        }
        
        const sampleBlast = blasts['gen_z'];

        console.log("\n┌──────────────────────────────────────────┐");
        console.log("│   DAILY GROWTH CYCLE — ADMIN SUMMARY     │");
        console.log("├──────────────────────────────────────────┤");
        console.log(`│ 🔥 Top Trend: ${primaryTopic}`);
        console.log(`│ 📊 Trend Signals: ${trendReport.trends.length}`);
        console.log(`│ 📝 Content Generated: ${results.assessments.length} quizzes, ${results.challenges.length} challenges, ${results.blogs.length} blog variants`);
        console.log(`│ 👥 Influencers Found: ${prospects.length} (${saved} new)`);
        console.log(`│ 📣 Social Blasts Ready: LinkedIn, Instagram`);
        console.log(`│ ⏱️ Cycle Time: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
        console.log("└──────────────────────────────────────────┘");
        console.log(`\n[LinkedIn/X Sample - Gen Z]: ${sampleBlast?.twitter?.thread?.[0] || 'N/A'}`);
        console.log(`[Instagram Sample - Gen Z]: ${sampleBlast?.instagram?.caption?.substring(0, 100)}...`);
        console.log(`[AEO Fragment - Gen Z]: ${sampleBlast?.aeoSummary}`);

        console.log("\n🚀 Growth Cycle Complete. PMAction data is fresh and ready for users.");

    } catch (error) {
        console.error("❌ Growth Cycle Failed:", error);
    }
}

// Check if running directly
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
    runDailyLoop();
}

export { runDailyLoop };
