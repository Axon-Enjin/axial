const SETTINGS_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDBWGpMD1h2_YeSAFGdji4v6F6NSWHDXfS7pgZldXBKyB3XpOajr-QbR3H27c3HEIq8oYzjcrdiBB8OFXZ2QeyydGkPkyGkt2ZeO1zp51eXv2ggHjOPTm2Cc71TE05gonQjfDdeNS4fMkLXJp-AmNoMYKY-9psgPEqkdPd2J6kdDNY5aLDbIh74nAoBd0YHk8PfkrMBGt7Em4JQRAzlPUWqsh9ZVpl6q-Larg8e4E-lZS8tut3b-u5usp8OiNKMUEy1Ol_Q_OwZYfk";

export function SettingsView() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-outline-variant/10 bg-surface/60 px-margin-mobile py-4 backdrop-blur-xl md:px-margin-desktop">
        <div className="flex items-center gap-4">
          <button type="button" className="text-on-surface-variant hover:text-primary md:hidden">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1 className="hidden font-headline-md text-headline-md font-semibold tracking-tight text-primary md:block">
            AXIAL
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <button type="button" className="transition-transform hover:text-primary">
            <span className="material-symbols-outlined">account_balance_wallet</span>
          </button>
          <button type="button" className="relative transition-transform hover:text-primary">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(190,198,224,0.5)]" />
          </button>
          <div className="h-8 w-8 overflow-hidden rounded-full border border-outline-variant/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" className="h-full w-full object-cover" src={SETTINGS_AVATAR} />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-margin-mobile pb-32 py-8 md:px-margin-desktop">
        <div className="mx-auto mb-10 max-w-container-max">
          <h2 className="mb-2 font-headline-lg text-headline-lg text-on-surface">Architectural Settings</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Configure autonomous systems, regulatory credentials, and API bridges.
          </p>
        </div>

        <div className="mx-auto grid max-w-container-max grid-cols-1 gap-gutter lg:grid-cols-12">
          <section className="flex flex-col rounded-xl border border-outline-variant/10 bg-surface-container-low/40 p-6 backdrop-blur-2xl lg:col-span-7">
            <div className="mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">account_balance</span>
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Government Agency Credentials
              </h3>
            </div>
            <p className="mb-6 font-body-md text-body-md text-on-surface-variant">
              Manage corporate identity and regulatory compliance IDs required for automated statutory
              parsing.
            </p>
            <div className="mt-auto space-y-6">
              <div>
                <label className="mb-1 block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  BIR Tax Identification Number (TIN)
                </label>
                <input
                  className="w-full border-b border-outline-variant/50 bg-transparent py-2 font-body-md text-body-md text-on-surface outline-none transition-colors focus:border-primary"
                  defaultValue="000-123-456-000"
                />
              </div>
              <div>
                <label className="mb-1 block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  SSS Employer ID
                </label>
                <input
                  className="w-full border-b border-outline-variant/50 bg-transparent py-2 font-body-md text-body-md text-on-surface outline-none transition-colors focus:border-primary"
                  defaultValue="03-9876543-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                    PhilHealth No.
                  </label>
                  <input
                    className="w-full border-b border-outline-variant/50 bg-transparent py-2 font-body-md text-body-md text-on-surface outline-none transition-colors focus:border-primary"
                    defaultValue="14-000000000-1"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                    HDMF (Pag-IBIG)
                  </label>
                  <input
                    className="w-full border-b border-outline-variant/50 bg-transparent py-2 font-body-md text-body-md text-on-surface outline-none transition-colors focus:border-primary"
                    defaultValue="2000-1234-5678"
                  />
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                className="rounded-lg bg-primary px-6 py-2 font-label-md text-label-md text-on-primary transition-colors hover:bg-primary-fixed"
              >
                Save Credentials
              </button>
            </div>
          </section>

          <section className="relative flex flex-col overflow-hidden rounded-xl border border-outline-variant/10 bg-surface-container-low/40 p-6 backdrop-blur-2xl lg:col-span-5">
            <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative z-10 mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
              <h3 className="font-headline-md text-headline-md text-on-surface">Stellar Wallet &amp; Liquidity</h3>
            </div>
            <div className="relative z-10 mb-6 rounded-lg border border-outline-variant/10 bg-surface-container-highest/50 p-4">
              <label className="mb-2 block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                Primary Treasury Public Key
              </label>
              <div className="flex items-center justify-between">
                <code className="break-all font-mono text-sm text-primary">GCO2...X9L4M</code>
                <button type="button" className="text-on-surface-variant hover:text-primary">
                  <span className="material-symbols-outlined text-sm">content_copy</span>
                </button>
              </div>
            </div>
            <div className="relative z-10 space-y-6">
              <div>
                <label className="mb-2 block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Default Liquidity Pool
                </label>
                <select className="w-full appearance-none rounded-lg border border-outline-variant/30 bg-surface-container py-2 px-3 font-body-md text-body-md text-on-surface outline-none focus:border-primary">
                  <option>Axial Prime Treasury (USDC)</option>
                  <option>Secondary Pool (XLM)</option>
                  <option>External Partner Node</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Lender Preference Limit
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    className="flex-1 border-b border-outline-variant/50 bg-transparent py-2 font-body-md text-body-md text-on-surface outline-none transition-colors focus:border-primary"
                    defaultValue={250000}
                  />
                  <span className="font-body-md text-on-surface-variant">USDC</span>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-4 lg:col-span-12">
            <h3 className="mb-4 font-headline-md text-headline-md text-on-surface">Automation Logic</h3>
            <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
              <div className="flex items-center justify-between rounded-xl border border-outline-variant/10 bg-surface-container-low/40 p-6 backdrop-blur-2xl">
                <div>
                  <h4 className="mb-1 font-medium font-body-lg text-on-surface">Auto-Factoring</h4>
                  <p className="max-w-sm text-sm font-body-md text-on-surface-variant">
                    Automatically evaluate and route approved invoices to the designated liquidity pool
                    without manual intervention.
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-6 w-11 cursor-pointer rounded-full accent-primary"
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-outline-variant/10 bg-surface-container-low/40 p-6 backdrop-blur-2xl">
                <div>
                  <h4 className="mb-1 font-medium font-body-lg text-on-surface">Auto-Split Statutory</h4>
                  <p className="max-w-sm text-sm font-body-md text-on-surface-variant">
                    Systematically deduct and route government agency liabilities (BIR, SSS) to reserve
                    wallets prior to payroll disbursement.
                  </p>
                </div>
                <input type="checkbox" className="h-6 w-11 cursor-pointer rounded-full accent-primary" />
              </div>
            </div>
          </section>

          <section className="mt-4 flex flex-col overflow-hidden rounded-xl border border-outline-variant/10 bg-surface-container-low/40 backdrop-blur-2xl lg:col-span-12">
            <div className="flex items-center justify-between border-b border-outline-variant/10 p-6">
              <div>
                <h3 className="mb-1 font-headline-md text-headline-md text-on-surface">System Audit Logs</h3>
                <p className="text-sm font-body-md text-on-surface-variant">
                  Immutable history of structural and regulatory modifications.
                </p>
              </div>
              <button
                type="button"
                className="flex items-center gap-1 font-label-md text-label-md text-primary transition-colors hover:text-primary-fixed"
              >
                Export CSV <span className="material-symbols-outlined text-sm">download</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-outline-variant/10">
                    {[
                      "Timestamp (UTC)",
                      "Event Type",
                      "Actor / Node",
                      "Hash / Reference",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-4 font-label-sm text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md">
                  {[
                    [
                      "2023-10-27 14:32:01",
                      "Config Update: Auto-Factoring Enabled",
                      "Admin_01 (System)",
                      "0x8f...2a1b",
                    ],
                    [
                      "2023-10-26 09:15:44",
                      "Credentials Synced: BIR TIN",
                      "API_Bridge_Gov",
                      "0x3c...9f4e",
                    ],
                    [
                      "2023-10-25 18:00:00",
                      "Liquidity Route Modified",
                      "System (Auto-Balancer)",
                      "0x1a...7d2c",
                    ],
                  ].map((row) => (
                    <tr
                      key={row[0]}
                      className="border-b border-outline-variant/5 transition-colors hover:bg-surface-variant/10"
                    >
                      <td className="px-6 py-4 text-on-surface">{row[0]}</td>
                      <td className="px-6 py-4 text-on-surface">{row[1]}</td>
                      <td className="px-6 py-4 text-on-surface-variant">{row[2]}</td>
                      <td className="px-6 py-4 font-mono text-sm text-primary">{row[3]}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1 text-primary">
                          <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(190,198,224,0.5)]" />
                          Verified
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
