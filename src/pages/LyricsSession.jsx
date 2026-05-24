// src/pages/LyricsSession.jsx
import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  Search, Copy, CheckCircle, Music2, LogIn,
  ChevronLeft, ChevronRight, Plus, RefreshCw, X, Clock
} from 'lucide-react'

// ─── Tokens ───────────────────────────────────────────────────────────────────
const C = {
  bg:          '#FAF8F5',
  surface:     '#FFFFFF',
  surfaceAlt:  '#F5EFE6',
  border:      '#EAE1D4',
  text:        '#2D2926',
  textMid:     '#57534E',
  textMuted:   '#9A8B80',
  accentDark:  '#92622E',
  accentBg:    '#FDF3E8',
  disabledBg:  '#EAE1D4',
  disabledText:'#9A8B80',
}
const f = { serif: "'Lora', serif", sans: "'DM Sans', sans-serif" }

// ─── Shared atoms ─────────────────────────────────────────────────────────────
const inp = (extra = {}) => ({
  width: '100%', padding: '11px 14px', border: `1.5px solid ${C.border}`,
  borderRadius: '12px', fontSize: '15px', background: C.surface,
  color: C.text, outline: 'none', boxSizing: 'border-box',
  fontFamily: f.sans, ...extra,
})

// Icon-only circular button (shared)
import IconButton from '../components/ui/IconButton'
import PillButton from '../components/ui/PillButton'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const generateCode = async () => {
  for (let i = 0; i < 10; i++) {
    const code = Math.floor(1000 + Math.random() * 9000).toString()
    const { data } = await supabase.from('public_sessions').select('session_code').eq('session_code', code).maybeSingle()
    if (!data) return code
  }
  return Math.floor(1000 + Math.random() * 9000).toString()
}

