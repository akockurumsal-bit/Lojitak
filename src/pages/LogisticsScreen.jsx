import React, { useState, useMemo, useEffect } from 'react';
import {
  Truck, Search, MapPin, Clock, Globe, TrendingUp,
  ShieldCheck, RefreshCw, Navigation, User, Hash,
  Gauge, Package, Star, ArrowRight, CheckCircle2,
  Fuel, AlertTriangle, PhoneCall, CreditCard, Zap,
  Building2, Users, Radar, Leaf
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TURKIYE_ILLER } from '../data/mockData';
import ReservationModal from '../components/ReservationModal';
import { supabase } from '../supabase';
import RadarMap from '../components/RadarMap';

// --- Sabit Veri Havuzu ---
const TRUCK_BRANDS = [
  { brand: 'Mercedes-Benz', model: 'Actros 1845 LS', year: 2022, fuel: 'Dizel', color: '#00A8CC' },
  { brand: 'Volvo', model: 'FH16 750 I-Save', year: 2023, fuel: 'LNG', color: '#0F62AA' },
  { brand: 'MAN', model: 'TGX 18.560 XLX', year: 2021, fuel: 'Dizel', color: '#D0021B' },
  { brand: 'Scania', model: 'R 650 V8 Highline', year: 2023, fuel: 'Dizel', color: '#FF6B00' },
  { brand: 'DAF', model: 'XG+ 530 FT', year: 2022, fuel: 'Dizel', color: '#1ABC9C' },
  { brand: 'Renault', model: 'Trucks T 520 High', year: 2021, fuel: 'Dizel', color: '#F1C40F' },
];

const COMPANIES = ['Öz Lojistik A.Ş.', 'Yıldız Trans Ltd.', 'Kafkas Nakliyat', 'Ege Lojistik', 'Marmara Trans A.Ş.'];
const PHONES = ['0532 141 22 33', '0505 876 54 32', '0542 333 44 55', '0553 777 88 99'];

// --- ETA Motoru ---
const DISTANCES = {
  'İstanbul-Ankara': 450, 'İstanbul-İzmir': 480, 'İstanbul-Bursa': 150,
  'İstanbul-Antalya': 700, 'Ankara-İstanbul': 450, 'Ankara-İzmir': 590,
  'İzmir-İstanbul': 480, 'İzmir-Ankara': 590, 'Bursa-İstanbul': 150,
};

