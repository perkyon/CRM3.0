import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FileText, Upload, X, ExternalLink, Edit } from 'lucide-react';
import { Document } from '../../types';
import { toast } from '../../lib/toast';
import { cn } from '../../lib/utils';

interface TechnicalDocumentSelectorProps {
  projectId: string;
  value?: string; // ID выбранного документа или URL
  onChange: (value: string) => void;
  className?: string;
}

export function TechnicalDocumentSelector({ 
  projectId, 
  value, 
  onChange, 
  className 
}: TechnicalDocumentSelectorProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseStoredValue = (stored?: string) => {
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object') {
        return parsed as { id?: string; name?: string; url?: string };
      }
    } catch {
      // not JSON
    }
    return null;
  };

  useEffect(() => {
    if (projectId) {
      loadDocuments();
    }
  }, [projectId]);

  useEffect(() => {
    if (!value) {
      setIsSelecting(false);
    }
  }, [value]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const { supabaseProjectService } = await import('../../lib/supabase/services/ProjectService');
      const allDocs = await supabaseProjectService.getProjectDocuments(projectId);
      // Фильтруем только документы ТЗ (brief)
      const briefDocs = allDocs.filter(doc => doc.category === 'brief');
      setDocuments(briefDocs);
    } catch (error) {
      console.error('Error loading project documents:', error);
      toast.error('Не удалось загрузить документы проекта');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Проверка размера файла (максимум 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 50 МБ');
      return;
    }

    try {
      setIsUploading(true);
      const { supabaseProjectService } = await import('../../lib/supabase/services/ProjectService');
      
      // Загружаем документ в категорию 'brief' (ТЗ)
      const uploadedDocument = await supabaseProjectService.uploadProjectDocument(
        projectId,
        file,
        'brief',
        'Загружено из технических заметок изделия'
      );

      // Обновляем список документов
      await loadDocuments();

      // Устанавливаем выбранный документ
      onChange(JSON.stringify({
        id: uploadedDocument.id,
        name: uploadedDocument.name || uploadedDocument.original_name || uploadedDocument.id,
        url: uploadedDocument.url || '',
      }));
      
      toast.success('Документ загружен и добавлен в ТЗ проекта');
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Не удалось загрузить документ');
    } finally {
      setIsUploading(false);
      // Сбрасываем input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const storedMeta = parseStoredValue(value);

  const selectedDocument = documents.find(d => {
    if (storedMeta?.id && d.id === storedMeta.id) return true;
    if (storedMeta?.url && d.url === storedMeta.url) return true;
    return d.id === value || d.url === value;
  });

  const handleDocumentSelect = (documentId: string) => {
    const selectedDoc = documents.find(d => d.id === documentId);
    if (selectedDoc) {
      onChange(JSON.stringify({
        id: selectedDoc.id,
        name: selectedDoc.name || selectedDoc.original_name || selectedDoc.id,
        url: selectedDoc.url || '',
      }));
      setIsSelecting(false);
    }
  };

  const handleClear = () => {
    onChange('');
    setIsSelecting(false);
  };

  const displayName =
    storedMeta?.name ||
    selectedDocument?.name ||
    selectedDocument?.original_name ||
    storedMeta?.url ||
    value;
  const documentUrl = storedMeta?.url || selectedDocument?.url || (storedMeta ? undefined : value);

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="technical-document">
        Техничка
      </Label>
      
      <div className="space-y-2">
        {/* Выбор существующего документа */}
        {(isSelecting || !value) && (
          <Select
            value={selectedDocument?.id || ''}
            onValueChange={handleDocumentSelect}
            disabled={isLoading || isUploading}
          >
            <SelectTrigger id="technical-document" className="w-full">
              <SelectValue placeholder="Выберите документ из ТЗ проекта или загрузите новый" />
            </SelectTrigger>
            <SelectContent className="w-[var(--radix-select-trigger-width)] max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  Загрузка...
                </div>
              ) : documents.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  Нет документов в ТЗ проекта
                </div>
              ) : (
                documents.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id}>
                    <div className="flex items-center gap-2">
                      <FileText className="size-4" />
                      <span className="truncate">{doc.name}</span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        )}

        {value && !isSelecting && (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="size-4 text-muted-foreground" />
              <span className="font-medium text-foreground truncate">{displayName}</span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {documentUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => window.open(documentUrl, '_blank')}
                >
                  <ExternalLink className="size-4 mr-1" />
                  Открыть
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setIsSelecting(true)}
                title="Выбрать другой документ"
              >
                <Edit className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleClear}
                title="Очистить"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Кнопка загрузки нового документа */}
        <div className="grid gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.dwg,.dxf,.3dm,.step,.iges,.jpg,.jpeg,.png"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full justify-center"
          >
            <Upload className="size-4 mr-2" />
            {isUploading ? 'Загрузка...' : 'Загрузить новый документ'}
          </Button>
        </div>
      </div>
    </div>
  );
}

