
import { createRoot } from "react-dom/client";
import { ToastProvider } from "./components/ui/custom-toaster";
import { ProjectProvider } from "./contexts/ProjectContext";
import { AppRouter } from "./router/AppRouter";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import "./index.css";

// Initialize Sentry
import "./sentry.client.config";

createRoot(document.getElementById("root")!).render(
  <ToastProvider>
    <ProjectProvider>
      <AppRouter />
      <Analytics />
      <SpeedInsights />
    </ProjectProvider>
  </ToastProvider>
);
  