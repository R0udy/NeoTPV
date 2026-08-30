import React, { useState, useMemo } from 'react';
import { useDataStore } from '../../store/useDataStore';
import { Producto } from '../../types';
import { formatearEuros } from '../../utils/cashUtils';
import { formatImageUrl } from '../../config/onedriveConfig';
import { ProductFormModal } from './ProductFormModal';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Sparkles,
  AlertTriangle,
  XCircle,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const InventarioView: React.FC = () => {
  const {
    productos,
    eliminarProducto,
    busqueda,
    setBusqueda,
    filtroEtiqueta,
    setFiltroEtiqueta,
    orden,
    setOrden,
    settings
  } = useDataStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [vistaModo, setVistaModo] = useState<'grid' | 'table'>('grid');

  // Todas las etiquetas únicas
  const todasLasEtiquetas = useMemo(() => {
    const set = new Set<string>();
    productos.forEach((p) => {
      p.etiquetas?.forEach((e) => set.add(e));
    });
    return Array.from(set);
  }, [productos]);

  // Filtrado y ordenación
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

  // KPIs de inventario
  const totalUnidades = productos.reduce((acc, p) => acc + p.stock, 0);
  const valorTotalPVP = productos.reduce((acc, p) => acc + p.stock * p.precioVenta, 0);
  const valorTotalCoste = productos.reduce((acc, p) => acc + p.stock * p.precioCoste, 0);

  const handleCrearNuevo = () => {
    setProductoSeleccionado(null);
    setModalOpen(true);
  };

  const handleEditar = (prod: Producto) => {
    setProductoSeleccionado(prod);
    setModalOpen(true);
  };

  const handleEliminar = async (prod: Producto) => {
    if (window.confirm(`¿Seguro que deseas eliminar "${prod.nombreCorto}" del catálogo?`)) {
      await eliminarProducto(prod.id);
    }
  };

  const umbralBajo = settings.umbralStockBajo || 5;

  return (
    <div id="inventario-view-container" className="max-w-7xl mx-auto p-3 sm:p-5 space-y-5">
      
      {/* Header con métricas de inventario y botón Añadir */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-rose-100/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display text-slate-800">
                Inventario & Catálogo
              </h1>
              <p className="text-xs text-slate-500">
                Gestión de productos, precios de venta/coste y existencias en el stand
              </p>
            </div>
          </div>
        </div>

        {/* Resumen KPIs y botón nuevo */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl text-xs">
            <div>
              <span className="text-slate-400 block font-semibold">Referencias</span>
              <span className="font-extrabold text-slate-800 text-sm">{productos.length}</span>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <span className="text-slate-400 block font-semibold">Unidades</span>
              <span className="font-extrabold text-slate-800 text-sm">{totalUnidades} uds</span>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <span className="text-slate-400 block font-semibold">Valor PVP</span>
              <span className="font-extrabold text-emerald-700 text-sm">{formatearEuros(valorTotalPVP)}</span>
            </div>
          </div>

          <button
            type="button"
            id="btn-nuevo-producto"
            onClick={handleCrearNuevo}
            className="flex-1 sm:flex-none py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-bold shadow-md shadow-rose-200 flex items-center justify-center gap-2 min-h-[48px] touch-press cursor-pointer transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Añadir Producto</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros, Búsqueda y Selector de Vista */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-rose-100/80 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Buscador */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, descripción o etiqueta..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-rose-400 focus:outline-hidden min-h-[42px]"
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

          {/* Ordenación */}
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value as any)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-rose-400 focus:outline-hidden min-h-[42px]"
          >
            <option value="nombre">Orden: Nombre A-Z</option>
            <option value="precio_asc">Precio: Menor a Mayor</option>
            <option value="precio_desc">Precio: Mayor a Menor</option>
            <option value="stock_desc">Stock: Más existencias</option>
            <option value="stock_asc">Stock: Menos existencias</option>
          </select>

          {/* Toggle Grid vs Table */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setVistaModo('grid')}
              className={`p-2 rounded-lg text-xs font-bold transition-all ${
                vistaModo === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
              }`}
              title="Vista en cuadrícula"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setVistaModo('table')}
              className={`p-2 rounded-lg text-xs font-bold transition-all ${
                vistaModo === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
              }`}
              title="Vista en tabla"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Etiquetas Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setFiltroEtiqueta(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[34px] touch-press ${
              !filtroEtiqueta || filtroEtiqueta === 'Todos'
                ? 'bg-rose-500 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({productos.length})
          </button>
          {todasLasEtiquetas.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setFiltroEtiqueta(tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[34px] touch-press ${
                filtroEtiqueta === tag
                  ? 'bg-rose-500 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Renderizado en Cuadrícula o Tabla */}
      {vistaModo === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {productosFiltrados.map((prod) => {
            const beneficio = prod.precioVenta - prod.precioCoste;
            const margenPct = prod.precioVenta > 0 ? (beneficio / prod.precioVenta) * 100 : 0;
            const esStockBajo = prod.stock <= umbralBajo;

            return (
              <div
                key={prod.id}
                className="bg-white rounded-3xl p-4 shadow-xs border border-slate-200/80 hover:border-rose-200 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Imagen y badge de stock */}
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 mb-3 border border-slate-100">
                    <img
                      src={formatImageUrl(prod.imagenUrl)}
                      alt={prod.nombreCorto}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    <span
                      className={`absolute top-2 left-2 text-xs font-extrabold px-2.5 py-1 rounded-lg backdrop-blur-md shadow-xs ${
                        prod.stock <= 0
                          ? 'bg-rose-500 text-white'
                          : esStockBajo
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-900/80 text-white'
                      }`}
                    >
                      {prod.stock <= 0 ? 'Agotado' : `Stock: ${prod.stock}`}
                    </span>
                  </div>

                  {/* Nombre & Descripción */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-slate-800 line-clamp-1">
                      {prod.nombreCorto}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {prod.descripcion || prod.nombreLargo}
                    </p>
                  </div>

                  {/* Etiquetas */}
                  <div className="flex flex-wrap gap-1 my-2.5">
                    {prod.etiquetas?.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Precios y Botones de Acción */}
                <div className="pt-3 border-t border-slate-100 mt-2 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                        Coste / PVP
                      </span>
                      <span className="text-slate-500 font-medium">{formatearEuros(prod.precioCoste)}</span>{' '}
                      <span className="text-slate-300">/</span>{' '}
                      <span className="font-extrabold text-slate-900 text-base font-display">
                        {formatearEuros(prod.precioVenta)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                        Margen
                      </span>
                      <span className="text-emerald-700 font-bold">
                        +{formatearEuros(beneficio)} ({margenPct.toFixed(0)}%)
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditar(prod)}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 touch-press"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEliminar(prod)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Vista en Tabla */
        <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Producto</th>
                  <th className="py-3.5 px-4">Etiquetas</th>
                  <th className="py-3.5 px-4 text-right">Coste</th>
                  <th className="py-3.5 px-4 text-right">PVP</th>
                  <th className="py-3.5 px-4 text-right">Margen</th>
                  <th className="py-3.5 px-4 text-center">Stock</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {productosFiltrados.map((prod) => {
                  const beneficio = prod.precioVenta - prod.precioCoste;
                  const margenPct = prod.precioVenta > 0 ? (beneficio / prod.precioVenta) * 100 : 0;
                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={formatImageUrl(prod.imagenUrl)}
                          alt={prod.nombreCorto}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{prod.nombreCorto}</p>
                          <p className="text-slate-400 text-[11px] truncate max-w-[200px]">
                            {prod.nombreLargo}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {prod.etiquetas?.map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-semibold"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatearEuros(prod.precioCoste)}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-slate-900 text-sm">
                        {formatearEuros(prod.precioVenta)}
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-700 font-bold">
                        +{formatearEuros(beneficio)} ({margenPct.toFixed(0)}%)
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                            prod.stock <= 0
                              ? 'bg-rose-100 text-rose-800'
                              : prod.stock <= umbralBajo
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {prod.stock} uds
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => handleEditar(prod)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEliminar(prod)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Crear / Editar */}
      <ProductFormModal
        isOpen={modalOpen}
        productoEditar={productoSeleccionado}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};
