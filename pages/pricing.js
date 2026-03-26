import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useApp } from '../lib/context';
import { getPersonaForUser } from '../lib/personalization/personaEngine';

export default function PricingPage() {
    const router = useRouter();
    const { user, userProfile } = useApp() || {};

    const handleCheckout = async (priceId) => {
        if (!user) {
            router.push('/login?redirect=/pricing');
            return;
        }

        const persona = getPersonaForUser(userProfile);

        try {
            const response = await fetch('/api/payments/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    priceId,
                    userId: user.uid,
                    email: user.email,
                    personaId: persona?.id || 'universal'
                }),
            });
            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error("No checkout URL returned:", data);
            }
        } catch (error) {
            console.error('Error initiating checkout:', error);
        }
    };

    const plans = [
        {
            name: "Core Free",
            price: "$0",
            duration: "forever",
            description: "The essentials to start your positive mental action journey.",
            features: [
                "Daily Mood & Habit Tracking",
                "Basic Gamification (XP & Badges)",
                "1 AI-Powered Module per Day",
                "Access to Community Forums"
            ],
            buttonText: "Current Plan",
            buttonStyle: "bg-gray-200 text-gray-700 cursor-default",
            action: () => router.push('/dashboard'),
            popular: false
        },
        {
            name: "PMAction Premium",
            price: "$9.99",
            duration: "per month",
            description: "Hyper-personalized AI coaching and unlimited tools.",
            features: [
                "Unlimited AI Daily Training Modules",
                "Advanced AI Insights & Trends",
                "Full Audio & Video Content Library",
                "Priority Therapist Matching",
                "Exportable Progress Reports for Doctors"
            ],
            buttonText: "Upgrade to Premium",
            buttonStyle: "bg-gradient-to-r from-fuchsia-500 to-indigo-600 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all",
            action: () => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID || 'price_premium_placeholder'),
            popular: true
        }
    ];

    return (
        <div className="min-h-screen mesh-gradient-bg pb-20 md:pb-0 bg-slate-50 relative overflow-hidden">
            <Head>
                <title>Upgrade to Premium | PMAction</title>
            </Head>

            {/* Background Animations */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[120px] -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

            <nav className="glass-panel sticky top-0 z-50 mb-8 rounded-b-2xl mx-4 mt-2">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center cursor-pointer" onClick={() => router.push('/dashboard')}>
                            <span className="text-2xl mr-2">⬅️</span>
                            <h1 className="text-2xl font-bold text-gray-800">Back to Dashboard</h1>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <h1 className="text-5xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-fuchsia-600 drop-shadow-sm">
                        Unlock Your Full Potential
                    </h1>
                    <p className="text-xl text-gray-600 mb-16 max-w-2xl mx-auto font-medium">
                        Invest in your mental wealth. Get unlimited access to our Adaptive AI Content Engine to transform your daily routine.
                    </p>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {plans.map((plan, idx) => (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.2 }}
                                className={`relative bg-white rounded-3xl p-8 md:p-12 shadow-2xl border-2 ${plan.popular ? 'border-fuchsia-500 ring-4 ring-fuchsia-500/20' : 'border-gray-100'}`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg">
                                        Most Popular
                                    </div>
                                )}

                                <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                                <div className="text-5xl font-black text-gray-900 mb-2">
                                    {plan.price}
                                    <span className="text-lg text-gray-500 font-medium ml-2">/ {plan.duration}</span>
                                </div>
                                <p className="text-gray-500 mb-8 h-12">{plan.description}</p>

                                <ul className="space-y-4 mb-12 text-left">
                                    {plan.features.map((feature, fIdx) => (
                                        <li key={fIdx} className="flex items-start gap-3">
                                            <span className="text-green-500 text-xl font-bold">✓</span>
                                            <span className="text-gray-700 font-medium">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={plan.action}
                                    className={`w-full py-4 rounded-xl font-bold text-lg ${plan.buttonStyle}`}
                                >
                                    {plan.buttonText}
                                </button>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-20">
                        <p className="text-gray-500">Need a plan for your organization or clinic? <a href="#" className="text-indigo-600 font-bold hover:underline">Contact Sales</a></p>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
