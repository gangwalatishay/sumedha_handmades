import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import "../styles/toast.css";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((message, { type = "info", duration = 4500 } = {}) => {
    if (!message) return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((current) => [...current.slice(-2), { id, message, type }]);
    timers.current.set(id, setTimeout(() => dismiss(id), duration));
  }, [dismiss]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  return (
    <ToastContext.Provider value={{ notify, success: (message) => notify(message, { type: "success" }), error: (message) => notify(message, { type: "error", duration: 6500 }), info: (message) => notify(message) }}>
      {children}
      <div className="toast-region" aria-label="Notifications" aria-live="polite" aria-relevant="additions">
        {toasts.map((toast) => (
          <div className={`app-toast app-toast-${toast.type}`} key={toast.id} role={toast.type === "error" ? "alert" : "status"}>
            <span className="app-toast-icon" aria-hidden="true">{toast.type === "success" ? "✓" : toast.type === "error" ? "!" : "i"}</span>
            <span className="app-toast-message">{toast.message}</span>
            <button type="button" className="app-toast-dismiss" onClick={() => dismiss(toast.id)} aria-label="Dismiss notification">×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
