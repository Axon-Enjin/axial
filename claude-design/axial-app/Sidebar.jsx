// Sidebar.jsx — Left rail (Command Center / Liquidity / Compliance / Settings)

const NAV = [
  { id: 'overview',   label: 'Command Center', icon: 'dashboard' },
  { id: 'liquidity',  label: 'Liquidity',      icon: 'swap_horiz' },
  { id: 'compliance', label: 'Compliance',     icon: 'gavel' },
  { id: 'settings',   label: 'Settings',       icon: 'settings_input_component' },
];

function NavRow({ active, label, icon, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <a
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', display: 'flex', alignItems: 'center', gap: 12,
        padding: '11px 16px', cursor: 'pointer',
        font: '500 13px/1.4 var(--font-sans)', letterSpacing: '0.02em',
        color: active ? T.primary : (hover ? T.text : T.textMuted),
        background: active ? 'rgba(62,73,93,0.30)' : (hover ? 'rgba(47,53,60,0.20)' : 'transparent'),
        borderRight: `2px solid ${active ? T.primary : 'transparent'}`,
        borderRadius: '0 9999px 9999px 0',
        boxShadow: active ? '0 0 15px rgba(190,198,224,0.08)' : 'none',
        transition: 'background 200ms ease-out, color 200ms ease-out',
        userSelect: 'none',
      }}
    >
      <Icon name={icon} size={20} fill={active} />
      {label}
    </a>
  );
}

function Sidebar({ route, onRoute, onNewTx }) {
  return (
    <nav style={{
      position: 'sticky', top: 0, height: '100vh', width: 256,
      display: 'flex', flexDirection: 'column', gap: 18, paddingTop: 28, paddingBottom: 18,
      background: 'rgba(8,15,20,0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderRight: `1px solid rgba(69,70,77,0.20)`, zIndex: 50,
    }}>
      {/* Brand lockup */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 22px', marginBottom: 4 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 8,
          background: T.surf, border: '1px solid rgba(69,70,77,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 15px rgba(190,198,224,0.10)',
        }}>
          <Icon name="architecture" size={20} color={T.primary} />
        </div>
        <div>
          <h1 style={{ font: '700 18px/1.1 var(--font-sans)', letterSpacing: '-0.01em', color: T.primary, margin: 0 }}>Axial MVP</h1>
          <p style={{ font: '600 10px/1.2 var(--font-sans)', letterSpacing: '0.18em', textTransform: 'uppercase', color: T.textMuted, margin: '3px 0 0' }}>Architect Mode</p>
        </div>
      </div>

      {/* New Transaction CTA */}
      <div style={{ padding: '0 22px', marginBottom: 6 }}>
        <Button variant="primary" icon="add" fullWidth onClick={onNewTx} glow>New Transaction</Button>
      </div>

      {/* Primary nav */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingRight: 14, flex: 1 }}>
        {NAV.map((n) => (
          <NavRow key={n.id} active={route === n.id} label={n.label} icon={n.icon} onClick={() => onRoute(n.id)} />
        ))}
      </div>

      {/* Footer nav */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingRight: 14, paddingTop: 14, borderTop: '1px solid rgba(69,70,77,0.20)' }}>
        <NavRow active={false} label="Support" icon="help_outline" onClick={() => {}} />
        <NavRow active={false} label="Sign Out" icon="logout" onClick={() => {}} />
      </div>
    </nav>
  );
}

window.Sidebar = Sidebar;
