import {
  DataProvider,
  Producto,
  Venta,
  EstadoCaja,
  AppSettings
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_SALES,
  INITIAL_SETTINGS
} from './mockSeedData';
import { ESTADO_CAJA_INICIAL } from '../utils/cashUtils';

const STORAGE_KEYS = {
  PRODUCTS: 'tpv_stand_mock_products_v1',
  SALES: 'tpv_stand_mock_sales_v1',
  CASH: 'tpv_stand_mock_cash_v1',
  SETTINGS: 'tpv_stand_mock_settings_v1',
  INITIALIZED: 'tpv_stand_mock_initialized_v1'
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
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES));
    localStorage.setItem(STORAGE_KEYS.CASH, JSON.stringify(ESTADO_CAJA_INICIAL));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }

  // --- Productos ---
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

  // --- Ventas ---
  async getSales(): Promise<Venta[]> {
    this.ensureInitialized();
    const data = localStorage.getItem(STORAGE_KEYS.SALES);
    const sales: Venta[] = data ? JSON.parse(data) : [];
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

  // --- Estado Caja ---
  async getCashState(): Promise<EstadoCaja> {
    this.ensureInitialized();
    const data = localStorage.getItem(STORAGE_KEYS.CASH);
    return data ? JSON.parse(data) : ESTADO_CAJA_INICIAL;
  }

  async saveCashState(state: EstadoCaja): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.CASH, JSON.stringify(state));
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
