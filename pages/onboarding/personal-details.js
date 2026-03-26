// pages/onboarding/personal-details.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useOnboarding } from '../../context/OnboardingContext';

const PersonalDetailsPage = () => {
    const router = useRouter();
    const { data, update } = useOnboarding();

    const [displayName, setDisplayName] = useState(data.displayName || '');
    const [ageGroup, setAgeGroup] = useState(data.ageGroup || '');
    const [location, setLocation] = useState(data.location || '');
    const [gender, setGender] = useState(data.gender || '');
    const [lifeStage, setLifeStage] = useState(data.lifeStage || '');
    const [contentPreference, setContentPreference] = useState(data.contentPreference || '');
    const [relationshipStatus, setRelationshipStatus] = useState(data.relationshipStatus || '');
    const [hasChildren, setHasChildren] = useState(data.hasChildren || '');
    const [weather, setWeather] = useState(null);

    useEffect(() => {
        // Placeholder for weather fetching logic
        const fetchWeather = async () => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Mock data - can be randomized or static for now
            setWeather({
                condition: 'clear', // 'rain', 'clear', 'cloudy'
                heatIndex: 75, // degrees Fahrenheit
                temp: 72
            });
        };
        fetchWeather();
    }, []);

    // Show relationship fields only when relevant goals are selected
    const showRelationshipFields = data.goals?.some(goal =>
        goal.toLowerCase().includes('partner') ||
        goal.toLowerCase().includes('friend') ||
        goal.toLowerCase().includes('mental health')
    );

    const handleContinue = () => {
        const updateData = { displayName, ageGroup, location, gender, lifeStage, contentPreference };
        if (showRelationshipFields) {
            updateData.relationshipStatus = relationshipStatus;
            updateData.hasChildren = hasChildren;
        }
        update(updateData);
        router.push('/onboarding/setup');
    };

    const isValid = displayName.trim() !== '' && ageGroup !== '';

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-teal-100 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <Head>
                <title>Personal Details | PMAction</title>
                <meta name="description" content="Tell us about yourself" />
            </Head>

            {/* Animated Background Blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30"
                    animate={{ x: [0, 100, 0], y: [0, -100, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ top: '10%', left: '10%' }}
                />
                <motion.div
                    className="absolute w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-30"
                    animate={{ x: [0, -100, 0], y: [0, 100, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ top: '60%', right: '10%' }}
                />
                <motion.div
                    className="absolute w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30"
                    animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ bottom: '10%', left: '50%' }}
                />
            </div>

            <div className="w-full max-w-6xl space-y-8 relative z-10">
                {/* Progress Steps */}
                <div className="flex justify-center space-x-4 mb-8">
                    {[1, 2, 3, 4].map(step => (
                        <motion.div
                            key={step}
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step === 2
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl scale-125'
                                : step < 2
                                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg'
                                    : 'bg-white text-gray-400 border-2 border-gray-300'}`}
                            whileHover={{ scale: 1.1 }}
                        >
                            {step}
                        </motion.div>
                    ))}
                </div>

                <div className="text-center mb-12">
                    <motion.h1
                        className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-teal-600 bg-clip-text text-transparent mb-4"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        Tell Us About Yourself
                    </motion.h1>
                    <motion.p
                        className="text-xl text-gray-700 max-w-2xl mx-auto font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        Help us personalize your experience with a few quick details ✨
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Form Section */}
                    <motion.div
                        className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-10 border border-purple-100"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <form onSubmit={e => { e.preventDefault(); handleContinue(); }} className="space-y-6">
                            {/* Display Name */}
                            <div>
                                <label htmlFor="displayName" className="block text-sm font-bold text-gray-800 mb-2">
                                    What should we call you? <span className="text-pink-500">*</span>
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-purple-500 group-focus-within:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        id="displayName"
                                        value={displayName}
                                        onChange={e => setDisplayName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all text-gray-900 font-medium bg-white"
                                        placeholder="Enter your preferred name"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Age Group */}
                            <div>
                                <label htmlFor="ageGroup" className="block text-sm font-bold text-gray-800 mb-2">
                                    Age Group <span className="text-pink-500">*</span>
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                        <svg className="w-5 h-5 text-purple-500 group-focus-within:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <select
                                        id="ageGroup"
                                        value={ageGroup}
                                        onChange={e => setAgeGroup(e.target.value)}
                                        className="w-full pl-12 pr-10 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all text-gray-900 font-medium bg-white appearance-none cursor-pointer"
                                        required
                                    >
                                        <option value="">Select your age group</option>
                                        <option value="10-14">Pre-Teen (10-14)</option>
                                        <option value="15-19">Teen (15-19)</option>
                                        <option value="20-28">Young Adult (20-28)</option>
                                        <option value="29-44">Adult (29-44)</option>
                                        <option value="45-60">Midlife (45-60)</option>
                                        <option value="60+">Senior (60+)</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <label htmlFor="location" className="block text-sm font-bold text-gray-800 mb-2">
                                    City or Zip Code
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-purple-500 group-focus-within:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l-5 5m0-5a5 5 0 1110 0 5 5 0 01-10 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        id="location"
                                        value={location}
                                        onChange={e => setLocation(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all text-gray-900 font-medium bg-white"
                                        placeholder="e.g., Chicago or 60601"
                                    />
                                </div>
                            </div>

                            {/* Gender */}
                            <div>
                                <label htmlFor="gender" className="block text-sm font-bold text-gray-800 mb-2">
                                    Gender (optional)
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-purple-500 group-focus-within:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <select
                                        id="gender"
                                        value={gender}
                                        onChange={e => setGender(e.target.value)}
                                        className="w-full pl-12 pr-10 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all text-gray-900 font-medium bg-white appearance-none cursor-pointer"
                                    >
                                        <option value="">Select your gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="non-binary">Non-Binary</option>
                                        <option value="prefer-not">Prefer not to say</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Life Stage */}
                            <div>
                                <label htmlFor="lifeStage" className="block text-sm font-bold text-gray-800 mb-2">
                                    Life Stage
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                        <svg className="w-5 h-5 text-purple-500 group-focus-within:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <select
                                        id="lifeStage"
                                        value={lifeStage}
                                        onChange={e => setLifeStage(e.target.value)}
                                        className="w-full pl-12 pr-10 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all text-gray-900 font-medium bg-white appearance-none cursor-pointer"
                                    >
                                        <option value="">Select your life stage</option>
                                        <option value="student">Student</option>
                                        <option value="early-career">Early Career</option>
                                        <option value="professional">Working Professional</option>
                                        <option value="parent">Parent / Caregiver</option>
                                        <option value="career-change">Career Changer</option>
                                        <option value="retired">Retired / Semi-Retired</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Content Preference */}
                            <div>
                                <label htmlFor="contentPreference" className="block text-sm font-bold text-gray-800 mb-2">
                                    How do you like to learn? ✨
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                        <svg className="w-5 h-5 text-purple-500 group-focus-within:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <select
                                        id="contentPreference"
                                        value={contentPreference}
                                        onChange={e => setContentPreference(e.target.value)}
                                        className="w-full pl-12 pr-10 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all text-gray-900 font-medium bg-white appearance-none cursor-pointer"
                                    >
                                        <option value="">Select your preference</option>
                                        <option value="quick">Quick Tips & Quizzes (2-3 min)</option>
                                        <option value="medium">Articles & Challenges (5-10 min)</option>
                                        <option value="deep">Deep Reads & Research (15+ min)</option>
                                        <option value="visual">Visual / Video Content</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Conditional Relationship Fields */}
                            {showRelationshipFields && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6 pt-4 border-t-2 border-purple-100"
                                >
                                    {/* Relationship Status */}
                                    <div>
                                        <label htmlFor="relationshipStatus" className="block text-sm font-bold text-gray-800 mb-2">
                                            Relationship Status
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                                <svg className="w-5 h-5 text-purple-500 group-focus-within:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </div>
                                            <select
                                                id="relationshipStatus"
                                                value={relationshipStatus}
                                                onChange={e => setRelationshipStatus(e.target.value)}
                                                className="w-full pl-12 pr-10 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all text-gray-900 font-medium bg-white appearance-none cursor-pointer"
                                            >
                                                <option value="">Prefer not to say</option>
                                                <option value="single">Single</option>
                                                <option value="relationship">In a relationship</option>
                                                <option value="married">Married</option>
                                                <option value="divorced">Divorced</option>
                                                <option value="widowed">Widowed</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Children */}
                                    <div>
                                        <label htmlFor="hasChildren" className="block text-sm font-bold text-gray-800 mb-2">
                                            Do you have children?
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                                <svg className="w-5 h-5 text-purple-500 group-focus-within:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                            </div>
                                            <select
                                                id="hasChildren"
                                                value={hasChildren}
                                                onChange={e => setHasChildren(e.target.value)}
                                                className="w-full pl-12 pr-10 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all text-gray-900 font-medium bg-white appearance-none cursor-pointer"
                                            >
                                                <option value="">Prefer not to say</option>
                                                <option value="no">No</option>
                                                <option value="yes">Yes</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex gap-4 pt-6">
                                <motion.button
                                    type="button"
                                    onClick={() => router.push('/onboarding/goals')}
                                    className="flex-1 px-6 py-4 border-2 border-purple-300 rounded-xl text-purple-700 font-bold hover:bg-purple-50 transition-all"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    ← Back
                                </motion.button>
                                <motion.button
                                    type="submit"
                                    disabled={!isValid}
                                    className={`flex-1 px-6 py-4 rounded-xl font-bold transition-all ${isValid
                                        ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-teal-600 text-white shadow-xl hover:shadow-2xl'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                                    whileHover={isValid ? { scale: 1.02 } : {}}
                                    whileTap={isValid ? { scale: 0.98 } : {}}
                                >
                                    Continue →
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>

                    {/* Infographic Section */}
                    <motion.div
                        className="hidden lg:flex flex-col items-center justify-start p-8"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <div className="relative w-full max-w-md">
                            <div className="bg-gradient-to-br from-purple-200 via-pink-200 to-teal-200 rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
                                <div className="space-y-4">
                                    {/* Privacy Bubble (Moved from header) */}
                                    <motion.div
                                        className="flex items-start gap-4 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md"
                                        whileHover={{ scale: 1.05, x: 10 }}
                                    >
                                        <div className="w-12 h-12 bg-gradient-to-r from-gray-700 to-gray-900 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg mt-1">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Your Data, Your Journey</p>
                                            <p className="text-sm text-gray-600">
                                                Private and secure. You decide what to share with your therapist.
                                            </p>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        className="flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md"
                                        whileHover={{ scale: 1.05, x: 10 }}
                                    >
                                        <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Tailored Recommendations</p>
                                            <p className="text-sm text-gray-600">Based on your age and goals</p>
                                        </div>
                                    </motion.div>
                                    <motion.div
                                        className="flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md"
                                        whileHover={{ scale: 1.05, x: 10 }}
                                    >
                                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Perfect Timing</p>
                                            <p className="text-sm text-gray-600">
                                                {weather ? (
                                                    weather.condition === 'rain' ? "It's raining, maybe a good time for indoor mindfulness." :
                                                        weather.heatIndex >= 90 ? "It's hot out! Stay cool and hydrated." :
                                                            "Great conditions for a walk or outdoor activity."
                                                ) : (
                                                    "Loading recommendations..."
                                                )}
                                            </p>
                                        </div>
                                    </motion.div>
                                    <motion.div
                                        className="flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md"
                                        whileHover={{ scale: 1.05, x: 10 }}
                                    >
                                        <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Relevant Content</p>
                                            <p className="text-sm text-gray-600">Challenges that match your needs</p>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default PersonalDetailsPage;
