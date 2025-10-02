
import { createRoot } from "react-dom/client";
import { ToastProvider } from "./components/ui/custom-toaster";
import { ProjectProvider } from "./contexts/ProjectContext";
import { AppRouter } from "./router/AppRouter";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import "./index.css";

// Initialize Sentry
import "./sentry.client.config";

// Performance tracking component
function PerformanceTracker() {
  // Lazy load performance tracking to avoid blocking initial render
  import("./lib/hooks/usePerformanceTracking").then(({ usePerformanceTracking }) => {
    usePerformanceTracking();
  });
  return null;
}

// PWA monitoring component
function PWAMonitor() {
  // Lazy load PWA monitoring
  import("./lib/hooks/usePWAMonitoring").then(({ usePWAMonitoring }) => {
    usePWAMonitoring();
  });
  return null;
}

createRoot(document.getElementById("root")!).render(
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
);
  