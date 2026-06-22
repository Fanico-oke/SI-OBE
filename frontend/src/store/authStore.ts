import { create } from 'zustand';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  nama: string;
  role: 'ADMIN' | 'KAPRODI' | 'DOSEN' | 'MAHASISWA';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  validateToken: () => Promise<void>;
}

// Retrieve initial state from localStorage
const storedUser = localStorage.getItem('siobe_user');
const storedToken = localStorage.getItem('siobe_token');
const initialUser = storedUser ? JSON.parse(storedUser) : null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialUser,
  token: storedToken,
  isAuthenticated: !!initialUser && !!storedToken,
  login: (user, token) => {
    localStorage.setItem('siobe_user', JSON.stringify(user));
    localStorage.setItem('siobe_token', token);
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('siobe_user');
    localStorage.removeItem('siobe_token');
    localStorage.removeItem('si-obe-curriculum');
    set({ user: null, token: null, isAuthenticated: false });
  },
  validateToken: async () => {
    const { token, logout } = get();
    if (!token) return;
    try {
      // Decode JWT payload (base64) to check expiry
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        // Token expired — auto logout
        logout();
      }
    } catch {
      // Invalid token format — auto logout
      logout();
    }
  },
}));
