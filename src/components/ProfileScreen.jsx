import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, Box, ShieldCheck, ArrowUpRight, 
  RefreshCw, TrendingDown, Zap, Radar, Camera 
} from 'lucide-react';
import { supabase } from '../supabase';

const SecuritySection = ({ onSignOut }) => {
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
      alert('Şifreniz başarıyla güncellendi! Lütfen yeni şifrenizle tekrar giriş yapın.');
      onSignOut();
    } catch (err) { alert('Hata: ' + err.message); }
    finally { setLoading(false); }
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
          <button onClick={() => is2FAEnabled ? setIs2FAEnabled(false) : setShow2FAModal(true)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${is2FAEnabled ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-slate-800 text-slate-300 hover:bg-[#76C893]'}`}>{is2FAEnabled ? 'Devre Dışı Bırak' : 'Aktifleştir'}</button>
        </div>

        <form onSubmit={handlePasswordUpdate} className="space-y-4 pt-6 border-t border-slate-800">
           <input type="password" placeholder="Mevcut Şifre" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white" />
           <input type="password" placeholder="Yeni Şifre" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white" />
           <button type="submit" disabled={loading} className="w-full py-4 bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#38A3A5] transition-all disabled:opacity-50">{loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}</button>
        </form>
      </div>

      <AnimatePresence>
        {show2FAModal && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-[#121A24] border border-slate-800 p-8 rounded-[2.5rem] w-full max-w-sm text-center">
              <Radar size={40} className="mx-auto mb-6 text-[#76C893] animate-pulse" />
              <h3 className="text-xl font-black text-white mb-2">2FA Kurulumu</h3>
              <div className="w-56 h-56 bg-white p-4 rounded-3xl mx-auto mb-8 flex items-center justify-center relative">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/LOJITAK?secret=LOJITAK777SECRET&issuer=LOJITAK`} alt="QR" className="w-full h-full object-contain" />
              </div>
              <div className="flex gap-4">
                <button onClick={() => setShow2FAModal(false)} className="flex-1 py-4 bg-slate-800 text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest">İptal</button>
                <button onClick={() => { setIs2FAEnabled(true); setShow2FAModal(false); alert('2FA Başarıyla Aktif Edildi!'); }} className="flex-1 py-4 bg-[#76C893] text-[#0B1E2D] rounded-2xl text-xs font-black uppercase tracking-widest">Onayla</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProfileScreen = ({ user, userProfile, onSignOut, logoPreview, setLogoPreview }) => {
  const [activeTab, setActiveTab] = useState('WALLET');
  const fileInputRef = useRef(null);
  
  const sections = [
    { id: 'WALLET', label: 'Cüzdanım', icon: Wallet },
    { id: 'COMPANY', label: 'Şirket Bilgileri', icon: Box },
    { id: 'SECURITY', label: 'Güvenlik', icon: ShieldCheck },
  ];

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="p-8 rounded-[2rem] bg-[#121A24] border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="relative group cursor-pointer mb-6" onClick={() => fileInputRef.current?.click()}>
                <div className="w-24 h-24 rounded-3xl bg-white flex items-center justify-center overflow-hidden relative border-2 border-slate-800">
                  {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" /> : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#76C893] to-[#1B5E3C] text-3xl font-black text-[#0B1E2D]">{userProfile?.company_name?.[0] || 'U'}</div>}
                  <div className="absolute inset-0 bg-[#0B1E2D]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Camera className="text-[#76C893]" size={28} /></div>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setLogoPreview(reader.result);
                    reader.readAsDataURL(file);
                  }
                }} />
              </div>
              <h3 className="text-xl font-black text-white">{userProfile?.company_name || 'Firma Bilgisi'}</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">Profesyonel Plan Üyesi</p>
              <div className="w-full h-px bg-slate-800 my-8"></div>
              <div className="w-full space-y-2">
                {sections.map(s => (
                  <button key={s.id} onClick={() => setActiveTab(s.id)} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold text-sm ${activeTab === s.id ? 'bg-[#76C893]/10 text-[#76C893] border border-[#76C893]/20' : 'text-slate-500 hover:text-white hover:bg-slate-800/50'}`}>
                    <s.icon size={18} /> {s.label}
                  </button>
                ))}
              </div>
              <button onClick={onSignOut} className="w-full mt-8 p-4 rounded-2xl border border-red-500/20 text-red-500 hover:bg-red-500/10 text-xs font-black uppercase tracking-widest transition-all">Oturumu Kapat</button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          {activeTab === 'WALLET' && (
            <div className="space-y-6">
              <div className="p-10 rounded-[2.5rem] bg-gradient-to-br from-[#121A24] to-[#0B1E2D] border border-slate-800 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#76C893]/5 rounded-full blur-[100px]"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-12">
                    <div className="p-4 bg-[#76C893]/20 rounded-2xl"><Wallet className="text-[#76C893]" size={32} /></div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">LOJITAK PAY BAKİYE</p>
                      <h4 className="text-5xl font-black text-white tracking-tighter">₺12.450,00</h4>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button className="flex items-center justify-center gap-3 p-5 bg-[#76C893] text-[#0B1E2D] rounded-2xl font-black text-sm shadow-lg shadow-[#76C893]/20">Bakiye Yükle</button>
                    <button className="flex items-center justify-center gap-3 p-5 bg-slate-900 border border-slate-800 text-white rounded-2xl font-black text-sm">Geçmiş İşlemler</button>
                  </div>
                </div>
              </div>
              <div className="p-8 rounded-[2rem] bg-[#121A24] border border-slate-800 shadow-xl">
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Son Finansal Hareketler</h4>
                <div className="space-y-4">
                  {[{ type: 'Gelen', label: 'Takas Ödemesi', val: '+₺2.400', date: 'Bugün', color: 'text-[#76C893]' }, { type: 'Giden', label: 'Lojistik Kapasite Satın Alımı', val: '-₺850', date: 'Dün', color: 'text-red-400' }].map((t, i) => (
                    <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-slate-900/50 border border-slate-800/50">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg bg-slate-800 ${t.color}`}>{t.type === 'Gelen' ? <ArrowUpRight size={16}/> : <TrendingDown size={16}/>}</div>
                        <div><p className="text-sm font-bold text-white">{t.label}</p><p className="text-[10px] text-slate-500">{t.date}</p></div>
                      </div>
                      <span className={`text-sm font-black ${t.color}`}>{t.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'COMPANY' && (
            <div className="p-10 rounded-[2.5rem] bg-[#121A24] border border-slate-800 shadow-2xl space-y-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-amber-500/10 rounded-2xl"><Box className="text-amber-500" size={32} /></div>
                <div><h3 className="text-xl font-black text-white">Kurumsal Bilgiler</h3><p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Şirket Profili ve Resmi Veriler</p></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" defaultValue={userProfile?.company_name} placeholder="Şirket Unvanı" className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white focus:border-[#76C893] outline-none transition-all" />
                <input type="text" placeholder="Vergi Numarası" className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white focus:border-[#76C893] outline-none transition-all" />
              </div>
              <button className="w-full py-5 bg-[#76C893] text-[#0B1E2D] rounded-2xl font-black text-sm hover:shadow-lg shadow-[#76C893]/20 transition-all">Bilgileri Güncelle</button>
            </div>
          )}

          {activeTab === 'SECURITY' && <SecuritySection onSignOut={onSignOut} />}
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
