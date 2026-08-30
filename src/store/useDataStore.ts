import { create } from 'zustand';
import {
  Producto,
  Venta,
  EstadoCaja,
  AppSettings,
  Alerta,
  MetodoPago,
  DesgloseEfectivo,
  TicketLinea
} from '../types';
import {
  getDataProvider,
  isMockDataEnabled,
  setMockDataEnabled,
  invalidateDataProvider
} from '../data/dataProviderRegistry';
import { generarAlertasSistema } from '../utils/alertsUtils';
import {
  ESTADO_CAJA_INICIAL,
  aplicarEfectivoACaja,
  revertirEfectivoDeCaja
} from '../utils/cashUtils';
import { INITIAL_SETTINGS } from '../data/mockSeedData';

export type CriterioOrden = 'nombre' | 'precio_asc' | 'precio_desc' | 'stock_asc' | 'stock_desc';

export interface ToastInfo {
  id: string;
  texto: string;
  tipo: 'success' | 'info' | 'warning' | 'error';
}

interface DataState {
  productos: Producto[];
  ventas: Venta[];
  caja: EstadoCaja;
  settings: AppSettings;
  alertas: Alerta[];
  isMockActive: boolean;

  // Filtros de búsqueda e inventario
  busqueda: string;
  filtroEtiqueta: string | null;
  orden: CriterioOrden;

  // Estados de carga y feedback
  cargando: boolean;
  toasts: ToastInfo[];

  // Acciones
  cargarTodo: () => Promise<void>;
  setBusqueda: (texto: string) => void;
  setFiltroEtiqueta: (etiqueta: string | null) => void;
  setOrden: (orden: CriterioOrden) => void;
  
  // Productos
  guardarProducto: (producto: Producto) => Promise<void>;
  eliminarProducto: (productId: string) => Promise<void>;

  // Ventas & Checkout
  procesarCobro: (params: {
    lineasTicket: TicketLinea[];
    metodoPago: MetodoPago;
    efectivoEntrante?: DesgloseEfectivo;
    vueltas?: DesgloseEfectivo;
    total: number;
    nota?: string;
  }) => Promise<Venta>;

  devolverVenta: (ventaId: string, motivo?: string) => Promise<void>;
  modificarVenta: (ventaActualizada: Venta, motivo?: string) => Promise<void>;

  // Caja
  actualizarCaja: (nuevaCaja: EstadoCaja) => Promise<void>;

  // Configuración & Mock
  actualizarSettings: (nuevosSettings: AppSettings) => Promise<void>;
  setMockMode: (enabled: boolean) => Promise<void>;
  reiniciarDatosMock: () => Promise<void>;

  // Toasts
  mostrarToast: (texto: string, tipo?: 'success' | 'info' | 'warning' | 'error') => void;
  removerToast: (id: string) => void;
}

