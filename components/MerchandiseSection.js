import React, { useState, useEffect } from 'react';
import { generateMerchandiseRecommendations } from '../lib/services/geminiService';
import { ShoppingBag, ArrowRight, ExternalLink } from 'lucide-react';

export const MerchandiseSection = ({ userTraits, currentFocus }) => {
    const [recommendations, setRecommendations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const results = await generateMerchandiseRecommendations({
                    traits: userTraits || ["ADHD", "Executive Dysfunction"],
                    concerns: [currentFocus || "Productivity"],
                    recentActivities: ["Searching for focus tools"]
                });
                setRecommendations(results);
            } catch (error) {
                console.error("Failed to fetch merch recommendations:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecommendations();
    }, [userTraits, currentFocus]);

    if (isLoading) {
        return (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-pulse">
                <div className="h-6 w-1/3 bg-gray-200 rounded mb-4" />
                <div className="space-y-3">
                    <div className="h-20 bg-gray-100 rounded-xl" />
                    <div className="h-20 bg-gray-100 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-indigo-500" /> 
                    Curated for your Mind
                </h2>
                <button className="text-xs font-bold text-indigo-500 hover:text-indigo-600 transition-colors">View All Store</button>
            </div>
            
            <div className="space-y-4">
                {recommendations.length > 0 ? recommendations.map((item, idx) => (
                    <div 
                        key={idx} 
                        className={`group p-4 rounded-2xl border transition-all hover:shadow-md ${item.type === 'Branded' ? 'bg-indigo-50/50 border-indigo-100' : 'bg-white border-gray-100'}`}
                    >
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl border border-gray-50 flex-shrink-0">
                                {item.icon || '📦'}
                            </div>
                            <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-gray-800 text-sm leading-tight group-hover:text-indigo-600 transition-colors">
                                        {item.title}
                                    </h3>
                                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                                        {item.type}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                                    {item.description}
                                </p>
                                <div className="flex justify-between items-center mt-3">
                                    <span className="text-sm font-black text-gray-900">{item.estimatedPrice}</span>
                                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-full text-[11px] font-bold hover:bg-indigo-700 transition-all transform hover:scale-105">
                                        {item.type === 'Affiliate' ? (
                                            <>Get it on Amazon <ExternalLink className="w-3 h-3" /></>
                                        ) : (
                                            <>Add to Cart <ArrowRight className="w-3 h-3" /></>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )) : (
                    <p className="text-center py-4 text-xs text-gray-400 italic">Finding the best tools for you...</p>
                )}
            </div>
            
            <p className="text-[10px] text-gray-400 mt-6 text-center italic">
                Support PMAction by choosing tools curated by our AI based on your needs.
            </p>
        </div>
    );
};

export default MerchandiseSection;
