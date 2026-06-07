/* ── LocalFeatureManager ──
 * Client-side feature handler for the PawPal web chat.
 * Uses localStorage for persistence — no petId or Supabase required.
 * Handles: Reminders, Feeding logs, Potty logs, Health notes, Lost pet.
 */

import { CommandParser } from './command-parser';

export type FeatureCardType =
  | 'reminder_added'
  | 'reminder_list'
  | 'feeding_logged'
  | 'potty_logged'
  | 'note_saved'
  | 'lost_pet_reported'
  | 'lost_pet_found'
  | 'feature_help';

export interface FeatureCard {
  type: FeatureCardType;
  title: string;
  body: string;
  items?: string[];
  emoji: string;
  accent: string; // tailwind border/bg class
}

export interface FeatureResult {
  handled: boolean;
  card?: FeatureCard;
  text: string;
}

/* ── Storage keys ── */
const KEYS = {
  reminders: 'pawpal_reminders',
  feedings: 'pawpal_feedings',
  potty: 'pawpal_potty',
  notes: 'pawpal_notes',
  lostPet: 'pawpal_lost_pet',
};

function load<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(key) || '[]') as T[];
  } catch {
    return [];
  }
}

function save(key: string, data: unknown[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

/* ── Type helpers ── */
interface StoredReminder {
  id: string;
  type: string;
  title: string;
  dateStr: string;
  createdAt: string;
  done: boolean;
}
interface StoredFeeding { food: string | null; portion: string | null; time: string; }
interface StoredPotty { eventType: string; location: string; consistency: string | null; time: string; }
interface StoredNote { type: string; severity: string; content: string; time: string; }
interface StoredLostPet { location: string | null; description: string; reportedAt: string; found: boolean; }

const parser = new CommandParser();

export function handleFeature(message: string, lang: 'en' | 'id'): FeatureResult {
  const parsed = parser.parse(message);

  if (parsed.command === 'NONE') return { handled: false, text: '' };

  const id = lang === 'id';

  switch (parsed.command) {
    case 'REMINDER_ADD': {
      const { type, title, dateStr, rawMessage } = parsed.params as { type: string; title: string | null; dateStr: string | null; rawMessage: string };
      if (!dateStr) {
        return {
          handled: true,
          text: id
            ? '📅 Sebutkan tanggalnya ya! Contoh: "Vaksin tanggal 15 Juni"'
            : '📅 Please include a date. Example: "Vaccine on June 15"',
        };
      }
      const reminder: StoredReminder = {
        id: `${Date.now()}`,
        type: type || 'checkup',
        title: title || rawMessage,
        dateStr,
        createdAt: new Date().toISOString(),
        done: false,
      };
      const reminders = load<StoredReminder>(KEYS.reminders);
      reminders.push(reminder);
      save(KEYS.reminders, reminders);
      const typeLabel: Record<string, string> = {
        vaccine: id ? 'Vaksin' : 'Vaccine',
        deworming: id ? 'Obat cacing' : 'Deworming',
        vet_appointment: id ? 'Janji dokter' : 'Vet appointment',
        medication: id ? 'Obat' : 'Medication',
        checkup: id ? 'Pemeriksaan' : 'Checkup',
      };
      return {
        handled: true,
        text: id
          ? `✅ Pengingat ${typeLabel[type] || type} berhasil disimpan untuk ${dateStr}!`
          : `✅ ${typeLabel[type] || type} reminder saved for ${dateStr}!`,
        card: {
          type: 'reminder_added',
          emoji: '⏰',
          title: id ? 'Pengingat Disimpan' : 'Reminder Saved',
          body: `${typeLabel[type] || type} — ${dateStr}`,
          accent: 'border-amber-300 bg-amber-50',
        },
      };
    }

    case 'REMINDER_LIST': {
      const reminders = load<StoredReminder>(KEYS.reminders).filter(r => !r.done);
      if (reminders.length === 0) {
        return {
          handled: true,
          text: id ? '📋 Belum ada pengingat. Coba: "Ingatkan vaksin tanggal 20 Juni"' : '📋 No reminders yet. Try: "Remind me vaccine June 20"',
        };
      }
      const items = reminders.slice(0, 5).map(r => `${r.type} — ${r.dateStr}`);
      return {
        handled: true,
        text: id ? `📋 Ada ${reminders.length} pengingat:` : `📋 You have ${reminders.length} reminder(s):`,
        card: {
          type: 'reminder_list',
          emoji: '📋',
          title: id ? 'Pengingat Mendatang' : 'Upcoming Reminders',
          body: '',
          items,
          accent: 'border-amber-300 bg-amber-50',
        },
      };
    }

    case 'REMINDER_COMPLETE': {
      const reminders = load<StoredReminder>(KEYS.reminders);
      const last = [...reminders].reverse().find(r => !r.done);
      if (last) {
        last.done = true;
        save(KEYS.reminders, reminders);
        return { handled: true, text: id ? `✅ "${last.title}" ditandai selesai!` : `✅ "${last.title}" marked as done!` };
      }
      return { handled: true, text: id ? '✅ Tidak ada pengingat aktif.' : '✅ No active reminders found.' };
    }

    case 'FEEDING_LOG':
    case 'FEEDING_ADD': {
      const { foodType, portion, time } = parsed.params as { foodType: string | null; portion: string | null; time: string | null };
      const feeding: StoredFeeding = {
        food: foodType,
        portion,
        time: time || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      const feedings = load<StoredFeeding>(KEYS.feedings);
      feedings.push(feeding);
      save(KEYS.feedings, feedings);
      const label = foodType ? (portion ? `${foodType} (${portion})` : foodType) : (id ? 'makan' : 'feeding');
      return {
        handled: true,
        text: id ? `🍽️ Jadwal makan dicatat: ${label} jam ${feeding.time}` : `🍽️ Feeding logged: ${label} at ${feeding.time}`,
        card: {
          type: 'feeding_logged',
          emoji: '🍽️',
          title: id ? 'Makan Tercatat' : 'Feeding Logged',
          body: `${label} — ${feeding.time}`,
          accent: 'border-orange-300 bg-orange-50',
        },
      };
    }

    case 'FEEDING_SCHEDULE': {
      const feedings = load<StoredFeeding>(KEYS.feedings);
      const today = feedings.slice(-5);
      if (today.length === 0) {
        return { handled: true, text: id ? '🍽️ Belum ada log makan. Coba: "Kasih makan 1 cup kibble"' : '🍽️ No feeding logs yet. Try: "Fed 1 cup kibble"' };
      }
      const items = today.map(f => `${f.food || '?'} ${f.portion ? `(${f.portion})` : ''} — ${f.time}`);
      return {
        handled: true,
        text: '',
        card: {
          type: 'feeding_logged',
          emoji: '🍽️',
          title: id ? 'Log Makan Terakhir' : 'Recent Feeding Log',
          body: '',
          items,
          accent: 'border-orange-300 bg-orange-50',
        },
      };
    }

    case 'POTTY_LOG': {
      const { eventType, location, consistency } = parsed.params as { eventType: string; location: string; consistency: string | null };
      const entry: StoredPotty = {
        eventType,
        location,
        consistency,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      const logs = load<StoredPotty>(KEYS.potty);
      logs.push(entry);
      save(KEYS.potty, logs);
      const locLabel: Record<string, string> = {
        correct_spot: id ? 'di tempat yang benar ✅' : 'correct spot ✅',
        wrong_spot: id ? 'di tempat salah ⚠️' : 'wrong spot ⚠️',
        accident: id ? 'kecelakaan 🚨' : 'accident 🚨',
      };
      return {
        handled: true,
        text: id ? `🚽 Dicatat: ${eventType === 'poop' ? 'BAB' : 'BAK'} ${locLabel[location] || location}` : `🚽 Logged: ${eventType} — ${locLabel[location] || location}`,
        card: {
          type: 'potty_logged',
          emoji: '🚽',
          title: id ? 'Toilet Tercatat' : 'Potty Logged',
          body: `${eventType === 'poop' ? (id ? 'BAB' : 'Poop') : (id ? 'BAK' : 'Pee')} — ${locLabel[location] || location}${consistency ? ` (${consistency})` : ''}`,
          accent: 'border-blue-300 bg-blue-50',
        },
      };
    }

    case 'POTTY_STATS': {
      const logs = load<StoredPotty>(KEYS.potty);
      const success = logs.filter(l => l.location === 'correct_spot').length;
      const rate = logs.length ? Math.round((success / logs.length) * 100) : 0;
      return {
        handled: true,
        text: '',
        card: {
          type: 'potty_logged',
          emoji: '📊',
          title: id ? 'Statistik Toilet' : 'Potty Stats',
          body: id ? `${logs.length} total catatan — ${rate}% berhasil ✅` : `${logs.length} total logs — ${rate}% success rate ✅`,
          accent: 'border-blue-300 bg-blue-50',
        },
      };
    }

    case 'NOTE_ADD': {
      const { noteType, severity, content } = parsed.params as { noteType: string; severity: string; content: string };
      const note: StoredNote = { type: noteType, severity, content, time: new Date().toISOString() };
      const notes = load<StoredNote>(KEYS.notes);
      notes.push(note);
      save(KEYS.notes, notes);
      return {
        handled: true,
        text: id ? '📝 Catatan kesehatan disimpan!' : '📝 Health note saved!',
        card: {
          type: 'note_saved',
          emoji: severity === 'urgent' ? '🚨' : severity === 'concern' ? '⚠️' : '📝',
          title: id ? 'Catatan Disimpan' : 'Note Saved',
          body: content.length > 80 ? content.slice(0, 80) + '…' : content,
          accent: severity === 'urgent' ? 'border-red-300 bg-red-50' : severity === 'concern' ? 'border-amber-300 bg-amber-50' : 'border-emerald-300 bg-emerald-50',
        },
      };
    }

    case 'NOTE_LIST': {
      const notes = load<StoredNote>(KEYS.notes);
      if (notes.length === 0) {
        return { handled: true, text: id ? '📋 Belum ada catatan.' : '📋 No notes yet.' };
      }
      const items = notes.slice(-5).reverse().map(n => `${n.type} — ${new Date(n.time).toLocaleDateString(id ? 'id-ID' : 'en-GB')}`);
      return {
        handled: true,
        text: '',
        card: {
          type: 'note_saved',
          emoji: '📋',
          title: id ? 'Catatan Terakhir' : 'Recent Notes',
          body: '',
          items,
          accent: 'border-emerald-300 bg-emerald-50',
        },
      };
    }

    case 'LOST_PET_REPORT': {
      const { location, description } = parsed.params as { location: string | null; description: string };
      const report: StoredLostPet = { location, description, reportedAt: new Date().toISOString(), found: false };
      save(KEYS.lostPet, [report]);
      return {
        handled: true,
        text: id ? '🚨 Laporan anabul hilang disimpan. Semoga cepat ketemu ya! 🙏' : '🚨 Lost pet report saved. Hope you find them soon! 🙏',
        card: {
          type: 'lost_pet_reported',
          emoji: '🚨',
          title: id ? 'Anabul Hilang Dilaporkan' : 'Lost Pet Reported',
          body: location ? (id ? `Terakhir dilihat di: ${location}` : `Last seen near: ${location}`) : (id ? 'Lokasi belum diketahui' : 'Location unknown'),
          accent: 'border-red-400 bg-red-50',
        },
      };
    }

    case 'LOST_PET_FOUND': {
      const reports = load<StoredLostPet>(KEYS.lostPet);
      reports.forEach(r => (r.found = true));
      save(KEYS.lostPet, reports);
      return {
        handled: true,
        text: id ? '🎉 Syukurlah anabulmu ditemukan! Semoga baik-baik saja ya 💛' : '🎉 So glad your pet was found! Hope they\'re doing well 💛',
        card: {
          type: 'lost_pet_found',
          emoji: '🎉',
          title: id ? 'Anabul Ditemukan!' : 'Pet Found!',
          body: id ? 'Status diperbarui. Lega banget nih!' : 'Status updated. What a relief!',
          accent: 'border-green-400 bg-green-50',
        },
      };
    }

    case 'HELP': {
      return {
        handled: true,
        text: '',
        card: {
          type: 'feature_help',
          emoji: '✨',
          title: id ? 'Fitur PawPal' : 'PawPal Features',
          body: '',
          items: id
            ? ['⏰ "Ingatkan vaksin 20 Juni"', '🍽️ "Catat makan 1 cup kibble"', '🚽 "Pup di tempat benar"', '📝 "Catat gejala lesu"', '🔍 "Lihat pengingat"']
            : ['⏰ "Remind vaccine June 20"', '🍽️ "Fed 1 cup kibble"', '🚽 "Potty at correct spot"', '📝 "Note: acting lethargic"', '🔍 "Show reminders"'],
          accent: 'border-purple-300 bg-purple-50',
        },
      };
    }

    default:
      return { handled: false, text: '' };
  }
}
