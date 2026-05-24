// src/features/content/AnnouncementsTab.jsx
import { Plus, Pencil, Trash2, MoveUp, MoveDown, Image, Eye, EyeOff, Link } from 'lucide-react'
import IconButton from '../../components/ui/IconButton'
import PillButton from '../../components/ui/PillButton'

// ─── Tokens ───────────────────────────────────────────────────────────────────
const C = {
  surface: '#FFFFFF', surfaceAlt: '#F5EFE6',
  border: '#EAE1D4', text: '#2D2926', textMid: '#57534E',
  textMuted: '#9A8B80', accentDark: '#92622E',
}
const f = { serif: "'Lora', serif", sans: "'DM Sans', sans-serif" }

export default function AnnouncementsTab({ announces, onAdd, onEdit, onDelete, onToggle, onMove, isMobile }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, fontFamily: f.serif, color: C.text }}>Carousel Announcements</h2>
          <p style={{ margin: '3px 0 0', fontSize: '12px', color: C.textMuted, fontFamily: f.sans }}>Slides shown on the homepage carousel</p>
        </div>
        <PillButton onClick={onAdd} style={{ padding: '8px 16px', borderRadius: '99px', fontSize: '13px', flexShrink: 0 }}>
          {isMobile ? <Plus size={16} /> : <><Plus size={14} /> Add Announcement</>}
        </PillButton>
      </div>
      {announces.length === 0 ? (
        <div style={{ background: C.surface, borderRadius: '18px', border: `1.5px solid ${C.border}`, padding: '48px 24px', textAlign: 'center', color: C.textMuted, fontFamily: f.sans }}>No announcements yet. Click + to create one.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {announces.map((item, idx) => (
            <div key={item.id} style={{ background: item.is_active ? C.surface : '#F9F7F4', borderRadius: '16px', border: `1.5px solid ${C.border}`, padding: '14px 16px', opacity: item.is_active ? 1 : 0.7 }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {/* Order controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flexShrink: 0 }}>
                  <IconButton onClick={() => onMove(item.id, 'up')} style={{ width: '26px', height: '26px', opacity: idx === 0 ? 0.35 : 1 }}><MoveUp size={11} color={C.textMid} /></IconButton>
                  <IconButton onClick={() => onMove(item.id, 'down')} style={{ width: '26px', height: '26px', opacity: idx === announces.length - 1 ? 0.35 : 1 }}><MoveDown size={11} color={C.textMid} /></IconButton>
                </div>
                {/* Thumbnail */}
                <div style={{ width: '52px', height: '52px', borderRadius: '10px', background: C.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  {item.image_url ? <img src={item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Image size={20} color={C.textMuted} />}
                </div>
                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontFamily: f.serif, margin: 0, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title_en}</p>
                  <p style={{ fontSize: '12px', color: C.textMuted, marginTop: '2px', fontFamily: f.sans }}>{item.title_bm}</p>
                  {item.link_url && <p style={{ fontSize: '11px', color: C.accentDark, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '3px', fontFamily: f.sans }}><Link size={11} />{item.link_url.substring(0, 40)}...</p>}
                </div>
                {/* Actions */}
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center' }}>
                  <IconButton onClick={() => onToggle(item.id, item.is_active)} style={{ background: item.is_active ? '#E6F4E6' : C.surfaceAlt }}>
                    {item.is_active ? <Eye size={13} color="#2E7D32" /> : <EyeOff size={13} color={C.textMuted} />}
                  </IconButton>
                  <IconButton onClick={() => onEdit(item)}><Pencil size={13} color={C.textMid} /></IconButton>
                  <IconButton onClick={() => onDelete(item.id)} danger><Trash2 size={13} color="#DC2626" /></IconButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
