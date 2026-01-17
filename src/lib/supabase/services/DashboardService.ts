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
    type: 'project_created' | 'project_updated' | 'client_created' | 'client_updated';
    description: string;
    timestamp: string;
    userId?: string;
    userName?: string;
    entityId: string;
    entityType: 'project' | 'client';
    stage?: string;
    clientStatus?: string;
    managerName?: string;
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
        .select(`
          id,
          title,
          created_at,
          updated_at,
          stage,
          code,
          manager_id,
          manager:users!projects_manager_id_fkey(id, name)
        `)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (projectError) {
        console.error('Error fetching project activities:', projectError);
      }

      // Get recent client activities
      const { data: clientActivities, error: clientError } = await supabase
        .from(TABLES.CLIENTS)
        .select('id, name, created_at, updated_at, status')
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
              ? `Создан проект "${project.title}"`
              : `Обновлен проект "${project.title}" (этап: ${project.stage})`,
            timestamp: project.updated_at,
            entityId: project.id,
            entityType: 'project' as const,
            stage: project.stage,
            managerName: (project.manager as any)?.name,
          });
        }
      }

      // Add client activities
      if (clientActivities) {
        for (const client of clientActivities) {
          const isNew = new Date(client.created_at).getTime() === new Date(client.updated_at).getTime();
          
          activities.push({
            id: `client_${client.id}`,
            type: isNew ? 'client_created' as const : 'client_updated' as const,
            description: isNew
              ? `Добавлен клиент "${client.name}"`
              : `Обновлен клиент "${client.name}"`,
            timestamp: client.updated_at,
            entityId: client.id,
            entityType: 'client' as const,
            clientStatus: client.status,
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
        .select('progress_percent')
        .in('project_id', projectIds);

      if (itemsError) throw itemsError;

      if (!items || items.length === 0) {
        return { ordersInProgress: productionProjects.length, shopLoadPercent: 0 };
      }

      // Calculate average unfinished work (100 - average progress)
      const totalProgress = items.reduce((sum, item) => sum + (item.progress_percent || 0), 0);
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

  // ==================== OWNER DASHBOARD METHODS ====================
  
  // Блок 1: Пульс производства
  async getProductionPulse() {
    try {
      const { data: projects, error } = await supabase
        .from(TABLES.PROJECTS)
        .select('id, stage, priority, due_date')
        .neq('stage', 'completed')
        .neq('stage', 'cancelled');

      if (error) throw error;

      const projectsInWork = projects?.length || 0;
      const urgentProjects = projects?.filter(p => p.priority === 'urgent' || p.priority === 'high').length || 0;
      
      const now = new Date();
      const overdueCount = projects?.filter(p => {
        if (!p.due_date) return false;
        return new Date(p.due_date) < now;
      }).length || 0;

      // Calculate team load from active tasks
      const teamLoad = await this.getTeamLoad();
      
      return {
        projectsInWork,
        urgentProjects,
        teamLoadPercent: teamLoad.averageLoad,
        overdueCount,
      };
    } catch (error) {
      console.error('Error getting production pulse:', error);
      return {
        projectsInWork: 0,
        urgentProjects: 0,
        teamLoadPercent: 0,
        overdueCount: 0,
      };
    }
  }

  // Блок 2: Загрузка людей
  // Блок 2: Загрузка людей
  async getTeamLoad() {
    try {
      // Get all active users in organization
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get organization members
      const { data: members, error: membersError } = await supabase
        .from('organization_members')
        .select(`
          user_id,
          profile:users!organization_members_user_id_fkey(id, name, role, active)
        `)
        .eq('active', true);

      if (membersError) throw membersError;

      const userIds = (members || [])
        .map((m: any) => m.profile?.id)
        .filter(Boolean);

      if (userIds.length === 0) {
        return { averageLoad: 0, users: [] };
      }

      // Get all active tasks for these users
      const { data: tasks, error: tasksError } = await supabase
        .from('kanban_tasks')
        .select(`
          id,
          title,
          assignee_id,
          status,
          project_id,
          project:projects!kanban_tasks_project_id_fkey(title, code)
        `)
        .in('assignee_id', userIds)
        .in('status', ['todo', 'in_progress', 'review']);

      if (tasksError) throw tasksError;

      // Calculate load for each user
      const userLoads = userIds.map((userId: string) => {
        const userTasks = tasks?.filter(t => t.assignee_id === userId) || [];
        const userProfile = members?.find((m: any) => m.profile?.id === userId)?.profile;
        
        // Simple load calculation: 10% per active task (max 100%)
        const loadPercent = Math.min(100, userTasks.length * 10);
        
        // Get current task (first in_progress or first todo)
        const currentTask = userTasks.find(t => t.status === 'in_progress') || userTasks[0];
        const taskDescription = currentTask 
          ? `${currentTask.title}${currentTask.project ? ` (${(currentTask.project as any).code || (currentTask.project as any).title})` : ''}`
          : 'Нет активных задач';

        // Get comment from project risk_notes if available
        let comment = '';
        if (currentTask?.project_id) {
          // We'll need to fetch project risk_notes separately or include in query
        }

        return {
          id: userId,
          name: (userProfile as any)?.name || 'Неизвестно',
          currentTask: taskDescription,
          loadPercent,
          comment: loadPercent > 80 ? 'Перегруз' : loadPercent < 30 ? 'Можно добавить задачи' : '',
        };
      });

      const averageLoad = userLoads.length > 0
        ? Math.round(userLoads.reduce((sum, u) => sum + u.loadPercent, 0) / userLoads.length)
        : 0;

      return {
        averageLoad,
        users: userLoads.sort((a, b) => b.loadPercent - a.loadPercent),
      };
    } catch (error) {
      console.error('Error getting team load:', error);
      return { averageLoad: 0, users: [] };
    }
  }

  // Блок 3: Топ-3 проблемных проекта
  async getTopProblemProjects(limit: number = 3) {
    try {
      const { data: projects, error } = await supabase
        .from(TABLES.PROJECTS)
        .select(`
          id,
          title,
          code,
          risk_notes,
          priority,
          due_date,
          stage
        `)
        .neq('stage', 'completed')
        .neq('stage', 'cancelled')
        .order('priority', { ascending: false })
        .order('due_date', { ascending: true })
        .limit(limit * 2); // Get more to filter

      if (error) throw error;

      // Get production progress for each project
      const projectIds = projects?.map(p => p.id) || [];
      const { data: items } = await supabase
        .from('production_items')
        .select('project_id, progress_percent')
        .in('project_id', projectIds);

      const now = new Date();
      const projectsWithRisk = (projects || []).map(project => {
        const projectItems = items?.filter(i => i.project_id === project.id) || [];
        const readinessPercent = projectItems.length > 0
          ? Math.round(projectItems.reduce((sum, i) => sum + (i.progress_percent || 0), 0) / projectItems.length)
          : 0;

        const daysLeft = project.due_date
          ? Math.ceil((new Date(project.due_date).getTime() - now.getTime()) / (1000 * 3600 * 24))
          : 999;

        // Determine risk
        let risk = 'Всё ок';
        if (project.risk_notes) {
          risk = project.risk_notes.substring(0, 50);
        } else if (project.priority === 'urgent') {
          risk = 'Срочный проект';
        } else if (daysLeft < 0) {
          risk = 'Просрочен';
        } else if (daysLeft < 3) {
          risk = 'Скоро дедлайн';
        }

        return {
          id: project.id,
          title: project.title,
          code: project.code,
          risk,
          readinessPercent,
          daysLeft,
        };
      });

      // Sort by priority: overdue > urgent > high priority > low days left
      return projectsWithRisk
        .sort((a, b) => {
          if (a.daysLeft < 0 && b.daysLeft >= 0) return -1;
          if (a.daysLeft >= 0 && b.daysLeft < 0) return 1;
          return a.daysLeft - b.daysLeft;
        })
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting top problem projects:', error);
      return [];
    }
  }

  // Блок 4: Узкие места по цехам
  async getProductionBottlenecks() {
    try {
      const { data: projects, error } = await supabase
        .from(TABLES.PROJECTS)
        .select('id, production_sub_stage')
        .eq('stage', 'production');

      if (error) throw error;

      // Count projects per production_sub_stage
      const stageCounts: Record<string, number> = {};
      (projects || []).forEach(project => {
        if (project.production_sub_stage) {
          stageCounts[project.production_sub_stage] = (stageCounts[project.production_sub_stage] || 0) + 1;
        }
      });

      const stageLabels: Record<string, string> = {
        cutting: 'Раскрой',
        drilling: 'Сверление',
        sanding: 'Шлифовка',
        painting: 'Покраска',
        assembly: 'Сборка',
        qa: 'Контроль качества',
        finishing: 'Отделка',
        quality_control: 'ОТК',
        packaging: 'Упаковка',
      };

      const bottlenecks = Object.entries(stageCounts).map(([stage, count]) => {
        let status: 'overload' | 'normal' | 'underload' | 'ok' = 'ok';
        let description = '';

        if (count >= 3) {
          status = 'overload';
          description = `Перегруз (${count} заказа одновременно)`;
        } else if (count === 2) {
          status = 'normal';
          description = 'В норме';
        } else if (count === 1) {
          status = 'underload';
          description = 'Чуть недогружена';
        } else {
          status = 'ok';
          description = 'Ок';
        }

        return {
          stage,
          stageLabel: stageLabels[stage] || stage,
          status,
          load: count,
          description,
        };
      });

      // Add stages that might not have projects but are important
      const allStages = ['cutting', 'drilling', 'painting', 'assembly'];
      allStages.forEach(stage => {
        if (!bottlenecks.find(b => b.stage === stage)) {
          bottlenecks.push({
            stage,
            stageLabel: stageLabels[stage] || stage,
            status: 'ok',
            load: 0,
            description: 'Ок',
          });
        }
      });

      return bottlenecks.sort((a, b) => {
        const order = ['overload', 'normal', 'underload', 'ok'];
        return order.indexOf(a.status) - order.indexOf(b.status);
      });
    } catch (error) {
      console.error('Error getting production bottlenecks:', error);
      return [];
    }
  }

  // Блок 5: Деньги
  async getFinancialOverview() {
    try {
      // Get projects with budgets
      const { data: projects, error } = await supabase
        .from(TABLES.PROJECTS)
        .select(`
          id,
          budget,
          created_at,
          due_date,
          client:clients!projects_client_id_fkey(id, name)
        `)
        .not('budget', 'is', null);

      if (error) throw error;

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Received this month (projects created this month)
      const receivedThisMonth = (projects || []).reduce((sum, project) => {
        const projectDate = new Date(project.created_at);
        if (projectDate.getMonth() === currentMonth && projectDate.getFullYear() === currentYear) {
          return sum + (project.budget || 0);
        }
        return sum;
      }, 0);

      // Expected in 7 days (projects due in next 7 days)
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const expectedIn7Days = (projects || []).reduce((sum, project) => {
        if (!project.due_date) return sum;
        const dueDate = new Date(project.due_date);
        if (dueDate >= now && dueDate <= sevenDaysFromNow) {
          return sum + (project.budget || 0);
        }
        return sum;
      }, 0);

      // Payment problems (overdue projects)
      const overdueProjects = (projects || []).filter(project => {
        if (!project.due_date) return false;
        return new Date(project.due_date) < now;
      });

      const paymentProblemsList = overdueProjects.map(project => {
        const daysOverdue = Math.ceil((now.getTime() - new Date(project.due_date).getTime()) / (1000 * 3600 * 24));
        return {
          clientName: (project.client as any)?.name || 'Неизвестно',
          amount: project.budget || 0,
          daysOverdue,
        };
      });

      return {
        receivedThisMonth: Math.round(receivedThisMonth),
        expectedIn7Days: Math.round(expectedIn7Days),
        paymentProblems: paymentProblemsList.length,
        paymentProblemsList: paymentProblemsList.slice(0, 5), // Top 5
      };
    } catch (error) {
      console.error('Error getting financial overview:', error);
      return {
        receivedThisMonth: 0,
        expectedIn7Days: 0,
        paymentProblems: 0,
        paymentProblemsList: [],
      };
    }
  }

  // Блок 6: Проблемы владельца
  async getOwnerActionItems() {
    try {
      const actionItems: Array<{
        id: string;
        type: 'material' | 'approval' | 'blocker' | 'decision';
        title: string;
        description: string;
        projectId?: string;
        projectTitle?: string;
      }> = [];

      // Get projects with risk_notes that require owner action
      const { data: projects, error } = await supabase
        .from(TABLES.PROJECTS)
        .select('id, title, risk_notes, priority')
        .not('risk_notes', 'is', null)
        .neq('stage', 'completed')
        .neq('stage', 'cancelled');

      if (error) throw error;

      (projects || []).forEach(project => {
        if (project.risk_notes) {
          const riskLower = project.risk_notes.toLowerCase();
          
          // Check for material issues
          if (riskLower.includes('материал') || riskLower.includes('бюджет') || riskLower.includes('закуп')) {
            actionItems.push({
              id: `material_${project.id}`,
              type: 'material',
              title: 'Не хватает материала',
              description: project.risk_notes,
              projectId: project.id,
              projectTitle: project.title,
            });
          }

          // Check for approval issues
          if (riskLower.includes('согласование') || riskLower.includes('одобрени')) {
            actionItems.push({
              id: `approval_${project.id}`,
              type: 'approval',
              title: 'Нужно согласование с клиентом',
              description: project.risk_notes,
              projectId: project.id,
              projectTitle: project.title,
            });
          }

          // Check for blockers
          if (riskLower.includes('блок') || riskLower.includes('застоп') || project.priority === 'urgent') {
            actionItems.push({
              id: `blocker_${project.id}`,
              type: 'blocker',
              title: 'Блокирующее решение по проекту',
              description: project.risk_notes,
              projectId: project.id,
              projectTitle: project.title,
            });
          }
        }
      });

      // Check for material deficits - get all materials and filter in JS
      const { data: allMaterials } = await supabase
        .from('materials')
        .select('id, name, balance, min_level');
      
      const materials = allMaterials?.filter(m => 
        m.balance !== null && 
        m.min_level !== null && 
        Number(m.balance) < Number(m.min_level)
      ) || [];

      if (materials && materials.length > 0) {
        materials.forEach(material => {
          actionItems.push({
            id: `material_deficit_${material.id}`,
            type: 'material',
            title: `Дефицит материала: ${material.name}`,
            description: `Остаток: ${material.balance}, минимум: ${material.min_level}`,
          });
        });
      }

      return actionItems.slice(0, 10); // Top 10
    } catch (error) {
      console.error('Error getting owner action items:', error);
      return [];
    }
  }

  // Get all owner dashboard data at once
  async getOwnerDashboardData() {
    const [pulse, teamLoad, problemProjects, bottlenecks, financial, actionItems] = await Promise.all([
      this.getProductionPulse(),
      this.getTeamLoad(),
      this.getTopProblemProjects(3),
      this.getProductionBottlenecks(),
      this.getFinancialOverview(),
      this.getOwnerActionItems(),
    ]);

    return {
      pulse,
      teamLoad,
      problemProjects,
      bottlenecks,
      financial,
      actionItems,
    };
  }
}

export const supabaseDashboardService = new SupabaseDashboardService();
