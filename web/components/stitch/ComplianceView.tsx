const MOBILE_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD6qUZCcTpzQpnY-d5oQEQ5x1QU8ibNNoC32fDOHfFCpvaUZgURotn09QGcHfNXlKTlRJq-0BF0lDz8XFqGNWkmndQOshIXSLHN9jSRyYLjH2S9fSUNFvvuOTlnnnI0xOicpGEI9u6xpCmiw8__OgRY8gsdDiN-YvWjVDOfxkn71CGuFKT6GZuk_DMCcScEbwiEWKEWbvOCR_3HwnvwZQ43e_S1vVbHP0-jbAiV0u5axXbJNU6WTcMA-oN6-4zECGAgoOH9Jbsm0Xg";

export function ComplianceView() {
  return (
    <div className="compliance-route flex flex-1 flex-col bg-background text-on-surface">
      <header className="fixed top-0 z-50 flex w-full items-center justify-between border-b border-outline-variant/10 bg-surface/60 px-margin-mobile py-4 backdrop-blur-xl md:hidden">
        <h1 className="font-headline-md text-headline-md font-semibold tracking-tight text-primary">
          AXIAL
        </h1>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-on-surface-variant">
            account_balance_wallet
          </span>
          <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" className="h-8 w-8 rounded-full" src={MOBILE_AVATAR} />
        </div>
      </header>

      <main className="w-full flex-1 overflow-y-auto pt-20 md:pt-0">
        <div className="mx-auto max-w-[1440px] space-y-8 p-margin-mobile md:p-margin-desktop">
          <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="mb-2 font-headline-lg text-headline-lg text-on-surface md:font-headline-xl md:text-headline-xl">
                Compliance Ledger
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Invisible background regulatory processes.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-outline-variant/20 bg-surface-container py-2 px-4">
              <span className="glow-success h-2 w-2 rounded-full bg-[#2DD4BF]" />
              <span className="font-label-sm text-label-sm text-on-surface">Systems Synchronized</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            <div className="glass-panel col-span-1 rounded-xl p-6 md:col-span-8">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-headline-md text-headline-md text-on-surface">BIR EIS Connect</h3>
                <span className="rounded bg-surface-container px-2 py-1 font-label-sm text-label-sm text-on-surface-variant">
                  LIVE
                </span>
              </div>
              <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="rounded-lg border border-outline-variant/10 bg-surface-container-low p-4">
                  <p className="mb-1 font-label-sm text-label-sm text-on-surface-variant">
                    Pending Transmissions
                  </p>
                  <p className="font-headline-md text-headline-md text-primary">14</p>
                  <p className="mt-1 font-label-sm text-label-sm text-[#2DD4BF]">T+3 Timeline Active</p>
                </div>
                <div className="rounded-lg border border-outline-variant/10 bg-surface-container-low p-4">
                  <p className="mb-1 font-label-sm text-label-sm text-on-surface-variant">
                    JWS Secured Payloads
                  </p>
                  <p className="font-headline-md text-headline-md text-primary">8,241</p>
                  <p className="mt-1 font-label-sm text-label-sm text-on-surface-variant">Last 30 Days</p>
                </div>
                <div className="rounded-lg border border-outline-variant/10 bg-surface-container-low p-4">
                  <p className="mb-1 font-label-sm text-label-sm text-on-surface-variant">System Status</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#2DD4BF]">check_circle</span>
                    <span className="font-body-md text-body-md text-on-surface">Synchronized</span>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-outline-variant/10 font-label-sm text-label-sm text-on-surface-variant">
                      <th className="pb-3 font-normal">Payload ID</th>
                      <th className="pb-3 font-normal">Date</th>
                      <th className="pb-3 font-normal">BIR Ref ID</th>
                      <th className="pb-3 text-right font-normal">Status</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md">
                    <tr className="border-b border-outline-variant/10">
                      <td className="py-4 font-mono text-sm text-on-surface">PLD-8829-A</td>
                      <td className="py-4 text-on-surface-variant">Oct 24, 14:30</td>
                      <td className="py-4 font-mono text-sm text-primary">BIR-2023-991A</td>
                      <td className="py-4 text-right">
                        <span className="text-sm text-[#2DD4BF]">Synchronized</span>
                      </td>
                    </tr>
                    <tr className="border-b border-outline-variant/10">
                      <td className="py-4 font-mono text-sm text-on-surface">PLD-8830-B</td>
                      <td className="py-4 text-on-surface-variant">Oct 24, 15:45</td>
                      <td className="py-4 font-mono text-sm text-on-surface-variant">Pending...</td>
                      <td className="py-4 text-right">
                        <span className="text-sm text-[#E2E8F0]">Bridging</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 font-mono text-sm text-on-surface">PLD-8831-C</td>
                      <td className="py-4 text-on-surface-variant">Oct 24, 16:10</td>
                      <td className="py-4 font-mono text-sm text-on-surface-variant">Pending...</td>
                      <td className="py-4 text-right">
                        <span className="text-sm text-[#E2E8F0]">Bridging</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-panel col-span-1 flex flex-col rounded-xl p-6 md:col-span-4">
              <h3 className="mb-6 font-headline-md text-headline-md text-on-surface">Filing Milestones</h3>
              <div className="flex-1 space-y-6">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="glow-success mt-1 h-3 w-3 rounded-full bg-[#2DD4BF]" />
                    <div className="my-1 h-full w-px bg-outline-variant/20" />
                  </div>
                  <div className="pb-6">
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Oct 25</p>
                    <p className="mt-1 font-body-md text-body-md text-on-surface">VAT Remittance (2550Q)</p>
                    <p className="mt-1 font-label-sm text-label-sm text-[#2DD4BF]">Auto-filed</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="mt-1 h-3 w-3 rounded-full bg-outline-variant" />
                    <div className="my-1 h-full w-px bg-outline-variant/20" />
                  </div>
                  <div className="pb-6">
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Oct 30</p>
                    <p className="mt-1 font-body-md text-body-md text-on-surface">Statutory Contributions</p>
                    <p className="mt-1 font-label-sm text-label-sm text-on-surface-variant">
                      Scheduled Bridging
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="mt-1 h-3 w-3 rounded-full bg-outline-variant" />
                  </div>
                  <div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Nov 05</p>
                    <p className="mt-1 font-body-md text-body-md text-on-surface">Withholding Tax (1601-C)</p>
                    <p className="mt-1 font-label-sm text-label-sm text-on-surface-variant">
                      Pending Computation
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel col-span-1 rounded-xl p-6 md:col-span-12">
              <div className="mb-8 flex items-center justify-between">
                <h3 className="font-headline-md text-headline-md text-on-surface">Statutory Splitter</h3>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">sync</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Auto-slicing Active
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-8 md:flex-row">
                <div className="relative w-full rounded-lg border border-outline-variant/20 bg-surface-container-low p-6 text-center md:w-1/3">
                  <p className="mb-2 font-label-sm text-label-sm text-on-surface-variant">Gross Payroll Pool</p>
                  <p className="font-headline-lg text-headline-lg text-primary">₱ 1,250,000.00</p>
                  <div className="absolute top-1/2 -right-4 hidden -translate-y-1/2 transform md:block">
                    <span className="material-symbols-outlined text-outline-variant">arrow_forward</span>
                  </div>
                </div>
                <div className="relative hidden h-32 w-16 flex-col justify-between md:flex">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-px w-full bg-outline-variant/30" />
                  </div>
                </div>
                <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3 md:w-2/3">
                  {[
                    { label: "SSS Wallet", icon: "account_balance", amt: "₱ 142,500.00", w: "11.4%" },
                    { label: "PhilHealth", icon: "health_and_safety", amt: "₱ 56,250.00", w: "4.5%" },
                    { label: "Pag-IBIG", icon: "home", amt: "₱ 25,000.00", w: "2.0%" },
                  ].map((w) => (
                    <div
                      key={w.label}
                      className="rounded-lg border border-outline-variant/10 bg-surface-container p-4"
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <p className="font-label-sm text-label-sm text-on-surface-variant">{w.label}</p>
                        <span className="material-symbols-outlined text-sm text-[#2DD4BF]">{w.icon}</span>
                      </div>
                      <p className="font-headline-md text-headline-md text-on-surface">{w.amt}</p>
                      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-surface-variant">
                        <div className="h-full bg-[#2DD4BF]" style={{ width: w.w }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
