import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Newspaper, TrendingUp, ExternalLink } from 'lucide-react';
import { fetchRealNews } from '../lib/predictionEngine';

interface NewsItem {
  id: string;
  title: string;
  timestamp: string;
  source: string;
  link: string;
  thumbnail?: string;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRealNews().then(data => {
      setNews(data);
      setLoading(false);
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--brand-600)] to-[var(--brand-400)] flex items-center justify-center">
          <Newspaper className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Berita Terkini</h1>
          <p className="text-gray-400">Update real-time yang mempengaruhi prediksi kami.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />
            ))
          ) : news.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400">Gagal memuat berita. Silakan coba lagi nanti.</p>
            </div>
          ) : (
            news.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-pointer items-start md:items-center"
                >
                  {item.thumbnail && (
                    <img 
                      src={item.thumbnail} 
                      alt={item.title} 
                      className="w-full md:w-40 h-48 md:h-32 object-cover rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-bold px-2 py-1 rounded bg-[var(--brand-500)]/20 text-[var(--brand-400)] uppercase tracking-wider">
                        {item.source}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[var(--brand-400)] transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-4">
                      <ExternalLink className="w-4 h-4" />
                      Baca selengkapnya
                    </div>
                  </div>
                </a>
              </motion.div>
            ))
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#111827] to-[#030712] border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[var(--brand-400)]" />
              Trending Topik
            </h3>
            <div className="space-y-4">
              {['Cedera Pemain Kunci', 'Rotasi Skuad', 'Cuaca Ekstrem', 'Pergantian Pelatih'].map((topic, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                  <span className="text-lg font-bold text-gray-600">0{i + 1}</span>
                  <span className="font-medium text-gray-300">{topic}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
