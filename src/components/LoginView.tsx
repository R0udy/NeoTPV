import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Sparkles, ShoppingBag, ShieldCheck, ArrowRight, KeyRound, Mail } from 'lucide-react';
import { motion } from 'motion/react';

export const LoginView: React.FC = () => {
  const [email, setEmail] = useState('admin@standeventos.es');
  const [password, setPassword] = useState('••••••••');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Login stub: siempre autoriza el acceso
    login(email);
    navigate('/');
  };

  return (
    <div
      id="login-view-container"
      className="min-h-screen flex items-center justify-center p-4 bg-[#FDFBF7]"
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-100 border border-[#F0EBE3] relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#E3F2FD] flex items-center justify-center text-[#2196F3] shadow-xs mb-4 border border-blue-200">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-800 tracking-tight">
            TPV Stand Eventos
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xs">
            Joyería & Merchandising Geek, Anime y K-Pop
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E3F2FD] text-[#1976D2] text-xs font-semibold border border-blue-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Acceso exclusivo de administrador</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="input-login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@stand.es"
                className="w-full pl-11 pr-4 py-3 bg-[#F8F9FA] border border-[#F0EBE3] rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all min-h-[46px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">
              Contraseña de Stand
            </label>
            <div className="relative">
              <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="input-login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-[#F8F9FA] border border-[#F0EBE3] rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all min-h-[46px]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              id="btn-login-submit"
              type="submit"
              className="w-full py-3.5 px-6 bg-[#2196F3] hover:bg-[#1976D2] active:scale-[0.98] text-white font-bold rounded-xl shadow-md shadow-blue-100 flex items-center justify-center gap-2 transition-all min-h-[48px] touch-press cursor-pointer"
            >
              <span>Acceder al TPV de Stand</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-[#F0EBE3] text-center relative z-10">
          <p className="text-xs text-slate-400">
            Modo Stub activo: cualquier credencial da acceso inmediato para pruebas en stand.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
