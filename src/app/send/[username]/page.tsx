'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';

const messageSchema = z.object({
  content: z.string().min(1, 'Message is required').max(1000, 'Message is too long'),
});

export default function SendMessagePage() {
  const params = useParams();
  const username = params?.username as string;
  
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userExists, setUserExists] = useState(true);
  const [isAcceptingMessages, setIsAcceptingMessages] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!username) return;
      
      try {
        // Check if user exists and is accepting messages
        const response = await fetch(`/api/check-user?username=${encodeURIComponent(username)}`);
        const data = await response.json();
        
        if (data.success) {
          setUserExists(true);
          setIsAcceptingMessages(data.isAcceptingMessage);
        } else {
          setUserExists(false);
        }
      } catch (error) {
        console.error('Error checking user status:', error);
      }
    };

    checkUserStatus();
  }, [username]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    if (errors.message) {
      setErrors(prev => ({ ...prev, message: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setIsSuccess(false);

    try {
      // Validate message
      messageSchema.parse({ content: message });

      const response = await fetch('/api/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          message: message,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        setMessage('');
        // Reset success message after 3 seconds
        setTimeout(() => {
          setIsSuccess(false);
        }, 3000);
      } else {
        setErrors({ general: data.message || 'Failed to send message' });
        if (data.isAcceptingmessages === false) {
          setIsAcceptingMessages(false);
        }
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

  if (!userExists) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-teal-100/50">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">User Not Found</h2>
            <p className="text-gray-600 mb-6">
              The user <span className="font-semibold text-teal-600">@{username}</span> does not exist.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:from-teal-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isAcceptingMessages) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-teal-100/50">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Not Accepting Messages</h2>
            <p className="text-gray-600 mb-6">
              <span className="font-semibold text-teal-600">@{username}</span> is not accepting messages at the moment.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:from-teal-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-8 group">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all transform group-hover:scale-105">
              <span className="text-white font-bold text-2xl">I</span>
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              IncogText
            </span>
          </Link>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            Share the incog message without fear
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Send an anonymous message to <span className="font-semibold text-teal-600">@{username}</span>
          </p>
        </div>

        {/* Message Form Card */}
        <div className="bg-white p-8 rounded-3xl shadow-2xl border border-teal-100/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Your Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={8}
                maxLength={1000}
                className={`appearance-none block w-full px-4 py-4 border-2 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 transition-all resize-none ${
                  errors.message
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-200 focus:border-teal-500 focus:ring-teal-200'
                }`}
                placeholder="Type your anonymous message here..."
                value={message}
                onChange={handleChange}
              />
              <div className="mt-2 flex justify-between items-center">
                {errors.message && (
                  <p className="text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.message}
                  </p>
                )}
                <p className="text-sm text-gray-500 ml-auto">
                  {message.length}/1000 characters
                </p>
              </div>
            </div>

            {/* Success Message */}
            {isSuccess && (
              <div className="rounded-xl bg-emerald-50 border-2 border-emerald-400 p-4 flex items-start">
                <svg className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-emerald-800">Message sent successfully!</p>
                  <p className="text-xs text-emerald-700 mt-1">Your anonymous message has been delivered.</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errors.general && (
              <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4 flex items-start">
                <svg className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-600 flex-1">{errors.general}</p>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Anonymous Message
                    <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-teal-50 border border-teal-200 rounded-xl">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-teal-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-teal-800 mb-1">100% Anonymous</p>
                <p className="text-xs text-teal-700">
                  Your message will be sent anonymously. The recipient will not know who sent it.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-teal-600 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

