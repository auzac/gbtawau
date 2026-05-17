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
  ChevronRight
} from 'lucide-react'

const C = {
  bg: '#FAF8F5',
  surface: '#FFFFFF',
  border: '#EAE1D4',
  text: '#2D2926',
  textMuted: '#8A7B70',
  accent: '#A06B37',
  accentDark: '#92622E',
  redBg: '#FEF2F2',
  redText: '#DC2626'
}

const font = {
  sans: "'DM Sans', sans-serif",
  serif: "'Lora', serif"
}

export default function LyricsSession() {
  const navigate = useNavigate()
  const { code } = useParams()

  const [songs, setSongs] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSongIds, setSelectedSongIds] = useState(new Set())

  const [sessionCode, setSessionCode] = useState('')
  const [joinCode, setJoinCode] = useState(code || '')

  const [sessionData, setSessionData] = useState(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingSession, setIsLoadingSession] = useState(false)

  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const [showCreate, setShowCreate] = useState(true)

  const [activeSongIndex, setActiveSongIndex] = useState(0)

  const [expiryOption, setExpiryOption] = useState('2h')

  const expiryOptions = [
    { value: '2h', label: '2 hours', hours: 2 },
    { value: '12h', label: '12 hours', hours: 12 },
    { value: '1d', label: '1 day', hours: 24 },
    { value: '7d', label: '7 days', hours: 168 },
    { value: 'never', label: 'Never', hours: null }
  ]

  // Load songs
  useEffect(() => {
    const loadSongs = async () => {
      const { data } = await supabase
        .from('songs')
        .select('id, title, lyrics')
        .order('title')

      setSongs(data || [])
    }

    loadSongs()
  }, [])

  // Auto join from URL
  useEffect(() => {
    if (code) {
      setJoinCode(code)
      loadSession(code)
    }
  }, [code])

  const filteredSongs = !searchTerm.trim()
    ? songs
    : songs.filter(song =>
        song.title.toLowerCase().includes(searchTerm.toLowerCase())
      )

  const getExpiresAt = () => {
    const opt = expiryOptions.find(o => o.value === expiryOption)

    if (!opt.hours) return null

    const d = new Date()
    d.setHours(d.getHours() + opt.hours)

    return d.toISOString()
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

      if (
        session.expires_at &&
        new Date(session.expires_at) < new Date()
      ) {
        setError('This session has expired')
        setIsLoadingSession(false)
        return
      }

      const { data: songsData, error: songsErr } = await supabase
        .from('session_songs')
        .select(`
          songs (
            id,
            title,
            lyrics
          )
        `)
        .eq('session_id', session.id)

      if (songsErr) throw songsErr

      const mappedSongs =
        songsData?.map(row => row.songs).filter(Boolean) || []

      setSessionData({
        ...session,
        songs: mappedSongs
      })

      setActiveSongIndex(0)

    } catch (err) {
      console.error(err)
      setError('Failed to load session')
    }

    setIsLoadingSession(false)
  }

  const handleJoin = () => {
    if (!/^\d{4}$/.test(joinCode)) {
      setError('Enter a valid 4-digit code')
      return
    }

    navigate(`/lyrics/join/${joinCode}`)
  }

  const handleCreateSession = async () => {
    const trimmed = sessionCode.trim()

    if (!/^\d{4}$/.test(trimmed)) {
      setError('Session code must be exactly 4 digits')
      return
    }

    if (selectedSongIds.size === 0) {
      setError('Select at least one song')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const expiresAt = getExpiresAt()

      const { data: session, error: sessionErr } = await supabase
        .from('public_sessions')
        .insert({
          session_code: trimmed,
          expires_at: expiresAt
        })
        .select()
        .single()

      if (sessionErr) {
        if (sessionErr.code === '23505') {
          setError('Code already taken')
        } else {
          throw sessionErr
        }

        setIsSubmitting(false)
        return
      }

      const rows = Array.from(selectedSongIds).map(songId => ({
        session_id: session.id,
        song_id: songId
      }))

      const { error: songsErr } = await supabase
        .from('session_songs')
        .insert(rows)

      if (songsErr) throw songsErr

      navigate(`/lyrics/join/${trimmed}`)

    } catch (err) {
      console.error(err)
      setError('Failed to create session')
    }

    setIsSubmitting(false)
  }

  const copyLink = () => {
    const url = `${window.location.origin}/lyrics/join/${joinCode}`

    navigator.clipboard.writeText(url)

    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.bg,
        padding: '24px',
        fontFamily: font.sans
      }}
    >
      {/* GOOGLE FONTS */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Lora:wght@500;600;700&display=swap');
        `}
      </style>

      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto'
        }}
      >
        {/* HEADER */}
        <div
          style={{
            marginBottom: '28px'
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: '42px',
              fontFamily: font.serif,
              color: C.text
            }}
          >
            Lyrics Session
          </h1>

          <p
            style={{
              marginTop: '10px',
              color: C.textMuted,
              fontSize: '16px'
            }}
          >
            Create and share worship lyric sessions instantly.
          </p>
        </div>

        {/* JOIN SESSION */}
        <div
          style={{
            background: C.surface,
            borderRadius: '28px',
            padding: '28px',
            border: `1px solid ${C.border}`,
            marginBottom: '20px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px'
            }}
          >
            <LogIn size={20} color={C.accentDark} />

            <h2
              style={{
                margin: 0,
                fontSize: '28px',
                fontFamily: font.serif,
                color: C.text
              }}
            >
              Join Session
            </h2>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap'
            }}
          >
            <input
              type="text"
              placeholder="Enter 4-digit code"
              value={joinCode}
              onChange={e =>
                setJoinCode(
                  e.target.value.replace(/\D/g, '').slice(0, 4)
                )
              }
              style={{
                flex: 1,
                minWidth: '180px',
                padding: '16px',
                borderRadius: '18px',
                border: `1.5px solid ${C.border}`,
                fontSize: '20px',
                textAlign: 'center',
                letterSpacing: '4px',
                fontFamily: font.sans
              }}
            />

            <button
              onClick={handleJoin}
              style={{
                border: 'none',
                background: C.accentDark,
                color: '#fff',
                borderRadius: '18px',
                padding: '0 28px',
                cursor: 'pointer',
                fontWeight: 700,
                fontFamily: font.sans
              }}
            >
              Join
            </button>
          </div>
        </div>

        {/* CREATE SESSION */}
        <div
          style={{
            background: C.surface,
            borderRadius: '28px',
            border: `1px solid ${C.border}`,
            overflow: 'hidden',
            marginBottom: '24px'
          }}
        >
          <button
            onClick={() => setShowCreate(!showCreate)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              padding: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <Music2 size={20} color={C.accentDark} />

              <h2
                style={{
                  margin: 0,
                  fontSize: '28px',
                  fontFamily: font.serif,
                  color: C.text
                }}
              >
                Create Session
              </h2>
            </div>

            {showCreate ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </button>

          {showCreate && (
            <div
              style={{
                padding: '0 24px 24px'
              }}
            >
              {/* SESSION CODE */}
              <div
                style={{
                  marginBottom: '18px'
                }}
              >
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 600,
                    color: C.text
                  }}
                >
                  Session Code
                </label>

                <input
                  type="text"
                  value={sessionCode}
                  onChange={e =>
                    setSessionCode(
                      e.target.value.replace(/\D/g, '').slice(0, 4)
                    )
                  }
                  placeholder="1234"
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '18px',
                    border: `1.5px solid ${C.border}`,
                    fontSize: '20px',
                    textAlign: 'center',
                    letterSpacing: '4px',
                    fontFamily: font.sans
                  }}
                />
              </div>

              {/* SEARCH */}
              <div
                style={{
                  position: 'relative',
                  marginBottom: '18px'
                }}
              >
                <Search
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: C.textMuted
                  }}
                />

                <input
                  type="text"
                  placeholder="Search songs..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px 16px 16px 44px',
                    borderRadius: '999px',
                    border: `1.5px solid ${C.border}`,
                    fontFamily: font.sans
                  }}
                />
              </div>

              {/* SONG LIST */}
              <div
                style={{
                  maxHeight: '360px',
                  overflowY: 'auto',
                  marginBottom: '20px'
                }}
              >
                {filteredSongs.map(song => (
                  <label
                    key={song.id}
                    style={{
                      display: 'flex',
                      gap: '14px',
                      padding: '14px',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      transition: '0.2s',
                      alignItems: 'flex-start'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSongIds.has(song.id)}
                      onChange={e => {
                        const next = new Set(selectedSongIds)

                        if (e.target.checked) {
                          next.add(song.id)
                        } else {
                          next.delete(song.id)
                        }

                        setSelectedSongIds(next)
                      }}
                      style={{
                        marginTop: '4px'
                      }}
                    />

                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          color: C.text
                        }}
                      >
                        {song.title}
                      </div>

                      <div
                        style={{
                          fontSize: '13px',
                          color: C.textMuted,
                          marginTop: '4px',
                          lineHeight: 1.5
                        }}
                      >
                        {song.lyrics
                          .replace(/\n/g, ' ')
                          .slice(0, 90)}
                        ...
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {/* EXPIRY */}
              <div
                style={{
                  marginBottom: '20px'
                }}
              >
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 600,
                    color: C.text
                  }}
                >
                  Session Expiry
                </label>

                <select
                  value={expiryOption}
                  onChange={e => setExpiryOption(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '16px',
                    border: `1.5px solid ${C.border}`,
                    fontFamily: font.sans
                  }}
                >
                  {expiryOptions.map(opt => (
                    <option
                      key={opt.value}
                      value={opt.value}
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* FOOTER */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <span
                  style={{
                    color: C.textMuted
                  }}
                >
                  {selectedSongIds.size} song(s) selected
                </span>

                <button
                  onClick={handleCreateSession}
                  disabled={
                    isSubmitting ||
                    !sessionCode ||
                    selectedSongIds.size === 0
                  }
                  style={{
                    border: 'none',
                    background:
                      isSubmitting
                        ? C.border
                        : C.accentDark,
                    color: '#fff',
                    borderRadius: '999px',
                    padding: '14px 28px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontFamily: font.sans
                  }}
                >
                  {isSubmitting
                    ? 'Creating...'
                    : 'Create Session'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ERROR */}
        {error && (
          <div
            style={{
              background: C.redBg,
              color: C.redText,
              padding: '16px',
              borderRadius: '18px',
              marginBottom: '20px'
            }}
          >
            {error}
          </div>
        )}

        {/* LOADING */}
        {isLoadingSession && (
          <div
            style={{
              textAlign: 'center',
              padding: '30px',
              color: C.textMuted
            }}
          >
            Loading session...
          </div>
        )}

        {/* SESSION VIEW */}
        {sessionData && sessionData.songs.length > 0 && (
          <div
            style={{
              background: C.surface,
              borderRadius: '28px',
              border: `1px solid ${C.border}`,
              overflow: 'hidden'
            }}
          >
            {/* SESSION HEADER */}
            <div
              style={{
                padding: '24px 28px',
                borderBottom: `1px solid ${C.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px'
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '32px',
                    fontFamily: font.serif,
                    color: C.text
                  }}
                >
                  Session {joinCode}
                </h2>

                <p
                  style={{
                    marginTop: '8px',
                    color: C.textMuted
                  }}
                >
                  Song {activeSongIndex + 1} of{' '}
                  {sessionData.songs.length}
                </p>
              </div>

              <button
                onClick={copyLink}
                style={{
                  border: `1px solid ${C.border}`,
                  background: C.surface,
                  borderRadius: '999px',
                  padding: '12px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontFamily: font.sans
                }}
              >
                {copied ? (
                  <CheckCircle
                    size={16}
                    color={C.accentDark}
                  />
                ) : (
                  <Copy size={16} />
                )}

                {copied ? 'Copied!' : 'Share Link'}
              </button>
            </div>

            {/* SONG TITLE */}
            <div
              style={{
                padding: '28px',
                borderBottom: `1px solid ${C.border}`,
                background: '#FDF8F2'
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: '36px',
                  fontFamily: font.serif,
                  color: C.text
                }}
              >
                {sessionData.songs[activeSongIndex].title}
              </h3>
            </div>

            {/* LYRICS */}
            <div
              style={{
                padding: '36px',
                maxHeight: '65vh',
                overflowY: 'auto'
              }}
            >
              <div
                style={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 2,
                  fontSize: '18px',
                  color: C.text
                }}
              >
                {sessionData.songs[activeSongIndex].lyrics
                  .split('\n')
                  .map((line, i) => (
                    <p
                      key={i}
                      style={{
                        margin: '10px 0'
                      }}
                    >
                      {line || '\u00A0'}
                    </p>
                  ))}
              </div>
            </div>

            {/* CONTROLS */}
            <div
              style={{
                borderTop: `1px solid ${C.border}`,
                padding: '20px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#FAF8F5'
              }}
            >
              <button
                disabled={activeSongIndex === 0}
                onClick={() =>
                  setActiveSongIndex(prev => prev - 1)
                }
                style={{
                  border: 'none',
                  background:
                    activeSongIndex === 0
                      ? C.border
                      : C.accentDark,
                  color: '#fff',
                  borderRadius: '999px',
                  padding: '12px 20px',
                  cursor:
                    activeSongIndex === 0
                      ? 'not-allowed'
                      : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 700,
                  fontFamily: font.sans
                }}
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <button
                disabled={
                  activeSongIndex ===
                  sessionData.songs.length - 1
                }
                onClick={() =>
                  setActiveSongIndex(prev => prev + 1)
                }
                style={{
                  border: 'none',
                  background:
                    activeSongIndex ===
                    sessionData.songs.length - 1
                      ? C.border
                      : C.accentDark,
                  color: '#fff',
                  borderRadius: '999px',
                  padding: '12px 20px',
                  cursor:
                    activeSongIndex ===
                    sessionData.songs.length - 1
                      ? 'not-allowed'
                      : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 700,
                  fontFamily: font.sans
                }}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>

            {/* QUICK SONG SELECTOR */}
            <div
              style={{
                display: 'flex',
                gap: '10px',
                overflowX: 'auto',
                padding: '20px 24px',
                borderTop: `1px solid ${C.border}`
              }}
            >
              {sessionData.songs.map((song, idx) => (
                <button
                  key={song.id}
                  onClick={() => setActiveSongIndex(idx)}
                  style={{
                    border:
                      idx === activeSongIndex
                        ? `2px solid ${C.accentDark}`
                        : `1px solid ${C.border}`,
                    background:
                      idx === activeSongIndex
                        ? '#FDF6EE'
                        : '#fff',
                    borderRadius: '999px',
                    padding: '10px 18px',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    fontWeight:
                      idx === activeSongIndex
                        ? 700
                        : 500,
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
      </div>
    </div>
  )
}