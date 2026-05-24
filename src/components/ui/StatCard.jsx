// src/components/ui/StatCard.jsx
export default function StatCard({ label, value, icon, sub, dark = false }) {
  return (
    <div style={{
      background: dark ? '#2D2926' : '#FFFFFF',
      border: dark ? 'none' : '1.5px solid #EAE1D4',
      borderRadius: '16px', padding: '14px 16px',
      display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: dark ? '#78716C' : '#9A8B80',
          fontFamily: "'DM Sans', system-ui, sans-serif",
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{label}</span>
        {icon && <span style={{ color: dark ? '#78716C' : '#C4A88B', flexShrink: 0, display: 'flex' }}>{icon}</span>}
      </div>
      <span style={{
        fontSize: '30px', fontWeight: 700, lineHeight: 1,
        color: dark ? '#FFFFFF' : '#2D2926',
        fontFamily: "'Lora', 'Georgia', 'Times New Roman', serif",
        fontVariantNumeric: 'tabular-nums',
      }}>{value}</span>
      {sub && <span style={{ fontSize: '11px', color: dark ? '#78716C' : '#9A8B80', fontFamily: "'DM Sans', system-ui, sans-serif" }}>{sub}</span>}
    </div>
  )
}
