import {
  DataProvider,
  Producto,
  Venta,
  Evento,
  AppSettings,
} from '../types';
import {
  FIRESTORE_COLLECTIONS,
  isFirebaseConfigured,
  getDb,
} from '../config/firebaseConfig';
import {
  INITIAL_SETTINGS,
  MOCK_PRODUCT_IDS,
  MOCK_EVENT_IDS,
  MOCK_SALE_IDS,
} from './mockSeedData';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';

const AJUSTES_DOC_ID = 'general';

/**
 * Proveedor de datos para Firebase Firestore.
 *
 * Si NO hay credenciales configuradas (isFirebaseConfigured() === false),
 * opera con un almacén en memoria aislado, sin tocar los datos mock de
 * localStorage y sin romper la app.
 *
 * NUNCA inyecta ni mezcla datos mockup en Firestore.
 */
export class FirebaseProvider implements DataProvider {
  public lastError: { message: string; code?: string; timestamp: number } | null = null;

  // Fallback en memoria mientras Firebase no esté configurado o para offline
  private fallbackStore = {
    products: new Map<string, Producto>(),
    events: new Map<string, Evento>(),
    sales: new Map<string, Venta>(),
    settings: { ...INITIAL_SETTINGS, mockDataEnabled: false } as AppSettings,
  };

  private get useFirestore(): boolean {
    return isFirebaseConfigured();
  }

  constructor() {
    if (!this.useFirestore) {
      console.warn(
        '[FirebaseProvider] Sin credenciales de Firebase. Operando en modo stub en memoria ' +
          '(sin tocar los datos mock de localStorage).'
      );
    }
  }

  // --- Productos (Inventario General) ---
  async getProducts(): Promise<Producto[]> {
    if (!this.useFirestore) {
      return Array.from(this.fallbackStore.products.values()).filter(
        (p) => !MOCK_PRODUCT_IDS.has(p.id)
      );
    }
    try {
      const snap = await getDocs(collection(getDb(), FIRESTORE_COLLECTIONS.PRODUCTOS));
      if (snap.empty) {
        this.fallbackStore.products.clear();
        this.lastError = null;
        return [];
      }

      const allDocs = snap.docs.map((d) => ({ ...(d.data() as Producto), id: d.id }));
      const realProducts = allDocs.filter((p) => !MOCK_PRODUCT_IDS.has(p.id));

      this.fallbackStore.products.clear();
      realProducts.forEach((p) => this.fallbackStore.products.set(p.id, p));
      this.lastError = null;
      return realProducts;
    } catch (error: any) {
      const code = error?.code || 'unknown';
      const msg = error?.message || String(error);
      this.lastError = { message: msg, code, timestamp: Date.now() };
      console.error('[FirebaseProvider] Error al leer productos de Firestore:', error);
      return Array.from(this.fallbackStore.products.values()).filter(
        (p) => !MOCK_PRODUCT_IDS.has(p.id)
      );
    }
  }

