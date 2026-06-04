import { PottyTrainingRepository } from '@/repositories/potty-training-repository';

export interface PottyHandlerResponse {
  success: boolean;
  message: string;
}

export class PottyHandler {
  private pottyRepository: PottyTrainingRepository;

  constructor() {
    this.pottyRepository = new PottyTrainingRepository();
  }

  async logPotty(
    petId: string,
    eventType: 'poop' | 'pee',
    location: 'correct_spot' | 'wrong_spot' | 'accident',
    consistency: string | null,
    language: 'en' | 'id'
  ): Promise<PottyHandlerResponse> {
    try {
      await this.pottyRepository.create({
        pet_id: petId,
        event_type: eventType,
        location,
        consistency: (consistency as 'normal' | 'soft' | 'diarrhea' | 'hard' | undefined) || undefined,
        notes: undefined
      });

      const emoji = location === 'correct_spot' ? '✅' : '⚠️';
      const locationText = this.getLocationText(location, language);

      return {
        success: true,
        message: language === 'id'
          ? `${emoji} Catatan toilet berhasil ditambahkan!\n\n🚽 Jenis: ${eventType === 'poop' ? 'Pup' : 'Pipis'}\n📍 Lokasi: ${locationText}\n${consistency ? `💩 Konsistensi: ${consistency}\n` : ''}\n${location === 'correct_spot' ? '🎉 Bagus sekali! Terus latih dengan konsisten.' : '💡 Jangan khawatir, terus latih dengan sabar dan konsisten.'}`
          : `${emoji} Potty log added successfully!\n\n🚽 Type: ${eventType === 'poop' ? 'Poop' : 'Pee'}\n📍 Location: ${locationText}\n${consistency ? `💩 Consistency: ${consistency}\n` : ''}\n${location === 'correct_spot' ? '🎉 Great job! Keep training consistently.' : '💡 Don\'t worry, keep training patiently and consistently.'}`
      };
    } catch (error) {
      console.error('Error logging potty:', error);
      return {
        success: false,
        message: language === 'id'
          ? '❌ Gagal mencatat toilet.'
          : '❌ Failed to log potty.'
      };
    }
  }

  async getStats(petId: string, language: 'en' | 'id'): Promise<PottyHandlerResponse> {
    try {
      const logs = await this.pottyRepository.getRecentByPetId(petId, 30);

      if (logs.length === 0) {
        return {
          success: true,
          message: language === 'id'
            ? '📊 Belum ada catatan toilet.\n\nMulai catat dengan perintah seperti "Pup di tempat yang benar" atau "Pipis kecelakaan".'
            : '📊 No potty logs yet.\n\nStart logging with commands like "Poop in correct spot" or "Pee accident".'
        };
      }

      const correctSpot = logs.filter((l: any) => l.location === 'correct_spot').length;
      const total = logs.length;
      const successRate = Math.round((correctSpot / total) * 100);

      const last7Days = logs.filter((l: any) => {
        const logDate = new Date(l.logged_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return logDate >= weekAgo;
      });

      return {
        success: true,
        message: language === 'id'
          ? `📊 Statistik Toilet (30 hari terakhir):\n\n✅ Tingkat Keberhasilan: ${successRate}%\n📝 Total Catatan: ${total}\n🎯 Tempat Benar: ${correctSpot}\n⚠️ Kecelakaan: ${total - correctSpot}\n\n📅 7 Hari Terakhir: ${last7Days.length} catatan\n\n${successRate >= 80 ? '🎉 Luar biasa! Latihan berjalan sangat baik!' : successRate >= 50 ? '👍 Kemajuan bagus! Terus konsisten.' : '💪 Tetap semangat! Konsistensi adalah kunci.'}`
          : `📊 Potty Statistics (Last 30 days):\n\n✅ Success Rate: ${successRate}%\n📝 Total Logs: ${total}\n🎯 Correct Spot: ${correctSpot}\n⚠️ Accidents: ${total - correctSpot}\n\n📅 Last 7 Days: ${last7Days.length} logs\n\n${successRate >= 80 ? '🎉 Excellent! Training is going very well!' : successRate >= 50 ? '👍 Good progress! Keep being consistent.' : '💪 Keep going! Consistency is key.'}`
      };
    } catch (error) {
      console.error('Error getting potty stats:', error);
      return {
        success: false,
        message: language === 'id'
          ? '❌ Gagal mengambil statistik.'
          : '❌ Failed to retrieve statistics.'
      };
    }
  }

  private getLocationText(location: string, language: 'en' | 'id'): string {
    const locations: Record<string, { en: string, id: string }> = {
      correct_spot: { en: 'Correct spot', id: 'Tempat yang benar' },
      wrong_spot: { en: 'Wrong spot', id: 'Tempat yang salah' },
      accident: { en: 'Accident', id: 'Kecelakaan' }
    };
    return locations[location]?.[language] || location;
  }
}
