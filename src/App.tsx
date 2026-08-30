import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useDataStore } from './store/useDataStore';
import { Navbar } from './components/Navbar';
import { LoginView } from './components/LoginView';
import { ToastContainer } from './components/ToastContainer';
import { POSView } from './components/pos/POSView';
import { InventarioView } from './components/inventario/InventarioView';
import { CajaView } from './components/caja/CajaView';
import { VentasView } from './components/ventas/VentasView';
import { CuentasView } from './components/cuentas/CuentasView';
import { AdminView } from './components/admin/AdminView';
import { calcularTotalCaja, formatearEuros } from './utils/cashUtils';

function AppContent() {
  const { isAuthenticated, user } = useAuthStore();
  const { cargarTodo, caja, ventas } = useDataStore();

  useEffect(() => {
    cargarTodo();
  }, [cargarTodo]);

  const totalCaja = calcularTotalCaja(caja);
  const ventasHoy = ventas.filter((v) => v.estado !== 'devuelta').length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center">
        <LoginView />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A4A4A] flex flex-col font-sans antialiased selection:bg-[#E3F2FD] selection:text-[#1976D2]">
      {/* Barra de navegación superior con diseño Professional Polish */}
      <Navbar />

      {/* Contenedor principal de vistas */}
      <main className="flex-1 pb-6">
        <Routes>
          <Route path="/" element={<POSView />} />
          <Route path="/pos" element={<Navigate to="/" replace />} />
          <Route path="/inventario" element={<InventarioView />} />
          <Route path="/caja" element={<CajaView />} />
          <Route path="/ventas" element={<VentasView />} />
          <Route path="/cuentas" element={<CuentasView />} />
          <Route path="/admin" element={<AdminView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer Barra de Estado / Terminal */}
      <footer className="h-12 bg-[#F8F9FA] border-t border-[#F0EBE3] px-4 sm:px-6 flex items-center justify-between shrink-0 sticky bottom-0 z-30">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
              Caja Abierta: <span className="text-slate-800">{formatearEuros(totalCaja)}</span>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
              Ventas Hoy: <span className="text-slate-800">{ventasHoy}</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-xs text-slate-400 hidden sm:block">
            Terminal: <span className="font-bold text-slate-600">STAND_01</span>
          </p>
          <p className="text-xs text-slate-400">
            Usuario:{' '}
            <span className="font-bold text-slate-600">
              {user?.email ? user.email.split('@')[0] : 'Admin_Maria'}
            </span>
          </p>
        </div>
      </footer>

      {/* Notificaciones Toast */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

