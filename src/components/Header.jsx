import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, Search, Bell, Activity, X } from 'lucide-react';
import { supabase } from '../supabase';

const Header = ({ title, toggleSidebar, user, onOfferClick }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchNotifs = async () => {
      const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5);
      if (data) setNotifications(data);
    };
    fetchNotifs();
    const sub = supabase.channel('notifs').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, payload => {
      setNotifications(prev => [payload.new, ...prev.slice(0, 4)]);
    }).subscribe();
    return () => supabase.removeChannel(sub);
  }, [user]);

  return (
    <header className="h-20 border-b border-slate-800 bg-[#0B1E2D]/50 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors">
          <Menu size={24} />
        </button>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-[0.2em]">{title}</h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center bg-slate-900/50 border border-slate-800 rounded-full px-4 py-1.5 gap-3 group focus-within:border-teal-500/50 transition-all">
          <Search size={16} className="text-slate-500 group-focus-within:text-teal-400" />
          <input type="text" placeholder="İşlem veya ilan ara..." className="bg-transparent border-none outline-none text-sm text-slate-300 w-48 placeholder:text-slate-600" />
        </div>

        <div className="flex items-center gap-3 px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full">
          <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
          <span className="text-[10px] font-bold text-teal-500 uppercase tracking-wider">Sistem Aktif</span>
        </div>

        <div className="relative">
          <button onClick={() => setShowNotif(!showNotif)} className="relative p-2.5 text-slate-400 hover:text-white bg-slate-900/50 border border-slate-800 rounded-xl transition-all hover:border-slate-700">
            <Bell size={20} />
            {notifications.filter(n => !n.read).length > 0 && (
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
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-600 text-xs italic">Bildirim yok</div>
                  ) : notifications.map((n) => (
                    <div key={n.id} onClick={() => { if(n.reference_id) onOfferClick(n.reference_id); setShowNotif(false); }}
                      className="p-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition-all cursor-pointer group flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-slate-300 group-hover:text-white transition-colors">{n.message}</p>
                        <p className="text-[10px] text-slate-600 mt-2 font-medium">{new Date(n.created_at).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;
