import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Coins,
  Package,
  ReceiptText,
  BarChart3,
  Settings,
  LogOut,
  Calendar,
  ArrowLeft,
  ChevronDown,
  Lock,
  Plus,
  Home
} from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import { useAuthStore } from '../store/useAuthStore';
import { calcularTotalCaja, formatearEuros } from '../utils/cashUtils';
import { CrearEventoModal } from './eventos/CrearEventoModal';
import { CerrarEventoModal } from './eventos/CerrarEventoModal';

export const Navbar: React.FC = () => {
  const {
    eventos,
    eventoActivoId,
    seleccionarEvento,
    alertas,
    isMockActive,
    settings
  } = useDataStore();
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [modalCrearEvento, setModalCrearEvento] = useState(false);
  const [modalCerrarEvento, setModalCerrarEvento] = useState(false);
  const [selectorEventosOpen, setSelectorEventosOpen] = useState(false);

  const eventosActivos = eventos.filter((e) => e.estado === 'activo');
  const eventoActivo = eventos.find((e) => e.id === eventoActivoId) || eventosActivos[0] || null;
  const totalCaja = eventoActivo ? calcularTotalCaja(eventoActivo.cajaActual) : 0;
  const alertasCriticas = alertas.filter((a) => a.gravedad === 'error' || a.gravedad === 'warning').length;

  const isTPVArea = ['/pos', '/caja', '/ventas', '/cuentas'].includes(location.pathname);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Nombres optimizados para encajar perfectamente en tablet y móvil sin desbordes
  const tpvTabs = [
    {
      to: '/pos',
      label: 'TPV',
      icon: ShoppingBag,
      id: 'nav-tab-pos'
    },
    {
      to: '/caja',
      label: 'Caja',
      icon: Coins,
      id: 'nav-tab-caja',
      badge: eventoActivo ? formatearEuros(totalCaja) : undefined
    },
    {
      to: '/ventas',
      label: 'Ventas',
      icon: ReceiptText,
      id: 'nav-tab-ventas'
    },
    {
      to: '/cuentas',
      label: 'Cuentas',
      icon: BarChart3,
      id: 'nav-tab-cuentas'
    }
  ];

  const hubTabs = [
    {
      to: '/',
      label: 'Hub',
      icon: Home,
      id: 'nav-tab-hub'
    },
    {
      to: '/eventos',
      label: 'Eventos',
      icon: Calendar,
      id: 'nav-tab-eventos',
      countBadge: eventosActivos.length
    },
    {
      to: '/inventario',
      label: 'Inventario',
      icon: Package,
      id: 'nav-tab-inventario'
    },
    {
      to: '/admin',
      label: 'Ajustes',
      icon: Settings,
      id: 'nav-tab-admin',
      alertCount: alertasCriticas
    }
  ];

  return (
    <>
      <header
        id="main-app-header"
        className="bg-white border-b border-[#F0EBE3] sticky top-0 z-40 shadow-2xs"
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between py-1.5 md:py-0 md:h-14 lg:h-16 gap-1.5 md:gap-2 lg:gap-3">
            
            {/* Sección Izquierda: Logo y Selector de Evento */}
            <div className="flex items-center justify-between shrink-0 gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="w-8 h-8 md:w-8.5 md:h-8.5 lg:w-9 lg:h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-2xs shrink-0 cursor-pointer hover:bg-blue-700 transition-colors"
                  title="Ir al Hub Administrativo"
                >
                  <ShoppingBag className="w-4 h-4 md:w-4.5 md:h-4.5" />
                </button>

                <div className="leading-tight">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => navigate('/')}
                      className="font-bold text-xs sm:text-sm lg:text-base tracking-tight text-slate-900 hover:text-blue-600 transition-colors cursor-pointer text-left truncate max-w-[110px] sm:max-w-[140px] md:max-w-[130px] lg:max-w-[180px]"
                    >
                      {settings.nombreTienda ? settings.nombreTienda.toUpperCase() : 'EVENTA'}
                    </button>
                  </div>

                  {/* Selector rápido de evento activo */}
                  <div className="relative">
                    {eventoActivo ? (
                      <button
                        type="button"
                        onClick={() => setSelectorEventosOpen(!selectorEventosOpen)}
                        className="text-[10px] md:text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-1.5 md:px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors cursor-pointer max-w-[120px] sm:max-w-[150px] md:max-w-[140px] lg:max-w-[200px] truncate mt-0.5 border border-blue-200"
                        title="Cambiar de evento activo"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                        <span className="truncate">{eventoActivo.nombre}</span>
                        <ChevronDown className="w-3 h-3 shrink-0 opacity-70" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate('/eventos')}
                        className="text-[10px] md:text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-1.5 md:px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors cursor-pointer mt-0.5 border border-amber-200"
                      >
                        <span>Sin evento</span>
                        <ChevronDown className="w-3 h-3 shrink-0" />
                      </button>
                    )}

                    {/* Menú desplegable */}
                    {selectorEventosOpen && (
                      <div className="absolute left-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-fadeIn">
                        <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Seleccionar Evento Activo
                        </div>
                        <div className="space-y-1 max-h-48 overflow-y-auto my-1">
                          {eventosActivos.map((evt) => (
                            <button
                              key={evt.id}
                              type="button"
                              onClick={() => {
                                seleccionarEvento(evt.id);
                                setSelectorEventosOpen(false);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                                evt.id === eventoActivo?.id
                                  ? 'bg-blue-50 text-blue-700 font-bold'
                                  : 'text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <span className="truncate">{evt.nombre}</span>
                              <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                                {formatearEuros(calcularTotalCaja(evt.cajaActual))}
                              </span>
                            </button>
                          ))}
                        </div>
                        <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectorEventosOpen(false);
                              setModalCrearEvento(true);
                            }}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 p-1 flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Nuevo
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectorEventosOpen(false);
                              navigate('/eventos');
                            }}
                            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 p-1"
                          >
                            Ver Todos
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Botón móvil de logout y modo */}
              <div className="flex items-center gap-1.5 md:hidden">
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                    isMockActive
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {isMockActive ? 'MOCK' : 'CLOUD'}
                </span>

                <button
                  type="button"
                  id="btn-navbar-logout-mobile"
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Pestañas de Navegación Compactas y Optimizadas */}
            <nav
              id="navbar-tab-links"
              className="flex items-center justify-between md:justify-center gap-1 sm:gap-1.5 md:gap-1 lg:gap-1.5 flex-1 w-full md:w-auto"
            >
              {(isTPVArea ? tpvTabs : hubTabs).map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    id={item.id}
                    className={({ isActive }) =>
                      `relative flex items-center justify-center gap-1 md:gap-1.5 px-2 sm:px-2.5 md:px-2.5 lg:px-3.5 py-1.5 md:py-1.5 rounded-xl text-xs md:text-xs lg:text-sm font-bold transition-all whitespace-nowrap min-h-[36px] md:min-h-[38px] flex-1 md:flex-initial cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`
                    }
                  >
                    <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                    <span>{item.label}</span>

                    {/* Badge numérico de items o alertas */}
                    {(item as any).countBadge !== undefined && (
                      <span className="text-[9px] md:text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 ml-0.5">
                        {(item as any).countBadge}
                      </span>
                    )}

                    {(item as any).alertCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ml-0.5" />
                    )}
                  </NavLink>
                );
              })}

              {/* Botón para volver al Hub desde el TPV */}
              {isTPVArea && (
                <button
                  type="button"
                  id="btn-nav-volver-hub"
                  onClick={() => navigate('/')}
                  className="flex items-center gap-1 px-2 md:px-2.5 lg:px-3 py-1.5 rounded-xl text-xs md:text-xs lg:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors whitespace-nowrap cursor-pointer shrink-0 min-h-[36px] md:min-h-[38px]"
                  title="Volver a la ventana administrativa"
                >
                  <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="inline">Hub</span>
                </button>
              )}
            </nav>

            {/* Sección Derecha Tablet & Desktop */}
            <div className="hidden md:flex items-center gap-1.5 lg:gap-2.5 shrink-0">
              {/* Botón de cierre de evento */}
              {isTPVArea && eventoActivo && (
                <button
                  type="button"
                  onClick={() => setModalCerrarEvento(true)}
                  className="px-2 md:px-2.5 lg:px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap min-h-[36px] md:min-h-[38px]"
                  title="Cerrar evento actual con arqueo"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Cerrar Evento</span>
                  <span className="lg:hidden">Cerrar</span>
                </button>
              )}

              <span
                className={`text-[10px] md:text-[10px] lg:text-[11px] font-bold px-2 lg:px-2.5 py-1 rounded-full border whitespace-nowrap ${
                  isMockActive
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                {isMockActive ? '● MOCK' : '● CLOUD'}
              </span>

              <button
                type="button"
                id="btn-navbar-logout"
                onClick={handleLogout}
                className="p-1.5 lg:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Modal para crear evento */}
      <CrearEventoModal
        isOpen={modalCrearEvento}
        onClose={() => setModalCrearEvento(false)}
        onEventCreated={(nuevoId) => {
          seleccionarEvento(nuevoId);
          navigate('/pos');
        }}
      />

      {/* Modal para cerrar evento */}
      {eventoActivo && modalCerrarEvento && (
        <CerrarEventoModal
          evento={eventoActivo}
          isOpen={modalCerrarEvento}
          onClose={() => setModalCerrarEvento(false)}
          onSuccess={() => navigate('/eventos')}
        />
      )}
    </>
  );
};
