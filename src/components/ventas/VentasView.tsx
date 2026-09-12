import React, { useState, useMemo } from 'react';
import { useDataStore } from '../../store/useDataStore';
import { Venta, MetodoPago, EstadoVenta } from '../../types';
import { formatearEuros } from '../../utils/cashUtils';
import {
  ReceiptText,
  Search,
  RotateCcw,
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
  Printer
} from 'lucide-react';

export const VentasView: React.FC = () => {
  const { ventas, eventos, eventoActivoId, devolverVenta } = useDataStore();

  const [busqueda, setBusqueda] = useState('');
  const [filtroEvento, setFiltroEvento] = useState<string>(eventoActivoId || 'todos');
  const [filtroMetodo, setFiltroMetodo] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  // Modales
  const [ventaDetalle, setVentaDetalle] = useState<Venta | null>(null);
  const [ventaParaDevolver, setVentaParaDevolver] = useState<Venta | null>(null);
  const [motivoDevolucion, setMotivoDevolucion] = useState('Devolución de cliente en stand');
  const [isProcessing, setIsProcessing] = useState(false);

  const ventasFiltradas = useMemo(() => {
    return ventas.filter((v) => {
      const matchEvento =
        filtroEvento === 'todos' || v.eventoId === filtroEvento;

      const matchBusqueda =
        v.id.toLowerCase().includes(busqueda.toLowerCase()) ||
        (v.nombreEvento && v.nombreEvento.toLowerCase().includes(busqueda.toLowerCase())) ||
        v.lineas.some((l) => l.nombreCorto.toLowerCase().includes(busqueda.toLowerCase()));

      const matchMetodo = filtroMetodo === 'todos' || v.metodoPago === filtroMetodo;
      const matchEstado = filtroEstado === 'todos' || v.estado === filtroEstado;

      return matchEvento && matchBusqueda && matchMetodo && matchEstado;
    });
  }, [ventas, busqueda, filtroEvento, filtroMetodo, filtroEstado]);

  const totalFacturadoFiltrado = useMemo(() => {
    return ventasFiltradas
      .filter((v) => v.estado !== 'devuelta')
      .reduce((sum, v) => sum + v.total, 0);
  }, [ventasFiltradas]);

  const handleConfirmarDevolucion = async () => {
    if (!ventaParaDevolver || isProcessing) return;
    setIsProcessing(true);
    try {
      await devolverVenta(ventaParaDevolver.id, motivoDevolucion);
    } finally {
      setIsProcessing(false);
      setVentaParaDevolver(null);
    }
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
    <div id="ventas-view-container" className="max-w-7xl mx-auto p-3 sm:p-5 space-y-5 animate-fadeIn">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
            <ReceiptText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              Registro de Ventas y Devoluciones
            </h1>
            <p className="text-xs text-slate-500">
              Historial de tickets por evento. Las devoluciones reintegran stock al inventario general y efectivo a la caja del evento.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200">
            {ventasFiltradas.length} tickets · Total: {formatearEuros(totalFacturadoFiltrado)}
          </span>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por ID (#ven-...), producto o evento..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-400 focus:outline-hidden min-h-[40px]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Selector de Evento */}
          <select
            value={filtroEvento}
            onChange={(e) => setFiltroEvento(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-400 focus:outline-hidden min-h-[40px]"
          >
            <option value="todos">Todos los Eventos</option>
            {eventos.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.nombre} {evt.estado === 'activo' ? '(Activo)' : '(Cerrado)'}
              </option>
            ))}
          </select>

          <select
            value={filtroMetodo}
            onChange={(e) => setFiltroMetodo(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-400 focus:outline-hidden min-h-[40px]"
          >
            <option value="todos">Método: Todos</option>
            <option value="efectivo">Efectivo</option>
            <option value="tpv">Datáfono TPV</option>
            <option value="transferencia_bizum">Bizum / Transferencia</option>
          </select>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-400 focus:outline-hidden min-h-[40px]"
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
                className={`bg-white rounded-2xl p-4 sm:p-5 shadow-xs border transition-all ${
                  isDevuelta
                    ? 'border-rose-200 bg-rose-50/20 opacity-80'
                    : 'border-slate-200 hover:border-blue-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Info Principal de la Venta */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-extrabold text-xs sm:text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                        #{venta.id.slice(-6)}
                      </span>

                      {/* Evento asociado */}
                      {venta.nombreEvento && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-blue-500" />
                          <span>{venta.nombreEvento}</span>
                        </span>
                      )}

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

                  {/* Importe y Acciones */}
                  <div className="flex items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">
                        {totalUds} {totalUds === 1 ? 'unidad' : 'unidades'}
                      </span>
                      <span className={`text-xl font-black ${isDevuelta ? 'text-slate-400 line-through' : 'text-blue-600'}`}>
                        {formatearEuros(venta.total)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setVentaDetalle(venta)}
                        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                        title="Ver detalle de ticket"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {!isDevuelta && (
                        <button
                          type="button"
                          onClick={() => setVentaParaDevolver(venta)}
                          className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1 border border-rose-200 cursor-pointer"
                          title="Devolver venta (reintegra stock general y dinero)"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Ticket #{ventaDetalle.id.slice(-6)}</h3>
                <p className="text-xs text-slate-400">{ventaDetalle.fecha} · {ventaDetalle.hora}</p>
                {ventaDetalle.nombreEvento && (
                  <p className="text-xs font-semibold text-blue-600 mt-0.5">{ventaDetalle.nombreEvento}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setVentaDetalle(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="divide-y divide-slate-100">
                {ventaDetalle.lineas.map((linea, i) => (
                  <div key={i} className="py-2 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">{linea.nombreCorto}</p>
                      <p className="text-slate-400">{linea.cantidad} x {formatearEuros(linea.precioUnitario)}</p>
                    </div>
                    <span className="font-bold text-slate-900">
                      {formatearEuros(linea.cantidad * linea.precioUnitario)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-black">
                <span>Total Cobrado:</span>
                <span className="text-blue-600 text-lg">{formatearEuros(ventaDetalle.total)}</span>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setVentaDetalle(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Devolución */}
      {ventaParaDevolver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center gap-3 text-rose-600 border-b pb-3">
              <RotateCcw className="w-6 h-6" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">Confirmar Devolución</h3>
                <p className="text-xs text-slate-500">Ticket #{ventaParaDevolver.id.slice(-6)} · {formatearEuros(ventaParaDevolver.total)}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Al confirmar, las unidades vendidas se reincorporarán automáticamente al <b>Inventario General</b> y el importe de {formatearEuros(ventaParaDevolver.total)} se restará de la <b>caja del evento</b>.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Motivo de devolución</label>
              <input
                type="text"
                value={motivoDevolucion}
                onChange={(e) => setMotivoDevolucion(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setVentaParaDevolver(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmarDevolucion}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {isProcessing ? 'Procesando...' : 'Confirmar Reembolso'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