const timeLeft = expiresAt => {
  if (!expiresAt) return null
  const mins = Math.round((new Date(expiresAt) - Date.now()) / 60000)
  if (mins <= 0) return 'Expired'
  if (mins < 60) return `${mins}m left`
  return `${Math.floor(mins / 60)}h ${mins % 60}m left`
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LyricsSession() {
  const navigate = useNavigate()
  const { code: urlCode } = useParams()

  // Songs
  const [songs,        setSongs]        = useState([])
  const [songsLoading, setSongsLoading] = useState(true)
  const [search,       setSearch]       = useState('')

  // Create modal
  const [showCreate,      setShowCreate]      = useState(false)
  const [createCode,      setCreateCode]      = useState('')
  const [expiryHours,     setExpiryHours]     = useState(2)
  const [selectedIds,     setSelectedIds]     = useState(new Set())
  const [isCreating,      setIsCreating]      = useState(false)

  // Join & session
  const [joinCode,         setJoinCode]         = useState(urlCode || '')
  const [sessionData,      setSessionData]      = useState(null)
  const [sessionLoading,   setSessionLoading]   = useState(false)
  const [activeSongIdx,    setActiveSongIdx]    = useState(0)
  const [error,            setError]            = useState('')
  const [copied,           setCopied]           = useState(false)
  const [activeSessions,   setActiveSessions]   = useState([])
  const [sessionsLoading,  setSessionsLoading]  = useState(false)

  // ── Load songs ──────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.from('songs').select('id, title, lyrics').order('title')
      .then(({ data, error }) => { if (!error) setSongs(data || []); setSongsLoading(false) })
  }, [])

  // ── Auto-join from URL ──────────────────────────────────────────────────────
  useEffect(() => {
    if (urlCode) { setJoinCode(urlCode); loadSession(urlCode) }
    else { setSessionData(null); setActiveSongIdx(0) }
  }, [urlCode])

  // ── Load active sessions ────────────────────────────────────────────────────
  const refreshSessions = useCallback(async () => {
    setSessionsLoading(true)
    const { data } = await supabase
      .from('public_sessions')
      .select('session_code, expires_at, created_at')
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('created_at', { ascending: false })
      .limit(10)
    setActiveSessions(data || [])
    setSessionsLoading(false)
  }, [])

  // Auto-load sessions on mount
  useEffect(() => { refreshSessions() }, [refreshSessions])

  // ── Load session ────────────────────────────────────────────────────────────
  const loadSession = async code => {
    if (!code) return
    setSessionLoading(true); setError(''); setSessionData(null)
    try {
      const { data: sess, error: sErr } = await supabase
        .from('public_sessions').select('*').eq('session_code', code).maybeSingle()
      if (sErr || !sess)  { setError('Session not found'); return }
      if (sess.expires_at && new Date(sess.expires_at) < new Date()) { setError('This session has expired'); return }

      const { data: links } = await supabase.from('session_songs').select('song_id').eq('session_id', sess.id)
      if (!links?.length) { setSessionData({ ...sess, songs: [] }); return }

      const { data: songData } = await supabase.from('songs').select('id, title, lyrics').in('id', links.map(l => l.song_id))
      setSessionData({ ...sess, songs: songData || [] })
      setActiveSongIdx(0)
    } catch { setError('Failed to load session') }
    finally { setSessionLoading(false) }
  }

  // ── Open create modal ───────────────────────────────────────────────────────
  const openCreate = async () => {
    const code = await generateCode()
    setCreateCode(code); setExpiryHours(2); setSelectedIds(new Set()); setSearch(''); setShowCreate(true)
  }

  // ── Handle create ───────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!selectedIds.size) { setError('Select at least one song'); return }
    setIsCreating(true); setError('')
    try {
      const expiresAt = new Date(); expiresAt.setHours(expiresAt.getHours() + expiryHours)
      const { data: sess, error: sErr } = await supabase
        .from('public_sessions').insert({ session_code: createCode, expires_at: expiresAt.toISOString() }).select().single()
      if (sErr) {
        if (sErr.code === '23505') { setError('Code taken — try again'); setCreateCode(await generateCode()) }
        else throw sErr
        return
      }
      await supabase.from('session_songs').insert(Array.from(selectedIds).map(id => ({ session_id: sess.id, song_id: id })))
      setShowCreate(false)
      navigate(`/lyrics/join/${createCode}`)
    } catch { setError('Failed to create session') }
    finally { setIsCreating(false) }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/lyrics/join/${joinCode}`)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const toggleSong = id => {
    const next = new Set(selectedIds)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelectedIds(next)
  }

  const filtered = search.trim()
    ? songs.filter(s => s.title.toLowerCase().includes(search.toLowerCase()))
    : songs

  const currentSong  = sessionData?.songs[activeSongIdx]
  const totalSongs   = sessionData?.songs.length ?? 0

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: f.sans }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '20px 16px 80px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: C.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Music2 size={18} color="#FAF8F5" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600, fontFamily: f.serif, color: C.text, lineHeight: 1.2 }}>Lyrics Master</h1>
              <p style={{ margin: 0, fontSize: '11px', color: C.textMuted }}>Instant Worship Session</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <IconButton onClick={refreshSessions}><RefreshCw size={15} color={sessionsLoading ? C.accentDark : C.textMid} style={{ animation: sessionsLoading ? 'spin 0.8s linear infinite' : 'none' }} /></IconButton>
            <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '99px', border: 'none', background: C.text, color: '#FAF8F5', fontSize: '13px', fontWeight: 600, fontFamily: f.sans, cursor: 'pointer' }}>
              <Plus size={15} /> New Session
            </button>
          </div>
        </div>

        {/* ── Join card ── */}
        {!sessionData && (
          <div style={{ background: C.surface, borderRadius: '20px', border: `1.5px solid ${C.border}`, padding: '20px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <LogIn size={16} color={C.accentDark} />
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, fontFamily: f.serif, color: C.text }}>Join a Session</h2>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text" inputMode="numeric" placeholder="Enter code"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.replace(/\D/g,'').slice(0,4))}
                onKeyDown={e => e.key === 'Enter' && loadSession(joinCode)}
                style={{ ...inp(), flex: 1, fontSize: '22px', textAlign: 'center', letterSpacing: '6px', fontWeight: 600, padding: '14px' }}
              />
              <button
                onClick={() => loadSession(joinCode)}
                disabled={joinCode.length !== 4}
                style={{ padding: '14px 22px', borderRadius: '12px', border: 'none', background: joinCode.length === 4 ? C.accentDark : C.disabledBg, color: joinCode.length === 4 ? '#fff' : C.disabledText, fontSize: '14px', fontWeight: 600, fontFamily: f.sans, cursor: joinCode.length === 4 ? 'pointer' : 'not-allowed', transition: 'background 0.15s', whiteSpace: 'nowrap' }}>
                Join
              </button>
            </div>

            {/* Active sessions */}
            {activeSessions.length > 0 && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${C.border}` }}>
                <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.textMuted, margin: '0 0 10px', fontFamily: f.sans }}>Active sessions</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {activeSessions.map(s => (
                    <button key={s.session_code} onClick={() => { setJoinCode(s.session_code); loadSession(s.session_code) }} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.surfaceAlt, border: `1.5px solid ${C.border}`, borderRadius: '99px', padding: '6px 12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: f.sans, color: C.text }}>
                      {s.session_code}
                      {s.expires_at && <span style={{ fontSize: '10px', color: C.textMuted, fontWeight: 400 }}>{timeLeft(s.expires_at)}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Error ── */}
        {error && !showCreate && (
          <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', fontSize: '14px', fontFamily: f.sans, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <X size={15} />{error}
            <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: 0 }}><X size={14} /></button>
          </div>
        )}

        {/* ── Session loading ── */}
        {sessionLoading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '40px', color: C.textMuted, fontSize: '14px' }}>
            <RefreshCw size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Loading session…
          </div>
        )}

        {/* ── Lyrics reader ── */}
        {sessionData && !sessionLoading && (
          <div style={{ background: C.surface, borderRadius: '20px', border: `1.5px solid ${C.border}`, overflow: 'hidden' }}>

            {/* Session header */}
            <div style={{ padding: '16px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.textMuted, fontFamily: f.sans }}>Session</span>
                  <span style={{ fontSize: '15px', fontWeight: 700, fontFamily: f.serif, color: C.text, letterSpacing: '3px' }}>{joinCode}</span>
                </div>
                <p style={{ margin: '2px 0 0', fontSize: '11px', color: C.textMuted, fontFamily: f.sans }}>{activeSongIdx + 1} of {totalSongs} songs</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <IconButton onClick={copyLink} style={{ background: copied ? '#F0FAF0' : C.surface, borderColor: copied ? '#C8E6C9' : C.border }}>
                  {copied ? <CheckCircle size={15} color="#2E7D32" /> : <Copy size={15} color={C.textMid} />}
                </IconButton>
                <IconButton onClick={() => { setSessionData(null); setJoinCode(''); navigate('/lyrics') }}>
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
                  <button key={song.id} onClick={() => setActiveSongIdx(idx)} style={{ flexShrink: 0, padding: '7px 14px', borderRadius: '99px', border: `1.5px solid ${idx === activeSongIdx ? C.accentDark : C.border}`, background: idx === activeSongIdx ? C.accentBg : C.surface, color: idx === activeSongIdx ? C.accentDark : C.textMid, fontSize: '12px', fontWeight: idx === activeSongIdx ? 600 : 400, fontFamily: f.sans, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {song.title}
                  </button>
                ))}
              </div>
            )}

            {/* Prev / Next navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderTop: `1px solid ${C.border}`, background: C.bg }}>
              <PillButton
                onClick={() => setActiveSongIdx(p => p - 1)}
                disabled={activeSongIdx === 0}
                style={{ padding: '10px 18px', fontSize: '13px' }}
              >
                <ChevronLeft size={16} /> Prev
              </PillButton>
              {/* Dot indicators */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {sessionData.songs.map((_, idx) => (
                  <button key={idx} onClick={() => setActiveSongIdx(idx)} style={{ width: idx === activeSongIdx ? '18px' : '7px', height: '7px', borderRadius: '99px', background: idx === activeSongIdx ? C.accentDark : C.border, border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.2s' }} />
                ))}
              </div>
              <PillButton
                onClick={() => setActiveSongIdx(p => p + 1)}
                disabled={activeSongIdx === totalSongs - 1}
                style={{ padding: '10px 18px', fontSize: '13px' }}
              >
                Next <ChevronRight size={16} />
              </PillButton>
            </div>
          </div>
        )}

        {/* Empty session state */}
        {sessionData && sessionData.songs.length === 0 && (
          <div style={{ background: C.surface, borderRadius: '20px', border: `1.5px solid ${C.border}`, padding: '48px 24px', textAlign: 'center', color: C.textMuted, fontFamily: f.sans }}>
            <Music2 size={32} color={C.border} style={{ marginBottom: '12px' }} />
            <p style={{ margin: 0 }}>No songs in this session.</p>
          </div>
        )}
      </div>

      {/* ── Create modal ── */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(3px)' }} onClick={() => setShowCreate(false)}>
          <div style={{ background: C.surface, borderRadius: '24px 24px 0 0', width: '100%', maxWidth: '680px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', paddingBottom: 'env(safe-area-inset-bottom, 16px)' }} onClick={e => e.stopPropagation()}>

            {/* Drag handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
              <div style={{ width: '36px', height: '4px', borderRadius: '99px', background: C.border }} />
            </div>

            {/* Modal header */}
            <div style={{ padding: '10px 20px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, fontFamily: f.serif, color: C.text }}>Create Session</h2>
              <IconButton onClick={() => setShowCreate(false)}><X size={15} color={C.textMid} /></IconButton>
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
                    onChange={e => setCreateCode(e.target.value.replace(/\D/g,'').slice(0,4))}
                    style={{ ...inp(), textAlign: 'center', letterSpacing: '6px', fontWeight: 700, fontSize: '20px' }}
                  />
                </div>
                <div>
                  <p style={{ margin: '0 0 6px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.textMuted, fontFamily: f.sans }}>Expires in</p>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[1,2,4,8].map(h => (
                      <button key={h} onClick={() => setExpiryHours(h)} style={{ flex: 1, padding: '11px 0', borderRadius: '10px', border: `1.5px solid ${expiryHours === h ? C.accentDark : C.border}`, background: expiryHours === h ? C.accentBg : C.surface, color: expiryHours === h ? C.accentDark : C.textMid, fontSize: '13px', fontWeight: 600, fontFamily: f.sans, cursor: 'pointer' }}>
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
                    type="text" placeholder="Search songs…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ ...inp(), paddingLeft: '34px' }}
                  />
                </div>

                <div style={{ border: `1.5px solid ${C.border}`, borderRadius: '14px', overflow: 'hidden', maxHeight: '300px', overflowY: 'auto' }}>
                  {songsLoading ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: C.textMuted, fontSize: '14px' }}>Loading songs…</div>
                  ) : filtered.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: C.textMuted, fontSize: '14px' }}>No songs found</div>
                  ) : filtered.map((song, idx) => {
                    const checked = selectedIds.has(song.id)
                    return (
                      <label key={song.id} style={{ display: 'flex', gap: '12px', padding: '12px 14px', borderTop: idx === 0 ? 'none' : `1px solid ${C.border}`, cursor: 'pointer', alignItems: 'flex-start', background: checked ? C.accentBg : 'transparent', transition: 'background 0.1s' }}>
                        <input type="checkbox" checked={checked} onChange={() => toggleSong(song.id)} style={{ marginTop: '2px', accentColor: C.accentDark, width: '16px', height: '16px', flexShrink: 0 }} />
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', fontFamily: f.serif, color: C.text }}>{song.title}</p>
                          <p style={{ margin: '3px 0 0', fontSize: '12px', color: C.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.lyrics.slice(0, 70)}…</p>
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
                onClick={handleCreate}
                primary
                disabled={isCreating || selectedIds.size === 0}
                style={{ width: '100%', padding: '14px', borderRadius: '14px' }}
              >
                {isCreating ? 'Creating…' : `Create Session · ${selectedIds.size} song${selectedIds.size !== 1 ? 's' : ''}`}
              </PillButton>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, select:focus { border-color: ${C.accentDark} !important; box-shadow: 0 0 0 3px ${C.accentBg} !important; outline: none; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}