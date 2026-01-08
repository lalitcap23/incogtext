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
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome, {session.user?.username || 'User'}!</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/sign-in' })}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>

          <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Your Username</h3>
                <p className="text-2xl font-bold text-indigo-600 mt-1">{session.user?.username}</p>
                <p className="text-sm text-gray-600 mt-2">
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
                className={`px-4 py-2 rounded-md font-medium ${
                  isAcceptingMessages
                    ? 'bg-green-600 text-white hover:bg-green-700'
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

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Your Messages</h2>
            <button
              onClick={fetchMessages}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Refresh
            </button>
          </div>

          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No messages yet</p>
              <p className="text-gray-400 text-sm mt-2">
                Share your username to start receiving anonymous messages
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

