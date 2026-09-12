/**
 * Configuración centralizada de Firebase (Firestore & Auth)
 *
 * Los valores se leen y sanitizan de variables de entorno VITE_FIREBASE_* (ver .env).
 * Si no hay credenciales, la app sigue funcionando en modo stub en memoria
 * (ver FirebaseProvider) y NUNCA toca los datos mock de localStorage.
 */

import { initializeApp, type FirebaseApp, getApps } from 'firebase/app';
import {
  getAuth,
  type Auth,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';
import {
  initializeFirestore,
  type Firestore,
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

/**
 * Sanitiza valores de variables de entorno limpiando comillas dobles/simples,
 * comas finales o espacios residuales que puedan venir de archivos .env editados manualmente.
 */
export function sanitizeEnv(val: unknown): string {
  if (!val || typeof val !== 'string') return '';
  let str = val.trim();
  // Eliminar comas o punto y coma al final
  str = str.replace(/[,;\s]+$/, '').trim();
  // Eliminar comillas dobles o simples envolventes de forma iterativa
  while (
    (str.startsWith('"') && str.endsWith('"')) ||
    (str.startsWith("'") && str.endsWith("'"))
  ) {
    str = str.slice(1, -1).trim();
  }
  // Eliminar comillas residuales al principio o al final
  str = str.replace(/^["'`]+/, '').replace(/["'`,;\s]+$/, '').trim();
  return str;
}

export const firebaseConfig: FirebaseClientConfig = {
  apiKey: sanitizeEnv(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: sanitizeEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: sanitizeEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: sanitizeEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: sanitizeEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: sanitizeEnv(import.meta.env.VITE_FIREBASE_APP_ID),
  measurementId: sanitizeEnv(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID),
};

/**
 * Nombres de colecciones en Firestore
 */
export const FIRESTORE_COLLECTIONS = {
  PRODUCTOS: 'productos',
  EVENTOS: 'eventos',
  VENTAS: 'ventas',
  AJUSTES: 'ajustes',
} as const;

/**
 * ¿Hay credenciales reales de Firebase disponibles?
 * Basta con que exista el projectId y apiKey limpios.
 */
export const isFirebaseConfigured = (): boolean => {
  const projectId = sanitizeEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID);
  const apiKey = sanitizeEnv(import.meta.env.VITE_FIREBASE_API_KEY);
  return Boolean(
    projectId &&
    apiKey &&
    projectId !== 'tu-stand-eventos' &&
    !projectId.includes('TODO')
  );
};

/**
 * Inicialización perezosa: la app y Firestore solo se crean la primera vez
 * que se necesitan, y únicamente si hay credenciales configuradas.
 * Usamos initializeFirestore con ignoreUndefinedProperties para que los
 * campos opcionales (undefined) no rompan las escrituras en Firestore.
 */
let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!_app) {
    const existingApps = getApps();
    _app = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig);
  }
  return _app;
}

export function getFirebaseAuth(): Auth {
  if (!isFirebaseConfigured()) {
    throw new Error(
      '[Firebase] No hay credenciales válidas configuradas para Firebase Auth.'
    );
  }
  if (!_auth) {
    const app = getFirebaseApp();
    _auth = getAuth(app);
    // Asegurar persistencia local en el navegador
    try {
      setPersistence(_auth, browserLocalPersistence);
    } catch (e) {
      console.warn('[Firebase Auth] No se pudo configurar persistencia local explícita:', e);
    }
  }
  return _auth;
}

export function getDb(): Firestore {
  if (!isFirebaseConfigured()) {
    throw new Error(
      '[Firebase] No hay credenciales válidas configuradas. Define las variables VITE_FIREBASE_* en tu .env.'
    );
  }
  if (!_db) {
    const app = getFirebaseApp();
    try {
      _db = initializeFirestore(app, {
        ignoreUndefinedProperties: true,
      });
    } catch {
      _db = getFirestore(app);
    }
  }
  return _db;
}

/**
 * Prueba la conexión en vivo con Firebase Firestore realizando una lectura y escritura de prueba.
 * Devuelve un diagnóstico detallado con la causa raíz exacta si falla.
 */
export async function testFirebaseConnection(): Promise<{
  success: boolean;
  message: string;
  code?: string;
  details?: string;
}> {
  if (!isFirebaseConfigured()) {
    return {
      success: false,
      message: 'Credenciales no detectadas en variables de entorno VITE_FIREBASE_*',
      code: 'unconfigured',
    };
  }

  try {
    const db = getDb();
    const testDocRef = doc(db, '_connection_test', 'ping');
    
    // 1. Intentar escribir un documento de ping
    await setDoc(testDocRef, {
      timestamp: Date.now(),
      clientTime: new Date().toISOString(),
      app: 'Stand Eventos TPV',
    });

    // 2. Intentar leerlo
    const snap = await getDoc(testDocRef);
    if (!snap.exists()) {
      return {
        success: false,
        message: 'Se escribió el ping pero no se pudo leer el documento de verificación.',
        code: 'read-failed',
      };
    }

    return {
      success: true,
      message: `¡Conexión exitosa con Firestore! Proyecto: "${firebaseConfig.projectId}"`,
    };
  } catch (err: any) {
    const code = err?.code || 'unknown';
    const rawMsg = err?.message || String(err);

    let friendlyMessage = 'Error al conectar con Firestore.';
    let details = rawMsg;

    if (code === 'permission-denied') {
      friendlyMessage =
        'Reglas de seguridad bloquean el acceso (permission-denied). En Firebase Console > Firestore Database > pestaña "Reglas", debes habilitar permisos de lectura y escritura.';
      details = 'Reglas actuales: bloquean lectura/escritura sin autenticación.';
    } else if (code === 'not-found' || rawMsg.includes('does not exist') || rawMsg.includes('database')) {
      friendlyMessage =
        `La base de datos Firestore no existe aún en el proyecto "${firebaseConfig.projectId}". Ve a Firebase Console y pulsa "Crear base de datos" en Firestore Database.`;
    } else if (code === 'unavailable' || rawMsg.includes('offline')) {
      friendlyMessage =
        'Firestore responde que el cliente está desconectado o la base de datos no está disponible. Suele ocurrir si la base de datos Firestore no ha sido creada todavía en la consola o si hay bloqueo temporal de red.';
    } else if (code === 'auth/api-key-not-valid' || rawMsg.includes('API key not valid')) {
      friendlyMessage = 'La API Key de Firebase no es válida para este proyecto o está restringida.';
    }

    return {
      success: false,
      message: friendlyMessage,
      code,
      details,
    };
  }
}


