export type MetodoPago = 'transferencia_bizum' | 'tpv' | 'efectivo';

export type EstadoVenta = 'registrada' | 'devuelta' | 'modificada';

export interface Producto {
  id: string;
  imagenUrl: string; // URL de OneDrive o placeholder
  nombreCorto: string;
  nombreLargo: string;
  descripcion: string;
  precioCoste: number;
  precioVenta: number;
  stock: number;
  etiquetas: string[]; // Máximo 3
  fechaCreacion?: string;
}

export interface DenominacionesBilletes {
  b50?: number; // 50 €
  b20: number;  // 20 €
  b10: number;  // 10 €
  b5: number;   // 5 €
}

export interface DenominacionesMonedas {
  m200: number; // 2.00 € (200 cents)
  m100: number; // 1.00 € (100 cents)
  m50: number;  // 0.50 € (50 cents)
  m20: number;  // 0.20 € (20 cents)
  m10: number;  // 0.10 € (10 cents)
  m5: number;   // 0.05 € (5 cents)
  m2: number;   // 0.02 € (2 cents)
  m1: number;   // 0.01 € (1 cent)
}

export interface EstadoCaja {
  billetes: DenominacionesBilletes;
  monedas: DenominacionesMonedas;
  ultimaActualizacion?: string;
  notas?: string;
}

export interface LineaVenta {
  productId: string;
  nombreCorto: string;
  cantidad: number;
  precioUnitario: number;
  precioCoste?: number;
}

export interface DesgloseEfectivo {
  billetes: Partial<DenominacionesBilletes>;
  monedas: Partial<DenominacionesMonedas>;
  total: number;
}

export interface Venta {
  id: string;
  lineas: LineaVenta[];
  total: number;
  metodoPago: MetodoPago;
  efectivoEntrante?: DesgloseEfectivo;
  vueltas?: DesgloseEfectivo;
  fecha: string; // YYYY-MM-DD
  hora: string;  // HH:mm:ss
  timestamp: number;
  estado: EstadoVenta;
  motivoDevolucion?: string;
  evento?: string;
}

export interface TicketLinea {
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
}

export interface AppSettings {
  mockDataEnabled: boolean;
  umbralStockBajo: number;
  umbralMonedasBajas: number;
  nombreEvento: string;
  nombreTienda: string;
  autoImprimirTicket: boolean;
}

export type TipoAlerta = 'stock_bajo' | 'caja_baja' | 'sin_imagen' | 'margen_negativo';

export interface Alerta {
  id: string;
  tipo: TipoAlerta;
  titulo: string;
  descripcion: string;
  gravedad: 'info' | 'warning' | 'error';
  referenciaId?: string;
  metadata?: Record<string, any>;
}

export interface ResultadoCalculoVueltas {
  posible: boolean;
  importeCambio: number;
  desglose: DesgloseEfectivo;
  faltante: number;
  mensaje?: string;
}

export interface DataProvider {
  getProducts(): Promise<Producto[]>;
  saveProduct(product: Producto): Promise<void>;
  deleteProduct(productId: string): Promise<void>;
  
  getSales(): Promise<Venta[]>;
  saveSale(sale: Venta): Promise<void>;
  updateSale(sale: Venta): Promise<void>;
  
  getCashState(): Promise<EstadoCaja>;
  saveCashState(state: EstadoCaja): Promise<void>;
  
  getSettings(): Promise<AppSettings>;
  saveSettings(settings: AppSettings): Promise<void>;
  
  resetMockData?(): Promise<void>;
}
