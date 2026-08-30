import { Producto, EstadoCaja, Alerta, AppSettings } from '../types';
import { DENOMINACIONES_LIST, formatearEuros } from './cashUtils';

export function generarAlertasSistema(
  productos: Producto[],
  caja: EstadoCaja,
  settings: AppSettings
): Alerta[] {
  const alertas: Alerta[] = [];
  const umbralStock = settings.umbralStockBajo || 5;
  const umbralCaja = settings.umbralMonedasBajas || 5;

  // 1. Alertas de stock bajo o agotado
  productos.forEach((p) => {
    if (p.stock <= 0) {
      alertas.push({
        id: `stock-agotado-${p.id}`,
        tipo: 'stock_bajo',
        titulo: `Agotado: ${p.nombreCorto}`,
        descripcion: `No quedan unidades de "${p.nombreCorto}" en el stand. Conviene reponer si hay stock en almacén.`,
        gravedad: 'error',
        referenciaId: p.id,
        metadata: { stock: p.stock }
      });
    } else if (p.stock <= umbralStock) {
      alertas.push({
        id: `stock-bajo-${p.id}`,
        tipo: 'stock_bajo',
        titulo: `Stock bajo: ${p.nombreCorto}`,
        descripcion: `Quedan solo ${p.stock} unidades (umbral configurado: ${umbralStock}).`,
        gravedad: 'warning',
        referenciaId: p.id,
        metadata: { stock: p.stock }
      });
    }
  });

  // 2. Alertas de caja / monedas escasas
  DENOMINACIONES_LIST.forEach((d) => {
    const cantidad =
      d.tipo === 'billete'
        ? (caja.billetes as any)?.[d.key] || 0
        : (caja.monedas as any)?.[d.key] || 0;

    // Solo alertar para monedas frecuentes de cambio (1€, 2€, 50c, 20c, 10c, 5€)
    if (['m100', 'm200', 'm50', 'm20', 'b5'].includes(d.id)) {
      if (cantidad === 0) {
        alertas.push({
          id: `caja-vacia-${d.id}`,
          tipo: 'caja_baja',
          titulo: `Sin cambio de ${d.nombre}`,
          descripcion: `No quedan existencias de ${d.nombre} en caja. Podría dificultar la devolución de vueltas en efectivo.`,
          gravedad: 'error',
          metadata: { denominacion: d.nombre, cantidad: 0 }
        });
      } else if (cantidad <= umbralCaja) {
        alertas.push({
          id: `caja-baja-${d.id}`,
          tipo: 'caja_baja',
          titulo: `Pocas existencias de ${d.nombre}`,
          descripcion: `Quedan solo ${cantidad} ${d.tipo === 'billete' ? 'billetes' : 'monedas'} de ${d.nombre} en la caja.`,
          gravedad: 'warning',
          metadata: { denominacion: d.nombre, cantidad }
        });
      }
    }
  });

  // 3. Alertas de productos sin imagen o URL rota
  productos.forEach((p) => {
    if (!p.imagenUrl || p.imagenUrl.trim() === '') {
      alertas.push({
        id: `sin-imagen-${p.id}`,
        tipo: 'sin_imagen',
        titulo: `Sin imagen: ${p.nombreCorto}`,
        descripcion: `El producto no tiene configurada una URL de imagen de OneDrive ni portada.`,
        gravedad: 'info',
        referenciaId: p.id
      });
    }
  });

  // 4. Alertas de margen negativo o nulo
  productos.forEach((p) => {
    if (p.precioVenta <= p.precioCoste) {
      alertas.push({
        id: `margen-negativo-${p.id}`,
        tipo: 'margen_negativo',
        titulo: `Margen en pérdida: ${p.nombreCorto}`,
        descripcion: `El precio de venta (${formatearEuros(p.precioVenta)}) es menor o igual al coste (${formatearEuros(p.precioCoste)}).`,
        gravedad: 'error',
        referenciaId: p.id
      });
    }
  });

  return alertas;
}
