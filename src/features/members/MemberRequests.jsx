// src/features/members/MemberRequests.jsx
import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Mail, Phone, MapPin, Calendar, User, MessageSquare } from 'lucide-react'
import { fetchMemberRequests, updateMemberRequestStatus } from '../../services/memberRequests'
import { createMember } from '../../services/members'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Toast from '../../components/ui/Toast'
import { useToast } from '../../hooks/useToast'
import { useAuth } from '../../contexts/AuthContext'

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:          '#FAF8F5',
  surface:     '#FFFFFF',
  surfaceAlt:  '#F5EFE6',
  border:      '#EAE1D4',
  text:        '#2D2926',
  textMid:     '#57534E',
  textMuted:   '#9A8B80',
  accentDark:  '#92622E',
  accentBg:    '#FDF3E8',
}
const f = { serif: "'Lora', serif", sans: "'DM Sans', sans-serif" }

// ─── Status styling ───────────────────────────────────────────────────────────
const STATUS_STYLE = {
  pending:  { bg: '#FFFBEB', color: '#B45309' },
  approved: { bg: '#F0FDF4', color: '#166534' },
  rejected: { bg: '#FEF2F2', color: '#DC2626' },
}

const STATUS_LABEL = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' }

const FILTERS = [
  { key: 'all',      label: 'All' },
  { key: 'pending',  label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = iso => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.pending
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
      background: s.bg, color: s.color, fontFamily: f.sans, whiteSpace: 'nowrap',
    }}>
      {status === 'pending' && <Clock size={11} />}
      {status === 'approved' && <CheckCircle size={11} />}
      {status === 'rejected' && <XCircle size={11} />}
      {STATUS_LABEL[status]}
    </span>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function MemberRequests() {
  const { user } = useAuth()
  const { toast, showToast } = useToast()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [confirmAction, setConfirmAction] = useState(null) // { id, action }

  const loadRequests = async () => {
    setLoading(true)
    try {
      const data = await fetchMemberRequests()
      setRequests(data || [])
    } catch (err) { showToast('Error loading requests', true) }
    setLoading(false)
  }

  useEffect(() => { loadRequests() }, [])

  const filtered = filter === 'all'
    ? requests
    : requests.filter(r => r.status === filter)

  const pendingCount = requests.filter(r => r.status === 'pending').length

  const handleAction = async (id, action) => {
    if (!user) { showToast('You must be logged in', true); return }
    try {
      await updateMemberRequestStatus(id, action, user.id)
      if (action === 'approved') {
        const req = requests.find(r => r.id === id)
        if (req) {
          await createMember({
            name: req.name,
            sex: req.sex,
            address: req.address,
            dob: req.dob,
            marital_status: req.marital_status,
            contact_number: req.phone,
          })
        }
      }
      showToast(action === 'approved' ? 'Request approved — member added' : 'Request rejected')
      setConfirmAction(null)
      await loadRequests()
    } catch (err) { showToast('Error updating request', true) }
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return <LoadingSpinner />

  // ── Empty state ──────────────────────────────────────────────────────────
  if (requests.length === 0) {
    return (
      <div style={{ padding: '56px 24px', textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: C.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <User size={22} style={{ color: C.textMuted }} />
        </div>
        <p style={{ color: C.textMid, fontSize: '15px', margin: 0, fontFamily: f.serif }}>
          No membership requests yet
        </p>
        <p style={{ color: C.textMuted, fontSize: '12px', margin: '6px 0 0', fontFamily: f.sans }}>
          Requests from the public registration form will appear here.
        </p>
      </div>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {toast && <Toast message={toast.text} isError={toast.isError} />}

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {FILTERS.map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)} style={{
            padding: '5px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
            border: `1.5px solid ${filter === key ? C.text : C.border}`,
            background: filter === key ? C.text : C.surface,
            color: filter === key ? '#fff' : C.textMid,
            cursor: 'pointer', fontFamily: f.sans,
          }}>
            {label}
            {key !== 'all' && (
              <span style={{ marginLeft: '4px', opacity: 0.7 }}>
                {key === 'pending' ? pendingCount : requests.filter(r => r.status === key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Requests list */}
      {filtered.length === 0 ? (
        <div style={{ padding: '40px 24px', textAlign: 'center', color: C.textMuted, fontSize: '13px', fontFamily: f.sans }}>
          No {filter === 'all' ? '' : filter} requests.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(req => (
            <div key={req.id} style={{
              background: C.surface,
              border: `1.5px solid ${C.border}`,
              borderRadius: '16px', padding: '18px 20px',
            }}>
              {/* Card header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, fontFamily: f.serif, color: C.text }}>
                    {req.name}
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: '11px', color: C.textMuted, fontFamily: f.sans }}>
                    Submitted {fmtDate(req.created_at)}
                  </p>
                </div>
                <StatusBadge status={req.status} />
              </div>

              {/* Details grid */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                {[
                  { show: req.email,      Icon: Mail,     val: req.email },
                  { show: req.phone,      Icon: Phone,    val: req.phone },
                  { show: req.address,    Icon: MapPin,   val: req.address },
                  { show: req.dob,        Icon: Calendar, val: fmtDate(req.dob) },
                  { show: req.sex,        Icon: User,     val: req.sex },
                  { show: req.marital_status, Icon: User, val: req.marital_status },
                ].filter(i => i.show).map(({ Icon, val }) => (
                  <div key={val} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '4px 10px', background: C.surfaceAlt, borderRadius: '8px',
                    fontSize: '12px', color: C.textMid, fontFamily: f.sans,
                  }}>
                    <Icon size={12} color={C.textMuted} />
                    {val}
                  </div>
                ))}
              </div>

              {/* Notes */}
              {req.notes && (
                <div style={{
                  display: 'flex', gap: '6px', padding: '10px 12px',
                  background: C.accentBg, borderRadius: '10px',
                  fontSize: '13px', color: C.textMid, fontFamily: f.sans,
                  lineHeight: 1.5, marginBottom: '14px',
                }}>
                  <MessageSquare size={13} color={C.accentDark} style={{ flexShrink: 0, marginTop: '2px' }} />
                  {req.notes}
                </div>
              )}

              {/* Reviewed info */}
              {req.status !== 'pending' && req.reviewed_notes && (
                <div style={{ fontSize: '12px', color: C.textMuted, fontFamily: f.sans, padding: '8px 0 0', borderTop: `1px solid ${C.border}` }}>
                  <span style={{ fontWeight: 600 }}>Review notes:</span> {req.reviewed_notes}
                </div>
              )}

              {/* Actions */}
              {req.status === 'pending' && (
                <div style={{ display: 'flex', gap: '8px', paddingTop: '14px', borderTop: `1px solid ${C.border}` }}>
                  {confirmAction?.id === req.id ? (
                    <>
                      <span style={{ fontSize: '12px', color: C.textMuted, fontFamily: f.sans, alignSelf: 'center', marginRight: '4px' }}>
                        {confirmAction.action === 'approved' ? 'Add to directory?' : 'Reject this request?'}
                      </span>
                      <button onClick={() => handleAction(req.id, confirmAction.action)} style={{
                        padding: '6px 14px', borderRadius: '8px', border: 'none', fontSize: '12px',
                        fontWeight: 600, fontFamily: f.sans, cursor: 'pointer',
                        background: confirmAction.action === 'approved' ? '#166534' : '#DC2626',
                        color: '#fff',
                      }}>
                        Confirm
                      </button>
                      <button onClick={() => setConfirmAction(null)} style={{
                        padding: '6px 14px', borderRadius: '8px', border: `1.5px solid ${C.border}`,
                        background: C.surface, fontSize: '12px', fontWeight: 600,
                        fontFamily: f.sans, cursor: 'pointer', color: C.textMid,
                      }}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setConfirmAction({ id: req.id, action: 'approved' })} style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '7px 16px', borderRadius: '8px', border: 'none',
                        fontSize: '12px', fontWeight: 600, fontFamily: f.sans, cursor: 'pointer',
                        background: '#166534', color: '#fff',
                      }}>
                        <CheckCircle size={13} /> Approve
                      </button>
                      <button onClick={() => setConfirmAction({ id: req.id, action: 'rejected' })} style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '7px 16px', borderRadius: '8px', border: 'none',
                        fontSize: '12px', fontWeight: 600, fontFamily: f.sans, cursor: 'pointer',
                        background: '#FEF2F2', color: '#DC2626',
                      }}>
                        <XCircle size={13} /> Reject
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
