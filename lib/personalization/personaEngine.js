/**
 * PMAction Persona Engine
 * 
 * Maps every user to a Generational Persona based on their demographic profile.
 * Every AI generation call passes persona context so output adapts automatically.
 * 
 * Personas: Gen Alpha (10-14), Gen Z (15-28), Millennial (29-44), Gen X (45-60), Boomer+ (60+)
 */

// ─── Persona Definitions ─────────────────────────────────────────────────────

export const PERSONAS = {
  gen_alpha: {
    id: 'gen_alpha',
    label: 'Gen Alpha',
    ageRange: [10, 14],
    contentStyle: 'Gamified micro-lessons, visual quizzes, animated rewards',
    tone: 'Fun, encouraging, emoji-heavy, short sentences',
    readingLevel: 'grade_6',
    maxContentLength: 300,
    emojiDensity: 'high',       // 1 emoji per 1-2 sentences
    ctaStyle: 'Play the quiz! 🎮',
    platformAffinity: ['youtube', 'tiktok'],
    preferredFormats: ['quiz', 'micro_challenge', 'video'],
    gamificationStyle: {
      levelNames: ['Starter', 'Explorer', 'Hero', 'Legend', 'GOAT 🐐'],
      streakEmoji: '🔥',
      rewardType: 'instant_animation',  // confetti, particle effects
      badgeStyle: 'cartoon',
    },
    blogSpec: {
      wordCount: [200, 400],
      format: 'listicle',
      headingStyle: 'question',  // "Did you know...?"
      ctaText: 'Try the quiz! 🎮',
    },
    socialSpec: {
      tiktok: { maxLength: 150, hashtags: 4, style: 'fun_hook', seoKeywords: ['adhd kid tips', 'focus games', 'funny adhd'] },
      instagram: { format: 'carousel', slides: 5, style: 'colorful', seoKeywords: ['adhd support', 'daily wins'] },
    },
    aeoKeywords: ['simple focus exercises for kids', 'adhd game benefits'],
    geoTriggers: 'Highly visual, direct answers, step-by-step instructions for young readers',
  },

  gen_z: {
    id: 'gen_z',
    label: 'Gen Z',
    ageRange: [15, 28],
    contentStyle: 'Short-form, memes, carousel posts, authentic storytelling',
    tone: 'Authentic, casual, relatable, no corporate speak',
    readingLevel: 'grade_9',
    maxContentLength: 500,
    emojiDensity: 'medium',     // 1 emoji per 2-3 sentences
    ctaStyle: 'Take the quiz 👇',
    platformAffinity: ['tiktok', 'instagram', 'twitter'],
    preferredFormats: ['quiz', 'challenge', 'carousel', 'short_blog'],
    gamificationStyle: {
      levelNames: ['Vibe Check', 'Main Character', 'Sigma Mode', 'Legendary', 'Certified Goat'],
      streakEmoji: '🔥',
      rewardType: 'instant_feedback',
      badgeStyle: 'minimal_modern',
    },
    blogSpec: {
      wordCount: [300, 600],
      format: 'listicle_or_story',
      headingStyle: 'hook',     // "The truth about..."
      ctaText: 'Take the quiz 👇',
    },
    socialSpec: {
      tiktok: { maxLength: 200, hashtags: 5, style: 'trend_hook', seoKeywords: ['adhd struggles', 'executive dysfunction tips', 'adhd life hack'] },
      instagram: { format: 'carousel', slides: 7, style: 'aesthetic', seoKeywords: ['neurodivergent community', 'mental health aesthetic'] },
      twitter: { format: 'thread', tweets: 5, style: 'conversational', seoKeywords: ['adhd truth', 'productivity tips'] },
    },
    aeoKeywords: ['how to focus with adhd gen z', 'best productivity apps for adhd students'],
    geoTriggers: 'Authentic storytelling, relatable struggles, anecdotal evidence, bold claims',
  },

  millennial: {
    id: 'millennial',
    label: 'Millennial',
    ageRange: [29, 44],
    contentStyle: 'Blog posts (800-1200 words), podcasts, structured challenges',
    tone: 'Empathetic, data-backed, self-aware humor, supportive',
    readingLevel: 'grade_12',
    maxContentLength: 1200,
    emojiDensity: 'low',        // 1 emoji per paragraph max
    ctaStyle: 'Start the 7-day challenge →',
    platformAffinity: ['instagram', 'linkedin', 'email'],
    preferredFormats: ['blog', 'challenge', 'assessment', 'podcast_notes'],
    gamificationStyle: {
      levelNames: ['Getting Started', 'Building Momentum', 'In the Zone', 'Thriving', 'Champion'],
      streakEmoji: '⚡',
      rewardType: 'milestone_celebration',
      badgeStyle: 'clean_modern',
    },
    blogSpec: {
      wordCount: [800, 1200],
      format: 'story_plus_science',
      headingStyle: 'benefit',  // "How X helps you Y"
      ctaText: 'Start the 7-day challenge →',
    },
    socialSpec: {
      instagram: { format: 'carousel', slides: 8, style: 'informative', seoKeywords: ['adhd career tips', 'parenting with adhd', 'burnout recovery'] },
      linkedin: { format: 'article', maxLength: 600, style: 'professional_warm', seoKeywords: ['workplace neurodiversity', 'leadership skills'] },
      twitter: { format: 'thread', tweets: 6, style: 'insightful', seoKeywords: ['productivity science', 'adhd research'] },
    },
    aeoKeywords: ['adhd management for professionals', 'balancing career and adhd'],
    geoTriggers: 'Data-backed claims, expert citations, structured summaries, professional tone',
  },

  gen_x: {
    id: 'gen_x',
    label: 'Gen X',
    ageRange: [45, 60],
    contentStyle: 'Long-form articles (1500+ words), email digests, checklists, PDFs',
    tone: 'Professional, practical, no-BS, results-oriented',
    readingLevel: 'college',
    maxContentLength: 2000,
    emojiDensity: 'minimal',    // 0-1 emojis per section
    ctaStyle: 'Download the checklist',
    platformAffinity: ['linkedin', 'email', 'facebook'],
    preferredFormats: ['long_blog', 'checklist', 'pdf', 'email_digest'],
    gamificationStyle: {
      levelNames: ['Beginner', 'Practitioner', 'Expert', 'Master', 'Authority'],
      streakEmoji: '✓',
      rewardType: 'milestone_summary',
      badgeStyle: 'professional',
    },
    blogSpec: {
      wordCount: [1500, 2000],
      format: 'research_with_citations',
      headingStyle: 'direct',   // "The complete guide to..."
      ctaText: 'Download the checklist →',
    },
    socialSpec: {
      linkedin: { format: 'article', maxLength: 1000, style: 'thought_leadership', seoKeywords: ['executive performance', 'adhd at 50', 'legacy building'] },
      facebook: { format: 'post', maxLength: 400, style: 'informative', seoKeywords: ['practical wellness', 'adhd strategies'] },
      email: { format: 'digest', style: 'curated_professional', seoKeywords: ['weekly insights', 'adhd management'] },
    },
    aeoKeywords: ['managing adhd symptoms after 45', 'executive functioning in leadership'],
    geoTriggers: 'No-BS approach, results-oriented checklists, authoritative formatting, PDF-ready structure',
  },

  boomer_plus: {
    id: 'boomer_plus',
    label: 'Boomer+',
    ageRange: [60, 100],
    contentStyle: 'Printable guides, large-text UI, step-by-step walkthroughs',
    tone: 'Warm, respectful, clear, no jargon, clinical when appropriate',
    readingLevel: 'grade_10',
    maxContentLength: 1500,
    emojiDensity: 'none',
    ctaStyle: 'Learn more from our experts',
    platformAffinity: ['email', 'facebook'],
    preferredFormats: ['printable_guide', 'email_newsletter', 'structured_article'],
    gamificationStyle: {
      levelNames: ['Getting Started', 'Making Progress', 'Well Done', 'Outstanding', 'Distinguished'],
      streakEmoji: '★',
      rewardType: 'congratulatory_message',
      badgeStyle: 'classic',
    },
    blogSpec: {
      wordCount: [1000, 1500],
      format: 'structured_sections',
      headingStyle: 'informative', // "Understanding X: What you need to know"
      ctaText: 'Learn more from our experts →',
    },
    socialSpec: {
      facebook: { format: 'post', maxLength: 300, style: 'warm_informative' },
      email: { format: 'newsletter', style: 'warm_personal' },
    },
  },
};

