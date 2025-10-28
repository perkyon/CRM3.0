import { supabase, TABLES } from '../config';
import { DashboardKPIs } from '../../../types';
import { handleApiError } from '../../error/ErrorHandler';

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalClients: number;
  activeClients: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageProjectValue: number;
  projectsByStage: {
    stage: string;
    count: number;
  }[];
  projectsByPriority: {
    priority: string;
    count: number;
  }[];
  recentActivities: {
    id: string;
    type: 'project_created' | 'project_updated' | 'client_created' | 'task_completed';
    description: string;
    timestamp: string;
    userId?: string;
    userName?: string;
  }[];
  upcomingDeadlines: {
    projectId: string;
    projectTitle: string;
    dueDate: string;
    daysLeft: number;
    priority: string;
  }[];
}

export class SupabaseDashboardService {
  // Get comprehensive dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Execute all queries in parallel for better performance
      const [
        projectsResult,
        clientsResult,
        revenueResult,
        activitiesResult
      ] = await Promise.all([
        this.getProjectStats(),
        this.getClientStats(),
        this.getRevenueStats(),
        this.getRecentActivities()
      ]);

      const upcomingDeadlines = await this.getUpcomingDeadlines();

      return {
        ...projectsResult,
        ...clientsResult,
        ...revenueResult,
        recentActivities: activitiesResult,
        upcomingDeadlines,
      };
    } catch (error: any) {
      throw handleApiError(error, 'SupabaseDashboardService.getDashboardStats');
    }
  }

  // Get project statistics
  private async getProjectStats() {
    const { data: projects, error } = await supabase
      .from(TABLES.PROJECTS)
      .select('id, stage, priority, budget, created_at, due_date');

    if (error) {
      throw handleApiError(error, 'SupabaseDashboardService.getProjectStats');
    }

    const totalProjects = projects?.length || 0;
    const activeProjects = projects?.filter(p => 
      p.stage !== 'completed' && p.stage !== 'cancelled'
    ).length || 0;
    const completedProjects = projects?.filter(p => p.stage === 'completed').length || 0;

    // Group by stage
    const stageGroups = projects?.reduce((acc, project) => {
      acc[project.stage] = (acc[project.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const projectsByStage = Object.entries(stageGroups).map(([stage, count]) => ({
      stage,
      count,
    }));

    // Group by priority
    const priorityGroups = projects?.reduce((acc, project) => {
      acc[project.priority] = (acc[project.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const projectsByPriority = Object.entries(priorityGroups).map(([priority, count]) => ({
      priority,
      count,
    }));

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      projectsByStage,
      projectsByPriority,
    };
  }

  // Get client statistics
  private async getClientStats() {
    const { data: clients, error } = await supabase
      .from(TABLES.CLIENTS)
      .select('id, status, created_at');

    if (error) {
      throw handleApiError(error, 'SupabaseDashboardService.getClientStats');
    }

    const totalClients = clients?.length || 0;
    const activeClients = clients?.filter(c => c.status === 'active').length || 0;

    return {
      totalClients,
      activeClients,
    };
  }

  // Get revenue statistics
  private async getRevenueStats() {
    const { data: projects, error } = await supabase
      .from(TABLES.PROJECTS)
      .select('budget, created_at, stage');

    if (error) {
      throw handleApiError(error, 'SupabaseDashboardService.getRevenueStats');
    }

    const totalRevenue = projects?.reduce((sum, project) => {
      return sum + (project.budget || 0);
    }, 0) || 0;

    // Calculate monthly revenue (current month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyRevenue = projects?.reduce((sum, project) => {
      const projectDate = new Date(project.created_at);
      if (projectDate.getMonth() === currentMonth && projectDate.getFullYear() === currentYear) {
        return sum + (project.budget || 0);
      }
      return sum;
    }, 0) || 0;

    const averageProjectValue = projects?.length ? totalRevenue / projects.length : 0;

    return {
      totalRevenue,
      monthlyRevenue,
      averageProjectValue,
    };
  }

  // Get recent activities
  private async getRecentActivities() {
    try {
      // Get recent project activities
      const { data: projectActivities, error: projectError } = await supabase
        .from(TABLES.PROJECTS)
        .select('id, title, created_at, updated_at, stage')
        .order('updated_at', { ascending: false })
        .limit(10);

      if (projectError) {
        console.error('Error fetching project activities:', projectError);
      }

      // Get recent client activities
      const { data: clientActivities, error: clientError } = await supabase
        .from(TABLES.CLIENTS)
        .select('id, name, created_at, updated_at')
        .order('updated_at', { ascending: false })
        .limit(10);

      if (clientError) {
        console.error('Error fetching client activities:', clientError);
      }

      const activities = [];

      // Add project activities
      if (projectActivities) {
        for (const project of projectActivities) {
          // Check if it's a new project (created recently)
          const isNew = new Date(project.created_at).getTime() === new Date(project.updated_at).getTime();
          
          activities.push({
            id: `project_${project.id}`,
            type: isNew ? 'project_created' as const : 'project_updated' as const,
            description: isNew 
              ? `Создан новый проект "${project.title}"`
              : `Обновлен проект "${project.title}"`,
            timestamp: project.updated_at,
          });
        }
      }

      // Add client activities
      if (clientActivities) {
        for (const client of clientActivities) {
          const isNew = new Date(client.created_at).getTime() === new Date(client.updated_at).getTime();
          
          activities.push({
            id: `client_${client.id}`,
            type: 'client_created' as const,
            description: `Добавлен новый клиент "${client.name}"`,
            timestamp: client.created_at,
          });
        }
      }

      // Sort by timestamp and return top 10
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  }

  // Get upcoming project deadlines
  private async getUpcomingDeadlines() {
    const { data: projects, error } = await supabase
      .from(TABLES.PROJECTS)
      .select('id, title, due_date, priority, stage')
      .not('due_date', 'is', null)
      .neq('stage', 'completed')
      .neq('stage', 'cancelled')
      .order('due_date', { ascending: true })
      .limit(10);

    if (error) {
      console.error('Error fetching upcoming deadlines:', error);
      return [];
    }

    const now = new Date();
    
    return projects?.map(project => {
      const dueDate = new Date(project.due_date);
      const timeDiff = dueDate.getTime() - now.getTime();
      const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

      return {
        projectId: project.id,
        projectTitle: project.title,
        dueDate: project.due_date,
        daysLeft,
        priority: project.priority,
      };
    }).filter(project => project.daysLeft >= 0) || []; // Only future deadlines
  }

  // Get KPIs in the format expected by the Dashboard component
  async getKPIs(): Promise<DashboardKPIs> {
    const stats = await this.getDashboardStats();

    // Calculate shop load and projects in production
    const { ordersInProgress, shopLoadPercent } = await this.getShopLoad();

    return {
      ordersInProgress,
      shopLoadPercent,
      overdueTasks: stats.upcomingDeadlines.filter(d => d.daysLeft < 0).length,
      monthlyRevenue: stats.monthlyRevenue,
      monthlyMargin: 0, // TODO: Calculate from actual data
      materialDeficit: 0, // TODO: Integrate with materials system
    };
  }

  // Calculate shop load based on production items
  private async getShopLoad(): Promise<{ ordersInProgress: number; shopLoadPercent: number }> {
    try {
      // Get all projects in production stage
      const { data: productionProjects, error: projectsError } = await supabase
        .from(TABLES.PROJECTS)
        .select('id')
        .eq('stage', 'production');

      if (projectsError) throw projectsError;

      if (!productionProjects || productionProjects.length === 0) {
        return { ordersInProgress: 0, shopLoadPercent: 0 };
      }

      const projectIds = productionProjects.map(p => p.id);

      // Get all production items for these projects
      const { data: items, error: itemsError } = await supabase
        .from('production_items')
        .select('progress')
        .in('project_id', projectIds);

      if (itemsError) throw itemsError;

      if (!items || items.length === 0) {
        return { ordersInProgress: productionProjects.length, shopLoadPercent: 0 };
      }

      // Calculate average unfinished work (100 - average progress)
      const totalProgress = items.reduce((sum, item) => sum + item.progress, 0);
      const averageProgress = totalProgress / items.length;
      const shopLoadPercent = Math.round(100 - averageProgress);

      return {
        ordersInProgress: productionProjects.length,
        shopLoadPercent: Math.max(0, Math.min(100, shopLoadPercent)), // Clamp between 0-100
      };
    } catch (error) {
      console.error('Error calculating shop load:', error);
      return { ordersInProgress: 0, shopLoadPercent: 0 };
    }
  }

  // Get project performance metrics
  async getProjectPerformance(): Promise<{
    onTimeCompletion: number;
    averageDelay: number;
    budgetVariance: number;
  }> {
    const { data: completedProjects, error } = await supabase
      .from(TABLES.PROJECTS)
      .select('due_date, updated_at, budget')
      .eq('stage', 'completed')
      .not('due_date', 'is', null);

    if (error) {
      console.error('Error fetching project performance:', error);
      return {
        onTimeCompletion: 0,
        averageDelay: 0,
        budgetVariance: 0,
      };
    }

    if (!completedProjects || completedProjects.length === 0) {
      return {
        onTimeCompletion: 0,
        averageDelay: 0,
        budgetVariance: 0,
      };
    }

    // Calculate on-time completion rate
    const onTimeProjects = completedProjects.filter(project => {
      const dueDate = new Date(project.due_date);
      const completedDate = new Date(project.updated_at);
      return completedDate <= dueDate;
    });

    const onTimeCompletion = (onTimeProjects.length / completedProjects.length) * 100;

    // Calculate average delay
    const delays = completedProjects.map(project => {
      const dueDate = new Date(project.due_date);
      const completedDate = new Date(project.updated_at);
      const delayDays = Math.max(0, Math.ceil((completedDate.getTime() - dueDate.getTime()) / (1000 * 3600 * 24)));
      return delayDays;
    });

    const averageDelay = delays.reduce((sum, delay) => sum + delay, 0) / delays.length;

    return {
      onTimeCompletion: Math.round(onTimeCompletion),
      averageDelay: Math.round(averageDelay),
      budgetVariance: 0, // Would need actual vs planned budget data
    };
  }
}

export const supabaseDashboardService = new SupabaseDashboardService();
