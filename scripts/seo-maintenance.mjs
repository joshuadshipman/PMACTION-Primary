import { autonomousContentService } from '../lib/services/autonomousContentService.js';

/**
 * Daily SEO/AEO Maintenance Script
 * This script triggers the autonomous content generation loop to keep the site 
 * "fresh" and dominant in search/answer engine rankings.
 */
async function runDailySEO() {
    console.log("⏰ Daily SEO Task Started...");
    
    try {
        const result = await autonomousContentService.runDailyContentCycle();
        
        console.log("✅ Daily Content Generated:");
        console.log(`- Topic: ${result.topic}`);
        console.log(`- Merch Picks: ${result.merchPicks.length} items`);
        
        const social = await autonomousContentService.generateSocialBlasts(result);
        console.log("🐦 Social Media Prepared:");
        console.log(`- Twitter: ${social.twitter}`);
        
        console.log("🏁 SEO Maintenance Complete. Site is now 'Fresh'.");
    } catch (error) {
        console.error("❌ Daily SEO Task Failed:", error);
    }
}

runDailySEO();
