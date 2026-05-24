// src/services/events.js
import { supabase } from './supabase'

export async function fetchUpcomingEvents() {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('date', today)
    .order('date')
    .order('time')
  if (error) throw error
  return data
}

export async function fetchEventsFrom(startDate) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('date', startDate)
    .order('date', { ascending: true })
    .order('time', { ascending: true })
  if (error) throw error
  return data
}

export async function createEvent(payload) {
  const { error } = await supabase.from('events').insert(payload)
  if (error) throw error
}

export async function updateEvent(id, payload) {
  const { error } = await supabase.from('events').update(payload).eq('id', id)
  if (error) throw error
}

export async function deleteEvent(id) {
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) throw error
}
