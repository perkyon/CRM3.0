import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '../ui/sheet';
import { 
  ChevronRight, 
  User, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  Camera,
  FileText,
  ArrowLeft
} from 'lucide-react';
import { projectStageNames, stageOrder } from '../../lib/mockData';
import { useProjects } from '../../contexts/ProjectContext';
import { formatDate, getPriorityColor } from '../../lib/utils';
import { StatusBadge } from '../ui/status-badge';
import { ProjectStage } from '../../types';

interface ProductionKanbanProps {
  projectId?: string;
  onNavigate?: (page: string, params?: { projectId?: string; clientId?: string; taskId?: string }) => void;
}

interface KanbanCard {
  id: string;
  projectId: string;
  title: string;
  stage: ProjectStage;
  assigneeId: string;
  dueDate: string;
  priority: string;
  progress: number;
  checklist: { id: string; text: string; completed: boolean }[];
  riskLevel: 'none' | 'low' | 'medium' | 'high';
}

const mockKanbanCards: KanbanCard[] = [
  {
    id: 'KC-001',
    projectId: 'PRJ-001',
    title: 'Кухня "Модерн"',
    stage: 'assembly',
    assigneeId: '2',
    dueDate: '2024-02-15',
    priority: 'high',
    progress: 75,
    checklist: [
      { id: '1', text: 'Подготовить детали', completed: true },
      { id: '2', text: 'Установить каркас', completed: true },
      { id: '3', text: 'Навесить фасады', completed: false },
      { id: '4', text: 'Установить фурнитуру', completed: false },
    ],
    riskLevel: 'none'
  },
  {
    id: 'KC-002',
    projectId: 'PRJ-002',
    title: 'Шкаф-купе в спальню',
    stage: 'cutting',
    assigneeId: '2',
    dueDate: '2024-03-01',
    priority: 'medium',
    progress: 30,
    checklist: [
      { id: '1', text: 'Раскрой ЛДСП', completed: true },
      { id: '2', text: 'Раскрой зеркал', completed: false },
      { id: '3', text: 'Подготовка фурнитуры', completed: false },
    ],
    riskLevel: 'low'
  },
];

