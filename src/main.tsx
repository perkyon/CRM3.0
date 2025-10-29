
import React from "react";
import { createRoot } from "react-dom/client";
import { ToastProvider } from "./components/ui/custom-toaster";
import { ProjectProvider } from "./contexts/ProjectContextNew";
import { AuthProvider } from "./contexts/AuthContext";
import { AppRouter } from "./router/AppRouter";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { PerformanceTracker } from "./components/monitoring/PerformanceTracker";
import { PWAMonitor } from "./components/monitoring/PWAMonitor";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
// import { initializeAuth } from "./lib/supabase/auth-setup"; // Отключено - теперь вход через форму
import "./index.css";

// Initialize Sentry
import "./sentry.client.config";

// Автоматический вход отключен - используйте форму входа
console.log('🔐 Войдите используя форму на главной странице');

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <AuthProvider>
      <ToastProvider>
        <ProjectProvider>
          <AppRouter />
          <PerformanceTracker />
          <PWAMonitor />
          <Analytics 
            mode={import.meta.env.VITE_NODE_ENV === 'production' ? 'production' : 'development'}
            debug={import.meta.env.VITE_NODE_ENV === 'development'}
          />
          <SpeedInsights 
            debug={import.meta.env.VITE_NODE_ENV === 'development'}
          />
        </ProjectProvider>
      </ToastProvider>
    </AuthProvider>
  </ErrorBoundary>
);
  