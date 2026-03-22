import React, { useState, useEffect, useRef } from 'react';
import { Droplets, Activity, Wind, PauseCircle } from 'lucide-react';

export default function TippSkill() {
    const [activeTab, setActiveTab] = useState('Temperature');
    
    const tabs = [
        { id: 'Temperature', icon: Droplets },
        { id: 'Intense Exercise', icon: Activity },
        { id: 'Paced Breathing', icon: Wind },
    ];

    return (
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-4">
            <h3 className="text-xl font-bold text-blue-800 flex items-center gap-2 mb-2">
                <Droplets className="w-6 h-6" />
                The TIPP Technique
            </h3>
            <p className="text-sm text-blue-700 mb-4">
                Rapidly calm your nervous system by changing your body's physiology.
            </p>

            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition ${
                            activeTab === tab.id 
                                ? 'bg-blue-600 text-white shadow-sm' 
                                : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-100'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.id}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-lg p-5 shadow-sm border border-blue-50 min-h-[220px]">
                {activeTab === 'Temperature' && (
                    <div className="animate-fade-in">
                        <h4 className="font-bold text-lg text-gray-800 mb-2">Temperature Change</h4>
                        <p className="text-gray-600 mb-4">
                            Hold an ice cube in your hand, or splash cold water on your face. Try holding your breath and plunging your face into a bowl of cold water for 30 seconds.
                        </p>
                        <div className="bg-indigo-50 text-indigo-800 p-3 rounded-md text-sm italic">
                            <strong>Why it works:</strong> This activates the "dive reflex," rapidly slowing your heart rate below your baseline resting rate and instantly calming your nervous system.
                        </div>
                    </div>
                )}
                
                {activeTab === 'Intense Exercise' && (
                    <div className="animate-fade-in">
                        <h4 className="font-bold text-lg text-gray-800 mb-2">Intense Exercise</h4>
                        <p className="text-gray-600 mb-4">
                            Engage in a short burst of vigorous activity for 10-15 minutes. Try doing jumping jacks, sprinting in place, running up and down stairs, or dancing vigorously.
                        </p>
                        <div className="bg-indigo-50 text-indigo-800 p-3 rounded-md text-sm italic">
                            <strong>Why it works:</strong> Exercise helps burn off stress hormones like adrenaline and cortisol, physically burning out the intense emotional energy stored in your body.
                        </div>
                    </div>
                )}

                {activeTab === 'Paced Breathing' && (
                    <PacedBreathing />
                )}
            </div>
        </div>
    );
}

function PacedBreathing() {
    const [phase, setPhase] = useState('Inhale');
    const [secondsLeft, setSecondsLeft] = useState(4);
    const [isActive, setIsActive] = useState(false);
    
    // Inhale 4s, Exhale 6s
    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                setSecondsLeft(prev => {
                    if (prev <= 1) {
                        setPhase(current => current === 'Inhale' ? 'Exhale' : 'Inhale');
                        return phase === 'Inhale' ? 6 : 4;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, phase]);

    const toggleTimer = () => {
        if (!isActive) {
            setPhase('Inhale');
            setSecondsLeft(4);
        }
        setIsActive(!isActive);
    };

    return (
        <div className="flex flex-col items-center animate-fade-in">
            <h4 className="font-bold text-lg text-gray-800 self-start mb-2">Paced Breathing</h4>
            <p className="text-gray-600 text-sm mb-6 self-start">
                Breathe in deeply for 4 seconds, breathe out slowly for 6 seconds. Making the exhale longer stimulates the vagus nerve to calm you down.
            </p>
            
            <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                <div className={`absolute inset-0 rounded-full border-4 ${phase === 'Inhale' ? 'border-blue-400' : 'border-indigo-400'} opacity-20`} />
                <div 
                    className={`absolute inset-0 rounded-full bg-blue-100 transition-transform flex items-center justify-center`}
                    style={{
                        transform: isActive 
                            ? (phase === 'Inhale' ? 'scale(1.2)' : 'scale(0.8)') 
                            : 'scale(1)',
                        transitionDuration: isActive ? (phase === 'Inhale' ? '4s' : '6s') : '0.5s',
                        transitionTimingFunction: 'ease-in-out'
                    }}
                />
                <div className="z-10 text-center">
                    <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">{isActive ? phase : 'Ready'}</div>
                    <div className="text-4xl font-bold text-gray-800">{isActive ? secondsLeft : '4:6'}</div>
                </div>
            </div>

            <button 
                onClick={toggleTimer}
                className={`w-full py-3 rounded-lg font-bold text-white transition ${isActive ? 'bg-gray-500 hover:bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
                {isActive ? 'Stop Breathing Guide' : 'Start Guided Breathing'}
            </button>
        </div>
    );
}