function calculateETA(from, to, dateStr) {
  const key = `${from}-${to}`;
  const distance = DISTANCES[key] || (Math.floor(Math.random() * 600) + 250);
  const departureDate = new Date(dateStr);
  departureDate.setHours(Math.floor(Math.random() * 6) + 8, Math.floor(Math.random() * 60));
  const travelHours = distance / 75;
  const arrivalDate = new Date(departureDate.getTime() + (travelHours + 1) * 3600000);
  
  const fmt = (d) => {
    const months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
    return `${d.getDate()} ${months[d.getMonth()]}, ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
  };
  return { departure: fmt(departureDate), arrival: fmt(arrivalDate), distance, hours: travelHours.toFixed(1) };
}

// --- Detay Kartı ---
function TruckDetailPanel({ truck, origin, destination, setReserveTruck }) {
  const occupancyPct = Math.round((truck.current_occupancy / truck.total_capacity) * 100);
  const freePct = 100 - occupancyPct;
  const freeKg = truck.total_capacity - truck.current_occupancy;

  const manifests = useMemo(() => {
    try {
      return typeof truck.manifests === 'string' ? JSON.parse(truck.manifests) : (truck.manifests || []);
    } catch { return []; }
  }, [truck.manifests]);

  return (
    <motion.div
      key={truck.id}
      initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="h-full flex flex-col gap-5 overflow-y-auto custom-scrollbar pr-1"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">{truck.brand} <span className="text-neon-blue">{truck.model}</span></h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{truck.company} • {truck.year}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-lg font-black text-white">{truck.rating}</span>
        </div>
      </div>

      <div className="p-5 bg-neon-blue/5 rounded-3xl border border-neon-blue/20 flex items-center gap-4">
        <div className="text-center flex-1">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">KALKIŞ</p>
          <p className="text-lg font-black text-white">{origin}</p>
          <p className="text-xs text-neon-blue font-bold mt-1">{truck.departure_time}</p>
        </div>
        <div className="flex flex-col items-center gap-1 px-3">
          <div className="text-[9px] font-black text-slate-500 uppercase">{truck.distance_km} km</div>
          <div className="flex items-center gap-1">
            <div className="w-8 h-px bg-slate-700" /><ArrowRight className="w-4 h-4 text-neon-blue" /><div className="w-8 h-px bg-slate-700" />
          </div>
          <div className="text-[9px] font-black text-slate-500 uppercase">{truck.travel_hours} saat</div>
        </div>
        <div className="text-center flex-1">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">VARIŞ</p>
          <p className="text-lg font-black text-white">{destination}</p>
          <p className="text-xs text-orange-400 font-bold mt-1">{truck.arrival_time}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: Hash, label: 'Plaka', value: truck.plate, color: 'text-neon-blue' },
          { icon: User, label: 'Şoför', value: truck.driver, color: 'text-green-400' },
          { icon: Fuel, label: 'Yakıt Tipi', value: truck.fuel_type, color: 'text-yellow-400' },
          { icon: Leaf, label: 'Karbon Tasarrufu', value: `%${truck.carbon_saving || 15}`, color: 'text-[#76C893]' },
          { icon: PhoneCall, label: 'İletişim', value: truck.phone, color: 'text-purple-400' },
          { icon: CreditCard, label: 'AI Tahmini Fiyat', value: `${truck.base_price.toLocaleString('tr')} ₺`, color: 'text-[#38A3A5]' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
            <div className="p-2 bg-slate-900 rounded-xl shrink-0"><item.icon className={`w-4 h-4 ${item.color}`} /></div>
            <div className="min-w-0">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
              <p className="text-sm font-black text-white truncate">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-5 bg-white/[0.02] rounded-3xl border border-white/5">
        <div className="flex items-center gap-2 mb-4"><Users className="w-4 h-4 text-neon-blue" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Yük Paydaşları</span></div>
        <div className="flex flex-wrap gap-2">
          {manifests.length > 0 ? manifests.map((m, i) => (
            <div key={i} className="px-3 py-1.5 bg-slate-900/50 border border-white/5 rounded-xl flex items-center gap-2">
              <Building2 className="w-3 h-3 text-slate-500" /><span className="text-[11px] font-bold text-slate-300">{m.company}</span><span className="text-[10px] font-black text-neon-blue">{m.weight}kg</span>
            </div>
          )) : <p className="text-[11px] text-slate-600 italic">Henüz bir şirket yükleme yapmadı.</p>}
        </div>
      </div>

      <div className="p-5 bg-white/[0.02] rounded-3xl border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Package className="w-4 h-4 text-slate-400" /><span className="text-xs font-black text-slate-400 uppercase tracking-widest">Yük Kapasitesi</span></div>
          <span className="text-sm font-black text-neon-blue">%{freePct} Boş</span>
        </div>
        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden">
          <div className="h-full flex rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${occupancyPct}%` }} transition={{ duration: 0.8 }} className="h-full bg-slate-600" />
            <motion.div initial={{ width: 0 }} animate={{ width: '15%' }} transition={{ duration: 0.8, delay: 0.4 }} className="h-full bg-neon-blue shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
          </div>
        </div>
        <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
          <span>Mevcut: {truck.current_occupancy.toLocaleString('tr')} kg</span><span>Toplam: {truck.total_capacity.toLocaleString('tr')} kg</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-auto pt-2">
        <button onClick={() => setReserveTruck(truck)} disabled={freeKg <= 0}
          className="py-4 bg-neon-blue text-slate-950 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(0,240,255,0.2)] flex items-center justify-center gap-2 disabled:opacity-50">
          <Zap className="w-4 h-4" /> {freeKg <= 0 ? 'Kapasite Dolu' : 'Hemen Rezerve Et'}
        </button>
        <button className="py-4 bg-white/[0.03] border border-white/10 text-slate-300 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/[0.07] transition-all flex items-center justify-center gap-2">
          <PhoneCall className="w-4 h-4" /> Şoförü Ara
        </button>
      </div>
    </motion.div>
  );
}

