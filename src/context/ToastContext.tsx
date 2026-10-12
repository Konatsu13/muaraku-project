'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          let bgClass = 'bg-surface-white border-border-subtle text-on-surface';
          let icon = 'info';
          let iconColor = 'text-primary-container';

          if (toast.type === 'success') {
            icon = 'check_circle';
            iconColor = 'text-secondary';
            bgClass = 'bg-surface-white border-secondary/30 text-on-surface shadow-md';
          } else if (toast.type === 'error') {
            icon = 'error';
            iconColor = 'text-error-destructive';
            bgClass = 'bg-surface-white border-error-destructive/30 text-on-surface shadow-md';
          } else if (toast.type === 'warning') {
            icon = 'warning';
            iconColor = 'text-tertiary-container';
            bgClass = 'bg-surface-white border-tertiary-container/30 text-on-surface shadow-md';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2 ${bgClass}`}
            >
              <span className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 ${iconColor}`}>
                {icon}
              </span>
              <div className="flex-1 text-sm font-medium leading-snug">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-muted-text hover:text-on-surface text-xs shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
