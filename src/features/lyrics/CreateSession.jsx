// src/features/lyrics/CreateSession.jsx
import { Search, X } from 'lucide-react'
import IconButton from '../../components/ui/IconButton'
import PillButton from '../../components/ui/PillButton'

// ─── Tokens ───────────────────────────────────────────────────────────────────
const C = {
  surface:     '#FFFFFF',
  surfaceAlt:  '#F5EFE6',
  border:      '#EAE1D4',
  text:        '#2D2926',
  textMid:     '#57534E',
  textMuted:   '#9A8B80',
  accentDark:  '#92622E',
  accentBg:    '#FDF3E8',
}
const f = { serif: "'Lora', serif", sans: "'DM Sans', sans-serif" }
const inp = (extra = {}) => ({
  width: '100%', padding: '11px 14px', border: `1.5px solid ${C.border}`,
  borderRadius: '12px', fontSize: '15px', background: C.surface,
  color: C.text, outline: 'none', boxSizing: 'border-box',
  fontFamily: f.sans, ...extra,
})

export default function CreateSession({
  visible,
  createCode,
  onCreateCodeChange,
  expiryHours,
  onExpiryChange,
  selectedIds,
  onToggleSong,
  search,
  onSearchChange,
  songs,
  songsLoading,
  error,
  onCreate,
  onClose,
  isCreating,
}) {
  if (!visible) return null

  const filtered = search.trim()
    ? songs.filter(s => s.title.toLowerCase().includes(search.toLowerCase()))
    : songs

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(3px)' }} onClick={onClose}>
      <div style={{ background: C.surface, borderRadius: '24px 24px 0 0', width: '100%', maxWidth: '680px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', paddingBottom: 'env(safe-area-inset-bottom, 16px)' }} onClick={e => e.stopPropagation()}>

        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '99px', background: C.border }} />
        </div>

        {/* Modal header */}
        <div style={{ padding: '10px 20px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, fontFamily: f.serif, color: C.text }}>Create Session</h2>
          <IconButton onClick={onClose}><X size={15} color={C.textMid} /></IconButton>
        </div>
        <div style={{ height: '1px', background: C.border }} />

        {/* Scrollable form body */}
        <div style={{ overflowY: 'auto', padding: '18px 20px', flex: 1 }}>
          {error && (
            <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '10px 14px', borderRadius: '10px', marginBottom: '14px', fontSize: '13px', fontFamily: f.sans }}>
              {error}
            </div>
          )}

          {/* Code + Expiry row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <p style={{ margin: '0 0 6px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.textMuted, fontFamily: f.sans }}>Session code</p>
              <input
                type="text" inputMode="numeric"
                value={createCode}
                onChange={e => onCreateCodeChange(e.target.value.replace(/\D/g,'').slice(0,4))}
                style={{ ...inp(), textAlign: 'center', letterSpacing: '6px', fontWeight: 700, fontSize: '20px' }}
              />
            </div>
            <div>
              <p style={{ margin: '0 0 6px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.textMuted, fontFamily: f.sans }}>Expires in</p>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[1,2,4,8].map(h => (
                  <button key={h} onClick={() => onExpiryChange(h)} style={{ flex: 1, padding: '11px 0', borderRadius: '10px', border: `1.5px solid ${expiryHours === h ? C.accentDark : C.border}`, background: expiryHours === h ? C.accentBg : C.surface, color: expiryHours === h ? C.accentDark : C.textMid, fontSize: '13px', fontWeight: 600, fontFamily: f.sans, cursor: 'pointer' }}>
                    {h}h
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Song selector */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <p style={{ margin: 0, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.textMuted, fontFamily: f.sans }}>Songs</p>
              {selectedIds.size > 0 && <span style={{ fontSize: '12px', color: C.accentDark, fontWeight: 600, fontFamily: f.sans }}>{selectedIds.size} selected</span>}
            </div>
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: C.textMuted, pointerEvents: 'none' }} />
              <input
                type="text" placeholder="Search songs..."
                value={search}
                onChange={e => onSearchChange(e.target.value)}
                style={{ ...inp(), paddingLeft: '34px' }}
              />
            </div>

            <div style={{ border: `1.5px solid ${C.border}`, borderRadius: '14px', overflow: 'hidden', maxHeight: '300px', overflowY: 'auto' }}>
              {songsLoading ? (
                <div style={{ padding: '24px', textAlign: 'center', color: C.textMuted, fontSize: '14px' }}>Loading songs...</div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: C.textMuted, fontSize: '14px' }}>No songs found</div>
              ) : filtered.map((song, idx) => {
                const checked = selectedIds.has(song.id)
                return (
                  <label key={song.id} style={{ display: 'flex', gap: '12px', padding: '12px 14px', borderTop: idx === 0 ? 'none' : `1px solid ${C.border}`, cursor: 'pointer', alignItems: 'flex-start', background: checked ? C.accentBg : 'transparent', transition: 'background 0.1s' }}>
                    <input type="checkbox" checked={checked} onChange={() => onToggleSong(song.id)} style={{ marginTop: '2px', accentColor: C.accentDark, width: '16px', height: '16px', flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', fontFamily: f.serif, color: C.text }}>{song.title}</p>
                      <p style={{ margin: '3px 0 0', fontSize: '12px', color: C.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.lyrics.slice(0, 70)}...</p>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        </div>

        {/* Sticky CTA */}
        <div style={{ padding: '14px 20px', borderTop: `1px solid ${C.border}` }}>
          <PillButton
            onClick={onCreate}
            primary
            disabled={isCreating || selectedIds.size === 0}
            style={{ width: '100%', padding: '14px', borderRadius: '14px' }}
          >
            {isCreating ? 'Creating...' : `Create Session · ${selectedIds.size} song${selectedIds.size !== 1 ? 's' : ''}`}
          </PillButton>
        </div>
      </div>
    </div>
  )
}
