import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomePopupProps {
  userName: string;
  onClose: () => void;
}

const SESSION_KEY = 'si-obe-welcome-shown';

const CONFETTI_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f59e0b', '#10b981', '#06b6d4', '#3b82f6',
];

interface ConfettiDot {
  id: number;
  left: string;
  size: number;
  color: string;
  delay: number;
  duration: number;
}

const generateConfetti = (count: number): ConfettiDot[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 6 + 4,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    delay: Math.random() * 2,
    duration: Math.random() * 2 + 2,
  }));

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.75, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 300,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.85,
    y: 20,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

const emojiVariants = {
  hidden: { scale: 0, rotate: -30 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      damping: 10,
      stiffness: 200,
      delay: 0.2,
    },
  },
};

const textVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.3 + i * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  }),
};

export const WelcomePopup: React.FC<WelcomePopupProps> = ({ userName, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const confettiDots = useMemo(() => generateConfetti(24), []);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem(SESSION_KEY);
    if (alreadyShown) {
      onClose();
      return;
    }

    sessionStorage.setItem(SESSION_KEY, 'true');
    setIsVisible(true);

    const timer = setTimeout(handleDismiss, 3000);
    return () => clearTimeout(timer);
  }, [handleDismiss, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.25 }}
          onClick={handleDismiss}
          style={{ cursor: 'pointer' }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

          {/* Confetti particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {confettiDots.map((dot) => (
              <span
                key={dot.id}
                className="absolute rounded-full animate-confetti-float"
                style={{
                  left: dot.left,
                  bottom: '-10px',
                  width: dot.size,
                  height: dot.size,
                  backgroundColor: dot.color,
                  animationDelay: `${dot.delay}s`,
                  animationDuration: `${dot.duration}s`,
                  opacity: 0,
                }}
              />
            ))}
          </div>

          {/* Card */}
          <motion.div
            className="relative z-10 w-full max-w-sm mx-4 overflow-hidden rounded-2xl shadow-2xl"
            variants={cardVariants}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            style={{ cursor: 'default' }}
          >
            {/* Gradient background */}
            <div
              className="absolute inset-0 animate-gradient-shift"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #667eea 100%)',
                backgroundSize: '300% 300%',
              }}
            />

            {/* Glass overlay */}
            <div className="relative p-8 text-center bg-white/10 backdrop-blur-[2px]">
              {/* Emoji */}
              <motion.div
                className="text-6xl mb-4 select-none"
                variants={emojiVariants}
              >
                🎉
              </motion.div>

              {/* Greeting */}
              <motion.h2
                className="text-2xl font-bold text-white mb-1 drop-shadow-sm"
                variants={textVariants}
                custom={0}
              >
                Halo, {userName}! 👋
              </motion.h2>

              <motion.p
                className="text-white/90 text-lg font-medium mb-2 drop-shadow-sm"
                variants={textVariants}
                custom={1}
              >
                Selamat datang kembali!
              </motion.p>

              <motion.p
                className="text-white/70 text-sm"
                variants={textVariants}
                custom={2}
              >
                Semoga harimu menyenangkan ✨
              </motion.p>

              {/* Progress bar (auto-dismiss indicator) */}
              <motion.div
                className="mt-6 h-1 rounded-full bg-white/30 overflow-hidden"
              >
                <motion.div
                  className="h-full bg-white/80 rounded-full"
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 3, ease: 'linear' }}
                />
              </motion.div>

              <motion.p
                className="text-white/50 text-xs mt-3"
                variants={textVariants}
                custom={3}
              >
                Klik di mana saja untuk menutup
              </motion.p>
            </div>
          </motion.div>

          {/* Confetti CSS keyframes */}
          <style>{`
            @keyframes confetti-float {
              0% {
                transform: translateY(0) rotate(0deg) scale(1);
                opacity: 1;
              }
              50% {
                opacity: 1;
              }
              100% {
                transform: translateY(-100vh) rotate(720deg) scale(0);
                opacity: 0;
              }
            }
            .animate-confetti-float {
              animation-name: confetti-float;
              animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
              animation-fill-mode: forwards;
              animation-iteration-count: infinite;
            }
            @keyframes gradient-shift {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            .animate-gradient-shift {
              animation: gradient-shift 4s ease infinite;
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomePopup;
