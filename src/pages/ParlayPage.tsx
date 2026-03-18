import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useMemo } from 'react';
import { fetchRealMatches } from '../lib/predictionEngine';
import { Trophy, ArrowRight, Activity, Percent, Layers, Loader2, AlertTriangle, ShieldCheck, Cpu, Target, TrendingUp, TrendingDown, CheckCircle2, X } from 'lucide-react';
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

// Helper: derive O/U from goals
function predictOverUnder(homeProb: number, awayProb: number, drawProb: number) {
  // Higher attack probability -> Over 2.5
  const attackScore = (homeProb + awayProb) / 100;
  const isLikelyHighScoring = attackScore > 1.0 || drawProb < 25;
  const line = 2.5;
  return { overUnder: isLikelyHighScoring ? 'OVER' as const : 'UNDER' as const, line };
}

// Helper: derive exact score from predictions  
function deriveScore(predictions: any[], homeTeam: string, awayTeam: string) {
  const pred1X2 = predictions.find((p: any) => p.type === '1X2');
  const predOU = predictions.find((p: any) => p.type === 'Over/Under');
  
  if (!pred1X2) return { homeGoals: 1, awayGoals: 0 };
  
  const winner = pred1X2.value;
  const expectedHighScore = predOU?.value === 'Over 2.5' || (pred1X2.probability > 70);

  if (winner === homeTeam || winner.includes('Home') || winner === '1') {
    return expectedHighScore ? { homeGoals: 2, awayGoals: 1 } : { homeGoals: 1, awayGoals: 0 };
  } else if (winner === awayTeam || winner.includes('Away') || winner === '2') {
    return expectedHighScore ? { homeGoals: 1, awayGoals: 2 } : { homeGoals: 0, awayGoals: 1 };
  } else {
    return expectedHighScore ? { homeGoals: 2, awayGoals: 2 } : { homeGoals: 1, awayGoals: 1 };
  }
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

  // Reset selections when parlay size tab changes
  useEffect(() => {
    setSelectedMatchIds([]);
    setAiMatchAnalyses([]);
    setAiRawText(null);
  }, [activeParlaySize]);

  // Limit visible match list to max 2x the parlay size (min 10, max 20) so user isn't overwhelmed
  const visibleMatches = useMemo(() => {
    const limit = Math.min(Math.max(activeParlaySize * 2, 10), 20);
    return matches.slice(0, limit);
  }, [matches, activeParlaySize]);

  const toggleSelection = (matchId: string) => {
    setAiMatchAnalyses([]);
    setAiRawText(null);
    setSelectedMatchIds(prev => {
      if (prev.includes(matchId)) return prev.filter(id => id !== matchId);
      if (prev.length >= activeParlaySize) return prev; // lock at exact size
      return [...prev, matchId];
    });
  };

  const selectedMatches = useMemo(
    () => matches.filter(m => selectedMatchIds.includes(m.id)),
    [matches, selectedMatchIds]
  );

  // Derive inline predictions per selected match (deterministic, no AI needed for these)
  const inlinePredictions = useMemo(() => {
    return selectedMatches.map(match => {
      const pred1X2 = match.predictions?.find((p: any) => p.type === '1X2');
      const predOU   = match.predictions?.find((p: any) => p.type === 'Over/Under');
      const score    = deriveScore(match.predictions || [], match.homeTeam, match.awayTeam);
      const homeProb  = pred1X2?.probability || 50;
      const awayProb  = 100 - homeProb;
      const OU        = predictOverUnder(homeProb, awayProb, 30);

      return {
        id: match.id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        league: match.league,
        winner: pred1X2?.value || match.homeTeam,
        homeGoals: score.homeGoals,
        awayGoals: score.awayGoals,
        overUnder: predOU ? (predOU.value?.includes('Over') ? 'OVER' : 'UNDER') : OU.overUnder,
        overUnderLine: 2.5,
        confidence: pred1X2?.probability || 70,
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
      {/* Header */}
      <div className="flex flex-col gap-2 mb-10 text-center items-center justify-center">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 tracking-tight flex items-center gap-4">
          <Trophy className="w-10 h-10 text-yellow-500" />
          MASTER PARLAY 9000
          <Trophy className="w-10 h-10 text-yellow-500" />
        </h1>
        <p className="text-[var(--brand-200)] max-w-2xl text-sm mt-2">
          Pilih tabel parlay, lalu pick tepat sejumlah laga. AI akan menganalisa skor, gol H/A, dan Over/Under setiap tim secara mendalam.
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
                  const pred1X2      = match.predictions?.find((p: any) => p.type === '1X2');
                  const score        = deriveScore(match.predictions || [], match.homeTeam, match.awayTeam);
                  const OU           = predictOverUnder(
                    pred1X2?.probability || 50,
                    100 - (pred1X2?.probability || 50),
                    30
                  );

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
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Winner badge */}
                          <div className="flex flex-col items-center bg-black/40 px-2 py-1 rounded-lg border border-white/10">
                            <span className="text-[9px] text-gray-400 uppercase">Menang</span>
                            <span className="text-xs font-black text-[var(--brand-400)]">{pred1X2?.value || match.homeTeam}</span>
                          </div>

                          {/* Skor H-A */}
                          <div className="flex flex-col items-center bg-black/40 px-2 py-1 rounded-lg border border-white/10">
                            <span className="text-[9px] text-gray-400 uppercase">Skor</span>
                            <span className="text-xs font-black text-white">
                              {score.homeGoals} – {score.awayGoals}
                            </span>
                          </div>

                          {/* O/U */}
                          <div className={`flex flex-col items-center px-2 py-1 rounded-lg border ${
                            OU.overUnder === 'OVER'
                              ? 'bg-orange-900/30 border-orange-500/30 text-orange-400'
                              : 'bg-blue-900/30 border-blue-500/30 text-blue-400'
                          }`}>
                            <span className="text-[9px] uppercase">O/U 2.5</span>
                            <span className="text-xs font-black flex items-center gap-0.5">
                              {OU.overUnder === 'OVER' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {OU.overUnder}
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
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-black/50 border border-white/5 rounded-xl p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-gray-500 uppercase font-bold">{p.league}</span>
                        <button
                          onClick={() => toggleSelection(p.id)}
                          className="text-gray-600 hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-xs font-black text-white mb-2">
                        {p.homeTeam} <span className="text-gray-600">vs</span> {p.awayTeam}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[10px]">
                        {/* Winner */}
                        <div className="bg-indigo-900/40 border border-indigo-500/20 rounded-lg p-1.5 text-center">
                          <div className="text-gray-400 uppercase mb-0.5">Menang</div>
                          <div className="font-black text-indigo-300 truncate">{p.winner}</div>
                        </div>
                        {/* Score H/A */}
                        <div className="bg-green-900/30 border border-green-500/20 rounded-lg p-1.5 text-center">
                          <div className="text-gray-400 uppercase mb-0.5">Skor H–A</div>
                          <div className="font-black text-green-300">
                            {p.homeGoals} – {p.awayGoals}
                          </div>
                        </div>
                        {/* O/U */}
                        <div className={`border rounded-lg p-1.5 text-center ${
                          p.overUnder === 'OVER'
                            ? 'bg-orange-900/30 border-orange-500/20'
                            : 'bg-cyan-900/30 border-cyan-500/20'
                        }`}>
                          <div className="text-gray-400 uppercase mb-0.5">O/U 2.5</div>
                          <div className={`font-black flex items-center justify-center gap-0.5 ${
                            p.overUnder === 'OVER' ? 'text-orange-300' : 'text-cyan-300'
                          }`}>
                            {p.overUnder === 'OVER' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {p.overUnder}
                          </div>
                        </div>
                      </div>
                      {/* Goal detail per side */}
                      <div className="mt-2 flex gap-2 text-[10px]">
                        <div className="flex-1 text-center bg-white/5 rounded px-2 py-1">
                          <span className="text-gray-500">Gol Kandang</span>
                          <div className="font-black text-white">{p.homeGoals} gol</div>
                        </div>
                        <div className="flex-1 text-center bg-white/5 rounded px-2 py-1">
                          <span className="text-gray-500">Gol Tamu</span>
                          <div className="font-black text-white">{p.awayGoals} gol</div>
                        </div>
                        <div className="flex-1 text-center bg-white/5 rounded px-2 py-1">
                          <span className="text-gray-500">Keyakinan</span>
                          <div className="font-black text-yellow-400">{p.confidence}%</div>
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
                    Analisa OMNI-9000 — {activeParlaySize} Tim
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
