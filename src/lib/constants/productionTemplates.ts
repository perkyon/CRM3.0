// Production component templates - Material Types from TZ
// 4 основных типа материалов: ЛДСП, МДФ-Эмаль, Шпон, Кастом

export interface ProductionStageTemplate {
  name: string;
  label: string;
  icon: string;
  estimatedHours?: number;
}

export interface ComponentTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  stages: ProductionStageTemplate[];
  defaultMaterial?: string;
  defaultUnit?: string;
}

// ЛДСП - БЕЗ шлифовки и покраски (согласно ТЗ)
export const LDSP_STAGES: ProductionStageTemplate[] = [
  { name: 'purchase', label: 'Закупка материала', icon: '🛒', estimatedHours: 0 },
  { name: 'cutting_cnc', label: 'Раскрой / присадка / ЧПУ', icon: '🪚', estimatedHours: 2 },
  { name: 'edging', label: 'Кромка', icon: '📏', estimatedHours: 1.5 },
  { name: 'preassembly', label: 'Предсборка', icon: '🔧', estimatedHours: 2 },
  { name: 'qa', label: 'Отконтроль QA', icon: '✓', estimatedHours: 0.5 },
  { name: 'packaging', label: 'Упаковка', icon: '📦', estimatedHours: 0.5 },
  { name: 'delivery', label: 'Доставка / Монтаж', icon: '🚚', estimatedHours: 4 },
];

// МДФ-Эмаль - со шлифовкой и покраской (2 раза)
export const MDF_EMAL_STAGES: ProductionStageTemplate[] = [
  { name: 'purchase', label: 'Закупка материала', icon: '🛒', estimatedHours: 0 },
  { name: 'cutting_cnc', label: 'Раскрой / присадка / ЧПУ', icon: '🪚', estimatedHours: 2 },
  { name: 'preassembly', label: 'Предсборка', icon: '🔧', estimatedHours: 2 },
  { name: 'sanding', label: 'Шлифовка', icon: '🧽', estimatedHours: 1.5 },
  { name: 'painting_1', label: 'Покраска (1-й слой)', icon: '🎨', estimatedHours: 2 },
  { name: 'sanding_2', label: 'Шлифовка (2-я)', icon: '🧽', estimatedHours: 1 },
  { name: 'painting_2', label: 'Покраска (2-й слой)', icon: '🎨', estimatedHours: 2 },
  { name: 'qa', label: 'ОТК контроль QA', icon: '✓', estimatedHours: 0.5 },
  { name: 'packaging', label: 'Упаковка', icon: '📦', estimatedHours: 0.5 },
  { name: 'delivery', label: 'Доставка / Монтаж', icon: '🚚', estimatedHours: 4 },
];

// Шпон - с кромкой, шлифовкой и покрытием (2 раза)
export const SHPON_STAGES: ProductionStageTemplate[] = [
  { name: 'purchase', label: 'Закупка материала', icon: '🛒', estimatedHours: 0 },
  { name: 'cutting_cnc', label: 'Раскрой / присадка / ЧПУ', icon: '🪚', estimatedHours: 2 },
  { name: 'edging', label: 'Кромка', icon: '📏', estimatedHours: 1 },
  { name: 'preassembly', label: 'Предсборка', icon: '🔧', estimatedHours: 2 },
  { name: 'sanding', label: 'Шлифовка', icon: '🧽', estimatedHours: 1.5 },
  { name: 'painting_1', label: 'Покраска (1-й слой)', icon: '🎨', estimatedHours: 2 },
  { name: 'sanding_2', label: 'Шлифовка (2-я)', icon: '🧽', estimatedHours: 1 },
  { name: 'painting_2', label: 'Покраска (2-й слой)', icon: '🎨', estimatedHours: 2 },
  { name: 'qa', label: 'ОТК контроль QA', icon: '✓', estimatedHours: 0.5 },
  { name: 'packaging', label: 'Упаковка', icon: '📦', estimatedHours: 0.5 },
  { name: 'delivery', label: 'Доставка / Монтаж', icon: '🚚', estimatedHours: 4 },
];

