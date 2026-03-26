import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useApp } from '../../../../lib/context'; // Adjust path as needed
import { auth, db } from '../../../../lib/firebaseClient';
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
import GeminiDeepDive from '../../../../components/GeminiDeepDive';

export default function LessonPage() {
    const router = useRouter();
    const { slug, day } = router.query;
    const { user, loading: authLoading } = useApp();

    const [loading, setLoading] = useState(true);
    const [challenge, setChallenge] = useState(null);
    const [task, setTask] = useState(null);
    const [activeTab, setActiveTab] = useState('learn'); // learn, quiz, reflect
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [quizScore, setQuizScore] = useState(0);
    const [reflection, setReflection] = useState('');
    const [completing, setCompleting] = useState(false);
    const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push('/login');
            return;
        }
        if (slug && day) {
            fetchLessonData();
        }
    }, [slug, day, user, authLoading]);

    const fetchLessonData = async () => {
        try {
            setLoading(true);

            // Fetch challenge
            const challengeRef = doc(db, 'challenges', slug);
            const challengeSnap = await getDoc(challengeRef);

            if (!challengeSnap.exists()) {
                throw new Error('Challenge not found');
            }
            const challengeData = { id: challengeSnap.id, ...challengeSnap.data() };
            setChallenge(challengeData);

            // Fetch task with content from subcollection
            const tasksRef = collection(db, 'challenges', slug, 'tasks');
            const taskQ = query(tasksRef, where('day', '==', parseInt(day)), limit(1));
            const taskSnap = await getDocs(taskQ);

            if (taskSnap.empty) {
                throw new Error('Task not found');
            }
            
            const taskDoc = taskSnap.docs[0];
            setTask({ id: taskDoc.id, ...taskDoc.data() });

        } catch (error) {
            console.error('Error fetching lesson:', error);
            setFeedback({ type: 'error', message: 'Failed to load lesson data.' });
        } finally {
            setLoading(false);
        }
    };

    const handleQuizSubmit = () => {
        if (!task || !task.content_data || !task.content_data.modules) return;

        const currentModule = task.content_data.modules[currentModuleIndex];
        if (!currentModule || !currentModule.quiz) return;

        let score = 0;
        let total = currentModule.quiz.length;
        let allAnswered = true;

        currentModule.quiz.forEach((q, idx) => {
            if (quizAnswers[idx] === undefined) {
                allAnswered = false;
            } else if (quizAnswers[idx] === q.correct) {
                score++;
            }
        });

        if (!allAnswered) {
            setFeedback({ type: 'error', message: 'Please answer all questions before submitting.' });
            setTimeout(() => setFeedback(null), 3000);
            return;
        }

        setQuizScore(score);
        setQuizSubmitted(true);

        const percentage = (score / total) * 100;
        if (percentage >= 70) {
            setFeedback({ type: 'success', message: `Great job! You scored ${score}/${total}.` });
        } else {
            setFeedback({ type: 'error', message: `You scored ${score}/${total}. Review the material and try again!` });
        }
        setTimeout(() => setFeedback(null), 5000);
    };

    const handleComplete = async () => {
        try {
            if (!user) return;
            setCompleting(true);

            // Find user_challenge_id
            const userChallsRef = collection(db, 'user_challenges');
            const q = query(
                userChallsRef,
                where('userId', '==', user.uid),
                where('challengeId', '==', slug),
                limit(1)
            );
            const joinSnap = await getDocs(q);

            if (!joinSnap.empty) {
                const userChallengeDoc = joinSnap.docs[0];
                
                // Calculate points (base + quiz bonus)
                let basePoints = task.points || 10;
                let bonusPoints = quizScore * 5; 
                let totalPoints = basePoints + bonusPoints;

                // Save completion with reflection (Using composite ID for upsert-like behavior)
                const completionId = `${user.uid}_${slug}_day${day}`;
                const completionRef = doc(db, 'challenge_completions', completionId);
                
                await setDoc(completionRef, {
                    userId: user.uid,
                    challengeId: slug,
                    taskId: task.id,
                    dayCompleted: parseInt(day),
                    completedAt: serverTimestamp(),
                    reflectionText: reflection,
                    pointsEarned: totalPoints
                }, { merge: true });

                setFeedback({ type: 'success', message: `Lesson completed! +${totalPoints} XP` });

                // Redirect after a short delay
                setTimeout(() => {
                    router.push(`/challenge/${slug}`);
                }, 1500);
            } else {
                setFeedback({ type: 'error', message: 'Join the challenge first to track progress!' });
            }
        } catch (error) {
            console.error('Error completing lesson:', error);
            setFeedback({ type: 'error', message: 'Error saving progress. Please try again.' });
        } finally {
            setCompleting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>;
    if (!task) return <div className="p-8 text-center">Lesson not found</div>;

    const content = task.content_data || {};
    const modules = content.modules || [];
    const currentModule = modules[currentModuleIndex];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col relative">
            <Head>
                <title>Day {day}: {task.title} | PMAction</title>
            </Head>

            {/* Feedback Toast */}
            {feedback && (
                <div className={`fixed top-20 right-4 z-50 px-6 py-4 rounded-lg shadow-xl text-white font-medium transform transition-all duration-300 ${feedback.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                    {feedback.message}
                </div>
            )}

            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-900 font-medium">
                        ← Back
                    </button>
                    <h1 className="text-lg font-bold text-gray-900 truncate max-w-md">Day {day}: {task.title}</h1>
                    <div className="w-16"></div> {/* Spacer */}
                </div>
            </header>

            <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">

                {/* Module Navigation if multiple modules */}
                {modules.length > 1 && (
                    <div className="flex overflow-x-auto space-x-2 mb-6 pb-2">
                        {modules.map((m, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setCurrentModuleIndex(idx);
                                    setActiveTab('learn');
                                    setQuizSubmitted(false);
                                    setQuizAnswers({});
                                    setQuizScore(0);
                                }}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${currentModuleIndex === idx
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                {m.name || `Module ${idx + 1}`}
                            </button>
                        ))}
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px] flex flex-col">
                    {/* Content Tabs */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('learn')}
                            className={`flex-1 py-4 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === 'learn' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            📖 Learn
                        </button>
                        <button
                            onClick={() => setActiveTab('quiz')}
                            className={`flex-1 py-4 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === 'quiz' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            🧠 Quiz
                        </button>
                        <button
                            onClick={() => setActiveTab('reflect')}
                            className={`flex-1 py-4 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === 'reflect' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            💭 Reflect
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6 md:p-8 flex-1 overflow-y-auto">

                        {/* LEARN TAB */}
                        {activeTab === 'learn' && currentModule && (
                            <div className="prose prose-teal max-w-none">
                                <h2 className="text-2xl font-bold mb-4">{currentModule.name}</h2>

                                {/* Estimated Read Time */}
                                {currentModule.estimatedReadTime && (
                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                                        <span className="flex items-center gap-1">
                                            ⏱️ {currentModule.estimatedReadTime}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            🏆 {currentModule.points} XP
                                        </span>
                                    </div>
                                )}

                                {/* NEW FORMAT: Comprehensive Content with Sections */}
                                {currentModule.content?.overview && (
                                    <React.Fragment>
                                        {/* Overview */}
                                        <div className="mb-8">
                                            <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                                                {currentModule.content.overview}
                                            </p>
                                        </div>

                                        {/* Content Sections */}
                                        {currentModule.content.sections?.map((section, idx) => (
                                            <div key={idx} className="mb-10">
                                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                                    <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold mr-3">
                                                        {idx + 1}
                                                    </span>
                                                    {section.title}
                                                </h3>

                                                <div className="pl-11">
                                                    <p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-line">
                                                        {section.content}
                                                    </p>

                                                    {/* Examples */}
                                                    {section.examples?.map((example, exIdx) => (
                                                        <div key={exIdx} className="bg-blue-50 border-l-4 border-blue-400 p-5 mb-4 rounded-r-lg">
                                                            <h4 className="font-semibold text-blue-900 mb-2">
                                                                📖 Example: {example.scenario}
                                                            </h4>
                                                            <p className="text-blue-800 text-sm mb-3">
                                                                <strong>Situation:</strong> {example.analysis}
                                                            </p>
                                                            <p className="text-blue-800 text-sm">
                                                                <strong>Impact:</strong> {example.outcome}
                                                            </p>
                                                        </div>
                                                    ))}

                                                    {/* Real World Cases */}
                                                    {section.realWorldCases?.map((case_, caseIdx) => (
                                                        <div key={caseIdx} className="bg-purple-50 border-l-4 border-purple-400 p-4 mb-3 rounded-r-lg">
                                                            <p className="text-purple-800 text-sm">
                                                                💡 {case_}
                                                            </p>
                                                        </div>
                                                    ))}

                                                    {/* Practical Steps */}
                                                    {section.practicalSteps && (
                                                        <div className="bg-green-50 border border-green-200 rounded-lg p-5 mt-4">
                                                            <h4 className="font-semibold text-green-900 mb-3">
                                                                ✅ Practical Steps
                                                            </h4>
                                                            <ul className="space-y-2">
                                                                {section.practicalSteps.map((step, stepIdx) => (
                                                                    <li key={stepIdx} className="flex items-start text-green-800 text-sm">
                                                                        <span className="mr-2 text-green-600 font-bold">{stepIdx + 1}.</span>
                                                                        {step}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Key Takeaways (at the end for new format) */}
                                        {currentModule.content.keyTakeaways && (
                                            <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-6 rounded-lg border-2 border-teal-200 my-8">
                                                <h3 className="text-teal-900 font-bold mb-4 flex items-center text-lg">
                                                    <span className="text-2xl mr-2">💡</span> Key Takeaways
                                                </h3>
                                                <ul className="space-y-3">
                                                    {currentModule.content.keyTakeaways.map((point, i) => (
                                                        <li key={i} className="flex items-start">
                                                            <span className="mr-3 text-teal-600 font-bold text-lg">✓</span>
                                                            <span className="text-teal-900">{point}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Further Reading */}
                                        {currentModule.content.furtherReading && (
                                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-6">
                                                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                                                    <span className="text-xl mr-2">📚</span> Further Reading
                                                </h3>
                                                <div className="space-y-3">
                                                    {currentModule.content.furtherReading.map((book, idx) => (
                                                        <div key={idx} className="border-l-4 border-gray-400 pl-4">
                                                            <p className="font-semibold text-gray-900">
                                                                "{book.title}" by {book.author}
                                                            </p>
                                                            <p className="text-sm text-gray-600 mt-1">{book.why}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </React.Fragment>
                                )}

                                {/* OLD FORMAT: Backward Compatibility */}
                                {!currentModule.content?.overview && currentModule.content?.intro && (
                                    <React.Fragment>
                                        <p className="text-lg text-gray-700 mb-6">{currentModule.content.intro}</p>

                                        {currentModule.content?.topics && (
                                            <div className="mb-8">
                                                <h3 className="text-lg font-semibold mb-3">Key Topics</h3>
                                                <ul className="space-y-2">
                                                    {currentModule.content.topics.map((topic, i) => (
                                                        <li key={i} className="flex items-start">
                                                            <span className="mr-2 text-teal-500">•</span>
                                                            {topic}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {currentModule.content?.keyPoints && (
                                            <div className="bg-teal-50 p-6 rounded-lg border border-teal-100 my-6">
                                                <h3 className="text-teal-900 font-bold mb-3 flex items-center">
                                                    <span className="text-xl mr-2">💡</span> Key Takeaways

                                                </h3>
                                                <ul className="space-y-2">
                                                    {currentModule.content.keyPoints.map((point, i) => (
                                                        <li key={i} className="text-teal-800">{point}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </React.Fragment>
                                )}

                                <GeminiDeepDive currentDayContent={currentModule.content} />
                            </div>
                        )}

                        {/* QUIZ TAB */}
                        {activeTab === 'quiz' && currentModule?.quiz && (
                            <div className="max-w-2xl mx-auto">
                                <h2 className="text-2xl font-bold mb-6">Knowledge Check</h2>
                                <div className="space-y-8">
                                    {currentModule.quiz.map((q, qIdx) => (
                                        <div key={qIdx} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                            <p className="font-medium text-lg mb-4">{q.question}</p>
                                            <div className="space-y-3">
                                                {q.options.map((opt, oIdx) => {
                                                    const isSelected = quizAnswers[qIdx] === oIdx;
                                                    const isCorrect = q.correct === oIdx;

                                                    let buttonStyle = "border-gray-300 hover:border-teal-500 hover:bg-white";
                                                    if (quizSubmitted) {
                                                        if (isCorrect) buttonStyle = "bg-green-100 border-green-500 text-green-800";
                                                        else if (isSelected) buttonStyle = "bg-red-100 border-red-500 text-red-800";
                                                    } else if (isSelected) {
                                                        buttonStyle = "border-teal-600 bg-teal-50 text-teal-800 ring-1 ring-teal-600";
                                                    }

                                                    return (
                                                        <button
                                                            key={oIdx}
                                                            onClick={() => !quizSubmitted && setQuizAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                                                            className={`w-full text-left p-4 rounded-lg border transition-all ${buttonStyle}`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {quizSubmitted && (
                                                <div className={`mt-4 p-4 rounded text-sm ${q.correct === quizAnswers[qIdx] ? 'bg-green-50 text-green-800' : 'bg-blue-50 text-blue-800'}`}>
                                                    <strong>Explanation:</strong> {q.explanation}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {!quizSubmitted && (
                                    <button
                                        onClick={handleQuizSubmit}
                                        className="mt-8 w-full py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition-colors"
                                    >
                                        Check Answers
                                    </button>
                                )}
                                {quizSubmitted && (
                                    <div className="mt-8 text-center">
                                        <p className="text-lg font-bold mb-4">
                                            You scored {quizScore}/{currentModule.quiz.length}
                                        </p>
                                        <button
                                            onClick={() => setActiveTab('reflect')}
                                            className="px-8 py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition-colors"
                                        >
                                            Continue to Reflection
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* REFLECT TAB */}
                        {activeTab === 'reflect' && currentModule?.exercise && (
                            <div className="max-w-2xl mx-auto">
                                <h2 className="text-2xl font-bold mb-2">{currentModule.exercise.title}</h2>
                                <p className="text-gray-600 mb-6">{currentModule.exercise.instructions || "Reflect on the following prompts:"}</p>

                                <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 mb-6">
                                    <ul className="space-y-4">
                                        {currentModule.exercise.prompts?.map((prompt, i) => (
                                            <li key={i} className="font-medium text-indigo-900">
                                                {prompt}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <textarea
                                    value={reflection}
                                    onChange={(e) => setReflection(e.target.value)}
                                    placeholder="Write your reflections here..."
                                    className="w-full h-64 p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />

                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={handleComplete}
                                        disabled={completing || reflection.length < 10}
                                        className={`px-8 py-3 rounded-lg font-bold shadow-lg transition-transform transform hover:scale-105 ${completing || reflection.length < 10
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-teal-600 text-white hover:bg-teal-700'
                                            }`}
                                    >
                                        {completing ? 'Completing...' : 'Complete Lesson'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {!currentModule && (
                            <div className="text-center py-12 text-gray-500">
                                Select a module to begin learning.
                            </div>
                        )}
                    </div>
                </div>

            </main >
        </div >
    );
}
