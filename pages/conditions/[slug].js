
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { CONDITIONS } from '../../lib/conditionsData';
import ConditionDetailView from '../../components/ConditionDetailView';

const ConditionPage = () => {
    const router = useRouter();
    const { slug } = router.query;

    const condition = CONDITIONS.find(c => c.id === slug);

    if (!condition) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-400">Condition Not Found</h1>
                    <button onClick={() => router.push('/library')} className="mt-4 text-blue-600 hover:underline">
                        Return to Library
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Head>
                <title>{condition.title} | PMAction Library</title>
                <meta name="description" content={`Comprehensive guide to ${condition.fullTitle}.`} />
            </Head>

            {/* Simple Top Nav for Back */}
            <nav className="max-w-7xl mx-auto px-4 py-8">
                <button
                    onClick={() => router.push('/library')}
                    className="text-gray-500 hover:text-gray-900 font-medium flex items-center gap-2 transition-colors"
                >
                    &larr; Back to Library
                </button>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ConditionDetailView condition={condition} />
            </main>
        </div>
    );
};

export default ConditionPage;
