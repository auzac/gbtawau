// src/services/content.js
import { supabase } from './supabase'

// ─── Verse Library ───────────────────────────────────────────────────────────
export async function fetchVerseLibrary() {
  const { data, error } = await supabase
    .from('verse_library')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function fetchActiveVerse() {
  const { data, error } = await supabase
    .from('verse_library')
    .select('*')
    .eq('is_active', true)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function fetchVerseByReference(reference) {
  const { data, error } = await supabase
    .from('verse_library')
    .select('id')
    .eq('reference', reference)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function createVerse(verse) {
  const { error } = await supabase.from('verse_library').insert({ ...verse, is_active: false })
  if (error) throw error
}

export async function deactivateAllVerses() {
  const { error } = await supabase.from('verse_library').update({ is_active: false }).eq('is_active', true)
  if (error) throw error
}

export async function activateVerse(id) {
  const { error } = await supabase.from('verse_library').update({ is_active: true }).eq('id', id)
  if (error) throw error
}

export async function deleteVerse(id) {
  const { error } = await supabase.from('verse_library').delete().eq('id', id)
  if (error) throw error
}

// ─── Carousel Items ──────────────────────────────────────────────────────────
export async function fetchCarouselItems() {
  const { data, error } = await supabase
    .from('carousel_items')
    .select('*')
    .order('display_order')
    .order('created_at')
  if (error) throw error
  return data
}

export async function fetchActiveCarouselItems() {
  const { data, error } = await supabase
    .from('carousel_items')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function createCarouselItem(payload) {
  const { error } = await supabase.from('carousel_items').insert(payload)
  if (error) throw error
}

export async function updateCarouselItem(id, payload) {
  const { error } = await supabase.from('carousel_items').update(payload).eq('id', id)
  if (error) throw error
}

export async function deleteCarouselItem(id) {
  const { error } = await supabase.from('carousel_items').delete().eq('id', id)
  if (error) throw error
}

export async function toggleCarouselItem(id, currentActive) {
  const { error } = await supabase
    .from('carousel_items')
    .update({ is_active: !currentActive, updated_at: new Date() })
    .eq('id', id)
  if (error) throw error
}

export async function updateCarouselOrder(id, displayOrder) {
  const { error } = await supabase.from('carousel_items').update({ display_order: displayOrder }).eq('id', id)
  if (error) throw error
}

// ─── Roster ──────────────────────────────────────────────────────────────────
export async function fetchRoster(limit = 4) {
  const { data, error } = await supabase
    .from('roster')
    .select('*')
    .order('week_start')
    .limit(limit)
  if (error) throw error
  return data
}

export async function fetchAllRosters() {
  const { data, error } = await supabase
    .from('roster')
    .select('*')
    .order('week_start', { ascending: true })
  if (error) throw error
  return data
}

export async function updateRoster(id, payload) {
  const { error } = await supabase
    .from('roster')
    .update(payload)
    .eq('id', id)
  if (error) throw error
}
