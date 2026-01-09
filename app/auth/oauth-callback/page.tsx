'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const user = searchParams.get('user');
    const generatedPassword = searchParams.get('generatedPassword');
    const sessionPassword = searchParams.get('sessionPassword');
    const isNewUser = searchParams.get('isNewUser') === 'true';
    const error = searchParams.get('error');

    if (error) {
      // Handle OAuth errors
      const errorMessages: Record<string, string> = {
        oauth_failed: 'Google authentication failed. Please try again.',
        no_email: 'No email found in Google account.',
        email_exists: 'This email is already registered. Please login with your password.',
        oauth_error: 'An error occurred during authentication.'
      };

      router.push(`/auth/login?error=${encodeURIComponent(errorMessages[error] || error)}`);
      return;
    }

    if (!accessToken || !refreshToken || !user) {
      router.push('/auth/login?error=missing_credentials');
      return;
    }

    // Store tokens
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', user);

    if (sessionPassword) {
      localStorage.setItem('sessionPassword', sessionPassword);
    }

    if (isNewUser && generatedPassword) {
      // New OAuth user - show generated password modal
      router.push(`/auth/oauth-password?password=${encodeURIComponent(generatedPassword)}`);
    } else {
      // Existing user - go to dashboard
      router.push('/dashboard');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white">Completing authentication...</p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    }>
      <OAuthCallbackContent />
    </Suspense>
  );
}
