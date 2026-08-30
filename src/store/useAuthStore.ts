import { create } from 'zustand';

export interface AdminUser {
  nombre: string;
  email: string;
  rol: 'administrador' | 'encargado_stand';
}

interface AuthState {
  isAuthenticated: boolean;
  user: AdminUser | null;
  login: (email?: string, password?: string) => void;
  logout: () => void;
}

const AUTH_STORAGE_KEY = 'tpv_stand_auth_v1';

export const useAuthStore = create<AuthState>((set) => {
  // Login stub: recuperar estado de sesión o por defecto permitir acceso
  const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
  const initialAuthed = storedAuth !== 'false';

  return {
    isAuthenticated: initialAuthed,
    user: initialAuthed
      ? {
          nombre: 'Administrador Stand',
          email: 'admin@standeventos.es',
          rol: 'administrador'
        }
      : null,

    login: (email = 'admin@standeventos.es') => {
      const user: AdminUser = {
        nombre: 'Administrador Stand',
        email,
        rol: 'administrador'
      };
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      set({ isAuthenticated: true, user });
    },

    logout: () => {
      localStorage.setItem(AUTH_STORAGE_KEY, 'false');
      set({ isAuthenticated: false, user: null });
    }
  };
});
