import React, { useState, useMemo } from 'react';
import { useDataStore } from '../../store/useDataStore';
import { Venta, MetodoPago, EstadoVenta } from '../../types';
import { formatearEuros, DENOMINACIONES_LIST } from '../../utils/cashUtils';
import {
  ReceiptText,
  Search,
  RotateCcw,
  Edit,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  CreditCard,
  QrCode,
  Banknote,
  Sparkles,
  X,
  Printer,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const VentasView: React.FC = () => {
  const { ventas, devolverVenta, modificarVenta } = useDataStore();

  const [busqueda, setBusqueda] = useState('');
  const [filtroMetodo, setFiltroMetodo] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  // Modales
  const [ventaDetalle, setVentaDetalle] = useState<Venta | null>(null);
  const [ventaParaDevolver, setVentaParaDevolver] = useState<Venta | null>(null);
  const [motivoDevolucion, setMotivoDevolucion] = useState('Devolución de cliente en stand');
  const [isProcessing, setIsProcessing] = useState(false);

  const ventasFiltradas = useMemo(() => {
    return ventas.filter((v) => {
      const matchBusqueda =
        v.id.toLowerCase().includes(busqueda.toLowerCase()) ||
        v.lineas.some((l) => l.nombreCorto.toLowerCase().includes(busqueda.toLowerCase()));

      const matchMetodo = filtroMetodo === 'todos' || v.metodoPago === filtroMetodo;
      const matchEstado = filtroEstado === 'todos' || v.estado === filtroEstado;

      return matchBusqueda && matchMetodo && matchEstado;
    });
  }, [ventas, busqueda, filtroMetodo, filtroEstado]);

  const handleConfirmarDevolucion = async () => {
    if (!ventaParaDevolver || isProcessing) return;
    setIsProcessing(true);
    await devolverVenta(ventaParaDevolver.id, motivoDevolucion);
    setIsProcessing(false);
    setVentaParaDevolver(null);
  };

  const getMetodoIcon = (metodo: MetodoPago) => {
    if (metodo === 'efectivo') return <Banknote className="w-4 h-4 text-emerald-600" />;
    if (metodo === 'tpv') return <CreditCard className="w-4 h-4 text-blue-600" />;
    return <QrCode className="w-4 h-4 text-cyan-600" />;
  };

  const getMetodoNombre = (metodo: MetodoPago) => {
    if (metodo === 'efectivo') return 'Efectivo';
    if (metodo === 'tpv') return 'Datáfono TPV';
    return 'Bizum / Transferencia';
  };

  return (
    <div id="ventas-view-container" className="max-w-7xl mx-auto p-3 sm:p-5 space-y-5">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-rose-100/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
            <ReceiptText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-slate-800">
              Registro de Ventas y Devoluciones
            </h1>
            <p className="text-xs text-slate-500">
              Historial de tickets cobrados, gestión de reembolsos y auditoría de stand
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-200">
            Total ventas: {ventas.length}
          </span>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-rose-100/80 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por ID de ticket (#1001) o nombre de producto..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-rose-400 focus:outline-hidden min-h-[42px]"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filtroMetodo}
            onChange={(e) => setFiltroMetodo(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-rose-400 focus:outline-hidden min-h-[42px]"
          >
            <option value="todos">Método: Todos</option>
            <option value="efectivo">Efectivo</option>
            <option value="tpv">Datáfono TPV</option>
            <option value="transferencia_bizum">Bizum / Transferencia</option>
          </select>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-rose-400 focus:outline-hidden min-h-[42px]"
          >
            <option value="todos">Estado: Todos</option>
            <option value="registrada">Registradas</option>
            <option value="devuelta">Devueltas</option>
            <option value="modificada">Modificadas</option>
          </select>
        </div>
      </div>

      {/* Lista de Ventas */}
      <div className="space-y-3">
        {ventasFiltradas.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <ReceiptText className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <h3 className="text-base font-bold text-slate-700">No se encontraron ventas</h3>
            <p className="text-xs text-slate-400 mt-1">
              Las ventas cobradas desde el TPV aparecerán registradas aquí en tiempo real.
            </p>
          </div>
        ) : (
          ventasFiltradas.map((venta) => {
            const isDevuelta = venta.estado === 'devuelta';
            const totalUds = venta.lineas.reduce((acc, l) => acc + l.cantidad, 0);

            return (
              <div
                key={venta.id}
                className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs border transition-all ${
                  isDevuelta
                    ? 'border-rose-200 bg-rose-50/20 opacity-80'
                    : 'border-slate-200/80 hover:border-purple-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Info Principal de la Venta */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-extrabold text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                        #{venta.id.slice(-6)}
                      </span>

                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          venta.metodoPago === 'efectivo'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : venta.metodoPago === 'tpv'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                        }`}
                      >
                        {getMetodoIcon(venta.metodoPago)}
                        <span>{getMetodoNombre(venta.metodoPago)}</span>
                      </span>

                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          venta.estado === 'registrada'
                            ? 'bg-emerald-100 text-emerald-800'
                            : venta.estado === 'devuelta'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {venta.estado === 'registrada'
                          ? 'Completada'
                          : venta.estado === 'devuelta'
                          ? 'Devuelta'
                          : 'Modificada'}
                      </span>

                      <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto lg:ml-2">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{venta.fecha} a las {venta.hora}</span>
                      </span>
                    </div>

                    {/* Resumen de artículos */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {venta.lineas.map((linea, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg font-medium"
                        >
                          <strong className="text-slate-900">{linea.cantidad}x</strong> {linea.nombreCorto} ({formatearEuros(linea.precioUnitario)})
                        </span>
                      ))}
                    </div>

                    {/* Si es devolución, mostrar motivo */}
                    {isDevuelta && venta.motivoDevolucion && (
                      <p className="text-xs text-rose-700 font-semibold bg-rose-50 p-2 rounded-xl border border-rose-200">
                        Motivo devolución: {venta.motivoDevolucion}
                      </p>
                    )}
                  </div>

                  {/* Total & Acciones */}
                  <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">
                        {totalUds} {totalUds === 1 ? 'unidad' : 'unidades'}
                      </span>
                      <span
                        className={`text-2xl font-extrabold font-display ${
                          isDevuelta ? 'text-slate-400 line-through' : 'text-slate-900'
                        }`}
                      >
                        {formatearEuros(venta.total)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setVentaDetalle(venta)}
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors touch-press flex items-center gap-1.5"
                        title="Ver detalle del ticket"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">Detalles</span>
                      </button>

                      {!isDevuelta && (
                        <button
                          type="button"
                          onClick={() => {
                            setVentaParaDevolver(venta);
                            setMotivoDevolucion('Devolución de cliente en stand');
                          }}
                          className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors touch-press flex items-center gap-1.5"
                          title="Hacer devolución (revertirá stock y caja)"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Devolver</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Detalle de Venta */}
      {ventaDetalle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-rose-100 overflow-hidden"
          >
            <div className="p-5 bg-gradient-to-r from-purple-50 to-rose-50 border-b border-rose-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold font-display text-slate-800 text-base">
                  Ticket #{ventaDetalle.id.slice(-6)}
                </h3>
                <p className="text-xs text-slate-500">
                  {ventaDetalle.fecha} a las {ventaDetalle.hora}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVentaDetalle(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700">
              <div className="space-y-2 border-b border-slate-100 pb-3">
                <span className="font-bold text-slate-900 uppercase block text-[11px]">
                  Líneas de Producto
                </span>
                {ventaDetalle.lineas.map((l, i) => (
                  <div key={i} className="flex justify-between items-center py-1">
                    <span>
                      <strong>{l.cantidad}x</strong> {l.nombreCorto}
                    </span>
                    <span className="font-bold text-slate-900">
                      {formatearEuros(l.cantidad * l.precioUnitario)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Si fue efectivo, mostrar desglose */}
              {ventaDetalle.metodoPago === 'efectivo' && ventaDetalle.efectivoEntrante && (
                <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200/80 space-y-1.5">
                  <div className="flex justify-between font-semibold">
                    <span>Efectivo entregado por cliente:</span>
                    <span>{formatearEuros(ventaDetalle.efectivoEntrante.total)}</span>
                  </div>
                  {ventaDetalle.vueltas && (
                    <div className="flex justify-between text-emerald-800 font-bold">
                      <span>Vueltas devueltas:</span>
                      <span>{formatearEuros(ventaDetalle.vueltas.total)}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-1">
                <span>Total Cobrado:</span>
                <span className="text-xl font-display text-rose-600">
                  {formatearEuros(ventaDetalle.total)}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setVentaDetalle(null)}
                className="py-2 px-5 rounded-xl bg-slate-200 hover:bg-slate-300 font-bold text-xs text-slate-800 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Confirmar Devolución */}
      {ventaParaDevolver && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-rose-100 overflow-hidden"
          >
            <div className="p-5 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-800">
                <RotateCcw className="w-5 h-5" />
                <h3 className="font-bold font-display text-base">
                  Confirmar Devolución #{ventaParaDevolver.id.slice(-6)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setVentaParaDevolver(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Al confirmar la devolución:
              </p>
              <ul className="text-xs text-slate-700 space-y-1 list-disc pl-4">
                <li>
                  Se <strong>restituirá el stock</strong> de los{' '}
                  {ventaParaDevolver.lineas.reduce((acc, l) => acc + l.cantidad, 0)} artículos al
                  inventario.
                </li>
                {ventaParaDevolver.metodoPago === 'efectivo' && (
                  <li>
                    Se <strong>descontarán los {formatearEuros(ventaParaDevolver.total)}</strong> de
                    la caja de efectivo.
                  </li>
                )}
                <li>El estado del ticket pasará a <strong>Devuelta</strong>.</li>
              </ul>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Motivo de la devolución
                </label>
                <input
                  type="text"
                  value={motivoDevolucion}
                  onChange={(e) => setMotivoDevolucion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-rose-400 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setVentaParaDevolver(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-200 font-semibold text-xs text-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmarDevolucion}
                className="py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-200 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isProcessing ? 'Procesando...' : 'Efectuar Devolución'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