// ─── Persona Classification ──────────────────────────────────────────────────

/**
 * Determines the user's persona based on their profile data.
 * @param {Object} userProfile - User profile from Firestore
 * @param {number|string} userProfile.age - User's age or age range
 * @param {string} [userProfile.lifeStage] - Optional override: 'student' | 'professional' | 'parent' | 'retired'
 * @param {string} [userProfile.contentPreference] - Optional override: 'quick' | 'medium' | 'deep'
 * @returns {Object} Persona config object
 */
export function getPersonaForUser(userProfile) {
  if (!userProfile) return PERSONAS.millennial; // Default fallback

  const age = parseAge(userProfile.age || userProfile.ageRange);

  // Find matching persona by age
  let persona = Object.values(PERSONAS).find(p => 
    age >= p.ageRange[0] && age <= p.ageRange[1]
  );

  // Fallback to Millennial if no match
  if (!persona) persona = PERSONAS.millennial;

  // Apply user preference overrides
  if (userProfile.contentPreference) {
    persona = applyContentPreferenceOverride(persona, userProfile.contentPreference);
  }

  return persona;
}

/**
 * Generates the system instruction fragment for AI prompts.
 * This is injected into every Gemini API call.
 * @param {Object} persona - Persona config from getPersonaForUser
 * @param {Object} [userContext] - Additional context (moods, history, etc.)
 * @returns {string} System instruction fragment
 */
