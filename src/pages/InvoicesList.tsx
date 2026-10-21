import { useState } from 'react';
import { useInvoices, type Invoice } from '@/hooks/useInvoices';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Archive, FileText, Plus, Eye, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { DeleteInvoiceDialog } from '@/components/invoices/DeleteInvoiceDialog';

export default function InvoicesList() {
  const { invoices, isLoading, deleteInvoice, archiveInvoice } = useInvoices();
  const { toast } = useToast();
  const [pendingDelete, setPendingDelete] = useState<Invoice | null>(null);

  const handleArchive = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await archiveInvoice.mutateAsync(id);
      toast({ title: 'Invoice archived' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const openDelete = (e: React.MouseEvent, inv: Invoice) => {
    e.preventDefault();
    e.stopPropagation();
    setPendingDelete(inv);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteInvoice.mutateAsync(pendingDelete.id);
      toast({ title: 'Invoice deleted' });
      setPendingDelete(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" /> Invoices
          </h1>
          <p className="text-muted-foreground">View and manage all your invoices</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/invoices/archive">
            <Button variant="outline" className="gap-2">
              <Archive className="w-4 h-4" /> Archive
            </Button>
          </Link>
          <Link to="/invoices/new">
            <Button className="gradient-primary text-primary-foreground gap-2">
              <Plus className="w-4 h-4" /> New Invoice
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : invoices.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-heading font-bold text-lg text-foreground">No invoices yet</h3>
            <p className="text-muted-foreground mb-4">Create your first invoice to get started!</p>
            <Link to="/invoices/new">
              <Button className="gradient-primary text-primary-foreground">Create Invoice</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {invoices.map(inv => (
            <Link key={inv.id} to={`/invoices/${inv.id}`}>
              <Card className="shadow-card hover:shadow-elevated transition-all cursor-pointer group mb-3">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-foreground">
                        Invoice #{String(inv.invoice_number).padStart(3, '0')}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {inv.clients?.name} · {inv.invoice_date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="text-right">
                      <p className="font-bold text-foreground">${Number(inv.total_amount).toFixed(2)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        inv.status === 'published' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                      }`}>{inv.status}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Archive"
                      onClick={e => handleArchive(e, inv.id)}
                      disabled={archiveInvoice.isPending}
                    >
                      <Archive className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete"
                      onClick={e => openDelete(e, inv)}
                      disabled={deleteInvoice.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <DeleteInvoiceDialog
        open={pendingDelete != null}
        onOpenChange={open => { if (!open) setPendingDelete(null); }}
        invoiceNumber={pendingDelete?.invoice_number}
        status={pendingDelete?.status}
        isPending={deleteInvoice.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
