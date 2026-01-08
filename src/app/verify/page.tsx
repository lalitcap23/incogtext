'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { verifySchema } from '../schemas/verifySchema';
import { z } from 'zod';

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const codeFromUrl = searchParams.get('code') || '';
  
  const [code, setCode] = useState(codeFromUrl);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      router.push('/sign-in');
    }
  }, [email, router]);
  
  useEffect(() => {
    // If code is in URL (from dev mode), auto-fill it
    if (codeFromUrl) {
      setCode(codeFromUrl);
    }
  }, [codeFromUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
    if (errors.code) {
      setErrors(prev => ({ ...prev, code: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccess(false);

    try {
      // Validate code format
      verifySchema.parse({ code });

      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        
        // After verification, automatically sign in the user
        // Get password from sessionStorage (stored when redirecting to verify)
        const storedPassword = typeof window !== 'undefined' ? sessionStorage.getItem('pendingPassword') : null;
        
        if (storedPassword && data.email) {
          // Auto-sign in with stored password
          try {
            const signInResult = await signIn('credentials', {
              username: data.email,
              password: storedPassword,
              redirect: false,
            });
            
            // Clear stored password
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('pendingPassword');
            }
            
            if (signInResult?.ok) {
              // Successfully signed in, redirect to dashboard
              setTimeout(() => {
                router.push('/dashboard');
              }, 1000);
              return;
            } else {
              // Sign in failed, redirect to sign-in page with email pre-filled
              setTimeout(() => {
                router.push(`/sign-in?verified=true&email=${encodeURIComponent(data.email)}`);
              }, 1500);
            }
          } catch (error) {
            console.error('Auto sign-in error:', error);
            // If auto-sign-in fails, redirect to sign-in page
            setTimeout(() => {
              router.push(`/sign-in?verified=true&email=${encodeURIComponent(data.email)}`);
            }, 1500);
          }
        } else {
          // No stored password, redirect to sign-in page with email pre-filled
          setTimeout(() => {
            router.push(`/sign-in?verified=true&email=${encodeURIComponent(data.email || email)}`);
          }, 1500);
        }
      } else {
        setErrors({ general: data.message || 'Verification failed' });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { [key: string]: string } = {};
        error.errors.forEach(err => {
          if (err.path) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: 'Something went wrong. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-emerald-50 border-2 border-emerald-400 text-emerald-800 px-6 py-4 rounded-2xl shadow-lg">
            <p className="font-semibold text-lg">Email verified successfully!</p>
            <p className="mt-2">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">I</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              IncogText
            </span>
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the 6-digit code sent to your email
          </p>
          {email && (
            <p className="mt-3 text-center text-sm text-gray-500 bg-teal-50 px-4 py-2 rounded-lg inline-block">
              Verifying: <span className="font-semibold text-teal-700">{email}</span>
            </p>
          )}
          {codeFromUrl && (
            <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-xl">
              <p className="text-sm text-yellow-800 font-semibold mb-1">Development Mode:</p>
              <p className="text-sm text-yellow-700">
                Verification code auto-filled: <span className="font-mono font-bold text-lg">{codeFromUrl}</span>
              </p>
              <p className="text-xs text-yellow-600 mt-2">
                Email sending failed in development. Check server logs for the code.
              </p>
            </div>
          )}
        </div>
        <form className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-teal-100" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="code" className="block text-sm font-semibold text-gray-700 mb-3">
              Verification Code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              required
              maxLength={6}
              className="appearance-none relative block w-full px-4 py-4 border-2 border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500 transition-all text-center text-3xl tracking-[0.5em] font-mono"
              placeholder="000000"
              value={code}
              onChange={handleChange}
            />
            {errors.code && (
              <p className="mt-2 text-sm text-red-600">{errors.code}</p>
            )}
          </div>

          {errors.general && (
            <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Didn&apos;t receive the code?{' '}
              <Link href="/sign-in" className="font-medium text-teal-600 hover:text-teal-700">
                Try again
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    }>
      <VerifyForm />
    </Suspense>
  );
}

