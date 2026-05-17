// Liquidity.jsx — Liquidity Engine
// Recreates liquidity-engine.png: invoice upload zone, tokenization pipeline, stat tiles, factoring table.

function LiquidityView({ onAction }) {
  const [invoices, setInvoices] = React.useState([
    { id: 'INV-2023-8901', party: 'Acme Logistics Corp',  terms: 'Net 60', face: 125000, immediate: 118500, status: 'minted' },
    { id: 'INV-2023-8904', party: 'Nexus Tech Solutions', terms: 'Net 90', face: 450000, immediate: null,   status: 'scanning' },
    { id: 'INV-2023-8872', party: 'Global Freight Systems', terms: 'Net 30', face: 75500,  immediate: 73200, status: 'settled' },
  ]);

  function executeSwap(id) {
    setInvoices((rows) => rows.map((r) => r.id === id ? { ...r, status: 'settled' } : r));
    onAction && onAction('swap-executed', id);
  }

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '28px 64px 64px', display: 'flex', flexDirection: 'column', gap: 32 }}>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 32 }}>
        {/* Upload zone */}
        <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <UploadZone onBrowse={() => onAction && onAction('browse-files')} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <StatTile label="Total Liquidity Pool" value="2.4M" unit="USDC" accent />
            <StatTile label="24h Swap Volume"      value="850K" unit="USDC" />
            <StatTile label="Active Smart Contracts" value="142" />
          </div>
        </div>

        {/* Tokenization pipeline */}
        <div style={{ gridColumn: 'span 4' }}>
          <Card padding={24} style={{ height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ font: '500 22px/1.3 var(--font-sans)', letterSpacing: '-0.01em', color: T.text, margin: 0 }}>Tokenization<br/>Pipeline</h3>
              <Icon name="tune" size={20} color={T.textMuted} />
            </div>
            <Pipeline />
          </Card>
        </div>
      </div>

      {/* Active Factoring */}
      <Card padding={0}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: 24, borderBottom: '1px solid rgba(69,70,77,0.15)' }}>
          <div>
            <h3 style={{ font: '500 22px/1.3 var(--font-sans)', color: T.text, margin: 0 }}>Active Factoring</h3>
            <p style={{ font: '400 14px/1.5 var(--font-sans)', color: T.textMuted, margin: '6px 0 0' }}>Pending and executed atomic swaps.</p>
          </div>
          <Button variant="ghost" icon="filter_list" style={{ color: T.primary }}>Filter</Button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Invoice ID','Counterparty','Terms','Face value','Immediate USDC','Status','Action'].map((h, i) => (
                  <th key={h} style={{
                    padding: '14px 24px',
                    textAlign: i >= 3 && i <= 4 ? 'right' : i === 5 ? 'center' : 'left',
                    font: '600 10px/1.2 var(--font-sans)', letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: T.textMuted, borderBottom: '1px solid rgba(69,70,77,0.15)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid rgba(69,70,77,0.10)' }}>
                  <td style={{ padding: '18px 24px', font: '500 13px/1.4 var(--font-mono)', color: T.text }}>{row.id}</td>
                  <td style={{ padding: '18px 24px', font: '400 14px/1.5 var(--font-sans)', color: T.textMuted }}>{row.party}</td>
                  <td style={{ padding: '18px 24px' }}>
                    <span style={{ background: T.surfHigh, padding: '4px 10px', borderRadius: 2, font: '600 11px/1.2 var(--font-sans)', letterSpacing: '0.05em', color: T.text }}>{row.terms}</span>
                  </td>
                  <td className="num" style={{ padding: '18px 24px', textAlign: 'right', font: '400 14px/1.5 var(--font-mono)', color: T.text }}>${row.face.toLocaleString()}.00</td>
                  <td className="num" style={{ padding: '18px 24px', textAlign: 'right', font: '500 14px/1.5 var(--font-mono)', color: row.immediate ? T.primary : T.textMuted }}>
                    {row.immediate ? row.immediate.toLocaleString() + '.00' : '—'}
                  </td>
                  <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                    {row.status === 'minted'   && <StatusBadge kind="minted">Minted</StatusBadge>}
                    {row.status === 'scanning' && <StatusBadge kind="scanning" icon="sync">Scanning</StatusBadge>}
                    {row.status === 'settled'  && <StatusBadge kind="settled" icon="check_circle">Settled</StatusBadge>}
                  </td>
                  <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                    {row.status === 'minted'   && <Button variant="teal" size="sm" onClick={() => executeSwap(row.id)}>Execute Atomic Swap</Button>}
                    {row.status === 'scanning' && <Button variant="surface" size="sm" disabled>Pending</Button>}
                    {row.status === 'settled'  && (
                      <button style={{ background: 'transparent', border: 'none', color: T.textMuted, font: '500 13px/1.4 var(--font-sans)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <Icon name="receipt_long" size={18} /> View TX
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function UploadZone({ onBrowse }) {
  const [hover, setHover] = React.useState(false);
  return (
    <Card padding={32}>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          border: `2px dashed ${hover ? 'rgba(190,198,224,0.5)' : 'rgba(144,144,151,0.3)'}`,
          borderRadius: 12,
          padding: '48px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center',
          transition: 'border-color 200ms ease-out',
        }}
      >
        <div style={{
          width: 80, height: 80, borderRadius: 9999,
          background: hover ? 'rgba(190,198,224,0.10)' : 'rgba(47,53,60,0.50)',
          border: `1px solid ${hover ? 'rgba(190,198,224,0.3)' : 'rgba(69,70,77,0.4)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
          transition: 'all 200ms ease-out',
        }}>
          <Icon name="upload_file" size={36} color={hover ? T.primary : T.textMuted} />
        </div>
        <h3 style={{ font: '500 22px/1.3 var(--font-sans)', letterSpacing: '-0.01em', color: T.text, margin: '0 0 8px' }}>
          Upload B2B Invoice
        </h3>
        <p style={{ font: '400 14px/1.6 var(--font-sans)', color: T.textMuted, margin: '0 0 24px', maxWidth: 420 }}>
          Drag and drop verified PDF or XML invoices into this zone to initiate the tokenization sequence.
        </p>
        <Button variant="secondary" onClick={onBrowse}>Browse Files</Button>
      </div>
    </Card>
  );
}

function Pipeline() {
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ position: 'absolute', left: 23, top: 24, bottom: 24, width: 1, background: 'rgba(144,144,151,0.20)' }} />
      <PipelineStep state="done"    icon="document_scanner" title="Invoice Verification" sub="OCR and metadata extraction complete." />
      <PipelineStep state="active"  icon="token"            title="Minting in Progress"  sub="Deploying Soroban asset representation." progress={0.66} />
      <PipelineStep state="pending" icon="balance"          title="Liquidity Matching"   sub="Awaiting token finality to open order book." />
    </div>
  );
}

function PipelineStep({ state, icon, title, sub, progress }) {
  const style = state === 'active'
    ? { bg: 'rgba(45,212,191,0.18)', border: 'rgba(45,212,191,0.5)', color: T.active, glow: '0 0 15px rgba(45,212,191,0.3)' }
    : state === 'done'
    ? { bg: T.surfHigh, border: 'rgba(144,144,151,0.3)', color: T.textMuted, glow: 'none' }
    : { bg: 'rgba(47,53,60,0.30)', border: 'rgba(144,144,151,0.15)', color: T.outline, glow: 'none' };
  return (
    <div style={{ display: 'flex', gap: 18, position: 'relative', zIndex: 1, opacity: state === 'pending' ? 0.6 : 1 }}>
      <div style={{
        width: 48, height: 48, borderRadius: 9999, flexShrink: 0,
        background: style.bg, border: `1px solid ${style.border}`, boxShadow: style.glow,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={icon} size={20} color={style.color} fill={state === 'active'} />
      </div>
      <div style={{ paddingTop: 4, flex: 1 }}>
        <p style={{ font: '500 14px/1.4 var(--font-sans)', color: state === 'active' ? T.active : T.text, margin: 0 }}>{title}</p>
        <p style={{ font: '400 13px/1.5 var(--font-sans)', color: T.textMuted, margin: '4px 0 0' }}>{sub}</p>
        {progress != null && (
          <div style={{ marginTop: 10, height: 3, background: T.surfHigh, borderRadius: 9999, overflow: 'hidden', maxWidth: 280 }}>
            <div className="axl-progress-fill" style={{ height: '100%', width: `${progress * 100}%`, borderRadius: 9999 }} />
          </div>
        )}
      </div>
    </div>
  );
}

window.LiquidityView = LiquidityView;
