import React from 'react';
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

interface DeleteZoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  zoneName: string;
}

export function DeleteZoneDialog({ open, onOpenChange, onConfirm, zoneName }: DeleteZoneDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md max-w-[90vw]">
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить зону?</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground pt-2">
            Вы действительно хотите удалить зону "{zoneName}"? Это действие нельзя отменить. 
            Все изделия в этой зоне будут безвозвратно утеряны.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel className="flex-1 m-0">Отмена</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="flex-1 m-0 bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Удалить зону
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

