export type PipelineStage =
  | "idle"
  | "reading"
  | "parsed"
  | "minting"
  | "swapping"
  | "complete";

export type PipelineModalContent = {
  step: 1 | 2 | 3;
  icon: string;
  title: string;
  sub: string;
  progress?: number;
  loading: boolean;
  success: boolean;
};

export function pipelineModalContent(stage: PipelineStage): PipelineModalContent | null {
  switch (stage) {
    case "reading":
      return {
        step: 1,
        icon: "document_scanner",
        title: "Invoice verification",
        sub: "Reading your invoice — extracting ID, buyer, amount, and terms.",
        progress: 0.55,
        loading: true,
        success: false,
      };
    case "parsed":
      return {
        step: 1,
        icon: "check_circle",
        title: "Invoice verified",
        sub: "Fields extracted. Confirm payer in the table, then tokenize.",
        loading: false,
        success: true,
      };
    case "minting":
      return {
        step: 2,
        icon: "token",
        title: "Tokenize & swap",
        sub: "Minting receivable SAC on Stellar testnet…",
        progress: 0.45,
        loading: true,
        success: false,
      };
    case "swapping":
      return {
        step: 2,
        icon: "swap_horiz",
        title: "Tokenize & swap",
        sub: "Executing USDC atomic advance…",
        progress: 0.85,
        loading: true,
        success: false,
      };
    case "complete":
      return {
        step: 3,
        icon: "balance",
        title: "Complete",
        sub: "Mint, swap, and BIR EIS bridge finished. See Compliance for filings.",
        loading: false,
        success: true,
      };
    default:
      return null;
  }
}

export const PIPELINE_MODAL_STAGES: PipelineStage[] = [
  "reading",
  "parsed",
  "minting",
  "swapping",
  "complete",
];
