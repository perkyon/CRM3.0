import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Eye, 
  Plus,
  File,
  Image,
  FileArchive,
  AlertCircle
} from 'lucide-react';
import { ClientDocument, ClientDocumentCategory, Project } from '../../types';
import { toast } from '../../lib/toast';
import { mockProjects } from '../../lib/mockData';

interface DocumentManagerProps {
  entityType: 'client' | 'project';
  entityId: string;
  documents: ClientDocument[];
  onDocumentAdd: (document: ClientDocument) => void;
  onDocumentDelete: (documentId: string) => void;
}

const categoryLabels: Record<ClientDocumentCategory, string> = {
  contract: 'Договоры',
  passport: 'Паспортные данные',
  inn: 'ИНН, ОГРН',
  invoice: 'Счета',
  receipt: 'Чеки, квитанции',
  photo: 'Фотографии',
  other: 'Прочее'
};

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return <Image className="size-4" />;
  if (type.includes('pdf')) return <FileText className="size-4" />;
  if (type.includes('zip') || type.includes('rar')) return <FileArchive className="size-4" />;
  return <File className="size-4" />;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Б';
  const k = 1024;
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function DocumentManager({ 
  entityType, 
  entityId, 
  documents, 
  onDocumentAdd, 
  onDocumentDelete 
}: DocumentManagerProps) {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ClientDocumentCategory>('other');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  // Получаем связанные проекты для клиента
  const relatedProjects = entityType === 'client' 
    ? mockProjects.filter(p => p.clientId === entityId)
    : [];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Проверка размера файла (максимум 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 50 МБ');
      return;
    }

    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);

    try {
      // Симуляция загрузки файла
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newDocument: ClientDocument = {
        id: `doc_${Date.now()}`,
        clientId: entityType === 'client' ? entityId : '',
        name: description || file.name,
        originalName: file.name,
        type: file.type as any,
        category: selectedCategory,
        size: file.size,
        uploadedBy: 'current-user',
        uploadedAt: new Date().toISOString(),
        version: 1,
        description: description || undefined,
        url: URL.createObjectURL(file) // В реальном приложении это будет URL с сервера
      };

      onDocumentAdd(newDocument);

      toast.success('Документ успешно загружен');

      // Сброс формы
      setDescription('');
      setSelectedCategory('other');
      setUploadDialogOpen(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Ошибка при загрузке документа');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (documentId: string) => {
    onDocumentDelete(documentId);
    toast.success('Документ удален');
  };

  const handleDownload = (document: ClientDocument) => {
    if (document.url) {
      const link = window.document.createElement('a');
      link.href = document.url;
      link.download = document.originalName;
      link.click();
    }
  };

  const handleView = (document: ClientDocument) => {
    if (document.url) {
      window.open(document.url, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              Документы {entityType === 'client' ? 'клиента' : 'проекта'}
            </CardTitle>
            <Button onClick={() => setUploadDialogOpen(true)} size="sm">
              <Plus className="size-4 mr-2" />
              Добавить документ
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!documents || documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="size-12 mx-auto mb-4 opacity-50" />
              <p>Документы не добавлены</p>
              <Button 
                variant="outline" 
                onClick={() => setUploadDialogOpen(true)} 
                className="mt-4"
                size="sm"
              >
                Добавить первый документ
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {(documents || []).map((document) => (
                <div 
                  key={document.id} 
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {getFileIcon(document.type)}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">{document.name}</span>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {categoryLabels[document.category]}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatFileSize(document.size)} • {new Date(document.uploadedAt).toLocaleDateString('ru-RU')}
                      </div>
                      {document.description && (
                        <div className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {document.description}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-3">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="size-8 p-0"
                      onClick={() => handleView(document)}
                      title="Просмотр"
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="size-8 p-0"
                      onClick={() => handleDownload(document)}
                      title="Скачать"
                    >
                      <Download className="size-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="size-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(document.id)}
                      title="Удалить"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Связанные проекты для клиента */}
      {entityType === 'client' && relatedProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Документы связанных проектов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {relatedProjects.map((project) => {
                const projectDocuments = project.documents || [];
                return (
                  <div key={project.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{project.title}</h4>
                      <Badge variant="outline">{projectDocuments.length} документов</Badge>
                    </div>
                    
                    {projectDocuments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Документы не добавлены</p>
                    ) : (
                      <div className="space-y-2">
                        {projectDocuments.slice(0, 3).map((document) => (
                          <div key={document.id} className="flex items-center gap-2 text-sm">
                            {getFileIcon(document.type)}
                            <span className="truncate flex-1">{document.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {categoryLabels[document.category]}
                            </Badge>
                          </div>
                        ))}
                        {projectDocuments.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            и еще {projectDocuments.length - 3} документов
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Диалог загрузки */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md" aria-describedby="upload-dialog-visible-description">
          <DialogHeader>
            <DialogTitle>Добавить документ</DialogTitle>
            <DialogDescription id="upload-dialog-visible-description">
              Выберите файл и укажите дополнительную информацию
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="category">Категория <span className="text-destructive">*</span></Label>
              <Select value={selectedCategory} onValueChange={(value: ClientDocumentCategory) => setSelectedCategory(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Краткое описание документа (необязательно)"
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="file">Файл <span className="text-destructive">*</span></Label>
              <Input
                ref={fileInputRef}
                id="file"
                type="file"
                onChange={handleFileSelect}
                className="mt-1"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip,.rar"
                disabled={isUploading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Поддерживаемые форматы: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, ZIP, RAR. Максимум 50 МБ.
              </p>
            </div>

            {selectedCategory === 'contract' && (
              <Alert>
                <AlertCircle className="size-4" />
                <AlertDescription>
                  Договоры автоматически связываются с проектами клиента
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setUploadDialogOpen(false)}
                disabled={isUploading}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex-1"
              >
                {isUploading ? (
                  <>Загрузка...</>
                ) : (
                  <>
                    <Upload className="size-4 mr-2" />
                    Выбрать файл
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}