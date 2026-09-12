import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { isFirebaseConfigured, firebaseConfig } from '../config/firebaseConfig';
import {
  Sparkles,
  ShieldCheck,
  ArrowRight,
  KeyRound,
  Mail,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Laptop,
} from 'lucide-react';
import { motion } from 'motion/react';

export const LoginView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMachine, setRememberMachine] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const { login, authError, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    clearError();

    const result = await login(email, password, rememberMachine);
    setIsLoading(false);

    if (result.success) {
      navigate('/');
    }
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
        className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-[#F0EBE3] relative overflow-hidden"
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
            <ShieldCheck className="w-3.5 h-3.5 text-[#1976D2]" />
            <span>Acceso Administrador (Rol: advanced)</span>
          </div>
        </div>

        {/* Mensaje de error si falla la autenticación */}
        {authError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950 flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              <p className="font-bold text-rose-900">Error de autenticación</p>
              <p className="mt-0.5">{authError}</p>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
              Correo Electrónico de Administrador
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="input-login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@standeventos.es"
                autoComplete="email"
                className="w-full pl-11 pr-4 py-3 bg-[#F8F9FA] border border-[#F0EBE3] rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all min-h-[46px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
              Contraseña
            </label>
            <div className="relative">
              <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="input-login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full pl-11 pr-4 py-3 bg-[#F8F9FA] border border-[#F0EBE3] rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all min-h-[46px]"
              />
            </div>
          </div>

          {/* Opción para recordar el login en esta máquina */}
          <div className="flex items-center justify-between px-1 py-1">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer select-none">
              <input
                id="checkbox-remember-machine"
                type="checkbox"
                checked={rememberMachine}
                onChange={(e) => setRememberMachine(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <Laptop className="w-3.5 h-3.5 text-slate-400" /> Recordar inicio de sesión en este equipo
              </span>
            </label>
          </div>

          <div className="pt-2">
            <button
              id="btn-login-submit"
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full py-3.5 px-6 bg-[#2196F3] hover:bg-[#1976D2] active:scale-[0.98] text-white font-bold rounded-xl shadow-md shadow-blue-200/50 flex items-center justify-center gap-2 transition-all min-h-[48px] touch-press cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Autenticando con Firebase...</span>
                </>
              ) : (
                <>
                  <span>Entrar al TPV</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-[#F0EBE3] text-center relative z-10 space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              {isFirebaseConfigured()
                ? `Firebase Auth conectado (${firebaseConfig.projectId})`
                : 'Modo autónomo local'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Al iniciar sesión, tu token de autenticación autoriza automáticamente las operaciones en Firestore.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

