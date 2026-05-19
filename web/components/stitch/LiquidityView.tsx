const PROFILE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuADgpRSCu-pI-mYsv-PA9vpGGxtjWqP9a0uTXDMLyf3OBY-DGCWjZb1EL1MfFgPMzbTsQBaFHmuiPyPzx1Cwx2OFE4pg-KbQ2BAuchEahdq46QxxH537wKkizCXqhu0BL74BfcOfqS_LDhY4DYlztqI1CXm6dOo9CZN-3fa18aRgRnkqesvlElIM0zxuGHlRzUmTBVRHafptTS_GAc2S-T5iFlq7q1tEpwzV1oX0y4pe-Ov9sQIiaS2UGByjQ6Eov1d6moNW26O48g";

export function LiquidityView() {
  return (
    <>
      <header className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-outline-variant/10 bg-surface/60 px-margin-mobile py-4 backdrop-blur-xl glass-panel">
        <div className="md:hidden">
          <h1 className="font-headline-md text-headline-md font-semibold tracking-tight text-primary">
            AXIAL
          </h1>
        </div>
        <div className="hidden md:block">
          <h2 className="font-headline-md text-headline-md text-on-surface">Liquidity Engine</h2>
        </div>
        <div className="flex items-center gap-6">
          <button type="button" className="active:scale-95 text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined">account_balance_wallet</span>
          </button>
          <button type="button" className="relative active:scale-95 text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined">notifications</span>
            <span className="bioluminescent-glow absolute top-0 right-0 h-2 w-2 rounded-full bg-primary" />
          </button>
          <div className="h-8 w-8 overflow-hidden rounded-full border border-outline-variant/30 bg-surface-variant">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" className="h-full w-full object-cover" src={PROFILE} />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-container-max flex-grow flex-col gap-gutter p-margin-mobile md:p-margin-desktop">
        <div className="mb-4 md:hidden">
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary">
            Liquidity Engine
          </h2>
          <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
            Tokenize B2B invoices and execute atomic swaps.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
          <section className="col-span-1 flex flex-col gap-6 lg:col-span-8">
            <div className="glass-panel group relative flex flex-col overflow-hidden rounded-xl border-t border-outline-variant/10 bg-surface-container-high/40 p-8">
              <div className="pointer-events-none absolute inset-0 z-10 rounded-xl border-2 border-dashed border-outline-variant/30 transition-colors duration-300 group-hover:border-primary/50" />
              <div className="relative z-20 flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-outline-variant/20 bg-surface-variant/50 transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary/10">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant transition-colors group-hover:text-primary">
                    upload_file
                  </span>
                </div>
                <h3 className="mb-2 font-headline-md text-headline-md text-on-surface">
                  Upload B2B Invoice
                </h3>
                <p className="mb-8 max-w-md font-body-md text-body-md text-on-surface-variant">
                  Drag and drop verified PDF or XML invoices into this zone to initiate the
                  tokenization sequence.
                </p>
                <button
                  type="button"
                  className="rounded-lg border border-outline-variant px-6 py-3 font-label-md text-label-md text-on-surface transition-all duration-200 hover:bg-surface-variant/30"
                >
                  Browse Files
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                ["Total Liquidity Pool", "2.4M", "PHPC", true],
                ["24h Swap Volume", "850K", "PHPC", false],
                ["Active Smart Contracts", "142", "", false],
              ].map(([label, val, unit, primary]) => (
                <div
                  key={label as string}
                  className="glass-panel rounded-lg border-t border-outline-variant/10 bg-surface-container-low/50 p-5"
                >
                  <p className="mb-1 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                    {label}
                  </p>
                  <p
                    className={`font-headline-lg text-headline-lg ${primary ? "text-primary" : "text-on-surface"}`}
                  >
                    {val}{" "}
                    {unit ? (
                      <span className="font-headline-md text-on-surface-variant">{unit}</span>
                    ) : null}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <aside className="col-span-1 lg:col-span-4">
            <div className="glass-panel flex h-full flex-col rounded-xl border-t border-outline-variant/10 bg-surface-container/50 p-6">
              <div className="mb-8 flex items-center justify-between">
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  Tokenization Pipeline
                </h3>
                <span className="material-symbols-outlined text-on-surface-variant">tune</span>
              </div>
              <div className="relative flex flex-grow flex-col gap-0">
                <div className="absolute bottom-10 left-[23px] top-10 w-px bg-outline-variant/20" />
                <div className="relative z-10 mb-8 flex gap-6">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-outline-variant/30 bg-surface-variant">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">
                      document_scanner
                    </span>
                  </div>
                  <div className="pt-2">
                    <p className="font-label-md text-label-md text-on-surface">Invoice Verification</p>
                    <p className="mt-1 text-sm font-body-md text-body-md text-on-surface-variant">
                      OCR and metadata extraction complete.
                    </p>
                  </div>
                </div>
                <div className="relative z-10 mb-8 flex gap-6">
                  <div className="bioluminescent-glow flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-primary/50 bg-primary/20">
                    <span
                      className="material-symbols-outlined text-sm text-primary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      token
                    </span>
                  </div>
                  <div className="pt-2">
                    <p className="font-label-md text-label-md text-primary">Minting in Progress</p>
                    <p className="mt-1 text-sm font-body-md text-body-md text-on-surface-variant">
                      Deploying Soroban asset representation (Stellar).
                    </p>
                    <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-surface-variant">
                      <div className="relative h-full w-2/3 rounded-full bg-primary">
                        <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/30 blur-sm animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative z-10 flex gap-6">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-outline-variant/10 bg-surface-variant/30">
                    <span className="material-symbols-outlined text-sm text-outline">balance</span>
                  </div>
                  <div className="pt-2 opacity-50">
                    <p className="font-label-md text-label-md text-on-surface">Liquidity Matching</p>
                    <p className="mt-1 text-sm font-body-md text-body-md text-on-surface-variant">
                      Awaiting token finality to open order book.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-4">
          <div className="glass-panel overflow-hidden rounded-xl border-t border-outline-variant/10 bg-surface-container-lowest/60">
            <div className="flex items-center justify-between border-b border-outline-variant/10 p-6">
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface">Active Factoring</h3>
                <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
                  Pending and executed atomic swaps.
                </p>
              </div>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg p-2 font-label-md text-label-md text-primary transition-colors hover:bg-primary/10"
              >
                <span className="material-symbols-outlined">filter_list</span>
                Filter
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr>
                    {[
                      "Invoice ID",
                      "Counterparty",
                      "Terms",
                      "Face Value",
                      "Immediate PHPC",
                      "Status",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="border-b border-outline-variant/10 px-6 py-4 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-outline-variant/5 transition-colors hover:bg-surface-variant/10">
                    <td className="px-6 py-4 font-label-md text-label-md text-on-surface">
                      INV-2023-8901
                    </td>
                    <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">
                      Acme Logistics Corp
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded bg-surface-variant px-2 py-1 text-xs font-label-sm text-on-surface">
                        Net 60
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-body-md text-body-md text-on-surface">
                      $125,000.00
                    </td>
                    <td className="px-6 py-4 text-right font-label-md text-label-md text-primary">
                      118,500.00
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/20 bg-secondary-container/30 px-3 py-1 text-xs font-label-sm text-secondary">
                        <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                        Minted
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        className="bioluminescent-glow hover:bioluminescent-glow-active rounded-lg bg-primary px-4 py-2 font-label-md text-label-md text-on-primary transition-all hover:bg-primary-fixed"
                      >
                        Execute Atomic Swap
                      </button>
                    </td>
                  </tr>
                  <tr className="border-b border-outline-variant/5 transition-colors hover:bg-surface-variant/10">
                    <td className="px-6 py-4 font-label-md text-label-md text-on-surface">
                      INV-2023-8904
                    </td>
                    <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">
                      Nexus Tech Solutions
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded bg-surface-variant px-2 py-1 text-xs font-label-sm text-on-surface">
                        Net 90
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-body-md text-body-md text-on-surface">
                      $450,000.00
                    </td>
                    <td className="px-6 py-4 text-right font-label-md text-label-md text-on-surface-variant">
                      --
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/20 bg-surface-variant/50 px-3 py-1 text-xs font-label-sm text-on-surface-variant">
                        <span className="material-symbols-outlined animate-spin text-[14px]">sync</span>
                        Scanning
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        className="cursor-not-allowed rounded-lg border border-outline-variant/50 px-4 py-2 font-label-md text-label-md text-on-surface-variant opacity-50"
                        disabled
                      >
                        Pending
                      </button>
                    </td>
                  </tr>
                  <tr className="transition-colors hover:bg-surface-variant/10">
                    <td className="px-6 py-4 font-label-md text-label-md text-on-surface">
                      INV-2023-8872
                    </td>
                    <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">
                      Global Freight Systems
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded bg-surface-variant px-2 py-1 text-xs font-label-sm text-on-surface">
                        Net 30
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-body-md text-body-md text-on-surface">
                      $75,500.00
                    </td>
                    <td className="px-6 py-4 text-right font-label-md text-label-md text-on-surface-variant">
                      73,200.00
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/10 bg-surface-variant/30 px-3 py-1 text-xs font-label-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Settled
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        className="flex w-full items-center justify-end gap-2 px-4 py-2 font-label-md text-label-md text-on-surface-variant transition-colors hover:text-primary"
                      >
                        <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                        View TX
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
