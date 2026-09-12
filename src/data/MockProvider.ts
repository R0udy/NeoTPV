import {
  DataProvider,
  Producto,
  Venta,
  Evento,
  AppSettings
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_EVENTS,
  INITIAL_SALES,
  INITIAL_SETTINGS
} from './mockSeedData';

const STORAGE_KEYS = {
  PRODUCTS: 'tpv_eventos_mock_products_v2',
  EVENTS: 'tpv_eventos_mock_events_v2',
  SALES: 'tpv_eventos_mock_sales_v2',
  SETTINGS: 'tpv_eventos_mock_settings_v2',
  INITIALIZED: 'tpv_eventos_mock_initialized_v2'
} as const;

export class MockProvider implements DataProvider {
  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized(): void {
    if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
      this.resetToDefaults();
    }
  }

  public resetToDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }

  // --- Productos (Inventario General) ---
  async getProducts(): Promise<Producto[]> {
    this.ensureInitialized();
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  }

  async saveProduct(product: Producto): Promise<void> {
    const products = await this.getProducts();
    const index = products.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.unshift(product);
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }

  async deleteProduct(productId: string): Promise<void> {
    const products = await this.getProducts();
    const filtered = products.filter((p) => p.id !== productId);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
  }

  // --- Eventos ---
  async getEvents(): Promise<Evento[]> {
    this.ensureInitialized();
    const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
    const events: Evento[] = data ? JSON.parse(data) : [];
    // Ordenar activos primero y por fecha descendente
    return events.sort((a, b) => {
      if (a.estado === 'activo' && b.estado === 'cerrado') return -1;
      if (a.estado === 'cerrado' && b.estado === 'activo') return 1;
      return new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime();
    });
  }

  async getEventById(id: string): Promise<Evento | null> {
    const events = await this.getEvents();
    return events.find((e) => e.id === id) || null;
  }

  async saveEvent(evento: Evento): Promise<void> {
    const events = await this.getEvents();
    const index = events.findIndex((e) => e.id === evento.id);
    if (index >= 0) {
      events[index] = evento;
    } else {
      events.unshift(evento);
    }
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  }

  async deleteEvent(eventoId: string): Promise<void> {
    const events = await this.getEvents();
    const filtered = events.filter((e) => e.id !== eventoId);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(filtered));
  }

  // --- Ventas ---
  async getSales(eventoId?: string): Promise<Venta[]> {
    this.ensureInitialized();
    const data = localStorage.getItem(STORAGE_KEYS.SALES);
    let sales: Venta[] = data ? JSON.parse(data) : [];
    if (eventoId) {
      sales = sales.filter((s) => s.eventoId === eventoId);
    }
    // Ordenar de más reciente a más antigua
    return sales.sort((a, b) => b.timestamp - a.timestamp);
  }

  async saveSale(sale: Venta): Promise<void> {
    const sales = await this.getSales();
    sales.unshift(sale);
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  }

  async updateSale(sale: Venta): Promise<void> {
    const sales = await this.getSales();
    const index = sales.findIndex((s) => s.id === sale.id);
    if (index >= 0) {
      sales[index] = sale;
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
    }
  }

  // --- Ajustes ---
  async getSettings(): Promise<AppSettings> {
    this.ensureInitialized();
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : INITIAL_SETTINGS;
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  async resetMockData(): Promise<void> {
    this.resetToDefaults();
  }
}