  async saveProduct(product: Producto): Promise<void> {
    if (MOCK_PRODUCT_IDS.has(product.id)) {
      console.warn('[FirebaseProvider] Bloqueado guardado de producto mock en Firestore:', product.id);
      return;
    }
    this.fallbackStore.products.set(product.id, product);
    if (!this.useFirestore) return;
    try {
      await setDoc(doc(getDb(), FIRESTORE_COLLECTIONS.PRODUCTOS, product.id), product);
      this.lastError = null;
    } catch (error: any) {
      const code = error?.code || 'unknown';
      const msg = error?.message || String(error);
      this.lastError = { message: msg, code, timestamp: Date.now() };
      console.error('[FirebaseProvider] Error al guardar producto en Firestore:', error);
      throw new Error(`Firebase [${code}]: ${msg}`);
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    this.fallbackStore.products.delete(productId);
    if (!this.useFirestore) return;
    try {
      await deleteDoc(doc(getDb(), FIRESTORE_COLLECTIONS.PRODUCTOS, productId));
      this.lastError = null;
    } catch (error: any) {
      const code = error?.code || 'unknown';
      const msg = error?.message || String(error);
      this.lastError = { message: msg, code, timestamp: Date.now() };
      console.error('[FirebaseProvider] Error al eliminar producto en Firestore:', error);
      throw new Error(`Firebase [${code}]: ${msg}`);
    }
  }

  // --- Eventos ---
  async getEvents(): Promise<Evento[]> {
    if (!this.useFirestore) {
      return Array.from(this.fallbackStore.events.values())
        .filter((e) => !MOCK_EVENT_IDS.has(e.id))
        .sort((a, b) => {
          if (a.estado === 'activo' && b.estado === 'cerrado') return -1;
          if (a.estado === 'cerrado' && b.estado === 'activo') return 1;
          return new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime();
        });
    }
    try {
      const snap = await getDocs(collection(getDb(), FIRESTORE_COLLECTIONS.EVENTOS));
      if (snap.empty) {
        this.fallbackStore.events.clear();
        this.lastError = null;
        return [];
      }

      const allDocs = snap.docs.map((d) => ({ ...(d.data() as Evento), id: d.id }));
      const realEvents = allDocs.filter((e) => !MOCK_EVENT_IDS.has(e.id));

      this.fallbackStore.events.clear();
      realEvents.forEach((e) => this.fallbackStore.events.set(e.id, e));
      this.lastError = null;

      return realEvents.sort((a, b) => {
        if (a.estado === 'activo' && b.estado === 'cerrado') return -1;
        if (a.estado === 'cerrado' && b.estado === 'activo') return 1;
        return new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime();
      });
    } catch (error: any) {
      const code = error?.code || 'unknown';
      const msg = error?.message || String(error);
      this.lastError = { message: msg, code, timestamp: Date.now() };
      console.error('[FirebaseProvider] Error al leer eventos de Firestore:', error);
      return Array.from(this.fallbackStore.events.values()).filter((e) => !MOCK_EVENT_IDS.has(e.id));
    }
  }

  async getEventById(id: string): Promise<Evento | null> {
    if (!this.useFirestore) {
      return this.fallbackStore.events.get(id) || null;
    }
    try {
      const snap = await getDoc(doc(getDb(), FIRESTORE_COLLECTIONS.EVENTOS, id));
      if (snap.exists()) {
        const evento = { ...(snap.data() as Evento), id: snap.id };
        this.fallbackStore.events.set(id, evento);
        return evento;
      }
      return null;
    } catch (error) {
      console.error('[FirebaseProvider] Error al obtener evento:', error);
      return this.fallbackStore.events.get(id) || null;
    }
  }

  async saveEvent(evento: Evento): Promise<void> {
    if (MOCK_EVENT_IDS.has(evento.id)) {
      console.warn('[FirebaseProvider] Bloqueado guardado de evento mock en Firestore:', evento.id);
      return;
    }
    this.fallbackStore.events.set(evento.id, evento);
    if (!this.useFirestore) return;
    try {
      await setDoc(doc(getDb(), FIRESTORE_COLLECTIONS.EVENTOS, evento.id), evento, { merge: true });
      this.lastError = null;
    } catch (error: any) {
      const code = error?.code || 'unknown';
      const msg = error?.message || String(error);
      this.lastError = { message: msg, code, timestamp: Date.now() };
      console.error('[FirebaseProvider] Error al guardar evento en Firestore:', error);
      throw new Error(`Firebase [${code}]: ${msg}`);
    }
  }

  async deleteEvent(eventoId: string): Promise<void> {
    this.fallbackStore.events.delete(eventoId);
    if (!this.useFirestore) return;
    try {
      await deleteDoc(doc(getDb(), FIRESTORE_COLLECTIONS.EVENTOS, eventoId));
      this.lastError = null;
    } catch (error: any) {
      const code = error?.code || 'unknown';
      const msg = error?.message || String(error);
      this.lastError = { message: msg, code, timestamp: Date.now() };
      console.error('[FirebaseProvider] Error al eliminar evento en Firestore:', error);
      throw new Error(`Firebase [${code}]: ${msg}`);
    }
  }

  // --- Ventas ---
  async getSales(eventoId?: string): Promise<Venta[]> {
    if (!this.useFirestore) {
      let sales = Array.from(this.fallbackStore.sales.values()).filter((s) => !MOCK_SALE_IDS.has(s.id));
      if (eventoId) {
        sales = sales.filter((s) => s.eventoId === eventoId);
      }
      return sales.sort((a, b) => b.timestamp - a.timestamp);
    }
    try {
      let q = query(
        collection(getDb(), FIRESTORE_COLLECTIONS.VENTAS),
        orderBy('timestamp', 'desc')
      );
      if (eventoId) {
        q = query(
          collection(getDb(), FIRESTORE_COLLECTIONS.VENTAS),
          where('eventoId', '==', eventoId),
          orderBy('timestamp', 'desc')
        );
      }
      const snap = await getDocs(q);
      const allSales = snap.docs.map((d) => ({ ...(d.data() as Venta), id: d.id }));
      const realSales = allSales.filter((s) => !MOCK_SALE_IDS.has(s.id));

      realSales.forEach((s) => this.fallbackStore.sales.set(s.id, s));
      this.lastError = null;
      return realSales;
    } catch (error: any) {
      const code = error?.code || 'unknown';
      const msg = error?.message || String(error);
      this.lastError = { message: msg, code, timestamp: Date.now() };
      console.error('[FirebaseProvider] Error al leer ventas de Firestore:', error);
      let fallback = Array.from(this.fallbackStore.sales.values()).filter((s) => !MOCK_SALE_IDS.has(s.id));
      if (eventoId) {
        fallback = fallback.filter((s) => s.eventoId === eventoId);
      }
      return fallback.sort((a, b) => b.timestamp - a.timestamp);
    }
  }

  async saveSale(sale: Venta): Promise<void> {
    if (MOCK_SALE_IDS.has(sale.id)) {
      console.warn('[FirebaseProvider] Bloqueada escritura de venta mock en Firestore:', sale.id);
      return;
    }
    this.fallbackStore.sales.set(sale.id, sale);
    if (!this.useFirestore) return;
    try {
      await setDoc(doc(getDb(), FIRESTORE_COLLECTIONS.VENTAS, sale.id), sale);
      this.lastError = null;
    } catch (error: any) {
      const code = error?.code || 'unknown';
      const msg = error?.message || String(error);
      this.lastError = { message: msg, code, timestamp: Date.now() };
      console.error('[FirebaseProvider] Error al registrar venta en Firestore:', error);
      throw new Error(`Firebase [${code}]: ${msg}`);
    }
  }

  async updateSale(sale: Venta): Promise<void> {
    this.fallbackStore.sales.set(sale.id, sale);
    if (!this.useFirestore) return;
    try {
      await setDoc(doc(getDb(), FIRESTORE_COLLECTIONS.VENTAS, sale.id), sale, {
        merge: true,
      });
      this.lastError = null;
    } catch (error: any) {
      const code = error?.code || 'unknown';
      const msg = error?.message || String(error);
      this.lastError = { message: msg, code, timestamp: Date.now() };
      console.error('[FirebaseProvider] Error al actualizar venta en Firestore:', error);
      throw new Error(`Firebase [${code}]: ${msg}`);
    }
  }

  /**
   * Purga explícitamente cualquier residuo de datos mock (productos, eventos o ventas)
   * que se hayan guardado en Firestore.
   */
  async purgeMockDataFromFirestore(): Promise<{ productosEliminados: number; ventasEliminadas: number; eventosEliminados?: number }> {
    if (!this.useFirestore) return { productosEliminados: 0, ventasEliminadas: 0, eventosEliminados: 0 };
    let productosEliminados = 0;
    let ventasEliminadas = 0;
    let eventosEliminados = 0;
    try {
      const pSnap = await getDocs(collection(getDb(), FIRESTORE_COLLECTIONS.PRODUCTOS));
      for (const d of pSnap.docs) {
        if (MOCK_PRODUCT_IDS.has(d.id)) {
          await deleteDoc(doc(getDb(), FIRESTORE_COLLECTIONS.PRODUCTOS, d.id));
          productosEliminados++;
        }
      }
      const eSnap = await getDocs(collection(getDb(), FIRESTORE_COLLECTIONS.EVENTOS));
      for (const d of eSnap.docs) {
        if (MOCK_EVENT_IDS.has(d.id)) {
          await deleteDoc(doc(getDb(), FIRESTORE_COLLECTIONS.EVENTOS, d.id));
          eventosEliminados++;
        }
      }
      const vSnap = await getDocs(collection(getDb(), FIRESTORE_COLLECTIONS.VENTAS));
      for (const d of vSnap.docs) {
        if (MOCK_SALE_IDS.has(d.id)) {
          await deleteDoc(doc(getDb(), FIRESTORE_COLLECTIONS.VENTAS, d.id));
          ventasEliminadas++;
        }
      }
      this.fallbackStore.products.clear();
      this.fallbackStore.events.clear();
      this.fallbackStore.sales.clear();
    } catch (e) {
      console.error('[FirebaseProvider] Error durante purgeMockDataFromFirestore:', e);
    }
    return { productosEliminados, ventasEliminadas, eventosEliminados };
  }

  // --- Ajustes (documento único 'general') ---
  async getSettings(): Promise<AppSettings> {
    if (!this.useFirestore) return this.fallbackStore.settings;
    try {
      const snap = await getDoc(
        doc(getDb(), FIRESTORE_COLLECTIONS.AJUSTES, AJUSTES_DOC_ID)
      );
      if (snap.exists()) {
        const data = snap.data() as AppSettings;
        this.fallbackStore.settings = data;
        this.lastError = null;
        return data;
      }
      return this.fallbackStore.settings;
    } catch (error: any) {
      const code = error?.code || 'unknown';
      const msg = error?.message || String(error);
      this.lastError = { message: msg, code, timestamp: Date.now() };
      console.error('[FirebaseProvider] Error al leer ajustes de Firestore:', error);
      return this.fallbackStore.settings;
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    this.fallbackStore.settings = { ...settings };
    if (!this.useFirestore) return;
    try {
      await setDoc(
        doc(getDb(), FIRESTORE_COLLECTIONS.AJUSTES, AJUSTES_DOC_ID),
        settings
      );
      this.lastError = null;
    } catch (error: any) {
      const code = error?.code || 'unknown';
      const msg = error?.message || String(error);
      this.lastError = { message: msg, code, timestamp: Date.now() };
      console.error('[FirebaseProvider] Error al guardar ajustes en Firestore:', error);
      throw new Error(`Firebase [${code}]: ${msg}`);
    }
  }
}

