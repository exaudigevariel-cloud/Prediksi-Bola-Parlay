import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Home, TrendingUp, Newspaper, ShieldAlert, Menu, X, User } from 'lucide-react';
import { useState } from 'react';

// Pages
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import NewsPage from './pages/NewsPage';
import PricingPage from './pages/PricingPage';
import ParlayPage from './pages/ParlayPage';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 font-sans selection:bg-purple-500/30">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-black border border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)] flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-500 animate-pulse" />
              </div>
              <Link to="/" className="text-2xl font-bold tracking-widest text-green-500 glitch-wrapper w-fit font-mono" style={{ textShadow: '0 0 10px rgba(34,197,94,0.8)' }}>
                <span className="glitch" data-text="PR3D1KS1_B0L4">PR3D1KS1_B0L4</span>
                <span className="animate-pulse opacity-70 ml-1">_</span>
              </Link>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Home</Link>
              <Link to="/dashboard" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Predictions</Link>
              <Link to="/parlay" className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">Parlay 9000</Link>
              <Link to="/news" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">News</Link>
              <Link to="/pricing" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Pricing</Link>
              
              <Link to="/dashboard" className="px-5 py-2 rounded-full bg-gradient-to-r from-[var(--brand-600)] to-[var(--brand-400)] text-white text-sm font-bold hover:opacity-90 transition-all shadow-[0_0_20px_rgba(var(--brand-500),0.4)]">
                Mulai Prediksi
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-400 hover:text-white">
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/5 bg-[#030712]"
            >
              <div className="px-4 py-4 space-y-4 flex flex-col">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white font-medium">Home</Link>
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white font-medium">Predictions</Link>
                <Link to="/parlay" onClick={() => setIsMobileMenuOpen(false)} className="text-purple-400 hover:text-purple-300 font-bold">Parlay 9000</Link>
                <Link to="/news" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white font-medium">News</Link>
                <Link to="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white font-medium">Pricing</Link>
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-purple-400 font-bold">Mulai Prediksi</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Routes location={location}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/parlay" element={<ParlayPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/pricing" element={<PricingPage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-500" />
              <span className="text-lg font-bold tracking-tight text-white">Prediksi Bola Akurat</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2026 Prediksi Bola Akurat. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-white/5 px-3 py-1.5 rounded-full">
              <ShieldAlert className="w-3 h-3 text-yellow-500" />
              <span>For entertainment purposes only. 18+</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
