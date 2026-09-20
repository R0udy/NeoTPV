import React, { useState, useMemo } from 'react';
import { useDataStore } from '../../store/useDataStore';
import {
  X,
  Tags,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertTriangle,
  Package,
  Layers,
  Search,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CategoriasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoriasModal: React.FC<CategoriasModalProps> = ({ isOpen, onClose }) => {
  const {
    productos,
    settings,
    getCategoriasDisponibles,
    crearCategoria,
    eliminarCategoria,
    renombrarCategoria,
    filtroEtiqueta,
    setFiltroEtiqueta
  } = useDataStore();

  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [categoriaEditando, setCategoriaEditando] = useState<string | null>(null);
  const [nuevoNombreEditado, setNuevoNombreEditado] = useState('');
  const [categoriaAEliminar, setCategoriaAEliminar] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const categorias = getCategoriasDisponibles();

  // Calcular número de productos asociados a cada categoría
  const conteoPorCategoria = useMemo(() => {
    const counts: Record<string, number> = {};
    categorias.forEach((cat) => {
      counts[cat] = 0;
    });
    productos.forEach((p) => {
      p.etiquetas?.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }, [categorias, productos]);

  // Filtrar categorías según búsqueda
  const categoriasFiltradas = useMemo(() => {
    if (!busqueda.trim()) return categorias;
    return categorias.filter((c) =>
      c.toLowerCase().includes(busqueda.trim().toLowerCase())
    );
  }, [categorias, busqueda]);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = nuevaCategoria.trim();
    if (!clean) return;

    setIsProcessing(true);
    await crearCategoria(clean);
    setNuevaCategoria('');
    setIsProcessing(false);
  };

  const handleIniciarEdicion = (cat: string) => {
    setCategoriaEditando(cat);
    setNuevoNombreEditado(cat);
  };

  const handleGuardarEdicion = async (catOriginal: string) => {
    const clean = nuevoNombreEditado.trim();
    if (!clean || clean === catOriginal) {
      setCategoriaEditando(null);
      return;
    }

    setIsProcessing(true);
    await renombrarCategoria(catOriginal, clean);
    setCategoriaEditando(null);
    setIsProcessing(false);
  };

  const handleConfirmarEliminacion = async () => {
    if (!categoriaAEliminar) return;

    setIsProcessing(true);
    await eliminarCategoria(categoriaAEliminar);
    setCategoriaAEliminar(null);
    setIsProcessing(false);
  };

  if (!isOpen) return null;

  const productosAfectados = categoriaAEliminar ? (conteoPorCategoria[categoriaAEliminar] || 0) : 0;

  return (
    <div
      id="categorias-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-rose-50/40 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold shadow-sm shadow-rose-200">
              <Tags className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-slate-800">
                Gestor Central de Categorías
              </h2>
              <p className="text-xs text-slate-500">
                Administra, crea y elimina las categorías globales de tu catálogo
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-categorias-modal"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido principal */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Formulario de Creación Rápida */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Crear Nueva Categoría
            </label>
            <form onSubmit={handleCrear} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  id="input-nueva-categoria"
                  value={nuevaCategoria}
                  onChange={(e) => setNuevaCategoria(e.target.value)}
                  placeholder="Ej: Acrílicos, Posters, Figuras, Papelería..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-rose-400 focus:outline-hidden"
                  maxLength={30}
                />
              </div>
              <button
                type="submit"
                id="btn-submit-crear-categoria"
                disabled={!nuevaCategoria.trim() || isProcessing}
                className="py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 touch-press cursor-pointer transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Categoría</span>
              </button>
            </form>
          </div>

          {/* Listado y Búsqueda de Categorías */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Categorías Disponibles ({categorias.length})
                </h3>
              </div>

              {/* Buscador de categorías si hay muchas */}
              {categorias.length > 5 && (
                <div className="relative w-full sm:w-48">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Filtrar categorías..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-rose-400"
                  />
                </div>
              )}
            </div>

            {categoriasFiltradas.length === 0 ? (
              <div className="p-8 bg-slate-50 rounded-2xl text-center border border-dashed border-slate-300">
                <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">
                  {busqueda ? 'No hay categorías que coincidan con la búsqueda' : 'No hay categorías registradas'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {categoriasFiltradas.map((cat) => {
                  const count = conteoPorCategoria[cat] || 0;
                  const isEditing = categoriaEditando === cat;

                  return (
                    <div
                      key={cat}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                        isEditing
                          ? 'bg-rose-50/60 border-rose-300 ring-2 ring-rose-200'
                          : 'bg-white hover:bg-slate-50/80 border-slate-200'
                      }`}
                    >
                      {/* Información / Edición de nombre */}
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={nuevoNombreEditado}
                              onChange={(e) => setNuevoNombreEditado(e.target.value)}
                              className="w-full px-2.5 py-1 bg-white border border-rose-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-hidden"
                              autoFocus
                              maxLength={30}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleGuardarEdicion(cat);
                                if (e.key === 'Escape') setCategoriaEditando(null);
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleGuardarEdicion(cat)}
                              className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                              title="Guardar nombre"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setCategoriaEditando(null)}
                              className="p-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
                              title="Cancelar edición"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-800 truncate">
                                {cat}
                              </span>
                              {filtroEtiqueta === cat && (
                                <span className="text-[9px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded-full">
                                  Filtro activo
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                              <span>
                                {count === 0 ? (
                                  <span className="text-slate-400">0 productos (vacía)</span>
                                ) : (
                                  <span className="text-slate-600 font-medium">
                                    {count} {count === 1 ? 'producto vinculado' : 'productos vinculados'}
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Botones de acción */}
                      {!isEditing && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleIniciarEdicion(cat)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title={`Renombrar categoría ${cat}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setCategoriaAEliminar(cat)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title={`Eliminar categoría ${cat}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Al eliminar una categoría, se retira de todos los productos vinculados sin borrar los productos.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs touch-press cursor-pointer transition-colors"
          >
            Cerrar
          </button>
        </div>
      </motion.div>

      {/* Modal de Confirmación de Borrado */}
      {categoriaAEliminar && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-rose-200 space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">
                ¿Eliminar la categoría "{categoriaAEliminar}"?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {productosAfectados > 0 ? (
                  <>
                    Esta categoría está actualmente asignada a{' '}
                    <strong className="text-rose-600 font-bold">
                      {productosAfectados} {productosAfectados === 1 ? 'producto' : 'productos'}
                    </strong>{' '}
                    del inventario. Si confirmas, se desvinculará de ellos automáticamente para evitar problemas de stock o inconsistencias.
                  </>
                ) : (
                  <>
                    Esta categoría no tiene ningún producto asignado actualmente. Se eliminará del listado global de categorías.
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCategoriaAEliminar(null)}
                disabled={isProcessing}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs touch-press cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="btn-confirmar-eliminar-categoria"
                onClick={handleConfirmarEliminacion}
                disabled={isProcessing}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs touch-press cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sí, Eliminar</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
