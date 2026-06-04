import { CommandParser, ParsedCommand } from '@/lib/features/command-parser';
import { ReminderHandler } from '@/lib/features/reminder-handler';
import { FeedingHandler } from '@/lib/features/feeding-handler';
import { PottyHandler } from '@/lib/features/potty-handler';
import { NoteHandler } from '@/lib/features/note-handler';
import { LostPetHandler } from '@/lib/features/lost-pet-handler';

export interface FeatureRequest {
  petId: string;
  message: string;
  language: 'en' | 'id';
}

export interface FeatureResponse {
  handled: boolean;
  message: string;
}

export class FeatureService {
  private commandParser: CommandParser;
  private reminderHandler: ReminderHandler;
  private feedingHandler: FeedingHandler;
  private pottyHandler: PottyHandler;
  private noteHandler: NoteHandler;
  private lostPetHandler: LostPetHandler;

  constructor() {
    this.commandParser = new CommandParser();
    this.reminderHandler = new ReminderHandler();
    this.feedingHandler = new FeedingHandler();
    this.pottyHandler = new PottyHandler();
    this.noteHandler = new NoteHandler();
    this.lostPetHandler = new LostPetHandler();
  }

  async processFeatureCommand(request: FeatureRequest): Promise<FeatureResponse> {
    const parsed = this.commandParser.parse(request.message);

    if (parsed.command === 'NONE') {
      return { handled: false, message: '' };
    }

    if (parsed.command === 'HELP') {
      return {
        handled: true,
        message: this.getHelpMessage(request.language)
      };
    }

    try {
      const result = await this.routeCommand(parsed, request.petId, request.language);
      return {
        handled: true,
        message: result.message
      };
    } catch (error) {
      console.error('Error processing feature command:', error);
      return {
        handled: true,
        message: request.language === 'id'
          ? '❌ Terjadi kesalahan saat memproses perintah Anda. Silakan coba lagi.'
          : '❌ An error occurred while processing your command. Please try again.'
      };
    }
  }

  private async routeCommand(
    parsed: ParsedCommand,
    petId: string,
    language: 'en' | 'id'
  ): Promise<{ success: boolean; message: string }> {
    switch (parsed.command) {
      // Reminders
      case 'REMINDER_ADD':
        return await this.reminderHandler.addReminder(
          petId,
          parsed.params.type,
          parsed.params.title,
          parsed.params.dateStr,
          language
        );
      
      case 'REMINDER_LIST':
        return await this.reminderHandler.listReminders(petId, language);
      
      case 'REMINDER_COMPLETE':
        return await this.reminderHandler.completeReminder(petId, language);

      // Feeding
      case 'FEEDING_LOG':
        return await this.feedingHandler.logFeeding(
          petId,
          parsed.params.foodType,
          parsed.params.portion,
          language
        );
      
      case 'FEEDING_ADD':
        return await this.feedingHandler.addSchedule(
          petId,
          parsed.params.time,
          parsed.params.portion,
          parsed.params.rawMessage,
          language
        );
      
      case 'FEEDING_SCHEDULE':
        return await this.feedingHandler.getSchedule(petId, language);

      // Potty Training
      case 'POTTY_LOG':
        return await this.pottyHandler.logPotty(
          petId,
          parsed.params.eventType,
          parsed.params.location,
          parsed.params.consistency,
          language
        );
      
      case 'POTTY_STATS':
        return await this.pottyHandler.getStats(petId, language);

      // Notes
      case 'NOTE_ADD':
        return await this.noteHandler.addNote(
          petId,
          parsed.params.noteType,
          parsed.params.severity,
          parsed.params.content,
          language
        );
      
      case 'NOTE_LIST':
        return await this.noteHandler.listNotes(petId, language);

      // Lost Pet
      case 'LOST_PET_REPORT':
        return await this.lostPetHandler.reportLost(
          petId,
          parsed.params.location,
          parsed.params.description,
          language
        );
      
      case 'LOST_PET_FOUND':
        return await this.lostPetHandler.markFound(petId, language);
      
      case 'LOST_PET_STATUS':
        return await this.lostPetHandler.getStatus(petId, language);

      default:
        return {
          success: false,
          message: language === 'id'
            ? '❌ Perintah tidak dikenali.'
            : '❌ Command not recognized.'
        };
    }
  }

  private getHelpMessage(language: 'en' | 'id'): string {
    if (language === 'id') {
      return `🐾 **Menu PawPal** 🐾

📋 **Fitur yang Tersedia:**

⏰ **Pengingat Cerdas**
• "Vaksin tanggal 15 Januari"
• "Obat cacing 20 Februari"
• "Lihat pengingat"
• "Selesai" (tandai pengingat selesai)

🍖 **Pelacak Makan**
• "Jadwal makan jam 8 pagi, porsi 1 cup"
• "Memberi makan ayam 200 gram"
• "Lihat jadwal makan"

🚽 **Latihan Toilet**
• "Pup di tempat yang benar"
• "Pipis kecelakaan"
• "Statistik toilet"

📝 **Jurnal Kesehatan**
• "Catat: Luna muntah pagi ini"
• "Catat perilaku: Lebih aktif dari biasanya"
• "Lihat catatan"

🔔 **Laporan Hewan Hilang**
• "Hilang di dekat taman"
• "Ditemukan"
• "Status hewan hilang"

💡 **Tips:**
• Gunakan bahasa natural
• Sertakan detail spesifik
• Catat secara konsisten

Ketik pertanyaan kesehatan untuk konsultasi AI!`;
    }

    return `🐾 **PawPal Menu** 🐾

📋 **Available Features:**

⏰ **Smart Reminders**
• "Vaccine on January 15"
• "Deworming February 20"
• "List reminders"
• "Done" (mark reminder complete)

🍖 **Feeding Tracker**
• "Feeding schedule at 8 AM, portion 1 cup"
• "Fed chicken 200 grams"
• "Show feeding schedule"

🚽 **Potty Training**
• "Poop in correct spot"
• "Pee accident"
• "Potty stats"

📝 **Health Journal**
• "Note: Luna vomited this morning"
• "Note behavior: More active than usual"
• "List notes"

🔔 **Lost Pet Alert**
• "Lost near the park"
• "Found"
• "Lost pet status"

💡 **Tips:**
• Use natural language
• Include specific details
• Log consistently

Type health questions for AI consultation!`;
  }
}