export function getPersonaPromptContext(persona, userContext = {}) {
  const ageHint = userContext.age 
    ? `The user is approximately ${userContext.age} years old.` 
    : `The user belongs to the ${persona.label} generation.`;

  return `
PERSONA CONTEXT:
${ageHint}
- Content Style: ${persona.contentStyle}
- Tone: ${persona.tone}
- Reading Level: ${persona.readingLevel}
- Maximum Content Length: ${persona.maxContentLength} words
- Emoji Usage: ${persona.emojiDensity}
- Preferred CTA Style: "${persona.ctaStyle}"
- Preferred Content Formats: ${persona.preferredFormats.join(', ')}

ADAPTATION RULES:
1. Adjust vocabulary, sentence length, and cultural references to match this generation.
2. Keep total word count under ${persona.maxContentLength} words.
3. Use emojis at "${persona.emojiDensity}" density (${
    persona.emojiDensity === 'high' ? '1 per sentence' :
    persona.emojiDensity === 'medium' ? '1 per 2-3 sentences' :
    persona.emojiDensity === 'low' ? '1 per paragraph max' :
    persona.emojiDensity === 'minimal' ? 'only for key emphasis' :
    'do not use emojis'
  }).
4. End with a CTA in the style of: "${persona.ctaStyle}"
`.trim();
}

/**
 * Returns the gamification configuration for a given persona.
 * @param {Object} persona - Persona config
 * @param {number} level - User's current level (0-4)
 * @returns {Object} { levelName, streakEmoji, rewardType, badgeStyle }
 */
export function getGamificationConfig(persona, level = 0) {
  const style = persona.gamificationStyle;
  return {
    levelName: style.levelNames[Math.min(level, style.levelNames.length - 1)],
    streakEmoji: style.streakEmoji,
    rewardType: style.rewardType,
    badgeStyle: style.badgeStyle,
    allLevelNames: style.levelNames,
  };
}

/**
 * Returns blog generation specifications for a persona.
 * @param {Object} persona - Persona config
 * @returns {Object} Blog spec with wordCount range, format, heading style, CTA
 */
export function getBlogSpec(persona) {
  return persona.blogSpec;
}

/**
 * Returns social media generation specifications for a persona and platform.
 * @param {Object} persona - Persona config
 * @param {string} platform - 'tiktok' | 'instagram' | 'twitter' | 'linkedin' | 'facebook' | 'email'
 * @returns {Object|null} Platform-specific spec or null if not applicable
 */
export function getSocialSpec(persona, platform) {
  return persona.socialSpec[platform] || null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseAge(ageInput) {
  if (typeof ageInput === 'number') return ageInput;
  if (typeof ageInput === 'string') {
    // Handle range strings like "25-34"
    const match = ageInput.match(/(\d+)/);
    if (match) return parseInt(match[1], 10);
    // Handle descriptive ranges
    const rangeMap = {
      '10-14': 12, '15-19': 17, '20-24': 22, '25-34': 30,
      '35-44': 40, '45-54': 50, '55-64': 58, '65+': 70,
      'under_15': 12, 'teen': 16, 'young_adult': 22,
      'adult': 35, 'senior': 65,
    };
    return rangeMap[ageInput.toLowerCase()] || 30; // Default to 30
  }
  return 30;
}

function applyContentPreferenceOverride(persona, preference) {
  // Return a new object with overrides, don't mutate original
  const overrides = {};
  
  switch (preference) {
    case 'quick':
      overrides.maxContentLength = Math.min(persona.maxContentLength, 400);
      overrides.preferredFormats = ['quiz', 'micro_challenge', 'listicle'];
      break;
    case 'deep':
      overrides.maxContentLength = Math.max(persona.maxContentLength, 1500);
      overrides.preferredFormats = ['long_blog', 'assessment', 'research'];
      break;
    case 'visual':
      overrides.preferredFormats = ['carousel', 'video', 'infographic'];
      break;
    default:
      break;
  }

  return { ...persona, ...overrides };
}
