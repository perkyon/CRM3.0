import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setToastInstance } from '../../lib/toast';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

interface ToasterProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);

    // Auto remove toast after duration
    const duration = toast.duration || 4000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Set up global toast instance
  useEffect(() => {
    setToastInstance({ addToast });
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <CustomToaster toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

interface CustomToasterProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

function CustomToaster({ toasts, onRemove, position = 'top-right' }: CustomToasterProps) {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      default:
        return 'top-4 right-4';
    }
  };

  const getToastTypeClasses = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className={`fixed z-50 flex flex-col gap-2 ${getPositionClasses()}`}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`
            min-w-[300px] max-w-[400px] p-4 rounded-lg border shadow-lg
            transition-all duration-300 ease-in-out
            ${getToastTypeClasses(toast.type)}
          `}
        >
          <div className="flex items-start gap-3">
            <span className="text-lg">{getIcon(toast.type)}</span>
            <div className="flex-1">
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="text-current opacity-50 hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Simple standalone toaster component that can be used without context
export function Toaster({ position = 'top-right' }: ToasterProps) {
  // This is a simplified version that doesn't actually show toasts
  // It's here for compatibility with existing code
  return null;
}