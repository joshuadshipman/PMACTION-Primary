import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useApp } from '../lib/context';
import { db } from '../lib/firebaseClient';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

export default function Assessments() {
    const { user } = useApp();
    const router = useRouter();
    const [assessments, setAssessments] = useState([]);
    const [userHistory, setUserHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch available assessments from Firestore
            const assessmentsRef = collection(db, 'assessments');
            const q = query(
                assessmentsRef,
                where('isPublished', '==', true),
                orderBy('category')
            );

            const querySnapshot = await getDocs(q);
            const assessmentsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            let historyList = [];
            if (user) {
                // Fetch user's history from Firestore
                const historyRef = collection(db, 'user_assessments');
                const historyQ = query(
                    historyRef,
                    where('userId', '==', user.uid),
                    orderBy('completedAt', 'desc')
                );

                const historySnapshot = await getDocs(historyQ);
                historyList = historySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }

            setAssessments(assessmentsList);
            setUserHistory(historyList);
        } catch (error) {
            console.error('Error fetching assessments:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryColor = (category) => {
        const colors = {
            depression: 'bg-blue-100 text-blue-800',
            anxiety: 'bg-purple-100 text-purple-800',
            adhd: 'bg-orange-100 text-orange-800',
            wellness: 'bg-green-100 text-green-800',
            custom: 'bg-gray-100 text-gray-800',
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Head>
                <title>Assessments | PMAction</title>
            </Head>

            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Mental Health Screenings</h1>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-gray-600 hover:text-gray-900 font-medium"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-500">Loading assessments...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Available Assessments List */}
                        <div className="lg:col-span-2 space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900">Available Assessments</h2>
                            <div className="grid gap-6">
                                {assessments.map((assessment) => (
                                    <div key={assessment.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(assessment.category)} mb-3 capitalize`}>
                                                    {assessment.category}
                                                </span>
                                                <h3 className="text-lg font-bold text-gray-900">{assessment.name}</h3>
                                                <p className="mt-2 text-gray-600 text-sm leading-relaxed">{assessment.description}</p>
                                                <div className="mt-4 flex items-center text-sm text-gray-500 space-x-4">
                                                    <span className="flex items-center">
                                                        📝 {assessment.total_questions} Questions
                                                    </span>
                                                    <span className="flex items-center">
                                                        ⏱️ ~{Math.ceil(assessment.total_questions * 0.5)} mins
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => router.push(`/quiz/${assessment.slug}`)}
                                                className="ml-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                                            >
                                                Start
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* History Sidebar */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900">Your History</h2>
                            {userHistory.length === 0 ? (
                                <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
                                    <p>No assessments taken yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {userHistory.map((attempt) => (
                                        <div key={attempt.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-medium text-gray-900">{attempt.assessmentName || 'Assessment'}</span>
                                                <span className="text-xs text-gray-500">
                                                    {attempt.completedAt?.toDate ? attempt.completedAt.toDate().toLocaleDateString() : new Date(attempt.completedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Score</p>
                                                    <p className="text-2xl font-bold text-indigo-600">{attempt.totalScore}</p>
                                                </div>
                                                {attempt.isFlaggedCrisis && (
                                                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                                                        Flagged
                                                    </span>
                                                )}
                                            </div>
                                            {attempt.interpretation && (
                                                <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                                    {attempt.interpretation}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
