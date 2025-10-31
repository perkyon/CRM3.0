import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Check, ChevronDown } from 'lucide-react';
import { ProjectStage } from '../../types';
import { projectStageNames } from '../../lib/constants';

interface StageSelectorProps {
  currentStage: ProjectStage;
  onStageChange: (stage: ProjectStage) => void;
  disabled?: boolean;
}

const stages: ProjectStage[] = [
  'brief',
  'preliminary_design',
  'client_approval',
  'tech_project',
  'tech_approval',
  'production',
  'quality_check',
  'packaging',
  'delivery',
  'installation',
  'completed'
];

const stageColors: Record<string, string> = {
  brief: 'bg-gray-100 text-gray-700',
  preliminary_design: 'bg-blue-100 text-blue-700',
  client_approval: 'bg-purple-100 text-purple-700',
  tech_project: 'bg-indigo-100 text-indigo-700',
  tech_approval: 'bg-violet-100 text-violet-700',
  production: 'bg-yellow-100 text-yellow-700',
  quality_check: 'bg-orange-100 text-orange-700',
  packaging: 'bg-amber-100 text-amber-700',
  delivery: 'bg-green-100 text-green-700',
  installation: 'bg-teal-100 text-teal-700',
  completed: 'bg-green-500 text-white',
  cancelled: 'bg-red-100 text-red-700'
};

export function StageSelector({ currentStage, onStageChange, disabled }: StageSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="justify-between w-full gap-2 py-2.5" disabled={disabled}>
          <div className={`${stageColors[currentStage]} rounded-full px-3 py-1 text-xs font-semibold truncate min-w-0`}>
            {projectStageNames[currentStage]}
          </div>
          <ChevronDown className="size-4 opacity-50 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[280px]">
        {stages.map((stage) => (
          <DropdownMenuItem
            key={stage}
            onClick={() => onStageChange(stage)}
            className="flex items-center justify-between"
          >
            <span className="flex-1">{projectStageNames[stage]}</span>
            {currentStage === stage && <Check className="size-4 text-primary flex-shrink-0 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
