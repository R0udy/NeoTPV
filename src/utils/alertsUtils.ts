import { Producto, EstadoCaja, Alerta, AppSettings } from '../types';
import { DENOMINACIONES_LIST, formatearEuros } from './cashUtils';

export function generarAlertasSistema(
  productos: Producto[],
  caja: EstadoCaja | null | undefined,
  settings: AppSettings
): Alerta[] {
  const alertas: Alerta[] = [];
  const umbralStock = settings.umbralStockBajo || 5;
  const umbralCaja = settings.umbralMonedasBajas || 5;

  // 1. Alertas de Stock General (Crítico o Agotado)
  productos.forEach((prod) => {
    if (prod.stock <= 0) {
      alertas.push({
        id: `stock-agotado-${prod.id}`,
        tipo: 'stock_bajo',
        titulo: `Stock Agotado: ${prod.nombreCorto}`,
        descripcion: `El producto ${prod.nombreCorto} no tiene existencias en el inventario general.`,
        gravedad: 'error',
        referenciaId: prod.id,
        metadata: { stock: 0 }
      });
    } else if (prod.stock <= umbralStock) {
      alertas.push({
        id: `stock-bajo-${prod.id}`,
        tipo: 'stock_bajo',
        titulo: `Stock Bajo: ${prod.nombreCorto}`,
        descripcion: `Quedan únicamente ${prod.stock} unidades en el inventario general (Umbral: ${umbralStock}).`,
        gravedad: 'warning',
        referenciaId: prod.id,
        metadata: { stock: prod.stock }
      });
    }
  });

  // 2. Alertas de Caja y Cambio (solo si hay caja disponible)
  if (caja) {
    DENOMINACIONES_LIST.forEach((d) => {
      let cantidad = 0;
      if (d.tipo === 'billete' && caja.billetes) {
        cantidad = (caja.billetes as any)[d.key] || 0;
      } else if (d.tipo === 'moneda' && caja.monedas) {
        cantidad = (caja.monedas as any)[d.key] || 0;
      }

      // Solo avisar de monedas y billetes pequeños (≤ 10€)
      if (d.valorCentimos <= 1000) {
        if (cantidad === 0) {
          alertas.push({
            id: `caja-vacia-${d.id}`,
            tipo: 'caja_baja',
            titulo: `Sin cambio de ${d.nombre}`,
            descripcion: `No quedan existencias de ${d.nombre} en la caja del evento. Podría dificultar la devolución de vueltas.`,
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
  }

  // 3. Alertas de productos sin imagen o URL rota
  productos.forEach((p) => {
    if (!p.imagenUrl || p.imagenUrl.trim() === '') {
      alertas.push({
        id: `sin-imagen-${p.id}`,
        tipo: 'sin_imagen',
        titulo: `Sin imagen: ${p.nombreCorto}`,
        descripcion: `El producto no tiene configurada una URL de imagen ni portada.`,
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
