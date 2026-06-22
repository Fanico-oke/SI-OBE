import { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';

export default function PDCANav() {
  const location = useLocation();
  const { sidebarCollapsed } = useAppStore();
  const path = location.pathname;

  const [isVisible, setIsVisible] = useState(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Only render for PDCA routes
  const isPDCARoute = path.startsWith('/plan') || path.startsWith('/do') || path.startsWith('/check') || path.startsWith('/act');
  
  if (!isPDCARoute) return null;

  const tabs = [
    { id: 'plan', label: 'Plan', icon: 'event_note', to: '/plan' },
    { id: 'do', label: 'Do', icon: 'play_circle', to: '/do' },
    { id: 'check', label: 'Check', icon: 'fact_check', to: '/check' },
    { id: 'act', label: 'Act', icon: 'update', to: '/act' },
  ];

  const clearHideTimeout = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const showBar = () => {
    clearHideTimeout();
    setIsVisible(true);
  };

  const scheduleHide = () => {
    clearHideTimeout();
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 600);
  };

  return (
    <>
      {/* Invisible Trigger Zone — hover here to show PDCA bar */}
      <div
        className={`fixed top-[64px] right-0 h-2 z-45 cursor-default transition-all duration-300 ${
          sidebarCollapsed
            ? 'w-full md:w-[calc(100%-72px)]'
            : 'w-full md:w-[calc(100%-260px)]'
        }`}
        onMouseEnter={showBar}
      />

      {/* PDCA Slide-Down Bar */}
      <div
        ref={barRef}
        className={`fixed top-[64px] right-0 z-44 bg-surface/95 backdrop-blur-md border-b border-outline-variant/50 shadow-sm flex justify-center items-center py-2.5 px-6 transition-all duration-300 ${
          sidebarCollapsed
            ? 'w-full md:w-[calc(100%-72px)]'
            : 'w-full md:w-[calc(100%-260px)]'
        }`}
        style={{
          transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
          opacity: isVisible ? 1 : 0,
          transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms ease',
          pointerEvents: isVisible ? 'auto' : 'none',
        }}
        onMouseEnter={showBar}
        onMouseLeave={scheduleHide}
      >
        <nav className="pdca-pill-container">
          {tabs.map((tab) => {
            const active = path.startsWith(tab.to);
            return (
              <Link
                key={tab.id}
                to={tab.to}
                className={active ? 'pdca-pill-active' : 'pdca-pill-inactive'}
              >
                {active && (
                  <motion.div
                    layoutId="pdcaPill"
                    className="absolute inset-0 bg-primary/10 rounded-full -z-10 border border-primary/20"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="material-symbols-outlined text-[18px] mr-1.5">{tab.icon}</span>
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {/* Close hint */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <button
            onClick={() => setIsVisible(false)}
            className="btn-icon p-1.5 opacity-50 hover:opacity-100"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      </div>
    </>
  );
}
