import { Link, useLocation, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/useAppStore';
import { useCurriculumStore } from '../../store/useCurriculumStore';
import { useState, useEffect } from 'react';

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  const h = time.getHours().toString().padStart(2, '0');
  const m = time.getMinutes().toString().padStart(2, '0');
  return <span className="font-data-mono text-data-mono tabular-nums">{h}:{m}</span>;
}

export default function SideNavBar() {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const { activeCurriculumId, curriculums } = useCurriculumStore();

  const isViewingArchived = curriculums.find(c => c.id === activeCurriculumId)?.status === 'ARCHIVED';
  const hasActiveCurriculum = curriculums.some(c => c.status === 'ACTIVE');
  const noActiveExists = !hasActiveCurriculum;

  const allNavLinks = [
    { to: '/', label: 'Dashboard', icon: 'dashboard', roles: ['ADMIN', 'KAPRODI', 'DOSEN', 'MAHASISWA'] },
    { to: '/kurikulum', label: 'Kurikulum', icon: 'menu_book', roles: ['ADMIN', 'KAPRODI', 'DOSEN'] },
    { to: '/laporan', label: 'Laporan OBE', icon: 'assessment', roles: ['ADMIN', 'KAPRODI', 'MAHASISWA'] },
    { to: '/rapor-obe', label: 'Rapor Saya', icon: 'radar', roles: ['MAHASISWA'] },
    { to: '/audit-log', label: 'Audit Log', icon: 'history', roles: ['ADMIN', 'KAPRODI'] },
    { to: '/notifikasi', label: 'Notifikasi', icon: 'notifications', roles: ['ADMIN', 'KAPRODI', 'DOSEN', 'MAHASISWA'] },
  ];

  const navLinks = allNavLinks.filter(link => !user?.role || link.roles.includes(user.role));

  const allPdcaLinks = [
    { label: 'Plan', icon: 'event_note', to: '/plan', desc: 'Perencanaan', roles: ['KAPRODI'] },
    { label: 'Do', icon: 'play_circle', to: '/do', desc: 'Pelaksanaan', roles: ['KAPRODI', 'DOSEN'] },
    { label: 'Check', icon: 'fact_check', to: '/check', desc: 'Evaluasi', roles: ['KAPRODI'] },
    { label: 'Act', icon: 'update', to: '/act', desc: 'Tindakan', roles: ['KAPRODI'] },
  ];

  const pdcaLinks = allPdcaLinks.filter(link => !user?.role || link.roles.includes(user.role));

  const bottomLinks = [
    { to: '/peran', label: 'Kelola User', icon: 'group', roles: ['ADMIN'] },
    { to: '/settings', label: 'Settings', icon: 'settings', roles: ['ADMIN'] },
    { to: '/bantuan', label: 'Help Center', icon: 'help' },
  ].filter(link => !link.roles || (user?.role && link.roles.includes(user.role)));

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <nav
      className="hidden md:flex fixed left-0 top-0 h-full bg-surface-dark border-r border-white/10 flex-col overflow-hidden z-50 sidebar-transition"
      style={{ width: sidebarCollapsed ? 72 : 260 }}
    >
      {/* ── Brand Section ── */}
      <div className={`shrink-0 ${sidebarCollapsed ? 'p-3' : 'p-5 pb-4'}`}>
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-tertiary to-primary flex items-center justify-center font-bold text-lg text-white shrink-0 shadow-lg">
            <span className="relative z-10">S</span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-tertiary to-primary blur-md opacity-50"></div>
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                className="overflow-hidden min-w-0"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="font-h3 text-h3 font-bold text-on-surface-dark truncate flex items-center gap-1.5">
                  SI-OBE <span className="text-xs opacity-60 font-normal">✨</span>
                </h1>
                <p className="font-caption text-[10px] text-on-surface-dark-dim truncate uppercase tracking-widest">
                  Outcome Based Education
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Animated gradient bar */}
        <div className="sidebar-gradient-bar mt-3" />
      </div>

      {/* ── Main Navigation ── */}
      <div className="flex-1 py-2 overflow-y-auto sidebar-dark-scroll">
        {/* Menu Utama */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.p
              className="sidebar-section-label px-5 mb-2"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              Menu
            </motion.p>
          )}
        </AnimatePresence>
        <ul className={`space-y-0.5 ${sidebarCollapsed ? 'px-2' : 'px-3'} mb-4`}>
          {navLinks.map((link) => {
            const active = isActive(link.to);
            return (
              <li key={link.to} className="group relative">
                <Link
                  to={link.to}
                  onClick={() => {
                    if (isViewingArchived) useCurriculumStore.getState().resetToActive();
                  }}
                  className={
                    sidebarCollapsed
                      ? (active ? 'nav-item-collapsed-active' : 'nav-item-collapsed')
                      : (active ? 'nav-item-active' : 'nav-item')
                  }
                >
                  {active && !sidebarCollapsed && (
                    <motion.div
                      className="nav-active-indicator"
                      layoutId="nav-indicator"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="material-symbols-outlined text-[20px] relative z-[1]" style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    {link.icon}
                  </span>
                  {!sidebarCollapsed && <span className="relative z-[1]">{link.label}</span>}
                </Link>
                {sidebarCollapsed && (
                  <div className="sidebar-tooltip">{link.label}</div>
                )}
              </li>
            );
          })}
        </ul>

        {/* PDCA Cycle — Prominent Section */}
        <div className={`${sidebarCollapsed ? 'px-2' : 'px-3'}`}>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                className="px-2 mb-2"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                <div className="flex items-center gap-2">
                  <span className="sidebar-section-label">Siklus PDCA</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent"></div>
                  {noActiveExists && (
                    <span className="material-symbols-outlined text-[14px] text-warning/70" title="Tidak ada kurikulum aktif">lock</span>
                  )}
                </div>
                {noActiveExists && (
                  <p className="text-[10px] text-warning/60 mt-1">Tidak ada kurikulum aktif</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="space-y-0.5">
            {pdcaLinks.map(item => {
              const pdcaActive = isActive(item.to);
              const isDisabled = isViewingArchived || noActiveExists;
              const disabledReason = noActiveExists
                ? 'Tidak ada kurikulum aktif. Buat kurikulum baru terlebih dahulu.'
                : 'Kembali ke kurikulum aktif terlebih dahulu';
              const tooltipSuffix = noActiveExists ? '(⚠ Tidak ada kurikulum)' : '(🔒 Arsip)';

              if (isDisabled) {
                return (
                  <div key={item.label} className="group relative">
                    <div
                      className={
                        sidebarCollapsed
                          ? 'nav-item-collapsed opacity-40 cursor-not-allowed'
                          : 'nav-item opacity-40 cursor-not-allowed'
                      }
                      title={disabledReason}
                    >
                      <span className="material-symbols-outlined text-[20px] relative z-[1]">{item.icon}</span>
                      {!sidebarCollapsed && (
                        <div className="relative z-[1] flex flex-col">
                          <span className="font-medium">{item.label}</span>
                          <span className="text-[10px] text-on-surface-dark-dim/60 -mt-0.5">{item.desc}</span>
                        </div>
                      )}
                    </div>
                    {sidebarCollapsed && (
                      <div className="sidebar-tooltip">{item.label} {tooltipSuffix}</div>
                    )}
                  </div>
                );
              }

              return (
                <div key={item.label} className="group relative">
                  <NavLink
                    to={item.to}
                    end={item.to === '/plan'}
                    className={({ isActive: active }) =>
                      sidebarCollapsed
                        ? (active ? 'nav-item-collapsed-active' : 'nav-item-collapsed')
                        : (active ? 'nav-item-active' : 'nav-item')
                    }
                  >
                    {pdcaActive && !sidebarCollapsed && (
                      <motion.div
                        className="nav-active-indicator"
                        layoutId="nav-indicator"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    <span className="material-symbols-outlined text-[20px] relative z-[1]">{item.icon}</span>
                    {!sidebarCollapsed && (
                      <div className="relative z-[1] flex flex-col">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-[10px] text-on-surface-dark-dim/60 -mt-0.5">{item.desc}</span>
                      </div>
                    )}
                  </NavLink>
                  {sidebarCollapsed && (
                    <div className="sidebar-tooltip">{item.label}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Bottom Section ── */}
      <div className={`border-t border-white/5 shrink-0 ${sidebarCollapsed ? 'p-2' : 'p-3'}`}>
        {/* Utility Links */}
        <ul className="space-y-0.5 mb-2">
          {bottomLinks.map((link) => {
            const active = isActive(link.to);
            return (
              <li key={link.to} className="group relative">
                <Link
                  to={link.to}
                  className={
                    sidebarCollapsed
                      ? (active ? 'nav-item-collapsed-active' : 'nav-item-collapsed')
                      : (active ? 'nav-item-active' : 'nav-item')
                  }
                >
                  {active && !sidebarCollapsed && (
                    <motion.div
                      className="nav-active-indicator"
                      layoutId="nav-indicator"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="material-symbols-outlined text-[20px] relative z-[1]">{link.icon}</span>
                  {!sidebarCollapsed && <span className="relative z-[1]">{link.label}</span>}
                </Link>
                {sidebarCollapsed && (
                  <div className="sidebar-tooltip">{link.label}</div>
                )}
              </li>
            );
          })}
        </ul>

        {/* User Info + Status */}
        <div className={`rounded-xl bg-white/[0.04] mb-2 ${sidebarCollapsed ? 'p-2' : 'p-3'}`}>
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="relative shrink-0">
              <div className="h-8 w-8 rounded-lg bg-tertiary/20 text-tertiary flex items-center justify-center text-sm font-bold">
                {user?.nama?.charAt(0) || 'U'}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success/60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success border-2 border-surface-dark" />
              </span>
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  className="overflow-hidden min-w-0 flex-1"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                >
                  <p className="text-xs font-semibold text-on-surface-dark truncate">{user?.nama || 'User'}</p>
                  <p className="text-[10px] text-on-surface-dark-dim flex items-center gap-1">
                    <span className="text-success">●</span> Online · <LiveClock />
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Logout + Toggle */}
        <div className={`flex ${sidebarCollapsed ? 'flex-col' : ''} gap-1`}>
          <button
            onClick={() => logout()}
            className={`flex items-center rounded-xl text-error/70 hover:bg-error/15 hover:text-error transition-all duration-150 ${
              sidebarCollapsed ? 'justify-center p-2.5 w-full' : 'gap-2 px-3 py-2 flex-1'
            }`}
            title="Keluar"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            {!sidebarCollapsed && <span className="text-sm font-medium">Keluar</span>}
          </button>
          <button
            onClick={toggleSidebar}
            className={`flex items-center rounded-xl text-on-surface-dark-dim hover:bg-white/10 hover:text-on-surface-dark transition-all duration-150 ${
              sidebarCollapsed ? 'justify-center p-2.5 w-full' : 'px-2.5 py-2'
            }`}
            title={sidebarCollapsed ? 'Expand' : 'Collapse'}
          >
            <motion.span
              className="material-symbols-outlined text-[18px]"
              animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              chevron_left
            </motion.span>
          </button>
        </div>
      </div>
    </nav>
  );
}