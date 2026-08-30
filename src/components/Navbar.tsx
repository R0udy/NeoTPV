import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Coins,
  Package,
  ReceiptText,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Sparkles,
  Database
} from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import { useAuthStore } from '../store/useAuthStore';
import { calcularTotalCaja, formatearEuros } from '../utils/cashUtils';

export const Navbar: React.FC = () => {
  const { caja, alertas, isMockActive, settings } = useDataStore();
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const totalCaja = calcularTotalCaja(caja);
  const alertasCriticas = alertas.filter((a) => a.gravedad === 'error' || a.gravedad === 'warning').length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      to: '/',
      label: 'Punto de Venta',
      shortLabel: 'TPV',
      icon: ShoppingBag,
      id: 'nav-tab-pos'
    },
    {
      to: '/caja',
      label: 'Caja',
      shortLabel: 'Caja',
      icon: Coins,
      id: 'nav-tab-caja',
      badge: formatearEuros(totalCaja)
    },
    {
      to: '/inventario',
      label: 'Inventario',
      shortLabel: 'Inventario',
      icon: Package,
      id: 'nav-tab-inventario'
    },
    {
      to: '/ventas',
      label: 'Ventas',
      shortLabel: 'Ventas',
      icon: ReceiptText,
      id: 'nav-tab-ventas'
    },
    {
      to: '/cuentas',
      label: 'Cuentas',
      shortLabel: 'Cuentas',
      icon: BarChart3,
      id: 'nav-tab-cuentas'
    },
    {
      to: '/admin',
      label: 'Admin',
      shortLabel: 'Admin',
      icon: Settings,
      id: 'nav-tab-admin',
      alertCount: alertasCriticas
    }
  ];

  return (
    <header
      id="main-app-header"
      className="bg-white border-b border-[#F0EBE3] sticky top-0 z-40 shadow-2xs"
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-2 md:py-0 md:h-16 gap-2 md:gap-3">
          
          {/* Top Row in mobile / Left section in Desktop: Logo & Quick controls */}
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#E3F2FD] rounded-xl flex items-center justify-center text-[#2196F3] shadow-xs shrink-0">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-sm sm:text-base tracking-tight text-slate-800">
                    {settings.nombreTienda ? settings.nombreTienda.toUpperCase() : 'EVENTA'}
                  </h1>
                  <span className="text-xs px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-semibold">
                    TPV
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate max-w-[140px] sm:max-w-[180px] font-medium hidden sm:block">
                  {settings.nombreEvento || 'Stand Eventos'}
                </p>
              </div>
            </div>

            {/* Mobile / Tablet Mode Indicator & Logout (placed top right on mobile) */}
            <div className="flex items-center gap-2 md:hidden">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isMockActive
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-[#E8F5E9] text-[#2E7D32] border-emerald-200'
                }`}
              >
                {isMockActive ? 'Mock' : 'Cloud'}
              </span>

              <button
                type="button"
                id="btn-navbar-logout-mobile"
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs - All 6 buttons ALWAYS visible without horizontal scrolling */}
          <nav
            id="navbar-tab-links"
            className="flex items-center justify-between sm:justify-center gap-1 sm:gap-1.5 flex-1 w-full md:w-auto"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  id={item.id}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex-1 md:flex-initial flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 lg:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all touch-press cursor-pointer text-center relative ${
                      isActive
                        ? 'bg-[#E3F2FD] text-[#1976D2] shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="hidden xl:inline">{item.label}</span>
                  <span className="xl:hidden text-[11px] sm:text-xs md:text-sm">{item.shortLabel}</span>

                  {typeof item.alertCount === 'number' && item.alertCount > 0 && (
                    <span className="absolute -top-1 -right-1 sm:static sm:inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold rounded-full bg-rose-500 text-white animate-pulse">
                      {item.alertCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Desktop Right Action Menu: Mode Indicator & Logout */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                Modo
              </p>
              <p className={`text-xs font-semibold mt-0.5 ${isMockActive ? 'text-amber-600' : 'text-emerald-600'}`}>
                {isMockActive ? 'Mock Local' : 'Firebase'}
              </p>
            </div>

            <button
              type="button"
              id="btn-navbar-logout"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-xs sm:text-sm font-semibold transition-colors min-h-[36px] touch-press cursor-pointer border border-transparent hover:border-rose-100"
              title="Cerrar sesión de administrador"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden lg:inline">Salir</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
