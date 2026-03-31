import { getRankings } from './gscService';
import { getModel } from './geminiService'; // Assuming getModel is exported or we can just instantiate GoogleGenerativeAI
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * rankGuardian.js
 * The Self-Healing SEO Agent for PMAction.
 * Monitors GSC for drops in rank and generates AEO (AI Overview) Schema to recover.
 */

const getGeminiModel = () => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); // High intelligence for SEO
};

/**
 * Analyzes GSC data and generates an AEO recovery plan for dropping pages.
 * @param {string} siteUrl - Domain property (e.g. 'sc-domain:pmaction.com')
 * @returns {Promise<Array>} List of recommended schemas or content rewrites.
 */
export async function runRankGuardianTask(siteUrl) {
    console.log(`[RankGuardian] Starting sweep for ${siteUrl}...`);
    try {
        const rankings = await getRankings(siteUrl, 7); // Look back 7 days
        
        // Filter pages that are slipping out of Top 3
        const droppingPages = rankings.filter(r => r.position > 3 && r.impressions > 50);
        
        if (droppingPages.length === 0) {
            console.log(`[RankGuardian] No critical ranking drops detected for ${siteUrl}.`);
            return [];
        }

        console.log(`[RankGuardian] Found ${droppingPages.length} pages needing AEO intervention.`);
        const recoveryPlans = [];
        const model = getGeminiModel();

        if (!model) {
            console.warn('[RankGuardian] Gemini API Key missing. Cannot generate AEO Schema.');
            return droppingPages;
        }

        for (const target of droppingPages.slice(0, 5)) { // Process top 5 dropping pages to save tokens
            const prompt = `
            Act as an elite SEO and AEO (Answer Engine Optimization) Specialist.
            Our webpage "${target.page}" is ranking at #${target.position.toFixed(1)} for the query "${target.query}".
            We need to reclaim the #1 spot and trigger a Google AI Overview (AEO).
            
            Based on the query "${target.query}", generate a highly optimized JSON-LD FAQ Schema that directly answers the user's search intent.
            
            Return ONLY a valid JSON-LD array containing 3 distinct Question/Answer pairs. 
            Format exactly like this:
            [
              {
                "@type": "Question",
                "name": "The user's likely exact question",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The concise, expert answer."
                }
              }
            ]
            `;

            try {
                const result = await model.generateContent({
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: "application/json" }
                });
                
                const responseText = await result.response.text();
                const faqSchemaNodes = JSON.parse(responseText);

                // Build full JSON-LD script string
                const fullFaqPage = {
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    "mainEntity": faqSchemaNodes
                };

                recoveryPlans.push({
                    page: target.page,
                    query: target.query,
                    currentRank: target.position,
                    proposedAeoSchema: JSON.stringify(fullFaqPage, null, 2),
                    action: 'Draft Review Required'
                });
            } catch (err) {
                console.error(`[RankGuardian] Failed to generate AEO Schema for ${target.page}:`, err.message);
            }
        }

        return recoveryPlans;
    } catch (error) {
        console.error(`[RankGuardian] Critical Error during sweep:`, error);
        throw error;
    }
}
