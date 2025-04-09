import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `Sən cluster analiz toolusan. Yazılan mətnləri oxu və onları aşağıda yazlmış clusterlara görə cavabla. Cavabın sadəcə clusterin nömrəsini göstərsin. Cluster-lar:

Cluster 1. Misli.az və Digər Mərc Platformalarının Funksionallığı, İstifadəçi Təcrübəsi və Hesab İdarəetməsi
Summary: Bu kateqoriya Misli.az və digər mərc platformalarının istifadəsi, texniki funksionallığı, xidmətləri, istifadəçi şikayətləri və təcrübələrini əhatə edir. İstifadəçilər platformaların işləmə problemləri, hesab açma, təsdiqlənmə, pul köçürmə/çıxarma çətinlikləri, hesabların bloklanması və ümumi texniki nasazlıqlar haqqında danışırlar. Eyni zamanda, hesab alqı-satqısı və kiçik məbləğdə borc istəkləri də bu kateqoriyanın vacib hissəsidir. 18 yaşdan aşağı şəxslərin təsdiqlənmiş hesab əldə etmə yolları, hesabların qiymətləri və etibarlılıq məsələləri də geniş müzakirə olunur. Həmçinin müxtəlif platformaların müqayisəsi, üstünlükləri və çatışmazlıqları da burada əks olunur.

Cluster 2. Mərc Strategiyaları, Kuponları, Proqnozlar və Kollektiv Təşəbbüslər
Summary: Bu kateqoriya mərc oyunları ilə bağlı bütün praktiki aspektləri əhatə edir: istifadəçilərin hazırladıqları və paylaşdıqları kuponlar, idman matçlarına dair proqnozlar, mərc strategiyaları, oyun analizləri, ödənişli VIP təkliflər və kollektiv lotereya təşəbbüsləri. İstifadəçilər öz kupon linklərini və yüksək əmsallı oyunları paylaşır, "gələr?", "tutar?" kimi sorğular verir, necə mərc qoymaq, hansı əmsalları seçmək, nə qədər məbləğ qoymaq və riskləri necə idarə etmək barədə məsləhətləşirlər. Həmçinin, özünü "ekspert" adlandıran şəxslərin VIP kupon satışları və WhatsApp qrupları vasitəsilə kollektiv lotereya alışı kimi təşəbbüslər də bu kateqoriyanın bir hissəsidir. Bu paylaşımlarda "kişi kimi", "düzgün", "adam başına" kimi ifadələr tez-tez istifadə olunur.

Cluster 3. Reklam və Təşviqi Kampaniyalar
Summary: Bu kateqoriyada Misli və digər mərc platformalarının reklam və promosyon paylaşımları yer alır. Misli.az-ın rəsmi sosial media hesablarından paylaşılan məlumatlar, idman matçları üçün təşviqat mesajları, "tətbiqi yüklə yukle.misli.az" kimi standart çağırışlar və xüsusi kampaniyalar haqqında elanlar yer alır. Həmçinin futbol matçları, turnir təşəbbüsləri və "dəqiq hesab" kimi xüsusi kampaniyalar da burada yer alır.

Cluster 4. Bonus və Promosyonlar
Summary: Bu kateqoriya mərc platformalarının təqdim etdiyi müxtəlif bonus və promosyonları əhatə edir. İstifadəçilər bonusların necə əldə edildiyi, hansı şərtlərlə verildiyini və bonus istifadə qaydalarını müzakirə edirlər. Xoş gəlmisiniz bonusları, ad günü bonusları, depozit bonusları və aktivlik bonusları kimi təkliflər, bonus məmnuniyyətsizliyi və platformaların bonusları verməməsi ilə bağlı şikayətlər də bu kateqoriyanın əsas məzmunudur.

Cluster 5. Azərlotereya və Lotereya Oyunları
Summary: Bu kateqoriya Azərbaycanın rəsmi lotereya təşkilatçısı olan "Azərlotereya" və onun təqdim etdiyi müxtəlif lotereya oyunları haqqında məlumatları və müzakirələri əhatə edir. "Beşdə 5", "4+4", "Super Keno" kimi tirajlı lotereyalar, "Poz-Qazan" kimi ani lotereya oyunları, nəticələr, qaydalar və uduşlar haqqında paylaşımlar burada yer alır. Həmçinin Azərlotereyanın təqdim etdiyi yeni oyunlar, lotereya qalibləri və böyük uduşlar haqqında xəbərlər də bu kateqoriyaya daxildir.

Cluster 6. Azərbaycan Futbolu və İdman Xəbərləri
Summary: Bu kateqoriyada Azərbaycan futbolu, xüsusilə Misli Premier Liqası (sponsorluq səbəbiylə bu adla tanınan Azərbaycan Premyer Liqası), klublar, matçlar, nəticələr və futbol dünyasındakı inkişaflar müzakirə olunur. AFFA (Azərbaycan Futbol Federasiyaları Assosiasiyası) ilə bağlı xəbərlər, xüsusilə idarəetmə təyinatları və qərarları, futbol matçlarının nəticələrinin "şübhəli" olması iddiaları və Misli sponsorluğunun Azərbaycan futboluna təsiri barədə müzakirələr də buraya daxildir.

Cluster 7. Qumar Tənzimləməsi, Asılılıq və Sosial Təsirləri
Summary: Bu kateqoriya mərc oyunları və qumarın sosial-hüquqi aspektlərini əhatə edir: yaratdığı asılılıq, sosial-psixoloji problemlər, iqtisadi təsirlər, qanuni və qeyri-qanuni fəaliyyətlər arasındakı fərqlər. Qumar və mərc oyunlarının mənfi təsirləri, ailələri dağıtması, gəncləri zəhərləməsi kimi ictimai problemlərin yanında, Misli və Topaz kimi platformaların "qanuni" qumar oyunları təklif etməsi ilə "qumar kralı" kimi tanınan şəxslərin həbs olunması arasındakı ziddiyyətlər də müzakirə olunur. İslam dini baxımından qumarın haram olması, müxtəlif ölkələrdəki qumar tənzimlənməsi təcrübəsinin müqayisəsi və rəsmi lisenziyalı şirkətlərin imtiyazlarına dair ikili standartların tənqidi bu kateqoriyanın əsas mövzularıdır.

Cluster 8. Böyük Uduşlar və Uduş Təcrübələri
Summary: Bu kateqoriya mərc platformalarında qazanılan böyük uduşlar, lotereya qalibləri və uduş təcrübələri haqqında paylaşımları əhatə edir. "Beşdə 5" kimi lotereya oyunlarında qazanılan 50.000 manatdan böyük uduşlar, Misli platformasında yazılan yüksək əmsallı kuponların uduşları və bu uduşların yaratdığı emosiyalar burada müzakirə olunur. Böyük uduşların qazanılma mexanizmi, qaliblərin kimliklərı və lotereya oyunlarının şəffaflığı ilə bağlı suallar və müzakirələr də bu kateqoriyaya daxildir.

Cluster 9. Misli/Azərlotereya Şirkətləri ilə Bağlı Tənqidi Xəbərlər
Summary: Bu kateqoriya Misli və Azərlotereya şirkətləri, onların idarəçiliyi və mübahisəli məsələləri ilə bağlı tənqidi xəbərləri əhatə edir. Azərlotereyanın idarəetməyə verildiyi "Demirören Holding" şirkətinin rəhbərlərinin həbs edilməsi, Azərlotereyanın sədr müşavirinin böyük məbləğdə lotereya udması iddiası, erməni bayrağı paylaşımı qalmaqalı və şirkətin rəhbərliyinə qarşı etik/siyasi tənqidlər bu kateqoriyanın əsas mövzularıdır. Həmçinin şirkətin vergi ödəmələri, Türkiyədəki siyasi hadisələrlə əlaqəsi və şəffaflıq məsələləri də burada müzakirə olunur.

Mətn: ${content}`
        }
      ]
    });

    const cluster = response.content[0].type === 'text' ? response.content[0].text.trim() : '';
    return NextResponse.json({ cluster });
  } catch (error) {
    console.error('Cluster analizi sırasında hata oluştu:', error);
    return NextResponse.json(
      { error: 'Cluster analizi sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
} 