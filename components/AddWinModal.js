import React, { useState, useEffect } from 'react';
import { SELF_CARE_ACTIVITIES, SELF_CARE_CATEGORIES } from '../lib/selfCareData';
import { useApp } from '../lib/context';

const WIN_TYPES = {
    ACTIVITY: 'activity',
    MOOD: 'mood',
    JOURNAL: 'journal',
    GRATITUDE: 'gratitude',
    SELF_CARE: 'self_care'
};

const ACTIVITIES = [
    { id: 'water', label: 'Drank Water', icon: '💧', xp: 10, benefit: 'Great job! Hydration improves focus and reduces anxiety.' },
    { id: 'gym', label: 'Went to Gym', icon: '🏋️', xp: 10, benefit: 'Virtual high five! Exercise releases endorphins and fights depression.' },
    { id: 'walk', label: 'Took a Walk', icon: '🚶', xp: 10, benefit: 'Way to go! Movement clears the mind and boosts energy.' },
    { id: 'healthy_meal', label: 'Healthy Meal', icon: '🥗', xp: 10, benefit: 'Awesome choice! Nutritious food fuels your brain and body.' },
    { id: 'meds', label: 'Took Meds', icon: '💊', xp: 10, benefit: 'Proud of you! Consistency is key to stability and wellness.' },
    { id: 'read', label: 'Read', icon: '📖', xp: 10, benefit: 'Fantastic! Reading reduces stress and expands perspective.' },
    { id: 'clean', label: 'Cleaned', icon: '🧹', xp: 10, benefit: 'So fresh! A tidy space promotes a calm mind.' },
    { id: 'sleep', label: 'Good Sleep', icon: '😴', xp: 10, benefit: 'Well done! Rest is essential for emotional regulation.' }
];

const EMOTION_LAYERS = {
    'Joy': ['Happy', 'Excited', 'Grateful', 'Proud', 'Optimistic', 'Content', 'Relieved'],
    'Sadness': ['Lonely', 'Depressed', 'Hurt', 'Disappointed', 'Grief', 'Tired', 'Gloomy'],
    'Anger': ['Frustrated', 'Annoyed', 'Resentful', 'Furious', 'Jealous', 'Irritated'],
    'Fear': ['Anxious', 'Insecure', 'Overwhelmed', 'Scared', 'Worried', 'Panic'],
    'Disgust': ['Disapproving', 'Disappointed', 'Awful', 'Avoidance', 'Sick'],
    'Surprise': ['Startled', 'Confused', 'Amazed', 'Excited', 'Shocked']
};

const BODY_TAGS = ['#headache', '#back_pain', '#stomach', '#chest', '#legs', '#neck', '#fatigue', '#tension'];
const JOURNAL_TAGS = ['#anxiety', '#focus', '#win', '#family', '#work', '#sleep', '#grateful', '#stress'];

