import { create } from 'zustand';
import axios from 'axios';

export type Modul = {
  id: string;
  kurikulumId: string;
  kode: string;
  nama: string;
  sks: number;
  semester: number;
  koordinator: string | null;
  status: 'Draft' | 'Review' | 'Approved';
};

// Dummy tasks for now until we build the Tugas backend
export type Tugas = {
  id: string;
  modulId: string;
  nama: string;
  tipe: 'Formatif' | 'Sumatif' | 'Proyek';
  bobot: number;
  deadline: string;
};

interface ModulState {
  moduls: Modul[];
  tugas: Tugas[];
  isLoading: boolean;
  error: string | null;
  
  fetchModuls: (kurikulumId?: string) => Promise<void>;
  fetchTugas: (modulId?: string) => Promise<void>;
  addModul: (modul: Omit<Modul, 'id' | 'status'>) => Promise<void>;
  updateModul: (id: string, data: Partial<Modul>) => void;
  deleteModul: (id: string) => Promise<void>;
  
  addTugas: (tugas: Omit<Tugas, 'id'>) => Promise<void>;
  deleteTugas: (id: string) => Promise<void>;
}

const API_URL = '/api';

export const useModulStore = create<ModulState>((set) => ({
  moduls: [],
  tugas: [
    {
      id: 't1',
      modulId: '1',
      nama: 'Proyek Analisis Bisnis',
      tipe: 'Proyek',
      bobot: 40,
      deadline: '2026-11-15'
    }
  ],
  isLoading: false,
  error: null,

  fetchModuls: async (kurikulumId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const url = kurikulumId ? `${API_URL}/modul?kurikulumId=${kurikulumId}` : `${API_URL}/modul`;
      const res = await axios.get(url);
      set({ moduls: res.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || err.message, isLoading: false });
    }
  },

  fetchTugas: async (modulId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const url = modulId ? `${API_URL}/tugas?modulId=${modulId}` : `${API_URL}/tugas`;
      const res = await axios.get(url);
      set({ tugas: res.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || err.message, isLoading: false });
    }
  },

  addModul: async (modul) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post(`${API_URL}/modul`, { ...modul, status: 'Draft' });
      set((state) => ({ 
        moduls: [...state.moduls, res.data],
        isLoading: false 
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.error || err.message, isLoading: false });
      throw err;
    }
  },

  deleteModul: async (id) => {
    try {
      await axios.delete(`${API_URL}/modul/${id}`);
      set((state) => ({
        moduls: state.moduls.filter(m => m.id !== id)
      }));
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  },

  updateModul: (id, data) => set((state) => ({
    moduls: state.moduls.map(m => m.id === id ? { ...m, ...data } : m)
  })),

  addTugas: async (tugas) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post(`${API_URL}/tugas`, tugas);
      set((state) => ({ 
        tugas: [...state.tugas, res.data],
        isLoading: false 
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.error || err.message, isLoading: false });
      throw err;
    }
  },

  deleteTugas: async (id) => {
    try {
      await axios.delete(`${API_URL}/tugas/${id}`);
      set((state) => ({
        tugas: state.tugas.filter(t => t.id !== id)
      }));
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }
}));
