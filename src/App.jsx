import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, ShoppingBag, Truck, ShieldCheck, 
  Menu, X, Bell, Search, ArrowUpRight, Leaf, 
  TrendingDown, ChevronRight, Globe, Star, Radar, Camera,
  Wallet, ArrowRightLeft, CheckCircle2, Clock, CreditCard, MapPin, Package,
  Activity, Box, DollarSign, RefreshCw, Zap, Navigation, Trash2
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './supabase';
import LogisticsScreen from './pages/LogisticsScreen';
import EscrowScreen from './components/EscrowScreen';

const IMGBB_API_KEY = '0b1eeb299a06bc1de5537afd171e7132';

// --- Mock Data ---
const DEADSTOCK_ITEMS = [
  { name: '2 Ton Plastik Granül', quantity: '2000 kg', location: 'Bursa OSB', value: '85000', category: 'Hammadde', image: 'https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&q=80&w=400' },
  { name: '500 Metre Denim Kumaş', quantity: '500 m', location: 'Denizli', value: '42000', category: 'Tekstil', image: 'https://images.unsplash.com/photo-1554189097-ffe88e998a2b?auto=format&fit=crop&q=80&w=400' },
  { name: '800 Adet Ahşap Palet', quantity: '800 Adet', location: 'İzmit', value: '12500', category: 'Lojistik', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=400' },
  { name: '150 Litre Boya İnceltici', quantity: '150 L', location: 'Kocaeli', value: '18000', category: 'Kimya', image: 'https://images.unsplash.com/photo-1574044536246-0486b48a7419?auto=format&fit=crop&q=80&w=400' },
];

// --- Components ---

const Sidebar = ({ activeScreen, setScreen, isOpen, toggle, userProfile, logoPreview }) => {
  const menuItems = [
    { id: 'OVERVIEW', label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'MARKETPLACE', label: 'Stok Pazarı', icon: ShoppingBag },
    { id: 'LOGISTICS', label: 'Akıllı Lojistik', icon: Truck },
    { id: 'ESCROW', label: 'Güvenli Ödeme', icon: ShieldCheck },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={toggle} className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[55] lg:hidden" />
        )}
      </AnimatePresence>

      <aside className={`fixed inset-y-0 left-0 z-[60] w-72 bg-[#121A24] border-r border-slate-800 transform transition-all duration-500 ease-in-out lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-8">
          <div className="flex flex-col gap-1 mb-10">
            <div className="flex items-center justify-start -ml-6 -mt-4">
              <div className="relative group cursor-pointer" onClick={() => setScreen('OVERVIEW')}>
                <img 
                  src="/lojitak.jpeg" 
                  alt="LOJITAK Logo" 
                  className="h-32 w-auto object-contain filter invert-[1] hue-rotate-[180deg] brightness-[1.6] contrast-[1.4] mix-blend-screen transition-transform active:scale-95"
                  style={{ mixBlendMode: 'screen' }}
                />
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <button key={item.id} onClick={() => { setScreen(item.id); if(window.innerWidth < 1024) toggle(); }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${
                  activeScreen === item.id 
                    ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' 
                    : 'text-slate-500 hover:text-white hover:bg-slate-800/50'
                }`}>
                <div className="flex items-center gap-4">
                  <item.icon size={20} className={activeScreen === item.id ? 'text-teal-400' : 'text-slate-500 group-hover:text-teal-400 transition-colors'} />
                  <span className="text-sm font-bold tracking-tight">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-black bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/30 uppercase">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="pt-8 mt-auto border-t border-slate-800">
            <div className="p-5 rounded-[1.5rem] bg-slate-900/50 border border-slate-800">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-teal-500/20 bg-white flex items-center justify-center relative">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Logo" 
                      className="w-full h-full object-contain p-1 transition-transform duration-500" 
                      onLoad={(e) => {
                        const { naturalWidth, naturalHeight } = e.target;
                        if (naturalWidth / naturalHeight > 1.2) {
                          e.target.style.transform = 'scale(1.25)';
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-teal-400 font-bold">
                      {userProfile?.company_name?.[0] || 'U'}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{userProfile?.company_name || 'Yönetici'}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Profesyonel Plan</p>
                </div>
              </div>
              <button onClick={() => setScreen('PROFILE')} className="w-full py-3 bg-slate-800 hover:bg-teal-500/10 hover:text-teal-400 text-slate-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-transparent hover:border-teal-500/20">
                Hesabı Yönet
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

const SEARCH_KEYWORDS = [
  { key: 'lojistik', label: 'Akıllı Lojistik', screen: 'LOGISTICS' },
  { key: 'nakliye', label: 'Akıllı Lojistik', screen: 'LOGISTICS' },
  { key: 'rota', label: 'Akıllı Lojistik', screen: 'LOGISTICS' },
  { key: 'pazar', label: 'Stok Pazarı', screen: 'MARKETPLACE' },
  { key: 'stok', label: 'Stok Pazarı', screen: 'MARKETPLACE' },
  { key: 'ilan', label: 'Stok Pazarı', screen: 'MARKETPLACE' },
  { key: 'cüzdan', label: 'Hesabım & Cüzdan', screen: 'PROFILE' },
  { key: 'bakiye', label: 'Hesabım & Cüzdan', screen: 'PROFILE' },
  { key: 'profil', label: 'Hesabım & Cüzdan', screen: 'PROFILE' },
  { key: 'genel', label: 'Genel Bakış', screen: 'OVERVIEW' },
  { key: 'ana', label: 'Genel Bakış', screen: 'OVERVIEW' },
];

const Header = ({ title, toggleSidebar, user, setScreen, onOfferClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const searchResults = useMemo(() => {
    if (searchQuery.length <= 1) return [];
    return SEARCH_KEYWORDS.filter(item => 
      item.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [lastViewed, setLastViewed] = useState(parseInt(localStorage.getItem('lojitak_last_viewed') || '0'));

  // Dismissed bildirim ID'lerini localStorage'da sakla
  const getDismissedIds = () => {
    try { return JSON.parse(localStorage.getItem('lojitak_dismissed_notifs') || '[]'); }
    catch { return []; }
  };
  const addDismissedId = (id) => {
    const current = getDismissedIds();
    localStorage.setItem('lojitak_dismissed_notifs', JSON.stringify([...new Set([...current, id])]));
  };

  useEffect(() => {
    if (!user) return;
    const fetchNotifs = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (data) {
        const dismissed = getDismissedIds();
        setNotifications(data.filter(n => !dismissed.includes(n.id)));
      }
    };
    fetchNotifs();
    const sub = supabase.channel('notifs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, payload => {
        const dismissed = getDismissedIds();
        if (!dismissed.includes(payload.new.id)) {
          setNotifications(prev => [payload.new, ...prev.slice(0, 9)]);
        }
      }).subscribe();
    return () => supabase.removeChannel(sub);
  }, [user]);

  // Yeni bildirim var mı kontrolü (turuncu nokta için)
  const hasUnread = useMemo(() => {
    if (notifications.length === 0) return false;
    const latestNotifTime = new Date(notifications[0].created_at).getTime();
    return latestNotifTime > lastViewed;
  }, [notifications, lastViewed]);

  const handleOpenNotif = () => {
    setShowNotif(!showNotif);
    if (!showNotif) {
      const now = Date.now();
      setLastViewed(now);
      localStorage.setItem('lojitak_last_viewed', now.toString());
    }
  };

  return (
    <header className="h-20 border-b border-slate-800 bg-[#0B1E2D]/50 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors">
          <Menu size={24} />
        </button>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-[0.2em]">{title}</h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <div className="flex items-center bg-slate-900/50 border border-slate-800 rounded-full px-4 py-1.5 gap-3 group focus-within:border-teal-500/50 transition-all">
            <Search size={16} className="text-slate-500 group-focus-within:text-teal-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="İşlem veya ilan ara..." 
              className="bg-transparent border-none outline-none text-sm text-slate-300 w-48 placeholder:text-slate-600" 
            />
          </div>

          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 mt-2 w-full bg-[#121A24] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 p-2"
              >
                {searchResults.map((result, idx) => (
                  <button 
                    key={idx}
                    onClick={() => {
                      setScreen(result.screen);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-3 hover:bg-teal-500/10 rounded-xl flex items-center gap-3 transition-all group"
                  >
                    <div className="p-2 bg-slate-900 rounded-lg group-hover:bg-teal-500/20">
                      <ChevronRight size={14} className="text-slate-500 group-hover:text-teal-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{result.label}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Hızlı Git</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3 px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full">
          <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
          <span className="text-[10px] font-bold text-teal-500 uppercase tracking-wider">Sistem Aktif</span>
        </div>

        <div className="relative">
          <button onClick={handleOpenNotif} className="relative p-2.5 text-slate-400 hover:text-white bg-slate-900/50 border border-slate-800 rounded-xl transition-all hover:border-slate-700">
            <Bell size={20} />
            {hasUnread && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full border-2 border-[#0B1E2D]"></span>
            )}
          </button>
          
          <AnimatePresence>
            {showNotif && (
              <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-4 w-80 bg-[#121A24] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bildirimler</h4>
                  <button onClick={() => setShowNotif(false)} className="text-slate-500 hover:text-white"><X size={14}/></button>
                </div>
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  <AnimatePresence initial={false}>
                    {notifications.length === 0 ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 text-center text-slate-600 text-xs italic">
                        Bildirim yok
                      </motion.div>
                    ) : notifications.map((n) => (
                      <motion.div 
                        key={n.id} 
                        initial={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50, height: 0, marginBottom: 0, padding: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => { if(n.reference_id) onOfferClick(n.reference_id); setShowNotif(false); }}
                        className="p-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition-all cursor-pointer group relative flex justify-between items-start gap-4 overflow-hidden"
                      >
                        <div className="flex-1">
                          <p className="text-sm text-slate-300 group-hover:text-white transition-colors leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-slate-600 mt-2 font-medium">{new Date(n.created_at).toLocaleTimeString()}</p>
                        </div>
                        <button 
                          onClick={async (e) => {
                            e.stopPropagation();
                            addDismissedId(n.id);
                            setNotifications(prev => prev.filter(notif => notif.id !== n.id));
                            supabase.from('notifications').delete().eq('id', n.id).then(() => {});
                          }}
                          className="shrink-0 p-1.5 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-lg transition-all border border-transparent hover:border-red-500/20"
                          title="Bildirimi sil"
                        >
                          <X size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

const NetworkBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
    <div className="absolute inset-0 bg-[#0B1E2D]"></div>
    <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-[#38A3A5]/5 rounded-full blur-[120px]"></div>
    <svg className="absolute inset-0 w-full h-full opacity-[0.05]" viewBox="0 0 1200 600">
      <motion.path d="M-100,200 Q600,100 1300,200" fill="none" stroke="#76C893" strokeWidth="1" strokeDasharray="8,8"
        animate={{ strokeDashoffset: [0, -100] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} />
      <motion.path d="M-100,400 Q600,500 1300,400" fill="none" stroke="#F59E0B" strokeWidth="1" strokeDasharray="8,8"
        animate={{ strokeDashoffset: [0, 100] }} transition={{ duration: 35, repeat: Infinity, ease: "linear" }} />
    </svg>
  </div>
);


// --- Screen Views ---

const OverviewScreen = ({ setScreen, setIsAnalysisModalOpen }) => {


  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* HERO SECTION - COMPACT PREMIUM */}
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

      {/* KPI GRID - IMPACTFUL & UNIFORM */}
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
        {/* LOGISTICS VISUALIZATION - ACTIVE ROUTES */}
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


        {/* AI INSIGHTS - PREMIUM SMART PANEL */}
        <div className="flex flex-col gap-8">
          <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#121A24] to-[#0B1E2D] border border-teal-500/20 shadow-2xl relative overflow-hidden group">
            
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

            <button 
              onClick={() => setIsAnalysisModalOpen(true)}
              className="w-full mt-8 py-4 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-teal-500 hover:text-[#0B1E2D] transition-all"
            >
              Detaylı Analiz Raporu
            </button>
          </div>

          {/* QUICK PERFORMANCE GRAPH (SMALL) */}
          <div className="flex-1 p-8 rounded-[2.5rem] bg-[#121A24] border border-slate-800/50 shadow-xl">
             <div className="flex items-center justify-between mb-6">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Haftalık Performans</h4>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
             </div>
             <div className="h-24 w-full" style={{ minWidth: '0px', width: '100%' }}>
                <ResponsiveContainer width="100%" height={100} minWidth={0} minHeight={0}>
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

const MarketplaceScreen = ({ user, userProfile, setSelectedOfferId, setScreen, showToast }) => {
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('MARKET'); // 'MARKET' or 'OFFERS'
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

  const fetchItems = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('market_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error) setItems(data || []);
    } catch (e) { console.error(e); }
  }, []);

  const fetchOffers = useCallback(async () => {
    if (!user) return;
    try {
      const { data: sentOffers } = await supabase
        .from('offers')
        .select('*')
        .eq('from_user_id', user.id);
      
      const { data: myItems } = await supabase
        .from('market_items')
        .select('id')
        .eq('user_id', user.id);
      
      const itemIds = myItems?.map(i => i.id) || [];
      let incomingOffers = [];
      if (itemIds.length > 0) {
        const { data: received } = await supabase
          .from('offers')
          .select('*')
          .in('to_item_id', itemIds);
        if (received) incomingOffers = received;
      }
      setMyOffers([...(sentOffers || []), ...incomingOffers].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (e) { console.error(e); }
  }, [user]);

  useEffect(() => {
    const sync = async () => {
      await fetchItems();
      await fetchOffers();
    };
    sync();
    window.refreshOffers = fetchOffers;

    const marketSub = supabase.channel('market_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'market_items' }, () => fetchItems())
      .subscribe();

    const offerSub = supabase.channel('offers_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'offers' }, () => fetchOffers())
      .subscribe();

    return () => {
      supabase.removeChannel(marketSub);
      supabase.removeChannel(offerSub);
    };
  }, [user, fetchItems, fetchOffers]);

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
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
          method: 'POST',
          body: formDataImg,
        });
        setUploadProgress(80);
        const data = await res.json();
        if (data.success) {
          imageUrl = data.data.url;
        }
        setUploadProgress(100);
      }
      const { error } = await supabase.from('market_items').insert({
        user_id: user.id,
        name: formData.name,
        quantity: formData.quantity.toLowerCase().includes('kg') ? formData.quantity : `${formData.quantity} kg`,
        location: formData.location,
        value: formData.value.toLowerCase().includes('tl') ? formData.value : `${formData.value} TL`,
        category: formData.category,
        image: imageUrl
      });

      if (error) {
        console.error("Supabase Hatası:", error);
        alert("İlan yüklenirken hata oluştu: " + error.message);
        return;
      }

      // Listeyi manuel yenile (Realtime ayarı kapalı olsa bile çalışması için)
      const { data: refreshedData } = await supabase
        .from('market_items')
        .select('*')
        .order('created_at', { ascending: false });
      if (refreshedData) setItems(refreshedData);

      setModalOpen(false);
      setFormData({ name: '', quantity: '', location: '', value: '', category: 'Hammadde' });
      setImageFile(null); setImagePreview(null); setUploadProgress(0);
      showToast("İlan başarıyla yüklendi!", "success");
    } catch (error) { 
      console.error("Beklenmedik Hata:", error); 
      showToast("Bir hata oluştu. Lütfen konsolu kontrol edin.", "error");
    }
    finally { setUploading(false); }
  };

  const handleClearAllItems = async () => {
    if (!window.confirm("Pazardaki TÜM ilanları silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;
    try {
      // Daha kapsayıcı bir filtre kullanarak tümünü silmeyi zorla
      const { error } = await supabase.from('market_items').delete().gte('created_at', '2000-01-01'); 
      if (error) throw error;
      
      setItems([]);
      if (fetchItems) fetchItems();
      showToast("Pazardaki tüm ilanlar temizlendi.", "success");
      
      // Cleanup notifications related to market items if needed
      await supabase.from('notifications').delete().eq('type', 'new_offer'); 
    } catch (err) {
      console.error(err);
      showToast("Silme işlemi başarısız.", "error");
    }
  };

  const handleSeedData = async () => {
    try {
      // Market Items Seed
      await supabase.from('market_items').insert(
        DEADSTOCK_ITEMS.map(item => ({ ...item, user_id: user?.id }))
      );

      // Cargo Pool Seed (Dopdolu Veri Havuzu)
      const demoTrucks = [
        { company: 'Öz Lojistik', from_city: 'İstanbul', to_city: 'Sofya (Bulgaristan)', departure_time: new Date(Date.now() + 3600000 * 2).toISOString(), total_capacity_kg: 20000, current_load_kg: 17000, price_full: 1500, star: 4.9, driver: 'Mehmet Y.' },
        { company: 'Yıldız Trans', from_city: 'İstanbul', to_city: 'Sofya (Bulgaristan)', departure_time: new Date(Date.now() + 3600000 * 5).toISOString(), total_capacity_kg: 20000, current_load_kg: 12000, price_full: 1800, star: 4.7, driver: 'Ahmet K.' },
        { company: 'Global Trans', from_city: 'Ankara', to_city: 'İzmir', departure_time: new Date(Date.now() + 3600000 * 4).toISOString(), total_capacity_kg: 20000, current_load_kg: 8000, price_full: 1500, star: 4.7, driver: 'Can K.' },
        { company: 'Birlik Nakliyat', from_city: 'Bursa', to_city: 'Selanik (Yunanistan)', departure_time: new Date(Date.now() + 3600000 * 1).toISOString(), total_capacity_kg: 20000, current_load_kg: 18400, price_full: 1500, star: 4.8, driver: 'Ahmet S.' },
        { company: 'Ege Lojistik', from_city: 'İzmir', to_city: 'İstanbul', departure_time: new Date(Date.now() + 3600000 * 8).toISOString(), total_capacity_kg: 20000, current_load_kg: 15000, price_full: 1200, star: 4.6, driver: 'Murat V.' },
        { company: 'Kafkas Lojistik', from_city: 'İstanbul', to_city: 'Gürcistan', departure_time: new Date(Date.now() + 3600000 * 12).toISOString(), total_capacity_kg: 20000, current_load_kg: 5000, price_full: 3500, star: 4.9, driver: 'Levan G.' },
        { company: 'Mersin Nakliyat', from_city: 'Mersin', to_city: 'Irak', departure_time: new Date(Date.now() + 3600000 * 3).toISOString(), total_capacity_kg: 20000, current_load_kg: 19000, price_full: 2800, star: 4.5, driver: 'Hüseyin B.' },
        { company: 'Avrupa Trans', from_city: 'İstanbul', to_city: 'Berlin (Almanya)', departure_time: new Date(Date.now() + 3600000 * 24).toISOString(), total_capacity_kg: 20000, current_load_kg: 14000, price_full: 4500, star: 4.9, driver: 'Hans M.' }
      ];
      await supabase.from('cargo_pool').insert(demoTrucks);

      alert("✅ Veritabanı onlarca aktif tır ve rota ile dolduruldu!");
    } catch (error) { console.error(error); }
  };

  const handleEscrow = async (item) => {
    if (!user) return;
    try {
      // 1. Fetch item owner's profile for company_name
      const { data: ownerProfile } = await supabase.from('users').select('company_name').eq('id', item.user_id).single();

      const { data: escrowData, error: escrowError } = await supabase.from('escrow_transactions').insert({
        title: item.name,
        amount: item.value,
        seller: ownerProfile?.company_name || 'Bilinmeyen Satıcı',
        buyer: userProfile?.company_name || user.email || 'Sistem Admin',
        status: 0,
        type: 'Marketplace'
      }).select().single();

      if (escrowData) {
        // 1. Notify Buyer
        await supabase.from('notifications').insert({
          user_id: user.id,
          message: `“${item.name}” için Güvenli Ödeme işlemi başlatıldı!`,
          type: 'escrow_started'
        });

        // 2. Notify Seller if exists
        if (item.user_id) {
          await supabase.from('notifications').insert({
            user_id: item.user_id,
            message: `“${item.name}” ürününüz için ${userProfile?.company_name || 'bir firma'} Güvenli Ödeme başlattı!`,
            type: 'escrow_received'
          });
        }

        if (setScreen) setScreen('ESCROW');
      } else if (escrowError) {
        console.error("Escrow Error:", escrowError);
        showToast("Escrow başlatılamadı: " + escrowError.message, "error");
      }
    } catch (err) { console.error(err); }
  };

  const handleOffer = async (e) => {
    e.preventDefault();
    if (!user || !offerModal) return;
    setIsOffering(true);
    try {
      // 1. Create the offer
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

      const newOfferId = offerData?.id;

      // 2. Notify the item owner (Receiver)
      console.log("Attempting to notify item owner. Owner ID:", offerModal.user_id);
      if (offerModal.user_id) {
        const { error: notifError } = await supabase.from('notifications').insert({
          user_id: offerModal.user_id,
          message: `${userProfile?.company_name || user.email} “${offerModal.name}” ilanınıza takas teklifi verdi!`,
          type: 'new_offer',
          reference_id: newOfferId
        });
        if (notifError) {
          console.error("Receiver Notification Error:", notifError);
          alert("❌ Bildirim karşı tarafa iletilemedi: " + notifError.message);
        } else {
          console.log("Receiver notified successfully.");
        }
      } else {
        console.error("CRITICAL: offerModal.user_id is missing!");
        alert("⚠️ HATA: İlanın sahibi sistemde kayıtlı değil. Lütfen 'Demo Veri Yükle' yaparak test edin.");
      }
      
      // 3. Notify the sender (Self)
      await supabase.from('notifications').insert({
        user_id: user.id,
        message: `“${offerModal.name}” için takas teklifiniz gönderildi.`,
        type: 'offer_sent',
        reference_id: newOfferId // Fix: Added reference_id for sender too
      });
      
      setOfferModal(null); setOfferAmount(''); setOfferNote('');
      showToast('Takas teklifiniz başarıyla gönderildi!', 'success');
      if (window.refreshOffers) window.refreshOffers();
    } catch (err) { 
      console.error("Offer Error:", err); 
      showToast('Teklif gönderilemedi. Lütfen tekrar deneyin.', 'error');
    } finally {
      setIsOffering(false);
    }
  };

  const openOfferModal = (item) => {
    setOfferAmount('');
    setOfferNote('');
    setOfferModal(item);
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
            <button onClick={() => setActiveTab('MARKET')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'MARKET' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>Pazar</button>
            <button onClick={() => { setActiveTab('OFFERS'); window.refreshOffers?.(); }} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'OFFERS' ? 'bg-[#76C893] text-[#0B1E2D]' : 'text-slate-400 hover:text-white'}`}>Tekliflerim</button>
          </div>
           {items.length === 0 ? (
             <button onClick={handleSeedData} className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-bold hover:bg-slate-600 transition-all">Demo Veri Yükle</button>
           ) : (
             <button onClick={handleClearAllItems} className="p-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-all" title="Tümünü Temizle">
               <Trash2 size={18} />
             </button>
           )}
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
                  {item.user_id === user.id ? (
                    <div className="col-span-2 py-2 text-[10px] font-black text-center text-slate-500 uppercase tracking-widest bg-slate-800/50 rounded-lg border border-slate-700/50 italic">
                      Kendi İlanınız
                    </div>
                  ) : (
                    <>
                      <button onClick={() => openOfferModal(item)} className="py-2 text-[11px] font-bold border border-slate-600 text-slate-300 rounded-lg hover:bg-neon-orange/10 hover:border-neon-orange hover:text-neon-orange transition-colors flex items-center justify-center gap-1"><ArrowRightLeft size={14} /> Takas</button>
                      <button onClick={() => handleEscrow(item)} className="py-2 text-[11px] font-bold bg-neon-blue/10 border border-neon-blue text-neon-blue rounded-lg hover:bg-neon-blue/20 hover:shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all flex items-center justify-center gap-1"><ShieldCheck size={14} /> Escrow</button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {myOffers.length === 0 ? (
            <div className="p-12 glass rounded-3xl border border-dashed border-slate-700 text-center">
              <ArrowRightLeft className="mx-auto text-slate-600 mb-4" size={48} />
              <p className="text-slate-400">Henüz bir takas teklifi yok.</p>
            </div>
          ) : myOffers.map((offer) => (
            <div key={offer.id} 
              onClick={() => setSelectedOfferId(offer.id)}
              className="p-6 glass rounded-2xl border border-slate-700 flex justify-between items-center hover:border-neon-blue/50 hover:bg-slate-800/40 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-slate-900 border transition-colors group-hover:border-neon-blue/40 ${offer.from_user_id === user.id ? 'text-neon-blue border-neon-blue/20' : 'text-neon-orange border-neon-orange/20'}`}>
                  <ArrowRightLeft size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white group-hover:text-neon-blue transition-colors">{offer.item_name}</h4>
                  <p className="text-xs text-slate-500">{offer.offer_amount} teklif edildi • {new Date(offer.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full border shadow-sm ${
                  offer.status === 'pending' ? 'text-neon-orange border-neon-orange/30 bg-neon-orange/5' : 
                  offer.status === 'accepted' ? 'text-neon-green border-neon-green/30 bg-neon-green/5' : 'text-red-400 border-red-500/30 bg-red-500/5'
                }`}>{offer.status.toUpperCase()}</span>
                <button className="text-slate-500 group-hover:text-white transition-colors">
                  <ArrowUpRight size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Yeni İlan Yükle</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddListing} className="space-y-4">
              {/* Görsel Yükleme */}
              <div>
                <label className="block text-xs text-slate-400 mb-2">Ürün Görseli</label>
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-neon-green/50 transition-colors overflow-hidden relative">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Önizleme" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <Package size={28} />
                      <span className="text-xs">Görsel seçmek için tıkla</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                {uploading && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-neon-green transition-all" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Yükleniyor... %{uploadProgress}</p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Ürün Adı</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Miktar</label>
                  <input required type="text" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} placeholder="Örn: 500 kg" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Değer</label>
                  <input required type="text" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} placeholder="₺15.000" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Konum</label>
                  <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Kategori</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green">
                    <option>Hammadde</option><option>Tekstil</option><option>Lojistik</option><option>Kimya</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={uploading} className="w-full py-3 mt-2 bg-neon-green text-slate-900 font-bold rounded-xl hover:bg-neon-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                {uploading ? `Yükleniyor... %${uploadProgress}` : 'Pazara Ekle'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
      {/* Takas Teklif Modalı */}
      {offerModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 border border-neon-orange/30 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ArrowRightLeft className="text-neon-orange" size={18}/> Takas Teklifi Gönder
              </h3>
              <button onClick={() => setOfferModal(null)} className="text-slate-400 hover:text-white"><X size={18}/></button>
            </div>
            <div className="bg-slate-900 rounded-xl p-3 mb-4 border border-slate-700">
              <p className="text-xs text-slate-400">Hedef İlan</p>
              <p className="text-sm font-bold text-white mt-1">{offerModal.name}</p>
              <p className="text-neon-green font-black">{offerModal.value}</p>
            </div>
            <form onSubmit={handleOffer} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Teklif Edilen Mal/Değer</label>
                <input required type="text" value={offerAmount} onChange={e => setOfferAmount(e.target.value)}
                  placeholder="Örn: 500 kg Plastik Granül veya ₺40.000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-neon-orange transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Notunuz (Opsiyonel)</label>
                <textarea value={offerNote} onChange={e => setOfferNote(e.target.value)}
                  placeholder="Teklifinizle ilgili özel notunuz..."
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-neon-orange transition-colors resize-none" />
              </div>
              <button type="submit" disabled={isOffering} className="w-full py-3 bg-neon-orange text-slate-900 font-bold rounded-xl hover:bg-neon-orange/90 shadow-[0_0_15px_rgba(255,95,31,0.3)] transition-all disabled:opacity-50">
                {isOffering ? 'Teklif Gönderiliyor...' : 'Takas Teklifini Gönder'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const ProfileScreen = ({ user, userProfile, onSignOut, logoPreview, setLogoPreview, showToast, fetchProfile }) => {
  const [activeTab, setActiveTab] = useState('WALLET');
  const fileInputRef = React.useRef(null);
  
  const sections = [
    { id: 'WALLET', label: 'Cüzdanım', icon: Wallet },
    { id: 'COMPANY', label: 'Şirket Bilgileri', icon: Box },
    { id: 'SECURITY', label: 'Güvenlik', icon: ShieldCheck },
  ];

  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = useCallback(async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (!error) setTransactions(data || []);
  }, [user.id]);

  useEffect(() => {
    const sync = async () => {
      await fetchTransactions();
    };
    sync();
    const sub = supabase.channel('wallet_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` }, fetchTransactions)
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, [user.id, fetchTransactions]);

  // Withdrawal States
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawStep, setWithdrawStep] = useState(1);
  const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvc: '', amount: '' });

  // Deposit States
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositStep, setWithdrawStepDeposit] = useState(1);
  const [depositCardData, setDepositCardData] = useState({ number: '', name: '', expiry: '', cvc: '', amount: '' });

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) return parts.join(' ');
    return value;
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const currentBalance = userProfile?.total_savings || 0;
    const requestedAmount = parseFloat(cardData.amount.replace('₺', '').replace(/\./g, '').replace(',', '.'));

    if (isNaN(requestedAmount) || requestedAmount <= 0) {
      showToast("Lütfen geçerli bir tutar girin.", "error");
      return;
    }

    if (requestedAmount > currentBalance) {
      showToast(`Yetersiz bakiye! En fazla ₺${currentBalance.toLocaleString()} aktarabilirsiniz.`, "error");
      return;
    }

    setWithdrawStep(2);

    try {
      await new Promise(resolve => setTimeout(resolve, 2500));

      const { error: cardError } = await supabase.from('payment_methods').insert({
        user_id: user.id,
        card_holder_name: cardData.name,
        last_four: cardData.number.slice(-4),
        encrypted_card_token: `TOK_AES256_${Math.random().toString(36).substring(7).toUpperCase()}`,
        bank_name: cardData.number.startsWith('4') ? 'Visa' : 'Mastercard'
      }).select().single();

      if (cardError) throw cardError;

      // Add transaction record
      await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'Giden',
        label: 'Karta Aktarım',
        amount: requestedAmount,
        status: 'completed'
      });

      // Update balance
      await supabase.from('users').update({ 
        total_savings: currentBalance - requestedAmount 
      }).eq('id', user.id);

      setWithdrawStep(3);
      if (fetchProfile) fetchProfile(user.id); // Update UI
      showToast("Transfer başarıyla kuyruğa alındı.", "success");
    } catch (err) {
      console.error(err);
      showToast("İşlem başarısız: " + err.message, "error");
      setWithdrawStep(1);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setWithdrawStepDeposit(2);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const amount = parseFloat(depositCardData.amount.replace('₺', '').replace(/\./g, '').replace(',', '.'));
      
      // Add transaction record
      await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'Gelen',
        label: 'Bakiye Yükleme',
        amount: amount,
        status: 'completed'
      });

      // Update balance
      await supabase.from('users').update({ 
        total_savings: (userProfile?.total_savings || 0) + amount 
      }).eq('id', user.id);

      showToast("₺" + depositCardData.amount + " başarıyla yüklendi.", "success");
      if (fetchProfile) fetchProfile(user.id); // Update UI
      setWithdrawStepDeposit(3);
    } catch {
      showToast("Yükleme başarısız.", "error");
      setWithdrawStepDeposit(1);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result;
        setLogoPreview(base64data);
        
        // Save to Supabase for this specific user
        const { error } = await supabase
          .from('users')
          .update({ logo_url: base64data })
          .eq('id', user.id);
          
        if (error) {
          console.error("Logo update error:", error);
          showToast("Logo kaydedilemedi.", "error");
        } else {
          showToast("Logo başarıyla güncellendi.", "success");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Nav */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-8 rounded-[2rem] bg-[#121A24] border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="relative group cursor-pointer mb-6" onClick={() => fileInputRef.current?.click()}>
                <div className="w-24 h-24 rounded-3xl bg-white flex items-center justify-center shadow-lg shadow-[#76C893]/20 overflow-hidden relative border-2 border-slate-800">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Logo" 
                      className="w-full h-full object-contain p-2 transition-transform duration-500" 
                      onLoad={(e) => {
                        const { naturalWidth, naturalHeight } = e.target;
                        if (naturalWidth / naturalHeight > 1.2) {
                          e.target.style.transform = 'scale(1.3)';
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#76C893] to-[#1B5E3C] text-3xl font-black text-[#0B1E2D]">
                       {userProfile?.company_name?.[0] || 'U'}
                    </div>
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-[#0B1E2D]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="text-[#76C893]" size={28} />
                  </div>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoChange} />
              </div>

              <h3 className="text-xl font-black text-white">{userProfile?.company_name || 'Firma Bilgisi'}</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">Profesyonel Plan Üyesi</p>
              
              <div className="w-full h-px bg-slate-800 my-8"></div>
              
              <div className="w-full space-y-2">
                {sections.map(s => (
                  <button key={s.id} onClick={() => setActiveTab(s.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold text-sm ${activeTab === s.id ? 'bg-[#76C893]/10 text-[#76C893] border border-[#76C893]/20' : 'text-slate-500 hover:text-white hover:bg-slate-800/50'}`}>
                    <s.icon size={18} />
                    {s.label}
                  </button>
                ))}
              </div>

              <button onClick={onSignOut} className="w-full mt-8 p-4 rounded-2xl border border-red-500/20 text-red-500 hover:bg-red-500/10 text-xs font-black uppercase tracking-widest transition-all">
                Oturumu Kapat
              </button>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-8">
          {activeTab === 'WALLET' && (
            <div className="space-y-6">
              {/* Wallet Card */}
              <div className="p-10 rounded-[2.5rem] bg-gradient-to-br from-[#121A24] to-[#0B1E2D] border border-slate-800 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#76C893]/5 rounded-full blur-[100px]"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-12">
                    <div className="p-4 bg-[#76C893]/20 rounded-2xl">
                      <Wallet className="text-[#76C893]" size={32} />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">LOJITAK PAY BAKİYE</p>
                      <h4 className="text-5xl font-black text-white tracking-tighter">
                        ₺{(userProfile?.total_savings || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </h4>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <button onClick={() => setIsDepositOpen(true)} className="flex items-center justify-center gap-2 p-4 bg-[#76C893] text-[#0B1E2D] rounded-2xl font-black text-xs hover:scale-[1.02] transition-all active:scale-95 shadow-lg shadow-[#76C893]/20">
                      <ArrowUpRight size={18}/> Bakiye Yükle
                    </button>
                    <button onClick={() => setIsWithdrawOpen(true)} className="flex items-center justify-center gap-2 p-4 bg-teal-500/10 border border-teal-500/30 text-teal-400 rounded-2xl font-black text-xs hover:bg-teal-500/20 transition-all">
                      <CreditCard size={18}/> Karta Aktar
                    </button>
                    <button className="flex items-center justify-center gap-2 p-4 bg-slate-900 border border-slate-800 text-white rounded-2xl font-black text-xs hover:bg-slate-800 transition-all">
                      <RefreshCw size={18}/> Geçmiş
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="p-8 rounded-[2rem] bg-[#121A24] border border-slate-800 shadow-xl">
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Son Finansal Hareketler</h4>
                <div className="space-y-4">
                  {transactions.length === 0 ? (
                    <p className="text-center py-8 text-xs text-slate-600 italic">Henüz bir hareket yok.</p>
                  ) : transactions.map((t, i) => (
                    <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-slate-900/50 border border-slate-800/50">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg bg-slate-800 ${t.type === 'Gelen' ? 'text-[#76C893]' : 'text-red-400'}`}>
                          {t.type === 'Gelen' ? <ArrowUpRight size={16}/> : <TrendingDown size={16}/>}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{t.label}</p>
                          <p className="text-[10px] text-slate-500">{new Date(t.created_at).toLocaleDateString('tr-TR')}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-black ${t.type === 'Gelen' ? 'text-[#76C893]' : 'text-red-400'}`}>
                        {t.type === 'Gelen' ? '+' : '-'}₺{t.amount.toLocaleString('tr-TR')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'COMPANY' && (
            <div className="p-10 rounded-[2.5rem] bg-[#121A24] border border-slate-800 shadow-2xl space-y-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-amber-500/10 rounded-2xl">
                  <Box className="text-amber-500" size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Kurumsal Bilgiler</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Şirket Profili ve Resmi Veriler</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Şirket Unvanı</label>
                  <input type="text" defaultValue={userProfile?.company_name} className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white focus:border-[#76C893] outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Vergi Numarası / Mersis</label>
                  <input type="text" placeholder="Örn: 1234567890" className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white focus:border-[#76C893] outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sektör</label>
                  <select className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white focus:border-[#76C893] outline-none transition-all">
                    <option>Üretim & Sanayi</option>
                    <option>Lojistik & Depolama</option>
                    <option>Hammadde Tedarik</option>
                    <option>Tekstil</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Şehir</label>
                  <input type="text" placeholder="Örn: İstanbul" className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white focus:border-[#76C893] outline-none transition-all" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Resmi Adres</label>
                  <textarea rows="3" className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white focus:border-[#76C893] outline-none transition-all resize-none"></textarea>
                </div>
              </div>

              <button className="w-full py-5 bg-[#76C893] text-[#0B1E2D] rounded-2xl font-black text-sm hover:shadow-lg hover:shadow-[#76C893]/20 transition-all">
                Bilgileri Güncelle
              </button>
            </div>
          )}

              {activeTab === 'SECURITY' && (
                <SecuritySection onSignOut={onSignOut} userProfile={userProfile} showToast={showToast} />
              )}
        </div>
      </div>

      {/* Deposit Modal */}
      <AnimatePresence>
        {isDepositOpen && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#121A24] border border-slate-800 p-8 rounded-[2.5rem] w-full max-w-md shadow-3xl overflow-hidden relative">
              
              {depositStep === 1 && (
                <>
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-xl font-black text-white">Bakiye Yükle</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">GÜVENLİ ÖDEME ALTYAPISI</p>
                    </div>
                    <button onClick={() => setIsDepositOpen(false)} className="p-2 text-slate-500 hover:text-white"><X size={20}/></button>
                  </div>

                  <form onSubmit={handleDeposit} className="space-y-4">
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-[#76C893]/20 to-slate-900 border border-[#76C893]/20 mb-6 relative overflow-hidden group">
                      <CreditCard className="absolute top-4 right-4 text-[#76C893] opacity-20 group-hover:scale-110 transition-transform" size={48} />
                      <div className="space-y-4 relative z-10">
                        <input type="text" placeholder="KART NUMARASI" maxLength={19} value={depositCardData.number} 
                          onChange={e => setDepositCardData({...depositCardData, number: formatCardNumber(e.target.value)})}
                          className="w-full bg-transparent border-none p-0 text-xl font-black tracking-[0.2em] text-white placeholder:text-slate-700 outline-none" required />
                        <div className="flex gap-4">
                          <input type="text" placeholder="AA/YY" maxLength={5} value={depositCardData.expiry} onChange={e => setDepositCardData({...depositCardData, expiry: e.target.value})}
                            className="w-20 bg-transparent border-none p-0 text-sm font-bold text-[#76C893] placeholder:text-slate-700 outline-none" required />
                          <input type="text" placeholder="CVC" maxLength={3} value={depositCardData.cvc} onChange={e => setDepositCardData({...depositCardData, cvc: e.target.value})}
                            className="w-12 bg-transparent border-none p-0 text-sm font-bold text-[#76C893] placeholder:text-slate-700 outline-none" required />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">KART SAHİBİ</label>
                        <input type="text" value={depositCardData.name} onChange={e => setDepositCardData({...depositCardData, name: e.target.value})}
                          className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-[#76C893]/50 transition-all" required />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">YÜKLENECEK TUTAR</label>
                        <input type="text" value={depositCardData.amount} onChange={e => setDepositCardData({...depositCardData, amount: e.target.value})}
                          placeholder="₺0,00" className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-xl font-black text-[#76C893] outline-none focus:border-[#76C893]/50 transition-all" required />
                      </div>
                    </div>

                    <button type="submit" className="w-full py-5 bg-[#76C893] text-[#0B1E2D] rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-lg shadow-[#76C893]/20 hover:scale-[1.02] active:scale-95 transition-all mt-4">
                      ÖDEMEYİ TAMAMLA
                    </button>
                  </form>
                </>
              )}

              {depositStep === 2 && (
                <div className="py-12 text-center space-y-8">
                  <div className="relative mx-auto w-24 h-24">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="absolute inset-0 border-4 border-[#76C893]/20 border-t-[#76C893] rounded-full" />
                    <ShieldCheck className="absolute inset-0 m-auto text-[#76C893] animate-pulse" size={32} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white">İşlem Doğrulanıyor...</h4>
                    <p className="text-xs text-slate-500 font-bold mt-2">3D Secure & AES-256 Güvenlik Katmanı</p>
                  </div>
                </div>
              )}

              {depositStep === 3 && (
                <div className="py-12 text-center space-y-6">
                  <div className="w-20 h-20 bg-[#76C893]/20 rounded-3xl flex items-center justify-center mx-auto text-[#76C893]">
                    <CheckCircle2 size={48} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-white">Yükleme Başarılı!</h4>
                    <p className="text-sm text-slate-400 mt-2">₺{depositCardData.amount} tutarındaki bakiye hesabınıza anında yansıtılmıştır.</p>
                  </div>
                  <button onClick={() => setIsDepositOpen(false)} className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-all">
                    PANELE DÖN
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Withdrawal Modal */}
      <AnimatePresence>
        {isWithdrawOpen && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#121A24] border border-slate-800 p-8 rounded-[2.5rem] w-full max-w-md shadow-3xl overflow-hidden relative">
              
              {withdrawStep === 1 && (
                <>
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-xl font-black text-white">Bakiye Transferi</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">PCI-DSS GÜVENLİ KART AKTARIMI</p>
                    </div>
                    <button onClick={() => setIsWithdrawOpen(false)} className="p-2 text-slate-500 hover:text-white"><X size={20}/></button>
                  </div>

                  <form onSubmit={handleWithdraw} className="space-y-4">
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-teal-500/20 to-slate-900 border border-teal-500/20 mb-6 relative overflow-hidden group">
                      <CreditCard className="absolute top-4 right-4 text-teal-400 opacity-20 group-hover:scale-110 transition-transform" size={48} />
                      <div className="space-y-4 relative z-10">
                        <input type="text" placeholder="KART NUMARASI" maxLength={19} value={cardData.number} 
                          onChange={e => setCardData({...cardData, number: formatCardNumber(e.target.value)})}
                          className="w-full bg-transparent border-none p-0 text-xl font-black tracking-[0.2em] text-white placeholder:text-slate-700 outline-none" required />
                        <div className="flex gap-4">
                          <input type="text" placeholder="AA/YY" maxLength={5} value={cardData.expiry} onChange={e => setCardData({...cardData, expiry: e.target.value})}
                            className="w-20 bg-transparent border-none p-0 text-sm font-bold text-teal-400 placeholder:text-slate-700 outline-none" required />
                          <input type="text" placeholder="CVC" maxLength={3} value={cardData.cvc} onChange={e => setCardData({...cardData, cvc: e.target.value})}
                            className="w-12 bg-transparent border-none p-0 text-sm font-bold text-teal-400 placeholder:text-slate-700 outline-none" required />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">KART SAHİBİ</label>
                        <input type="text" value={cardData.name} onChange={e => setCardData({...cardData, name: e.target.value})}
                          className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-teal-500/50 transition-all" required />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1 px-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AKTARILACAK TUTAR</label>
                          <button type="button" onClick={() => setCardData({...cardData, amount: '12450'})} 
                            className="text-[10px] font-black text-teal-400 hover:text-teal-300 transition-colors uppercase tracking-widest">Tümünü Aktar</button>
                        </div>
                        <input type="text" value={cardData.amount} onChange={e => setCardData({...cardData, amount: e.target.value})}
                          placeholder="₺0,00" className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-xl font-black text-teal-400 outline-none focus:border-teal-500/50 transition-all" required />
                      </div>
                    </div>

                    <button type="submit" className="w-full py-5 bg-[#76C893] text-[#0B1E2D] rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-lg shadow-[#76C893]/20 hover:scale-[1.02] active:scale-95 transition-all mt-4">
                      GÜVENLİ TRANSFERİ BAŞLAT
                    </button>
                  </form>
                </>
              )}

              {withdrawStep === 2 && (
                <div className="py-12 text-center space-y-8">
                  <div className="relative mx-auto w-24 h-24">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="absolute inset-0 border-4 border-teal-500/20 border-t-teal-500 rounded-full" />
                    <Radar className="absolute inset-0 m-auto text-teal-500 animate-pulse" size={32} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white">Vault İşleniyor...</h4>
                    <p className="text-xs text-slate-500 font-bold mt-2">AES-256 GCM Algoritması ile Şifreleniyor</p>
                  </div>
                  <div className="flex flex-col gap-2 max-w-[200px] mx-auto">
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 2.5 }} className="h-full bg-teal-500" />
                    </div>
                    <p className="text-[10px] text-teal-500 font-black uppercase tracking-widest">Endüstriyel Güvenlik Aktif</p>
                  </div>
                </div>
              )}

              {withdrawStep === 3 && (
                <div className="py-12 text-center space-y-6">
                  <div className="w-20 h-20 bg-teal-500/20 rounded-3xl flex items-center justify-center mx-auto text-teal-500">
                    <CheckCircle2 size={48} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-white">Transfer Başlatıldı!</h4>
                    <p className="text-sm text-slate-400 mt-2">₺{cardData.amount} tutarındaki bakiyeniz kayıtlı kartınıza 1-3 iş günü içinde aktarılacaktır.</p>
                  </div>
                  <button onClick={() => setIsWithdrawOpen(false)} className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-all">
                    PANELE DÖN
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SecuritySection = ({ onSignOut, userProfile, showToast }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert('Yeni şifre en az 6 karakter olmalıdır!');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      showToast('Şifreniz başarıyla güncellendi! Lütfen tekrar giriş yapın.', 'success');
      onSignOut();
    } catch (err) {
      showToast('Hata: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 rounded-[2.5rem] bg-[#121A24] border border-slate-800 shadow-2xl space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-[#38A3A5]/10 rounded-2xl">
          <ShieldCheck className="text-[#38A3A5]" size={32} />
        </div>
        <div>
          <h3 className="text-xl font-black text-white">Güvenlik ve Erişim</h3>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Hesap Güvenliği Ayarları</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex justify-between items-center group hover:border-[#76C893]/30 transition-all">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl transition-all ${is2FAEnabled ? 'bg-[#76C893]/20 text-[#76C893]' : 'bg-slate-800 text-teal-400'}`}>
              <Zap size={20} className={is2FAEnabled ? 'animate-pulse' : ''}/>
            </div>
            <div>
              <p className="text-sm font-bold text-white">İki Faktörlü Doğrulama (2FA)</p>
              <p className="text-xs text-slate-500">{is2FAEnabled ? 'Hesabınız ek bir katmanla korunuyor.' : 'Hesabınızı ek bir katmanla koruyun.'}</p>
            </div>
          </div>
          <button 
            onClick={() => is2FAEnabled ? setIs2FAEnabled(false) : setShow2FAModal(true)}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              is2FAEnabled 
                ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white' 
                : 'bg-slate-800 text-slate-300 hover:bg-[#76C893] hover:text-[#0B1E2D]'
            }`}
          >
            {is2FAEnabled ? 'Devre Dışı Bırak' : 'Aktifleştir'}
          </button>
        </div>

        <form onSubmit={handlePasswordUpdate} className="space-y-4 pt-6 border-t border-slate-800">
           <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Şifre Değiştir</h4>
           <div className="grid grid-cols-1 gap-4">
              <input 
                type="password" 
                placeholder="Mevcut Şifre" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white focus:border-[#76C893] outline-none transition-all" 
              />
              <input 
                type="password" 
                placeholder="Yeni Şifre" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white focus:border-[#76C893] outline-none transition-all" 
              />
              <button 
                type="submit"
                disabled={loading}
                className="py-4 bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#38A3A5] hover:text-white transition-all disabled:opacity-50"
              >
                {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
              </button>
           </div>
        </form>
      </div>

      {/* 2FA Modal Simulation */}
      <AnimatePresence>
        {show2FAModal && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#121A24] border border-slate-800 p-8 rounded-[2.5rem] w-full max-w-sm text-center shadow-3xl"
            >
              <div className="w-20 h-20 bg-[#76C893]/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-[#76C893]">
                <Radar size={40} className="animate-pulse" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">2FA Kurulumu</h3>
              <p className="text-slate-400 text-xs mb-8">Authenticator uygulamanız ile aşağıdaki QR kodu taratın.</p>
              
              <div className="w-56 h-56 bg-white p-4 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-lg shadow-[#76C893]/10 relative group">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/LOJITAK:${userProfile?.company_name || 'Admin'}?secret=LOJITAK777SECRET&issuer=LOJITAK`}
                  alt="QR Code"
                  className="w-full h-full object-contain transition-transform group-hover:scale-105 duration-500"
                />
                <div className="absolute inset-0 border-2 border-[#76C893]/20 rounded-3xl pointer-events-none"></div>
              </div>

              <div className="space-y-4">
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="6 Haneli Kod" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-center text-xl font-black tracking-[0.5em] text-[#76C893] outline-none" 
                />
                <div className="flex gap-4">
                  <button onClick={() => setShow2FAModal(false)} className="flex-1 py-4 bg-slate-800 text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest">İptal</button>
                  <button 
                    onClick={() => {
                      setIs2FAEnabled(true);
                      setShow2FAModal(false);
                      alert('2FA Başarıyla Aktif Edildi!');
                    }} 
                    className="flex-1 py-4 bg-[#76C893] text-[#0B1E2D] rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-[#76C893]/20"
                  >
                    Onayla
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};








// --- Login Screen ---
const LoginScreen = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [sector, setSector] = useState('Otomotiv');
  const [city, setCity] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              company_name: companyName,
              sector: sector,
              city: city
            }
          }
        });
        if (error) throw error;
        
        if (data.user) {
          await supabase.from('users').upsert({
            id: data.user.id,
            company_name: companyName,
            sector: sector,
            city: city,
            email: email,
            total_savings: 0,
          });
          alert("Kayıt başarılı! Lütfen giriş yapın.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      const message = err.message === 'Invalid login credentials' ? 'E-posta veya Şifre Yanlış' : (err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
      setError(message);
    } finally { setLoading(false); }
  };

  const SECTORS = ['Otomotiv', 'Tekstil', 'Kimya', 'Gıda', 'Elektronik', 'Lojistik', 'Savunma', 'Metal', 'Plastik', 'Diğer'];

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-neon-blue/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-neon-green/5 rounded-full blur-[120px]"></div>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="relative group mb-4">
            <img 
              src="/lojitak.jpeg" 
              alt="LOJITAK Logo" 
              className="h-48 w-auto object-contain filter invert-[1] hue-rotate-[180deg] brightness-[1.6] contrast-[1.4] mix-blend-screen scale-110"
              style={{ mixBlendMode: 'screen' }}
            />
          </div>
          <p className="text-slate-400 text-xs font-black tracking-[0.3em] uppercase opacity-60">Akıllı B2B Tedarik Zinciri Platformu</p>
        </div>

        <div className="glass border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
          <div className="flex mb-6 bg-slate-800 rounded-xl p-1">
            <button onClick={() => { setIsRegister(false); setError(null); }}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                !isRegister ? 'bg-neon-blue text-slate-900 shadow-[0_0_10px_rgba(0,240,255,0.3)]' : 'text-slate-400 hover:text-white'
              }`}>Giriş Yap</button>
            <button onClick={() => { setIsRegister(true); setError(null); }}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                isRegister ? 'bg-neon-green text-slate-900 shadow-[0_0_10px_rgba(57,255,20,0.3)]' : 'text-slate-400 hover:text-white'
              }`}>Kayıt Ol</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {isRegister && (<>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Firma Adı</label>
                <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
                  placeholder="Örn: Vestel A.Ş." required={isRegister}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-neon-green transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Sektör</label>
                  <select value={sector} onChange={e => setSector(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neon-green transition-colors text-sm">
                    {SECTORS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Şehir</label>
                  <input type="text" value={city} onChange={e => setCity(e.target.value)}
                    placeholder="Örn: İstanbul" required={isRegister}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-neon-green transition-colors text-sm" />
                </div>
              </div>
            </>)}
            <div>
              <label className="block text-xs text-slate-400 mb-1">E-posta</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="sirket@example.com" required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-neon-blue transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Şifre</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••" required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-neon-blue transition-colors" />
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
            )}
            <button type="submit" disabled={loading}
              className={`w-full py-3 mt-1 font-bold rounded-xl transition-all disabled:opacity-50 ${
                isRegister 
                  ? 'bg-neon-green text-slate-900 hover:bg-neon-green/90 shadow-[0_0_15px_rgba(57,255,20,0.2)]'
                  : 'bg-neon-blue text-slate-900 hover:bg-neon-blue/90 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
              }`}>
              {loading ? 'Lütfen bekleyin...' : (isRegister ? 'Hesap Oluştur' : 'Panele Giriş Yap')}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// --- Toast Component ---
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]',
    error: 'border-red-500/50 bg-red-500/10 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.1)]',
    info: 'border-neon-blue/50 bg-neon-blue/10 text-neon-blue shadow-[0_0_20px_rgba(0,240,255,0.1)]',
    warning: 'border-amber-500/50 bg-amber-500/10 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
  };

  const icons = {
    success: <CheckCircle2 size={18} />,
    error: <X size={18} />,
    info: <Zap size={18} />,
    warning: <Bell size={18} />
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className={`fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl border backdrop-blur-md ${colors[type] || colors.info}`}
    >
      <span className="shrink-0">{icons[type] || icons.info}</span>
      <p className="text-sm font-bold tracking-tight">{message}</p>
      <button onClick={onClose} className="ml-4 p-1 hover:bg-white/10 rounded-lg transition-colors">
        <X size={14} />
      </button>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [activeScreen, setScreen] = useState('OVERVIEW');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(undefined);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedOfferId, setSelectedOfferId] = useState(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
  };

  const fetchProfile = useCallback(async (uid) => {
    let { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', uid)
      .single();
    
    if (error || !data) {
      // Auto-create profile if missing
      const { data: newData } = await supabase
        .from('users')
        .upsert({
          id: uid,
          email: user?.email || '',
          company_name: 'YENI FIRMA',
          sector: 'Genel',
          city: 'Bilinmiyor',
          total_savings: 0,
          logo_url: null
        })
        .select()
        .single();
      if (newData) {
        setUserProfile(newData);
        setLogoPreview(newData.logo_url);
      }
    } else {
      setUserProfile(data);
      setLogoPreview(data.logo_url);
    }
  }, [user?.email]);

  useEffect(() => {
    // Initial Session Check
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setUser(null);
      }
    };
    checkSession();

    // Supabase Auth Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // --- REALTIME SUBSCRIPTION FOR AUTOMATIC BALANCE UPDATE ---
  useEffect(() => {
    if (!user?.id) return;

    const channelName = `profile_updates_${user.id}`;
    const profileSub = supabase.channel(channelName)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'users', 
        filter: `id=eq.${user.id}` 
      }, payload => {
        console.log("Realtime Profile Update:", payload.new);
        setUserProfile(payload.new);
        if (payload.new.logo_url) setLogoPreview(payload.new.logo_url);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profileSub);
    };
  }, [user?.id]);

  const screenTitle = useMemo(() => {
    switch (activeScreen) {
      case 'OVERVIEW': return 'Genel Bakış Kontrol Paneli';
      case 'MARKETPLACE': return 'Atıl Stok & Takas Pazarı';
      case 'LOGISTICS': return 'Akıllı Lojistik Planlayıcı';
      case 'ESCROW': return 'Güvenli Ödeme Takibi';
      case 'PROFILE': return 'Hesap Yönetimi & Profil';
      default: return 'Lojitak';
    }
  }, [activeScreen]);

  // Loading state while Firebase auth initializes
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neon-blue font-mono text-sm animate-pulse">LOJITAK BAĞLAŁIYOR...</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  return (
    <div className="flex h-screen bg-slate-900 text-slate-200 font-sans overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-neon-blue/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-neon-orange/5 rounded-full blur-[120px] pointer-events-none"></div>

      <Sidebar 
        activeScreen={activeScreen} 
        setScreen={setScreen} 
        isOpen={isSidebarOpen} 
        toggle={() => setSidebarOpen(!isSidebarOpen)} 
        user={user}
        userProfile={userProfile}
        onSignOut={() => supabase.auth.signOut()}
        logoPreview={logoPreview}
      />

      <div className="flex-1 flex flex-col relative z-10">
        <Header 
          title={screenTitle} 
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
          user={user} 
          setScreen={setScreen} 
          onOfferClick={(id) => setSelectedOfferId(id)}
          showToast={showToast}
        />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={activeScreen} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}>
              {activeScreen === 'OVERVIEW' && <OverviewScreen setScreen={setScreen} showToast={showToast} setIsAnalysisModalOpen={setIsAnalysisModalOpen} />}
              {activeScreen === 'MARKETPLACE' && <MarketplaceScreen user={user} userProfile={userProfile} setSelectedOfferId={setSelectedOfferId} setScreen={setScreen} showToast={showToast} />}
              {activeScreen === 'LOGISTICS' && <LogisticsScreen user={user} userProfile={userProfile} setScreen={setScreen} showToast={showToast} />}
              {activeScreen === 'ESCROW' && <EscrowScreen user={user} userProfile={userProfile} showToast={showToast} refreshProfile={() => fetchProfile(user.id)} />}
              {activeScreen === 'PROFILE' && <ProfileScreen user={user} userProfile={userProfile} onSignOut={() => supabase.auth.signOut()} logoPreview={logoPreview} setLogoPreview={setLogoPreview} showToast={showToast} fetchProfile={() => fetchProfile(user.id)} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Modals */}
      {selectedOfferId && (
        <OfferDetailModal 
          offerId={selectedOfferId} 
          user={user} 
          userProfile={userProfile} 
          setScreen={setScreen}
          onClose={() => setSelectedOfferId(null)} 
          showToast={showToast}
        />
      )}
      {isAnalysisModalOpen && (
        <AnalysisReportModal onClose={() => setIsAnalysisModalOpen(false)} />
      )}
      {toast && (
        <Toast {...toast} onClose={() => setToast(null)} />
      )}
    </div>
  );
}

// --- Offer Detail & Chat Components ---

const OfferDetailModal = ({ offerId, user, onClose, setScreen, showToast }) => {
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const fetchOffer = async () => {
      if (!offerId) return;
      console.log("OfferDetailModal: Fetching Offer ID ->", offerId);
      try {
        const { data, error } = await supabase
          .from('offers')
          .select('*')
          .eq('id', offerId)
          .single();
        
        if (!error && data) {
          const { data: userData } = await supabase
            .from('users')
            .select('company_name, email, phone, address')
            .eq('id', data.from_user_id)
            .single();
            
          const { data: itemData } = await supabase
            .from('market_items')
            .select('user_id')
            .eq('id', data.to_item_id)
            .single();
          
          setOffer({ ...data, from_user: userData, to_user_id: itemData?.user_id });
        } else {
          console.error("Offer fetch error:", error);
          alert("Teklif bulunamadı.");
          onClose();
        }
      } catch (e) {
        console.error("Critical fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchOffer();
  }, [offerId, onClose]);

  const [showLogisticsPrompt, setShowLogisticsPrompt] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);

  const handleStatusUpdate = async (newStatus) => {
    if (!offer) return;
    try {
      const { error } = await supabase
        .from('offers')
        .update({ status: newStatus })
        .eq('id', offerId);
      
      if (!error) {
        if (newStatus === 'accepted') {
          // 1. Remove item from marketplace automatically (Silent deletion)
          await supabase.from('market_items').delete().eq('id', offer.to_item_id);
          
          // 2. Show logistics prompt within the modal
          setShowLogisticsPrompt(true);
        }

        setOffer(prev => ({ ...prev, status: newStatus }));
        const isReceiver = offer.to_user_id === user?.id;
        const targetUserId = isReceiver ? offer.from_user_id : offer.to_user_id;
        if (targetUserId) {
          await supabase.from('notifications').insert({
            user_id: targetUserId,
            message: `“${offer.item_name}” için yaptığınız teklif ${newStatus === 'accepted' ? 'onaylandı' : 'reddedildi'}.`,
            type: 'offer_status_change',
            reference_id: offerId
          });
        }
        if (newStatus !== 'accepted') {
          showToast(`Teklif ${newStatus === 'rejected' ? 'reddedildi' : 'güncellendi'}.`, "info");
          onClose();
        }
      }
    } catch (e) { console.error(e); }
  };

  if (loading) return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue"></div>
    </div>
  );

  if (!offer) return null;

  const isReceiver = offer.to_user_id === user?.id;

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-slate-800 border border-slate-700 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden relative">
        
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 italic">
            <ArrowRightLeft className="text-neon-orange" size={24}/> TEKLİF DETAYI
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24}/></button>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700">
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">İlan</p>
              <h4 className="font-bold text-white">{offer.item_name}</h4>
            </div>
            <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700">
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Durum</p>
              <span className={`text-xs font-black px-3 py-1 rounded-full border ${
                (offer.status || 'pending') === 'pending' ? 'text-neon-orange border-neon-orange/30 bg-neon-orange/5' : 
                offer.status === 'accepted' ? 'text-neon-green border-neon-green/30 bg-neon-green/5' : 'text-red-400 border-red-500/30 bg-red-500/5'
              }`}>{ (offer.status || 'pending').toUpperCase() }</span>
            </div>
          </div>

          <div className="p-6 bg-slate-900 rounded-2xl border border-slate-700">
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Teklif Edilen Değer / Mal</p>
            <p className="text-2xl font-black text-neon-green drop-shadow-[0_0_8px_rgba(57,255,20,0.4)]">{offer.offer_amount}</p>
            {offer.offer_note && (
              <div className="mt-4 p-4 bg-slate-800 rounded-xl text-sm text-slate-300 italic border-l-4 border-neon-blue">
                "{offer.offer_note}"
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-neon-blue font-bold border border-neon-blue/20">
                  {offer.from_user?.company_name?.[0] || 'U'}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{offer.from_user?.company_name || offer.from_user?.email || 'Firma Bilgisi'}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Teklif Sahibi</p>
                </div>
             </div>
             <button onClick={() => setShowChat(true)} className="px-4 py-2 bg-neon-blue/10 border border-neon-blue text-neon-blue rounded-xl text-xs font-bold hover:bg-neon-blue/20 transition-all flex items-center gap-2">
               <Globe size={14}/> MESAJLAŞ
             </button>
          </div>

          {/* Actions */}
          {offer.status === 'pending' && (
            isReceiver ? (
              <div className="grid grid-cols-2 gap-4 pt-4">
                <button onClick={() => handleStatusUpdate('rejected')} className="py-4 bg-slate-800 border border-red-500/30 text-red-400 rounded-2xl font-black text-sm hover:bg-red-500/10 transition-all">TEKLİFİ REDDET</button>
                <button onClick={() => handleStatusUpdate('accepted')} className="py-4 bg-neon-green text-slate-900 rounded-2xl font-black text-sm hover:bg-neon-green/90 shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all">TEKLİFİ ONAYLA</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 pt-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-center gap-2 py-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                    <Clock size={16} className="text-amber-500 animate-pulse" />
                    <span className="text-xs font-black text-amber-500 uppercase tracking-widest">Teklif Onay Bekliyor...</span>
                  </div>
                  <button onClick={() => handleStatusUpdate('rejected')} className="py-4 bg-slate-900 border border-slate-700 text-slate-400 rounded-2xl font-black text-sm hover:text-red-400 hover:border-red-500/30 transition-all">TEKLİFİ GERİ ÇEK</button>
                </div>
              </div>
            )
          )}

          {showLogisticsPrompt && (
            <div className="mt-6 p-6 bg-slate-900 rounded-2xl border-2 border-neon-blue animate-pulse">
              <h4 className="text-white font-bold mb-2">🚀 AKILLI LOJİSTİK ÖZELLİĞİ</h4>
              <p className="text-slate-400 text-sm mb-4">Takas onaylandı! Ürün nakliyesi için yapay zeka destekli akıllı lojistik rotalarımızdan yararlanmak ister misiniz?</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => { setScreen('LOGISTICS'); onClose(); }} 
                  className="flex-1 py-2 bg-neon-blue text-slate-900 font-bold rounded-lg hover:bg-neon-blue/80 transition-all"
                >EVET, ROTA OLUŞTUR</button>
                <button 
                  onClick={() => { setShowLogisticsPrompt(false); setShowContactInfo(true); }}
                  className="flex-1 py-2 bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-600 transition-all"
                >HAYIR, İLETİŞİM GÖR</button>
              </div>
            </div>
          )}

          {showContactInfo && (
            <div className="mt-6 p-6 bg-slate-900 rounded-2xl border border-neon-green">
              <h4 className="text-neon-green font-bold mb-3 flex items-center gap-2">
                <CheckCircle2 size={18}/> ŞİRKET İLETİŞİM BİLGİLERİ
              </h4>
              <div className="space-y-2">
                <p className="text-white text-sm"><strong>Şirket:</strong> {offer.from_user?.company_name}</p>
                <p className="text-white text-sm"><strong>Telefon:</strong> {offer.from_user?.phone || '+90 532 000 00 00'}</p>
                <p className="text-white text-sm"><strong>E-posta:</strong> {offer.from_user?.email}</p>
                <p className="text-white text-sm"><strong>Adres:</strong> {offer.from_user?.address || 'Merkez Ofis, İstanbul'}</p>
              </div>
              <button onClick={onClose} className="w-full mt-4 py-2 bg-slate-800 text-slate-400 rounded-lg text-xs hover:text-white transition-all">TAMAM, KAPAT</button>
            </div>
          )}
        </div>

        {showChat && (
          <div className="absolute inset-0 z-20">
            <ChatWindow 
              offerId={offerId} 
              user={user} 
              offer={offer} 
              onClose={() => setShowChat(false)} 
              showToast={showToast}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
};

const ChatWindow = ({ offerId, user, offer, onClose, showToast }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = React.useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('offer_id', offerId)
          .order('created_at', { ascending: true });
        
        if (!error && data) setMessages(data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchMessages();

    const sub = supabase.channel(`chat_${offerId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `offer_id=eq.${offerId}` }, 
        payload => setMessages(prev => [...prev, payload.new])
      ).subscribe();

    return () => supabase.removeChannel(sub);
  }, [offerId, onClose]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    const msg = newMessage;
    setNewMessage('');
    try {
      const { error } = await supabase.from('messages').insert({
        offer_id: offerId,
        sender_id: user.id,
        text: msg
      });
      if (error) throw error;

      const isReceiver = offer?.to_user_id === user?.id;
      const targetUserId = isReceiver ? offer.from_user_id : offer.to_user_id;
      if (targetUserId) {
        await supabase.from('notifications').insert({
          user_id: targetUserId,
          message: `Yeni mesaj: "${msg.substring(0, 30)}..."`,
          type: 'new_message',
          reference_id: offerId
        });
      }
    } catch (e) { 
      console.error(e);
      showToast("Mesaj gönderilemedi.", "error");
    }
  };

  const isReceiver = offer?.to_user_id === user?.id;
  const otherPartyName = isReceiver ? (offer?.from_user?.company_name || 'Teklif Sahibi') : 'İlan Sahibi';
  const otherPartyInitial = otherPartyName[0];

  return (
    <div className="h-full w-full bg-[#0B1E2D] flex flex-col">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#121A24]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-lg">
            {otherPartyInitial}
          </div>
          <div>
            <h4 className="font-bold text-white text-sm leading-tight">{otherPartyName}</h4>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Aktif</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors"><X size={20}/></button>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center py-10"><RefreshCw className="animate-spin text-teal-500" /></div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10 text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">Sohbeti Başlatın</div>
        ) : messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] p-3.5 rounded-2xl text-sm ${
              m.sender_id === user?.id 
                ? 'bg-teal-500 text-slate-950 font-bold rounded-tr-none shadow-[0_0_20px_rgba(20,184,166,0.15)]' 
                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
            }`}>
              {m.text}
              <p className={`text-[9px] mt-1.5 opacity-60 font-bold ${m.sender_id === user?.id ? 'text-slate-900' : 'text-slate-500'}`}>
                {new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-[#121A24]/80 backdrop-blur-md border-t border-slate-800 flex gap-3">
        <input 
          type="text" 
          value={newMessage} 
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Mesajınızı yazın..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-teal-500/50 transition-all"
        />
        <button type="submit" className="p-3.5 bg-teal-500 text-slate-950 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-teal-500/10">
          <Navigation className="rotate-90" size={20} />
        </button>
      </form>
    </div>
  );
};
const AnalysisReportModal = ({ onClose }) => {
  const reportData = [
    { name: 'Pzt', efficiency: 65, cost: 4000 },
    { name: 'Sal', efficiency: 72, cost: 3800 },
    { name: 'Çar', efficiency: 85, cost: 3200 },
    { name: 'Per', efficiency: 78, cost: 3500 },
    { name: 'Cum', efficiency: 92, cost: 2800 },
    { name: 'Cmt', efficiency: 88, cost: 2900 },
    { name: 'Paz', efficiency: 95, cost: 2400 },
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[150] flex items-center justify-center p-4 lg:p-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        className="bg-[#121A24] border border-slate-800 w-full max-w-6xl h-full max-h-[90vh] rounded-[3rem] shadow-3xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-[#0B1E2D]/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-500/20 rounded-2xl">
              <Activity className="text-teal-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Kurumsal Verimlilik Analizi</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Yapay Zeka Tarafından Hazırlanmıştır • Son Güncelleme: Az Önce</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-800 text-slate-400 hover:text-white rounded-2xl transition-all"><X size={24} /></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-12 custom-scrollbar">
          
          {/* Executive Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'TOPLAM TASARRUF', val: '₺142.400', icon: DollarSign, color: 'text-[#76C893]' },
              { label: 'LOJİSTİK PUANI', val: '94/100', icon: Star, color: 'text-amber-400' },
              { label: 'CO2 AZALTIMI', val: '2.4 Ton', icon: Leaf, color: 'text-[#38A3A5]' },
              { label: 'STOK DÖNÜŞÜMÜ', val: '%68', icon: Activity, color: 'text-purple-400' }
            ].map((stat, i) => (
              <div key={i} className="p-6 rounded-[2rem] bg-slate-900/50 border border-slate-800">
                <stat.icon className={`${stat.color} mb-4`} size={20} />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                <h4 className="text-2xl font-black text-white mt-1">{stat.val}</h4>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-8 rounded-[2.5rem] bg-[#0B1E2D] border border-slate-800">
              <h4 className="text-sm font-black text-white uppercase tracking-widest mb-8">Verimlilik Trendi (%)</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart data={reportData}>
                    <defs>
                      <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#121A24', border: '1px solid #1e293b', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="efficiency" stroke="#14b8a6" strokeWidth={3} fill="url(#colorEff)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-[#0B1E2D] border border-slate-800">
              <h4 className="text-sm font-black text-white uppercase tracking-widest mb-8">Lojistik Maliyet Analizi (₺)</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart data={reportData}>
                    <defs>
                      <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#121A24', border: '1px solid #1e293b', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={3} fill="url(#colorCost)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* AI Strategy Section */}
          <div className="p-10 rounded-[3rem] bg-gradient-to-br from-[#14b8a6]/10 to-transparent border border-[#14b8a6]/20">
            <h4 className="text-lg font-black text-white mb-6 flex items-center gap-3">
              <Zap className="text-teal-400" /> Stratejik AI Önerileri
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h5 className="text-xs font-black text-teal-500 uppercase tracking-[0.2em]">Kısa Vadeli Aksiyonlar</h5>
                <ul className="space-y-3">
                  {[
                    'Ege bölgesi sevkiyatlarını Salı gününde konsolide edin (%12 tasarruf).',
                    'Atıl durumda bekleyen 2 ton plastik hammadde için takas teklifi verin.',
                    'Düşük verimlilikli Mersin rotasını optimizasyon listesine alın.'
                  ].map((task, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-300 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 shrink-0" />
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <h5 className="text-xs font-black text-purple-500 uppercase tracking-[0.2em]">Uzun Vadeli Vizyon</h5>
                <p className="text-sm text-slate-400 leading-relaxed italic">
                  "Şirketiniz şu anki trend ile yıl sonunda karbon ayak izini %24 oranında azaltabilir. 
                  Bu durum, yeşil lojistik sertifikasyonu almanıza ve yeni pazarlarda avantaj yakalamanıza olanak tanıyacaktır."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-800 flex justify-end gap-4 bg-[#0B1E2D]/30">
          <button className="px-8 py-3 bg-slate-800 text-slate-300 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all">PDF Olarak İndir</button>
          <button onClick={onClose} className="px-8 py-3 bg-teal-500 text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Anlaşıldı</button>
        </div>
      </motion.div>
    </div>
  );
};
