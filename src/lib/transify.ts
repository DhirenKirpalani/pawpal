/* ── Transify — Lightweight i18n for PawPal ──
 * Centralized string mapping EN ↔ ID.
 * Supports template interpolation: {var} is replaced at runtime.
 */

type Lang = 'en' | 'id';

const dictionary: Record<string, { en: string; id: string }> = {
  // ── Homepage ──
  homepage_tagline: {
    en: "Like texting a friend who knows your pet",
    id: "Kayak chat sama temen yang kenal anabulmu",
  },
  homepage_lang_badge: {
    en: "🐱🐶 Built for Indonesia's anabul lovers",
    id: "🐱🐶 Buat pecinta anabul Indonesia",
  },
  homepage_lang_subtitle: {
    en: "English & Indonesian",
    id: "Bahasa Inggris & Indonesia",
  },
  homepage_cta_button: {
    en: "Start Chatting",
    id: "Mulai Chat",
  },
  homepage_cta_sub: {
    en: "No signup • Just start talking",
    id: "Tanpa daftar • Langsung chat aja",
  },

  // ── Services Section ──
  services_heading: {
    en: "Everything Your Pet Needs",
    id: "Semua yang Anabulmu Butuhin",
  },
  services_subheading: {
    en: "One companion. Every concern.",
    id: "Satu teman. Semua kebutuhan.",
  },
  service_health_title: {
    en: "AI Health Advice",
    id: "Saran Kesehatan AI",
  },
  service_health_desc: {
    en: "Symptoms, food safety, behavior — ask anything about your anabul",
    id: "Gejala, makanan aman, perilaku — tanya apa aja soal anabulmu",
  },
  service_reminder_title: {
    en: "Smart Reminders",
    id: "Pengingat Pintar",
  },
  service_reminder_desc: {
    en: "Vaccines, deworming, vet appointments — never miss one",
    id: "Vaksin, obat cacing, janji dokter — nggak bakal kelewat",
  },
  service_feeding_title: {
    en: "Feeding Tracker",
    id: "Pelacak Makanan",
  },
  service_feeding_desc: {
    en: "Meal schedule & portions based on age and breed",
    id: "Jadwal makan & porsi sesuai umur dan ras",
  },
  service_potty_title: {
    en: "Potty Training",
    id: "Latihan Toilet",
  },
  service_potty_desc: {
    en: "Track toilet habits and potty training progress",
    id: "Pantau kebiasaan toilet & progres latihan pup",
  },
  service_journal_title: {
    en: "Health Journal",
    id: "Jurnal Kesehatan",
  },
  service_journal_desc: {
    en: "Log symptoms and share everything with your vet",
    id: "Catat gejala & share semuanya ke dokter hewan",
  },
  service_lost_title: {
    en: "Lost Pet Alert",
    id: "Laporan Anabul Hilang",
  },
  service_lost_desc: {
    en: "Instant alerts if your pet goes missing",
    id: "Notifikasi langsung kalau anabulmu hilang",
  },

  // ── Footer ──
  footer_text: {
    en: "PawPal provides AI guidance for common pet health concerns in Indonesia. Not a replacement for professional veterinary care.",
    id: "PawPal memberikan panduan AI untuk masalah kesehatan hewan umum di Indonesia. Bukan pengganti perawatan dokter hewan profesional.",
  },

  // ── Onboarding ──
  onboarding_greeting: {
    en: "Hey 👋 I'm PawPal.\nI'm here with you and your pet.",
    id: "Halo! 👋 Aku PawPal.\nAku di sini buat kamu dan anabulmu.",
  },
  onboarding_ask_name: {
    en: "What's your pet's name? 🐾",
    id: "Siapa nama anabul kamu? 🐾",
  },
  onboarding_greeting_fallback: {
    en: "Hey there! 👋\n\nBtw, what's your pet's name? 🐾",
    id: "Halo! 👋\n\nBtw, nama hewan peliharaan kamu siapa? 🐾",
  },
  onboarding_ask_type: {
    en: "Nice to meet {name}! 🐾\n\nIs {name} a cat or a dog? 🐱🐶",
    id: "Halo {name}! 🐾\n\nBtw, anabul kamu kucing atau anjing? 🐱🐶",
  },
  onboarding_welcome_type: {
    en: "Aww, {name} is such a cute {type}! 💕\n\nHow is {name} doing today?",
    id: "Wah {name} {type} yang lucu! 💕\n\nGimana kabarnya {name} hari ini?",
  },
  onboarding_type_retry: {
    en: "Sorry, I didn't catch that. Is {name} a cat or a dog? 🐱🐶",
    id: "Maaf, aku belum paham. {name} itu kucing atau anjing? 🐱🐶",
  },

  // ── Emotional button labels ──
  emotion_worried_label: {
    en: "I'm worried",
    id: 'Aku khawatir',
  },
  emotion_off_label: {
    en: 'Something feels off',
    id: 'Ada yang aneh',
  },
  emotion_checking_label: {
    en: 'Just checking in',
    id: 'Mau cek kabar',
  },
  emotion_celebrate_label: {
    en: 'Share good news',
    id: 'Mau share kabar baik',
  },

  // ── Emotional responses ──
  emotion_worried: {
    en: "I'm here with you. What's been going on with {p}?",
    id: "Aku ngerti kamu khawatir. Aku di sini buat bantu.\n\nCeritain yang lagi terjadi sama {p}?",
  },
  emotion_off: {
    en: "Sometimes we just sense when something isn't right.\n\nWhat have you noticed that feels different with {p}?",
    id: "Kamu ngerasa ada yang beda, ya. Insting kamu penting banget.\n\nApa yang berubah dari {p}?",
  },
  emotion_checking: {
    en: "Love that you're staying on top of things! 💚\n\nHow has {p} been doing?",
    id: "Bagus banget kamu rajin ngecek! 💚\n\nGimana kabar {p} hari ini?",
  },
  emotion_celebrate: {
    en: "Love hearing good news! 🎉\n\nWhat's going on?",
    id: "Wah seneng banget denger kabar baik! 🎉\n\nCeritain dong, apa yang terjadi?",
  },
  emotion_status_worried: {
    en: "I'm going to stay with you on this.",
    id: "Aku bakal terus pantau ini bareng kamu.",
  },
  emotion_status_off: {
    en: "Building context about your pet…",
    id: "Lagi bangun konteks soal hewanmu…",
  },
  emotion_status_checking: {
    en: "Keeping track of {p}…",
    id: "Memantau {p}…",
  },
  emotion_status_celebrate: {
    en: "Celebrating with you…",
    id: "Ikut seneng bareng kamu…",
  },
  emotion_thinking: {
    en: "Thinking…",
    id: "Lagi mikirin jawaban terbaik…",
  },
  emotion_understanding: {
    en: "Understanding how you feel…",
    id: "Memahami perasaanmu…",
  },

  // ── Concern card ──
  concern_title: {
    en: "We're tracking this together",
    id: "Aku bakal pantau bareng kamu",
  },
  concern_tracking: {
    en: "🎯 Tracking",
    id: "🎯 Lagi dipantau",
  },
  concern_monitoring: {
    en: "👁️ Monitoring",
    id: "👁️ Lagi diawasi",
  },
  concern_improving: {
    en: "📈 Improving",
    id: "📈 Membaik",
  },
  concern_started: {
    en: "Started",
    id: "Dimulai",
  },

  // ── Memory prompt ──
  memory_title: {
    en: "Want me to remember {name} for next time?",
    id: "Mau aku inget {name} buat lain kali?",
  },
  memory_desc: {
    en: "I'll keep track of everything about {name}",
    id: "Aku bakal simpan semua cerita tentang {name}",
  },
  memory_not_now: {
    en: "Not now",
    id: "Nanti aja",
  },
  memory_yes: {
    en: "Yes, save {name}",
    id: "Ya, simpan {name}",
  },
  memory_saved: {
    en: "Got it — I've saved {name} 🐶\n\nWhenever you want to talk about {name}, I'll have all our history ready.",
    id: "Oke, aku udah simpan {name} 🐶\n\nKapanpun kamu mau ngobrol soal {name}, aku udah ada semua catatannya.",
  },
  memory_status_saved: {
    en: "I'll remember everything about {name} 🐾",
    id: "Aku bakal inget semua tentang {name} 🐾",
  },

  // ── Input placeholders ──
  placeholder_name: {
    en: "Your pet's name...",
    id: "Nama hewanmu...",
  },
  placeholder_chat: {
    en: "Tell me more...",
    id: "Cerita lebih banyak...",
  },
  send_button: {
    en: "Send",
    id: "Kirim",
  },
  status_listening: {
    en: "PawPal is listening…",
    id: "PawPal lagi dengerin…",
  },
  status_here: {
    en: "I'm here for your pet 🐾",
    id: "Aku di sini buat hewanmu 🐾",
  },
  status_building: {
    en: "Building context about {name}…",
    id: "Membangun konteks tentang {name}…",
  },

  // ── Errors ──
  error_connection: {
    en: "Sorry, connection error. Please try again.",
    id: "Maaf, tidak bisa konek. Coba lagi.",
  },
  error_generic: {
    en: "Sorry, something went wrong. Please try again.",
    id: "Maaf, ada gangguan. Coba lagi ya.",
  },
  error_image_size: {
    en: "Image too large. Max 4MB.",
    id: "Gambar kegedean. Maks 4MB.",
  },
  error_voice_unsupported: {
    en: "Voice input is not supported in this browser.",
    id: "Fitur suara belum support di browser ini.",
  },

  // ── Nav ──
  nav_home: {
    en: "← Home",
    id: "← Beranda",
  },
  nav_new_chat: {
    en: "New chat",
    id: "Chat baru",
  },
  nav_notifications_enable: {
    en: "Enable notifications",
    id: "Aktifkan notifikasi",
  },
  nav_notifications_on: {
    en: "Notifications on",
    id: "Notifikasi aktif",
  },

  // ── Feature commands ──
  feature_vaccine: {
    en: "Vaccine",
    id: "Vaksin",
  },
  feature_feeding: {
    en: "Feeding",
    id: "Makan",
  },
  feature_note: {
    en: "Note",
    id: "Catatan",
  },
  feature_vet: {
    en: "Vet",
    id: "Dokter",
  },
  feature_check: {
    en: "Check",
    id: "Cek",
  },
  feature_cmd_vaccine: {
    en: "vaccine reminder",
    id: "jadwal vaksin",
  },
  feature_cmd_feeding: {
    en: "feeding log",
    id: "log makan",
  },
  feature_cmd_note: {
    en: "note",
    id: "catat",
  },
  feature_cmd_vet: {
    en: "vet appointment",
    id: "janji dokter",
  },
  feature_cmd_check: {
    en: "health check",
    id: "cek kesehatan",
  },

  // ── Concern topics ──
  emotion_worried_topic: {
    en: "Health concern",
    id: "Masalah kesehatan",
  },

  // ── Fallbacks ──
  fallback_pet: {
    en: "your pet",
    id: "hewan peliharaanmu",
  },

  // ── Misc ──
  mic_coming_soon: {
    en: "Coming soon",
    id: "Segera hadir",
  },
};

/**
 * Get a localized string with optional template interpolation.
 * @param key — dictionary key
 * @param lang — 'en' | 'id'
 * @param vars — optional record of `{var}` replacements
 */
export function t(key: keyof typeof dictionary, lang: Lang, vars?: Record<string, string>): string {
  const entry = dictionary[key];
  if (!entry) return key;

  let text = entry[lang] || entry.en;

  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      text = text.replaceAll(`{${k}}`, v);
    });
  }

  return text;
}

/**
 * Toggle between 'en' and 'id'.
 */
export function toggleLang(current: Lang): Lang {
  return current === 'en' ? 'id' : 'en';
}

export type { Lang };
