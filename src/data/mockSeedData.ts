import { Producto, EstadoCaja, Venta, AppSettings } from '../types';
import { ESTADO_CAJA_INICIAL } from '../utils/cashUtils';

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

export const INITIAL_SALES: Venta[] = [
  {
    id: 'ven-1001',
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
    fecha: new Date(Date.now() - 3600000 * 4).toISOString().split('T')[0],
    hora: '11:15:30',
    timestamp: Date.now() - 3600000 * 4,
    estado: 'registrada',
    evento: 'Japan Weekend Stand 42'
  },
  {
    id: 'ven-1002',
    lineas: [
      { productId: 'prod-002', nombreCorto: 'Collar Máscara Hannya', cantidad: 1, precioUnitario: 15.00, precioCoste: 4.20 },
      { productId: 'prod-003', nombreCorto: 'Anillo Akatsuki Nube', cantidad: 1, precioUnitario: 8.50, precioCoste: 2.10 }
    ],
    total: 23.50,
    metodoPago: 'tpv',
    fecha: new Date(Date.now() - 3600000 * 2.5).toISOString().split('T')[0],
    hora: '12:45:10',
    timestamp: Date.now() - 3600000 * 2.5,
    estado: 'registrada',
    evento: 'Japan Weekend Stand 42'
  },
  {
    id: 'ven-1003',
    lineas: [
      { productId: 'prod-005', nombreCorto: 'Llavero Acrílico K-Pop Idol', cantidad: 3, precioUnitario: 6.00, precioCoste: 1.50 },
      { productId: 'prod-007', nombreCorto: 'Gargantilla Mariposa Gótica', cantidad: 1, precioUnitario: 9.50, precioCoste: 2.50 }
    ],
    total: 27.50,
    metodoPago: 'transferencia_bizum',
    fecha: new Date(Date.now() - 3600000 * 1).toISOString().split('T')[0],
    hora: '14:20:00',
    timestamp: Date.now() - 3600000 * 1,
    estado: 'registrada',
    evento: 'Japan Weekend Stand 42'
  }
];

export const INITIAL_SETTINGS: AppSettings = {
  mockDataEnabled: true,
  umbralStockBajo: 5,
  umbralMonedasBajas: 5,
  nombreEvento: 'Japan Weekend / Salón Manga',
  nombreTienda: 'KiraKira Stand & Jewels',
  autoImprimirTicket: false
};
