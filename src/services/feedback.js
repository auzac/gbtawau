import { supabase } from './supabase'

export async function fetchFeedback(status = null) {
  let query = supabase.from('feedback').select('*').order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createFeedback(payload) {
  const { error } = await supabase.from('feedback').insert(payload)
  if (error) throw error
}

export async function updateFeedback(id, payload) {
  const { error } = await supabase
    .from('feedback')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function deleteFeedback(id) {
  const { error } = await supabase.from('feedback').delete().eq('id', id)
  if (error) throw error
}
