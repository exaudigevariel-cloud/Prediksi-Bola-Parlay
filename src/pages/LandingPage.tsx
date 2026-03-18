import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center"
    >
      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--brand-600)]/20 blur-[120px] rounded-full pointer-events-none" />
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-[var(--brand-400)] mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live: 92% Accuracy in Last 30 Days
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-8 leading-tight"
        >
          Akurasi <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-400)] to-[var(--brand-600)]">90%</span> di Semua<br />Pasar Prediksi
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-gray-400 max-w-2xl mx-auto mb-12"
        >
          Platform prediksi sepakbola omnipotent. Didukung oleh AI multi-model ensemble dan data "Faktor X" eksklusif yang tidak dimiliki kompetitor.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/dashboard"
            className="px-8 py-4 rounded-full bg-white text-black font-semibold text-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            Coba Gratis Sekarang <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/pricing"
            className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-colors"
          >
            Lihat Paket Premium
          </Link>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="w-full border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Akurasi 30 Hari', value: '92%' },
              { label: 'Total Prediksi', value: '1.2M+' },
              { label: 'Active Users', value: '500k+' },
              { label: 'Liga Dicakup', value: '50+' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-gray-400 font-medium uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Kenapa Prediksi Bola Akurat?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">Kami tidak hanya menebak. Kami menganalisis ribuan data point termasuk faktor yang tidak terlihat di statistik biasa.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <TrendingUp className="w-8 h-8 text-[var(--brand-400)]" />,
              title: 'Semua Pasar Prediksi',
              desc: '1X2, Over/Under, BTTS, Corners, Pelanggaran, hingga Kartu. Kami memprediksi semuanya dengan akurasi tinggi.'
            },
            {
              icon: <ShieldCheck className="w-8 h-8 text-[var(--brand-500)]" />,
              title: 'Data "Faktor X"',
              desc: 'Analisis wasit, rumor ruang ganti, cuaca, hingga kelelahan perjalanan. Data insider yang mengubah probabilitas.'
            },
            {
              icon: <Zap className="w-8 h-8 text-yellow-400" />,
              title: 'Real-time Updates',
              desc: 'Prediksi beradaptasi secara real-time berdasarkan berita terbaru, cedera saat pemanasan, dan pergerakan odds pasar.'
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
