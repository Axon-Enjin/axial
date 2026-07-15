/**
 * Versioned statutory payroll tables (effective-dated).
 * Counsel/accountant sign-off is external — tables are demo-quality until certified.
 */

export type StatutoryRateRow = {
  effectiveFrom: string;
  sssBps: number;
  philhealthBps: number;
  pagibigBps: number;
  label: string;
  counselReviewed: boolean;
};

export const STATUTORY_TABLES: StatutoryRateRow[] = [
  {
    effectiveFrom: "2024-01-01",
    sssBps: 1_100,
    philhealthBps: 500,
    pagibigBps: 200,
    label: "2024 demo rates (SSS 11% · PhilHealth 5% · Pag-IBIG 2%)",
    counselReviewed: false,
  },
  {
    effectiveFrom: "2026-01-01",
    sssBps: 1_100,
    philhealthBps: 500,
    pagibigBps: 200,
    label: "2026 demo rates — unchanged pending accountant review",
    counselReviewed: false,
  },
];

export function getEffectiveStatutoryRates(asOf = new Date()): StatutoryRateRow {
  const iso = asOf.toISOString().slice(0, 10);
  const sorted = [...STATUTORY_TABLES].sort((a, b) =>
    a.effectiveFrom.localeCompare(b.effectiveFrom),
  );
  let current = sorted[0]!;
  for (const row of sorted) {
    if (row.effectiveFrom <= iso) current = row;
  }
  return current;
}

export function formatStatutoryLabel(row: StatutoryRateRow): string {
  return `${row.label} · effective ${row.effectiveFrom}`;
}
