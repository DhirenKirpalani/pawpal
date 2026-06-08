import { NextRequest } from 'next/server';
import { openai } from '@/lib/ai/openai';
import { MODELS } from '@/lib/ai/models';
import { z } from 'zod';

type EmotionHint = 'worried' | 'anxious' | 'celebrating' | 'concerned' | 'calm' | null;

/* ── Zod schemas ── */
const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().max(2000),
});

const RequestSchema = z.object({
  messages: z.array(MessageSchema).max(20),
  petName: z.string().max(50).nullable().optional(),
  lang: z.enum(['en', 'id']),
  emotionalEntry: z.enum(['worried', 'checking', 'off', 'celebrate']).nullable().optional(),
  petType: z.enum(['cat', 'dog']).nullable().optional(),
  image: z.string().max(2_000_000).nullable().optional(), // base64 JPEG ≤1024px ≈ 200–400 KB
});

/* ── In-memory rate limiter ── */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute per IP

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count++;
  return { allowed: true };
}

/* ── Lightweight emotion detection from free-text ── */
function detectEmotionFromMessage(message: string, lang: 'en' | 'id'): EmotionHint {
  const lower = message.toLowerCase();

  if (lang === 'id') {
    if (lower.includes('senang') || lower.includes('bagus') || lower.includes('baik') || lower.includes('sembuh') || lower.includes('alhamdulillah')) return 'celebrating';
    if (lower.includes('khawatir') || lower.includes('takut') || lower.includes('panik') || lower.includes('cemas')) return 'worried';
    if (lower.includes('bingung') || lower.includes('tidak tahu') || lower.includes('gimana')) return 'concerned';
    if (lower.includes('tenang') || lower.includes('baik-baik')) return 'calm';
    return null;
  }

  if (lower.includes('celebrate') || lower.includes('great news') || lower.includes('happy') || lower.includes('recovered') || lower.includes('better now')) return 'celebrating';
  if (lower.includes('worried') || lower.includes('scared') || lower.includes('panicking') || lower.includes('terrified')) return 'worried';
  if (lower.includes('confused') || lower.includes('not sure') || lower.includes('don\'t know')) return 'concerned';
  if (lower.includes('calm') || lower.includes('fine') || lower.includes('okay')) return 'calm';
  return null;
}

/* ── Build emotion-aware system prompt ── */
function buildSystemPrompt(petName: string | null, petType: 'cat' | 'dog' | null, lang: 'en' | 'id', emotion: EmotionHint, hasImage?: boolean): string {
  const pet = petName || (lang === 'id' ? 'hewan peliharaannya' : 'their pet');
  const typeLabel = petType === 'cat'
    ? (lang === 'id' ? 'kucing' : 'cat')
    : petType === 'dog'
    ? (lang === 'id' ? 'anjing' : 'dog')
    : '';

  let emotionDirective = '';
  if (emotion === 'worried' || emotion === 'anxious') {
    emotionDirective = lang === 'id'
      ? 'User sedang KHAWATIR. Respon dengan tenang, meyakinkan, dan hangat. Jangan membuatnya semakin panik.'
      : 'The user is WORRIED. Respond calmly, reassuringly, and warmly. Do not escalate their fear.';
  } else if (emotion === 'celebrating') {
    emotionDirective = lang === 'id'
      ? 'User sedang SENANG / MERAYAKAN. Ikut senang! Respon dengan energi positif dan celebratory.'
      : 'The user is CELEBRATING. Match their energy! Be enthusiastic and joyful in your response.';
  } else if (emotion === 'concerned') {
    emotionDirective = lang === 'id'
      ? 'User BINGUNG / TIDAK YAKIN. Berikan penjelasan yang jelas, langkah demi langkah, tanpa jargon medis.'
      : 'The user is CONFUSED / UNSURE. Give clear, step-by-step guidance without medical jargon.';
  } else if (emotion === 'calm') {
    emotionDirective = lang === 'id'
      ? 'User TENANG. Respon dengan friendly dan conversational.'
      : 'The user is CALM. Keep it friendly and conversational.';
  }

  const visionDirective = hasImage && !petType
    ? (lang === 'id'
      ? 'GAMBAR DIKIRIM: User mengirimkan foto. LIHAT gambarnya dan identifikasi apakah itu kucing atau anjing. Jawab dengan menyebutkan jenis hewannya dan tanyakan konfirmasi dengan hangat.'
      : 'IMAGE PROVIDED: The user sent a photo. LOOK at the image and identify whether it\'s a cat or a dog. Acknowledge what you see and confirm warmly.')
    : hasImage
    ? (lang === 'id'
      ? 'GAMBAR DIKIRIM: Gunakan informasi visual dari foto untuk membantu user.'
      : 'IMAGE PROVIDED: Use the visual information from the photo to help the user.')
    : '';

  const typeDirective = typeLabel
    ? (lang === 'id'
      ? `HEWAN: ${pet} (${typeLabel}). Kasih saran yang spesifik buat ${typeLabel}, jangan salah kasih saran buat hewan lain.`
      : `PET: ${pet} (${typeLabel}). Tailor your advice specifically for ${typeLabel}s, not generic pet advice.`)
    : `HEWAN: ${pet}`;

  if (lang === 'id') {
    return `Kamu adalah PawPal, teman curhat soal kesehatan hewan peliharaan. Kamu BUKAN dokter hewan, kamu teman yang peduli dan berpengetahuan.

${emotionDirective}${visionDirective ? `

${visionDirective}` : ''}

GAYA BICARA:
- Kasual, hangat, seperti teman chat — bukan robot medis
- Pakai bahasa Indonesia sehari-hari (boleh campur "aku", "kamu", "dong", "ya", "sih", dll)
- SELALU akui perasaan user DULU sebelum kasih saran
- Paragraf pendek, 2-3 kalimat max per paragraf
- Akhiri dengan SATU pertanyaan lanjutan yang natural
- Jangan list panjang-panjang
- Jangan formal / kaku
- Kalau situasi serius → sarankan ke dokter hewan tapi tetap dengan nada caring, bukan menakut-nakuti

${typeDirective}

CONTOH GAYA YANG BENAR:
User: "dia gamau makan"
PawPal: "Aduh, itu bikin khawatir ya kalau ${pet} nggak mau makan sama sekali. Udah berapa lama ini terjadi?"

CONTOH GAYA YANG SALAH:
"Loss of appetite can indicate various conditions. Please monitor for: 1) vomiting 2) lethargy..."

PENTING: Selalu balas dalam Bahasa Indonesia. Jangan pernah balas dalam English kalau user nulis Indonesian.

SUMBER: Kalau kamu kasih saran soal kesehatan atau gizi hewan, tambahkan di baris TERAKHIR saja (setelah pertanyaan follow-up):
[Sources: NamaSource1 | NamaSource2]
Gunakan sumber terpercaya seperti: VCA Hospitals, PetMD, ASPCA, Cornell Feline Health Center, AKC. Cukup nama sumbernya saja, tanpa URL. Hanya tambahkan kalau relevan dengan saran medis/kesehatan.

FORMAT PENTING: [Sources: ...] harus di baris terpisah di akhir, jangan di tengah kalimat.`;
  }

  return `You are PawPal, a caring and knowledgeable pet health companion. NOT a medical system — a warm, supportive friend.

${emotionDirective}${visionDirective ? `

${visionDirective}` : ''}

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

Always match the emotional register of the user. If they're scared, be reassuring. If they're relieved, celebrate with them.

CITATIONS: When giving health or nutrition advice, append on the VERY LAST LINE (after your follow-up question):
[Sources: SourceName1 | SourceName2]
Use trusted sources: VCA Hospitals, PetMD, ASPCA, Cornell Feline Health Center, AKC. Names only, no URLs. Only include when genuinely relevant to medical/health advice. Keep it on its own line.`;
}

