import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, ShoppingBag, Truck, ShieldCheck } from 'lucide-react';

const Sidebar = ({ activeScreen, setScreen, isOpen, toggle, userProfile, logoPreview }) => {
  const menuItems = [
    { id: 'OVERVIEW', label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'MARKETPLACE', label: 'Stok Pazarı', icon: ShoppingBag },
    { id: 'LOGISTICS', label: 'Akıllı Lojistik', icon: Truck },
    { id: 'ESCROW', label: 'Güvenli Ödeme', icon: ShieldCheck },
  ];

  return (
    <>
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
              <img 
                src="/lojitak.jpeg" 
                alt="LOJITAK Logo" 
                className="h-32 w-auto object-contain filter invert-[1] hue-rotate-[180deg] brightness-[1.6] contrast-[1.4] mix-blend-screen"
                style={{ mixBlendMode: 'screen' }}
              />
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
              </button>
            ))}
          </nav>

          <div className="pt-8 mt-auto border-t border-slate-800">
            <div className="p-5 rounded-[1.5rem] bg-slate-900/50 border border-slate-800">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-teal-500/20 bg-white flex items-center justify-center">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
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
              <button onClick={() => setScreen('PROFILE')} className="w-full py-3 bg-slate-800 hover:bg-teal-500/10 hover:text-teal-400 text-slate-400 rounded-xl text-xs font-bold transition-all border border-transparent hover:border-teal-500/20">
                Hesabı Yönet
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
