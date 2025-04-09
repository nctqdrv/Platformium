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
      console.log('Excel verisi:', excelData);
      
      const dataToInsert = excelData.map((row: any) => {
        // Tarih ve saat değerlerini güvenli bir şekilde işle
        let formattedDate = null;
        let formattedTime = null;
        let formattedSavedAt = null;

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

        if (row["Saved at"]) {
          try {
            // Excel'den gelen kaydedilme tarihini parse et
            const excelSavedAt = new Date(row["Saved at"]);
            if (!isNaN(excelSavedAt.getTime())) {
              formattedSavedAt = excelSavedAt.toISOString();
            }
          } catch (e) {
            console.warn('Geçersiz kaydedilme tarihi formatı:', row["Saved at"]);
          }
        }
        
        const processedRow = {
          date: formattedDate,
          time: formattedTime,
          saved_at: formattedSavedAt,
          title: row.Title || null,
          text: row.Text || null,
          post_type: row["Post type"] || null,
          content_types: row["Content Types"] || null,
          source_specific_format: row["Source specific format"] ? parseFloat(row["Source specific format"]) : null,
          url: row.URL || null,
          sentiment: row.Sentiment || null,
          topic: row.Topic || null,
          cluster: row.Cluster || null,
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

        console.log('İşlenmiş satır:', processedRow);
        return processedRow;
      });

      console.log('Supabase\'e gönderilecek veri:', dataToInsert);
      
      // Verileri küçük gruplar halinde gönder
      const batchSize = 100;
      for (let i = 0; i < dataToInsert.length; i += batchSize) {
        const batch = dataToInsert.slice(i, i + batchSize);
        const { data, error } = await supabase
          .from('documents')
          .insert(batch)
          .select();

        if (error) {
          console.error('Supabase hatası:', error);
          console.error('Hata detayları:', error.details);
          console.error('Hata kodu:', error.code);
          throw error;
        }

        console.log(`Batch ${i / batchSize + 1} yüklendi:`, data);
      }

      alert('Veriler başarıyla yüklendi!');
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      console.error('Hata tipi:', typeof error);
      console.error('Hata mesajı:', error instanceof Error ? error.message : 'Bilinmeyen hata');
      alert('Veri yükleme sırasında bir hata oluştu! Lütfen konsolu kontrol edin.');
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
            cache: 'no-store'
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${response.status} - ${errorData.error || 'Unknown error'}`);
          }

          const data = await response.json();
          console.log('Cluster API Yanıtı:', data);

          if (!data.content) {
            throw new Error('API yanıtında content bulunamadı');
          }

          const cluster = data.content;
          console.log('Belirlenen Cluster:', cluster);

          const { error: updateError } = await supabase
            .from('documents')
            .update({ cluster: cluster })
            .eq('id', doc.id);

          if (updateError) {
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
          console.error(`Döküman cluster analizi hatası (ID: ${doc.id}):`, error);
          continue;
        }
      }
      
      alert(`Cluster analizi tamamlandı! ${analyzedCount} kayıt güncellendi.`);

    } catch (error) {
      console.error('Genel hata:', error);
      alert('Cluster analizi sırasında bir hata oluştu!');
    } finally {
      setLoading(false);
      setProgressInfo(null);
    }
  };

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h1 className="text-center mb-4 text-primary">Excel Faylını Yüklə və Analiz Et</h1>
              
              <div className="mb-4">
                <div className="input-group">
                  <input
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileChange}
                    className="form-control"
                    id="excelFile"
                    placeholder="Fayl seçin..."
                  />
                  <label className="input-group-text bg-light border-0" htmlFor="excelFile">
                    <i className="bi bi-file-earmark-excel text-primary"></i>
                  </label>
                </div>
                
                {fileName && (
                  <div className="alert alert-success mt-2 mb-0 border-0">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    Seçilmiş fayl: {fileName}
                  </div>
                )}
              </div>

              <div className="d-flex flex-column gap-3">
                <button
                  onClick={handleUpload}
                  disabled={loading || !excelData.length}
                  className={`btn btn-outline-primary btn-sm ${loading || !excelData.length ? 'disabled' : ''}`}
                >
                  <i className="bi bi-cloud-upload me-2"></i>
                  {loading ? 'Yüklənir...' : 'Supabase\'ə Yüklə'}
                </button>

                <div className="d-flex justify-content-between gap-2">
                  <button
                    onClick={analyzeTopics}
                    disabled={loading}
                    className={`btn btn-outline-success flex-grow-1 ${loading ? 'disabled' : ''}`}
                  >
                    <i className="bi bi-tags me-2"></i>
                    {loading && progressInfo?.type === 'topic' 
                      ? `Analiz: ${progressInfo.current}/${progressInfo.total}` 
                      : 'Mövzu Analizi'}
                  </button>

                  <button
                    onClick={analyzeSentiment}
                    disabled={loading}
                    className={`btn btn-outline-info flex-grow-1 ${loading ? 'disabled' : ''}`}
                  >
                    <i className="bi bi-emoji-smile me-2"></i>
                    {loading && progressInfo?.type === 'sentiment' 
                      ? `Analiz: ${progressInfo.current}/${progressInfo.total}` 
                      : 'Emosional Analiz'}
                  </button>

                  <button
                    onClick={analyzeCluster}
                    disabled={loading}
                    className={`btn btn-outline-warning flex-grow-1 ${loading ? 'disabled' : ''}`}
                  >
                    <i className="bi bi-diagram-3 me-2"></i>
                    {loading && progressInfo?.type === 'cluster' 
                      ? `Analiz: ${progressInfo.current}/${progressInfo.total}` 
                      : 'Klaster Analizi'}
                  </button>
                </div>
              </div>

              {progressInfo && progressInfo.percentage > 0 && (
                <div className="mt-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted small">
                      <i className={`bi me-2 ${
                        progressInfo.type === 'topic' ? 'bi-tags text-success' : 
                        progressInfo.type === 'sentiment' ? 'bi-emoji-smile text-info' : 
                        'bi-diagram-3 text-warning'
                      }`}></i>
                      {progressInfo.type === 'topic' ? 'Mövzu Analizi' : 
                       progressInfo.type === 'sentiment' ? 'Emosional Analiz' : 
                       'Klaster Analizi'}: {progressInfo.current}/{progressInfo.total}
                    </span>
                    <span className="text-muted small">{Math.round(progressInfo.percentage)}%</span>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div
                      className={`progress-bar progress-bar-striped progress-bar-animated ${
                        progressInfo.type === 'topic' ? 'bg-success' : 
                        progressInfo.type === 'sentiment' ? 'bg-info' : 
                        'bg-warning'
                      }`}
                      role="progressbar"
                      style={{ width: `${progressInfo.percentage}%` }}
                      aria-valuenow={progressInfo.percentage}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 