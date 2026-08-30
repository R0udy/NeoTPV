import React, { useState, useEffect } from 'react';
import { Producto } from '../../types';
import { useDataStore } from '../../store/useDataStore';
import { formatImageUrl } from '../../config/onedriveConfig';
import { formatearEuros } from '../../utils/cashUtils';
import { X, Save, Sparkles, Image as ImageIcon, Tag, Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductFormModalProps {
  productoEditar?: Producto | null;
  isOpen: boolean;
  onClose: () => void;
}

const ETIQUETAS_SUGERIDAS = [
  'Joyería',
  'Anime',
  'K-Pop',
  'Merch',
  'Pins',
  'Llaveros',
  'Gótico',
  'Japón',
  'Gaming',
  'Fantasía',
  'Naruto',
  'Ghibli'
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  productoEditar,
  isOpen,
  onClose
}) => {
  const { guardarProducto } = useDataStore();

  const [nombreCorto, setNombreCorto] = useState('');
  const [nombreLargo, setNombreLargo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [precioCoste, setPrecioCoste] = useState<number | string>(2.5);
  const [precioVenta, setPrecioVenta] = useState<number | string>(10.0);
  const [stock, setStock] = useState<number | string>(10);
  const [etiquetas, setEtiquetas] = useState<string[]>(['Joyería']);
  const [nuevaEtiquetaInput, setNuevaEtiquetaInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (productoEditar) {
      setNombreCorto(productoEditar.nombreCorto);
      setNombreLargo(productoEditar.nombreLargo);
      setDescripcion(productoEditar.descripcion || '');
      setImagenUrl(productoEditar.imagenUrl || '');
      setPrecioCoste(productoEditar.precioCoste);
      setPrecioVenta(productoEditar.precioVenta);
      setStock(productoEditar.stock);
      setEtiquetas(productoEditar.etiquetas || []);
    } else {
      setNombreCorto('');
      setNombreLargo('');
      setDescripcion('');
      setImagenUrl('');
      setPrecioCoste(2.5);
      setPrecioVenta(9.0);
      setStock(12);
      setEtiquetas(['Joyería', 'Anime']);
    }
  }, [productoEditar, isOpen]);

  const pCosteNum = typeof precioCoste === 'number' ? precioCoste : parseFloat(precioCoste) || 0;
  const pVentaNum = typeof precioVenta === 'number' ? precioVenta : parseFloat(precioVenta) || 0;
  const beneficioUnitario = pVentaNum - pCosteNum;
  const margenPorcentaje = pVentaNum > 0 ? (beneficioUnitario / pVentaNum) * 100 : 0;

  const handleAddEtiqueta = (tag: string) => {
    const clean = tag.trim();
    if (!clean) return;
    if (etiquetas.includes(clean)) return;
    if (etiquetas.length >= 3) return; // Máximo 3 etiquetas
    setEtiquetas([...etiquetas, clean]);
    setNuevaEtiquetaInput('');
  };

  const handleRemoveEtiqueta = (tagToRemove: string) => {
    setEtiquetas(etiquetas.filter((t) => t !== tagToRemove));
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
      etiquetas: etiquetas.slice(0, 3)
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
          
          {/* Vista previa de imagen + URL de OneDrive */}
          <div className="flex flex-col sm:flex-row items-start gap-4 p-3.5 bg-[#F8F9FA] rounded-2xl border border-[#F0EBE3]">
            <div className="w-20 h-20 rounded-xl bg-slate-200 border border-[#F0EBE3] overflow-hidden shrink-0 mx-auto sm:mx-0 flex items-center justify-center">
              {imagenUrl ? (
                <img
                  src={formatImageUrl(imagenUrl)}
                  alt="Vista previa"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=150&q=80';
                  }}
                />
              ) : (
                <ImageIcon className="w-8 h-8 text-slate-400" />
              )}
            </div>

            <div className="flex-1 w-full space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                URL de Imagen (OneDrive / Enlace Web)
              </label>
              <input
                type="url"
                value={imagenUrl}
                onChange={(e) => setImagenUrl(e.target.value)}
                placeholder="https://1drv.ms/u/... o https://images..."
                className="w-full px-3 py-2 bg-white border border-[#F0EBE3] rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-400 focus:outline-hidden"
              />
              <p className="text-[10px] text-slate-400 font-medium">
                Introduce el enlace compartido de OneDrive. Si está vacío se asignará un placeholder temático.
              </p>
            </div>
          </div>

          {/* Nombre Corto y Nombre Largo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre Corto (Botón TPV) *
              </label>
              <input
                type="text"
                required
                value={nombreCorto}
                onChange={(e) => setNombreCorto(e.target.value)}
                placeholder="ej. Pendientes Sakura"
                className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-[#F0EBE3] rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre Largo / Detallado
              </label>
              <input
                type="text"
                value={nombreLargo}
                onChange={(e) => setNombreLargo(e.target.value)}
                placeholder="ej. Pendientes de Flor Sakura en Plata 925"
                className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-[#F0EBE3] rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Descripción del Producto
            </label>
            <textarea
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Materiales, detalles de acabado, talla o curiosidades para el comprador..."
              className="w-full px-3.5 py-2 bg-[#F8F9FA] border border-[#F0EBE3] rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:outline-hidden resize-none"
            />
          </div>

          {/* Precios, Margen y Stock */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Precio Coste (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={precioCoste}
                onChange={(e) => setPrecioCoste(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#F0EBE3] rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:outline-hidden text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1976D2] mb-1">
                Precio Venta (€) *
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

          {/* Etiquetas (máximo 3) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700">
                Etiquetas / Categorías (Máximo 3)
              </label>
              <span className="text-[11px] text-slate-400 font-medium">{etiquetas.length}/3 seleccionadas</span>
            </div>

            {/* Etiquetas activas */}
            <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-[#F8F9FA] rounded-xl border border-[#F0EBE3]">
              {etiquetas.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#E3F2FD] text-[#1976D2] text-xs font-bold border border-blue-200"
                >
                  <Tag className="w-3 h-3" />
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveEtiqueta(t)}
                    className="hover:text-rose-600 ml-0.5 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
              {etiquetas.length === 0 && (
                <span className="text-xs text-slate-400 italic">Sin etiquetas seleccionadas</span>
              )}
            </div>

            {/* Sugerencias rápidas */}
            {etiquetas.length < 3 && (
              <div className="flex flex-wrap items-center gap-1 pt-1">
                <span className="text-[10px] font-semibold text-slate-400 mr-1">Sugeridas:</span>
                {ETIQUETAS_SUGERIDAS.filter((s) => !etiquetas.includes(s)).slice(0, 7).map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => handleAddEtiqueta(sug)}
                    className="px-2 py-0.5 rounded-md bg-white border border-[#F0EBE3] hover:bg-[#E3F2FD] hover:text-[#1976D2] text-[11px] font-medium text-slate-600 transition-colors cursor-pointer"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            )}
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