/* ── Concern extraction ── */
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

/* ── NDJSON stream helpers ── */
function sendChunk(controller: ReadableStreamDefaultController, payload: object) {
  controller.enqueue(new TextEncoder().encode(JSON.stringify(payload) + '\n'));
}

/* ── Main handler ── */
export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ type: 'error', message: `Rate limit exceeded. Try again in ${rateCheck.retryAfter}s.` }) + '\n',
        { status: 429, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Retry-After': String(rateCheck.retryAfter) } }
      );
    }

    // 2. Validate request body
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ type: 'error', message: 'Invalid request', details: parsed.error.flatten() }) + '\n',
        { status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
      );
    }

    const { messages, petName, lang, emotionalEntry, petType, image } = parsed.data;

    // 3. Detect emotion from latest user message (or use explicit emotionalEntry)
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    const detectedEmotion: EmotionHint = emotionalEntry
      ? (emotionalEntry === 'worried' || emotionalEntry === 'off' ? 'worried' : emotionalEntry === 'celebrate' ? 'celebrating' : 'calm')
      : detectEmotionFromMessage(lastUserMsg?.content || '', lang);

    const systemPrompt = buildSystemPrompt(petName ?? null, petType ?? null, lang, detectedEmotion, !!image);

    // 4. Build OpenAI messages (text-only or vision)
    const apiMessages: any[] = [{ role: 'system', content: systemPrompt }];

    for (const m of messages) {
      if (m.role === 'user' && image && m === lastUserMsg) {
        // Vision message for the latest user message with image
        apiMessages.push({
          role: 'user',
          content: [
            { type: 'text', text: m.content || 'Please look at this image and tell me what you see, especially if it\'s a cat or a dog.' },
            { type: 'image_url', image_url: { url: image, detail: 'auto' } },
          ],
        });
      } else {
        apiMessages.push({ role: m.role, content: m.content });
      }
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send emotion metadata immediately so UI can react
          if (detectedEmotion) {
            sendChunk(controller, { type: 'emotion', emotion: detectedEmotion });
          }

          const response = await openai.chat.completions.create({
            model: MODELS.CHAT,
            messages: apiMessages,
            temperature: 0.7,
            max_tokens: image ? 600 : 400, // more tokens for vision descriptions
            stream: true,
          });

          let fullText = '';
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullText += content;
              sendChunk(controller, { type: 'token', content });
            }
          }

          // Extract concern from full accumulated response
          const concern = detectConcernFromReply(fullText, lang);
          sendChunk(controller, { type: 'done', concern });

          controller.close();
        } catch (err) {
          console.error('Stream error:', err);
          sendChunk(controller, { type: 'error', message: 'Failed to generate response' });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Companion chat error:', error);
    return new Response(
      JSON.stringify({ type: 'error', message: 'Failed to respond' }) + '\n',
      { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  }
}
