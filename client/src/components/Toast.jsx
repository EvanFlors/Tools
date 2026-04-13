import { useState, useEffect, useCallback } from "react";

let showToastGlobal = () => {};

export function useToast() {
  const [toast, setToast] = useState(null);

  const show = useCallback((message, type = "error", duration = 5000) => {
    setToast({ message, type, id: Date.now() });
    if (duration > 0) {
      setTimeout(() => setToast(null), duration);
    }
  }, []);

  const dismiss = useCallback(() => setToast(null), []);

  return { toast, showToast: show, dismissToast: dismiss };
}

export function GlobalToastProvider({ children }) {
  const { toast, showToast, dismissToast } = useToast();

  useEffect(() => {
    showToastGlobal = showToast;
  }, [showToast]);

  return (
    <>
      {children}
      {toast && <ToastMessage toast={toast} onDismiss={dismissToast} />}
    </>
  );
}

export function showGlobalToast(message, type = "error", duration = 5000) {
  showToastGlobal(message, type, duration);
}

export function ToastMessage({ toast, onDismiss }) {
  if (!toast) return null;

  const styles = {
    error: "bg-brand-600",
    success: "bg-green-600",
    warning: "bg-yellow-500 text-neutral-900",
    info: "bg-neutral-800",
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 toast-enter">
      <div
        className={`${styles[toast.type] || styles.error} text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-75 max-w-120`}
      >
        <span className="text-base">
          {toast.type === "error" && "⚠️"}
          {toast.type === "success" && "✅"}
          {toast.type === "warning" && "⚡"}
          {toast.type === "info" && "ℹ️"}
        </span>
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

export default ToastMessage;
