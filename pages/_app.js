// pages/_app.js
import '../styles/globals.css'; // Global styles
import { AppProvider } from '../lib/context';
import { OnboardingProvider } from '../context/OnboardingContext';

function MyApp({ Component, pageProps }) {
  return (
    <AppProvider>
      <OnboardingProvider>
        <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl relative overflow-hidden sm:border-x sm:border-gray-200">
          <Component {...pageProps} />
        </div>
      </OnboardingProvider>
    </AppProvider>
  );
}

export default MyApp;