import { ComponentType, SubComponentType, ProductionStageType } from '../../types';

// Названия компонентов
export const componentNames: Record<ComponentType, string> = {
  kitchen: 'Кухня',
  living_room: 'Гостинная',
  bedroom: 'Спальня',
  wardrobe: 'Гардеробная',
  bathroom: 'Ванная',
  children_room: 'Детская',
  office: 'Офис',
  hallway: 'Прихожая',
  balcony: 'Балкон',
  other: 'Прочее'
};

// Названия подкомпонентов
export const subComponentNames: Record<SubComponentType, string> = {
  sink: 'Раковина',
  kitchen_set: 'Гарнитур',
  cabinet: 'Шкаф',
  table: 'Стол',
  chair: 'Стул',
  bed: 'Кровать',
  wardrobe: 'Шкаф-купе',
  sofa: 'Диван',
  tv_stand: 'ТВ-тумба',
  shelf: 'Полка',
  mirror: 'Зеркало',
  bathroom_set: 'Ванная комплект',
  other: 'Прочее'
};

// Названия этапов производства
export const productionStageNames: Record<ProductionStageType, string> = {
  cnc_cutting: 'ЧПУ/раскрой',
  pre_assembly: 'Предсборка',
  sanding: 'Шлифовка',
  painting: 'Покраска',
  quality_control: 'Контроль качества',
  packaging: 'Упаковка',
  delivery: 'Доставка',
  installation: 'Монтаж'
};

// Порядок этапов производства
export const productionStageOrder: ProductionStageType[] = [
  'cnc_cutting',
  'pre_assembly',
  'sanding',
  'painting',
  'quality_control',
  'packaging',
  'delivery',
  'installation'
];

// Цвета для статусов задач
export const taskStatusColors = {
  pending: 'bg-gray-100 text-gray-700 border-gray-200',
  in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  on_hold: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200'
} as const;

// Названия статусов задач
export const taskStatusNames = {
  pending: 'Ожидает',
  in_progress: 'В работе',
  completed: 'Завершено',
  on_hold: 'Приостановлено',
  cancelled: 'Отменено'
} as const;

// Иконки для компонентов (SVG paths)
export const componentIcons = {
  kitchen: 'M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2zm0 4h18v2H3v-2zM5 5h4v4H5V5zm10 0h4v4h-4V5zM5 11h4v4H5v-4zm10 0h4v4h-4v-4z',
  living_room: 'M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h10v2H7v-2z',
  bedroom: 'M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v8H7V7zm2 2v4h6V9H9z',
  wardrobe: 'M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h10v2H7v-2zM8 8h2v2H8V8zm4 0h2v2h-2V8zm0 4h2v2h-2v-2zm-4 0h2v2H8v-2z',
  bathroom: 'M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zM8 8h2v2H8V8zm4 0h2v2h-2V8z',
  children_room: 'M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h6v2H7v-2zM8 8h2v2H8V8zm4 0h2v2h-2V8z',
  office: 'M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h6v2H7v-2z',
  hallway: 'M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h10v2H7v-2z',
  balcony: 'M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2z',
  other: 'M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h6v2H7v-2z'
} as const;

// Иконки для подкомпонентов (SVG paths)
export const subComponentIcons = {
  sink: 'M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2zM5 5h4v4H5V5zm10 0h4v4h-4V5z',
  kitchen_set: 'M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h6v2H7v-2z',
  cabinet: 'M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h10v2H7v-2zM8 8h2v2H8V8zm4 0h2v2h-2V8zm0 4h2v2h-2v-2zm-4 0h2v2H8v-2z',
  table: 'M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2zM5 5h4v4H5V5zm10 0h4v4h-4V5z',
  chair: 'M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2zM5 5h4v4H5V5zm10 0h4v4h-4V5z',
  bed: 'M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2z',
  wardrobe: 'M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h10v2H7v-2zM8 8h2v2H8V8zm4 0h2v2h-2V8zm0 4h2v2h-2v-2zm-4 0h2v2H8v-2z',
  sofa: 'M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2z',
  tv_stand: 'M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zM8 8h2v2H8V8zm4 0h2v2h-2V8z',
  shelf: 'M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2zM5 5h4v4H5V5zm10 0h4v4h-4V5z',
  mirror: 'M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zM8 8h2v2H8V8zm4 0h2v2h-2V8z',
  bathroom_set: 'M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zM8 8h2v2H8V8zm4 0h2v2h-2V8z',
  other: 'M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h6v2H7v-2z'
} as const;

// Иконки для этапов производства (SVG paths)
export const productionStageIcons = {
  cnc_cutting: 'M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2z',
  pre_assembly: 'M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2z',
  sanding: 'M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2z',
  painting: 'M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2z',
  quality_control: 'M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2z',
  packaging: 'M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2z',
  delivery: 'M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2z',
  installation: 'M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2z'
} as const;
