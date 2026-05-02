import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, Clock, FileText, Plus, ArrowRight, Wallet, Package, CheckCircle, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../supabase';

const EscrowScreen = ({ user, showToast }) => {
  const [transactions, setTransactions] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [newTx, setNewTx] = useState({ title: '', amount: '', seller: '' });

  const notify = (msg, type) => {
    if (showToast) showToast(msg, type);
    else alert(msg);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('escrow_transactions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        setTransactions(data);
        if (data.length > 0 && !selectedTx) setSelectedTx(data[0]);
      }
    } catch (e) { console.error(e); }
  };

  const handleCreateTx = async (e) => {
    e.preventDefault();
    if (!newTx.title || !newTx.amount || !newTx.seller) {
      notify('Lütfen tüm alanları doldurun!', 'error');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('escrow_transactions')
        .insert([{ 
          title: newTx.title, 
          amount: newTx.amount, 
          seller: newTx.seller,
          status: 0, 
          type: 'Manual'
        }])
        .select();

      if (error) {
        console.error('Supabase Error:', error);
        notify('Hata: ' + error.message, 'error');
      } else if (data) {
        setTransactions([data[0], ...transactions]);
        setSelectedTx(data[0]);
        setModalOpen(false);
        setNewTx({ title: '', amount: '', seller: '' });
        notify('Güvenli ödeme işlemi başarıyla başlatıldı!', 'success');
      }
    } catch (err) { 
      console.error('Catch Error:', err);
      notify('Bağlantı hatası oluştu!', 'error');
    }
    setLoading(false);
  };

  const updateStatus = async (newStatus) => {
    if (!selectedTx) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('escrow_transactions')
        .update({ status: newStatus })
        .eq('id', selectedTx.id);

      if (!error) {
        const updatedTx = { ...selectedTx, status: newStatus };
        setSelectedTx(updatedTx);
        setTransactions(transactions.map(t => t.id === selectedTx.id ? updatedTx : t));
        
        const messages = [
          'Sermaye başarıyla kilitlendi!',
          'Lojistik süreci başlatıldı, yük yolda!',
          'Teslimat onaylandı! Ödeme satıcıya aktarılıyor.',
          'İşlem başarıyla tamamlandı!'
        ];
        notify(messages[newStatus], 'success');
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const steps = [
    { title: 'Sermaye Kilitlendi', desc: 'Para güvenli havuzda bekliyor.', status: 0 },
    { title: 'Lojistik Süreci', desc: 'Yük araçta, yola çıktı.', status: 1 },
    { title: 'Teslimat Onayı', desc: 'Alıcıdan onay bekleniyor.', status: 2 },
    { title: 'Ödeme Transferi', desc: 'Para satıcının hesabına aktarıldı.', status: 3 },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="text-neon-blue" /> Güvenli Ödeme Takibi (Smart Escrow)
          </h2>
          <p className="text-slate-400 text-sm">Tüm ticari ödemelerinizi blockchain güvencesiyle yönetin.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchTransactions} className="p-3 bg-slate-800 text-slate-400 rounded-xl hover:text-white transition-all">
            <RefreshCw size={20} />
          </button>
          <button 
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-neon-blue text-slate-900 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all"
          >
            <Plus size={20} /> Yeni İşlem Başlat
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: TRANSACTION LIST */}
        <div className="lg:col-span-4 space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Aktif İşlemlerim</h3>
          {transactions.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-700/50">
              <p className="text-slate-500 text-sm italic">Henüz aktif bir işleminiz bulunmuyor.</p>
            </div>
          ) : (
            transactions.map((tx) => (
              <motion.div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className={`p-4 bg-slate-900/50 rounded-2xl border transition-all cursor-pointer ${
                  selectedTx?.id === tx.id ? 'border-neon-blue bg-neon-blue/5' : 'border-slate-700/50 hover:border-slate-600'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-200 text-sm truncate pr-2">{tx.title}</h4>
                  <span className={`shrink-0 text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                    tx.status === 3 ? 'bg-neon-green/20 text-neon-green' : 'bg-neon-orange/20 text-neon-orange'
                  }`}>
                    {tx.status === 3 ? 'TAMAMLANDI' : 'SÜREÇTE'}
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-xs text-slate-500 truncate max-w-[120px]">Satıcı: {tx.seller}</p>
                  <p className="text-sm font-black text-neon-blue">{tx.amount}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* RIGHT: SELECTED TRANSACTION DETAILS */}
        <div className="lg:col-span-8">
          {selectedTx ? (
            <div className="bg-slate-900/50 rounded-3xl overflow-hidden border border-slate-700/50 flex flex-col h-full shadow-2xl">
              <div className="p-8 border-b border-slate-700/50 flex items-center justify-between bg-slate-900/50">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="text-neon-blue" /> İşlem Detayı: #{selectedTx.id.slice(0, 8)}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">İşlem Tipi: {selectedTx.type} • Satıcı: {selectedTx.seller}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Güvence Altındaki Tutar</p>
                  <p className="text-2xl font-black text-neon-blue drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]">{selectedTx.amount}</p>
                </div>
              </div>

              <div className="p-8 flex-1">
                <div className="relative">
                  <div className="absolute left-6 top-1 bottom-1 w-[2px] bg-slate-700" />
                  <div className="space-y-10 relative">
                    {steps.map((step, i) => (
                      <div key={i} className="flex gap-8">
                        <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-all duration-500 ${
                          selectedTx.status >= step.status ? 'bg-neon-green/20 text-neon-green border border-neon-green/50 shadow-[0_0_15px_rgba(57,255,20,0.2)]' :
                          selectedTx.status + 1 === step.status ? 'bg-neon-orange text-slate-900 shadow-[0_0_20px_rgba(255,95,31,0.5)] animate-pulse' :
                          'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}>
                          {selectedTx.status >= step.status ? <CheckCircle2 size={24} /> : 
                           selectedTx.status + 1 === step.status ? <Clock size={24} /> : <FileText size={20} />}
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`font-bold ${selectedTx.status < step.status ? 'text-slate-500' : 'text-slate-200'}`}>
                              {step.title}
                            </h4>
                            {selectedTx.status === step.status && step.status < 3 && (
                              <button 
                                onClick={() => updateStatus(selectedTx.status + 1)}
                                disabled={loading}
                                className="px-4 py-1.5 bg-neon-green text-slate-900 rounded-lg text-[10px] font-black uppercase hover:shadow-[0_0_10px_rgba(57,255,20,0.5)] transition-all"
                              >
                                {loading ? 'İŞLENİYOR...' : 'BU ADIMI ONAYLA'}
                              </button>
                            )}
                          </div>
                          <p className={`text-sm ${selectedTx.status < step.status ? 'text-slate-600' : 'text-slate-400'}`}>
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-neon-blue/5 border-t border-neon-blue/20 flex items-center gap-4">
                <div className="p-3 bg-neon-blue/20 rounded-xl border border-neon-blue/50 text-neon-blue">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Lojitak Blockchain Koruması</p>
                  <p className="text-[10px] text-slate-400">Bu işlem Smart Contract ile şifrelenmiş olup, fonlar sistem garantisindedir.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-900/50 rounded-3xl border border-slate-700/50 p-12 text-center shadow-xl">
              <Package size={64} className="text-slate-700 mb-4" />
              <h3 className="text-xl font-bold text-slate-400">Detayları görmek için bir işlem seçin</h3>
              <p className="text-slate-600 text-sm mt-2 max-w-sm">Sol taraftaki listeden aktif işlemlerinizi yönetebilir veya yeni bir güvenli ödeme başlatabilirsiniz.</p>
            </div>
          )}
        </div>
      </div>

      {/* NEW TRANSACTION MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => setModalOpen(false)} 
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
            />
            <motion.form 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onSubmit={handleCreateTx}
              className="relative w-full max-w-md bg-slate-900 p-8 rounded-3xl border border-slate-700 space-y-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-neon-blue/20 rounded-lg text-neon-blue">
                  <Wallet size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">Yeni Güvenli Ödeme</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">İşlem Başlığı / Yük Adı</label>
                  <input required placeholder="Örn: Sanayi Tipi Kompresör" value={newTx.title} onChange={e => setNewTx({...newTx, title: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-neon-blue outline-none transition-all" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Tutar</label>
                    <input required placeholder="₺0.00" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-neon-blue outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Satıcı / Alıcı Firma</label>
                    <input required placeholder="ABC Ltd." value={newTx.seller} onChange={e => setNewTx({...newTx, seller: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-neon-blue outline-none transition-all" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 border border-slate-700 text-slate-400 rounded-xl font-bold hover:bg-slate-800 transition-all">İptal</button>
                <button type="submit" disabled={loading} className="flex-1 py-3 bg-neon-blue text-slate-900 rounded-xl font-bold hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all">
                  {loading ? 'Oluşturuluyor...' : 'İşlemi Başlat'}
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EscrowScreen;
