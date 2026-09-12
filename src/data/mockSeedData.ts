import { Producto, EstadoCaja, Venta, AppSettings, Evento } from '../types';

export const INITIAL_PRODUCTS: Producto[] = [
  {
    id: 'prod-001',
    imagenUrl: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=400&q=80',
    nombreCorto: 'Pendientes Sakura Plata',
    nombreLargo: 'Pendientes Flor de Sakura en Plata 925 con Esmalte Rosa',
    descripcion: 'Diseño artesanal delicado inspirado en los cerezos de Japón. Antialérgicos con cierre de mariposa.',
    precioCoste: 3.50,
    precioVenta: 12.00,
    stock: 14,
    etiquetas: ['Joyería', 'Anime', 'Floral']
  },
  {
    id: 'prod-002',
    imagenUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80',
    nombreCorto: 'Collar Máscara Hannya',
    nombreLargo: 'Collar Colgante Máscara Hannya Tradicional Étnica',
    descripcion: 'Aleación de zinc envejecido con detalles grabados a mano y cordón de cuero sintético ajustable.',
    precioCoste: 4.20,
    precioVenta: 15.00,
    stock: 8,
    etiquetas: ['Joyería', 'Japón', 'Gótico']
  },
  {
    id: 'prod-003',
    imagenUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=80',
    nombreCorto: 'Anillo Akatsuki Nube',
    nombreLargo: 'Anillo Nube Roja de Akatsuki Acero Inoxidable',
    descripcion: 'Anillo pulido con esmalte cerámico rojo intenso. Talla adaptable del 14 al 20.',
    precioCoste: 2.10,
    precioVenta: 8.50,
    stock: 22,
    etiquetas: ['Joyería', 'Anime', 'Naruto']
  },
  {
    id: 'prod-004',
    imagenUrl: 'https://images.unsplash.com/photo-1611591475152-478d13b66ba6?auto=format&fit=crop&w=400&q=80',
    nombreCorto: 'Pin Sailor Moon Luna',
    nombreLargo: 'Pin Esmaltado Sailor Moon con Luna y Brillantina',
    descripcion: 'Pin metálico hard enamel de alta calidad con doble broche de goma premium.',
    precioCoste: 1.20,
    precioVenta: 5.00,
    stock: 35,
    etiquetas: ['Merch', 'Anime', 'Pins']
  },
  {
    id: 'prod-005',
    imagenUrl: 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?auto=format&fit=crop&w=400&q=80',
    nombreCorto: 'Llavero Acrílico K-Pop Idol',
    nombreLargo: 'Llavero Doble Capa Holográfico K-Pop Lightstick',
    descripcion: 'Acrílico cortado por láser con acabado glitter y mosquetón en forma de estrella dorada.',
    precioCoste: 1.50,
    precioVenta: 6.00,
    stock: 19,
    etiquetas: ['K-Pop', 'Merch', 'Llaveros']
  },
  {
    id: 'prod-006',
    imagenUrl: 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=400&q=80',
    nombreCorto: 'Pulsera Demon Slayer',
    nombreLargo: 'Pulsera de Cuentas Volcánicas y Dije Hanafuda',
    descripcion: 'Piedras naturales mate con amuleto metálico con estampado tradicional.',
    precioCoste: 2.80,
    precioVenta: 10.00,
    stock: 4, // Stock bajo para probar alertas!
    etiquetas: ['Joyería', 'Anime', 'Pulseras']
  },
  {
    id: 'prod-007',
    imagenUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=400&q=80',
    nombreCorto: 'Gargantilla Mariposa Gótica',
    nombreLargo: 'Choker de Terciopelo Negro con Mariposa de Cristal',
    descripcion: 'Cinta de terciopelo suave de 15mm con colgante de cristal iridiscente morado.',
    precioCoste: 2.50,
    precioVenta: 9.50,
    stock: 12,
    etiquetas: ['Joyería', 'K-Pop', 'Gótico']
  },
  {
    id: 'prod-008',
    imagenUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
    nombreCorto: 'Charm Genshin Visión Anemo',
    nombreLargo: 'Colgante de Cristal Luminiscente Visión Mondstadt',
    descripcion: 'Brilla en la oscuridad tras cargarse con luz solar. Cadena trenzada incluida.',
    precioCoste: 3.80,
    precioVenta: 14.00,
    stock: 7,
    etiquetas: ['Joyería', 'Gaming', 'Anime']
  },
  {
    id: 'prod-009',
    imagenUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80',
    nombreCorto: 'Set Pins Studio Ghibli',
    nombreLargo: 'Pack de 3 Pins Metálicos Totoro y Duendes del Polvo',
    descripcion: 'Acabado dorado satinado con caja de presentación ilustrada.',
    precioCoste: 3.00,
    precioVenta: 11.50,
    stock: 3, // Stock bajo para alertas!
    etiquetas: ['Merch', 'Anime', 'Pins']
  },
  {
    id: 'prod-010',
    imagenUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=400&q=80',
    nombreCorto: 'Ear Cuffs Élficos Plata',
    nombreLargo: 'Par de Pendientes Trepadores sin Perforación Estilo Fantasía',
    descripcion: 'Diseño en filigrana de aleación hipoalergénica. Se ajustan a cualquier oreja sin dolor.',
    precioCoste: 4.00,
    precioVenta: 16.00,
    stock: 10,
    etiquetas: ['Joyería', 'Fantasía', 'K-Pop']
  }
];

