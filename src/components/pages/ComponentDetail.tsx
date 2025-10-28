import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';
import { ComponentDetailCard } from '../production/ComponentDetailCard';
import { ProductionComponent } from '../../lib/supabase/services/ProductionManagementService';

export function ComponentDetail() {
  const { componentId } = useParams<{ componentId: string }>();
  const navigate = useNavigate();

  // Mock data - в реальности загружается из API
  const mockComponent: ProductionComponent = {
    id: componentId || '1',
    item_id: 'item-1',
    name: 'Корпус',
    material: 'ЛДСП 18мм',
    quantity: 1,
    unit: 'шт',
    progress: 60,
    position: 0,
    stages: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const handleUpdate = () => {
    console.log('Component updated');
    // TODO: Обновить данные через API
  };

  const handleDelete = () => {
    if (confirm('Вы уверены, что хотите удалить этот компонент?')) {
      console.log('Component deleted');
      // TODO: Удалить через API
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <h1 className="text-2xl font-semibold">Карточка компонента</h1>
        </div>

        <ComponentDetailCard
          component={mockComponent}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

