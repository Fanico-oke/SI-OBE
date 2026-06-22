import React from 'react';
import { motion } from 'framer-motion';

interface PhaseLayoutProps {
  title: string;
  description: string;
  icon: string;
  iconBgColorClass: string;
  iconTextColorClass: string;
  tabs: React.ReactNode;
  mainContent: React.ReactNode;
  sideContent: React.ReactNode;
}

export const PhaseLayout: React.FC<PhaseLayoutProps> = ({
  title,
  description,
  icon,
  iconBgColorClass,
  iconTextColorClass,
  tabs,
  mainContent,
  sideContent,
}) => {
  return (
    <div className="w-full space-y-4">
      {/* Page Header — Modern with gradient accent */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-3"
      >
        <div className={`relative w-11 h-11 rounded-xl ${iconBgColorClass} ${iconTextColorClass} flex items-center justify-center shrink-0 shadow-sm`}>
          <span className="material-symbols-outlined text-[22px] icon-fill relative z-10">
            {icon}
          </span>
          <div className={`absolute inset-0 rounded-xl ${iconBgColorClass} blur-lg opacity-40`}></div>
        </div>
        <div>
          <h1 className="page-header">{title}</h1>
          <p className="page-subtitle">{description}</p>
        </div>
      </motion.div>

      {/* Tabs — Modern pill-style in a glass container */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="bg-surface-container/50 backdrop-blur-sm rounded-2xl p-1.5 border border-outline-variant/30 overflow-x-auto no-scrollbar"
      >
        <div className="flex gap-1 min-w-max">
          {tabs}
        </div>
      </motion.div>

      {/* Content: Main + Side */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col xl:flex-row w-full gap-6"
      >
        <div className="flex-1 w-full min-w-0">
          {mainContent}
        </div>
        {sideContent && (
          <div className="w-full xl:w-[400px] shrink-0">
            <div className="sticky top-24 space-y-4">
              {sideContent}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
