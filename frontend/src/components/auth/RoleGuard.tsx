import { ReactNode, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  children: ReactNode;
  roles: string[];
  readOnlyFor?: string[];
}

export const RoleGuard = ({ children, roles, readOnlyFor = [] }: Props) => {
  const { user } = useAuthStore();
  const { addToast } = useAppStore();
  const toastShown = useRef(false);
  
  const allAllowed = [...roles, ...readOnlyFor];
  const hasAccess = user ? allAllowed.includes(user.role) : false;

  useEffect(() => {
    if (user && !hasAccess && !toastShown.current) {
      toastShown.current = true;
      addToast('Anda tidak memiliki akses ke halaman ini', 'error');
    }
  }, [user, hasAccess, addToast]);
  
  if (!user) return <Navigate to="/login" />;
  if (!hasAccess) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};
