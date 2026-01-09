'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Message {
  content: string;
  createdAt: string;
}

interface Statistics {
  totalMessages: number;
  avgMessagesPerDay: number;
  messagesPerDay: { date: string; count: number }[];
  messagesPerWeek: { week: string; count: number }[];
  messagesPerMonth: { month: string; count: number }[];
}

type SortOrder = 'newest' | 'oldest';
type ChartView = 'day' | 'week' | 'month';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [sortedMessages, setSortedMessages] = useState<Message[]>([]);
  const [isAcceptingMessages, setIsAcceptingMessages] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [chartView, setChartView] = useState<ChartView>('day');

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

  useEffect(() => {
    const sorted = [...messages].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    setSortedMessages(sorted);
  }, [messages, sortOrder]);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/get-messages');
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages || []);
        setIsAcceptingMessages(data.isAcceptingMessage ?? true);
        if (data.statistics) {
          setStatistics(data.statistics);
        }
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

  const getChartData = () => {
    if (!statistics) return [];
    
    if (chartView === 'day') {
      return statistics.messagesPerDay.map(item => ({
        name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        Messages: item.count,
      })).slice(-14);
    } else if (chartView === 'week') {
      return statistics.messagesPerWeek.map((item, index) => ({
        name: `Week ${statistics.messagesPerWeek.length - index}`,
        Messages: item.count,
      })).slice(-8);
    } else {
      return statistics.messagesPerMonth.map(item => ({
        name: item.month,
        Messages: item.count,
      }));
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
      <div className="max-w-6xl mx-auto">
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
              <div className="flex-1">
                <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-2">Your Unique Link</h3>
                <div className="bg-white rounded-lg p-4 border-2 border-teal-300 mb-3">
                  <p className="text-sm text-gray-600 mb-2">Share this link to receive anonymous messages:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-50 px-4 py-2 rounded-lg text-sm font-mono text-teal-700 break-all">
                      {typeof window !== 'undefined' ? `${window.location.origin}/send/${session.user?.username}` : `https://yourdomain.com/send/${session.user?.username}`}
                    </code>
                    <button
                      onClick={async () => {
                        const link = typeof window !== 'undefined' ? `${window.location.origin}/send/${session.user?.username}` : '';
                        if (link && navigator.clipboard) {
                          try {
                            await navigator.clipboard.writeText(link);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          } catch (err) {
                            console.error('Failed to copy:', err);
                          }
                        }
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg hover:from-teal-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap"
                      title="Copy link"
                    >
                      {copied ? (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Anyone with this link can send you anonymous messages without logging in
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

        {statistics && (
          <div className="bg-white rounded-2xl shadow-xl border border-teal-100 p-8 mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Statistics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-100 text-sm font-medium uppercase tracking-wide">Total Messages</p>
                    <p className="text-4xl font-bold mt-2">{statistics.totalMessages}</p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium uppercase tracking-wide">Avg per Day</p>
                    <p className="text-4xl font-bold mt-2">{statistics.avgMessagesPerDay.toFixed(2)}</p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-100 text-sm font-medium uppercase tracking-wide">
                      {chartView === 'day' ? 'Last 14 Days' : chartView === 'week' ? 'Last 8 Weeks' : 'Last 12 Months'}
                    </p>
                    <p className="text-4xl font-bold mt-2">
                      {chartView === 'day' 
                        ? statistics.messagesPerDay.slice(-14).reduce((sum, item) => sum + item.count, 0)
                        : chartView === 'week'
                        ? statistics.messagesPerWeek.slice(-8).reduce((sum, item) => sum + item.count, 0)
                        : statistics.messagesPerMonth.reduce((sum, item) => sum + item.count, 0)}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Activity Chart</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setChartView('day')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      chartView === 'day'
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Day
                  </button>
                  <button
                    onClick={() => setChartView('week')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      chartView === 'week'
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setChartView('month')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      chartView === 'month'
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Month
                  </button>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-6 border border-gray-200">
                <ResponsiveContainer width="100%" height={300}>
                  {chartView === 'day' ? (
                    <LineChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="name" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e0e0e0', 
                          borderRadius: '8px' 
                        }} 
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="Messages" 
                        stroke="#14b8a6" 
                        strokeWidth={3}
                        dot={{ fill: '#14b8a6', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  ) : (
                    <BarChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="name" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e0e0e0', 
                          borderRadius: '8px' 
                        }} 
                      />
                      <Legend />
                      <Bar dataKey="Messages" fill="#14b8a6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-teal-100 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Your Messages ({messages.length})</h2>
            <div className="flex gap-3">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="px-4 py-2 border-2 border-teal-200 rounded-lg text-gray-700 focus:outline-none focus:border-teal-500 transition-all"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
              <button
                onClick={fetchMessages}
                className="px-6 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:from-teal-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
              >
                Refresh
              </button>
            </div>
          </div>

          {sortedMessages.length === 0 ? (
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
              {sortedMessages.map((message, index) => (
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
