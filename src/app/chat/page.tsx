'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  riskLevel?: string;
  vetRecommended?: boolean;
}

export default function ChatPage() {
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const phoneParam = searchParams.get('phone');
    if (phoneParam) {
      setPhone(phoneParam);
    }
  }, [searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !phone) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          message: userMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply,
          riskLevel: data.riskLevel,
          vetRecommended: data.vetRecommended,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${err.message}. Please try again.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
          {/* Header */}
          <div className="bg-indigo-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">🐾 PawPal Chat</h1>
                {phone && (
                  <p className="text-sm text-indigo-100">Phone: {phone}</p>
                )}
              </div>
              <Link
                href="/"
                className="text-white hover:text-indigo-100 text-sm"
              >
                ← Home
              </Link>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!phone && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 font-medium">Please enter your phone number to start chatting</p>
              </div>
            )}

            {messages.length === 0 && phone && (
              <div className="text-center text-gray-500 py-8">
                <p className="text-lg mb-2">👋 Hi! I'm PawPal, your AI pet health assistant.</p>
                <p>Ask me anything about your pet's health, food, or behavior!</p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.riskLevel && (
                    <div className="mt-2 pt-2 border-t border-gray-300">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          message.riskLevel === 'HIGH'
                            ? 'bg-red-100 text-red-800'
                            : message.riskLevel === 'MEDIUM'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        Risk: {message.riskLevel}
                      </span>
                      {message.vetRecommended && (
                        <span className="ml-2 inline-block px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                          🏥 Vet Recommended
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            {!phone ? (
              <div className="flex space-x-2">
                <input
                  type="tel"
                  placeholder="Enter your phone number (e.g., +6281234567890)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <Link
                  href="/onboard"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition whitespace-nowrap"
                >
                  Register Pet
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Ask about your pet's health..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                  Send
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
