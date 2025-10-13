/**
 * Генератор человекочитаемых ID для проектов и клиентов
 */

// Получить текущий год
const getCurrentYear = () => new Date().getFullYear();

// Генерация ID проекта: PRJ-2025-001
export const generateProjectId = (existingIds: string[] = []): string => {
  const year = getCurrentYear();
  const prefix = `PRJ-${year}-`;
  
  // Найти максимальный номер для текущего года
  const currentYearIds = existingIds
    .filter(id => id.startsWith(prefix))
    .map(id => parseInt(id.split('-')[2]) || 0);
  
  const maxNumber = currentYearIds.length > 0 ? Math.max(...currentYearIds) : 0;
  const newNumber = (maxNumber + 1).toString().padStart(3, '0');
  
  return `${prefix}${newNumber}`;
};

// Генерация ID клиента: CLT-2025-001
export const generateClientId = (existingIds: string[] = []): string => {
  const year = getCurrentYear();
  const prefix = `CLT-${year}-`;
  
  // Найти максимальный номер для текущего года
  const currentYearIds = existingIds
    .filter(id => id.startsWith(prefix))
    .map(id => parseInt(id.split('-')[2]) || 0);
  
  const maxNumber = currentYearIds.length > 0 ? Math.max(...currentYearIds) : 0;
  const newNumber = (maxNumber + 1).toString().padStart(3, '0');
  
  return `${prefix}${newNumber}`;
};

// Генерация ID задачи канбана: TSK-001
export const generateTaskId = (existingIds: string[] = []): string => {
  const prefix = 'TSK-';
  
  const numbers = existingIds
    .filter(id => id.startsWith(prefix))
    .map(id => parseInt(id.split('-')[1]) || 0);
  
  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
  const newNumber = (maxNumber + 1).toString().padStart(3, '0');
  
  return `${prefix}${newNumber}`;
};

// Генерация короткого ID для документов: DOC-A1B2C3
export const generateDocumentId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'DOC-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
