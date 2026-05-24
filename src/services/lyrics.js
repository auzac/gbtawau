// src/services/lyrics.js
import { supabase } from './supabase'

export async function fetchSongs() {
  const { data, error } = await supabase.from('songs').select('id, title, lyrics').order('title')
  if (error) throw error
  return data
}

export async function fetchSongsByIds(ids) {
  const { data, error } = await supabase.from('songs').select('id, title, lyrics').in('id', ids)
  if (error) throw error
  return data
}

export async function fetchSessionByCode(code) {
  const { data, error } = await supabase.from('public_sessions').select('*').eq('session_code', code).maybeSingle()
  if (error) throw error
  return data
}

export async function fetchActiveSessions() {
  const { data, error } = await supabase
    .from('public_sessions')
    .select('session_code, expires_at, created_at')
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('created_at', { ascending: false })
    .limit(10)
  if (error) throw error
  return data
}

export async function checkSessionCode(code) {
  const { data } = await supabase.from('public_sessions').select('session_code').eq('session_code', code).maybeSingle()
  return data
}

export async function createSession({ sessionCode, expiresAt }) {
  const { data, error } = await supabase
    .from('public_sessions')
    .insert({ session_code: sessionCode, expires_at: expiresAt })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function createSessionSongs(entries) {
  const { error } = await supabase.from('session_songs').insert(entries)
  if (error) throw error
}

export async function fetchSessionSongIds(sessionId) {
  const { data, error } = await supabase.from('session_songs').select('song_id').eq('session_id', sessionId)
  if (error) throw error
  return data
}
