import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  Upload, 
  FileText, 
  Image, 
  File, 
  Download, 
  Trash2,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Eye
} from 'lucide-react';
import { toast } from '../../lib/toast';
import { formatDate } from '../../lib/utils';

interface MaterialFile {
  id: string;
  name: string;
  type: 'pdf' | 'excel' | 'word' | 'image' | 'other';
  size: number;
  uploadDate: string;
  uploadedBy: string;
  category: 'specification' | 'drawing' | 'photo' | 'other';
  url?: string;
}

interface MaterialsManagerProps {
  projectId: string;
}

const mockMaterials: MaterialFile[] = [
  {
    id: '1',
    name: 'Спецификация_Кухня_v2.xlsx',
    type: 'excel',
    size: 245760,
    uploadDate: '2024-01-15',
    uploadedBy: 'Иванов И.И.',
    category: 'specification'
  },
  {
    id: '2',
    name: 'Чертеж_фасады.pdf',
    type: 'pdf',
    size: 1024000,
    uploadDate: '2024-01-14',
    uploadedBy: 'Петров П.П.',
    category: 'drawing'
  },
  {
    id: '3',
    name: 'Фото_замеров.jpg',
    type: 'image',
    size: 512000,
    uploadDate: '2024-01-13',
    uploadedBy: 'Сидоров С.С.',
    category: 'photo'
  }
];

export function MaterialsManager({ projectId }: MaterialsManagerProps) {
  const [materials, setMaterials] = useState<MaterialFile[]>(mockMaterials);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Симуляция загрузки файла
    const file = files[0];
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          
          // Добавляем файл в список
          const newMaterial: MaterialFile = {
            id: Date.now().toString(),
            name: file.name,
            type: getFileType(file.name),
            size: file.size,
            uploadDate: new Date().toISOString().split('T')[0],
            uploadedBy: 'Текущий пользователь',
            category: 'other'
          };
          
          setMaterials(prev => [newMaterial, ...prev]);
          toast.success(`Файл "${file.name}" успешно загружен`);
          
          // Сбрасываем input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          
          return 0;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getFileType = (fileName: string): MaterialFile['type'] => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'pdf';
      case 'xlsx': case 'xls': return 'excel';
      case 'docx': case 'doc': return 'word';
      case 'jpg': case 'jpeg': case 'png': case 'gif': return 'image';
      default: return 'other';
    }
  };

  const getFileIcon = (type: MaterialFile['type']) => {
    switch (type) {
      case 'pdf': return <FileText className="size-5 text-red-500" />;
      case 'excel': return <FileText className="size-5 text-green-500" />;
      case 'word': return <FileText className="size-5 text-blue-500" />;
      case 'image': return <Image className="size-5 text-purple-500" />;
      default: return <File className="size-5 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: MaterialFile['category']) => {
    switch (category) {
      case 'specification': return 'bg-blue-100 text-blue-700';
      case 'drawing': return 'bg-green-100 text-green-700';
      case 'photo': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryText = (category: MaterialFile['category']) => {
    switch (category) {
      case 'specification': return 'Спецификация';
      case 'drawing': return 'Чертеж';
      case 'photo': return 'Фото';
      default: return 'Прочее';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Байт';
    const k = 1024;
    const sizes = ['Байт', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDeleteFile = (fileId: string) => {
    setMaterials(prev => prev.filter(m => m.id !== fileId));
    toast.success('Файл удален');
  };

  const handleDownloadFile = (file: MaterialFile) => {
    toast.success(`Скачивание файла "${file.name}"`);
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header with Upload */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Материалы и документы</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Спецификации, чертежи, фотографии и другие материалы проекта
              </p>
            </div>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="size-4 mr-2" />
              Загрузить файл
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              multiple
              accept=".pdf,.xlsx,.xls,.docx,.doc,.jpg,.jpeg,.png,.gif,.dwg,.zip"
            />
          </div>
        </CardHeader>

        {/* Upload Progress */}
        {isUploading && (
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Загрузка файла...</span>
                <span className="text-sm font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="size-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Поиск по названию файла..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                Все
              </Button>
              <Button
                variant={selectedCategory === 'specification' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('specification')}
              >
                Спецификации
              </Button>
              <Button
                variant={selectedCategory === 'drawing' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('drawing')}
              >
                Чертежи
              </Button>
              <Button
                variant={selectedCategory === 'photo' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('photo')}
              >
                Фото
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Materials List */}
      {filteredMaterials.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <FileText className="size-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">Нет файлов</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {searchQuery || selectedCategory !== 'all' 
                  ? 'По заданным критериям ничего не найдено' 
                  : 'Загрузите первый файл для проекта'
                }
              </p>
              {!searchQuery && selectedCategory === 'all' && (
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Plus className="size-4 mr-2" />
                  Загрузить файл
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredMaterials.map((material) => (
            <Card key={material.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* File Icon */}
                  <div className="flex-shrink-0">
                    {getFileIcon(material.type)}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{material.name}</h4>
                      <Badge className={getCategoryColor(material.category)}>
                        {getCategoryText(material.category)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatFileSize(material.size)}</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {formatDate(material.uploadDate)}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="size-3" />
                        {material.uploadedBy}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDownloadFile(material)}
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDownloadFile(material)}
                    >
                      <Download className="size-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteFile(material.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Всего файлов: {materials.length}</span>
            <span>
              Общий размер: {formatFileSize(materials.reduce((sum, m) => sum + m.size, 0))}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}