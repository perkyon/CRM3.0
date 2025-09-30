import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  getDaysUntilDue,
  getPriorityColor,
  hasPermission,
  getInitials,
} from './utils';

describe('formatCurrency', () => {
  it('should format currency correctly', () => {
    // Use regex to match the actual formatting (non-breaking spaces)
    expect(formatCurrency(1000)).toMatch(/1\s000,00\s₽/);
    expect(formatCurrency(1000000)).toMatch(/1\s000\s000,00\s₽/);
    expect(formatCurrency(0)).toMatch(/0,00\s₽/);
  });

  it('should handle negative numbers', () => {
    expect(formatCurrency(-1000)).toMatch(/-1\s000,00\s₽/);
  });
});

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = '2023-12-25T10:30:00Z';
    expect(formatDate(date)).toBe('25.12.2023');
  });

  it('should handle invalid dates', () => {
    expect(formatDate('invalid-date')).toBe('Не указана');
    expect(formatDate('')).toBe('Не указана');
  });
});

describe('getDaysUntilDue', () => {
  it('should calculate days until due correctly', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    expect(getDaysUntilDue(futureDate.toISOString())).toBe(5);
  });

  it('should handle overdue dates', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 3);
    expect(getDaysUntilDue(pastDate.toISOString())).toBe(-3);
  });

  it('should handle today', () => {
    const today = new Date().toISOString();
    expect(getDaysUntilDue(today)).toBe(0);
  });
});

describe('getPriorityColor', () => {
  it('should return correct colors for priorities', () => {
    expect(getPriorityColor('low')).toBe('bg-green-100 text-green-800');
    expect(getPriorityColor('medium')).toBe('bg-yellow-100 text-yellow-800');
    expect(getPriorityColor('high')).toBe('bg-orange-100 text-orange-800');
    expect(getPriorityColor('urgent')).toBe('bg-red-100 text-red-800');
  });

  it('should return default color for unknown priority', () => {
    expect(getPriorityColor('unknown')).toBe('bg-gray-100 text-gray-800');
  });
});

describe('hasPermission', () => {
  it('should check permissions correctly', () => {
    const userRole = 'Admin';
    expect(hasPermission(userRole, 'clients:read')).toBe(true);
    expect(hasPermission(userRole, 'clients:write')).toBe(true);
    expect(hasPermission(userRole, 'admin:access')).toBe(true);
  });

  it('should deny permissions for insufficient role', () => {
    const userRole = 'Master';
    expect(hasPermission(userRole, 'clients:write')).toBe(false);
    expect(hasPermission(userRole, 'admin:access')).toBe(false);
  });

  it('should handle empty permission', () => {
    const userRole = 'Manager';
    expect(hasPermission(userRole, '')).toBe(true);
  });
});

describe('getInitials', () => {
  it('should generate initials correctly', () => {
    expect(getInitials('John Doe')).toBe('JD');
    expect(getInitials('Алексей Петров')).toBe('АП');
    expect(getInitials('SingleName')).toBe('S');
  });

  it('should handle empty or invalid names', () => {
    expect(getInitials('')).toBe('?');
    expect(getInitials('   ')).toBe('?');
  });

  it('should handle names with multiple spaces', () => {
    expect(getInitials('John   Doe   Smith')).toBe('JD');
  });
});
