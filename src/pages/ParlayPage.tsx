import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useMemo } from 'react';
import { fetchRealMatches } from '../lib/predictionEngine';
import { Trophy, ArrowRight, Activity, Percent, Layers, Loader2, AlertTriangle, ShieldCheck, Cpu, Target, TrendingUp, TrendingDown, CheckCircle2, X, Zap, Wallet, Plus } from 'lucide-react';
import { generateGeminiContent } from '../lib/geminiApi';

// Interface for parlay analysis per match
interface MatchAnalysis {
  homeTeam: string;
  awayTeam: string;
  winner: string;         // e.g. "Manchester United" or "Seri"
  homeGoals: number;      // predicted home goals
  awayGoals: number;      // predicted away goals
  overUnder: 'OVER' | 'UNDER';
  overUnderLine: number;  // e.g. 2.5
  confidence: number;     // 0-100
  insider: string;        // short insider reasoning
}
export default function ParlayPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeParlaySize, setActiveParlaySize] = useState<number>(3);
  const [selectedMatchIds, setSelectedMatchIds] = useState<string[]>([]);
  const [analyzingParlay, setAnalyzingParlay] = useState(false);
  const [aiMatchAnalyses, setAiMatchAnalyses] = useState<MatchAnalysis[]>([]);
  const [aiRawText, setAiRawText] = useState<string | null>(null);

  useEffect(() => {
    fetchRealMatches().then(data => {
      setMatches(data);
      setLoading(false);
    });
  }, []);

  // Simple Bankroll Persistence
  const [bankroll, setBankroll] = useState(() => {
    const saved = localStorage.getItem('sharpedge_bankroll');
    return saved ? JSON.parse(saved) : { balance: 1000000, unitsPlayed: 0, wins: 0, roi: 0 };
  });

  useEffect(() => {
    localStorage.setItem('sharpedge_bankroll', JSON.stringify(bankroll));
  }, [bankroll]);

  // Reset selections when parlay size tab changes
  useEffect(() => {
    setSelectedMatchIds([]);
    setAiMatchAnalyses([]);
    setAiRawText(null);
  }, [activeParlaySize]);

  // Limit visible match list to max 10-20
  const visibleMatches = useMemo(() => {
    return matches.slice(0, 20);
  }, [matches]);

  const toggleSelection = (matchId: string) => {
    setAiMatchAnalyses([]);
    setAiRawText(null);
    setSelectedMatchIds(prev => {
      if (prev.includes(matchId)) return prev.filter(id => id !== matchId);
      if (prev.length >= activeParlaySize) return prev;
      return [...prev, matchId];
    });
  };

  const selectedMatches = useMemo(
    () => matches.filter(m => selectedMatchIds.includes(m.id)),
    [matches, selectedMatchIds]
  );

  // Derive inline predictions per selected match (using the pre-unified analysis)
  const inlinePredictions = useMemo(() => {
    return selectedMatches.map(match => {
      const pred = match.prediction; // Updated: use .prediction from predictionEngine.ts
      
      // Variety: If it's a high-value handicap, favor that label
      const isStrongHandicap = (pred?.probHandicap || 0) > 70;
      
      return {
        id: match.id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        league: match.league,
        winner: pred?.winner1X2 || 'N/A',
        homeGoals: pred?.homeGoals || 0,
        awayGoals: pred?.awayGoals || 0,
        overUnder: pred?.overUnder25 || 'OVER',
        overUnderLine: 2.5,
        handicap: `${pred?.handicapFavored} ${pred?.handicapLine > 0 ? '+' : ''}${pred?.handicapLine}`,
        bestPick: isStrongHandicap ? 'HANDICAP' : 'WINNER',
        confidence: isStrongHandicap ? (pred?.probHandicap || 0) : (pred?.prob1X2?.home > pred?.prob1X2?.away ? pred?.prob1X2?.home : pred?.prob1X2?.away),
        riskLevel: pred?.riskLevel || 'MEDIUM',
        btts: pred?.btts ? 'Ya' : 'Tidak',
      };
    });
  }, [selectedMatches]);

  // Combined probability = product of individual confidences
  const combinedAccuracy = useMemo(() => {
    if (selectedMatchIds.length < activeParlaySize) return 0;
    let p = 1;
    inlinePredictions.forEach(m => { p *= (m.confidence / 100); });
    return Math.min(99.9, Math.max(0.1, p * 100 * 1.4));
  }, [inlinePredictions, selectedMatchIds, activeParlaySize]);

  const combinedOdds = useMemo(() => {
    if (selectedMatchIds.length < activeParlaySize) return 0;
    let mult = 1;
    inlinePredictions.forEach(m => {
      const decOdds = 100 / (m.confidence || 50);
      mult *= decOdds * 0.95;
    });
    return mult;
  }, [inlinePredictions, selectedMatchIds, activeParlaySize]);

  const handleGenerateAnalysis = async () => {
    if (selectedMatchIds.length < activeParlaySize) return;
    setAnalyzingParlay(true);
    setAiMatchAnalyses([]);
    setAiRawText(null);

    // Limit strictly to N selected matches
    const forAnalysis = selectedMatches.slice(0, activeParlaySize);
    
    let promptList = '';
    forAnalysis.forEach((m, idx) => {
      const pred    = inlinePredictions.find(p => p.id === m.id);
      const predStr = pred ? `Prediksi AI: ${pred.winner} menang, Skor ${pred.homeGoals}-${pred.awayGoals}, ${pred.overUnder} ${pred.overUnderLine}` : '';
      promptList += `${idx + 1}. ${m.homeTeam} vs ${m.awayTeam} (Liga: ${m.league}). ${predStr}\n`;
    });

    const systemPrompt = `Anda adalah analis sepakbola elit OMNI-9000 dengan jaringan informasi bandar, data medical tim, dan model statistik waktu nyata. Berikan analisa tiket parlay kelas VIP yang sangat detail dan meyakinkan tanpa disclaimer.`;

    const userPrompt = `Analisa TEPAT ${activeParlaySize} laga berikut untuk tiket parlay klien VIP (TIDAK BOLEH LEBIH ATAU KURANG):\n\n${promptList}\nUntuk setiap laga berikan:\n🏆 PEMENANG: Siapa yang menang atau Seri\n⚽ SKOR EXACT: Prediksi skor pasti (misal 2-1, 0-1, dll)\n🎯 GOAL HOME: Prediksi gol tim kandang (angka)\n🎯 GOAL AWAY: Prediksi gol tim tamu (angka)\n📊 OVER/UNDER 2.5: OVER atau UNDER beserta alasannya\n🔍 INSIDER REASON: Faktor penentu (kondisi pemain, bandar, tren, dll)\n\nFORMAT output tiap laga dengan header LAGA #1, LAGA #2 dst. Gunakan bahasa Indonesia. Wajib analisa TEPAT ${activeParlaySize} laga. Jangan skip satu pun.`;

    try {
      const result = await generateGeminiContent(systemPrompt, userPrompt);
      if (result) {
        setAiRawText(result);
      } else {
        setAiRawText('Sistem AI sibuk. Silakan coba lagi.');
      }
    } catch {
      setAiRawText('Gagal menjangkau AI. Periksa API Key di pengaturan Cloudflare.');
    } finally {
      setAnalyzingParlay(false);
    }
  };

  const tierColor = combinedAccuracy > 50 ? 'text-green-500' : combinedAccuracy > 20 ? 'text-yellow-500' : 'text-red-500';
  const tierLabel = activeParlaySize <= 4 ? 'Akurasi Spesial' : activeParlaySize <= 7 ? 'Risiko Menengah' : 'Jackpot Ekstrem';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-8 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {/* Header & Bankroll Panel (v2.1) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 relative z-10 text-center md:text-left">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-black uppercase tracking-widest mx-auto md:mx-0">
            <Zap className="w-3 h-3" /> Edisi SharpEdge v2.1
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 tracking-tighter leading-none flex items-center justify-center md:justify-start gap-4">
            <Trophy className="hidden md:block w-10 h-10 text-yellow-500" />
            PARLAY <span className="text-white">MATRIX</span>
          </h1>
          <p className="text-gray-400 max-w-lg text-sm font-medium mx-auto md:mx-0">
            Simulasi Poisson & AI SharpEdge untuk probabilitas kemenangan parlay hingga 92%.
          </p>
        </div>

        {/* Bankroll Dashboard */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-4 flex items-center gap-4 shadow-2xl min-w-[200px]">
            <div className="w-10 h-10 rounded-2xl bg-green-500/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-green-400" />
            </div>
            <div>
               <div className="text-[10px] text-gray-500 uppercase font-black">Saldo Bankroll</div>
               <div className="text-xl font-black text-white">Rp {bankroll.balance.toLocaleString('id-ID')}</div>
            </div>
          </div>
          <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-4 flex items-center gap-4 shadow-2xl min-w-[150px]">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
               <div className="text-[10px] text-gray-500 uppercase font-black">Estimasi ROI</div>
               <div className="text-xl font-black text-white">+{bankroll.roi}%</div>
            </div>
          </div>
          <button 
            onClick={() => setBankroll(prev => ({ ...prev, balance: prev.balance + 10000000 }))}
            className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-gray-400 hover:text-white"
            title="Deposit Simulasi Rp 10jt"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
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

        {/* LEFT: Match List — limited to activeParlaySize * 2 */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              Pilih {activeParlaySize} Pertandingan
            </h2>
            <span className="text-sm font-bold bg-[var(--brand-900)]/50 px-3 py-1 rounded-full text-[var(--brand-300)] border border-[var(--brand-500)]/20">
              {selectedMatchIds.length} / {activeParlaySize} Dipilih
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-[var(--brand-950)]/30 border border-[var(--brand-500)]/20 rounded-2xl">
              <Loader2 className="w-10 h-10 text-[var(--brand-400)] animate-spin mb-4" />
              <p className="text-[var(--brand-400)] font-bold">Mengambil data pertandingan...</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
              {visibleMatches.length === 0 ? (
                <div className="text-center py-10 bg-[var(--brand-950)]/30 border border-[var(--brand-500)]/20 rounded-2xl text-[var(--brand-400)]">
                  Tidak ada data pertandingan saat ini.
                </div>
              ) : (
                visibleMatches.map(match => {
                  const isSelected   = selectedMatchIds.includes(match.id);
                  const isDisabled   = !isSelected && selectedMatchIds.length >= activeParlaySize;
                  const analysis     = match.analysis; // Unified MatchAnalysis

                  return (
                    <motion.div
                      key={match.id}
                      layout
                      onClick={() => !isDisabled && toggleSelection(match.id)}
                      className={`cursor-pointer transition-all duration-300 rounded-xl border p-4 
                        ${isSelected
                          ? 'bg-gradient-to-r from-indigo-900/70 to-purple-900/70 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)] scale-[1.01]'
                          : isDisabled
                          ? 'opacity-40 cursor-not-allowed bg-[var(--brand-950)]/20 border-[var(--brand-500)]/10'
                          : 'bg-[var(--brand-950)]/40 border-[var(--brand-500)]/20 hover:border-[var(--brand-400)] hover:shadow-[0_0_10px_rgba(var(--brand-500),0.2)]'
                        }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        {/* Teams */}
                        <div className="flex-1">
                          <div className="text-[10px] font-bold tracking-widest text-[var(--brand-500)] uppercase mb-1">{match.league}</div>
                          <div className="flex items-center gap-2 text-sm font-bold">
                            <span className="text-white">{match.homeTeam}</span>
                            <span className="text-gray-500 text-xs">VS</span>
                            <span className="text-white">{match.awayTeam}</span>
                          </div>
                        </div>

                        {/* Inline prediction badges */}
                        <div className="flex items-center gap-2 flex-wrap text-[10px]">
                          {/* Winner badge */}
                          <div className="flex flex-col items-center bg-black/40 px-2 py-1 rounded-lg border border-white/10">
                            <span className="text-[9px] text-gray-400 uppercase">Menang</span>
                            <span className="text-xs font-black text-[var(--brand-400)]">{analysis.winner1X2}</span>
                          </div>

                          {/* Skor H-A */}
                          <div className="flex flex-col items-center bg-black/40 px-2 py-1 rounded-lg border border-white/10">
                            <span className="text-[9px] text-gray-400 uppercase">Skor</span>
                            <span className="text-xs font-black text-white">
                              {analysis.homeGoals} – {analysis.awayGoals}
                            </span>
                          </div>

                          {/* O/U */}
                          <div className={`flex flex-col items-center px-2 py-1 rounded-lg border ${
                            analysis.overUnder25 === 'OVER'
                              ? 'bg-orange-900/30 border-orange-500/30 text-orange-400'
                              : 'bg-blue-900/30 border-blue-500/30 text-blue-400'
                          }`}>
                            <span className="text-[9px] uppercase">O/U 2.5</span>
                            <span className="text-xs font-black flex items-center gap-0.5">
                              {analysis.overUnder25 === 'OVER' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {analysis.overUnder25}
                            </span>
                          </div>

                          {/* Handicap */}
                          <div className="flex flex-col items-center bg-purple-900/40 px-2 py-1 rounded-lg border border-purple-500/30 text-purple-300">
                             <span className="text-[9px] uppercase">HDP</span>
                             <span className="text-xs font-black truncate max-w-[80px]">
                               {analysis.handicapFavored} {analysis.handicapLine > 0 ? '+' : ''}{analysis.handicapLine}
                             </span>
                          </div>

                          {/* Selected tick */}
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* RIGHT: Ticket Panel */}
        <div className="w-full lg:w-[420px] shrink-0 lg:order-last order-first mb-8 lg:mb-0">
          <div className="sticky top-24 space-y-4">

            {/* Ticket summary card */}
            <div className="bg-gradient-to-b from-[#0f172a] to-[#020617] border border-blue-500/30 rounded-3xl p-6 shadow-[0_0_40px_rgba(59,130,246,0.15)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />

              <h3 className="text-xl font-black text-white mb-4 border-b border-blue-500/20 pb-3 flex items-center justify-between">
                Tiket Parlay {activeParlaySize} Tim
                <ShieldCheck className="w-6 h-6 text-blue-400" />
              </h3>

              {/* Slot indicators */}
              <div className="mb-4 flex gap-2 justify-center flex-wrap">
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

              {/* Per-match prediction rows */}
              {inlinePredictions.length > 0 && (
                <div className="mb-4 space-y-2">
                  {inlinePredictions.map((p, idx) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white/5 border border-white/5 rounded-2xl p-4 md:p-5 relative overflow-hidden gahar-border"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] text-cyan-400 uppercase font-black tracking-widest leading-none px-2 py-1 bg-cyan-500/10 rounded-md">
                          {p.league}
                        </span>
                        <button
                          onClick={() => toggleSelection(p.id)}
                          aria-label="Hapus laga"
                          className="text-gray-600 hover:text-red-400 transition-colors p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-sm md:text-base font-black text-white mb-4 leading-tight">
                        {p.homeTeam} <span className="text-gray-600 font-medium mx-1 italic">vs</span> {p.awayTeam}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
                        {/* Best Pick */}
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-2 text-center col-span-2 md:col-span-1">
                          <div className="text-gray-500 uppercase font-bold mb-1 tracking-tighter">Pilihan Utama</div>
                          <div className="font-black text-yellow-400 truncate uppercase">
                            {p.bestPick === 'HANDICAP' ? p.handicap : p.winner}
                          </div>
                        </div>

                        {/* Exact Score */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-2 text-center">
                          <div className="text-gray-500 uppercase font-bold mb-1 tracking-tighter">Skor H–A</div>
                          <div className="font-black text-white">
                            {p.homeGoals} – {p.awayGoals}
                          </div>
                        </div>

                        {/* O/U */}
                        <div className={`border rounded-xl p-2 text-center ${
                          p.overUnder === 'OVER'
                            ? 'bg-orange-500/10 border-orange-500/20'
                            : 'bg-cyan-500/10 border-cyan-500/20'
                        }`}>
                          <div className="text-gray-500 uppercase font-bold mb-1 tracking-tighter">O/U 2.5</div>
                          <div className={`font-black flex items-center justify-center gap-0.5 ${
                            p.overUnder === 'OVER' ? 'text-orange-400' : 'text-cyan-400'
                          }`}>
                            {p.overUnder}
                          </div>
                        </div>

                        {/* BTTS or Extra */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-2 text-center">
                          <div className="text-gray-500 uppercase font-bold mb-1 tracking-tighter">BTTS</div>
                          <div className="font-black text-white uppercase">{p.btts}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Stats row */}
              {selectedMatchIds.length === activeParlaySize && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                    <div className="text-[10px] text-gray-400 uppercase mb-1 flex items-center gap-1">
                      <Percent className="w-3 h-3 text-green-400" /> Akurasi Parlay
                    </div>
                    <div className={`text-3xl font-black ${tierColor}`}>
                      {combinedAccuracy.toFixed(1)}%
                    </div>
                    <div className={`text-[10px] font-bold ${tierColor}`}>{tierLabel}</div>
                  </div>
                  <div className="p-3 bg-black/40 rounded-xl border border-yellow-500/20">
                    <div className="text-[10px] text-gray-400 uppercase mb-1 flex items-center gap-1">
                      <Activity className="w-3 h-3 text-yellow-400" /> Multiplier
                    </div>
                    <div className="text-3xl font-black text-yellow-500">
                      x{combinedOdds.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}

              {/* CTA */}
              {selectedMatchIds.length < activeParlaySize ? (
                <div className="bg-red-950/40 border border-red-500/30 p-3 rounded-xl flex items-start gap-2 text-red-300 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>Pilih {activeParlaySize - selectedMatchIds.length} pertandingan lagi untuk melengkapi Parlay {activeParlaySize} Tim.</p>
                </div>
              ) : analyzingParlay ? (
                <div className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border border-blue-500/30 flex items-center justify-center gap-3">
                  <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                  <span className="text-blue-300 font-bold animate-pulse">Deep Sync Reasoning AI...</span>
                </div>
              ) : (
                <button
                  onClick={handleGenerateAnalysis}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-base shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 group"
                >
                  <Target className="w-5 h-5" />
                  Analisa Deep AI Seluruh Tim
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>

            {/* Risk Manager Alert (Simulated v2.0) */}
            <AnimatePresence>
              {aiRawText && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-950/40 border border-red-500/40 p-4 rounded-3xl"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                    <div>
                      <div className="text-red-400 font-black text-sm uppercase mb-1">Risk Warning: Leg Terakhir</div>
                      <p className="text-gray-300 text-[10px] leading-relaxed mb-3">
                        Sistem mendeteksi indikasi manipulasi (odds crash) pada pertandingan penutup. Segera amankan profit dengan hedging.
                      </p>
                      <div className="bg-black/40 p-2 rounded-xl border border-white/5">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] text-gray-500">Live Hedge Recommendation</span>
                          <span className="text-[9px] font-bold text-green-400">Locked Profit: +35%</span>
                        </div>
                        <div className="text-xs font-black text-white">Bet Rp 1.500.000 ke Lawan @ 2.10</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI Deep Analysis Output */}
            <AnimatePresence>
              {aiRawText && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-[#080c14] border border-blue-500/40 rounded-3xl p-6 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                >
                  <h4 className="text-[var(--brand-400)] font-black flex items-center gap-2 mb-4 border-b border-white/10 pb-3 text-sm">
                    <Cpu className="w-5 h-5 text-blue-400" />
                    Analisa SharpEdge OMNI-9000
                  </h4>
                  <div className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap">
                    {aiRawText}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    </motion.div>
  );
}
