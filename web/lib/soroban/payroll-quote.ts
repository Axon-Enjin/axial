const MAX_BPS = 10_000;

export type PayrollQuoteResult = {
  gross: number;
  sss: number;
  philhealth: number;
  pagibig: number;
  net: number;
  sssBps: number;
  philhealthBps: number;
  pagibigBps: number;
};

/** Demo statutory rates (must match contract `initialize` bps on Mainnet). */
export const DEFAULT_PAYROLL_BPS = {
  sss: 1_100,
  philhealth: 500,
  pagibig: 200,
} as const;

export function quotePayrollSplit(
  grossAmount: number,
  bps: {
    sss?: number;
    philhealth?: number;
    pagibig?: number;
  } = DEFAULT_PAYROLL_BPS,
): PayrollQuoteResult {
  if (grossAmount <= 0) {
    throw new Error("grossAmount must be positive");
  }
  const sssBps = bps.sss ?? DEFAULT_PAYROLL_BPS.sss;
  const philhealthBps = bps.philhealth ?? DEFAULT_PAYROLL_BPS.philhealth;
  const pagibigBps = bps.pagibig ?? DEFAULT_PAYROLL_BPS.pagibig;

  const sss = Math.floor((grossAmount * sssBps) / MAX_BPS);
  const philhealth = Math.floor((grossAmount * philhealthBps) / MAX_BPS);
  const pagibig = Math.floor((grossAmount * pagibigBps) / MAX_BPS);
  const net = grossAmount - sss - philhealth - pagibig;

  return {
    gross: grossAmount,
    sss,
    philhealth,
    pagibig,
    net,
    sssBps,
    philhealthBps,
    pagibigBps,
  };
}
