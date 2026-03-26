import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import SEOHead from '../components/SEOHead';
import PMASlotMachine from '../components/PMASlotMachine';

const Home = () => {
    const router = useRouter();
    const [showWinnerMessage, setShowWinnerMessage] = useState(false);
    const handleJackpotComplete = () => {
        setShowWinnerMessage(true);
    };

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-green-100 selection:text-green-900 overflow-x-hidden">
            <SEOHead 
                title="Personal Mental Action & Neurodiversity Hub" 
                keywords={["ADHD productivity", "Autism wellness", "Habit tracking", "Positive Mental Action", "AEO", "Mental Health AI"]}
            />

      {/* --- Navigation --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-teal-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
                P
              </div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">
                PMAction
              </span>
            </div>
            {/* Nav Links (Desktop) */}
            <div className="hidden md:flex items-center gap-8">
              <span className="text-sm font-medium text-gray-500 hover:text-green-600 cursor-pointer transition-colors">Features</span>
              <span className="text-sm font-medium text-gray-500 hover:text-green-600 cursor-pointer transition-colors">Methodology</span>
              <span className="text-sm font-medium text-gray-500 hover:text-green-600 cursor-pointer transition-colors">Community</span>
              <Link href="/auth/signin" className="text-sm font-bold text-gray-700 hover:text-green-600 transition-colors">
                Log In
              </Link>
              <Link
                href="/onboarding"
                className="px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-full hover:bg-gray-800 hover:shadow-lg transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <div className="relative pt-32 pb-16 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-teal-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[600px] h-[600px] bg-green-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

            {/* Text Content */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-wider text-green-700 uppercase bg-green-100/80 rounded-full border border-green-200">
                  Neurodiversity Friendly Design
                </span>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1] mb-6">
                  Master Your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-green-600">
                    Mental Momentum
                  </span>
                </h1>
                <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  The first positive mental action platform built for ADHD & Autistic minds.
                  Gamify your growth, track your moods, and build habits that stick.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    href="/onboarding"
                    className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-lg font-bold rounded-full shadow-xl shadow-green-200 hover:shadow-2xl hover:scale-105 transition-all duration-300"
                  >
                    Start Your Free Journey
                  </Link>
                  <button
                    onClick={() => router.push('/mission')}
                    className="px-8 py-4 bg-white text-gray-700 border border-gray-200 text-lg font-bold rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
                  >
                    Learn More
                  </button>
                </div>

                <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-400 font-medium">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200"></div>
                    ))}
                  </div>
                  <p>Trust by 1,000+ early adopters</p>
                </div>
              </motion.div>
            </div>

            {/* Interactive Widget (Slot Machine) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="relative"
            >
              {/* Decorative blob behind widget */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-tr from-purple-200/40 to-blue-200/40 rounded-full blur-2xl -z-10"></div>

              <div className="transform transition-transform hover:scale-[1.02] duration-500">
                <PMASlotMachine onJackpotComplete={handleJackpotComplete} />
              </div>

              {/* Float Cards */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -right-4 bg-white p-4 rounded-xl shadow-xl border border-gray-100 hidden md:block max-w-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xl">🌱</div>
                  <div>
                    <div className="text-xs text-gray-400 font-bold uppercase">Daily Streak</div>
                    <div className="text-gray-900 font-bold">7 Days of Growth!</div>
                  </div>
                </div>
              </motion.div>

            </motion.div>
          </div>
        </div>
      </div>

      {/* --- Features Grid --- */}
      <section id="features" className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
              Designed for <span className="text-emerald-600">How You Think</span>
            </h2>
            <p className="text-lg text-gray-500">
              Traditional tools don’t work for everyone. We built a system that adapts to your brain, not the other way around.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 text-2xl mb-6">
                🧠
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Neuro-Inclusive</h3>
              <p className="text-gray-500 leading-relaxed">
                Interfaces designed to minimize overwhelm and maximize focus. Visual cues, clear feedback, and gentle reminders.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 text-2xl mb-6">
                📊
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Mood & Energy Tracking</h3>
              <p className="text-gray-500 leading-relaxed">
                Connect the dots between your feelings, energy levels, and daily activities to find your optimal rhythm.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 text-2xl mb-6">
                🏆
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Gamified Growth</h3>
              <p className="text-gray-500 leading-relaxed">
                Turn self-care into a game. Earn XP, unlock achievements, and celebrate every small win along your journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-gray-400 text-sm">
            © {new Date().getFullYear()} PMAction. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-gray-600 text-sm">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-gray-600 text-sm">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-gray-600 text-sm">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;