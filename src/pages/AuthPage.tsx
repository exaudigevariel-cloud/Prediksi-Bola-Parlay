import { motion } from 'motion/react';
import React, { useState } from 'react';
import { Lock, Mail, Github, Chrome, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulated login
    localStorage.setItem('sharpedge_user', 'true');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black">
      {/* Background Blobs for GAHER look */}
      <div className="bg-blob bg-blob-1 opacity-20" />
      <div className="bg-blob bg-blob-2 opacity-20" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card p-8 rounded-[2rem] border-white/10 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-widest uppercase">
              SHARP<span className="text-cyan-400">EDGE</span>
            </h1>
            <p className="text-gray-500 text-[10px] font-bold tracking-[0.3em] uppercase mt-1">Sistem Prediksi Elit</p>
          </div>

          <div className="flex gap-4 p-1 bg-white/5 rounded-2xl mb-8">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-xl text-xs font-black uppercase transition-all ${isLogin ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-gray-500 hover:text-white'}`}
            >
              LOGIN
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-xl text-xs font-black uppercase transition-all ${!isLogin ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-gray-500 hover:text-white'}`}
            >
              DAFTAR
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="email" 
                  placeholder="anda@email.com"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Kata Sandi</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl text-xs font-black text-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-cyan-500/20 uppercase tracking-widest mt-4"
            >
              {isLogin ? 'MASUK KE DASHBOARD' : 'BUAT AKUN BARU'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[9px] uppercase font-black"><span className="bg-transparent px-4 text-gray-600">Atau Lanjut Dengan</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black hover:bg-white/10 transition-all text-white">
              <Chrome className="w-4 h-4" /> GOOGLE
            </button>
            <button className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black hover:bg-white/10 transition-all text-white">
              <Github className="w-4 h-4" /> GITHUB
            </button>
          </div>

          <p className="mt-8 text-center text-[9px] text-gray-600 uppercase font-black leading-relaxed">
            Dengan masuk, anda menyetujui <span className="text-gray-400">Ketentuan Layanan</span> dan <span className="text-gray-400">Kebijakan Privasi</span> SharpEdge.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
