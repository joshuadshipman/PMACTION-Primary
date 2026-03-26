import { useApp } from '../lib/context';
import { auth, db } from '../lib/firebaseClient';
import { signOut } from 'firebase/auth';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import AddWinModal from '../components/AddWinModal';
import LevelUpModal from '../components/LevelUpModal';
import RecommendationWidget from '../components/RecommendationWidget';
import SmartFocusCard from '../components/SmartFocusCard';
import SelfCareHub from '../components/SelfCareHub';
import ActiveChallengeCard from '../components/ActiveChallengeCard';
import CrisisModal from '../components/CrisisModal';
import DailyQuote from '../components/DailyQuote';
import SmartInsight from '../components/SmartInsight';
import TimeDurationCards from '../components/TimeDurationCards';
import ContentRecommendationCard from '../components/ContentRecommendationCard';
import DailyTrainingCard from '../components/DailyTrainingCard';
import { AICoachModal } from '../components/AICoachModal';
import MerchandiseSection from '../components/MerchandiseSection';
import SEOHead from '../components/SEOHead';
import TrendingNowWidget from '../components/TrendingNowWidget';
import { getDashboardPersonaConfig } from '../components/DashboardPersonaConfig';
// New Interactive Modals
import { GuidedExerciseModal } from '../components/GuidedExerciseModal';
import FocusTimerModal from '../components/FocusTimerModal';
import Confetti from 'react-confetti';
import VisualTimer from '../components/VisualTimer';
import ErrorBoundary from '../components/ErrorBoundary';
import FeedbackModal from '../components/FeedbackModal';
import { MessageSquarePlus } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

