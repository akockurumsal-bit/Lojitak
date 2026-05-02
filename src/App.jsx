import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './supabase';

// Modular Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import OverviewScreen from './components/OverviewScreen';
import MarketplaceScreen from './components/MarketplaceScreen';
import LogisticsScreen from './components/LogisticsScreen';
import EscrowScreen from './components/EscrowScreen';
import ProfileScreen from './components/ProfileScreen';
import LoginScreen from './components/LoginScreen';
import OfferDetailModal from './components/OfferDetailModal';

// Mock Data
const DEADSTOCK_ITEMS = [
  { id: 'd1', user_id: 'system', name: 'Alüminyum Profil', quantity: '1200 kg', location: 'Gebze OSB', value: '₺85.000', category: 'Hammadde', image: 'https://images.unsplash.com/photo-1533035353720-f1c6a75cd8ab?auto=format&fit=crop&q=80&w=400' },
  { id: 'd2', user_id: 'system', name: 'Polipropilen Granül', quantity: '5 Ton', location: 'İzmir AOSB', value: '₺240.000', category: 'Kimya', image: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&q=80&w=400' },
  { id: 'd3', user_id: 'system', name: 'Tekstil Kırpıntı', quantity: '800 kg', location: 'Bursa DOSAB', value: '₺12.000', category: 'Tekstil', image: 'https://images.unsplash.com/photo-1558583055-d7ac00b1adca?auto=format&fit=crop&q=80&w=400' },
  { id: 'd4', user_id: 'system', name: 'Çelik Rulo Sac', quantity: '2.5 Ton', location: 'Ereğli', value: '₺165.000', category: 'Metal', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400' }
];

export default function App() {
  const [activeScreen, setScreen] = useState('OVERVIEW');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(undefined);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedOfferId, setSelectedOfferId] = useState(null);
  const [logoPreview, setLogoPreview] = useState(localStorage.getItem('lojitak_logo') || null);

  useEffect(() => {
    if (logoPreview) localStorage.setItem('lojitak_logo', logoPreview);
  }, [logoPreview]);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) fetchProfile(currentUser.id);
      else setUser(null);
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) fetchProfile(currentUser.id);
      else setUserProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (uid) => {
    const { data, error } = await supabase.from('users').select('*').eq('id', uid).single();
    if (!error && data) setUserProfile(data);
    else {
      const { data: newData } = await supabase.from('users').upsert({ id: uid, company_name: 'YENİ FİRMA', sector: 'Genel', city: 'Bilinmiyor', total_savings: 0 }).select().single();
      if (newData) setUserProfile(newData);
    }
  };

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

  if (user === undefined) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-cyan-500 font-mono text-sm animate-pulse tracking-[0.3em]">LOJITAK BAŞLATILIYOR...</p>
      </div>
    </div>
  );

  if (!user) return <LoginScreen />;

  return (
    <div className="flex h-screen bg-[#0B1E2D] text-slate-200 font-sans overflow-hidden">
      <Sidebar 
        activeScreen={activeScreen} 
        setScreen={setScreen} 
        isOpen={isSidebarOpen} 
        toggle={() => setSidebarOpen(!isSidebarOpen)} 
        userProfile={userProfile}
        logoPreview={logoPreview}
      />

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <Header 
          title={screenTitle} 
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
          user={user} 
          onOfferClick={(id) => { setSelectedOfferId(id); setScreen('MARKETPLACE'); }}
        />
        
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div key={activeScreen} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}>
              {activeScreen === 'OVERVIEW' && <OverviewScreen setScreen={setScreen} />}
              {activeScreen === 'MARKETPLACE' && <MarketplaceScreen user={user} userProfile={userProfile} setSelectedOfferId={setSelectedOfferId} setScreen={setScreen} DEADSTOCK_ITEMS={DEADSTOCK_ITEMS} />}
              {activeScreen === 'LOGISTICS' && <LogisticsScreen showToast={(msg, type) => alert(`${type.toUpperCase()}: ${msg}`)} />}
              {activeScreen === 'ESCROW' && <EscrowScreen user={user} showToast={(msg) => alert(msg)} />}
              {activeScreen === 'PROFILE' && <ProfileScreen user={user} userProfile={userProfile} onSignOut={() => supabase.auth.signOut()} logoPreview={logoPreview} setLogoPreview={setLogoPreview} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {selectedOfferId && (
        <OfferDetailModal 
          offerId={selectedOfferId} 
          user={user} 
          userProfile={userProfile} 
          setScreen={setScreen}
          onClose={() => setSelectedOfferId(null)} 
        />
      )}
    </div>
  );
}
