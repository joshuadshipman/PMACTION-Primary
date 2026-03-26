import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../../lib/firebaseClient';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthCallback = () => {
    const router = useRouter();
    const [status, setStatus] = useState('Processing...');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    setStatus('Syncing profile...');
                    
                    // Retrieve onboarding data from localStorage
                    const onboardingDataStr = localStorage.getItem('onboardingData') || 
                                           localStorage.getItem('onboarding_progress');
                    
                    let onboardingData = {};
                    if (onboardingDataStr) {
                        try {
                            onboardingData = JSON.parse(onboardingDataStr);
                        } catch (e) {
                            console.error('Failed to parse onboarding data', e);
                        }
                    }

                    // Create or update profile with onboarding data in Firestore
                    const userDocRef = doc(db, 'users', user.uid);
                    await setDoc(userDocRef, {
                        uid: user.uid,
                        email: user.email,
                        nickname: onboardingData.displayName || user.displayName || user.email.split('@')[0],
                        ageGroup: onboardingData.ageGroup || '',
                        timezone: onboardingData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
                        goals: onboardingData.goals || [],
                        notificationPreferences: onboardingData.notifications || {},
                        onboardingComplete: true,
                        updatedAt: serverTimestamp(),
                        xp: 0,
                        level: 1,
                        current_streak: 0,
                        createdAt: serverTimestamp()
                    }, { merge: true });

                    // Clear onboarding data from localStorage
                    localStorage.removeItem('onboardingData');
                    localStorage.removeItem('onboarding_progress');

                    setStatus('Success! Redirecting to dashboard...');

                    // Redirect to dashboard
                    setTimeout(() => {
                        router.push('/dashboard');
                    }, 1000);

                } catch (error) {
                    console.error('Callback error:', error);
                    setStatus(`Error: ${error.message}`);
                    
                    // Redirect back to login after error
                    setTimeout(() => {
                        router.push('/login');
                    }, 3000);
                }
            } else {
                setStatus('Waiting for authentication...');
            }
        });

        return () => unsubscribe();
    }, [router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-purple-50 flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-xl font-semibold text-gray-900">{status}</p>
            </div>
        </div>
    );
};

export default AuthCallback;
