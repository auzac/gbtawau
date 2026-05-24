// src/features/lyrics/LyricsSession.jsx
import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchSongs, fetchSongsByIds, fetchSessionByCode, fetchActiveSessions, checkSessionCode, createSession, createSessionSongs, fetchSessionSongIds } from '../../services/lyrics'
import { Plus, RefreshCw, X } from 'lucide-react'
import IconButton from '../../components/ui/IconButton'
import JoinSession from './JoinSession'
import CreateSession from './CreateSession'
import SessionViewer from './SessionViewer'

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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const generateCode = async () => {
  for (let i = 0; i < 10; i++) {
    const code = Math.floor(1000 + Math.random() * 9000).toString()
    const data = await checkSessionCode(code)
    if (!data) return code
  }
  return Math.floor(1000 + Math.random() * 9000).toString()
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
    fetchSongs().then(data => { setSongs(data || []); setSongsLoading(false) }).catch(() => setSongsLoading(false))
  }, [])

  // ── Auto-join from URL ──────────────────────────────────────────────────────
  useEffect(() => {
    if (urlCode) { setJoinCode(urlCode); loadSession(urlCode) }
    else { setSessionData(null); setActiveSongIdx(0) }
  }, [urlCode])

  // ── Load active sessions ────────────────────────────────────────────────────
  const refreshSessions = useCallback(async () => {
    setSessionsLoading(true)
    try {
      const data = await fetchActiveSessions()
      setActiveSessions(data || [])
    } catch { setActiveSessions([]) }
    setSessionsLoading(false)
  }, [])

  useEffect(() => { refreshSessions() }, [refreshSessions])

  // ── Load session ────────────────────────────────────────────────────────────
  const loadSession = async code => {
    if (!code) return
    setSessionLoading(true); setError(''); setSessionData(null)
    try {
      const sess = await fetchSessionByCode(code)
      if (!sess)  { setError('Session not found'); return }
      if (sess.expires_at && new Date(sess.expires_at) < new Date()) { setError('This session has expired'); return }

      const links = await fetchSessionSongIds(sess.id)
      if (!links?.length) { setSessionData({ ...sess, songs: [] }); return }

      const songData = await fetchSongsByIds(links.map(l => l.song_id))
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
      const sess = await createSession({ sessionCode: createCode, expiresAt: expiresAt.toISOString() })
      await createSessionSongs(Array.from(selectedIds).map(id => ({ session_id: sess.id, song_id: id })))
      setShowCreate(false)
      navigate(`/lyrics/join/${createCode}`)
    } catch (err) {
      if (err?.code === '23505') { setError('Code taken — try again'); setCreateCode(await generateCode()) }
      else setError('Failed to create session')
    }
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

  const currentSong  = sessionData?.songs[activeSongIdx]
  const totalSongs   = sessionData?.songs.length ?? 0

  const handleCloseSession = () => {
    setSessionData(null); setJoinCode(''); navigate('/lyrics')
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: f.sans }}>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '20px 16px 80px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: C.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={18} color="#FAF8F5" />
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

        <JoinSession
          joinCode={joinCode}
          onCodeChange={setJoinCode}
          onJoin={loadSession}
          sessions={activeSessions}
          visible={!sessionData}
        />

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
            <RefreshCw size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Loading session...
          </div>
        )}

        {/* ── Session viewer ── */}
        {sessionData && !sessionLoading && (
          <SessionViewer
            sessionData={sessionData}
            joinCode={joinCode}
            songIndex={activeSongIdx}
            onSongChange={setActiveSongIdx}
            copied={copied}
            onCopyLink={copyLink}
            onClose={handleCloseSession}
          />
        )}
      </div>

      {/* ── Create modal ── */}
      <CreateSession
        visible={showCreate}
        createCode={createCode}
        onCreateCodeChange={setCreateCode}
        expiryHours={expiryHours}
        onExpiryChange={setExpiryHours}
        selectedIds={selectedIds}
        onToggleSong={toggleSong}
        search={search}
        onSearchChange={setSearch}
        songs={songs}
        songsLoading={songsLoading}
        error={error}
        onCreate={handleCreate}
        onClose={() => setShowCreate(false)}
        isCreating={isCreating}
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, select:focus { border-color: ${C.accentDark} !important; box-shadow: 0 0 0 3px ${C.accentBg} !important; outline: none; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
