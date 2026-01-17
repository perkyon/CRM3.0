import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DashboardPanelType =
  | 'kpi-orders'
  | 'kpi-load'
  | 'kpi-revenue'
  | 'kpi-materials'
  | 'active-projects'
  | 'recent-activity'
  | 'deadlines'
  | 'clients';

export type DashboardPanelSize = 'sm' | 'md' | 'lg' | 'xl';

export interface DashboardPanelConfig {
  id: string;
  type: DashboardPanelType;
  size: DashboardPanelSize;
  isVisible: boolean;
}

export const DEFAULT_PANELS: DashboardPanelConfig[] = [
  { id: 'kpi-orders', type: 'kpi-orders', size: 'sm', isVisible: true },
  { id: 'kpi-load', type: 'kpi-load', size: 'sm', isVisible: true },
  { id: 'kpi-revenue', type: 'kpi-revenue', size: 'sm', isVisible: true },
  { id: 'kpi-materials', type: 'kpi-materials', size: 'sm', isVisible: true },
  { id: 'active-projects', type: 'active-projects', size: 'lg', isVisible: true },
  { id: 'recent-activity', type: 'recent-activity', size: 'lg', isVisible: true },
  { id: 'deadlines', type: 'deadlines', size: 'md', isVisible: true },
  { id: 'clients', type: 'clients', size: 'md', isVisible: true },
];

interface DashboardLayoutState {
  panels: DashboardPanelConfig[];
  addPanel: (type: DashboardPanelType) => void;
  removePanel: (id: string) => void;
  toggleVisibility: (id: string) => void;
  updateSize: (id: string, size: DashboardPanelSize) => void;
  reorderPanels: (sourceId: string, targetId: string) => void;
  resetLayout: () => void;
}

const sizeFallback: Record<DashboardPanelType, DashboardPanelSize> = {
  'kpi-orders': 'sm',
  'kpi-load': 'sm',
  'kpi-revenue': 'sm',
  'kpi-materials': 'sm',
  'active-projects': 'lg',
  'recent-activity': 'lg',
  deadlines: 'md',
  clients: 'md',
};

const generateId = (type: DashboardPanelType) => `${type}-${Date.now()}`;

export const useDashboardLayoutStore = create<DashboardLayoutState>()(
  persist(
    (set, get) => ({
      panels: DEFAULT_PANELS,
      addPanel: (type: DashboardPanelType) => {
        const panel: DashboardPanelConfig = {
          id: generateId(type),
          type,
          size: sizeFallback[type] ?? 'md',
          isVisible: true,
        };
        set({ panels: [...get().panels, panel] });
      },
      removePanel: (id: string) => {
        set({ panels: get().panels.filter((panel) => panel.id !== id) });
      },
      toggleVisibility: (id: string) => {
        set({
          panels: get().panels.map((panel) =>
            panel.id === id ? { ...panel, isVisible: !panel.isVisible } : panel
          ),
        });
      },
      updateSize: (id: string, size: DashboardPanelSize) => {
        set({
          panels: get().panels.map((panel) =>
            panel.id === id ? { ...panel, size } : panel
          ),
        });
      },
      reorderPanels: (sourceId: string, targetId: string) => {
        const panels = [...get().panels];
        const fromIndex = panels.findIndex((p) => p.id === sourceId);
        const toIndex = panels.findIndex((p) => p.id === targetId);
        if (fromIndex === -1 || toIndex === -1) return;
        const [moved] = panels.splice(fromIndex, 1);
        panels.splice(toIndex, 0, moved);
        set({ panels });
      },
      resetLayout: () => {
        set({ panels: DEFAULT_PANELS });
      },
    }),
    {
      name: 'dashboard-layout-v1',
      partialize: (state) => ({
        panels: state.panels,
      }),
    }
  )
);


