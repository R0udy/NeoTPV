import { create } from 'zustand';
import {
  Producto,
  Venta,
  Evento,
  EstadoCaja,
  ArqueoCierre,
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
  eventos: Evento[];
  eventoActivoId: string | null;
  ventas: Venta[];
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

  // Helpers
  getEventoActivo: () => Evento | null;

  // Acciones globales
  cargarTodo: () => Promise<void>;
  seleccionarEvento: (eventoId: string | null) => void;
  setBusqueda: (texto: string) => void;
  setFiltroEtiqueta: (etiqueta: string | null) => void;
  setOrden: (orden: CriterioOrden) => void;
  
  // Eventos
  crearEvento: (params: {
    nombre: string;
    fechaInicio: string;
    cajaInicial: EstadoCaja;
    notas?: string;
  }) => Promise<Evento>;
  cerrarEvento: (eventoId: string, arqueo: ArqueoCierre) => Promise<void>;
  actualizarCajaEvento: (eventoId: string, nuevaCaja: EstadoCaja) => Promise<void>;
  eliminarEvento: (eventoId: string) => Promise<void>;

  // Productos (Inventario General)
  guardarProducto: (producto: Producto) => Promise<void>;
  eliminarProducto: (productId: string) => Promise<void>;

  // Ventas & Cobros
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

  // Configuración & Mock
  actualizarSettings: (nuevosSettings: AppSettings) => Promise<void>;
  setMockMode: (enabled: boolean) => Promise<void>;
  reiniciarDatosMock: () => Promise<void>;
  purgarMockDeFirebase: () => Promise<void>;

  // Toasts
  mostrarToast: (texto: string, tipo?: 'success' | 'info' | 'warning' | 'error') => void;
  removerToast: (id: string) => void;
}

