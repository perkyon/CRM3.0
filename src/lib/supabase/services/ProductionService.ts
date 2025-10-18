import { supabase } from '../config';
import { 
  ProjectComponent, 
  ProjectSubComponent, 
  ProductionStage,
  CreateProjectComponentRequest,
  CreateProjectSubComponentRequest,
  CreateProductionStageRequest,
  UpdateProductionStageRequest,
  ComponentTemplate
} from '../../../types';

export class ProductionService {
  // Компоненты проекта
  static async getProjectComponents(projectId: string): Promise<ProjectComponent[]> {
    const { data, error } = await supabase
      .from('project_components')
      .select(`
        *,
        project_subcomponents (
          *,
          production_stages (*)
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async createProjectComponent(request: CreateProjectComponentRequest): Promise<ProjectComponent> {
    const { data, error } = await supabase
      .from('project_components')
      .insert({
        project_id: request.projectId,
        component_type: request.componentType,
        name: request.name,
        description: request.description,
        quantity: request.quantity || 1
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateProjectComponent(
    componentId: string, 
    updates: Partial<ProjectComponent>
  ): Promise<ProjectComponent> {
    const { data, error } = await supabase
      .from('project_components')
      .update(updates)
      .eq('id', componentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteProjectComponent(componentId: string): Promise<void> {
    const { error } = await supabase
      .from('project_components')
      .delete()
      .eq('id', componentId);

    if (error) throw error;
  }

  // Подкомпоненты
  static async getProjectSubComponents(componentId: string): Promise<ProjectSubComponent[]> {
    const { data, error } = await supabase
      .from('project_subcomponents')
      .select(`
        *,
        production_stages (
          *,
          users (id, name)
        ),
        subcomponent_materials (*),
        subcomponent_files (*)
      `)
      .eq('component_id', componentId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async createProjectSubComponent(request: CreateProjectSubComponentRequest): Promise<ProjectSubComponent> {
    const { data, error } = await supabase
      .from('project_subcomponents')
      .insert({
        component_id: request.componentId,
        subcomponent_type: request.subComponentType,
        name: request.name,
        description: request.description,
        quantity: request.quantity || 1,
        dimensions: request.dimensions,
        material: request.material,
        color: request.color
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateProjectSubComponent(
    subComponentId: string, 
    updates: Partial<ProjectSubComponent>
  ): Promise<ProjectSubComponent> {
    const { data, error } = await supabase
      .from('project_subcomponents')
      .update(updates)
      .eq('id', subComponentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteProjectSubComponent(subComponentId: string): Promise<void> {
    const { error } = await supabase
      .from('project_subcomponents')
      .delete()
      .eq('id', subComponentId);

    if (error) throw error;
  }

  // Этапы производства
  static async getProductionStages(subComponentId: string): Promise<ProductionStage[]> {
    const { data, error } = await supabase
      .from('production_stages')
      .select(`
        *,
        users (id, name)
      `)
      .eq('subcomponent_id', subComponentId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async createProductionStage(request: CreateProductionStageRequest): Promise<ProductionStage> {
    const { data, error } = await supabase
      .from('production_stages')
      .insert({
        subcomponent_id: request.subComponentId,
        stage_type: request.stageType,
        name: request.name,
        description: request.description,
        order_index: request.orderIndex,
        estimated_hours: request.estimatedHours,
        assignee_id: request.assigneeId
      })
      .select(`
        *,
        users (id, name)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateProductionStage(
    stageId: string, 
    updates: UpdateProductionStageRequest
  ): Promise<ProductionStage> {
    const { data, error } = await supabase
      .from('production_stages')
      .update(updates)
      .eq('id', stageId)
      .select(`
        *,
        users (id, name)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteProductionStage(stageId: string): Promise<void> {
    const { error } = await supabase
      .from('production_stages')
      .delete()
      .eq('id', stageId);

    if (error) throw error;
  }

  // Шаблоны компонентов
  static async getComponentTemplates(componentType?: string): Promise<ComponentTemplate[]> {
    let query = supabase
      .from('component_templates')
      .select('*')
      .order('created_at', { ascending: true });

    if (componentType) {
      query = query.eq('component_type', componentType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  static async createComponentFromTemplate(
    projectId: string, 
    templateId: string
  ): Promise<ProjectComponent> {
    // Получаем шаблон
    const { data: template, error: templateError } = await supabase
      .from('component_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError) throw templateError;

    // Создаем компонент
    const { data: component, error: componentError } = await supabase
      .from('project_components')
      .insert({
        project_id: projectId,
        component_type: template.component_type,
        name: template.name,
        description: template.description
      })
      .select()
      .single();

    if (componentError) throw componentError;

    // Создаем подкомпоненты из шаблона
    for (const subComponentTemplate of template.subcomponents) {
      const { error: subComponentError } = await supabase
        .from('project_subcomponents')
        .insert({
          component_id: component.id,
          subcomponent_type: subComponentTemplate.type,
          name: subComponentTemplate.name,
          quantity: subComponentTemplate.quantity
        });

      if (subComponentError) throw subComponentError;
    }

    return component;
  }

  // Статистика производства
  static async getProductionStats(projectId: string) {
    const { data: components, error: componentsError } = await supabase
      .from('project_components')
      .select(`
        id,
        project_subcomponents (
          id,
          production_stages (
            id,
            status,
            estimated_hours,
            actual_hours
          )
        )
      `)
      .eq('project_id', projectId);

    if (componentsError) throw componentsError;

    let totalStages = 0;
    let completedStages = 0;
    let inProgressStages = 0;
    let totalEstimatedHours = 0;
    let totalActualHours = 0;

    components?.forEach(component => {
      component.project_subcomponents?.forEach(subComponent => {
        subComponent.production_stages?.forEach(stage => {
          totalStages++;
          totalEstimatedHours += stage.estimated_hours || 0;
          totalActualHours += stage.actual_hours || 0;

          if (stage.status === 'completed') {
            completedStages++;
          } else if (stage.status === 'in_progress') {
            inProgressStages++;
          }
        });
      });
    });

    return {
      totalComponents: components?.length || 0,
      totalSubComponents: components?.reduce((acc, c) => acc + (c.project_subcomponents?.length || 0), 0) || 0,
      totalStages,
      completedStages,
      inProgressStages,
      pendingStages: totalStages - completedStages - inProgressStages,
      totalEstimatedHours,
      totalActualHours,
      progressPercentage: totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0
    };
  }
}

export const productionService = ProductionService;
