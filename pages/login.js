// pages/login.js
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { auth } from '../lib/firebaseClient';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from 'firebase/auth';
import { useApp } from '../lib/context';

const ACTION_CODE_SETTINGS = {
  url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.pmaction.com'}/auth/verify-email`,
  handleCodeInApp: true,
};

// ---------- Sub-components ----------

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-200 ${
      active
        ? 'bg-white text-indigo-700 shadow-sm'
        : 'text-indigo-300 hover:text-white'
    }`}
  >
    {children}
  </button>
);

const PhoneStep = ({ onSuccess }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const recaptchaRef = useRef(null);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Setup invisible reCAPTCHA once on mount
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
      });
    }
    return () => {
      // cleanup only on unmount
    };
  }, []);

  const handleSendCode = async () => {
    setError('');
    const formattedPhone = phone.startsWith('+') ? phone : `+1${phone.replace(/\D/g, '')}`;
    if (formattedPhone.replace(/\D/g, '').length < 11) {
      setError('Please enter a valid US phone number.');
      return;
    }
    setLoading(true);
    try {
      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        window.recaptchaVerifier
      );
      setConfirmationResult(confirmation);
      setStep('otp');
    } catch (err) {
      setError('Failed to send code. Please check the number and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) { setError('Please enter all 6 digits.'); return; }
    setLoading(true);
    setError('');
    try {
      await confirmationResult.confirm(code);
      onSuccess();
    } catch (err) {
      setError('Invalid code. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  if (step === 'otp') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-4xl mb-3">📱</div>
          <h3 className="text-white font-bold text-lg">Check your texts</h3>
          <p className="text-indigo-200 text-sm mt-1">
            We sent a 6-digit code to <span className="font-semibold text-white">{phone}</span>
          </p>
        </div>

        <div className="flex gap-2 justify-center">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => inputRefs.current[i] = el}
              type="number"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleOtpChange(e.target.value, i)}
              onKeyDown={e => handleOtpKeyDown(e, i)}
              className="w-11 h-14 text-center text-2xl font-bold rounded-xl bg-white/10 border-2 border-white/20 text-white focus:border-indigo-300 focus:outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              autoFocus={i === 0}
            />
          ))}
        </div>

        {error && <p className="text-red-300 text-sm text-center">{error}</p>}

        <button
          onClick={handleVerify}
          disabled={loading || otp.join('').length < 6}
          className="w-full py-4 rounded-2xl bg-white text-indigo-700 font-bold text-base shadow-lg hover:bg-indigo-50 transition-all disabled:opacity-40"
        >
          {loading ? 'Verifying...' : 'Verify & Continue →'}
        </button>

        <button
          onClick={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); setError(''); }}
          className="w-full text-indigo-300 text-sm underline"
        >
          ← Change phone number
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="text-4xl mb-3">📲</div>
        <h3 className="text-white font-bold text-lg">Enter your phone number</h3>
        <p className="text-indigo-200 text-sm mt-1">We'll send you a quick verification code — no password needed.</p>
      </div>

      <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-2xl px-4 py-1 focus-within:border-indigo-300 transition-all">
        <span className="text-white font-semibold text-base">🇺🇸 +1</span>
        <div className="w-px h-6 bg-white/30" />
        <input
          type="tel"
          inputMode="numeric"
          placeholder="(555) 000-0000"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSendCode()}
          className="flex-1 bg-transparent text-white placeholder-indigo-300 text-base py-3 focus:outline-none"
          autoFocus
        />
      </div>

      {error && <p className="text-red-300 text-sm text-center">{error}</p>}

      <button
        onClick={handleSendCode}
        disabled={loading || phone.replace(/\D/g, '').length < 10}
        className="w-full py-4 rounded-2xl bg-white text-indigo-700 font-bold text-base shadow-lg hover:bg-indigo-50 transition-all disabled:opacity-40"
      >
        {loading ? 'Sending...' : 'Send Code →'}
      </button>

      <div id="recaptcha-container" />
    </div>
  );
};

const EmailStep = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendLink = async () => {
    if (!email.includes('@')) { setError('Please enter a valid email.'); return; }
    setLoading(true);
    setError('');
    try {
      await sendSignInLinkToEmail(auth, email, ACTION_CODE_SETTINGS);
      window.localStorage.setItem('pma_email_for_signin', email);
      setSent(true);
    } catch (err) {
      setError('Failed to send link. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="text-5xl">✉️</div>
        <h3 className="text-white font-bold text-lg">Check your inbox!</h3>
        <p className="text-indigo-200 text-sm">
          We sent a magic sign-in link to<br />
          <span className="font-semibold text-white">{email}</span>
        </p>
        <p className="text-indigo-300 text-xs">Tap it on your phone to log in instantly.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="text-4xl mb-3">✉️</div>
        <h3 className="text-white font-bold text-lg">Sign in with your email</h3>
        <p className="text-indigo-200 text-sm mt-1">We'll email you a one-tap magic link — no password needed.</p>
      </div>

      <div className="bg-white/10 border border-white/20 rounded-2xl px-4 focus-within:border-indigo-300 transition-all">
        <input
          type="email"
          inputMode="email"
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSendLink()}
          className="w-full bg-transparent text-white placeholder-indigo-300 text-base py-4 focus:outline-none"
          autoFocus
        />
      </div>

      {error && <p className="text-red-300 text-sm text-center">{error}</p>}

      <button
        onClick={handleSendLink}
        disabled={loading || !email.includes('@')}
        className="w-full py-4 rounded-2xl bg-white text-indigo-700 font-bold text-base shadow-lg hover:bg-indigo-50 transition-all disabled:opacity-40"
      >
        {loading ? 'Sending...' : 'Send Magic Link →'}
      </button>
    </div>
  );
};

// ---------- Main Login Page ----------

const LoginPage = () => {
  const router = useRouter();
  const { user } = useApp();
  const [tab, setTab] = useState('phone'); // 'phone' | 'email'
  const [checking, setChecking] = useState(true);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    } else {
      setChecking(false);
    }
  }, [user, router]);

  // Handle returning from email magic link
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem('pma_email_for_signin');
      if (!email) {
        email = window.prompt('Please confirm your email to complete sign-in:');
      }
      signInWithEmailLink(auth, email, window.location.href)
        .then(() => {
          window.localStorage.removeItem('pma_email_for_signin');
          router.push('/dashboard');
        })
        .catch(err => console.error('Email link sign-in error:', err));
    }
  }, []);

  if (checking) return null;

  return (
    <>
      <Head>
        <title>Sign In | PMAction</title>
        <meta name="description" content="Sign in to your PMAction account — no password needed." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 flex flex-col items-center justify-center p-5">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🧠</div>
          <h1 className="text-white text-3xl font-black tracking-tight">PMAction</h1>
          <p className="text-indigo-300 text-sm mt-1">Your daily positive action companion</p>
        </div>

        {/* Card */}
        <div className="w-full max-w-sm bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/20">
          {/* Tab switcher */}
          <div className="flex gap-1 bg-white/10 rounded-2xl p-1 mb-6">
            <TabButton active={tab === 'phone'} onClick={() => setTab('phone')}>📱 Phone</TabButton>
            <TabButton active={tab === 'email'} onClick={() => setTab('email')}>✉️ Email</TabButton>
          </div>

          {/* Auth flow */}
          {tab === 'phone' ? (
            <PhoneStep onSuccess={() => router.push('/dashboard')} />
          ) : (
            <EmailStep />
          )}
        </div>

        {/* Footer note */}
        <p className="text-indigo-400 text-xs text-center mt-6 max-w-xs">
          By continuing, you agree to our{' '}
          <a href="/terms" className="underline hover:text-white">Terms</a> and{' '}
          <a href="/privacy" className="underline hover:text-white">Privacy Policy</a>.
        </p>
      </div>
    </>
  );
};

export default LoginPage;