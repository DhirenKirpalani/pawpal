export type FeatureCommand = 
  | 'REMINDER_ADD'
  | 'REMINDER_LIST'
  | 'REMINDER_COMPLETE'
  | 'FEEDING_ADD'
  | 'FEEDING_LOG'
  | 'FEEDING_SCHEDULE'
  | 'POTTY_LOG'
  | 'POTTY_STATS'
  | 'NOTE_ADD'
  | 'NOTE_LIST'
  | 'LOST_PET_REPORT'
  | 'LOST_PET_FOUND'
  | 'LOST_PET_STATUS'
  | 'HELP'
  | 'NONE';

export interface ParsedCommand {
  command: FeatureCommand;
  params: Record<string, any>;
  rawMessage: string;
}

export class CommandParser {
  private reminderKeywords = {
    en: ['remind', 'reminder', 'vaccine', 'vaccination', 'deworming', 'deworm', 'vet appointment', 'checkup', 'medication'],
    id: ['ingatkan', 'pengingat', 'vaksin', 'vaksinasi', 'obat cacing', 'janji dokter', 'pemeriksaan', 'obat']
  };

  private feedingKeywords = {
    en: ['feed', 'feeding', 'meal', 'food schedule', 'portion', 'diet'],
    id: ['makan', 'memberi makan', 'jadwal makan', 'porsi', 'diet']
  };

  private pottyKeywords = {
    en: ['potty', 'poop', 'pee', 'toilet', 'bathroom', 'accident'],
    id: ['toilet', 'pup', 'pipis', 'buang air', 'kecelakaan']
  };

  private noteKeywords = {
    en: ['note', 'log', 'record', 'journal', 'incident'],
    id: ['catatan', 'catat', 'rekam', 'jurnal', 'kejadian']
  };

  private lostPetKeywords = {
    en: ['lost', 'missing', 'found', 'escaped', 'runaway'],
    id: ['hilang', 'kabur', 'melarikan diri', 'ditemukan', 'ketemu']
  };

  parse(message: string): ParsedCommand {
    const lowerMessage = message.toLowerCase();

    if (this.isHelpCommand(lowerMessage)) {
      return { command: 'HELP', params: {}, rawMessage: message };
    }

    if (this.containsKeywords(lowerMessage, this.lostPetKeywords)) {
      return this.parseLostPetCommand(message, lowerMessage);
    }

    if (this.containsKeywords(lowerMessage, this.reminderKeywords)) {
      return this.parseReminderCommand(message, lowerMessage);
    }

    if (this.containsKeywords(lowerMessage, this.feedingKeywords)) {
      return this.parseFeedingCommand(message, lowerMessage);
    }

    if (this.containsKeywords(lowerMessage, this.pottyKeywords)) {
      return this.parsePottyCommand(message, lowerMessage);
    }

    if (this.containsKeywords(lowerMessage, this.noteKeywords)) {
      return this.parseNoteCommand(message, lowerMessage);
    }

    return { command: 'NONE', params: {}, rawMessage: message };
  }

  private isHelpCommand(message: string): boolean {
    return message === 'help' || message === 'bantuan' || message === 'menu' || message === 'commands';
  }

  private containsKeywords(message: string, keywords: { en: string[], id: string[] }): boolean {
    return [...keywords.en, ...keywords.id].some(keyword => message.includes(keyword));
  }

  private parseLostPetCommand(message: string, lowerMessage: string): ParsedCommand {
    if (lowerMessage.includes('found') || lowerMessage.includes('ditemukan') || lowerMessage.includes('ketemu')) {
      return { command: 'LOST_PET_FOUND', params: {}, rawMessage: message };
    }
    
    if (lowerMessage.includes('status')) {
      return { command: 'LOST_PET_STATUS', params: {}, rawMessage: message };
    }

    const locationMatch = message.match(/(?:at|di|near|dekat)\s+(.+?)(?:\.|$)/i);
    const location = locationMatch ? locationMatch[1].trim() : null;

    return {
      command: 'LOST_PET_REPORT',
      params: { location, description: message },
      rawMessage: message
    };
  }

  private parseReminderCommand(message: string, lowerMessage: string): ParsedCommand {
    if (lowerMessage.includes('list') || lowerMessage.includes('show') || lowerMessage.includes('tampilkan') || lowerMessage.includes('lihat')) {
      return { command: 'REMINDER_LIST', params: {}, rawMessage: message };
    }

    if (lowerMessage.includes('done') || lowerMessage.includes('complete') || lowerMessage.includes('selesai')) {
      return { command: 'REMINDER_COMPLETE', params: {}, rawMessage: message };
    }

    const reminderType = this.extractReminderType(lowerMessage);
    const dateMatch = message.match(/(?:on|at|tanggal)\s+(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{1,2}\s+\w+)/i);
    const titleMatch = message.match(/(?:for|untuk)\s+(.+?)(?:\s+on|\s+at|\s+tanggal|$)/i);

    return {
      command: 'REMINDER_ADD',
      params: {
        type: reminderType,
        title: titleMatch ? titleMatch[1].trim() : null,
        dateStr: dateMatch ? dateMatch[1].trim() : null,
        rawMessage: message
      },
      rawMessage: message
    };
  }

