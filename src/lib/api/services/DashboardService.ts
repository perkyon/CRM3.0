import { apiService } from '../client';
import { API_ENDPOINTS } from '../config';
import { DashboardKPIs, Activity } from '../../types';

export class DashboardService {
  // Get dashboard KPIs
  async getKPIs(): Promise<DashboardKPIs> {
    const response = await apiService.get<DashboardKPIs>(API_ENDPOINTS.dashboard.kpis);
    return response.data;
  }

  // Get recent activities
  async getActivities(params?: {
    page?: number;
    limit?: number;
    type?: string;
    userId?: string;
    from?: string;
    to?: string;
  }): Promise<Activity[]> {
    const response = await apiService.get<Activity[]>(
      API_ENDPOINTS.dashboard.activities,
      { params }
    );
    return response.data;
  }

  // Get project statistics
  async getProjectStats(): Promise<{
    total: number;
    active: number;
    completed: number;
    overdue: number;
    byStage: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    const response = await apiService.get('/dashboard/project-stats');
    return response.data;
  }

  // Get client statistics
  async getClientStats(): Promise<{
    total: number;
    new: number;
    active: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    const response = await apiService.get('/dashboard/client-stats');
    return response.data;
  }

  // Get production statistics
  async getProductionStats(): Promise<{
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
    byColumn: Record<string, number>;
    byAssignee: Record<string, number>;
  }> {
    const response = await apiService.get('/dashboard/production-stats');
    return response.data;
  }

  // Get financial statistics
  async getFinancialStats(): Promise<{
    totalRevenue: number;
    monthlyRevenue: number;
    outstandingInvoices: number;
    overduePayments: number;
    byMonth: Array<{ month: string; revenue: number; expenses: number }>;
  }> {
    const response = await apiService.get('/dashboard/financial-stats');
    return response.data;
  }

  // Get upcoming deadlines
  async getUpcomingDeadlines(days: number = 7): Promise<Array<{
    id: string;
    title: string;
    type: 'project' | 'task' | 'payment';
    dueDate: string;
    priority: string;
    assignee?: string;
  }>> {
    const response = await apiService.get('/dashboard/upcoming-deadlines', {
      params: { days }
    });
    return response.data;
  }

  // Get recent projects
  async getRecentProjects(limit: number = 5): Promise<Array<{
    id: string;
    title: string;
    client: string;
    stage: string;
    progress: number;
    dueDate: string;
    priority: string;
  }>> {
    const response = await apiService.get('/dashboard/recent-projects', {
      params: { limit }
    });
    return response.data;
  }

  // Get top clients by revenue
  async getTopClients(limit: number = 5): Promise<Array<{
    id: string;
    name: string;
    revenue: number;
    projectsCount: number;
    lastProjectDate: string;
  }>> {
    const response = await apiService.get('/dashboard/top-clients', {
      params: { limit }
    });
    return response.data;
  }

  // Get team performance
  async getTeamPerformance(): Promise<Array<{
    userId: string;
    userName: string;
    completedTasks: number;
    activeTasks: number;
    overdueTasks: number;
    efficiency: number;
  }>> {
    const response = await apiService.get('/dashboard/team-performance');
    return response.data;
  }

  // Get system health
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    responseTime: number;
    errorRate: number;
    lastBackup: string;
    diskUsage: number;
    memoryUsage: number;
  }> {
    const response = await apiService.get('/dashboard/system-health');
    return response.data;
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();
