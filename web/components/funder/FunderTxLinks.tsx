import { Icon } from "@/components/ui/Icon";

function txExplorerUrl(base: string, hash: string) {
  return `${base}/${hash}`;
}

type Props = {
  mintTxHash?: string | null;
  swapTxHash?: string | null;
  settlementTxHash?: string | null;
  explorerTxBase: string;
};

export function FunderTxLinks({
  mintTxHash,
  swapTxHash,
  settlementTxHash,
  explorerTxBase,
}: Props) {
  const linkClass =
    "inline-flex items-center gap-1 bg-transparent font-label-md text-[10px] sm:text-[11px] md:text-label-md text-on-surface-variant hover:text-primary underline-offset-2 hover:underline";

  if (!mintTxHash && !swapTxHash && !settlementTxHash) {
    return (
      <span className="font-label-sm text-[10px] sm:text-label-sm text-outline" title="No on-chain txs">
        —
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col items-end gap-0.5">
      {mintTxHash ? (
        <a
          href={txExplorerUrl(explorerTxBase, mintTxHash)}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
        >
          <Icon name="receipt_long" size={14} />
          <span className="whitespace-nowrap">Mint</span>
        </a>
      ) : null}
      {swapTxHash ? (
        <a
          href={txExplorerUrl(explorerTxBase, swapTxHash)}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
        >
          <Icon name="swap_horiz" size={14} />
          <span className="whitespace-nowrap">Swap</span>
        </a>
      ) : null}
      {settlementTxHash ? (
        <a
          href={txExplorerUrl(explorerTxBase, settlementTxHash)}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
        >
          <Icon name="payments" size={14} />
          <span className="whitespace-nowrap">Settle</span>
        </a>
      ) : null}
    </span>
  );
}
