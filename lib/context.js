import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from './firebaseClient.js';
import { onAuthStateChanged } from 'firebase/auth';
import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    collection, 
    query, 
    where, 
    orderBy, 
    getDocs, 
    onSnapshot,
    serverTimestamp,
    addDoc,
    limit,
    Timestamp 
} from 'firebase/firestore';

// Create Context
const AppContext = createContext();

// Custom Hook
export const useApp = () => useContext(AppContext);

// Define the AppProvider component
export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [appState, setAppState] = useState({});
    const [habits, setHabits] = useState([]);
    const [dailyLogs, setDailyLogs] = useState({}); // Abstraction: { [date]: { mood_score, journal_content, habits_completed: [] } }
    const [stats, setStats] = useState({ points: 0, streak: 0, level: 1 });
    const [activeChallenge, setActiveChallenge] = useState(null); // { id, startDate, progress }
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen for auth changes
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Fetch data when user is logged in
    const [wins, setWins] = useState([]);
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        if (user) {
            fetchHabits(); // Keeping for backward compatibility
            fetchStats(); // Keeping for backward compatibility
            fetchUserProfile();
            const today = new Date().toISOString().split('T')[0];
            fetchDailyLog(today);
            fetchWins(today);
        } else {
            setHabits([]);
            setDailyLogs({});
            setStats({ points: 0, streak: 0, level: 1 });
            setWins([]);
            setUserProfile(null);
            setActiveChallenge(null);
        }
    }, [user]);

    // Load active challenge from localStorage on mount (client-side only)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('pma_active_challenge');
            if (saved) {
                try {
                    setActiveChallenge(JSON.parse(saved));
                } catch (e) {
                    console.error('Error parsing active challenge', e);
                }
            }
        }
    }, []);

    const startChallenge = (challengeId) => {
        const newChallenge = {
            id: challengeId,
            startDate: new Date().toISOString(),
            progress: 0,
            currentDay: 1
        };
        setActiveChallenge(newChallenge);
        if (typeof window !== 'undefined') {
            localStorage.setItem('pma_active_challenge', JSON.stringify(newChallenge));
        }
        // In a real app, we would save this to the database here
    };

    const fetchUserProfile = async () => {
        try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                setUserProfile(userDoc.data());
            } else {
                // Create profile if not exists
                const newProfile = {
                    uid: user.uid,
                    email: user.email,
                    xp: 0,
                    level: 1,
                    current_streak: 0,
                    createdAt: serverTimestamp()
                };
                await setDoc(userDocRef, newProfile);
                setUserProfile(newProfile);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error.message);
        }
    };

    const fetchWins = async (date) => {
        try {
            const winsRef = collection(db, 'wins');
            const startOfDay = new Date(date + 'T00:00:00');
            const endOfDay = new Date(date + 'T23:59:59');

            const q = query(
                winsRef,
                where('userId', '==', user.uid),
                where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
                where('timestamp', '<=', Timestamp.fromDate(endOfDay)),
                orderBy('timestamp', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const winsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setWins(winsList);
        } catch (error) {
            console.error('Error fetching wins:', error.message);
        }
    };

    const addWin = async (winData) => {
        if (!user) return;

        try {
            // 1. Insert Win to Firestore
            const winsRef = collection(db, 'wins');
            const newWinDoc = await addDoc(winsRef, {
                ...winData,
                userId: user.uid,
                timestamp: serverTimestamp()
            });

            const newWin = { id: newWinDoc.id, ...winData, userId: user.uid, timestamp: new Date().toISOString() };

            // 1.5 Sync with Journal Entries
            if (winData.type === 'journal' && winData.content) {
                const today = new Date().toISOString().split('T')[0];
                await saveDailyLog(today, { journal_content: winData.content });
            }

            // 2. Calculate Gamification Updates
            const xpGained = winData.xp_earned || winData.xp || 10;
            let newXP = (userProfile?.xp || 0) + xpGained;
            let newLevel = 1 + Math.floor(newXP / 500); // 500 XP per level

            // 3. Update Profile
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                xp: newXP,
                level: newLevel,
                lastWinDate: serverTimestamp()
            });

            // Update local state
            setUserProfile(prev => ({ ...prev, xp: newXP, level: newLevel }));
            setStats(prev => ({ ...prev, points: newXP, level: newLevel }));
            setWins(prev => [newWin, ...prev]);

            return newWin;
        } catch (error) {
            console.error('Error adding win:', error.message);
            throw error;
        }
    };

    const fetchHabits = async () => {
        try {
            const habitsRef = collection(db, 'habits');
            const q = query(habitsRef, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const habitsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setHabits(habitsList);
        } catch (error) {
            console.error('Error fetching habits:', error.message);
        }
    };

    const fetchStats = async () => {
        try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const data = userDoc.data();
                setStats({
                    points: data.xp || 0,
                    streak: data.current_streak || 0,
                    level: data.level || 1
                });
            }
        } catch (error) {
            console.error('Error fetching stats:', error.message);
        }
    };

    const fetchDailyLog = async (date) => {
        try {
            // Fetch journal entry from Firestore
            const journalsRef = collection(db, 'journals');
            const startOfDay = new Date(date + 'T00:00:00');
            const endOfDay = new Date(date + 'T23:59:59');

            const q = query(
                journalsRef,
                where('userId', '==', user.uid),
                where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
                where('timestamp', '<=', Timestamp.fromDate(endOfDay)),
                limit(1)
            );

            const querySnapshot = await getDocs(q);
            const journalData = !querySnapshot.empty ? querySnapshot.docs[0].data() : null;

            const logData = {
                emotion_data: journalData?.emotion_data || null,
                mood_score: journalData?.mood_score || null,
                journal_content: journalData?.content || '',
                habits_completed: [] // Habit tracking via Firestore would need a logs collection
            };

            setDailyLogs(prev => ({ ...prev, [date]: logData }));
        } catch (error) {
            console.error('Error fetching daily log:', error.message);
        }
    };

    const addHabit = async (habitData) => {
        if (!user) return;

        try {
            const habitsRef = collection(db, 'habits');
            const docRef = await addDoc(habitsRef, {
                ...habitData,
                userId: user.uid,
                createdAt: serverTimestamp()
            });

            const newHabit = { id: docRef.id, ...habitData, userId: user.uid };
            setHabits(prev => [newHabit, ...prev]);
            return newHabit;
        } catch (error) {
            console.error('Error adding habit:', error.message);
            throw error;
        }
    };

    const deleteHabit = async (habitId) => {
        if (!user) return;

        try {
            const habitDocRef = doc(db, 'habits', habitId);
            await deleteDoc(habitDocRef);
            setHabits(prev => prev.filter(h => h.id !== habitId));
        } catch (error) {
            console.error('Error deleting habit:', error.message);
            throw error;
        }
    };

    const saveDailyLog = async (date, updates) => {
        try {
            // updates: { emotion_data, journal_content }
            const journalsRef = collection(db, 'journals');
            const startOfDay = new Date(date + 'T00:00:00');
            const endOfDay = new Date(date + 'T23:59:59');

            const q = query(
                journalsRef,
                where('userId', '==', user.uid),
                where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
                where('timestamp', '<=', Timestamp.fromDate(endOfDay)),
                limit(1)
            );

            const querySnapshot = await getDocs(q);
            let journalDocRef;

            if (!querySnapshot.empty) {
                journalDocRef = querySnapshot.docs[0].ref;
                await updateDoc(journalDocRef, {
                    content: updates.journal_content || '',
                    emotion_data: updates.emotion_data || null,
                    updatedAt: serverTimestamp()
                });
            } else {
                await addDoc(journalsRef, {
                    userId: user.uid,
                    content: updates.journal_content || '',
                    emotion_data: updates.emotion_data || null,
                    timestamp: Timestamp.fromDate(startOfDay)
                });
            }

            // Refresh local state
            await fetchDailyLog(date);
            await fetchStats();

        } catch (error) {
            console.error('Error saving daily log:', error.message);
            throw error;
        }
    };

    const value = {
        user,
        appState,
        setAppState,
        habits,
        dailyLogs,
        stats,
        wins, // New
        userProfile, // New
        loading,
        fetchHabits,
        fetchDailyLog,
        fetchWins, // New
        addHabit,
        deleteHabit,
        saveDailyLog,
        addWin, // New
        activeChallenge, // New
        startChallenge // New
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
