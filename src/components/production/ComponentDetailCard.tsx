import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  Plus,
  Trash2,
  Edit,
  ChevronUp,
  ChevronDown,
  File,
  Save,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from '../../lib/toast';
import {
  COMPONENT_TEMPLATES,
  getTemplateById,
} from '../../lib/constants/productionTemplates';
import { ProductionComponent } from '../../lib/supabase/services/ProductionManagementService';

interface ComponentDetailCardProps {
  component: ProductionComponent;
  onUpdate: () => void;
  onDelete: () => void;
}

interface Material {
  id: string;
  name: string;
  spec?: string;
  qty?: string;
}

interface DocLink {
  id: string;
  title: string;
  url: string;
}

interface Stage {
  id: string;
  title: string;
  status: 'todo' | 'doing' | 'qa' | 'done';
  order: number;
  assignee?: string;
  note?: string;
}

export function ComponentDetailCard({ component, onUpdate, onDelete }: ComponentDetailCardProps) {
  const [componentData, setComponentData] = useState(component);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [documents, setDocuments] = useState<DocLink[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(component.name);
  const [selectedMaterialType, setSelectedMaterialType] = useState<MaterialType>('LDSP');
  const [showMaterialTypeDialog, setShowMaterialTypeDialog] = useState(false);
  const [materialTypeAction, setMaterialTypeAction] = useState<'replace' | 'merge' | null>(null);

  // Editing states
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [newMaterial, setNewMaterial] = useState({ name: '', spec: '', qty: '' });
  const [newDocument, setNewDocument] = useState({ title: '', url: '' });
  const [newStage, setNewStage] = useState({ title: '', status: 'todo' as const });

  const progress = calculateProgress(stages);

  useEffect(() => {
    loadComponentData();
  }, [component.id]);

  const loadComponentData = async () => {
    // TODO: Загрузить данные компонента из API
    // Временно используем моковые данные
    setMaterials([
      { id: '1', name: 'ЛДСП 18мм', spec: 'Дуб сонома', qty: '2 листа' },
      { id: '2', name: 'ДВП 3мм', spec: 'Белый', qty: '1 лист' },
    ]);
    
    setDocuments([
      { id: '1', title: 'Чертеж каркаса', url: '#' },
    ]);
    
    setStages([
      { id: '1', title: 'Раскрой / присадка / ЧПУ', status: 'done', order: 0 },
      { id: '2', title: 'Кромкование', status: 'done', order: 1 },
      { id: '3', title: 'Присадка', status: 'doing', order: 2 },
      { id: '4', title: 'Сборка', status: 'todo', order: 3 },
      { id: '5', title: 'Отделка', status: 'todo', order: 4 },
    ]);
  };

  // Material CRUD
  const handleAddMaterial = () => {
    if (!newMaterial.name) {
      toast.error('Введите название материала');
      return;
    }
    
    const material: Material = {
      id: Date.now().toString(),
      ...newMaterial,
    };
    
    setMaterials([...materials, material]);
    setNewMaterial({ name: '', spec: '', qty: '' });
    toast.success('Материал добавлен');
  };

  const handleUpdateMaterial = (material: Material) => {
    setMaterials(materials.map(m => m.id === material.id ? material : m));
    setEditingMaterial(null);
    toast.success('Материал обновлен');
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id));
    toast.success('Материал удален');
  };

  // Document CRUD
  const handleAddDocument = () => {
    if (!newDocument.title || !newDocument.url) {
      toast.error('Заполните все поля');
      return;
    }
    
    const doc: DocLink = {
      id: Date.now().toString(),
      ...newDocument,
    };
    
    setDocuments([...documents, doc]);
    setNewDocument({ title: '', url: '' });
    toast.success('Документ добавлен');
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(documents.filter(d => d.id !== id));
    toast.success('Документ удален');
  };

  // Stage CRUD
  const handleAddStage = () => {
    if (!newStage.title) {
      toast.error('Введите название этапа');
      return;
    }
    
    const stage: Stage = {
      id: Date.now().toString(),
      ...newStage,
      order: stages.length,
    };
    
    setStages([...stages, stage]);
    setNewStage({ title: '', status: 'todo' });
    toast.success('Этап добавлен');
  };

  const handleUpdateStage = (stage: Stage) => {
    setStages(stages.map(s => s.id === stage.id ? stage : s));
    setEditingStage(null);
    toast.success('Этап обновлен');
  };

  const handleDeleteStage = (id: string) => {
    setStages(stages.filter(s => s.id !== id));
    toast.success('Этап удален');
  };

  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
    const newStages = [...stages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newStages.length) return;
    
    [newStages[index], newStages[targetIndex]] = [newStages[targetIndex], newStages[index]];
    newStages.forEach((stage, i) => stage.order = i);
    
    setStages(newStages);
  };

  const handleChangeStageStatus = (id: string, status: Stage['status']) => {
    setStages(stages.map(s => s.id === id ? { ...s, status } : s));
    toast.success('Статус изменен');
  };

  // Material Type Change
  const handleChangeMaterialType = (type: MaterialType) => {
    setSelectedMaterialType(type);
    setShowMaterialTypeDialog(true);
  };

  const applyMaterialTypeChange = () => {
    if (!materialTypeAction) return;
    
    const template = getMaterialTemplate(selectedMaterialType);
    if (!template) return;
    
    if (materialTypeAction === 'replace') {
      const newStages: Stage[] = template.stages.map((s, i) => ({
        id: Date.now().toString() + i,
        title: s.title,
        status: s.status,
        order: i,
      }));
      setStages(newStages);
      toast.success('Этапы заменены шаблоном');
    } else if (materialTypeAction === 'merge') {
      const merged = mergeStagesWithTemplate(stages, template.stages);
      const newStages: Stage[] = merged.map((s, i) => ({
        id: s.id || Date.now().toString() + i,
        title: s.title,
        status: s.status || 'todo',
        order: i,
      }));
      setStages(newStages);
      toast.success('Этапы объединены с шаблоном');
    }
    
    setShowMaterialTypeDialog(false);
    setMaterialTypeAction(null);
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="max-w-md"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      setComponentData({ ...componentData, name: editedName });
                      setIsEditingName(false);
                      toast.success('Название обновлено');
                    }}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditedName(componentData.name);
                      setIsEditingName(false);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">{componentData.name}</CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingName(true)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-muted-foreground">Тип материала:</Label>
                  <Select
                    value={selectedMaterialType}
                    onValueChange={(value) => handleChangeMaterialType(value as MaterialType)}
                  >
                    <SelectTrigger className="w-[180px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MATERIAL_TEMPLATES.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center gap-2">
                            <span>{template.icon}</span>
                            <span>{template.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Прогресс:</span>
                  <div className="flex items-center gap-2 min-w-[200px]">
                    <Progress value={progress} className="h-2" />
                    <span className="text-sm font-semibold">{progress}%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Удалить компонент
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          {/* Section 1: Материалы */}
          <div>
            <h3 className="text-lg font-semibold mb-4">📦 Материалы</h3>
            
            <div className="space-y-2 mb-4">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50"
                >
                  {editingMaterial?.id === material.id ? (
                    <>
                      <Input
                        value={editingMaterial.name}
                        onChange={(e) => setEditingMaterial({ ...editingMaterial, name: e.target.value })}
                        placeholder="Материал"
                        className="flex-1"
                      />
                      <Input
                        value={editingMaterial.spec || ''}
                        onChange={(e) => setEditingMaterial({ ...editingMaterial, spec: e.target.value })}
                        placeholder="Спецификация"
                        className="flex-1"
                      />
                      <Input
                        value={editingMaterial.qty || ''}
                        onChange={(e) => setEditingMaterial({ ...editingMaterial, qty: e.target.value })}
                        placeholder="Количество"
                        className="w-32"
                      />
                      <Button size="sm" onClick={() => handleUpdateMaterial(editingMaterial)}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingMaterial(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="font-medium">{material.name}</div>
                        <div className="text-sm text-muted-foreground">{material.spec}</div>
                      </div>
                      <Badge variant="secondary" className="whitespace-nowrap">
                        {material.qty || '—'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingMaterial(material)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteMaterial(material.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Материал"
                value={newMaterial.name}
                onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                className="flex-1"
              />
              <Input
                placeholder="Спецификация"
                value={newMaterial.spec}
                onChange={(e) => setNewMaterial({ ...newMaterial, spec: e.target.value })}
                className="flex-1"
              />
              <Input
                placeholder="Кол-во"
                value={newMaterial.qty}
                onChange={(e) => setNewMaterial({ ...newMaterial, qty: e.target.value })}
                className="w-32"
              />
              <Button onClick={handleAddMaterial}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Section 2: Технический проект */}
          <div>
            <h3 className="text-lg font-semibold mb-4">📄 Технический проект</h3>
            
            <div className="space-y-2 mb-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50"
                >
                  <File className="h-5 w-5 text-muted-foreground" />
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 hover:underline"
                  >
                    {doc.title}
                  </a>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteDocument(doc.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Название документа"
                value={newDocument.title}
                onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                className="flex-1"
              />
              <Input
                placeholder="URL или путь"
                value={newDocument.url}
                onChange={(e) => setNewDocument({ ...newDocument, url: e.target.value })}
                className="flex-1"
              />
              <Button onClick={handleAddDocument}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Section 3: Этапы производства */}
          <div>
            <h3 className="text-lg font-semibold mb-4">⚙️ Этапы производства</h3>
            
            <div className="space-y-2 mb-4">
              {stages.sort((a, b) => a.order - b.order).map((stage, index) => {
                const statusInfo = getStatusInfo(stage.status);
                
                return (
                  <div
                    key={stage.id}
                    className={cn(
                      "flex items-center gap-3 p-3 border rounded-lg",
                      statusInfo.color
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 w-5 p-0"
                        onClick={() => handleMoveStage(index, 'up')}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 w-5 p-0"
                        onClick={() => handleMoveStage(index, 'down')}
                        disabled={index === stages.length - 1}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <span className="text-lg">{statusInfo.icon}</span>
                    
                    <div className="flex-1">
                      <div className="font-medium">{stage.title}</div>
                      {stage.note && (
                        <div className="text-sm text-muted-foreground mt-1">{stage.note}</div>
                      )}
                    </div>
                    
                    <Select
                      value={stage.status}
                      onValueChange={(value) => handleChangeStageStatus(stage.id, value as Stage['status'])}
                    >
                      <SelectTrigger className="w-[140px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STAGE_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.icon} {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingStage(stage)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteStage(stage.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Название этапа"
                value={newStage.title}
                onChange={(e) => setNewStage({ ...newStage, title: e.target.value })}
                className="flex-1"
              />
              <Select
                value={newStage.status}
                onValueChange={(value) => setNewStage({ ...newStage, status: value as Stage['status'] })}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGE_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.icon} {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddStage}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Material Type Change Dialog */}
      <AlertDialog open={showMaterialTypeDialog} onOpenChange={setShowMaterialTypeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Изменить тип материала</AlertDialogTitle>
            <AlertDialogDescription>
              Вы хотите изменить тип материала на "{getMaterialTemplate(selectedMaterialType)?.name}".
              Как поступить с текущими этапами?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setMaterialTypeAction('replace')}
            >
              <span className="font-semibold">Заменить этапы шаблоном</span>
              <span className="text-sm text-muted-foreground ml-2">
                (текущие этапы будут удалены)
              </span>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setMaterialTypeAction('merge')}
            >
              <span className="font-semibold">Объединить с шаблоном</span>
              <span className="text-sm text-muted-foreground ml-2">
                (добавить недостающие этапы)
              </span>
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMaterialTypeAction(null)}>
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={applyMaterialTypeChange}
              disabled={!materialTypeAction}
            >
              Применить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

