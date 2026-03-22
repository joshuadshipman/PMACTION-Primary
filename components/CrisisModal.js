import React, { useState } from 'react';
import StopSkill from './StopSkill';
import TippSkill from './TippSkill';
import { Phone, ShieldAlert } from 'lucide-react';

const CRISIS_RESOURCES = [
    {
        name: "National Suicide Prevention Lifeline",
        phone: "1-800-273-8255",
        link: "https://suicidepreventionlifeline.org/",
        desc: "24/7 free and confidential support for people in distress."
    },
    {
        name: "Text 'HELLO' to 741741",
        phone: "741741",
        link: "https://www.crisistextline.org/",
        desc: "Crisis Text Line: 24/7 support via SMS."
    },
    {
        name: "Emergency Services",
        phone: "911",
        link: "tel:911",
        desc: "Call 911 for emergencies or immediate danger."
    },
];

const CrisisModal = ({ onClose }) => {
    const [view, setView] = useState('skills'); // 'skills' or 'contacts'

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex flex-col items-center justify-end md:justify-center animate-fade-in p-0 md:p-4">
            <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-lg relative max-h-[90vh] flex flex-col">
                
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
                        <ShieldAlert className="text-red-600" />
                        Crisis Support
                    </h2>
                    <button
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition"
                        onClick={onClose}
                        aria-label="Close"
                    >&times;</button>
                </div>

                {/* Tabs */}
                <div className="flex border-b">
                    <button 
                        onClick={() => setView('skills')}
                        className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${view === 'skills' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                    >
                        Immediate Relief Tools
                    </button>
                    <button 
                        onClick={() => setView('contacts')}
                        className={`flex-1 py-3 text-sm font-bold border-b-2 transition flex items-center justify-center gap-2 ${view === 'contacts' ? 'border-red-600 text-red-700' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                    >
                        <Phone className="w-4 h-4" /> Call/Text Now
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
                    {view === 'skills' && (
                        <div className="space-y-6 animate-fade-in">
                            <StopSkill />
                            <TippSkill />
                        </div>
                    )}

                    {view === 'contacts' && (
                        <div className="animate-fade-in">
                            <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-4">
                                <h3 className="text-red-800 font-bold flex items-center gap-2">
                                    <ShieldAlert /> Critical Emergency
                                </h3>
                                <p className="text-sm text-red-700 mt-1">If you are in immediate physical danger, dial 911 immediately.</p>
                            </div>
                            
                            <ul className="mb-4 space-y-3">
                                {CRISIS_RESOURCES.map(resource => (
                                    <li key={resource.name} className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors shadow-sm">
                                        <div className="font-bold text-lg text-gray-800">{resource.name}</div>
                                        <div className="text-sm text-gray-600 mb-3">{resource.desc}</div>
                                        <a 
                                            href={resource.link} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-800"
                                        >
                                            <Phone className="w-4 h-4" /> {resource.phone}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default CrisisModal;
