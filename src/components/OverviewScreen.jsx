import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Truck, DollarSign, TrendingDown, Leaf, 
  Globe, Activity, Box 
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import NetworkBackground from './NetworkBackground';

const OverviewScreen = ({ setScreen }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* HERO SECTION */}
      <section className="relative p-8 lg:p-12 rounded-[2rem] bg-[#121A24]/40 border border-slate-800 overflow-hidden shadow-xl group">
        <NetworkBackground />
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="space-y-6">
            <h1 className="text-3xl md:text-[2.75rem] font-black text-white leading-tight tracking-tight">
              Ticaretinizi Yönetin.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#76C893] via-[#38A3A5] to-[#1B5E3C]">Lojistiği Optimize Edin.</span>
            </h1>
            
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-[#76C893]/10 border border-[#76C893]/20 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-[#76C893] animate-pulse"></div>
                <span className="text-[10px] font-bold text-[#76C893] uppercase tracking-widest">12 Aktif Sevkiyat</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">3 Yeni Eşleşme</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 shrink-0">
            <button onClick={() => setScreen('LOGISTICS')} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#76C893] to-[#38A3A5] text-[#0B1E2D] rounded-xl font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-[#76C893]/20">
              <Truck size={18}/> Yeni Yük Ekle
            </button>
            <button onClick={() => setScreen('MARKETPLACE')} className="flex items-center gap-2 px-6 py-3 bg-[#0B1E2D] border border-slate-700 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all">
              <Box size={18}/> Stok Listele
            </button>
          </div>
        </div>
      </section>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'KURTARILAN ÖLÜ SERMAYE', val: '₺1.240.000', change: '-%12', icon: DollarSign, color: 'text-[#76C893]', sub: 'Bu ay +₺320.000 kazanç' },
          { label: 'LOJİSTİK TASARRUFU', val: '%62.4', change: '+%4.2', icon: TrendingDown, color: 'text-amber-400', sub: 'Geçen aya göre %4 daha iyi' },
          { label: 'ÖNLENEN CO2 SALINIMI', val: '14.2 Ton', change: '+2.1 Ton', icon: Leaf, color: 'text-[#38A3A5]', sub: 'Doğaya katkınız artıyor' }
        ].map((s, i) => (
          <div key={i} className="flex flex-col justify-between p-7 rounded-[2rem] bg-[#121A24]/40 border border-slate-800 shadow-xl group hover:border-[#76C893]/30 transition-all min-h-[220px]">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-xl bg-[#0B1E2D] ${s.color} shadow-inner border border-white/5`}>
                <s.icon size={22} />
              </div>
              <span className={`text-[11px] font-black px-3 py-1 rounded-lg bg-[#0B1E2D] ${s.color} border border-current/20 shadow-sm`}>
                {s.change}
              </span>
            </div>
            
            <div className="mt-6 space-y-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{s.label}</p>
              <h3 className="text-4xl font-black text-white tracking-tighter drop-shadow-md">
                {s.val}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium opacity-80">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LOGISTICS VISUALIZATION */}
        <div className="lg:col-span-2 p-10 rounded-[2.5rem] bg-[#121A24] border border-slate-800/50 shadow-2xl relative overflow-hidden">
           <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-3">
                  <Globe className="text-teal-400 animate-spin-slow" size={24}/> Aktif Sevkiyat Rotaları
                </h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Gerçek Zamanlı Verimlilik Takibi</p>
              </div>
              <button className="px-5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black text-slate-400 hover:text-white transition-all uppercase tracking-widest">Tümünü Gör</button>
           </div>

           <div className="space-y-6">
              {[
                { from: 'İstanbul', to: 'Sofya', progress: 65, color: 'bg-teal-500', savings: '%32', eta: '1.2s' },
                { from: 'Ankara', to: 'İzmir', progress: 42, color: 'bg-amber-500', savings: '%18', eta: '3.4s' },
                { from: 'Bursa', to: 'Selanik', progress: 85, color: 'bg-green-500', savings: '%45', eta: '0.5s' }
              ].map((route, i) => (
                <div key={i} className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all group cursor-pointer">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <span className="w-3 h-3 rounded-full border-2 border-slate-600 bg-slate-900"></span>
                        <div className="h-4 w-px bg-slate-800"></div>
                        <span className="w-3 h-3 rounded-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]"></span>
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">{route.from} <span className="text-slate-600 mx-2">→</span> {route.to}</p>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">ETA: {route.eta} • {route.savings} Tasarruf</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className={`text-[10px] font-black px-3 py-1 rounded-full ${route.color} text-[#0B1E2D]`}>{route.progress}% TAMAMLANDI</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${route.progress}%` }} className={`h-full ${route.color} shadow-[0_0_15px_rgba(0,0,0,0.3)]`}></motion.div>
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* AI INSIGHTS */}
        <div className="flex flex-col gap-8">
          <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#121A24] to-[#0B1E2D] border border-teal-500/20 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500/10 rounded-full blur-[80px] group-hover:bg-teal-500/20 transition-all"></div>
            
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-teal-500/20 rounded-xl">
                <Activity className="text-teal-400" size={24}/>
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Akıllı Öneriler</h3>
                <p className="text-[10px] text-teal-500/70 font-bold uppercase tracking-widest">Yapay Zeka Destekli Analiz</p>
              </div>
            </div>

            <div className="space-y-5 relative z-10">
              <motion.div whileHover={{ x: 5 }} className="p-6 rounded-2xl bg-teal-500/5 border border-teal-500/10 hover:border-teal-500/30 transition-all cursor-pointer group/item">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                  <p className="text-xs text-teal-400 font-black uppercase tracking-widest">Maliyet Optimizasyonu</p>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  Sevkiyatlarınızı birleştirerek bu ay <span className="text-teal-400 font-black">₺142.000</span> ekstra tasarruf sağlayabilirsiniz.
                </p>
              </motion.div>

              <motion.div whileHover={{ x: 5 }} className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/30 transition-all cursor-pointer">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  <p className="text-xs text-amber-500 font-black uppercase tracking-widest">Stok Fırsatı</p>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  Atıl stoklarınız için komşu sanayi bölgesinde <span className="text-white font-bold">5 yeni potansiyel alıcı</span> tespit edildi.
                </p>
              </motion.div>
            </div>

            <button className="w-full mt-8 py-4 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-teal-500 hover:text-[#0B1E2D] transition-all">
              Detaylı Analiz Raporu
            </button>
          </div>

          <div className="flex-1 p-8 rounded-[2.5rem] bg-[#121A24] border border-slate-800/50 shadow-xl">
             <div className="flex items-center justify-between mb-6">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Haftalık Performans</h4>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
             </div>
             <div className="h-24 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[{v:10},{v:25},{v:15},{v:45},{v:30},{v:60},{v:40}]}>
                    <defs>
                      <linearGradient id="colorG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke="#14b8a6" strokeWidth={2} fill="url(#colorG)" />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
             <p className="text-[11px] text-slate-400 text-center mt-4">Verimlilik endeksi <span className="text-green-400 font-bold">+%8.4</span> yukarıda.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewScreen;
