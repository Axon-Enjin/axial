// Settings.jsx — Architectural Settings
// Recreates architectural-settings.png: Government Agency Credentials, Stellar Wallet, Automation Logic.

function SettingsView() {
  const [creds, setCreds] = React.useState({
    tin:    '000-123-456-000',
    sss:    '03-9876543-2',
    ph:     '14-000000000-1',
    hdmf:   '2000-1234-5678',
  });
  const [auto, setAuto] = React.useState({
    factoring: true,
    statutory: false,
  });

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '28px 64px 64px', display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <p style={{ font: '400 16px/1.6 var(--font-sans)', color: T.textMuted, margin: 0 }}>
          Configure autonomous systems, regulatory credentials, and API bridges.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 32 }}>
        {/* Government Agency Credentials */}
        <div style={{ gridColumn: 'span 8' }}>
          <Card padding={24}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Icon name="account_balance" size={22} color={T.text} />
              <h3 style={{ font: '500 22px/1.3 var(--font-sans)', color: T.text, margin: 0 }}>Government Agency Credentials</h3>
            </div>
            <p style={{ font: '400 14px/1.6 var(--font-sans)', color: T.textMuted, margin: '6px 0 22px' }}>
              Manage corporate identity and regulatory compliance IDs required for automated statutory parsing.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1 / span 2' }}>
                <Field label="BIR Tax Identification Number (TIN)" value={creds.tin} onChange={(v) => setCreds({ ...creds, tin: v })} mono />
              </div>
              <div style={{ gridColumn: '1 / span 2' }}>
                <Field label="SSS Employer ID" value={creds.sss} onChange={(v) => setCreds({ ...creds, sss: v })} mono />
              </div>
              <Field label="PhilHealth No." value={creds.ph}   onChange={(v) => setCreds({ ...creds, ph: v })} mono />
              <Field label="HDMF (Pag-IBIG)" value={creds.hdmf} onChange={(v) => setCreds({ ...creds, hdmf: v })} mono />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22 }}>
              <Button variant="primary">Save Credentials</Button>
            </div>
          </Card>
        </div>

        {/* Stellar Wallet */}
        <div style={{ gridColumn: 'span 4' }}>
          <Card padding={24} style={{ height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
              <Icon name="account_balance_wallet" size={22} color={T.text} />
              <h3 style={{ font: '500 22px/1.3 var(--font-sans)', color: T.text, margin: 0 }}>Stellar Wallet & Liquidity</h3>
            </div>

            <div style={{
              background: T.surfLow, border: '1px solid rgba(69,70,77,0.30)', borderRadius: 8, padding: 14, marginBottom: 18,
            }}>
              <div style={{ font: '600 11px/1.2 var(--font-sans)', letterSpacing: '0.05em', textTransform: 'uppercase', color: T.textMuted, marginBottom: 6 }}>Primary Treasury Public Key</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ font: '500 14px/1.4 var(--font-mono)', color: T.text }}>GC02…X9L4M</span>
                <Icon name="content_copy" size={16} color={T.textMuted} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ font: '600 11px/1.2 var(--font-sans)', letterSpacing: '0.05em', textTransform: 'uppercase', color: T.textMuted }}>Default Liquidity Pool</label>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: T.surf, border: '1px solid rgba(69,70,77,0.6)', borderRadius: 8, padding: '10px 12px',
                  font: '400 14px/1.4 var(--font-sans)', color: T.text, cursor: 'pointer',
                }}>
                  Axial Prime Treasury (USDC)
                  <Icon name="keyboard_arrow_down" size={18} color={T.textMuted} />
                </div>
              </div>

              <Field label="Lender Preference Limit" value="250000" mono after={<span style={{ font: '500 13px/1 var(--font-sans)', color: T.textMuted }}>USDC</span>} />
            </div>
          </Card>
        </div>
      </div>

      {/* Automation Logic */}
      <div>
        <h3 style={{ font: '500 22px/1.3 var(--font-sans)', color: T.text, margin: '0 0 18px' }}>Automation Logic</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <AutomationCard
            title="Auto-Factoring"
            body="Automatically evaluate and route approved invoices to the designated liquidity pool without manual intervention."
            on={auto.factoring}
            onChange={(v) => setAuto({ ...auto, factoring: v })}
          />
          <AutomationCard
            title="Auto-Split Statutory"
            body="Systematically deduct and route government agency liabilities (BIR, SSS) to reserve wallets prior to payroll disbursement."
            on={auto.statutory}
            onChange={(v) => setAuto({ ...auto, statutory: v })}
          />
        </div>
      </div>

      {/* System Audit Logs */}
      <Card padding={24}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ font: '500 22px/1.3 var(--font-sans)', color: T.text, margin: 0 }}>System Audit Logs</h3>
          <Button variant="ghost" iconRight="file_download" style={{ color: T.primary }}>Export CSV</Button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            { time: '2026-10-24 16:10', actor: 'system', event: 'EIS payload PLD-8831-C signed (JWS) and queued for T+3 bridge.' },
            { time: '2026-10-24 14:30', actor: 'system', event: 'BIR EIS PLD-8829-A acknowledged. Ref: BIR-2026-991A.' },
            { time: '2026-10-24 11:02', actor: 'AM',     event: 'Atomic swap executed on INV-2023-8901. 118,500 USDC settled.' },
            { time: '2026-10-23 17:44', actor: 'system', event: 'Statutory split routed. SSS 142,500 · PhilHealth 56,250 · Pag-IBIG 25,000.' },
          ].map((r, i, arr) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '180px 60px 1fr', gap: 18, alignItems: 'baseline',
              padding: '12px 0',
              borderBottom: i < arr.length - 1 ? '1px solid rgba(69,70,77,0.15)' : 'none',
            }}>
              <span style={{ font: '400 13px/1.4 var(--font-mono)', color: T.textMuted }}>{r.time}</span>
              <span style={{ font: '600 11px/1.2 var(--font-sans)', letterSpacing: '0.05em', textTransform: 'uppercase', color: r.actor === 'system' ? T.active : T.primary }}>{r.actor}</span>
              <span style={{ font: '400 13px/1.5 var(--font-sans)', color: T.text }}>{r.event}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function AutomationCard({ title, body, on, onChange }) {
  return (
    <div style={{ background: T.surfLow, border: '1px solid rgba(69,70,77,0.30)', borderRadius: 12, padding: 20, display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'flex-start' }}>
      <div>
        <div style={{ font: '500 16px/1.4 var(--font-sans)', color: T.text }}>{title}</div>
        <p style={{ font: '400 13px/1.6 var(--font-sans)', color: T.textMuted, margin: '6px 0 0', maxWidth: 380 }}>{body}</p>
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}

window.SettingsView = SettingsView;
