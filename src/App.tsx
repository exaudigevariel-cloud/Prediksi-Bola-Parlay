import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import DashboardPage from './pages/DashboardPage';
import ParlayPage from './pages/ParlayPage';
import NewsPage from './pages/NewsPage';
import PricingPage from './pages/PricingPage';
import SmartImporter from './pages/SmartImporter';
import AuthPage from './pages/AuthPage';
import AccuracyDashboard from './pages/AccuracyDashboard';
import VIPSignalsPage from './pages/VIPSignalsPage';
import { Activity, History, Zap, User, X, ShieldCheck, Crown } from 'lucide-react';

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('sharpedge_user') === 'true');

  useEffect(() => {
    const handleStorage = () => {
      setIsAuthenticated(localStorage.getItem('sharpedge_user') === 'true');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-black text-white relative overflow-x-hidden font-sans selection:bg-cyan-500/30">
        {/* Optimized Background Blobs */}
        <div className="bg-blob bg-blob-1" />
        <div className="bg-blob bg-blob-2" />
        <div className="bg-blob bg-blob-3" />

        <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/40 backdrop-blur-3xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20 items-center">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center group-hover:rotate-12 transition-transform shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-widest text-white leading-none uppercase">SHARP<span className="text-cyan-400">EDGE</span></span>
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Football Intelligence</span>
                </div>
              </Link>
              
              <div className="hidden md:flex items-center gap-10">
                <Link to="/" className="text-[11px] font-black text-gray-400 hover:text-white transition-all uppercase tracking-widest">Home</Link>
                <Link to="/dashboard" className="text-[11px] font-black text-gray-400 hover:text-white transition-all uppercase tracking-widest">Prediksi</Link>
                <Link to="/accuracy" className="text-[11px] font-black text-cyan-400 hover:text-cyan-300 transition-all uppercase tracking-widest flex items-center gap-2">
                   <History className="w-4 h-4" /> Histori
                </Link>
                <Link to="/vip" className="text-[11px] font-black text-yellow-500 hover:text-yellow-400 transition-all uppercase tracking-widest flex items-center gap-2">
                   <Crown className="w-4 h-4" /> VIP Signals
                </Link>
                <Link to="/parlay" className="text-[11px] font-black text-purple-400 hover:text-purple-300 transition-all uppercase tracking-widest flex items-center gap-2">
                   <Zap className="w-4 h-4" /> Parlay
                </Link>
                <Link to="/pricing" className="text-[11px] font-black text-gray-400 hover:text-white transition-all uppercase tracking-widest">Pricing</Link>
                
                {isAuthenticated ? (
                   <button 
                     onClick={() => { localStorage.removeItem('sharpedge_user'); setIsAuthenticated(false); }} 
                     title="User Menu"
                     aria-label="User Menu"
                     className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-cyan-400"
                   >
                     <User className="w-5 h-5" />
                   </button>
                ) : (
                  <Link to="/login" className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-cyan-600/20">Login</Link>
                )}
              </div>

              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                title="Toggle Menu"
                aria-label="Toggle Menu"
                className="md:hidden p-2 text-gray-400"
              >
                {isMobileMenuOpen ? <X /> : <Activity />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden bg-black/95 border-b border-white/5 backdrop-blur-3xl overflow-hidden"
              >
                <div className="px-6 py-10 space-y-8 flex flex-col">
                  <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-black text-gray-400 hover:text-white uppercase tracking-widest">Home</Link>
                  <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-black text-gray-400 hover:text-white uppercase tracking-widest">Prediksi</Link>
                  <Link to="/accuracy" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-black text-cyan-400 uppercase tracking-widest">Histori Akurasi</Link>
                  <Link to="/vip" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-black text-yellow-500 uppercase tracking-widest">VIP Signals</Link>
                  <Link to="/parlay" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-black text-purple-400 uppercase tracking-widest">Parlay Matrix</Link>
                  <Link to="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-black text-gray-400 uppercase tracking-widest">Pricing</Link>
                  {!isAuthenticated && <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-black text-cyan-600 uppercase tracking-widest">Login / Daftar</Link>}
                  {isAuthenticated && <button onClick={() => { localStorage.removeItem('sharpedge_user'); setIsAuthenticated(false); setIsMobileMenuOpen(false); }} className="text-lg font-black text-red-500 uppercase tracking-widest text-left">Logout</button>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        <main className="pt-20 min-h-[calc(100vh-200px)]">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/parlay" element={<ParlayPage />} />
            <Route path="/vip" element={isAuthenticated ? <VIPSignalsPage /> : <Navigate to="/login" />} />
            <Route path="/importer" element={<SmartImporter />} />
            <Route path="/accuracy" element={<AccuracyDashboard />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <footer className="border-t border-white/5 py-12 mt-24 relative z-10 bg-black">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 opacity-30">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">SharpEdge Matrix v2.1</span>
              </div>
              <p className="text-gray-600 text-[9px] font-black uppercase tracking-[0.3em]">
                © 2026 SHARPEDGE FOOTBALL INTELLIGENCE. SEMUA HAK DILINDUNGI.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
