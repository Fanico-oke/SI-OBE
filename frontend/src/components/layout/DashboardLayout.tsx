import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SideNavBar from './SideNavBar';
import TopNavBar from './TopNavBar';
import PDCANav from './PDCANav';
import { ToastContainer } from '../ui/ToastContainer';
import WelcomePopup from '../ui/WelcomePopup';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/authStore';
import { useCurriculumStore } from '../../store/useCurriculumStore';

export default function DashboardLayout() {
  const location = useLocation();
  const { sidebarCollapsed, darkMode } = useAppStore();
  const { user } = useAuthStore();
  const { activeCurriculumId, curriculums } = useCurriculumStore();
  const isViewingArchived = curriculums.find(c => c.id === activeCurriculumId)?.status === 'ARCHIVED';
  const pdcaPaths = ['/plan', '/do', '/check', '/act'];
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const welcomed = sessionStorage.getItem('si-obe-welcomed');
    if (!welcomed && user?.nama) {
      const timer = setTimeout(() => setShowWelcome(true), 500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    sessionStorage.setItem('si-obe-welcomed', 'true');
  };

  const sidebarWidth = sidebarCollapsed ? 72 : 260;

  const mobileNavLinks = [
    { to: '/', label: 'Home', icon: 'dashboard', roles: ['ADMIN', 'KAPRODI', 'DOSEN', 'MAHASISWA'] },
    { to: '/kurikulum', label: 'Kurikulum', icon: 'menu_book', roles: ['ADMIN', 'KAPRODI', 'DOSEN'] },
    { to: '/plan', label: 'Plan', icon: 'event_note', roles: ['KAPRODI'] },
    { to: '/do', label: 'Do', icon: 'play_circle', roles: ['KAPRODI', 'DOSEN'] },
    { to: '/check', label: 'Check', icon: 'fact_check', roles: ['KAPRODI'] },
    { to: '/act', label: 'Act', icon: 'update', roles: ['KAPRODI'] },
    { to: '/bantuan', label: 'Bantuan', icon: 'help', roles: ['ADMIN', 'KAPRODI', 'DOSEN', 'MAHASISWA'] },
    { to: '/profil', label: 'Profil', icon: 'account_circle', roles: ['ADMIN', 'KAPRODI', 'DOSEN', 'MAHASISWA'] }
  ].filter(link => !user?.role || link.roles.includes(user.role));

  return (
    <div className={`min-h-screen bg-background text-on-background font-body text-body${darkMode ? ' dark' : ''}`}>
      <TopNavBar />
      <SideNavBar />
      <PDCANav />
      <ToastContainer />

      {/* Welcome Popup */}
      <AnimatePresence>
        {showWelcome && (
          <WelcomePopup userName={user?.nama || 'User'} onClose={handleCloseWelcome} />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        className="transition-all duration-300 ease-in-out"
        style={{
          marginLeft: sidebarWidth,
          paddingTop: 88,
          paddingLeft: 24,
          paddingRight: 24,
          paddingBottom: 32,
          minHeight: '100vh',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant shadow-nav z-50 flex justify-around items-center h-16 px-2">
        {mobileNavLinks.map((link) => {
          const isActive = location.pathname === link.to;
          const isPdca = pdcaPaths.includes(link.to);
          const isDisabled = isPdca && isViewingArchived;

          if (isDisabled) {
            return (
              <div
                key={link.to}
                className="flex flex-col items-center justify-center w-full h-full opacity-30 cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[22px]">{link.icon}</span>
                <span className="font-caption text-[10px] mt-0.5">{link.label}</span>
              </div>
            );
          }

          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                isActive ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {link.icon}
              </span>
              <span className={`font-caption text-[10px] mt-0.5 ${isActive ? 'font-bold' : ''}`}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}