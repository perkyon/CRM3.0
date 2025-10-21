import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  ArrowLeft, 
  Search, 
  Plus,
  Settings,
  ListTree
} from 'lucide-react';
import { ProductionTree } from '../production/ProductionTree';
import { supabaseProductionItemService } from '../../lib/supabase/services/ProductionItemService';
import { ProductionItem, KanbanTask } from '../../types';
import { useProjects } from '../../contexts/ProjectContextNew';
import { toast } from '../../lib/toast';
import { cn } from '../../lib/utils';

export function ProductionManager() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects } = useProjects();
  
  const [items, setItems] = useState<ProductionItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ProductionItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const project = projects.find(p => p.id === projectId);

  useEffect(() => {
    if (projectId) {
      loadProductionItems();
    }
  }, [projectId]);

  const loadProductionItems = async () => {
    if (!projectId) return;
    
    try {
      setIsLoading(true);
      const data = await supabaseProductionItemService.getProjectProductionTree(projectId);
      setItems(data);
      
      // Auto-select first item
      if (data.length > 0 && !selectedItem) {
        setSelectedItem(data[0]);
      }
    } catch (error) {
      console.error('Error loading production items:', error);
      toast.error('Ошибка загрузки производства');
    } finally {
      setIsLoading(false);
    }
  };

  // Group items by category/zone
  const zones = React.useMemo(() => {
    const grouped = new Map<string, ProductionItem[]>();
    
    items.forEach(item => {
      // Use first word of name as zone, or "Общее"
      const zone = item.name.split(' ')[0] || 'Общее';
      if (!grouped.has(zone)) {
        grouped.set(zone, []);
      }
      grouped.get(zone)?.push(item);
    });
    
    return Array.from(grouped.entries()).map(([name, items]) => ({
      name,
      items,
      progress: items.length > 0 
        ? Math.round(items.reduce((sum, item) => sum + item.progressPercent, 0) / items.length)
        : 0,
      completed: items.filter(i => i.status === 'completed').length,
      total: items.length
    }));
  }, [items]);

  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  // Filter items by selected zone
  const filteredItems = React.useMemo(() => {
    if (!selectedZone) return items;
    return items.filter(item => item.name.startsWith(selectedZone));
  }, [items, selectedZone]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">Загрузка производства...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(`/projects/${projectId}`)}
            >
              <ArrowLeft className="size-4 mr-2" />
              Назад к проекту
            </Button>
            <div className="border-l h-6"></div>
            <div>
              <div className="flex items-center gap-3">
                <ListTree className="size-5 text-primary" />
                <div>
                  <h1 className="text-xl font-semibold">Производство</h1>
                  <p className="text-sm text-muted-foreground">
                    {project?.title || 'Проект'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/production/${projectId}`)}
            >
              <Settings className="size-4 mr-2" />
              Канбан доска
            </Button>
            <Button size="sm">
              <Plus className="size-4 mr-2" />
              Добавить изделие
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Zones */}
        <div className="w-64 border-r bg-muted/30 p-4 overflow-y-auto">
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
              Зоны
            </h3>
            
            <button
              onClick={() => setSelectedZone(null)}
              className={cn(
                "w-full text-left p-3 rounded-lg transition-colors",
                !selectedZone ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Все зоны</span>
                <span className="text-sm">{items.length} шт.</span>
              </div>
            </button>

            {zones.map(zone => (
              <button
                key={zone.name}
                onClick={() => setSelectedZone(zone.name)}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-colors",
                  selectedZone === zone.name 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-accent"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{zone.name}</span>
                  <span className="text-sm">{zone.progress}%</span>
                </div>
                <div className="space-y-1">
                  <Progress value={zone.progress} className="h-1" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{zone.completed} / {zone.total} изд.</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Center - Items List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="mb-6">
              <div className="text-sm text-muted-foreground">
                ИЗДЕЛИЯ
              </div>
              <div className="text-2xl font-semibold">
                {filteredItems.length} шт.
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase">
                <div className="col-span-5">Название</div>
                <div className="col-span-3">Этап</div>
                <div className="col-span-2">%</div>
                <div className="col-span-2">Мастер</div>
              </div>

              {filteredItems
                .filter(item => 
                  !searchQuery || 
                  item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.code?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={cn(
                      "w-full grid grid-cols-12 gap-4 px-4 py-3 rounded-lg text-left transition-colors",
                      selectedItem?.id === item.id 
                        ? "bg-primary/10 border border-primary" 
                        : "hover:bg-accent border border-transparent"
                    )}
                  >
                    <div className="col-span-5">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.code || item.type === 'furniture' ? 'Изделие' : 'Компонент'}
                      </div>
                    </div>
                    <div className="col-span-3">
                      <Badge variant={
                        item.status === 'completed' ? 'default' :
                        item.status === 'in_progress' ? 'secondary' :
                        'outline'
                      }>
                        {item.status === 'completed' ? 'Готово' :
                         item.status === 'in_progress' ? item.tasks?.[0]?.title.split(' ')[0] || 'В работе' :
                         item.status === 'on_hold' ? 'Пауза' :
                         'План'}
                      </Badge>
                    </div>
                    <div className="col-span-2">
                      <div className="font-medium">{item.progressPercent}%</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm text-muted-foreground">
                        {item.tasks?.find(t => t.assigneeId)?.assigneeId?.substring(0, 6) || '—'}
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Details */}
        {selectedItem && (
          <div className="w-96 border-l bg-muted/30 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Item Header */}
              <div>
                <h2 className="text-xl font-semibold mb-1">{selectedItem.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedItem.code ? `${selectedItem.code} • ` : ''}
                  {selectedItem.type === 'furniture' ? 'Изделие' : 'Компонент'} • {selectedItem.progressPercent}%
                </p>
              </div>

              {/* Category & Stage */}
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-2">
                  КАТЕГОРИЯ
                </div>
                <Badge variant="outline" className="mb-4">
                  {selectedItem.name.split(' ')[0]}
                </Badge>

                <div className="text-xs font-semibold text-muted-foreground mb-2">
                  ЭТАП
                </div>
                <Badge variant={
                  selectedItem.status === 'completed' ? 'default' :
                  selectedItem.status === 'in_progress' ? 'secondary' :
                  'outline'
                }>
                  {selectedItem.status === 'completed' ? 'Готово' :
                   selectedItem.status === 'in_progress' ? 'В работе' :
                   selectedItem.status === 'on_hold' ? 'На паузе' :
                   'Запланировано'}
                </Badge>

                {selectedItem.createdAt && (
                  <>
                    <div className="text-xs font-semibold text-muted-foreground mb-2 mt-4">
                      НАЧАЛО
                    </div>
                    <div className="text-sm">
                      {new Date(selectedItem.createdAt).toLocaleDateString('ru-RU')}
                    </div>
                  </>
                )}
              </div>

              {/* Components */}
              {selectedItem.children && selectedItem.children.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground mb-3">
                    КОМПОНЕНТЫ
                  </div>
                  <div className="space-y-2">
                    {selectedItem.children.map(child => (
                      <div 
                        key={child.id}
                        className="p-3 rounded-lg border bg-background"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-sm">{child.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {child.tasks?.length || 0}/{child.tasks?.length || 0}
                          </div>
                        </div>
                        {child.material?.name && (
                          <div className="text-xs text-muted-foreground">
                            {child.material.name}
                          </div>
                        )}
                        {child.specs && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {(child.specs as any).width && (child.specs as any).height && 
                              `${(child.specs as any).width}x${(child.specs as any).height}`}
                            {(child.specs as any).depth && `x${(child.specs as any).depth}`}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks/Steps */}
              {selectedItem.tasks && selectedItem.tasks.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground mb-3">
                    ЭТАПЫ
                  </div>
                  <div className="space-y-2">
                    {selectedItem.tasks.map(task => (
                      <div 
                        key={task.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                      >
                        <div className={cn(
                          "size-2 rounded-full",
                          task.columnId?.includes('done') ? "bg-green-500" :
                          task.columnId?.includes('progress') ? "bg-blue-500" :
                          "bg-gray-300"
                        )} />
                        <div className="flex-1 text-sm">
                          {task.title}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

