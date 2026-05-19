// Axial UI Kit — primitive components
// Buttons, cards, badges, icons. Mirrors web/ Tailwind utilities using inline styles
// against tokens declared in colors_and_type.css.

const T = {
  bg:          'var(--color-background)',
  surf:        'var(--color-surface-container)',
  surfLow:     'var(--color-surface-container-low)',
  surfHigh:    'var(--color-surface-container-high)',
  surfLowest:  'var(--color-surface-container-lowest)',
  glassLow:    'rgba(20,26,36,0.40)',
  glass:       'rgba(20,26,36,0.72)',
  glassBorder: 'rgba(226,232,240,0.10)',
  text:        'var(--color-on-surface)',
  textMuted:   'var(--color-on-surface-variant)',
  outline:     'var(--color-outline)',
  outlineV:    'var(--color-outline-variant)',
  primary:     'var(--color-primary)',
  primaryFix:  'var(--color-primary-fixed)',
  onPrimary:   'var(--color-on-primary)',
  secondary:   'var(--color-secondary)',
  secCon:      'var(--color-secondary-container)',
  tertiary:    'var(--color-tertiary)',
  active:      '#2DD4BF',
  activeSoft:  'rgba(45,212,191,0.18)',
  activeBord:  'rgba(45,212,191,0.40)',
  success:     'var(--color-success)',
  warning:     'var(--color-warning)',
  error:       'var(--color-error)',
};

// ---------- Icon ----------
function Icon({ name, size = 20, fill = false, color, style, className = '' }) {
  return (
    <span
      className={`material-symbols-outlined ${fill ? 'fill' : ''} ${className}`}
      style={{
        fontSize: size,
        color: color,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
        ...style,
      }}
    >
      {name}
    </span>
  );
}

// ---------- Button ----------
function Button({ variant = 'primary', icon, iconRight, children, glow = false, disabled, onClick, style = {}, fullWidth = false, size = 'md' }) {
  const padding = size === 'sm' ? '8px 14px' : size === 'lg' ? '14px 22px' : '11px 18px';
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding, borderRadius: 8, border: '1px solid transparent', cursor: disabled ? 'not-allowed' : 'pointer',
    font: `600 ${size === 'sm' ? 12 : 13}px/1 var(--font-sans)`, letterSpacing: '0.02em',
    transition: 'opacity 120ms ease-out, transform 120ms ease-out, background 120ms ease-out',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.4 : 1,
  };
  const variants = {
    primary:    { background: T.primary, color: T.onPrimary, boxShadow: glow ? '0 0 20px rgba(190,198,224,0.20)' : '0 0 15px rgba(190,198,224,0.10)' },
    secondary:  { background: 'transparent', color: T.text, borderColor: 'rgba(144,144,151,0.4)' },
    ghost:      { background: 'transparent', color: T.textMuted },
    teal:       { background: T.activeSoft, color: T.active, borderColor: T.activeBord, boxShadow: glow ? '0 0 25px rgba(45,212,191,0.5)' : '0 0 15px rgba(45,212,191,0.30)' },
    destructive:{ background: 'transparent', color: T.error, borderColor: 'rgba(255,180,171,0.4)' },
    surface:    { background: T.surf, color: T.text, borderColor: 'rgba(69,70,77,0.6)' },
  };
  return (
    <button type="button" disabled={disabled} onClick={onClick} style={{ ...base, ...variants[variant], ...style }}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = 'scale(0.97)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {icon && <Icon name={icon} size={size === 'sm' ? 16 : 18} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === 'sm' ? 16 : 18} />}
    </button>
  );
}

