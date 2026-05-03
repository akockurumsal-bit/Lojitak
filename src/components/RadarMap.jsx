import { motion, AnimatePresence } from 'motion/react';
import { Radar, Truck, ShieldCheck, Zap } from 'lucide-react';

const RadarMap = ({ trucks, selectedTruck, origin, destination }) => {
  // Koordinatlar (SVG ölçeğinde 0-1000)
  const COORDS = {
    'İstanbul': { x: 120, y: 150 },
    'Ankara': { x: 420, y: 320 },
    'İzmir': { x: 80, y: 480 },
    'Bursa': { x: 180, y: 220 },
    'Antalya': { x: 320, y: 720 },
    'Adana': { x: 680, y: 750 },
    'Gaziantep': { x: 780, y: 760 },
    'Konya': { x: 440, y: 580 },
    'Mersin': { x: 580, y: 780 },
    'Kayseri': { x: 580, y: 420 },
    'Samsun': { x: 560, y: 120 },
    'Trabzon': { x: 820, y: 150 },
    'Erzurum': { x: 880, y: 350 },
    'Diyarbakır': { x: 860, y: 650 },
  };

  const originPoint = COORDS[origin] || { x: 200, y: 400 };
  const destPoint = COORDS[destination] || { x: 800, y: 400 };

  return (
    <div className="relative w-full h-full bg-[#080B14] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] group">
      {/* 🌍 Premium Map Background (Dark Radar Style) */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        {/* Hexagonal Grid Overlay */}
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'radial-gradient(circle at 2px 2px, #1A2333 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />
        
        {/* Radar Rings */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="absolute border border-neon-blue rounded-full" 
              style={{ width: `${i*25}%`, height: `${i*25}%` }} />
          ))}
        </div>
      </div>

      {/* SVG Canvas for High-End Graphics */}
      <svg className="w-full h-full p-8" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#76C893" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#00F0FF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FF6B00" stopOpacity="0.2" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="15" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 🛣️ Dynamic Route Path */}
        <AnimatePresence>
          {selectedTruck && (
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "circOut" }}
              d={`M ${originPoint.x} ${originPoint.y} C ${(originPoint.x + destPoint.x)/2} ${originPoint.y - 100}, ${(originPoint.x + destPoint.x)/2} ${destPoint.y + 100}, ${destPoint.x} ${destPoint.y}`}
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              filter="url(#glow)"
            />
          )}
        </AnimatePresence>

        {/* 🏙️ City Hubs */}
        {Object.entries(COORDS).map(([name, pos]) => {
          const isInvolved = name === origin || name === destination;
          return (
            <g key={name} className="cursor-help transition-all duration-300">
              <circle cx={pos.x} cy={pos.y} r={isInvolved ? "12" : "4"} 
                fill={name === origin ? "#76C893" : name === destination ? "#FF6B00" : "#1E293B"} 
                className={isInvolved ? "animate-pulse" : "opacity-30"}
              />
              {isInvolved && (
                <circle cx={pos.x} cy={pos.y} r="25" fill="none" stroke={name === origin ? "#76C893" : "#FF6B00"} strokeWidth="1" className="opacity-20 animate-ping" />
              )}
              <text x={pos.x} y={pos.y + 35} textAnchor="middle" 
                className={`text-[22px] font-black uppercase tracking-tighter transition-all ${isInvolved ? 'fill-white' : 'fill-slate-700 opacity-0'}`}>
                {name}
              </text>
            </g>
          );
        })}

        {/* 🚛 Live Truck Units */}
        {trucks.map((truck) => {
          const isSelected = selectedTruck?.id === truck.id;
          // Progress simulation based on ID
          const seed = truck.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const progress = 0.2 + (seed % 60) / 100;
          
          // Cubic Bezier interpolation
          const t = progress;
          const cp1x = (originPoint.x + destPoint.x)/2;
          const cp1y = originPoint.y - 100;
          const cp2x = (originPoint.x + destPoint.x)/2;
          const cp2y = destPoint.y + 100;
          
          const x = Math.pow(1-t, 3) * originPoint.x + 3 * Math.pow(1-t, 2) * t * cp1x + 3 * (1-t) * Math.pow(t, 2) * cp2x + Math.pow(t, 3) * destPoint.x;
          const y = Math.pow(1-t, 3) * originPoint.y + 3 * Math.pow(1-t, 2) * t * cp1y + 3 * (1-t) * Math.pow(t, 2) * cp2y + Math.pow(t, 3) * destPoint.y;

          return (
            <motion.g
              key={truck.id}
              initial={{ scale: 0 }}
              animate={{ 
                scale: isSelected ? 1.4 : 0.8,
                opacity: isSelected ? 1 : 0.4,
              }}
              className="z-50"
            >
              {isSelected && (
                <circle cx={x} cy={y} r="60" fill="url(#routeGradient)" className="opacity-10 animate-pulse" />
              )}
              <rect x={x - 25} y={y - 25} width="50" height="50" rx="12" 
                fill={isSelected ? "#00F0FF" : "#1E293B"} className="shadow-2xl" />
              <g transform={`translate(${x-15}, ${y-15})`}>
                <Truck size={30} className={isSelected ? "text-slate-950" : "text-slate-500"} />
              </g>
              
              {isSelected && (
                <foreignObject x={x - 100} y={y - 100} width="200" height="60">
                   <div className="flex flex-col items-center">
                      <div className="px-3 py-1 bg-[#00F0FF] text-slate-950 text-[12px] font-black rounded-full shadow-[0_0_20px_rgba(0,240,255,0.5)]">
                        {truck.plate}
                      </div>
                      <div className="w-px h-10 bg-gradient-to-b from-[#00F0FF] to-transparent mt-1" />
                   </div>
                </foreignObject>
              )}
            </motion.g>
          );
        })}
      </svg>

      {/* 📟 Premium Overlay Interface */}
      <div className="absolute inset-0 pointer-events-none p-10 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="space-y-3">
             <div className="flex items-center gap-3">
                <div className="p-2.5 bg-neon-blue/10 border border-neon-blue/20 rounded-xl">
                  <Radar className="text-neon-blue w-6 h-6 animate-spin-slow" />
                </div>
                <div>
                   <h4 className="text-white font-black tracking-[0.2em] uppercase text-sm">Fleet Command Radar</h4>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Global Sync Active</p>
                   </div>
                </div>
             </div>
          </div>

          {selectedTruck && (
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-5 rounded-[2rem] flex items-center gap-6 shadow-2xl"
            >
               <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-neon-blue opacity-40" />
                    </div>
                  ))}
               </div>
               <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Güvenlik Durumu</p>
                  <p className="text-sm font-black text-[#76C893]">AI Analiz Edildi</p>
               </div>
            </motion.div>
          )}
        </div>

        <div className="flex justify-between items-end">
           <div className="p-6 bg-black/40 backdrop-blur-xl border border-white/5 rounded-[2rem] min-w-[280px]">
              <div className="flex items-center gap-4 mb-4">
                 <div className="p-2 bg-neon-blue/20 rounded-lg"><Zap className="text-neon-blue w-4 h-4" /></div>
                 <span className="text-[11px] font-black text-white uppercase tracking-widest">Sistem Metrikleri</span>
              </div>
              <div className="space-y-3">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Aktif Birimler</span>
                    <span className="text-xs font-black text-white">{trucks.length} Units</span>
                 </div>
                 <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div animate={{ width: ['20%', '80%', '40%'] }} transition={{ duration: 5, repeat: Infinity }} className="h-full bg-neon-blue" />
                 </div>
              </div>
           </div>

           <div className="text-right">
              <p className="text-[50px] font-black text-white leading-none tracking-tighter opacity-10">LOJITAK</p>
              <p className="text-[10px] font-black text-neon-blue uppercase tracking-[0.5em] mt-2">Precision Logistics</p>
           </div>
        </div>
      </div>

      {/* High-Tech Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ y: ['-100%', '200%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-full h-[30%] bg-gradient-to-b from-transparent via-neon-blue/5 to-transparent opacity-50"
        />
      </div>
    </div>
  );
};

export default RadarMap;
