import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useApp } from '../../lib/context';
import { auth, db } from '../../lib/firebaseClient';
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    getDoc, 
    doc, 
    setDoc, 
    addDoc,
    updateDoc, 
    orderBy, 
    limit, 
    serverTimestamp 
} from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';

export default function ChallengeDetail() {
    const { user, loading: authLoading } = useApp();
    const router = useRouter();
    const { slug } = router.query;

    const [challenge, setChallenge] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [userChallenge, setUserChallenge] = useState(null);
    const [completions, setCompletions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push('/login');
            return;
        }
        if (slug) {
            fetchChallengeData();
        }
    }, [slug, user, authLoading]);

    const fetchChallengeData = async () => {
        try {
            setLoading(true);

            // 1. Fetch challenge details (Doc ID is slug per migration script)
            const challengeRef = doc(db, 'challenges', slug);
            const challengeSnap = await getDoc(challengeRef);

            if (!challengeSnap.exists()) {
                console.error('Challenge not found');
                setLoading(false);
                return;
            }

            const challengeData = { id: challengeSnap.id, ...challengeSnap.data() };
            setChallenge(challengeData);

            // 2. Fetch tasks from subcollection
            const tasksRef = collection(db, 'challenges', slug, 'tasks');
            const tasksQ = query(tasksRef, orderBy('day'));
            const tasksSnap = await getDocs(tasksQ);
            const tasksData = tasksSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), day_number: doc.data().day }));
            setTasks(tasksData);

            // 3. Check if user joined
            const userChallsRef = collection(db, 'user_challenges');
            const qJoin = query(
                userChallsRef,
                where('userId', '==', user.uid),
                where('challengeId', '==', slug),
                limit(1)
            );
            const joinSnap = await getDocs(qJoin);

            if (!joinSnap.empty) {
                const userChallengeDoc = joinSnap.docs[0];
                const userChallengeData = { id: userChallengeDoc.id, ...userChallengeDoc.data() };
                setUserChallenge(userChallengeData);

                // 4. Fetch completions (Top-level collection for simplicity)
                const completionsRef = collection(db, 'challenge_completions');
                const compQ = query(
                    completionsRef,
                    where('userId', '==', user.uid),
                    where('challengeId', '==', slug)
                );
                const compSnap = await getDocs(compQ);
                setCompletions(compSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) || []);
            }

        } catch (error) {
            console.error('Error fetching challenge data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        try {
            setJoining(true);
            const userChallsRef = collection(db, 'user_challenges');
            const newDoc = {
                userId: user.uid,
                challengeId: slug,
                status: 'active',
                startDate: serverTimestamp(),
                title: challenge.title
            };

            const docRef = await addDoc(userChallsRef, newDoc);
            setUserChallenge({ id: docRef.id, ...newDoc });
            alert('You have successfully joined the challenge!');
        } catch (error) {
            console.error('Error joining challenge:', error);
            alert('Failed to join challenge. Please try again.');
        } finally {
            setJoining(false);
        }
    };

    const handleTaskComplete = async (taskId) => {
        if (!userChallenge) return;

        try {
            // Find task to get day number
            const task = tasks.find(t => t.id === taskId);
            const isCompleted = completions.some(c => c.taskId === taskId);

            if (isCompleted) return;

            const completionsRef = collection(db, 'challenge_completions');
            const newComp = {
                userId: user.uid,
                challengeId: slug,
                taskId: taskId,
                dayCompleted: task?.day_number || 0,
                completedAt: serverTimestamp()
            };

            const docRef = await addDoc(completionsRef, newComp);
            const updatedCompletions = [...completions, { id: docRef.id, ...newComp }];
            setCompletions(updatedCompletions);

            // Check if all tasks completed
            if (updatedCompletions.length === tasks.length) {
                const userChallRef = doc(db, 'user_challenges', userChallenge.id);
                await updateDoc(userChallRef, { 
                    status: 'completed', 
                    completedAt: serverTimestamp() 
                });

                alert('Congratulations! You have completed the challenge!');
                fetchChallengeData();
            }

        } catch (error) {
            console.error('Error completing task:', error);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
    );

    if (!challenge) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <p>Challenge not found.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Head>
                <title>{challenge.title} | PMAction</title>
            </Head>

            {/* Hero Section */}
            <div className={`bg-gradient-to-r ${challenge.color_gradient || 'from-teal-500 to-teal-700'} text-white py-12`}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <button
                        onClick={() => router.push('/challenges')}
                        className="mb-6 text-white/80 hover:text-white flex items-center font-medium"
                    >
                        ← Back to Challenges
                    </button>
                    <div className="flex items-center space-x-6">
                        <span className="text-6xl">{challenge.icon || '🎯'}</span>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">{challenge.title}</h1>
                            <p className="text-lg text-white/90 max-w-2xl">{challenge.description}</p>
                        </div>
                    </div>

                    {!userChallenge && (
                        <button
                            onClick={handleJoin}
                            disabled={joining}
                            className="mt-8 bg-white text-teal-700 px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            {joining ? 'Joining...' : 'Join Challenge'}
                        </button>
                    )}

                    {userChallenge && (
                        <div className="mt-8 flex items-center space-x-4 bg-white/10 p-4 rounded-lg backdrop-blur-sm inline-flex">
                            <div className="text-center px-4 border-r border-white/20">
                                <p className="text-xs uppercase tracking-wide opacity-75">Progress</p>
                                <p className="text-2xl font-bold">{Math.round((completions.length / tasks.length) * 100)}%</p>
                            </div>
                            <div className="text-center px-4">
                                <p className="text-xs uppercase tracking-wide opacity-75">Status</p>
                                <p className="text-2xl font-bold capitalize">{userChallenge.status}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-8">
                    {tasks.map((task) => {
                        const isCompleted = completions.some(c => c.task_id === task.id);
                        const isLocked = !userChallenge; // Lock tasks if not joined

                        return (
                            <div key={task.id} className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${isCompleted ? 'opacity-75' : ''}`}>
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-teal-100 text-teal-800 font-bold text-xs">
                                                    D{task.day_number}
                                                </span>
                                                <h3 className="text-lg font-bold text-gray-900">{task.title}</h3>
                                            </div>

                                            <div className="prose prose-teal max-w-none text-gray-600 mt-4 line-clamp-3">
                                                <ReactMarkdown>{task.instructions}</ReactMarkdown>
                                            </div>

                                            <div className="mt-4">
                                                <button
                                                    onClick={() => router.push(`/challenge/${slug}/day/${task.day_number}`)}
                                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                                                >
                                                    {isCompleted ? 'Review Lesson' : 'Start Lesson'}
                                                </button>
                                            </div>
                                        </div>

                                        {userChallenge && (
                                            <div className="ml-6 flex flex-col items-center space-y-2">
                                                <button
                                                    onClick={() => handleTaskComplete(task.id)}
                                                    disabled={isCompleted}
                                                    className={`flex-shrink-0 h-10 w-10 rounded-full border-2 flex items-center justify-center transition-colors ${isCompleted
                                                        ? 'bg-green-500 border-green-500 text-white'
                                                        : 'border-gray-300 text-gray-300 hover:border-green-500 hover:text-green-500'
                                                        }`}
                                                >
                                                    {isCompleted ? '✓' : '○'}
                                                </button>
                                                <span className="text-xs text-gray-500">{isCompleted ? 'Done' : 'Mark Done'}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
