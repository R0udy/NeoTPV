import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Coins,
  ReceiptText,
  CreditCard,
  Smartphone,
  Banknote,
  DollarSign
} from 'lucide-react';
import {
  Evento,
  EstadoCaja,
  DenominacionesBilletes,
  DenominacionesMonedas,
  ArqueoCierre
} from '../../types';
import {
  calcularTotalCaja,
  formatearEuros
} from '../../utils/cashUtils';
import { useDataStore } from '../../store/useDataStore';

interface CerrarEventoModalProps {
  evento: Evento;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CerrarEventoModal: React.FC<CerrarEventoModalProps> = ({
  evento,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { ventas, cerrarEvento } = useDataStore();

  // Filtrar las ventas de este evento
  const ventasEvento = ventas.filter(
    (v) => v.eventoId === evento.id && v.estado !== 'devuelta'
  );

  const totalRecaudadoEfectivo = ventasEvento
    .filter((v) => v.metodoPago === 'efectivo')
    .reduce((sum, v) => sum + v.total, 0);

  const totalRecaudadoTPV = ventasEvento
    .filter((v) => v.metodoPago === 'tpv')
    .reduce((sum, v) => sum + v.total, 0);

  const totalRecaudadoBizum = ventasEvento
    .filter((v) => v.metodoPago === 'transferencia_bizum')
    .reduce((sum, v) => sum + v.total, 0);

  const totalVentasBrutas = totalRecaudadoEfectivo + totalRecaudadoTPV + totalRecaudadoBizum;

  const totalFondoInicial = calcularTotalCaja(evento.cajaInicial);
  const totalTeoricoCaja = totalFondoInicial + totalRecaudadoEfectivo;

  // Estado de arqueo físico contado al cierre (pre-cargado con la cajaActual viva)
  const [billetes, setBilletes] = useState<DenominacionesBilletes>({
    b50: evento.cajaActual.billetes.b50 || 0,
    b20: evento.cajaActual.billetes.b20 || 0,
    b10: evento.cajaActual.billetes.b10 || 0,
    b5: evento.cajaActual.billetes.b5 || 0
  });

  const [monedas, setMonedas] = useState<DenominacionesMonedas>({
    m200: evento.cajaActual.monedas.m200 || 0,
    m100: evento.cajaActual.monedas.m100 || 0,
    m50: evento.cajaActual.monedas.m50 || 0,
    m20: evento.cajaActual.monedas.m20 || 0,
    m10: evento.cajaActual.monedas.m10 || 0,
    m5: evento.cajaActual.monedas.m5 || 0,
    m2: evento.cajaActual.monedas.m2 || 0,
    m1: evento.cajaActual.monedas.m1 || 0
  });

  const [notasCierre, setNotasCierre] = useState('');
  const [guardando, setGuardando] = useState(false);

  if (!isOpen) return null;

  const cajaFinal: EstadoCaja = {
    billetes,
    monedas,
    ultimaActualizacion: new Date().toISOString()
  };

  const totalRealContado = calcularTotalCaja(cajaFinal);
  const diferencia = Number((totalRealContado - totalTeoricoCaja).toFixed(2));
  const descuadreExacto = Math.abs(diferencia) < 0.01;

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

  const handleConfirmarCierre = async () => {
    setGuardando(true);
    try {
      const now = new Date();
      const arqueo: ArqueoCierre = {
        fecha: now.toISOString().split('T')[0],
        hora: now.toTimeString().split(' ')[0],
        timestamp: now.getTime(),
        cajaFinal,
        totalTeorico: totalTeoricoCaja,
        totalReal: totalRealContado,
        diferencia,
        totalRecaudadoEfectivo,
        totalRecaudadoTPV,
        totalRecaudadoBizum,
        totalVentas: ventasEvento.length,
        notas: notasCierre.trim() || 'Arqueo de cierre de evento completado'
      };

      await cerrarEvento(evento.id, arqueo);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error cerrando evento:', err);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div
      id="modal-cerrar-evento-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn"
    >
      <div
        id="modal-cerrar-evento-card"
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-[#F0EBE3] overflow-hidden my-auto flex flex-col max-h-[92vh]"
      >
        {/* Cabecera */}
        <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">Arqueo Final y Cierre de Evento</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  Cierre Definitivo
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {evento.nombre} · Iniciado el {evento.fechaInicio}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* 1. Resumen Económico del Evento */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ReceiptText className="w-3.5 h-3.5 text-blue-500" />
              1. Balance de Ventas del Evento ({ventasEvento.length} tickets)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Efectivo</span>
                </div>
                <p className="text-base sm:text-lg font-bold text-slate-900">
                  {formatearEuros(totalRecaudadoEfectivo)}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  <span>TPV / Tarjeta</span>
                </div>
                <p className="text-base sm:text-lg font-bold text-slate-900">
                  {formatearEuros(totalRecaudadoTPV)}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Bizum</span>
                </div>
                <p className="text-base sm:text-lg font-bold text-slate-900">
                  {formatearEuros(totalRecaudadoBizum)}
                </p>
              </div>

              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs text-blue-800 font-semibold mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                  <span>Total Facturado</span>
                </div>
                <p className="text-base sm:text-lg font-black text-blue-950">
                  {formatearEuros(totalVentasBrutas)}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Cálculo Teórico vs Real */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <p className="text-xs text-slate-500 mb-1">Fondo Inicial Apertura</p>
              <p className="text-base font-bold text-slate-800">{formatearEuros(totalFondoInicial)}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Billetes + monedas de inicio</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <p className="text-xs text-slate-500 mb-1">Total Teórico en Caja</p>
              <p className="text-base font-black text-slate-900">{formatearEuros(totalTeoricoCaja)}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Fondo inicial + Efectivo cobrado</p>
            </div>

            <div
              className={`rounded-xl p-3.5 border ${
                descuadreExacto
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : diferencia > 0
                  ? 'bg-blue-50 border-blue-200 text-blue-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold mb-1">Diferencia / Descuadre</p>
                {descuadreExacto ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                )}
              </div>
              <p className="text-lg font-black">
                {diferencia > 0 ? `+${formatearEuros(diferencia)}` : formatearEuros(diferencia)}
              </p>
              <p className="text-[11px] font-medium opacity-80 mt-0.5">
                {descuadreExacto
                  ? 'Caja cuadrada exactamente'
                  : diferencia > 0
                  ? 'Sobrante en caja'
                  : 'Faltante en caja'}
              </p>
            </div>
          </div>

          {/* 3. Conteo Físico Real de Cierre */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-emerald-500" />
                  2. Conteo Físico Real de Caja (Cierre)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cuenta el efectivo real presente en el cajón antes de cerrar el evento
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500">Total Real Contado:</span>
                <span className="ml-2 text-base font-black text-slate-900">
                  {formatearEuros(totalRealContado)}
                </span>
              </div>
            </div>

            {/* Billetes */}
            <div>
              <p className="text-xs font-bold text-slate-700 mb-2">Billetes</p>
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

            {/* Monedas */}
            <div>
              <p className="text-xs font-bold text-slate-700 mb-2">Monedas</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { key: 'm200', label: '2.00 €', valor: 2.0 },
                  { key: 'm100', label: '1.00 €', valor: 1.0 },
                  { key: 'm50', label: '0.50 €', valor: 0.5 },
                  { key: 'm20', label: '0.20 €', valor: 0.2 },
                  { key: 'm10', label: '0.10 €', valor: 0.1 },
                  { key: 'm5', label: '0.05 €', valor: 0.05 },
                  { key: 'm2', label: '0.02 €', valor: 0.02 },
                  { key: 'm1', label: '0.01 €', valor: 0.01 }
                ].map(({ key, label, valor }) => {
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

          {/* 4. Observaciones / Notas de Cierre */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Notas / Incidencias del Arqueo de Cierre
            </label>
            <textarea
              rows={2}
              placeholder="ej: Caja cuadrada perfectamente. Se retira fondo inicial y se entrega recaudación..."
              value={notasCierre}
              onChange={(e) => setNotasCierre(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 sm:px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500 hidden sm:block">
            Al cerrar el evento, quedará archivado en el histórico de eventos con su arqueo.
          </p>
          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={guardando}
              onClick={handleConfirmarCierre}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              {guardando ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Confirmar Arqueo y Cerrar Evento</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
