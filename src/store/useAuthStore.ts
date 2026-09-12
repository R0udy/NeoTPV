import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {
  getFirebaseAuth,
  getDb,
  isFirebaseConfigured,
} from '../config/firebaseConfig';

export interface AdminUser {
  uid?: string;
  name: string;
  email: string;
  role: 'advanced' | 'standard' | string;
}

interface AuthState {
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  user: AdminUser | null;
  authError: string | null;
  login: (
    email: string,
    password: string,
    rememberMachine?: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  initAuth: () => () => void;
  clearError: () => void;
}

const MACHINE_AUTH_KEY = 'tpv_stand_machine_session_v2';

/**
 * Intenta obtener el perfil del usuario desde Firestore (colección 'admins' o 'users')
 * donde se almacena { name, role: 'advanced' }
 */
async function fetchAdminProfile(fbUser: FirebaseUser): Promise<AdminUser> {
  const defaultProfile: AdminUser = {
    uid: fbUser.uid,
    email: fbUser.email || '',
    name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Administrador',
    role: 'advanced',
  };

  if (!isFirebaseConfigured()) {
    return defaultProfile;
  }

  try {
    const db = getDb();

    // 1. Probar en colección 'admins' con su UID
    const adminDoc = await getDoc(doc(db, 'admins', fbUser.uid));
    if (adminDoc.exists()) {
      const data = adminDoc.data();
      return {
        uid: fbUser.uid,
        email: fbUser.email || '',
        name: data.name || data.nombre || defaultProfile.name,
        role: data.role || data.rol || 'advanced',
      };
    }

    // 2. Probar en colección 'admins' con su email como ID
    if (fbUser.email) {
      const adminByEmailDoc = await getDoc(doc(db, 'admins', fbUser.email));
      if (adminByEmailDoc.exists()) {
        const data = adminByEmailDoc.data();
        return {
          uid: fbUser.uid,
          email: fbUser.email,
          name: data.name || data.nombre || defaultProfile.name,
          role: data.role || data.rol || 'advanced',
        };
      }
    }

    // 3. Probar en colección 'users' con su UID
    const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        uid: fbUser.uid,
        email: fbUser.email || '',
        name: data.name || data.nombre || defaultProfile.name,
        role: data.role || data.rol || 'advanced',
      };
    }
  } catch (error) {
    console.warn('[useAuthStore] No se pudo leer documento de admin en Firestore:', error);
  }

  return defaultProfile;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Comprobar si la máquina tenía sesión guardada
  const hasSavedSession = localStorage.getItem(MACHINE_AUTH_KEY) === 'true';

  return {
    isAuthenticated: false,
    isCheckingAuth: true,
    user: null,
    authError: null,

    clearError: () => set({ authError: null }),

    initAuth: () => {
      if (!isFirebaseConfigured()) {
        // Modo local sin credenciales Firebase:
        // Si la máquina tiene sesión guardada, autorizar directamente
        if (hasSavedSession) {
          set({
            isAuthenticated: true,
            isCheckingAuth: false,
            user: {
              name: 'Administrador Stand',
              email: 'admin@standeventos.es',
              role: 'advanced',
            },
          });
        } else {
          // Exigir login inicial
          set({
            isAuthenticated: false,
            isCheckingAuth: false,
            user: null,
          });
        }
        return () => {};
      }

      try {
        const auth = getFirebaseAuth();
        // Escuchar cambios de autenticación en Firebase
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
          if (fbUser) {
            const profile = await fetchAdminProfile(fbUser);
            localStorage.setItem(MACHINE_AUTH_KEY, 'true');
            set({
              isAuthenticated: true,
              isCheckingAuth: false,
              user: profile,
              authError: null,
            });
          } else {
            // Usuario no autenticado en Firebase
            const saved = localStorage.getItem(MACHINE_AUTH_KEY) === 'true';
            // Si no hay usuario activo en Firebase, el login es obligatorio
            set({
              isAuthenticated: false,
              isCheckingAuth: false,
              user: null,
            });
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error('[useAuthStore] Error inicializando listener de Firebase Auth:', error);
        set({ isCheckingAuth: false, isAuthenticated: false });
        return () => {};
      }
    },

    login: async (email: string, password: string, rememberMachine = true) => {
      set({ authError: null });

      const cleanEmail = email.trim();
      const cleanPassword = password.trim();

      if (!cleanEmail || !cleanPassword) {
        const msg = 'Por favor, introduce tu correo y contraseña.';
        set({ authError: msg });
        return { success: false, error: msg };
      }

      if (!isFirebaseConfigured()) {
        // Fallback local
        const user: AdminUser = {
          name: cleanEmail.split('@')[0] || 'Administrador',
          email: cleanEmail,
          role: 'advanced',
        };
        if (rememberMachine) {
          localStorage.setItem(MACHINE_AUTH_KEY, 'true');
        } else {
          localStorage.removeItem(MACHINE_AUTH_KEY);
        }
        set({ isAuthenticated: true, user, authError: null, isCheckingAuth: false });
        return { success: true };
      }

      try {
        const auth = getFirebaseAuth();
        const userCred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        const profile = await fetchAdminProfile(userCred.user);

        if (rememberMachine) {
          localStorage.setItem(MACHINE_AUTH_KEY, 'true');
        } else {
          localStorage.removeItem(MACHINE_AUTH_KEY);
        }

        set({
          isAuthenticated: true,
          user: profile,
          authError: null,
          isCheckingAuth: false,
        });

        return { success: true };
      } catch (error: any) {
        const code = error?.code || '';
        let errorMsg = 'Error al iniciar sesión. Comprueba tus credenciales.';

        if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
          errorMsg = 'Correo electrónico o contraseña incorrectos.';
        } else if (code === 'auth/invalid-email') {
          errorMsg = 'El formato del correo electrónico no es válido.';
        } else if (code === 'auth/user-disabled') {
          errorMsg = 'Esta cuenta de administrador ha sido deshabilitada.';
        } else if (code === 'auth/too-many-requests') {
          errorMsg = 'Demasiados intentos fallidos. Espera unos instantes antes de volver a intentar.';
        } else if (code === 'auth/network-request-failed') {
          errorMsg = 'Error de conexión con Firebase Authentication. Comprueba tu red.';
        } else if (error?.message) {
          errorMsg = error.message;
        }

        set({ authError: errorMsg });
        return { success: false, error: errorMsg };
      }
    },

    logout: async () => {
      localStorage.removeItem(MACHINE_AUTH_KEY);
      if (isFirebaseConfigured()) {
        try {
          const auth = getFirebaseAuth();
          await signOut(auth);
        } catch (e) {
          console.warn('[useAuthStore] Error en signOut de Firebase:', e);
        }
      }
      set({ isAuthenticated: false, user: null, authError: null });
    },
  };
});

