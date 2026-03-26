/**
 * PMAction Persona-Aware Dashboard Wrapper
 * 
 * Provides persona context to the dashboard. Adapts the greeting, 
 * gamification labels, notification tone, and layout configuration
 * based on the user's generational persona.
 */

import { getPersonaForUser, getGamificationConfig } from '../lib/personalization/personaEngine';
import { getAdaptiveUIConfig, formatNotification } from '../lib/personalization/contentAdapter';

/**
 * Returns a fully personalized dashboard configuration.
 * Called once when the dashboard mounts and provides all persona-driven values.
 * 
 * @param {Object} userProfile - User profile from Firestore/context
 * @returns {Object} Full dashboard persona configuration
 */
export function getDashboardPersonaConfig(userProfile) {
    const persona = getPersonaForUser(userProfile);
    const uiConfig = getAdaptiveUIConfig(userProfile);
    const gamification = getGamificationConfig(persona, userProfile?.level || 0);

    return {
        persona,
        ui: uiConfig,
        gamification,

        // Persona-specific greeting tips (override the time-based ones)
        greetingOverrides: {
            gen_alpha: {
                morningTip: '🌟 New challenge unlocked! Ready to play?',
                afternoonTip: '⚡ Quick quiz break? Only takes 2 minutes!',
                eveningTip: '🎮 Check your daily score before winding down!',
                nightTip: '😴 Time to rest up. Tomorrow has new quests!',
            },
            gen_z: {
                morningTip: 'high focus window rn — tackle the hard thing first 💪',
                afternoonTip: 'energy dip? try a 5-min reset',
                eveningTip: 'wind down and reflect on your wins today',
                nightTip: 'put the phone down bestie, sleep is the move 💤',
            },
            millennial: {
                morningTip: 'High focus window. Tackle the big rock first.',
                afternoonTip: 'Energy dip? Try a 10-min reset or a walk.',
                eveningTip: 'Wind down and reflect on today\'s wins.',
                nightTip: 'Sleep is the best productivity tool. Rest well.',
            },
            gen_x: {
                morningTip: 'Peak cognitive hours. Prioritize your most important task.',
                afternoonTip: 'Consider a brief break to maintain focus through the afternoon.',
                eveningTip: 'Review today\'s progress and plan tomorrow.',
                nightTip: 'Adequate rest is essential for sustained performance.',
            },
            boomer_plus: {
                morningTip: 'Good morning! Today is a great day to take care of yourself.',
                afternoonTip: 'A good time for a short walk or some light reading.',
                eveningTip: 'Take a moment to reflect on what went well today.',
                nightTip: 'Rest well — you\'ve earned it.',
            },
        },

        /**
         * Gets the persona-specific greeting tip based on time of day.
         */
        getGreetingTip() {
            const hour = new Date().getHours();
            const tips = this.greetingOverrides[persona.id] || this.greetingOverrides.millennial;
            
            if (hour >= 5 && hour < 12) return tips.morningTip;
            if (hour >= 12 && hour < 17) return tips.afternoonTip;
            if (hour >= 17 && hour < 22) return tips.eveningTip;
            return tips.nightTip;
        },

        /**
         * Gets the persona-specific level label.
         */
        getLevelLabel(level) {
            const config = getGamificationConfig(persona, level);
            return config.levelName;
        },

        /**
         * Gets streak display with persona-appropriate emoji.
         */
        getStreakDisplay(streakCount) {
            return `${streakCount}${gamification.streakEmoji}`;
        },

        /**
         * Formats a notification for this persona.
         */
        notify(type, data = {}) {
            return formatNotification(type, persona, data);
        },

        /**
         * Gets the "no wins yet" empty state message.
         */
        getEmptyWinsMessage() {
            const messages = {
                gen_alpha: 'No wins yet! Go earn some! 🏆',
                gen_z: 'no wins logged yet — go get one 🔥',
                millennial: 'No wins yet today. You\'ve got this! ⚡',
                gen_x: 'No activities logged today. Start with a quick action.',
                boomer_plus: 'No activities recorded yet today. Take your time getting started.',
            };
            return messages[persona.id] || messages.millennial;
        },

        /**
         * Gets the CTA button text for the main action button.
         */
        getMainCTAText() {
            const ctas = {
                gen_alpha: '➕ Log a Win!',
                gen_z: '➕ Log',
                millennial: '➕ Log a Win',
                gen_x: '➕ Log Activity',
                boomer_plus: '➕ Record Activity',
            };
            return ctas[persona.id] || ctas.millennial;
        },

        /**
         * Whether to show confetti on win. Boomer+ and Gen X prefer subtle feedback.
         */
        shouldShowConfetti() {
            return uiConfig.gamification.showConfetti;
        },
    };
}
