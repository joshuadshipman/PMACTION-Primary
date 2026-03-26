import { useState } from 'react';
import { auth, db } from '../../lib/firebaseClient';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { 
    doc, 
    setDoc, 
    updateDoc, 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs, 
    serverTimestamp 
} from 'firebase/firestore';
import { ChevronRight, Shield, Brain, Target, Check, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function OnboardingFlow() {
    const [screen, setScreen] = useState(0);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        ageRange: '',
        concerns: [],
        reminderTime: 'morning'
    });

    const screens = [
        {
            title: "Welcome to PMAction",
            component: WelcomeScreen
        },
        {
            title: "How It Works",
            component: HowItWorksScreen
        },
        {
            title: "Your Privacy Matters",
            component: PrivacyScreen
        },
        {
            title: "Create Account",
            component: AccountScreen
        },
        {
            title: "Personalize Experience",
            component: PersonalizeScreen
        },
        {
            title: "Quick Wellness Check",
            component: AssessmentScreen
        },
        {
            title: "Your First Challenge",
            component: ChallengeScreen
        }
    ];

    const CurrentScreen = screens[screen].component;

    return (
        <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white font-sans text-gray-900">
            {/* Progress Bar */}
            <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
                <div
                    className="h-full bg-teal-600 transition-all duration-300"
                    style={{ width: `${((screen + 1) / screens.length) * 100}%` }}
                />
            </div>

            {/* Screen Container */}
            <div className="container mx-auto px-4 pt-8 pb-20 max-w-2xl">
                <CurrentScreen
                    data={formData}
                    setData={setFormData}
                    onNext={() => setScreen(Math.min(screen + 1, screens.length - 1))}
                    onBack={() => setScreen(Math.max(screen - 1, 0))}
                    isFirst={screen === 0}
                    isLast={screen === screens.length - 1}
                />
            </div>

            {/* Screen Counter */}
            <div className="fixed bottom-4 left-0 right-0 text-center text-sm text-gray-500">
                {screen + 1} of {screens.length}
            </div>
        </div>
    );
}

function WelcomeScreen({ onNext }) {
    return (
        <div className="text-center space-y-8 py-12 animate-in fade-in duration-500 slide-in-from-bottom-4">
            <div className="inline-block p-6 bg-teal-100 rounded-full">
                <Brain className="w-16 h-16 text-teal-600" />
            </div>

            <div className="space-y-4">
                <h1 className="text-4xl font-bold text-gray-900">
                    Mental wellness feels impossible when you're stuck
                </h1>
                <p className="text-xl text-gray-600">
                    Small actions create real change. You're not alone in this journey.
                </p>
            </div>

            <div className="bg-coral-50 border-2 border-coral-200 rounded-2xl p-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-3">What PMAction offers you:</h3>
                <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                        <span>Personalized challenges that adapt to your needs and energy levels</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                        <span>Simple habit tracking that builds sustainable wellness routines</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                        <span>Private journaling with AI insights to understand your patterns</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                        <span>Direct connections to licensed therapists when you need support</span>
                    </li>
                </ul>
            </div>

            <button
                onClick={onNext}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1 transform"
            >
                Get Started
                <ChevronRight className="w-5 h-5" />
            </button>

            <p className="text-sm text-gray-500">
                Free to start. No credit card required.
            </p>
        </div>
    );
}

