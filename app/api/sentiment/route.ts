import { NextResponse } from 'next/server';
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    console.log('Sentiment analizi için gelen içerik:', content);

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });

    const systemPrompt = `Aşağıdakı mətnləri diqqətlə təhlil et. Həm title, həm də text bölmələrini ayrı-ayrılıqda və bir-biri ilə əlaqəli şəkildə analiz et. Xüsusilə "Misli", "Azərlotereya", "mərc", "oynamaq", "yazmaq", "pul", "qazanmaq", "uduş", "məbləğ", "hesab", "ödəniş", "balans" və s. kimi terminlərə diqqət yetir.

Aşağıdakı hallarda mətni Misli və ya Azərlotereya ilə əlaqəli hesab et:
1. Title və ya text-də birbaşa "Misli" və ya "Azərlotereya" adları çəkilirsə
2. Mərc platforması, oyun və ya lotereya xidmətləri haqqında danışılırsa
3. Hesab, balans, pul çıxarışı və ya ödənişlə bağlı məsələlər qeyd edilirsə
4. Misli.az və ya digər əlaqəli platformalara istinad edilirsə
5. Mərc oyunları, bahislər, uduşlar və ya itirilər haqqında danışılırsa
6. Title Misli ilə əlaqəlidirsə və text title-a aid fikirləri əks etdirirsə

Nəticəni aşağıdakı formada təqdim et:
- Əlaqəli: müsbət (mətn Misli/Azərlotereya ilə əlaqəlidir və müsbət emosiya daşıyır)
- Əlaqəli: neytral (mətn Misli/Azərlotereya ilə əlaqəlidir və neytral emosiya daşıyır)
- Əlaqəli: mənfi (mətn Misli/Azərlotereya ilə əlaqəlidir və mənfi emosiya daşıyır)
- Əlaqəsiz (mətn Misli/Azərlotereya ilə heç bir əlaqəsi yoxdur)

Sadəcə bir sözlə cavab ver: müsbət, neytral, mənfi və ya əlaqəsiz.`;

    const msg = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 20000,
      temperature: 0.2,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: content
            }
          ]
        }
      ]
    });

    console.log('Sentiment API yanıtı:', msg);

    const sentiment = msg.content[0].text.trim();
    console.log('Belirlenen sentiment:', sentiment);

    return NextResponse.json({
      content: sentiment
    });

  } catch (error) {
    console.error('API Hatası:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' }, 
      { status: 500 }
    );
  }
} 