import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://joropqkkmfhyatzoixoz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvcm9wcWtrbWZoeWF0em9peG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MTkwNzcsImV4cCI6MjA5MzI5NTA3N30.qmv9TUYeb7bK5BmreD7lW31tuiOq2ZVylG_3fH8szlg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fixExistingItems() {
  console.log('--- MEVCUT İLANLAR DÜZELTİLİYOR ---');
  
  try {
    const { data: items, error: fetchError } = await supabase
      .from('market_items')
      .select('*');
      
    if (fetchError) throw fetchError;

    for (const item of items) {
      const newQuantity = item.quantity.toLowerCase().includes('kg') ? item.quantity : `${item.quantity} kg`;
      const newValue = item.value.toLowerCase().includes('tl') ? item.value : `${item.value} TL`;
      
      const { error: updateError } = await supabase
        .from('market_items')
        .update({ quantity: newQuantity, value: newValue })
        .eq('id', item.id);
        
      if (!updateError) {
        console.log(`✅ Düzenlendi: ${item.name} -> ${newQuantity}, ${newValue}`);
      }
    }

    console.log('--- TÜM MEVCUT VERİLER GÜNCELLENDİ ---');
  } catch (e) {
    console.error('Hata:', e);
  }
}

fixExistingItems();
