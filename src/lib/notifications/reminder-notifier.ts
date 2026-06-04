import { PetReminderRepository } from '@/repositories/pet-reminder-repository';
import { FeedingRepository } from '@/repositories/feeding-repository';
import { PetRepository } from '@/repositories/pet-repository';
import { UserRepository } from '@/repositories/user-repository';
import { WhatsAppCloudClient } from '@/adapters/whatsapp/cloud-api-client';

export class ReminderNotifier {
  private reminderRepository: PetReminderRepository;
  private feedingRepository: FeedingRepository;
  private petRepository: PetRepository;
  private userRepository: UserRepository;
  private whatsappClient: WhatsAppCloudClient;

  constructor() {
    this.reminderRepository = new PetReminderRepository();
    this.feedingRepository = new FeedingRepository();
    this.petRepository = new PetRepository();
    this.userRepository = new UserRepository();
    
    this.whatsappClient = new WhatsAppCloudClient({
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
    });
  }

  async sendDueReminders(): Promise<void> {
    try {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);

      const pets = await this.getAllPets();

      for (const pet of pets) {
        const reminders = await this.reminderRepository.getUpcomingByPetId(pet.id, 10);
        const dueReminders = reminders.filter(r => {
          const dueDate = new Date(r.due_date);
          return dueDate <= tomorrow && dueDate >= now;
        });

        if (dueReminders.length > 0) {
          const user = await this.userRepository.findById(pet.user_id);
          if (user) {
            await this.sendReminderNotification(user.phone, dueReminders, user.preferred_language);
          }
        }
      }
    } catch (error) {
      console.error('Error sending due reminders:', error);
    }
  }

  async sendFeedingReminders(): Promise<void> {
    try {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00`;

      const pets = await this.getAllPets();

      for (const pet of pets) {
        const schedules = await this.feedingRepository.getActiveSchedules(pet.id);
        const dueSchedules = schedules.filter(s => {
          const scheduleTime = s.meal_time;
          const scheduleHour = parseInt(scheduleTime.split(':')[0]);
          const currentHour = now.getHours();
          return scheduleHour === currentHour;
        });

        if (dueSchedules.length > 0) {
          const user = await this.userRepository.findById(pet.user_id);
          if (user) {
            await this.sendFeedingNotification(user.phone, pet.name, dueSchedules, user.preferred_language);
          }
        }
      }
    } catch (error) {
      console.error('Error sending feeding reminders:', error);
    }
  }

  private async sendReminderNotification(
    phone: string,
    reminders: any[],
    language: 'en' | 'id'
  ): Promise<void> {
    const reminderList = reminders.map((r, idx) => {
      const emoji = this.getReminderEmoji(r.reminder_type);
      return `${idx + 1}. ${emoji} ${r.title}`;
    }).join('\n');

    const message = language === 'id'
      ? `⏰ **Pengingat PawPal**\n\nHai! Anda memiliki pengingat yang akan jatuh tempo:\n\n${reminderList}\n\n💡 Balas "Lihat pengingat" untuk detail lengkap atau "Selesai" untuk menandai sebagai selesai.`
      : `⏰ **PawPal Reminder**\n\nHi! You have upcoming reminders:\n\n${reminderList}\n\n💡 Reply "List reminders" for full details or "Done" to mark as complete.`;

    try {
      await this.whatsappClient.sendMessage({
        to: phone,
        message
      });
    } catch (error) {
      console.error(`Failed to send reminder notification to ${phone}:`, error);
    }
  }

  private async sendFeedingNotification(
    phone: string,
    petName: string,
    schedules: any[],
    language: 'en' | 'id'
  ): Promise<void> {
    const schedule = schedules[0];
    const message = language === 'id'
      ? `🍖 **Waktu Makan ${petName}!**\n\n⏰ ${schedule.meal_name}\n📏 Porsi: ${schedule.portion_size || 'Sesuai kebutuhan'}\n\n💡 Balas "Makan selesai" setelah memberi makan untuk mencatat.`
      : `🍖 **Feeding Time for ${petName}!**\n\n⏰ ${schedule.meal_name}\n📏 Portion: ${schedule.portion_size || 'As needed'}\n\n💡 Reply "Fed" after feeding to log it.`;

    try {
      await this.whatsappClient.sendMessage({
        to: phone,
        message
      });
    } catch (error) {
      console.error(`Failed to send feeding notification to ${phone}:`, error);
    }
  }

  private async getAllPets(): Promise<any[]> {
    return await this.petRepository.getAll();
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
