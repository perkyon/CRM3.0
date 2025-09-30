
import { createRoot } from "react-dom/client";
import { ToastProvider } from "./components/ui/custom-toaster";
import { ProjectProvider } from "./contexts/ProjectContext";
import { AppRouter } from "./router/AppRouter";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ToastProvider>
    <ProjectProvider>
      <AppRouter />
    </ProjectProvider>
  </ToastProvider>
);
  