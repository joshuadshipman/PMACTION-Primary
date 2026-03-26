/**
 * PMAction Content Adapter
 * 
 * Wraps and transforms content before display based on the user's persona.
 * Adjusts reading level, content length, emoji density, CTA style, and formatting.
 */

import { getPersonaForUser, PERSONAS } from './personaEngine';

// ─── Content Adaptation ──────────────────────────────────────────────────────

/**
 * Adapts a piece of content text to match a user's persona.
 * Used for server-side pre-processing of AI-generated content.
 * 
 * @param {string} content - Raw content text (markdown)
 * @param {Object} persona - Persona config from personaEngine
 * @returns {string} Adapted content
 */
export function adaptContent(content, persona) {
  if (!content || !persona) return content;

  let adapted = content;

  // 1. Truncate to max length if needed
  adapted = enforceWordLimit(adapted, persona.maxContentLength);

  // 2. Adjust emoji density
  adapted = adjustEmojiDensity(adapted, persona.emojiDensity);

  // 3. Ensure CTA matches persona style
  adapted = ensurePersonaCTA(adapted, persona);

  return adapted;
}

/**
 * Generates persona-specific UI configuration for React components.
 * Used by dashboard, challenges, and profile pages.
 * 
 * @param {Object} userProfile - User profile from Firestore
 * @returns {Object} UI configuration
 */
export function getAdaptiveUIConfig(userProfile) {
  const persona = getPersonaForUser(userProfile);

  return {
    persona: persona.id,
    label: persona.label,

    // Typography adjustments
    typography: {
      baseFontSize: persona.id === 'boomer_plus' ? '18px' : 
                    persona.id === 'gen_alpha' ? '15px' : '16px',
      headingScale: persona.id === 'boomer_plus' ? 1.4 : 1.25,
      lineHeight: persona.id === 'boomer_plus' ? 1.8 : 1.6,
    },

    // Card and layout preferences
    layout: {
      maxCardsPerRow: persona.id === 'boomer_plus' ? 2 : 
                      persona.id === 'gen_alpha' ? 2 : 3,
      showPrintButton: ['gen_x', 'boomer_plus'].includes(persona.id),
      compactMode: ['gen_z', 'gen_alpha'].includes(persona.id),
      animationLevel: persona.id === 'gen_alpha' ? 'high' :
                      persona.id === 'gen_z' ? 'medium' :
                      persona.id === 'boomer_plus' ? 'low' : 'medium',
    },

    // Content display preferences
    content: {
      showReadingTime: true,
      maxPreviewLength: persona.maxContentLength > 1000 ? 200 : 120,
      showDifficultyBadge: true,
      defaultContentFormat: persona.preferredFormats[0],
    },

    // Gamification display
    gamification: {
      showStreakAnimation: persona.id !== 'boomer_plus',
      showConfetti: ['gen_alpha', 'gen_z'].includes(persona.id),
      showProgressBar: true,
      celebrationStyle: persona.gamificationStyle.rewardType,
    },

    // Notification style
    notifications: {
      tone: persona.tone.split(',')[0].trim().toLowerCase(),
      useEmoji: persona.emojiDensity !== 'none',
      pushFrequency: persona.id === 'gen_z' ? 'high' : 
                     persona.id === 'boomer_plus' ? 'low' : 'medium',
    },
  };
}

/**
 * Formats a notification message based on persona.
 * Ensures positive reinforcement style per Neurodiversity Persona Architect skill.
 * 
 * @param {string} type - 'streak_reminder' | 'challenge_complete' | 'new_content' | 'mood_checkin'
 * @param {Object} persona - Persona config
 * @param {Object} [data] - Dynamic data (streak count, challenge name, etc.)
 * @returns {string} Formatted notification message
 */
