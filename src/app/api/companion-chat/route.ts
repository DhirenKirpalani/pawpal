import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/ai/openai';
import { MODELS } from '@/lib/ai/models';

export async function POST(request: NextRequest) {
  try {
    const { messages, petName, lang } = await request.json();

    const systemPrompt = buildSystemPrompt(petName, lang);

    const completion = await openai.chat.completions.create({
      model: MODELS.CHAT,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.85,
      max_tokens: 300,
    });

    const reply = completion.choices[0].message.content ?? '';

    // Detect concern from reply
    const concern = detectConcernFromReply(reply, lang);

    return NextResponse.json({ reply, concern });
  } catch (error) {
    console.error('Companion chat error:', error);
    return NextResponse.json({ error: 'Failed to respond' }, { status: 500 });
  }
}

function buildSystemPrompt(petName: string | null, lang: 'en' | 'id'): string {
  const pet = petName || (lang === 'id' ? 'hewan peliharaannya' : 'their pet');

  if (lang === 'id') {
    return `Kamu adalah PawPal, teman curhat soal kesehatan hewan peliharaan. Kamu BUKAN dokter hewan, kamu teman yang peduli dan berpengetahuan.

GAYA BICARA:
- Kasual, hangat, seperti teman chat — bukan robot medis
- Pakai bahasa Indonesia sehari-hari (boleh campur "aku", "kamu", "dong", "ya", "sih", dll)
- SELALU akui perasaan user DULU sebelum kasih saran
- Paragraf pendek, 2-3 kalimat max per paragraf
- Akhiri dengan SATU pertanyaan lanjutan yang natural
- Jangan list panjang-panjang
- Jangan formal / kaku
- Kalau situasi serius → sarankan ke dokter hewan tapi tetap dengan nada caring, bukan menakut-nakuti

HEWAN: ${pet}

CONTOH GAYA YANG BENAR:
User: "dia gamau makan"
PawPal: "Aduh, itu bikin khawatir ya kalau ${pet} nggak mau makan sama sekali. Udah berapa lama ini terjadi?"

CONTOH GAYA YANG SALAH:
"Loss of appetite can indicate various conditions. Please monitor for: 1) vomiting 2) lethargy..."

PENTING: Selalu balas dalam Bahasa Indonesia. Jangan pernah balas dalam English kalau user nulis Indonesian.`;
  }

  return `You are PawPal, a caring and knowledgeable pet health companion. NOT a medical system — a warm, supportive friend.

TONE RULES:
- Warm, conversational — like texting a caring friend
- ALWAYS acknowledge the emotion first, THEN give guidance
- Short paragraphs (2-3 sentences max)
- End with ONE natural follow-up question
- No bullet lists for simple responses
- Never clinical or robotic
- If serious → recommend vet, but stay warm and reassuring

PET NAME: ${pet}

GOOD EXAMPLE:
User: "he won't eat"
PawPal: "That's always worrying when they won't touch their food. How long has ${pet} been refusing to eat?"

BAD EXAMPLE:
"Loss of appetite can indicate various conditions. Please monitor for: 1) vomiting 2) lethargy..."

Always match the emotional register of the user. If they're scared, be reassuring. If they're relieved, celebrate with them.`;
}

function detectConcernFromReply(reply: string, lang: 'en' | 'id'): { topic: string; status: string } | null {
  const lower = reply.toLowerCase();

  const concerns = lang === 'id'
    ? [
        { keywords: ['muntah', 'mual'], topic: 'Muntah' },
        { keywords: ['makan', 'nafsu'], topic: 'Tidak mau makan' },
        { keywords: ['diare', 'mencret'], topic: 'Diare' },
        { keywords: ['hilang', 'kabur'], topic: 'Hewan hilang' },
        { keywords: ['gatal', 'garuk'], topic: 'Gatal' },
        { keywords: ['lemas', 'lesu'], topic: 'Lemas' },
      ]
    : [
        { keywords: ['vomit', 'throwing up'], topic: 'Vomiting' },
        { keywords: ['eating', 'appetite'], topic: 'Loss of appetite' },
        { keywords: ['diarrhea'], topic: 'Diarrhea' },
        { keywords: ['missing', 'lost'], topic: 'Lost pet' },
        { keywords: ['scratching', 'itching'], topic: 'Scratching' },
        { keywords: ['lethargic', 'tired'], topic: 'Lethargy' },
      ];

  for (const c of concerns) {
    if (c.keywords.some(k => lower.includes(k))) {
      return { topic: c.topic, status: 'tracking' };
    }
  }

  return null;
}
