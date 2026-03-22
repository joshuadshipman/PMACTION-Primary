import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function VisualTimer({ defaultDurationMinutes = 5, onComplete }) {
    const [durationMinutes, setDurationMinutes] = useState(defaultDurationMinutes);
    const totalSeconds = durationMinutes * 60;
    const [timeLeft, setTimeLeft] = useState(totalSeconds);
    const [isRunning, setIsRunning] = useState(false);
    
    // Convert current time to a percentage for the visual pie chart format 
    // Usually, a full pie represents the full duration. As time depletes, the pie gets smaller.
    const percentage = totalSeconds > 0 ? (timeLeft / totalSeconds) * 100 : 0;

    useEffect(() => {
        let interval;
        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isRunning) {
            setIsRunning(false);
            if (onComplete) onComplete();
        }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft, onComplete]);

    const handleDurationChange = (mins) => {
        setDurationMinutes(mins);
        setTimeLeft(mins * 60);
        setIsRunning(false);
    };

    const toggleTimer = () => setIsRunning(!isRunning);
    
    const resetTimer = () => {
        setIsRunning(false);
        setTimeLeft(totalSeconds);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // calculate circle dash array for visual feedback
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                {/* Background circle */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle 
                        cx="64" cy="64" r={radius} 
                        fill="transparent" 
                        stroke="#f1f5f9" 
                        strokeWidth="12" 
                    />
                    {/* Foreground circle showing time left */}
                    <circle 
                        cx="64" cy="64" r={radius} 
                        fill="transparent" 
                        stroke={percentage < 20 ? "#ef4444" : "#3b82f6"} 
                        strokeWidth="12" 
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000 ease-linear"
                    />
                </svg>
                
                {/* Digital Time output */}
                <div className="z-10 text-center relative">
                    <div className={`text-3xl font-bold font-mono ${percentage < 20 ? 'text-red-600' : 'text-gray-800'}`}>
                        {formatTime(timeLeft)}
                    </div>
                </div>
            </div>

            {/* Duration Presets */}
            {!isRunning && (
                <div className="flex gap-2 mb-4">
                    {[5, 15, 25].map(mins => (
                        <button
                            key={mins}
                            onClick={() => handleDurationChange(mins)}
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${durationMinutes === mins ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                        >
                            {mins}m
                        </button>
                    ))}
                </div>
            )}

            {/* Controls */}
            <div className="flex gap-4">
                <button 
                    onClick={toggleTimer} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-white transition-colors ${isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {isRunning ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Start</>}
                </button>
                <button 
                    onClick={resetTimer}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                    aria-label="Reset Timer"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