export function formatNotification(type, persona, data = {}) {
  const messages = {
    streak_reminder: {
      gen_alpha: `Hey! 🎮 Your ${data.streak || 0}-day streak is waiting! Don't let it slip!`,
      gen_z: `your ${data.streak || 0}-day streak is on fire 🔥 keep it going`,
      millennial: `You've built a ${data.streak || 0}-day streak — let's keep the momentum going! ⚡`,
      gen_x: `Your ${data.streak || 0}-day consistency streak is active. Complete today's action to maintain it.`,
      boomer_plus: `Good news — you've completed ${data.streak || 0} days in a row. Today's activity is ready for you.`,
    },
    challenge_complete: {
      gen_alpha: `YOU DID IT!! 🏆🎉 Challenge complete! You're a LEGEND!`,
      gen_z: `challenge completed 🏆 you're literally built different`,
      millennial: `Challenge complete! 🎯 You showed up every day — that's what growth looks like.`,
      gen_x: `Challenge completed successfully. Review your progress summary below.`,
      boomer_plus: `Congratulations! You have successfully completed the challenge. Well done.`,
    },
    new_content: {
      gen_alpha: `New quiz alert! 🧠✨ Come check it out!`,
      gen_z: `new content just dropped 👀 check it out`,
      millennial: `Fresh content based on this week's wellness trends — curated for you.`,
      gen_x: `New resource available: "${data.title || 'Latest Article'}". Estimated reading time: ${data.readTime || '5'} minutes.`,
      boomer_plus: `A new article is available for you: "${data.title || 'Latest Article'}". We think you'll find it helpful.`,
    },
    mood_checkin: {
      gen_alpha: `How are you feeling right now? 😊😐😢 Quick check-in!`,
      gen_z: `quick vibe check — how's your energy rn?`,
      millennial: `Time for a quick check-in. How are you feeling today?`,
      gen_x: `Daily check-in: How would you rate your current state?`,
      boomer_plus: `We'd like to check in with you. How are you feeling today?`,
    },
  };

  const typeMessages = messages[type];
  if (!typeMessages) return data.fallback || 'Time to check in!';

  return typeMessages[persona.id] || typeMessages.millennial;
}

/**
 * Maps a generic content recommendation to persona-specific display.
 * 
 * @param {Object} recommendation - Raw AI recommendation
 * @param {Object} persona - Persona config
 * @returns {Object} Adapted recommendation with persona-specific fields
 */
export function adaptRecommendation(recommendation, persona) {
  return {
    ...recommendation,
    displayFormat: persona.preferredFormats[0],
    ctaText: persona.ctaStyle,
    estimatedTime: getEstimatedTime(recommendation, persona),
    displayPriority: calculateDisplayPriority(recommendation, persona),
  };
}

// ─── Internal Helpers ────────────────────────────────────────────────────────

function enforceWordLimit(text, maxWords) {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  
  // Find the last complete sentence within the word limit
  const truncated = words.slice(0, maxWords).join(' ');
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?')
  );
  
  if (lastSentenceEnd > truncated.length * 0.5) {
    return truncated.slice(0, lastSentenceEnd + 1);
  }
  return truncated + '...';
}

function adjustEmojiDensity(text, density) {
  if (density === 'none') {
    // Strip all emojis
    return text.replace(/[\u{1F600}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu, '').replace(/\s{2,}/g, ' ');
  }
  // For other densities — the AI prompt context handles generation-time emoji control
  // This function only strips for 'none'
  return text;
}

function ensurePersonaCTA(text, persona) {
  // If content doesn't end with any CTA-like phrase, append the persona's default
  const ctaPatterns = /(?:try|start|take|download|learn|check|explore|click|join)/i;
  const lastParagraph = text.split('\n').filter(l => l.trim()).pop() || '';
  
  if (!ctaPatterns.test(lastParagraph)) {
    return text.trim() + `\n\n**${persona.ctaStyle}**`;
  }
  return text;
}

function getEstimatedTime(recommendation, persona) {
  // Shorter attention-span personas get shorter estimated times
  const baseMins = recommendation.estimatedMinutes || 10;
  const multipliers = {
    gen_alpha: 0.5,
    gen_z: 0.7,
    millennial: 1.0,
    gen_x: 1.2,
    boomer_plus: 1.3,
  };
  return Math.round(baseMins * (multipliers[persona.id] || 1.0));
}

function calculateDisplayPriority(recommendation, persona) {
  // Boost priority if the recommendation format matches persona preferences
  const formatMatch = persona.preferredFormats.includes(recommendation.type) ? 20 : 0;
  const baseScore = recommendation.relevanceScore || 50;
  return Math.min(100, baseScore + formatMatch);
}
