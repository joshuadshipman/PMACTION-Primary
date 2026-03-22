import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { MessageSquare, Bug, Lightbulb, CheckCircle2 } from 'lucide-react';
import { useApp } from '../lib/context';

export default function FeedbackModal({ onClose }) {
    const { user } = useApp();
    const [type, setType] = useState('bug'); // 'bug', 'feature_request', 'general'
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description.trim() || !user) return;
        
        setIsSubmitting(true);
        setError('');

        try {
            const { error: dbError } = await supabase
                .from('user_feedback')
                .insert([{
                    user_id: user.id,
                    type,
                    description: description.trim(),
                    status: 'new'
                }]);

            if (dbError) throw dbError;
            
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err) {
            console.error('Feedback Error:', err);
            setError('Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 relative">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl"
                >
                    &times;
                </button>

                <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <MessageSquare className="text-blue-600" /> Give Feedback
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                    Help us improve PMAction. What are you experiencing?
                </p>

                {success ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in-up">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                        <h3 className="text-xl font-bold text-gray-800">Thank You!</h3>
                        <p className="text-gray-600 mt-2">Your feedback has been received and will be reviewed by our team.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => setType('bug')}
                                className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition ${type === 'bug' ? 'bg-red-50 border-red-500 text-red-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                            >
                                <Bug className="w-5 h-5" />
                                <span className="text-xs font-bold">Issue/Bug</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('feature_request')}
                                className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition ${type === 'feature_request' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                            >
                                <Lightbulb className="w-5 h-5" />
                                <span className="text-xs font-bold">Idea</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('general')}
                                className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition ${type === 'general' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                            >
                                <MessageSquare className="w-5 h-5" />
                                <span className="text-xs font-bold">General</span>
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Details</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                rows={4}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                placeholder={type === 'bug' ? "What went wrong? Steps to reproduce?" : "What's on your mind?"}
                            />
                        </div>

                        {error && <div className="text-red-600 text-sm font-bold">{error}</div>}

                        <button
                            type="sumbit"
                            disabled={isSubmitting || !description.trim()}
                            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:bg-gray-400"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
