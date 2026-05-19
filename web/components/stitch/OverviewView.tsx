const AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA18PWziZ615FiFTtseEHFp4rXTTriWGOzLCOf99AjwHTMVNO-iBBpS3DPqQ5KuznO5oh0HsVTeiowdAJYU6mvtL2J8P2OZEtETFrs4w0RgjP5JyHH5P8Jafb6tJhPJ0JeHKLC4YPvL1VgOSR8RuXuq65smT9eck101PKLsuOKmdDaBxQn4vm36lGtK6mA2OzrxbCWb85d2iVo6GnJdmYo2zEV43SoWihRaRYxS4639foA9km7fjru2wDGxZZHXN3PbgpnlxTSWZ4Q";

const AVATAR_MOBILE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBGCtS0U1wt4YFPhjFDOilqNQGoGUh-3JaQVteMya9nfFHplpaKQFQFFuICcCOO3o8ITDuxkqMGktnDd8Y9MO5FPiUYcD_BfeUrv07XzjuTDRhvSOHaAgvJ8EV8O-P9fQaf91w8IqOuF6nPjHNqidB4wTq-7IGgBPDiX92ti0YLO62OzO6tmGPypUKjned9Tej9DAT977uDfmlT6rqhs3qQiIJO_XY_gOe0CuLtNPUoaoK5IvVKqViJ3ZHkOAeXLe1QlZ5AmDgwpCI";

