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
import { useProjects } from '../../contexts/ProjectContextNew';

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
  const { projects } = useProjects();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ClientDocumentCategory>('other');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Получаем связанные проекты для клиента
  const relatedProjects = entityType === 'client' 
    ? projects.filter(p => p.clientId === entityId)
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

    // Просто сохраняем выбранный файл, не загружаем автоматически
    setSelectedFile(file);
  };

  const handleUploadClick = async () => {
    if (!selectedFile) {
      toast.error('Выберите файл для загрузки');
      return;
    }

    await handleUpload(selectedFile);
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);

    try {
      // Загружаем файл в Supabase
      let uploadedDocument;
      
      if (entityType === 'client') {
        const { supabaseClientService } = await import('../../lib/supabase/services/ClientService');
        uploadedDocument = await supabaseClientService.uploadClientDocument(entityId, file, selectedCategory, description);
      } else if (entityType === 'project') {
        const { supabaseProjectService } = await import('../../lib/supabase/services/ProjectService');
        uploadedDocument = await supabaseProjectService.uploadProjectDocument(entityId, file, selectedCategory);
      } else {
        throw new Error('Неизвестный тип сущности');
      }

      // Преобразуем ответ от Supabase в формат ClientDocument
      console.log('Raw uploadedDocument:', uploadedDocument);
      
      const newDocument: ClientDocument = {
        id: uploadedDocument.id,
        clientId: entityType === 'client' ? entityId : (uploadedDocument.project_id || ''),
        name: uploadedDocument.name || uploadedDocument.original_name || file.name,
        originalName: uploadedDocument.original_name || file.name,
        type: uploadedDocument.type as any,
        category: uploadedDocument.category as any,
        size: uploadedDocument.size,
        uploadedBy: uploadedDocument.uploaded_by || 'unknown',
        uploadedAt: uploadedDocument.created_at || new Date().toISOString(),
        version: 1,
        description: uploadedDocument.description || description,
        url: uploadedDocument.url
      };

      console.log('Transformed newDocument:', newDocument);

      onDocumentAdd(newDocument);

      toast.success('Документ успешно загружен');

      // Сброс формы
      setDescription('');
      setSelectedCategory('other');
      setSelectedFile(null);
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

  const handleDelete = async (documentId: string) => {
    try {
      if (entityType === 'client') {
        const { supabaseClientService } = await import('../../lib/supabase/services/ClientService');
        await supabaseClientService.deleteClientDocument(entityId, documentId);
      } else if (entityType === 'project') {
        const { supabaseProjectService } = await import('../../lib/supabase/services/ProjectService');
        await supabaseProjectService.deleteProjectDocument(entityId, documentId);
      }
      
      onDocumentDelete(documentId);
      toast.success('Документ удален');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Ошибка при удалении документа');
    }
  };

  const handleDownload = async (document: ClientDocument) => {
    if (!document.url) return;

    try {
      // Получаем supabase client
      const { supabase } = await import('../../lib/supabase/config');
      
      // Извлекаем путь файла из URL
      const urlParts = document.url.split('/');
      const bucketIndex = urlParts.findIndex(part => part === 'public') + 1;
      
      if (bucketIndex === 0) {
        console.error('Invalid URL format:', document.url);
        toast.error('Неверный формат URL документа');
        return;
      }

      const bucketName = urlParts[bucketIndex];
      const filePath = urlParts.slice(bucketIndex + 1).join('/');

      console.log('💾 Downloading document:', { bucketName, filePath });
      
      // Генерируем signed URL для скачивания
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 3600, {
          download: document.originalName || true // Скачивать с оригинальным именем
        });

      if (error) {
        console.error('Error creating signed URL:', error);
        toast.error(`Ошибка при скачивании документа: ${error.message}`);
        return;
      }

      if (data?.signedUrl) {
        const link = window.document.createElement('a');
        link.href = data.signedUrl;
        link.download = document.originalName;
        link.click();
      }
    } catch (error: any) {
      console.error('Error downloading document:', error);
      toast.error(`Ошибка при скачивании документа: ${error.message || 'Неизвестная ошибка'}`);
    }
  };

  const handleView = (document: ClientDocument) => {
    if (!document.url) {
      toast.error('URL документа не найден');
      return;
    }

    console.log('👁️ Opening document:', document.url);
    
    // Просто открываем URL в новой вкладке
    window.open(document.url, '_blank', 'noopener,noreferrer');
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
              <div className="flex items-center gap-2">
                <Input
                  ref={fileInputRef}
                  id="file"
                  type="file"
                  onChange={handleFileSelect}
                  className="mt-1 hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip,.rar"
                  disabled={isUploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full"
                >
                  {selectedFile ? 'Изменить файл' : 'Выбрать файл'}
                </Button>
              </div>
              {selectedFile && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  {getFileIcon(selectedFile.type)}
                  <span className="text-sm">{selectedFile.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} МБ)
                  </span>
                </div>
              )}
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
                onClick={() => {
                  setUploadDialogOpen(false);
                  setSelectedFile(null);
                  setDescription('');
                  setSelectedCategory('other');
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                disabled={isUploading}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                onClick={handleUploadClick}
                disabled={isUploading || !selectedFile}
                className="flex-1"
              >
                {isUploading ? (
                  <>Загрузка...</>
                ) : (
                  <>
                    <Upload className="size-4 mr-2" />
                    Загрузить
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