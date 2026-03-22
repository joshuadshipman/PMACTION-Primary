import React, { useState, useEffect } from 'react';
import ChallengeDetailModal from './ChallengeDetailModal';
import BlogPostModal from './BlogPostModal';
import { useRouter } from 'next/router';
import { useApp } from '../lib/context';
import { BLOG_POSTS } from '../lib/blogData';
import { CHALLENGES } from '../lib/challengesData';

export default function ContentRecommendationCard() {
    const router = useRouter();
    const { startChallenge, wins, userProfile } = useApp();
    const [article, setArticle] = useState(BLOG_POSTS[0]);
    const [challenge, setChallenge] = useState(null);
    const [recommendationReason, setRecommendationReason] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
    const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);

    useEffect(() => {
        const fetchRecommendations = async () => {
            setIsLoading(true);
            try {
                // Approximate mood history from wins
                const recentMoods = wins.filter(w => w.label === 'Mood Check-in').slice(0, 5);
                const interests = userProfile?.interests || ['General Wellness'];

                // Call the API Route instead of direct service
                const response = await fetch('/api/generate-recommendations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        moods: recentMoods,
                        recentWins: wins.slice(0, 3),
                        interests
                    })
                });

                if (!response.ok) throw new Error('API Failed');

                const recs = await response.json();

                if (recs) {
                    // Match Challenge ID
                    const recommendedChallenge = CHALLENGES.find(c => c.id === recs.challengeId) || CHALLENGES[0];
                    setChallenge(recommendedChallenge);

                    // Create dynamic article object
                    const dynamicArticle = {
                        id: 'ai-rec-' + Date.now(),
                        title: recs.articleTopic,
                        content: "This is a personalized recommendation. Click to read the full guide...",
                        author: 'AI Coach',
                        readTime: '3 min',
                        category: 'Personalized',
                        isGenerated: true // Flag to trigger generation on click
                    };
                    setArticle(dynamicArticle);
                    setRecommendationReason({ article: recs.articleReason, challenge: recs.challengeReason });
                } else {
                    throw new Error("No specific recommendations");
                }

            } catch (err) {
                console.error("Recommendation Error:", err);
                // Fallback: Random
                if (BLOG_POSTS.length > 0) setArticle(BLOG_POSTS[Math.floor(Math.random() * BLOG_POSTS.length)]);
                if (CHALLENGES.length > 0) setChallenge(CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecommendations();
    }, [wins, userProfile]);

    const handleStartChallenge = (challengeId) => {
        startChallenge(challengeId);
        setIsChallengeModalOpen(false);
        // Refresh or notify user
        router.push('/dashboard');
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Discover & Grow</h2>
                <a href="/advocacy" className="text-xs font-bold text-blue-600 hover:underline">View All</a>
            </div>

            <div className="space-y-4">
                {/* Featured Article */}
                <div
                    onClick={() => setIsArticleModalOpen(true)}
                    className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100"
                >
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-lg text-xl">
                        📰
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                                {article.isGenerated ? '✨ Recommended' : 'Read'}
                            </span>
                            <span className="text-xs text-gray-400">• {article.readTime}</span>
                        </div>
                        <h3 className="font-bold text-gray-800 leading-tight mb-1">{article.title}</h3>
                        <p className="text-sm text-gray-500">
                            {recommendationReason?.article || `Explore ${article.category} insights.`}
                        </p>
                    </div>
                    {article.isGenerated && (
                        <div className="absolute top-2 right-2 text-xs text-blue-500">
                            ✨
                        </div>
                    )}
                </div>

                <div className="h-px bg-gray-100 w-full"></div>

                {/* Featured Challenge */}
                {challenge && (
                    <div
                        onClick={() => setIsChallengeModalOpen(true)}
                        className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100"
                    >
                        <div className="bg-purple-100 text-purple-600 p-3 rounded-lg text-xl">
                            🎯
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                                    {recommendationReason ? '✨ Suggested' : 'Challenge'}
                                </span>
                                <span className="text-xs text-gray-400">• {challenge.duration} Days</span>
                            </div>
                            <h3 className="font-bold text-gray-800 leading-tight mb-1">{challenge.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-1">
                                {recommendationReason?.challenge || challenge.description}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {isArticleModalOpen && article && (
                <BlogPostModal post={article} onClose={() => setIsArticleModalOpen(false)} />
            )}

            {isChallengeModalOpen && challenge && (
                <ChallengeDetailModal
                    isOpen={isChallengeModalOpen}
                    onClose={() => setIsChallengeModalOpen(false)}
                    challenge={challenge}
                    onStart={handleStartChallenge}
                />
            )}
        </div>
    );
}
