// src/services/memberRequests.js
import { supabase } from './supabase'

export async function fetchMemberRequests(status = null) {
  let query = supabase.from('member_requests').select('*').order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createMemberRequest(payload) {
  const { error } = await supabase.from('member_requests').insert(payload)
  if (error) throw error
}

export async function updateMemberRequestStatus(id, status, reviewedBy, reviewedNotes = null) {
  const { error } = await supabase
    .from('member_requests')
    .update({
      status,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
      reviewed_notes: reviewedNotes,
    })
    .eq('id', id)
  if (error) throw error
}
