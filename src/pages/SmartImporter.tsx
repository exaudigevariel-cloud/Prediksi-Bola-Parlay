import { motion } from 'motion/react';
import { useState } from 'react';
import { Upload, Clipboard, Cpu, ShieldCheck, Zap, AlertTriangle, ArrowRight, Table, Settings, Globe } from 'lucide-react';
import { generateGeminiContent } from '../lib/geminiApi';

export default function SmartImporter() {
  const [pastedData, setPastedData] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!pastedData.trim()) return;
    setAnalyzing(true);
    
    const systemPrompt = `Anda adalah OMNI-9000 SharpEdge Data Parser. 
Tugas Anda: Mengekstrak data odds dari teks berantakan (hasil copy-paste dari situs bandar/odds) dan mengubahnya menjadi analisis betting pro. 
Fokus pada: 1X2, Asian Handicap, dan Over/Under.`;

    const userPrompt = `Parse data berikut dan berikan ringkasan prediksinya dalam format yang rapi:\n\n${pastedData}\n\nBerikan analisis "Value Bet" jika ada anomali odds.`;

    try {
      const aiResult = await generateGeminiContent(systemPrompt, userPrompt);
      setResult(aiResult);
    } catch {
      setResult("Gagal memproses data. Pastikan format teks berisi angka odds yang jelas.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-10 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto"
    >
      <div className="flex flex-col gap-4 mb-10 text-center items-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)] mb-2">
           <Upload className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight">SMART ODDS IMPORTER</h1>
        <p className="text-gray-400 max-w-2xl text-sm">
          Copy data dari situs bandar (Bet365, Pinnacle, 188Bet, dll) lalu paste di sini. 
          AI SharpEdge akan membedah data mentah menjadi sinyal betting yang akurat.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Input Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0f172a]/50 border border-blue-500/20 rounded-3xl p-6 backdrop-blur-xl">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                   <Clipboard className="w-4 h-4" />
                   PASTE DATA MENTAH
                </div>
                <div className="flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                   <span className="text-[10px] text-gray-500 uppercase font-black">AI Ready</span>
                </div>
             </div>
             
             <textarea
                value={pastedData}
                onChange={(e) => setPastedData(e.target.value)}
                placeholder="Paste odds, jadwal, atau teks dari website bandar di sini..."
                className="w-full h-64 bg-black/40 border border-white/5 rounded-2xl p-4 text-gray-300 text-xs font-mono focus:border-blue-500/50 outline-none transition-all resize-none"
             />

             <button
                onClick={handleAnalyze}
                disabled={analyzing || !pastedData}
                className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(37,99,235,0.3)] transition-all transform hover:scale-[1.01]"
             >
                {analyzing ? (
                   <>
                      <Cpu className="w-6 h-6 animate-spin" />
                      MEMBEDAH DATA...
                   </>
                ) : (
                   <>
                      <Zap className="w-6 h-6" />
                      EKSTRAK SINYAL AI
                      <ArrowRight className="w-5 h-5" />
                   </>
                )}
             </button>
          </div>

          {/* Results Area */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#080c14] border border-cyan-500/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.1)]"
            >
              <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                 <ShieldCheck className="w-6 h-6 text-cyan-400" />
                 <h2 className="text-xl font-black text-white uppercase tracking-tighter">HASIL EKSTRAKSI SHARPEDGE</h2>
              </div>
              <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                {result}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: Info / Instructions */}
        <div className="space-y-6">
           <div className="bg-gradient-to-b from-[#1e293b] to-[#0f172a] border border-blue-500/20 rounded-3xl p-6">
              <h3 className="text-white font-black text-sm mb-4 flex items-center gap-2">
                 <Settings className="w-5 h-5 text-blue-400" />
                 CARA KERJA
              </h3>
              <ul className="space-y-4">
                 {[
                   { icon: <Table />, text: "Gunakan CTRL+A & CTRL+C pada tabel pasaran di website agen." },
                   { icon: <Clipboard />, text: "Paste hasilnya ke kolom input (tidak apa-apa jika teks berantakan)." },
                   { icon: <Cpu />, text: "AI akan mem-parsing angka 1X2, HDP, dan O/U secara otomatis." },
                   { icon: <Globe />, text: "Mendukung pasaran Liga Inggris, Spanyol, Italia, hingga Liga Indonesia." }
                 ].map((item, i) => (
                   <li key={i} className="flex gap-3 text-xs text-gray-400">
                      <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center shrink-0">
                         {item.icon && <span className="[&>svg]:w-3 [&>svg]:h-3 text-blue-400">{item.icon}</span>}
                      </div>
                      <span>{item.text}</span>
                   </li>
                 ))}
              </ul>
           </div>

           <div className="bg-yellow-900/20 border border-yellow-500/30 p-6 rounded-3xl flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-yellow-500 shrink-0" />
              <div>
                 <div className="text-yellow-400 font-black text-xs uppercase mb-1">Peringatan Akurasi</div>
                 <p className="text-gray-400 text-[10px] leading-relaxed">
                    Parser ini menggunakan LLM tingkat tinggi. Jika angka odds tertukar, silakan periksa kembali data mentah Anda. Selalu gunakan bankroll management yang bijak.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
