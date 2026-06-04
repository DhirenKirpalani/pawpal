import { PetReminderRepository } from '@/repositories/pet-reminder-repository';

export interface ReminderHandlerResponse {
  success: boolean;
  message: string;
}

export class ReminderHandler {
  private reminderRepository: PetReminderRepository;

  constructor() {
    this.reminderRepository = new PetReminderRepository();
  }

  async addReminder(
    petId: string,
    type: string,
    title: string | null,
    dateStr: string | null,
    language: 'en' | 'id'
  ): Promise<ReminderHandlerResponse> {
    try {
      if (!dateStr) {
        return {
          success: false,
          message: language === 'id' 
            ? '❌ Mohon sertakan tanggal untuk pengingat. Contoh: "Vaksin tanggal 15 Januari"'
            : '❌ Please include a date for the reminder. Example: "Vaccine on January 15"'
        };
      }

      const dueDate = this.parseDate(dateStr);
      if (!dueDate) {
        return {
          success: false,
          message: language === 'id'
            ? '❌ Format tanggal tidak valid. Gunakan format seperti: "15/01/2024" atau "15 Januari"'
            : '❌ Invalid date format. Use formats like: "15/01/2024" or "January 15"'
        };
      }

      const reminderTitle = title || this.getDefaultTitle(type, language);

      await this.reminderRepository.create({
        pet_id: petId,
        reminder_type: type as any,
        title: reminderTitle,
        due_date: dueDate.toISOString(),
        recurring: false
      });

      return {
        success: true,
        message: language === 'id'
          ? `✅ Pengingat berhasil ditambahkan!\n\n📅 ${reminderTitle}\n🗓️ Tanggal: ${this.formatDate(dueDate, language)}\n\nKami akan mengingatkan Anda saat waktunya tiba.`
          : `✅ Reminder added successfully!\n\n📅 ${reminderTitle}\n🗓️ Date: ${this.formatDate(dueDate, language)}\n\nWe'll remind you when it's time.`
      };
    } catch (error) {
      console.error('Error adding reminder:', error);
      return {
        success: false,
        message: language === 'id'
          ? '❌ Gagal menambahkan pengingat. Silakan coba lagi.'
          : '❌ Failed to add reminder. Please try again.'
      };
    }
  }

  async listReminders(petId: string, language: 'en' | 'id'): Promise<ReminderHandlerResponse> {
    try {
      const reminders = await this.reminderRepository.getUpcomingByPetId(petId);

      if (reminders.length === 0) {
        return {
          success: true,
          message: language === 'id'
            ? '📋 Tidak ada pengingat yang dijadwalkan.\n\nGunakan perintah seperti "Vaksin tanggal 15 Januari" untuk menambahkan pengingat.'
            : '📋 No reminders scheduled.\n\nUse commands like "Vaccine on January 15" to add reminders.'
        };
      }

      const reminderList = reminders.map((r: any, idx: number) => {
        const date = new Date(r.due_date);
        const emoji = this.getReminderEmoji(r.reminder_type);
        return `${idx + 1}. ${emoji} ${r.title}\n   📅 ${this.formatDate(date, language)}`;
      }).join('\n\n');

      return {
        success: true,
        message: language === 'id'
          ? `📋 Pengingat Mendatang:\n\n${reminderList}\n\n💡 Balas "selesai [nomor]" untuk menandai pengingat sebagai selesai.`
          : `📋 Upcoming Reminders:\n\n${reminderList}\n\n💡 Reply "done [number]" to mark a reminder as complete.`
      };
    } catch (error) {
      console.error('Error listing reminders:', error);
      return {
        success: false,
        message: language === 'id'
          ? '❌ Gagal mengambil pengingat.'
          : '❌ Failed to retrieve reminders.'
      };
    }
  }

  async completeReminder(petId: string, language: 'en' | 'id'): Promise<ReminderHandlerResponse> {
    try {
      const reminders = await this.reminderRepository.getUpcomingByPetId(petId);
      
      if (reminders.length === 0) {
        return {
          success: false,
          message: language === 'id'
            ? '❌ Tidak ada pengingat aktif untuk diselesaikan.'
            : '❌ No active reminders to complete.'
        };
      }

      const firstReminder = reminders[0];
      await this.reminderRepository.markComplete(firstReminder.id);

      return {
        success: true,
        message: language === 'id'
          ? `✅ Pengingat diselesaikan: ${firstReminder.title}\n\n🎉 Bagus! Terus jaga kesehatan hewan peliharaan Anda.`
          : `✅ Reminder completed: ${firstReminder.title}\n\n🎉 Great job! Keep taking care of your pet's health.`
      };
    } catch (error) {
      console.error('Error completing reminder:', error);
      return {
        success: false,
        message: language === 'id'
          ? '❌ Gagal menyelesaikan pengingat.'
          : '❌ Failed to complete reminder.'
      };
    }
  }

  private parseDate(dateStr: string): Date | null {
    const now = new Date();
    
    const formats = [
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
      /(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december|januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)/i
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        if (match[3]) {
          const day = parseInt(match[1]);
          const month = parseInt(match[2]) - 1;
          let year = parseInt(match[3]);
          if (year < 100) year += 2000;
          return new Date(year, month, day);
        } else if (match[2]) {
          const day = parseInt(match[1]);
          const monthName = match[2].toLowerCase();
          const monthMap: Record<string, number> = {
            january: 0, januari: 0, february: 1, februari: 1, march: 2, maret: 2,
            april: 3, may: 4, mei: 4, june: 5, juni: 5, july: 6, juli: 6,
            august: 7, agustus: 7, september: 8, october: 9, oktober: 9,
            november: 10, december: 11, desember: 11
          };
          const month = monthMap[monthName];
          if (month !== undefined) {
            return new Date(now.getFullYear(), month, day);
          }
        }
      }
    }

    return null;
  }

  private formatDate(date: Date, language: 'en' | 'id'): string {
    const months = language === 'id'
      ? ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
      : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  private getDefaultTitle(type: string, language: 'en' | 'id'): string {
    const titles: Record<string, { en: string, id: string }> = {
      vaccine: { en: 'Vaccination', id: 'Vaksinasi' },
      deworming: { en: 'Deworming', id: 'Obat Cacing' },
      vet_appointment: { en: 'Vet Appointment', id: 'Janji Dokter Hewan' },
      medication: { en: 'Medication', id: 'Obat' },
      checkup: { en: 'Health Checkup', id: 'Pemeriksaan Kesehatan' }
    };
    return titles[type]?.[language] || titles.checkup[language];
  }

  private getReminderEmoji(type: string): string {
    const emojis: Record<string, string> = {
      vaccine: '💉',
      deworming: '💊',
      vet_appointment: '🏥',
      medication: '💊',
      checkup: '🩺'
    };
    return emojis[type] || '📌';
  }
}
