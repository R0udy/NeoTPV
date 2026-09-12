import React, { useState, useEffect } from 'react';
import { useDataStore } from '../../store/useDataStore';
import { EstadoCaja, DenominacionesBilletes, DenominacionesMonedas } from '../../types';
import {
  DENOMINACIONES_LIST,
  calcularTotalCaja,
  formatearEuros,
  ESTADO_CAJA_INICIAL
} from '../../utils/cashUtils';
import {
  Coins,
  Banknote,
  Save,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Calendar,
  Lock,
  ChevronDown
} from 'lucide-react';
import { CerrarEventoModal } from '../eventos/CerrarEventoModal';

export const CajaView: React.FC = () => {
  const {
    eventos,
    eventoActivoId,
    seleccionarEvento,
    actualizarCajaEvento,
    ventas,
    settings
  } = useDataStore();

  const [modalCierreOpen, setModalCierreOpen] = useState(false);

  const eventosActivos = eventos.filter((e) => e.estado === 'activo');
  const eventoActivo = eventos.find((e) => e.id === eventoActivoId) || eventosActivos[0] || null;

  // Estado local para edición antes de guardar
  const [billetesLocales, setBilletesLocales] = useState<DenominacionesBilletes>({
    b50: 0,
    b20: 0,
    b10: 0,
    b5: 0
  });

  const [monedasLocales, setMonedasLocales] = useState<DenominacionesMonedas>({
    m200: 0,
    m100: 0,
    m50: 0,
    m20: 0,
    m10: 0,
    m5: 0,
    m2: 0,
    m1: 0
  });

  const [notas, setNotas] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sincronizar estado local cuando cambia el evento activo
  useEffect(() => {
    if (eventoActivo?.cajaActual) {
      setBilletesLocales({
        b50: eventoActivo.cajaActual.billetes?.b50 || 0,
        b20: eventoActivo.cajaActual.billetes?.b20 || 0,
        b10: eventoActivo.cajaActual.billetes?.b10 || 0,
        b5: eventoActivo.cajaActual.billetes?.b5 || 0
      });
      setMonedasLocales({
        m200: eventoActivo.cajaActual.monedas?.m200 || 0,
        m100: eventoActivo.cajaActual.monedas?.m100 || 0,
        m50: eventoActivo.cajaActual.monedas?.m50 || 0,
        m20: eventoActivo.cajaActual.monedas?.m20 || 0,
        m10: eventoActivo.cajaActual.monedas?.m10 || 0,
        m5: eventoActivo.cajaActual.monedas?.m5 || 0,
        m2: eventoActivo.cajaActual.monedas?.m2 || 0,
        m1: eventoActivo.cajaActual.monedas?.m1 || 0
      });
      setNotas(eventoActivo.cajaActual.notas || '');
    }
  }, [eventoActivo]);

  const cajaModificada: EstadoCaja = {
    billetes: billetesLocales,
    monedas: monedasLocales,
    notas,
    ultimaActualizacion: new Date().toISOString()
  };

  const totalCalculado = calcularTotalCaja(cajaModificada);
  const fondoInicial = eventoActivo ? calcularTotalCaja(eventoActivo.cajaInicial) : 0;

  // Ventas en efectivo de este evento
  const ventasEfectivoEvento = eventoActivo
    ? ventas.filter((v) => v.eventoId === eventoActivo.id && v.metodoPago === 'efectivo' && v.estado !== 'devuelta')
    : [];

  const totalVentasEfectivo = ventasEfectivoEvento.reduce((acc, v) => acc + v.total, 0);
  const totalTeorico = fondoInicial + totalVentasEfectivo;
  const descuadre = totalCalculado - totalTeorico;

  const handleModificarCantidad = (
    id: string,
    tipo: 'billete' | 'moneda',
    delta: number
  ) => {
    if (tipo === 'billete') {
      const key = id as keyof DenominacionesBilletes;
      setBilletesLocales((prev) => ({
        ...prev,
        [key]: Math.max(0, (prev[key] || 0) + delta)
      }));
    } else {
      const key = id as keyof DenominacionesMonedas;
      setMonedasLocales((prev) => ({
        ...prev,
        [key]: Math.max(0, (prev[key] || 0) + delta)
      }));
    }
  };

  const handleSetDirecto = (
    id: string,
    tipo: 'billete' | 'moneda',
    valorStr: string
  ) => {
    const valor = parseInt(valorStr, 10);
    const cantidad = isNaN(valor) ? 0 : Math.max(0, valor);

    if (tipo === 'billete') {
      const key = id as keyof DenominacionesBilletes;
      setBilletesLocales((prev) => ({ ...prev, [key]: cantidad }));
    } else {
      const key = id as keyof DenominacionesMonedas;
      setMonedasLocales((prev) => ({ ...prev, [key]: cantidad }));
    }
  };

  const handleGuardarCaja = async () => {
    if (!eventoActivo) return;
    setIsSaving(true);
    try {
      await actualizarCajaEvento(eventoActivo.id, cajaModificada);
    } finally {
      setIsSaving(false);
    }
  };

  const umbralEscasez = settings.umbralMonedasBajas || 5;

  if (!eventoActivo) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 text-center space-y-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 max-w-md mx-auto shadow-2xs">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-800">No hay ningún evento activo</h2>
          <p className="text-xs text-slate-500 mt-1">
            Para gestionar la caja y hacer arqueos, selecciona o crea un evento primero.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="caja-view-container" className="max-w-7xl mx-auto p-3 sm:p-5 space-y-5 animate-fadeIn">
      
      {/* Header & KPI Principal de Efectivo */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-800">
                Arqueo y Control de Caja
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {eventoActivo.nombre}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Conteo en vivo de efectivo, control de cambio y arqueo del evento en curso
            </p>
          </div>
        </div>

        {/* Acciones de Cabecera */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setModalCierreOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Arqueo de Cierre</span>
          </button>

          <button
            type="button"
            id="btn-guardar-caja"
            disabled={isSaving}
            onClick={handleGuardarCaja}
            className="px-4 py-2 rounded-xl font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Guardando...' : 'Guardar Conteo'}</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas de Caja */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Efectivo Contado (Real)
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {formatearEuros(totalCalculado)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Total según desglose inferior
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Fondo Inicial Evento
          </span>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {formatearEuros(fondoInicial)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Apertura ({eventoActivo.fechaInicio})
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Efectivo Cobrado
          </span>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            +{formatearEuros(totalVentasEfectivo)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {ventasEfectivoEvento.length} ventas en efectivo
          </span>
        </div>

        <div
          className={`p-5 rounded-2xl border shadow-2xs ${
            Math.abs(descuadre) < 0.01
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : descuadre > 0
              ? 'bg-blue-50/70 border-blue-200 text-blue-900'
              : 'bg-rose-50/70 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider block">
              Descuadre Teórico
            </span>
            {Math.abs(descuadre) < 0.01 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            )}
          </div>
          <p className="text-2xl font-black mt-1">
            {descuadre > 0 ? `+${formatearEuros(descuadre)}` : formatearEuros(descuadre)}
          </p>
          <span className="text-[11px] font-medium opacity-80 mt-1 block">
            Teórico: {formatearEuros(totalTeorico)}
          </span>
        </div>
      </div>

      {/* Conteo de Billetes y Monedas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Billetes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Banknote className="w-4 h-4 text-blue-600" /> Billetes en Cajón
            </h2>
            <span className="text-xs font-bold text-slate-500">
              Subtotal: {formatearEuros(
                (['b50', 'b20', 'b10', 'b5'] as const).reduce((sum, k) => {
                  const val = k === 'b50' ? 50 : k === 'b20' ? 20 : k === 'b10' ? 10 : 5;
                  return sum + (billetesLocales[k] || 0) * val;
                }, 0)
              )}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(['b50', 'b20', 'b10', 'b5'] as const).map((key) => {
              const valor = key === 'b50' ? 50 : key === 'b20' ? 20 : key === 'b10' ? 10 : 5;
              const count = billetesLocales[key] || 0;
              return (
                <div
                  key={key}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3"
                >
                  <div>
                    <span className="text-sm font-bold text-slate-900">{valor} €</span>
                    <p className="text-[11px] font-semibold text-blue-600">
                      {formatearEuros(count * valor)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleModificarCantidad(key, 'billete', -1)}
                      className="w-8 h-8 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={count}
                      onChange={(e) => handleSetDirecto(key, 'billete', e.target.value)}
                      className="w-12 text-center text-sm font-bold bg-white border border-slate-200 rounded-lg py-1 focus:outline-hidden focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleModificarCantidad(key, 'billete', 1)}
                      className="w-8 h-8 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monedas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-600" /> Monedas de Cambio
            </h2>
            <span className="text-xs font-bold text-slate-500">
              Subtotal: {formatearEuros(
                ([
                  { k: 'm200', v: 2 },
                  { k: 'm100', v: 1 },
                  { k: 'm50', v: 0.5 },
                  { k: 'm20', v: 0.2 },
                  { k: 'm10', v: 0.1 },
                  { k: 'm5', v: 0.05 },
                  { k: 'm2', v: 0.02 },
                  { k: 'm1', v: 0.01 }
                ] as const).reduce((sum, item) => {
                  return sum + ((monedasLocales as any)[item.k] || 0) * item.v;
                }, 0)
              )}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { key: 'm200', label: '2.00 €', val: 2 },
              { key: 'm100', label: '1.00 €', val: 1 },
              { key: 'm50', label: '0.50 €', val: 0.5 },
              { key: 'm20', label: '0.20 €', val: 0.2 },
              { key: 'm10', label: '0.10 €', val: 0.1 },
              { key: 'm5', label: '0.05 €', val: 0.05 },
              { key: 'm2', label: '0.02 €', val: 0.02 },
              { key: 'm1', label: '0.01 €', val: 0.01 }
            ].map(({ key, label, val }) => {
              const count = (monedasLocales as any)[key] || 0;
              const isBajo = count <= umbralEscasez;
              return (
                <div
                  key={key}
                  className={`border rounded-xl p-2.5 flex flex-col justify-between ${
                    isBajo ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800">{label}</span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      {formatearEuros(count * val)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleModificarCantidad(key, 'moneda', -1)}
                      className="w-6 h-6 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={count}
                      onChange={(e) => handleSetDirecto(key, 'moneda', e.target.value)}
                      className="w-full text-center text-xs font-bold bg-white border border-slate-200 rounded-md py-0.5 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => handleModificarCantidad(key, 'moneda', 1)}
                      className="w-6 h-6 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal de Arqueo de Cierre de Evento */}
      {eventoActivo && modalCierreOpen && (
        <CerrarEventoModal
          evento={eventoActivo}
          isOpen={modalCierreOpen}
          onClose={() => setModalCierreOpen(false)}
        />
      )}
    </div>
  );
};
