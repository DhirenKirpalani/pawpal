import { FeedingRepository } from '@/repositories/feeding-repository';

export interface FeedingHandlerResponse {
  success: boolean;
  message: string;
}

export class FeedingHandler {
  private feedingRepository: FeedingRepository;

  constructor() {
    this.feedingRepository = new FeedingRepository();
  }

  async logFeeding(
    petId: string,
    foodType: string | null,
    portion: string | null,
    language: 'en' | 'id'
  ): Promise<FeedingHandlerResponse> {
    try {
      await this.feedingRepository.createLog({
        pet_id: petId,
        food_type: foodType || 'Regular food',
        portion_size: portion || undefined,
        supplements: undefined,
        notes: undefined
      });

      return {
        success: true,
        message: language === 'id'
          ? `✅ Catatan makan berhasil ditambahkan!\n\n🍖 Makanan: ${foodType || 'Makanan reguler'}\n📏 Porsi: ${portion || 'Tidak ditentukan'}\n\n💡 Tip: Konsistensi dalam porsi membantu menjaga berat badan ideal.`
          : `✅ Feeding logged successfully!\n\n🍖 Food: ${foodType || 'Regular food'}\n📏 Portion: ${portion || 'Not specified'}\n\n💡 Tip: Consistent portions help maintain ideal weight.`
      };
    } catch (error) {
      console.error('Error logging feeding:', error);
      return {
        success: false,
        message: language === 'id'
          ? '❌ Gagal mencatat pemberian makan.'
          : '❌ Failed to log feeding.'
      };
    }
  }

  async addSchedule(
    petId: string,
    time: string | null,
    portion: string | null,
    rawMessage: string,
    language: 'en' | 'id'
  ): Promise<FeedingHandlerResponse> {
    try {
      if (!time) {
        return {
          success: false,
          message: language === 'id'
            ? '❌ Mohon sertakan waktu makan. Contoh: "Jadwal makan jam 8:00 pagi"'
            : '❌ Please include meal time. Example: "Feeding schedule at 8:00 AM"'
        };
      }

      const parsedTime = this.parseTime(time);
      if (!parsedTime) {
        return {
          success: false,
          message: language === 'id'
            ? '❌ Format waktu tidak valid. Gunakan format seperti "8:00" atau "8 pagi"'
            : '❌ Invalid time format. Use formats like "8:00" or "8 AM"'
        };
      }

      await this.feedingRepository.createSchedule({
        pet_id: petId,
        meal_time: parsedTime,
        meal_name: this.getMealName(parsedTime, language),
        food_type: undefined,
        portion_size: portion || undefined,
        supplements: undefined
      });

      return {
        success: true,
        message: language === 'id'
          ? `✅ Jadwal makan berhasil ditambahkan!\n\n⏰ Waktu: ${parsedTime}\n📏 Porsi: ${portion || 'Sesuai kebutuhan'}\n\n💡 Kami akan mengingatkan Anda saat waktu makan tiba.`
          : `✅ Feeding schedule added!\n\n⏰ Time: ${parsedTime}\n📏 Portion: ${portion || 'As needed'}\n\n💡 We'll remind you when it's feeding time.`
      };
    } catch (error) {
      console.error('Error adding feeding schedule:', error);
      return {
        success: false,
        message: language === 'id'
          ? '❌ Gagal menambahkan jadwal makan.'
          : '❌ Failed to add feeding schedule.'
      };
    }
  }

  async getSchedule(petId: string, language: 'en' | 'id'): Promise<FeedingHandlerResponse> {
    try {
      const schedules = await this.feedingRepository.getActiveSchedules(petId);

      if (schedules.length === 0) {
        return {
          success: true,
          message: language === 'id'
            ? '📋 Belum ada jadwal makan.\n\nGunakan perintah seperti "Jadwal makan jam 8:00 pagi, porsi 1 cup" untuk menambahkan jadwal.'
            : '📋 No feeding schedules yet.\n\nUse commands like "Feeding schedule at 8:00 AM, portion 1 cup" to add a schedule.'
        };
      }

      const scheduleList = schedules.map((s: any, idx: number) => {
        return `${idx + 1}. ⏰ ${s.meal_time} - ${s.meal_name}\n   📏 ${s.portion_size || (language === 'id' ? 'Sesuai kebutuhan' : 'As needed')}`;
      }).join('\n\n');

      return {
        success: true,
        message: language === 'id'
          ? `📋 Jadwal Makan:\n\n${scheduleList}\n\n💡 Balas "Makan selesai" setelah memberi makan untuk mencatat.`
          : `📋 Feeding Schedule:\n\n${scheduleList}\n\n💡 Reply "Fed" after feeding to log it.`
      };
    } catch (error) {
      console.error('Error getting feeding schedule:', error);
      return {
        success: false,
        message: language === 'id'
          ? '❌ Gagal mengambil jadwal makan.'
          : '❌ Failed to retrieve feeding schedule.'
      };
    }
  }

  private parseTime(timeStr: string): string | null {
    const patterns = [
      /(\d{1,2}):(\d{2})/,
      /(\d{1,2})\s*(am|pm|pagi|siang|sore|malam)/i
    ];

    for (const pattern of patterns) {
      const match = timeStr.match(pattern);
      if (match) {
        let hours = parseInt(match[1]);
        const minutes = match[2] ? parseInt(match[2]) : 0;

        if (match[2] && isNaN(minutes)) {
          const period = match[2].toLowerCase();
          if (period === 'pm' || period === 'sore' || period === 'malam') {
            if (hours < 12) hours += 12;
          } else if (period === 'am' || period === 'pagi' || period === 'siang') {
            if (hours === 12) hours = 0;
          }
        }

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
      }
    }

    return null;
  }

  private getMealName(time: string, language: 'en' | 'id'): string {
    const hour = parseInt(time.split(':')[0]);
    
    if (hour >= 5 && hour < 11) {
      return language === 'id' ? 'Sarapan' : 'Breakfast';
    } else if (hour >= 11 && hour < 16) {
      return language === 'id' ? 'Makan Siang' : 'Lunch';
    } else if (hour >= 16 && hour < 20) {
      return language === 'id' ? 'Makan Malam' : 'Dinner';
    } else {
      return language === 'id' ? 'Camilan' : 'Snack';
    }
  }
}
