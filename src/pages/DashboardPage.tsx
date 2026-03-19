import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Activity, Target, Shield, AlertCircle, TrendingUp, TrendingDown, Info, 
  ArrowRight, Share2, Filter, Layers, CheckCircle, Loader2, X, ShieldCheck, Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { fetchRealMatches, fetchMatchDetails } from '../lib/predictionEngine';

export default function DashboardPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLeague, setActiveLeague] = useState('All');
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [matchDetails, setMatchDetails] = useState<any | null>(null);
  const [isMatchLoading, setIsMatchLoading] = useState(false);
  const [isAuthenticated] = useState(localStorage.getItem('sharpedge_user') === 'true');
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchRealMatches();
        setMatches(data);
      } catch (error) {
        console.error("Matrix Sync Error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    // Refresh every 5 minutes
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const leagues = useMemo(() => ['All', ...Array.from(new Set(matches.map(m => m.league)))], [matches]);
  const filteredMatches = useMemo(() => {
    return activeLeague === 'All' ? matches : matches.filter(m => m.league === activeLeague);
  }, [matches, activeLeague]);

  const handleMatchClick = async (match: any) => {
    setSelectedMatch(match);
    setIsMatchLoading(true);
    // Insider info fetch - Fix: Only pass match.id
    const details = await fetchMatchDetails(match.id);
    setMatchDetails(details);
    setIsMatchLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20 relative overflow-hidden">
      {/* GAHAR BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="bg-blob bg-blob-1 opacity-20" />
        <div className="bg-blob bg-blob-2 opacity-20" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-72 shrink-0 space-y-6">
            <div className="glass-card gahar-border p-6 rounded-[2rem]">
              <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Filter className="w-3 h-3" /> FILTER LIGA
              </h3>
              <div className="flex flex-wrap lg:flex-col gap-2">
                {leagues.map(league => (
                  <button
                    key={league}
                    onClick={() => setActiveLeague(league)}
                    className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase text-left transition-all ${activeLeague === league ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                  >
                    {league}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card p-6 rounded-[2rem] border-white/5 bg-gradient-to-br from-cyan-950/20 to-transparent">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-5 h-5 text-cyan-500" />
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Sinyal Aktif</h4>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-gray-500 uppercase">Akurasi Harian</span>
                  <span className="text-cyan-400">92.4%</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                   <div className="bg-cyan-500 h-full w-[92%]" />
                </div>
              </div>
            </div>
          </aside>

          {/* Main Feed */}
          <main className="flex-1 space-y-8 performance-optimized">
            {/* Promo Banner */}
            {!isAuthenticated && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-800 opacity-90 rounded-[2.5rem]" />
                <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="space-y-4 text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase leading-none">
                      AKURASI <span className="text-black bg-white px-2">98%</span> UNTUK ANDA
                    </h2>
                    <p className="text-cyan-50 max-w-lg text-sm font-medium">Algoritma SharkEdge v2.1 sudah online. Nikmati prediksi real-time dengan akurasi maksimal.</p>
                  </div>
                  <button 
                    onClick={() => navigate('/login')}
                    className="px-10 py-4 bg-black text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all shadow-2xl"
                  >
                    DAFTAR SEKARANG
                  </button>
                </div>
              </motion.div>
            )}

            {/* Match Grid */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
                    <Activity className="w-6 h-6 text-cyan-500" /> JADWAL <span className="text-cyan-400">PERTANDINGAN</span>
                 </h2>
                 <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{filteredMatches.length} Laga Tersedia</div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                   <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
                   <p className="text-[10px] text-cyan-500 font-black tracking-[0.3em] uppercase animate-pulse">Syncing Matrix Data...</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredMatches.map((match, idx) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx % 10 * 0.05 }}
                      onClick={() => handleMatchClick(match)}
                      className="glass-card gahar-border p-6 rounded-[2rem] hover:border-cyan-500/30 transition-all cursor-pointer group relative overflow-hidden"
                    >
                      {/* Trap Warning Overlay */}
                      {match.prediction.isTrap && (
                        <div className="absolute top-0 right-0 px-4 py-1.5 bg-red-600 text-white text-[8px] font-black uppercase tracking-widest flex items-center gap-1 z-20">
                           <AlertCircle className="w-3 h-3" /> Trap Detection
                        </div>
                      )}

                      <div className="flex justify-between items-center mb-4 text-[9px] font-black uppercase tracking-widest">
                         <span className="text-cyan-500 px-2 py-1 bg-cyan-500/10 rounded-lg border border-cyan-500/20">{match.league}</span>
                         <span className="text-gray-500 font-bold">{format(new Date(match.matchDate), 'HH:mm')}</span>
                      </div>

                      <div className="flex justify-between items-center mb-6 px-2">
                         <div className="flex flex-col items-center gap-2 w-[40%] text-center">
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/5 flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                               <img src={match.homeLogo} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                            </div>
                            <span className="text-xs md:text-sm font-black text-white line-clamp-2 uppercase tracking-tight">{match.homeTeam}</span>
                         </div>
                         <div className="text-[10px] font-black text-gray-700 italic">VS</div>
                         <div className="flex flex-col items-center gap-2 w-[40%] text-center">
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/5 flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                               <img src={match.awayLogo} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                            </div>
                            <span className="text-xs md:text-sm font-black text-white line-clamp-2 uppercase tracking-tight">{match.awayTeam}</span>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                         <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex justify-between items-center group-hover:bg-white/10 transition-all">
                            <span className="text-[9px] font-black text-gray-500 uppercase">Score AI</span>
                            <span className="text-sm font-black text-white">{match.prediction?.exactScore || 'N/A'}</span>
                         </div>
                         <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex justify-between items-center group-hover:bg-white/10 transition-all">
                            <span className="text-[9px] font-black text-orange-500 uppercase">O/U 2.5</span>
                            <span className={`text-sm font-black ${match.prediction?.overUnder25 === 'OVER' ? 'text-orange-400' : 'text-cyan-400'}`}>
                               {match.prediction?.overUnder25 || 'N/A'}
                            </span>
                         </div>
                      </div>
                      
                      <div className="mt-3 bg-cyan-500/5 p-3 rounded-2xl border border-cyan-500/10 flex justify-between items-center">
                         <span className="text-[9px] font-black text-cyan-600 uppercase">Pilihan 1X2</span>
                         <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-white uppercase">{match.prediction?.winner1X2 || 'N/A'}</span>
                            <div className="w-1 h-1 rounded-full bg-cyan-500" />
                            <span className="text-xs font-black text-cyan-400">{match.prediction?.prob1X2?.home || 0}%</span>
                         </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Match Details Drawer */}
      <AnimatePresence>
        {selectedMatch && (
          <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMatch(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              layoutId={selectedMatch.id}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full max-w-4xl bg-black border-t md:border border-white/10 rounded-t-[3rem] md:rounded-[3rem] overflow-hidden max-h-[95vh] flex flex-col relative"
            >
              <div className="p-8 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent flex justify-between items-start">
                 <div>
                    <div className="flex items-center gap-2 mb-2">
                       <ShieldCheck className="w-4 h-4 text-cyan-400" />
                       <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em]">{selectedMatch.league}</span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase leading-none">
                       {selectedMatch.homeTeam} <span className="text-gray-700 mx-2 italic">vs</span> {selectedMatch.awayTeam}
                    </h2>
                 </div>
                 <button 
                  onClick={() => setSelectedMatch(null)}
                  title="Tutup Detail"
                  aria-label="Tutup Detail"
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all shadow-xl"
                 >
                    <X className="w-6 h-6" />
                 </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                 {isMatchLoading ? (
                    <div className="py-20 flex flex-col items-center gap-4">
                       <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
                       <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Scanning Insider Data...</span>
                    </div>
                 ) : (
                    <>
                       <div className="grid md:grid-cols-3 gap-6">
                          <div className="glass-card p-6 rounded-3xl border-cyan-500/20 bg-cyan-500/5 col-span-2">
                             <div className="flex items-center gap-3 mb-4 text-cyan-400">
                                <Zap className="w-5 h-5" />
                                <h3 className="text-[11px] font-black uppercase tracking-widest">Analisa Insider Premium</h3>
                             </div>
                             <p className="text-white text-lg font-bold leading-relaxed italic">
                                "{matchDetails?.insiderInfo || 'Data sedang diolah untuk akurasi maksimal...'}"
                             </p>
                          </div>
                          
                          <div className="glass-card p-6 rounded-3xl border-white/10">
                             <div className="text-[10px] text-gray-500 uppercase font-black mb-4">Value & Risk</div>
                             <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                   <span className="text-[10px] font-bold text-gray-400 uppercase">Risk Level</span>
                                   <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                                     selectedMatch.prediction.riskLevel === 'LOW' ? 'bg-green-500/20 text-green-400' :
                                     selectedMatch.prediction.riskLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                                     'bg-red-500/20 text-red-400'
                                   }`}>{selectedMatch.prediction.riskLevel}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                   <span className="text-[10px] font-bold text-gray-400 uppercase">Momentum</span>
                                   <span className="text-white font-black">{selectedMatch.prediction.matchMomentum}x</span>
                                </div>
                                <div className="flex justify-between items-center">
                                   <span className="text-[10px] font-bold text-gray-400 uppercase">Valuasi</span>
                                   <span className="text-cyan-400 font-black uppercase text-[10px]">{selectedMatch.prediction.edgeLabel}</span>
                                </div>
                             </div>
                          </div>
                       </div>

                       <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                             <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Shield className="w-4 h-4" /> Prediksi Asian Handicap
                             </h3>
                             <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10">
                                <div className="flex justify-between items-center mb-6">
                                   <div className="space-y-1">
                                      <div className="text-[9px] text-gray-500 uppercase font-black">Fair Line (Asian)</div>
                                      <div className="text-2xl font-black text-white">{selectedMatch.prediction.handicapLine > 0 ? '+' : ''}{selectedMatch.prediction.handicapLine}</div>
                                   </div>
                                   <div className="text-right space-y-1">
                                      <div className="text-[9px] text-gray-500 uppercase font-black">Probabilitas</div>
                                      <div className="text-2xl font-black text-cyan-400">{selectedMatch.prediction.probHandicap}%</div>
                                   </div>
                                </div>
                                <div className="p-4 bg-cyan-500 text-black rounded-2xl text-center">
                                   <div className="text-[9px] font-black uppercase mb-1">Pilihan Terbaik</div>
                                   <div className="text-sm font-black uppercase">{selectedMatch.prediction.handicapFavored}</div>
                                </div>
                             </div>
                          </div>

                          <div className="space-y-4">
                             <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Activity className="w-4 h-4" /> Kondisi Pra-Laga
                             </h3>
                             <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 space-y-4">
                                <div className="flex justify-between items-center">
                                   <span className="text-[10px] font-bold text-gray-400 uppercase">Wasit</span>
                                   <span className="text-white font-black text-xs">{matchDetails?.referee || 'Menunggu data...'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                   <span className="text-[10px] font-bold text-gray-400 uppercase">Stadion</span>
                                   <span className="text-white font-black text-xs">{matchDetails?.venue || 'Menunggu data...'}</span>
                                </div>
                                <div className="pt-4 border-t border-white/5">
                                   <div className="text-[9px] text-gray-500 uppercase font-black mb-2">Info Cedera / Absen</div>
                                   <div className="flex flex-wrap gap-2">
                                      {matchDetails?.injuries?.length > 0 ? matchDetails.injuries.map((inj: any, i: number) => (
                                         <span key={i} className="px-3 py-1 bg-red-500/10 text-red-500 text-[9px] font-black rounded-lg border border-red-500/20">
                                            {inj.name} ({inj.status})
                                         </span>
                                      )) : <span className="text-[9px] text-gray-600 italic">Tidak ada laporan cedera signifikan...</span>}
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                    </>
                 )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
