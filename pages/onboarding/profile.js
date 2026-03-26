// pages/onboarding/profile.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useApp } from '../../lib/context';
import { db } from '../../lib/firebaseClient';
import { doc, updateDoc } from 'firebase/firestore';

const ProfilePage = () => {
  const router = useRouter();
  const { user } = useApp();

  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [timezone, setTimezone] = useState('America/Chicago');
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: true,
    push: true,
    sms: false,
    daily_reminder: true,
    reminder_time: "09:00"
  });
  const [privacySettings, setPrivacySettings] = useState({
    public_profile: false,
    show_badges: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      // Firebase user might not have these custom fields directly, 
      // they should come from our Firestore userProfile if we had it loaded here.
      // For onboarding, we typically start fresh or load from Firestore.
      setDisplayName(user.displayName || '');
    }
  }, [user]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const updatedData = {
        nickname: displayName,
        avatar_url: avatarUrl,
        ageGroup: ageGroup,
        timezone: timezone,
        notificationPreferences: notificationPreferences,
        privacySettings: privacySettings,
        onboardingComplete: true,
      };

      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, updatedData);

      router.push('/onboarding/screening');
    } catch (err) {
      setError(err.message || 'An error occurred while saving your profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Profile Setup | PMAction</title>
        <meta name="description" content="Set up your profile" />
      </Head>

      <div className="w-full max-w-3xl space-y-8">
        {/* Progress Steps */}
        <div className="flex justify-center space-x-4 mb-8">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 3
                ? 'bg-teal-600 text-white'
                : step < 3
                  ? 'bg-teal-200 text-teal-800'
                  : 'bg-gray-200 text-gray-500'
                }`}
            >
              {step}
            </div>
          ))}
        </div>

        <div className="bg-white shadow sm:rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Set Up Your Profile</h1>
            <p className="mt-2 text-gray-600">Tell us a bit about yourself so we can personalize your experience.</p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">Display Name</label>
                <input
                  type="text"
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  placeholder="Enter your preferred name"
                  required
                />
              </div>

              <div>
                <label htmlFor="ageGroup" className="block text-sm font-medium text-gray-700">Age Group</label>
                <select
                  id="ageGroup"
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  required
                >
                  <option value="">Select your age group</option>
                  <option value="teen">Teen (13-17)</option>
                  <option value="young-adult">Young Adult (18-25)</option>
                  <option value="adult">Adult (26-55)</option>
                  <option value="senior">Senior (56+)</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">Time Zone</label>
              <select
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                required
              >
                <option value="America/Chicago">America/Chicago</option>
                <option value="America/New_York">America/New_York</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
              </select>
            </div>

            {/* Notification Preferences */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="email-notif"
                      type="checkbox"
                      checked={notificationPreferences.email}
                      onChange={(e) => setNotificationPreferences(prev => ({ ...prev, email: e.target.checked }))}
                      className="focus:ring-teal-500 h-4 w-4 text-teal-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="email-notif" className="font-medium text-gray-700">Email Notifications</label>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="push-notif"
                      type="checkbox"
                      checked={notificationPreferences.push}
                      onChange={(e) => setNotificationPreferences(prev => ({ ...prev, push: e.target.checked }))}
                      className="focus:ring-teal-500 h-4 w-4 text-teal-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="push-notif" className="font-medium text-gray-700">Push Notifications</label>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center h-5">
                    <input
                      id="daily-reminder"
                      type="checkbox"
                      checked={notificationPreferences.daily_reminder}
                      onChange={(e) => setNotificationPreferences(prev => ({ ...prev, daily_reminder: e.target.checked }))}
                      className="focus:ring-teal-500 h-4 w-4 text-teal-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="text-sm flex items-center space-x-4">
                    <label htmlFor="daily-reminder" className="font-medium text-gray-700">Daily Reminder</label>
                    <input
                      type="time"
                      value={notificationPreferences.reminder_time}
                      onChange={(e) => setNotificationPreferences(prev => ({ ...prev, reminder_time: e.target.value }))}
                      className="border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                      disabled={!notificationPreferences.daily_reminder}
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && <div className="text-red-600 text-sm text-center">{error}</div>}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save & Continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;