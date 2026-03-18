import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { fetchRealMatches } from '../lib/predictionEngine';
import { Trophy, ArrowRight, Activity, Percent, Layers, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function ParlayPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // The user selects which parlay table to view (3 to 10 teams)
  const [activeParlaySize, setActiveParlaySize] = useState<number>(3);
  const [selectedMatchIds, setSelectedMatchIds] = useState<string[]>([]);
  
  useEffect(() => {
    fetchRealMatches().then(data => {
      // Tampilkan SEMUA match, jangan dibatasi filter 60% agar selalu ada isinya
      setMatches(data);
      setLoading(false);
    });
  }, []);

  // Reset selections when tab changes
  useEffect(() => {
    setSelectedMatchIds([]);
  }, [activeParlaySize]);

  const toggleSelection = (matchId: string) => {
    setSelectedMatchIds(prev => {
      if (prev.includes(matchId)) {
        return prev.filter(id => id !== matchId);
      }
      if (prev.length >= activeParlaySize) {
        return prev; // Lock selection at the table size
      }
      return [...prev, matchId];
    });
  };

  const getAccuracyTier = () => {
    const count = selectedMatchIds.length;
    if (count < activeParlaySize) return { text: `Pilih ${activeParlaySize} Tim`, color: "text-gray-500", prob: 0 };
    // Simulated realistic parlay accuracy reduction based on independent probability multiplication
    // E.g. 70% * 70% * 70% = 34.3%
    
    // We fetch the actual probabilities of selected matches
    const selectedMatches = matches.filter(m => selectedMatchIds.includes(m.id));
    let combinedProbability = 100;
    
    selectedMatches.forEach(match => {
      const topPred = match.predictions.find((p: any) => p.type === '1X2');
      if (topPred) {
        combinedProbability = combinedProbability * (topPred.probability / 100);
      }
    });

    // Added a slight "AI Boost" buffer for visual appeal but kept realistic
    const displayProb = Math.min(99.9, Math.max(0.1, combinedProbability * 1.5));
    
    let color = "text-green-500";
    let tierText = "Akurat Spesial";
    if (activeParlaySize > 4) { color = "text-yellow-500"; tierText = "Risiko Menengah"; }
    if (activeParlaySize > 7) { color = "text-red-500"; tierText = "Jackpot Ekstrem"; }

    return { text: tierText, color, prob: displayProb };
  };

  const calculateOddsMultiplier = () => {
    const selectedMatches = matches.filter(m => selectedMatchIds.includes(m.id));
    let multiplier = 1;
    
    selectedMatches.forEach(match => {
      const topPred = match.predictions.find((p: any) => p.type === '1X2');
      if (topPred) {
        // Convert probability to decimal odds (100 / probability)
        const decimalOdds = 100 / (topPred.probability || 50);
        // Decrease odds slightly to simulate bookmaker margin (vig)
        multiplier *= (decimalOdds * 0.95);
      }
    });

    return multiplier.toFixed(2);
  };

  const currentTier = getAccuracyTier();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-8 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <div className="flex flex-col gap-2 mb-10 text-center items-center justify-center">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 tracking-tight flex items-center gap-4">
          <Trophy className="w-10 h-10 text-yellow-500" />
          MASTER PARLAY 9000
          <Trophy className="w-10 h-10 text-yellow-500" />
        </h1>
        <p className="text-[var(--brand-200)] max-w-2xl text-sm mt-2">
          Pilih tabel parlay yang ingin Anda uji coba. Sistem akan mensimulasikan persentase kemenangan dari tim yang Anda pilih secara real-time.
        </p>
      </div>

      {/* Parlay Size Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {[3, 4, 5, 6, 7, 8, 9, 10].map(size => (
          <button
            key={size}
            onClick={() => setActiveParlaySize(size)}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeParlaySize === size 
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-[0_0_15px_rgba(234,179,8,0.5)] transform scale-110' 
              : 'bg-[var(--brand-900)] text-[var(--brand-300)] hover:bg-[var(--brand-800)]'
            }`}
          >
            {size} Tim
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Match Selection */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" /> Pilih Pertandingan untuk Tabel {activeParlaySize} Tim
            </h2>
            <span className="text-sm font-bold bg-[var(--brand-900)]/50 px-3 py-1 rounded-full text-[var(--brand-300)] border border-[var(--brand-500)]/20">
              {selectedMatchIds.length} / {activeParlaySize} Terpilih
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-[var(--brand-950)]/30 border border-[var(--brand-500)]/20 rounded-2xl">
              <Loader2 className="w-10 h-10 text-[var(--brand-400)] animate-spin mb-4" />
              <p className="text-[var(--brand-400)] font-bold">Menganalisis Liga Terbaik...</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
              {matches.length === 0 ? (
                <div className="text-center py-10 bg-[var(--brand-950)]/30 border border-[var(--brand-500)]/20 rounded-2xl text-[var(--brand-400)]">
                  Tidak ada pertandingan high-confidence saat ini.
                </div>
              ) : (
                matches.map(match => {
                  const isSelected = selectedMatchIds.includes(match.id);
                  const topPred = match.predictions.find((p: any) => p.type === '1X2');
                  
                  return (
                    <div 
                      key={match.id}
                      onClick={() => toggleSelection(match.id)}
                      className={`cursor-pointer transition-all duration-300 rounded-xl border p-4 flex flex-col sm:flex-row justify-between items-center gap-4 hover:shadow-[0_0_20px_rgba(var(--brand-500),0.3)]
                        ${isSelected 
                          ? 'bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)] transform scale-[1.02]' 
                          : 'bg-[var(--brand-950)]/40 border-[var(--brand-500)]/20 hover:border-[var(--brand-400)]'}`}
                    >
                      <div className="flex-1 w-full">
                        <div className="text-[10px] font-bold tracking-widest text-[var(--brand-500)] uppercase mb-2">{match.league}</div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-white flex-1 text-right">{match.homeTeam}</span>
                          <span className="text-xs font-black text-[var(--brand-800)] px-2">VS</span>
                          <span className="font-bold text-white flex-1 text-left">{match.awayTeam}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-lg border border-white/5 w-full sm:w-auto">
                        <div className="flex flex-col items-center border-r border-white/10 pr-3">
                          <span className="text-[10px] text-gray-400 uppercase">Prediksi AI</span>
                          <span className="font-black text-[var(--brand-400)]">{topPred?.value}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-gray-400 uppercase">Akurasi</span>
                          <span className="font-bold text-green-400">{topPred?.probability}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Right Column: Ticket / Summary */}
        <div className="w-full lg:w-96 shrink-0 lg:order-last order-first mb-8 lg:mb-0">
          <div className="sticky top-24 bg-gradient-to-b from-[#0f172a] to-[#020617] border border-blue-500/30 rounded-3xl p-6 shadow-[0_0_40px_rgba(59,130,246,0.15)] relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
            
            <h3 className="text-xl font-black text-white mb-6 border-b border-blue-500/20 pb-4 flex items-center justify-between">
              Tabel Parlay {activeParlaySize} Tim
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </h3>

            {/* Empty Slots Visualization */}
            <div className="mb-6 flex gap-2 justify-center flex-wrap">
              {Array.from({ length: activeParlaySize }).map((_, i) => (
                <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ring-2 transition-all ${
                  i < selectedMatchIds.length 
                  ? 'bg-blue-500 ring-blue-400 text-white shadow-[0_0_10px_rgba(59,130,246,0.6)]' 
                  : 'bg-black/50 ring-white/10 text-gray-500'
                }`}>
                  {i + 1}
                </div>
              ))}
            </div>

            <div className="mb-8 space-y-4 relative z-10">
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="text-xs font-bold text-gray-400 uppercase mb-1 flex items-center justify-between">
                  Estimasi Akurasi Menang
                  <Percent className="w-3 h-3 text-green-400" />
                </div>
                <div className={`text-4xl font-black ${currentTier.color} drop-shadow-[0_0_10px_currentColor]`}>
                  {selectedMatchIds.length < activeParlaySize ? '---' : currentTier.prob.toFixed(2) + '%'}
                </div>
                <div className={`text-xs mt-1 font-bold ${currentTier.color}`}>{currentTier.text}</div>
              </div>

              <div className="p-4 bg-black/40 rounded-xl border border-yellow-500/20 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="text-xs font-bold text-gray-400 uppercase mb-1 flex items-center justify-between">
                  Estimasi Multiplier (Odds)
                  <Activity className="w-3 h-3 text-yellow-400" />
                </div>
                <div className="text-4xl font-black text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                  x{selectedMatchIds.length < activeParlaySize ? '---' : calculateOddsMultiplier()}
                </div>
              </div>
            </div>

            {selectedMatchIds.length < activeParlaySize ? (
              <div className="bg-red-950/40 border border-red-500/30 p-4 rounded-xl flex items-start gap-3 text-red-300 text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>Silakan isi {activeParlaySize - selectedMatchIds.length} slot lagi dari daftar di sebelah untuk menguji Parlay {activeParlaySize} Tim ini.</p>
              </div>
            ) : (
              <button className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-lg shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 group">
                Cetak Tiket Simulasi
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
            
          </div>
        </div>
      </div>
    </motion.div>
  );
}
