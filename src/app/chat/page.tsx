'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, MessageCircle, Paperclip, Mic, Send, PawPrint, Palette, PanelLeft, Search, Trash2, Plus, MapPin, Menu } from 'lucide-react';
import { track, trackMessage, trackEmotion, trackFeatureCommand, trackNotificationPermission } from '@/lib/analytics';
import { t } from '@/lib/transify';
import { handleFeature, type FeatureCard } from '@/lib/features/local-feature-manager';

/* ── Emotional Mood Orb ── */
function MoodOrb({ mood }: { mood: EmotionalEntry }) {
  const moodConfig = {
    worried: { color: 'bg-amber-400', glow: 'mood-worried', emoji: '😟' },
    checking: { color: 'bg-purple-400', glow: 'mood-calm', emoji: '💛' },
    off: { color: 'bg-orange-400', glow: 'mood-worried', emoji: '🤔' },
    celebrate: { color: 'bg-green-400', glow: 'mood-celebrate', emoji: '🥳' },
    null: { color: 'bg-purple-500', glow: 'mood-calm', emoji: '🐾' },
  };
  const config = mood ? moodConfig[mood] : moodConfig.null;

  return (
    <motion.div
      className={`relative w-8 h-8 rounded-full ${config.color} ${config.glow} flex items-center justify-center`}
      animate={{
        scale: [1, 1.15, 1],
      }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <span className="text-sm">{config.emoji}</span>
    </motion.div>
  );
}

function getAmbientGradient(mood: EmotionalEntry): string {
  switch (mood) {
    case 'worried': return 'from-amber-50 via-orange-50 to-yellow-50';
    case 'off': return 'from-orange-50 via-amber-50 to-stone-50';
    case 'celebrate': return 'from-green-50 via-emerald-50 to-teal-50';
    case 'checking': return 'from-violet-50 via-purple-50 to-fuchsia-50';
    default: return 'from-violet-50 via-purple-50 to-fuchsia-50';
  }
}

function getStatusDotColor(mood: EmotionalEntry): string {
  switch (mood) {
    case 'worried': return 'bg-amber-400';
    case 'off': return 'bg-orange-400';
    case 'celebrate': return 'bg-green-400';
    case 'checking': return 'bg-purple-400';
    default: return 'bg-purple-500';
  }
}

/* ── Mood-based chat styling ── */
function getChatContainerRing(mood: EmotionalEntry): string {
  switch (mood) {
    case 'worried': return 'ring-2 ring-amber-300/50 shadow-amber-200/50';
    case 'off': return 'ring-2 ring-orange-300/50 shadow-orange-200/50';
    case 'celebrate': return 'ring-2 ring-green-300/50 shadow-green-200/50';
    case 'checking': return 'ring-2 ring-purple-300/50 shadow-purple-200/50';
    default: return 'ring-2 ring-purple-300/50 shadow-purple-200/50';
  }
}

function getAssistantBubble(mood: EmotionalEntry): string {
  switch (mood) {
    case 'worried': return 'bg-gradient-to-br from-amber-50 to-orange-50 text-amber-900 border border-amber-200';
    case 'off': return 'bg-gradient-to-br from-orange-50 to-stone-50 text-orange-900 border border-orange-200';
    case 'celebrate': return 'bg-gradient-to-br from-green-50 to-emerald-50 text-green-900 border border-green-200';
    case 'checking': return 'bg-gradient-to-br from-violet-50 to-purple-50 text-purple-900 border border-purple-200';
    default: return 'bg-white/90 text-gray-800 border border-purple-100 shadow-sm';
  }
}

function getTypingBarColor(mood: EmotionalEntry): string {
  switch (mood) {
    case 'worried': return 'bg-amber-400';
    case 'off': return 'bg-orange-400';
    case 'celebrate': return 'bg-green-400';
    case 'checking': return 'bg-purple-400';
    default: return 'bg-purple-400';
  }
}

function getSendButton(mood: EmotionalEntry): string {
  switch (mood) {
    case 'worried': return 'from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600';
    case 'off': return 'from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600';
    case 'celebrate': return 'from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600';
    case 'checking': return 'from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700';
    default: return 'from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700';
  }
}

function getInputFocusRing(mood: EmotionalEntry): string {
  switch (mood) {
    case 'worried': return 'focus:ring-amber-400 focus:border-amber-400';
    case 'off': return 'focus:ring-orange-400 focus:border-orange-400';
    case 'celebrate': return 'focus:ring-green-400 focus:border-green-400';
    case 'checking': return 'focus:ring-purple-500 focus:border-purple-500';
    default: return 'focus:ring-purple-500 focus:border-transparent';
  }
}

function getBlobColor1(mood: EmotionalEntry): string {
  switch (mood) {
    case 'worried': return '#fbbf24';
    case 'off': return '#fb923c';
    case 'celebrate': return '#4ade80';
    case 'checking': return '#c084fc';
    default: return '#a78bfa';
  }
}

function getBlobColor2(mood: EmotionalEntry): string {
  switch (mood) {
    case 'worried': return '#f59e0b';
    case 'off': return '#f97316';
    case 'celebrate': return '#34d399';
    case 'checking': return '#e879f9';
    default: return '#f472b6';
  }
}

function getBlobColor3(mood: EmotionalEntry): string {
  switch (mood) {
    case 'worried': return '#fcd34d';
    case 'off': return '#fdba74';
    case 'celebrate': return '#6ee7b7';
    case 'checking': return '#d8b4fe';
    default: return '#c084fc';
  }
}

/* ── Mobile detection hook ── */
function useIsMobile(threshold = 640): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < threshold);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [threshold]);
  return isMobile;
}

/* ── Page visibility hook ── */
function usePageVisible(): boolean {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const handler = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);
  return visible;
}

/* ── Floating Paw Particles in background ── */
// Disabled on mobile — saves significant GPU compositing cost
function FloatingPaws({ mood, isMobile }: { mood: EmotionalEntry; isMobile: boolean }) {
  if (isMobile) return null;
  const items = mood === 'worried' ? ['🐾', '💭'] :
    mood === 'off' ? ['🐾', '👀'] :
    mood === 'celebrate' ? ['🐾', '✨'] :
    ['🐾', '💜'];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {items.map((emoji, i) => (
        <motion.span
          key={`paw-${mood}-${i}`}
          className="absolute text-lg"
          style={{ opacity: 0.06, left: `${15 + i * 30}%` }}
          initial={{ y: '110vh' }}
          animate={{ y: '-10vh' }}
          transition={{ duration: 22 + i * 5, repeat: Infinity, ease: 'linear', delay: i * 6 }}
        >
          {emoji}
        </motion.span>
      ))}
    </div>
  );
}

