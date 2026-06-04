import { LostPetRepository } from '@/repositories/lost-pet-repository';

export interface LostPetHandlerResponse {
  success: boolean;
  message: string;
}

export class LostPetHandler {
  private lostPetRepository: LostPetRepository;

  constructor() {
    this.lostPetRepository = new LostPetRepository();
  }

  async reportLost(
    petId: string,
    location: string | null,
    description: string,
    language: 'en' | 'id'
  ): Promise<LostPetHandlerResponse> {
    try {
      const existingAlert = await this.lostPetRepository.getActiveAlert(petId);
      
      if (existingAlert) {
        return {
          success: false,
          message: language === 'id'
            ? '⚠️ Sudah ada laporan aktif untuk hewan peliharaan ini.\n\nGunakan "Ditemukan" untuk mengupdate status.'
            : '⚠️ There is already an active alert for this pet.\n\nUse "Found" to update the status.'
        };
      }

      await this.lostPetRepository.create({
        pet_id: petId,
        last_seen_location: location || undefined,
        last_seen_at: new Date().toISOString(),
        description,
        contact_info: undefined
      });

      return {
        success: true,
        message: language === 'id'
          ? `🚨 LAPORAN HEWAN HILANG AKTIF\n\n📍 Terakhir terlihat: ${location || 'Tidak ditentukan'}\n⏰ Waktu: Baru saja\n\n💡 Tindakan yang disarankan:\n1. Cari di area sekitar rumah\n2. Hubungi tetangga dan teman\n3. Posting di media sosial lokal\n4. Hubungi shelter hewan terdekat\n5. Periksa microchip jika ada\n\n🙏 Kami berharap hewan peliharaan Anda segera ditemukan!\n\nBalas "Ditemukan" saat hewan peliharaan Anda kembali.`
          : `🚨 LOST PET ALERT ACTIVE\n\n📍 Last seen: ${location || 'Not specified'}\n⏰ Time: Just now\n\n💡 Recommended actions:\n1. Search around your home area\n2. Contact neighbors and friends\n3. Post on local social media\n4. Contact nearby animal shelters\n5. Check microchip if available\n\n🙏 We hope your pet is found soon!\n\nReply "Found" when your pet returns.`
      };
    } catch (error) {
      console.error('Error reporting lost pet:', error);
      return {
        success: false,
        message: language === 'id'
          ? '❌ Gagal membuat laporan hewan hilang.'
          : '❌ Failed to create lost pet report.'
      };
    }
  }

  async markFound(petId: string, language: 'en' | 'id'): Promise<LostPetHandlerResponse> {
    try {
      const alert = await this.lostPetRepository.getActiveAlert(petId);

      if (!alert) {
        return {
          success: false,
          message: language === 'id'
            ? '❌ Tidak ada laporan hewan hilang yang aktif.'
            : '❌ No active lost pet alert found.'
        };
      }

      await this.lostPetRepository.markFound(alert.id);

      return {
        success: true,
        message: language === 'id'
          ? `🎉 HEWAN PELIHARAAN DITEMUKAN!\n\nAlhamdulillah! Kami sangat senang hewan peliharaan Anda telah kembali dengan selamat.\n\n💡 Saran setelah ditemukan:\n1. Periksa kondisi kesehatan\n2. Berikan air dan makanan secukupnya\n3. Periksa luka atau cedera\n4. Pertimbangkan kunjungan ke dokter hewan\n5. Update informasi microchip jika perlu\n\n❤️ Jaga baik-baik hewan peliharaan Anda!`
          : `🎉 PET FOUND!\n\nWonderful news! We're so happy your pet has returned safely.\n\n💡 Post-return recommendations:\n1. Check health condition\n2. Provide water and food moderately\n3. Check for injuries or wounds\n4. Consider a vet visit\n5. Update microchip info if needed\n\n❤️ Take good care of your pet!`
      };
    } catch (error) {
      console.error('Error marking pet found:', error);
      return {
        success: false,
        message: language === 'id'
          ? '❌ Gagal mengupdate status.'
          : '❌ Failed to update status.'
      };
    }
  }

  async getStatus(petId: string, language: 'en' | 'id'): Promise<LostPetHandlerResponse> {
    try {
      const alert = await this.lostPetRepository.getActiveAlert(petId);

      if (!alert) {
        return {
          success: true,
          message: language === 'id'
            ? '✅ Tidak ada laporan hewan hilang yang aktif.\n\nHewan peliharaan Anda aman bersama Anda.'
            : '✅ No active lost pet alerts.\n\nYour pet is safe with you.'
        };
      }

      const lastSeen = new Date(alert.last_seen_at || alert.created_at);
      const hoursAgo = Math.floor((Date.now() - lastSeen.getTime()) / (1000 * 60 * 60));

      return {
        success: true,
        message: language === 'id'
          ? `🚨 STATUS HEWAN HILANG\n\n⏰ Hilang sejak: ${hoursAgo} jam yang lalu\n📍 Terakhir terlihat: ${alert.last_seen_location || 'Tidak ditentukan'}\n\n💡 Terus cari dan hubungi shelter lokal.\n\nBalas "Ditemukan" saat hewan peliharaan Anda kembali.`
          : `🚨 LOST PET STATUS\n\n⏰ Missing for: ${hoursAgo} hours\n📍 Last seen: ${alert.last_seen_location || 'Not specified'}\n\n💡 Keep searching and contact local shelters.\n\nReply "Found" when your pet returns.`
      };
    } catch (error) {
      console.error('Error getting lost pet status:', error);
      return {
        success: false,
        message: language === 'id'
          ? '❌ Gagal mengambil status.'
          : '❌ Failed to retrieve status.'
      };
    }
  }
}
