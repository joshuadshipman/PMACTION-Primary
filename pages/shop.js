import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useApp } from '../lib/context';

const ShopPage = () => {
    const router = useRouter();
    const { userProfile } = useApp() || {};
    
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const res = await fetch('/api/shop/recommendations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userProfile })
                });
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data);
                }
            } catch (error) {
                console.error("Failed to load shop recommendations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [userProfile]);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Head>
                <title>Wellness Shop | PMAction</title>
            </Head>

            <nav className="max-w-7xl mx-auto mb-8">
                <button
                    onClick={() => router.back()}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
                >
                    &larr; Back
                </button>
            </nav>

            <div className="max-w-7xl mx-auto space-y-12 animate-fade-in">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900">Wellness Shop</h1>
                    <p className="text-gray-600 mt-2 text-lg max-w-2xl mx-auto">A curated selection of products to support your wellness journey. Purchases help support our mission.</p>
                </div>

                <div className="flex justify-center gap-3 flex-wrap">
                    {/* Categories removed for now as AI recommends specific items */}
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((p, idx) => (
                            <a key={idx} href={p.purchaseUrl} target="_blank" rel="noopener noreferrer" className="bg-white rounded-xl shadow-md overflow-hidden group block hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col">
                                <div className="p-8 pb-4 flex justify-center items-center bg-gray-50 border-b border-gray-100">
                                    <span className="text-6xl group-hover:scale-110 transition-transform duration-300">{p.icon || '🛍️'}</span>
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="text-xs text-brand-primary font-bold uppercase tracking-wide mb-1">{p.type}</div>
                                    <h3 className="font-bold text-lg mb-2 text-gray-800 group-hover:text-brand-primary transition-colors">{p.title}</h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">{p.description}</p>
                                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-50">
                                        <p className="text-xl font-bold text-gray-900">{p.estimatedPrice || 'Check Price'}</p>
                                        <span className="text-sm font-semibold text-blue-600 hover:underline">Buy Now &rarr;</span>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                )}

                <div className="bg-blue-50 border border-blue-100 p-8 rounded-2xl text-center">
                    <h3 className="text-2xl font-bold text-blue-900 mb-2">Want to feature your product?</h3>
                    <p className="text-blue-700 mb-6">We partner with ethical brands promoting mental wellness.</p>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition">Contact Partnership Team</button>
                </div>
            </div>
        </div>
    );
};

export default ShopPage;
