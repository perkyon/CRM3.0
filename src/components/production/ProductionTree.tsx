import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { 
  Search, 
  Filter, 
  Plus, 
  RefreshCw,
  Package,
  ListTree,
  X
} from 'lucide-react';
import { ProductionItem, KanbanTask } from '../../types';
import { ProductionTreeNode } from './ProductionTreeNode';
import { supabaseProductionItemService } from '../../lib/supabase/services/ProductionItemService';
import { toast } from '../../lib/toast';
import { cn } from '../../lib/utils';

interface ProductionTreeProps {
  projectId: string;
  onTaskClick?: (task: KanbanTask) => void;
  onItemClick?: (item: ProductionItem) => void;
}

export function ProductionTree({ projectId, onTaskClick, onItemClick }: ProductionTreeProps) {
  const [items, setItems] = useState<ProductionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Load production tree
  useEffect(() => {
    loadProductionTree();
  }, [projectId]);

  const loadProductionTree = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await supabaseProductionItemService.getProjectProductionTree(projectId);
      setItems(data);
      
      // Auto-expand furniture items on first load
      if (data.length > 0 && expandedIds.size === 0) {
        const furnitureIds = data.filter(item => item.type === 'furniture').map(item => item.id);
        setExpandedIds(new Set(furnitureIds));
      }
    } catch (err: any) {
      console.error('Error loading production tree:', err);
      setError(err.message || 'Ошибка загрузки дерева производства');
      toast.error('Не удалось загрузить дерево производства');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (itemId: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleTaskCheck = async (taskId: string, checked: boolean) => {
    try {
      // TODO: Update task status in Supabase
      console.log('Task check:', taskId, checked);
      toast.success(checked ? 'Задача отмечена выполненной' : 'Задача возвращена в работу');
      
      // Reload tree to update progress
      await loadProductionTree();
    } catch (err) {
      console.error('Error updating task:', err);
      toast.error('Ошибка обновления задачи');
    }
  };

  const handleOpenTask = (task: KanbanTask) => {
    if (onTaskClick) {
      onTaskClick(task);
    }
  };

  const handleOpenItem = (item: ProductionItem) => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const collectIds = (items: ProductionItem[]) => {
      items.forEach(item => {
        allIds.add(item.id);
        if (item.children) {
          collectIds(item.children);
        }
      });
    };
    collectIds(items);
    setExpandedIds(allIds);
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.code && item.code.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate total progress
  const totalProgress = items.length > 0
    ? Math.round(items.reduce((sum, item) => sum + item.progressPercent, 0) / items.length)
    : 0;

  const totalItems = items.length;
  const completedItems = items.filter(item => item.status === 'completed').length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-muted-foreground">Загрузка дерева производства...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={loadProductionTree} variant="outline">
              <RefreshCw className="size-4 mr-2" />
              Повторить попытку
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <Package className="size-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Нет изделий</h3>
            <p className="text-muted-foreground mb-4">
              Добавьте изделия и компоненты для этого проекта
            </p>
            <Button>
              <Plus className="size-4 mr-2" />
              Добавить изделие
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ListTree className="size-5" />
                Дерево производства
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {totalItems} изделий • {completedItems} завершено • {totalProgress}% выполнено
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={expandAll}>
                Развернуть всё
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAll}>
                Свернуть всё
              </Button>
              <Button variant="outline" size="sm" onClick={loadProductionTree}>
                <RefreshCw className="size-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию или коду..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Все статусы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="planned">Запланировано</SelectItem>
                <SelectItem value="in_progress">В работе</SelectItem>
                <SelectItem value="completed">Завершено</SelectItem>
                <SelectItem value="on_hold">На паузе</SelectItem>
              </SelectContent>
            </Select>

            {(searchQuery || statusFilter !== 'all') && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
              >
                <X className="size-4 mr-2" />
                Сбросить
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tree */}
      <Card>
        <CardContent className="p-0">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Ничего не найдено
            </div>
          ) : (
            <div className="divide-y">
              {filteredItems.map(item => (
                <ProductionTreeNode
                  key={item.id}
                  item={item}
                  level={0}
                  isExpanded={expandedIds.has(item.id)}
                  onToggle={handleToggle}
                  onTaskCheck={handleTaskCheck}
                  onOpenTask={handleOpenTask}
                  onOpenItem={handleOpenItem}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

