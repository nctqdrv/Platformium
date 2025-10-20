import { NextResponse } from 'next/server';
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    console.log('Gelen içerik:', content);

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });

    const systemPrompt = `Verilən mətnləri diqqətlə təhlil et. Bu şərhdə təsvir edilən mövzunu (topic) və aid olduğu başlığı dəqiq müəyyən etmək lazımdır. 

Xüsusilə aşağıdakı kateqoriyalara diqqət yetir: 
1. Misli, Azərlotereya, mərc, qumar kimi terminlərə;
2. Oynamaq, yazmaq, proqnoz, nəticə, matç, oyun kimi oyunla əlaqəli sözlərə;
3. Pul, qazanmaq, uduş, məbləğ, hesab, ödəniş, balans kimi maliyyə terminlərinə;
4. Rəsmi, sayt, platforma, qeydiyyat, giriş kimi texniki terminlərə.

Şərhi aşağıdakı kriteriyalar əsasında təhlil et:
- Mərc platforması və ya lotereya xidmətləri haqqında danışılırmı?
- Hesab, balans, pul çıxarışı və ya ödənişlə bağlı məsələlər qeyd edilirmi?
- Misli.az, Azərlotereya və ya digər əlaqəli platformalara istinad edilirmi?
- Mərc oyunları, mərclər, uduşlar və ya itkilər haqqında danışılırmı?
- Rəsmi sayt və ya platformalar müqayisə edilirmi?

Şərhin mövzusunu (topic-ini) maksimum 2-3 sözdən ibarət qısa formada təyin et.
Cavabını yalnız mövzu (topic) sözlərindən ibarət et, əlavə izahat vermə.

Məsələn:
- Misli | Hesab (hesabla əlaqəli şərhlər üçün)
- Azərlotereya | Oyun proqnozu (mərc proqnozları üçün)
- Azərlotereya | rəsmilik (platforma statusu haqqında şərhlər üçün)
- Misli | Ödəniş problemi (maliyyə əməliyyatları ilə bağlı şərhlər üçün)
- Azərlotereya | Mərc strategiyası (oyun strategiyaları haqqında şərhlər üçün)

ÖNƏMLİ QAYDALAR:
1. Əgər yazılan mövzu yuxarıdakılardan heç biri ilə əlaqəli deyilsə, o zaman mütləq "Əlaqəsiz" cavabını ver.
2. Cavabların daxilində bahis sözündən istifadə etmə, onun yerinə mərc sözünü istifadə et.
3. Əgər yazılarda Cahangir Fərəcullayev, Dilarə Bəylərova, Burak Karadaö, Emir Türkmen, Serkan Şener adları istifadə olunubsa, o zaman "Azərlotereya | Rəhbərlik" cavabını ver.`;

    console.log('API isteği gönderiliyor...');

    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 8000,
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

    console.log('API yanıtı:', msg);

    const topic = msg.content[0].type === 'text' ? msg.content[0].text.trim() : '';
    console.log('Çıkarılan topic:', topic);

    return NextResponse.json({
      content: topic
    });

  } catch (error) {
    console.error('API Hatası:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' }, 
      { status: 500 }
    );
  }
}
