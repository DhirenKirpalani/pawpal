'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { t, toggleLang } from '@/lib/transify';

// Floating paw print particle
function PawParticle({ delay, left, size = 'text-2xl' }: { delay: number; left: string; size?: string }) {
  return (
    <div
      className={`absolute ${size} opacity-0 animate-paw-${((delay % 5) + 1) as 1 | 2 | 3 | 4 | 5}`}
      style={{ left, animationDelay: `${delay}s` }}
    >
      🐾
    </div>
  );
}

// 3D tilt card with mouse tracking
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    const y = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    setTilt({ x: -x * 6, y: y * 6 });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <motion.div
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX: tilt.x, rotateY: tilt.y }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
    >
      {children}
    </motion.div>
  );
}

// Stagger container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 12 },
  },
};

const cardContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 120, damping: 14 },
  },
};

export default function Home() {
  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: scrollRef, offset: ['start start', 'end end'] });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const springBackgroundY = useSpring(backgroundY, { stiffness: 100, damping: 30 });

  const [lang, setLang] = useState<'en' | 'id'>('en');

  // Sync lang from localStorage after hydration
  useEffect(() => {
    const saved = localStorage.getItem('pawpal_lang');
    if (saved === 'id' || saved === 'en') setLang(saved);
  }, []);

  const handleToggleLang = () => {
    const next = toggleLang(lang);
    setLang(next);
    localStorage.setItem('pawpal_lang', next);
  };

  return (
    <div ref={scrollRef} className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 relative overflow-hidden">
      {/* Animated background blobs with parallax */}
      <motion.div style={{ y: springBackgroundY }} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" style={{ animationDelay: '1s' }}></div>
      </motion.div>

      {/* Floating paw particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <PawParticle delay={0} left="10%" />
        <PawParticle delay={2} left="25%" size="text-xl" />
        <PawParticle delay={5} left="45%" size="text-3xl" />
        <PawParticle delay={7} left="65%" size="text-xl" />
        <PawParticle delay={9} left="80%" size="text-2xl" />
        <PawParticle delay={3} left="90%" />
        <PawParticle delay={6} left="5%" size="text-lg" />
        <PawParticle delay={11} left="55%" size="text-2xl" />
      </div>

      <div className="relative container mx-auto px-4 py-20 z-10">
        {/* HERO SECTION */}
        <motion.div
          className="text-center mb-20 max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-block mb-8">
            <motion.span
              className="text-8xl inline-block"
              animate={{ rotate: [0, -10, 10, -5, 0], scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
            >
              🐾
            </motion.span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-8xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-8 leading-tight animate-gradient"
          >
            PawPal
          </motion.h1>

          <motion.p variants={itemVariants} className="text-4xl font-bold text-gray-800 mb-4">
            {t('homepage_tagline', lang)}
          </motion.p>

          <motion.p variants={itemVariants} className="text-lg text-gray-500 mb-2 max-w-2xl mx-auto">
            <span className="inline-block bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold border border-orange-200">
              {t('homepage_lang_badge', lang)}
            </span>
          </motion.p>

          <motion.p variants={itemVariants} className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
            <motion.span
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🌏
            </motion.span>{' '}
            {t('homepage_lang_subtitle', lang)}
          </motion.p>

          {/* Language Toggle */}
          <motion.div variants={itemVariants} className="mb-8">
            <motion.button
              onClick={handleToggleLang}
              className="inline-flex items-center gap-2 text-sm font-bold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-full transition border border-purple-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>🌐</span>
              <span>{lang.toUpperCase()}</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-400 font-normal">{lang === 'en' ? 'ID' : 'EN'}</span>
            </motion.button>
          </motion.div>

          {/* PRIMARY CTA */}
          <motion.div variants={itemVariants} className="flex flex-col gap-6 items-center">
            <motion.a
              href="/chat"
              className="group relative inline-flex items-center justify-center px-12 py-6 text-2xl font-bold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-full overflow-hidden shadow-2xl animate-glow-pulse"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <span className="relative z-10 flex items-center gap-3">
                <motion.span
                  className="text-3xl"
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  💬
                </motion.span>
                {t('homepage_cta_button', lang)}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-fuchsia-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </motion.a>
            <motion.p
              className="text-base text-gray-500"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              {t('homepage_cta_sub', lang)}
            </motion.p>
          </motion.div>
        </motion.div>

        {/* EMOTIONAL BENEFITS */}
        <motion.div
          className="max-w-5xl mx-auto mb-20"
          variants={cardContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '💜', title: 'Understands you', desc: "Knows when you're worried", color: 'from-purple-50 to-violet-50' },
              { icon: '🧠', title: 'Remembers', desc: 'Builds a relationship', color: 'from-pink-50 to-rose-50' },
              { icon: '🎉', title: 'Celebrates', desc: "Your pet's progress", color: 'from-amber-50 to-yellow-50' },
            ].map((benefit) => (
              <motion.div key={benefit.title} variants={cardVariants}>
                <TiltCard className="h-full">
                  <div className={`backdrop-blur-lg bg-gradient-to-br ${benefit.color} border border-white/60 rounded-3xl p-8 text-center shadow-lg hover:shadow-2xl transition-shadow h-full`}>
                    <motion.div
                      className="text-6xl mb-4"
                      whileHover={{ scale: 1.3, rotate: 10 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      {benefit.icon}
                    </motion.div>
                    <p className="text-2xl font-bold text-gray-800 mb-2">{benefit.title}</p>
                    <p className="text-gray-600">{benefit.desc}</p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* SERVICES */}
        <motion.div
          className="max-w-5xl mx-auto mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2
            className="text-4xl font-bold text-gray-800 text-center mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            {t('services_heading', lang)}
          </motion.h2>
          <motion.p
            className="text-center text-gray-500 mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {t('services_subheading', lang)}
          </motion.p>
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={cardContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            {[
              { icon: '🤖', titleKey: 'service_health_title', descKey: 'service_health_desc', accent: 'border-purple-200 hover:border-purple-400' },
              { icon: '⏰', titleKey: 'service_reminder_title', descKey: 'service_reminder_desc', accent: 'border-amber-200 hover:border-amber-400' },
              { icon: '🍖', titleKey: 'service_feeding_title', descKey: 'service_feeding_desc', accent: 'border-orange-200 hover:border-orange-400' },
              { icon: '🚽', titleKey: 'service_potty_title', descKey: 'service_potty_desc', accent: 'border-blue-200 hover:border-blue-400' },
              { icon: '📝', titleKey: 'service_journal_title', descKey: 'service_journal_desc', accent: 'border-emerald-200 hover:border-emerald-400' },
              { icon: '🔔', titleKey: 'service_lost_title', descKey: 'service_lost_desc', accent: 'border-rose-200 hover:border-rose-400' },
            ].map((s, i) => (
              <motion.div
                key={s.titleKey}
                variants={cardVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <div className={`bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border-2 ${s.accent} cursor-default`}>
                  <motion.div
                    className="text-4xl mb-3 inline-block"
                    whileHover={{ scale: 1.3, rotate: [0, -10, 10, 0] }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {s.icon}
                  </motion.div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{t(s.titleKey as any, lang)}</h3>
                  <p className="text-gray-500 text-sm">{t(s.descKey as any, lang)}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* BOTTOM CTA */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 100, damping: 12 }}
        >
          <motion.a
            href="/chat"
            className="inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-full shadow-2xl animate-glow-pulse"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <motion.span
              className="mr-2"
              animate={{ x: [0, -3, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
            >
              💬
            </motion.span>
            {t('homepage_cta_button', lang)}
          </motion.a>
          <motion.p
            className="text-sm text-gray-500 mt-4"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {t('homepage_cta_sub', lang)}
          </motion.p>
        </motion.div>

        {/* FOOTER */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs text-gray-400 max-w-xl mx-auto">
            {t('footer_text', lang)}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
