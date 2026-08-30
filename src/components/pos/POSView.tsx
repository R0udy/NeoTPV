import React, { useMemo } from 'react';
import { usePOSStore } from '../../store/usePOSStore';
import { useDataStore } from '../../store/useDataStore';
import { Producto } from '../../types';
import { formatearEuros } from '../../utils/cashUtils';
import { formatImageUrl } from '../../config/onedriveConfig';
import { CheckoutModal } from './CheckoutModal';
import {
  Search,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Percent,
  SlidersHorizontal,
  XCircle,
  PackageX
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const POSView: React.FC = () => {
  const {
    lineas,
    agregarProducto,
    incrementarCantidad,
    decrementarCantidad,
    eliminarLinea,
    limpiarTicket,
    calcularTotal,
    calcularSubtotal,
    calcularDescuentoTotal,
    descuentoGlobal,
    setDescuentoGlobal,
    setCheckoutOpen
  } = usePOSStore();

  const {
    productos,
    busqueda,
    setBusqueda,
    filtroEtiqueta,
    setFiltroEtiqueta,
    orden,
    setOrden
  } = useDataStore();

  // Obtener lista única de todas las etiquetas del catálogo
  const todasLasEtiquetas = useMemo(() => {
    const set = new Set<string>();
    productos.forEach((p) => {
      p.etiquetas?.forEach((e) => set.add(e));
    });
    return Array.from(set);
  }, [productos]);

  // Filtrado y ordenación de productos
  const productosFiltrados = useMemo(() => {
    return productos
      .filter((p) => {
        const coincideBusqueda =
          p.nombreCorto.toLowerCase().includes(busqueda.toLowerCase()) ||
          p.nombreLargo.toLowerCase().includes(busqueda.toLowerCase()) ||
          p.etiquetas.some((e) => e.toLowerCase().includes(busqueda.toLowerCase()));

        const coincideEtiqueta =
          !filtroEtiqueta || filtroEtiqueta === 'Todos' || p.etiquetas.includes(filtroEtiqueta);

        return coincideBusqueda && coincideEtiqueta;
      })
      .sort((a, b) => {
        if (orden === 'nombre') return a.nombreCorto.localeCompare(b.nombreCorto);
        if (orden === 'precio_asc') return a.precioVenta - b.precioVenta;
        if (orden === 'precio_desc') return b.precioVenta - a.precioVenta;
        if (orden === 'stock_asc') return a.stock - b.stock;
        if (orden === 'stock_desc') return b.stock - a.stock;
        return 0;
      });
  }, [productos, busqueda, filtroEtiqueta, orden]);

  const total = calcularTotal();
  const subtotal = calcularSubtotal();
  const descuentoImporte = calcularDescuentoTotal();
  const totalArticulos = lineas.reduce((acc, l) => acc + l.cantidad, 0);

  return (
    <div id="pos-view-container" className="max-w-7xl mx-auto p-3 sm:p-5">
      {/* Layout de 2 zonas responsive: en tablet/desktop 2 columnas fijas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ================= ZONA 1 (IZQUIERDA / 5 cols): TICKET ACTUAL ================= */}
        <div
          id="pos-ticket-zone"
          className="lg:col-span-5 bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-[#F0EBE3] flex flex-col h-auto lg:h-[calc(100vh-8rem)] lg:sticky lg:top-20 overflow-hidden"
        >
          {/* Cabecera del Ticket */}
          <div className="flex items-center justify-between pb-3.5 border-b border-[#F0EBE3] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#E3F2FD] text-[#2196F3] flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 leading-tight">
                  Ticket Actual
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  {totalArticulos} {totalArticulos === 1 ? 'artículo' : 'artículos'}
                </p>
              </div>
            </div>

            {lineas.length > 0 && (
              <button
                type="button"
                id="btn-limpiar-ticket"
                onClick={limpiarTicket}
                className="text-xs font-semibold text-slate-400 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 touch-press cursor-pointer"
                title="Vaciar ticket completo"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vaciar</span>
              </button>
            )}
          </div>

          {/* Lista de Líneas del Ticket */}
          <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1 min-h-[160px] max-h-[360px] lg:max-h-none">
            {lineas.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <ShoppingBag className="w-12 h-12 stroke-[1.2] mb-2 text-slate-200" />
                <p className="text-sm font-semibold text-slate-600">Ticket vacío</p>
                <p className="text-xs text-slate-400 max-w-[200px] mt-0.5">
                  Toca cualquier producto del catálogo para añadirlo al ticket.
                </p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {lineas.map((linea) => (
                  <motion.div
                    key={linea.producto.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10, transition: { duration: 0.15 } }}
                    className="p-3 bg-[#FDFBF7] hover:bg-[#F8F9FA] border border-[#F0EBE3] rounded-xl flex items-center justify-between gap-2.5 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <img
                        src={formatImageUrl(linea.producto.imagenUrl)}
                        alt={linea.producto.nombreCorto}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-lg object-cover shrink-0 bg-slate-100 border border-[#F0EBE3]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=150&q=80';
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-slate-800 truncate leading-snug">
                          {linea.producto.nombreCorto}
                        </h4>
                        <p className="text-xs text-slate-400 font-medium">
                          {formatearEuros(linea.precioUnitario)} unit.
                        </p>
                      </div>
                    </div>

                    {/* Controles de Cantidad Grandes Táctiles */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="flex items-center bg-white border border-[#F0EBE3] rounded-lg shadow-2xs p-0.5">
                        <button
                          type="button"
                          onClick={() => decrementarCantidad(linea.producto.id)}
                          className="w-7 h-7 rounded-md text-slate-600 hover:bg-slate-100 active:scale-95 flex items-center justify-center font-bold text-sm transition-all touch-press cursor-pointer"
                          title="Restar una unidad"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-slate-800">
                          {linea.cantidad}
                        </span>
                        <button
                          type="button"
                          onClick={() => incrementarCantidad(linea.producto.id)}
                          className="w-7 h-7 rounded-md text-slate-600 hover:bg-slate-100 active:scale-95 flex items-center justify-center font-bold text-sm transition-all touch-press cursor-pointer"
                          title="Sumar una unidad"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-slate-800 min-w-[58px] text-right pl-1">
                        {formatearEuros(linea.cantidad * linea.precioUnitario)}
                      </span>

                      <button
                        type="button"
                        onClick={() => eliminarLinea(linea.producto.id)}
                        className="text-slate-300 hover:text-rose-500 p-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Quitar producto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Descuentos & Totales */}
          <div className="pt-3 border-t border-[#F0EBE3] shrink-0 space-y-3">
            {/* Selector de Descuento Rápido */}
            <div className="flex items-center justify-between text-xs bg-[#F8F9FA] p-2 rounded-xl border border-[#F0EBE3]">
              <span className="font-semibold text-slate-600 flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-[#2196F3]" /> Descuento:
              </span>
              <div className="flex items-center gap-1">
                {[0, 5, 10, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setDescuentoGlobal(pct)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all touch-press cursor-pointer ${
                      descuentoGlobal === pct
                        ? 'bg-[#1976D2] text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {pct === 0 ? '0%' : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Desglose de Precios */}
            <div className="space-y-1 text-xs text-slate-500 font-medium">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-700">{formatearEuros(subtotal)}</span>
              </div>
              {descuentoImporte > 0 && (
                <div className="flex justify-between text-[#2E7D32] font-semibold">
                  <span>Descuento aplicado ({descuentoGlobal}%)</span>
                  <span>-{formatearEuros(descuentoImporte)}</span>
                </div>
              )}
            </div>

            {/* Total Grande Display */}
            <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-[#F0EBE3] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Total
                </span>
                <span className="text-3xl font-black text-[#1976D2] tracking-tight">
                  {formatearEuros(total)}
                </span>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-slate-700 border border-[#F0EBE3] shadow-2xs">
                {totalArticulos} {totalArticulos === 1 ? 'ud.' : 'uds.'}
              </span>
            </div>

            {/* Botón Grande Táctil de Cobro */}
            <button
              type="button"
              id="btn-pos-cobrar"
              disabled={lineas.length === 0}
              onClick={() => setCheckoutOpen(true)}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-white text-base shadow-lg transition-all flex items-center justify-center gap-2 min-h-[54px] touch-press cursor-pointer ${
                lineas.length === 0
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-[#2196F3] hover:bg-[#1976D2] shadow-blue-100 active:scale-[0.99]'
              }`}
            >
              <span className="tracking-wide text-lg">COBRAR {formatearEuros(total)}</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </button>
          </div>
        </div>

        {/* ================= ZONA 2 (CENTRO/DERECHA / 7 cols): CATÁLOGO DE PRODUCTOS ================= */}
        <div id="pos-products-zone" className="lg:col-span-7 space-y-4">
          
          {/* Barra de Búsqueda y Ordenación */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-xs border border-[#F0EBE3] space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5">
              {/* Buscador */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="input-pos-search"
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre, anime, K-pop o joya..."
                  className="w-full pl-10 pr-9 py-2.5 bg-[#FDFBF7] border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all min-h-[42px]"
                />
                {busqueda && (
                  <button
                    type="button"
                    onClick={() => setBusqueda('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Selector de Orden */}
              <div className="shrink-0 flex items-center gap-2">
                <select
                  id="select-pos-orden"
                  value={orden}
                  onChange={(e) => setOrden(e.target.value as any)}
                  className="px-3 py-2.5 bg-[#FDFBF7] border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all min-h-[42px]"
                >
                  <option value="nombre">Orden: Nombre A-Z</option>
                  <option value="precio_asc">Precio: Menor a Mayor</option>
                  <option value="precio_desc">Precio: Mayor a Menor</option>
                  <option value="stock_desc">Stock: Más unidades</option>
                  <option value="stock_asc">Stock: Menos unidades</option>
                </select>
              </div>
            </div>

            {/* Filtros de Etiquetas Rápidas (Pills) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setFiltroEtiqueta(null)}
                className={`px-5 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap min-h-[36px] touch-press cursor-pointer ${
                  !filtroEtiqueta || filtroEtiqueta === 'Todos'
                    ? 'bg-[#E8F5E9] text-[#2E7D32] border border-emerald-200/60 shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                Todos ({productos.length})
              </button>

              {todasLasEtiquetas.map((etiqueta) => (
                <button
                  key={etiqueta}
                  type="button"
                  onClick={() => setFiltroEtiqueta(etiqueta)}
                  className={`px-5 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap min-h-[36px] touch-press cursor-pointer ${
                    filtroEtiqueta === etiqueta
                      ? 'bg-[#E8F5E9] text-[#2E7D32] border border-emerald-200/60 shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {etiqueta}
                </button>
              ))}
            </div>
          </div>

          {/* Cuadrícula de Productos Táctil */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-3.5 pb-6">
            {productosFiltrados.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl p-10 text-center border border-[#F0EBE3]">
                <PackageX className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <h3 className="text-base font-bold text-slate-700">No se encontraron productos</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Prueba a modificar los términos de búsqueda o a seleccionar otra etiqueta del stand.
                </p>
              </div>
            ) : (
              productosFiltrados.map((prod) => {
                const enTicket = lineas.find((l) => l.producto.id === prod.id);
                const isAgotado = prod.stock <= 0;

                return (
                  <button
                    key={prod.id}
                    type="button"
                    id={`pos-card-prod-${prod.id}`}
                    disabled={isAgotado}
                    onClick={() => agregarProducto(prod)}
                    className={`group text-left bg-white rounded-2xl p-3.5 border transition-all duration-150 relative overflow-hidden flex flex-col justify-between min-h-[210px] touch-press cursor-pointer shadow-xs ${
                      isAgotado
                        ? 'opacity-50 border-slate-200 bg-slate-50 cursor-not-allowed'
                        : enTicket
                        ? 'border-[#2196F3] ring-2 ring-blue-100 shadow-md'
                        : 'border-[#F0EBE3] hover:border-blue-200 hover:shadow-md'
                    }`}
                  >
                    {/* Imagen y badges */}
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-100 mb-2.5">
                      <img
                        src={formatImageUrl(prod.imagenUrl)}
                        alt={prod.nombreCorto}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80';
                        }}
                      />

                      {/* Badge de Stock */}
                      <span
                        className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs uppercase ${
                          prod.stock <= 0
                            ? 'bg-rose-500 text-white'
                            : prod.stock <= 5
                            ? 'bg-amber-500 text-white'
                            : 'bg-[#E8F5E9] text-[#2E7D32] border border-emerald-200/60'
                        }`}
                      >
                        {prod.stock <= 0 ? 'Agotado' : `Stock: ${prod.stock}`}
                      </span>

                      {/* Contador si ya está en ticket */}
                      {enTicket && (
                        <span className="absolute top-2 right-2 text-xs font-black px-2 py-0.5 rounded-full bg-[#1976D2] text-white shadow-md">
                          {enTicket.cantidad}x
                        </span>
                      )}
                    </div>

                    {/* Información del producto */}
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-[#1976D2] transition-colors">
                        {prod.nombreCorto}
                      </h4>

                      {/* Etiquetas pills */}
                      <div className="flex flex-wrap gap-1">
                        {prod.etiquetas?.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Precio en grande */}
                      <div className="flex items-center justify-between pt-1.5">
                        <span className="text-base sm:text-lg font-black text-[#1976D2]">
                          {formatearEuros(prod.precioVenta)}
                        </span>
                        <span className="text-[11px] font-semibold text-[#1976D2] bg-[#E3F2FD] px-2 py-0.5 rounded-lg group-hover:bg-[#2196F3] group-hover:text-white transition-colors">
                          + Añadir
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal de Cobro */}
      <CheckoutModal />
    </div>
  );
};
