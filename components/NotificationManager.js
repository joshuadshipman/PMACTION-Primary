import React, { useState, useEffect } from 'react';
import { notificationService } from '../lib/services/notificationService';

export default function NotificationManager() {
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [settings, setSettings] = useState({
        dailyReminder: true,
        reminderTime: '09:00',
        emailNotifications: false,
        pushNotifications: true,
        habitReminders: [] // { id, habitName, days: [], time: '', method: 'push' }
    });

    useEffect(() => {
        setPermissionGranted(notificationService.hasPermission());
        // Load settings from localStorage or Supabase
        const savedSettings = localStorage.getItem('pmaction_notification_settings');
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
    }, []);

    const handleRequestPermission = async () => {
        const granted = await notificationService.requestPermission();
        setPermissionGranted(granted);
        if (granted) {
            notificationService.sendNotification("Notifications Enabled! 🎉", {
                body: "You'll now receive nudges to help you stay on track."
            });
        }
    };

    const updateSetting = (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        localStorage.setItem('pmaction_notification_settings', JSON.stringify(newSettings));
    };

    const addHabitReminder = () => {
        const newReminder = {
            id: Date.now(),
            habitName: 'Drink Water',
            days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            time: '10:00',
            method: 'push'
        };
        updateSetting('habitReminders', [...settings.habitReminders, newReminder]);
    };

    const removeHabitReminder = (id) => {
        updateSetting('habitReminders', settings.habitReminders.filter(r => r.id !== id));
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-blue-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl text-blue-600">
                        🔔
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Notifications & Nudges</h2>
                        <p className="text-sm text-blue-600 font-medium">Customize how we keep you on track</p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* Permission Request */}
                {!permissionGranted && (
                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <p className="font-bold text-yellow-800">Enable Browser Notifications</p>
                                <p className="text-xs text-yellow-700">Required for push reminders to work.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleRequestPermission}
                            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold rounded-lg transition-colors text-sm"
                        >
                            Enable
                        </button>
                    </div>
                )}

                {/* Global Settings */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-gray-800">Daily Reminder</h3>
                            <p className="text-sm text-gray-500">Get a daily nudge to check in 📅</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.dailyReminder}
                                onChange={(e) => updateSetting('dailyReminder', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {settings.dailyReminder && (
                        <div className="ml-8 space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100 animate-fade-in-up">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Reminder Time</label>
                                <input
                                    type="time"
                                    value={settings.reminderTime}
                                    onChange={(e) => updateSetting('reminderTime', e.target.value)}
                                    className="p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">📲</span>
                                    <div>
                                        <p className="text-sm font-bold text-gray-700">Multiple Nudges</p>
                                        <p className="text-xs text-gray-500">Get extra bumps if you miss a check-in</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.multipleNudges || false}
                                        onChange={(e) => updateSetting('multipleNudges', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                                </label>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-gray-800">Email Summaries</h3>
                            <p className="text-sm text-gray-500">Weekly progress reports 📧</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.emailNotifications}
                                onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>

                {/* Habit Reminders */}
                <div className="border-t border-gray-100 pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900 text-lg">Habit Tracking Reminders</h3>
                        <button
                            onClick={addHabitReminder}
                            className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors"
                        >
                            + Add Reminder
                        </button>
                    </div>

                    {settings.habitReminders.length === 0 ? (
                        <p className="text-gray-400 text-sm italic text-center py-4">No specific habit reminders set.</p>
                    ) : (
                        <div className="space-y-3">
                            {settings.habitReminders.map((reminder, index) => (
                                <div key={reminder.id} className="bg-purple-50 border border-purple-100 p-4 rounded-xl relative group">
                                    <button
                                        onClick={() => removeHabitReminder(reminder.id)}
                                        className="absolute top-2 right-2 text-purple-300 hover:text-purple-600 transition-colors"
                                    >
                                        ✕
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-purple-800 mb-1">Habit / Activity</label>
                                            <input
                                                type="text"
                                                value={reminder.habitName}
                                                onChange={(e) => {
                                                    const newReminders = [...settings.habitReminders];
                                                    newReminders[index].habitName = e.target.value;
                                                    updateSetting('habitReminders', newReminders);
                                                }}
                                                className="w-full p-2 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-purple-800 mb-1">Time</label>
                                            <input
                                                type="time"
                                                value={reminder.time}
                                                onChange={(e) => {
                                                    const newReminders = [...settings.habitReminders];
                                                    newReminders[index].time = e.target.value;
                                                    updateSetting('habitReminders', newReminders);
                                                }}
                                                className="w-full p-2 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                            <button
                                                key={day}
                                                onClick={() => {
                                                    const newReminders = [...settings.habitReminders];
                                                    const days = newReminders[index].days;
                                                    if (days.includes(day)) {
                                                        newReminders[index].days = days.filter(d => d !== day);
                                                    } else {
                                                        newReminders[index].days = [...days, day];
                                                    }
                                                    updateSetting('habitReminders', newReminders);
                                                }}
                                                className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${reminder.days.includes(day)
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-white text-purple-400 border border-purple-100'
                                                    }`}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
