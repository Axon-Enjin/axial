// Compliance.jsx — Compliance Ledger
// Recreates compliance-ledger.png: BIR EIS Connect, filing milestones, statutory splitter.

function ComplianceView() {
  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '28px 64px 64px', display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* Subhead row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <p style={{ font: '400 16px/1.6 var(--font-sans)', color: T.textMuted, margin: 0 }}>
          Invisible background regulatory processes.
        </p>
        <StatusBadge kind="active">Systems Synchronized</StatusBadge>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 32 }}>
        {/* BIR EIS Connect */}
        <div style={{ gridColumn: 'span 8' }}>
          <Card padding={24}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <h3 style={{ font: '500 22px/1.3 var(--font-sans)', color: T.text, margin: 0 }}>BIR EIS Connect</h3>
              <span style={{ font: '600 10px/1.2 var(--font-sans)', letterSpacing: '0.18em', textTransform: 'uppercase', color: T.active }}>LIVE</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
              <StatBlock label="Pending Transmissions" value="14" badge="T+3 Timeline Active" badgeColor={T.active} />
              <StatBlock label="JWS Secured Payloads" value="8,241" badge="Last 30 Days" />
              <div style={{
                background: T.glassLow, borderTop: `1px solid ${T.glassBorder}`, borderRadius: 8, padding: 14,
              }}>
                <div style={{ font: '600 11px/1.2 var(--font-sans)', letterSpacing: '0.05em', textTransform: 'uppercase', color: T.textMuted, marginBottom: 6 }}>System Status</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
                  <Icon name="check_circle" size={20} color={T.active} fill />
                  <span style={{ font: '500 18px/1.2 var(--font-sans)', color: T.text }}>Synchronized</span>
                </div>
              </div>
            </div>

            {/* Payload mini-ledger */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Payload ID','Date','BIR Ref ID','Status'].map((h, i) => (
                    <th key={h} style={{
                      padding: '10px 0', textAlign: i === 3 ? 'right' : 'left',
                      font: '600 10px/1.2 var(--font-sans)', letterSpacing: '0.08em', textTransform: 'uppercase',
                      color: T.textMuted, borderBottom: '1px solid rgba(69,70,77,0.20)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 'PLD-8829-A', date: 'Oct 24, 14:30', ref: 'BIR-2026-991A', status: 'Synchronized' },
                  { id: 'PLD-8830-B', date: 'Oct 24, 15:45', ref: 'Pending…',     status: 'Bridging' },
                  { id: 'PLD-8831-C', date: 'Oct 24, 16:10', ref: 'Pending…',     status: 'Bridging' },
                ].map((r, i, arr) => (
                  <tr key={r.id} style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(69,70,77,0.10)' : 'none' }}>
                    <td style={{ padding: '14px 0', font: '500 13px/1.4 var(--font-mono)', color: T.text }}>{r.id}</td>
                    <td style={{ padding: '14px 0', font: '400 13px/1.4 var(--font-sans)', color: T.textMuted }}>{r.date}</td>
                    <td style={{ padding: '14px 0', font: '400 13px/1.4 var(--font-mono)', color: T.textMuted }}>{r.ref}</td>
                    <td style={{ padding: '14px 0', textAlign: 'right', font: '500 13px/1.4 var(--font-sans)', color: r.status === 'Synchronized' ? T.active : T.textMuted }}>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Filing milestones */}
        <div style={{ gridColumn: 'span 4' }}>
          <Card padding={24} style={{ height: '100%' }}>
            <h3 style={{ font: '500 22px/1.3 var(--font-sans)', color: T.text, margin: '0 0 24px' }}>Filing Milestones</h3>
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 22 }}>
              <div style={{ position: 'absolute', left: 5, top: 12, bottom: 12, width: 1, background: 'rgba(69,70,77,0.40)' }} />
              <Milestone date="Oct 25" title="VAT Remittance (2550Q)" sub="Auto-filed" status="active" />
              <Milestone date="Oct 30" title="Statutory Contributions" sub="Scheduled Bridging" status="upcoming" />
              <Milestone date="Nov 05" title="Withholding Tax (1601-C)" sub="Pending Computation" status="upcoming" />
            </div>
          </Card>
        </div>
      </div>

      {/* Statutory splitter */}
      <Card padding={24}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <h3 style={{ font: '500 22px/1.3 var(--font-sans)', color: T.text, margin: 0 }}>Statutory Splitter</h3>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: '500 13px/1.4 var(--font-sans)', color: T.textMuted }}>
            <Icon name="autorenew" size={16} /> Auto-slicing Active
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 3fr', gap: 18, alignItems: 'center' }}>
          {/* Gross pool */}
          <div style={{
            background: T.surfLow, border: '1px solid rgba(69,70,77,0.30)', borderRadius: 12, padding: 24, textAlign: 'center',
          }}>
            <div style={{ font: '600 11px/1.2 var(--font-sans)', letterSpacing: '0.05em', textTransform: 'uppercase', color: T.textMuted, marginBottom: 14 }}>Gross Payroll Pool</div>
            <div className="num" style={{ font: '600 28px/1.1 var(--font-sans)', letterSpacing: '-0.01em', color: T.text }}>
              ₱1,250,000<span style={{ font: '400 14px/1 var(--font-sans)', color: T.textMuted }}>.00</span>
            </div>
          </div>

          <Icon name="arrow_forward" size={24} color={T.outline} />

          {/* Split */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            <SplitTile icon="account_balance" name="SSS Wallet"   amount="142,500.00" pct={0.65} />
            <SplitTile icon="security"        name="PhilHealth"   amount="56,250.00"  pct={0.35} />
            <SplitTile icon="home"            name="Pag-IBIG"     amount="25,000.00"  pct={0.20} />
          </div>
        </div>
      </Card>
    </div>
  );
}

