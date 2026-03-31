import { google } from 'googleapis';
import crypto from 'crypto';

/**
 * gscService.js
 * Handles reading and interacting with the Google Search Console API.
 */

// We expect GOOGLE_SERVICE_ACCOUNT_JSON to be a base64 encoded string or raw string of the JSON key.
const getGscClient = () => {
    try {
        const credentialsRaw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
        if (!credentialsRaw) {
            console.warn('GOOGLE_SERVICE_ACCOUNT_JSON environment variable is missing.');
            return null;
        }

        let credentials;
        try {
            // Check if base64 encoded
            const decoded = Buffer.from(credentialsRaw, 'base64').toString('utf-8');
            if (decoded.includes('private_key')) {
                credentials = JSON.parse(decoded);
            } else {
                credentials = JSON.parse(credentialsRaw);
            }
        } catch (e) {
            credentials = JSON.parse(credentialsRaw);
        }

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
        });

        return google.webmasters({ version: 'v3', auth });
    } catch (err) {
        console.error('Failed to initialize GSC Client:', err);
        return null;
    }
};

/**
 * Fetches the search analytics for the past few days.
 * @param {string} siteUrl - The GSC property URL (e.g., 'sc-domain:pmaction.com' or 'https://www.pmaction.com/')
 * @param {number} daysBack - Number of days to look back
 * @returns {Promise<Array>} List of query metrics
 */
export async function getRankings(siteUrl, daysBack = 3) {
    const searchConsole = getGscClient();
    if (!searchConsole) {
        throw new Error("Google Search Console client not initialized.");
    }

    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() - 1); // GSC data is usually 1-2 days behind

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - daysBack);

    const formatGscDate = (date) => date.toISOString().split('T')[0];

    try {
        const response = await searchConsole.searchanalytics.query({
            siteUrl,
            requestBody: {
                startDate: formatGscDate(startDate),
                endDate: formatGscDate(endDate),
                dimensions: ['page', 'query'],
                rowLimit: 50, // Get top 50 dropping or important pages
            },
        });

        // Map and filter results
        const rows = response.data.rows || [];
        
        return rows.map(r => ({
            page: r.keys[0],
            query: r.keys[1],
            clicks: r.clicks,
            impressions: r.impressions,
            ctr: r.ctr,
            position: r.position
        }));
    } catch (error) {
        console.error(`Error fetching GSC analytics for ${siteUrl}:`, error.message);
        throw error;
    }
}
