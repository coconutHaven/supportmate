import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type DeleteInvoiceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceNumber?: number;
  status?: string;
  isPending?: boolean;
  onConfirm: () => void;
};

export function DeleteInvoiceDialog({
  open,
  onOpenChange,
  invoiceNumber,
  status,
  isPending,
  onConfirm,
}: DeleteInvoiceDialogProps) {
  const label = invoiceNumber != null
    ? `Invoice #${String(invoiceNumber).padStart(3, '0')}`
    : 'this invoice';
  const isPublished = status === 'published';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {label}?</AlertDialogTitle>
          <AlertDialogDescription>
            {isPublished
              ? 'This published invoice will be permanently deleted. This cannot be undone.'
              : 'This draft will be permanently deleted. This cannot be undone.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isPending}
            onClick={e => {
              e.preventDefault();
              onConfirm();
            }}
          >
            {isPending ? 'Deleting…' : 'Delete permanently'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
