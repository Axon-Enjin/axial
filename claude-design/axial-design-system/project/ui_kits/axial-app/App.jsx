// App.jsx — entry. Routes between four views via local state (no real router).

const TITLES = {
  overview:   { title: 'Overview',                 subtitle: null },
  liquidity:  { title: 'Liquidity Engine',         subtitle: 'Tokenize B2B receivables and execute atomic swaps on Stellar.' },
  compliance: { title: 'Compliance Ledger',        subtitle: null },
  settings:   { title: 'Architectural Settings',   subtitle: null },
};

function App() {
  const [route, setRoute] = React.useState('overview');
  const [wallet, setWallet] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  function handleAction(kind, payload) {
    const messages = {
      'unlock':         'Capital unlock flow opened — choose a receivable to tokenize.',
      'transfer':       'Transfer composer opened.',
      'browse-files':   'File picker opened. Drop PDF or XML invoices to tokenize.',
      'swap-executed':  `Atomic swap executed on ${payload}. USDC settling on Stellar.`,
    };
    if (messages[kind]) {
      setToast(messages[kind]);
      setTimeout(() => setToast(null), 3200);
    }
  }

  const meta = TITLES[route];

  return (
    <div className="layout" data-screen-label={`Axial · ${meta.title}`}>
      <Sidebar route={route} onRoute={setRoute} onNewTx={() => handleAction('unlock')} />
      <div className="main">
        <TopBar
          title={meta.title}
          subtitle={meta.subtitle}
          walletConnected={wallet}
          onWalletToggle={() => setWallet((w) => !w)}
        />
        {route === 'overview'   && <OverviewView   onAction={handleAction} />}
        {route === 'liquidity'  && <LiquidityView  onAction={handleAction} />}
        {route === 'compliance' && <ComplianceView />}
        {route === 'settings'   && <SettingsView />}
      </div>

      {/* Toast — silent success, calm placement */}
      {toast && (
        <div style={{
          position: 'fixed', right: 28, bottom: 28, zIndex: 200,
          background: 'rgba(20,26,36,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(45,212,191,0.30)', borderRadius: 12,
          padding: '14px 18px', maxWidth: 380,
          boxShadow: '0 12px 40px rgba(0,0,0,0.45), 0 0 15px rgba(45,212,191,0.18)',
          font: '500 13px/1.5 var(--font-sans)', color: 'var(--color-on-surface)',
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <span className="material-symbols-outlined" style={{ color: '#2DD4BF', fontSize: 18, fontVariationSettings: "'FILL' 1, 'wght' 400" }}>check_circle</span>
          <div>{toast}</div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
