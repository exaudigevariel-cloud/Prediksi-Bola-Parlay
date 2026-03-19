import { motion } from 'motion/react';
import { Check, ShieldCheck, Zap, Crown, Target, Activity, Sparkles, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: 'BASIC',
    price: 'GRATIS',
    period: 'selamanya',
    features: [
      'Prediksi Pertandingan Umum',
      'Data Head-to-Head Dasar',
      'Skor Akhir Simulasi',
      'Akses Terbatas 3 Liga',
      'Update Tiap 24 Jam'
    ],
    cta: 'Daftar Sekarang',
    color: 'bg-white/5',
    borderColor: 'border-white/10',
    textColor: 'text-gray-400',
    icon: <Activity className="w-5 h-5" />
  },
  {
    name: 'PRO EDGE',
    price: 'Rp 49K',
    period: '/bulan',
    popular: true,
    features: [
      'Prediksi VIP Tanpa Batas',
      'Analisis Insider (Gemini AI)',
      'Bankroll Management Pro',
      'Kelly Criterion Staking',
      'Smart Importer Alat Bantu',
      'Update Real-Time 1 Jam'
    ],
    cta: 'Mulai Menang',
    color: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    textColor: 'text-cyan-400',
    icon: <Zap className="w-5 h-5 text-cyan-400" />
  },
  {
    name: 'VIP LEGEND',
    price: 'Rp 99K',
    period: '/bulan',
    features: [
      'Semua Fitur Pro +',
      'Sinyal Akurasi 95%+',
      'Grup Premium Telegram Exclusive',
      'Dropping Odds Alerts Fast',
      'Panduan Hedging Parlay Cerdas',
      'Prioritas Dukungan Teknis'
    ],
    cta: 'Dapatkan Akses VIP',
    color: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    textColor: 'text-white',
    icon: <Crown className="w-5 h-5 text-yellow-500" />
  }
];

export default function PricingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-black relative">
       {/* PREMIUM DESIGN BLOBS */}
       <div className="bg-blob bg-blob-1 opacity-10" />
       
       <div className="relative z-10 text-center mb-20 space-y-4">
          <div className="flex items-center justify-center gap-2 text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-2">
             <Sparkles className="w-4 h-4" /> PILIH SENJATA ANDA
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none">
             INVESTASI <span className="vip-gradient">CERDAS</span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-base font-medium"> Bergabunglah dengan elite bettor yang mempercayai algoritma matematika dibandingkan firasat. </p>
       </div>

       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {plans.map((plan, idx) => (
            <motion.div 
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`glass-card rounded-[3rem] p-10 flex flex-col relative overflow-hidden group border ${plan.borderColor} ${plan.color}`}
            >
              {plan.popular && (
                <div className="absolute top-8 right-8 px-4 py-1.5 rounded-full bg-cyan-500 text-black text-[9px] font-black uppercase tracking-widest shadow-lg shadow-cyan-500/30">
                  PALING LARIS
                </div>
              )}

              <div className="mb-8">
                 <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {plan.icon}
                 </div>
                 <h2 className={`text-xl font-black ${plan.textColor} tracking-widest uppercase mb-2`}>{plan.name}</h2>
                 <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    <span className="text-gray-600 text-[10px] font-black uppercase tracking-widest">{plan.period}</span>
                 </div>
              </div>

              <div className="flex-1 space-y-4 mb-10">
                 {plan.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-3">
                       <ShieldCheck className={`w-4 h-4 ${plan.textColor} group-hover:rotate-12 transition-transform`} />
                       <span className="text-gray-400 text-xs font-medium leading-relaxed">{feature}</span>
                    </div>
                 ))}
              </div>

              <button 
                onClick={() => navigate('/login')}
                className={`w-full py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  plan.popular 
                    ? 'bg-cyan-500 text-black shadow-xl shadow-cyan-500/40 hover:scale-105' 
                    : plan.name === 'VIP LEGEND' 
                    ? 'bg-yellow-500 text-black shadow-xl shadow-yellow-500/40 hover:scale-105'
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
       </div>

       {/* TRUST BADGE SECTION CEO PERSPECTIVE */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-t border-white/5 text-center">
          <div className="space-y-1">
             <div className="text-2xl font-black text-white">92.4%</div>
             <div className="text-[9px] text-gray-500 uppercase font-black">Rata-rata Akurasi</div>
          </div>
          <div className="space-y-1">
             <div className="text-2xl font-black text-white">100+</div>
             <div className="text-[9px] text-gray-500 uppercase font-black">Liga Tercover</div>
          </div>
          <div className="space-y-1">
             <div className="text-2xl font-black text-white">AI</div>
             <div className="text-[9px] text-gray-500 uppercase font-black">Powered Engine</div>
          </div>
          <div className="space-y-1">
             <div className="text-2xl font-black text-white">2.5K</div>
             <div className="text-[9px] text-gray-500 uppercase font-black">Elite Bettors</div>
          </div>
       </div>
    </div>
  );
}
