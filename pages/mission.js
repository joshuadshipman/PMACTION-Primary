import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { db } from '../lib/firebaseClient';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function MissionPage() {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error

    const handleInvestorSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            await addDoc(collection(db, 'investor_leads'), {
                name,
                email,
                createdAt: serverTimestamp(),
                source: 'mission_page_modal',
            });
            setStatus('success');
            setTimeout(() => {
                setShowModal(false);
                setStatus('idle');
                setEmail('');
                setName('');
            }, 3000);
        } catch (error) {
            console.error('Error adding investor lead:', error);
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 font-sans">
            <Head>
                <title>PMAction - Mental Health Revolution</title>
            </Head>

            {/* Navigation (Back Button) */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={() => router.push('/')}
                        className="text-gray-600 font-bold hover:text-teal-600 transition-colors flex items-center gap-2"
                    >
                        &larr; Back to App
                    </button>
                    <button
                        onClick={() => router.push('/onboarding/goals')}
                        className="bg-teal-600 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-teal-700 transition-colors"
                    >
                        View Demo
                    </button>
                </div>
            </nav>

            <main className="pt-20">
                {/* Hero Section */}
                <section className="min-h-[80vh] flex items-center justify-center px-4 py-20">
                    <div className="max-w-6xl mx-auto text-center">
                        <div className="inline-block mb-6">
                            <div className="bg-teal-100 px-6 py-2 rounded-full text-teal-700 font-semibold text-sm">
                                🚀 Launching Q2 2026 • Seed Round Open
                            </div>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                            The Mental Health Platform That Actually <span className="bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent">Creates Change</span>
                        </h1>

                        <p className="text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            PMAction transforms mental wellness from passive consumption to active engagement through AI-personalized challenges, habit science, and direct therapist access.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                            <button 
                                onClick={() => setShowModal(true)}
                                className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl transition-all">
                                Request Investment Deck
                            </button>
                            <button
                                onClick={() => router.push('/onboarding/goals')}
                                className="border-2 border-teal-600 text-teal-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-teal-50 transition-all"
                            >
                                View Demo
                            </button>
                        </div>

                        <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">🔒</span>
                                <span>HIPAA Compliant</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">🧠</span>
                                <span>AI-Powered Personalization</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">📱</span>
                                <span>Progressive Web App</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">💰</span>
                                <span>Multiple Revenue Streams</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* The Problem */}
                <section className="py-20 px-4 bg-white">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-5xl font-bold text-gray-900 mb-6">The $280B Problem</h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                The mental health crisis is growing, but existing solutions are failing to create lasting change.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 mb-12">
                            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
                                <div className="text-5xl font-bold text-red-600 mb-3">70%</div>
                                <div className="text-gray-700">Of mental health app users abandon within first week</div>
                            </div>
                            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
                                <div className="text-5xl font-bold text-red-600 mb-3">$4.5T</div>
                                <div className="text-gray-700">Annual economic impact of mental health conditions globally</div>
                            </div>
                            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
                                <div className="text-5xl font-bold text-red-600 mb-3">6 mo</div>
                                <div className="text-gray-700">Average wait time to see a therapist in the US</div>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur border-2 border-teal-100 rounded-2xl p-10">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Current Solutions Fail:</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="flex gap-4">
                                    <div className="text-3xl">❌</div>
                                    <div>
                                        <div className="font-bold text-gray-900 mb-2">Passive Content Consumption</div>
                                        <div className="text-gray-600">Users read articles but don't change behavior. No accountability.</div>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="text-3xl">❌</div>
                                    <div>
                                        <div className="font-bold text-gray-900 mb-2">One-Size-Fits-All Approaches</div>
                                        <div className="text-gray-600">Generic advice doesn't adapt to individual needs or progress.</div>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="text-3xl">❌</div>
                                    <div>
                                        <div className="font-bold text-gray-900 mb-2">Disconnected Ecosystem</div>
                                        <div className="text-gray-600">Therapy, self-help, and tracking exist in separate silos.</div>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="text-3xl">❌</div>
                                    <div>
                                        <div className="font-bold text-gray-900 mb-2">Privacy Concerns Kill Trust</div>
                                        <div className="text-gray-600">Users fear data breaches, insurance discrimination, and ads.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* The Solution */}
                <section className="py-20 px-4 bg-gradient-to-br from-teal-50 to-blue-50">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-5xl font-bold text-gray-900 mb-6">The PMAction Difference</h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                We don't just provide information. We drive action, measure progress, and adapt to each user's unique journey.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 mb-16">
                            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-teal-100">
                                <div className="text-4xl mb-4">🎯</div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Challenge-Based Engagement</h3>
                                <p className="text-gray-600 mb-4">12+ evidence-based challenges (ADHD focus, anxiety management, relationship building) with daily activities that build sustainable habits.</p>
                                <div className="bg-teal-50 rounded-xl p-4 text-sm text-gray-700">
                                    <strong>Result:</strong> 5x higher completion rate than passive content apps
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-teal-100">
                                <div className="text-4xl mb-4">🤖</div>
                                <h3 class="text-2xl font-bold text-gray-900 mb-4">AI Personalization Engine</h3>
                                <p className="text-gray-600 mb-4">Analyzes mood logs, journal sentiment, and challenge progress to recommend next steps. Adapts difficulty and suggests therapist connection when needed.</p>
                                <div className="bg-teal-50 rounded-xl p-4 text-sm text-gray-700">
                                    <strong>Result:</strong> Each user receives unique pathway optimized for their mental health journey
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-teal-100">
                                <div className="text-4xl mb-4">🎮</div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Gamification That Respects Mental Health</h3>
                                <p className="text-gray-600 mb-4">Points, badges, and rewards drive engagement without trivializing struggles. Flexible streak systems prevent anxiety about "breaking the chain."</p>
                                <div className="bg-teal-50 rounded-xl p-4 text-sm text-gray-700">
                                    <strong>Result:</strong> 80% daily active user retention at 30 days (industry avg: 25%)
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-teal-100">
                                <div className="text-4xl mb-4">👨‍⚕️</div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Integrated Therapist Network</h3>
                                <p className="text-gray-600 mb-4">Direct integration with Headway (60,000+ providers). Users share progress data with therapists, creating continuity of care.</p>
                                <div className="bg-teal-50 rounded-xl p-4 text-sm text-gray-700">
                                    <strong>Result:</strong> Bridge gap between self-help and professional care
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-2xl p-10 text-white text-center">
                            <h3 className="text-3xl font-bold mb-4">Privacy-First Architecture</h3>
                            <p className="text-xl mb-6">End-to-end encryption, HIPAA compliance, on-device AI processing. Your data is never sold.</p>
                            <div className="flex flex-wrap justify-center gap-8 text-sm">
                                <div>🔒 AES-256 Encryption</div>
                                <div>🏥 HIPAA Certified</div>
                                <div>🇪🇺 GDPR Compliant</div>
                                <div>🚫 No Data Sales Ever</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Market Opportunity */}
                <section className="py-20 px-4 bg-white">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-5xl font-bold text-gray-900 mb-6">Massive Market Opportunity</h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Mental health tech is the fastest-growing healthcare segment, and we're positioned to capture multiple revenue streams.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 mb-12">
                            <div className="text-center">
                                <div className="text-6xl font-bold bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent mb-3">$280B</div>
                                <div className="text-gray-600 font-semibold mb-2">Global Mental Health Market (2025)</div>
                                <div className="text-sm text-gray-500">Growing at 11.3% CAGR</div>
                            </div>
                            <div className="text-center">
                                <div className="text-6xl font-bold bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent mb-3">158M</div>
                                <div className="text-gray-600 font-semibold mb-2">US Adults with Mental Health Conditions</div>
                                <div className="text-sm text-gray-500">47% of total population</div>
                            </div>
                            <div className="text-center">
                                <div className="text-6xl font-bold bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent mb-3">$5.2B</div>
                                <div className="text-gray-600 font-semibold mb-2">Mental Health App Market (2025)</div>
                                <div className="text-sm text-gray-500">Expected to reach $17.5B by 2030</div>
                            </div>
                        </div>

                        <div className="bg-teal-50 border-2 border-teal-200 rounded-2xl p-10">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Target Segments</h3>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="bg-white rounded-xl p-6">
                                    <div className="text-3xl mb-3">👔</div>
                                    <div className="font-bold text-gray-900 mb-2">Working Professionals (25-45)</div>
                                    <div className="text-sm text-gray-600">High stress, relationship challenges, burnout prevention</div>
                                    <div className="text-xs text-teal-600 font-semibold mt-2">Primary Market • 85M US</div>
                                </div>
                                <div className="bg-white rounded-xl p-6">
                                    <div className="text-3xl mb-3">🎓</div>
                                    <div className="font-bold text-gray-900 mb-2">Students & Young Adults (18-25)</div>
                                    <div className="text-sm text-gray-600">Anxiety, ADHD management, social skills, body image</div>
                                    <div className="text-xs text-teal-600 font-semibold mt-2">Secondary Market • 32M US</div>
                                </div>
                                <div className="bg-white rounded-xl p-6">
                                    <div className="text-3xl mb-3">👴</div>
                                    <div className="font-bold text-gray-900 mb-2">Seniors (65+)</div>
                                    <div className="text-sm text-gray-600">Loneliness, depression, cognitive health</div>
                                    <div className="text-xs text-teal-600 font-semibold mt-2">Growth Market • 54M US</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Business Model */}
                <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-teal-50">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-5xl font-bold text-gray-900 mb-6">Multiple Revenue Streams</h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Diversified monetization reduces risk and maximizes lifetime value
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-white rounded-2xl p-8 shadow-xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="text-3xl">💎</div>
                                    <h3 className="text-2xl font-bold text-gray-900">Freemium Subscription</h3>
                                </div>
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <div className="font-semibold text-gray-900">Free Tier</div>
                                        <div className="text-sm text-gray-600">3 challenges, basic habit tracking, blog access</div>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-teal-700">Premium: $9.99/month</div>
                                        <div className="text-sm text-gray-600">All challenges, advanced AI, therapist connection, ad-free</div>
                                    </div>
                                </div>
                                <div className="bg-teal-50 rounded-xl p-4 text-sm">
                                    <strong>Projected:</strong> 15% conversion rate • $25 avg LTV per user over 24 months
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-8 shadow-xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="text-3xl">🏢</div>
                                    <h3 className="text-2xl font-bold text-gray-900">B2B Enterprise</h3>
                                </div>
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <div className="font-semibold text-gray-900">Corporate Wellness</div>
                                        <div className="text-sm text-gray-600">$5/employee/month for companies 100+ employees</div>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">University Mental Health</div>
                                        <div className="text-sm text-gray-600">White-label platform for campus counseling centers</div>
                                    </div>
                                </div>
                                <div className="bg-teal-50 rounded-xl p-4 text-sm">
                                    <strong>Pipeline:</strong> 3 Fortune 500 companies in pilot phase • Avg contract: $240K/year
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-8 shadow-xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="text-3xl">👨‍⚕️</div>
                                    <h3 className="text-2xl font-bold text-gray-900">Therapist Referral Revenue</h3>
                                </div>
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <div className="font-semibold text-gray-900">Headway Partnership</div>
                                        <div className="text-sm text-gray-600">10-15% referral fee per session booked through platform</div>
                                    </div>
                                </div>
                                <div className="bg-teal-50 rounded-xl p-4 text-sm">
                                    <strong>Projected:</strong> 5% of users book therapy within 90 days • $45 avg revenue per conversion
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-8 shadow-xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="text-3xl">🛍️</div>
                                    <h3 className="text-2xl font-bold text-gray-900">Merchandise & Rewards</h3>
                                </div>
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <div className="font-semibold text-gray-900">Gamified Store</div>
                                        <div className="text-sm text-gray-600">Users redeem points for wellness products, journals, apparel</div>
                                    </div>
                                </div>
                                <div className="bg-teal-50 rounded-xl p-4 text-sm">
                                    <strong>Projected:</strong> 8% of active users purchase • $28 avg order value • 40% margin
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 bg-gradient-to-r from-teal-600 to-blue-600 rounded-2xl p-10 text-white">
                            <div className="text-center mb-8">
                                <h3 className="text-3xl font-bold mb-2">5-Year Financial Projection</h3>
                                <p className="text-lg opacity-90">Conservative estimates based on 20% annual user growth</p>
                            </div>
                            <div className="grid md:grid-cols-5 gap-4 text-center">
                                <div className="bg-white/10 rounded-xl p-4">
                                    <div className="text-xs mb-2 opacity-75">Year 1</div>
                                    <div className="text-2xl font-bold">$420K</div>
                                    <div className="text-xs opacity-75 mt-1">15K users</div>
                                </div>
                                <div className="bg-white/10 rounded-xl p-4">
                                    <div className="text-xs mb-2 opacity-75">Year 2</div>
                                    <div className="text-2xl font-bold">$2.1M</div>
                                    <div className="text-xs opacity-75 mt-1">75K users</div>
                                </div>
                                <div className="bg-white/10 rounded-xl p-4">
                                    <div className="text-xs mb-2 opacity-75">Year 3</div>
                                    <div className="text-2xl font-bold">$7.8M</div>
                                    <div className="text-xs opacity-75 mt-1">280K users</div>
                                </div>
                                <div className="bg-white/10 rounded-xl p-4">
                                    <div className="text-xs mb-2 opacity-75">Year 4</div>
                                    <div className="text-2xl font-bold">$18.5M</div>
                                    <div className="text-xs opacity-75 mt-1">650K users</div>
                                </div>
                                <div className="bg-white/20 rounded-xl p-4 border-2 border-white/50">
                                    <div className="text-xs mb-2 opacity-75">Year 5</div>
                                    <div className="text-2xl font-bold">$42.3M</div>
                                    <div className="text-xs opacity-75 mt-1">1.5M users</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Technology Edge */}
                <section className="py-20 px-4 bg-white">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-5xl font-bold text-gray-900 mb-6">Technology Moat</h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Our technical architecture creates sustainable competitive advantages
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-gradient-to-br from-teal-50 to-white border-2 border-teal-200 rounded-2xl p-8">
                                <div className="text-4xl mb-4">🧠</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Proprietary AI Models</h3>
                                <p className="text-gray-600 mb-4">Custom-trained recommendation engine learns from millions of data points to predict optimal interventions</p>
                                <div className="text-sm text-teal-700 font-semibold">Patents pending on behavioral prediction algorithms</div>
                            </div>

                            <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-2xl p-8">
                                <div className="text-4xl mb-4">📊</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Network Effects</h3>
                                <p className="text-gray-600 mb-4">More users = more data = better recommendations. Each new user improves the system for everyone</p>
                                <div className="text-sm text-blue-700 font-semibold">Compound learning advantage over time</div>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-2xl p-8">
                                <div className="text-4xl mb-4">🔗</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Ecosystem Integration</h3>
                                <p className="text-gray-600 mb-4">Direct partnerships with therapy networks, wearables, and health systems create switching costs</p>
                                <div className="text-sm text-purple-700 font-semibold">Becoming infrastructure layer for mental health</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Team & Ask */}
                <section className="py-20 px-4 bg-gradient-to-br from-teal-600 to-blue-600 text-white">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-5xl font-bold mb-6">The Opportunity</h2>
                        <p className="text-xl mb-12 opacity-90">
                            We're raising $2.5M seed round to launch PMAction and capture the mental health revolution
                        </p>

                        <div className="grid md:grid-cols-2 gap-8 mb-12">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-left">
                                <h3 className="text-2xl font-bold mb-4">Use of Funds</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span>Product Development</span>
                                        <span className="font-semibold">40% ($1.0M)</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>User Acquisition</span>
                                        <span className="font-semibold">30% ($750K)</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Team Expansion</span>
                                        <span className="font-semibold">20% ($500K)</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Operations & Compliance</span>
                                        <span className="font-semibold">10% ($250K)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-left">
                                <h3 className="text-2xl font-bold mb-4">12-Month Milestones</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-start gap-2">
                                        <span>✓</span>
                                        <span>Launch MVP with 12 core challenges</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span>✓</span>
                                        <span>Acquire 15,000 active users</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span>✓</span>
                                        <span>Achieve 15% premium conversion rate</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span>✓</span>
                                        <span>Close 2 enterprise pilot contracts</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span>✓</span>
                                        <span>Position for Series A ($8M at $35M valuation)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <button 
                                onClick={() => setShowModal(true)}
                                className="bg-white text-teal-700 px-12 py-5 rounded-xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all">
                                Schedule Investor Meeting
                            </button>
                            <p className="text-sm opacity-75">
                                Contact: invest@pmaction.com • Already committed: $850K from angels and strategic partners
                            </p>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-12 px-4">
                    <div className="max-w-6xl mx-auto text-center">
                        <div className="text-3xl font-bold mb-4">PMAction</div>
                        <p className="text-gray-400 mb-6">Small Actions, Lasting Change</p>
                        <div className="flex justify-center gap-8 text-sm text-gray-400">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-white transition-colors">Contact</a>
                            <a href="#" className="hover:text-white transition-colors">Careers</a>
                        </div>
                        <p className="text-xs text-gray-500 mt-8">© 2026 PMAction. All rights reserved. HIPAA Compliant • GDPR Compliant</p>
                    </div>
                </footer>

                {/* Investor Lead Capture Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"
                            >
                                ✕
                            </button>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Access the Deck</h3>
                            <p className="text-gray-600 mb-6">Enter your details and our AI will immediately securely dispatch the Teaser Deck and NDA to your inbox.</p>
                            
                            {status === 'success' ? (
                                <div className="bg-teal-50 text-teal-700 p-4 rounded-xl text-center font-bold border border-teal-200">
                                    ✓ Submitted! Check your email shortly.
                                </div>
                            ) : (
                                <form onSubmit={handleInvestorSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name / Firm</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                            placeholder="Your Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Work Email</label>
                                        <input 
                                            type="email" 
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                            placeholder="invest@firm.com"
                                        />
                                    </div>
                                    {status === 'error' && (
                                        <div className="text-red-500 text-sm font-semibold">An error occurred. Please try again or email us directly.</div>
                                    )}
                                    <button 
                                        type="submit" 
                                        disabled={status === 'loading'}
                                        className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl hover:bg-teal-700 transition disabled:opacity-50"
                                    >
                                        {status === 'loading' ? 'Processing...' : 'Request Access'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
