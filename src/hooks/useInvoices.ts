import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Expense {
  name: string;
  amount: number;
}

export interface InvoiceShift {
  id?: string;
  invoice_id?: string;
  shift_date: string;
  day_name: string;
  hours: number;
  hourly_rate: number;
  rate_name: string;
  reference_number?: string | null;
  reference_description?: string | null;
  fixed_shift_id?: string | null;
  km: number;
  km_rate: number;
  expenses: Expense[];
  expenses_total: number;
  shift_total: number;
  invoice_hours: number;
  invoice_rate: number;
  invoice_amount: number;
  sort_order: number;
}

export interface Invoice {
  id: string;
  client_id: string;
  invoice_number: number;
  invoice_date: string;
  status: string;
  total_amount: number;
  notes: string | null;
  created_at: string;
  archived_at?: string | null;
  invoice_shifts?: InvoiceShift[];
  clients?: { name: string };
}

export function useInvoices(clientId?: string, options?: { archived?: boolean }) {
  const queryClient = useQueryClient();
  const archived = options?.archived === true;

  const invoicesQuery = useQuery({
    queryKey: ['invoices', clientId, archived ? 'archived' : 'active'],
    queryFn: async () => {
      const path = archived ? '/invoices?archived=1' : '/invoices';
      const invoices = await api.get<Invoice[]>(path);
      if (clientId) return invoices.filter(i => i.client_id === clientId);
      return invoices;
    },
  });

  const invalidateInvoiceQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
  };

  const getNextInvoiceNumber = async (cId: string): Promise<number> => {
    const { next } = await api.get<{ next: number }>(`/invoices/next-number/${cId}`);
    return next;
  };

  const createInvoice = useMutation({
    mutationFn: async (invoice: { client_id: string; invoice_date: string; shifts: InvoiceShift[]; invoice_number?: number }) => {
      return api.post<Invoice>('/invoices', invoice);
    },
    onSuccess: invalidateInvoiceQueries,
  });

  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/invoices/${id}`);
    },
    onSuccess: invalidateInvoiceQueries,
  });

  const archiveInvoice = useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/invoices/${id}/archive`);
    },
    onSuccess: invalidateInvoiceQueries,
  });

  const restoreInvoice = useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/invoices/${id}/restore`);
    },
    onSuccess: invalidateInvoiceQueries,
  });

  const publishInvoice = useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/invoices/${id}/publish`);
    },
    onSuccess: invalidateInvoiceQueries,
  });

  const updateInvoice = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Invoice> & { id: string }) => {
      await api.put(`/invoices/${id}`, updates);
    },
    onSuccess: invalidateInvoiceQueries,
  });

  const updateDraftInvoice = useMutation({
    mutationFn: async (payload: {
      id: string;
      invoice_date: string;
      shifts: InvoiceShift[];
      invoice_number?: number;
    }) => {
      return api.put<Invoice>(`/invoices/${payload.id}/draft`, {
        invoice_date: payload.invoice_date,
        shifts: payload.shifts,
        ...(payload.invoice_number != null ? { invoice_number: payload.invoice_number } : {}),
      });
    },
    onSuccess: invalidateInvoiceQueries,
  });

  return {
    invoices: invoicesQuery.data ?? [],
    isLoading: invoicesQuery.isLoading,
    createInvoice,
    publishInvoice,
    updateInvoice,
    updateDraftInvoice,
    deleteInvoice,
    archiveInvoice,
    restoreInvoice,
    getNextInvoiceNumber,
  };
}
