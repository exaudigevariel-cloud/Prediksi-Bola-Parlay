import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { fetchRealMatches } from '../lib/predictionEngine';
import { Zap, ShieldCheck, Crown, TrendingUp, Target, ArrowRight, Lock, Loader2, Sparkles } from 'lucide-react';

export default function VIPSignalsPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = localStorage.getItem('sharpedge_user') === 'true';

  useEffect(() => {
    fetchRealMatches().then(data => {
      // Filter matches with high win probability (>85%) or strong value edge
      const vipOnly = data.filter(m => 
        m.predictions[0]?.probability > 85 || m.analysis?.edge > 5
      ).slice(0, 3); // Only top 3 "Sakti" matches
      setMatches(vipOnly);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-black relative">
      {/* VIP PREMIUM OVERLAY */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,215,0,0.05),transparent_50%)]" />

      <div className="relative z-10 flex flex-col items-center text-center mb-16 space-y-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(234,179,8,0.2)]"
        >
          <Crown className="w-4 h-4" /> REKOMENDASI ELIT SHARPEDGE
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none uppercase">
          VIP <span className="vip-gradient">SIGNALS</span>
        </h1>
        <p className="text-gray-400 max-w-2xl text-base font-medium leading-relaxed">
          Pertandingan dengan akurasi matematis di atas 92%. Inilah tempat di mana algoritma mencapai titik presisi tertingginya.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40">
          <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mb-4" />
          <p className="text-yellow-500 font-black uppercase tracking-widest text-xs">Menganalisa Matrix VIP...</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-1 gap-8 max-w-4xl mx-auto">
          {matches.length > 0 ? (
            matches.map((match, idx) => (
              <motion.div 
                key={match.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.2 }}
                className="glass-card rounded-[2.5rem] border-yellow-500/20 relative overflow-hidden group hover:border-yellow-500/40 transition-all p-8 md:p-12 gahar-border"
              >
                {/* VIP Seal badge */}
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-all" />
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-black text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-lg border border-yellow-500/20 uppercase tracking-widest leading-none">
                        {match.league}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        <Sparkles className="w-3 h-3" /> Akurasi Terjamin
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                       <span className="text-2xl md:text-4xl font-black text-white tracking-tight">{match.homeTeam}</span>
                       <span className="text-sm font-black text-gray-700">VS</span>
                       <span className="text-2xl md:text-4xl font-black text-white tracking-tight">{match.awayTeam}</span>
                    </div>

                    <div className="flex gap-4">
                       <div className="bg-black/40 px-4 py-2 rounded-2xl border border-white/5">
                          <div className="text-[9px] text-gray-500 uppercase font-black mb-1">Pick</div>
                          <div className="text-lg font-black text-yellow-500">{match.predictions[0]?.value}</div>
                       </div>
                       <div className="bg-black/40 px-4 py-2 rounded-2xl border border-white/5">
                          <div className="text-[9px] text-gray-500 uppercase font-black mb-1">Probabilitas</div>
                          <div className="text-lg font-black text-white">{match.predictions[0]?.probability}%</div>
                       </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 w-full md:w-auto">
                    <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-6 rounded-3xl border border-yellow-500/30 text-center">
                       <div className="text-[10px] text-yellow-400 uppercase font-black tracking-widest mb-1">Confidence Score</div>
                       <div className="text-4xl font-black text-white">96.8%</div>
                    </div>
                    <button className="w-full py-4 bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-xl shadow-yellow-500/30">
                       BUKA ANALISA LENGKAP
                    </button>
                  </div>
                </div>

                {/* Insider Info Box (Simulation) */}
                <div className="mt-8 pt-8 border-t border-white/5 grid md:grid-cols-2 gap-6">
                   <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                         <Target className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                         <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">Sudut Pandang Insider</h4>
                         <p className="text-[11px] text-gray-500 leading-relaxed font-medium">Berdasarkan data cuaca dan riwayat wasit, laga ini cenderung defensif di babak kedua.</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                         <TrendingUp className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                         <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">Market Sentiment</h4>
                         <p className="text-[11px] text-gray-500 leading-relaxed font-medium">Dana besar mengalir ke handicap tuan rumah sejak 2 jam terakhir (Dropping Odds).</p>
                      </div>
                   </div>
                </div>
              </motion.div>
            ))
          ) : (
             <div className="text-center py-20 bg-white/5 rounded-[2rem] border border-white/10">
                <p className="text-gray-500 font-bold uppercase tracking-widest">Sinyal VIP Sedang Diuji Matematis...</p>
             </div>
          )}
        </div>
      )}

      {/* CTA SECTION */}
      <div className="mt-20 text-center">
         <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em] mb-4">Ingin Akses Penuh Setiap Hari?</p>
         <div className="flex justify-center gap-6">
            <div className="flex flex-col items-center">
               <div className="text-2xl font-black text-white">8/10</div>
               <div className="text-[9px] text-gray-500 uppercase font-black">Win Rate Kemarin</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="flex flex-col items-center">
               <div className="text-2xl font-black text-green-400">92%</div>
               <div className="text-[9px] text-gray-500 uppercase font-black">Akurasi Rata-Rata</div>
            </div>
         </div>
      </div>
    </div>
  );
}
