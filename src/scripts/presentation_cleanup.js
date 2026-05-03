import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://joropqkkmfhyatzoixoz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvcm9wcWtrbWZoeWF0em9peG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MTkwNzcsImV4cCI6MjA5MzI5NTA3N30.qmv9TUYeb7bK5BmreD7lW31tuiOq2ZVylG_3fH8szlg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function clearDatabase() {
  console.log('--- SUNUM ÖNCESİ VERİ TEMİZLİĞİ BAŞLIYOR ---');
  
  try {
    // 1. Tüm İlanları Sil
    const { error: marketError } = await supabase
      .from('market_items')
      .delete()
      .gte('created_at', '1970-01-01');
    if (!marketError) console.log('✅ market_items temizlendi');

    // 2. Tüm Teklifleri Sil
    const { error: offersError } = await supabase
      .from('offers')
      .delete()
      .gte('created_at', '1970-01-01');
    if (!offersError) console.log('✅ offers temizlendi');

    // 3. Tüm Güvenli Ödemeleri Sil
    const { error: escrowError } = await supabase
      .from('escrow_transactions')
      .delete()
      .gte('created_at', '1970-01-01');
    if (!escrowError) console.log('✅ escrow_transactions temizlendi');

    // 4. Tüm Bildirimleri Sil
    const { error: notifError } = await supabase
      .from('notifications')
      .delete()
      .gte('created_at', '1970-01-01');
    if (!notifError) console.log('✅ notifications temizlendi');

    console.log('--- TÜM VERİLER BAŞARIYLA SİLİNDİ. SUNUM İÇİN HAZIR! ---');
  } catch (e) {
    console.error('Kritik Hata:', e);
  }
}

clearDatabase();
