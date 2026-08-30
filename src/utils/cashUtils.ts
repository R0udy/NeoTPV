import {
  DenominacionesBilletes,
  DenominacionesMonedas,
  EstadoCaja,
  DesgloseEfectivo,
  ResultadoCalculoVueltas
} from '../types';

export interface DenominacionInfo {
  id: string;
  tipo: 'billete' | 'moneda';
  nombre: string;
  valorEuros: number;
  valorCentimos: number;
  key: keyof DenominacionesBilletes | keyof DenominacionesMonedas;
  colorClase: string;
  badgeClase: string;
}

export const DENOMINACIONES_LIST: DenominacionInfo[] = [
  // Billetes (50 €, 20 €, 10 €, 5 €) con colores oficiales de billetes de Euro
  { id: 'b50', tipo: 'billete', nombre: '50 €', valorEuros: 50, valorCentimos: 5000, key: 'b50', colorClase: 'bg-amber-100 border-amber-300 text-amber-900', badgeClase: 'bg-amber-50 text-amber-800 border-amber-200' },
  { id: 'b20', tipo: 'billete', nombre: '20 €', valorEuros: 20, valorCentimos: 2000, key: 'b20', colorClase: 'bg-sky-100 border-sky-300 text-sky-900', badgeClase: 'bg-sky-50 text-sky-800 border-sky-200' },
  { id: 'b10', tipo: 'billete', nombre: '10 €', valorEuros: 10, valorCentimos: 1000, key: 'b10', colorClase: 'bg-rose-100 border-rose-300 text-rose-900', badgeClase: 'bg-rose-50 text-rose-800 border-rose-200' },
  { id: 'b5',  tipo: 'billete', nombre: '5 €',  valorEuros: 5,  valorCentimos: 500,  key: 'b5',  colorClase: 'bg-emerald-100 border-emerald-300 text-emerald-900', badgeClase: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  
  // Monedas
  { id: 'm200', tipo: 'moneda', nombre: '2 €',   valorEuros: 2.00, valorCentimos: 200, key: 'm200', colorClase: 'bg-slate-100 border-amber-300 text-slate-800', badgeClase: 'bg-slate-50 text-slate-800 border-slate-300' },
  { id: 'm100', tipo: 'moneda', nombre: '1 €',   valorEuros: 1.00, valorCentimos: 100, key: 'm100', colorClase: 'bg-yellow-50 border-slate-300 text-slate-800', badgeClase: 'bg-yellow-50 text-slate-800 border-yellow-200' },
  { id: 'm50',  tipo: 'moneda', nombre: '50 c',  valorEuros: 0.50, valorCentimos: 50,  key: 'm50',  colorClase: 'bg-amber-50 border-amber-200 text-amber-900', badgeClase: 'bg-amber-100/70 text-amber-900 border-amber-300' },
  { id: 'm20',  tipo: 'moneda', nombre: '20 c',  valorEuros: 0.20, valorCentimos: 20,  key: 'm20',  colorClase: 'bg-orange-50 border-orange-200 text-orange-900', badgeClase: 'bg-orange-100/70 text-orange-900 border-orange-300' },
  { id: 'm10',  tipo: 'moneda', nombre: '10 c',  valorEuros: 0.10, valorCentimos: 10,  key: 'm10',  colorClase: 'bg-stone-100 border-stone-200 text-stone-800', badgeClase: 'bg-stone-50 text-stone-700 border-stone-200' },
  { id: 'm5',   tipo: 'moneda', nombre: '5 c',   valorEuros: 0.05, valorCentimos: 5,   key: 'm5',   colorClase: 'bg-orange-100/60 border-orange-300 text-orange-950', badgeClase: 'bg-orange-50 text-orange-900 border-orange-200' },
  { id: 'm2',   tipo: 'moneda', nombre: '2 c',   valorEuros: 0.02, valorCentimos: 2,   key: 'm2',   colorClase: 'bg-orange-100/40 border-orange-200 text-orange-900', badgeClase: 'bg-orange-50/70 text-orange-800 border-orange-200' },
  { id: 'm1',   tipo: 'moneda', nombre: '1 c',   valorEuros: 0.01, valorCentimos: 1,   key: 'm1',   colorClase: 'bg-orange-100/30 border-orange-200 text-orange-800', badgeClase: 'bg-orange-50/50 text-orange-800 border-orange-200' }
];

export const ESTADO_CAJA_INICIAL: EstadoCaja = {
  billetes: {
    b50: 1,  // 50 €
    b20: 3,  // 60 €
    b10: 6,  // 60 €
    b5: 8    // 40 €
  },
  monedas: {
    m200: 15, // 30 €
    m100: 25, // 25 €
    m50: 20,  // 10 €
    m20: 25,  // 5 €
    m10: 30,  // 3 €
    m5: 20,   // 1 €
    m2: 25,   // 0.50 €
    m1: 20    // 0.20 €
  },
  notas: 'Fondo de caja inicial para stand de evento'
};

export function formatearEuros(cantidad: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(cantidad);
}

export function calcularTotalCaja(estado: EstadoCaja): number {
  if (!estado) return 0;
  
  let totalCentimos = 0;
  
  if (estado.billetes) {
    totalCentimos += (estado.billetes.b50 || 0) * 5000;
    totalCentimos += (estado.billetes.b20 || 0) * 2000;
    totalCentimos += (estado.billetes.b10 || 0) * 1000;
    totalCentimos += (estado.billetes.b5 || 0) * 500;
  }
  
  if (estado.monedas) {
    totalCentimos += (estado.monedas.m200 || 0) * 200;
    totalCentimos += (estado.monedas.m100 || 0) * 100;
    totalCentimos += (estado.monedas.m50 || 0) * 50;
    totalCentimos += (estado.monedas.m20 || 0) * 20;
    totalCentimos += (estado.monedas.m10 || 0) * 10;
    totalCentimos += (estado.monedas.m5 || 0) * 5;
    totalCentimos += (estado.monedas.m2 || 0) * 2;
    totalCentimos += (estado.monedas.m1 || 0) * 1;
  }
  
  return totalCentimos / 100;
}

export function calcularTotalDesglose(desglose: DesgloseEfectivo | undefined): number {
  if (!desglose) return 0;
  let totalCentimos = 0;
  
  if (desglose.billetes) {
    totalCentimos += (desglose.billetes.b50 || 0) * 5000;
    totalCentimos += (desglose.billetes.b20 || 0) * 2000;
    totalCentimos += (desglose.billetes.b10 || 0) * 1000;
    totalCentimos += (desglose.billetes.b5 || 0) * 500;
  }
  
  if (desglose.monedas) {
    totalCentimos += (desglose.monedas.m200 || 0) * 200;
    totalCentimos += (desglose.monedas.m100 || 0) * 100;
    totalCentimos += (desglose.monedas.m50 || 0) * 50;
    totalCentimos += (desglose.monedas.m20 || 0) * 20;
    totalCentimos += (desglose.monedas.m10 || 0) * 10;
    totalCentimos += (desglose.monedas.m5 || 0) * 5;
    totalCentimos += (desglose.monedas.m2 || 0) * 2;
    totalCentimos += (desglose.monedas.m1 || 0) * 1;
  }
  
  return totalCentimos / 100;
}

/**
 * Algoritmo inteligente para calcular las vueltas exactas
 * Respetando las existencias actuales de la caja y priorizando conservar denominaciones escasas.
 */
export function calcularVueltas(
  importeCambio: number,
  estadoCaja: EstadoCaja
): ResultadoCalculoVueltas {
  const cambioCentimos = Math.round(importeCambio * 100);

  if (cambioCentimos <= 0) {
    return {
      posible: true,
      importeCambio: 0,
      desglose: { billetes: {}, monedas: {}, total: 0 },
      faltante: 0
    };
  }

  // Stock disponible por denominación
  const stockDisponible: Record<string, number> = {
    b50: estadoCaja.billetes?.b50 || 0,
    b20: estadoCaja.billetes?.b20 || 0,
    b10: estadoCaja.billetes?.b10 || 0,
    b5: estadoCaja.billetes?.b5 || 0,
    m200: estadoCaja.monedas?.m200 || 0,
    m100: estadoCaja.monedas?.m100 || 0,
    m50: estadoCaja.monedas?.m50 || 0,
    m20: estadoCaja.monedas?.m20 || 0,
    m10: estadoCaja.monedas?.m10 || 0,
    m5: estadoCaja.monedas?.m5 || 0,
    m2: estadoCaja.monedas?.m2 || 0,
    m1: estadoCaja.monedas?.m1 || 0,
  };

  // Identificar denominaciones escasas (menos de 5 unidades se consideran críticas/escasas)
  // Intentamos primero una búsqueda de cambio estándar greedy con penalización de escasez
  const resultado = buscarCambioOptimo(cambioCentimos, stockDisponible);

  if (resultado.exito) {
    const desglose: DesgloseEfectivo = {
      billetes: {
        b50: resultado.usados.b50 || 0,
        b20: resultado.usados.b20 || 0,
        b10: resultado.usados.b10 || 0,
        b5: resultado.usados.b5 || 0
      },
      monedas: {
        m200: resultado.usados.m200 || 0,
        m100: resultado.usados.m100 || 0,
        m50: resultado.usados.m50 || 0,
        m20: resultado.usados.m20 || 0,
        m10: resultado.usados.m10 || 0,
        m5: resultado.usados.m5 || 0,
        m2: resultado.usados.m2 || 0,
        m1: resultado.usados.m1 || 0
      },
      total: importeCambio
    };

    return {
      posible: true,
      importeCambio,
      desglose,
      faltante: 0
    };
  } else {
    // Si no es posible dar el cambio exacto, calcular cuánto se pudo armar
    const entregableCentimos = resultado.totalAlcanzado;
    const faltanteCentimos = cambioCentimos - entregableCentimos;

    const desgloseIncompleto: DesgloseEfectivo = {
      billetes: {
        b50: resultado.usados.b50 || 0,
        b20: resultado.usados.b20 || 0,
        b10: resultado.usados.b10 || 0,
        b5: resultado.usados.b5 || 0
      },
      monedas: {
        m200: resultado.usados.m200 || 0,
        m100: resultado.usados.m100 || 0,
        m50: resultado.usados.m50 || 0,
        m20: resultado.usados.m20 || 0,
        m10: resultado.usados.m10 || 0,
        m5: resultado.usados.m5 || 0,
        m2: resultado.usados.m2 || 0,
        m1: resultado.usados.m1 || 0
      },
      total: entregableCentimos / 100
    };

    return {
      posible: false,
      importeCambio,
      desglose: desgloseIncompleto,
      faltante: faltanteCentimos / 100,
      mensaje: `No hay suficiente cambio en caja. Faltan ${formatearEuros(faltanteCentimos / 100)} para completar las vueltas exactas.`
    };
  }
}

interface ResultadoBusqueda {
  exito: boolean;
  usados: Record<string, number>;
  totalAlcanzado: number;
}

function buscarCambioOptimo(
  objetivoCentimos: number,
  stockOriginal: Record<string, number>
): ResultadoBusqueda {
  // Orden de evaluación:
  // Si una denominación tiene stock muy bajo (≤ 3), intentamos priorizar alternativas cuando sea factible
  // Probamos primero con una estrategia que evita agotar denominaciones escasas
  
  const intento1 = intentarCambio(objetivoCentimos, stockOriginal, true);
  if (intento1.exito) return intento1;

  // Si no fue posible reservando las escasas, usamos todo el stock disponible sin restricciones
  const intento2 = intentarCambio(objetivoCentimos, stockOriginal, false);
  return intento2;
}

function intentarCambio(
  objetivoCentimos: number,
  stock: Record<string, number>,
  preservarEscasas: boolean
): ResultadoBusqueda {
  let restante = objetivoCentimos;
  const usados: Record<string, number> = {};
  const copiaStock = { ...stock };

  for (const denom of DENOMINACIONES_LIST) {
    if (restante <= 0) break;
    const valor = denom.valorCentimos;
    if (valor > restante) continue;

    let disponible = copiaStock[denom.id] || 0;

    // Si preservamos escasas y queda muy poco de esta moneda/billete (≤ 2), dejamos un colchón si no es estrictamente la única opción
    if (preservarEscasas && disponible <= 2 && valor >= 50) {
      disponible = Math.max(0, disponible - 1);
    }

    if (disponible <= 0) continue;

    const necesarios = Math.floor(restante / valor);
    const aUsar = Math.min(necesarios, disponible);

    if (aUsar > 0) {
      usados[denom.id] = aUsar;
      copiaStock[denom.id] -= aUsar;
      restante -= aUsar * valor;
    }
  }

  const totalAlcanzado = objetivoCentimos - restante;
  return {
    exito: restante === 0,
    usados,
    totalAlcanzado
  };
}

/**
 * Aplica el efecto de una venta en efectivo sobre el estado de la caja:
 * Suma el efectivo entrante y resta las vueltas entregadas.
 */
export function aplicarEfectivoACaja(
  cajaActual: EstadoCaja,
  entrante?: DesgloseEfectivo,
  vueltas?: DesgloseEfectivo
): EstadoCaja {
  const nuevaCaja: EstadoCaja = {
    billetes: {
      b50: Math.max(0, (cajaActual.billetes?.b50 || 0) + (entrante?.billetes?.b50 || 0) - (vueltas?.billetes?.b50 || 0)),
      b20: Math.max(0, (cajaActual.billetes?.b20 || 0) + (entrante?.billetes?.b20 || 0) - (vueltas?.billetes?.b20 || 0)),
      b10: Math.max(0, (cajaActual.billetes?.b10 || 0) + (entrante?.billetes?.b10 || 0) - (vueltas?.billetes?.b10 || 0)),
      b5:  Math.max(0, (cajaActual.billetes?.b5  || 0) + (entrante?.billetes?.b5  || 0) - (vueltas?.billetes?.b5  || 0))
    },
    monedas: {
      m200: Math.max(0, (cajaActual.monedas?.m200 || 0) + (entrante?.monedas?.m200 || 0) - (vueltas?.monedas?.m200 || 0)),
      m100: Math.max(0, (cajaActual.monedas?.m100 || 0) + (entrante?.monedas?.m100 || 0) - (vueltas?.monedas?.m100 || 0)),
      m50:  Math.max(0, (cajaActual.monedas?.m50  || 0) + (entrante?.monedas?.m50  || 0) - (vueltas?.monedas?.m50  || 0)),
      m20:  Math.max(0, (cajaActual.monedas?.m20  || 0) + (entrante?.monedas?.m20  || 0) - (vueltas?.monedas?.m20  || 0)),
      m10:  Math.max(0, (cajaActual.monedas?.m10  || 0) + (entrante?.monedas?.m10  || 0) - (vueltas?.monedas?.m10  || 0)),
      m5:   Math.max(0, (cajaActual.monedas?.m5   || 0) + (entrante?.monedas?.m5   || 0) - (vueltas?.monedas?.m5   || 0)),
      m2:   Math.max(0, (cajaActual.monedas?.m2   || 0) + (entrante?.monedas?.m2   || 0) - (vueltas?.monedas?.m2   || 0)),
      m1:   Math.max(0, (cajaActual.monedas?.m1   || 0) + (entrante?.monedas?.m1   || 0) - (vueltas?.monedas?.m1   || 0))
    },
    ultimaActualizacion: new Date().toISOString()
  };

  return nuevaCaja;
}

/**
 * Reversión de efectivo (para devoluciones de ventas en efectivo)
 */
export function revertirEfectivoDeCaja(
  cajaActual: EstadoCaja,
  entrante?: DesgloseEfectivo,
  vueltas?: DesgloseEfectivo
): EstadoCaja {
  // En una devolución: devolvemos al cliente lo que pagó neto (entrante - vueltas)
  // O revertimos exactamente las denominaciones si es posible
  const nuevaCaja: EstadoCaja = {
    billetes: {
      b50: Math.max(0, (cajaActual.billetes?.b50 || 0) - (entrante?.billetes?.b50 || 0) + (vueltas?.billetes?.b50 || 0)),
      b20: Math.max(0, (cajaActual.billetes?.b20 || 0) - (entrante?.billetes?.b20 || 0) + (vueltas?.billetes?.b20 || 0)),
      b10: Math.max(0, (cajaActual.billetes?.b10 || 0) - (entrante?.billetes?.b10 || 0) + (vueltas?.billetes?.b10 || 0)),
      b5:  Math.max(0, (cajaActual.billetes?.b5  || 0) - (entrante?.billetes?.b5  || 0) + (vueltas?.billetes?.b5  || 0))
    },
    monedas: {
      m200: Math.max(0, (cajaActual.monedas?.m200 || 0) - (entrante?.monedas?.m200 || 0) + (vueltas?.monedas?.m200 || 0)),
      m100: Math.max(0, (cajaActual.monedas?.m100 || 0) - (entrante?.monedas?.m100 || 0) + (vueltas?.monedas?.m100 || 0)),
      m50:  Math.max(0, (cajaActual.monedas?.m50  || 0) - (entrante?.monedas?.m50  || 0) + (vueltas?.monedas?.m50  || 0)),
      m20:  Math.max(0, (cajaActual.monedas?.m20  || 0) - (entrante?.monedas?.m20  || 0) + (vueltas?.monedas?.m20  || 0)),
      m10:  Math.max(0, (cajaActual.monedas?.m10  || 0) - (entrante?.monedas?.m10  || 0) + (vueltas?.monedas?.m10  || 0)),
      m5:   Math.max(0, (cajaActual.monedas?.m5   || 0) - (entrante?.monedas?.m5   || 0) + (vueltas?.monedas?.m5   || 0)),
      m2:   Math.max(0, (cajaActual.monedas?.m2   || 0) - (entrante?.monedas?.m2   || 0) + (vueltas?.monedas?.m2   || 0)),
      m1:   Math.max(0, (cajaActual.monedas?.m1   || 0) - (entrante?.monedas?.m1   || 0) + (vueltas?.monedas?.m1   || 0))
    },
    ultimaActualizacion: new Date().toISOString()
  };

  return nuevaCaja;
}
