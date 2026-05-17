// src/pages/LyricsSession.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  Search,
  Copy,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Music2,
  LogIn,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  X
} from 'lucide-react'

const C = {
  bg: '#FAF8F5',
  surface: '#FFFFFF',
  border: '#EAE1D4',
  text: '#2D2926',
  textMuted: '#8A7B70',
  accentDark: '#92622E',
  redBg: '#FEF2F2',
  redText: '#DC2626',
  disabledBg: '#E2DCD5',
  disabledText: '#8A7B70'
}

const font = {
  sans: "'DM Sans', sans-serif",
  serif: "'Lora', serif"
}

export default function LyricsSession() {
  const navigate = useNavigate()
  const { code } = useParams()

  // Songs library
  const [songs, setSongs] = useState([])
  const [loadingSongs, setLoadingSongs] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSongIds, setSelectedSongIds] = useState(new Set())

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createCode, setCreateCode] = useState('')
  const [expiryHours, setExpiryHours] = useState(2)
  const [isCreating, setIsCreating] = useState(false)

  // Join & session data
  const [joinCode, setJoinCode] = useState(code || '')
  const [sessionData, setSessionData] = useState(null)
  const [isLoadingSession, setIsLoadingSession] = useState(false)
  const [activeSongIndex, setActiveSongIndex] = useState(0)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [activeSessions, setActiveSessions] = useState([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Load songs on mount
  useEffect(() => {
    const loadSongs = async () => {
      setLoadingSongs(true)
      const { data, error } = await supabase
        .from('songs')
        .select('id, title, lyrics')
        .order('title')
      if (!error) setSongs(data || [])
      setLoadingSongs(false)
    }
    loadSongs()
  }, [])

  // Auto join from URL param
  useEffect(() => {
    if (code) {
      setJoinCode(code)
      loadSession(code)
    } else {
      setSessionData(null)
      setActiveSongIndex(0)
    }
  }, [code])

  // Generate a random unused 4‑digit code
  const generateRandomCode = async () => {
    let newCode = Math.floor(1000 + Math.random() * 9000).toString()
    let exists = true
    while (exists) {
      const { data } = await supabase
        .from('public_sessions')
        .select('session_code')
        .eq('session_code', newCode)
        .maybeSingle()
      if (!data) {
        exists = false
      } else {
        newCode = Math.floor(1000 + Math.random() * 9000).toString()
      }
    }
    return newCode
  }

  const openCreateModal = async () => {
    const randomCode = await generateRandomCode()
    setCreateCode(randomCode)
    setExpiryHours(2)
    setSelectedSongIds(new Set())
    setSearchTerm('')
    setShowCreateModal(true)
  }

  const handleCreateSession = async () => {
    if (selectedSongIds.size === 0) {
      setError('Select at least one song')
      return
    }
    setIsCreating(true)
    setError('')

    try {
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + expiryHours)
      const { data: session, error: sessionErr } = await supabase
        .from('public_sessions')
        .insert({
          session_code: createCode,
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single()

      if (sessionErr) {
        if (sessionErr.code === '23505') {
          setError('Code already taken, try again')
          const newCode = await generateRandomCode()
          setCreateCode(newCode)
        } else {
          throw sessionErr
        }
        setIsCreating(false)
        return
      }

      const rows = Array.from(selectedSongIds).map(songId => ({
        session_id: session.id,
        song_id: songId
      }))
      const { error: insertErr } = await supabase
        .from('session_songs')
        .insert(rows)
      if (insertErr) throw insertErr

      setShowCreateModal(false)
      navigate(`/lyrics/join/${createCode}`)
    } catch (err) {
      console.error(err)
      setError('Failed to create session')
    } finally {
      setIsCreating(false)
    }
  }

  const loadSession = async targetCode => {
    if (!targetCode) return
    setIsLoadingSession(true)
    setError('')
    setSessionData(null)

    try {
      const { data: session, error: sessionErr } = await supabase
        .from('public_sessions')
        .select('*')
        .eq('session_code', targetCode)
        .maybeSingle()

      if (sessionErr || !session) {
        setError('Session not found')
        setIsLoadingSession(false)
        return
      }

      if (session.expires_at && new Date(session.expires_at) < new Date()) {
        setError('This session has expired')
        setIsLoadingSession(false)
        return
      }

      const { data: sessionSongs, error: linkErr } = await supabase
        .from('session_songs')
        .select('song_id')
        .eq('session_id', session.id)

      if (linkErr) throw linkErr

      if (!sessionSongs || sessionSongs.length === 0) {
        setSessionData({ ...session, songs: [] })
        setIsLoadingSession(false)
        return
      }

      const songIds = sessionSongs.map(s => s.song_id)
      const { data: songsData, error: songsErr } = await supabase
        .from('songs')
        .select('id, title, lyrics')
        .in('id', songIds)

      if (songsErr) throw songsErr

      setSessionData({
        ...session,
        songs: songsData || []
      })
      setActiveSongIndex(0)
    } catch (err) {
      console.error(err)
      setError('Failed to load session')
    } finally {
      setIsLoadingSession(false)
    }
  }

  const refreshActiveSessions = async () => {
    setIsRefreshing(true)
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('public_sessions')
      .select('session_code, expires_at, created_at')
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order('created_at', { ascending: false })
      .limit(20)
    if (!error) setActiveSessions(data || [])
    setIsRefreshing(false)
  }

  const copyLink = () => {
    if (!joinCode) return
    const url = `${window.location.origin}/lyrics/join/${joinCode}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const filteredSongs = !searchTerm.trim()
    ? songs
    : songs.filter(song => song.title.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div style={{ minHeight: '100vh', background: C.bg, padding: '24px', fontFamily: font.sans }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Lora:wght@500;600;700&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '42px', fontFamily: font.serif, color: C.text }}>Lyrics Session</h1>
            <p style={{ marginTop: '8px', color: C.textMuted }}>Create and share worship lyrics instantly</p>
          </div>
          <button
            onClick={refreshActiveSessions}
            style={{
              background: 'none',
              border: `1.5px solid ${C.border}`,
              borderRadius: '40px',
              padding: '10px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontFamily: font.sans,
              background: C.surface
            }}
          >
            <RefreshCw size={16} /> {isRefreshing ? 'Refreshing...' : 'Refresh sessions'}
          </button>
        </div>

        {/* Join Section */}
        <div style={{ background: C.surface, borderRadius: '28px', padding: '24px', border: `1px solid ${C.border}`, marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <LogIn size={20} color={C.accentDark} />
            <h2 style={{ margin: 0, fontSize: '24px', fontFamily: font.serif, color: C.text }}>Join Session</h2>
            <button
              onClick={openCreateModal}
              style={{
                marginLeft: 'auto',
                background: C.accentDark,
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white'
              }}
            >
              <Plus size={20} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="4‑digit code"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              style={{
                flex: 1,
                minWidth: '160px',
                padding: '14px',
                borderRadius: '18px',
                border: `1.5px solid ${C.border}`,
                fontSize: '18px',
                textAlign: 'center',
                letterSpacing: '4px',
                fontFamily: font.sans
              }}
            />
            <button
              onClick={() => loadSession(joinCode)}
              style={{
                border: 'none',
                background: C.accentDark,
                color: '#fff',
                borderRadius: '18px',
                padding: '0 28px',
                height: '54px',
                cursor: 'pointer',
                fontWeight: 700,
                fontFamily: font.sans
              }}
            >
              Join
            </button>
          </div>

          {/* Active sessions list */}
          {activeSessions.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <p style={{ fontSize: '13px', color: C.textMuted, marginBottom: '8px' }}>Active sessions:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {activeSessions.map(s => (
                  <button
                    key={s.session_code}
                    onClick={() => {
                      setJoinCode(s.session_code)
                      loadSession(s.session_code)
                    }}
                    style={{
                      background: '#F5EFE6',
                      border: `1px solid ${C.border}`,
                      borderRadius: '40px',
                      padding: '6px 14px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      fontFamily: font.sans,
                      fontWeight: 500
                    }}
                  >
                    {s.session_code}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Global error */}
        {error && (
          <div style={{ background: C.redBg, color: C.redText, padding: '14px', borderRadius: '18px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {/* Loading session */}
        {isLoadingSession && <div style={{ textAlign: 'center', padding: '30px', color: C.textMuted }}>Loading session...</div>}

        {/* Lyrics Reader (carousel) */}
        {sessionData && sessionData.songs.length > 0 && (
          <div style={{ background: C.surface, borderRadius: '28px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '28px', fontFamily: font.serif, color: C.text }}>Session {joinCode}</h2>
                <p style={{ marginTop: '4px', color: C.textMuted }}>Song {activeSongIndex + 1} of {sessionData.songs.length}</p>
              </div>
              <button
                onClick={copyLink}
                style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: '40px', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              >
                {copied ? <CheckCircle size={16} color={C.accentDark} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Share Link'}
              </button>
            </div>

            {/* Song title */}
            <div style={{ padding: '24px', borderBottom: `1px solid ${C.border}`, background: '#FDF8F2' }}>
              <h3 style={{ margin: 0, fontSize: '32px', fontFamily: font.serif, color: C.text }}>{sessionData.songs[activeSongIndex].title}</h3>
            </div>

            {/* Lyrics */}
            <div style={{ padding: '32px', maxHeight: '60vh', overflowY: 'auto' }}>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: '18px', color: C.text }}>
                {sessionData.songs[activeSongIndex].lyrics.split('\n').map((line, i) => (
                  <p key={i} style={{ margin: '8px 0' }}>{line || '\u00A0'}</p>
                ))}
              </div>
            </div>

            {/* Carousel controls */}
            <div style={{ borderTop: `1px solid ${C.border}`, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAF8F5' }}>
              <button
                disabled={activeSongIndex === 0}
                onClick={() => setActiveSongIndex(prev => prev - 1)}
                style={{
                  border: 'none',
                  background: activeSongIndex === 0 ? C.disabledBg : C.accentDark,
                  color: activeSongIndex === 0 ? C.disabledText : '#fff',
                  borderRadius: '40px',
                  padding: '10px 20px',
                  cursor: activeSongIndex === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600
                }}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <button
                disabled={activeSongIndex === sessionData.songs.length - 1}
                onClick={() => setActiveSongIndex(prev => prev + 1)}
                style={{
                  border: 'none',
                  background: activeSongIndex === sessionData.songs.length - 1 ? C.disabledBg : C.accentDark,
                  color: activeSongIndex === sessionData.songs.length - 1 ? C.disabledText : '#fff',
                  borderRadius: '40px',
                  padding: '10px 20px',
                  cursor: activeSongIndex === sessionData.songs.length - 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600
                }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>

            {/* Quick song selector */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '16px 20px', borderTop: `1px solid ${C.border}` }}>
              {sessionData.songs.map((song, idx) => (
                <button
                  key={song.id}
                  onClick={() => setActiveSongIndex(idx)}
                  style={{
                    border: idx === activeSongIndex ? `2px solid ${C.accentDark}` : `1px solid ${C.border}`,
                    background: idx === activeSongIndex ? '#FDF6EE' : '#fff',
                    borderRadius: '40px',
                    padding: '8px 16px',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    fontWeight: idx === activeSongIndex ? 700 : 500,
                    fontFamily: font.sans,
                    color: C.text
                  }}
                >
                  {song.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Create Session Modal */}
        {showCreateModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }} onClick={() => setShowCreateModal(false)}>
            <div style={{ background: C.surface, borderRadius: '28px', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto', padding: '24px' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontFamily: font.serif, color: C.text }}>Create Session</h2>
                <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Session Code</label>
                <input
                  type="text"
                  value={createCode}
                  onChange={e => setCreateCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="4 digits"
                  style={{ width: '100%', padding: '12px', borderRadius: '16px', border: `1.5px solid ${C.border}`, fontSize: '18px', textAlign: 'center', letterSpacing: '4px' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Expiry (hours) 1–12</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={expiryHours}
                  onChange={e => setExpiryHours(Math.min(12, Math.max(1, parseInt(e.target.value) || 1)))}
                  style={{ width: '100%', padding: '12px', borderRadius: '16px', border: `1.5px solid ${C.border}` }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Search Songs</label>
                <div style={{ position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: C.textMuted }} />
                  <input
                    type="text"
                    placeholder="Type to search..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '40px', border: `1.5px solid ${C.border}` }}
                  />
                </div>
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px', border: `1px solid ${C.border}`, borderRadius: '16px' }}>
                {loadingSongs ? (
                  <div style={{ padding: '20px', textAlign: 'center' }}>Loading songs...</div>
                ) : filteredSongs.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: C.textMuted }}>No songs found</div>
                ) : (
                  filteredSongs.map(song => (
                    <label key={song.id} style={{ display: 'flex', gap: '12px', padding: '12px', borderBottom: `1px solid ${C.border}`, cursor: 'pointer', alignItems: 'flex-start' }}>
                      <input type="checkbox" checked={selectedSongIds.has(song.id)} onChange={e => {
                        const next = new Set(selectedSongIds)
                        e.target.checked ? next.add(song.id) : next.delete(song.id)
                        setSelectedSongIds(next)
                      }} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{song.title}</div>
                        <div style={{ fontSize: '12px', color: C.textMuted }}>{song.lyrics.slice(0, 80)}…</div>
                      </div>
                    </label>
                  ))
                )}
              </div>

              <button
                onClick={handleCreateSession}
                disabled={isCreating || selectedSongIds.size === 0}
                style={{
                  width: '100%',
                  border: 'none',
                  background: isCreating || selectedSongIds.size === 0 ? C.disabledBg : C.accentDark,
                  color: isCreating || selectedSongIds.size === 0 ? C.disabledText : '#fff',
                  borderRadius: '40px',
                  padding: '14px',
                  fontWeight: 700,
                  cursor: isCreating || selectedSongIds.size === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                {isCreating ? 'Creating...' : 'Create Session'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}