const hoy = new Date().toISOString().split('T')[0];

export const INITIAL_EVENTS: Evento[] = [
  // 1. Evento Cerrado 1
  {
    id: 'evt-closed-01',
    nombre: 'Salón del Manga de Barcelona 2025',
    fechaInicio: '2025-11-01',
    fechaFin: '2025-11-04',
    estado: 'cerrado',
    cajaInicial: {
      billetes: { b50: 0, b20: 4, b10: 5, b5: 4 }, // 80 + 50 + 20 = 150€
      monedas: { m200: 0, m100: 0, m50: 0, m20: 0, m10: 0, m5: 0, m2: 0, m1: 0 },
      ultimaActualizacion: '2025-11-01T09:00:00.000Z'
    },
    cajaActual: {
      billetes: { b50: 4, b20: 10, b10: 8, b5: 6 }, // 200 + 200 + 80 + 30 = 510€
      monedas: { m200: 1, m100: 0, m50: 0, m20: 0, m10: 0, m5: 0, m2: 0, m1: 0 }, // 2€ = 512€
      ultimaActualizacion: '2025-11-04T20:30:00.000Z'
    },
    arqueoCierre: {
      fecha: '2025-11-04',
      hora: '20:30:00',
      timestamp: new Date('2025-11-04T20:30:00.000Z').getTime(),
      cajaFinal: {
        billetes: { b50: 4, b20: 10, b10: 8, b5: 6 },
        monedas: { m200: 1, m100: 0, m50: 0, m20: 0, m10: 0, m5: 0, m2: 0, m1: 0 }
      },
      totalTeorico: 512.00,
      totalReal: 512.00,
      diferencia: 0.00,
      totalRecaudadoEfectivo: 362.00,
      totalRecaudadoTPV: 485.50,
      totalRecaudadoBizum: 110.00,
      totalVentas: 38,
      notas: 'Cierre de feria exitoso. Caja perfectamente cuadrada sin descuadres.'
    },
    notas: 'Stand principal pasillo central.',
    fechaCreacion: '2025-10-25'
  },

  // 2. Evento Cerrado 2
  {
    id: 'evt-closed-02',
    nombre: 'Feria del Libro y Arte Madrid',
    fechaInicio: '2026-05-20',
    fechaFin: '2026-05-24',
    estado: 'cerrado',
    cajaInicial: {
      billetes: { b50: 0, b20: 3, b10: 4, b5: 4 }, // 60 + 40 + 20 = 120€
      monedas: { m200: 0, m100: 0, m50: 0, m20: 0, m10: 0, m5: 0, m2: 0, m1: 0 },
      ultimaActualizacion: '2026-05-20T10:00:00.000Z'
    },
    cajaActual: {
      billetes: { b50: 3, b20: 8, b10: 12, b5: 6 }, // 150 + 160 + 120 + 30 = 460€
      monedas: { m200: 0, m100: 0, m50: 0, m20: 0, m10: 0, m5: 0, m2: 0, m1: 0 },
      ultimaActualizacion: '2026-05-24T21:00:00.000Z'
    },
    arqueoCierre: {
      fecha: '2026-05-24',
      hora: '21:00:00',
      timestamp: new Date('2026-05-24T21:00:00.000Z').getTime(),
      cajaFinal: {
        billetes: { b50: 3, b20: 8, b10: 12, b5: 6 },
        monedas: { m200: 0, m100: 0, m50: 0, m20: 0, m10: 0, m5: 0, m2: 0, m1: 0 }
      },
      totalTeorico: 460.00,
      totalReal: 460.00,
      diferencia: 0.00,
      totalRecaudadoEfectivo: 340.00,
      totalRecaudadoTPV: 520.00,
      totalRecaudadoBizum: 95.00,
      totalVentas: 29,
      notas: 'Arqueo final conforme al cierre de feria.'
    },
    notas: 'Sector ilustradores.',
    fechaCreacion: '2026-05-15'
  },

  // 3. Evento Activo 1 (Con ventas registradas)
  {
    id: 'evt-active-01',
    nombre: 'Japan Weekend Madrid 2026',
    fechaInicio: hoy,
    estado: 'activo',
    cajaInicial: {
      billetes: { b50: 0, b20: 4, b10: 4, b5: 4 }, // 80 + 40 + 20 = 140€
      monedas: { m200: 0, m100: 0, m50: 0, m20: 0, m10: 0, m5: 0, m2: 0, m1: 0 },
      ultimaActualizacion: `${hoy}T09:30:00.000Z`
    },
    cajaActual: {
      // 140€ inicial + 22€ en efectivo de la venta ven-1001 (pagó 25€ con 1x20€, 1x5€ y vuelta de 3€ con 1x2€, 1x1€)
      billetes: { b50: 0, b20: 5, b10: 4, b5: 5 }, // 100 + 40 + 25 = 165€
      monedas: { m200: -1, m100: -1, m50: 0, m20: 0, m10: 0, m5: 0, m2: 0, m1: 0 }, // total neto 162€
      ultimaActualizacion: `${hoy}T11:15:30.000Z`,
      notas: 'Caja operativa del evento Japan Weekend'
    },
    notas: 'Pabellón 9 IFEMA',
    fechaCreacion: hoy
  },

  // 4. Evento Activo 2 (Recién creado, sin ventas)
  {
    id: 'evt-active-02',
    nombre: 'Mangafest Sevilla 2026',
    fechaInicio: hoy,
    estado: 'activo',
    cajaInicial: {
      billetes: { b50: 0, b20: 2, b10: 4, b5: 4 }, // 40 + 40 + 20 = 100€
      monedas: { m200: 5, m100: 10, m50: 20, m20: 25, m10: 20, m5: 20, m2: 0, m1: 0 }, // 10 + 10 + 10 + 5 + 2 + 1 = 38€
      ultimaActualizacion: `${hoy}T10:00:00.000Z`
    },
    cajaActual: {
      billetes: { b50: 0, b20: 2, b10: 4, b5: 4 },
      monedas: { m200: 5, m100: 10, m50: 20, m20: 25, m10: 20, m5: 20, m2: 0, m1: 0 },
      ultimaActualizacion: `${hoy}T10:00:00.000Z`,
      notas: 'Evento recién iniciado. Listo para aperturar ventas.'
    },
    notas: 'Palacio de Exposiciones FIBES',
    fechaCreacion: hoy
  }
];