export function OverviewView() {
  return (
    <>
      <header className="sticky top-0 z-30 flex w-full items-center justify-between border-b border-outline-variant/10 bg-surface/60 px-margin-mobile py-4 backdrop-blur-xl md:hidden">
        <div className="font-headline-md text-headline-md font-semibold tracking-tight text-primary">
          AXIAL
        </div>
        <div className="flex items-center gap-4 text-on-surface-variant">
          <button
            type="button"
            className="transition-transform duration-200 hover:text-primary active:scale-95"
          >
            <span className="material-symbols-outlined">account_balance_wallet</span>
          </button>
          <button
            type="button"
            className="relative transition-transform duration-200 hover:text-primary active:scale-95"
          >
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary shadow-[0_0_5px_rgba(190,198,224,0.5)]" />
          </button>
          <div className="ml-2 h-8 w-8 overflow-hidden rounded-full border border-outline-variant/20 bg-surface-variant">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" className="h-full w-full object-cover" src={AVATAR_MOBILE} />
          </div>
        </div>
      </header>

      <header className="sticky top-0 z-20 hidden w-full items-center justify-between bg-surface-container-lowest/80 px-margin-desktop py-6 backdrop-blur-md md:flex">
        <h2 className="font-headline-lg text-headline-lg tracking-tight text-on-surface">
          Overview
        </h2>
        <div className="flex items-center gap-6 text-on-surface-variant">
          <button
            type="button"
            className="flex items-center gap-2 font-label-md text-label-md transition-colors duration-200 hover:text-primary active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">
              account_balance_wallet
            </span>
            Wallet Connect
          </button>
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/10 bg-surface-container transition-colors hover:bg-surface-variant/50"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(190,198,224,0.6)]" />
          </button>
          <div className="h-10 w-10 cursor-pointer overflow-hidden rounded-full border border-outline-variant/20 bg-surface-variant shadow-sm transition-colors hover:border-primary/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" className="h-full w-full object-cover" src={AVATAR} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-container-max flex-1 px-margin-mobile py-6 md:px-margin-desktop md:py-8">
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-12">
          <div className="relative col-span-1 flex min-h-[320px] flex-col justify-between overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container/40 p-8 backdrop-blur-xl md:col-span-8">
            <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-[80px]" />
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <div className="mb-2 flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">
                    account_balance
                  </span>
                  <h3 className="font-label-md text-label-md uppercase tracking-wider">
                    Available Liquidity
                  </h3>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-headline-xl text-headline-xl tracking-tight text-on-surface">
                    ₱24,500,000
                  </span>
                  <span className="font-body-lg text-body-lg text-on-surface-variant">
                    .00
                  </span>
                </div>
                <p className="mt-2 flex items-center gap-1 font-body-md text-body-md text-primary">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  +4.2% vs last 30 days
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-outline-variant/20 bg-surface-variant/50 px-3 py-1.5">
                <div className="h-2 w-2 rounded-full bg-[#2DD4BF] shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
                <span className="font-label-sm text-label-sm text-on-surface">
                  Network Active
                </span>
              </div>
            </div>
            <div className="relative z-10 mt-12 flex gap-4">
              <button
                type="button"
                className="rounded-lg bg-primary px-8 py-3 font-label-md text-label-md font-semibold text-on-primary shadow-[0_0_20px_rgba(190,198,224,0.15)] transition-opacity hover:opacity-90 active:scale-95"
              >
                Unlock Capital
              </button>
              <button
                type="button"
                className="active:scale-95 flex items-center gap-2 rounded-lg border border-outline-variant/20 px-8 py-3 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-variant/20"
              >
                <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                Transfer
              </button>
            </div>
          </div>

          <div className="col-span-1 flex h-full flex-col rounded-2xl border border-outline-variant/10 bg-surface-container/40 p-6 backdrop-blur-xl md:col-span-4">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">policy</span>
                <h3 className="font-label-md text-label-md uppercase tracking-wider">
                  Regulatory Pulse
                </h3>
              </div>
              <span className="material-symbols-outlined cursor-pointer text-outline-variant transition-colors hover:text-on-surface">
                more_horiz
              </span>
            </div>
            <div className="flex flex-1 flex-col justify-center gap-5">
              <div className="flex items-start gap-4 rounded-xl border border-outline-variant/5 bg-surface-container-low p-4">
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full border border-[#2DD4BF]/30 bg-surface shadow-[0_0_15px_rgba(45,212,191,0.15)]">
                  <span className="material-symbols-outlined text-[20px] text-[#2DD4BF]">
                    sync_saved_locally
                  </span>
                </div>
                <div>
                  <h4 className="mb-1 font-body-md text-body-md font-medium text-on-surface">
                    BIR EIS Sync
                  </h4>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    T+3 Settlement Verified
                  </p>
                  <p className="mt-2 flex items-center gap-1 font-label-sm text-label-sm text-[#2DD4BF]">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>{" "}
                    Perfect Compliance
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-xl border border-outline-variant/5 bg-surface-container-low p-4">
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full border border-[#2DD4BF]/30 bg-surface shadow-[0_0_15px_rgba(45,212,191,0.15)]">
                  <span className="material-symbols-outlined text-[20px] text-[#2DD4BF]">
                    call_split
                  </span>
                </div>
                <div>
                  <h4 className="mb-1 font-body-md text-body-md font-medium text-on-surface">
                    Statutory Splitting
                  </h4>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    Automated VAT/WHT
                  </p>
                  <p className="mt-2 flex items-center gap-1 font-label-sm text-label-sm text-[#2DD4BF]">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>{" "}
                    12 Active Rules
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-1 flex min-h-[380px] flex-col rounded-2xl border border-outline-variant/10 bg-surface-container/40 p-6 backdrop-blur-xl md:col-span-7">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">monitoring</span>
                <h3 className="font-label-md text-label-md uppercase tracking-wider">
                  Operational Runway
                </h3>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-md border border-outline-variant/20 bg-surface-variant px-3 py-1 font-label-sm text-label-sm text-on-surface"
                >
                  30D
                </button>
                <button
                  type="button"
                  className="rounded-md px-3 py-1 font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface"
                >
                  90D
                </button>
              </div>
            </div>
            <div className="relative flex flex-1 items-end justify-between border-b border-outline-variant/10 px-2 pb-6">
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                <div className="h-0 w-full border-t border-outline-variant/5" />
                <div className="h-0 w-full border-t border-outline-variant/5" />
                <div className="h-0 w-full border-t border-outline-variant/5" />
                <div className="h-0 w-full border-t border-outline-variant/5" />
              </div>
              {[
                { h: "30%", bg: "bg-surface-variant/40", line: "bg-primary/20" },
                { h: "45%", bg: "bg-surface-variant/40", line: "bg-primary/30" },
                { h: "25%", bg: "bg-surface-variant/50", line: "bg-primary/30" },
                {
                  h: "60%",
                  bg: "border border-primary/20 border-b-0 bg-primary/20 shadow-[0_-5px_15px_rgba(190,198,224,0.05)]",
                  line: "bg-primary",
                },
                { h: "50%", bg: "bg-surface-variant/40", line: "bg-primary/40" },
                { h: "80%", bg: "bg-surface-variant/30", line: "bg-primary/50" },
                { h: "65%", bg: "bg-surface-variant/20", line: "bg-primary/40" },
              ].map((bar, i) => (
                <div
                  key={i}
                  className={`relative w-[8%] rounded-t-sm ${bar.bg}`}
                  style={{ height: bar.h }}
                >
                  <div
                    className={`absolute top-0 left-0 h-[2px] w-full ${bar.line}`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between px-2 font-label-sm text-label-sm text-outline">
              <span>Oct 01</span>
              <span>Oct 05</span>
              <span>Oct 10</span>
              <span>Oct 15</span>
              <span>Oct 20</span>
              <span>Oct 25</span>
              <span>Oct 30</span>
            </div>
          </div>

          <div className="col-span-1 flex h-full flex-col rounded-2xl border border-outline-variant/10 bg-surface-container/40 p-6 backdrop-blur-xl md:col-span-5">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">history</span>
                <h3 className="font-label-md text-label-md uppercase tracking-wider">
                  Recent Actions
                </h3>
              </div>
              <button
                type="button"
                className="font-label-sm text-label-sm text-primary hover:underline"
              >
                View All
              </button>
            </div>
            <div className="flex flex-1 flex-col">
              {[
                {
                  icon: "receipt_long",
                  title: "Invoice #402 tokenized",
                  sub: "Supplier A • ₱150,000",
                  time: "2m ago",
                  iconClass: "text-on-surface-variant group-hover:text-primary",
                },
                {
                  icon: "cloud_done",
                  title: "BIR Payload accepted",
                  sub: "Automated Sync",
                  time: "15m ago",
                  iconClass: "text-[#2DD4BF]",
                },
                {
                  icon: "account_balance",
                  title: "Yield distributed",
                  sub: "Treasury Vault A",
                  time: "1h ago",
                  iconClass: "text-on-surface-variant group-hover:text-primary",
                },
                {
                  icon: "security",
                  title: "Smart Contract Audited",
                  sub: "System Routine",
                  time: "3h ago",
                  iconClass: "text-on-surface-variant group-hover:text-primary",
                },
              ].map((row, i) => (
                <div
                  key={row.title}
                  className={`group flex items-center justify-between py-4 ${i < 3 ? "border-b border-outline-variant/10" : "mt-auto"}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded border border-outline-variant/10 bg-surface transition-colors ${row.iconClass}`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {row.icon}
                      </span>
                    </div>
                    <div>
                      <p className="leading-tight font-body-md text-body-md text-on-surface">
                        {row.title}
                      </p>
                      <p className="mt-0.5 font-label-sm text-label-sm text-on-surface-variant">
                        {row.sub}
                      </p>
                    </div>
                  </div>
                  <span className="font-label-sm text-label-sm text-outline">{row.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
