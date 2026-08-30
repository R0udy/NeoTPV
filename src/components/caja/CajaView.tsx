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
  HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';

export const CajaView: React.FC = () => {
  const { caja, actualizarCaja, ventas, settings } = useDataStore();

  // Estado local para edición antes de guardar
  const [billetesLocales, setBilletesLocales] = useState<DenominacionesBilletes>({
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

  // Sincronizar estado local con estado global
  useEffect(() => {
    if (caja) {
      setBilletesLocales({
        b20: caja.billetes?.b20 || 0,
        b10: caja.billetes?.b10 || 0,
        b5: caja.billetes?.b5 || 0
      });
      setMonedasLocales({
        m200: caja.monedas?.m200 || 0,
        m100: caja.monedas?.m100 || 0,
        m50: caja.monedas?.m50 || 0,
        m20: caja.monedas?.m20 || 0,
        m10: caja.monedas?.m10 || 0,
        m5: caja.monedas?.m5 || 0,
        m2: caja.monedas?.m2 || 0,
        m1: caja.monedas?.m1 || 0
      });
      setNotas(caja.notas || '');
    }
  }, [caja]);

  const cajaModificada: EstadoCaja = {
    billetes: billetesLocales,
    monedas: monedasLocales,
    notas,
    ultimaActualizacion: new Date().toISOString()
  };

  const totalCalculado = calcularTotalCaja(cajaModificada);

  // Total de ventas en efectivo acumuladas registradas
  const totalVentasEfectivo = ventas
    .filter((v) => v.metodoPago === 'efectivo' && v.estado !== 'devuelta')
    .reduce((acc, v) => acc + v.total, 0);

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
    setIsSaving(true);
    await actualizarCaja(cajaModificada);
    setIsSaving(false);
  };

  const handleRestablecerFondoDefecto = () => {
    setBilletesLocales({ ...ESTADO_CAJA_INICIAL.billetes });
    setMonedasLocales({ ...ESTADO_CAJA_INICIAL.monedas });
  };

  const umbralEscasez = settings.umbralMonedasBajas || 5;

  return (
    <div id="caja-view-container" className="max-w-7xl mx-auto p-3 sm:p-5 space-y-5">
      
      {/* Header & KPI Principal de Efectivo */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-rose-100/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display text-slate-800">
                Control y Arqueo de Caja
              </h1>
              <p className="text-xs text-slate-500">
                Recuento físico de billetes y monedas del cajón del stand
              </p>
            </div>
          </div>
        </div>

        {/* Resumen Total & Botón Guardar */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl flex items-center gap-4">
            <div>
              <span className="text-[11px] text-amber-300 font-semibold block uppercase tracking-wider">
                Total en Caja
              </span>
              <span className="text-2xl font-extrabold font-display text-white">
                {formatearEuros(totalCalculado)}
              </span>
            </div>
          </div>

          <button
            type="button"
            id="btn-guardar-arqueo"
            onClick={handleGuardarCaja}
            disabled={isSaving}
            className="flex-1 sm:flex-none py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-md shadow-emerald-200 flex items-center justify-center gap-2 min-h-[48px] touch-press cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Guardando...' : 'Guardar Arqueo'}</span>
          </button>
        </div>
      </div>

      {/* Grid de 2 Secciones: Billetes (<50€) y Monedas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* ================= BILLETES (< 50 €: 20, 10, 5) ================= */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-rose-100/80">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold font-display text-slate-800">
                  Billetes (&lt; 50 €)
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {formatearEuros(
                  (billetesLocales.b20 || 0) * 20 +
                    (billetesLocales.b10 || 0) * 10 +
                    (billetesLocales.b5 || 0) * 5
                )}
              </span>
            </div>

            <div className="space-y-3">
              {DENOMINACIONES_LIST.filter((d) => d.tipo === 'billete').map((denom) => {
                const cantidad = (billetesLocales as any)[denom.key] || 0;
                const subtotal = cantidad * denom.valorEuros;
                const esEscaso = cantidad <= 2;

                return (
                  <div
                    key={denom.id}
                    className={`p-3.5 rounded-2xl border transition-all ${denom.colorClase} flex items-center justify-between gap-3`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-extrabold">{denom.nombre}</span>
                        {esEscaso && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-amber-500 text-white">
                            Escaso
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-medium opacity-80">
                        Subtotal: {formatearEuros(subtotal)}
                      </span>
                    </div>

                    {/* Controles táctiles +/- */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleModificarCantidad(denom.id, 'billete', -1)}
                        className="w-9 h-9 rounded-xl bg-white/90 hover:bg-white text-slate-800 font-extrabold text-base flex items-center justify-center shadow-xs touch-press"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={cantidad}
                        onChange={(e) => handleSetDirecto(denom.id, 'billete', e.target.value)}
                        className="w-14 text-center font-extrabold text-base bg-white rounded-xl py-1.5 border border-slate-200 shadow-2xs focus:ring-2 focus:ring-rose-400 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => handleModificarCantidad(denom.id, 'billete', 1)}
                        className="w-9 h-9 rounded-xl bg-white/90 hover:bg-white text-slate-800 font-extrabold text-base flex items-center justify-center shadow-xs touch-press"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Aviso informativo de cambio de billetes */}
            <div className="mt-4 p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-800 space-y-1">
              <p className="font-semibold flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> Denominaciones de stand
              </p>
              <p className="text-[11px] text-blue-700">
                Por seguridad en eventos públicos, la caja solo gestiona billetes de hasta 20 €.
              </p>
            </div>
          </div>
        </div>

        {/* ================= MONEDAS (2€, 1€, 50c, 20c, 10c, 5c, 2c, 1c) ================= */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-rose-100/80">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold font-display text-slate-800">
                  Monedas (2 €, 1 €, 50c, 20c, 10c, 5c, 2c, 1c)
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {formatearEuros(
                  (monedasLocales.m200 || 0) * 2 +
                    (monedasLocales.m100 || 0) * 1 +
                    (monedasLocales.m50 || 0) * 0.5 +
                    (monedasLocales.m20 || 0) * 0.2 +
                    (monedasLocales.m10 || 0) * 0.1 +
                    (monedasLocales.m5 || 0) * 0.05 +
                    (monedasLocales.m2 || 0) * 0.02 +
                    (monedasLocales.m1 || 0) * 0.01
                )}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DENOMINACIONES_LIST.filter((d) => d.tipo === 'moneda').map((denom) => {
                const cantidad = (monedasLocales as any)[denom.key] || 0;
                const subtotal = cantidad * denom.valorEuros;
                const esEscaso = cantidad <= umbralEscasez;

                return (
                  <div
                    key={denom.id}
                    className={`p-3 rounded-2xl border transition-all ${denom.colorClase} flex items-center justify-between gap-2`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-bold">{denom.nombre}</span>
                        {esEscaso && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-amber-500 text-white">
                            Pocas
                          </span>
                        )}
                      </div>
                      <span className="text-xs opacity-75 font-medium">
                        {formatearEuros(subtotal)}
                      </span>
                    </div>

                    {/* Controles táctiles */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleModificarCantidad(denom.id, 'moneda', -1)}
                        className="w-8 h-8 rounded-lg bg-white/90 hover:bg-white text-slate-800 font-bold text-sm flex items-center justify-center shadow-2xs touch-press"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={cantidad}
                        onChange={(e) => handleSetDirecto(denom.id, 'moneda', e.target.value)}
                        className="w-12 text-center font-bold text-sm bg-white rounded-lg py-1 border border-slate-200 shadow-2xs focus:ring-2 focus:ring-rose-400 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => handleModificarCantidad(denom.id, 'moneda', 1)}
                        className="w-8 h-8 rounded-lg bg-white/90 hover:bg-white text-slate-800 font-bold text-sm flex items-center justify-center shadow-2xs touch-press"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Acciones de arqueo y notas */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleRestablecerFondoDefecto}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 touch-press"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer fondo inicial por defecto (150€)</span>
              </button>

              <p className="text-xs text-slate-400">
                Última actualización:{' '}
                {caja?.ultimaActualizacion
                  ? new Date(caja.ultimaActualizacion).toLocaleTimeString('es-ES')
                  : 'Sin registrar'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
