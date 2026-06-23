import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

export type Curriculum = {
  id: string;
  nama: string;
  prodi: string;
  tahunMulai: number;
  tahunSelesai: number;
  deskripsi: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
};

interface CurriculumState {
  curriculums: Curriculum[];
  activeCurriculumId: string | null;
  activeCurriculumStatus: string | null;
  isLoading: boolean;
  error: string | null;
  
  fetchCurriculums: () => Promise<void>;
  addCurriculum: (curriculum: Omit<Curriculum, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  duplicateCurriculum: (data: any) => Promise<string>;
  updateCurriculum: (id: string, data: Partial<Curriculum>) => void;
  deleteCurriculum: (id: string) => Promise<void>;
  setActiveCurriculum: (id: string) => void;
  resetToActive: () => void;
}

export const useCurriculumStore = create<CurriculumState>()(
  persist(
    (set) => ({
      curriculums: [],
      activeCurriculumId: null,
      activeCurriculumStatus: null,
      isLoading: false,
      error: null,

      fetchCurriculums: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await axios.get('/api/kurikulum');
          const curriculums = res.data;
          const currentId = useCurriculumStore.getState().activeCurriculumId;
          const active = curriculums.find((k: Curriculum) => k.status === 'ACTIVE')
            || [...curriculums].sort((a: Curriculum, b: Curriculum) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
          const updates: any = { curriculums, isLoading: false };
          
          // Auto-select kurikulum if:
          // 1. No kurikulum selected
          // 2. Current selection no longer exists
          // 3. Current selection is ARCHIVED and there's an ACTIVE one
          if (active) {
            const current = currentId ? curriculums.find((k: Curriculum) => k.id === currentId) : null;
            if (!currentId || !current) {
              updates.activeCurriculumId = active.id;
              updates.activeCurriculumStatus = active.status;
            }
          }
          set(updates);
        } catch (err: any) {
          set({ error: err.response?.data?.error || err.message, isLoading: false });
        }
      },

      addCurriculum: async (curriculum) => {
        set({ isLoading: true, error: null });
        try {
          const res = await axios.post('/api/kurikulum', curriculum);
          const newCurriculum = res.data;
          set((state) => ({ 
            curriculums: [newCurriculum, ...state.curriculums],
            activeCurriculumId: newCurriculum.id,
            activeCurriculumStatus: newCurriculum.status || 'DRAFT',
            isLoading: false 
          }));
          return newCurriculum.id;
        } catch (err: any) {
          set({ error: err.response?.data?.error || err.message, isLoading: false });
          throw err;
        }
      },

      duplicateCurriculum: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const res = await axios.post('/api/kurikulum/duplicate', data);
          const newCurriculum = res.data;
          set((state) => ({ 
            curriculums: [newCurriculum, ...state.curriculums],
            activeCurriculumId: newCurriculum.id,
            activeCurriculumStatus: newCurriculum.status || 'DRAFT',
            isLoading: false 
          }));
          return newCurriculum.id;
        } catch (err: any) {
          set({ error: err.response?.data?.error || err.message, isLoading: false });
          throw err;
        }
      },

      // TODO: Sambungkan ke Backend (PUT & DELETE)
      updateCurriculum: (id, data) => set((state) => ({
        curriculums: state.curriculums.map((c) => 
          c.id === id ? { ...c, ...data } : c
        )
      })),

      deleteCurriculum: async (id) => {
        try {
          await axios.delete(`/api/kurikulum/${id}`);
          set((state) => ({
            curriculums: state.curriculums.filter((c) => c.id !== id)
          }));
        } catch (error) {
          console.error('Gagal menghapus kurikulum:', error);
          throw error;
        }
      },

      setActiveCurriculum: (id) => set((state) => {
        const found = state.curriculums.find(c => c.id === id);
        return { activeCurriculumId: id, activeCurriculumStatus: found?.status || null };
      }),

      resetToActive: () => set((state) => {
        const active = state.curriculums.find(c => c.status === 'ACTIVE')
          || [...state.curriculums].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        if (active) {
          return { activeCurriculumId: active.id, activeCurriculumStatus: active.status };
        }
        return {};
      }),
    }),
    {
      name: 'si-obe-curriculum',
      partialize: (state) => ({ activeCurriculumId: state.activeCurriculumId, activeCurriculumStatus: state.activeCurriculumStatus }),
    }
  )
);
