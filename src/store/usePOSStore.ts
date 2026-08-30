import { create } from 'zustand';
import { Producto, TicketLinea } from '../types';

interface POSState {
  lineas: TicketLinea[];
  descuentoGlobal: number; // Porcentaje de descuento (0 - 100)
  isCheckoutOpen: boolean;
  notaTicket: string;

  // Acciones
  agregarProducto: (producto: Producto) => void;
  modificarCantidad: (productId: string, cantidad: number) => void;
  incrementarCantidad: (productId: string) => void;
  decrementarCantidad: (productId: string) => void;
  eliminarLinea: (productId: string) => void;
  setDescuentoGlobal: (descuento: number) => void;
  setNotaTicket: (nota: string) => void;
  limpiarTicket: () => void;
  setCheckoutOpen: (open: boolean) => void;

  // Selectores calculados
  calcularSubtotal: () => number;
  calcularDescuentoTotal: () => number;
  calcularTotal: () => number;
  calcularTotalUnidades: () => number;
}

export const usePOSStore = create<POSState>((set, get) => ({
  lineas: [],
  descuentoGlobal: 0,
  isCheckoutOpen: false,
  notaTicket: '',

  agregarProducto: (producto: Producto) => {
    const { lineas } = get();
    const index = lineas.findIndex((l) => l.producto.id === producto.id);

    if (index >= 0) {
      const nuevasLineas = [...lineas];
      nuevasLineas[index] = {
        ...nuevasLineas[index],
        cantidad: nuevasLineas[index].cantidad + 1
      };
      set({ lineas: nuevasLineas });
    } else {
      const nuevaLinea: TicketLinea = {
        producto,
        cantidad: 1,
        precioUnitario: producto.precioVenta
      };
      set({ lineas: [...lineas, nuevaLinea] });
    }
  },

  modificarCantidad: (productId: string, cantidad: number) => {
    const { lineas } = get();
    if (cantidad <= 0) {
      set({ lineas: lineas.filter((l) => l.producto.id !== productId) });
      return;
    }

    const nuevasLineas = lineas.map((l) => {
      if (l.producto.id === productId) {
        return { ...l, cantidad };
      }
      return l;
    });
    set({ lineas: nuevasLineas });
  },

  incrementarCantidad: (productId: string) => {
    const { lineas } = get();
    const item = lineas.find((l) => l.producto.id === productId);
    if (item) {
      get().modificarCantidad(productId, item.cantidad + 1);
    }
  },

  decrementarCantidad: (productId: string) => {
    const { lineas } = get();
    const item = lineas.find((l) => l.producto.id === productId);
    if (item) {
      get().modificarCantidad(productId, item.cantidad - 1);
    }
  },

  eliminarLinea: (productId: string) => {
    const { lineas } = get();
    set({ lineas: lineas.filter((l) => l.producto.id !== productId) });
  },

  setDescuentoGlobal: (descuento: number) => {
    set({ descuentoGlobal: Math.max(0, Math.min(100, descuento)) });
  },

  setNotaTicket: (nota: string) => {
    set({ notaTicket: nota });
  },

  limpiarTicket: () => {
    set({
      lineas: [],
      descuentoGlobal: 0,
      isCheckoutOpen: false,
      notaTicket: ''
    });
  },

  setCheckoutOpen: (open: boolean) => {
    set({ isCheckoutOpen: open });
  },

  calcularSubtotal: () => {
    const { lineas } = get();
    return lineas.reduce((acc, l) => acc + l.cantidad * l.precioUnitario, 0);
  },

  calcularDescuentoTotal: () => {
    const { descuentoGlobal } = get();
    const subtotal = get().calcularSubtotal();
    if (descuentoGlobal <= 0) return 0;
    return (subtotal * descuentoGlobal) / 100;
  },

  calcularTotal: () => {
    const subtotal = get().calcularSubtotal();
    const descuento = get().calcularDescuentoTotal();
    return Math.max(0, subtotal - descuento);
  },

  calcularTotalUnidades: () => {
    const { lineas } = get();
    return lineas.reduce((acc, l) => acc + l.cantidad, 0);
  }
}));
