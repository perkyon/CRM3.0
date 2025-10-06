import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0 ₽';
  }
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(amount).replace('RUB', '₽');
}

export function formatDate(date: string): string {
  if (!date || date === '') {
    return 'Не указана';
  }
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return 'Не указана';
  }
  
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateObj);
}

export function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

export function formatPhone(phone: string | undefined | null): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('7') && cleaned.length === 11) {
    return `+7 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
  }
  return phone;
}

export function getDaysUntilDue(dueDate: string): number {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    lead: 'bg-yellow-100 text-yellow-800',
    new: 'bg-blue-100 text-blue-800',
    in_work: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800',
    client: 'bg-purple-100 text-purple-800',
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    to_order: 'bg-orange-100 text-orange-800',
    ordered: 'bg-blue-100 text-blue-800',
    received: 'bg-green-100 text-green-800',
    written_off: 'bg-red-100 text-red-800',
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
}

export function getPriorityColor(priority: string): string {
  const priorityColors: Record<string, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };
  return priorityColors[priority] || 'bg-gray-100 text-gray-800';
}

export function hasPermission(userRole: string, permission: string): boolean {
  // Empty permission means no restriction
  if (!permission || permission === '') {
    return true;
  }
  
  const rolePermissions: Record<string, string[]> = {
    Admin: ['*'],
    Manager: ['clients', 'projects', 'estimates', 'finance_view'],
    Master: ['projects', 'production', 'bom', 'inventory_view'],
    Procurement: ['bom', 'inventory', 'suppliers'],
    Accountant: ['finance', 'invoices', 'payments'],
  };

  const permissions = rolePermissions[userRole] || [];
  return permissions.includes('*') || permissions.includes(permission);
}

export function getInitials(name: string): string {
  if (!name || name.trim() === '') {
    return '?';
  }
  
  const words = name.trim().split(/\s+/).filter(word => word.length > 0);
  if (words.length === 0) {
    return '?';
  }
  
  return words
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}