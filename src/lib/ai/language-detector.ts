export type Language = 'en' | 'id';

const INDONESIAN_KEYWORDS = [
  'kucing',
  'anjing',
  'muntah',
  'makan',
  'sakit',
  'kenapa',
  'saya',
  'dia',
  'sudah',
  'belum',
  'boleh',
  'tidak',
  'apa',
  'bagaimana',
  'dimana',
  'kapan',
  'siapa',
  'berapa',
  'hewan',
  'peliharaan',
  'dokter',
  'diare',
  'batuk',
  'gatal',
  'lemas',
  'galak',
  'sembunyi',
  'pendiam',
  'agresif',
  'coklat',
  'bawang',
  'anggur',
  'susu',
  'ikan',
  'ayam',
  'nasi',
];

export function detectLanguage(text: string): Language {
  const normalizedText = text.toLowerCase();

  let indonesianScore = 0;

  for (const keyword of INDONESIAN_KEYWORDS) {
    if (normalizedText.includes(keyword)) {
      indonesianScore++;
    }
  }

  return indonesianScore >= 2 ? 'id' : 'en';
}
