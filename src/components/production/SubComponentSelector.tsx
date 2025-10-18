import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  ArrowLeft, 
  Plus,
  CheckCircle,
  Clock,
  Package,
  Search,
  Edit3,
  Trash2
} from 'lucide-react';
import { 
  SubComponentType, 
  ProjectComponent, 
  ProjectSubComponent, 
  ComponentTemplate 
} from '../../types';
import { toast } from '../../lib/toast';

// Иконки для подкомпонентов
const subComponentIcons: Record<SubComponentType, React.ReactNode> = {
  sink: (
    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2z"/>
        <path d="M5 5h4v4H5V5zm10 0h4v4h-4V5z"/>
      </svg>
    </div>
  ),
  kitchen_set: (
    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
      <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h6v2H7v-2z"/>
      </svg>
    </div>
  ),
  cabinet: (
    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h10v2H7v-2z"/>
        <path d="M8 8h2v2H8V8zm4 0h2v2h-2V8zm0 4h2v2h-2v-2zm-4 0h2v2H8v-2z"/>
      </svg>
    </div>
  ),
  table: (
    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
      <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2z"/>
        <path d="M5 5h4v4H5V5zm10 0h4v4h-4V5z"/>
      </svg>
    </div>
  ),
  chair: (
    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
      <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2z"/>
        <path d="M5 5h4v4H5V5zm10 0h4v4h-4V5z"/>
      </svg>
    </div>
  ),
  bed: (
    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
      <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2z"/>
      </svg>
    </div>
  ),
  wardrobe: (
    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
      <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h10v2H7v-2z"/>
        <path d="M8 8h2v2H8V8zm4 0h2v2h-2V8zm0 4h2v2h-2v-2zm-4 0h2v2H8v-2z"/>
      </svg>
    </div>
  ),
  sofa: (
    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
      <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2z"/>
      </svg>
    </div>
  ),
  tv_stand: (
    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
      <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2z"/>
        <path d="M8 8h2v2H8V8zm4 0h2v2h-2V8z"/>
      </svg>
    </div>
  ),
  shelf: (
    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
      <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2z"/>
        <path d="M5 5h4v4H5V5zm10 0h4v4h-4V5z"/>
      </svg>
    </div>
  ),
  mirror: (
    <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
      <svg className="w-6 h-6 text-cyan-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2z"/>
        <path d="M8 8h2v2H8V8zm4 0h2v2h-2V8z"/>
      </svg>
    </div>
  ),
  bathroom_set: (
    <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
      <svg className="w-6 h-6 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2z"/>
        <path d="M8 8h2v2H8V8zm4 0h2v2h-2V8z"/>
      </svg>
    </div>
  ),
  other: (
    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
      <svg className="w-6 h-6 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h6v2H7v-2z"/>
      </svg>
    </div>
  )
};

// Названия подкомпонентов
const subComponentNames: Record<SubComponentType, string> = {
  sink: 'Раковина',
  kitchen_set: 'Гарнитур',
  cabinet: 'Шкаф',
  table: 'Стол',
  chair: 'Стул',
  bed: 'Кровать',
  wardrobe: 'Шкаф-купе',
  sofa: 'Диван',
  tv_stand: 'ТВ-тумба',
  shelf: 'Полка',
  mirror: 'Зеркало',
  bathroom_set: 'Ванная комплект',
  other: 'Прочее'
};

interface SubComponentSelectorProps {
  componentId: string;
  componentName: string;
  onSubComponentSelect: (subComponentType: SubComponentType) => void;
  onNext: () => void;
}

