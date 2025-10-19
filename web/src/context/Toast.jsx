// src/context/Toast.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]); // {id,msg,type}

  function show(msg, type = "ok", ms = 2200) {
    const id = crypto.randomUUID();
    setToasts(t => [...t, { id, msg, type }]);
    if (ms > 0) setTimeout(() => dismiss(id), ms);
  }
  function dismiss(id) {
    setToasts(t => t.filter(x => x.id !== id));
  }

  const value = useMemo(() => ({ show, dismiss }), []);
  return (
    <ToastCtx.Provider value={value}>
      {children}
      {/* UI */}
      <div className="toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`} onClick={() => dismiss(t.id)}>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
export function useToast(){ return useContext(ToastCtx); }
