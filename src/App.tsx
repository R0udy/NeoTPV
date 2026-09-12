import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useDataStore } from './store/useDataStore';
import { Navbar } from './components/Navbar';
import { LoginView } from './components/LoginView';
import { ToastContainer } from './components/ToastContainer';
import { AdminHubView } from './components/admin/AdminHubView';
import { EventosView } from './components/eventos/EventosView';
import { POSView } from './components/pos/POSView';
import { InventarioView } from './components/inventario/InventarioView';
import { CajaView } from './components/caja/CajaView';
import { VentasView } from './components/ventas/VentasView';
import { CuentasView } from './components/cuentas/CuentasView';
import { AdminView } from './components/admin/AdminView';
import { calcularTotalCaja, formatearEuros } from './utils/cashUtils';

function AppContent() {
  const { isAuthenticated, isCheckingAuth, user, initAuth } = useAuthStore();
  const { cargarTodo, eventos, eventoActivoId, ventas } = useDataStore();

  // Inicializar listener de Firebase Auth al arrancar la app
  useEffect(() => {
    const unsubscribe = initAuth();
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [initAuth]);

  // Cargar datos del Provider únicamente cuando el usuario esté autenticado
  useEffect(() => {
    if (isAuthenticated) {
      cargarTodo();
    }
  }, [isAuthenticated, cargarTodo]);

  const eventoActivo = eventos.find((e) => e.id === eventoActivoId) || eventos.find((e) => e.estado === 'activo') || null;
  const totalCaja = eventoActivo ? calcularTotalCaja(eventoActivo.cajaActual) : 0;
  const ventasEvento = eventoActivo
    ? ventas.filter((v) => v.eventoId === eventoActivo.id && v.estado !== 'devuelta').length
    : ventas.filter((v) => v.estado !== 'devuelta').length;

  // Estado de carga inicial mientras se comprueba la sesión guardada
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E3F2FD] flex items-center justify-center text-[#2196F3] animate-pulse">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Iniciando sistema...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, la pantalla 1 de Login es OBLIGATORIA
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
      {/* Barra de navegación superior adaptativa */}
      <Navbar />

      {/* Contenedor principal de vistas */}
      <main className="flex-1 pb-6">
        <Routes>
          {/* Pantalla 2: Ventana Administrativa Hub Principal */}
          <Route path="/" element={<AdminHubView />} />

          {/* Pantalla 3 & 4: Gestión de Eventos Activos y Cerrados */}
          <Route path="/eventos" element={<EventosView />} />

          {/* Pantalla 6: TPV del Evento Activo */}
          <Route path="/pos" element={<POSView />} />

          {/* Gestión de Inventario General (Centralizado) */}
          <Route path="/inventario" element={<InventarioView />} />

          {/* Caja viva del Evento */}
          <Route path="/caja" element={<CajaView />} />

          {/* Registro de Ventas */}
          <Route path="/ventas" element={<VentasView />} />

          {/* Cuentas y Estadísticas */}
          <Route path="/cuentas" element={<CuentasView />} />

          {/* Configuración y Diagnóstico */}
          <Route path="/admin" element={<AdminView />} />
          <Route path="/configuracion" element={<Navigate to="/admin" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer Barra de Estado / Terminal */}
      <footer className="h-12 bg-[#F8F9FA] border-t border-[#F0EBE3] px-4 sm:px-6 flex items-center justify-between shrink-0 sticky bottom-0 z-30">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${eventoActivo ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter truncate max-w-[240px]">
              {eventoActivo ? (
                <>
                  {eventoActivo.nombre}: <span className="text-slate-800">{formatearEuros(totalCaja)}</span>
                </>
              ) : (
                <span className="text-amber-700">Sin evento activo</span>
              )}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
              Tickets Evento: <span className="text-slate-800">{ventasEvento}</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-xs text-slate-400 hidden sm:block">
            Inventario: <span className="font-bold text-slate-600">GENERAL CENTRALIZADO</span>
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Usuario:</span>
            <span className="font-bold text-slate-700">
              {user?.name || user?.email?.split('@')[0] || 'Administrador'}
            </span>
            {user?.role && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                {user.role}
              </span>
            )}
          </div>
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
