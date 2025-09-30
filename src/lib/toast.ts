// Centralized toast utility that integrates with our custom toast system

let toastInstance: any = null;

export const setToastInstance = (instance: any) => {
  toastInstance = instance;
};

// Simple fallback for when custom toast context is not available
const fallbackToast = {
  success: (message: string) => console.log('✅ Success:', message),
  error: (message: string) => console.error('❌ Error:', message),
  info: (message: string) => console.info('ℹ️ Info:', message),
  warning: (message: string) => console.warn('⚠️ Warning:', message)
};

// Main toast function - supports both old and new syntax
export const toast = (message: string, options?: { type?: 'success' | 'error' | 'info' | 'warning' }) => {
  const type = options?.type || 'info';
  
  if (toastInstance) {
    toastInstance.addToast({ type, message });
  } else {
    fallbackToast[type](message);
  }
};

// Add convenience methods
toast.success = (message: string) => {
  if (toastInstance) {
    toastInstance.addToast({ type: 'success', message });
  } else {
    fallbackToast.success(message);
  }
};

toast.error = (message: string) => {
  if (toastInstance) {
    toastInstance.addToast({ type: 'error', message });
  } else {
    fallbackToast.error(message);
  }
};

toast.info = (message: string) => {
  if (toastInstance) {
    toastInstance.addToast({ type: 'info', message });
  } else {
    fallbackToast.info(message);
  }
};

toast.warning = (message: string) => {
  if (toastInstance) {
    toastInstance.addToast({ type: 'warning', message });
  } else {
    fallbackToast.warning(message);
  }
};

// For compatibility with old code that uses showToast
export const showToast = toast;

// For compatibility with old code
export const initializeToast = () => {
  // No longer needed with custom toast system
};