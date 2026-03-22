import React, { useState } from 'react';

const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'symptoms', label: 'Symptoms' },
    { id: 'causes', label: 'Causes' },
    { id: 'diagnosis', label: 'Diagnosis' },
    { id: 'treatment', label: 'Treatment' },
    { id: 'self_help', label: 'Self-Help' },
    { id: 'living', label: 'Living With' },
    { id: 'supporters', label: 'Supporters' },
    { id: 'research', label: 'Research' },
    { id: 'resources', label: 'Resources' },
    { id: 'related', label: 'Related' }
];

// ... (existing code)

const AGE_GROUPS = [
    { id: 'children', label: 'Children (6-12)' },
    { id: 'teens', label: 'Teens (13-25)' },
    { id: 'adults', label: 'Adults (26+)' },
    { id: 'seniors', label: 'Seniors (65+)' }
];

export default function ConditionDetailView({ condition }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [ageGroup, setAgeGroup] = useState('adults');

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8">
                <h1 className="text-4xl font-bold mb-2">{condition.fullTitle}</h1>
                <p className="text-blue-100 text-lg opacity-90">{condition.title}</p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto border-b border-gray-100 bg-gray-50/50 hide-scrollbar">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-4 font-medium whitespace-nowrap transition-colors border-b-2 ${activeTab === tab.id
                            ? 'border-blue-600 text-blue-600 bg-white'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="p-8 min-h-[400px]">

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-fade-in">
                        <p className="text-xl text-gray-700 leading-relaxed max-w-4xl">{condition.overview}</p>

                        <div className="grid md:grid-cols-2 gap-6 mt-8">
                            <div className="bg-blue-50 p-6 rounded-2xl">
                                <h3 className="font-bold text-blue-900 mb-2">Key Facts</h3>
                                <ul className="space-y-2 text-blue-800">
                                    <li>• {condition.causes.factors[0]}</li>
                                    <li>• Neurodevelopmental condition</li>
                                </ul>
                            </div>
                            <div className="bg-purple-50 p-6 rounded-2xl">
                                <h3 className="font-bold text-purple-900 mb-2">Common Myths</h3>
                                <ul className="space-y-2 text-purple-800">
                                    {condition.causes.myths.slice(0, 3).map((m, i) => <li key={i}>❌ {m}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Symptoms Tab */}
                {activeTab === 'symptoms' && (
                    <div className="animate-fade-in">
                        <div className="flex flex-wrap gap-2 mb-8 bg-gray-100 p-1 rounded-full w-fit">
                            {AGE_GROUPS.map(group => (
                                <button
                                    key={group.id}
                                    onClick={() => setAgeGroup(group.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${ageGroup === group.id
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {group.label}
                                </button>
                            ))}
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {condition.symptoms[ageGroup]?.map((category, idx) => (
                                <div key={idx} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                    <h3 className="font-bold text-lg text-gray-900 mb-4 pb-2 border-b border-gray-200">
                                        {category.category}
                                    </h3>
                                    <ul className="space-y-3">
                                        {category.items.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-gray-700">
                                                <span className="text-blue-500 mt-1">•</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Causes Tab */}
                {activeTab === 'causes' && (
                    <div className="space-y-8 animate-fade-in max-w-4xl">
                        <p className="text-lg text-gray-700">{condition.causes.description}</p>

                        <div>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">🧬 Biological Factors</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                {condition.causes.factors.map((f, i) => (
                                    <div key={i} className="bg-green-50 p-4 rounded-xl text-green-900 font-medium">
                                        {f}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">🚫 What It Is NOT</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                {condition.causes.myths.map((m, i) => (
                                    <div key={i} className="bg-red-50 p-4 rounded-xl text-red-900 flex items-center gap-2">
                                        <span>❌</span> {m}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Diagnosis Tab */}
                {activeTab === 'diagnosis' && (
                    <div className="space-y-8 animate-fade-in max-w-4xl">
                        <div>
                            <h3 className="text-xl font-bold mb-4">The Process</h3>
                            <div className="space-y-4">
                                {condition.diagnosis.process.map((step, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 bg-white border rounded-xl">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                            {i + 1}
                                        </div>
                                        <span className="font-medium text-gray-800">{step}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-amber-50 p-6 rounded-2xl">
                                <h4 className="font-bold text-amber-900 mb-2">Who Can Diagnose?</h4>
                                <ul className="list-disc list-inside space-y-1 text-amber-800">
                                    {condition.diagnosis.professionals.map((p, i) => <li key={i}>{p}</li>)}
                                </ul>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-2xl">
                                <h4 className="font-bold text-gray-900 mb-2">DSM-5 Criteria Highlights</h4>
                                <ul className="list-disc list-inside space-y-1 text-gray-700">
                                    {condition.diagnosis.criteria.map((c, i) => <li key={i}>{c}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Treatment Tab */}
                {activeTab === 'treatment' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Medication */}
                        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                            <h3 className="text-xl font-bold text-blue-900 mb-2 flex items-center gap-2">
                                💊 {condition.treatment.medication.title}
                            </h3>
                            <p className="text-blue-800 mb-4">{condition.treatment.medication.description}</p>
                            <div className="bg-white/60 p-4 rounded-xl">
                                <p className="text-sm font-bold text-blue-900 mb-1">Important Notes:</p>
                                <ul className="list-disc list-inside text-sm text-blue-800">
                                    {condition.treatment.medication.notes.map((n, i) => <li key={i}>{n}</li>)}
                                </ul>
                            </div>
                        </div>

                        {/* Therapy */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">💬 {condition.treatment.therapy.title}</h3>
                            <div className="grid md:grid-cols-3 gap-6">
                                {condition.treatment.therapy.methods.map((method, i) => (
                                    <div key={i} className="bg-white border rounded-xl p-5 shadow-sm">
                                        <h4 className="font-bold text-gray-800 mb-2">{method.name}</h4>
                                        <p className="text-sm text-gray-600">{method.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Lifestyle */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">🥗 {condition.treatment.lifestyle.title}</h3>
                            <div className="flex flex-wrap gap-3">
                                {condition.treatment.lifestyle.items.map((item, i) => (
                                    <span key={i} className="bg-green-100 text-green-800 px-3 py-1.5 rounded-full font-medium text-sm">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Self Help Tab */}
                {activeTab === 'self_help' && (
                    <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
                        {condition.self_help.map((item, i) => (
                            <div key={i} className="bg-white border-2 border-indigo-50 hover:border-indigo-200 transition-colors p-6 rounded-2xl">
                                <h3 className="text-lg font-bold text-indigo-700 mb-2">✅ {item.title}</h3>
                                <p className="text-gray-600">{item.description}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Living With Tab */}
                {activeTab === 'living' && (
                    <div className="space-y-6 animate-fade-in max-w-4xl">
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-8 rounded-2xl shadow-lg">
                            <h3 className="text-2xl font-bold mb-4">Outlook</h3>
                            <p className="text-lg opacity-90">{condition.living_with.outlook}</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4 text-lg">Daily Management</h3>
                                <ul className="space-y-3">
                                    {condition.living_with.daily.map((d, i) => (
                                        <li key={i} className="flex items-center gap-2 text-gray-700">
                                            <span className="text-green-500">✓</span> {d}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4 text-lg">Success Stories</h3>
                                <p className="text-gray-600 italic border-l-4 border-gray-200 pl-4">{condition.living_with.success}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Supporters Tab */}
                {activeTab === 'supporters' && (
                    <div className="animate-fade-in">
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-orange-50 p-6 rounded-2xl">
                                <h3 className="font-bold text-orange-900 mb-4 text-lg">👨‍👩‍👧 For Parents</h3>
                                <ul className="space-y-2 text-orange-800 text-sm">
                                    {condition.supporters.parents.map((s, i) => <li key={i}>• {s}</li>)}
                                </ul>
                            </div>
                            <div className="bg-pink-50 p-6 rounded-2xl">
                                <h3 className="font-bold text-pink-900 mb-4 text-lg">❤️ For Partners</h3>
                                <ul className="space-y-2 text-pink-800 text-sm">
                                    {condition.supporters.partners.map((s, i) => <li key={i}>• {s}</li>)}
                                </ul>
                            </div>
                            <div className="bg-teal-50 p-6 rounded-2xl">
                                <h3 className="font-bold text-teal-900 mb-4 text-lg">🤝 For Friends</h3>
                                <ul className="space-y-2 text-teal-800 text-sm">
                                    {condition.supporters.friends.map((s, i) => <li key={i}>• {s}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Research Tab */}
                {activeTab === 'research' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white border rounded-2xl p-6 shadow-sm">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Key Statistics</h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wide mb-2">Prevalence</h4>
                                        <ul className="list-disc list-inside text-gray-600">
                                            {condition.statistics?.prevalence.map((s, i) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wide mb-2">Treatment Effectiveness</h4>
                                        <ul className="list-disc list-inside text-gray-600">
                                            {condition.statistics?.effectiveness.map((s, i) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
                                <h3 className="text-xl font-bold text-indigo-900 mb-4">🔬 Latest Research</h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-bold text-indigo-800 text-sm uppercase tracking-wide mb-2">Current Focus</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {condition.latest_research?.focus.map((f, i) => (
                                                <span key={i} className="bg-white text-indigo-700 px-3 py-1 rounded-full text-sm border border-indigo-100">{f}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-indigo-800 text-sm uppercase tracking-wide mb-2">Key Findings</h4>
                                        <ul className="space-y-2 text-indigo-800">
                                            {condition.latest_research?.findings.map((f, i) => <li key={i} className="flex gap-2"><span>💡</span> {f}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Resources Tab */}
                {activeTab === 'resources' && (
                    <div className="space-y-8 animate-fade-in">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Trusted Organizations</h3>
                            <div className="space-y-3">
                                {condition.resources.map((res, i) => (
                                    <a key={i} href={res.url} target="_blank" rel="noopener noreferrer" className="block p-4 bg-white border hover:border-blue-500 rounded-xl transition-all hover:shadow-md flex items-center justify-between group">
                                        <span className="font-bold text-gray-800 group-hover:text-blue-600">{res.name}</span>
                                        <span className="text-gray-400 group-hover:text-blue-500">External ↗</span>
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
                            <div className="space-y-4">
                                {condition.faqs.map((faq, i) => (
                                    <div key={i} className="bg-gray-50 p-5 rounded-xl">
                                        <h4 className="font-bold text-gray-800 mb-2">❓ {faq.q}</h4>
                                        <p className="text-gray-600">{faq.a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