// ---------- Card ----------
function Card({ children, padding = 24, style = {}, glass = true, hoverable = false }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => hoverable && setHover(true)}
      onMouseLeave={() => hoverable && setHover(false)}
      style={{
        position: 'relative',
        background: glass ? T.glassLow : T.surf,
        backdropFilter: glass ? 'blur(20px)' : undefined,
        WebkitBackdropFilter: glass ? 'blur(20px)' : undefined,
        borderTop: `1px solid ${T.glassBorder}`,
        borderLeft: `1px solid rgba(226,232,240,0.04)`,
        borderRight: `1px solid rgba(0,0,0,0.2)`,
        borderBottom: `1px solid rgba(0,0,0,0.3)`,
        borderRadius: 16,
        padding,
        transition: 'background 200ms ease-out',
        ...(hover ? { background: 'rgba(20,26,36,0.55)' } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function CardHeader({ icon, label, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.textMuted }}>
        {icon && <Icon name={icon} size={18} />}
        <span style={{ font: '600 12px/1.2 var(--font-sans)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
      </div>
      {action}
    </div>
  );
}

// ---------- Status / badges ----------
const STATUS_STYLES = {
  active:   { bg: 'rgba(20,26,36,0.6)', border: 'rgba(69,70,77,0.5)', text: T.text,      dot: T.active,    glow: '0 0 10px rgba(45,212,191,0.6)' },
  synced:   { bg: 'rgba(45,212,191,0.10)', border: 'rgba(45,212,191,0.30)', text: T.active, dot: T.active },
  minted:   { bg: 'rgba(62,73,93,0.40)', border: 'rgba(188,199,222,0.2)', text: T.secondary, dot: T.secondary },
  scanning: { bg: 'rgba(47,53,60,0.40)', border: 'rgba(144,144,151,0.2)', text: T.textMuted, dot: T.outline },
  settled:  { bg: 'rgba(47,53,60,0.30)', border: 'rgba(144,144,151,0.15)', text: T.textMuted },
  warning:  { bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.30)', text: T.warning, dot: T.warning },
  error:    { bg: 'rgba(255,180,171,0.10)', border: 'rgba(255,180,171,0.30)', text: T.error, dot: T.error },
};
function StatusBadge({ kind = 'active', icon, children, animated }) {
  const s = STATUS_STYLES[kind] || STATUS_STYLES.active;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 12px', borderRadius: 9999,
      background: s.bg, border: `1px solid ${s.border}`, color: s.text,
      font: '600 11px/1.2 var(--font-sans)', letterSpacing: '0.05em',
    }}>
      {s.dot && <span style={{ width: 6, height: 6, borderRadius: 9999, background: s.dot, boxShadow: s.glow }} />}
      {icon && <Icon name={icon} size={14} className={animated ? 'axl-spin' : ''} />}
      {children}
    </span>
  );
}

// ---------- Stat tile ----------
function StatTile({ label, value, unit, accent }) {
  return (
    <div style={{
      background: T.glassLow, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      borderTop: `1px solid ${T.glassBorder}`, borderRadius: 8, padding: 16,
    }}>
      <div style={{ font: '600 11px/1.2 var(--font-sans)', letterSpacing: '0.05em', textTransform: 'uppercase', color: T.textMuted, marginBottom: 8 }}>
        {label}
      </div>
      <div className="num" style={{
        font: '600 28px/1.1 var(--font-sans)', letterSpacing: '-0.01em',
        color: accent ? T.primary : T.text,
      }}>
        {value} {unit && <span style={{ font: '500 16px/1 var(--font-sans)', color: T.textMuted }}>{unit}</span>}
      </div>
    </div>
  );
}

// ---------- Empty state / placeholder ----------
function Placeholder({ children, height = 200 }) {
  return (
    <div style={{
      height, borderRadius: 12, border: `1px dashed ${T.outlineV}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: T.textMuted, font: '500 13px/1.4 var(--font-sans)',
      background: 'rgba(20,26,36,0.30)',
    }}>{children}</div>
  );
}

// ---------- Field ----------
function Field({ label, value, onChange, mono = false, error, after }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ font: '600 11px/1.2 var(--font-sans)', letterSpacing: '0.05em', textTransform: 'uppercase', color: T.textMuted }}>{label}</label>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          readOnly={!onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            background: T.surf,
            color: T.text,
            border: `1px solid ${error ? T.error : focused ? T.primary : 'rgba(69,70,77,0.6)'}`,
            borderRadius: 8,
            padding: '10px 12px',
            font: `400 14px/1.4 ${mono ? 'var(--font-mono)' : 'var(--font-sans)'}`,
            outline: 'none',
            boxShadow: focused ? '0 0 0 2px rgba(190,198,224,0.15)' : 'none',
            transition: 'border-color 120ms ease-out, box-shadow 120ms ease-out',
          }}
        />
        {after}
      </div>
      {error && <div style={{ font: '400 11px/1.4 var(--font-sans)', color: T.error }}>{error}</div>}
    </div>
  );
}

// ---------- Toggle ----------
function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange && onChange(!on)}
      style={{
        width: 44, height: 24, borderRadius: 9999, padding: 3, position: 'relative',
        cursor: 'pointer', border: on ? 'none' : '1px solid rgba(144,144,151,0.2)',
        background: on ? T.primary : '#2f353c', transition: 'background 150ms ease-out',
      }}
    >
      <span style={{
        display: 'block', width: 18, height: 18, borderRadius: 9999,
        background: on ? T.onPrimary : T.outline,
        transform: `translateX(${on ? 20 : 0}px)`,
        transition: 'transform 150ms ease-out',
      }} />
    </button>
  );
}

// ---------- Avatar ----------
function Avatar({ initials = 'AM', size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 9999,
      background: 'linear-gradient(135deg, #3e495d, #1a2026)',
      border: '1px solid rgba(69,70,77,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      font: `600 ${Math.round(size * 0.36)}px/1 var(--font-sans)`, color: T.secondary,
      letterSpacing: '0.02em',
    }}>{initials}</div>
  );
}

// Export to global scope (each <script> has its own scope after Babel transpile).
Object.assign(window, {
  T, Icon, Button, Card, CardHeader, StatusBadge, StatTile, Placeholder, Field, Toggle, Avatar,
});