  private extractReminderType(message: string): string {
    if (message.includes('vaccine') || message.includes('vaksin')) return 'vaccine';
    if (message.includes('deworm') || message.includes('obat cacing')) return 'deworming';
    if (message.includes('vet') || message.includes('dokter')) return 'vet_appointment';
    if (message.includes('medication') || message.includes('obat')) return 'medication';
    return 'checkup';
  }

  private parseFeedingCommand(message: string, lowerMessage: string): ParsedCommand {
    if (lowerMessage.includes('schedule') || lowerMessage.includes('jadwal') || lowerMessage.includes('plan')) {
      return { command: 'FEEDING_SCHEDULE', params: {}, rawMessage: message };
    }

    if (lowerMessage.includes('log') || lowerMessage.includes('fed') || lowerMessage.includes('gave') || lowerMessage.includes('memberi')) {
      const portionMatch = message.match(/(\d+(?:\.\d+)?)\s*(cup|cups|gram|g|kg|bowl)/i);
      const foodMatch = message.match(/(?:fed|gave|memberi)\s+(.+?)(?:\s+\d|\.|$)/i);

      return {
        command: 'FEEDING_LOG',
        params: {
          foodType: foodMatch ? foodMatch[1].trim() : null,
          portion: portionMatch ? portionMatch[0] : null
        },
        rawMessage: message
      };
    }

    const timeMatch = message.match(/(\d{1,2}:\d{2}|\d{1,2}\s*(?:am|pm))/i);
    const portionMatch = message.match(/(\d+(?:\.\d+)?)\s*(cup|cups|gram|g|kg|bowl)/i);

    return {
      command: 'FEEDING_ADD',
      params: {
        time: timeMatch ? timeMatch[0] : null,
        portion: portionMatch ? portionMatch[0] : null,
        rawMessage: message
      },
      rawMessage: message
    };
  }

  private parsePottyCommand(message: string, lowerMessage: string): ParsedCommand {
    if (lowerMessage.includes('stats') || lowerMessage.includes('statistics') || lowerMessage.includes('statistik') || lowerMessage.includes('progress')) {
      return { command: 'POTTY_STATS', params: {}, rawMessage: message };
    }

    const eventType = lowerMessage.includes('poop') || lowerMessage.includes('pup') ? 'poop' : 'pee';
    
    let location: 'correct_spot' | 'wrong_spot' | 'accident' = 'correct_spot';
    if (lowerMessage.includes('accident') || lowerMessage.includes('wrong') || lowerMessage.includes('kecelakaan')) {
      location = 'accident';
    } else if (lowerMessage.includes('wrong spot') || lowerMessage.includes('salah tempat')) {
      location = 'wrong_spot';
    }

    let consistency: string | null = null;
    if (lowerMessage.includes('diarrhea') || lowerMessage.includes('diare')) consistency = 'diarrhea';
    else if (lowerMessage.includes('soft') || lowerMessage.includes('lembek')) consistency = 'soft';
    else if (lowerMessage.includes('hard') || lowerMessage.includes('keras')) consistency = 'hard';
    else if (eventType === 'poop') consistency = 'normal';

    return {
      command: 'POTTY_LOG',
      params: { eventType, location, consistency },
      rawMessage: message
    };
  }

  private parseNoteCommand(message: string, lowerMessage: string): ParsedCommand {
    if (lowerMessage.includes('list') || lowerMessage.includes('show') || lowerMessage.includes('tampilkan')) {
      return { command: 'NOTE_LIST', params: {}, rawMessage: message };
    }

    let noteType: 'health' | 'behavior' | 'food' | 'general' | 'incident' = 'general';
    if (lowerMessage.includes('health') || lowerMessage.includes('kesehatan')) noteType = 'health';
    else if (lowerMessage.includes('behavior') || lowerMessage.includes('perilaku')) noteType = 'behavior';
    else if (lowerMessage.includes('food') || lowerMessage.includes('makan')) noteType = 'food';
    else if (lowerMessage.includes('incident') || lowerMessage.includes('kejadian')) noteType = 'incident';

    let severity: 'normal' | 'concern' | 'urgent' = 'normal';
    if (lowerMessage.includes('urgent') || lowerMessage.includes('emergency') || lowerMessage.includes('darurat')) severity = 'urgent';
    else if (lowerMessage.includes('concern') || lowerMessage.includes('worried') || lowerMessage.includes('khawatir')) severity = 'concern';

    return {
      command: 'NOTE_ADD',
      params: { noteType, severity, content: message },
      rawMessage: message
    };
  }
}