function StatBlock({ label, value, badge, badgeColor }) {
  return (
    <div style={{
      background: T.glassLow, borderTop: `1px solid ${T.glassBorder}`, borderRadius: 8, padding: 14,
    }}>
      <div style={{ font: '600 11px/1.2 var(--font-sans)', letterSpacing: '0.05em', textTransform: 'uppercase', color: T.textMuted, marginBottom: 6 }}>{label}</div>
      <div className="num" style={{ font: '600 28px/1.1 var(--font-sans)', letterSpacing: '-0.01em', color: T.text, marginTop: 10 }}>{value}</div>
      {badge && (
        <div style={{ font: '500 12px/1.4 var(--font-sans)', color: badgeColor || T.textMuted, marginTop: 6 }}>{badge}</div>
      )}
    </div>
  );
}

function Milestone({ date, title, sub, status }) {
  const dotColor = status === 'active' ? T.active : T.outline;
  return (
    <div style={{ display: 'flex', gap: 18, position: 'relative', zIndex: 1 }}>
      <div style={{
        width: 11, height: 11, borderRadius: 9999, marginTop: 6, flexShrink: 0,
        background: dotColor, boxShadow: status === 'active' ? `0 0 10px ${dotColor}` : 'none',
      }} />
      <div>
        <div style={{ font: '600 11px/1.2 var(--font-sans)', letterSpacing: '0.05em', textTransform: 'uppercase', color: T.textMuted }}>{date}</div>
        <div style={{ font: '500 14px/1.4 var(--font-sans)', color: T.text, marginTop: 4 }}>{title}</div>
        <div style={{ font: '400 13px/1.4 var(--font-sans)', color: status === 'active' ? T.active : T.textMuted, marginTop: 3 }}>{sub}</div>
      </div>
    </div>
  );
}

function SplitTile({ icon, name, amount, pct }) {
  return (
    <div style={{ background: T.surfLow, border: '1px solid rgba(69,70,77,0.20)', borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ font: '500 13px/1.4 var(--font-sans)', color: T.text }}>{name}</span>
        <Icon name={icon} size={18} color={T.active} />
      </div>
      <div className="num" style={{ font: '600 22px/1.1 var(--font-sans)', letterSpacing: '-0.01em', color: T.text }}>
        <span style={{ color: T.textMuted, marginRight: 4, fontWeight: 500 }}>₱</span>{amount}
      </div>
      <div style={{ marginTop: 12, height: 3, background: T.surfHigh, borderRadius: 9999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct * 100}%`, background: T.active }} />
      </div>
    </div>
  );
}

window.ComplianceView = ComplianceView;
