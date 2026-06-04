import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../lib/AuthContext';
import '../styles/globals.css';

function AppGuard({ Component, pageProps }: AppProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const isAuthPage = router.pathname === '/' || router.pathname === '/login';

  useEffect(() => {
    if (!isLoading && !user && !isAuthPage) {
      router.replace('/');
    }
    if (!isLoading && user && isAuthPage) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, isAuthPage, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#020008' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}>
            <span className="text-white text-2xl">🎓</span>
          </div>
          <div className="flex gap-1">
            {[0,1,2].map(i => (
              <div
                key={i}
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ background: '#7C3AED', animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <Component {...pageProps} />;
}

export default function App(props: AppProps) {
  return (
    <AuthProvider>
      <AppGuard {...props} />
    </AuthProvider>
  );
}
