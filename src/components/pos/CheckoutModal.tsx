import React, { useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  MetodoPago,
  DesgloseEfectivo,
  DenominacionesBilletes,
  DenominacionesMonedas,
  Venta
} from '../../types';
import { usePOSStore } from '../../store/usePOSStore';
import { useDataStore } from '../../store/useDataStore';
import {
  DENOMINACIONES_LIST,
  calcularVueltas,
  formatearEuros,
  calcularTotalDesglose
} from '../../utils/cashUtils';
import {
  X,
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Printer,
  Sparkles,
  Plus,
  Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CheckoutModal: React.FC = () => {
  const {
    lineas,
    calcularTotal,
    calcularSubtotal,
    calcularDescuentoTotal,
    limpiarTicket,
    isCheckoutOpen,
    setCheckoutOpen,
    notaTicket
  } = usePOSStore();

  const { caja, procesarCobro } = useDataStore();

  const [metodoSeleccionado, setMetodoSeleccionado] = useState<MetodoPago>('efectivo');
  
  // Estado para desglose de efectivo entrante
  const [billetesEntrantes, setBilletesEntrantes] = useState<Partial<DenominacionesBilletes>>({});
  const [monedasEntrantes, setMonedasEntrantes] = useState<Partial<DenominacionesMonedas>>({});
  
  // Venta procesada con éxito para feedback
  const [ventaCompletada, setVentaCompletada] = useState<Venta | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const totalPagar = calcularTotal();

  // Calcular total de efectivo entregado
  const desgloseEntrante: DesgloseEfectivo = useMemo(() => {
    const total = calcularTotalDesglose({
      billetes: billetesEntrantes,
      monedas: monedasEntrantes,
      total: 0
    });
    return {
      billetes: billetesEntrantes,
      monedas: monedasEntrantes,
      total
    };
  }, [billetesEntrantes, monedasEntrantes]);

  const totalEntregado = desgloseEntrante.total;
  const importeCambio = Math.max(0, totalEntregado - totalPagar);

  // Calcular vueltas óptimas con el estado actual de la caja
  const resultadoVueltas = useMemo(() => {
    if (metodoSeleccionado !== 'efectivo' || totalEntregado < totalPagar) {
      return null;
    }
    return calcularVueltas(importeCambio, caja);
  }, [metodoSeleccionado, importeCambio, totalEntregado, totalPagar, caja]);

  // Resetear estados al abrir el modal
  useEffect(() => {
    if (isCheckoutOpen) {
      setMetodoSeleccionado('efectivo');
      setBilletesEntrantes({});
      setMonedasEntrantes({});
      setVentaCompletada(null);
      setIsProcessing(false);
    }
  }, [isCheckoutOpen]);

  // Helpers para modificar efectivo entrante
  const agregarDenominacionEntrante = (id: string, tipo: 'billete' | 'moneda') => {
    if (tipo === 'billete') {
      const key = id as keyof DenominacionesBilletes;
      setBilletesEntrantes((prev) => ({
        ...prev,
        [key]: (prev[key] || 0) + 1
      }));
    } else {
      const key = id as keyof DenominacionesMonedas;
      setMonedasEntrantes((prev) => ({
        ...prev,
        [key]: (prev[key] || 0) + 1
      }));
    }
  };

  const quitarDenominacionEntrante = (id: string, tipo: 'billete' | 'moneda') => {
    if (tipo === 'billete') {
      const key = id as keyof DenominacionesBilletes;
      const actual = billetesEntrantes[key] || 0;
      if (actual <= 1) {
        const nuevo = { ...billetesEntrantes };
        delete nuevo[key];
        setBilletesEntrantes(nuevo);
      } else {
        setBilletesEntrantes({ ...billetesEntrantes, [key]: actual - 1 });
      }
    } else {
      const key = id as keyof DenominacionesMonedas;
      const actual = monedasEntrantes[key] || 0;
      if (actual <= 1) {
        const nuevo = { ...monedasEntrantes };
        delete nuevo[key];
        setMonedasEntrantes(nuevo);
      } else {
        setMonedasEntrantes({ ...monedasEntrantes, [key]: actual - 1 });
      }
    }
  };

  const aplicarPresetExacto = () => {
    // Busca denominaciones para igualar el total o setea rápido
    setBilletesEntrantes({});
    setMonedasEntrantes({});
    // Desglose simple aproximado para pago exacto
    let restanteCentimos = Math.round(totalPagar * 100);
    const b: Partial<DenominacionesBilletes> = {};
    const m: Partial<DenominacionesMonedas> = {};

    for (const d of DENOMINACIONES_LIST) {
      if (restanteCentimos >= d.valorCentimos) {
        const count = Math.floor(restanteCentimos / d.valorCentimos);
        restanteCentimos -= count * d.valorCentimos;
        if (d.tipo === 'billete') {
          b[d.key as keyof DenominacionesBilletes] = count;
        } else {
          m[d.key as keyof DenominacionesMonedas] = count;
        }
      }
    }
    setBilletesEntrantes(b);
    setMonedasEntrantes(m);
  };

  const aplicarPresetImporte = (importe: number) => {
    setBilletesEntrantes({});
    setMonedasEntrantes({});
    if (importe === 20) setBilletesEntrantes({ b20: 1 });
    else if (importe === 10) setBilletesEntrantes({ b10: 1 });
    else if (importe === 5) setBilletesEntrantes({ b5: 1 });
    else if (importe === 50) {
      // 50€ no está en las denominaciones de caja de stand (<50), pero el cliente puede entregar un billete de 50€:
      // Lo representamos en el desglose entrante
      setBilletesEntrantes({ b20: 2, b10: 1 }); // Equivalente para registro en denominaciones de stand
    }
  };

  const handleConfirmarCobro = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const venta = await procesarCobro({
        lineasTicket: lineas,
        metodoPago: metodoSeleccionado,
        efectivoEntrante: metodoSeleccionado === 'efectivo' ? desgloseEntrante : undefined,
        vueltas: metodoSeleccionado === 'efectivo' && resultadoVueltas ? resultadoVueltas.desglose : undefined,
        total: totalPagar,
        nota: notaTicket
      });

      setVentaCompletada(venta);
      
      // Lanzar confeti de éxito en venta
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // Fallback silencioso si no carga canvas
      }
    } catch (err) {
      console.error('Error procesando cobro:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalizarNuevaVenta = () => {
    limpiarTicket();
    setCheckoutOpen(false);
  };

  if (!isCheckoutOpen) return null;

  return (
    <div
      id="checkout-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#F0EBE3] overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#F8F9FA] border-b border-[#F0EBE3] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E3F2FD] text-[#2196F3] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-slate-800 leading-tight">
                {ventaCompletada ? '¡Venta Registrada con Éxito!' : 'Cobro de Ticket'}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {ventaCompletada ? `Código #${ventaCompletada.id.slice(-6)}` : `${lineas.length} artículos en el ticket`}
              </p>
            </div>
          </div>

          {!ventaCompletada && (
            <button
              type="button"
              id="btn-close-checkout"
              onClick={() => setCheckoutOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {ventaCompletada ? (
            /* Pantalla de Venta Completada */
            <div className="text-center py-4 space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center border-4 border-emerald-100">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-3xl font-black text-[#1976D2]">
                  {formatearEuros(ventaCompletada.total)}
                </h3>
                <p className="text-sm font-semibold text-[#2E7D32] mt-0.5">
                  Pago registrado vía{' '}
                  <span className="capitalize font-bold">
                    {ventaCompletada.metodoPago.replace('_', ' / ')}
                  </span>
                </p>
              </div>

              {ventaCompletada.metodoPago === 'efectivo' && ventaCompletada.vueltas && (
                <div className="bg-[#F8F9FA] border border-[#F0EBE3] rounded-2xl p-4 max-w-md mx-auto text-left">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Resumen de Cambio
                    </span>
                    <span className="text-base font-black text-[#1976D2]">
                      {formatearEuros(ventaCompletada.vueltas.total)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {/* Billetes entregados como vuelta */}
                    {(Object.entries(ventaCompletada.vueltas.billetes || {}) as [string, number][]).map(([key, count]) => {
                      if (!count || count <= 0) return null;
                      const denom = DENOMINACIONES_LIST.find((d) => d.key === key);
                      return (
                        <span
                          key={key}
                          className="px-2.5 py-1 rounded-lg bg-white border border-[#F0EBE3] text-xs font-bold text-slate-800 shadow-2xs"
                        >
                          {count}x billete {denom?.nombre}
                        </span>
                      );
                    })}
                    {/* Monedas entregadas como vuelta */}
                    {(Object.entries(ventaCompletada.vueltas.monedas || {}) as [string, number][]).map(([key, count]) => {
                      if (!count || count <= 0) return null;
                      const denom = DENOMINACIONES_LIST.find((d) => d.key === key);
                      return (
                        <span
                          key={key}
                          className="px-2.5 py-1 rounded-lg bg-white border border-[#F0EBE3] text-xs font-bold text-slate-800 shadow-2xs"
                        >
                          {count}x moneda {denom?.nombre}
                        </span>
                      );
                    })}
                    {ventaCompletada.vueltas.total === 0 && (
                      <span className="text-xs text-[#2E7D32] font-semibold italic">Pago exacto, sin cambio.</span>
                    )}
                  </div>
                </div>
              )}

              {/* Botón de nueva venta */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <button
                  type="button"
                  onClick={handleFinalizarNuevaVenta}
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-[#2196F3] hover:bg-[#1976D2] active:scale-[0.98] text-white font-bold shadow-md shadow-blue-100 transition-all text-base min-h-[48px] touch-press cursor-pointer"
                >
                  Nueva Venta
                </button>
              </div>
            </div>
          ) : (
            /* Flujo de selección de método y cobro */
            <>
              {/* Selector de Método de Pago con botones grandes táctiles */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                  Seleccionar Método de Pago
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    id="btn-metodo-efectivo"
                    onClick={() => setMetodoSeleccionado('efectivo')}
                    className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all min-h-[72px] touch-press cursor-pointer ${
                      metodoSeleccionado === 'efectivo'
                        ? 'border-emerald-500 bg-[#E8F5E9] text-[#2E7D32] shadow-xs font-bold'
                        : 'border-[#F0EBE3] hover:border-slate-300 bg-white text-slate-700 font-medium'
                    }`}
                  >
                    <Banknote className="w-6 h-6 text-[#2E7D32]" />
                    <span className="text-sm">Efectivo</span>
                  </button>

                  <button
                    type="button"
                    id="btn-metodo-tpv"
                    onClick={() => setMetodoSeleccionado('tpv')}
                    className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all min-h-[72px] touch-press cursor-pointer ${
                      metodoSeleccionado === 'tpv'
                        ? 'border-[#2196F3] bg-[#E3F2FD] text-[#1976D2] shadow-xs font-bold'
                        : 'border-[#F0EBE3] hover:border-slate-300 bg-white text-slate-700 font-medium'
                    }`}
                  >
                    <CreditCard className="w-6 h-6 text-[#2196F3]" />
                    <span className="text-sm">Datáfono TPV</span>
                  </button>

                  <button
                    type="button"
                    id="btn-metodo-bizum"
                    onClick={() => setMetodoSeleccionado('transferencia_bizum')}
                    className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all min-h-[72px] touch-press cursor-pointer ${
                      metodoSeleccionado === 'transferencia_bizum'
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-900 shadow-xs font-bold'
                        : 'border-[#F0EBE3] hover:border-slate-300 bg-white text-slate-700 font-medium'
                    }`}
                  >
                    <QrCode className="w-6 h-6 text-cyan-600" />
                    <span className="text-sm leading-tight text-center">Bizum / Transf.</span>
                  </button>
                </div>
              </div>

              {/* Total a Pagar Display */}
              <div className="bg-[#F8F9FA] text-slate-800 border border-[#F0EBE3] rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">
                    Total a Cobrar
                  </span>
                  <span className="text-3xl font-black text-[#1976D2] tracking-tight">
                    {formatearEuros(totalPagar)}
                  </span>
                </div>
                <div className="text-right text-xs text-slate-400 font-medium">
                  <p>{lineas.reduce((acc, l) => acc + l.cantidad, 0)} unidades</p>
                  {calcularDescuentoTotal() > 0 && (
                    <p className="text-[#2E7D32] font-semibold">
                      Descuento: -{formatearEuros(calcularDescuentoTotal())}
                    </p>
                  )}
                </div>
              </div>

              {/* Contenido Específico por Método */}
              {metodoSeleccionado === 'efectivo' ? (
                /* Vista Detallada de Efectivo con billetes y monedas */
                <div className="space-y-4">
                  {/* Presets rápidos */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Presets rápidos:</span>
                    <button
                      type="button"
                      onClick={aplicarPresetExacto}
                      className="px-3 py-1.5 rounded-xl bg-white border border-[#F0EBE3] hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors touch-press cursor-pointer"
                    >
                      Exacto ({formatearEuros(totalPagar)})
                    </button>
                    <button
                      type="button"
                      onClick={() => aplicarPresetImporte(10)}
                      className="px-3 py-1.5 rounded-xl bg-[#E3F2FD] hover:bg-blue-100 text-[#1976D2] text-xs font-bold border border-blue-200 transition-colors touch-press cursor-pointer"
                    >
                      10 €
                    </button>
                    <button
                      type="button"
                      onClick={() => aplicarPresetImporte(20)}
                      className="px-3 py-1.5 rounded-xl bg-[#E3F2FD] hover:bg-blue-100 text-[#1976D2] text-xs font-bold border border-blue-200 transition-colors touch-press cursor-pointer"
                    >
                      20 €
                    </button>
                    <button
                      type="button"
                      onClick={() => aplicarPresetImporte(50)}
                      className="px-3 py-1.5 rounded-xl bg-[#E8F5E9] hover:bg-emerald-100 text-[#2E7D32] text-xs font-bold border border-emerald-200 transition-colors touch-press cursor-pointer"
                    >
                      50 €
                    </button>
                    {(Object.keys(billetesEntrantes).length > 0 || Object.keys(monedasEntrantes).length > 0) && (
                      <button
                        type="button"
                        onClick={() => {
                          setBilletesEntrantes({});
                          setMonedasEntrantes({});
                        }}
                        className="px-2 py-1 text-xs text-rose-600 hover:underline ml-auto flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" /> Limpiar
                      </button>
                    )}
                  </div>

                  {/* Teclado táctil de denominaciones para efectivo entrante */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Efectivo Entregado por el Cliente
                      </label>
                      <span className={`text-sm font-bold ${totalEntregado >= totalPagar ? 'text-[#2E7D32]' : 'text-slate-700'}`}>
                        Total entrante: {formatearEuros(totalEntregado)}
                      </span>
                    </div>

                    {/* Botones de Billetes (< 50) */}
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {DENOMINACIONES_LIST.filter((d) => d.tipo === 'billete').map((d) => {
                        const count = (billetesEntrantes as any)[d.key] || 0;
                        return (
                          <div
                            key={d.id}
                            className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${d.colorClase}`}
                          >
                            <div>
                              <span className="text-base font-bold block leading-none">{d.nombre}</span>
                              <span className="text-[11px] opacity-80">billete</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {count > 0 && (
                                <button
                                  type="button"
                                  onClick={() => quitarDenominacionEntrante(d.id, 'billete')}
                                  className="w-7 h-7 rounded-lg bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center font-bold text-sm shadow-2xs cursor-pointer"
                                >
                                  -
                                </button>
                              )}
                              {count > 0 && (
                                <span className="w-6 text-center font-extrabold text-sm">{count}</span>
                              )}
                              <button
                                type="button"
                                onClick={() => agregarDenominacionEntrante(d.id, 'billete')}
                                className="w-8 h-8 rounded-lg bg-white hover:bg-white/90 active:scale-95 text-slate-900 flex items-center justify-center font-extrabold text-base shadow-xs cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Botones de Monedas */}
                    <div className="grid grid-cols-4 sm:grid-cols-4 gap-1.5">
                      {DENOMINACIONES_LIST.filter((d) => d.tipo === 'moneda').map((d) => {
                        const count = (monedasEntrantes as any)[d.key] || 0;
                        return (
                          <div
                            key={d.id}
                            className={`p-2 rounded-xl border flex flex-col justify-between ${d.colorClase}`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold">{d.nombre}</span>
                              {count > 0 && (
                                <span className="text-xs font-extrabold bg-white px-1.5 py-0.2 rounded-md shadow-2xs">
                                  {count}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-1 mt-1.5">
                              {count > 0 && (
                                <button
                                  type="button"
                                  onClick={() => quitarDenominacionEntrante(d.id, 'moneda')}
                                  className="flex-1 py-1 rounded bg-white/80 hover:bg-white text-slate-800 text-xs font-bold flex items-center justify-center cursor-pointer"
                                >
                                  -
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => agregarDenominacionEntrante(d.id, 'moneda')}
                                className="flex-1 py-1 rounded bg-white hover:bg-white/90 active:scale-95 text-slate-900 text-xs font-extrabold flex items-center justify-center shadow-2xs cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Panel de Vueltas Calculadas */}
                  {totalEntregado >= totalPagar ? (
                    <div className="bg-[#E8F5E9] border border-emerald-200 rounded-2xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-[#2E7D32] uppercase tracking-wider">
                          Vueltas a Devolver al Cliente
                        </span>
                        <span className="text-xl font-bold font-display text-[#2E7D32]">
                          {formatearEuros(importeCambio)}
                        </span>
                      </div>

                      {importeCambio === 0 ? (
                        <p className="text-xs text-emerald-800 font-medium">
                          Importe exacto entregado. No se requiere dar cambio.
                        </p>
                      ) : resultadoVueltas?.posible ? (
                        <div>
                          <p className="text-xs text-emerald-800 mb-2">
                            Propuesta óptima calculada (preservando monedas escasas):
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {/* Billetes a devolver */}
                            {(Object.entries(resultadoVueltas.desglose.billetes || {}) as [string, number][]).map(([key, count]) => {
                              if (!count || count <= 0) return null;
                              const denom = DENOMINACIONES_LIST.find((d) => d.key === key);
                              return (
                                <span
                                  key={key}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-xs font-bold text-emerald-900 shadow-2xs"
                                >
                                  {count}x billete {denom?.nombre}
                                </span>
                              );
                            })}
                            {/* Monedas a devolver */}
                            {(Object.entries(resultadoVueltas.desglose.monedas || {}) as [string, number][]).map(([key, count]) => {
                              if (!count || count <= 0) return null;
                              const denom = DENOMINACIONES_LIST.find((d) => d.key === key);
                              return (
                                <span
                                  key={key}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-xs font-bold text-emerald-900 shadow-2xs"
                                >
                                  {count}x moneda {denom?.nombre}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2 text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200 text-xs mt-1">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                          <div>
                            <p className="font-bold">Aviso de falta de cambio en caja</p>
                            <p>{resultadoVueltas?.mensaje}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : totalEntregado > 0 ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-800 flex items-center justify-between">
                      <span>Importe insuficiente entregado</span>
                      <span className="font-bold">
                        Faltan {formatearEuros(totalPagar - totalEntregado)}
                      </span>
                    </div>
                  ) : null}
                </div>
              ) : (
                /* Vista para TPV y Bizum / Transferencia */
                <div className="py-4 text-center space-y-3 bg-[#F8F9FA] rounded-2xl border border-[#F0EBE3] p-5">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-xs mx-auto flex items-center justify-center text-slate-700 border border-[#F0EBE3]">
                    {metodoSeleccionado === 'tpv' ? (
                      <CreditCard className="w-6 h-6 text-[#2196F3]" />
                    ) : (
                      <QrCode className="w-6 h-6 text-cyan-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-800">
                      {metodoSeleccionado === 'tpv'
                        ? 'Cobro con Datáfono TPV'
                        : 'Cobro por Bizum o Transferencia Instantánea'}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      {metodoSeleccionado === 'tpv'
                        ? 'Introduce el importe exacto en el datáfono físico del stand y espera la confirmación de la tarjeta.'
                        : 'Verifica la recepción del importe en el móvil del stand antes de registrar la venta.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Botón Principal de Cobro */}
              <div className="pt-2">
                <button
                  type="button"
                  id="btn-confirmar-cobro"
                  disabled={
                    isProcessing ||
                    (metodoSeleccionado === 'efectivo' && totalEntregado < totalPagar)
                  }
                  onClick={handleConfirmarCobro}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-white text-base shadow-lg transition-all flex items-center justify-center gap-2 min-h-[52px] touch-press cursor-pointer ${
                    metodoSeleccionado === 'efectivo' && totalEntregado < totalPagar
                      ? 'bg-slate-300 cursor-not-allowed shadow-none'
                      : 'bg-[#2196F3] hover:bg-[#1976D2] shadow-blue-100'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>
                    {metodoSeleccionado === 'efectivo'
                      ? 'Confirmar Venta y Actualizar Caja'
                      : 'COBRADO (Registrar Venta)'}
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
