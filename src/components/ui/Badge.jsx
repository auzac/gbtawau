// src/components/ui/Badge.jsx
export const BadgeMap = {
  male:     { bg:'#EFF6FF', color:'#1D4ED8' },
  female:   { bg:'#FDF2F8', color:'#BE185D' },
  married:  { bg:'#F0FDF4', color:'#166534' },
  single:   { bg:'#EFF6FF', color:'#1D4ED8' },
  widowed:  { bg:'#F5F3FF', color:'#6D28D9' },
  divorced: { bg:'#FFF7ED', color:'#C2410C' },
  deceased: { bg:'#F3F4F6', color:'#6B7280' },
  child:    { bg:'#FFFBEB', color:'#B45309' },
  pending:  { bg:'#FEF3C7', color:'#92400E' },
  youth:    { bg:'#F0FDFA', color:'#0F766E' },
  adult:    { bg:'#F5EFE6', color:'#57534E' },
  baptised: { bg:'#F0FDF4', color:'#166534' },
}

export function Badge({ variant = 'adult', children, style }) {
  const s = BadgeMap[variant] || BadgeMap.adult
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:'3px',
      padding:'2px 8px', borderRadius:'20px', fontSize:'11px', fontWeight:600,
      background:s.bg, color:s.color, whiteSpace:'nowrap',
      fontFamily:"'DM Sans', system-ui, sans-serif",
      ...style,
    }}>
      {children}
    </span>
  )
}
