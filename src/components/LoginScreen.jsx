import React, { useState } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../supabase';

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
        const { data, error: signUpError } = await supabase.auth.signUp({ 
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
        if (signUpError) throw signUpError;
        
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
          setIsRegister(false);
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err.message === 'Invalid login credentials' ? 'E-posta veya Şifre Yanlış' : err.message);
    } finally { setLoading(false); }
  };

  const SECTORS = ['Otomotiv', 'Tekstil', 'Kimya', 'Gıda', 'Elektronik', 'Lojistik', 'Savunma', 'Metal', 'Plastik', 'Diğer'];

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]"></div>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            LOJITAK<span className="text-orange-500">.</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm font-bold uppercase tracking-widest">Akıllı B2B Tedarik Zinciri Platformu</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex mb-8 bg-slate-950 rounded-2xl p-1.5 border border-slate-800">
            <button onClick={() => { setIsRegister(false); setError(null); }}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isRegister ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:text-white'}`}>Giriş</button>
            <button onClick={() => { setIsRegister(true); setError(null); }}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isRegister ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-white'}`}>Kayıt</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Firma Adı" required className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white focus:border-emerald-500 outline-none transition-all" />
                <div className="grid grid-cols-2 gap-4">
                  <select value={sector} onChange={e => setSector(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-sm text-white focus:border-emerald-500 outline-none">
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Şehir" required className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white focus:border-emerald-500 outline-none" />
                </div>
              </div>
            )}
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-posta" required className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white focus:border-cyan-500 outline-none transition-all" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Şifre" required className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white focus:border-cyan-500 outline-none transition-all" />
            
            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-xs font-bold text-center">{error}</div>}
            
            <button type="submit" disabled={loading} className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${isRegister ? 'bg-emerald-500 text-slate-900' : 'bg-cyan-500 text-slate-900'} shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50`}>
              {loading ? 'İşleniyor...' : (isRegister ? 'Hesap Oluştur' : 'Panele Giriş')}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
