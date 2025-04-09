import { NextResponse } from 'next/server';
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    console.log('Cluster analizi için gelen içerik:', content);

    if (!content) {
      console.error('İçerik boş');
      return NextResponse.json(
        { error: 'İçerik boş olamaz' },
        { status: 400 }
      );
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });

    const systemPrompt = `Sən cluster analiz toolusan. Yazılan mətnləri oxu və onları aşağıda yazlmış clusterlara görə cavabla. Cavabın sadəcə clusterin nömrəsini göstərsin. Cluster-lar:

Cluster 1. Misli.az və Digər Mərc Platformalarının Funksionallığı
Cluster 2. Mərc Strategiyaları və Proqnozlar
Cluster 3. Reklam və Təşviqi Kampaniyalar
Cluster 4. Bonus və Promosyonlar
Cluster 5. Azərlotereya və Lotereya Oyunları
Cluster 6. Azərbaycan Futbolu və İdman Xəbərləri
Cluster 7. Qumar Tənzimləməsi və Sosial Təsirləri
Cluster 8. Böyük Uduşlar və Uduş Təcrübələri
Cluster 9. Misli/Azərlotereya Şirkətləri ilə Bağlı Tənqidi Xəbərlər

Sadəcə cluster nömrəsini yaz. Məsələn: "1" və ya "2" və s.`;

    console.log('API isteği gönderiliyor...');

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

    console.log('API yanıtı:', msg);

    const cluster = msg.content[0].type === 'text' ? msg.content[0].text.trim() : '';
    console.log('Belirlenen cluster:', cluster);

    return NextResponse.json({
      content: cluster
    });

  } catch (error) {
    console.error('API Hatası:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' }, 
      { status: 500 }
    );
  }
} 