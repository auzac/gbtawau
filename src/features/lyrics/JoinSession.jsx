// src/features/lyrics/JoinSession.jsx
import { LogIn } from 'lucide-react'

// ─── Tokens ───────────────────────────────────────────────────────────────────
const C = {
  surface:     '#FFFFFF',
  surfaceAlt:  '#F5EFE6',
  border:      '#EAE1D4',
  text:        '#2D2926',
  textMid:     '#57534E',
  textMuted:   '#9A8B80',
  accentDark:  '#92622E',
  disabledBg:  '#EAE1D4',
  disabledText:'#9A8B80',
}
const f = { serif: "'Lora', serif", sans: "'DM Sans', sans-serif" }
const inp = (extra = {}) => ({
  width: '100%', padding: '11px 14px', border: `1.5px solid ${C.border}`,
  borderRadius: '12px', fontSize: '15px', background: C.surface,
  color: C.text, outline: 'none', boxSizing: 'border-box',
  fontFamily: f.sans, ...extra,
})

// ─── Helpers ──────────────────────────────────────────────────────────────────
const timeLeft = expiresAt => {
  if (!expiresAt) return null
  const mins = Math.round((new Date(expiresAt) - Date.now()) / 60000)
  if (mins <= 0) return 'Expired'
  if (mins < 60) return `${mins}m left`
  return `${Math.floor(mins / 60)}h ${mins % 60}m left`
}

export default function JoinSession({ joinCode, onCodeChange, onJoin, sessions, onLoadSession, visible }) {
  if (!visible) return null

  return (
    <div style={{ background: C.surface, borderRadius: '20px', border: `1.5px solid ${C.border}`, padding: '20px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <LogIn size={16} color={C.accentDark} />
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, fontFamily: f.serif, color: C.text }}>Join a Session</h2>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text" inputMode="numeric" placeholder="Enter code"
          value={joinCode}
          onChange={e => onCodeChange(e.target.value.replace(/\D/g,'').slice(0,4))}
          onKeyDown={e => e.key === 'Enter' && onJoin(joinCode)}
          style={{ ...inp(), flex: 1, fontSize: '22px', textAlign: 'center', letterSpacing: '6px', fontWeight: 600, padding: '14px' }}
        />
        <button
          onClick={() => onJoin(joinCode)}
          disabled={joinCode.length !== 4}
          style={{ padding: '14px 22px', borderRadius: '12px', border: 'none', background: joinCode.length === 4 ? C.accentDark : C.disabledBg, color: joinCode.length === 4 ? '#fff' : C.disabledText, fontSize: '14px', fontWeight: 600, fontFamily: f.sans, cursor: joinCode.length === 4 ? 'pointer' : 'not-allowed', transition: 'background 0.15s', whiteSpace: 'nowrap' }}>
          Join
        </button>
      </div>

      {sessions.length > 0 && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${C.border}` }}>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.textMuted, margin: '0 0 10px', fontFamily: f.sans }}>Active sessions</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {sessions.map(s => (
              <button key={s.session_code} onClick={() => { onCodeChange(s.session_code); onJoin(s.session_code) }} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.surfaceAlt, border: `1.5px solid ${C.border}`, borderRadius: '99px', padding: '6px 12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: f.sans, color: C.text }}>
                {s.session_code}
                {s.expires_at && <span style={{ fontSize: '10px', color: C.textMuted, fontWeight: 400 }}>{timeLeft(s.expires_at)}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
