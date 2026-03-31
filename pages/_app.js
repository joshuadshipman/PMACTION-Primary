// pages/_app.js
import '../styles/globals.css'; // Global styles
import { useRouter } from 'next/router';
import { AppProvider } from '../lib/context';
import { OnboardingProvider } from '../context/OnboardingContext';
import AngelBot from '../components/ttl/AngelBot';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  // Show Angel Bot on all /ttl/* pages
  const isTTLPage = router.pathname.startsWith('/ttl');

  return (
    <AppProvider>
      <OnboardingProvider>
        <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl relative overflow-hidden sm:border-x sm:border-gray-200">
          <Component {...pageProps} />
        </div>
        {/* Angel Bot — TTL pages only */}
        {isTTLPage && <AngelBot />}
      </OnboardingProvider>
    </AppProvider>
  );
}

export default MyApp;