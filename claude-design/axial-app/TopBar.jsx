// TopBar.jsx — Page header (title + wallet/notifications/avatar)

function TopBar({ title, subtitle, walletConnected, onWalletToggle, notifCount = 1 }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 20,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '24px 64px',
      background: 'rgba(8,15,20,0.80)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(69,70,77,0.10)',
    }}>
      <div>
        <h2 style={{ font: '600 32px/1.2 var(--font-sans)', letterSpacing: '-0.01em', color: T.text, margin: 0 }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ font: '400 14px/1.5 var(--font-sans)', color: T.textMuted, margin: '6px 0 0' }}>{subtitle}</p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24, color: T.textMuted }}>
        <button
          type="button"
          onClick={onWalletToggle}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: walletConnected ? T.active : T.textMuted,
            font: '500 13px/1 var(--font-sans)', letterSpacing: '0.02em',
            padding: 0,
          }}
        >
          <Icon name="account_balance_wallet" size={20} />
          {walletConnected ? 'GC02…X9L4M' : 'Wallet Connect'}
          {walletConnected && (
            <span style={{ width: 6, height: 6, borderRadius: 9999, background: T.active, boxShadow: '0 0 10px rgba(45,212,191,0.6)', marginLeft: 2 }} />
          )}
        </button>

        <button type="button" style={{
          position: 'relative', height: 40, width: 40, borderRadius: 9999,
          background: T.surf, border: '1px solid rgba(69,70,77,0.20)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: T.text, cursor: 'pointer',
        }}>
          <Icon name="notifications" size={20} />
          {notifCount > 0 && (
            <span style={{
              position: 'absolute', top: 8, right: 8,
              width: 8, height: 8, borderRadius: 9999,
              background: T.primary, boxShadow: '0 0 8px rgba(190,198,224,0.6)',
            }} />
          )}
        </button>

        <Avatar initials="AM" size={40} />
      </div>
    </header>
  );
}

window.TopBar = TopBar;