function HowItWorksScreen({ onNext, onBack }) {
    const steps = [
        {
            icon: Target,
            title: "Choose Your Path",
            description: "Select from challenges focused on relationships, mindfulness, habits, or specific conditions like ADHD or anxiety"
        },
        {
            icon: Sparkles,
            title: "Take Small Actions",
            description: "Complete daily activities designed by mental health professionals. Each step builds on the last"
        },
        {
            icon: Brain,
            title: "Track Your Growth",
            description: "See your progress through mood tracking, habit streaks, and insights from your journal entries"
        }
    ];

    return (
        <div className="space-y-8 py-8 animate-in fade-in duration-500 slide-in-from-right-8">
            <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold text-gray-900">
                    You choose your path. We adapt to support you.
                </h2>
                <p className="text-lg text-gray-600">
                    PMAction meets you where you are and grows with you
                </p>
            </div>

            <div className="space-y-6">
                {steps.map((step, index) => (
                    <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border-2 border-teal-100 hover:border-teal-200 transition-colors">
                        <div className="flex items-start gap-4">
                            <div className="bg-teal-100 p-3 rounded-xl flex-shrink-0">
                                <step.icon className="w-6 h-6 text-teal-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 mb-2">
                                    {index + 1}. {step.title}
                                </h3>
                                <p className="text-gray-600">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-6 text-white text-center shadow-lg">
                <p className="text-lg font-semibold mb-2">Our Philosophy</p>
                <p className="text-xl italic">"Small Actions, Lasting Change"</p>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={onBack}
                    className="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Back
                </button>
                <button
                    onClick={onNext}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                    Continue
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

function PrivacyScreen({ onNext, onBack }) {
    return (
        <div className="space-y-8 py-8 animate-in fade-in duration-500 slide-in-from-right-8">
            <div className="text-center space-y-3">
                <div className="inline-block p-4 bg-teal-100 rounded-full mb-4">
                    <Shield className="w-12 h-12 text-teal-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                    Your thoughts stay yours
                </h2>
                <p className="text-lg text-gray-600">
                    Privacy isn't optional. It's fundamental to healing.
                </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-teal-100 space-y-6">
                <div className="grid grid-cols-3 gap-4 pb-6 border-b border-gray-200">
                    <div className="text-center">
                        <div className="text-3xl mb-2">🔒</div>
                        <div className="text-sm font-semibold text-gray-900">AES-256</div>
                        <div className="text-xs text-gray-600">Encryption</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl mb-2">🏥</div>
                        <div className="text-sm font-semibold text-gray-900">HIPAA</div>
                        <div className="text-xs text-gray-600">Compliant</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl mb-2">🚫</div>
                        <div className="text-sm font-semibold text-gray-900">Never Sold</div>
                        <div className="text-xs text-gray-600">Your Data</div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <div className="font-semibold text-gray-900">End-to-end encryption</div>
                            <div className="text-sm text-gray-600">Your journal entries, mood logs, and personal data are encrypted both in transit and at rest</div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <div className="font-semibold text-gray-900">You control sharing</div>
                            <div className="text-sm text-gray-600">Choose exactly what to share with your therapist. Nothing shared without your explicit permission</div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <div className="font-semibold text-gray-900">Delete anytime</div>
                            <div className="text-sm text-gray-600">Export your data or permanently delete your account whenever you choose</div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <div className="font-semibold text-gray-900">AI processes locally</div>
                            <div className="text-sm text-gray-600">Sentiment analysis happens on your device when possible. We never sell your data to advertisers</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 text-center border border-gray-100">
                <p>We're committed to transparency. Read our full <span className="text-teal-600 font-semibold underline cursor-pointer">Privacy Policy</span> and <span className="text-teal-600 font-semibold underline cursor-pointer">Security Practices</span></p>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={onBack}
                    className="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Back
                </button>
                <button
                    onClick={onNext}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                    I Understand
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}



function AccountScreen({ data, setData, onNext, onBack }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSignup = async () => {
        setLoading(true);
        setError(null);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            const user = userCredential.user;

            // Create profile in Firestore
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, {
                uid: user.uid,
                email: user.email,
                onboarding_data: {
                    concerns: data.concerns || [],
                    ageRange: data.ageRange || ''
                },
                notificationPreferences: {
                    daily_reminder: true,
                    reminder_time: data.reminderTime || '09:00'
                },
                onboardingComplete: false,
                xp: 0,
                level: 1,
                current_streak: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            // If successful, proceed
            onNext();
        } catch (err) {
            console.error("Signup error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 py-8 animate-in fade-in duration-500 slide-in-from-right-8">
            <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold text-gray-900">
                    Create your account
                </h2>
                <p className="text-lg text-gray-600">
                    Just the basics to get you started
                </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-teal-100 space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">
                        {error}
                    </div>
                )}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => setData({ ...data, email: e.target.value })}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        value={data.password}
                        onChange={(e) => setData({ ...data, password: e.target.value })}
                        placeholder="At least 8 characters"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                    />
                </div>

                <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 text-center mb-4">Or continue with</p>
                    <div className="grid grid-cols-2 gap-3">
                        <button className="py-3 px-4 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                            <span className="text-xl">🔵</span> Google
                        </button>
                        <button className="py-3 px-4 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                            <span className="text-xl">🍎</span> Apple
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={onBack}
                    className="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Back
                </button>
                <button
                    onClick={handleSignup}
                    disabled={!data.email || !data.password || loading}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-md disabled:shadow-none"
                >
                    {loading ? 'Creating...' : 'Create Account'}
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

function PersonalizeScreen({ data, setData, onNext, onBack }) {
    const concerns = [
        { id: 'anxiety', label: 'Anxiety', emoji: '😰' },
        { id: 'depression', label: 'Depression', emoji: '😔' },
        { id: 'relationships', label: 'Relationships', emoji: '💬' },
        { id: 'habits', label: 'Building Habits', emoji: '🎯' },
        { id: 'adhd', label: 'ADHD/Focus', emoji: '🧠' },
        { id: 'stress', label: 'Stress', emoji: '😫' },
        { id: 'exploring', label: 'Just Exploring', emoji: '🌱' }
    ];

    const toggleConcern = (id) => {
        const current = data.concerns || [];
        if (current.includes(id)) {
            setData({ ...data, concerns: current.filter(c => c !== id) });
        } else {
            setData({ ...data, concerns: [...current, id] });
        }
    };

    return (
        <div className="space-y-8 py-8 animate-in fade-in duration-500 slide-in-from-right-8">
            <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold text-gray-900">
                    Help us personalize your experience
                </h2>
                <p className="text-lg text-gray-600">
                    Tell us what brings you here today
                </p>
                <p className="text-sm text-gray-500">
                    You can skip this and explore on your own
                </p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        What would you like support with? (Select all that apply)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {concerns.map(concern => (
                            <button
                                key={concern.id}
                                onClick={() => toggleConcern(concern.id)}
                                className={`p-4 rounded-xl border-2 transition-all text-left ${(data.concerns || []).includes(concern.id)
                                    ? 'border-teal-500 bg-teal-50 shadow-sm'
                                    : 'border-gray-300 hover:border-teal-300'
                                    }`}
                            >
                                <div className="text-2xl mb-2">{concern.emoji}</div>
                                <div className="font-semibold text-sm text-gray-900">{concern.label}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        When would you like daily reminders?
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {['morning', 'afternoon', 'evening'].map(time => (
                            <button
                                key={time}
                                onClick={() => setData({ ...data, reminderTime: time })}
                                className={`p-4 rounded-xl border-2 transition-all capitalize ${data.reminderTime === time
                                    ? 'border-teal-500 bg-teal-50 shadow-sm'
                                    : 'border-gray-300 hover:border-teal-300'
                                    }`}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={onBack}
                    className="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Back
                </button>
                <button
                    onClick={onNext}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                    {(data.concerns || []).length > 0 ? 'Continue' : 'Skip for Now'}
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

function AssessmentScreen({ onNext, onBack }) {
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const questions = [
        "Little interest or pleasure in doing things",
        "Feeling down, depressed, or hopeless",
        "Trouble falling or staying asleep",
        "Feeling tired or having little energy",
        "Feeling nervous, anxious, or on edge",
        "Not being able to stop or control worrying",
        "Worrying too much about different things",
        "Trouble relaxing"
    ];

    const options = [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half' },
        { value: 3, label: 'Nearly every day' }
    ];

    const handleComplete = async () => {
        setSubmitting(true);
        try {
            const user = auth.currentUser;
            if (user) {
                // Calculate score
                const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);

                // Save screening results to Firestore
                const userAssessmentsRef = collection(db, 'user_assessments');
                await addDoc(userAssessmentsRef, {
                    userId: user.uid,
                    assessmentName: 'Wellness Check',
                    score: totalScore,
                    answers: answers,
                    completedAt: serverTimestamp(),
                    totalScore: totalScore 
                });
            }
            onNext();
        } catch (error) {
            console.error('Error saving assessment:', error);
            onNext();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 py-8 animate-in fade-in duration-500 slide-in-from-right-8">
            <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold text-gray-900">
                    Quick wellness check
                </h2>
                <p className="text-lg text-gray-600">
                    Over the last 2 weeks, how often have you been bothered by the following?
                </p>
                <div className="inline-block bg-yellow-50 border-2 border-yellow-200 rounded-xl px-4 py-2 text-sm text-gray-700">
                    <strong>Note:</strong> This is not a diagnosis, just helps us personalize your experience
                </div>
            </div>

            <div className="space-y-6">
                {questions.slice(0, 4).map((question, index) => (
                    <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border-2 border-teal-100">
                        <div className="font-semibold text-gray-900 mb-4">
                            {index + 1}. {question}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {options.map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => setAnswers({ ...answers, [index]: option.value })}
                                    className={`p-3 rounded-lg border-2 text-sm transition-all ${answers[index] === option.value
                                        ? 'border-teal-500 bg-teal-50 font-semibold shadow-sm'
                                        : 'border-gray-300 hover:border-teal-300'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center text-sm text-gray-500">
                Questions 5-8 would appear as user scrolls...
            </div>

            <div className="flex gap-3">
                <button
                    onClick={onBack}
                    className="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Back
                </button>
                <button
                    onClick={handleComplete}
                    disabled={submitting}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-md disabled:opacity-50"
                >
                    {submitting ? 'Saving...' : 'Complete Check-In'}
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

function ChallengeScreen({ data, onNext }) {
    const [starting, setStarting] = useState(false);

    const recommendedChallenge = {
        title: "Mindfulness & Stress Reduction",
        duration: "7 days",
        description: "Learn practical mindfulness techniques to reduce anxiety and find calm in daily life",
        slug: "mindfulness-journey", // Matches DB slug
        activities: [
            "5-minute guided meditation",
            "Body scan practice",
            "Mindful eating exercise",
            "Gratitude journaling"
        ]
    };

    const handleStart = async () => {
        setStarting(true);
        try {
            const user = auth.currentUser;
            if (user) {
                // Create user challenge in Firestore
                const userChallengesRef = collection(db, 'user_challenges');
                await addDoc(userChallengesRef, {
                    userId: user.uid,
                    challengeId: recommendedChallenge.slug,
                    startDate: serverTimestamp(),
                    status: 'active',
                    title: recommendedChallenge.title
                });

                // Update profile completion in Firestore
                const userDocRef = doc(db, 'users', user.uid);
                await updateDoc(userDocRef, {
                    onboardingComplete: true,
                    updatedAt: serverTimestamp()
                });
            }
            onNext(); 
        } catch (error) {
            console.error('Error starting challenge:', error);
            onNext();
        } finally {
            setStarting(false);
        }
    };

    return (
        <div className="space-y-8 py-8 animate-in fade-in duration-500 slide-in-from-right-8">
            <div className="text-center space-y-3">
                <div className="inline-block p-4 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full mb-4 shadow-lg">
                    <Sparkles className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                    Your personalized recommendation
                </h2>
                <p className="text-lg text-gray-600">
                    Based on your responses, we recommend starting here
                </p>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-white rounded-2xl p-8 shadow-xl border-2 border-teal-200 hover:shadow-2xl transition-shadow duration-300">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {recommendedChallenge.title}
                        </h3>
                        <div className="inline-block bg-teal-100 px-3 py-1 rounded-full text-sm font-semibold text-teal-700">
                            {recommendedChallenge.duration}
                        </div>
                    </div>
                </div>

                <p className="text-gray-700 mb-6">
                    {recommendedChallenge.description}
                </p>

                <div className="space-y-3 mb-6">
                    <div className="font-semibold text-gray-900">What you'll do:</div>
                    {recommendedChallenge.activities.map((activity, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-teal-200 flex items-center justify-center text-xs font-bold text-teal-700">
                                {index + 1}
                            </div>
                            <span className="text-gray-700">{activity}</span>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-xl p-4 border-2 border-teal-100">
                    <div className="flex items-center gap-3 text-sm text-gray-600 justify-center">
                        <span className="flex items-center gap-1">✨ Earn 500 points</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">🏆 Unlock "Zen Master" badge</span>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <button
                    onClick={handleStart}
                    disabled={starting}
                    className="w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                    {starting ? 'Setting up your journey...' : 'Start This Challenge'}
                    <ChevronRight className="w-6 h-6" />
                </button>

                <button className="w-full border-2 border-teal-300 text-teal-700 py-3 rounded-xl font-semibold hover:bg-teal-50 transition-colors">
                    Browse All Challenges
                </button>
            </div>

            <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">
                    Ready to experience real change?
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                    <span>🔒 Private & Secure</span>
                    <span>•</span>
                    <span>📱 Works Offline</span>
                    <span>•</span>
                    <span>💝 Free to Start</span>
                </div>
            </div>
        </div>
    );
}
