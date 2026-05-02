import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRightLeft, X, Globe, RefreshCw, 
  CheckCircle2 
} from 'lucide-react';
import { supabase } from '../supabase';

const ChatWindow = ({ offerId, user, offer, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('offer_id', offerId)
        .order('created_at', { ascending: true });
      
      if (!error) setMessages(data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
    const sub = supabase.channel(`chat:${offerId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `offer_id=eq.${offerId}` }, 
        payload => setMessages(prev => [...prev, payload.new])
      ).subscribe();
    return () => supabase.removeChannel(sub);
  }, [offerId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    const msg = newMessage;
    setNewMessage('');
    try {
      const { error } = await supabase.from('messages').insert({ offer_id: offerId, sender_id: user.id, text: msg });
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
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="h-full w-full bg-slate-800 flex flex-col">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
        <h4 className="font-bold text-white flex items-center gap-2 uppercase tracking-tighter">
          <Globe className="text-neon-blue" size={18}/> Canlı Sohbet
        </h4>
        <div className="flex items-center gap-2">
          <button onClick={fetchMessages} className="p-1 text-slate-400 hover:text-neon-blue transition-all"><RefreshCw size={16} /></button>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20}/></button>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/30">
        {loading ? <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-blue"></div></div> : messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.sender_id === user?.id ? 'bg-cyan-500 text-slate-900 font-medium rounded-tr-none' : 'bg-slate-700 text-white rounded-tl-none border border-slate-600'}`}>
              {m.text}
              <p className={`text-[9px] mt-1 opacity-50 ${m.sender_id === user?.id ? 'text-slate-900' : 'text-slate-400'}`}>{new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="p-4 bg-slate-800 border-t border-slate-700 flex gap-2">
        <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Mesajınızı yazın..." className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-neon-blue text-sm" />
        <button type="submit" className="p-2 bg-cyan-500 text-slate-900 rounded-xl hover:bg-cyan-400 transition-all"><Globe size={20}/></button>
      </form>
    </div>
  );
};

const OfferDetailModal = ({ offerId, user, userProfile, onClose, setScreen }) => {
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showLogisticsPrompt, setShowLogisticsPrompt] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);

  useEffect(() => {
    const fetchOffer = async () => {
      if (!offerId) return;
      try {
        const { data, error } = await supabase.from('offers').select('*').eq('id', offerId).single();
        if (!error && data) {
          const { data: userData } = await supabase.from('users').select('company_name, email, phone, address').eq('id', data.from_user_id).single();
          const { data: itemData } = await supabase.from('market_items').select('user_id').eq('id', data.to_item_id).single();
          setOffer({ ...data, from_user: userData, to_user_id: itemData?.user_id });
        } else { onClose(); }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchOffer();
  }, [offerId]);

  const handleStatusUpdate = async (newStatus) => {
    if (!offer) return;
    try {
      const { error } = await supabase.from('offers').update({ status: newStatus }).eq('id', offerId);
      if (!error) {
        if (newStatus === 'accepted') {
          await supabase.from('market_items').delete().eq('id', offer.to_item_id);
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
        if (newStatus !== 'accepted') onClose();
      }
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue"></div></div>;
  if (!offer) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-slate-800 border border-slate-700 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden relative">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 italic"><ArrowRightLeft className="text-neon-orange" size={24}/> TEKLİF DETAYI</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24}/></button>
        </div>
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700"><p className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">İlan</p><h4 className="font-bold text-white">{offer.item_name}</h4></div>
            <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700"><p className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Durum</p><span className={`text-xs font-black px-3 py-1 rounded-full border ${(offer.status || 'pending') === 'pending' ? 'text-neon-orange border-neon-orange/30' : offer.status === 'accepted' ? 'text-neon-green border-neon-green/30' : 'text-red-400 border-red-500/30'}`}>{ (offer.status || 'pending').toUpperCase() }</span></div>
          </div>
          <div className="p-6 bg-slate-900 rounded-2xl border border-slate-700"><p className="text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Teklif Edilen Değer / Mal</p><p className="text-2xl font-black text-neon-green">{offer.offer_amount}</p>{offer.offer_note && <div className="mt-4 p-4 bg-slate-800 rounded-xl text-sm text-slate-300 italic border-l-4 border-neon-blue">"{offer.offer_note}"</div>}</div>
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
             <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-neon-blue font-bold">{offer.from_user?.company_name?.[0] || 'U'}</div><div><p className="text-sm font-bold text-white">{offer.from_user?.company_name || 'Firma Bilgisi'}</p><p className="text-[10px] text-slate-500 font-bold uppercase">Teklif Sahibi</p></div></div>
             <button onClick={() => setShowChat(true)} className="px-4 py-2 bg-neon-blue/10 border border-neon-blue text-neon-blue rounded-xl text-xs font-bold hover:bg-neon-blue/20 transition-all flex items-center gap-2"><Globe size={14}/> MESAJLAŞ</button>
          </div>
          {(offer.status || 'pending') === 'pending' && <div className="grid grid-cols-2 gap-4 pt-4"><button onClick={() => handleStatusUpdate('rejected')} className="py-4 bg-slate-800 border border-red-500/30 text-red-400 rounded-2xl font-black text-sm hover:bg-red-500/10">TEKLİFİ REDDET</button><button onClick={() => handleStatusUpdate('accepted')} className="py-4 bg-neon-green text-slate-900 rounded-2xl font-black text-sm hover:bg-neon-green/90 shadow-lg shadow-neon-green/20">TEKLİFİ ONAYLA</button></div>}
          {showLogisticsPrompt && <div className="mt-6 p-6 bg-slate-900 rounded-2xl border-2 border-neon-blue animate-pulse"><h4 className="text-white font-bold mb-2">🚀 AKILLI LOJİSTİK ÖZELLİĞİ</h4><p className="text-slate-400 text-sm mb-4">Takas onaylandı! Akıllı lojistik rotalarımızdan yararlanmak ister misiniz?</p><div className="flex gap-4"><button onClick={() => { setScreen('LOGISTICS'); onClose(); }} className="flex-1 py-2 bg-neon-blue text-slate-900 font-bold rounded-lg hover:bg-neon-blue/80">EVET, ROTA OLUŞTUR</button><button onClick={() => { setShowLogisticsPrompt(false); setShowContactInfo(true); }} className="flex-1 py-2 bg-slate-700 text-white font-bold rounded-lg">İLETİŞİM GÖR</button></div></div>}
          {showContactInfo && <div className="mt-6 p-6 bg-slate-900 rounded-2xl border border-neon-green"><h4 className="text-neon-green font-bold mb-3 flex items-center gap-2"><CheckCircle2 size={18}/> ŞİRKET İLETİŞİM BİLGİLERİ</h4><div className="space-y-2"><p className="text-white text-sm"><strong>Şirket:</strong> {offer.from_user?.company_name}</p><p className="text-white text-sm"><strong>Telefon:</strong> {offer.from_user?.phone || '+90 532 000 00 00'}</p><p className="text-white text-sm"><strong>E-posta:</strong> {offer.from_user?.email}</p></div><button onClick={onClose} className="w-full mt-4 py-2 bg-slate-800 text-slate-400 rounded-lg text-xs hover:text-white transition-all">TAMAM, KAPAT</button></div>}
        </div>
        {showChat && <div className="absolute inset-0 z-20"><ChatWindow offerId={offerId} user={user} offer={offer} onClose={() => setShowChat(false)} /></div>}
      </motion.div>
    </div>
  );
};

export default OfferDetailModal;
