import { runDailyLoop } from '../../../scripts/dailyResearchLoop.mjs';

/**
 * Admin API Route to trigger the Daily Research Loop.
 * This ensures the loop runs within the Next.js context with full ESM support.
 */
export default async function handler(req, res) {
    // Basic security: Check for a secret key or just allow for this dev verification
    // if (req.headers['x-admin-key'] !== process.env.ADMIN_SECRET) {
    //     return res.status(401).json({ error: "Unauthorized" });
    // }

    console.log("🚀 [API] Triggering Daily Research Loop...");
    
    try {
        await runDailyLoop();
        res.status(200).json({ success: true, message: "Daily loop completed. Check server logs for details." });
    } catch (error) {
        console.error("❌ [API] Daily loop failed:", error);
        res.status(500).json({ error: error.message });
    }
}
