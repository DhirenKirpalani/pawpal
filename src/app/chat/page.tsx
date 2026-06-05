'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'pawpal_chat_state';

function detectLang(text: string): 'id' | 'en' {
  const idWords = ['anjing','kucing','hewan','peliharaan','sakit','makan','minum','muntah','diare','tidak','kenapa','gimana','dia','saya','aku','kamu','tolong','bantu','sudah','belum','masih','lagi','tadi','bisa','harus','perlu','dong','deh','sih','nih','tuh','wah','aduh','takut','khawatir','hilang','gamau','gabisa','gapapa','nggak','ngga','gak'];
  const lower = text.toLowerCase();
  const matches = idWords.filter(w => lower.includes(w));
  return matches.length >= 1 ? 'id' : 'en';
}

type EmotionalEntry = 'worried' | 'checking' | 'off' | 'celebrate' | null;

interface Message {
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

interface ConcernCard {
  topic: string;
  status: 'tracking' | 'monitoring' | 'improving';
  since: Date;
}

export default function CompanionChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [petName, setPetName] = useState<string | null>(null);
  const [showMemoryPrompt, setShowMemoryPrompt] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [activeConcern, setActiveConcern] = useState<ConcernCard | null>(null);
  const [statusMessage, setStatusMessage] = useState('PawPal is listening…');
  const [emotionalEntry, setEmotionalEntry] = useState<EmotionalEntry>(null);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [lang, setLang] = useState<'en' | 'id'>('en');
  const [hydrated, setHydrated] = useState(false);
  const memoryPromptShown = useRef(false);
  const memorySaved = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        setMessages(state.messages || []);
        setPetName(state.petName || null);
        setLang(state.lang || 'en');
        setMessageCount(state.messageCount || 0);
        setConversationStarted(state.conversationStarted || false);
        setEmotionalEntry(state.emotionalEntry || null);
        setActiveConcern(state.activeConcern || null);
        if (state.memorySaved) memorySaved.current = true;
        if (state.memoryPromptShown) memoryPromptShown.current = true;
        setHydrated(true);
        return;
      }
    } catch {}
    // Fresh start
    setHydrated(true);
    setTimeout(() => {
      addAssistantMessage("Hey 👋 I'm PawPal.\nI'm here with you and your pet.");
      setTimeout(() => addAssistantMessage("What's your pet's name?"), 1200);
    }, 400);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to localStorage on every change
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        messages, petName, lang, messageCount,
        conversationStarted, emotionalEntry, activeConcern,
        memorySaved: memorySaved.current,
        memoryPromptShown: memoryPromptShown.current,
      }));
    } catch {}
  }, [messages, petName, lang, messageCount, conversationStarted, emotionalEntry, activeConcern, hydrated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Show memory prompt only ONCE after 3 messages
    if (messageCount >= 3 && petName && !memoryPromptShown.current && !memorySaved.current) {
      memoryPromptShown.current = true;
      setTimeout(() => {
        setShowMemoryPrompt(true);
      }, 1500);
    }
  }, [messageCount, petName]);

  const addAssistantMessage = (content: string) => {
    setMessages(prev => [...prev, {
      role: 'assistant',
      content,
      timestamp: new Date()
    }]);
  };

  const addUserMessage = (content: string) => {
    // Detect language from user message
    const detectedLang = detectLang(content);
    setLang(detectedLang);
    setMessages(prev => [...prev, {
      role: 'user',
      content,
      timestamp: new Date()
    }]);
    setMessageCount(prev => prev + 1);
  };

  const handleEmotionalEntry = (type: EmotionalEntry) => {
    setEmotionalEntry(type);
    setConversationStarted(true);
    if (type) handleEmotionalResponse(type);
  };

  const handleEmotionalResponse = async (type: EmotionalEntry) => {
    setLoading(true);
    setStatusMessage(lang === 'id' ? 'Memahami perasaanmu…' : 'Understanding how you feel…');

    setTimeout(() => {
      const p = petName || (lang === 'id' ? 'hewan peliharaanmu' : 'your pet');
      if (type === 'worried') {
        addAssistantMessage(lang === 'id'
          ? `Aku ngerti kamu khawatir. Aku di sini buat bantu.\n\nCeritain yang lagi terjadi sama ${p}?`
          : `I'm here with you. What's been going on with ${p}?`);
        setActiveConcern({ topic: lang === 'id' ? 'Masalah kesehatan' : 'Health concern', status: 'tracking', since: new Date() });
        setStatusMessage(lang === 'id' ? 'Aku bakal terus pantau ini bareng kamu.' : "I'm going to stay with you on this.");
      } else if (type === 'off') {
        addAssistantMessage(lang === 'id'
          ? `Kamu ngerasa ada yang beda, ya. Insting kamu penting banget.\n\nApa yang berubah dari ${p}?`
          : `Sometimes we just sense when something isn't right.\n\nWhat have you noticed that feels different with ${p}?`);
        setStatusMessage(lang === 'id' ? 'Lagi bangun konteks soal hewanmu…' : 'Building context about your pet…');
      } else if (type === 'checking') {
        addAssistantMessage(lang === 'id'
          ? `Bagus banget kamu rajin ngecek! 💚\n\nGimana kabar ${p} hari ini?`
          : `Love that you're staying on top of things! 💚\n\nHow has ${p} been doing?`);
        setStatusMessage(lang === 'id' ? `Memantau ${p}…` : `Keeping track of ${p}…`);
      } else if (type === 'celebrate') {
        addAssistantMessage(lang === 'id'
          ? `Wah seneng banget denger kabar baik! 🎉\n\nCeritain dong, apa yang terjadi?`
          : `Love hearing good news! 🎉\n\nWhat's going on?`);
        setStatusMessage(lang === 'id' ? 'Ikut seneng bareng kamu…' : 'Celebrating with you…');
      }
      setLoading(false);
    }, 1200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    addUserMessage(userMessage);

    // Check if this is the pet name
    if (!petName && messageCount === 0) {
      const name = userMessage.trim();
      setPetName(name);
      setLoading(true);
      const detectedLang = detectLang(name);
      setLang(detectedLang);
      setTimeout(() => {
        addAssistantMessage(detectedLang === 'id'
          ? `Halo ${name}! 🐾\n\nGimana kabarnya hari ini?`
          : `Nice to meet ${name}! �\n\nHow is ${name} doing today?`);
        setLoading(false);
        setStatusMessage(detectedLang === 'id' ? `Membangun konteks tentang ${name}…` : `Building context about ${name}…`);
        setConversationStarted(true);
      }, 1200);
      return;
    }

    // Real API call
    const currentLang = detectLang(userMessage);
    setLang(currentLang);
    setLoading(true);
    setStatusMessage(currentLang === 'id' ? 'Lagi mikirin jawaban terbaik…' : 'Thinking…');

    try {
      // Build conversation history for API (exclude greetings, just last 10)
      const apiMessages = messages
        .slice(-10)
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
      apiMessages.push({ role: 'user', content: userMessage });

      const res = await fetch('/api/companion-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, petName, lang: currentLang }),
      });

      const data = await res.json();
      if (data.reply) {
        addAssistantMessage(data.reply);
        if (data.concern) {
          setActiveConcern({ topic: data.concern.topic, status: 'tracking', since: new Date() });
        }
      } else {
        addAssistantMessage(currentLang === 'id' ? 'Maaf, ada gangguan. Coba lagi ya.' : 'Sorry, something went wrong. Please try again.');
      }
    } catch {
      addAssistantMessage(currentLang === 'id' ? 'Maaf, tidak bisa konek. Coba lagi.' : 'Sorry, connection error. Please try again.');
    } finally {
      setLoading(false);
      setStatusMessage(currentLang === 'id' ? `Terus pantau ${petName || 'hewanmu'}…` : `Keeping track of ${petName || 'your pet'}…`);
    }
  };

  const handleSaveMemory = () => {
    if (memorySaved.current) return;
    memorySaved.current = true;
    setShowMemoryPrompt(false);
    setStatusMessage(lang === 'id' ? `Aku bakal inget semua tentang ${petName} 🐾` : `I'll remember everything about ${petName} 🐾`);
    setTimeout(() => {
      addAssistantMessage(lang === 'id'
        ? `Oke, aku udah simpan ${petName} 🐶\n\nKapanpun kamu mau ngobrol soal ${petName}, aku udah ada semua catatannya.`
        : `Got it — I've saved ${petName} 🐶\n\nWhenever you want to talk about ${petName}, I'll have all our history ready.`);
    }, 800);
  };

  const handleDismissMemory = () => {
    memoryPromptShown.current = true;
    setShowMemoryPrompt(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      {/* Nav Bar */}
      <div className="bg-white border-b border-purple-100 px-4 py-3 shadow-sm safe-top">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-purple-600 hover:text-purple-800 transition font-semibold text-sm">
            ← Home
          </a>
          <div className="flex items-center gap-2">
            <span className="text-xl">🐾</span>
            <span className="font-bold text-gray-800">PawPal</span>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY);
              window.location.reload();
            }}
            className="text-sm text-gray-400 hover:text-red-500 transition"
          >
            New chat
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden container mx-auto px-2 sm:px-4 py-2 sm:py-4 max-w-4xl">
        {/* Active Concern Card */}
        <AnimatePresence>
          {activeConcern && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-white rounded-2xl shadow-lg border-2 border-purple-200 p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🔍</span>
                    <h3 className="font-bold text-gray-800">We're tracking this together</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{activeConcern.topic}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activeConcern.status === 'improving' 
                        ? 'bg-green-100 text-green-700'
                        : activeConcern.status === 'monitoring'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {activeConcern.status === 'improving' ? '📈 Improving' : 
                       activeConcern.status === 'monitoring' ? '👁️ Monitoring' : 
                       '🎯 Tracking'}
                    </span>
                    <span className="text-xs text-gray-500">
                      Started {new Date(activeConcern.since).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Container */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3" style={{ WebkitOverflowScrolling: 'touch' }}>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                </div>
              </motion.div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Emotional entry buttons — only after pet name, before topic chosen */}
            {conversationStarted && !emotionalEntry && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 gap-3 pt-2"
              >
                {[
                  { type: 'worried' as EmotionalEntry, emoji: '😟', en: "I'm worried", id: 'Aku khawatir' },
                  { type: 'off' as EmotionalEntry, emoji: '🐾', en: 'Something feels off', id: 'Ada yang aneh' },
                  { type: 'checking' as EmotionalEntry, emoji: '💛', en: 'Just checking in', id: 'Mau cek kabar' },
                  { type: 'celebrate' as EmotionalEntry, emoji: '😊', en: 'Share good news', id: 'Mau share kabar baik' },
                ].map((btn) => (
                  <button
                    key={btn.type}
                    onClick={() => handleEmotionalEntry(btn.type)}
                    className="p-3 rounded-xl border-2 border-purple-100 hover:border-purple-400 hover:bg-purple-50 transition-all text-left group"
                  >
                    <span className="text-xl mr-2">{btn.emoji}</span>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-purple-600">
                      {lang === 'id' ? btn.id : btn.en}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Memory Prompt */}
          <AnimatePresence>
            {showMemoryPrompt && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="border-t border-gray-200 bg-gradient-to-r from-purple-50 to-fuchsia-50 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⭐</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {lang === 'id' ? `Mau aku inget ${petName} buat lain kali?` : `Want me to remember ${petName} for next time?`}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {lang === 'id' ? `Aku bakal simpan semua cerita tentang ${petName}` : `I'll keep track of everything about ${petName}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDismissMemory}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition"
                    >
                      Not now
                    </button>
                    <button
                      onClick={handleSaveMemory}
                      className="px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:shadow-lg transition"
                    >
                      {lang === 'id' ? `Ya, simpan ${petName}` : `Yes, save ${petName}`}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input */}
          <div className="border-t border-gray-200 p-4 pb-safe">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder={
                  !petName
                    ? (lang === 'id' ? 'Nama hewanmu...' : "Your pet's name...")
                    : (lang === 'id' ? 'Cerita lebih banyak...' : 'Tell me more...')
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 transition"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold px-6 py-3 rounded-xl transition shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                Send
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {lang === 'id' ? 'Aku di sini buat hewanmu 🐾' : "I'm here for your pet 🐾"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
