import React, { useState, useMemo, useEffect } from 'react';
import { Truck, Activity, Search, MapPin, Clock, Globe, Box, TrendingUp, ChevronRight, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../supabase';
import { TRUCK_DATA, TURKIYE_ILLER, KOMSU_ULKELER } from '../data/mockData';
import TruckScene from './TruckScene';

const CITY_COORDS = {
  'İstanbul': { lat: 41.0082, lng: 28.9784 },
  'Ankara': { lat: 39.9334, lng: 32.8597 },
  'İzmir': { lat: 38.4237, lng: 27.1428 },
  'Bursa': { lat: 40.1885, lng: 29.0610 },
  'Antalya': { lat: 36.8969, lng: 30.7133 },
  'Adana': { lat: 36.9914, lng: 35.3308 },
  'Gaziantep': { lat: 37.0662, lng: 37.3833 },
  'Konya': { lat: 37.8714, lng: 32.4846 },
  'Mersin': { lat: 36.8121, lng: 34.6415 },
  'Kayseri': { lat: 38.7205, lng: 35.4826 },
  'Yunanistan': { lat: 37.9838, lng: 23.7275 },
  'Bulgaristan': { lat: 42.6977, lng: 23.3219 },
  'Gürcistan': { lat: 41.7151, lng: 44.8271 },
  'Ermenistan': { lat: 40.1792, lng: 44.4991 },
  'Azerbaycan': { lat: 40.4093, lng: 49.8671 },
  'İran': { lat: 35.6892, lng: 51.3890 },
  'Irak': { lat: 33.3152, lng: 44.3661 },
  'Suriye': { lat: 33.5138, lng: 36.2765 },
  'Almanya': { lat: 52.5200, lng: 13.4050 }
};

const calculateRoute = (from, to, startDate, departureTime = null) => {
  if (!from || !to || !CITY_COORDS[from] || !CITY_COORDS[to]) {
    return { distance: 0, duration: 0, arrival: null, delay: 0 };
  }
  const c1 = CITY_COORDS[from];
  const c2 = CITY_COORDS[to];
  const dist = Math.sqrt(Math.pow(c2.lat - c1.lat, 2) + Math.pow(c2.lng - c1.lng, 2)) * 111 * 1.35;
  const distance = Math.round(dist);
  const duration = dist / 75; 
  const delay = 45; // Fixed delay for list performance, can be randomized in details
  
  let baseTime = new Date(startDate);
  if (departureTime) {
    const d = new Date(departureTime);
    baseTime.setHours(d.getHours(), d.getMinutes(), 0, 0);
  } else {
    baseTime.setHours(9, 0, 0, 0);
  }
  const arrival = new Date(baseTime.getTime() + (duration * 3600000) + (delay * 60000));
  return { distance, duration, arrival, delay };
};

const LogisticsScreen = ({ showToast }) => {
  const [trucks, setTrucks] = useState(TRUCK_DATA);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [loadWeight, setLoadWeight] = useState('');
  const [loadVolume, setLoadVolume] = useState('');
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [cargoPool, setCargoPool] = useState([]);
  const [loadDate, setLoadDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchTrucks();
  }, []);

  const fetchTrucks = async () => {
    setLoading(true);
    const { data } = await supabase.from('trucks').select('*').order('departure_time', { ascending: true });
    if (data && data.length > 0) setTrucks(data);
    setLoading(false);
  };

  const handleTruckSelect = (truck) => {
    setSelectedTruck(truck);
    const occupancyPct = (truck.currentOccupancy / truck.totalCapacity) * 100;
    setCargoPool([
      { company: 'Mevcut Yük', percentage: occupancyPct, color: '#334155' },
      { company: 'Sizin Yükünüz', percentage: (parseInt(loadWeight || 0) / truck.totalCapacity) * 100, color: '#00F0FF' }
    ]);
  };

  const handleConfirmPool = async () => {
    if (!selectedTruck || !loadWeight) {
      showToast('Lütfen bir araç seçin ve yük miktarını girin!', 'error');
      return;
    }

    setBookingLoading(true);
    const newOccupancy = selectedTruck.currentOccupancy + parseInt(loadWeight);

    const { error } = await supabase
      .from('trucks')
      .update({ currentOccupancy: newOccupancy })
      .eq('id', selectedTruck.id);

    if (error) {
      showToast('Rezervasyon sırasında hata oluştu!', 'error');
    } else {
      showToast('Havuz başarıyla onaylandı ve yeriniz ayrıldı!', 'success');
      fetchTrucks(); 
      setSelectedTruck({ ...selectedTruck, currentOccupancy: newOccupancy });
    }
    setBookingLoading(false);
  };

  const generateRandomTrucks = () => {
    const count = Math.floor(Math.random() * 10) + 1;
    const drivers = ['Ahmet Y.', 'Mehmet K.', 'Caner S.', 'Selin T.', 'Barış A.', 'Deniz L.', 'Mert B.', 'Zeynep G.'];
    
    return Array.from({ length: count }).map((_, i) => {
      const departureDate = new Date(loadDate);
      departureDate.setHours(Math.floor(Math.random() * 12) + 8, 0, 0, 0);
      
      const o = origin || TURKIYE_ILLER[Math.floor(Math.random() * TURKIYE_ILLER.length)];
      const destOptions = [...TURKIYE_ILLER, ...KOMSU_ULKELER];
      const d = destination || destOptions[Math.floor(Math.random() * destOptions.length)];

      return {
        id: `truck-${Date.now()}-${i}`,
        origin: o,
        destination: d,
        departure: departureDate.toISOString(),
        driver: drivers[Math.floor(Math.random() * drivers.length)],
        rating: (4 + Math.random()).toFixed(1),
        currentOccupancy: Math.floor(Math.random() * 20000) + 2000,
        totalCapacity: 25000,
        basePrice: Math.floor(Math.random() * 3000) + 1500
      };
    });
  };

  const handleSearch = () => {
    setIsSearching(true);
    setLoading(true);
    setTimeout(() => {
      setTrucks(generateRandomTrucks());
      setIsSearching(false);
      setLoading(false);
      showToast('En Uygun AI Rotaları Listelendi!', 'success');
    }, 800);
  };

  const processedTrucks = useMemo(() => {
    const filtered = trucks.filter(t => {
      const matchesOrigin = !origin || t.origin === origin;
      const matchesDest = !destination || t.destination === destination;
      return matchesOrigin && matchesDest;
    });

    return filtered.map(truck => ({
      ...truck,
      routeData: calculateRoute(truck.origin, truck.destination, loadDate, truck.departure)
    })).sort((a, b) => (b.currentOccupancy / b.totalCapacity) - (a.currentOccupancy / a.totalCapacity));
  }, [trucks, loadDate, origin, destination]);

  const getRouteDetails = useMemo(() => {
    return calculateRoute(origin, destination, loadDate, selectedTruck?.departure);
  }, [origin, destination, loadDate, selectedTruck]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <Truck className="text-neon-blue" size={32} />
            Akıllı Lojistik Planlayıcı
          </h2>
          <p className="text-slate-400 mt-2">Yükünüzü en uygun rotadaki boş kapasitelerle eşleştirin.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl border border-neon-blue/30 text-xs font-bold text-neon-blue">
          <Activity size={14} className="animate-pulse" /> 24 Aktif Rota İzleniyor
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="glass p-6 rounded-3xl border border-slate-700/50 space-y-5">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <Search size={16} className="text-neon-blue" /> Rota & Yük Filtreleri
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Kalkış Noktası</label>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-neon-blue outline-none transition-all"
                >
                  <option value="">Tüm İller</option>
                  {TURKIYE_ILLER.map(il => <option key={il} value={il}>{il}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Varış Noktası (TR veya Komşu)</label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-neon-blue outline-none transition-all"
                >
                  <option value="">Tüm Destinasyonlar</option>
                  <optgroup label="Türkiye">
                    {TURKIYE_ILLER.map(il => <option key={il} value={il}>{il}</option>)}
                  </optgroup>
                  <optgroup label="Komşu Ülkeler">
                    {KOMSU_ULKELER.map(ulke => <option key={ulke} value={ulke}>{ulke}</option>)}
                  </optgroup>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Ağırlık (KG)</label>
                  <input
                    type="number"
                    placeholder="Örn: 500"
                    value={loadWeight}
                    onChange={(e) => setLoadWeight(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-neon-blue outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Hacim (Palet)</label>
                  <input
                    type="number"
                    placeholder="Örn: 2"
                    value={loadVolume}
                    onChange={(e) => setLoadVolume(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-neon-blue outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Yükleme Tarihi</label>
                <input
                  type="date"
                  value={loadDate}
                  onChange={(e) => setLoadDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-neon-blue outline-none transition-all"
                />
              </div>
            </div>

            <button 
              onClick={handleSearch}
              disabled={isSearching}
              className="w-full py-4 bg-neon-blue/10 border border-neon-blue text-neon-blue rounded-2xl font-bold hover:bg-neon-blue hover:text-slate-900 transition-all shadow-[0_0_20px_rgba(0,240,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? 'Rotalar Analiz Ediliyor...' : 'En Uygun Aracı Bul'}
            </button>
          </div>

          <div className="glass p-6 rounded-3xl border border-slate-700/50 h-80 relative overflow-hidden group bg-slate-900/40">
            <div className="absolute inset-0 opacity-30">
              {/* Grid Background */}
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #38A3A5 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              
              <svg viewBox="0 0 400 200" className="w-full h-full relative z-0">
                <defs>
                  <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FF5F1F" />
                    <stop offset="100%" stopColor="#39FF14" />
                  </linearGradient>
                </defs>
                
                {origin && destination && (
                  <motion.path 
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    d="M60,140 C100,60 300,60 340,140" 
                    fill="none" 
                    stroke="url(#routeGradient)" 
                    strokeWidth="3" 
                    strokeDasharray="8,5" 
                  />
                )}
                
                {/* Moving Truck on Path */}
                {origin && destination && (
                  <motion.g
                    initial={{ offsetDistance: "0%" }}
                    animate={{ offsetDistance: "100%" }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    style={{ offsetPath: "path('M60,140 C100,60 300,60 340,140')" }}
                  >
                    <rect x="-8" y="-4" width="16" height="8" rx="2" fill="#00F0FF" />
                    <circle cx="6" cy="0" r="2" fill="#FFFFFF" />
                  </motion.g>
                )}

                <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} cx="340" cy="140" r="6" fill="#39FF14" className="shadow-lg" />
              </svg>
            </div>
            
            <div className="relative z-10 flex flex-col h-full">
              <h4 className="text-[10px] font-black text-[#38A3A5] uppercase tracking-[0.2em] flex items-center gap-2 mb-8">
                <Globe size={14} className="animate-spin-slow" /> AI Rota Analizi & GPS
              </h4>
              
              <div className="flex flex-col gap-2 p-5 bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-md relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#FF5F1F] to-[#39FF14]"></div>
                
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#FF5F1F]/10 border border-[#FF5F1F]/20 flex items-center justify-center text-[#FF5F1F]">
                    <MapPin size={14} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Kalkış Noktası</p>
                    <p className="text-sm font-black text-white">{origin || 'Konum Seçin'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-2">
                  <div className="w-8 h-8 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/20 flex items-center justify-center text-[#39FF14]">
                    <MapPin size={14} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Varış Noktası</p>
                    <p className="text-sm font-black text-white">{destination || 'Konum Seçin'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-auto">
                {getRouteDetails.distance > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-slate-900/80 border border-teal-500/20 rounded-2xl flex flex-col items-center justify-center backdrop-blur-sm"
                  >
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Hesaplanan Yol Mesafesi</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-black text-teal-400">{getRouteDetails.distance}</p>
                      <span className="text-[10px] font-bold text-teal-400/60 uppercase">Kilometre</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="glass rounded-[2.5rem] h-[400px] border border-slate-700/50 relative overflow-hidden bg-slate-900/40">
            <div className="absolute top-10 left-10 z-30">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-neon-blue/10 rounded-2xl border border-neon-blue/20">
                  <Box className="text-neon-blue" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">Kapasite Analizi (3D)</h3>
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">AI-Powered Load Optimization</p>
                </div>
              </div>
            </div>

            {/* 3D Truck Container */}
            <div className="absolute inset-0 z-10">
              <TruckScene cargoPool={cargoPool} />
            </div>

            {selectedTruck ? (
              <div className="absolute top-10 right-10 z-30">
                <div className="bg-slate-900/90 border border-neon-orange/50 px-6 py-4 rounded-[2rem] backdrop-blur-2xl shadow-2xl">
                  <span className="text-[10px] font-black text-slate-500 uppercase block tracking-widest mb-1">Mevcut Boşluk</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-neon-orange">%{100 - (selectedTruck.currentOccupancy / selectedTruck.totalCapacity * 100).toFixed(0)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center p-12 bg-slate-950/20 rounded-[3rem] border border-slate-800/50 backdrop-blur-sm"
                >
                  <div className="w-24 h-24 bg-neon-blue/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-neon-blue/20 shadow-[0_0_40px_rgba(0,240,255,0.1)]">
                    <Truck size={48} className="text-neon-blue animate-pulse" />
                  </div>
                  <p className="text-white text-xl font-black uppercase tracking-widest">SİMÜLASYONU BAŞLAT</p>
                  <p className="text-xs text-slate-500 mt-3 font-medium">Yerleşim detaylarını görmek için bir araç seçin.</p>
                </motion.div>
              </div>
            )}

            <div className="absolute bottom-10 left-10 z-30 flex gap-8">
              <div className="flex items-center gap-3 bg-slate-950/60 px-5 py-2.5 rounded-2xl border border-slate-800 backdrop-blur-md">
                <div className="w-3.5 h-3.5 rounded-full bg-slate-600 shadow-[0_0_15px_rgba(71,85,105,0.4)]"></div>
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Dolu Kapasite</span>
              </div>
              <div className="flex items-center gap-3 bg-slate-950/60 px-5 py-2.5 rounded-2xl border border-slate-800 backdrop-blur-md">
                <div className="w-3.5 h-3.5 rounded-full bg-neon-blue shadow-[0_0_20px_rgba(0,240,255,0.5)] animate-pulse"></div>
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Sizin Yükünüz</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-4 mb-2">
              <h3 className="font-black text-white text-sm flex items-center gap-3 uppercase tracking-[0.2em]">
                <div className="w-10 h-1.5 bg-neon-green rounded-full"></div>
                Rota Üstü Uygun Araçlar
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></div>
                <span className="text-[10px] font-black text-neon-green uppercase tracking-widest">Canlı Akış</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {processedTrucks.map((truck) => {
                const occupancyPct = (truck.currentOccupancy / truck.totalCapacity) * 100;
                const isUrgent = occupancyPct > 85;
                const yourWeight = parseInt(loadWeight || 0);
                const fits = (truck.currentOccupancy + yourWeight) <= truck.totalCapacity;

                const basePrice = truck.basePrice || 2500;
                const sharedPrice = (yourWeight / truck.totalCapacity) * basePrice * 1.4;

                const truckRoute = truck.routeData;
                const truckDeparture = new Date(loadDate);
                const mockDep = new Date(truck.departure);
                truckDeparture.setHours(mockDep.getHours(), mockDep.getMinutes(), 0, 0);

                return (
                  <motion.div
                    key={truck.id}
                    whileHover={{ scale: 1.01, y: -4, backgroundColor: 'rgba(30, 41, 59, 0.4)' }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => fits && handleTruckSelect(truck)}
                    className={`glass p-8 rounded-[2.5rem] border transition-all duration-300 cursor-pointer group relative overflow-hidden ${selectedTruck?.id === truck.id ? 'border-neon-blue bg-neon-blue/5 ring-1 ring-neon-blue/20 shadow-2xl' :
                        !fits ? 'opacity-40 border-red-900/10 grayscale pointer-events-none' :
                          isUrgent ? 'border-neon-orange/30 hover:border-neon-orange/60' : 'border-slate-800 hover:border-slate-600'
                      }`}
                  >
                    {isUrgent && (
                      <div className="absolute top-0 right-0 z-20">
                        <div className="bg-neon-orange text-slate-900 text-[10px] font-black px-10 py-2 rotate-45 translate-x-8 translate-y-2 uppercase shadow-2xl">
                          Acil Doluyor
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
                      <div className="flex-1 flex gap-8">
                        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shrink-0 transition-all duration-500 shadow-inner ${selectedTruck?.id === truck.id ? 'bg-neon-blue text-slate-900 scale-110' : isUrgent ? 'bg-neon-orange/10 text-neon-orange border border-neon-orange/20' : 'bg-slate-900 text-slate-500 border border-slate-800 group-hover:border-slate-700'}`}>
                          <Truck size={36} />
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <h4 className="text-xl font-black text-white group-hover:text-neon-blue transition-colors tracking-tight">{truck.origin}</h4>
                            <div className="flex flex-col items-center gap-1">
                                <ChevronRight size={20} className="text-slate-700" />
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{truckRoute.distance} KM</span>
                            </div>
                            <h4 className="text-xl font-black text-white group-hover:text-neon-blue transition-colors tracking-tight">{truck.destination}</h4>
                          </div>
                          
                          {/* Timeline Section */}
                          <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Kalkış</span>
                                <span className="text-sm font-black text-white flex items-center gap-2">
                                    <Clock size={14} className="text-neon-blue" />
                                    {truckDeparture.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="h-8 w-px bg-slate-800"></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Tahmini Varış</span>
                                <span className="text-sm font-black text-white flex items-center gap-2">
                                    <TrendingUp size={14} className="text-orange-500" />
                                    {truckRoute.arrival ? (
                                      <>
                                        {truckRoute.arrival.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })} | {truckRoute.arrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </>
                                    ) : 'Hesaplanıyor...'}
                                </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4">
                            <span className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 rounded-xl text-[10px] font-black text-neon-blue border border-neon-blue/10 uppercase tracking-widest">
                              <Globe size={12} /> Güzergah Üstü Araç
                            </span>
                            <span className="text-[10px] font-bold text-slate-600 italic">"Güzargahınızdan geçecek, boş kapasite mevcut."</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-12">
                        <div className="text-center min-w-[120px]">
                          <p className="text-[10px] font-black text-slate-500 uppercase mb-3 tracking-[0.2em]">Doluluk Durumu</p>
                          <div className="w-32 h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 mx-auto p-0.5">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${occupancyPct}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={`h-full rounded-full ${isUrgent ? 'bg-neon-orange shadow-[0_0_15px_rgba(255,95,31,0.6)]' : 'bg-neon-green shadow-[0_0_15px_rgba(57,255,20,0.6)]'}`}
                            ></motion.div>
                          </div>
                          <p className={`text-xs font-black mt-3 tracking-widest ${isUrgent ? 'text-neon-orange' : 'text-neon-green'}`}>%{occupancyPct.toFixed(0)} KAPASİTE</p>
                        </div>

                        <div className="text-right border-l border-slate-800 pl-12 min-w-[180px]">
                          <div className="flex flex-col items-end">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Paylaşımlı Navlun</p>
                            <h5 className="text-3xl font-black text-white group-hover:text-neon-green transition-colors leading-none tracking-tighter">
                              ₺{Math.max(1200, Math.round(sharedPrice)).toLocaleString()}
                            </h5>
                            <div className="mt-3 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse"></div>
                              <span className="text-[9px] font-black text-neon-green uppercase tracking-widest">AI Onaylı Fiyat</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogisticsScreen;

