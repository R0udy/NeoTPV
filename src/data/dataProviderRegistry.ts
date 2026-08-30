import { DataProvider } from '../types';
import { MockProvider } from './MockProvider';
import { FirebaseProvider } from './FirebaseProvider';

const MOCK_TOGGLE_STORAGE_KEY = 'tpv_stand_mock_enabled_v1';

let currentMockProvider: MockProvider | null = null;
let currentFirebaseProvider: FirebaseProvider | null = null;

/**
 * Obtiene el estado del toggle de mock data.
 * Por especificación, por defecto es false (OFF -> FirebaseProvider).
 * Sin embargo, para la primera ejecución de demostración, el usuario puede activar/desactivar en 1 click.
 */
export function isMockDataEnabled(): boolean {
  const stored = localStorage.getItem(MOCK_TOGGLE_STORAGE_KEY);
  if (stored === null) {
    // Si no se ha configurado nunca, por defecto es false (OFF) según requerimiento,
    // pero si es la primera vez que se carga la demo podemos inicializarlo según preferencia.
    // Según requerimiento: "Por defecto: OFF (es decir, conexión a Firebase por defecto)."
    return false;
  }
  return stored === 'true';
}

export function setMockDataEnabled(enabled: boolean): void {
  localStorage.setItem(MOCK_TOGGLE_STORAGE_KEY, enabled ? 'true' : 'false');
}

/**
 * Obtiene el proveedor de datos activo según el toggle de configuración.
 * El resto de la aplicación interactúa únicamente a través de la interfaz DataProvider.
 */
export function getDataProvider(): DataProvider {
  const useMock = isMockDataEnabled();

  if (useMock) {
    if (!currentMockProvider) {
      currentMockProvider = new MockProvider();
    }
    return currentMockProvider;
  } else {
    if (!currentFirebaseProvider) {
      currentFirebaseProvider = new FirebaseProvider();
    }
    return currentFirebaseProvider;
  }
}

/**
 * Fuerza el reseteo de instancias de proveedores (p.ej. al cambiar de modo o limpiar datos)
 */
export function invalidateDataProvider(): void {
  currentMockProvider = null;
  currentFirebaseProvider = null;
}
