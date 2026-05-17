// src/pages/LyricsSession.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Search, Copy, CheckCircle } from 'lucide-react'

const C = {
  bg: '#FAF8F5',
  surface: '#FFFFFF',
  border: '#EAE1D4',
  text: '#2D2926',
  textMuted: '#9A8B80',
  accentDark: '#92622E',
}

const font = { sans: "'DM Sans', sans-serif", serif: "'Lora', serif" }

export default function LyricsSession() {
  const navigate = useNavigate()
  const { mode, code } = useParams()
  const [activeMode, setActiveMode] = useState(mode === 'join' ? 'join' : 'create')
  const [sessionCode, setSessionCode] = useState(code || '')
  const [expiryOption, setExpiryOption] = useState('2h')
  const expiryOptions = [
    { value: '2h', label: '2 hours', hours: 2 },
    { value: '12h', label: '12 hours', hours: 12 },
    { value: '1d', label: '1 day', hours: 24 },
    { value: '7d', label: '7 days', hours: 168 },
    { value: 'never', label: 'Never', hours: null }
  ]
  const [songs, setSongs] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSongIds, setSelectedSongIds] = useState(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [sessionData, setSessionData] = useState(null)
  const [copied, setCopied] = useState(false)

  // Load all songs (public read)
  useEffect(() => {
    const loadSongs = async () => {
      const { data, error } = await supabase.from('songs').select('id, title, lyrics').order('title')
      if (!error) setSongs(data)
    }
    loadSongs()
  }, [])

  // Filter songs
  const filteredSongs = !searchTerm.trim()
    ? songs
    : songs.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()))

  // If join mode and code present, load session
  useEffect(() => {
    if (activeMode === 'join' && sessionCode) loadSession(sessionCode)
  }, [activeMode, sessionCode])

  const loadSession = async (code) => {
    const { data: session, error: sErr } = await supabase
      .from('public_sessions')
      .select('id, session_code, expires_at')
      .eq('session_code', code)
      .maybeSingle()
    if (sErr || !session) {
      setError('Session not found')
      setSessionData(null)
      return
    }
    if (session.expires_at && new Date(session.expires_at) < new Date()) {
      setError('This session has expired')
      setSessionData(null)
      return
    }
    const { data: ss } = await supabase.from('session_songs').select('song_id').eq('session_id', session.id)
    if (!ss || ss.length === 0) {
      setSessionData({ ...session, songs: [] })
      return
    }
    const { data: songRows } = await supabase.from('songs').select('id, title, lyrics').in('id', ss.map(s => s.song_id))
    setSessionData({ ...session, songs: songRows || [] })
    setError('')
  }

  const getExpiresAt = () => {
    const opt = expiryOptions.find(o => o.value === expiryOption)
    if (!opt.hours) return null
    const d = new Date()
    d.setHours(d.getHours() + opt.hours)
    return d.toISOString()
  }

  const handleCreateSession = async () => {
    const trimmed = sessionCode.trim()
    if (!/^\d{4}$/.test(trimmed)) { setError('Session code must be exactly 4 digits'); return }
    if (selectedSongIds.size === 0) { setError('Select at least one song'); return }
    setIsSubmitting(true); setError('')
    try {
      const expiresAt = getExpiresAt()
      const { data: session, error: sErr } = await supabase
        .from('public_sessions')
        .insert({ session_code: trimmed, expires_at: expiresAt })
        .select()
        .single()
      if (sErr) {
        if (sErr.code === '23505') setError('Code already taken, choose another')
        else throw sErr
        setIsSubmitting(false); return
      }
      const rows = Array.from(selectedSongIds).map(songId => ({ session_id: session.id, song_id: songId }))
      const { error: insErr } = await supabase.from('session_songs').insert(rows)
      if (insErr) throw insErr
      navigate(`/lyrics/join/${trimmed}`)
    } catch (err) {
      console.error(err)
      setError('Failed to create session')
      setIsSubmitting(false)
    }
  }

  const copyLink = () => {
    const url = `${window.location.origin}/lyrics/join/${sessionCode}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ─── JOIN VIEW ─────────────────────────────────────────
  if (activeMode === 'join') {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: font.sans, padding: '20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <button onClick={() => navigate('/lyrics/create')} style={{ background: 'none', border: 'none', color: C.accentDark, cursor: 'pointer', marginBottom: '20px' }}>
            ← Create your own session
          </button>
          <div style={{ background: C.surface, borderRadius: '24px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontFamily: font.serif, color: C.text }}>Lyrics Session</h1>
                <p style={{ color: C.textMuted }}>Code: <strong>{sessionCode}</strong></p>
              </div>
              <button onClick={copyLink} style={{ padding: '8px 16px', borderRadius: '40px', border: `1.5px solid ${C.border}`, background: C.surface, cursor: 'pointer', display: 'flex', gap: '8px' }}>
                {copied ? <CheckCircle size={16} color={C.accentDark} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Share link'}
              </button>
            </div>
            {error && <div style={{ background: '#FEF2F2', padding: '12px', borderRadius: '12px', color: '#DC2626', marginBottom: '20px' }}>{error}</div>}
            {!sessionData ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
            ) : sessionData.songs.length === 0 ? (
              <p>No songs in this session.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {sessionData.songs.map((song, idx) => (
                  <div key={song.id} style={{ borderBottom: idx !== sessionData.songs.length-1 ? `1px solid ${C.border}` : 'none', paddingBottom: '24px' }}>
                    <h2 style={{ fontSize: '22px', fontFamily: font.serif, color: C.text }}>{song.title}</h2>
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: C.textMuted }}>
                      {song.lyrics.split('\n').map((line, i) => <p key={i} style={{ margin: '6px 0' }}>{line}</p>)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ─── CREATE VIEW ────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: font.sans, padding: '20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', marginBottom: '12px' }}>← Back</button>
        <h1 style={{ fontSize: '28px', fontFamily: font.serif, color: C.text }}>Create a Lyrics Session</h1>
        <p style={{ color: C.textMuted }}>Pick songs, set a 4‑digit code, choose expiry, share the link.</p>

        <div style={{ background: C.surface, borderRadius: '24px', padding: '24px', marginBottom: '20px' }}>
          <label style={{ fontWeight: 500, display: 'block', marginBottom: '8px' }}>Session Code (4 digits)</label>
          <input type="text" value={sessionCode} onChange={e => setSessionCode(e.target.value.replace(/\D/g,'').slice(0,4))} placeholder="1234" maxLength={4} style={{ width: '100%', padding: '12px', fontSize: '18px', textAlign: 'center', letterSpacing: '4px', borderRadius: '12px', border: `1.5px solid ${C.border}` }} />
        </div>

        <div style={{ background: C.surface, borderRadius: '24px', padding: '24px' }}>
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: C.textMuted }} />
            <input type="text" placeholder="Search songs..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '40px', border: `1.5px solid ${C.border}` }} />
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '20px' }}>
            {filteredSongs.map(song => (
              <label key={song.id} style={{ display: 'flex', gap: '12px', padding: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedSongIds.has(song.id)} onChange={e => {
                  const newSet = new Set(selectedSongIds)
                  e.target.checked ? newSet.add(song.id) : newSet.delete(song.id)
                  setSelectedSongIds(newSet)
                }} style={{ width: '18px', height: '18px', marginTop: '2px' }} />
                <div><strong>{song.title}</strong><div style={{ fontSize: '12px', color: C.textMuted }}>{song.lyrics.substring(0, 80)}…</div></div>
              </label>
            ))}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: '8px' }}>Session expires</label>
            <select value={expiryOption} onChange={e => setExpiryOption(e.target.value)} style={{ padding: '10px', borderRadius: '12px', border: `1.5px solid ${C.border}`, width: '100%' }}>
              {expiryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{selectedSongIds.size} song(s) selected</span>
            <button onClick={handleCreateSession} disabled={isSubmitting || !sessionCode || selectedSongIds.size === 0} style={{ padding: '12px 24px', borderRadius: '40px', background: (isSubmitting || !sessionCode || selectedSongIds.size === 0) ? C.border : C.accentDark, color: '#fff', border: 'none', cursor: 'pointer' }}>
              {isSubmitting ? 'Creating...' : 'Create Session'}
            </button>
          </div>
          {error && <div style={{ marginTop: '16px', background: '#FEF2F2', padding: '12px', borderRadius: '12px', color: '#DC2626' }}>{error}</div>}
        </div>
      </div>
    </div>
  )
}