import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';

const ToastContext = createContext(null);

const TOAST_LIFETIME_MS = 2000;
const MAX_VISIBLE = 3;

const VARIANTS = {
  success: { icon: CheckCircle2, accent: '#22C55E', track: 'rgba(34,197,94,0.15)' },
  error: { icon: XCircle, accent: '#EF4444', track: 'rgba(239,68,68,0.15)' },
};

let nextToastId = 0;

// Falls back to no-ops outside a ToastProvider (e.g. component tests that render
// PurchaseButton/DeleteVehicleButton/etc. in isolation) instead of throwing, so
// adding toast calls into those components' existing success/failure paths stays
// purely additive — none of their existing tests need to change.
export const useToast = () => {
  const ctx = useContext(ToastContext);
  return ctx || { success: () => {}, error: () => {} };
};

const Toast = ({ toast, onDismiss, onPause, onResume }) => {
  const [paused, setPaused] = useState(false);
  const { icon: Icon, accent, track } = VARIANTS[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.96, transition: { duration: 0.2 } }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      role="status"
      style={{
        pointerEvents: 'auto',
        position: 'relative',
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: `1px solid ${accent}33`,
        borderRadius: '16px',
        boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
        padding: '14px 16px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
      }}
    >
      <div style={{ color: accent, flexShrink: 0, marginTop: '1px' }}>
        <Icon size={20} />
      </div>
      <span style={{
        fontFamily: "'Manrope', sans-serif", fontSize: '14px', fontWeight: 600,
        color: '#1a2744', lineHeight: 1.4, paddingBottom: '2px',
      }}>
        {toast.message}
      </span>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '3px', background: track }}>
        <div style={{
          height: '100%',
          background: accent,
          animationName: 'dh-toast-progress',
          animationDuration: `${TOAST_LIFETIME_MS}ms`,
          animationTimingFunction: 'linear',
          animationFillMode: 'forwards',
          animationPlayState: paused ? 'paused' : 'running',
        }} />
      </div>
    </motion.div>
  );
};

const ToastViewport = ({ toasts, onDismiss, onPause, onResume }) => createPortal(
  <>
    <div className="dh-toast-viewport" style={{
      position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 2000,
      display: 'flex', flexDirection: 'column', gap: '12px',
      width: '360px', maxWidth: 'calc(100vw - 32px)',
      pointerEvents: 'none',
    }}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={onDismiss} onPause={onPause} onResume={onResume} />
        ))}
      </AnimatePresence>
    </div>
    <style>{`
      @keyframes dh-toast-progress {
        from { width: 100%; }
        to { width: 0%; }
      }
      @media (max-width: 640px) {
        .dh-toast-viewport { left: 16px !important; right: 16px !important; width: auto !important; transform: none !important; }
      }
    `}</style>
  </>,
  document.body
);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({}); // id -> { timerId, remaining, startedAt }

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const meta = timers.current[id];
    if (meta) {
      clearTimeout(meta.timerId);
      delete timers.current[id];
    }
  }, []);

  const show = useCallback((type, message) => {
    const id = ++nextToastId;
    timers.current[id] = {
      remaining: TOAST_LIFETIME_MS,
      startedAt: Date.now(),
      timerId: setTimeout(() => dismiss(id), TOAST_LIFETIME_MS),
    };
    setToasts((prev) => [...prev, { id, type, message }].slice(-MAX_VISIBLE));
  }, [dismiss]);

  const pause = useCallback((id) => {
    const meta = timers.current[id];
    if (!meta) return;
    clearTimeout(meta.timerId);
    meta.remaining -= Date.now() - meta.startedAt;
  }, []);

  const resume = useCallback((id) => {
    const meta = timers.current[id];
    if (!meta) return;
    meta.startedAt = Date.now();
    meta.timerId = setTimeout(() => dismiss(id), Math.max(meta.remaining, 0));
  }, [dismiss]);

  const value = {
    success: useCallback((message) => show('success', message), [show]),
    error: useCallback((message) => show('error', message), [show]),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} onPause={pause} onResume={resume} />
    </ToastContext.Provider>
  );
};
