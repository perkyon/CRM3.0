import { supabase, TABLES } from '../config';
import { handleApiError } from '../../error/ErrorHandler';

// Types
export interface ProductionZone {
  id: string;
  project_id: string;
  name: string;
  items_count: number;
  progress_percent: number;
  color: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface ProductionItem {
  id: string;
  project_id: string;
  parent_id?: string | null;
  zone_id: string;
  type: 'furniture' | 'component' | 'part';
  code: string;
  name: string;
  quantity: number;
  unit: string;
  status: string;
  progress_percent: number;
  current_stage: string | null;
  position: number;
  notes?: string | null;
  materials?: string | null;
  technical_notes?: string | null;
  manager_comment?: string | null;
  due_date?: string | null;
  created_at: string;
  updated_at: string;
  components?: ProductionComponent[];
  stages?: ProductionItemStage[];
}

export interface ProductionComponent {
  id: string;
  item_id: string;
  name: string;
  material: string | null;
  quantity: number;
  unit: string;
  progress: number;
  position: number;
  created_at: string;
  updated_at: string;
  stages?: ProductionStage[];
  parts?: ProductionComponentPart[];
}

export interface ProductionStage {
  id: string;
  component_id: string;
  name: string;
  custom_label?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'qa';
  position: number;
  color: string;
  assignee_id?: string;
  due_date?: string;
  started_at?: string;
  completed_at?: string;
  estimated_hours?: number;
  actual_hours?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductionComponentPart {
  id: string;
  component_id: string;
  name: string;
  quantity: number;
  width?: number;
  height?: number;
  depth?: number;
  material?: string;
  notes?: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface ProductionItemStage {
  id: string;
  item_id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed';
  position: number;
  color: string;
  assignee_id?: string;
  due_date?: string;
  started_at?: string;
  completed_at?: string;
  estimated_hours?: number;
  actual_hours?: number;
  created_at: string;
  updated_at: string;
}

export interface ProductionProject {
  id: string;
  title: string;
  client: string;
  progress_percent: number;
  due_date: string;
  zones: ProductionZone[];
  items: ProductionItem[];
}

interface CreateItemInput {
  projectId: string;
  zoneId: string;
  code: string;
  name: string;
  quantity: number;
  currentStage?: string;
  type?: 'furniture' | 'component' | 'part';
  materials?: string;
  technicalNotes?: string;
  comment?: string;
  dueDate?: string;
}

interface UpdateItemInput {
  code?: string;
  name?: string;
  quantity?: number;
  currentStage?: string;
  materials?: string;
  technicalNotes?: string;
  comment?: string;
  dueDate?: string;
}

class ProductionManagementService {
  // Get all zones for a project
  async getProjectZones(projectId: string): Promise<ProductionZone[]> {
    try {
      // Проверяем и обновляем сессию перед запросом
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Пытаемся обновить сессию
        await supabase.auth.refreshSession();
      }

      const { data, error } = await supabase
        .from('production_zones')
        .select('*')
        .eq('project_id', projectId)
        .order('position', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw handleApiError(error, 'ProductionManagementService.getProjectZones');
    }
  }

  // Get all items for a zone
  async getZoneItems(zoneId: string): Promise<ProductionItem[]> {
    try {
      const { data, error } = await supabase
        .from('production_items')
        .select('*')
        .eq('zone_id', zoneId)
        .order('position', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw handleApiError(error, 'ProductionManagementService.getZoneItems');
    }
  }

  // Get all items for a project
  async getProjectItems(projectId: string): Promise<ProductionItem[]> {
    try {
      // Проверяем и обновляем сессию перед запросом
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Пытаемся обновить сессию
        await supabase.auth.refreshSession();
      }

      const { data, error } = await supabase
        .from('production_items')
        .select('*')
        .eq('project_id', projectId)
        .order('position', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw handleApiError(error, 'ProductionManagementService.getProjectItems');
    }
  }

  // Get item with components and stages
  async getItemDetails(itemId: string): Promise<ProductionItem | null> {
    try {
      // Get item
      const { data: item, error: itemError } = await supabase
        .from('production_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (itemError) throw itemError;
      if (!item) return null;

      // Get components
      const { data: components, error: compError } = await supabase
        .from('production_components')
        .select('*')
        .eq('item_id', itemId)
        .order('position', { ascending: true });

      if (compError) throw compError;

      // Get item stages
      const { data: itemStages, error: stagesError } = await supabase
        .from('production_item_stages')
        .select('*')
        .eq('item_id', itemId)
        .order('position', { ascending: true });

      if (stagesError) throw stagesError;

      // Get stages and parts for each component
      const componentsWithStages = await Promise.all(
        (components || []).map(async (comp) => {
          const stagesResult = await supabase
            .from('production_stages')
            .select('*')
            .eq('component_id', comp.id)
            .order('position', { ascending: true });

          if (stagesResult.error) throw stagesResult.error;

          // Try to get parts (may not exist if table not created yet)
          let parts: any[] = [];
          try {
            const partsResult = await supabase
              .from('production_component_parts')
              .select('*')
              .eq('component_id', comp.id)
              .order('position', { ascending: true });
            
            if (!partsResult.error) {
              parts = partsResult.data || [];
            }
          } catch (error) {
            // Table may not exist yet, ignore error
            console.log('Parts table not available yet');
          }

          return {
            ...comp,
            stages: stagesResult.data || [],
            parts
          };
        })
      );

      return {
        ...item,
        components: componentsWithStages,
        stages: itemStages || []
      };
    } catch (error) {
      throw handleApiError(error, 'ProductionManagementService.getItemDetails');
    }
  }

  // Get full project production data
  async getProjectProductionData(projectId: string): Promise<ProductionProject | null> {
    try {
      // Get project
      const { data: project, error: projError } = await supabase
        .from('projects')
        .select('id, title, due_date, client_id')
        .eq('id', projectId)
        .single();

      if (projError) throw projError;
      if (!project) return null;

      // Get client name
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('name')
        .eq('id', project.client_id)
        .single();

      if (clientError) console.error('Client fetch error:', clientError);

      // Get zones
      const zones = await this.getProjectZones(projectId);

      // Get all items
      const items = await this.getProjectItems(projectId);

      // Calculate overall progress
      const totalProgress = items.reduce((sum, item) => sum + item.progress_percent, 0);
      const avgProgress = items.length > 0 ? Math.round(totalProgress / items.length) : 0;

      return {
        id: project.id,
        title: project.title,
        client: client?.name || 'Unknown',
        progress_percent: avgProgress,
        due_date: project.due_date || '',
        zones,
        items
      };
    } catch (error) {
      throw handleApiError(error, 'ProductionManagementService.getProjectProductionData');
    }
  }

  // Update item progress
  async updateItemProgress(itemId: string, progress_percent: number): Promise<void> {
    try {
      const { error} = await supabase
        .from('production_items')
        .update({ progress_percent })
        .eq('id', itemId);

      if (error) throw error;
    } catch (error) {
      throw handleApiError(error, 'ProductionManagementService.updateItemProgress');
    }
  }

  // Update stage status
  async updateStageStatus(
    stageId: string, 
    status: 'pending' | 'in_progress' | 'completed',
    table: 'production_stages' | 'production_item_stages' = 'production_stages'
  ): Promise<void> {
    try {
      const color = status === 'completed' ? 'bg-green-500' : 
                    status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300';

      const { error } = await supabase
        .from(table)
        .update({ status, color })
        .eq('id', stageId);

      if (error) throw error;
    } catch (error) {
      throw handleApiError(error, 'ProductionManagementService.updateStageStatus');
    }
  }

  // Create zone
  async createZone(projectId: string, name: string, color?: string): Promise<ProductionZone> {
    try {
      const { data, error } = await supabase
        .from('production_zones')
        .insert({
          project_id: projectId,
          name,
          color: color || 'bg-blue-100',
          items_count: 0,
          progress_percent: 0,
          position: 0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleApiError(error, 'ProductionManagementService.createZone');
    }
  }

  // Update zone name
  async updateZoneName(zoneId: string, name: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('production_zones')
        .update({ name })
        .eq('id', zoneId);

      if (error) throw error;
    } catch (error) {
      throw handleApiError(error, 'ProductionManagementService.updateZoneName');
    }
  }

  // Delete zone (and all its items)
  async deleteZone(zoneId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('production_zones')
        .delete()
        .eq('id', zoneId);

      if (error) throw error;
    } catch (error) {
      throw handleApiError(error, 'ProductionManagementService.deleteZone');
    }
  }

  // Create item
  async createItem(input: CreateItemInput): Promise<ProductionItem> {
    try {
      const {
        projectId,
        zoneId,
        code,
        name,
        quantity,
        currentStage,
        type = 'furniture',
        materials,
        technicalNotes,
        comment,
        dueDate,
      } = input;

      const { data, error } = await supabase
        .from('production_items')
        .insert({
          project_id: projectId,
          zone_id: zoneId,
          type,
          code,
          name,
          quantity,
          unit: 'шт',
          current_stage: currentStage || 'not_started',
          status: 'planned',
          progress_percent: 0,
          position: 0,
          materials: materials?.trim() || null,
          technical_notes: technicalNotes?.trim() || null,
          manager_comment: comment?.trim() || null,
          notes: comment?.trim() || null,
          due_date: dueDate || null,
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create item - no data returned');

      // Create default stages for the item
      await this.createDefaultItemStages(data.id);

      return data;
    } catch (error) {
      throw handleApiError(error, 'ProductionManagementService.createItem');
    }
  }

  // Create default stages for an item
  private async createDefaultItemStages(itemId: string): Promise<void> {
    try {
      console.log('📝 Creating default stages for item:', itemId);
      
      // Standard production stages for items
      const standardStages = [
        { name: 'cutting', position: 0 },
        { name: 'edging', position: 1 },
        { name: 'drilling', position: 2 },
        { name: 'assembly', position: 3 },
        { name: 'finishing', position: 4 },
        { name: 'packaging', position: 5 },
      ];

      const stages = standardStages.map((stage) => ({
        item_id: itemId,
        name: stage.name,
        status: 'pending' as const,
        position: stage.position,
        color: 'bg-gray-300',
      }));

      const { data, error } = await supabase
        .from('production_item_stages')
        .insert(stages)
        .select();

      if (error) {
        console.error('❌ Error inserting stages:', error);
        throw error;
      }
      
      console.log('✅ Created stages:', data);
    } catch (error) {
      console.error('Error creating default item stages:', error);
      // Don't throw error here, item is already created
    }
  }

  // Update item
  async updateItem(
    itemId: string,
    updates: UpdateItemInput
  ): Promise<void> {
    try {
      const { code, name, quantity, currentStage, materials, technicalNotes, comment, dueDate } = updates;

      const { error } = await supabase
        .from('production_items')
        .update({
          ...(code !== undefined ? { code } : {}),
          ...(name !== undefined ? { name } : {}),
          ...(quantity !== undefined ? { quantity } : {}),
          ...(currentStage !== undefined ? { current_stage: currentStage } : {}),
          ...(materials !== undefined ? { materials: materials?.trim() || null } : {}),
          ...(technicalNotes !== undefined ? { technical_notes: technicalNotes?.trim() || null } : {}),
          ...(comment !== undefined ? { manager_comment: comment?.trim() || null, notes: comment?.trim() || null } : {}),
          ...(dueDate !== undefined ? { due_date: dueDate || null } : {}),
        })
        .eq('id', itemId);

      if (error) throw error;
    } catch (error) {
      throw handleApiError(error, 'ProductionManagementService.updateItem');
    }
  }

  // Delete item
  async deleteItem(itemId: string): Promise<void> {
    try {
      // Get zone_id before deleting
      const { data: item, error: fetchError } = await supabase
        .from('production_items')
        .select('zone_id')
        .eq('id', itemId)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('production_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      // Recalculate zone progress after deletion
      if (item) {
        await this.recalculateZoneProgress(item.zone_id);
      }
    } catch (error) {
      throw handleApiError(error, 'ProductionManagementService.deleteItem');
    }
  }

  // ========== COMPONENT METHODS ==========

  // Get components for an item
  async getItemComponents(itemId: string): Promise<ProductionComponent[]> {
    try {
      const { data, error } = await supabase
        .from('production_components')
        .select('*')
        .eq('item_id', itemId)
        .order('position', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw handleApiError(error, 'ProductionManagementService.getItemComponents');
    }
  }

  // Get component with all related data (parts, materials, stages)
  async getComponentDetails(componentId: string) {
    try {
      const [component, parts, materials, stages] = await Promise.all([
        supabase.from('production_components').select('*').eq('id', componentId).single(),
        supabase.from('production_component_parts').select('*').eq('component_id', componentId),
        supabase.from('production_component_materials').select('*').eq('component_id', componentId),
        supabase.from('production_component_stage_tracking').select('*').eq('component_id', componentId).order('created_at'),
      ]);

      if (component.error) throw component.error;

      return {
        ...component.data,
        parts: parts.data || [],
        materials: materials.data || [],
        stages: stages.data || [],
      };
    } catch (error) {
      throw handleApiError(error, 'ProductionManagementService.getComponentDetails');
    }
  }

  // Create component with stages
  async createComponent(
    itemId: string,
    name: string,
    material?: string,
    quantity?: number,
    unit?: string,
    templateId?: string
  ): Promise<ProductionComponent> {
    try {
      // Create component
      const { data, error } = await supabase
        .from('production_components')
        .insert({
          item_id: itemId,
          name,
          material: material || null,
          quantity: quantity || 1,
          unit: unit || 'шт',
          progress: 0,
          position: 0
        })
        .select()
        .single();

      if (error) throw error;

      // Create default stages for the component
      if (data && templateId) {
        await this.createDefaultStages(data.id, templateId);
      }

      // Recalculate item and zone progress after creation
      await this.recalculateItemProgress(itemId);
      
      const { data: item } = await supabase
        .from('production_items')
        .select('zone_id')
        .eq('id', itemId)
        .single();
      
      if (item) {
        await this.recalculateZoneProgress(item.zone_id);
      }

      return data;
    } catch (error) {
      throw handleApiError(error, 'ProductionManagementService.createComponent');
    }
  }

  // Create default stages based on template
  private async createDefaultStages(
    componentId: string, 
    templateId: string
  ): Promise<void> {
    try {
      // Import templates dynamically to avoid circular dependency
      const { getTemplateById } = await import('../../constants/productionTemplates');
      const template = getTemplateById(templateId);
      
      if (!template) return;

      // Create stages from template
      const stages = template.stages.map((stage, index) => ({
        component_id: componentId,
        name: stage.name,
        status: 'pending' as const,
        position: index,
        color: 'bg-gray-300',
      }));

      const { error } = await supabase
        .from('production_stages')
        .insert(stages);

      if (error) throw error;
    } catch (error) {
      console.error('Error creating default stages:', error);
      // Don't throw error here, component is already created
    }
  }

  // Update component progress
  async updateComponentProgress(componentId: string, progress: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('production_components')
        .update({ progress })
        .eq('id', componentId);

      if (error) throw error;
    } catch (error) {
      throw handleApiError(error, 'ProductionManagementService.updateComponentProgress');
    }
  }

  // Delete component
  async deleteComponent(componentId: string): Promise<void> {
    try {
      // Get item_id before deleting
      const { data: component, error: fetchError } = await supabase
        .from('production_components')
        .select('item_id')
        .eq('id', componentId)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('production_components')
        .delete()
        .eq('id', componentId);

      if (error) throw error;

      // Recalculate item and zone progress after deletion
      if (component) {
        await this.recalculateItemProgress(component.item_id);

        // Get zone_id and recalculate zone progress
        const { data: item } = await supabase
          .from('production_items')
          .select('zone_id')
          .eq('id', component.item_id)
          .single();

        if (item) {
          await this.recalculateZoneProgress(item.zone_id);
        }
      }
    } catch (error) {
      throw handleApiError(error, 'ProductionManagementService.deleteComponent');
    }
  }

  // Add part to component
  async addComponentPart(
    componentId: string,
    name: string,
    quantity: number,
    width?: number,
    height?: number,
    depth?: number,
    material?: string,
    notes?: string
  ): Promise<ProductionComponentPart> {
    try {
      const { data, error } = await supabase
        .from('production_component_parts')
        .insert({
          component_id: componentId,
          name,
          quantity,
          width,
          height,
          depth,
          material,
          notes,
          position: 0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleApiError(error, 'ProductionManagementService.addComponentPart');
    }
  }

  // Update component part
  async updateComponentPart(
    partId: string,
    updates: Partial<Omit<ProductionComponentPart, 'id' | 'component_id' | 'created_at' | 'updated_at'>>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('production_component_parts')
        .update(updates)
        .eq('id', partId);

      if (error) throw error;
    } catch (error) {
      throw handleApiError(error, 'ProductionManagementService.updateComponentPart');
    }
  }

  // Delete component part
  async deleteComponentPart(partId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('production_component_parts')
        .delete()
        .eq('id', partId);

      if (error) throw error;
    } catch (error) {
      throw handleApiError(error, 'ProductionManagementService.deleteComponentPart');
    }
  }

  // ==================== MATERIALS MANAGEMENT ====================

  /**
   * Add material to component
   */
  async addComponentMaterial(componentId: string, materialData: any) {
    try {
      const { data, error } = await supabase
        .from('production_component_materials')
        .insert({
          component_id: componentId,
          name: materialData.name,
          material_type: materialData.materialType,
          thickness: materialData.thickness,
          quantity: materialData.quantity,
          unit: materialData.unit,
          color: materialData.color,
          finish: materialData.finish,
          wood_species: materialData.woodSpecies,
          grade: materialData.grade,
          brand: materialData.brand,
          article: materialData.article,
          notes: materialData.notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleApiError(error, 'ProductionManagementService.addComponentMaterial');
    }
  }

  /**
   * Get materials for component
   */
  async getComponentMaterials(componentId: string) {
    try {
      const { data, error } = await supabase
        .from('production_component_materials')
        .select('*')
        .eq('component_id', componentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw handleApiError(error, 'ProductionManagementService.getComponentMaterials');
    }
  }

  /**
   * Update material
   */
  async updateComponentMaterial(materialId: string, materialData: any) {
    try {
      const { data, error } = await supabase
        .from('production_component_materials')
        .update({
          name: materialData.name,
          material_type: materialData.materialType,
          thickness: materialData.thickness,
          quantity: materialData.quantity,
          unit: materialData.unit,
          color: materialData.color,
          finish: materialData.finish,
          wood_species: materialData.woodSpecies,
          grade: materialData.grade,
          brand: materialData.brand,
          article: materialData.article,
          notes: materialData.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', materialId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleApiError(error, 'ProductionManagementService.updateComponentMaterial');
    }
  }

  /**
   * Delete material
   */
  async deleteComponentMaterial(materialId: string) {
    try {
      const { error } = await supabase
        .from('production_component_materials')
        .delete()
        .eq('id', materialId);

      if (error) throw error;
    } catch (error) {
      throw handleApiError(error, 'ProductionManagementService.deleteComponentMaterial');
    }
  }

  // ==================== COMPONENT STAGES MANAGEMENT ====================

  /**
   * Add a stage to a component
   */
  async addComponentStage(componentId: string, stageData: {
    name: string;
    customLabel?: string;
    status: string;
    assignee_id?: string;
    estimated_hours?: number;
    notes?: string;
    position?: number;
  }) {
    try {
      // Get current max position
      const { data: existingStages } = await supabase
        .from('production_stages')
        .select('position')
        .eq('component_id', componentId)
        .order('position', { ascending: false })
        .limit(1);

      const maxPosition = existingStages && existingStages.length > 0 ? existingStages[0].position : -1;

      const { data, error } = await supabase
        .from('production_stages')
        .insert({
          component_id: componentId,
          name: stageData.name,
          custom_label: stageData.customLabel,
          status: stageData.status,
          assignee_id: stageData.assignee_id,
          estimated_hours: stageData.estimated_hours,
          notes: stageData.notes,
          position: stageData.position !== undefined ? stageData.position : maxPosition + 1,
        })
        .select()
        .single();

      if (error) throw error;

      // Recalculate progress after adding new stage
      await this.recalculateProgressCascade(componentId);

      return data;
    } catch (error) {
      throw handleApiError(error, 'ProductionManagementService.addComponentStage');
    }
  }

  /**
   * Update a component stage
   */
  async updateComponentStage(stageId: string, stageData: {
    name?: string;
    customLabel?: string;
    status?: string;
    assignee_id?: string | null;
    estimated_hours?: number | null;
    notes?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('production_stages')
        .update({
          name: stageData.name,
          custom_label: stageData.customLabel,
          status: stageData.status,
          assignee_id: stageData.assignee_id,
          estimated_hours: stageData.estimated_hours,
          notes: stageData.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', stageId)
        .select()
        .single();

      if (error) throw error;

      // Recalculate progress cascade if status was updated
      if (stageData.status !== undefined && data) {
        await this.recalculateProgressCascade(data.component_id);
      }

      return data;
    } catch (error) {
      throw handleApiError(error, 'ProductionManagementService.updateComponentStage');
    }
  }

  /**
   * Delete a component stage
   */
  async deleteComponentStage(stageId: string) {
    try {
      // Get component_id before deleting
      const { data: stage, error: fetchError } = await supabase
        .from('production_stages')
        .select('component_id')
        .eq('id', stageId)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('production_stages')
        .delete()
        .eq('id', stageId);

      if (error) throw error;

      // Recalculate progress after deletion
      if (stage) {
        await this.recalculateProgressCascade(stage.component_id);
      }
    } catch (error) {
      throw handleApiError(error, 'ProductionManagementService.deleteComponentStage');
    }
  }

  /**
   * Reorder component stages
   */
  async reorderComponentStages(componentId: string, stageIds: string[]) {
    try {
      // Update position for each stage
      const updates = stageIds.map((stageId, index) =>
        supabase
          .from('production_stages')
          .update({ position: index })
          .eq('id', stageId)
          .eq('component_id', componentId)
      );

      await Promise.all(updates);
    } catch (error) {
      throw handleApiError(error, 'ProductionManagementService.reorderComponentStages');
    }
  }

  /**
   * Move stage up
   */
  async moveStageUp(componentId: string, stageId: string) {
    try {
      const { data: stages, error: fetchError } = await supabase
        .from('production_stages')
        .select('id, position')
        .eq('component_id', componentId)
        .order('position');

      if (fetchError) throw fetchError;
      if (!stages) return;

      const currentIndex = stages.findIndex(s => s.id === stageId);
      if (currentIndex <= 0) return; // Already at top

      const prevStage = stages[currentIndex - 1];
      const currentStage = stages[currentIndex];

      // Swap positions
      await Promise.all([
        supabase
          .from('production_stages')
          .update({ position: prevStage.position })
          .eq('id', currentStage.id),
        supabase
          .from('production_stages')
          .update({ position: currentStage.position })
          .eq('id', prevStage.id),
      ]);
    } catch (error) {
      throw handleApiError(error, 'ProductionManagementService.moveStageUp');
    }
  }

  /**
   * Move stage down
   */
  async moveStageDown(componentId: string, stageId: string) {
    try {
      const { data: stages, error: fetchError } = await supabase
        .from('production_stages')
        .select('id, position')
        .eq('component_id', componentId)
        .order('position');

      if (fetchError) throw fetchError;
      if (!stages) return;

      const currentIndex = stages.findIndex(s => s.id === stageId);
      if (currentIndex >= stages.length - 1) return; // Already at bottom

      const nextStage = stages[currentIndex + 1];
      const currentStage = stages[currentIndex];

      // Swap positions
      await Promise.all([
        supabase
          .from('production_stages')
          .update({ position: nextStage.position })
          .eq('id', currentStage.id),
        supabase
          .from('production_stages')
          .update({ position: currentStage.position })
          .eq('id', nextStage.id),
      ]);
    } catch (error) {
      throw handleApiError(error, 'ProductionManagementService.moveStageDown');
    }
  }

  /**
   * Recalculate component progress based on its stages
   */
  async recalculateComponentProgress(componentId: string): Promise<number> {
    try {
      // Get all stages for this component
      const { data: stages, error } = await supabase
        .from('production_stages')
        .select('status')
        .eq('component_id', componentId);

      if (error) throw error;

      if (!stages || stages.length === 0) {
        // No stages = 0% progress
        await supabase
          .from('production_components')
          .update({ progress: 0 })
          .eq('id', componentId);
        return 0;
      }

      // Calculate progress: completed stages / total stages
      const completedStages = stages.filter(s => s.status === 'completed').length;
      const progress = Math.round((completedStages / stages.length) * 100);

      // Update component progress
      await supabase
        .from('production_components')
        .update({ progress })
        .eq('id', componentId);

      return progress;
    } catch (error) {
      throw handleApiError(error, 'ProductionManagementService.recalculateComponentProgress');
    }
  }

  /**
   * Recalculate item progress based on its components
   */
  async recalculateItemProgress(itemId: string): Promise<number> {
    try {
      // Get all components for this item
      const { data: components, error } = await supabase
        .from('production_components')
        .select('progress')
        .eq('item_id', itemId);

      if (error) throw error;

      if (!components || components.length === 0) {
        // No components = 0% progress
        await supabase
          .from('production_items')
          .update({ progress_percent: 0 })
          .eq('id', itemId);
        return 0;
      }

      // Calculate average progress of all components
      const totalProgress = components.reduce((sum, c) => sum + c.progress, 0);
      const progress_percent = Math.round(totalProgress / components.length);

      // Update item progress
      await supabase
        .from('production_items')
        .update({ progress_percent })
        .eq('id', itemId);

      return progress_percent;
    } catch (error) {
      throw handleApiError(error, 'ProductionManagementService.recalculateItemProgress');
    }
  }

  /**
   * Recalculate zone progress based on its items
   */
  async recalculateZoneProgress(zoneId: string): Promise<number> {
    try {
      // Get all items for this zone
      const { data: items, error } = await supabase
        .from('production_items')
        .select('progress_percent')
        .eq('zone_id', zoneId);

      if (error) throw error;

      if (!items || items.length === 0) {
        // No items = 0% progress
        await supabase
          .from('production_zones')
          .update({ progress_percent: 0 })
          .eq('id', zoneId);
        return 0;
      }

      // Calculate average progress of all items
      const totalProgress = items.reduce((sum, i) => sum + i.progress_percent, 0);
      const progress_percent = Math.round(totalProgress / items.length);

      // Update zone progress
      await supabase
        .from('production_zones')
        .update({ progress_percent })
        .eq('id', zoneId);

      return progress_percent;
    } catch (error) {
      throw handleApiError(error, 'ProductionManagementService.recalculateZoneProgress');
    }
  }

  /**
   * Recalculate progress cascade: component -> item -> zone
   * Call this after updating a stage status
   */
  async recalculateProgressCascade(componentId: string): Promise<void> {
    try {
      // 1. Recalculate component progress
      await this.recalculateComponentProgress(componentId);

      // 2. Get component's item_id
      const { data: component, error: compError } = await supabase
        .from('production_components')
        .select('item_id')
        .eq('id', componentId)
        .single();

      if (compError) throw compError;
      if (!component) return;

      // 3. Recalculate item progress
      await this.recalculateItemProgress(component.item_id);

      // 4. Get item's zone_id
      const { data: item, error: itemError } = await supabase
        .from('production_items')
        .select('zone_id')
        .eq('id', component.item_id)
        .single();

      if (itemError) throw itemError;
      if (!item) return;

      // 5. Recalculate zone progress
      await this.recalculateZoneProgress(item.zone_id);
    } catch (error) {
      throw handleApiError(error, 'ProductionManagementService.recalculateProgressCascade');
    }
  }
}

export const productionManagementService = new ProductionManagementService();

