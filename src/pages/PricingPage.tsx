import { motion } from 'motion/react';
import { Check, X, Zap, Crown, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PricingPage() {
  const navigate = useNavigate();

  const handleUpgrade = (plan: string) => {
    // Simulasi proses pembayaran sukses
    // Dalam aplikasi nyata, ini akan mengarahkan ke Stripe Checkout atau Midtrans
    localStorage.setItem('isPremium', 'true');
    localStorage.setItem('premiumPlan', plan);
    
    alert(`Selamat! Anda telah berlangganan paket ${plan}. Akses Premium telah dibuka.`);
    navigate('/dashboard');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
    >
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Pilih Paket Kemenangan Anda</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">Tingkatkan akurasi prediksi Anda dengan akses ke data eksklusif dan analisis mendalam.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* Free Tier */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col"
        >
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
            <div className="text-4xl font-bold text-white mb-2">Rp 0<span className="text-lg text-gray-500 font-normal">/bln</span></div>
            <p className="text-gray-400">Untuk pemula yang ingin mencoba.</p>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-gray-300">
              <Check className="w-5 h-5 text-green-400" /> Prediksi H-1
            </li>
            <li className="flex items-center gap-3 text-gray-300">
              <Check className="w-5 h-5 text-green-400" /> 5 prediksi/hari
            </li>
            <li className="flex items-center gap-3 text-gray-500">
              <X className="w-5 h-5" /> Analisis Faktor X
            </li>
            <li className="flex items-center gap-3 text-gray-500">
              <X className="w-5 h-5" /> Bebas Iklan
            </li>
          </ul>
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full py-4 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors"
          >
            Lanjut Gratis
          </button>
        </motion.div>

        {/* Premium Tier */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-8 rounded-3xl bg-gradient-to-b from-[var(--brand-900)]/40 to-[var(--brand-bg)] border-2 border-[var(--brand-500)] relative flex flex-col transform md:-translate-y-4 shadow-[0_0_30px_rgba(var(--brand-500),0.3)]"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--brand-500)] text-white px-4 py-1 rounded-full text-sm font-bold tracking-wider uppercase flex items-center gap-1">
            <Zap className="w-4 h-4" /> Paling Populer
          </div>
          <div className="mb-8 mt-4">
            <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
            <div className="text-4xl font-bold text-white mb-2">Rp 50k<span className="text-lg text-gray-500 font-normal">/bln</span></div>
            <p className="text-gray-400">Akses penuh ke semua prediksi dasar.</p>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-white">
              <Check className="w-5 h-5 text-[var(--brand-400)]" /> Semua prediksi real-time
            </li>
            <li className="flex items-center gap-3 text-white">
              <Check className="w-5 h-5 text-[var(--brand-400)]" /> Analisis detail (Form, H2H)
            </li>
            <li className="flex items-center gap-3 text-white">
              <Check className="w-5 h-5 text-[var(--brand-400)]" /> Faktor X Dasar
            </li>
            <li className="flex items-center gap-3 text-white">
              <Check className="w-5 h-5 text-[var(--brand-400)]" /> Tanpa Iklan
            </li>
          </ul>
          <button 
            onClick={() => handleUpgrade('Premium')}
            className="w-full py-4 rounded-xl bg-[var(--brand-600)] text-white font-bold hover:bg-[var(--brand-500)] transition-colors shadow-[0_0_20px_rgba(var(--brand-500),0.5)]"
          >
            Upgrade Premium (Demo)
          </button>
        </motion.div>

        {/* VIP Tier */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col"
        >
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              VIP <Crown className="w-5 h-5 text-yellow-500" />
            </h3>
            <div className="text-4xl font-bold text-white mb-2">Rp 500k<span className="text-lg text-gray-500 font-normal">/bln</span></div>
            <p className="text-gray-400">Untuk profesional dan investor.</p>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-white">
              <Check className="w-5 h-5 text-yellow-500" /> Semua fitur Premium
            </li>
            <li className="flex items-center gap-3 text-white">
              <Check className="w-5 h-5 text-yellow-500" /> Faktor X Eksklusif (Insider)
            </li>
            <li className="flex items-center gap-3 text-white">
              <Check className="w-5 h-5 text-yellow-500" /> API Access
            </li>
            <li className="flex items-center gap-3 text-white">
              <Check className="w-5 h-5 text-yellow-500" /> Konsultasi AI Pribadi
            </li>
          </ul>
          <button 
            onClick={() => handleUpgrade('VIP')}
            className="w-full py-4 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors border border-yellow-500/30 hover:border-yellow-500/50"
          >
            Upgrade VIP (Demo)
          </button>
        </motion.div>
      </div>

      {/* Trust Badges */}
      <div className="mt-24 pt-12 border-t border-white/5 text-center">
        <div className="flex justify-center items-center gap-2 mb-4">
          <Shield className="w-6 h-6 text-gray-400" />
          <span className="text-lg font-medium text-gray-400">Pembayaran Aman & Terenkripsi</span>
        </div>
        <p className="text-sm text-gray-500">Mendukung semua metode pembayaran lokal (GoPay, OVO, Dana, QRIS, Virtual Account)</p>
      </div>
    </motion.div>
  );
}
