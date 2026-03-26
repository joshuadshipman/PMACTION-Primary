// pages/onboarding/signup.js
import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useOnboarding } from '../../context/OnboardingContext';
import { auth } from '../../lib/firebaseClient';
import { 
    createUserWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider,
    updateProfile 
} from 'firebase/auth';
const googleProvider = new GoogleAuthProvider();

const SignupPage = () => {
    const router = useRouter();
    const { data, reset } = useOnboarding();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleEmailSignUp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Store onboarding data in localStorage temporarily
            localStorage.setItem('onboardingData', JSON.stringify(data));

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update profile with display name if available in data
            if (data.displayName) {
                await updateProfile(user, { displayName: data.displayName });
            }

            // In Firebase, the user is signed in immediately after creation.
            // We can redirect to the callback or next step.
            router.push('/auth/callback'); 

        } catch (err) {
            console.error('Sign up error:', err);
            setError(err.message || 'Failed to sign up. Please try again.');
            setIsLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Store onboarding data in localStorage temporarily
            localStorage.setItem('onboardingData', JSON.stringify(data));

            // Initiate Google Sign-In with Popup
            await signInWithPopup(auth, googleProvider);
            
            // Redirect after successful sign-in
            router.push('/auth/callback');

        } catch (err) {
            console.error('Sign up error:', err);
            setError(err.message || 'Failed to sign up with Google. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-teal-50 to-purple-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <Head>
                <title>Create Your Account | PMAction</title>
                <meta name="description" content="Sign up to start your mental wellness journey" />
            </Head>

            {/* Celebration Confetti Background */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-3 h-3 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            backgroundColor: ['#14B8A6', '#9333EA', '#F59E0B', '#EC4899'][Math.floor(Math.random() * 4)],
                        }}
                        animate={{
                            y: [0, -20, 0],
                            opacity: [0.3, 0.7, 0.3],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            <div className="w-full max-w-md space-y-8 relative z-10">
                {/* Progress Steps */}
                <div className="flex justify-center space-x-4 mb-8">
                    {[1, 2, 3, 4].map((step) => (
                        <div
                            key={step}
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step === 4
                                ? 'bg-gradient-to-r from-teal-600 to-purple-600 text-white shadow-lg scale-110'
                                : 'bg-teal-500 text-white'
                                }`}
                        >
                            {step}
                        </div>
                    ))}
                </div>

                <motion.div
                    className="bg-white rounded-3xl shadow-2xl p-10 text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Celebration Icon */}
                    <motion.div
                        className="mx-auto w-20 h-20 bg-gradient-to-br from-teal-500 to-purple-600 rounded-full flex items-center justify-center mb-6"
                        animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 1,
                        }}
                    >
                        <span className="text-4xl">🎉</span>
                    </motion.div>

                    <motion.h1
                        className="text-4xl font-extrabold text-gray-900 mb-4"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        You're Almost There!
                    </motion.h1>

                    <motion.p
                        className="text-lg text-gray-600 mb-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        Create your account to save your progress and start your personalized mental wellness journey.
                    </motion.p>

                    {/* Google Sign Up Button */}
                    <motion.button
                        onClick={handleGoogleSignUp}
                        disabled={isLoading}
                        className={`w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-300 rounded-xl font-semibold text-gray-700 transition-all ${isLoading
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:border-gray-400 hover:shadow-lg hover:scale-105'
                            }`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        whileHover={!isLoading ? { y: -2 } : {}}
                        whileTap={!isLoading ? { scale: 0.98 } : {}}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-6 h-6 border-3 border-gray-300 border-t-teal-600 rounded-full animate-spin"></div>
                                <span>Connecting...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-6 h-6" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                <span>Sign Up with Google</span>
                            </>
                        )}
                    </motion.button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleEmailSignUp} className="space-y-4 text-left">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <a href="/login" className="font-medium text-teal-600 hover:text-teal-500">
                                Log in
                            </a>
                        </p>
                    </div>

                    {error && (
                        <motion.div
                            className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Privacy Assurance */}
                    <motion.div
                        className="mt-8 p-4 bg-gray-50 rounded-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <p className="text-sm font-semibold text-gray-900">Your Privacy is Protected</p>
                        </div>
                        <p className="text-xs text-gray-600">
                            We use industry-standard encryption to keep your data safe and secure. We'll never share your personal information.
                        </p>
                    </motion.div>

                    {/* Terms and Privacy */}
                    <motion.p
                        className="mt-6 text-xs text-gray-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                    >
                        By signing up, you agree to our{' '}
                        <a href="/terms" className="text-teal-600 hover:underline">
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="/privacy" className="text-teal-600 hover:underline">
                            Privacy Policy
                        </a>
                    </motion.p>

                    {/* Back Button */}
                    <button
                        onClick={() => router.push('/onboarding/setup')}
                        className="mt-6 text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
                        disabled={isLoading}
                    >
                        ← Back to Setup
                    </button>
                </motion.div>

                {/* Summary of Selections */}
                <motion.div
                    className="bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                >
                    <h3 className="font-bold text-gray-900 mb-3">Your Journey Summary</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                        <p>
                            <span className="font-semibold">Goals:</span> {data.goals?.length || 0} selected
                        </p>
                        <p>
                            <span className="font-semibold">Name:</span> {data.displayName || 'Not set'}
                        </p>
                        <p>
                            <span className="font-semibold">Age Group:</span> {data.ageGroup || 'Not set'}
                        </p>
                        <p>
                            <span className="font-semibold">Daily Reminders:</span>{' '}
                            {data.notifications?.dailyReminder ? `Yes, at ${data.notifications.reminderTime}` : 'No'}
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SignupPage;
