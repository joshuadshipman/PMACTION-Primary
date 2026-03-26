/**
 * PMAction Trending Now Widget
 * 
 * Fetches real-time trends from the /api/trends/daily endpoint and displays
 * them in a persona-aware card on the dashboard. Adapts content suggestions
 * based on the user's generational persona.
 */

import { useState, useEffect} from 'react';
import { motion } from 'framer-motion';
import { getPersonaForUser } from '../lib/personalization/personaEngine';

const TrendingNowWidget = ({ userProfile }) => {
    const [trends, setTrends] = useState([]);
    const [hashtags, setHashtags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const persona = getPersonaForUser(userProfile);

    useEffect(() => {
        const fetchTrends = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/trends/daily?persona=${persona.id}&limit=4`);
                if (!res.ok) throw new Error('Failed to fetch trends');
                const json = await res.json();
                setTrends(json.data?.trends || []);
                setHashtags(json.data?.hashtags?.slice(0, 6) || []);
            } catch (err) {
                setError(err.message);
                console.error('TrendingNowWidget error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTrends();
    }, [persona.id]);

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error || trends.length === 0) {
        return null; // Graceful hide if no data
    }

    const velocityBadge = (velocity) => {
        const styles = {
            rising: 'bg-green-100 text-green-700',
            stable: 'bg-blue-100 text-blue-700',
            peaking: 'bg-amber-100 text-amber-700',
            declining: 'bg-gray-100 text-gray-500',
        };
        const icons = { rising: '📈', stable: '→', peaking: '🔥', declining: '📉' };
        return (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${styles[velocity] || styles.stable}`}>
                {icons[velocity] || '→'} {velocity}
            </span>
        );
    };

    const contentIcon = (action) => {
        const icons = { quiz: '🧪', blog: '📝', challenge: '🏆', social: '📣', checklist: '✅' };
        return icons[action] || '📄';
    };

    return (
        <motion.div
            className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl shadow-sm border border-indigo-100 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    🔥 Trending for {persona.label}
                </h2>
                <span className="text-xs text-gray-400 font-medium">Updated today</span>
            </div>

            <div className="space-y-3 mb-4">
                {trends.map((trend, idx) => (
                    <motion.div
                        key={idx}
                        className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                        whileHover={{ scale: 1.01 }}
                    >
                        <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center font-bold text-indigo-600 text-sm">
                            {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-800 text-sm truncate">{trend.topic}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {velocityBadge(trend.velocity)}
                                <span className="text-xs text-gray-400">Score: {trend.score}</span>
                                <div className="flex gap-1">
                                    {(trend.contentActions || []).slice(0, 3).map((action, i) => (
                                        <span key={i} title={action} className="text-sm">
                                            {contentIcon(action)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Hashtag Cloud */}
            {hashtags.length > 0 && (
                <div className="border-t border-indigo-100 pt-3">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Trending Hashtags</p>
                    <div className="flex flex-wrap gap-2">
                        {hashtags.map((h, i) => (
                            <span
                                key={i}
                                className="text-xs font-medium px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100"
                            >
                                {h.tag || `#${h}`}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default TrendingNowWidget;
