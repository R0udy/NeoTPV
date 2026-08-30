/**
 * Configuración centralizada de Firebase (Firestore & Auth)
 * 
 * TODO: Rellenar las credenciales reales de tu proyecto de Firebase
 * cuando se conecte el entorno de producción en Vercel o local.
 */

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// TODO: Sustituir estos valores por tus credenciales de Firebase Console
export const firebaseConfig: FirebaseClientConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSy_TODO_TU_API_KEY_AQUI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tu-stand-eventos.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tu-stand-eventos",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tu-stand-eventos.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef123456"
};

/**
 * Nombres de colecciones en Firestore
 */
export const FIRESTORE_COLLECTIONS = {
  PRODUCTOS: "productos",
  VENTAS: "ventas",
  ESTADO_CAJA: "estado_caja",
  AJUSTES: "ajustes_stand"
} as const;

/**
 * TODO: Integración real con Firebase SDK
 * Para habilitar Firebase en producción:
 * 1. Descomentar `import { initializeApp } from 'firebase/app';`
 * 2. Descomentar `import { getFirestore } from 'firebase/firestore';`
 * 3. Inicializar app y db:
 *    export const app = initializeApp(firebaseConfig);
 *    export const db = getFirestore(app);
 */
export const isFirebaseConfigured = (): boolean => {
  return (
    Boolean(import.meta.env.VITE_FIREBASE_PROJECT_ID) &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID !== "tu-stand-eventos"
  );
};
