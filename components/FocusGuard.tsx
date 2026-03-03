import React, { useState, useEffect, useRef, useCallback } from 'react';

interface FocusGuardProps {
  onReset: () => void;
  children: React.ReactNode;
}

const MAX_WARNINGS = 2;

const FocusGuard: React.FC<FocusGuardProps> = ({ onReset, children }) => {
  const isInitiallyFullscreen = !!document.fullscreenElement;
  const [entered, setEntered] = useState(isInitiallyFullscreen);
  const [warningCount, setWarningCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const warningCountRef = useRef(0);
  const enteredRef = useRef(isInitiallyFullscreen);
  const lastWarningTimeRef = useRef(0);
  const resetRef = useRef(onReset);
  resetRef.current = onReset;

  const handleEnter = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      // Fullscreen may not be supported or allowed
    }
    setEntered(true);
    enteredRef.current = true;
  };

  const triggerWarning = useCallback(() => {
    if (!enteredRef.current) return;

    // Debounce: ignore if triggered within 1 second of last warning
    const now = Date.now();
    if (now - lastWarningTimeRef.current < 1000) return;
    lastWarningTimeRef.current = now;

    const newCount = warningCountRef.current + 1;
    warningCountRef.current = newCount;
    setWarningCount(newCount);

    if (newCount > MAX_WARNINGS) {
      enteredRef.current = false;
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      resetRef.current();
    } else {
      setShowWarning(true);
    }
  }, []);

  const dismissWarning = useCallback(() => {
    setShowWarning(false);
    // Re-enter fullscreen if exited
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!entered) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerWarning();
      }
    };

    const handleFullscreenChange = () => {
      // If they exited fullscreen while quiz is active, treat as suspicious
      if (!document.fullscreenElement && enteredRef.current) {
        triggerWarning();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (
        (e.ctrlKey && ['t', 'n', 'w', 'l'].includes(key)) ||
        (e.ctrlKey && key === 'tab') ||
        (e.altKey && (key === 'tab' || key === 'f4')) ||
        key === 'f5' ||
        (e.ctrlKey && key === 'r') ||
        e.key === 'Meta' || e.key === 'OS'
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleContextMenu = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [entered, triggerWarning]);

  if (!entered) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="text-6xl mb-6">🔒</div>
        <h2 className="text-3xl font-bold text-slate-100 mb-4">Focus Mode</h2>
        <p className="text-slate-300 text-lg mb-2">
          This quiz runs in fullscreen to prevent distractions.
        </p>
        <p className="text-slate-400 mb-8">
          Switching tabs or leaving the screen will result in warnings.<br />
          If you exceed {MAX_WARNINGS} warnings, the quiz will be reset.
        </p>
        <button
          onClick={handleEnter}
          className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-bold text-xl py-4 px-10 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          🖥️ Enter Fullscreen &amp; Start
        </button>
      </div>
    );
  }

  return (
    <>
      {children}
      {showWarning && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full shadow-2xl border-2 border-yellow-500/50 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-yellow-400 mb-3">Warning!</h3>
            <p className="text-slate-200 text-lg mb-2">
              You switched away from the quiz.
            </p>
            <p className="text-slate-300 mb-6">
              {warningCount >= MAX_WARNINGS
                ? 'This is your last chance! Leave again and the quiz will be reset.'
                : `You have ${MAX_WARNINGS - warningCount} warning${MAX_WARNINGS - warningCount === 1 ? '' : 's'} remaining.`}
            </p>
            <div className="text-sm text-slate-400 mb-6">
              Warning {warningCount} of {MAX_WARNINGS}
            </div>
            <button
              onClick={dismissWarning}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Return to Quiz
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FocusGuard;
