import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../lib/context';

export default function DailyTrainingCard({ onComplete }) {
    const { dailyLogs, wins } = useApp(); // Used for context to AI
    const [training, setTraining] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const generateTraining = async () => {
        setIsLoading(true);
        try {
            // Provide lightweight context
            const recentWins = wins.slice(0, 3).map(w => w.label);
            const moods = wins.filter(w => w.label === 'Mood Check-in').slice(0, 3).map(w => w.content);

            const response = await fetch('/api/generate-daily-training', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    moods,
                    recentWins,
                    focusAreas: ['productivity', 'self-care'] // Default areas
                })
            });
            const data = await response.json();
            setTraining(data);
            setIsExpanded(true);
        } catch (error) {
            console.error("Failed to generate training", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden border border-indigo-500/30 mb-8"
        >
            {/* Glowing orb effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-[80px] -z-10 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 z-10 relative">
                <div>
                    <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300">
                        Daily Adaptive Training
                    </h2>
                    <p className="text-indigo-200 mt-2 text-sm md:text-base font-medium max-w-xl">
                        A hyper-personalized mini-course generated right now, based on your recent activity, mood, and current psychology.
                    </p>
                </div>

                {!training && !isLoading && (
                    <button
                        onClick={generateTraining}
                        className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-pink-500 to-fuchsia-600 rounded-full font-bold shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] transform hover:scale-105 transition-all text-sm tracking-wide"
                    >
                        ✨ Generate Today's Module
                    </button>
                )}
            </div>

            {isLoading && (
                <div className="h-40 flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-fuchsia-500 rounded-full animate-spin"></div>
                    <p className="text-fuchsia-200 font-medium animate-pulse">AI is reading your profile and generating...</p>
                </div>
            )}

            <AnimatePresence>
                {training && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 mt-4 relative z-10"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-fuchsia-500/20 text-fuchsia-300 px-3 py-1 rounded-full text-xs font-bold border border-fuchsia-500/30">
                                {training.format || 'Mission'}
                            </span>
                            <h3 className="text-2xl font-bold text-white">{training.title}</h3>
                        </div>

                        <p className="text-xl font-medium text-pink-200 mb-6 italic border-l-4 border-pink-500 pl-4">{training.hook}</p>

                        {isExpanded ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose prose-invert max-w-none prose-p:text-slate-300 prose-headings:text-white prose-li:text-slate-300">
                                <div dangerouslySetInnerHTML={{ __html: training.content.replace(/\n/g, '<br/>') }} />

                                <div className="mt-8 p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30">
                                    <h4 className="text-green-400 font-bold mb-2 flex items-center gap-2">
                                        <span>🎯</span> Action Step
                                    </h4>
                                    <p className="text-green-100 text-lg font-medium">{training.actionStep}</p>
                                </div>
                            </motion.div>
                        ) : (
                            <button
                                onClick={() => setIsExpanded(true)}
                                className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 font-medium transition-colors"
                            >
                                Read Full Module ⬇️
                            </button>
                        )}

                        {isExpanded && (
                            <div className="mt-8 flex justify-end gap-4">
                                <button onClick={() => setTraining(null)} className="px-4 py-2 rounded-full font-medium text-slate-400 hover:text-white transition-colors">
                                    Dismiss
                                </button>
                                <button
                                    onClick={() => {
                                        if (onComplete) onComplete(training);
                                        setTraining(null);
                                    }}
                                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] rounded-full font-bold text-white">
                                    ✅ Mark Completed
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
