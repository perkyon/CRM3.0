import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OwnerPanelType =
  | 'owner-kpi'
  | 'owner-problem-projects'
  | 'owner-payment-risk'
  | 'owner-team'
  | 'owner-problem-cards'
  | 'owner-finance';

export type OwnerPanelSize = 'sm' | 'md' | 'lg' | 'xl';

export interface OwnerPanelConfig {
  id: string;
  type: OwnerPanelType;
  size: OwnerPanelSize;
  isVisible: boolean;
}

export const DEFAULT_OWNER_PANELS: OwnerPanelConfig[] = [
  { id: 'owner-kpi', type: 'owner-kpi', size: 'xl', isVisible: true },
  { id: 'owner-problem-projects', type: 'owner-problem-projects', size: 'lg', isVisible: true },
  { id: 'owner-payment-risk', type: 'owner-payment-risk', size: 'lg', isVisible: true },
  { id: 'owner-team', type: 'owner-team', size: 'xl', isVisible: true },
  { id: 'owner-problem-cards', type: 'owner-problem-cards', size: 'xl', isVisible: true },
  { id: 'owner-finance', type: 'owner-finance', size: 'xl', isVisible: true },
];

interface OwnerDashboardLayoutState {
  panels: OwnerPanelConfig[];
  addPanel: (type: OwnerPanelType) => void;
  removePanel: (id: string) => void;
  toggleVisibility: (id: string) => void;
  updateSize: (id: string, size: OwnerPanelSize) => void;
  reorderPanels: (sourceId: string, targetId: string) => void;
  resetLayout: () => void;
}

const sizeFallback: Record<OwnerPanelType, OwnerPanelSize> = {
  'owner-kpi': 'xl',
  'owner-problem-projects': 'lg',
  'owner-payment-risk': 'lg',
  'owner-team': 'xl',
  'owner-problem-cards': 'xl',
  'owner-finance': 'xl',
};

const generateId = (type: OwnerPanelType) => `${type}-${Date.now()}`;

export const useOwnerDashboardLayoutStore = create<OwnerDashboardLayoutState>()(
  persist(
    (set, get) => ({
      panels: DEFAULT_OWNER_PANELS,
      addPanel: (type: OwnerPanelType) => {
        const panel: OwnerPanelConfig = {
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
      updateSize: (id: string, size: OwnerPanelSize) => {
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
        set({ panels: DEFAULT_OWNER_PANELS });
      },
    }),
    {
      name: 'owner-dashboard-layout-v1',
      partialize: (state) => ({
        panels: state.panels,
      }),
    }
  )
);