export const INITIAL_SALES: Venta[] = [
  // Ventas del Evento Activo 1 (Japan Weekend Madrid 2026)
  {
    id: 'ven-1001',
    eventoId: 'evt-active-01',
    nombreEvento: 'Japan Weekend Madrid 2026',
    lineas: [
      { productId: 'prod-001', nombreCorto: 'Pendientes Sakura Plata', cantidad: 1, precioUnitario: 12.00, precioCoste: 3.50 },
      { productId: 'prod-004', nombreCorto: 'Pin Sailor Moon Luna', cantidad: 2, precioUnitario: 5.00, precioCoste: 1.20 }
    ],
    total: 22.00,
    metodoPago: 'efectivo',
    efectivoEntrante: {
      billetes: { b20: 1, b5: 1 },
      monedas: {},
      total: 25.00
    },
    vueltas: {
      billetes: {},
      monedas: { m200: 1, m100: 1 },
      total: 3.00
    },
    fecha: hoy,
    hora: '11:15:30',
    timestamp: Date.now() - 3600000 * 4,
    estado: 'registrada'
  },
  {
    id: 'ven-1002',
    eventoId: 'evt-active-01',
    nombreEvento: 'Japan Weekend Madrid 2026',
    lineas: [
      { productId: 'prod-002', nombreCorto: 'Collar Máscara Hannya', cantidad: 1, precioUnitario: 15.00, precioCoste: 4.20 },
      { productId: 'prod-003', nombreCorto: 'Anillo Akatsuki Nube', cantidad: 1, precioUnitario: 8.50, precioCoste: 2.10 }
    ],
    total: 23.50,
    metodoPago: 'tpv',
    fecha: hoy,
    hora: '12:45:10',
    timestamp: Date.now() - 3600000 * 2.5,
    estado: 'registrada'
  },
  {
    id: 'ven-1003',
    eventoId: 'evt-active-01',
    nombreEvento: 'Japan Weekend Madrid 2026',
    lineas: [
      { productId: 'prod-005', nombreCorto: 'Llavero Acrílico K-Pop Idol', cantidad: 3, precioUnitario: 6.00, precioCoste: 1.50 },
      { productId: 'prod-007', nombreCorto: 'Gargantilla Mariposa Gótica', cantidad: 1, precioUnitario: 9.50, precioCoste: 2.50 }
    ],
    total: 27.50,
    metodoPago: 'transferencia_bizum',
    fecha: hoy,
    hora: '14:20:00',
    timestamp: Date.now() - 3600000 * 1,
    estado: 'registrada'
  },

  // Ventas históricas del Evento Cerrado 1 (Salón del Manga de Barcelona 2025)
  {
    id: 'ven-hist-01',
    eventoId: 'evt-closed-01',
    nombreEvento: 'Salón del Manga de Barcelona 2025',
    lineas: [
      { productId: 'prod-008', nombreCorto: 'Charm Genshin Visión Anemo', cantidad: 2, precioUnitario: 14.00, precioCoste: 3.80 },
      { productId: 'prod-010', nombreCorto: 'Ear Cuffs Élficos Plata', cantidad: 1, precioUnitario: 16.00, precioCoste: 4.00 }
    ],
    total: 44.00,
    metodoPago: 'tpv',
    fecha: '2025-11-02',
    hora: '13:10:00',
    timestamp: new Date('2025-11-02T13:10:00.000Z').getTime(),
    estado: 'registrada'
  },
  {
    id: 'ven-hist-02',
    eventoId: 'evt-closed-01',
    nombreEvento: 'Salón del Manga de Barcelona 2025',
    lineas: [
      { productId: 'prod-009', nombreCorto: 'Set Pins Studio Ghibli', cantidad: 1, precioUnitario: 11.50, precioCoste: 3.00 }
    ],
    total: 11.50,
    metodoPago: 'efectivo',
    fecha: '2025-11-03',
    hora: '16:45:00',
    timestamp: new Date('2025-11-03T16:45:00.000Z').getTime(),
    estado: 'registrada'
  }
];

export const INITIAL_SETTINGS: AppSettings = {
  mockDataEnabled: true,
  umbralStockBajo: 5,
  umbralMonedasBajas: 5,
  nombreTienda: 'KiraKira Jewels & Merch',
  autoImprimirTicket: false
};

export const MOCK_PRODUCT_IDS = new Set<string>(INITIAL_PRODUCTS.map((p) => p.id));
export const MOCK_EVENT_IDS = new Set<string>(INITIAL_EVENTS.map((e) => e.id));
export const MOCK_SALE_IDS = new Set<string>(INITIAL_SALES.map((s) => s.id));

export function isMockProductId(id: string): boolean {
  return MOCK_PRODUCT_IDS.has(id);
}

export function isMockEventId(id: string): boolean {
  return MOCK_EVENT_IDS.has(id);
}

export function isMockSaleId(id: string): boolean {
  return MOCK_SALE_IDS.has(id);
}
