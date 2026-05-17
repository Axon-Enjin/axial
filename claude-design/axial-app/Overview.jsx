// Overview.jsx — Command Center
// Recreates command-center.png: liquidity hero, regulatory pulse, operational runway, recent actions.

function OverviewView({ onAction }) {
  const [range, setRange] = React.useState('30D');
  const bars30 = [
    { h: 30, fill: '#2f353c33' },
    { h: 48, fill: '#2f353c33' },
    { h: 28, fill: '#2f353c40' },
    { h: 62, fill: 'rgba(190,198,224,0.20)', active: true },
    { h: 52, fill: '#2f353c33' },
    { h: 82, fill: '#2f353c26' },
    { h: 68, fill: '#2f353c1a' },
  ];
  const bars90 = [...bars30, ...bars30.slice(0, 4).reverse()];
  const bars = range === '30D' ? bars30 : bars90;

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '28px 64px 64px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 32 }}>

        {/* Liquidity hero — col-span-8 */}
        <div style={{ gridColumn: 'span 8' }}>
          <Card padding={32}>
            <div style={{ position: 'absolute', top: -96, right: -96, width: 256, height: 256, borderRadius: '50%', background: 'rgba(190,198,224,0.10)', filter: 'blur(80px)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.textMuted, marginBottom: 6 }}>
                  <Icon name="account_balance" size={18} />
                  <span style={{ font: '600 12px/1.2 var(--font-sans)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Available Liquidity</span>
                </div>
                <div className="num" style={{ marginTop: 18, display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ font: '600 48px/1.1 var(--font-sans)', letterSpacing: '-0.02em', color: T.text }}>₱24,500,000</span>
                  <span style={{ font: '400 18px/1.6 var(--font-sans)', color: T.textMuted }}>.00</span>
                </div>
                <p style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, font: '400 14px/1.5 var(--font-sans)', color: T.primary }}>
                  <Icon name="trending_up" size={16} /> +4.2% vs last 30 days
                </p>
              </div>
              <StatusBadge kind="active">Network Active</StatusBadge>
            </div>

            <div style={{ position: 'relative', marginTop: 48, display: 'flex', gap: 14 }}>
              <Button variant="primary" size="lg" onClick={() => onAction && onAction('unlock')}>Unlock Capital</Button>
              <Button variant="secondary" size="lg" icon="swap_horiz" onClick={() => onAction && onAction('transfer')}>Transfer</Button>
            </div>
          </Card>
        </div>

        {/* Regulatory pulse — col-span-4 */}
        <div style={{ gridColumn: 'span 4' }}>
          <Card padding={24} style={{ height: '100%' }}>
            <CardHeader icon="policy" label="Regulatory Pulse" action={<Icon name="more_horiz" size={20} color={T.outlineV} />} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <PulseRow icon="cloud_done" title="BIR EIS Sync" subtitle="T+3 Settlement Verified" status="Perfect Compliance" />
              <PulseRow icon="call_split" title="Statutory Splitting" subtitle="Automated VAT/WHT" status="12 Active Rules" />
            </div>
          </Card>
        </div>

        {/* Operational runway chart — col-span-7 */}
        <div style={{ gridColumn: 'span 7' }}>
          <Card padding={24} style={{ minHeight: 380, display: 'flex', flexDirection: 'column' }}>
            <CardHeader
              icon="monitoring"
              label="Operational Runway"
              action={
                <div style={{ display: 'flex', gap: 6 }}>
                  {['30D', '90D'].map((r) => (
                    <button key={r} onClick={() => setRange(r)} style={{
                      background: range === r ? T.surfHigh : 'transparent',
                      color: range === r ? T.text : T.textMuted,
                      border: range === r ? '1px solid rgba(69,70,77,0.4)' : '1px solid transparent',
                      borderRadius: 6, padding: '5px 12px', cursor: 'pointer',
                      font: '600 11px/1.2 var(--font-sans)', letterSpacing: '0.05em',
                    }}>{r}</button>
                  ))}
                </div>
              }
            />
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 8px 16px', borderBottom: '1px solid rgba(69,70,77,0.20)', position: 'relative', gap: 8 }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
                {[0,1,2,3].map((i) => <div key={i} style={{ borderTop: '1px solid rgba(69,70,77,0.10)' }} />)}
              </div>
              {bars.map((b, i) => (
                <div key={i} style={{
                  flex: 1, maxWidth: 60,
                  height: `${b.h}%`,
                  background: b.fill,
                  borderRadius: '2px 2px 0 0',
                  position: 'relative',
                  ...(b.active ? { border: '1px solid rgba(190,198,224,0.20)', borderBottom: 'none', boxShadow: '0 -5px 15px rgba(190,198,224,0.05)' } : {}),
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: b.active ? T.primary : 'rgba(190,198,224,0.30)' }} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', padding: '0 8px', font: '600 11px/1.2 var(--font-sans)', letterSpacing: '0.05em', color: T.outline }}>
              {range === '30D'
                ? ['Oct 01','Oct 05','Oct 10','Oct 15','Oct 20','Oct 25','Oct 30'].map((d) => <span key={d}>{d}</span>)
                : ['Aug','Sep 10','Sep 20','Sep 30','Oct 10','Oct 20','Oct 30','Nov','Nov 10','Nov 20','Nov 30'].map((d) => <span key={d}>{d}</span>)
              }
            </div>
          </Card>
        </div>

        {/* Recent actions — col-span-5 */}
        <div style={{ gridColumn: 'span 5' }}>
          <Card padding={24} style={{ height: '100%' }}>
            <CardHeader icon="history" label="Recent Actions" action={
              <button style={{ background: 'transparent', border: 'none', color: T.primary, font: '500 13px/1.4 var(--font-sans)', cursor: 'pointer' }}>View All</button>
            } />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                { icon: 'receipt_long', title: 'Invoice #402 tokenized', sub: 'Supplier A · ₱150,000', time: '2m ago' },
                { icon: 'cloud_done',   title: 'BIR Payload accepted',   sub: 'Automated Sync',       time: '15m ago', accent: true },
                { icon: 'account_balance', title: 'Yield distributed',    sub: 'Treasury Vault A',     time: '1h ago' },
                { icon: 'security',     title: 'Smart Contract Audited', sub: 'System Routine',       time: '3h ago' },
              ].map((row, i, arr) => (
                <div key={row.title} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 0',
                  borderBottom: i < arr.length - 1 ? '1px solid rgba(69,70,77,0.15)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 6,
                      background: T.surf, border: '1px solid rgba(69,70,77,0.20)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: row.accent ? T.active : T.textMuted,
                    }}>
                      <Icon name={row.icon} size={16} />
                    </div>
                    <div>
                      <div style={{ font: '400 14px/1.3 var(--font-sans)', color: T.text }}>{row.title}</div>
                      <div style={{ font: '400 12px/1.4 var(--font-sans)', color: T.textMuted, marginTop: 2 }}>{row.sub}</div>
                    </div>
                  </div>
                  <span style={{ font: '600 11px/1.2 var(--font-sans)', letterSpacing: '0.05em', color: T.outline }}>{row.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PulseRow({ icon, title, subtitle, status }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: T.surfLow, border: '1px solid rgba(69,70,77,0.10)', borderRadius: 12, padding: 14 }}>
      <div style={{
        marginTop: 4, width: 40, height: 40, borderRadius: 9999,
        background: T.bg, border: '1px solid rgba(45,212,191,0.30)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 15px rgba(45,212,191,0.15)',
      }}>
        <Icon name={icon} size={20} color={T.active} />
      </div>
      <div>
        <h4 style={{ font: '500 14px/1.4 var(--font-sans)', color: T.text, margin: 0 }}>{title}</h4>
        <p style={{ font: '600 11px/1.2 var(--font-sans)', letterSpacing: '0.05em', color: T.textMuted, textTransform: 'uppercase', margin: '4px 0 0' }}>{subtitle}</p>
        <p style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, font: '500 12px/1.2 var(--font-sans)', color: T.active }}>
          <Icon name="check_circle" size={14} /> {status}
        </p>
      </div>
    </div>
  );
}

window.OverviewView = OverviewView;
