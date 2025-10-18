import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  ArrowLeft, 
  Plus,
  CheckCircle,
  Clock,
  Package
} from 'lucide-react';
import { ComponentType, ProjectComponent, ComponentTemplate } from '../../types';
import { toast } from '../../lib/toast';

// Иконки для типов компонентов
const componentIcons: Record<ComponentType, React.ReactNode> = {
  kitchen: (
    <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center">
      <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2zm0 4h18v2H3v-2z"/>
        <path d="M5 5h4v4H5V5zm10 0h4v4h-4V5zM5 11h4v4H5v-4zm10 0h4v4h-4v-4z"/>
      </svg>
    </div>
  ),
  living_room: (
    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
      <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h6v2H7v-2z"/>
      </svg>
    </div>
  ),
  bedroom: (
    <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
      <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v8H7V7zm2 2v4h6V9H9z"/>
      </svg>
    </div>
  ),
  wardrobe: (
    <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
      <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h10v2H7v-2z"/>
        <path d="M8 8h2v2H8V8zm4 0h2v2h-2V8zm0 4h2v2h-2v-2zm-4 0h2v2H8v-2z"/>
      </svg>
    </div>
  ),
  bathroom: (
    <div className="w-16 h-16 bg-cyan-100 rounded-lg flex items-center justify-center">
      <svg className="w-8 h-8 text-cyan-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2z"/>
        <path d="M8 8h2v2H8V8zm4 0h2v2h-2V8z"/>
      </svg>
    </div>
  ),
  children_room: (
    <div className="w-16 h-16 bg-pink-100 rounded-lg flex items-center justify-center">
      <svg className="w-8 h-8 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h6v2H7v-2z"/>
        <path d="M8 8h2v2H8V8zm4 0h2v2h-2V8z"/>
      </svg>
    </div>
  ),
  office: (
    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
      <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h6v2H7v-2z"/>
      </svg>
    </div>
  ),
  hallway: (
    <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center">
      <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h10v2H7v-2z"/>
      </svg>
    </div>
  ),
  balcony: (
    <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center">
      <svg className="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2z"/>
      </svg>
    </div>
  ),
  other: (
    <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
      <svg className="w-8 h-8 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h6v2H7v-2z"/>
      </svg>
    </div>
  )
};

// Названия компонентов
const componentNames: Record<ComponentType, string> = {
  kitchen: 'Кухня',
  living_room: 'Гостинная',
  bedroom: 'Спальня',
  wardrobe: 'Гардеробная',
  bathroom: 'Ванная',
  children_room: 'Детская',
  office: 'Офис',
  hallway: 'Прихожая',
  balcony: 'Балкон',
  other: 'Прочее'
};

interface ComponentSelectorProps {
  projectId: string;
  onComponentSelect: (componentType: ComponentType) => void;
  onNext: () => void;
}

export function ComponentSelector({ projectId, onComponentSelect, onNext }: ComponentSelectorProps) {
  const navigate = useNavigate();
  const [selectedComponents, setSelectedComponents] = useState<ComponentType[]>([]);
  const [existingComponents, setExistingComponents] = useState<ProjectComponent[]>([]);
  const [loading, setLoading] = useState(false);

  // Загружаем существующие компоненты проекта
  useEffect(() => {
    loadExistingComponents();
  }, [projectId]);

  const loadExistingComponents = async () => {
    try {
      // TODO: Загрузить существующие компоненты из API
      // const components = await productionService.getProjectComponents(projectId);
      // setExistingComponents(components);
    } catch (error) {
      console.error('Error loading components:', error);
    }
  };

  const handleComponentToggle = (componentType: ComponentType) => {
    setSelectedComponents(prev => {
      if (prev.includes(componentType)) {
        return prev.filter(type => type !== componentType);
      } else {
        return [...prev, componentType];
      }
    });
  };

  const handleCreateComponents = async () => {
    if (selectedComponents.length === 0) {
      toast.error('Выберите хотя бы один компонент');
      return;
    }

    setLoading(true);
    try {
      // TODO: Создать компоненты через API
      for (const componentType of selectedComponents) {
        // await productionService.createProjectComponent({
        //   projectId,
        //   componentType,
        //   name: componentNames[componentType],
        //   quantity: 1
        // });
      }
      
      toast.success(`Создано ${selectedComponents.length} компонентов`);
      onNext();
    } catch (error) {
      console.error('Error creating components:', error);
      toast.error('Ошибка создания компонентов');
    } finally {
      setLoading(false);
    }
  };

  const getComponentStatus = (componentType: ComponentType) => {
    const existing = existingComponents.find(c => c.componentType === componentType);
    if (existing) {
      return {
        status: 'exists',
        text: 'Добавлен',
        color: 'green' as const
      };
    }
    
    const selected = selectedComponents.includes(componentType);
    if (selected) {
      return {
        status: 'selected',
        text: 'Выбран',
        color: 'blue' as const
      };
    }
    
    return {
      status: 'available',
      text: 'Доступен',
      color: 'gray' as const
    };
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-4 mr-2" />
          Назад
        </Button>
        <div>
          <h1 className="text-2xl font-medium">Компоненты</h1>
          <p className="text-muted-foreground">Выберите типы помещений для проекта</p>
        </div>
      </div>

      {/* Components Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Object.entries(componentNames).map(([type, name]) => {
          const componentType = type as ComponentType;
          const status = getComponentStatus(componentType);
          const isSelected = selectedComponents.includes(componentType);
          const exists = existingComponents.some(c => c.componentType === componentType);
          
          return (
            <Card 
              key={componentType}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 
                exists ? 'ring-2 ring-green-500 bg-green-50' :
                'hover:ring-2 hover:ring-gray-300'
              }`}
              onClick={() => !exists && handleComponentToggle(componentType)}
            >
              <CardContent className="p-6 text-center space-y-4">
                {componentIcons[componentType]}
                
                <div>
                  <h3 className="font-medium text-sm">{name}</h3>
                  <Badge 
                    variant={status.color === 'green' ? 'default' : 
                            status.color === 'blue' ? 'secondary' : 'outline'}
                    className="mt-2"
                  >
                    {status.text}
                  </Badge>
                </div>
                
                {exists && (
                  <div className="flex items-center justify-center text-green-600">
                    <CheckCircle className="size-4 mr-1" />
                    <span className="text-xs">Добавлен</span>
                  </div>
                )}
                
                {isSelected && !exists && (
                  <div className="flex items-center justify-center text-blue-600">
                    <Plus className="size-4 mr-1" />
                    <span className="text-xs">Будет добавлен</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Components Summary */}
      {selectedComponents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Выбранные компоненты</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedComponents.map(componentType => (
                <Badge key={componentType} variant="secondary" className="text-sm">
                  {componentNames[componentType]}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4">
        <div className="text-sm text-muted-foreground">
          {selectedComponents.length > 0 && (
            <span>Выбрано: {selectedComponents.length} компонентов</span>
          )}
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Отмена
          </Button>
          <Button 
            onClick={handleCreateComponents}
            disabled={selectedComponents.length === 0 || loading}
          >
            {loading ? (
              <>
                <Clock className="size-4 mr-2 animate-spin" />
                Создание...
              </>
            ) : (
              <>
                <Package className="size-4 mr-2" />
                Создать компоненты
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
