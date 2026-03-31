import { runRankGuardianTask } from '../../../lib/services/rankGuardian';

export default async function handler(req, res) {
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Optional: Protect this route from public access using a CRON_SECRET
    const authHeader = req.headers.authorization;
    if (
        process.env.CRON_SECRET &&
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        // Run the agent on the primary domain
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pmaction.com/';
        
        console.log(`[RankGuardian CRON] Triggered for ${siteUrl}`);
        const recoveryPlans = await runRankGuardianTask(siteUrl);

        if (recoveryPlans.length > 0) {
            // MVP Draft Mode: 
            // We just log it for now. In Phase 3, we auto-commit or send an email via Resend.
            console.log('[RankGuardian CRON] AEO Recovery Plans Generated:', JSON.stringify(recoveryPlans, null, 2));

            // Optional: You could save this to the DB so the Admin Dashboard can show it
            // await supabase.from('seo_alerts').insert(recoveryPlans);
        }

        return res.status(200).json({
            success: true,
            message: 'Rank Guardian sweep completed.',
            interventions: recoveryPlans.length,
            details: recoveryPlans
        });
    } catch (error) {
        console.error('[RankGuardian CRON] Error:', error.message);
        return res.status(500).json({ success: false, error: 'Failed to run Rank Guardian sweep.' });
    }
}
