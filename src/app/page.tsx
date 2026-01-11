'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [formData, setFormData] = useState({
    username: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({});
    
    try {
      const response = await fetch('/api/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubmitStatus({
          success: true,
          message: 'Your anonymous message has been sent successfully!'
        });
        setFormData({
          username: '',
          message: ''
        });
      } else {
        throw new Error(data.message || 'Something went wrong');
      }
    } catch (error) {
      setSubmitStatus({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send message'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-teal-100 to-emerald-100 rounded-full blur-3xl transition-all duration-700 ease-out opacity-50"
          style={{
            left: `${mousePosition.x / 30}px`,
            top: `${mousePosition.y / 30}px`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 border border-gray-200 shadow-lg">
          <div className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 via-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-teal-500/30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <span className="text-white font-bold text-xl">I</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 bg-clip-text text-transparent">
              IncogText
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/sign-in"
              className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl border border-gray-300 hover:bg-gray-200 hover:border-gray-400 transition-all duration-300 hover:scale-105 shadow-sm"
            >
              Login
            </Link>
            <Link
              href="/sign-in"
              className="px-6 py-2.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-300 hover:scale-105 relative overflow-hidden group"
            >
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-teal-50 rounded-full border border-teal-200 mb-8 hover:bg-teal-100 transition-all duration-300">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm text-teal-700 font-medium">Secure & Anonymous Messaging Platform</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-8 leading-tight text-gray-900">
            <span className="block">
              Express Yourself
            </span>
            <span className="block mt-2 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Without Limits
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-6 max-w-3xl mx-auto leading-relaxed">
            IncogText is a revolutionary platform for sending and receiving anonymous messages with complete privacy and security.
            <span className="block mt-2 text-teal-600 font-semibold">No tracking. No identity disclosure. Just pure, honest expression.</span>
          </p>

          <p className="text-base text-gray-500 mb-12 max-w-2xl mx-auto">
            Whether you want to share honest feedback, express feelings, or communicate sensitive information,
            IncogText provides a safe space for authentic conversations without fear of judgment or consequences.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href="/sign-in"
              className="group px-8 py-4 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 text-white font-semibold rounded-2xl hover:shadow-xl hover:shadow-teal-500/30 transition-all duration-300 hover:scale-105 text-lg relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                Start Messaging Free
                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            <button
              onClick={() => {
                setShowMessageForm(!showMessageForm);
                window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-2xl border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 hover:scale-105 text-lg shadow-lg"
            >
              Send Anonymous Message
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-6 border border-teal-100">
              <div className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent mb-2">100%</div>
              <div className="text-gray-600 text-sm font-medium">Completely Anonymous</div>
            </div>
            <div className="text-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">Instant</div>
              <div className="text-gray-600 text-sm font-medium">Real-time Delivery</div>
            </div>
            <div className="text-center bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">Unlimited</div>
              <div className="text-gray-600 text-sm font-medium">Messages & Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* Try Anonymous Messages Section */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-3xl p-8 md:p-10 border-2 border-teal-200 shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Try Sending Anonymous Messages
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Test our platform by sending anonymous messages to the admin
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <Link
                href="/send/lalitrajput230202"
                className="group bg-white rounded-2xl p-6 border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                    @lalitrajput230202
                  </h3>
                  <svg className="w-5 h-5 text-teal-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">Send anonymous message to admin</p>
              </Link>
              
              <Link
                href="/send/lalitrajput232002"
                className="group bg-white rounded-2xl p-6 border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                    @lalitrajput232002
                  </h3>
                  <svg className="w-5 h-5 text-teal-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">Send anonymous message to admin</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Guide */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-teal-400 hover:shadow-xl transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Sign In</h3>
              <p className="text-gray-600 leading-relaxed">
                Create your account or sign in to get started. It&apos;s quick, free, and secure.
              </p>
              <Link
                href="/sign-in"
                className="mt-6 inline-flex items-center text-teal-600 hover:text-teal-700 font-semibold transition-colors"
              >
                Get Started
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-teal-400 hover:shadow-xl transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Get Your Link</h3>
              <p className="text-gray-600 leading-relaxed">
                After signing in, visit your dashboard to get your unique anonymous message link.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-teal-400 hover:shadow-xl transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Share & Receive</h3>
              <p className="text-gray-600 leading-relaxed">
                Share your link anywhere. People can send you anonymous messages without revealing their identity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Message Form */}
      {showMessageForm && (
        <section className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-slide-up">
          <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-200 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 opacity-50" />
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Send Anonymous Message</h2>
                <button
                  onClick={() => setShowMessageForm(false)}
                  className="text-gray-400 hover:text-gray-600 text-3xl w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all duration-300"
                >
                  ×
                </button>
              </div>

              {submitStatus.success ? (
                <div className="bg-emerald-50 border-2 border-emerald-400 text-emerald-900 px-6 py-6 rounded-2xl mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="font-semibold text-lg">{submitStatus.message}</p>
                  </div>
                  <button 
                    className="mt-4 text-emerald-600 underline hover:text-emerald-800 font-medium transition-colors"
                    onClick={() => {
                      setSubmitStatus({});
                      setShowMessageForm(false);
                    }}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-3">
                      Recipient Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter username"
                      className="w-full px-5 py-4 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-300 text-gray-900 placeholder-gray-400"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-3">
                      Your Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Type your anonymous message here..."
                      className="w-full px-5 py-4 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-300 resize-none text-gray-900 placeholder-gray-400"
                    />
                  </div>
                  
                  {submitStatus.message && !submitStatus.success && (
                    <div className="bg-red-50 border-2 border-red-400 text-red-800 px-4 py-3 rounded-xl" role="alert">
                      <p>{submitStatus.message}</p>
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full px-6 py-4 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-teal-500/50 transition-all duration-300 transform hover:scale-[1.02] ${
                      isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-gray-900">
              Why Choose
              <span className="block mt-2 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 bg-clip-text text-transparent">
                IncogText?
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built for privacy, designed for freedom, trusted by thousands
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: '100% Anonymous',
                description: 'Your identity stays completely hidden. No tracking, no logs, no data collection. We don\'t store IP addresses, browser fingerprints, or any identifying information.',
                gradient: 'from-purple-100 to-pink-100',
                borderColor: 'border-purple-200',
                iconGradient: 'from-purple-500 to-pink-500',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: 'Lightning Fast',
                description: 'Messages delivered instantly with zero latency. Real-time notifications ensure you never miss important feedback or messages from your community.',
                gradient: 'from-orange-100 to-amber-100',
                borderColor: 'border-orange-200',
                iconGradient: 'from-orange-500 to-amber-500',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: 'Military Grade Security',
                description: 'End-to-end encryption, secure cloud infrastructure, and regular security audits. Your privacy and safety are our top priorities.',
                gradient: 'from-emerald-100 to-teal-100',
                borderColor: 'border-emerald-200',
                iconGradient: 'from-emerald-500 to-teal-500',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-3xl p-8 border-2 border-gray-200 hover:border-gray-300 transition-all duration-500 hover:scale-105 hover:shadow-2xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-30 rounded-3xl transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.iconGradient} rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-gray-900">
              Perfect For
              <span className="block mt-2 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Every Situation
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From honest feedback to heartfelt confessions, IncogText empowers authentic communication
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '💼',
                title: 'Workplace Feedback',
                description: 'Share honest opinions about company culture, management, or workplace improvements without fear.'
              },
              {
                icon: '🎓',
                title: 'Student Feedback',
                description: 'Provide candid course reviews, teacher evaluations, or suggestions for campus improvements.'
              },
              {
                icon: '💝',
                title: 'Personal Feelings',
                description: 'Express emotions, confessions, or compliments to friends, crushes, or family members.'
              },
              {
                icon: '🌟',
                title: 'Community Input',
                description: 'Collect anonymous suggestions, complaints, or ideas from your community or audience.'
              },
              {
                icon: '🎯',
                title: 'Product Feedback',
                description: 'Get unfiltered opinions about your products, services, or creative work from real users.'
              },
              {
                icon: '🤝',
                title: 'Peer Reviews',
                description: 'Give and receive constructive criticism in creative projects, writing, or professional work.'
              },
              {
                icon: '🗣️',
                title: 'Whistleblowing',
                description: 'Safely report unethical behavior, safety concerns, or policy violations with complete anonymity.'
              },
              {
                icon: '❓',
                title: 'Q&A Sessions',
                description: 'Host anonymous Q&A events where people can ask sensitive questions without embarrassment.'
              }
            ].map((useCase, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-200 hover:border-teal-400 hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="text-4xl mb-4">{useCase.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{useCase.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-teal-500 via-emerald-500 to-teal-600 rounded-3xl p-12 md:p-16 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:2rem_2rem]" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-white">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Join thousands of users who trust IncogText for anonymous communication. It&apos;s completely free and takes less than a minute to set up.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sign-in"
                className="px-8 py-4 bg-white text-teal-600 font-bold rounded-2xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                Sign In Now
              </Link>
              <Link
                href="/sign-in"
                className="px-8 py-4 bg-transparent text-white font-bold rounded-2xl border-2 border-white hover:bg-white hover:text-teal-600 transition-all duration-300 hover:scale-105"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200 bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">I</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                IncogText
              </span>
            </div>
            <div className="flex space-x-8">
              <Link href="/sign-in" className="text-gray-600 hover:text-teal-600 transition-colors font-medium">
                Sign In
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-teal-600 transition-colors font-medium">
                Dashboard
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-500 text-sm">&copy; 2024 IncogText. All rights reserved. Built with privacy and security in mind.</p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
      `}</style>
    </main>
  );
}
