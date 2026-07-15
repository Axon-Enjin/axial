export type OrgProfile = {
  id: string;
  name: string;
  slug: string;
  trustBoundaryAckedAt: string | null;
  sellerTin: string | null;
  sellerName: string | null;
  sellerAddress: string | null;
  buyerTinDefault: string | null;
  buyerNameDefault: string | null;
  buyerAddressDefault: string | null;
  frozenAt: string | null;
  freezeReason: string | null;
};

export type OrgTaxProfile = {
  sellerTin: string;
  sellerName: string;
  sellerAddress: string;
  buyerTinDefault: string;
  buyerNameDefault: string;
  buyerAddressDefault: string;
};

export const TRUST_BOUNDARY_DRAFT = {
  title: "Trust & boundary (draft — counsel review)",
  clauses: [
    "Axial provides liquidity and compliance automation rails; it is not the lender of record unless separately contracted.",
    "Receivable tokenization assigns collection rights per the Notice of Assignment; payer payment to the lockbox satisfies the assigned obligation.",
    "Statutory payroll splits are computed from configured tables; the MSME remains employer of record for SSS, PhilHealth, and Pag-IBIG filings.",
    "BIR EIS payloads are prepared for review; live transmission requires Permit to Transmit and remains the taxpayer's responsibility until certified.",
    "Leakage or shortfall may trigger recourse per funder agreement; MSME funding may be paused while a deal is under review.",
  ],
  watermark: "Draft copy — not legal advice. Final text pending Philippine counsel review.",
} as const;
