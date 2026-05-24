// src/services/finance.js
import { supabase } from './supabase'

export async function fetchMembersForFinance() {
  const { data, error } = await supabase
    .from('members')
    .select('id, name, contact_number, address')
    .order('name')
  if (error) throw error
  return data
}

export async function fetchRenewals() {
  const { data, error } = await supabase
    .from('membership_renewals')
    .select('*')
    .order('payment_date', { ascending: false })
  if (error) throw error
  return data
}

export async function createRenewal(payload) {
  const { error } = await supabase.from('membership_renewals').insert(payload)
  if (error) throw error
}
