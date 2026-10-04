import { createContext, useContext, useState, useCallback } from "react";
import { createPortal } from "react-dom";

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 3200) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const toast = {
    success: (msg) => addToast(msg, "success"),
    error: (msg) => addToast(msg, "error"),
    info: (msg) => addToast(msg, "info"),
    warning: (msg) => addToast(msg, "warning"),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {createPortal(
        <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2.5 items-end pointer-events-none">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

const STYLES = {
  success: { border: "rgba(52,211,153,0.4)", icon: "✓", tint: "rgba(52,211,153,0.14)", color: "#6ee7b7" },
  error: { border: "rgba(251,113,133,0.4)", icon: "✕", tint: "rgba(251,113,133,0.14)", color: "#fda4af" },
  warning: { border: "rgba(251,191,36,0.4)", icon: "⚠", tint: "rgba(251,191,36,0.14)", color: "#fcd34d" },
  info: { border: "rgba(129,140,248,0.4)", icon: "ℹ", tint: "rgba(129,140,248,0.14)", color: "#a5b4fc" },
};

function ToastItem({ toast }) {
  const s = STYLES[toast.type] || STYLES.info;
  return (
    <div
      className="pointer-events-auto flex items-center gap-3 pl-3.5 pr-5 py-3 rounded-xl shadow-2xl shadow-black/40 text-sm font-medium backdrop-blur-xl animate-scale-in max-w-sm"
      style={{
        background: "rgba(13,15,23,0.85)",
        border: `1px solid ${s.border}`,
      }}
    >
      <span
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
        style={{ background: s.tint, color: s.color }}
      >
        {s.icon}
      </span>
      <span className="text-[#dbe0ea]">{toast.message}</span>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