// --- Ana Bileşen ---
const LogisticsScreen = ({ showToast, userProfile, setScreen }) => {
  const [trucks, setTrucks] = useState([]);
  const [origin, setOrigin] = useState('İstanbul');
  const [destination, setDestination] = useState('Ankara');
  const [loadDate, setLoadDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [reserveTruck, setReserveTruck] = useState(null);

  const toast = (msg, type) => showToast?.(msg, type);

  // --- Veritabanı Motoru ---
  const fetchAndSyncTrucks = async (from, to, date) => {
    try {
      // 1. Önce mevcutları çek
      const { data: existing } = await supabase
        .from('active_trucks')
        .select('*')
        .eq('origin', from)
        .eq('destination', to);
      
      // 2. Eğer boşsa, hemen 3-10 tane oluştur
      if (!existing || existing.length === 0) {
        const count = Math.floor(Math.random() * 7) + 4; // 4-10 arası araç
        const newTrucks = Array.from({ length: count }).map(() => {
          const brand = TRUCK_BRANDS[Math.floor(Math.random() * TRUCK_BRANDS.length)];
          const eta = calculateETA(from, to, date);
          return {
            plate: `${Math.floor(Math.random()*81 + 1).toString().padStart(2,'0')} LOJ ${Math.floor(Math.random()*900 + 100)}`,
            brand: brand.brand,
            model: brand.model,
            year: brand.year,
            fuel_type: brand.fuel,
            company: COMPANIES[Math.floor(Math.random() * COMPANIES.length)],
            driver: ['Ahmet','Mehmet','Can','Murat','Deniz','Selin'][Math.floor(Math.random()*6)] + ' Bey',
            phone: PHONES[Math.floor(Math.random() * PHONES.length)],
            rating: parseFloat((4.2 + Math.random() * 0.8).toFixed(1)),
            current_occupancy: Math.floor(Math.random() * 12000) + 2000,
            total_capacity: 22000,
            base_price: Math.floor(Math.random() * 2500) + 2000,
            origin: from,
            destination: to,
            departure_time: eta.departure,
            arrival_time: eta.arrival,
            distance_km: eta.distance,
            travel_hours: eta.hours,
            delay_hours: parseFloat((Math.random() * 2).toFixed(1)),
            carbon_saving: Math.floor(Math.random() * 20) + 10,
            eco_score: parseFloat((4.0 + Math.random() * 1.0).toFixed(1)),
            manifests: JSON.stringify([{ company: 'Lojitak AI', weight: 1200, cargo: 'Ön Yükleme' }])
          };
        });

        const { data: inserted, error: insertError } = await supabase
          .from('active_trucks')
          .insert(newTrucks)
          .select();

        if (insertError) throw insertError;
        if (inserted) {
          setTrucks(inserted);
          setSelectedTruck(inserted[0]);
        }
      } else {
        // 3. Varsa listeyi güncelle
        setTrucks(existing);
        // Eğer seçili tır yoksa veya listede değilse ilkini seç
        if (!selectedTruck || !existing.find(t => t.id === selectedTruck.id)) {
          setSelectedTruck(existing[0]);
        }
      }
    } catch (e) {
      console.error('Lojistik Senkronizasyon Hatası:', e);
    }
  };

  useEffect(() => {
    fetchAndSyncTrucks(origin, destination, loadDate);

    // Real-time dinleyici: Herhangi bir tır güncellenirse (rezervasyon vb.)
    const sub = supabase.channel('logistics_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'active_trucks' }, (payload) => {
        // Sadece mevcut rotayı ilgilendiriyorsa güncelle
        if (payload.new && payload.new.origin === origin && payload.new.destination === destination) {
          fetchAndSyncTrucks(origin, destination, loadDate);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(sub);
  }, [origin, destination, loadDate]);

  const handleSearch = () => {
    setIsSearching(true);
    toast('Rota Optimizasyonu Yapılıyor...', 'info');
    setTimeout(() => { 
      fetchAndSyncTrucks(origin, destination, loadDate);
      setIsSearching(false); 
      toast('AI Filosu Hazır!', 'success'); 
    }, 1000);
  };

  const sorted = useMemo(() => [...trucks].sort((a, b) => (b.current_occupancy / b.total_capacity) - (a.current_occupancy / a.total_capacity)), [trucks]);

  return (
    <>
    <div className="flex flex-col h-full bg-[#0B0F1A] text-slate-200 font-sans">
      <div className="flex items-center gap-5 px-8 py-6 border-b border-white/5 bg-slate-900/30 backdrop-blur-xl">
        <div className="p-3 bg-neon-blue/10 rounded-2xl border border-neon-blue/20"><Truck className="w-7 h-7 text-neon-blue" /></div>
        <div><h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">LOJİTAK KOMUTA MERKEZİ</h1>
          <div className="flex items-center gap-2 mt-0.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /><p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">AI Route Optimization Active</p></div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-hidden flex gap-6">
        <div className="w-[380px] shrink-0 flex flex-col gap-5 overflow-y-auto custom-scrollbar pr-2">
          <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/10 backdrop-blur-xl space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[9px] font-black text-slate-500 uppercase block mb-2 px-1">KALKIŞ</label>
                <select value={origin} onChange={e => setOrigin(e.target.value)} className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-neon-blue appearance-none cursor-pointer">
                  {TURKIYE_ILLER.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                </select>
              </div>
              <div><label className="text-[9px] font-black text-slate-500 uppercase block mb-2 px-1">VARIŞ</label>
                <select value={destination} onChange={e => setDestination(e.target.value)} className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-neon-blue appearance-none cursor-pointer">
                  {TURKIYE_ILLER.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                </select>
              </div>
            </div>
            <div><label className="text-[9px] font-black text-slate-500 uppercase block mb-2 px-1">TARİH</label>
              <input type="date" value={loadDate} onChange={e => setLoadDate(e.target.value)} className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-neon-blue" />
            </div>
            <button onClick={handleSearch} disabled={isSearching} className="w-full py-4 bg-neon-blue text-slate-950 font-black rounded-xl hover:bg-white active:scale-95 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(0,240,255,0.2)]">
              {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} EN UYGUN ARACI BUL
            </button>
          </div>
          <div className="flex items-center justify-between px-2"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">EŞLEŞEN FİLO</span><span className="px-2.5 py-1 bg-neon-blue/10 text-neon-blue text-[9px] font-black rounded-full border border-neon-blue/20">{sorted.length} ARAÇ</span></div>
          <div className="space-y-3">
            {sorted.map((truck) => {
              const pct = Math.round((truck.current_occupancy / truck.total_capacity) * 100);
              const isSelected = selectedTruck?.id === truck.id;
              return (
                <motion.div key={truck.id} whileHover={{ x: 4 }} onClick={() => setSelectedTruck(truck)} className={`p-4 rounded-2xl border cursor-pointer transition-all ${isSelected ? 'bg-neon-blue/8 border-neon-blue/40 shadow-[0_0_25px_rgba(0,240,255,0.05)]' : 'bg-white/[0.02] border-white/5 hover:border-white/15'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3"><div className={`p-2 rounded-xl ${isSelected ? 'bg-neon-blue text-slate-950' : 'bg-slate-900 text-slate-500'}`}><Truck className="w-4 h-4" /></div>
                      <div><p className="font-black text-white text-sm leading-tight">{truck.plate}</p><p className="text-[10px] text-slate-500 font-bold">{truck.brand} · {truck.driver}</p></div>
                    </div>
                    <div className="text-right"><p className="text-sm font-black text-white">{truck.base_price.toLocaleString('tr')} ₺</p><div className="flex items-center gap-1 justify-end mt-0.5"><Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" /><span className="text-[10px] font-black text-slate-400">{truck.rating}</span></div></div>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between mb-1"><span className="text-[9px] text-slate-500 font-black uppercase">Doluluk</span><span className="text-[9px] font-black text-neon-blue">%{pct}</span></div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full bg-gradient-to-r from-neon-blue/50 to-neon-blue rounded-full" /></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span className="text-[10px] text-slate-400 font-bold">{truck.departure_time}</span>
                    </div>
                    
                    <div className="flex gap-2">
                       {truck.carbon_saving > 25 && (
                         <span className="px-2 py-0.5 bg-[#76C893]/10 text-[#76C893] text-[8px] font-black rounded border border-[#76C893]/20 uppercase">Eco Choice</span>
                       )}
                       {truck.base_price < 2500 && (
                         <span className="px-2 py-0.5 bg-[#38A3A5]/10 text-[#38A3A5] text-[8px] font-black rounded border border-[#38A3A5]/20 uppercase">Best Price</span>
                       )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 bg-white/[0.02] rounded-3xl border border-white/8 p-6 overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedTruck ? (
              <TruckDetailPanel key={selectedTruck.id} truck={selectedTruck} origin={origin} destination={destination} setReserveTruck={setReserveTruck} />
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-neon-blue/5 rounded-full flex items-center justify-center mb-6 border border-neon-blue/10 animate-pulse">
                  <Truck className="w-10 h-10 text-neon-blue/30" />
                </div>
                <h3 className="text-slate-500 text-sm font-black uppercase tracking-[0.4em]">Araç Seç</h3>
                <p className="text-slate-600 text-xs mt-2">Soldan bir araç seçerek detayları görüntüle</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>

    <AnimatePresence>
      {reserveTruck && <ReservationModal truck={reserveTruck} origin={origin} destination={destination} userProfile={userProfile} showToast={showToast} setScreen={setScreen} onClose={() => setReserveTruck(null)} />}
    </AnimatePresence>
    </>
  );
};

export default LogisticsScreen;