const THEME_CLASSES: Record<string, string> = {
  default: 'bg-gradient-to-b from-violet-50/90 via-white/85 to-fuchsia-50/80',
  warm:    'bg-gradient-to-b from-amber-50/90 via-rose-50/80 to-orange-50/80',
  ocean:   'bg-gradient-to-b from-sky-50/90 via-cyan-50/85 to-blue-50/80',
  forest:  'bg-gradient-to-b from-emerald-50/90 via-green-50/85 to-teal-50/80',
  night:   'bg-gradient-to-b from-slate-800/95 via-slate-900/90 to-slate-800/95',
};
const THEME_LABELS: Record<string, { label: string; dot: string }> = {
  default: { label: 'Lavender', dot: 'bg-violet-400' },
  warm:    { label: 'Warm',     dot: 'bg-amber-400' },
  ocean:   { label: 'Ocean',    dot: 'bg-sky-400' },
  forest:  { label: 'Forest',   dot: 'bg-emerald-400' },
  night:   { label: 'Night',    dot: 'bg-slate-700' },
};

function getChatBg(mood: EmotionalEntry, theme: string = 'default'): string {
  if (theme !== 'default') return THEME_CLASSES[theme] ?? THEME_CLASSES.default;
  switch (mood) {
    case 'worried': return 'bg-gradient-to-b from-amber-50/90 via-white/85 to-orange-50/80';
    case 'off':     return 'bg-gradient-to-b from-orange-50/90 via-white/85 to-rose-50/80';
    case 'celebrate': return 'bg-gradient-to-b from-green-50/90 via-white/85 to-emerald-50/80';
    case 'checking': return 'bg-gradient-to-b from-purple-50/90 via-white/85 to-violet-50/80';
    default:        return THEME_CLASSES.default;
  }
}

function getGlowClass(mood: EmotionalEntry): string {
  switch (mood) {
    case 'worried': return 'shadow-[0_0_40px_rgba(251,191,36,0.3)]';
    case 'off': return 'shadow-[0_0_40px_rgba(251,146,60,0.3)]';
    case 'celebrate': return 'shadow-[0_0_40px_rgba(74,222,128,0.3)]';
    case 'checking': return 'shadow-[0_0_40px_rgba(192,132,252,0.3)]';
    default: return 'shadow-[0_0_40px_rgba(167,139,250,0.3)]';
  }
}

function getConcernBorder(mood: EmotionalEntry): string {
  switch (mood) {
    case 'worried': return 'border-amber-300';
    case 'off': return 'border-orange-300';
    case 'celebrate': return 'border-green-300';
    case 'checking': return 'border-purple-300';
    default: return 'border-purple-200';
  }
}

/* ── Floating Mood Particles inside chat ── */
function MoodParticles({ mood, isMobile }: { mood: EmotionalEntry; isMobile: boolean }) {
  if (!mood) return null;
  const emojis = {
    worried: isMobile ? ['😟', '🫂'] : ['😟', '💭', '😰', '🫂'],
    off: isMobile ? ['🤔', '❓'] : ['🤔', '👀', '❓', '🔍'],
    celebrate: isMobile ? ['🎉', '✨'] : ['🎉', '✨', '🎊', '🥳', '💚'],
    checking: isMobile ? ['💛', '✨'] : ['💛', '🐾', '💚', '✨'],
  };
  const set = emojis[mood] || emojis.checking;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {set.map((e, i) => (
        <motion.span
          key={`${mood}-${i}`}
          className="absolute"
          style={{ opacity: 0.08, left: `${10 + i * 28}%`, fontSize: `${14 + i * 3}px` }}
          initial={{ y: '110%', scale: 0.5 }}
          animate={{ y: '-10%', scale: [0.5, 1.2, 0.8] }}
          transition={{ duration: 12 + i * 4, repeat: Infinity, ease: 'easeInOut', delay: i * 3 }}
        >
          {e}
        </motion.span>
      ))}
    </div>
  );
}

/* ── Mood reaction emoji that pops on new assistant message ── */
function MoodReaction({ mood }: { mood: EmotionalEntry }) {
  const emoji = {
    worried: '🫂',
    off: '🔍',
    celebrate: '🎉',
    checking: '💛',
  }[mood || 'checking'];
  return (
    <motion.span
      className="absolute -top-3 -right-3 text-2xl"
      initial={{ scale: 0, rotate: -30, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 12, delay: 0.2 }}
    >
      {emoji}
    </motion.span>
  );
}

