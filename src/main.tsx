
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
import { ServiceWorkerUpdater } from "./components/monitoring/ServiceWorkerUpdater";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import { initializeAuth } from "./lib/supabase/auth-setup";
import "./index.css";

// Initialize Sentry
import "./sentry.client.config";

// Initialize authentication
initializeAuth();

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <AuthProvider>
      <ToastProvider>
        <ProjectProvider>
          <AppRouter />
          <PerformanceTracker />
          <PWAMonitor />
          <ServiceWorkerUpdater />
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
  