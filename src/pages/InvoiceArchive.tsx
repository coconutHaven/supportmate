import { useMemo, useState } from 'react';
import { useInvoices, type Invoice } from '@/hooks/useInvoices';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Archive, ArrowLeft, Eye, RotateCcw, Search, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { DeleteInvoiceDialog } from '@/components/invoices/DeleteInvoiceDialog';

export default function InvoiceArchive() {
  const { invoices, isLoading, restoreInvoice, deleteInvoice } = useInvoices(undefined, { archived: true });
  const { toast } = useToast();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [pendingDelete, setPendingDelete] = useState<Invoice | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices.filter(inv => {
      if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
      if (!q) return true;
      const num = String(inv.invoice_number).padStart(3, '0');
      const name = inv.clients?.name?.toLowerCase() ?? '';
      return num.includes(q) || name.includes(q) || inv.invoice_date.includes(q);
    });
  }, [invoices, query, statusFilter]);

  const handleRestore = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await restoreInvoice.mutateAsync(id);
      toast({ title: 'Invoice restored' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteInvoice.mutateAsync(pendingDelete.id);
      toast({ title: 'Invoice deleted permanently' });
      setPendingDelete(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" className="mb-2 gap-2 -ml-2" onClick={() => navigate('/invoices')}>
            <ArrowLeft className="w-4 h-4" /> Back to Invoices
          </Button>
          <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
            <Archive className="w-6 h-6 text-primary" /> Invoice Archive
          </h1>
          <p className="text-muted-foreground">
            Archived invoices are hidden from your main list. Restore them anytime, or delete permanently.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by number, client, or date…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-1">
          {([
            ['all', 'All'],
            ['published', 'Published'],
            ['draft', 'Drafts'],
          ] as const).map(([value, label]) => (
            <Button
              key={value}
              size="sm"
              variant={statusFilter === value ? 'secondary' : 'ghost'}
              onClick={() => setStatusFilter(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading archive…</div>
      ) : invoices.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Archive className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-heading font-bold text-lg text-foreground">Archive is empty</h3>
            <p className="text-muted-foreground mb-4">
              Archive invoices from the invoices list to keep them out of the way without deleting them.
            </p>
            <Link to="/invoices">
              <Button variant="outline">Back to Invoices</Button>
            </Link>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="py-10 text-center text-muted-foreground">
            No archived invoices match your search.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(inv => (
            <Card key={inv.id} className="shadow-card hover:shadow-elevated transition-all group">
              <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Link to={`/invoices/${inv.id}`} className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <Archive className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-heading font-bold text-foreground">
                      Invoice #{String(inv.invoice_number).padStart(3, '0')}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {inv.clients?.name} · {inv.invoice_date}
                      {inv.archived_at ? ` · Archived ${inv.archived_at.slice(0, 10)}` : ''}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-2 sm:gap-3 justify-end">
                  <div className="text-right mr-1">
                    <p className="font-bold text-foreground">${Number(inv.total_amount).toFixed(2)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      inv.status === 'published' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                    }`}>{inv.status}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={e => handleRestore(e, inv.id)}
                    disabled={restoreInvoice.isPending}
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Restore
                  </Button>
                  <Link to={`/invoices/${inv.id}`}>
                    <Button variant="ghost" size="icon" aria-label="View invoice">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    aria-label="Delete permanently"
                    onClick={() => setPendingDelete(inv)}
                    disabled={deleteInvoice.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
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