// Фанера - со шлифовкой и покрытием (2 раза)
export const PLYWOOD_STAGES: ProductionStageTemplate[] = [
  { name: 'purchase', label: 'Закупка материала', icon: '🛒', estimatedHours: 0 },
  { name: 'cutting_cnc', label: 'Раскрой / присадка / ЧПУ', icon: '🪚', estimatedHours: 2 },
  { name: 'preassembly', label: 'Предсборка', icon: '🔧', estimatedHours: 2 },
  { name: 'sanding', label: 'Шлифовка', icon: '🧽', estimatedHours: 1.5 },
  { name: 'painting_1', label: 'Покраска (1-й слой)', icon: '🎨', estimatedHours: 2 },
  { name: 'sanding_2', label: 'Шлифовка (2-я)', icon: '🧽', estimatedHours: 1 },
  { name: 'painting_2', label: 'Покраска (2-й слой)', icon: '🎨', estimatedHours: 2 },
  { name: 'qa', label: 'ОТК контроль QA', icon: '✓', estimatedHours: 0.5 },
  { name: 'packaging', label: 'Упаковка', icon: '📦', estimatedHours: 0.5 },
  { name: 'delivery', label: 'Доставка / Монтаж', icon: '🚚', estimatedHours: 4 },
];

// Кастомный - все возможные этапы на выбор
export const CUSTOM_STAGES: ProductionStageTemplate[] = [
  { name: 'purchase', label: 'Закупка материала', icon: '🛒', estimatedHours: 0 },
  { name: 'cutting_cnc', label: 'Раскрой / присадка / ЧПУ', icon: '🪚', estimatedHours: 2 },
  { name: 'edging', label: 'Кромка', icon: '📏', estimatedHours: 1 },
  { name: 'preassembly', label: 'Предсборка', icon: '🔧', estimatedHours: 2 },
  { name: 'sanding', label: 'Шлифовка', icon: '🧽', estimatedHours: 1.5 },
  { name: 'painting_1', label: 'Покраска (1-й слой)', icon: '🎨', estimatedHours: 2 },
  { name: 'sanding_2', label: 'Шлифовка (2-я)', icon: '🧽', estimatedHours: 1 },
  { name: 'painting_2', label: 'Покраска (2-й слой)', icon: '🎨', estimatedHours: 2 },
  { name: 'qa', label: 'ОТК контроль QA', icon: '✓', estimatedHours: 0.5 },
  { name: 'packaging', label: 'Упаковка', icon: '📦', estimatedHours: 0.5 },
  { name: 'delivery', label: 'Доставка / Монтаж', icon: '🚚', estimatedHours: 4 },
];

// Шаблоны компонентов по типам материалов (согласно ТЗ)
export const COMPONENT_TEMPLATES: ComponentTemplate[] = [
  {
    id: 'ldsp',
    name: 'ЛДСП',
    description: 'Ламинированная древесно-стружечная плита',
    icon: '📦',
    stages: LDSP_STAGES,
    defaultMaterial: 'ЛДСП 18мм',
    defaultUnit: 'шт',
  },
  {
    id: 'mdf_emal',
    name: 'МДФ-Эмаль',
    description: 'МДФ с покраской эмалью',
    icon: '🎨',
    stages: MDF_EMAL_STAGES,
    defaultMaterial: 'МДФ 16мм',
    defaultUnit: 'шт',
  },
  {
    id: 'shpon',
    name: 'Шпон',
    description: 'Шпонированные изделия',
    icon: '🪵',
    stages: SHPON_STAGES,
    defaultMaterial: 'МДФ 16мм + шпон',
    defaultUnit: 'шт',
  },
  {
    id: 'plywood',
    name: 'Фанера',
    description: 'Изделия из фанеры',
    icon: '🪚',
    stages: PLYWOOD_STAGES,
    defaultMaterial: 'Фанера 18мм',
    defaultUnit: 'шт',
  },
  {
    id: 'custom',
    name: 'Кастомный',
    description: 'Свой набор этапов',
    icon: '⚙️',
    stages: CUSTOM_STAGES,
    defaultMaterial: '',
    defaultUnit: 'шт',
  },
];

// Helper function to get template by id
export const getTemplateById = (id: string): ComponentTemplate | undefined => {
  return COMPONENT_TEMPLATES.find(t => t.id === id);
};

// Helper function to get default template
export const getDefaultTemplate = (): ComponentTemplate => {
  return COMPONENT_TEMPLATES[0]; // ЛДСП
};


