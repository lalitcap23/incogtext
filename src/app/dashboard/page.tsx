'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Message {
  content: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAcceptingMessages, setIsAcceptingMessages] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchMessages();
      setIsAcceptingMessages(session.user?.isAcceptingMessage ?? true);
    }
  }, [session]);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/get-messages');
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages || []);
        setIsAcceptingMessages(data.isAcceptingMessage ?? true);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMessageAcceptance = async () => {
    setIsToggling(true);
    try {
      const response = await fetch('/api/accept-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          acceptMessage: !isAcceptingMessages,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsAcceptingMessages(data.isAcceptingmessages);
      }
    } catch (error) {
      console.error('Error toggling message acceptance:', error);
    } finally {
      setIsToggling(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-teal-100 p-8 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">Dashboard</h1>
              <p className="text-gray-600 mt-2 text-lg">Welcome back, {session.user?.username || 'User'}!</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/sign-in' })}
              className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg hover:shadow-xl"
            >
              Sign Out
            </button>
          </div>

          <div className="mt-6 p-6 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl border-2 border-teal-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Your Username</h3>
                <p className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent mt-2">{session.user?.username}</p>
                <p className="text-sm text-gray-600 mt-3">
                  Share this username for others to send you anonymous messages
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Message Settings</h3>
              <button
                onClick={toggleMessageAcceptance}
                disabled={isToggling}
                className={`px-6 py-2 rounded-xl font-semibold transition-all shadow-lg ${
                  isAcceptingMessages
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                } disabled:opacity-50`}
              >
                {isToggling
                  ? 'Updating...'
                  : isAcceptingMessages
                  ? 'Accepting Messages'
                  : 'Not Accepting Messages'}
              </button>
            </div>
            <p className="text-sm text-gray-600">
              {isAcceptingMessages
                ? 'You are currently accepting anonymous messages'
                : 'You are not accepting anonymous messages at the moment'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-teal-100 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Your Messages</h2>
            <button
              onClick={fetchMessages}
              className="px-6 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:from-teal-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
            >
              Refresh
            </button>
          </div>

          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-600 text-lg font-semibold">No messages yet</p>
              <p className="text-gray-400 text-sm mt-2">
                Share your username to start receiving anonymous messages
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className="border-2 border-teal-100 rounded-xl p-6 hover:bg-teal-50 transition-all hover:shadow-lg"
                >
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <p className="text-xs text-gray-500 mt-4 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-teal-600 hover:text-teal-700 font-semibold transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

