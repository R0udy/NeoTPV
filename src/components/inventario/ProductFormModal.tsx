import React, { useState, useEffect } from 'react';
import { Producto } from '../../types';
import { useDataStore } from '../../store/useDataStore';
import { formatImageUrl } from '../../config/onedriveConfig';
import { formatearEuros } from '../../utils/cashUtils';
import { X, Save, Sparkles, Image as ImageIcon, Tags, Plus, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductFormModalProps {
  productoEditar?: Producto | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  productoEditar,
  isOpen,
  onClose
}) => {
  const { guardarProducto, getCategoriasDisponibles, crearCategoria } = useDataStore();

  const [nombreCorto, setNombreCorto] = useState('');
  const [nombreLargo, setNombreLargo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [precioCoste, setPrecioCoste] = useState<number | string>(2.5);
  const [precioVenta, setPrecioVenta] = useState<number | string>(10.0);
  const [stock, setStock] = useState<number | string>(10);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>(['Joyería']);
  const [nuevaCategoriaInput, setNuevaCategoriaInput] = useState('');
  const [mostrarCrearInput, setMostrarCrearInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoriasDisponibles = getCategoriasDisponibles();

  useEffect(() => {
    if (productoEditar) {
      setNombreCorto(productoEditar.nombreCorto);
      setNombreLargo(productoEditar.nombreLargo);
      setDescripcion(productoEditar.descripcion || '');
      setImagenUrl(productoEditar.imagenUrl || '');
      setPrecioCoste(productoEditar.precioCoste);
      setPrecioVenta(productoEditar.precioVenta);
      setStock(productoEditar.stock);
      setCategoriasSeleccionadas(productoEditar.etiquetas || []);
    } else {
      setNombreCorto('');
      setNombreLargo('');
      setDescripcion('');
      setImagenUrl('');
      setPrecioCoste(2.5);
      setPrecioVenta(9.0);
      setStock(12);
      setCategoriasSeleccionadas(['Joyería']);
    }
    setMostrarCrearInput(false);
    setNuevaCategoriaInput('');
  }, [productoEditar, isOpen]);

  const pCosteNum = typeof precioCoste === 'number' ? precioCoste : parseFloat(precioCoste) || 0;
  const pVentaNum = typeof precioVenta === 'number' ? precioVenta : parseFloat(precioVenta) || 0;
  const beneficioUnitario = pVentaNum - pCosteNum;
  const margenPorcentaje = pVentaNum > 0 ? (beneficioUnitario / pVentaNum) * 100 : 0;

  const handleToggleCategoria = (cat: string) => {
    const clean = cat.trim();
    if (!clean) return;

    if (categoriasSeleccionadas.includes(clean)) {
      setCategoriasSeleccionadas(categoriasSeleccionadas.filter((c) => c !== clean));
    } else {
      if (categoriasSeleccionadas.length >= 3) return; // Máximo 3 categorías
      setCategoriasSeleccionadas([...categoriasSeleccionadas, clean]);
    }
  };

  const handleCrearYNuevoSeleccionar = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = nuevaCategoriaInput.trim();
    if (!clean) return;

    await crearCategoria(clean);
    if (categoriasSeleccionadas.length < 3 && !categoriasSeleccionadas.includes(clean)) {
      setCategoriasSeleccionadas([...categoriasSeleccionadas, clean]);
    }
    setNuevaCategoriaInput('');
    setMostrarCrearInput(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreCorto.trim()) return;

    setIsSubmitting(true);
    const prodFinal: Producto = {
      id: productoEditar?.id || `prod-${Date.now()}`,
      nombreCorto: nombreCorto.trim(),
      nombreLargo: nombreLargo.trim() || nombreCorto.trim(),
      descripcion: descripcion.trim(),
      imagenUrl: imagenUrl.trim(),
      precioCoste: Number(pCosteNum),
      precioVenta: Number(pVentaNum),
      stock: Number(typeof stock === 'number' ? stock : parseInt(stock, 10) || 0),
      etiquetas: categoriasSeleccionadas.slice(0, 3)
    };

    await guardarProducto(prodFinal);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="product-form-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-[#F0EBE3] overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-[#F8F9FA] border-b border-[#F0EBE3] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E3F2FD] text-[#2196F3] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-slate-800">
                {productoEditar ? 'Editar Ficha de Producto' : 'Añadir Nuevo Producto'}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Catálogo de joyería y merchandising de stand
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* Nombre corto y largo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre Corto (TPV) *
              </label>
              <input
                type="text"
                required
                value={nombreCorto}
                onChange={(e) => setNombreCorto(e.target.value)}
                placeholder="Ej: Anillo Dragón"
                className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#F0EBE3] rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:outline-hidden"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre Largo Descriptivo
              </label>
              <input
                type="text"
                value={nombreLargo}
                onChange={(e) => setNombreLargo(e.target.value)}
                placeholder="Ej: Anillo de Plata 925 Escamas de Dragón"
                className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#F0EBE3] rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:outline-hidden"
              />
            </div>
          </div>

          {/* URL de Imagen */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
              <span>URL de Imagen (OneDrive o Directa)</span>
            </label>
            <input
              type="url"
              value={imagenUrl}
              onChange={(e) => setImagenUrl(e.target.value)}
              placeholder="https://1drv.ms/... o enlace web https://..."
              className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#F0EBE3] rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:outline-hidden"
            />
          </div>

          {/* Precios y Stock */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Coste Unitario (€) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={precioCoste}
                onChange={(e) => setPrecioCoste(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#F0EBE3] rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:outline-hidden text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Precio PVP (€) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={precioVenta}
                onChange={(e) => setPrecioVenta(e.target.value)}
                className="w-full px-3 py-2 bg-[#E3F2FD] border border-blue-200 rounded-xl text-sm font-extrabold text-[#1976D2] focus:bg-white focus:ring-2 focus:ring-blue-400 focus:outline-hidden text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Stock Stand *
              </label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#F0EBE3] rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:outline-hidden text-center"
              />
            </div>
          </div>

          {/* Indicador de Margen Calculado */}
          <div className="p-3 bg-[#E8F5E9] rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-900">
              Beneficio unitario estimado: {formatearEuros(beneficioUnitario)}
            </span>
            <span
              className={`font-extrabold px-2.5 py-0.5 rounded-md ${
                margenPorcentaje >= 50
                  ? 'bg-emerald-200 text-emerald-900'
                  : margenPorcentaje > 0
                  ? 'bg-amber-200 text-amber-900'
                  : 'bg-rose-200 text-rose-900'
              }`}
            >
              Margen: {margenPorcentaje.toFixed(1)}%
            </span>
          </div>

          {/* Categorías (máximo 3) */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Tags className="w-3.5 h-3.5 text-rose-500" />
                <span>Categorías del Producto (Máximo 3)</span>
              </label>
              <span className={`text-[11px] font-bold ${categoriasSeleccionadas.length === 3 ? 'text-amber-600' : 'text-slate-400'}`}>
                {categoriasSeleccionadas.length}/3 seleccionadas
              </span>
            </div>

            {/* Pastillas de categorías seleccionadas */}
            <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-[#F8F9FA] rounded-xl border border-[#F0EBE3] items-center">
              {categoriasSeleccionadas.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 shadow-2xs"
                >
                  <span>{cat}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleCategoria(cat)}
                    className="hover:text-rose-900 ml-0.5 cursor-pointer text-rose-400 hover:bg-rose-200 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                    title={`Desvincular categoría ${cat}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              {categoriasSeleccionadas.length === 0 && (
                <span className="text-xs text-slate-400 italic">Sin categorías seleccionadas (haz clic abajo para elegir)</span>
              )}
            </div>

            {/* Selector de Categorías Disponibles */}
            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                <span>Seleccionar de la lista:</span>
                {!mostrarCrearInput && (
                  <button
                    type="button"
                    onClick={() => setMostrarCrearInput(true)}
                    className="text-rose-600 hover:text-rose-800 text-[11px] font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Crear nueva</span>
                  </button>
                )}
              </div>

              {/* Input para crear categoría rápida */}
              {mostrarCrearInput && (
                <div className="flex items-center gap-1.5 p-2 bg-rose-50/50 rounded-xl border border-rose-200">
                  <input
                    type="text"
                    value={nuevaCategoriaInput}
                    onChange={(e) => setNuevaCategoriaInput(e.target.value)}
                    placeholder="Nombre de nueva categoría..."
                    className="flex-1 px-2.5 py-1.5 bg-white border border-rose-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden"
                    maxLength={30}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCrearYNuevoSeleccionar(e);
                      }
                      if (e.key === 'Escape') setMostrarCrearInput(false);
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCrearYNuevoSeleccionar}
                    disabled={!nuevaCategoriaInput.trim()}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setMostrarCrearInput(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Pills para pulsar y alternar */}
              <div className="flex flex-wrap items-center gap-1.5 max-h-28 overflow-y-auto p-1">
                {categoriasDisponibles.map((cat) => {
                  const isSelected = categoriasSeleccionadas.includes(cat);
                  const isMax = categoriasSeleccionadas.length >= 3 && !isSelected;

                  return (
                    <button
                      key={cat}
                      type="button"
                      disabled={isMax}
                      onClick={() => handleToggleCategoria(cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-rose-500 text-white shadow-2xs font-bold'
                          : isMax
                          ? 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed'
                          : 'bg-white border border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-600'
                      }`}
                    >
                      {isSelected ? `✓ ${cat}` : `+ ${cat}`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-[#F0EBE3] hover:bg-slate-100 font-semibold text-slate-700 text-sm transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl bg-[#2196F3] hover:bg-[#1976D2] active:scale-98 text-white font-bold text-sm shadow-md shadow-blue-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Guardando...' : 'Guardar Producto'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
