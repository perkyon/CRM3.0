import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Check, ChevronDown } from 'lucide-react';
import { ProjectStage } from '../../types';
import { projectStageNames } from '../../lib/mockData';

interface StageSelectorProps {
  currentStage: ProjectStage;
  onStageChange: (stage: ProjectStage) => void;
  disabled?: boolean;
}

const stages: ProjectStage[] = ['brief', 'design', 'tech_project', 'procurement', 'production', 'assembly', 'delivery', 'done'];

const stageColors: Record<ProjectStage, string> = {
  brief: 'bg-gray-100 text-gray-700',
  design: 'bg-blue-100 text-blue-700',
  tech_project: 'bg-purple-100 text-purple-700',
  procurement: 'bg-orange-100 text-orange-700',
  production: 'bg-yellow-100 text-yellow-700',
  assembly: 'bg-indigo-100 text-indigo-700',
  delivery: 'bg-green-100 text-green-700',
  done: 'bg-green-500 text-white'
};

export function StageSelector({ currentStage, onStageChange, disabled }: StageSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button variant="outline" className="justify-between min-w-[160px]">
          <Badge className={stageColors[currentStage]} variant="secondary">
            {projectStageNames[currentStage]}
          </Badge>
          <ChevronDown className="size-4 ml-2 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        {stages.map((stage) => (
          <DropdownMenuItem
            key={stage}
            onClick={() => onStageChange(stage)}
            className="flex items-center justify-between"
          >
            <span>{projectStageNames[stage]}</span>
            {currentStage === stage && <Check className="size-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
