// pages/auth/verify-email.js
// Landing page for magic link sign-in clicks from email
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { auth } from '../../lib/firebaseClient';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';

export default function VerifyEmail() {
  const router = useRouter();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error' | 'needs_email'
  const [email, setEmail] = useState('');
  const [inputEmail, setInputEmail] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!isSignInWithEmailLink(auth, window.location.href)) {
      setStatus('error');
      return;
    }

    const savedEmail = window.localStorage.getItem('pma_email_for_signin');
    if (savedEmail) {
      completeSignIn(savedEmail);
    } else {
      setStatus('needs_email');
    }
  }, []);

  const completeSignIn = async (emailToUse) => {
    setStatus('verifying');
    try {
      await signInWithEmailLink(auth, emailToUse, window.location.href);
      window.localStorage.removeItem('pma_email_for_signin');
      setStatus('success');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <>
      <Head>
        <title>Verifying Sign-In | PMAction</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 flex flex-col items-center justify-center p-5">
        <div className="w-full max-w-sm text-center space-y-6">

          {status === 'verifying' && (
            <>
              <div className="text-5xl animate-spin" style={{ animationDuration: '1.5s' }}>🌀</div>
              <h2 className="text-white text-xl font-bold">Signing you in...</h2>
              <p className="text-indigo-300 text-sm">Just a moment.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-5xl">✅</div>
              <h2 className="text-white text-xl font-bold">You're in!</h2>
              <p className="text-indigo-300 text-sm">Redirecting to your dashboard...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-5xl">⚠️</div>
              <h2 className="text-white text-xl font-bold">Link expired or invalid</h2>
              <p className="text-indigo-300 text-sm">Magic links expire after 1 hour. Please request a new one.</p>
              <button
                onClick={() => router.push('/login')}
                className="w-full py-4 rounded-2xl bg-white text-indigo-700 font-bold text-base"
              >
                Back to Sign In
              </button>
            </>
          )}

          {status === 'needs_email' && (
            <>
              <div className="text-5xl">✉️</div>
              <h2 className="text-white text-xl font-bold">Confirm your email</h2>
              <p className="text-indigo-300 text-sm">
                It looks like you opened this link on a different device. Please enter the email you used.
              </p>
              <div className="bg-white/10 border border-white/20 rounded-2xl px-4 focus-within:border-indigo-300 transition-all">
                <input
                  type="email"
                  inputMode="email"
                  placeholder="your@email.com"
                  value={inputEmail}
                  onChange={e => setInputEmail(e.target.value)}
                  className="w-full bg-transparent text-white placeholder-indigo-300 text-base py-4 focus:outline-none"
                  autoFocus
                />
              </div>
              <button
                onClick={() => completeSignIn(inputEmail)}
                disabled={!inputEmail.includes('@')}
                className="w-full py-4 rounded-2xl bg-white text-indigo-700 font-bold text-base disabled:opacity-40"
              >
                Confirm & Sign In →
              </button>
            </>
          )}

        </div>
      </div>
    </>
  );
}
