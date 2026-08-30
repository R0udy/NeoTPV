import {
  DataProvider,
  Producto,
  Venta,
  EstadoCaja,
  AppSettings
} from '../types';
import { FIRESTORE_COLLECTIONS, isFirebaseConfigured } from '../config/firebaseConfig';
import { ESTADO_CAJA_INICIAL } from '../utils/cashUtils';
import { INITIAL_SETTINGS } from './mockSeedData';

/**
 * Proveedor de datos para Firebase Firestore
 * 
 * TODO: Para conectar en producción:
 * 1. Instalar firebase: `npm install firebase`
 * 2. Descomentar los imports y llamadas de Firestore:
 *    - `collection(db, FIRESTORE_COLLECTIONS.PRODUCTOS)`
 *    - `getDocs`, `setDoc`, `addDoc`, `updateDoc`, `deleteDoc`, `doc`
 */
export class FirebaseProvider implements DataProvider {
  private fallbackStore = {
    products: new Map<string, Producto>(),
    sales: new Map<string, Venta>(),
    cashState: { ...ESTADO_CAJA_INICIAL },
    settings: { ...INITIAL_SETTINGS, mockDataEnabled: false }
  };

  constructor() {
    if (!isFirebaseConfigured()) {
      console.warn(
        '[FirebaseProvider] Firebase no tiene credenciales de producción configuradas aún. ' +
        'Operando en modo stub aislado en memoria (sin afectar datos mock de localStorage).'
      );
    }
  }

  // --- Productos ---
  async getProducts(): Promise<Producto[]> {
    // TODO: Implementar consulta Firestore:
    // const snapshot = await getDocs(collection(db, FIRESTORE_COLLECTIONS.PRODUCTOS));
    // return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Producto));
    console.info(`[FirebaseProvider] Leyendo productos de Firestore (${FIRESTORE_COLLECTIONS.PRODUCTOS})...`);
    return Array.from(this.fallbackStore.products.values());
  }

  async saveProduct(product: Producto): Promise<void> {
    // TODO: Implementar guardado Firestore:
    // await setDoc(doc(db, FIRESTORE_COLLECTIONS.PRODUCTOS, product.id), product);
    console.info(`[FirebaseProvider] Guardando producto ${product.id} en Firestore...`);
    this.fallbackStore.products.set(product.id, product);
  }

  async deleteProduct(productId: string): Promise<void> {
    // TODO: Implementar borrado Firestore:
    // await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.PRODUCTOS, productId));
    console.info(`[FirebaseProvider] Eliminando producto ${productId} de Firestore...`);
    this.fallbackStore.products.delete(productId);
  }

  // --- Ventas ---
  async getSales(): Promise<Venta[]> {
    // TODO: Implementar consulta Firestore ordenada por timestamp desc:
    // const q = query(collection(db, FIRESTORE_COLLECTIONS.VENTAS), orderBy('timestamp', 'desc'));
    // const snapshot = await getDocs(q);
    // return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Venta));
    console.info(`[FirebaseProvider] Leyendo ventas de Firestore (${FIRESTORE_COLLECTIONS.VENTAS})...`);
    return Array.from(this.fallbackStore.sales.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  async saveSale(sale: Venta): Promise<void> {
    // TODO: Implementar guardado Firestore:
    // await setDoc(doc(db, FIRESTORE_COLLECTIONS.VENTAS, sale.id), sale);
    console.info(`[FirebaseProvider] Registrando venta ${sale.id} (${sale.total}€) en Firestore...`);
    this.fallbackStore.sales.set(sale.id, sale);
  }

  async updateSale(sale: Venta): Promise<void> {
    // TODO: Implementar actualización Firestore:
    // await updateDoc(doc(db, FIRESTORE_COLLECTIONS.VENTAS, sale.id), sale as any);
    console.info(`[FirebaseProvider] Actualizando venta ${sale.id} en Firestore...`);
    this.fallbackStore.sales.set(sale.id, sale);
  }

  // --- Estado Caja ---
  async getCashState(): Promise<EstadoCaja> {
    // TODO: Implementar lectura Firestore de documento 'actual':
    // const docSnap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.ESTADO_CAJA, 'actual'));
    // return docSnap.exists() ? (docSnap.data() as EstadoCaja) : ESTADO_CAJA_INICIAL;
    console.info(`[FirebaseProvider] Leyendo estado de caja de Firestore...`);
    return this.fallbackStore.cashState;
  }

  async saveCashState(state: EstadoCaja): Promise<void> {
    // TODO: Implementar guardado Firestore:
    // await setDoc(doc(db, FIRESTORE_COLLECTIONS.ESTADO_CAJA, 'actual'), state);
    console.info(`[FirebaseProvider] Guardando estado de caja en Firestore...`);
    this.fallbackStore.cashState = { ...state };
  }

  // --- Ajustes ---
  async getSettings(): Promise<AppSettings> {
    // TODO: Implementar lectura Firestore:
    // const docSnap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.AJUSTES, 'general'));
    // return docSnap.exists() ? (docSnap.data() as AppSettings) : INITIAL_SETTINGS;
    return this.fallbackStore.settings;
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    // TODO: Implementar guardado Firestore:
    // await setDoc(doc(db, FIRESTORE_COLLECTIONS.AJUSTES, 'general'), settings);
    this.fallbackStore.settings = { ...settings };
  }
}
