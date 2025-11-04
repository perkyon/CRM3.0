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

interface DeleteItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  itemName: string;
}

export function DeleteItemDialog({ open, onOpenChange, onConfirm, itemName }: DeleteItemDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md max-w-[90vw]">
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить изделие?</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground pt-2">
            Вы действительно хотите удалить изделие "{itemName}"? Это действие нельзя отменить. 
            Все компоненты и этапы производства этого изделия будут безвозвратно утеряны.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel className="flex-1 m-0">Отмена</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="flex-1 m-0 bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Удалить изделие
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}





