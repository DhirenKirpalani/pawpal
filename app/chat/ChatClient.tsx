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

interface PetInfo {
  petName: string;
  species: string;
  breed?: string;
}

export default function ChatClient() {
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [petInfo, setPetInfo] = useState<PetInfo | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const phoneParam = searchParams.get('phone');
    const lastPhone = localStorage.getItem('last_phone');
    
    const phoneToUse = phoneParam || lastPhone || '';
    
    if (phoneToUse) {
      setPhone(phoneToUse);
      
      localStorage.setItem('last_phone', phoneToUse);
      
      const savedMessages = localStorage.getItem(`chat_${phoneToUse}`);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
      
      const savedPetInfo = localStorage.getItem(`pet_${phoneToUse}`);
      if (savedPetInfo) {
        setPetInfo(JSON.parse(savedPetInfo));
      } else {
        fetchPetInfo(phoneToUse);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchPetInfo = async (phoneNumber: string) => {
    try {
      const response = await fetch(`/api/profile?phone=${encodeURIComponent(phoneNumber)}`);
      const data = await response.json();
      
      if (response.ok && data.pet) {
        const info = {
          petName: data.pet.name,
          species: data.pet.species,
          breed: data.pet.breed,
        };
        setPetInfo(info);
        localStorage.setItem(`pet_${phoneNumber}`, JSON.stringify(info));
      }
    } catch (error) {
      console.error('Failed to fetch pet info:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    if (phone) {
      localStorage.setItem(`chat_${phone}`, JSON.stringify(updatedMessages));
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          message: input,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        riskLevel: data.riskLevel,
        vetRecommended: data.vetRecommended,
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      if (phone) {
        localStorage.setItem(`chat_${phone}`, JSON.stringify(finalMessages));
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, there was an error processing your message. Please try again.',
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      setMessages([]);
      if (phone) {
        localStorage.removeItem(`chat_${phone}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700"
          >
            ← Back to Home
          </Link>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear Chat
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
            <h1 className="text-2xl font-bold mb-2">🐾 Chat with PawPal</h1>
            {petInfo && (
              <p className="text-indigo-100">
                Chatting about {petInfo.petName} ({petInfo.species}
                {petInfo.breed && `, ${petInfo.breed}`})
              </p>
            )}
            {!petInfo && phone && (
              <p className="text-indigo-100 text-sm">
                💡 Tip: <Link href="/onboard" className="underline">Register your pet</Link> for personalized advice
              </p>
            )}
          </div>

          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                <p className="text-lg mb-2">👋 Hi! I'm PawPal</p>
                <p>Ask me anything about your pet's health, behavior, or nutrition!</p>
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
                  {message.vetRecommended && (
                    <div className="mt-2 pt-2 border-t border-gray-300">
                      <p className="text-sm font-semibold text-red-600">
                        ⚠️ Veterinary consultation recommended
                      </p>
                    </div>
                  )}
                  {message.riskLevel && (
                    <div className="mt-2 text-xs opacity-75">
                      Risk Level: {message.riskLevel}
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
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your pet's health..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={loading}
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

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>⚠️ PawPal provides guidance only. Always consult a veterinarian for serious concerns.</p>
        </div>
      </div>
    </div>
  );
}
