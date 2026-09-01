import { describe, it, expect } from 'vitest';
import { calculateShift, invoiceLineTotal } from '@/lib/shiftCalculations';
import type { InvoiceShift } from '@/hooks/useInvoices';

const baseShift = (): InvoiceShift => ({
  shift_date: '1/6',
  day_name: 'Mon',
  hours: 0,
  hourly_rate: 44,
  rate_name: 'Standard',
  km: 0,
  km_rate: 0.95,
  expenses: [],
  expenses_total: 0,
  shift_total: 0,
  invoice_hours: 0,
  invoice_rate: 0,
  invoice_amount: 0,
  sort_order: 0,
});

describe('calculateShift', () => {
  it('normalises invoice line at $44/h (262.40 → 5.96h × $44 = $262.24)', () => {
    const shift = calculateShift({
      ...baseShift(),
      shift_total: 262.4,
      hours: 5,
      hourly_rate: 44,
      km: 0,
      expenses: [{ name: 'Expense', amount: 42.4 }],
    });
    // Recalc from components: 5*44 + 42.4 = 262.4
    expect(shift.shift_total).toBe(262.4);
    expect(shift.invoice_rate).toBe(44);
    expect(shift.invoice_hours).toBe(5.96);
    expect(shift.invoice_amount).toBe(262.24);
  });

  it('uses updated hourly_rate when rate changes to $55/h', () => {
    const shift = calculateShift({
      ...baseShift(),
      hours: 3,
      hourly_rate: 55,
      km: 10,
      km_rate: 0.95,
      expenses: [{ name: 'Parking', amount: 5 }],
    });
    expect(shift.shift_total).toBe(179.5);
    expect(shift.invoice_rate).toBe(55);
    expect(shift.invoice_hours).toBe(3.26);
    expect(shift.invoice_amount).toBe(179.3);
  });
});

describe('invoiceLineTotal', () => {
  it('sums rounded line amounts', () => {
    const a = calculateShift({ ...baseShift(), hours: 3, hourly_rate: 50, km: 10, km_rate: 0.95, expenses: [{ name: 'P', amount: 5 }] });
    expect(invoiceLineTotal([a])).toBe(164.5);
  });
});
