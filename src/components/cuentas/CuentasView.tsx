import React, { useMemo } from 'react';
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
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'motion/react';

export const CuentasView: React.FC = () => {
  const { ventas, productos } = useDataStore();

  // Filtrar solo ventas registradas (excluir devueltas del cálculo de beneficio)
  const ventasValidas = useMemo(() => {
    return ventas.filter((v) => v.estado !== 'devuelta');
  }, [ventas]);

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
        // Buscar coste del producto en el catálogo o en la línea
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

    return Array.from(mapa.entries())
      .map(([etiqueta, data]) => ({ etiqueta, ...data }))
      .sort((a, b) => b.recaudado - a.recaudado);
  }, [ventasValidas, productos]);

  // Ranking de Productos Más Vendidos
  const rankingProductos = useMemo(() => {
    const mapa = new Map<string, { nombreCorto: string; unidades: number; totalGenerado: number }>();

    ventasValidas.forEach((v) => {
      v.lineas.forEach((linea) => {
        const actual = mapa.get(linea.productId) || {
          nombreCorto: linea.nombreCorto,
          unidades: 0,
          totalGenerado: 0
        };
        mapa.set(linea.productId, {
          nombreCorto: linea.nombreCorto,
          unidades: actual.unidades + linea.cantidad,
          totalGenerado: actual.totalGenerado + linea.cantidad * linea.precioUnitario
        });
      });
    });

    return Array.from(mapa.values())
      .sort((a, b) => b.unidades - a.unidades)
      .slice(0, 6);
  }, [ventasValidas]);

  return (
    <div id="cuentas-view-container" className="max-w-7xl mx-auto p-3 sm:p-5 space-y-5">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-rose-100/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-100 text-teal-800 flex items-center justify-center font-bold">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-slate-800">
              Control de Cuentas y Métricas
            </h1>
            <p className="text-xs text-slate-500">
              Rendimiento en tiempo real, desglose de ingresos, costes y margen
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            En directo
          </span>
        </div>
      </div>

      {/* Grid de 4 KPIs Principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Recaudación Total */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-rose-100/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Recaudación Bruta
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
            {formatearEuros(recaudacionTotal)}
          </p>
          <p className="text-xs text-slate-500">{ventasValidas.length} ventas efectuadas</p>
        </div>

        {/* Beneficio Neto */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-emerald-100/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Beneficio Neto (Margen)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-display text-emerald-700">
            {formatearEuros(balanceCostes.beneficioNeto)}
          </p>
          <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold">
            <span>Margen Stand:</span>
            <span className="bg-emerald-100 px-2 py-0.5 rounded-md">
              {balanceCostes.margenGlobal.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Ticket Medio */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-purple-100/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Ticket Medio
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
            {formatearEuros(ticketMedio)}
          </p>
          <p className="text-xs text-slate-500">Por compra de cliente</p>
        </div>

        {/* Unidades Vendidas */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-amber-100/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Unidades Vendidas
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
            {balanceCostes.unidadesTotales} <span className="text-base font-normal text-slate-400">uds</span>
          </p>
          <p className="text-xs text-slate-500">
            Coste mercancía: {formatearEuros(balanceCostes.costeTotal)}
          </p>
        </div>
      </div>

      {/* Grid de Gráficos y Desgloses */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* ================= DESGLOSE POR MÉTODO DE PAGO (5 cols) ================= */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 shadow-xs border border-rose-100/80 space-y-4">
          <h3 className="text-base font-bold font-display text-slate-800">
            Desglose por Método de Pago
          </h3>

          {/* Barra de distribución visual */}
          <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100">
            <div
              style={{ width: `${(desgloseMetodos.efectivo / desgloseMetodos.total) * 100}%` }}
              className="bg-emerald-500 transition-all duration-500"
              title={`Efectivo: ${formatearEuros(desgloseMetodos.efectivo)}`}
            />
            <div
              style={{ width: `${(desgloseMetodos.tpv / desgloseMetodos.total) * 100}%` }}
              className="bg-blue-500 transition-all duration-500"
              title={`TPV: ${formatearEuros(desgloseMetodos.tpv)}`}
            />
            <div
              style={{ width: `${(desgloseMetodos.bizum / desgloseMetodos.total) * 100}%` }}
              className="bg-cyan-500 transition-all duration-500"
              title={`Bizum: ${formatearEuros(desgloseMetodos.bizum)}`}
            />
          </div>

          <div className="space-y-3 pt-2">
            {/* Efectivo */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Banknote className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-emerald-950">Efectivo en Caja</p>
                  <p className="text-[11px] text-emerald-700">
                    {((desgloseMetodos.efectivo / desgloseMetodos.total) * 100).toFixed(1)}% del total
                  </p>
                </div>
              </div>
              <span className="text-base font-extrabold font-display text-emerald-950">
                {formatearEuros(desgloseMetodos.efectivo)}
              </span>
            </div>

            {/* Datáfono TPV */}
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs font-bold text-blue-950">Datáfono TPV (Tarjeta)</p>
                  <p className="text-[11px] text-blue-700">
                    {((desgloseMetodos.tpv / desgloseMetodos.total) * 100).toFixed(1)}% del total
                  </p>
                </div>
              </div>
              <span className="text-base font-extrabold font-display text-blue-950">
                {formatearEuros(desgloseMetodos.tpv)}
              </span>
            </div>

            {/* Bizum / Transferencia */}
            <div className="p-3 bg-cyan-50/70 border border-cyan-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <QrCode className="w-5 h-5 text-cyan-600" />
                <div>
                  <p className="text-xs font-bold text-cyan-950">Bizum / Transferencia</p>
                  <p className="text-[11px] text-cyan-700">
                    {((desgloseMetodos.bizum / desgloseMetodos.total) * 100).toFixed(1)}% del total
                  </p>
                </div>
              </div>
              <span className="text-base font-extrabold font-display text-cyan-950">
                {formatearEuros(desgloseMetodos.bizum)}
              </span>
            </div>
          </div>
        </div>

        {/* ================= RECAUDACIÓN Y UNIDADES POR ETIQUETA (7 cols) ================= */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 shadow-xs border border-rose-100/80 space-y-4">
          <h3 className="text-base font-bold font-display text-slate-800">
            Rendimiento por Categoría / Etiqueta
          </h3>

          <div className="space-y-3">
            {statsEtiquetas.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                Aún no hay ventas con etiquetas registradas.
              </p>
            ) : (
              statsEtiquetas.map((item) => {
                const pct = recaudacionTotal > 0 ? (item.recaudado / recaudacionTotal) * 100 : 0;
                return (
                  <div key={item.etiqueta} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                        {item.etiqueta}
                        <span className="text-slate-400 font-normal">({item.unidades} uds)</span>
                      </span>
                      <span className="font-bold text-slate-900">
                        {formatearEuros(item.recaudado)} ({pct.toFixed(0)}%)
                      </span>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, Math.max(5, pct))}%` }}
                        className="h-full bg-gradient-to-r from-purple-400 to-rose-400 rounded-full"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Ranking de Productos Más Vendidos */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-rose-100/80 space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-bold font-display text-slate-800">
            Top Artículos Más Vendidos en el Stand
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {rankingProductos.length === 0 ? (
            <p className="col-span-full text-xs text-slate-400 py-4 text-center">
              No hay ventas registradas todavía.
            </p>
          ) : (
            rankingProductos.map((p, index) => (
              <div
                key={index}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-extrabold text-xs shadow-2xs ${
                      index === 0
                        ? 'bg-amber-400 text-amber-950'
                        : index === 1
                        ? 'bg-slate-300 text-slate-800'
                        : index === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    #{index + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{p.nombreCorto}</h4>
                    <p className="text-[11px] text-slate-400">{p.unidades} unidades vendidas</p>
                  </div>
                </div>

                <span className="text-sm font-extrabold font-display text-slate-900">
                  {formatearEuros(p.totalGenerado)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
