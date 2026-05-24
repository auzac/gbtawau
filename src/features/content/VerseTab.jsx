// src/features/content/VerseTab.jsx
import { CheckCircle, AlertCircle, Search, Plus, Download, Upload, Trash2 } from 'lucide-react'
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

const inp = {
  width: '100%', padding: '10px 12px', border: `1.5px solid ${C.border}`,
  borderRadius: '10px', fontSize: '14px', background: C.surface,
  color: C.text, outline: 'none', boxSizing: 'border-box', fontFamily: f.sans,
}

export default function VerseTab({
  verseLib,
  verseSearch,
  onVerseSearchChange,
  selectedVerse,
  onVerseSelect,
  activeVerse,
  showAddVerse,
  onToggleAddVerse,
  newVerse,
  onNewVerseChange,
  onSaveVerse,
  onActivateVerse,
  onDeleteVerse,
  onExportCSV,
  onImportCSV,
  isMobile,
}) {
  const selVerse = selectedVerse ? verseLib.find(v => v.id === selectedVerse) : null

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '24px' }}>
      {/* Library panel */}
      <div style={{ flex: 1, minWidth: 0, background: C.surface, borderRadius: '18px', border: `1.5px solid ${C.border}`, padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 600, fontFamily: f.serif, color: C.text }}>Verse Library</h2>
          <div style={{ display: 'flex', gap: '6px' }}>
            <IconButton onClick={onExportCSV}><Download size={14} color={C.textMid} /></IconButton>
            <label style={{ width: '32px', height: '32px', borderRadius: '50%', border: `1.5px solid ${C.border}`, background: C.surfaceAlt, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={14} color={C.textMid} />
              <input type="file" accept=".csv" onChange={onImportCSV} style={{ display: 'none' }} />
            </label>
          </div>
        </div>
        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '14px' }}>
          <Search size={13} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: C.textMuted, pointerEvents: 'none' }} />
          <input type="text" placeholder="Search reference or text..." value={verseSearch} onChange={e => onVerseSearchChange(e.target.value)} style={{ ...inp, paddingLeft: '34px' }} />
        </div>
        {/* List */}
        <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '14px' }}>
          {verseLib.filter(v => v.reference.toLowerCase().includes(verseSearch.toLowerCase()) || v.text.toLowerCase().includes(verseSearch.toLowerCase())).map(v => (
            <div key={v.id} onClick={() => onVerseSelect(v.id)} style={{ padding: '11px 12px', borderRadius: '10px', marginBottom: '7px', background: v.is_active ? C.accentBg : 'transparent', border: `1.5px solid ${selectedVerse === v.id ? C.accentDark : C.border}`, cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontFamily: f.serif, margin: 0, fontSize: '14px' }}>{v.reference}</p>
                  <p style={{ fontSize: '12px', color: C.textMuted, marginTop: '3px', wordBreak: 'break-word' }}>{v.text}</p>
                </div>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexShrink: 0 }}>
                  {v.is_active && <span style={{ background: C.accentDark, color: '#fff', fontSize: '10px', padding: '2px 8px', borderRadius: '12px' }}>Active</span>}
                  <IconButton onClick={e => { e.stopPropagation(); onDeleteVerse(v.id, v.reference) }} danger><Trash2 size={12} color="#DC2626" /></IconButton>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Add verse */}
        {!showAddVerse ? (
          <button onClick={onToggleAddVerse} style={{ width: '100%', padding: '10px', borderRadius: '12px', border: `1.5px dashed ${C.border}`, background: C.surface, cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: C.textMid, fontFamily: f.sans, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Plus size={14} /> Add New Verse
          </button>
        ) : (
          <div style={{ padding: '14px', background: C.surfaceAlt, borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input placeholder="Reference" value={newVerse.reference} onChange={e => onNewVerseChange({ ...newVerse, reference: e.target.value })} style={inp} />
            <textarea placeholder="Verse text" rows={3} value={newVerse.text} onChange={e => onNewVerseChange({ ...newVerse, text: e.target.value })} style={inp} />
            <input placeholder="Theme (optional)" value={newVerse.theme} onChange={e => onNewVerseChange({ ...newVerse, theme: e.target.value })} style={inp} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <PillButton primary onClick={onSaveVerse}>Save</PillButton>
              <PillButton onClick={onToggleAddVerse}>Cancel</PillButton>
            </div>
          </div>
        )}
      </div>

      {/* Preview panel */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Active verse */}
        <div style={{ background: C.text, borderRadius: '18px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <CheckCircle size={15} color="#C4A88B" />
            <span style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C4A88B', fontFamily: f.sans }}>Currently Active</span>
          </div>
          <p style={{ fontSize: '17px', fontFamily: f.serif, color: '#fff', lineHeight: 1.5, fontStyle: 'italic', margin: 0 }}>"{activeVerse.text}"</p>
          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ fontSize: '14px', fontWeight: 500, color: '#fff', margin: 0 }}>{activeVerse.reference}</p>
            <p style={{ fontSize: '11px', color: '#78716C', marginTop: '2px', fontFamily: f.sans }}>{activeVerse.theme || 'No theme'}</p>
          </div>
        </div>
        {/* Selected preview */}
        {selVerse && (
          <div style={{ background: C.surface, borderRadius: '18px', border: `2px solid ${C.accentDark}`, padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <AlertCircle size={15} color={C.accentDark} />
              <span style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMid, fontFamily: f.sans }}>Preview — will become active</span>
            </div>
            <p style={{ fontSize: '17px', fontFamily: f.serif, color: C.text, lineHeight: 1.5, fontStyle: 'italic', margin: 0 }}>"{selVerse.text}"</p>
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: `1px solid ${C.border}` }}>
              <p style={{ fontSize: '14px', fontWeight: 500, color: C.text, margin: 0 }}>{selVerse.reference}</p>
              <p style={{ fontSize: '11px', color: C.textMuted, marginTop: '2px', fontFamily: f.sans }}>{selVerse.theme || 'No theme'}</p>
            </div>
            <PillButton primary onClick={() => onActivateVerse(selVerse.id)} style={{ marginTop: '16px', width: '100%' }}>
              <CheckCircle size={14} /> Activate This Verse
            </PillButton>
          </div>
        )}
      </div>
    </div>
  )
}
