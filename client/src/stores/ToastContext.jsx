import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

// Module-level ref so non-React code (fetchWithAuth) can still fire toasts
let _showGlobal = () => {};

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "error", duration = 5000) => {
    setToast({ message, type, id: Date.now() });
    if (duration > 0) setTimeout(() => setToast(null), duration);
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  // Keep module ref in sync
  _showGlobal = showToast;

  return (
    <ToastContext.Provider value={{ toast, showToast, dismissToast }}>
      {children}
      {toast && <ToastBanner toast={toast} onDismiss={dismissToast} />}
    </ToastContext.Provider>
  );
}

/** Use inside any component wrapped by ToastProvider */
export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToastContext must be used within <ToastProvider>");
  return ctx;
}

/** For non-React code (e.g. fetchWithAuth) */
export function showGlobalToast(message, type = "error", duration = 5000) {
  _showGlobal(message, type, duration);
}

/* ── Banner UI ── */
function ToastBanner({ toast, onDismiss }) {
  const styles = {
    error: "bg-brand-600",
    success: "bg-green-600",
    warning: "bg-yellow-500 text-neutral-900",
    info: "bg-neutral-800",
  };

  const icons = { error: "⚠️", success: "✅", warning: "⚡", info: "ℹ️" };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 toast-enter">
      <div
        className={`${styles[toast.type] || styles.error} text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-75 max-w-120`}
      >
        <span className="text-base">{icons[toast.type]}</span>
        <p className="flex-1 text-sm font-medium">{toast.message}</p>
        <button
          onClick={onDismiss}
          className="text-white/70 hover:text-white text-sm font-bold leading-none"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