export default function AddWinModal({ isOpen, onClose, initialTab = WIN_TYPES.ACTIVITY }) {
    const { addWin } = useApp();
    const [activeTab, setActiveTab] = useState(initialTab);
    const [selectedActivities, setSelectedActivities] = useState([]);
    const [journalText, setJournalText] = useState('');
    const [gratitudeList, setGratitudeList] = useState(['', '', '']);
    const [showSuccess, setShowSuccess] = useState(false);

    // Mood State
    const [selectedPrimaryEmotion, setSelectedPrimaryEmotion] = useState(null);
    const [useCBT, setUseCBT] = useState(false);
    const [cbtCatch, setCbtCatch] = useState('');
    const [cbtCheck, setCbtCheck] = useState('');
    const [cbtChange, setCbtChange] = useState('');

    // Self-Care State
    const [selectedSelfCare, setSelectedSelfCare] = useState(null);
    const [filterTime, setFilterTime] = useState('');
    const [filterCost, setFilterCost] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && initialTab) {
            const type = Object.values(WIN_TYPES).find(t => t === initialTab);
            if (type) setActiveTab(type);
        } else if (isOpen) {
            setActiveTab(WIN_TYPES.ACTIVITY);
        }
        // Reset mood state on open
        if (isOpen) {
            setSelectedPrimaryEmotion(null);
        }
    }, [isOpen, initialTab]);

    if (!isOpen) return null;

    const toggleActivity = (activity) => {
        if (selectedActivities.find(a => a.id === activity.id)) {
            setSelectedActivities(selectedActivities.filter(a => a.id !== activity.id));
        } else {
            setSelectedActivities([...selectedActivities, activity]);
        }
    };

    const handleEmotionSelect = (emotion, isPrimary) => {
        if (isPrimary) {
            setSelectedPrimaryEmotion(emotion);
        } else {
            setJournalText(prev => {
                const prefix = prev && !prev.startsWith('Mood:') ? prev + '\n' : '';
                return `${prefix}Mood: ${selectedPrimaryEmotion} (${emotion}) - `;
            });
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            if (activeTab === WIN_TYPES.ACTIVITY) {
                if (selectedActivities.length === 0) {
                    setIsSubmitting(false);
                    return;
                }
                // We'll process these in the background to be 'instant' for the user
                const promises = selectedActivities.map(activity => {
                    const winData = {
                        type: WIN_TYPES.ACTIVITY,
                        timestamp: new Date().toISOString(),
                        activity_type: activity.id,
                        label: activity.label,
                        icon: activity.icon,
                        xp: activity.xp,
                        benefit: activity.benefit
                    };
                    return addWin(winData);
                });
                await Promise.all(promises);
            } else {
                let winData = {
                    type: activeTab === WIN_TYPES.MOOD ? 'journal' : activeTab,
                    timestamp: new Date().toISOString()
                };

                switch (activeTab) {
                    case WIN_TYPES.MOOD:
                        if (!journalText.trim() && !useCBT) return;
                        let finalContent = journalText;
                        if (useCBT) {
                            const cbtText = `\n\nCBT Reflection:\nCatch it: ${cbtCatch}\nCheck it: ${cbtCheck}\nChange it: ${cbtChange}`;
                            finalContent = finalContent ? finalContent + cbtText : cbtText;
                        }
                        winData = { ...winData, content: finalContent, xp: useCBT ? 30 : 15, label: 'Mood Check-in', icon: '🎭' };
                        break;
                    case WIN_TYPES.JOURNAL:
                        if (!journalText.trim()) return;
                        winData = { ...winData, content: journalText, xp: 15 };
                        break;
                    case WIN_TYPES.GRATITUDE:
                        const filledGratitudes = gratitudeList.filter(g => g.trim());
                        if (filledGratitudes.length === 0) return;
                        winData = { ...winData, content: filledGratitudes, xp: 20 };
                        break;
                    case WIN_TYPES.SELF_CARE:
                        if (!selectedSelfCare) return;
                        winData = {
                            ...winData,
                            type: 'journal',
                            content: `Completed self-care activity: ${selectedSelfCare.label}`,
                            label: selectedSelfCare.label,
                            icon: '🧘',
                            xp: selectedSelfCare.xp,
                            win_type: 'self_care'
                        };
                        break;
                }
                await addWin(winData);
            }
            // Close immediately/seamlessly
            handleDone();
        } catch (error) {
            console.error("Failed to add win:", error);
            setIsSubmitting(false); // Only keep open if there's a real error to retry
        }
    };

    const resetForm = () => {
        setSelectedActivities([]);
        setJournalText('');
        setGratitudeList(['', '', '']);
        setSelectedSelfCare(null);
        setFilterTime('');
        setFilterCost('');
        setSelectedPrimaryEmotion(null);
        setUseCBT(false);
        setCbtCatch('');
        setCbtCheck('');
        setCbtChange('');
        setActiveTab(WIN_TYPES.ACTIVITY);
        setShowSuccess(false);
    };

    const handleAddAnother = () => {
        setSelectedActivities([]);
        setJournalText('');
        setGratitudeList(['', '', '']);
        setSelectedSelfCare(null);
        setSelectedPrimaryEmotion(null);
        setUseCBT(false);
        setCbtCatch('');
        setCbtCheck('');
        setCbtChange('');
        setShowSuccess(false);
    };

    const handleDone = () => {
        resetForm();
        onClose();
    };

    const filteredSelfCare = SELF_CARE_ACTIVITIES.filter(activity => {
        if (filterTime && activity.time !== filterTime) return false;
        if (filterCost && activity.cost !== filterCost) return false;
        return true;
    });

    if (showSuccess) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-fade-in-up p-6 text-center">
                    <div className="mb-4 text-5xl">🎉</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Wins Logged!</h2>

                    {activeTab === WIN_TYPES.ACTIVITY && selectedActivities.length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
                            <p className="text-blue-800 font-medium italic">
                                "{selectedActivities[0].benefit}"
                                {selectedActivities.length > 1 && <span className="block text-xs mt-1 not-italic opacity-75">(and {selectedActivities.length - 1} more)</span>}
                            </p>
                        </div>
                    )}

                    {activeTab !== WIN_TYPES.ACTIVITY && (
                        <p className="text-gray-600 mb-6">Great job taking a positive step for yourself.</p>
                    )}

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleAddAnother}
                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all"
                        >
                            Add Another Win
                        </button>
                        <button
                            onClick={handleDone}
                            className="w-full py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-all"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-blue-600 p-6 text-white flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold">PMA Log</h2>
                        <p className="text-blue-100 text-sm">Every positive action counts!</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:bg-blue-700 p-2 rounded-full transition">
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 shrink-0 overflow-x-auto">
                    {Object.values(WIN_TYPES).map(type => (
                        <button
                            key={type}
                            onClick={() => setActiveTab(type)}
                            className={`flex-1 py-4 px-2 text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${activeTab === type
                                ? 'text-blue-600 border-b-4 border-blue-600 bg-blue-50'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {type.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {activeTab === WIN_TYPES.ACTIVITY && (
                        <div className="flex flex-col gap-4">
                            <p className="text-sm text-gray-500 font-medium">Select all that apply:</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {ACTIVITIES.map(activity => {
                                    const isSelected = selectedActivities.find(a => a.id === activity.id);
                                    return (
                                        <button
                                            key={activity.id}
                                            onClick={() => toggleActivity(activity)}
                                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${isSelected
                                                ? 'border-blue-500 bg-blue-50 shadow-md scale-105'
                                                : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <span className="text-4xl mb-2">{activity.icon}</span>
                                            <span className="text-xs font-bold text-center text-gray-700">{activity.label}</span>
                                            <span className="text-[10px] font-bold text-blue-500 mt-1">+{activity.xp} XP</span>
                                            {isSelected && <div className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full text-white text-[10px] flex items-center justify-center">✓</div>}
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-xs text-gray-400 text-center mt-4 italic">
                                * You can add or update these in <button onClick={() => window.location.href = '/settings'} className="underline hover:text-blue-500">Settings</button>
                            </p>
                        </div>
                    )}

                    {activeTab === WIN_TYPES.MOOD && (
                        <div className="space-y-4">
                            <div className="text-center mb-4">
                                <h3 className="text-lg font-bold text-gray-800">
                                    {selectedPrimaryEmotion ? `How does ${selectedPrimaryEmotion} feel?` : 'How are you feeling?'}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {selectedPrimaryEmotion ? 'Select a specific emotion.' : 'Select an emotion to start your check-in.'}
                                </p>
                                {selectedPrimaryEmotion && (
                                    <button
                                        onClick={() => setSelectedPrimaryEmotion(null)}
                                        className="text-xs text-blue-500 underline mt-1"
                                    >
                                        ← Back to all emotions
                                    </button>
                                )}
                            </div>

                            {/* Feelings Wheel / Grid */}
                            {!selectedPrimaryEmotion ? (
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    {[
                                        { label: 'Joy', icon: '😄', color: 'bg-yellow-100 border-yellow-400 text-yellow-800' },
                                        { label: 'Sadness', icon: '😢', color: 'bg-blue-100 border-blue-400 text-blue-800' },
                                        { label: 'Anger', icon: '😠', color: 'bg-red-100 border-red-400 text-red-800' },
                                        { label: 'Fear', icon: '😨', color: 'bg-purple-100 border-purple-400 text-purple-800' },
                                        { label: 'Disgust', icon: '🤢', color: 'bg-green-100 border-green-400 text-green-800' },
                                        { label: 'Surprise', icon: '😲', color: 'bg-orange-100 border-orange-400 text-orange-800' }
                                    ].map(emotion => (
                                        <button
                                            key={emotion.label}
                                            onClick={() => handleEmotionSelect(emotion.label, true)}
                                            className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center transition-all hover:scale-105 ${emotion.color} opacity-90 hover:opacity-100`}
                                        >
                                            <span className="text-2xl mb-1">{emotion.icon}</span>
                                            <span className="text-xs font-bold">{emotion.label}</span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-3 mb-4 animate-fade-in-up">
                                    {EMOTION_LAYERS[selectedPrimaryEmotion].map(subEmotion => (
                                        <button
                                            key={subEmotion}
                                            onClick={() => handleEmotionSelect(subEmotion, false)}
                                            className="p-3 rounded-xl border-2 border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50 transition-all text-sm font-medium text-gray-700"
                                        >
                                            {subEmotion}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <textarea
                                value={journalText}
                                onChange={(e) => setJournalText(e.target.value)}
                                placeholder="Elaborate on your feelings (optional)..."
                                className="w-full h-24 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none text-gray-700 text-sm"
                            />

                            {/* CBT Integration */}
                            {['Sadness', 'Anger', 'Fear', 'Disgust'].includes(selectedPrimaryEmotion) && (
                                <div className="mt-4 border-t border-gray-100 pt-4">
                                    <label className="flex items-center gap-2 cursor-pointer mb-4">
                                        <input type="checkbox" checked={useCBT} onChange={(e) => setUseCBT(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                                        <span className="text-sm font-bold text-gray-800">Process this with CBT (Catch, Check, Change)</span>
                                        <span className="ml-auto text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">+15 XP</span>
                                    </label>
                                    
                                    {useCBT && (
                                        <div className="space-y-3 animate-fade-in-up">
                                            <div>
                                                <label className="text-xs font-bold text-gray-700 block mb-1">Catch It (What thought triggered this?)</label>
                                                <textarea value={cbtCatch} onChange={e => setCbtCatch(e.target.value)} className="w-full h-16 p-3 border border-gray-200 focus:border-blue-400 rounded-lg text-sm outline-none resize-none" placeholder="e.g. 'I messed up and everyone hates me.'" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-700 block mb-1">Check It (Is this 100% true? Evidence?)</label>
                                                <textarea value={cbtCheck} onChange={e => setCbtCheck(e.target.value)} className="w-full h-16 p-3 border border-gray-200 focus:border-blue-400 rounded-lg text-sm outline-none resize-none" placeholder="e.g. 'I made a mistake, but my friend said it was okay.'" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-700 block mb-1">Change It (What is a more balanced thought?)</label>
                                                <textarea value={cbtChange} onChange={e => setCbtChange(e.target.value)} className="w-full h-16 p-3 border border-gray-200 focus:border-blue-400 rounded-lg text-sm outline-none resize-none" placeholder="e.g. 'Making mistakes is human, I am still learning.'" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Hashtags - Two Rows */}
                            <div className="space-y-2">
                                <div className="flex flex-wrap gap-2">
                                    {JOURNAL_TAGS.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => setJournalText(prev => prev + (prev ? ' ' : '') + tag)}
                                            className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg hover:bg-blue-100 transition-colors"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {BODY_TAGS.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => setJournalText(prev => prev + (prev ? ' ' : '') + tag)}
                                            className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg hover:bg-purple-100 transition-colors"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="text-right text-xs text-gray-400">
                                +15 XP
                            </div>
                        </div>
                    )}

                    {activeTab === WIN_TYPES.JOURNAL && (
                        <div>
                            <textarea
                                value={journalText}
                                onChange={(e) => setJournalText(e.target.value)}
                                placeholder="What's on your mind?..."
                                className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none text-gray-700 mb-2"
                            />

                            <div className="flex flex-wrap gap-2 mb-2">
                                {JOURNAL_TAGS.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => setJournalText(prev => prev + (prev ? ' ' : '') + tag)}
                                        className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg hover:bg-blue-100 transition-colors"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>

                            <div className="text-right text-xs text-gray-400">
                                +15 XP
                            </div>
                        </div>
                    )}

                    {activeTab === WIN_TYPES.GRATITUDE && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500 font-medium">I am grateful for...</p>
                            {gratitudeList.map((item, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <span className="text-blue-500 font-bold">{index + 1}.</span>
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => {
                                            const newList = [...gratitudeList];
                                            newList[index] = e.target.value;
                                            setGratitudeList(newList);
                                        }}
                                        placeholder="Enter something you're grateful for"
                                        className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            ))}
                            <div className="text-right text-xs text-gray-400">
                                +20 XP
                            </div>
                        </div>
                    )}

                    {activeTab === WIN_TYPES.SELF_CARE && (
                        <div className="space-y-4">
                            <div className="flex gap-2 mb-4">
                                <select
                                    value={filterTime}
                                    onChange={(e) => setFilterTime(e.target.value)}
                                    className="p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">All Times</option>
                                    {SELF_CARE_CATEGORIES.TIME.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <select
                                    value={filterCost}
                                    onChange={(e) => setFilterCost(e.target.value)}
                                    className="p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">All Costs</option>
                                    {SELF_CARE_CATEGORIES.COST && SELF_CARE_CATEGORIES.COST.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                                {filteredSelfCare.length === 0 ? (
                                    <p className="text-center text-gray-500 py-4">No activities match your filters.</p>
                                ) : (
                                    filteredSelfCare.map(activity => (
                                        <button
                                            key={activity.id}
                                            onClick={() => setSelectedSelfCare(activity)}
                                            className={`w-full text-left p-3 rounded-xl border transition-all flex justify-between items-center ${selectedSelfCare?.id === activity.id
                                                ? 'border-purple-500 bg-purple-50 shadow-sm'
                                                : 'border-gray-100 hover:border-purple-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div>
                                                <div className="font-bold text-gray-800">{activity.label}</div>
                                                <div className="text-xs text-gray-500">{activity.time} • +{activity.xp} XP</div>
                                            </div>
                                            {selectedSelfCare?.id === activity.id && <span className="text-purple-600 font-bold">✓</span>}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 shrink-0">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Saving...' : 'Submit Entry'}
                    </button>
                </div>
            </div>
        </div >
    );
}