export const useDataStore = create<DataState>((set, get) => ({
  productos: [],
  ventas: [],
  caja: ESTADO_CAJA_INICIAL,
  settings: INITIAL_SETTINGS,
  alertas: [],
  isMockActive: isMockDataEnabled(),

  busqueda: '',
  filtroEtiqueta: null,
  orden: 'nombre',

  cargando: false,
  toasts: [],

  mostrarToast: (texto, tipo = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, texto, tipo }]
    }));

    setTimeout(() => {
      get().removerToast(id);
    }, 4000);
  },

  removerToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  },

  setBusqueda: (texto) => set({ busqueda: texto }),
  setFiltroEtiqueta: (etiqueta) => set({ filtroEtiqueta: etiqueta }),
  setOrden: (orden) => set({ orden }),

  cargarTodo: async () => {
    set({ cargando: true });
    try {
      const provider = getDataProvider();
      const [productos, ventas, caja, settings] = await Promise.all([
        provider.getProducts(),
        provider.getSales(),
        provider.getCashState(),
        provider.getSettings()
      ]);

      const alertas = generarAlertasSistema(productos, caja, settings);

      set({
        productos,
        ventas,
        caja,
        settings,
        alertas,
        isMockActive: isMockDataEnabled(),
        cargando: false
      });
    } catch (error) {
      console.error('Error cargando datos del proveedor:', error);
      get().mostrarToast('Error al conectar con la base de datos', 'error');
      set({ cargando: false });
    }
  },

  guardarProducto: async (producto: Producto) => {
    try {
      const provider = getDataProvider();
      await provider.saveProduct(producto);

      const productosActualizados = await provider.getProducts();
      const caja = get().caja;
      const settings = get().settings;
      const alertas = generarAlertasSistema(productosActualizados, caja, settings);

      set({ productos: productosActualizados, alertas });
      get().mostrarToast(`Producto "${producto.nombreCorto}" guardado correctamente`, 'success');
    } catch (error) {
      console.error('Error guardando producto:', error);
      get().mostrarToast('Error al guardar el producto', 'error');
    }
  },

  eliminarProducto: async (productId: string) => {
    try {
      const provider = getDataProvider();
      await provider.deleteProduct(productId);

      const productosActualizados = await provider.getProducts();
      const caja = get().caja;
      const settings = get().settings;
      const alertas = generarAlertasSistema(productosActualizados, caja, settings);

      set({ productos: productosActualizados, alertas });
      get().mostrarToast('Producto eliminado del inventario', 'info');
    } catch (error) {
      console.error('Error eliminando producto:', error);
      get().mostrarToast('Error al eliminar el producto', 'error');
    }
  },

  procesarCobro: async ({
    lineasTicket,
    metodoPago,
    efectivoEntrante,
    vueltas,
    total,
    nota
  }) => {
    const provider = getDataProvider();
    const now = new Date();
    const fecha = now.toISOString().split('T')[0];
    const hora = now.toTimeString().split(' ')[0];
    const ventaId = `ven-${Date.now()}`;

    // 1. Crear el objeto de venta
    const nuevaVenta: Venta = {
      id: ventaId,
      lineas: lineasTicket.map((l) => ({
        productId: l.producto.id,
        nombreCorto: l.producto.nombreCorto,
        cantidad: l.cantidad,
        precioUnitario: l.precioUnitario,
        precioCoste: l.producto.precioCoste
      })),
      total,
      metodoPago,
      efectivoEntrante: metodoPago === 'efectivo' ? efectivoEntrante : undefined,
      vueltas: metodoPago === 'efectivo' ? vueltas : undefined,
      fecha,
      hora,
      timestamp: now.getTime(),
      estado: 'registrada',
      evento: get().settings.nombreEvento || 'Stand Evento'
    };

    // 2. Guardar venta
    await provider.saveSale(nuevaVenta);

    // 3. Descontar stock de los productos vendidos
    const productosActuales = [...get().productos];
    for (const linea of lineasTicket) {
      const prodIndex = productosActuales.findIndex((p) => p.id === linea.producto.id);
      if (prodIndex >= 0) {
        const prod = productosActuales[prodIndex];
        const nuevoStock = Math.max(0, prod.stock - linea.cantidad);
        const productoActualizado = { ...prod, stock: nuevoStock };
        await provider.saveProduct(productoActualizado);
        productosActuales[prodIndex] = productoActualizado;
      }
    }

    // 4. Si fue efectivo, actualizar la caja sumando entrante y restando vueltas
    let cajaActualizada = get().caja;
    if (metodoPago === 'efectivo' && efectivoEntrante) {
      cajaActualizada = aplicarEfectivoACaja(cajaActualizada, efectivoEntrante, vueltas);
      await provider.saveCashState(cajaActualizada);
    }

    // 5. Refrescar estado global
    const ventasActualizadas = await provider.getSales();
    const alertas = generarAlertasSistema(productosActuales, cajaActualizada, get().settings);

    set({
      productos: productosActuales,
      ventas: ventasActualizadas,
      caja: cajaActualizada,
      alertas
    });

    return nuevaVenta;
  },

  devolverVenta: async (ventaId: string, motivo = 'Devolución de cliente') => {
    try {
      const provider = getDataProvider();
      const ventas = get().ventas;
      const venta = ventas.find((v) => v.id === ventaId);

      if (!venta) {
        throw new Error('Venta no encontrada');
      }

      if (venta.estado === 'devuelta') {
        get().mostrarToast('Esta venta ya fue devuelta previamente', 'warning');
        return;
      }

      // 1. Marcar venta como devuelta
      const ventaModificada: Venta = {
        ...venta,
        estado: 'devuelta',
        motivoDevolucion: motivo
      };
      await provider.updateSale(ventaModificada);

      // 2. Revertir stock de los productos (incrementar stock devuelto)
      const productosActuales = [...get().productos];
      for (const linea of venta.lineas) {
        const prodIndex = productosActuales.findIndex((p) => p.id === linea.productId);
        if (prodIndex >= 0) {
          const prod = productosActuales[prodIndex];
          const nuevoStock = prod.stock + linea.cantidad;
          const productoActualizado = { ...prod, stock: nuevoStock };
          await provider.saveProduct(productoActualizado);
          productosActuales[prodIndex] = productoActualizado;
        }
      }

      // 3. Si fue pago en efectivo, revertir el dinero en caja
      let cajaActualizada = get().caja;
      if (venta.metodoPago === 'efectivo' && venta.efectivoEntrante) {
        cajaActualizada = revertirEfectivoDeCaja(
          cajaActualizada,
          venta.efectivoEntrante,
          venta.vueltas
        );
        await provider.saveCashState(cajaActualizada);
      }

      // 4. Refrescar datos
      const ventasActualizadas = await provider.getSales();
      const alertas = generarAlertasSistema(productosActuales, cajaActualizada, get().settings);

      set({
        productos: productosActuales,
        ventas: ventasActualizadas,
        caja: cajaActualizada,
        alertas
      });

      get().mostrarToast(`Venta #${venta.id.slice(-4)} devuelta con éxito`, 'success');
    } catch (error) {
      console.error('Error al devolver la venta:', error);
      get().mostrarToast('Error al procesar la devolución', 'error');
    }
  },

  modificarVenta: async (ventaActualizada: Venta, motivo?: string) => {
    try {
      const provider = getDataProvider();
      const ventaConEstado: Venta = {
        ...ventaActualizada,
        estado: 'modificada',
        motivoDevolucion: motivo || ventaActualizada.motivoDevolucion
      };
      await provider.updateSale(ventaConEstado);

      const ventasActualizadas = await provider.getSales();
      set({ ventas: ventasActualizadas });
      get().mostrarToast(`Venta #${ventaActualizada.id.slice(-4)} modificada`, 'success');
    } catch (error) {
      console.error('Error al modificar la venta:', error);
      get().mostrarToast('Error al modificar la venta', 'error');
    }
  },

  actualizarCaja: async (nuevaCaja: EstadoCaja) => {
    try {
      const provider = getDataProvider();
      await provider.saveCashState(nuevaCaja);
      const alertas = generarAlertasSistema(get().productos, nuevaCaja, get().settings);

      set({ caja: nuevaCaja, alertas });
      get().mostrarToast('Arqueo de caja actualizado', 'success');
    } catch (error) {
      console.error('Error actualizando caja:', error);
      get().mostrarToast('Error al actualizar la caja', 'error');
    }
  },

  actualizarSettings: async (nuevosSettings: AppSettings) => {
    try {
      const provider = getDataProvider();
      await provider.saveSettings(nuevosSettings);
      const alertas = generarAlertasSistema(get().productos, get().caja, nuevosSettings);

      set({ settings: nuevosSettings, alertas });
      get().mostrarToast('Ajustes guardados correctamente', 'success');
    } catch (error) {
      console.error('Error guardando ajustes:', error);
      get().mostrarToast('Error al guardar ajustes', 'error');
    }
  },

  setMockMode: async (enabled: boolean) => {
    setMockDataEnabled(enabled);
    invalidateDataProvider();
    set({ isMockActive: enabled });
    await get().cargarTodo();
    get().mostrarToast(
      enabled
        ? 'Modo Mockup activado (Datos aislados en LocalStorage)'
        : 'Modo Firebase activado (Conexión a Firestore)',
      'info'
    );
  },

  reiniciarDatosMock: async () => {
    const provider = getDataProvider();
    if (provider.resetMockData) {
      await provider.resetMockData();
      await get().cargarTodo();
      get().mostrarToast('Datos de prueba reiniciados al catálogo por defecto', 'success');
    }
  }
}));
