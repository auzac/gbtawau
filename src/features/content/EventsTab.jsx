// src/features/content/EventsTab.jsx
import { Plus, Pencil, Trash2, MapPin, User } from 'lucide-react'
import IconButton from '../../components/ui/IconButton'
import PillButton from '../../components/ui/PillButton'

// ─── Tokens ───────────────────────────────────────────────────────────────────
const C = {
  bg: '#FAF8F5', surface: '#FFFFFF', surfaceAlt: '#F5EFE6',
  border: '#EAE1D4', text: '#2D2926', textMid: '#57534E',
  textMuted: '#9A8B80', accent: '#C4A88B', accentDark: '#92622E',
  accentBg: '#FDF3E8',
}
const f = { serif: "'Lora', serif", sans: "'DM Sans', sans-serif" }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const to12 = t => {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hr = +h
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`
}

export default function EventsTab({ events, onAdd, onEdit, onDelete, isMobile }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, fontFamily: f.serif, color: C.text }}>Upcoming Events</h2>
          <p style={{ margin: '3px 0 0', fontSize: '12px', color: C.textMuted, fontFamily: f.sans }}>Manage public-facing church events</p>
        </div>
        <PillButton onClick={onAdd} style={{ padding: '8px 16px', borderRadius: '99px', fontSize: '13px', flexShrink: 0 }}>
          {isMobile ? <Plus size={16} /> : <><Plus size={14} /> Add Event</>}
        </PillButton>
      </div>
      {events.length === 0 ? (
        <div style={{ background: C.surface, borderRadius: '18px', border: `1.5px solid ${C.border}`, padding: '48px 24px', textAlign: 'center', color: C.textMuted, fontFamily: f.sans }}>
          No upcoming events. Click + to create one.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {events.map(evt => (
            <div key={evt.id} style={{ background: C.surface, borderRadius: '16px', border: `1.5px solid ${C.border}`, padding: '14px 16px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                {/* Date badge */}
                <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: C.surfaceAlt, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: C.textMuted, fontFamily: f.sans }}>{new Date(evt.date).toLocaleString('default', { month: 'short' })}</span>
                  <span style={{ fontSize: '20px', fontWeight: 700, fontFamily: f.serif, lineHeight: 1 }}>{new Date(evt.date).getDate()}</span>
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, fontFamily: f.serif, color: C.text }}>{evt.titleEn}</h3>
                  <p style={{ margin: '3px 0 0', fontSize: '12px', color: C.textMuted, fontFamily: f.sans }}>{to12(evt.time)}</p>
                  {evt.descriptionEn && <p style={{ margin: '6px 0 0', fontSize: '13px', color: C.textMid, fontFamily: f.sans }}>{evt.descriptionEn}</p>}
                  {(evt.location || evt.pic) && (
                    <div style={{ display: 'flex', gap: '14px', marginTop: '7px', fontSize: '11px', color: C.textMuted, fontFamily: f.sans, flexWrap: 'wrap' }}>
                      {evt.location && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={11} />{evt.location}</span>}
                      {evt.pic && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={11} />{evt.pic}</span>}
                    </div>
                  )}
                </div>
                {/* Actions */}
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <IconButton onClick={() => onEdit(evt)}><Pencil size={13} color={C.textMid} /></IconButton>
                  <IconButton onClick={() => onDelete(evt.id)} danger><Trash2 size={13} color="#DC2626" /></IconButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
