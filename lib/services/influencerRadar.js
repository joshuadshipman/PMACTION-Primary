/**
 * PMAction Influencer Radar Service
 * 
 * Discovers and tracks micro-influencers (5K-100K followers) in the ADHD,
 * neurodiversity, and mental health spaces. Generates outreach recommendations
 * and tracks engagement potential.
 * 
 * Stores prospects in Firestore: influencer_prospects/{handle}
 */

// ─── Configuration ───────────────────────────────────────────────────────────

const TARGET_NICHES = [
  'ADHD coach', 'neurodiversity advocate', 'mental health creator',
  'therapy creator', 'wellness influencer', 'productivity creator',
  'self-care creator', 'mindfulness teacher', 'executive function coach',
  'burnout recovery', 'anxiety support', 'life coach'
];

const PLATFORM_PRIORITY = ['tiktok', 'instagram', 'youtube', 'linkedin', 'twitter'];

// ─── Influencer Discovery ────────────────────────────────────────────────────

/**
 * Runs a discovery cycle to find potential influencer partners.
 * Uses AI to research and identify micro-influencers.
 * 
 * @returns {Promise<Object[]>} Array of influencer prospect objects
 */
export async function discoverInfluencers() {
  console.log('🔍 Starting Influencer Discovery Cycle...');

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('No Gemini API key — skipping influencer discovery');
      return [];
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const today = new Date().toISOString().split('T')[0];
    const prompt = `You are a social media research analyst for PMAction, a mental health & neurodiversity wellness platform.

    As of ${today}, identify 10 micro-influencers (5K-100K followers) who are actively creating content about ADHD, neurodiversity, mental health, or wellness.

    For each influencer, provide:
    - Their estimated generation/age group appeal (the audience they attract)
    - Why they'd be a good partner for a mental health app
    - Suggested collaboration type

    Return ONLY valid JSON:
    {
      "influencers": [
        {
          "name": "Display name or handle",
          "platform": "tiktok" | "instagram" | "youtube" | "linkedin" | "twitter",
          "niche": "ADHD coach" | "wellness" | "neurodiversity" | "mental health" | "productivity",
          "estimatedFollowers": "5K-10K" | "10K-50K" | "50K-100K",
          "engagementQuality": "high" | "medium" | "low",
          "audiencePersona": "gen_z" | "millennial" | "gen_x" | "mixed",
          "contentStyle": "educational" | "relatable" | "professional" | "humorous",
          "partnershipFit": "Why they'd be a good PMAction partner",
          "collaborationType": "challenge_collab" | "app_review" | "quiz_share" | "content_series" | "affiliate",
          "outreachPriority": 1-10
        }
      ]
    }`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(result.response.text());
    const prospects = (parsed.influencers || []).map(inf => ({
      ...inf,
      discoveredAt: new Date().toISOString(),
      status: 'discovered',          // discovered | contacted | responded | partnered | declined
      outreachSent: false,
      notes: '',
    }));

    console.log(`✨ Discovered ${prospects.length} influencer prospects`);
    return prospects;

  } catch (error) {
    console.error('Influencer discovery failed:', error.message);
    return [];
  }
}

/**
 * Generates a personalized outreach message for an influencer.
 * 
 * @param {Object} influencer - Influencer prospect object
 * @returns {Promise<Object>} { subject, message, platform }
 */
export async function generateOutreachMessage(influencer) {
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Write a brief, authentic outreach message for a ${influencer.niche} creator named "${influencer.name}" on ${influencer.platform}.

    Context:
    - PMAction is a free mental health & neurodiversity wellness app
    - We want to offer: free Pro access + potential collaboration on a "${influencer.collaborationType}" partnership
    - Their content style is: ${influencer.contentStyle}
    - Their audience is primarily: ${influencer.audiencePersona}
    
    Rules:
    - Keep it under 150 words
    - Be genuine, not salesy
    - Reference their specific niche impact
    - Include a clear, low-commitment ask
    
    Return ONLY valid JSON:
    {
      "subject": "Email subject line (if email) or DM opening hook",
      "message": "The full outreach message",
      "callToAction": "The specific ask"
    }`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    });

    return JSON.parse(result.response.text());
  } catch (error) {
    console.error('Outreach generation failed:', error.message);
    return null;
  }
}

// ─── Persistence ─────────────────────────────────────────────────────────────

/**
 * Saves discovered influencer prospects to Firestore.
 * 
 * @param {Object[]} prospects - Array of influencer prospect objects
 * @returns {Promise<number>} Number of new prospects saved
 */
export async function saveInfluencerProspects(prospects) {
  try {
    const { firestoreAdmin } = await import('../firebaseAdmin');
    let newCount = 0;

    for (const prospect of prospects) {
      const docId = `${prospect.platform}_${prospect.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const docRef = firestoreAdmin.collection('influencer_prospects').doc(docId);

      const existing = await docRef.get();
      if (!existing.exists) {
        await docRef.set(prospect);
        newCount++;
      } else {
        // Update engagement quality and outreach priority if already exists
        await docRef.update({
          engagementQuality: prospect.engagementQuality,
          outreachPriority: prospect.outreachPriority,
          lastScannedAt: new Date().toISOString(),
        });
      }
    }

    console.log(`💾 Saved ${newCount} new influencer prospects (${prospects.length - newCount} updated)`);
    return newCount;
  } catch (error) {
    console.error('Failed to save influencer prospects:', error.message);
    return 0;
  }
}

/**
 * Gets all influencer prospects, optionally filtered.
 * 
 * @param {Object} filters - { platform, status, minPriority }
 * @returns {Promise<Object[]>}
 */
export async function getInfluencerProspects(filters = {}) {
  try {
    const { firestoreAdmin } = await import('../firebaseAdmin');
    let query = firestoreAdmin.collection('influencer_prospects');

    if (filters.platform) {
      query = query.where('platform', '==', filters.platform);
    }
    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }

    const snapshot = await query.get();
    let prospects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (filters.minPriority) {
      prospects = prospects.filter(p => p.outreachPriority >= filters.minPriority);
    }

    return prospects.sort((a, b) => (b.outreachPriority || 0) - (a.outreachPriority || 0));
  } catch (error) {
    console.error('Failed to fetch influencer prospects:', error.message);
    return [];
  }
}
