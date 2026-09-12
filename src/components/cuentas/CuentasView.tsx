import React, { useState, useMemo } from 'react';
import { useDataStore } from '../../store/useDataStore';
import { formatearEuros } from '../../utils/cashUtils';
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  Banknote,
  QrCode,
  Sparkles,
  ShoppingBag,
  Percent,
  Layers,
  Award,
  Wallet,
  Calendar,
  ArrowUpRight
} from 'lucide-react';

export const CuentasView: React.FC = () => {
  const { ventas, productos, eventos, eventoActivoId } = useDataStore();
  const [filtroEvento, setFiltroEvento] = useState<string>(eventoActivoId || 'todos');

  // Filtrar solo ventas registradas (excluir devueltas del cálculo de beneficio)
  const ventasValidas = useMemo(() => {
    return ventas.filter((v) => {
      const matchEvento = filtroEvento === 'todos' || v.eventoId === filtroEvento;
      return matchEvento && v.estado !== 'devuelta';
    });
  }, [ventas, filtroEvento]);

  // Recaudación Total
  const recaudacionTotal = useMemo(() => {
    return ventasValidas.reduce((acc, v) => acc + v.total, 0);
  }, [ventasValidas]);

  // Desglose por método de pago
  const desgloseMetodos = useMemo(() => {
    const efectivo = ventasValidas
      .filter((v) => v.metodoPago === 'efectivo')
      .reduce((acc, v) => acc + v.total, 0);
    const tpv = ventasValidas
      .filter((v) => v.metodoPago === 'tpv')
      .reduce((acc, v) => acc + v.total, 0);
    const bizum = ventasValidas
      .filter((v) => v.metodoPago === 'transferencia_bizum')
      .reduce((acc, v) => acc + v.total, 0);

    return {
      efectivo,
      tpv,
      bizum,
      total: recaudacionTotal || 1 // evitar división por cero
    };
  }, [ventasValidas, recaudacionTotal]);

  // Cálculo de Costes y Beneficio Neto
  const balanceCostes = useMemo(() => {
    let costeTotal = 0;
    let unidadesTotales = 0;

    ventasValidas.forEach((v) => {
      v.lineas.forEach((linea) => {
        unidadesTotales += linea.cantidad;
        const prod = productos.find((p) => p.id === linea.productId);
        const costeUnitario = linea.precioCoste ?? prod?.precioCoste ?? 0;
        costeTotal += linea.cantidad * costeUnitario;
      });
    });

    const beneficioNeto = Math.max(0, recaudacionTotal - costeTotal);
    const margenGlobal = recaudacionTotal > 0 ? (beneficioNeto / recaudacionTotal) * 100 : 0;

    return {
      costeTotal,
      beneficioNeto,
      margenGlobal,
      unidadesTotales
    };
  }, [ventasValidas, recaudacionTotal, productos]);

  // Ticket Medio
  const ticketMedio = ventasValidas.length > 0 ? recaudacionTotal / ventasValidas.length : 0;

  // Recaudación y Unidades por Etiqueta
  const statsEtiquetas = useMemo(() => {
    const mapa = new Map<string, { recaudado: number; unidades: number }>();

    ventasValidas.forEach((v) => {
      v.lineas.forEach((linea) => {
        const prod = productos.find((p) => p.id === linea.productId);
        const etiquetas = prod?.etiquetas || ['Sin etiqueta'];

        etiquetas.forEach((tag) => {
          const actual = mapa.get(tag) || { recaudado: 0, unidades: 0 };
          mapa.set(tag, {
            recaudado: actual.recaudado + linea.cantidad * linea.precioUnitario,
            unidades: actual.unidades + linea.cantidad
          });
        });
      });
    });

    return Array.from(mapa.entries()).map(([tag, datos]) => ({
      etiqueta: tag,
      ...datos
    })).sort((a, b) => b.recaudado - a.recaudado);
  }, [ventasValidas, productos]);

  const eventoSeleccionado = eventos.find((e) => e.id === filtroEvento);

  return (
    <div id="cuentas-view-container" className="max-w-7xl mx-auto p-3 sm:p-5 space-y-5 animate-fadeIn">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              Cuentas y Métricas Financieras
            </h1>
            <p className="text-xs text-slate-500">
              Beneficio neto, márgenes comerciales, desglose de pagos y estadísticas por evento
            </p>
          </div>
        </div>

        {/* Selector de Evento */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
          <Calendar className="w-4 h-4 text-blue-600 ml-2" />
          <select
            value={filtroEvento}
            onChange={(e) => setFiltroEvento(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-800 px-2 py-1 focus:outline-hidden cursor-pointer"
          >
            <option value="todos">Todos los Eventos (Global)</option>
            {eventos.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.nombre} {evt.estado === 'activo' ? '(Activo)' : '(Cerrado)'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de KPIs Financieros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Recaudación Bruta */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Recaudación Bruta
          </span>
          <p className="text-2xl font-black text-blue-600 mt-1">
            {formatearEuros(recaudacionTotal)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {ventasValidas.length} tickets válidos
          </span>
        </div>

        {/* Beneficio Neto Estimado */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Beneficio Neto Estimado
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {formatearEuros(balanceCostes.beneficioNeto)}
          </p>
          <span className="text-[11px] font-semibold text-emerald-700 mt-1 block">
            Margen: {balanceCostes.margenGlobal.toFixed(1)}%
          </span>
        </div>

        {/* Coste de Artículos Vendidos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Coste Mercancía (COGS)
          </span>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {formatearEuros(balanceCostes.costeTotal)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {balanceCostes.unidadesTotales} unidades vendidas
          </span>
        </div>

        {/* Ticket Medio */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Ticket Medio
          </span>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {formatearEuros(ticketMedio)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Promedio por compra
          </span>
        </div>
      </div>

      {/* Desglose por Método de Pago y Rendimiento por Categorías */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Desglose por Métodos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Wallet className="w-4 h-4 text-blue-600" /> Desglose por Vía de Cobro
          </h2>

          <div className="space-y-3">
            {/* Efectivo */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Banknote className="w-5 h-5 text-emerald-600" />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Efectivo en Caja</span>
                  <span className="text-[11px] text-slate-400">
                    {((desgloseMetodos.efectivo / desgloseMetodos.total) * 100).toFixed(0)}% del total
                  </span>
                </div>
              </div>
              <span className="text-base font-black text-slate-900">
                {formatearEuros(desgloseMetodos.efectivo)}
              </span>
            </div>

            {/* Datáfono TPV */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Datáfono / Tarjeta</span>
                  <span className="text-[11px] text-slate-400">
                    {((desgloseMetodos.tpv / desgloseMetodos.total) * 100).toFixed(0)}% del total
                  </span>
                </div>
              </div>
              <span className="text-base font-black text-slate-900">
                {formatearEuros(desgloseMetodos.tpv)}
              </span>
            </div>

            {/* Bizum */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <QrCode className="w-5 h-5 text-cyan-600" />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Bizum / Transferencia</span>
                  <span className="text-[11px] text-slate-400">
                    {((desgloseMetodos.bizum / desgloseMetodos.total) * 100).toFixed(0)}% del total
                  </span>
                </div>
              </div>
              <span className="text-base font-black text-slate-900">
                {formatearEuros(desgloseMetodos.bizum)}
              </span>
            </div>
          </div>
        </div>

        {/* Rendimiento por Categoría / Etiqueta */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Layers className="w-4 h-4 text-purple-600" /> Rendimiento por Etiqueta
          </h2>

          <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
            {statsEtiquetas.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No hay datos de ventas en este filtro</p>
            ) : (
              statsEtiquetas.map((item) => (
                <div
                  key={item.etiqueta}
                  className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-800">{item.etiqueta}</span>
                    <span className="text-[11px] text-slate-400 block">{item.unidades} uds vendidas</span>
                  </div>
                  <span className="text-sm font-bold text-blue-600">
                    {formatearEuros(item.recaudado)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
