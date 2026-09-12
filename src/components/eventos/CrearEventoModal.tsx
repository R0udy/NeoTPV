import React, { useState } from 'react';
import {
  X,
  Calendar,
  Coins,
  Sparkles,
  Info,
  CheckCircle2,
  Banknote,
  ArrowRight
} from 'lucide-react';
import { EstadoCaja, DenominacionesBilletes, DenominacionesMonedas } from '../../types';
import {
  DENOMINACIONES_LIST,
  calcularTotalCaja,
  formatearEuros,
  ESTADO_CAJA_INICIAL
} from '../../utils/cashUtils';
import { useDataStore } from '../../store/useDataStore';

interface CrearEventoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated?: (eventoId: string) => void;
}

export const CrearEventoModal: React.FC<CrearEventoModalProps> = ({
  isOpen,
  onClose,
  onEventCreated
}) => {
  const { crearEvento } = useDataStore();
  const [nombre, setNombre] = useState('');
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [notas, setNotas] = useState('');

  // Estado inicial de billetes y monedas
  const [billetes, setBilletes] = useState<DenominacionesBilletes>({
    b50: 0,
    b20: 3,
    b10: 4,
    b5: 4
  });

  const [monedas, setMonedas] = useState<DenominacionesMonedas>({
    m200: 5,
    m100: 10,
    m50: 10,
    m20: 15,
    m10: 10,
    m5: 0,
    m2: 0,
    m1: 0
  });

  const [guardando, setGuardando] = useState(false);

  if (!isOpen) return null;

  const cajaTemp: EstadoCaja = { billetes, monedas };
  const totalCajaInicial = calcularTotalCaja(cajaTemp);

  const handleBilleteChange = (key: keyof DenominacionesBilletes, val: number) => {
    setBilletes((prev) => ({
      ...prev,
      [key]: Math.max(0, val || 0)
    }));
  };

  const handleMonedaChange = (key: keyof DenominacionesMonedas, val: number) => {
    setMonedas((prev) => ({
      ...prev,
      [key]: Math.max(0, val || 0)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    setGuardando(true);
    try {
      const nuevo = await crearEvento({
        nombre,
        fechaInicio,
        cajaInicial: cajaTemp,
        notas
      });
      onClose();
      if (onEventCreated) {
        onEventCreated(nuevo.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  const setPlantillaFondo = (tipo: 'estandar' | 'minimo' | 'vacio') => {
    if (tipo === 'estandar') {
      setBilletes({ b50: 0, b20: 3, b10: 4, b5: 4 }); // 60 + 40 + 20 = 120€
      setMonedas({ m200: 5, m100: 10, m50: 10, m20: 15, m10: 10, m5: 0, m2: 0, m1: 0 }); // 10+10+5+3+1 = 29€ -> Total 149€
    } else if (tipo === 'minimo') {
      setBilletes({ b50: 0, b20: 2, b10: 3, b5: 2 }); // 40 + 30 + 10 = 80€
      setMonedas({ m200: 5, m100: 5, m50: 6, m20: 10, m10: 0, m5: 0, m2: 0, m1: 0 }); // 10+5+3+2 = 20€ -> Total 100€
    } else {
      setBilletes({ b50: 0, b20: 0, b10: 0, b5: 0 });
      setMonedas({ m200: 0, m100: 0, m50: 0, m20: 0, m10: 0, m5: 0, m2: 0, m1: 0 });
    }
  };

  return (
    <div
      id="modal-crear-evento-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn"
    >
      <div
        id="modal-crear-evento-card"
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#F0EBE3] overflow-hidden my-auto flex flex-col max-h-[90vh]"
      >
        {/* Cabecera */}
        <div className="bg-[#2196F3] text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Crear Nuevo Evento</h2>
              <p className="text-xs text-blue-100">
                Configura el nombre del evento y el fondo de caja inicial
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Datos Generales */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              1. Información del Evento
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre del Evento <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej: Japan Weekend Madrid 2026, Salón Manga..."
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Fecha de Inicio <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ubicación / Notas del Stand <span className="text-slate-400 font-normal">(Opcional)</span>
              </label>
              <input
                type="text"
                placeholder="ej: Pabellón 9 IFEMA, Stand A-14 pasillo central"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          {/* Estado Inicial de Caja */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-emerald-500" />
                  2. Fondo de Caja Inicial (Apertura)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Indica los billetes y monedas con los que comienzas este evento
                </p>
              </div>

              {/* Plantillas rápidas */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <span className="text-[11px] text-slate-400 font-medium">Plantillas:</span>
                <button
                  type="button"
                  onClick={() => setPlantillaFondo('estandar')}
                  className="text-xs font-semibold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  Estándar (~140€)
                </button>
                <button
                  type="button"
                  onClick={() => setPlantillaFondo('minimo')}
                  className="text-xs font-semibold px-2 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  100€ Redondo
                </button>
                <button
                  type="button"
                  onClick={() => setPlantillaFondo('vacio')}
                  className="text-xs font-semibold px-2 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  0€
                </button>
              </div>
            </div>

            {/* Totalizador de fondo en tarjeta destacada */}
            <div className="bg-[#E8F5E9] border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold">
                  €
                </div>
                <div>
                  <p className="text-xs text-emerald-800 font-medium">Fondo Total de Apertura</p>
                  <p className="text-lg sm:text-xl font-black text-emerald-950">
                    {formatearEuros(totalCajaInicial)}
                  </p>
                </div>
              </div>
              <div className="text-right text-xs text-emerald-700">
                <span className="font-semibold">
                  {(Object.values(billetes) as number[]).reduce((a: number, b: number) => a + (b || 0), 0)} billetes
                </span>
                {' · '}
                <span className="font-semibold">
                  {(Object.values(monedas) as number[]).reduce((a: number, b: number) => a + (b || 0), 0)} monedas
                </span>
              </div>
            </div>

            {/* Desglose de Billetes */}
            <div>
              <p className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
                <Banknote className="w-3.5 h-3.5 text-blue-600" /> Billetes de Fondo
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(['b50', 'b20', 'b10', 'b5'] as const).map((key) => {
                  const valor = key === 'b50' ? 50 : key === 'b20' ? 20 : key === 'b10' ? 10 : 5;
                  const qty = (billetes as any)[key] || 0;
                  return (
                    <div
                      key={key}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-800">{valor} €</span>
                        <span className="text-[11px] font-semibold text-blue-600">
                          {formatearEuros(qty * valor)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleBilleteChange(key, qty - 1)}
                          className="w-7 h-7 bg-white border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={qty}
                          onChange={(e) => handleBilleteChange(key, parseInt(e.target.value) || 0)}
                          className="w-full text-center text-sm font-bold bg-white border border-slate-200 rounded-lg py-1 focus:outline-hidden focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleBilleteChange(key, qty + 1)}
                          className="w-7 h-7 bg-white border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Desglose de Monedas */}
            <div>
              <p className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-600" /> Monedas de Fondo
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {([
                  { key: 'm200', label: '2.00 €', valor: 2.0 },
                  { key: 'm100', label: '1.00 €', valor: 1.0 },
                  { key: 'm50', label: '0.50 €', valor: 0.5 },
                  { key: 'm20', label: '0.20 €', valor: 0.2 },
                  { key: 'm10', label: '0.10 €', valor: 0.1 },
                  { key: 'm5', label: '0.05 €', valor: 0.05 },
                  { key: 'm2', label: '0.02 €', valor: 0.02 },
                  { key: 'm1', label: '0.01 €', valor: 0.01 }
                ] as const).map(({ key, label, valor }) => {
                  const qty = (monedas as any)[key] || 0;
                  return (
                    <div
                      key={key}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-2 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-slate-700">{label}</span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {formatearEuros(qty * valor)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMonedaChange(key as any, qty - 1)}
                          className="w-6 h-6 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={qty}
                          onChange={(e) => handleMonedaChange(key as any, parseInt(e.target.value) || 0)}
                          className="w-full text-center text-xs font-bold bg-white border border-slate-200 rounded-lg py-0.5 focus:outline-hidden focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleMonedaChange(key as any, qty + 1)}
                          className="w-6 h-6 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
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

          {/* Footer de Acciones */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando || !nombre.trim()}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              {guardando ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Iniciar Evento y Abrir TPV</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
