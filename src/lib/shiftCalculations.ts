import type { InvoiceShift } from '@/hooks/useInvoices';

/** Calculations use shift hourly_rate; invoice line normalises to hours × that same rate. */
export function calculateShift(shift: InvoiceShift): InvoiceShift {
  const hoursAmount = shift.hours * shift.hourly_rate;
  const kmAmount = shift.km * shift.km_rate;
  const expensesTotal = shift.expenses.reduce((sum, e) => sum + e.amount, 0);
  const shiftTotal = Math.round((hoursAmount + kmAmount + expensesTotal) * 100) / 100;
  const invoiceRate = shift.hourly_rate;
  const divisor = invoiceRate > 0 ? invoiceRate : 1;
  const invoiceHours = Math.round((shiftTotal / divisor) * 100) / 100;
  const invoiceAmount = Math.round(invoiceHours * invoiceRate * 100) / 100;

  return {
    ...shift,
    expenses_total: expensesTotal,
    shift_total: shiftTotal,
    invoice_hours: invoiceHours,
    invoice_rate: invoiceRate,
    invoice_amount: invoiceAmount,
  };
}

export function invoiceLineTotal(shifts: InvoiceShift[]): number {
  return Math.round(shifts.reduce((sum, s) => sum + s.invoice_amount, 0) * 100) / 100;
}
