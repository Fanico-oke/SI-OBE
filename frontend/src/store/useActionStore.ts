import { create } from 'zustand';
import axios from 'axios';

export type ActionPlan = {
  id: string;
  kurikulumId: string;
  title: string;
  context: string;
  assignedTo: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Completed';
  cplId?: string;
  cpl?: any;
  createdAt: string;
};

interface ActionState {
  actions: ActionPlan[];
  isLoading: boolean;
  error: string | null;
  
  fetchActions: (kurikulumId?: string) => Promise<void>;
  addAction: (action: Omit<ActionPlan, 'id' | 'createdAt' | 'status' | 'cpl'>) => Promise<void>;
  updateActionStatus: (id: string, status: 'Active' | 'Completed') => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
}

const API_URL = '/api/act';

export const useActionStore = create<ActionState>((set) => ({
  actions: [],
  isLoading: false,
  error: null,

  fetchActions: async (kurikulumId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const url = kurikulumId ? `${API_URL}/action-plan?kurikulumId=${kurikulumId}` : `${API_URL}/action-plan`;
      const res = await axios.get(url);
      set({ actions: res.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || err.message, isLoading: false });
    }
  },

  addAction: async (action) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post(`${API_URL}/action-plan`, action);
      set((state) => ({ 
        actions: [res.data, ...state.actions],
        isLoading: false 
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.error || err.message, isLoading: false });
      throw err;
    }
  },

  updateActionStatus: async (id, status) => {
    set({ isLoading: true, error: null });
    try {
      await axios.put(`${API_URL}/action-plan/${id}/status`, { status });
      set((state) => ({
        actions: state.actions.map(a => a.id === id ? { ...a, status } : a),
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.error || err.message, isLoading: false });
    }
  },

  deleteAction: async (id) => {
    try {
      await axios.delete(`${API_URL}/action-plan/${id}`);
      set((state) => ({
        actions: state.actions.filter(a => a.id !== id)
      }));
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }
}));
