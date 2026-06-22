import { useAuthStore } from '../store/authStore';

export const useIsReadOnly = () => {
  const { user } = useAuthStore();
  return user?.role === 'DOSEN'; // Dosen is read-only for Plan pages
};
