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
    updateDoc, 
    orderBy, 
    limit, 
    serverTimestamp 
} from 'firebase/firestore';

export default function QuizPage() {
    const router = useRouter();
    const { slug } = router.query;
    const { user } = useApp();

    const [assessment, setAssessment] = useState(null);
    const [questions, setQuestions] = useState([]);

    // SEO Helpers
    const pageTitle = assessment ? `${assessment.name} | PMAction Quiz` : 'Neurodiversity Quiz | PMAction';
    const pageDesc = assessment ? assessment.description : 'Take our neurodiversity-affirming assessments to understand your traits and habits.';
    const [groupedQuestions, setGroupedQuestions] = useState({});
    const [sections, setSections] = useState([]);

    // User State
    const [answers, setAnswers] = useState({});
    const [comments, setComments] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Navigation State
    const [view, setView] = useState('hub'); // 'hub' | 'section' | 'results'
    const [activeSection, setActiveSection] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (router.isReady && slug) {
            fetchQuizData();
        }
    }, [router.isReady, slug]);

    // Save progress periodically or on section exit
    const saveProgress = async (isCompleting = false) => {
        if (!user || !assessment) return;

        try {
            const totalScore = calculateTotalScore();
            const submission = {
                userId: user.uid,
                assessmentId: assessment.id,
                assessmentName: assessment.name,
                responses: { answers, comments },
                totalScore: totalScore,
                updatedAt: serverTimestamp(),
                completedAt: isCompleting && isAllQuestionsAnswered() ? serverTimestamp() : null
            };

            // Check if existing record
            const historyRef = collection(db, 'user_assessments');
            const q = query(
                historyRef,
                where('userId', '==', user.uid),
                where('assessmentId', '==', assessment.id),
                limit(1)
            );

            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                const existingDoc = querySnapshot.docs[0];
                await updateDoc(doc(db, 'user_assessments', existingDoc.id), submission);
            } else {
                // If no existing, add new
                await setDoc(doc(collection(db, 'user_assessments')), {
                    ...submission,
                    createdAt: serverTimestamp()
                });
            }
        } catch (err) {
            console.error("Error saving progress:", err);
        }
    };

    const fetchQuizData = async () => {
        try {
            setLoading(true);
            
            // 1. Fetch Assessment
            const assessmentsRef = collection(db, 'assessments');
            const q = query(assessmentsRef, where('slug', '==', slug), limit(1));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                console.error("Assessment not found");
                setLoading(false);
                return;
            }

            const assessmentDoc = querySnapshot.docs[0];
            const assessmentData = { id: assessmentDoc.id, ...assessmentDoc.data() };
            setAssessment(assessmentData);

            // 2. Fetch Questions
            const questionsRef = collection(db, 'assessment_questions');
            const qQuestions = query(
                questionsRef,
                where('assessment_id', '==', assessmentData.id),
                orderBy('question_number')
            );
            const questionsSnapshot = await getDocs(qQuestions);
            const questionsData = questionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Group by section
            const grouped = {};
            const sectionList = [];
            questionsData.forEach(q => {
                const sec = q.section || "General";
                if (!grouped[sec]) {
                    grouped[sec] = [];
                    sectionList.push(sec);
                }
                grouped[sec].push(q);
            });

            setQuestions(questionsData);
            setGroupedQuestions(grouped);
            setSections(sectionList);

            // 3. Fetch existing answers if logged in
            if (user) {
                const historyRef = collection(db, 'user_assessments');
                const qHistory = query(
                    historyRef,
                    where('userId', '==', user.uid),
                    where('assessmentId', '==', assessmentData.id),
                    limit(1)
                );
                const historySnapshot = await getDocs(qHistory);
                
                if (!historySnapshot.empty) {
                    const userData = historySnapshot.docs[0].data();
                    if (userData?.responses) {
                        setAnswers(userData.responses.answers || {});
                        setComments(userData.responses.comments || {});
                    }
                }
            }

        } catch (error) {
            console.error('Error fetching quiz:', error);
            alert('Failed to load quiz data.');
        } finally {
            setLoading(false);
        }
    };

    const handleStartSection = (section) => {
        setActiveSection(section);
        setView('section');
        // Find first unanswered question in this section or start at 0
        const sectionQs = groupedQuestions[section];
        const firstUnanswered = sectionQs.findIndex(q => !answers[q.question_number - 1]); // question_number is 1-based usually, check logic
        // Actually, let's just create a quick index map.
        // answers keys are INDICES based on the FULL questions array in previous implementation
        // Let's stick to using question ID or global index for answers.
        // Previous implementation: answers[index].

        // We will map local section index to global questions index
        setCurrentQuestionIndex(0);
    };

    const handleAnswer = (val) => {
        const globalIndex = getGlobalIndex(activeSection, currentQuestionIndex);
        setAnswers(prev => ({ ...prev, [globalIndex]: val }));
    };

    const handleComment = (text) => {
        const globalIndex = getGlobalIndex(activeSection, currentQuestionIndex);
        setComments(prev => ({ ...prev, [globalIndex]: text }));
    }

    const getGlobalIndex = (section, localIndex) => {
        if (!section) return 0;
        const q = groupedQuestions[section][localIndex];
        // Find this q in the main questions array to get its original index key
        // Or better, stick to question_number? 
        // Original code used `questions.forEach((q, index) => ... answers[index])`
        // So answers is keyed by the index in the `questions` array (0 to 195)
        return questions.findIndex(item => item.id === q.id);
    };

    const currentGlobalIndex = activeSection ? getGlobalIndex(activeSection, currentQuestionIndex) : 0;
    const currentQData = activeSection ? groupedQuestions[activeSection][currentQuestionIndex] : null;

    const handleNext = async () => {
        const sectionQs = groupedQuestions[activeSection];
        if (currentQuestionIndex < sectionQs.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // End of section
            await saveProgress();
            setView('hub');
            setActiveSection(null);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const getSectionProgress = (section) => {
        const qs = groupedQuestions[section] || [];
        if (qs.length === 0) return 0;
        let answered = 0;
        qs.forEach(q => {
            const globalIndex = questions.findIndex(item => item.id === q.id);
            if (answers[globalIndex]) answered++;
        });
        return Math.round((answered / qs.length) * 100);
    };

    const isAllQuestionsAnswered = () => {
        return questions.every((q, idx) => answers[idx]);
    }

    const calculateTotalScore = () => {
        let total = 0;
        Object.values(answers).forEach(val => {
            total += parseInt(val) || 0;
        });
        return total;
    }

    const handleSubmitAssessment = async () => {
        setSubmitting(true);
        await saveProgress(true); // Mark complete
        setSubmitting(false);
        // Calculate result
        const s = calculateTotalScore();
        setResult({ score: s, interpretation: "Assessment Complete" }); // specialized logic later
        setView('results');
    };

    // --- RENDER ---

    const HeadSEO = () => (
        <Head>
            <title>{pageTitle}</title>
            <meta name="description" content={pageDesc} />
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={pageDesc} />
            <meta property="og:type" content="website" />
            <meta property="og:image" content="https://pmaction.com/og-quiz-default.png" />
            <meta name="twitter:card" content="summary_large_image" />
        </Head>
    );

    if (loading) return (
        <>
            <HeadSEO />
            <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
        </>
    );

    if (view === 'results') {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 text-center">
                <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-3xl font-bold text-indigo-600 mb-4">Assessment Complete</h2>
                    <p className="text-gray-600 mb-8">Score: {result?.score || 0}</p>
                    <button onClick={() => router.push('/assessments')} className="bg-gray-900 text-white px-6 py-2 rounded-lg">Back to Dashboard</button>
                </div>
            </div>
        )
    }

    if (!assessment) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Quiz Not Found</h1>
                <p className="text-gray-600 mb-4">Could not load assessment data. It might not exist or there was a connection error.</p>
                <button onClick={() => router.push('/')} className="px-4 py-2 bg-indigo-600 text-white rounded">Go Home</button>
            </div>
        );
    }

    // HUB VIEW
    if (view === 'hub') {
        const allDone = isAllQuestionsAnswered();
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <button onClick={() => router.push('/assessments')} className="text-gray-500 mb-6 flex items-center">← Back to Assessments</button>

                    <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{assessment.name}</h1>
                        <p className="text-gray-600 max-w-2xl">{assessment.description}</p>

                        <div className="mt-6 flex items-center justify-between bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                            <div className="flex items-center space-x-3">
                                <div className="bg-indigo-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center">
                                    {Math.round((Object.keys(answers).length / questions.length) * 100)}%
                                </div>
                                <div>
                                    <p className="font-semibold text-indigo-900">Overall Progress</p>
                                    <p className="text-sm text-indigo-700">{Object.keys(answers).length} of {questions.length} questions answered</p>
                                </div>
                            </div>
                            {allDone && (
                                <button
                                    onClick={handleSubmitAssessment}
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium shadow-md hover:bg-indigo-700 transition-all"
                                >
                                    Submit Assessment
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sections.map(section => {
                            const progress = getSectionProgress(section);
                            const qCount = groupedQuestions[section].length;
                            return (
                                <button
                                    key={section}
                                    onClick={() => handleStartSection(section)}
                                    className="text-left group bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-indigo-300 hover:shadow-md transition-all duration-200"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">{section}</h3>
                                        {progress === 100 ? (
                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">Completed</span>
                                        ) : progress > 0 ? (
                                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">In Progress</span>
                                        ) : (
                                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">To Do</span>
                                        )}
                                    </div>

                                    <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                                        <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <p className="text-xs text-gray-500 text-right">{progress}% ({Math.round((progress / 100) * qCount)}/{qCount})</p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // SECTION QUIZ VIEW
    // Reuse existing renderer logic but scoped
    const parseQuestion = (questionText) => {
        // Safe check for content types that might not have follow-ups
        if (!questionText) return { mainQuestion: "", followUp: null };

        const followUpMatch = questionText.match(/\(Follow-up:(.+?)\)/);
        if (followUpMatch) {
            const mainQuestion = questionText.replace(/\(Follow-up:(.+?)\)/, '').trim();
            const followUp = followUpMatch[1].trim();
            return { mainQuestion, followUp };
        }
        return { mainQuestion: questionText, followUp: null };
    };

    const { mainQuestion, followUp } = parseQuestion(currentQData.question_text);

    // --- RENDERERS ---

    // 1. Content Slide (Educational Material)
    if (activeSection && currentQData?.response_type === 'content') {
        // Handle both real newlines and literal \n sequences
        const normalizedText = currentQData.question_text.replace(/\\n/g, '\n');
        const lines = normalizedText.split('\n');
        const title = lines[0].replace(/###\s*/, '');
        const body = lines.slice(1).join('\n');

        // Mark as "answered" immediately so they can proceed
        if (!answers[currentGlobalIndex]) {
            // Auto-mark as read
            setTimeout(() => handleAnswer("READ"), 500);
        }

        return (
            <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
                <div className="max-w-2xl w-full">
                    <div className="mb-8">
                        <span className="text-xs font-bold tracking-wider text-indigo-500 uppercase">{activeSection} • Lesson</span>
                        <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-6">{title}</h2>
                        <div className="prose prose-indigo text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">
                            {body}
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-gray-100">
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-indigo-700 hover:scale-[1.02] transition-all"
                        >
                            Continue <span className="text-xl">→</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 2. Journal Activity
    if (activeSection && currentQData?.response_type === 'journal') {
        return (
            <div className="min-h-screen bg-indigo-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
                <div className="max-w-2xl w-full bg-white p-8 rounded-3xl shadow-xl border border-indigo-100">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-4xl">✍️</span>
                        <div>
                            <span className="text-xs font-bold tracking-wider text-indigo-500 uppercase">{activeSection} • Reflection</span>
                            <h2 className="text-2xl font-bold text-gray-900">Journaling Activity</h2>
                        </div>
                    </div>

                    <p className="text-lg text-gray-700 font-medium mb-4">{currentQData.question_text}</p>

                    <textarea
                        value={comments[currentGlobalIndex] || ''}
                        onChange={(e) => {
                            handleComment(e.target.value);
                            // Auto-set "answer" so they can proceed once they type something
                            if (e.target.value.length > 5) handleAnswer("JOURNALED");
                        }}
                        className="w-full h-40 p-4 border-2 border-indigo-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none text-gray-700 text-lg resize-none transition-all"
                        placeholder="Type your thoughts here..."
                    />

                    <div className="flex justify-between items-center mt-8">
                        <span className="text-sm text-gray-400">
                            {comments[currentGlobalIndex]?.length > 0 ? 'Saved to your private journal.' : 'Write a few words to continue...'}
                        </span>
                        <button
                            onClick={async () => {
                                // Save explicit Journal Win
                                if (comments[currentGlobalIndex]) {
                                    try {
                                        // We can integrate with useApp here if needed to log a "Win", but for now just saving to assessment is enough
                                    } catch (e) { }
                                }
                                handleNext();
                            }}
                            disabled={!answers[currentGlobalIndex]} // Button enabled only after typing
                            className={`px-8 py-3 rounded-xl font-bold transition-all ${answers[currentGlobalIndex]
                                ? 'bg-indigo-600 text-white shadow-lg hover:bg-indigo-700'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                        >
                            Save & Continue
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 3. Standard Multiple Choice (Default)
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <button onClick={() => { saveProgress(); setView('hub'); }} className="text-gray-500 hover:text-indigo-600 font-medium flex items-center">
                        ← Back to Hub
                    </button>
                    <span className="text-sm font-medium text-gray-500">{activeSection} • {currentQuestionIndex + 1}/{groupedQuestions[activeSection].length}</span>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 leading-snug">{mainQuestion}</h2>

                    <div className="space-y-3 mb-6">
                        {currentQData.response_options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(option.value)}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${answers[currentGlobalIndex] === option.value
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                                    : 'border-gray-100 hover:border-indigo-200 text-gray-700'
                                    }`}
                            >
                                <span className="font-medium">{option.label}</span>
                            </button>
                        ))}
                    </div>

                    {followUp && (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-4">
                            <p className="text-sm font-bold text-gray-700 mb-2">Follow-up: {followUp}</p>
                            <textarea
                                value={comments[currentGlobalIndex] || ''}
                                onChange={(e) => handleComment(e.target.value)}
                                className="w-full p-2 border rounded"
                                placeholder="Your thoughts..."
                            />
                        </div>
                    )}

                    <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                        <button
                            disabled={currentQuestionIndex === 0}
                            onClick={handlePrev}
                            className={`text-gray-600 ${currentQuestionIndex === 0 ? 'opacity-30' : 'hover:text-gray-900'}`}
                        >
                            Previous
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={!answers[currentGlobalIndex]}
                            className={`px-6 py-2 bg-indigo-600 text-white rounded-lg shadow ${!answers[currentGlobalIndex] ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
                        >
                            {currentQuestionIndex === groupedQuestions[activeSection].length - 1 ? 'Finish Section' : 'Next Question'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
