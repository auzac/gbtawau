// src/features/content/RosterTab.jsx
import { Pencil } from 'lucide-react'
import IconButton from '../../components/ui/IconButton'

// ─── Tokens ───────────────────────────────────────────────────────────────────
const C = {
  bg: '#FAF8F5', surface: '#FFFFFF', surfaceAlt: '#F5EFE6',
  border: '#EAE1D4', text: '#2D2926', textMid: '#57534E',
  textMuted: '#9A8B80',
}
const f = { serif: "'Lora', serif", sans: "'DM Sans', sans-serif" }

export default function RosterTab({ roster, onEdit, isMobile }) {
  return (
    <div>
      <div style={{ marginBottom: '18px' }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, fontFamily: f.serif, color: C.text }}>Worship Roster</h2>
        <p style={{ margin: '3px 0 0', fontSize: '12px', color: C.textMuted, fontFamily: f.sans }}>Weekly ministry scheduling</p>
      </div>
      <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)' }}>
        {roster.map(week => (
          <div key={week.id} style={{ background: C.surface, borderRadius: '18px', border: `1.5px solid ${C.border}`, padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <p style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted, margin: 0, fontFamily: f.sans }}>Week of</p>
                <h3 style={{ margin: '3px 0 0', fontSize: '15px', fontWeight: 600, fontFamily: f.serif, color: C.text }}>{week.weekStart}</h3>
              </div>
              <IconButton onClick={() => onEdit(week)}><Pencil size={13} color={C.textMid} /></IconButton>
            </div>
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {[['Leader', week.leader], ['Pianist', week.pianist], ['Reader', week.reader]].map(([role, name]) => (
                <div key={role} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontFamily: f.sans }}>
                  <span style={{ color: C.textMuted }}>{role}</span>
                  <span style={{ fontWeight: 500, color: C.text }}>{name || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
