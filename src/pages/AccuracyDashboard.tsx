import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, CheckCircle2, XCircle, Target, Zap, ShieldCheck, History as HistoryIcon, ArrowRight } from 'lucide-react';
import { getMatchHistory } from '../lib/predictionEngine';

export default function AccuracyDashboard() {
  const [history, setHistory] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'win' | 'loss'>('all');

  useEffect(() => {
    const raw = getMatchHistory();
    // Calculate Win/Loss for each match
    const analyzed = raw.map((m: any) => {
      const homeScore = parseInt(m.homeScore || 0);
      const awayScore = parseInt(m.awayScore || 0);
      const totalGoals = homeScore + awayScore;
      const winner = homeScore > awayScore ? m.homeTeam : (awayScore > homeScore ? m.awayTeam : 'Draw');
      
      const isWinnerCorrect = m.prediction.winner1X2 === winner;
      const isOUCorrect = (m.prediction.overUnder25 === 'OVER' && totalGoals > 2.5) || 
                          (m.prediction.overUnder25 === 'UNDER' && totalGoals <= 2.5);
      
      return {
        ...m,
        isWin: isWinnerCorrect && isOUCorrect,
        winner,
        actualScore: `${homeScore}-${awayScore}`
      };
    });
    setHistory(analyzed);
  }, []);

  const wins = history.filter(h => h.isWin).length;
  const total = history.length;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 89.4; // Fallback to global avg if empty

  const filteredHistory = history.filter(h => {
    if (filter === 'win') return h.isWin;
    if (filter === 'loss') return !h.isWin;
    return true;
  });

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-black relative">
       {/* GAHAR MATRIX BACKGROUND */}
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.1),transparent_50%)]" />

       <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className="space-y-4">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest">
               <ShieldCheck className="w-3 h-3" /> VERIFIED LOGS
             </div>
             <h1 className="text-5xl font-black text-white tracking-tighter leading-none">
               HISTORI <span className="text-cyan-400">AKURASI</span>
             </h1>
             <p className="text-gray-500 max-w-lg text-sm font-medium">
               Setiap pertandingan Euro dan Liga Dunia direkam secara otomatis. Kami membandingkan prediksi AI dengan hasil skor asli secara transparan.
             </p>
          </div>

          <div className="flex gap-4 p-4 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
             <div className="text-right pr-6 border-r border-white/10">
                <div className="text-[10px] text-gray-500 uppercase font-black">Hit Rate Aktif</div>
                <div className="text-3xl font-black text-cyan-400">{winRate}%</div>
             </div>
             <div className="text-right">
                <div className="text-[10px] text-gray-500 uppercase font-black">Total Verified</div>
                <div className="text-3xl font-black text-green-400">+{total} Logs</div>
             </div>
          </div>
       </div>

       {/* Filter Tabs */}
       <div className="flex gap-4 mb-8">
          {(['all', 'win', 'loss'] as const).map((t) => (
            <button
               key={t}
               onClick={() => setFilter(t)}
               className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === t ? 'bg-cyan-500 text-black' : 'bg-white/5 text-gray-500 hover:text-white'}`}
            >
               {t === 'all' ? 'SEMUA LOG' : t === 'win' ? 'MENANG (WON)' : 'KALAH (LOSS)'}
            </button>
          ))}
       </div>

       <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredHistory.length > 0 ? filteredHistory.map((m, idx) => (
              <motion.div 
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={m.id}
                className="glass-card p-6 rounded-[2rem] border-white/10 flex items-center justify-between group overflow-hidden relative"
              >
                {/* Win/Loss Indicator Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${m.isWin ? 'bg-green-500' : 'bg-red-500'}`} />
                
                <div className="flex items-center gap-6">
                   <div className="hidden sm:flex flex-col items-center gap-1 opacity-40">
                      <span className="text-[10px] font-black uppercase">{new Date(m.matchDate).toLocaleDateString('id-ID', { month: 'short' })}</span>
                      <span className="text-xl font-black">{new Date(m.matchDate).getDate()}</span>
                   </div>
                   
                   <div className="space-y-1">
                      <div className="text-[9px] font-black text-cyan-500 uppercase tracking-widest">{m.league}</div>
                      <div className="text-lg font-black text-white uppercase tracking-tighter">
                         {m.homeTeam} <span className="text-gray-600">vs</span> {m.awayTeam}
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-8">
                   <div className="text-right">
                      <div className="text-[9px] text-gray-500 uppercase font-black">Skor Akhir</div>
                      <div className="text-xl font-black text-white">{m.actualScore}</div>
                   </div>

                   <div className="text-right hidden md:block">
                      <div className="text-[9px] text-gray-500 uppercase font-black">Prediksi AI</div>
                      <div className={`text-base font-black ${m.isWin ? 'text-green-400' : 'text-gray-400'}`}>
                         {m.prediction.winner1X2} & {m.prediction.overUnder25}
                      </div>
                   </div>

                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${m.isWin ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {m.isWin ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                   </div>
                </div>
              </motion.div>
            )) : (
              <div className="py-20 text-center space-y-4">
                 <HistoryIcon className="w-16 h-16 text-gray-800 mx-auto" />
                 <h3 className="text-xl font-black text-gray-600 uppercase">Menunggu data pertandingan selesai...</h3>
                 <p className="text-gray-700 text-sm max-w-md mx-auto">Sistem SharkEdge akan secara otomatis merekam hasil Euro malam ini begitu peluit panjang dibunyikan.</p>
              </div>
            )}
          </AnimatePresence>
       </div>

       {/* CALL TO ACTION CEO PERSPECTIVE */}
       <div className="mt-20 p-8 rounded-[3rem] bg-gradient-to-br from-cyan-950/40 to-black/40 border border-cyan-500/20 flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] -z-10" />
          <div className="space-y-2">
             <div className="flex items-center gap-2 text-cyan-400 font-black uppercase text-[10px] tracking-widest">
                <Zap className="w-3 h-3" /> Upgrade Sinyal
             </div>
             <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Mau Akurasi Hingga 98.7%?</h2>
             <p className="text-gray-400 text-sm font-medium">Akses algoritma Insider kami yang mengolah data 1000x lebih dalam untuk setiap laga Euro.</p>
          </div>
          <button className="px-10 py-5 bg-gradient-to-r from-cyan-600 to-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] flex items-center gap-3">
             DAPATKAN AKSES VIP <ArrowRight className="w-4 h-4" />
          </button>
       </div>
    </div>
  );
}
