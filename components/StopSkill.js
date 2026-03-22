import React, { useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

const stopSteps = [
    {
        letter: 'S',
        title: 'Stop',
        desc: "Freeze completely. Don't move a muscle, don't say anything. Just stop.",
        action: "Pause whatever you are doing right now."
    },
    {
        letter: 'T',
        title: 'Take a step back',
        desc: "Literally or figuratively create some space. Leave the room or just take a deep breath.",
        action: "Create distance between yourself and the situation."
    },
    {
        letter: 'O',
        title: 'Observe',
        desc: "Notice what is happening inside and around you. What are you feeling? What are you thinking?",
        action: "Describe the facts to yourself without judgment."
    },
    {
        letter: 'P',
        title: 'Proceed mindfully',
        desc: "Once you're calmer, move forward with intention. Act in a way that aligns with your values.",
        action: "Ask yourself: 'What is the most effective thing I can do right now?'"
    }
];

export default function StopSkill() {
    const [currentStep, setCurrentStep] = useState(0);

    const nextStep = () => {
        if (currentStep < stopSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const reset = () => setCurrentStep(0);

    return (
        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
            <h3 className="text-xl font-bold text-red-800 flex items-center gap-2 mb-4">
                <AlertTriangle className="w-6 h-6" />
                The STOP Skill
            </h3>
            <p className="text-sm text-red-700 mb-6">
                Use this skill when you feel your emotions are about to take control and you need an emergency handbrake.
            </p>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-red-50">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center text-2xl font-bold font-serif">
                        {stopSteps[currentStep].letter}
                    </div>
                    <div>
                        <h4 className="text-xl font-bold text-gray-800">{stopSteps[currentStep].title}</h4>
                    </div>
                </div>
                
                <p className="text-gray-700 text-lg mb-4">{stopSteps[currentStep].desc}</p>
                <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm italic border-l-4 border-blue-400">
                    <strong>Action:</strong> {stopSteps[currentStep].action}
                </div>

                <div className="mt-6 flex justify-between items-center">
                    <div className="flex gap-1">
                        {stopSteps.map((_, idx) => (
                            <div key={idx} className={`h-2 w-8 rounded-full ${idx === currentStep ? 'bg-red-600' : idx < currentStep ? 'bg-red-300' : 'bg-gray-200'}`} />
                        ))}
                    </div>
                    
                    {currentStep < stopSteps.length - 1 ? (
                        <button
                            onClick={nextStep}
                            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition"
                        >
                            Next <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={reset}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
                        >
                            <CheckCircle2 className="w-4 h-4" /> Restart
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
