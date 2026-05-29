'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  name: string;
}

export function DeleteConfirmationModal({ isOpen, onClose, onConfirm, name }: DeleteConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">تأیید حذف</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-700">
            آیا از حذف "{name}" اطمینان دارید؟
          </p>
          <p className="text-sm text-red-600 mt-2">
            این عمل قابل بازگشت نیست.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            انصراف
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            حذف
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}