export function SubComponentSelector({ 
  componentId, 
  componentName, 
  onSubComponentSelect, 
  onNext 
}: SubComponentSelectorProps) {
  const navigate = useNavigate();
  const [selectedSubComponents, setSelectedSubComponents] = useState<SubComponentType[]>([]);
  const [existingSubComponents, setExistingSubComponents] = useState<ProjectSubComponent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubComponentName, setNewSubComponentName] = useState('');
  const [newSubComponentType, setNewSubComponentType] = useState<SubComponentType>('other');

  // Загружаем существующие подкомпоненты
  useEffect(() => {
    loadExistingSubComponents();
  }, [componentId]);

  const loadExistingSubComponents = async () => {
    try {
      // TODO: Загрузить существующие подкомпоненты из API
      // const subComponents = await productionService.getProjectSubComponents(componentId);
      // setExistingSubComponents(subComponents);
    } catch (error) {
      console.error('Error loading sub-components:', error);
    }
  };

  const handleSubComponentToggle = (subComponentType: SubComponentType) => {
    setSelectedSubComponents(prev => {
      if (prev.includes(subComponentType)) {
        return prev.filter(type => type !== subComponentType);
      } else {
        return [...prev, subComponentType];
      }
    });
  };

  const handleCreateSubComponents = async () => {
    if (selectedSubComponents.length === 0) {
      toast.error('Выберите хотя бы один подкомпонент');
      return;
    }

    setLoading(true);
    try {
      // TODO: Создать подкомпоненты через API
      for (const subComponentType of selectedSubComponents) {
        // await productionService.createProjectSubComponent({
        //   componentId,
        //   subComponentType,
        //   name: subComponentNames[subComponentType],
        //   quantity: 1
        // });
      }
      
      toast.success(`Создано ${selectedSubComponents.length} подкомпонентов`);
      onNext();
    } catch (error) {
      console.error('Error creating sub-components:', error);
      toast.error('Ошибка создания подкомпонентов');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomSubComponent = async () => {
    if (!newSubComponentName.trim()) {
      toast.error('Введите название подкомпонента');
      return;
    }

    setLoading(true);
    try {
      // TODO: Создать кастомный подкомпонент через API
      // await productionService.createProjectSubComponent({
      //   componentId,
      //   subComponentType: newSubComponentType,
      //   name: newSubComponentName.trim(),
      //   quantity: 1
      // });
      
      toast.success('Подкомпонент добавлен');
      setNewSubComponentName('');
      setShowAddForm(false);
      loadExistingSubComponents();
    } catch (error) {
      console.error('Error creating custom sub-component:', error);
      toast.error('Ошибка создания подкомпонента');
    } finally {
      setLoading(false);
    }
  };

  const getSubComponentStatus = (subComponentType: SubComponentType) => {
    const existing = existingSubComponents.find(sc => sc.subComponentType === subComponentType);
    if (existing) {
      return {
        status: 'exists',
        text: 'Добавлен',
        color: 'green' as const
      };
    }
    
    const selected = selectedSubComponents.includes(subComponentType);
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

  const filteredSubComponents = Object.entries(subComponentNames).filter(([type, name]) =>
    name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-4 mr-2" />
          Назад
        </Button>
        <div>
          <h1 className="text-2xl font-medium">{componentName}</h1>
          <p className="text-muted-foreground">Выберите элементы для {componentName.toLowerCase()}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
        <Input
          placeholder="Поиск элементов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Add Custom SubComponent Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Добавить элемент</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="subComponentName">Название элемента</Label>
              <Input
                id="subComponentName"
                value={newSubComponentName}
                onChange={(e) => setNewSubComponentName(e.target.value)}
                placeholder="Например: Обеденный стол"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleAddCustomSubComponent} disabled={loading}>
                {loading ? (
                  <>
                    <Clock className="size-4 mr-2 animate-spin" />
                    Добавление...
                  </>
                ) : (
                  <>
                    <Plus className="size-4 mr-2" />
                    Добавить
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SubComponents Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredSubComponents.map(([type, name]) => {
          const subComponentType = type as SubComponentType;
          const status = getSubComponentStatus(subComponentType);
          const isSelected = selectedSubComponents.includes(subComponentType);
          const exists = existingSubComponents.some(sc => sc.subComponentType === subComponentType);
          
          return (
            <Card 
              key={subComponentType}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 
                exists ? 'ring-2 ring-green-500 bg-green-50' :
                'hover:ring-2 hover:ring-gray-300'
              }`}
              onClick={() => !exists && handleSubComponentToggle(subComponentType)}
            >
              <CardContent className="p-4 text-center space-y-3">
                {subComponentIcons[subComponentType]}
                
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

      {/* Add Custom Button */}
      {!showAddForm && (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => setShowAddForm(true)}
            className="w-full max-w-md"
          >
            <Plus className="size-4 mr-2" />
            Добавить свой элемент
          </Button>
        </div>
      )}

      {/* Selected SubComponents Summary */}
      {selectedSubComponents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Выбранные элементы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedSubComponents.map(subComponentType => (
                <Badge key={subComponentType} variant="secondary" className="text-sm">
                  {subComponentNames[subComponentType]}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4">
        <div className="text-sm text-muted-foreground">
          {selectedSubComponents.length > 0 && (
            <span>Выбрано: {selectedSubComponents.length} элементов</span>
          )}
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Отмена
          </Button>
          <Button 
            onClick={handleCreateSubComponents}
            disabled={selectedSubComponents.length === 0 || loading}
          >
            {loading ? (
              <>
                <Clock className="size-4 mr-2 animate-spin" />
                Создание...
              </>
            ) : (
              <>
                <Package className="size-4 mr-2" />
                Создать элементы
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
