import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, MapPin, ArrowRightLeft, ShieldCheck, 
  ArrowUpRight, X, Search 
} from 'lucide-react';
import { supabase } from '../supabase';

const IMGBB_API_KEY = '0b1eeb299a06bc1de5537afd171e7132';

const MarketplaceScreen = ({ user, userProfile, setSelectedOfferId, setScreen, DEADSTOCK_ITEMS }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('MARKET');
  const [myOffers, setMyOffers] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [offerModal, setOfferModal] = useState(null);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerNote, setOfferNote] = useState('');
  const [formData, setFormData] = useState({ name: '', quantity: '', location: '', value: '', category: 'Hammadde' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isOffering, setIsOffering] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('market_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error) setItems(data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchOffers = async () => {
    if (!user) return;
    const { data: sentOffers } = await supabase.from('offers').select('*').eq('from_user_id', user.id);
    const { data: myItems } = await supabase.from('market_items').select('id').eq('user_id', user.id);
    const itemIds = myItems?.map(i => i.id) || [];
    let incomingOffers = [];
    if (itemIds.length > 0) {
      const { data: received } = await supabase.from('offers').select('*').in('to_item_id', itemIds);
      if (received) incomingOffers = received;
    }
    setMyOffers([...(sentOffers || []), ...incomingOffers].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
  };

  useEffect(() => {
    fetchItems();
    fetchOffers();
    const sub = supabase.channel('market_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'market_items' }, fetchItems).subscribe();
    const offerSub = supabase.channel('offers_live').on('postgres_changes', { event: '*', schema: 'public', table: 'offers' }, fetchOffers).subscribe();
    return () => { 
      supabase.removeChannel(sub); 
      supabase.removeChannel(offerSub);
    };
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleAddListing = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let imageUrl = 'https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&q=80&w=400';
      if (imageFile) {
        setUploadProgress(20);
        const formDataImg = new FormData();
        formDataImg.append('image', imageFile);
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: formDataImg });
        setUploadProgress(80);
        const data = await res.json();
        if (data.success) imageUrl = data.data.url;
        setUploadProgress(100);
      }
      const { error } = await supabase.from('market_items').insert({
        user_id: user.id,
        name: formData.name,
        quantity: formData.quantity,
        location: formData.location,
        value: formData.value,
        category: formData.category,
        image: imageUrl
      });
      if (error) throw error;
      fetchItems();
      setModalOpen(false);
      setFormData({ name: '', quantity: '', location: '', value: '', category: 'Hammadde' });
      setImageFile(null); setImagePreview(null); setUploadProgress(0);
      alert("✅ İlan başarıyla yüklendi!");
    } catch (error) { alert("Hata: " + error.message); }
    finally { setUploading(false); }
  };

  const handleOffer = async (e) => {
    e.preventDefault();
    if (!user || !offerModal) return;
    setIsOffering(true);
    try {
      const { data: offerData, error: offerError } = await supabase.from('offers').insert({
        from_user_id: user.id,
        to_item_id: offerModal.id,
        item_name: offerModal.name,
        offer_type: 'swap',
        offer_note: offerNote,
        offer_amount: offerAmount,
        status: 'pending'
      }).select().single();
      if (offerError) throw offerError;
      
      if (offerModal.user_id) {
        await supabase.from('notifications').insert({
          user_id: offerModal.user_id,
          message: `${userProfile?.company_name || user.email} “${offerModal.name}” ilanınıza takas teklifi verdi!`,
          type: 'new_offer',
          reference_id: offerData.id
        });
      }
      setOfferModal(null); setOfferAmount(''); setOfferNote('');
      alert('✅ Takas teklifiniz başarıyla gönderildi!');
      fetchOffers();
    } catch (err) { alert('Hata: ' + err.message); }
    finally { setIsOffering(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
             <Package className="mr-2 text-neon-green" />
             Atıl Stok Pazarı
          </h2>
          <p className="text-slate-400 text-sm mt-1">Fabrikalar arası hammadde ve yan ürün takas platformu.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-slate-800 rounded-lg border border-slate-700">
            <button onClick={() => setActiveTab('MARKET')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'MARKET' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>Pazar</button>
            <button onClick={() => { setActiveTab('OFFERS'); fetchOffers(); }} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'OFFERS' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>Tekliflerim</button>
          </div>
          <button onClick={() => setModalOpen(true)} className="px-4 py-2 bg-neon-green text-slate-900 rounded-lg text-sm font-bold shadow-[0_0_10px_rgba(57,255,20,0.3)] hover:bg-neon-green/90 transition-all">İlan Yükle</button>
        </div>
      </div>

      {activeTab === 'MARKET' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              className="group glass rounded-2xl overflow-hidden hover:border-neon-blue/50 hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] transition-all">
              <div className="relative aspect-video overflow-hidden border-b border-slate-700">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100" />
                <div className="absolute top-2 left-2 px-2 py-1 bg-slate-900/80 backdrop-blur rounded text-[10px] font-bold text-neon-blue border border-neon-blue/30">{item.category}</div>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <h4 className="font-bold text-slate-200 truncate">{item.name}</h4>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1"><MapPin size={12} className="text-neon-orange" /> {item.location}</div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-black text-neon-green drop-shadow-[0_0_5px_rgba(57,255,20,0.5)]">{item.value}</p>
                  <p className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">{item.quantity}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/50 mt-2">
                  <button onClick={() => { setOfferAmount(''); setOfferNote(''); setOfferModal(item); }} className="py-2 text-[11px] font-bold border border-slate-600 text-slate-300 rounded-lg hover:bg-neon-orange/10 hover:border-neon-orange hover:text-neon-orange transition-colors flex items-center justify-center gap-1"><ArrowRightLeft size={14} /> Takas</button>
                  <button onClick={async () => {
                    try {
                      const { data } = await supabase.from('escrow_transactions').insert({
                        title: item.name, amount: item.value, seller: item.company_name || 'Bilinmeyen Satıcı',
                        buyer: userProfile?.company_name || user.email || 'Sistem Admin', status: 0, type: 'Marketplace'
                      }).select().single();
                      if (data) {
                        await supabase.from('notifications').insert({ user_id: user.id, message: `“${item.name}” için Güvenli Ödeme işlemi başlatıldı!`, type: 'escrow_started' });
                        setScreen('ESCROW');
                      }
                    } catch (e) { alert(e.message); }
                  }} className="py-2 text-[11px] font-bold bg-neon-blue/10 border border-neon-blue text-neon-blue rounded-lg hover:bg-neon-blue/20 hover:shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all flex items-center justify-center gap-1"><ShieldCheck size={14} /> Escrow</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {myOffers.length === 0 ? (
            <div className="p-12 glass rounded-3xl border border-dashed border-slate-700 text-center text-slate-400">Henüz teklif yok.</div>
          ) : myOffers.map((offer) => (
            <div key={offer.id} onClick={() => setSelectedOfferId(offer.id)}
              className="p-6 glass rounded-2xl border border-slate-700 flex justify-between items-center hover:border-neon-blue/50 cursor-pointer transition-all">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-slate-900 border ${offer.from_user_id === user.id ? 'text-neon-blue border-neon-blue/20' : 'text-neon-orange border-neon-orange/20'}`}>
                  <ArrowRightLeft size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white">{offer.item_name}</h4>
                  <p className="text-xs text-slate-500">{offer.offer_amount} teklif edildi</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${offer.status === 'pending' ? 'text-neon-orange border-neon-orange/30' : 'text-neon-green border-neon-green/30'}`}>{offer.status.toUpperCase()}</span>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Yeni İlan Yükle</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddListing} className="space-y-4">
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-neon-green/50 transition-colors overflow-hidden relative">
                {imagePreview ? <img src={imagePreview} alt="Önizleme" className="w-full h-full object-cover" /> : <div className="text-slate-500 text-xs">Görsel seçmek için tıkla</div>}
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              <input required type="text" placeholder="Ürün Adı" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white" />
              <div className="grid grid-cols-2 gap-4">
                <input required type="text" placeholder="Miktar" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white" />
                <input required type="text" placeholder="Değer" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white" />
              </div>
              <button type="submit" disabled={uploading} className="w-full py-3 bg-neon-green text-slate-900 font-bold rounded-xl disabled:opacity-50">{uploading ? `Yükleniyor... %${uploadProgress}` : 'Pazara Ekle'}</button>
            </form>
          </motion.div>
        </div>
      )}

      {offerModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-800 border border-neon-orange/30 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">Takas Teklifi Gönder</h3>
              <button onClick={() => setOfferModal(null)} className="text-slate-400 hover:text-white"><X size={18}/></button>
            </div>
            <form onSubmit={handleOffer} className="space-y-4">
              <input required type="text" value={offerAmount} onChange={e => setOfferAmount(e.target.value)} placeholder="Teklif Edilen Mal/Değer" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white" />
              <textarea value={offerNote} onChange={e => setOfferNote(e.target.value)} placeholder="Notunuz (Opsiyonel)" rows={3} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white resize-none" />
              <button type="submit" disabled={isOffering} className="w-full py-3 bg-neon-orange text-slate-900 font-bold rounded-xl disabled:opacity-50">{isOffering ? 'Teklif Gönderiliyor...' : 'Takas Teklifini Gönder'}</button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceScreen;
