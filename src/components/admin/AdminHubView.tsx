import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Package,
  Settings,
  Calendar,
  Plus,
  Coins,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Database,
  Cloud,
  Layers,
  Sparkles,
  CheckCircle2,
  Lock,
  Boxes,
  Store
} from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import { calcularTotalCaja, formatearEuros } from '../../utils/cashUtils';
import { CrearEventoModal } from '../eventos/CrearEventoModal';
import { ProductFormModal } from '../inventario/ProductFormModal';

export const AdminHubView: React.FC = () => {
  const {
    productos,
    eventos,
    eventoActivoId,
    ventas,
    settings,
    alertas,
    isMockActive,
    seleccionarEvento
  } = useDataStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [modalCrearEventoOpen, setModalCrearEventoOpen] = useState(false);
  const [modalCrearProductoOpen, setModalCrearProductoOpen] = useState(false);

  const eventosActivos = eventos.filter((e) => e.estado === 'activo');
  const eventoActivo = eventos.find((e) => e.id === eventoActivoId) || eventosActivos[0] || null;

  const totalStockGeneral = productos.reduce((sum, p) => sum + p.stock, 0);
  const productosBajoStock = productos.filter((p) => p.stock <= (settings.umbralStockBajo || 5)).length;
  const alertasCriticas = alertas.filter((a) => a.gravedad === 'error' || a.gravedad === 'warning').length;

  const totalCajaEventoActivo = eventoActivo ? calcularTotalCaja(eventoActivo.cajaActual) : 0;
  const ventasEventoActivo = eventoActivo
    ? ventas.filter((v) => v.eventoId === eventoActivo.id && v.estado !== 'devuelta').length
    : 0;

  const handleEntrarTPV = () => {
    if (eventoActivo) {
      seleccionarEvento(eventoActivo.id);
      navigate('/pos');
    } else {
      navigate('/eventos');
    }
  };

  return (
    <div id="view-admin-hub-container" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 animate-fadeIn">
      {/* 1. Header Banner de Bienvenida */}
      <div className="bg-white border border-[#F0EBE3] rounded-3xl p-6 sm:p-8 shadow-2xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isMockActive
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                {isMockActive ? '● MODO MOCKUP (LOCAL)' : '● FIREBASE CLOUD CONECTADO'}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-semibold text-slate-500">
                {user?.role === 'admin' ? 'Panel de Administración General' : 'Panel de Control'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              {settings.nombreTienda || 'EVENTA'} · Centro de Control
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Sistema unificado de inventario general centralizado con soporte multi-evento independiente para ventas, arqueos de caja viva y cierre.
            </p>
          </div>

          {/* Estado Rápido / Evento Activo */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 p-4 rounded-2xl shrink-0">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Evento en curso
              </p>
              {eventoActivo ? (
                <div>
                  <p className="text-sm font-bold text-slate-900 truncate max-w-[200px]">
                    {eventoActivo.nombre}
                  </p>
                  <p className="text-xs text-emerald-600 font-semibold">
                    Caja: {formatearEuros(totalCajaEventoActivo)} · {ventasEventoActivo} ventas
                  </p>
                </div>
              ) : (
                <p className="text-xs font-semibold text-amber-600">Ningún evento seleccionado</p>
              )}
            </div>
          </div>
        </div>

        {/* Fondo decorativo sutil */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-linear-to-l from-blue-50/40 to-transparent pointer-events-none" />
      </div>

      {/* 2. LAS 3 SECCIONES PRINCIPALES (PANTALLA 2) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* SECCIÓN 1: ABRIR TPV & EVENTOS */}
        <div
          id="card-hub-abrir-tpv"
          className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
        >
          <div className="p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-xs">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {eventosActivos.length} Activo{eventosActivos.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                1. Abrir TPV
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Punto de venta y caja viva por evento. Descuenta stock del inventario general y suma ingresos a la caja del evento.
              </p>
            </div>

            {/* Evento activo actual */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Evento Seleccionado:</span>
                <span className="font-bold text-emerald-600">
                  {eventoActivo ? 'En curso' : 'Sin asignar'}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                {eventoActivo ? eventoActivo.nombre : 'Selecciona o crea un evento'}
              </p>
              {eventoActivo && (
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                  <span>Fondo viva: <b>{formatearEuros(totalCajaEventoActivo)}</b></span>
                  <span>Tickets: <b>{ventasEventoActivo}</b></span>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 pt-0 space-y-2">
            <button
              type="button"
              id="btn-hub-entrar-tpv"
              onClick={handleEntrarTPV}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{eventoActivo ? 'Entrar al TPV del Evento' : 'Abrir Selector de Eventos'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => navigate('/eventos')}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors text-center cursor-pointer"
              >
                Ver Todos los Eventos
              </button>
              <button
                type="button"
                onClick={() => setModalCrearEventoOpen(true)}
                className="py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-xl transition-colors text-center flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Crear Evento</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: INVENTARIO GENERAL */}
        <div
          id="card-hub-inventario-general"
          className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
        >
          <div className="p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Package className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {productos.length} Productos
              </span>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                2. Inventario General
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Catálogo global de productos. Todas las ventas y devoluciones de cualquier evento actualizan este inventario central.
              </p>
            </div>

            {/* Métricas de inventario */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 grid grid-cols-2 gap-2 text-center">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase">Stock Total</p>
                <p className="text-base font-black text-slate-800">{totalStockGeneral} uds</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase">Alertas Reposición</p>
                <p
                  className={`text-base font-black ${
                    productosBajoStock > 0 ? 'text-amber-600' : 'text-emerald-600'
                  }`}
                >
                  {productosBajoStock} productos
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 pt-0 space-y-2">
            <button
              type="button"
              id="btn-hub-gestionar-inventario"
              onClick={() => navigate('/inventario')}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Gestionar Inventario General</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setModalCrearProductoOpen(true)}
              className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Producto al Catálogo</span>
            </button>
          </div>
        </div>

        {/* SECCIÓN 3: CONFIGURACIÓN Y SISTEMA */}
        <div
          id="card-hub-configuracion"
          className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
        >
          <div className="p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center shadow-xs">
                <Settings className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Ajustes & Cloud
              </span>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-slate-700 transition-colors">
                3. Configuración
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Ajustes de tienda, conexión a Firebase Firestore, modo Mockup, diagnóstico de OneDrive y alertas.
              </p>
            </div>

            {/* Diagnóstico rápido */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Proveedor de Datos:</span>
                <span className="font-bold text-slate-800">
                  {isMockActive ? 'Mock Local' : 'Firebase Firestore'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Alertas Activas:</span>
                <span
                  className={`font-bold ${
                    alertasCriticas > 0 ? 'text-amber-600' : 'text-emerald-600'
                  }`}
                >
                  {alertas.length} notificadas
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 pt-0 space-y-2">
            <button
              type="button"
              id="btn-hub-abrir-config"
              onClick={() => navigate('/admin')}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Abrir Configuración & Diagnóstico</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/cuentas')}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors text-center cursor-pointer"
            >
              Ver Cuentas y Estadísticas Globales
            </button>
          </div>
        </div>
      </div>

      {/* MODAL CREAR EVENTO */}
      <CrearEventoModal
        isOpen={modalCrearEventoOpen}
        onClose={() => setModalCrearEventoOpen(false)}
        onEventCreated={(nuevoId) => {
          seleccionarEvento(nuevoId);
          navigate('/pos');
        }}
      />

      {/* MODAL CREAR PRODUCTO */}
      <ProductFormModal
        isOpen={modalCrearProductoOpen}
        onClose={() => setModalCrearProductoOpen(false)}
      />
    </div>
  );
};
