import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Truck, Package, User, Building2,
  Weight, CheckCircle2, ArrowRight, AlertTriangle,
  ShieldCheck, CreditCard
} from 'lucide-react';
import { supabase } from '../supabase';

const ReservationModal = ({ user, truck, origin, destination, userProfile, onClose, showToast, setScreen }) => {
  const freeKg = truck.total_capacity - truck.current_occupancy;
  const freePct = Math.round((freeKg / truck.total_capacity) * 100);

  const [form, setForm] = useState({
    company: userProfile?.company_name || '',
    contact: userProfile?.contact_name || '',
    phone: userProfile?.phone || '',
    cargo: '',
    weight: '',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const weightNum = parseInt(form.weight) || 0;
  const isOverLimit = weightNum > freeKg;
  const isValid = form.company && form.cargo && form.weight && !isOverLimit && weightNum > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    
    try {
      // 0. Bakiye Kontrolü (Önceden Yapılmalı)
      const amountValue = truck.base_price;
      const currentSavings = userProfile?.total_savings || 0;

      if (currentSavings < amountValue) {
        showToast?.(`Yetersiz bakiye! Bu işlem için ₺${amountValue.toLocaleString()} gereklidir.`, 'error');
        setLoading(false);
        return;
      }

      // 1. Escrow İşlemi Oluştur (Ödeme Takibi İçin)
      const { error: escrowError } = await supabase
        .from('escrow_transactions')
        .insert([{
          title: `Lojistik: ${truck.plate} (${origin} - ${destination}) - ${form.cargo}`,
          amount: truck.base_price,
          seller: truck.company,
          buyer: userProfile?.company_name || 'Misafir Şirket',
          status: 0,
          type: 'logistics'
        }]);

      if (escrowError) throw escrowError;

      // 2. Tır Doluluk Oranını GÜNCELLE (Real-time Sync)
      // Mevcut manifestoları al ve yeni şirketi ekle
      let currentManifests = [];
      try {
        currentManifests = typeof truck.manifests === 'string' ? JSON.parse(truck.manifests) : (truck.manifests || []);
      } catch { currentManifests = []; }

      const updatedManifests = [
        ...currentManifests,
        { company: form.company, weight: weightNum, cargo: form.cargo }
      ];

      const { error: updateError } = await supabase
        .from('active_trucks')
        .update({
          current_occupancy: truck.current_occupancy + weightNum,
          manifests: JSON.stringify(updatedManifests)
        })
        .eq('id', truck.id);

      if (updateError) throw updateError;
      
      // 3. CÜZDAN ENTEGRASYONU (Ödeme Başlatma)
      // Bakiyeyi düş
      await supabase.from('users').update({ 
        total_savings: currentSavings - amountValue 
      }).eq('id', user.id);
      
      // İşlem kaydı (Transactions tablosu)
      await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'Giden',
        label: `Lojistik Ödemesi Başlatıldı: ${truck.plate}`,
        amount: amountValue,
        status: 'completed'
      });

      await new Promise(r => setTimeout(r, 800));
      setLoading(false);
      setSubmitted(true);
      showToast?.('Rezervasyon ve Ödeme Kaydı Oluşturuldu!', 'success');
    } catch (err) {
      console.error(err);
      setLoading(false);
      showToast?.('İşlem sırasında bir hata oluştu.', 'error');
    }
  };

  const handleGoToEscrow = () => {
    onClose();
    if (setScreen) setScreen('ESCROW');
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 20 }}
        className="relative w-full max-w-lg bg-[#0D1B2A] border border-neon-blue/20 rounded-3xl shadow-[0_0_60px_rgba(0,240,255,0.08)] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-neon-blue/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neon-blue/20 rounded-xl border border-neon-blue/30">
              <Truck className="w-5 h-5 text-neon-blue" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Hızlı Rezervasyon</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                {truck.brand} {truck.model} · {truck.plate}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Rota Bandı */}
        <div className="mx-6 mt-5 p-4 bg-white/[0.02] rounded-2xl border border-white/5 flex items-center justify-between">
          <div className="text-center">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">KALKIŞ</p>
            <p className="text-sm font-black text-white">{origin}</p>
            <p className="text-[10px] text-neon-blue font-bold mt-0.5">{truck.departure_time}</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] text-slate-600 font-black">{truck.distance_km} km</span>
            <div className="flex items-center gap-1">
              <div className="w-6 h-px bg-slate-700" />
              <ArrowRight className="w-3.5 h-3.5 text-neon-blue" />
              <div className="w-6 h-px bg-slate-700" />
            </div>
            <span className="text-[9px] text-slate-600 font-black">{truck.travel_hours} saat</span>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">VARIŞ</p>
            <p className="text-sm font-black text-white">{destination}</p>
            <p className="text-[10px] text-orange-400 font-bold mt-0.5">{truck.arrival_time}</p>
          </div>
        </div>

        {/* Kapasite Bilgisi */}
        <div className="mx-6 mt-3 p-4 bg-neon-blue/5 rounded-2xl border border-neon-blue/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-neon-blue" />
            <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Kullanılabilir Kapasite</span>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-neon-blue">%{freePct} <span className="text-sm">Boş</span></p>
            <p className="text-[10px] font-bold text-slate-400">Maks. <span className="text-white font-black">{freeKg.toLocaleString('tr')} kg</span></p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-10 flex flex-col items-center justify-center text-center gap-6"
            >
              <div className="w-20 h-20 bg-neon-green/10 rounded-full flex items-center justify-center border border-neon-green/30 shadow-[0_0_30px_rgba(57,255,20,0.15)]">
                <CheckCircle2 className="w-10 h-10 text-neon-green" />
              </div>
              <div>
                <h4 className="text-xl font-black text-white">Rezervasyon Alındı!</h4>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                  <span className="text-white font-bold">{form.company}</span> adına yük kaydınız oluşturuldu. 
                  Sistem diğer kullanıcılar için anlık olarak güncellendi.
                </p>
              </div>
              <div className="flex flex-col w-full gap-3">
                <button 
                  onClick={handleGoToEscrow} 
                  className="w-full py-4 bg-neon-blue text-slate-950 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,240,255,0.2)]"
                >
                  <CreditCard className="w-5 h-5" /> Güvenli Ödemeye Git
                </button>
                <button onClick={onClose} className="w-full py-3 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors">
                  Kapat
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              className="p-6 space-y-4"
            >
              {/* Firma Adı — otomatik dolu */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">
                    <Building2 className="w-3 h-3 inline mr-1" />Firma Adı
                  </label>
                  <input
                    required
                    value={form.company}
                    onChange={e => setForm({ ...form, company: e.target.value })}
                    placeholder="Örn: Arçelik A.Ş."
                    className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-neon-blue transition-all placeholder:text-slate-600"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">
                    <User className="w-3 h-3 inline mr-1" />Yetkili Kişi
                  </label>
                  <input
                    value={form.contact}
                    onChange={e => setForm({ ...form, contact: e.target.value })}
                    placeholder="Ad Soyad"
                    className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-neon-blue transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">
                  <Package className="w-3 h-3 inline mr-1" />Yük Açıklaması
                </label>
                <input
                  required
                  value={form.cargo}
                  onChange={e => setForm({ ...form, cargo: e.target.value })}
                  placeholder="Örn: Elektronik Ürünler, Tekstil, Gıda..."
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-neon-blue transition-all placeholder:text-slate-600"
                />
              </div>

              {/* Ağırlık — Max freeKg */}
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">
                  <Weight className="w-3 h-3 inline mr-1" />Yük Ağırlığı (kg)
                  <span className="ml-2 text-neon-blue normal-case font-bold">Maks: {freeKg.toLocaleString('tr')} kg</span>
                </label>
                <div className="relative">
                  <input
                    required
                    type="number"
                    min={1}
                    max={freeKg}
                    value={form.weight}
                    onChange={e => setForm({ ...form, weight: e.target.value })}
                    placeholder={`Maks ${freeKg.toLocaleString('tr')} kg girebilirsiniz`}
                    className={`w-full bg-slate-900/60 border rounded-xl px-3 py-2.5 text-sm text-white outline-none transition-all placeholder:text-slate-600 ${
                      isOverLimit ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-neon-blue'
                    }`}
                  />
                  {form.weight && (
                    <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black ${isOverLimit ? 'text-red-400' : 'text-neon-blue'}`}>
                      {weightNum.toLocaleString('tr')} kg
                    </div>
                  )}
                </div>
                {/* Canlı kapasite bar */}
                {form.weight && (
                  <div className="mt-2">
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full flex rounded-full overflow-hidden transition-all duration-300">
                        <div className="h-full bg-slate-600" style={{ width: `${(truck.current_occupancy / truck.total_capacity) * 100}%` }} />
                        <div
                          className={`h-full transition-all duration-300 ${isOverLimit ? 'bg-red-500' : 'bg-neon-blue shadow-[0_0_8px_rgba(0,240,255,0.5)]'}`}
                          style={{ width: `${Math.min((weightNum / truck.total_capacity) * 100, freePct)}%` }}
                        />
                      </div>
                    </div>
                    {isOverLimit && (
                      <p className="text-[10px] text-red-400 font-bold mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Kapasite aşıldı! Maks. {freeKg.toLocaleString('tr')} kg girebilirsiniz.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Notlar (Opsiyonel)</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Özel teslim talimatı, hassas yük bilgisi..."
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-neon-blue transition-all resize-none placeholder:text-slate-600"
                />
              </div>

              <button
                type="submit"
                disabled={!isValid || loading}
                className="w-full py-4 bg-neon-blue text-slate-950 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.2)]"
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" /> İşleniyor...</>
                ) : (
                  <><ShieldCheck className="w-4 h-4" /> Güvenli Ödemeyi Başlat</>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ReservationModal;