export const useDataStore = create<DataState>((set, get) => ({
  productos: [],
  eventos: [],
  eventoActivoId: null,
  ventas: [],
  settings: INITIAL_SETTINGS,
  alertas: [],
  isMockActive: isMockDataEnabled(),

  busqueda: '',
  filtroEtiqueta: null,
  orden: 'nombre',

  cargando: false,
  toasts: [],

  getEventoActivo: () => {
    const { eventos, eventoActivoId } = get();
    if (!eventoActivoId) return null;
    return eventos.find((e) => e.id === eventoActivoId) || null;
  },

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

  seleccionarEvento: (eventoId) => {
    set({ eventoActivoId: eventoId });
    const evento = get().eventos.find((e) => e.id === eventoId);
    const alertas = generarAlertasSistema(
      get().productos,
      evento ? evento.cajaActual : null,
      get().settings
    );
    set({ alertas });
  },

  setBusqueda: (texto) => set({ busqueda: texto }),
  setFiltroEtiqueta: (etiqueta) => set({ filtroEtiqueta: etiqueta }),
  setOrden: (orden) => set({ orden }),

  cargarTodo: async () => {
    set({ cargando: true });
    try {
      const provider = getDataProvider();
      const [productos, eventos, ventas, settings] = await Promise.all([
        provider.getProducts(),
        provider.getEvents(),
        provider.getSales(),
        provider.getSettings()
      ]);

      // Si no hay evento seleccionado o el seleccionado ya no existe, seleccionar el primer activo si existe
      let currentActiveId = get().eventoActivoId;
      if (!currentActiveId || !eventos.some((e) => e.id === currentActiveId)) {
        const primerActivo = eventos.find((e) => e.estado === 'activo');
        currentActiveId = primerActivo ? primerActivo.id : null;
      }

      const eventoActivo = eventos.find((e) => e.id === currentActiveId);
      const alertas = generarAlertasSistema(
        productos,
        eventoActivo ? eventoActivo.cajaActual : null,
        settings
      );

      set({
        productos,
        eventos,
        eventoActivoId: currentActiveId,
        ventas,
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

  // --- Gestión de Eventos ---
  crearEvento: async ({ nombre, fechaInicio, cajaInicial, notas }) => {
    try {
      const provider = getDataProvider();
      const nuevoEvento: Evento = {
        id: `evt-${Date.now()}`,
        nombre: nombre.trim(),
        fechaInicio: fechaInicio || new Date().toISOString().split('T')[0],
        estado: 'activo',
        cajaInicial: { ...cajaInicial, ultimaActualizacion: new Date().toISOString() },
        cajaActual: { ...cajaInicial, ultimaActualizacion: new Date().toISOString() },
        notas: notas?.trim() || '',
        fechaCreacion: new Date().toISOString().split('T')[0]
      };

      await provider.saveEvent(nuevoEvento);
      const eventosActualizados = await provider.getEvents();
      
      set({
        eventos: eventosActualizados,
        eventoActivoId: nuevoEvento.id
      });

      const alertas = generarAlertasSistema(
        get().productos,
        nuevoEvento.cajaActual,
        get().settings
      );
      set({ alertas });

      get().mostrarToast(`Evento "${nuevoEvento.nombre}" iniciado con éxito`, 'success');
      return nuevoEvento;
    } catch (error: any) {
      console.error('Error al crear evento:', error);
      const msg = error?.message || 'Error al crear el evento';
      get().mostrarToast(msg, 'error');
      throw error;
    }
  },

  cerrarEvento: async (eventoId: string, arqueo: ArqueoCierre) => {
    try {
      const provider = getDataProvider();
      const eventos = get().eventos;
      const target = eventos.find((e) => e.id === eventoId);
      if (!target) throw new Error('Evento no encontrado');

      const eventoCerrado: Evento = {
        ...target,
        estado: 'cerrado',
        fechaFin: new Date().toISOString().split('T')[0],
        cajaActual: arqueo.cajaFinal,
        arqueoCierre: arqueo
      };

      await provider.saveEvent(eventoCerrado);
      const eventosActualizados = await provider.getEvents();

      // Si el evento cerrado era el activo, dejar eventoActivoId en null o seleccionar otro activo
      let nuevoActivoId = get().eventoActivoId;
      if (nuevoActivoId === eventoId) {
        const otroActivo = eventosActualizados.find((e) => e.id !== eventoId && e.estado === 'activo');
        nuevoActivoId = otroActivo ? otroActivo.id : null;
      }

      const eventoActivo = eventosActualizados.find((e) => e.id === nuevoActivoId);
      const alertas = generarAlertasSistema(
        get().productos,
        eventoActivo ? eventoActivo.cajaActual : null,
        get().settings
      );

      set({
        eventos: eventosActualizados,
        eventoActivoId: nuevoActivoId,
        alertas
      });

      get().mostrarToast(`Evento "${target.nombre}" cerrado y arqueado correctamente`, 'success');
    } catch (error: any) {
      console.error('Error al cerrar evento:', error);
      const msg = error?.message || 'Error al cerrar el evento';
      get().mostrarToast(msg, 'error');
      throw error;
    }
  },

  actualizarCajaEvento: async (eventoId: string, nuevaCaja: EstadoCaja) => {
    try {
      const provider = getDataProvider();
      const eventos = get().eventos;
      const target = eventos.find((e) => e.id === eventoId);
      if (!target) throw new Error('Evento no encontrado');

      const eventoActualizado: Evento = {
        ...target,
        cajaActual: {
          ...nuevaCaja,
          ultimaActualizacion: new Date().toISOString()
        }
      };

      await provider.saveEvent(eventoActualizado);
      const eventosActualizados = await provider.getEvents();

      const eventoActivo = eventosActualizados.find((e) => e.id === get().eventoActivoId);
      const alertas = generarAlertasSistema(
        get().productos,
        eventoActivo ? eventoActivo.cajaActual : null,
        get().settings
      );

      set({ eventos: eventosActualizados, alertas });
      get().mostrarToast('Caja del evento actualizada', 'success');
    } catch (error: any) {
      console.error('Error actualizando caja del evento:', error);
      const msg = error?.message || 'Error al actualizar la caja';
      get().mostrarToast(msg, 'error');
      throw error;
    }
  },

  eliminarEvento: async (eventoId: string) => {
    try {
      const provider = getDataProvider();
      if (provider.deleteEvent) {
        await provider.deleteEvent(eventoId);
      }
      const eventosActualizados = await provider.getEvents();
      let nuevoActivoId = get().eventoActivoId;
      if (nuevoActivoId === eventoId) {
        const otro = eventosActualizados.find((e) => e.estado === 'activo');
        nuevoActivoId = otro ? otro.id : null;
      }
      set({ eventos: eventosActualizados, eventoActivoId: nuevoActivoId });
      get().mostrarToast('Evento eliminado', 'info');
    } catch (error: any) {
      console.error('Error al eliminar evento:', error);
      get().mostrarToast('Error al eliminar evento', 'error');
    }
  },

  // --- Productos (Inventario General) ---
  guardarProducto: async (producto: Producto) => {
    try {
      const provider = getDataProvider();
      await provider.saveProduct(producto);

      const productosActualizados = await provider.getProducts();
      const eventoActivo = get().getEventoActivo();
      const alertas = generarAlertasSistema(
        productosActualizados,
        eventoActivo ? eventoActivo.cajaActual : null,
        get().settings
      );

      set({ productos: productosActualizados, alertas });
      get().mostrarToast(`Producto "${producto.nombreCorto}" guardado en inventario general`, 'success');
    } catch (error: any) {
      console.error('Error guardando producto:', error);
      const msg = error?.message || 'Error al guardar el producto';
      get().mostrarToast(msg, 'error');
    }
  },

  eliminarProducto: async (productId: string) => {
    try {
      const provider = getDataProvider();
      await provider.deleteProduct(productId);

      const productosActualizados = await provider.getProducts();
      const eventoActivo = get().getEventoActivo();
      const alertas = generarAlertasSistema(
        productosActualizados,
        eventoActivo ? eventoActivo.cajaActual : null,
        get().settings
      );

      set({ productos: productosActualizados, alertas });
      get().mostrarToast('Producto eliminado del inventario general', 'info');
    } catch (error: any) {
      console.error('Error eliminando producto:', error);
      const msg = error?.message || 'Error al eliminar el producto';
      get().mostrarToast(msg, 'error');
    }
  },

  // --- Ventas y Cobros (Atacan Inventario General y Caja del Evento Activo) ---
  procesarCobro: async ({
    lineasTicket,
    metodoPago,
    efectivoEntrante,
    vueltas,
    total
  }) => {
    const eventoActivo = get().getEventoActivo();
    if (!eventoActivo) {
      get().mostrarToast('No hay un evento activo seleccionado para registrar la venta', 'error');
      throw new Error('No hay un evento activo seleccionado');
    }

    const provider = getDataProvider();
    const now = new Date();
    const fecha = now.toISOString().split('T')[0];
    const hora = now.toTimeString().split(' ')[0];
    const ventaId = `ven-${Date.now()}`;

    // 1. Crear el objeto de venta asociado al evento activo
    const nuevaVenta: Venta = {
      id: ventaId,
      eventoId: eventoActivo.id,
      nombreEvento: eventoActivo.nombre,
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
      estado: 'registrada'
    };

    // 2. Guardar venta
    await provider.saveSale(nuevaVenta);

    // 3. Descontar stock del Inventario General
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

    // 4. Si fue en efectivo, actualizar la caja del evento activo
    let eventosActualizados = get().eventos;
    let cajaActualizada = eventoActivo.cajaActual;
    if (metodoPago === 'efectivo' && efectivoEntrante) {
      cajaActualizada = aplicarEfectivoACaja(cajaActualizada, efectivoEntrante, vueltas);
      const eventoConNuevaCaja: Evento = {
        ...eventoActivo,
        cajaActual: cajaActualizada
      };
      await provider.saveEvent(eventoConNuevaCaja);
      eventosActualizados = await provider.getEvents();
    }

    // 5. Refrescar estado global
    const ventasActualizadas = await provider.getSales();
    const alertas = generarAlertasSistema(
      productosActuales,
      cajaActualizada,
      get().settings
    );

    set({
      productos: productosActuales,
      eventos: eventosActualizados,
      ventas: ventasActualizadas,
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

      // 2. Revertir stock en el Inventario General
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

      // 3. Si fue en efectivo, revertir el dinero en la caja del evento correspondiente
      let eventosActualizados = get().eventos;
      const eventoVenta = eventosActualizados.find((e) => e.id === venta.eventoId);
      if (eventoVenta && venta.metodoPago === 'efectivo' && venta.efectivoEntrante) {
        const cajaRevertida = revertirEfectivoDeCaja(
          eventoVenta.cajaActual,
          venta.efectivoEntrante,
          venta.vueltas
        );
        const eventoActualizado: Evento = {
          ...eventoVenta,
          cajaActual: cajaRevertida
        };
        await provider.saveEvent(eventoActualizado);
        eventosActualizados = await provider.getEvents();
      }

      // 4. Refrescar datos
      const ventasActualizadas = await provider.getSales();
      const eventoActivo = get().getEventoActivo();
      const alertas = generarAlertasSistema(
        productosActuales,
        eventoActivo ? eventoActivo.cajaActual : null,
        get().settings
      );

      set({
        productos: productosActuales,
        eventos: eventosActualizados,
        ventas: ventasActualizadas,
        alertas
      });

      get().mostrarToast(`Venta #${venta.id.slice(-4)} devuelta. Stock reintegrado al inventario general`, 'success');
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

  actualizarSettings: async (nuevosSettings: AppSettings) => {
    try {
      const provider = getDataProvider();
      await provider.saveSettings(nuevosSettings);
      const eventoActivo = get().getEventoActivo();
      const alertas = generarAlertasSistema(
        get().productos,
        eventoActivo ? eventoActivo.cajaActual : null,
        nuevosSettings
      );

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
    set({
      isMockActive: enabled,
      productos: [],
      eventos: [],
      eventoActivoId: null,
      ventas: [],
      busqueda: '',
      filtroEtiqueta: null,
    });

    if (!enabled) {
      try {
        const provider = getDataProvider();
        if (typeof provider.purgeMockDataFromFirestore === 'function') {
          await provider.purgeMockDataFromFirestore();
        }
      } catch (err) {
        console.warn('Error purgando mock data de Firestore:', err);
      }
    }

    await get().cargarTodo();
    get().mostrarToast(
      enabled
        ? 'Modo Mockup activado (Datos aislados en LocalStorage)'
        : 'Modo Firebase activado (Conexión directa a Firestore, catálogo real)',
      'info'
    );
  },

  purgarMockDeFirebase: async () => {
    set({ cargando: true });
    try {
      const provider = getDataProvider();
      if (typeof provider.purgeMockDataFromFirestore === 'function') {
        const { productosEliminados, ventasEliminadas, eventosEliminados } = await provider.purgeMockDataFromFirestore();
        await get().cargarTodo();
        get().mostrarToast(
          `Limpieza completada: ${productosEliminados} productos, ${eventosEliminados || 0} eventos y ${ventasEliminadas} ventas mock eliminadas de Firestore`,
          'success'
        );
      } else {
        get().mostrarToast('Función solo disponible en modo Firebase', 'warning');
      }
    } catch (error) {
      console.error('Error al purgar datos mock de Firestore:', error);
      get().mostrarToast('Error al limpiar datos mock de Firebase', 'error');
    } finally {
      set({ cargando: false });
    }
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
