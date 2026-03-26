/**
 * PMAction Trends API Endpoint
 * 
 * GET /api/trends/daily - Returns today's trend report
 * POST /api/trends/daily - Forces a fresh trend cycle (admin only)
 * 
 * Powers the "Trending Now" dashboard widget and the daily content pipeline.
 */

import { runTrendIntelligenceCycle, saveTrendReport } from '../../../lib/services/trendIntelligenceService';
import { getTrendsForPersona } from '../../../lib/services/trendIntelligenceService';

// In-memory cache to avoid hammering APIs
let cachedReport = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Optional persona filter
      const { persona, limit } = req.query;

      // Serve from cache if fresh
      if (cachedReport && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
        const trends = persona
          ? cachedReport.trends.filter(t => t.personaAffinity.includes(persona)).slice(0, parseInt(limit) || 3)
          : cachedReport.trends;

        return res.status(200).json({
          success: true,
          fromCache: true,
          data: { ...cachedReport, trends },
        });
      }

      // Generate fresh report
      const report = await runTrendIntelligenceCycle();
      cachedReport = report;
      cacheTimestamp = Date.now();

      // Persist to Firestore
      await saveTrendReport(report);

      const trends = persona
        ? report.trends.filter(t => t.personaAffinity.includes(persona)).slice(0, parseInt(limit) || 3)
        : report.trends;

      return res.status(200).json({
        success: true,
        fromCache: false,
        data: { ...report, trends },
      });

    } else if (req.method === 'POST') {
      // Force refresh (admin endpoint)
      const report = await runTrendIntelligenceCycle();
      cachedReport = report;
      cacheTimestamp = Date.now();
      await saveTrendReport(report);

      return res.status(200).json({
        success: true,
        message: 'Trend cycle completed and saved.',
        data: report,
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Trends API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