const DashboardPage = () => {
    const router = useRouter();
    const { user, stats, dailyLogs, wins, addWin, userProfile } = useApp();

    // Local State for fetched Data
    const [activeChallengeData, setActiveChallengeData] = useState(null); 
    const [isLoading, setIsLoading] = useState(true);

    const [isWinModalOpen, setIsWinModalOpen] = useState(false);
    const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState(false);
    const [isSelfCareHubOpen, setIsSelfCareHubOpen] = useState(false);
    const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
    const [isAICoachOpen, setIsAICoachOpen] = useState(false);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

    // Quick Action States
    const [isExerciseOpen, setIsExerciseOpen] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [isFocusTimerOpen, setIsFocusTimerOpen] = useState(false);
    const [isFocusMode, setIsFocusMode] = useState(false);

    const [newLevel, setNewLevel] = useState(1);
    const [modalTab, setModalTab] = useState(null);
    const [greeting, setGreeting] = useState({ text: 'Welcome back', tip: 'Ready to focus?' });
    const [showConfetti, setShowConfetti] = useState(false);

    // Persona Configuration (memoized)
    const personaConfig = useMemo(() => getDashboardPersonaConfig(userProfile), [userProfile]);

    // 1. Time-aware Smart Greeting Logic (persona-adapted)
    useEffect(() => {
        const updateGreeting = () => {
            const hour = new Date().getHours();
            const tip = personaConfig.getGreetingTip();
            if (hour >= 5 && hour < 12) {
                setGreeting({ text: 'Good Morning', tip });
            } else if (hour >= 12 && hour < 17) {
                setGreeting({ text: 'Good Afternoon', tip });
            } else if (hour >= 17 && hour < 22) {
                setGreeting({ text: 'Good Evening', tip });
            } else {
                setGreeting({ text: 'Late Night', tip });
            }
        };
        updateGreeting();
        const interval = setInterval(updateGreeting, 60000);
        return () => clearInterval(interval);
    }, [personaConfig]);

    // 2. Fetch User Data (Active Challenges from Firestore)
    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;

            try {
                setIsLoading(true);
                // Fetch Active Challenge from Firestore
                const userChallsRef = collection(db, 'user_challenges');
                const q = query(
                    userChallsRef,
                    where('userId', '==', user.uid),
                    where('status', '==', 'active'),
                    orderBy('startDate', 'desc'),
                    limit(1)
                );

                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const active = querySnapshot.docs[0].data();
                    setActiveChallengeData({
                        id: active.challengeId,
                        startDate: active.startDate?.toDate ? active.startDate.toDate().toISOString() : active.startDate
                    });
                }
            } catch (error) {
                console.error("Dashboard Fetch Error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/login');
    };

    const handleAddWin = async (winData) => {
        const result = await addWin(winData);
        if (result?.success) {
            if (result.leveledUp) {
                setNewLevel(result.newLevel);
                setIsLevelUpModalOpen(true);
            }
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
        }
        return result;
    };

    const handleTimeCardAction = (actionType, payload) => {
        if (actionType === 'one_min') {
            setSelectedExercise({
                name: payload.title,
                instruction: payload.desc
            });
            setIsExerciseOpen(true);
        } else if (actionType === 'journal') {
            setModalTab('journal');
            setIsWinModalOpen(true);
        } else if (actionType === 'focus') {
            setIsFocusTimerOpen(true);
        }
    };

    const handleFocusComplete = async (minutes) => {
        setIsFocusTimerOpen(false);
        await handleAddWin({
            type: 'activity',
            label: 'Deep Focus Session',
            icon: '🧘',
            xp: minutes * 2,
            benefit: `Completed ${minutes} minutes of deep focus.`
        });
    };

    const handleSelfCareLog = async (activity) => {
        const winData = {
            type: 'journal',
            win_type: 'self_care',
            content: `Completed self-care activity: ${activity.label}`,
            label: activity.label,
            icon: '🧘',
            xp: activity.xp
        };
        await handleAddWin(winData);
        setIsSelfCareHubOpen(false);
    };

    const handleTrainingComplete = async (trainingData) => {
        await handleAddWin({
            type: 'activity',
            label: 'Daily AI Training',
            icon: '🧠',
            xp: 50,
            benefit: `Completed: ${trainingData?.title || 'Personalized Module'}`
        });
    };

    // Calculate progress (Visual only if no real XP logic in frontend yet)
    // We used profile.total_points for raw XP. 
    // Let's assume 100 XP per level for visual bar if not defined logic.
    // Calculate progress
    const currentLevelNum = userProfile?.level || 1;
    const currentXp = userProfile?.xp || 0;
    const progressPercent = Math.min(100, (currentXp % 500) / 500 * 100); 

    return (
        <div className="min-h-screen mesh-gradient-bg pb-20 md:pb-0 bg-slate-50">
            <SEOHead 
                title="Your Dashboard" 
                description="Your personalized neuro-inclusive dashboard for mental wellness and daily progress."
                keywords={["ADHD Dashboard", "Neurodivergent Wellness", "PMA Tracking"]}
            />

            <AddWinModal
                isOpen={isWinModalOpen}
                onClose={() => {
                    setIsWinModalOpen(false);
                    setModalTab(null);
                }}
                onAddWin={handleAddWin}
                initialTab={modalTab}
            />

            <SelfCareHub
                isOpen={isSelfCareHubOpen}
                onClose={() => setIsSelfCareHubOpen(false)}
                onLogActivity={handleSelfCareLog}
            />

            <LevelUpModal
                isOpen={isLevelUpModalOpen}
                onClose={() => setIsLevelUpModalOpen(false)}
                level={newLevel}
                rewards={{ gold: 50 }}
            />

            {isCrisisModalOpen && <CrisisModal onClose={() => setIsCrisisModalOpen(false)} />}
            {isAICoachOpen && <AICoachModal onClose={() => setIsAICoachOpen(false)} />}
            {isExerciseOpen && <GuidedExerciseModal exerciseTitle={selectedExercise?.name} onClose={() => setIsExerciseOpen(false)} />}
            {isFocusTimerOpen && <FocusTimerModal onClose={() => setIsFocusTimerOpen(false)} onComplete={handleFocusComplete} />}
            {isFeedbackOpen && <FeedbackModal onClose={() => setIsFeedbackOpen(false)} />}
            {personaConfig.shouldShowConfetti() && showConfetti && <Confetti recycle={false} numberOfPieces={200} />}

            {/* Navigation (Liquid Glass) */}
            <nav className="glass-panel sticky top-0 z-50 mb-8 rounded-b-2xl mx-4 mt-2">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-blue-600">PMAction</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="hidden md:flex items-center mr-4 bg-blue-50 px-3 py-1 rounded-full">
                                <span className="text-sm font-bold text-blue-800 mr-2">{personaConfig.getLevelLabel(currentLevelNum)}</span>
                                <div className="w-24 h-2 bg-blue-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                                </div>
                            </div>
                            <button
                                onClick={() => setIsFocusMode(!isFocusMode)}
                                className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all transform hover:scale-105 shadow-sm border ${isFocusMode ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                            >
                                {isFocusMode ? (<span>🟢 Focus ON</span>) : (<span>⚪ Focus OFF</span>)}
                            </button>
                            <button onClick={() => setIsFeedbackOpen(true)} className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-blue-600 ml-4 transition">
                                <MessageSquarePlus className="w-4 h-4" /> Feedback
                            </button>
                            <button onClick={handleLogout} className="text-sm font-medium text-gray-500 hover:text-red-600 ml-4 transition">Logout</button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <DailyQuote />

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
                        {/* 1. Mood Check-In */}
                        <button onClick={() => { setModalTab('mood'); setIsWinModalOpen(true); }} className="p-4 bg-white border-2 border-fuchsia-500 rounded-2xl shadow-lg flex flex-col items-center justify-center min-h-[120px] hover:scale-105 transition-transform">
                            <span className="text-4xl mb-2">🎭</span>
                            <span className="font-bold text-lg text-fuchsia-700">Mood Check-In</span>
                        </button>

                        {/* 2. PMA Action (Journal/Topic/Habit) */}
                        <button onClick={() => { setModalTab('journal'); setIsWinModalOpen(true); }} className="p-4 bg-white border-2 border-orange-500 rounded-2xl shadow-lg flex flex-col items-center justify-center min-h-[120px] hover:scale-105 transition-transform">
                            <span className="text-4xl mb-2">⚡</span>
                            <span className="font-bold text-lg text-orange-700">PMA Action</span>
                        </button>

                        {/* 3. Self-Care */}
                        <button onClick={() => setIsSelfCareHubOpen(true)} className="p-4 bg-white border-2 border-purple-500 rounded-2xl shadow-lg flex flex-col items-center justify-center min-h-[120px] hover:scale-105 transition-transform">
                            <span className="text-4xl mb-2">🧘</span>
                            <span className="font-bold text-lg text-purple-700">Self-Care</span>
                        </button>

                        {/* 4. Resources / HELP (Advocacy for now, based on current routing, or library if we want to change it) */}
                        <button onClick={() => router.push('/library')} className="p-4 bg-white border-2 border-indigo-500 rounded-2xl shadow-lg flex flex-col items-center justify-center min-h-[120px] hover:scale-105 transition-transform">
                            <span className="text-4xl mb-2">🆘</span>
                            <span className="font-bold text-lg text-indigo-700">Resources / HELP</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Hero Stats */}
                            <div className="glass-panel rounded-3xl p-8 relative overflow-hidden border-white/40">
                                <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-purple-400/30 to-blue-400/30 rounded-full blur-3xl"></div>
                                <div className="relative z-10 mb-8">
                                    <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
                                        {greeting.text}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{userProfile?.nickname || user?.email?.split('@')[0] || 'Friend'}</span>.
                                    </h2>
                                    <p className="text-gray-600 font-medium text-lg flex items-center gap-3">
                                        <span className="inline-block w-3 h-3 rounded-full bg-green-400 animate-pulse"></span>
                                        {greeting.tip}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 bg-white/40 rounded-2xl text-center border border-white/50">
                                        <div className="text-3xl font-bold text-indigo-600">{currentLevelNum}</div>
                                        <div className="text-xs font-bold text-indigo-400 uppercase">Level</div>
                                    </div>
                                    <div className="p-4 bg-white/40 rounded-2xl text-center border border-white/50">
                                        <div className="text-3xl font-bold text-purple-600">{userProfile?.xp || 0}</div>
                                        <div className="text-xs font-bold text-purple-400 uppercase">XP</div>
                                    </div>
                                    <div className="p-4 bg-white/40 rounded-2xl text-center border border-white/50">
                                        <div className="text-3xl font-bold text-orange-600">{personaConfig.getStreakDisplay(stats?.streak || 0)}</div>
                                        <div className="text-xs font-bold text-orange-400 uppercase">Streak</div>
                                    </div>
                                    <div className="p-4 bg-white/40 rounded-2xl text-center border border-white/50">
                                        <div className="text-3xl font-bold text-green-600">{wins?.length || 0}</div>
                                        <div className="text-xs font-bold text-green-400 uppercase">Wins</div>
                                    </div>
                                </div>
                            </div>

                            <div id="daily-training-section">
                                <ErrorBoundary>
                                    <DailyTrainingCard onComplete={handleTrainingComplete} />
                                </ErrorBoundary>
                            </div>

                            <ErrorBoundary>
                                <ContentRecommendationCard />
                            </ErrorBoundary>

                            <ErrorBoundary>
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Victories</h2>
                                <div className="space-y-3">
                                    {wins.length > 0 ? wins.slice(0, 3).map((win, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <span className="text-2xl">{win.icon || '🏆'}</span>
                                            <div>
                                                <p className="font-bold text-gray-800">{win.label}</p>
                                                <p className="text-xs text-gray-500">{new Date(win.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                            <span className="ml-auto font-bold text-blue-600">+{win.xp} XP</span>
                                        </div>
                                    )) : (
                                        <p className="text-gray-400 text-center py-4">{personaConfig.getEmptyWinsMessage()}</p>
                                    )}
                                </div>
                                </div>
                            </ErrorBoundary>

                            <ErrorBoundary>
                                <SmartInsight onOpenCoach={() => setIsAICoachOpen(true)} />
                            </ErrorBoundary>
                        </div>

                        <div className="space-y-6">
                            <ErrorBoundary>
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center relative overflow-hidden">
                                    <h2 className="text-xl font-bold text-gray-800 mb-1 w-full text-left">Quick Timer</h2>
                                    <p className="text-sm text-gray-500 mb-4 w-full text-left">Keep track of time</p>
                                    <VisualTimer defaultDurationMinutes={5} />
                                </div>
                            </ErrorBoundary>

                            <ErrorBoundary>
                                <TimeDurationCards onAction={handleTimeCardAction} />
                            </ErrorBoundary>

                            <ErrorBoundary>
                                <SmartFocusCard
                                dailyStatus={{
                                    win: wins.some(w => w.type !== 'activity' || w.label !== 'Daily AI Training'),
                                    training: wins.some(w => w.label === 'Daily AI Training'),
                                    mood: wins.some(w => w.label === 'Mood Check-in'),
                                    selfCare: wins.some(w => w.win_type === 'self_care')
                                }}
                                onAction={(action) => {
                                    if (action === 'win') setIsWinModalOpen(true);
                                    if (action === 'mood') { setModalTab('mood'); setIsWinModalOpen(true); }
                                    if (action === 'self_care') setIsSelfCareHubOpen(true);
                                    if (action === 'training') {
                                        document.getElementById('daily-training-section')?.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }}
                                />
                            </ErrorBoundary>

                            <ErrorBoundary>
                                <MerchandiseSection userTraits={userProfile?.traits} currentFocus="Productivity" />
                            </ErrorBoundary>

                            <ErrorBoundary>
                                <TrendingNowWidget userProfile={userProfile} />
                            </ErrorBoundary>

                            {/* ACTIVE CHALLENGE CARD (Using Real Data) */}
                            <ErrorBoundary>
                                <ActiveChallengeCard challenge={activeChallengeData} />
                            </ErrorBoundary>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => { setModalTab('journal'); setIsWinModalOpen(true); }}
                        className="fixed bottom-8 right-8 px-6 py-4 glass-panel bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-2xl flex items-center gap-3 text-white font-bold z-50 ring-4 ring-white/30"
                    >
                        <span className="text-2xl">➕</span>
                        <span className="text-lg">Log</span>
                    </motion.button>
                </motion.div>
            </main>
        </div>
    );
};

export default DashboardPage;
