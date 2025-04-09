'use client'
import { useState } from 'react'
import * as XLSX from 'xlsx'
import { createClient } from '@supabase/supabase-js'

// Supabase client'ı oluştur
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// Progress type tanımı ekleyelim
type ProgressInfo = {
  current: number;
  total: number;
  percentage: number;
  type: 'topic' | 'sentiment' | 'cluster';
} | null;

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [excelData, setExcelData] = useState<any[]>([])
  const [fileName, setFileName] = useState<string>('')
  const [progressInfo, setProgressInfo] = useState<ProgressInfo>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setExcelData(jsonData);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const readExcelFile = async (file: File) => {
    const workbook = await XLSX.read(file, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(worksheet);
  };

  const handleUpload = async () => {
    if (!excelData.length) {
      alert('Lütfen önce bir Excel dosyası seçin!');
      return;
    }

    try {
      setLoading(true);
      const dataToInsert = excelData.map((row: any) => {
        // Tarih ve saat değerlerini güvenli bir şekilde işle
        let formattedDate = null;
        let formattedTime = null;

        if (row.Date) {
          try {
            // Excel'den gelen tarihi parse et
            const excelDate = new Date(row.Date);
            if (!isNaN(excelDate.getTime())) {
              formattedDate = excelDate.toISOString().split('T')[0];
            }
          } catch (e) {
            console.warn('Geçersiz tarih formatı:', row.Date);
          }
        }

        if (row.Time) {
          try {
            // Excel'den gelen saati parse et
            const excelTime = new Date(row.Time);
            if (!isNaN(excelTime.getTime())) {
              formattedTime = excelTime.toISOString().split('T')[1].split('.')[0];
            }
          } catch (e) {
            console.warn('Geçersiz saat formatı:', row.Time);
          }
        }
        
        return {
          date: formattedDate,
          time: formattedTime,
          title: row.Title || null,
          text: row.Text || null,
          sentiment: row.Sentiment || null,
          likes: row.Likes ? Number(row.Likes) : 0,
          comments: row.Comments ? Number(row.Comments) : 0,
          shares: row.Shares ? Number(row.Shares) : 0,
          views: row.Views ? Number(row.Views) : 0,
          engagement_rate: row.EngagementRate ? Number(row.EngagementRate) : 0,
          reach: row.Reach ? Number(row.Reach) : 0,
          impressions: row.Impressions ? Number(row.Impressions) : 0,
          click_through_rate: row.ClickThroughRate ? Number(row.ClickThroughRate) : 0,
          link_clicks: row.LinkClicks ? Number(row.LinkClicks) : 0,
          profile_visits: row.ProfileVisits ? Number(row.ProfileVisits) : 0,
          hashtag_count: row.HashtagCount ? Number(row.HashtagCount) : 0,
          mention_count: row.MentionCount ? Number(row.MentionCount) : 0,
          media_type: row.MediaType || null,
          platform: row.Platform || null,
          language: row.Language || null,
          location: row.Location || null,
          device_type: row.DeviceType || null,
          post_type: row.PostType || null,
          campaign_name: row.CampaignName || null,
          ad_spend: row.AdSpend ? Number(row.AdSpend) : 0,
          target_audience: row.TargetAudience || null,
          hashtags: row.Hashtags || null,
          mentions: row.Mentions || null,
          links: row.Links || null,
          topics: row.Topics || null,
          sentiment_score: row.SentimentScore ? Number(row.SentimentScore) : 0,
          sentiment_magnitude: row.SentimentMagnitude ? Number(row.SentimentMagnitude) : 0,
          cluster_id: row.ClusterId ? Number(row.ClusterId) : null,
          cluster_name: row.ClusterName || null,
          cluster_description: row.ClusterDescription || null,
          cluster_size: row.ClusterSize ? Number(row.ClusterSize) : 0,
          cluster_silhouette_score: row.ClusterSilhouetteScore ? Number(row.ClusterSilhouetteScore) : 0,
          cluster_centroid: row.ClusterCentroid || null,
          cluster_keywords: row.ClusterKeywords || null,
          cluster_sentiment: row.ClusterSentiment || null,
          cluster_engagement: row.ClusterEngagement ? Number(row.ClusterEngagement) : 0,
          cluster_trend: row.ClusterTrend || null,
          cluster_insights: row.ClusterInsights || null,
          cluster_recommendations: row.ClusterRecommendations || null
        };
      });

      const { error } = await supabase
        .from('social_media_posts')
        .insert(dataToInsert);

      if (error) throw error;
      alert('Veriler başarıyla yüklendi!');
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      alert('Veri yükleme sırasında bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const analyzeTopics = async () => {
    try {
      setLoading(true);
      const { data: documents } = await supabase
        .from('documents')
        .select('id, title, text');

      if (!documents?.length) {
        alert('Analiz edilecek döküman bulunamadı!');
        return;
      }

      setProgressInfo({
        current: 0,
        total: documents.length,
        percentage: 0,
        type: 'topic'
      });

      let analyzedCount = 0;
      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        
        const contentToAnalyze = doc.title 
          ? `Ana Post: ${doc.title}\nYorum: ${doc.text || ''}`
          : `Ana Post: ${doc.text}`;

        try {
          console.log(`Döküman ${i + 1}/${documents.length} topic analizi yapılıyor:`, contentToAnalyze);

          const response = await fetch('/api/topic', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: contentToAnalyze }),
            cache: 'no-store'
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${response.status} - ${errorData.error || 'Unknown error'}`);
          }

          const data = await response.json();
          console.log('Topic API Yanıtı:', data);

          if (!data.content) {
            throw new Error('API yanıtında content bulunamadı');
          }

          const topic = data.content;
          console.log('Belirlenen Topic:', topic);

          const { error: updateError } = await supabase
            .from('documents')
            .update({ topic: topic })
            .eq('id', doc.id);

          if (updateError) {
            throw updateError;
          }

          analyzedCount++;
          setProgressInfo(prev => ({
            current: analyzedCount,
            total: documents.length,
            percentage: (analyzedCount / documents.length) * 100,
            type: 'topic'
          }));

        } catch (error) {
          console.error(`Döküman topic analizi hatası (ID: ${doc.id}):`, error);
          continue;
        }
      }
      
      alert(`Topic analizi tamamlandı! ${analyzedCount} kayıt güncellendi.`);

    } catch (error) {
      console.error('Genel hata:', error);
      alert('Topic analizi sırasında bir hata oluştu!');
    } finally {
      setLoading(false);
      setProgressInfo(null);
    }
  };

  const analyzeSentiment = async () => {
    try {
      setLoading(true);
      const { data: documents } = await supabase
        .from('documents')
        .select('id, title, text');

      if (!documents?.length) {
        alert('Analiz edilecek döküman bulunamadı!');
        return;
      }

      setProgressInfo({
        current: 0,
        total: documents.length,
        percentage: 0,
        type: 'sentiment'
      });

      let analyzedCount = 0;
      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        
        const contentToAnalyze = doc.title 
          ? `Ana Post: ${doc.title}\nYorum: ${doc.text || ''}`
          : `Ana Post: ${doc.text}`;

        try {
          console.log(`Döküman ${i + 1}/${documents.length} sentiment analizi yapılıyor:`, contentToAnalyze);

          const response = await fetch('/api/sentiment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: contentToAnalyze }),
            cache: 'no-store'
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${response.status} - ${errorData.error || 'Unknown error'}`);
          }

          const data = await response.json();
          console.log('Sentiment API Yanıtı:', data);

          if (!data.content) {
            throw new Error('API yanıtında content bulunamadı');
          }

          const sentiment = data.content;
          console.log('Belirlenen Sentiment:', sentiment);

          const { error: updateError } = await supabase
            .from('documents')
            .update({ sentiment: sentiment })
            .eq('id', doc.id);

          if (updateError) {
            throw updateError;
          }

          analyzedCount++;
          setProgressInfo(prev => ({
            current: analyzedCount,
            total: documents.length,
            percentage: (analyzedCount / documents.length) * 100,
            type: 'sentiment'
          }));

        } catch (error) {
          console.error(`Döküman sentiment analizi hatası (ID: ${doc.id}):`, error);
          continue;
        }
      }
      
      alert(`Sentiment analizi tamamlandı! ${analyzedCount} kayıt güncellendi.`);

    } catch (error) {
      console.error('Genel hata:', error);
      alert('Sentiment analizi sırasında bir hata oluştu!');
    } finally {
      setLoading(false);
      setProgressInfo(null);
    }
  };

  const analyzeCluster = async () => {
    try {
      setLoading(true);
      const { data: documents } = await supabase
        .from('documents')
        .select('id, title, text');

      if (!documents?.length) {
        alert('Analiz edilecek döküman bulunamadı!');
        return;
      }

      setProgressInfo({
        current: 0,
        total: documents.length,
        percentage: 0,
        type: 'cluster'
      });

      let analyzedCount = 0;
      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        
        const contentToAnalyze = doc.title 
          ? `Ana Post: ${doc.title}\nYorum: ${doc.text || ''}`
          : `Ana Post: ${doc.text}`;

        try {
          console.log(`Döküman ${i + 1}/${documents.length} cluster analizi yapılıyor:`, contentToAnalyze);

          const response = await fetch('/api/cluster', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: contentToAnalyze }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          console.log('Cluster analizi sonucu:', result);

          const { error: updateError } = await supabase
            .from('documents')
            .update({ cluster: result.cluster })
            .eq('id', doc.id);

          if (updateError) {
            console.error('Supabase güncelleme hatası:', updateError);
            throw updateError;
          }

          analyzedCount++;
          setProgressInfo(prev => ({
            current: analyzedCount,
            total: documents.length,
            percentage: (analyzedCount / documents.length) * 100,
            type: 'cluster'
          }));
        } catch (error) {
          console.error(`Döküman ${i + 1} analiz edilirken hata oluştu:`, error);
        }
      }

      alert('Cluster analizi tamamlandı!');
    } catch (error) {
      console.error('Cluster analizi sırasında hata oluştu:', error);
      alert('Cluster analizi sırasında bir hata oluştu!');
    } finally {
      setLoading(false);
      setProgressInfo(null);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-2xl mb-8 text-center">Excel Yükle ve Analiz Et</h1>
        
        <div className="flex flex-col items-center gap-4">
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            className="mb-4"
          />
          
          {fileName && (
            <p className="text-green-500">Seçilen dosya: {fileName}</p>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleUpload}
              disabled={loading || !excelData.length}
              className={`px-4 py-2 rounded ${
                loading || !excelData.length
                  ? 'bg-gray-400'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
            >
              {loading ? 'Yükleniyor...' : 'Supabase\'e Aktar'}
            </button>

            <button
              onClick={analyzeTopics}
              disabled={loading}
              className={`px-4 py-2 rounded ${
                loading
                  ? 'bg-gray-400'
                  : 'bg-green-500 hover:bg-green-600'
              } text-white`}
            >
              {loading && progressInfo?.type === 'topic' 
                ? `Analiz: ${progressInfo.current}/${progressInfo.total}` 
                : 'Topic Analizi'}
            </button>

            <button
              onClick={analyzeSentiment}
              disabled={loading}
              className={`px-4 py-2 rounded ${
                loading
                  ? 'bg-gray-400'
                  : 'bg-purple-500 hover:bg-purple-600'
              } text-white`}
            >
              {loading && progressInfo?.type === 'sentiment' 
                ? `Analiz: ${progressInfo.current}/${progressInfo.total}` 
                : 'Sentiment Analizi'}
            </button>

            <button
              onClick={analyzeCluster}
              disabled={loading}
              className={`px-4 py-2 rounded ${
                loading
                  ? 'bg-gray-400'
                  : 'bg-teal-500 hover:bg-teal-600'
              } text-white`}
            >
              {loading && progressInfo?.type === 'cluster' 
                ? `Analiz: ${progressInfo.current}/${progressInfo.total}` 
                : 'Cluster Analizi'}
            </button>
          </div>

          {progressInfo && progressInfo.percentage > 0 && (
            <div className="w-full max-w-md">
              <div className="mb-2 flex justify-between text-sm">
                <span>
                  {progressInfo.type === 'topic' ? 'Topic Analizi' : progressInfo.type === 'sentiment' ? 'Sentiment Analizi' : 'Cluster Analizi'}: 
                  {' '}{progressInfo.current}/{progressInfo.total}
                </span>
                <span>{Math.round(progressInfo.percentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    progressInfo.type === 'topic' ? 'bg-green-600' : progressInfo.type === 'sentiment' ? 'bg-purple-600' : 'bg-teal-600'
                  }`}
                  style={{ width: `${progressInfo.percentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 