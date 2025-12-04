import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { DatePicker } from '../ui/date-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { 
  FileText, 
  Plus, 
  Download, 
  Send, 
  Edit, 
  Trash2, 
  CheckCircle,
  Clock,
  AlertCircle,
  Calculator,
  User,
  Calendar,
  Loader2
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';
import { toast } from '../../lib/toast';

export interface CommercialDocument {
  id: string;
  type: 'quote' | 'contract';
  number: string;
  title: string;
  clientId: string;
  clientName: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'signed';
  amount: number;
  validUntil?: string;
  createdAt: string;
  updatedAt: string;
  items: CommercialItem[];
  notes?: string;
  managerName: string;
}

export interface CommercialItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface CommercialDocumentsProps {
  clientId?: string;
  onDocumentCreate?: (document: CommercialDocument) => void;
  onCreateProject?: (document: CommercialDocument) => void;
}

export function CommercialDocuments({ clientId, onDocumentCreate, onCreateProject }: CommercialDocumentsProps) {
  const [documents, setDocuments] = useState<CommercialDocument[]>([
    {
      id: 'KP-2024-001',
      type: 'quote',
      number: 'КП-2024-001',
      title: 'Кухонный гарнитур "Модерн"',
      clientId: 'client-1',
      clientName: 'Анна Петрова',
      status: 'approved',
      amount: 85000,
      validUntil: '2024-12-31',
      createdAt: '2024-11-15',
      updatedAt: '2024-11-20',
      managerName: 'Иван Смирнов',
      items: [
        {
          id: '550e8400-e29b-41d4-a716-446655440030',
          name: 'Верхние шкафы',
          description: 'Шкафы навесные с фасадами МДФ',
          quantity: 5,
          unit: 'шт',
          unitPrice: 8500,
          total: 42500
        },
        {
          id: '2',
          name: 'Нижние тумбы',
          description: 'Тумбы напольные с ящиками',
          quantity: 4,
          unit: 'шт',
          unitPrice: 12000,
          total: 48000
        }
      ],
      notes: 'Срок изготовления 14-21 день'
    }
  ]);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<CommercialDocument | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [newDocument, setNewDocument] = useState({
    type: 'quote' as 'quote' | 'contract',
    title: '',
    clientId: clientId || '',
    amount: '',
    validUntil: '',
    items: [] as CommercialItem[],
    notes: ''
  });

  const filteredDocuments = clientId 
    ? documents.filter(doc => doc.clientId === clientId)
    : documents;

  const getStatusBadge = (status: CommercialDocument['status']) => {
    const variants = {
      draft: { variant: 'secondary' as const, label: 'Черновик', icon: Edit },
      sent: { variant: 'default' as const, label: 'Отправлен', icon: Send },
      approved: { variant: 'default' as const, label: 'Одобрен', icon: CheckCircle },
      rejected: { variant: 'destructive' as const, label: 'Отклонен', icon: AlertCircle },
      signed: { variant: 'default' as const, label: 'Подписан', icon: CheckCircle }
    };
    
    const config = variants[status];
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="size-3" />
        {config.label}
      </Badge>
    );
  };

  const handleCreateDocument = async () => {
    if (!newDocument.title || !newDocument.clientId) {
      toast('Заполните обязательные поля', { type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const document: CommercialDocument = {
        id: `${newDocument.type === 'quote' ? 'KP' : 'DOG'}-${Date.now()}`,
        type: newDocument.type,
        number: `${newDocument.type === 'quote' ? 'КП' : 'ДОГ'}-${new Date().getFullYear()}-${String(documents.length + 1).padStart(3, '0')}`,
        title: newDocument.title,
        clientId: newDocument.clientId,
        clientName: 'Клиент', // В реальном приложении получать из контекста
        status: 'draft',
        amount: parseFloat(newDocument.amount) || 0,
        validUntil: newDocument.validUntil,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        items: newDocument.items,
        notes: newDocument.notes,
        managerName: 'Текущий менеджер' // В реальном приложении получать из контекста
      };

      setDocuments([...documents, document]);
      onDocumentCreate?.(document);
      
      toast('Документ успешно создан', { type: 'success' });
      setIsCreateDialogOpen(false);
      setNewDocument({
        type: 'quote',
        title: '',
        clientId: clientId || '',
        amount: '',
        validUntil: '',
        items: [],
        notes: ''
      });
    } catch (error) {
      toast('Ошибка при создании документа', { type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (documentId: string, newStatus: CommercialDocument['status']) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setDocuments(documents.map(doc => 
        doc.id === documentId 
          ? { ...doc, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] }
          : doc
      ));
      
      toast('Статус обновлен', { type: 'success' });
    } catch (error) {
      toast('Ошибка при обновлении статуса', { type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = (document: CommercialDocument) => {
    if (document.status !== 'approved' && document.status !== 'signed') {
      toast('Проект можно создать только из одобренного или подписанного документа', { type: 'error' });
      return;
    }
    
    onCreateProject?.(document);
    toast('Создание проекта...', { type: 'success' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium">Коммерческие документы</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Управление коммерческими предложениями и договорами
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              Создать документ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="new-commercial-document-description">
            <DialogHeader>
              <DialogTitle>Новый коммерческий документ</DialogTitle>
              <DialogDescription id="new-commercial-document-description">
                Создайте коммерческое предложение или договор для клиента
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="doc-type">Тип документа</Label>
                <Select 
                  value={newDocument.type} 
                  onValueChange={(value: 'quote' | 'contract') => setNewDocument({...newDocument, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quote">Коммерческое предложение</SelectItem>
                    <SelectItem value="contract">Договор</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="doc-title">Название документа *</Label>
                <Input 
                  id="doc-title"
                  placeholder="Введите название" 
                  value={newDocument.title}
                  onChange={(e) => setNewDocument({...newDocument, title: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="doc-amount">Сумма (₽)</Label>
                <Input 
                  id="doc-amount"
                  type="number"
                  placeholder="0" 
                  value={newDocument.amount}
                  onChange={(e) => setNewDocument({...newDocument, amount: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="doc-valid">Действителен до</Label>
                <DatePicker
                  date={newDocument.validUntil ? new Date(newDocument.validUntil) : undefined}
                  onDateChange={(date) => {
                    setNewDocument({...newDocument, validUntil: date ? date.toISOString().split('T')[0] : ''});
                  }}
                  placeholder="Выберите дату"
                />
              </div>
              
              <div className="col-span-2 space-y-2">
                <Label htmlFor="doc-notes">Примечания</Label>
                <Textarea 
                  id="doc-notes"
                  placeholder="Дополнительная информация..."
                  value={newDocument.notes}
                  onChange={(e) => setNewDocument({...newDocument, notes: e.target.value})}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isLoading}
              >
                Отмена
              </Button>
              <Button 
                onClick={handleCreateDocument} 
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="size-4 mr-2 animate-spin" />}
                Создать документ
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {filteredDocuments.map((document) => (
          <Card key={document.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="size-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-lg">{document.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{document.number}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="size-4" />
                      {document.clientName}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="size-4" />
                      {formatDate(document.createdAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calculator className="size-4" />
                      {formatCurrency(document.amount)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusBadge(document.status)}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {document.validUntil && (
                    <div className="text-sm text-muted-foreground">
                      Действителен до: {formatDate(document.validUntil)}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {(document.status === 'approved' || document.status === 'signed') && onCreateProject && (
                    <Button 
                      size="sm" 
                      variant="default"
                      onClick={() => handleCreateProject(document)}
                    >
                      <Plus className="size-4 mr-2" />
                      Создать проект
                    </Button>
                  )}
                  
                  <Select value={document.status} onValueChange={(value: CommercialDocument['status']) => handleStatusChange(document.id, value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Черновик</SelectItem>
                      <SelectItem value="sent">Отправлен</SelectItem>
                      <SelectItem value="approved">Одобрен</SelectItem>
                      <SelectItem value="rejected">Отклонен</SelectItem>
                      {document.type === 'contract' && (
                        <SelectItem value="signed">Подписан</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  
                  <Button size="sm" variant="outline">
                    <Download className="size-4" />
                    <span className="sr-only">Скачать</span>
                  </Button>
                </div>
              </div>
              
              {document.notes && (
                <div className="mt-3 p-3 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">{document.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {filteredDocuments.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="size-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Коммерческие документы не найдены</p>
              <p className="text-sm text-muted-foreground mt-1">
                Создайте коммерческое предложение или договор
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}