/* ── Memoized message bubble ── */
const MessageBubble = React.memo(function MessageBubble({
  message,
  index,
  totalCount,
  loading,
  emotionalEntry,
}: {
  message: Message;
  index: number;
  totalCount: number;
  loading: boolean;
  emotionalEntry: EmotionalEntry;
}) {
  const isLast = index === totalCount - 1;
  const isStreamingAssistant = isLast && message.role === 'assistant' && loading && message.content.length > 0;

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 24, scale: 0.88, x: message.role === 'user' ? 30 : -30 }}
      animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
      transition={{ type: 'spring' as const, stiffness: 260, damping: 22, delay: index < 3 ? index * 0.06 : 0 }}
      className={`flex w-full items-start gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      {/* Assistant avatar — left side */}
      {message.role === 'assistant' && (
        <motion.div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md bg-gradient-to-br from-violet-200 to-fuchsia-200"
          whileHover={{ scale: 1.15, rotate: 10 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
        >
          <PawPrint size={16} className="text-violet-700" />
        </motion.div>
      )}

      <div className="flex flex-col max-w-[78%]">
        <motion.div
          whileHover={{ scale: 1.02, rotate: message.role === 'user' ? -0.5 : 0.5 }}
          transition={{ type: 'spring' as const, stiffness: 350, damping: 20 }}
          className={`relative px-4 py-3 ${
            message.role === 'user'
              ? `bg-gradient-to-r ${getSendButton(emotionalEntry).split(' ')[0]} ${getSendButton(emotionalEntry).split(' ')[1]} text-white shadow-lg shadow-purple-500/20 rounded-2xl rounded-br-sm`
              : `${getAssistantBubble(emotionalEntry)} shadow-md rounded-2xl rounded-bl-sm`
          } transition-colors duration-500`}
        >
          {message.role === 'assistant' && !isStreamingAssistant && isLast && !message.content.includes('Hey 👋') && (
            <MoodReaction mood={emotionalEntry} />
          )}
          {message.image && (
            <motion.img
              src={message.image}
              alt="Attached"
              className="max-h-48 rounded-lg mb-2 object-cover"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            />
          )}
          {message.content && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
              {isStreamingAssistant && (
                <motion.span
                  className="inline-block w-2 h-4 ml-1 bg-current opacity-60 rounded-full"
                  animate={{ opacity: [0.2, 1, 0.2], scaleY: [0.6, 1, 0.6] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
            </p>
          )}
          {/* Feature Card */}
          {message.featureCard && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
              className={`mt-1 rounded-xl border-2 p-3 ${message.featureCard.accent}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{message.featureCard.emoji}</span>
                <span className="font-semibold text-sm text-gray-800">{message.featureCard.title}</span>
              </div>
              {message.featureCard.body && (
                <p className="text-sm text-gray-700">{message.featureCard.body}</p>
              )}
              {message.featureCard.items && message.featureCard.items.length > 0 && (
                <ul className="mt-1 space-y-1">
                  {message.featureCard.items.map((item, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-1">
                      <span className="text-gray-400 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}
        </motion.div>
        <p className={`text-[10px] mt-1 opacity-40 ${message.role === 'user' ? 'text-right pr-1' : 'text-left pl-1'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
        {/* Source citations */}
        {message.sources && message.sources.length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.sources.map((src, si) => (
              <a
                key={si}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-full text-[10px] font-medium transition-colors"
              >
                <span>🔗</span>{src.label}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* User avatar — right side */}
      {message.role === 'user' && (
        <motion.div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md bg-gradient-to-br from-purple-400 to-fuchsia-400 text-white"
          whileHover={{ scale: 1.15, rotate: -10 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
        </motion.div>
      )}
    </motion.div>
  );
});

const STORAGE_KEY = 'pawpal_chat_state';
const SESSIONS_INDEX_KEY = 'pawpal_sessions';
const ACTIVE_SESSION_KEY = 'pawpal_active_session';

interface SessionSummary {
  id: string;
  title: string;
  petName: string | null;
  petType: 'cat' | 'dog' | null;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  preview: string;
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function loadSessions(): SessionSummary[] {
  try { return JSON.parse(localStorage.getItem(SESSIONS_INDEX_KEY) || '[]'); } catch { return []; }
}

function saveSessions(sessions: SessionSummary[]): void {
  try { localStorage.setItem(SESSIONS_INDEX_KEY, JSON.stringify(sessions)); } catch {}
}

function saveSessionData(id: string, data: unknown): void {
  try { localStorage.setItem(`pawpal_session_${id}`, JSON.stringify(data)); } catch {}
}

function loadSessionData(id: string): ReturnType<typeof JSON.parse> | null {
  try { return JSON.parse(localStorage.getItem(`pawpal_session_${id}`) || 'null'); } catch { return null; }
}

function deleteSessionData(id: string): void {
  localStorage.removeItem(`pawpal_session_${id}`);
}

function relativeTime(ts: number, lang: 'en' | 'id'): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (lang === 'id') {
    if (mins < 1) return 'Baru saja';
    if (mins < 60) return `${mins} mnt lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    if (days < 7) return `${days} hari lalu`;
    return new Date(ts).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  }
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function groupSessions(sessions: SessionSummary[]): { label: string; items: SessionSummary[] }[] {
  const now = Date.now();
  const today: SessionSummary[] = [];
  const yesterday: SessionSummary[] = [];
  const week: SessionSummary[] = [];
  const older: SessionSummary[] = [];
  sessions.forEach(s => {
    const d = now - s.updatedAt;
    if (d < 86400000) today.push(s);
    else if (d < 172800000) yesterday.push(s);
    else if (d < 604800000) week.push(s);
    else older.push(s);
  });
  const groups = [
    { label: 'Today', items: today },
    { label: 'Yesterday', items: yesterday },
    { label: 'Last 7 days', items: week },
    { label: 'Older', items: older },
  ];
  return groups.filter(g => g.items.length > 0);
}

function detectLang(text: string): 'id' | 'en' {
  const idWords = ['anabul','anjing','kucing','hewan','peliharaan','sakit','makan','minum','muntah','diare','tidak','kenapa','gimana','dia','saya','aku','kamu','tolong','bantu','sudah','belum','masih','lagi','tadi','bisa','harus','perlu','dong','deh','sih','nih','tuh','wah','aduh','takut','khawatir','hilang','gamau','gabisa','gapapa','nggak','ngga','gak'];
  const lower = text.toLowerCase();
  const matches = idWords.filter(w => lower.includes(w));
  return matches.length >= 1 ? 'id' : 'en';
}

type EmotionalEntry = 'worried' | 'checking' | 'off' | 'celebrate' | null;

type ChatTheme = 'default' | 'warm' | 'ocean' | 'forest' | 'night';

interface Message {
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
  image?: string | null;
  featureCard?: FeatureCard;
  sources?: { label: string; url: string }[];
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
  const [petType, setPetType] = useState<'cat' | 'dog' | null>(null);
  const [showMemoryPrompt, setShowMemoryPrompt] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [activeConcern, setActiveConcern] = useState<ConcernCard | null>(null);
  const [statusMessage, setStatusMessage] = useState('PawPal is listening…');
  const [emotionalEntry, setEmotionalEntry] = useState<EmotionalEntry>(null);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [lang, setLang] = useState<'en' | 'id'>('en');

  // Sync lang from localStorage after hydration
  useEffect(() => {
    const saved = localStorage.getItem('pawpal_lang');
    if (saved === 'id' || saved === 'en') setLang(saved);
  }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [chatTheme, setChatTheme] = useState<ChatTheme>('default');
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showBurgerMenu, setShowBurgerMenu] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem('pawpal_chat_theme') as ChatTheme | null;
    if (saved) setChatTheme(saved);
  }, []);
  const handleSetTheme = (t: ChatTheme) => {
    setChatTheme(t);
    localStorage.setItem('pawpal_chat_theme', t);
    setShowThemePicker(false);
  };

  const [hydrated, setHydrated] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; city?: string } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const memoryPromptShown = useRef(false);
  const memorySaved = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const pageVisible = usePageVisible();

  const [sessionId, setSessionId] = useState<string>(() => genId());
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermission(Notification.permission);
    }
    setSessions(loadSessions());

    const activeId = localStorage.getItem(ACTIVE_SESSION_KEY);
    const targetId = activeId || null;
    const saved = targetId ? loadSessionData(targetId) : localStorage.getItem(STORAGE_KEY) ? (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)!); } catch { return null; } })() : null;

    if (saved && saved.messages?.length) {
      if (targetId) setSessionId(targetId);
      setMessages(saved.messages || []);
      setPetName(saved.petName || null);
      setPetType(saved.petType || null);
      setLang(saved.lang || 'en');
      setMessageCount(saved.messageCount || 0);
      setConversationStarted(saved.conversationStarted || false);
      setEmotionalEntry(saved.emotionalEntry || null);
      setActiveConcern(saved.activeConcern || null);
      if (saved.memorySaved) memorySaved.current = true;
      if (saved.memoryPromptShown) memoryPromptShown.current = true;
      setHydrated(true);
      return;
    }
    // Fresh start
    setHydrated(true);
    setTimeout(() => {
      addAssistantMessage(t('onboarding_greeting', lang));
      setTimeout(() => addAssistantMessage(t('onboarding_ask_name', lang)), 1200);
    }, 400);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to localStorage on every change
  useEffect(() => {
    if (!hydrated || messages.length === 0) return;
    const state = {
      messages, petName, petType, lang, messageCount,
      conversationStarted, emotionalEntry, activeConcern,
      memorySaved: memorySaved.current,
      memoryPromptShown: memoryPromptShown.current,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      localStorage.setItem(ACTIVE_SESSION_KEY, sessionId);
      saveSessionData(sessionId, state);
      // Update sessions index
      const userMsgs = messages.filter(m => m.role === 'user');
      if (userMsgs.length > 0) {
        const title = userMsgs[0].content.slice(0, 50) || 'Chat';
        const preview = messages[messages.length - 1]?.content?.slice(0, 60) || '';
        const existing = loadSessions();
        const idx = existing.findIndex(s => s.id === sessionId);
        const summary: SessionSummary = {
          id: sessionId, title, petName, petType,
          createdAt: idx >= 0 ? existing[idx].createdAt : Date.now(),
          updatedAt: Date.now(),
          messageCount: messages.length,
          preview,
        };
        const updated = idx >= 0
          ? existing.map(s => s.id === sessionId ? summary : s)
          : [summary, ...existing];
        saveSessions(updated);
        setSessions(updated);
      }
    } catch {}
  }, [messages, petName, petType, lang, messageCount, conversationStarted, emotionalEntry, activeConcern, hydrated, sessionId]);

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
    trackMessage('assistant');
  };

  const addUserMessage = (content: string, image?: string | null) => {
    // Detect language from user message
    const detectedLang = detectLang(content);
    setLang(detectedLang);
    setMessages(prev => [...prev, {
      role: 'user',
      content,
      timestamp: new Date(),
      image
    }]);
    setMessageCount(prev => prev + 1);
    trackMessage('user', !!image);
  };

  // Auto-focus the chat input whenever the assistant finishes responding
  const prevLoadingRef = useRef(loading);
  useEffect(() => {
    const wasLoading = prevLoadingRef.current;
    prevLoadingRef.current = loading;
    if (wasLoading && !loading && inputRef.current) {
      // Small delay to let React finish rendering the new message
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [loading]);

  // Auto-focus on first load after onboarding messages appear
  useEffect(() => {
    if (hydrated && messages.length > 0 && inputRef.current) {
      const t = setTimeout(() => inputRef.current?.focus(), 600);
      return () => clearTimeout(t);
    }
  }, [hydrated]);

  const handleEmotionalEntry = (type: EmotionalEntry) => {
    setEmotionalEntry(type);
    setConversationStarted(true);
    if (type) {
      trackEmotion(type);
      handleEmotionalResponse(type);
    }
  };

  const handleEmotionalResponse = async (type: EmotionalEntry) => {
    setLoading(true);
    setStatusMessage(t('emotion_understanding', lang));

    setTimeout(() => {
      const p = petName || t('fallback_pet', lang);
      if (type === 'worried') {
        addAssistantMessage(t('emotion_worried', lang, { p }));
        setActiveConcern({ topic: t('emotion_worried_topic', lang), status: 'tracking', since: new Date() });
        setStatusMessage(t('emotion_status_worried', lang));
      } else if (type === 'off') {
        addAssistantMessage(t('emotion_off', lang, { p }));
        setStatusMessage(t('emotion_status_off', lang));
      } else if (type === 'checking') {
        addAssistantMessage(t('emotion_checking', lang, { p }));
        setStatusMessage(t('emotion_status_checking', lang, { p }));
      } else if (type === 'celebrate') {
        addAssistantMessage(t('emotion_celebrate', lang));
        setStatusMessage(t('emotion_status_celebrate', lang));
      }
      setLoading(false);
    }, 1200);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      alert(t('error_image_size', lang));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const MAX = 1024;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
          else { width = Math.round(width * MAX / height); height = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        setImagePreview(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const startNewChat = () => {
    const newId = genId();
    setSessionId(newId);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(ACTIVE_SESSION_KEY, newId);
    setMessages([]);
    setPetName(null);
    setPetType(null);
    setMessageCount(0);
    setConversationStarted(false);
    setEmotionalEntry(null);
    setActiveConcern(null);
    memorySaved.current = false;
    memoryPromptShown.current = false;
    setShowSidebar(false);
    setHydrated(false);
    setTimeout(() => {
      addAssistantMessage(t('onboarding_greeting', lang));
      setTimeout(() => addAssistantMessage(t('onboarding_ask_name', lang)), 1200);
      setHydrated(true);
    }, 200);
  };

  const loadSession = (id: string) => {
    const data = loadSessionData(id);
    if (!data) return;
    setSessionId(id);
    localStorage.setItem(ACTIVE_SESSION_KEY, id);
    setMessages(data.messages || []);
    setPetName(data.petName || null);
    setPetType(data.petType || null);
    setLang(data.lang || 'en');
    setMessageCount(data.messageCount || 0);
    setConversationStarted(data.conversationStarted || false);
    setEmotionalEntry(data.emotionalEntry || null);
    setActiveConcern(data.activeConcern || null);
    memorySaved.current = data.memorySaved || false;
    memoryPromptShown.current = data.memoryPromptShown || false;
    setShowSidebar(false);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSessionData(id);
    const updated = loadSessions().filter(s => s.id !== id);
    saveSessions(updated);
    setSessions(updated);
    if (id === sessionId) startNewChat();
  };

  const requestLocation = () => {
    if (!navigator.geolocation) return;
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || '';
          setUserLocation({ lat, lng, city });
        } catch {
          setUserLocation({ lat, lng });
        }
        setLocationLoading(false);
      },
      () => setLocationLoading(false),
      { timeout: 8000 }
    );
  };

  const getVetSearchUrl = () => {
    if (!userLocation) return `https://www.google.com/maps/search/veterinarian+near+me`;
    return `https://www.google.com/maps/search/veterinarian/@${userLocation.lat},${userLocation.lng},14z`;
  };

  const clearImagePreview = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFeatureCommand = (command: string) => {
    setInput(command);
    trackFeatureCommand(command);
    if (fileInputRef.current) fileInputRef.current.focus();
  };

  /* ── Voice input via Web Speech API ── */
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'id' ? 'id-ID' : 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setInput(transcript);
    };

    recognition.start();
  };

  /* ── Push notification permission ── */
  const requestPushPermission = async () => {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPushPermission(result);
    trackNotificationPermission(result);
    if (result === 'granted') {
      new Notification('PawPal', {
        body: t('nav_notifications_on', lang),
        icon: '/icon-192.png',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    addUserMessage(userMessage, imagePreview);

    // Check if this is the pet name
    if (!petName && messageCount === 0) {
      const lower = userMessage.toLowerCase();
      const greetings = ['hi', 'hello', 'hey', 'halo', 'hai', 'yo', 'sup', 'hola', 'helo', 'heloh'];
      const isGreeting = greetings.some(g => lower === g || lower.startsWith(g + ' '));

      if (isGreeting) {
        setLoading(true);
        const detectedLang = detectLang(userMessage);
        setLang(detectedLang);
        setTimeout(() => {
          addAssistantMessage(t('onboarding_greeting_fallback', detectedLang));
          setLoading(false);
        }, 600);
        return;
      }

      const name = userMessage.trim();
      setPetName(name);
      setLoading(true);
      const detectedLang = detectLang(name);
      setLang(detectedLang);
      setTimeout(() => {
        addAssistantMessage(t('onboarding_ask_type', detectedLang, { name }));
        setLoading(false);
      }, 800);
      return;
    }

    // Check if this is the pet type (right after name)
    if (petName && !petType && messageCount === 1) {
      // If user sent a photo, let the AI identify the pet type from the image
      if (!imagePreview) {
        const lower = userMessage.toLowerCase();
        let detected: 'cat' | 'dog' | null = null;

        if (lower.includes('cat') || lower.includes('kucing') || lower.includes('kitten')) detected = 'cat';
        else if (lower.includes('dog') || lower.includes('anjing') || lower.includes('puppy')) detected = 'dog';

        if (detected) {
          setPetType(detected);
          setLoading(true);
          const typeLabel = detected === 'cat' ? (lang === 'id' ? 'kucing' : 'cat') : (lang === 'id' ? 'anjing' : 'dog');
          setTimeout(() => {
            addAssistantMessage(t('onboarding_welcome_type', lang, { name: petName, type: typeLabel }));
            setLoading(false);
            setStatusMessage(t('status_building', lang, { name: petName }));
            setConversationStarted(true);
          }, 800);
          return;
        }

        // Couldn't detect — ask again
        setLoading(true);
        setTimeout(() => {
          addAssistantMessage(t('onboarding_type_retry', lang, { name: petName }));
          setLoading(false);
        }, 600);
        return;
      }
      // imagePreview is set → fall through to API so vision can identify the pet
    }

    // Check for feature commands before hitting the AI
    const featureResult = handleFeature(userMessage, lang);
    if (featureResult.handled) {
      trackFeatureCommand(userMessage);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: featureResult.text,
        timestamp: new Date(),
        featureCard: featureResult.card,
      }]);
      setMessageCount(c => c + 1);
      return;
    }

    // Real API call — streaming
    const currentLang = detectLang(userMessage);
    setLang(currentLang);
    setLoading(true);
    setStatusMessage(t('emotion_thinking', currentLang));

    try {
      const apiMessages = messages
        .slice(-10)
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
      apiMessages.push({ role: 'user', content: userMessage });

      const res = await fetch('/api/companion-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, petName, petType, lang: currentLang, emotionalEntry, image: imagePreview }),
      });

      // Clear image preview after sending
      if (imagePreview) clearImagePreview();

      if (!res.ok) {
        const errBody = await res.text().catch(() => null);
        let errMsg = t('error_connection', currentLang);
        if (errBody) {
          try {
            const parsed = JSON.parse(errBody);
            if (parsed.message) errMsg = parsed.message;
          } catch {}
        }
        addAssistantMessage(errMsg);
        setLoading(false);
        return;
      }
      if (!res.body) {
        throw new Error('Failed to connect');
      }

      // Add empty assistant message that we'll stream into
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '',
        timestamp: new Date()
      }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // keep incomplete line

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const chunk = JSON.parse(line);
            if (chunk.type === 'token') {
              setMessages(prev => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last && last.role === 'assistant') {
                  updated[updated.length - 1] = { ...last, content: last.content + chunk.content };
                }
                return updated;
              });
            } else if (chunk.type === 'emotion') {
              // Map API emotion hint back to EmotionalEntry
              const mapped: EmotionalEntry =
                chunk.emotion === 'worried' || chunk.emotion === 'anxious' ? 'worried' :
                chunk.emotion === 'celebrating' ? 'celebrate' :
                chunk.emotion === 'concerned' ? 'off' :
                chunk.emotion === 'calm' ? 'checking' : null;
              if (mapped) setEmotionalEntry(mapped);
            } else if (chunk.type === 'done') {
              if (chunk.concern) {
                setActiveConcern({ topic: chunk.concern.topic, status: 'tracking', since: new Date() });
              }
              // Parse [Sources: ...] from final message and strip it from display text
              setMessages(prev => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last && last.role === 'assistant') {
                  const srcMatch = last.content.match(/\[Sources?:\s*([^\]]+)\]/i);
                  if (srcMatch) {
                    const sourceMap: Record<string, string> = {
                      'vca hospitals': 'https://vcahospitals.com',
                      'petmd': 'https://www.petmd.com',
                      'aspca': 'https://www.aspca.org',
                      'cornell feline health center': 'https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center',
                      'akc': 'https://www.akc.org',
                    };
                    const sources = srcMatch[1].split('|').map(s => s.trim()).filter(Boolean).map(label => ({
                      label,
                      url: sourceMap[label.toLowerCase()] ?? `https://www.google.com/search?q=${encodeURIComponent(label + ' pet health')}`,
                    }));
                    updated[updated.length - 1] = {
                      ...last,
                      content: last.content.replace(/\n*\[Sources?:[^\]]+\]/gi, '').trim(),
                      sources,
                    };
                  }
                }
                return updated;
              });
            } else if (chunk.type === 'error') {
              setMessages(prev => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last && last.role === 'assistant') {
                  updated[updated.length - 1] = { ...last, content: t('error_generic', currentLang) };
                }
                return updated;
              });
            }
          } catch {
            // ignore malformed line
          }
        }
      }
    } catch {
      addAssistantMessage(t('error_connection', currentLang));
    } finally {
      setLoading(false);
      setStatusMessage(t('status_tracking', currentLang, { p: petName || t('fallback_pet', currentLang) }));
    }
  };

  const handleSaveMemory = () => {
    if (memorySaved.current) return;
    memorySaved.current = true;
    setShowMemoryPrompt(false);
    setStatusMessage(t('memory_status_saved', lang, { name: petName || '' }));
    setTimeout(() => {
      addAssistantMessage(t('memory_saved', lang, { name: petName || '' }));
    }, 800);
  };

  const handleDismissMemory = () => {
    memoryPromptShown.current = true;
    setShowMemoryPrompt(false);
  };

  const filteredSessions = sessions.filter(s =>
    sidebarSearch === '' ||
    s.title.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
    (s.petName && s.petName.toLowerCase().includes(sidebarSearch.toLowerCase()))
  ).sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className={`h-screen flex flex-col bg-gradient-to-br ${getAmbientGradient(emotionalEntry)} transition-colors duration-1000 relative overflow-hidden`}>

      {/* ── Chat History Sidebar ── */}
      <AnimatePresence>
        {showSidebar && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSidebar(false)}
            />
            {/* Sidebar panel */}
            <motion.div
              className="fixed left-0 top-0 h-full w-72 bg-white/95 backdrop-blur-xl shadow-2xl z-50 flex flex-col"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="p-4 border-b border-purple-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <PawPrint size={18} className="text-violet-600" />
                    <span className="font-bold text-gray-800">PawPal</span>
                  </div>
                  <motion.button
                    onClick={() => setShowSidebar(false)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <PanelLeft size={16} />
                  </motion.button>
                </div>
                {/* New chat button */}
                <motion.button
                  onClick={startNewChat}
                  className="w-full flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-shadow"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Plus size={16} />
                  {lang === 'id' ? 'Chat Baru' : 'New Chat'}
                </motion.button>
              </div>

              {/* Search */}
              <div className="px-4 py-3 border-b border-purple-50">
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                  <Search size={14} className="text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={sidebarSearch}
                    onChange={e => setSidebarSearch(e.target.value)}
                    placeholder={lang === 'id' ? 'Cari chat...' : 'Search chats...'}
                    className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none min-w-0"
                  />
                </div>
              </div>

              {/* Sessions list */}
              <div className="flex-1 overflow-y-auto py-2">
                {filteredSessions.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-400 text-sm">
                    {sidebarSearch ? (lang === 'id' ? 'Tidak ada hasil' : 'No results') : (lang === 'id' ? 'Belum ada riwayat chat' : 'No chat history yet')}
                  </div>
                ) : (
                  groupSessions(filteredSessions).map(group => (
                    <div key={group.label} className="mb-2">
                      <p className="px-4 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{group.label}</p>
                      {group.items.map(s => (
                        <motion.div
                          key={s.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => loadSession(s.id)}
                          className={`w-full text-left px-4 py-2.5 group flex items-start justify-between gap-2 transition-colors ${s.id === sessionId ? 'bg-purple-50 border-r-2 border-violet-500' : 'hover:bg-gray-50'}`}
                          whileHover={{ x: 2 }}
                        >
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${s.id === sessionId ? 'text-violet-700' : 'text-gray-800'}`}>
                              {s.title}
                            </p>
                            {s.petName && (
                              <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                                <PawPrint size={10} />{s.petName}
                                {s.petType && ` · ${s.petType}`}
                              </p>
                            )}
                            <p className="text-[10px] text-gray-300 mt-0.5">{relativeTime(s.updatedAt, lang)}</p>
                          </div>
                          <motion.button
                            onClick={e => deleteSession(s.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 hover:text-red-500 text-gray-300 transition-all flex-shrink-0 mt-0.5"
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 size={13} />
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-purple-50">
                <p className="text-[10px] text-gray-400 text-center">
                  {lang === 'id' ? 'Chat disimpan di perangkat ini' : 'Chats saved on this device'}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Animated ambient blobs — desktop only, mobile skips heavy blur compositing */}
      {!isMobile && (
        <AnimatePresence mode="wait">
          <motion.div
            key={emotionalEntry || 'default'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 pointer-events-none"
          >
            <motion.div
              className="absolute -top-20 -left-20 w-[600px] h-[600px] rounded-full filter blur-[120px]"
              style={{ backgroundColor: getBlobColor1(emotionalEntry), opacity: 0.5 }}
              animate={{ x: [0, 60, -30, 0], y: [0, -40, 20, 0], scale: [1, 1.1, 0.95, 1] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full filter blur-[100px]"
              style={{ backgroundColor: getBlobColor2(emotionalEntry), opacity: 0.4 }}
              animate={{ x: [0, -50, 40, 0], y: [0, 30, -20, 0], scale: [1, 0.9, 1.05, 1] }}
              transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            />
            <motion.div
              className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full filter blur-[80px]"
              style={{ backgroundColor: getBlobColor3(emotionalEntry), opacity: 0.35 }}
              animate={{ x: [0, 40, -60, 0], y: [0, -30, 50, 0], scale: [1, 1.15, 0.9, 1] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
            />
          </motion.div>
        </AnimatePresence>
      )}

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />

      {/* Floating background paw particles */}
      {pageVisible && <FloatingPaws mood={emotionalEntry} isMobile={isMobile} />}

      {/* Nav Bar */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-purple-100/50 px-4 py-3 shadow-sm safe-top z-20">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          {/* Left — sidebar toggle */}
          <motion.button
            onClick={() => setShowSidebar(p => !p)}
            className="p-2 rounded-xl hover:bg-purple-50 transition text-gray-500 hover:text-purple-600"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={lang === 'id' ? 'Riwayat chat' : 'Chat history'}
          >
            <PanelLeft size={18} />
          </motion.button>

          {/* Center — Logo (navigates to home) */}
          <motion.a
            href="/"
            className="flex items-center gap-1.5"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="text-xl">🐾</span>
            <span className={`font-black text-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent ${isMobile ? '' : 'animate-gradient'}`}>PawPal</span>
          </motion.a>

          {/* Right — desktop inline, mobile burger */}
          <div className="flex items-center gap-1.5">
            {/* Desktop inline actions */}
            <div className="hidden sm:flex items-center gap-1.5">
              {mounted && 'Notification' in window && pushPermission !== 'granted' && (
                <motion.button
                  onClick={requestPushPermission}
                  className="p-2 rounded-xl hover:bg-purple-50 transition text-gray-400 hover:text-purple-600"
                  whileHover={{ scale: 1.2, rotate: 15 }}
                  whileTap={{ scale: 0.9 }}
                  title={t('nav_notifications_enable', lang)}
                >
                  <Bell size={18} />
                </motion.button>
              )}
              {mounted && 'Notification' in window && pushPermission === 'granted' && (
                <motion.div
                  className="p-2 text-purple-500"
                  title={t('nav_notifications_on', lang)}
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ type: 'tween', duration: 2, repeat: Infinity }}
                >
                  <Bell size={18} />
                </motion.div>
              )}

              <div className="relative">
                <motion.button
                  onClick={() => setShowThemePicker(p => !p)}
                  className="p-2 rounded-xl hover:bg-purple-50 transition text-gray-400 hover:text-purple-600"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  title="Change background theme"
                >
                  <Palette size={18} />
                </motion.button>
                <AnimatePresence>
                  {showThemePicker && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.85, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.85, y: -6 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className="absolute right-0 top-10 bg-white/95 backdrop-blur-xl border border-purple-100 rounded-2xl shadow-xl p-3 flex flex-col gap-1.5 z-50 min-w-[130px]"
                    >
                      {(Object.keys(THEME_LABELS) as ChatTheme[]).map(key => (
                        <button
                          key={key}
                          onClick={() => handleSetTheme(key)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${chatTheme === key ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-50 text-gray-600'}`}
                        >
                          <span className={`w-3 h-3 rounded-full ${THEME_LABELS[key].dot} flex-shrink-0`} />
                          {THEME_LABELS[key].label}
                          {chatTheme === key && <span className="ml-auto text-purple-500">✓</span>}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                onClick={startNewChat}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-xl transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={t('nav_new_chat', lang)}
              >
                <MessageCircle size={18} />
                <span className="font-medium">{t('nav_new_chat', lang)}</span>
              </motion.button>
            </div>

            {/* Mobile burger menu */}
            <div className="sm:hidden relative">
              <motion.button
                onClick={() => setShowBurgerMenu(p => !p)}
                className="p-2 rounded-xl hover:bg-purple-50 transition text-gray-500 hover:text-purple-600"
                whileTap={{ scale: 0.9 }}
              >
                <Menu size={20} />
              </motion.button>
              <AnimatePresence>
                {showBurgerMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="absolute right-0 top-10 bg-white/95 backdrop-blur-xl border border-purple-100 rounded-2xl shadow-xl p-2 flex flex-col gap-1 z-50 min-w-[170px]"
                  >
                    {/* Notification toggle */}
                    {mounted && 'Notification' in window && pushPermission !== 'granted' && (
                      <button
                        onClick={() => { requestPushPermission(); setShowBurgerMenu(false); }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-700 transition w-full"
                      >
                        <Bell size={16} />
                        {t('nav_notifications_enable', lang)}
                      </button>
                    )}
                    {mounted && 'Notification' in window && pushPermission === 'granted' && (
                      <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-purple-600 bg-purple-50">
                        <Bell size={16} />
                        {t('nav_notifications_on', lang)}
                      </div>
                    )}
                    {/* Theme picker items */}
                    {(Object.keys(THEME_LABELS) as ChatTheme[]).map(key => (
                      <button
                        key={key}
                        onClick={() => { handleSetTheme(key); setShowBurgerMenu(false); }}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all w-full ${chatTheme === key ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-50 text-gray-600'}`}
                      >
                        <span className={`w-3 h-3 rounded-full ${THEME_LABELS[key].dot} flex-shrink-0`} />
                        {THEME_LABELS[key].label}
                        {chatTheme === key && <span className="ml-auto text-purple-500 text-xs">✓</span>}
                      </button>
                    ))}
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={() => { startNewChat(); setShowBurgerMenu(false); }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-500 transition w-full"
                    >
                      <MessageCircle size={16} />
                      {t('nav_new_chat', lang)}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden container mx-auto px-2 sm:px-4 py-2 sm:py-4 max-w-4xl">
        {/* Active Concern Card */}
        <AnimatePresence>
          {activeConcern && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="mb-3 relative overflow-hidden rounded-2xl shadow-lg"
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 ${
                activeConcern.status === 'improving'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  : activeConcern.status === 'monitoring'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                  : 'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600'
              }`} />
              {/* Shimmer */}
              <motion.div
                className="absolute inset-0 bg-white/10"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
                style={{ skewX: '-20deg', width: '40%' }}
              />
              <div className="relative p-4 text-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-lg"
                      >🔍</motion.span>
                      <h3 className="font-bold text-base">{t('concern_title', lang)}</h3>
                      <motion.span
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-white/80 flex-shrink-0"
                      />
                    </div>
                    <p className="text-sm font-semibold text-white/90 mb-2">{activeConcern.topic}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full font-semibold border border-white/30">
                        {activeConcern.status === 'improving' ? t('concern_improving', lang)
                          : activeConcern.status === 'monitoring' ? t('concern_monitoring', lang)
                          : t('concern_tracking', lang)}
                      </span>
                      <span className="text-[11px] text-white/70">
                        {t('concern_started', lang)} {new Date(activeConcern.since).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  {/* Find vet near me */}
                  <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
                    {!userLocation ? (
                      <motion.button
                        onClick={requestLocation}
                        disabled={locationLoading}
                        className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-sm text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {locationLoading ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-3 h-3 border-2 border-white/60 border-t-white rounded-full" />
                        ) : <MapPin size={12} />}
                        {lang === 'id' ? 'Cari Dokter Terdekat' : 'Find Nearby Vet'}
                      </motion.button>
                    ) : (
                      <motion.a
                        href={getVetSearchUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-white text-purple-700 text-xs font-bold px-3 py-2 rounded-xl shadow-md hover:shadow-lg transition-shadow"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      >
                        🗺️ {userLocation.city ? `Vets in ${userLocation.city}` : (lang === 'id' ? 'Buka Maps' : 'Open Maps')}
                      </motion.a>
                    )}
                    <motion.button
                      onClick={() => setActiveConcern(null)}
                      className="text-white/50 hover:text-white/90 text-[10px] transition-colors"
                      whileHover={{ scale: 1.1 }}
                    >
                      {lang === 'id' ? 'tutup' : 'dismiss'}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Container */}
        <div className={`flex-1 flex flex-col backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden z-10 relative transition-all duration-700 ${getChatContainerRing(emotionalEntry)} ${getChatBg(emotionalEntry, chatTheme)}`}>
          {/* Subtle pulsing glow ring */}
          <div className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-700 ${getGlowClass(emotionalEntry)} opacity-50 animate-glow-pulse`} />
          {pageVisible && <MoodParticles mood={emotionalEntry} isMobile={isMobile} />}
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3" style={{ WebkitOverflowScrolling: 'touch' }}>
            {messages.map((message, index) => (
              <MessageBubble
                key={index}
                message={message}
                index={index}
                totalCount={messages.length}
                loading={loading}
                emotionalEntry={emotionalEntry}
              />
            ))}

            {loading && !(messages[messages.length - 1]?.role === 'assistant' && messages[messages.length - 1]?.content.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                className="flex items-end gap-2 justify-start"
              >
                <motion.div
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md bg-gradient-to-br from-violet-200 to-fuchsia-200"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <PawPrint size={16} className="text-violet-700" />
                </motion.div>
                <div className={`${getAssistantBubble(emotionalEntry)} rounded-2xl rounded-tl-sm px-4 py-3 shadow-md`}>
                  <div className="flex items-end gap-[3px] h-5 pb-0.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className={`w-2 h-2 rounded-full ${getTypingBarColor(emotionalEntry)}`}
                        animate={{
                          y: [0, -8, 0],
                          opacity: [0.4, 1, 0.4],
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.15,
                          ease: 'easeInOut',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Emotional entry buttons — only after pet name, before topic chosen */}
            {conversationStarted && !emotionalEntry && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring' as const, stiffness: 150, damping: 16 }}
                className="grid grid-cols-2 gap-3 pt-2"
              >
                {[
                  { type: 'worried' as EmotionalEntry, emoji: '😟', labelKey: 'emotion_worried_label', accent: 'border-amber-200 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-600' },
                  { type: 'off' as EmotionalEntry, emoji: '🐾', labelKey: 'emotion_off_label', accent: 'border-orange-200 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600' },
                  { type: 'checking' as EmotionalEntry, emoji: '💛', labelKey: 'emotion_checking_label', accent: 'border-purple-200 hover:border-purple-400 hover:bg-purple-50 hover:text-purple-600' },
                  { type: 'celebrate' as EmotionalEntry, emoji: '😊', labelKey: 'emotion_celebrate_label', accent: 'border-green-200 hover:border-green-400 hover:bg-green-50 hover:text-green-600' },
                ].map((btn, i) => (
                  <motion.button
                    key={btn.type}
                    onClick={() => handleEmotionalEntry(btn.type)}
                    initial={{ opacity: 0, y: 20, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring' as const, stiffness: 220, damping: 16, delay: i * 0.1 }}
                    whileHover={{ scale: 1.05, y: -3, rotate: -1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-3 rounded-xl border-2 ${btn.accent} transition-colors text-left group bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-lg`}
                  >
                    <motion.span
                      className="text-xl mr-2 inline-block"
                      whileHover={{ rotate: [0, -10, 10, 0], scale: 1.2 }}
                      transition={{ type: 'spring' as const, stiffness: 300 }}
                    >
                      {btn.emoji}
                    </motion.span>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-inherit">
                      {t(btn.labelKey as any, lang)}
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Memory Prompt */}
          <AnimatePresence>
            {showMemoryPrompt && (
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ type: 'spring' as const, stiffness: 150, damping: 16 }}
                className="border-t border-gray-200 bg-gradient-to-r from-purple-50 to-fuchsia-50 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.span
                      className="text-2xl inline-block"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring' as const, stiffness: 200, damping: 12, delay: 0.2 }}
                    >
                      ⭐
                    </motion.span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {t('memory_title', lang, { name: petName || '' })}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {t('memory_desc', lang, { name: petName || '' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      onClick={handleDismissMemory}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {t('memory_not_now', lang)}
                    </motion.button>
                    <motion.button
                      onClick={handleSaveMemory}
                      className="px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:shadow-lg transition animate-glow-pulse"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {t('memory_yes', lang, { name: petName || '' })}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input */}
          <div className="border-t border-gray-200 p-4 pb-safe bg-white/80 backdrop-blur-sm">
            {/* Feature quick actions */}
            {petName && (
              <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                {[
                  { icon: '💉', label: t('feature_vaccine', lang), cmd: t('feature_cmd_vaccine', lang) },
                  { icon: '🍽️', label: t('feature_feeding', lang), cmd: t('feature_cmd_feeding', lang) },
                  { icon: '📝', label: t('feature_note', lang), cmd: t('feature_cmd_note', lang) },
                  { icon: '🩺', label: t('feature_vet', lang), cmd: t('feature_cmd_vet', lang) },
                  { icon: '🔍', label: t('feature_check', lang), cmd: t('feature_cmd_check', lang) },
                ].map((btn) => (
                  <motion.button
                    key={btn.label}
                    type="button"
                    onClick={() => handleFeatureCommand(btn.cmd)}
                    className="flex-shrink-0 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-full text-xs font-medium text-gray-600 border border-gray-200 transition"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="mr-1">{btn.icon}</span>{btn.label}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Image preview */}
            <AnimatePresence>
              {imagePreview && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mb-3 relative inline-block"
                >
                  <img src={imagePreview} alt="Preview" className="h-20 rounded-lg object-cover border-2 border-purple-200" />
                  <button
                    type="button"
                    onClick={clearImagePreview}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center shadow"
                  >
                    ✕
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="flex gap-2 items-center">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              {/* Attach image button */}
              <motion.button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="p-3 text-gray-400 hover:text-purple-600 transition rounded-xl hover:bg-purple-50 disabled:opacity-50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Paperclip size={20} />
              </motion.button>
              {/* Voice input button — Coming Soon */}
              <motion.button
                type="button"
                disabled
                className="relative p-3 text-gray-300 bg-gray-50/50 rounded-xl cursor-not-allowed border border-gray-100"
                title={t('mic_coming_soon', lang)}
              >
                <Mic size={20} />
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gray-400/80 backdrop-blur-sm text-white text-[8px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap tracking-wide">
                  {t('mic_coming_soon', lang)}
                </span>
              </motion.button>

              <motion.input
                ref={inputRef}
                type="text"
                placeholder={
                  !petName
                    ? t('placeholder_name', lang)
                    : t('placeholder_chat', lang)
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className={`flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 disabled:bg-gray-100 transition shadow-inner ${getInputFocusRing(emotionalEntry)}`}
                whileFocus={{ scale: 1.01 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
              />
              <motion.button
                type="submit"
                disabled={loading || (!input.trim() && !imagePreview)}
                className={`bg-gradient-to-r ${getSendButton(emotionalEntry)} disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold px-6 py-3 rounded-xl transition shadow-lg hover:shadow-xl disabled:shadow-none overflow-hidden`}
                whileHover={{ scale: 1.08, rotate: -1 }}
                whileTap={{ scale: 0.92, rotate: 0 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
              >
                <motion.span
                  className="inline-block"
                  animate={loading ? {} : { x: [0, 3, -1, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  {loading ? <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Send size={18} />}
                </motion.span>
              </motion.button>
            </form>
            <motion.p
              className="text-xs text-gray-500 mt-2 text-center flex items-center justify-center gap-1.5"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(emotionalEntry)} animate-heartbeat`}></span>
              {t('status_here', lang)}
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  );
}