export function ProductionKanban({ projectId, onNavigate }: ProductionKanbanProps) {
  const { getProject } = useProjects();
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
  
  const cards = projectId ? 
    mockKanbanCards.filter(card => card.projectId === projectId) : 
    mockKanbanCards;

  const getCardsForStage = (stage: ProjectStage) => {
    return cards.filter(card => card.stage === stage);
  };

  const getRiskColor = (level: string) => {
    const colors = {
      none: '',
      low: 'bg-yellow-100 text-yellow-800',
      medium: 'bg-orange-100 text-orange-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[level as keyof typeof colors] || '';
  };

  const advanceCard = (card: KanbanCard) => {
    const currentIndex = stageOrder.indexOf(card.stage);
    if (currentIndex < stageOrder.length - 1) {
      const nextStage = stageOrder[currentIndex + 1] as ProjectStage;
      console.log(`Перемещение карточки ${card.id} из ${card.stage} в ${nextStage}`);
      // Here would be the logic to update the card stage
    }
  };

  const currentProject = projectId ? getProject(projectId) : null;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {projectId && onNavigate && (
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => onNavigate('project-overview', { projectId })}>
            <ArrowLeft className="size-4 mr-2" />
            Назад к обзору проекта
          </Button>
          {currentProject && (
            <>
              <div className="border-l border-border h-6"></div>
              <div>
                <h1 className="text-2xl font-medium">{currentProject.title}</h1>
                <p className="text-muted-foreground">Производственный процесс</p>
              </div>
            </>
          )}
        </div>
      )}
      
      {!projectId && (
        <div>
          <h1 className="text-2xl font-medium">Производство</h1>
          <p className="text-muted-foreground">Канбан-доска для управления производственными процессами</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="flex gap-4 pb-4" style={{ minWidth: 'max-content' }}>
          {stageOrder.map((stage) => {
            const stageCards = getCardsForStage(stage as ProjectStage);
            
            return (
              <div key={stage} className="flex-shrink-0 w-80">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base">
                      <span>{projectStageNames[stage]}</span>
                      <Badge variant="secondary">{stageCards.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {stageCards.map((card) => (
                      <KanbanCardComponent
                        key={card.id}
                        card={card}
                        onAdvance={() => advanceCard(card)}
                        onViewDetails={() => setSelectedCard(card)}
                      />
                    ))}
                    {stageCards.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="text-sm">Нет задач</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card Details Sheet */}
      <Sheet open={!!selectedCard} onOpenChange={() => setSelectedCard(null)}>
        <SheetContent className="w-full sm:max-w-2xl" aria-describedby="card-detail-sheet-description">
          <SheetDescription id="card-detail-sheet-description" className="sr-only">
            Подробная информация о задаче производства
          </SheetDescription>
          <SheetHeader className="sr-only">
            <SheetTitle>Детали карточки</SheetTitle>
          </SheetHeader>
          {selectedCard && (
            <CardDetailView 
              card={selectedCard} 
              onAdvance={() => advanceCard(selectedCard)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function KanbanCardComponent({ 
  card, 
  onAdvance, 
  onViewDetails 
}: { 
  card: KanbanCard; 
  onAdvance: () => void;
  onViewDetails: () => void;
}) {
  const completedTasks = card.checklist.filter(item => item.completed).length;
  const totalTasks = card.checklist.length;
  const isLastStage = card.stage === 'done';

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onViewDetails}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-sm line-clamp-2">{card.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{card.id}</p>
            </div>
            {card.riskLevel !== 'none' && (
              <Badge variant="outline" className={getRiskColor(card.riskLevel)}>
                <AlertTriangle className="size-3 mr-1" />
                {card.riskLevel}
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Прогресс</span>
              <span>{completedTasks}/{totalTasks}</span>
            </div>
            <Progress value={(completedTasks / totalTasks) * 100} className="h-1" />
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <User className="size-3" />
              <span>Мастер</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="size-3" />
              <span>{formatDate(card.dueDate)}</span>
            </div>
          </div>

          {!isLastStage && (
            <Button 
              size="sm" 
              className="w-full h-8"
              onClick={(e) => {
                e.stopPropagation();
                onAdvance();
              }}
            >
              Следующий этап
              <ChevronRight className="size-3 ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CardDetailView({ card, onAdvance }: { card: KanbanCard; onAdvance: () => void }) {
  const [checklist, setChecklist] = useState(card.checklist);

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const completedTasks = checklist.filter(item => item.completed).length;
  const totalTasks = checklist.length;

  return (
    <div className="space-y-6">
      <SheetHeader>
        <div className="flex items-center justify-between">
          <div>
            <SheetTitle>{card.title}</SheetTitle>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={card.stage}>
                {projectStageNames[card.stage]}
              </StatusBadge>
              <StatusBadge status={card.priority}>
                {card.priority}
              </StatusBadge>
            </div>
          </div>
          {card.stage !== 'done' && (
            <Button onClick={onAdvance}>
              <ChevronRight className="size-4 mr-2" />
              Следующий этап
            </Button>
          )}
        </div>
      </SheetHeader>

      {/* Progress Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Общий прогресс</span>
              <span className="text-sm text-muted-foreground">
                {completedTasks}/{totalTasks} задач
              </span>
            </div>
            <Progress value={(completedTasks / totalTasks) * 100} />
          </div>
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Чек-лист этапа</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {checklist.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <button
                  onClick={() => toggleChecklistItem(item.id)}
                  className={`size-5 rounded border-2 flex items-center justify-center transition-colors ${
                    item.completed 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-muted-foreground hover:border-green-500'
                  }`}
                >
                  {item.completed && <CheckCircle2 className="size-3" />}
                </button>
                <span className={`flex-1 ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Действия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm">
              <Camera className="size-4 mr-2" />
              Добавить фото
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="size-4 mr-2" />
              Добавить заметку
            </Button>
            <Button variant="outline" size="sm">
              <User className="size-4 mr-2" />
              Назначить
            </Button>
            <Button variant="outline" size="sm">
              <Clock className="size-4 mr-2" />
              Изменить срок
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      {card.riskLevel !== 'none' && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-orange-600" />
              <div>
                <h4 className="font-medium text-orange-800">Внимание к рискам</h4>
                <p className="text-sm text-orange-700">
                  Уровень риска: {card.riskLevel}. Требует дополнительного контроля.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}