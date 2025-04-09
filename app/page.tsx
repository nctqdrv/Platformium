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
  type: 'topic' | 'sentiment' | 'cluster' | null;
};

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [excelData, setExcelData] = useState<any[]>([])
  const [fileName, setFileName] = useState<string>('')
  const [progressInfo, setProgressInfo] = useState<ProgressInfo>({
    current: 0,
    total: 0,
    percentage: 0,
    type: null
  });

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

  const handleUpload = async () => {
    try {
      setLoading(true);
      let successCount = 0;
      let errorCount = 0;

      // Supabase bağlantısını kontrol et
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('Excel veri sayısı:', excelData.length);

      // İlk satırı kontrol et
      if (excelData.length > 0) {
        console.log('Excel sütunları:', Object.keys(excelData[0]));
      }

      for (const row of excelData) {
        try {
          // Tarih formatını düzeltme
          let formattedDate = null;
          let formattedSavedAt = null;

          if (row.Date) {
            // DD.MM.YYYY formatındaki tarihi YYYY-MM-DD formatına çevirme
            const [day, month, year] = row.Date.split('.');
            formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          }

          if (row["Saved at"]) {
            // DD.MM.YYYY HH:mm formatındaki tarihi ISO formatına çevirme
            const [datePart, timePart] = row["Saved at"].split(' ');
            const [day, month, year] = datePart.split('.');
            formattedSavedAt = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}:00Z`;
          }

          // Veriyi hazırla
          const dataToInsert = {
            date: formattedDate,
            time: row.Time || null,
            saved_at: formattedSavedAt,
            title: row.Title || null,
            text: row.Text || null,
            post_type: row["Post type"] || null,
            content_types: row["Content Types"] || null,
            source_specific_format: row["Source specific format"] ? parseFloat(row["Source specific format"]) : null,
            url: row.URL || null,
            sentiment: row.Sentiment || null,
            author: row.Author || null,
            nickname: row.Nickname || null,
            profile: row.Profile || null,
            subscribers: row.Subscribers ? parseFloat(row.Subscribers) : null,
            demography: row.Demography || null,
            age: row.Age ? parseFloat(row.Age) : null,
            source: row.Source || null,
            publication_place: row["Publication place"] || null,
            publication_place_profile: row["Publication place profile"] || null,
            publication_place_subscribers: row["Publication place subscribers"] ? parseFloat(row["Publication place subscribers"]) : null,
            resource_type: row["Resource type"] || null,
            language: row.Language || null,
            country: row.Country || null,
            regions: row.Regions || null,
            city: row.City || null,
            notes: row.Notes ? parseFloat(row.Notes) : null,
            reactions: row.Reactions ? parseFloat(row.Reactions) : null,
            engagement: row.Engagement ? parseFloat(row.Engagement) : null,
            likes: row.Likes ? parseFloat(row.Likes) : null,
            love: row.Love ? parseFloat(row.Love) : null,
            haha: row.Haha ? parseFloat(row.Haha) : null,
            wow: row.Wow ? parseFloat(row.Wow) : null,
            sad: row.Sad ? parseFloat(row.Sad) : null,
            angry: row.Angry ? parseFloat(row.Angry) : null,
            care: row.Care ? parseFloat(row.Care) : null,
            dislikes: row.Dislikes ? parseFloat(row.Dislikes) : null,
            comments: row.Comments ? parseFloat(row.Comments) : null,
            reposts: row.Reposts ? parseFloat(row.Reposts) : null,
            views: row.Views ? parseFloat(row.Views) : null,
            impressions_owned_posts: row["Impressions (owned posts)"] ? parseFloat(row["Impressions (owned posts)"]) : null,
            reach_owned_posts: row["Reach (owned posts)"] ? parseFloat(row["Reach (owned posts)"]) : null,
            saves: row.Saves ? parseFloat(row.Saves) : null,
            potential_reach: row["Potential reach"] ? parseFloat(row["Potential reach"]) : null,
            rating: row.Rating ? parseFloat(row.Rating) : null,
            image_url: row["Image URL"] || null,
            assigned_to: row["Assigned to"] ? parseFloat(row["Assigned to"]) : null,
            processed: row.Processed || null,
            aspects: row.Aspects ? parseFloat(row.Aspects) : null,
            subjects: row.Subjects || null,
            auto_categories: row["Auto-categories"] ? parseFloat(row["Auto-categories"]) : null,
            trend: row.Trend ? parseFloat(row.Trend) : null,
            tags: row.Tags ? parseFloat(row.Tags) : null,
            test: row.test ? parseFloat(row.test) : null
          };

          console.log('İşlenecek veri:', dataToInsert);

          const { data, error } = await supabase
            .from('documents')
            .insert([dataToInsert])
            .select();

          if (error) {
            console.error('Satır yükleme hatası:', error.message);
            console.error('Hata detayları:', error.details);
            console.error('Hata kodu:', error.code);
            errorCount++;
          } else {
            console.log('Başarılı yükleme:', data);
            successCount++;
          }
        } catch (error) {
          console.error('Satır işleme hatası:', error);
          errorCount++;
        }
      }

      alert(`Yükleme tamamlandı!\nBaşarılı: ${successCount}\nBaşarısız: ${errorCount}\n\nHata detayları için konsolu kontrol edin.`);
    } catch (error) {
      console.error('Genel yükleme hatası:', error);
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
            ...prev,
            current: analyzedCount,
            percentage: (analyzedCount / documents.length) * 100
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
      setProgressInfo({
        current: 0,
        total: 0,
        percentage: 0,
        type: null
      });
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
            ...prev,
            current: analyzedCount,
            percentage: (analyzedCount / documents.length) * 100
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
      setProgressInfo({
        current: 0,
        total: 0,
        percentage: 0,
        type: null
      });
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
            ...prev,
            current: analyzedCount,
            percentage: (analyzedCount / documents.length) * 100
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
              {loading && progressInfo.type === 'topic' 
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
              {loading && progressInfo.type === 'sentiment' 
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
              {loading && progressInfo.type === 'cluster' 
                ? `Analiz: ${progressInfo.current}/${progressInfo.total}` 
                : 'Cluster Analizi'}
            </button>
          </div>

          {progressInfo.percentage > 0 && (
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