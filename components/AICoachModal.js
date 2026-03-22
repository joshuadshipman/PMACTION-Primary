import React, { useState, useRef, useEffect } from 'react';
import { createChat } from '../lib/services/geminiService';
import Spinner from './Spinner';

export const AICoachModal = ({ onClose }) => {
    const [chat, setChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        try {
            const chatInstance = createChat();
            setChat(chatInstance);
            setMessages([{ sender: 'bot', text: "Hello! I'm your AI wellness coach. What's on your mind today?" }]);
        } catch (error) {
            console.error("Failed to initialize AI Coach:", error);
            setMessages([{ sender: 'bot', text: "I'm currently resting or unreachable. Please try again later." }]);
        }
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !chat) return;
        const userMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await chat.sendMessage(input);
            const botMessage = { sender: 'bot', text: response.response.text() };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("AI Coach Error:", error);
            const errorMessage = { sender: 'bot', text: "Sorry, I'm having trouble connecting right now. Please try again later." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-xl p-4 max-w-lg w-full h-[80vh] flex flex-col shadow-2xl">
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                    <h2 className="text-xl font-bold text-blue-600">AI Wellness Coach</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>

                <div className="flex-grow overflow-y-auto pr-2 space-y-4 mb-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-xl ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && <div className="flex justify-start"><Spinner /></div>}
                    <div ref={messagesEndRef} />
                </div>

                <div className="mt-auto flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                        placeholder="Type your message..."
                        className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};
