import { PetNoteRepository } from '@/repositories/pet-note-repository';

export interface NoteHandlerResponse {
  success: boolean;
  message: string;
}

export class NoteHandler {
  private noteRepository: PetNoteRepository;

  constructor() {
    this.noteRepository = new PetNoteRepository();
  }

  async addNote(
    petId: string,
    noteType: 'health' | 'behavior' | 'food' | 'general' | 'incident',
    severity: 'normal' | 'concern' | 'urgent',
    content: string,
    language: 'en' | 'id'
  ): Promise<NoteHandlerResponse> {
    try {
      const title = this.generateTitle(noteType, content, language);

      await this.noteRepository.create({
        pet_id: petId,
        note_type: noteType,
        title,
        content,
        severity,
        tags: undefined,
        created_by: undefined
      });

      const emoji = this.getNoteEmoji(noteType);
      const severityEmoji = severity === 'urgent' ? '🚨' : severity === 'concern' ? '⚠️' : '📝';

      return {
        success: true,
        message: language === 'id'
          ? `${emoji} Catatan berhasil ditambahkan!\n\n${severityEmoji} Tingkat: ${this.getSeverityText(severity, language)}\n📋 Jenis: ${this.getNoteTypeText(noteType, language)}\n\n💡 Catatan Anda tersimpan dan dapat dibagikan dengan dokter hewan saat diperlukan.`
          : `${emoji} Note added successfully!\n\n${severityEmoji} Level: ${this.getSeverityText(severity, language)}\n📋 Type: ${this.getNoteTypeText(noteType, language)}\n\n💡 Your note is saved and can be shared with your vet when needed.`
      };
    } catch (error) {
      console.error('Error adding note:', error);
      return {
        success: false,
        message: language === 'id'
          ? '❌ Gagal menambahkan catatan.'
          : '❌ Failed to add note.'
      };
    }
  }

  async listNotes(petId: string, language: 'en' | 'id'): Promise<NoteHandlerResponse> {
    try {
      const notes = await this.noteRepository.getByPetId(petId, 10);

      if (notes.length === 0) {
        return {
          success: true,
          message: language === 'id'
            ? '📋 Belum ada catatan.\n\nGunakan perintah seperti "Catat: Luna muntah pagi ini" untuk menambahkan catatan.'
            : '📋 No notes yet.\n\nUse commands like "Note: Luna vomited this morning" to add notes.'
        };
      }

      const noteList = notes.map((n: any, idx: number) => {
        const date = new Date(n.created_at);
        const emoji = this.getNoteEmoji(n.note_type);
        const severityEmoji = n.severity === 'urgent' ? '🚨' : n.severity === 'concern' ? '⚠️' : '';
        return `${idx + 1}. ${emoji}${severityEmoji} ${n.title}\n   📅 ${this.formatDate(date, language)}\n   ${n.content.substring(0, 60)}${n.content.length > 60 ? '...' : ''}`;
      }).join('\n\n');

      return {
        success: true,
        message: language === 'id'
          ? `📋 Catatan Terbaru:\n\n${noteList}\n\n💡 Simpan catatan penting untuk dibagikan dengan dokter hewan.`
          : `📋 Recent Notes:\n\n${noteList}\n\n💡 Keep important notes to share with your vet.`
      };
    } catch (error) {
      console.error('Error listing notes:', error);
      return {
        success: false,
        message: language === 'id'
          ? '❌ Gagal mengambil catatan.'
          : '❌ Failed to retrieve notes.'
      };
    }
  }

  private generateTitle(noteType: string, content: string, language: 'en' | 'id'): string {
    const words = content.split(' ').slice(0, 5).join(' ');
    return words.length > 50 ? words.substring(0, 50) + '...' : words;
  }

  private getNoteEmoji(noteType: string): string {
    const emojis: Record<string, string> = {
      health: '🏥',
      behavior: '🐾',
      food: '🍖',
      general: '📝',
      incident: '⚠️'
    };
    return emojis[noteType] || '📝';
  }

  private getSeverityText(severity: string, language: 'en' | 'id'): string {
    const texts: Record<string, { en: string, id: string }> = {
      normal: { en: 'Normal', id: 'Normal' },
      concern: { en: 'Concern', id: 'Perhatian' },
      urgent: { en: 'Urgent', id: 'Mendesak' }
    };
    return texts[severity]?.[language] || severity;
  }

  private getNoteTypeText(noteType: string, language: 'en' | 'id'): string {
    const types: Record<string, { en: string, id: string }> = {
      health: { en: 'Health', id: 'Kesehatan' },
      behavior: { en: 'Behavior', id: 'Perilaku' },
      food: { en: 'Food', id: 'Makanan' },
      general: { en: 'General', id: 'Umum' },
      incident: { en: 'Incident', id: 'Kejadian' }
    };
    return types[noteType]?.[language] || noteType;
  }

  private formatDate(date: Date, language: 'en' | 'id'): string {
    const months = language === 'id'
      ? ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return `${date.getDate()} ${months[date.getMonth()]}`;
  }
}
