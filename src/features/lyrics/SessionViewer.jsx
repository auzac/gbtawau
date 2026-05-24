// src/features/lyrics/SessionViewer.jsx
import { Copy, CheckCircle, Music2, ChevronLeft, ChevronRight, X } from 'lucide-react'
import IconButton from '../../components/ui/IconButton'
import PillButton from '../../components/ui/PillButton'

// ─── Tokens ───────────────────────────────────────────────────────────────────
const C = {
  bg:          '#FAF8F5',
  surface:     '#FFFFFF',
  border:      '#EAE1D4',
  text:        '#2D2926',
  textMid:     '#57534E',
  textMuted:   '#9A8B80',
  accentDark:  '#92622E',
  accentBg:    '#FDF3E8',
}
const f = { serif: "'Lora', serif", sans: "'DM Sans', sans-serif" }

export default function SessionViewer({
  sessionData,
  joinCode,
  songIndex,
  onSongChange,
  copied,
  onCopyLink,
  onClose,
}) {
  if (!sessionData) return null

  const currentSong = sessionData.songs[songIndex]
  const totalSongs = sessionData.songs.length ?? 0

  return (
    <>
      <div style={{ background: C.surface, borderRadius: '20px', border: `1.5px solid ${C.border}`, overflow: 'hidden' }}>
        {/* Session header */}
        <div style={{ padding: '16px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.textMuted, fontFamily: f.sans }}>Session</span>
              <span style={{ fontSize: '15px', fontWeight: 700, fontFamily: f.serif, color: C.text, letterSpacing: '3px' }}>{joinCode}</span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: '11px', color: C.textMuted, fontFamily: f.sans }}>{songIndex + 1} of {totalSongs} songs</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <IconButton onClick={onCopyLink} style={{ background: copied ? '#F0FAF0' : C.surface, borderColor: copied ? '#C8E6C9' : C.border }}>
              {copied ? <CheckCircle size={15} color="#2E7D32" /> : <Copy size={15} color={C.textMid} />}
            </IconButton>
            <IconButton onClick={onClose}>
              <X size={15} color={C.textMid} />
            </IconButton>
          </div>
        </div>

        {/* Song title bar */}
        {currentSong && (
          <div style={{ padding: '18px 20px 14px', background: C.accentBg, borderBottom: `1px solid ${C.border}` }}>
            <p style={{ margin: 0, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: C.accentDark, fontFamily: f.sans, marginBottom: '4px' }}>Now showing</p>
            <h2 style={{ margin: 0, fontSize: '22px', fontFamily: f.serif, color: C.text, lineHeight: 1.3 }}>{currentSong.title}</h2>
          </div>
        )}

        {/* Lyrics */}
        {currentSong && (
          <div style={{ padding: '24px 20px', overflowY: 'auto' }}>
            <div style={{ lineHeight: 1.9, fontSize: '17px', color: C.text, fontFamily: f.sans }}>
              {currentSong.lyrics.split('\n').map((line, i) => (
                <p key={i} style={{ margin: 0, minHeight: '1.9em', color: line.trim() ? C.text : 'transparent' }}>
                  {line || '·'}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Song tabs — scrollable */}
        {totalSongs > 1 && (
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '12px 16px', borderTop: `1px solid ${C.border}`, scrollbarWidth: 'none' }}>
            {sessionData.songs.map((song, idx) => (
              <button key={song.id} onClick={() => onSongChange(idx)} style={{ flexShrink: 0, padding: '7px 14px', borderRadius: '99px', border: `1.5px solid ${idx === songIndex ? C.accentDark : C.border}`, background: idx === songIndex ? C.accentBg : C.surface, color: idx === songIndex ? C.accentDark : C.textMid, fontSize: '12px', fontWeight: idx === songIndex ? 600 : 400, fontFamily: f.sans, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {song.title}
              </button>
            ))}
          </div>
        )}

        {/* Prev / Next navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderTop: `1px solid ${C.border}`, background: C.bg }}>
          <PillButton
            onClick={() => onSongChange(songIndex - 1)}
            disabled={songIndex === 0}
            style={{ padding: '10px 18px', fontSize: '13px' }}
          >
            <ChevronLeft size={16} /> Prev
          </PillButton>
          {/* Dot indicators */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {sessionData.songs.map((_, idx) => (
              <button key={idx} onClick={() => onSongChange(idx)} style={{ width: idx === songIndex ? '18px' : '7px', height: '7px', borderRadius: '99px', background: idx === songIndex ? C.accentDark : C.border, border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.2s' }} />
            ))}
          </div>
          <PillButton
            onClick={() => onSongChange(songIndex + 1)}
            disabled={songIndex === totalSongs - 1}
            style={{ padding: '10px 18px', fontSize: '13px' }}
          >
            Next <ChevronRight size={16} />
          </PillButton>
        </div>
      </div>

      {/* Empty session state */}
      {sessionData.songs.length === 0 && (
        <div style={{ background: C.surface, borderRadius: '20px', border: `1.5px solid ${C.border}`, padding: '48px 24px', textAlign: 'center', color: C.textMuted, fontFamily: f.sans }}>
          <Music2 size={32} color={C.border} style={{ marginBottom: '12px' }} />
          <p style={{ margin: 0 }}>No songs in this session.</p>
        </div>
      )}
    </>
  )
}
