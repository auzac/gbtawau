// src/services/members.js
import { supabase } from './supabase'

export async function fetchMembers() {
  const { data, error } = await supabase.from('members').select('*').order('name', { ascending: true })
  if (error) throw error
  return data
}

export async function createMember(payload) {
  const { error } = await supabase.from('members').insert(payload)
  if (error) throw error
}

export async function updateMember(id, payload) {
  const { error } = await supabase.from('members').update(payload).eq('id', id)
  if (error) throw error
}

export async function deleteMember(id) {
  const { error } = await supabase.from('members').delete().eq('id', id)
  if (error) throw error
}

export async function bulkImportMembers(members) {
  const { error } = await supabase.from('members').insert(members)
  if (error) throw error
}
