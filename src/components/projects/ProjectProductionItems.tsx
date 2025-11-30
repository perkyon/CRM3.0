import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';
import { ZoneDialog } from '../production/ZoneDialog';
import { ItemDialog, ItemFormData } from '../production/ItemDialog';
import { DeleteItemDialog } from '../production/DeleteItemDialog';
import { productionManagementService, ProductionItem, ProductionZone } from '../../lib/supabase/services/ProductionManagementService';
import { toast } from '../../lib/toast';
import { formatDate } from '../../lib/utils';

interface ProjectProductionItemsProps {
  projectId: string;
  onOpenProduction?: () => void;
}

export function ProjectProductionItems({ projectId, onOpenProduction }: ProjectProductionItemsProps) {
  const [zones, setZones] = useState<ProductionZone[]>([]);
  const [items, setItems] = useState<ProductionItem[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isZoneDialogOpen, setIsZoneDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProductionItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<ProductionItem | null>(null);

  useEffect(() => {
    loadData();
  }, [projectId]);

  useEffect(() => {
    if (zones.length > 0) {
      const zoneExists = zones.some(zone => zone.id === selectedZoneId);
      if (!zoneExists) {
        setSelectedZoneId(zones[0].id);
      }
    } else {
      setSelectedZoneId('all');
    }
  }, [zones]);

  const loadData = async () => {
    if (!projectId) return;
    try {
      setIsLoading(true);
      const [zonesData, itemsData] = await Promise.all([
        productionManagementService.getProjectZones(projectId),
        productionManagementService.getProjectItems(projectId),
      ]);
      setZones(zonesData);
      setItems(itemsData);
    } catch (error) {
      console.error('Error loading production data in ProjectOverview:', error);
      toast.error('Не удалось загрузить изделия');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    if (selectedZoneId === 'all') return items;
    return items.filter(item => item.zone_id === selectedZoneId);
  }, [items, selectedZoneId]);

  const selectedZone = zones.find(z => z.id === selectedZoneId) ?? null;

  const handleCreateZone = () => {
    setIsZoneDialogOpen(true);
  };

  const handleZoneSave = async (name: string) => {
    try {
      const newZone = await productionManagementService.createZone(projectId, name);
      setZones(prev => [...prev, newZone].sort((a, b) => a.position - b.position));
      toast.success('Зона создана');
      if (selectedZoneId === 'all') {
        setSelectedZoneId(newZone.id);
      }
    } catch (error) {
      console.error('Error creating zone from ProjectOverview:', error);
      toast.error('Не удалось создать зону');
      throw error;
    }
  };

  const handleAddItem = () => {
    if (zones.length === 0) {
      toast.error('Создайте хотя бы одну зону перед добавлением изделия');
      return;
    }
    if (!selectedZone && selectedZoneId !== 'all') {
      toast.error('Выберите зону для добавления изделия');
      return;
    }
    setEditingItem(null);
    setIsItemDialogOpen(true);
  };

  const handleItemSave = async (formData: ItemFormData) => {
    if (!selectedZoneId || selectedZoneId === 'all') {
      toast.error('Выберите зону, в которую нужно добавить изделие');
      throw new Error('Zone is not selected');
    }
    try {
      const newItem = await productionManagementService.createItem({
        projectId,
        zoneId: selectedZoneId,
        code: formData.code,
        name: formData.name,
        quantity: formData.quantity || 1,
        currentStage: formData.currentStage,
        materials: formData.materials,
        technicalNotes: formData.technicalNotes,
        comment: formData.comment,
        dueDate: formData.dueDate,
      });
      setItems(prev => [...prev, newItem].sort((a, b) => a.position - b.position));
      toast.success('Изделие создано и отправлено в производство');
    } catch (error) {
      console.error('Error creating item from ProjectOverview:', error);
      toast.error('Не удалось создать изделие');
      throw error;
    }
  };

  const handleItemUpdate = async (formData: ItemFormData) => {
    if (!editingItem) return;
    try {
      await productionManagementService.updateItem(editingItem.id, {
        code: formData.code,
        name: formData.name,
        quantity: formData.quantity || 1,
        currentStage: formData.currentStage,
        materials: formData.materials,
        technicalNotes: formData.technicalNotes,
        comment: formData.comment,
        dueDate: formData.dueDate,
      });
      setItems(prev =>
        prev.map(item =>
          item.id === editingItem.id
            ? {
                ...item,
                code: formData.code,
                name: formData.name,
                quantity: formData.quantity || 1,
                current_stage: formData.currentStage,
                materials: formData.materials,
                technical_notes: formData.technicalNotes,
                manager_comment: formData.comment,
                due_date: formData.dueDate,
              }
            : item
        )
      );
      toast.success('Изделие обновлено');
    } catch (error) {
      console.error('Error updating item from ProjectOverview:', error);
      toast.error('Не удалось обновить изделие');
      throw error;
    }
  };

  const openEditItem = (item: ProductionItem) => {
    setEditingItem(item);
    setIsItemDialogOpen(true);
  };

  const openDeleteItem = (item: ProductionItem) => {
    setDeletingItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    try {
      await productionManagementService.deleteItem(deletingItem.id);
      setItems(prev => prev.filter(item => item.id !== deletingItem.id));
      toast.success('Изделие удалено');
    } catch (error) {
      console.error('Error deleting item from ProjectOverview:', error);
      toast.error('Не удалось удалить изделие');
    } finally {
      setDeletingItem(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const renderLoader = () => (
    <div className="space-y-4">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Изделия проекта</CardTitle>
            <p className="text-sm text-muted-foreground">
              Менеджер формирует список изделий, а начальник производства продолжает работу в разделе
              «Производство».
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={loadData}>
              Обновить
            </Button>
            <Button variant="outline" onClick={handleCreateZone}>
              Добавить зону
            </Button>
            <Button onClick={handleAddItem} disabled={zones.length === 0}>
              Добавить изделие
            </Button>
            <Button variant="secondary" onClick={onOpenProduction} disabled={!onOpenProduction}>
              Открыть производство
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {zones.length > 0 && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Зона:</span>
                <Select value={selectedZoneId} onValueChange={setSelectedZoneId}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Выберите зону" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все зоны</SelectItem>
                    {zones.map(zone => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedZone && (
                <Badge variant="outline" className="justify-start">
                  {selectedZone.name}
                </Badge>
              )}
            </div>
          )}

          <Separator />

          {isLoading ? (
            renderLoader()
          ) : zones.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-2">Зоны производства ещё не созданы.</p>
              <Button onClick={handleCreateZone}>Создать первую зону</Button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-2">В выбранной зоне пока нет изделий.</p>
              <Button onClick={handleAddItem}>Добавить изделие</Button>
            </div>
          ) : (
            <div className="space-y-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[160px]">Изделие</TableHead>
                    <TableHead>Материалы</TableHead>
                    <TableHead>Техничка</TableHead>
                    <TableHead>Комментарий</TableHead>
                    <TableHead className="w-[120px]">Срок</TableHead>
                    <TableHead className="w-[160px] text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-xs text-muted-foreground">{item.code}</span>
                          {item.current_stage && (
                            <span className="text-xs text-primary mt-1">
                              Этап: {item.current_stage}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        {item.materials ? item.materials : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        {item.technical_notes ? item.technical_notes : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        {item.manager_comment || item.notes ? (
                          <>{item.manager_comment || item.notes}</>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.due_date ? (
                          <Badge variant="outline">{formatDate(item.due_date)}</Badge>
                        ) : (
                          <span className="text-muted-foreground">Не задан</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEditItem(item)}>
                          Изменить
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openDeleteItem(item)}>
                          Удалить
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Zone Dialog */}
      <ZoneDialog
        open={isZoneDialogOpen}
        onOpenChange={setIsZoneDialogOpen}
        onSave={handleZoneSave}
        initialName=""
        mode="create"
      />

      {/* Item Dialog */}
      <ItemDialog
        open={isItemDialogOpen}
        onOpenChange={(state) => {
          setIsItemDialogOpen(state);
          if (!state) setEditingItem(null);
        }}
        onSave={editingItem ? handleItemUpdate : handleItemSave}
        initialData={
          editingItem
            ? {
                code: editingItem.code,
                name: editingItem.name,
                quantity: editingItem.quantity,
                currentStage: editingItem.current_stage || undefined,
                materials: editingItem.materials || '',
                technicalNotes: editingItem.technical_notes || '',
                comment: editingItem.manager_comment || editingItem.notes || '',
                dueDate: editingItem.due_date || '',
              }
            : undefined
        }
        mode={editingItem ? 'edit' : 'create'}
      />

      <DeleteItemDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        itemName={deletingItem?.name || ''}
      />
    </div>
  );
}

