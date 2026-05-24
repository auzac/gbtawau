import React, { useState, useEffect, useMemo } from 'react'
import { MessageSquare, CheckCircle, Clock, Search, Mail, ChevronDown, X } from 'lucide-react'
import StaffLayout from '../../components/layout/StaffLayout'
import { fetchFeedback, updateFeedback, deleteFeedback } from '../../services/feedback'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Toast from '../../components/ui/Toast'
import Badge from '../../components/ui/Badge'
import useIsMobile from '../../hooks/useIsMobile'
import { useToast } from '../../hooks/useToast'

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

const CATEGORY_STYLE = {
  Request:     { bg: '#FEF3C7', color: '#92400E' },
  Improvement: { bg: '#DBEAFE', color: '#1E40AF' },
  General:     { bg: '#F3E8FF', color: '#6B21A8' },
}

const CATEGORIES = ['Request', 'Improvement', 'General']
const FILTERS = [
  { key: 'all',   label: 'All' },
  { key: 'Open',  label: 'Open' },
  { key: 'Closed', label: 'Closed' },
]

function CategoryBadge({ category }) {
  const s = CATEGORY_STYLE[category] || CATEGORY_STYLE.General
  return (
    <span style={{
      display: 'inline-flex', padding: '3px 10px', borderRadius: '20px',
      fontSize: '11px', fontWeight: 600, background: s.bg, color: s.color,
      fontFamily: f.sans, whiteSpace: 'nowrap',
    }}>
      {category}
    </span>
  )
}

function StatusDot({ status }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      fontSize: '12px', fontWeight: 600, fontFamily: f.sans,
      color: status === 'Open' ? '#166534' : C.textMuted,
    }}>
      <span style={{
        width: '7px', height: '7px', borderRadius: '50%',
        background: status === 'Open' ? '#16A34A' : C.border,
      }} />
      {status}
    </span>
  )
}

export default function FeedbackManager() {
  const { toast, showToast } = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null) // feedback item or null
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const isMobile = useIsMobile()

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchFeedback()
      setItems(data || [])
    } catch (err) { showToast('Error loading feedback', true) }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    let list = items
    if (filter !== 'all') list = list.filter(i => i.status === filter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q)
      )
    }
    return list
  }, [items, filter, search])

  const openCount = items.filter(i => i.status === 'Open').length

  const openDetail = (item) => {
    setSelected(item)
    setNotes(item.notes || '')
  }
  const closeDetail = () => {
    setSelected(null)
    setNotes('')
  }

  const handleToggleStatus = async () => {
    if (!selected) return
    const newStatus = selected.status === 'Open' ? 'Closed' : 'Open'
    setSaving(true)
    try {
      await updateFeedback(selected.id, { status: newStatus, notes: notes || '' })
      showToast(`Marked as ${newStatus}`)
      closeDetail()
      await load()
    } catch (err) { showToast('Error updating', true) }
    setSaving(false)
  }

  const handleSaveNotes = async () => {
    if (!selected) return
    setSaving(true)
    try {
      await updateFeedback(selected.id, { notes: notes || '' })
      showToast('Notes saved')
      setSelected(p => ({ ...p, notes: notes || '' }))
    } catch (err) { showToast('Error saving notes', true) }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this feedback item?')) return
    try {
      await deleteFeedback(id)
      showToast('Feedback deleted')
      if (selected?.id === id) setSelected(null)
      await load()
    } catch (err) { showToast('Error deleting', true) }
  }

  if (loading) return <LoadingSpinner />

  const detail = selected && (
    <div style={{
      flex: 1, minWidth: 0, background: C.surface,
      borderRadius: '18px', border: `1.5px solid ${C.border}`,
      padding: isMobile ? '18px' : '24px',
      position: isMobile ? 'fixed' : 'sticky',
      top: isMobile ? 0 : '84px',
      left: 0, right: 0, bottom: 0,
      zIndex: isMobile ? 60 : 'auto',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto', maxHeight: isMobile ? '100vh' : 'calc(100vh - 110px)',
    }}>
      {/* Mobile close */}
      {isMobile && (
        <button onClick={closeDetail} style={{ alignSelf: 'flex-end', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
          <X size={20} color={C.textMid} />
        </button>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, fontFamily: f.serif, color: C.text }}>
            {selected.title}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: C.textMuted, fontFamily: f.sans }}>
            From {selected.name} &middot; {new Date(selected.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <CategoryBadge category={selected.category} />
          <StatusDot status={selected.status} />
        </div>
      </div>

      <div style={{
        padding: '14px 16px', background: C.surfaceAlt, borderRadius: '12px',
        fontSize: '14px', color: C.textMid, fontFamily: f.sans, lineHeight: 1.7,
        marginBottom: '20px',
      }}>
        {selected.description}
      </div>

      {/* Staff notes */}
      <div style={{ marginTop: 'auto' }}>
        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, marginBottom: '8px', fontFamily: f.sans }}>
          Staff Notes
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Write a remark about what will be done or has been done..."
          rows={4}
          style={{
            width: '100%', padding: '12px 14px', borderRadius: '12px',
            border: `1.5px solid ${C.border}`, background: C.bg,
            fontSize: '13px', color: C.text, fontFamily: f.sans,
            resize: 'vertical', lineHeight: 1.6,
          }}
        />
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
          <button onClick={handleSaveNotes} disabled={saving} style={{
            padding: '8px 16px', borderRadius: '8px', border: 'none',
            background: C.text, color: '#fff', fontSize: '12px', fontWeight: 600,
            fontFamily: f.sans, cursor: 'pointer',
          }}>
            {saving ? 'Saving...' : 'Save Notes'}
          </button>
          <button onClick={handleToggleStatus} disabled={saving} style={{
            padding: '8px 16px', borderRadius: '8px', border: 'none',
            background: selected.status === 'Open' ? '#166534' : '#78716C',
            color: '#fff', fontSize: '12px', fontWeight: 600,
            fontFamily: f.sans, cursor: 'pointer',
          }}>
            {selected.status === 'Open' ? 'Mark as Closed' : 'Reopen'}
          </button>
          <button onClick={() => handleDelete(selected.id)} style={{
            padding: '8px 16px', borderRadius: '8px', border: `1.5px solid ${C.border}`,
            background: C.surface, fontSize: '12px', fontWeight: 600,
            fontFamily: f.sans, cursor: 'pointer', color: '#DC2626',
          }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <StaffLayout title="Feedback Inbox" subtitle="Member messages & suggestions">
      {toast && <Toast message={toast.text} isError={toast.isError} />}

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '20px 16px 48px' : '28px 28px 56px' }}>

        {/* Filter + search bar */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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
                    {items.filter(i => i.status === key).length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative', flex: 1, minWidth: '160px', maxWidth: '280px', marginLeft: 'auto' }}>
            <Search size={13} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: C.textMuted, pointerEvents: 'none' }} />
            <input
              type="text" placeholder="Search..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px 8px 34px', borderRadius: '99px',
                border: `1.5px solid ${C.border}`, fontSize: '13px',
                background: C.surface, color: C.text, outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Desktop: side-by-side layout */}
        {!isMobile ? (
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            {/* List */}
            <div style={{ flex: selected ? '0 0 420px' : 1, minWidth: 0 }}>
              {filtered.length === 0 ? (
                <EmptyState />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {filtered.map(item => (
                    <FeedbackCard key={item.id} item={item} active={selected?.id === item.id} onClick={() => openDetail(item)} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </div>

            {/* Detail panel */}
            {detail}
          </div>
        ) : (
          /* Mobile: list or detail */
          selected ? detail : (
            filtered.length === 0 ? <EmptyState /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filtered.map(item => (
                  <FeedbackCard key={item.id} item={item} active={false} onClick={() => openDetail(item)} onDelete={handleDelete} />
                ))}
              </div>
            )
          )
        )}
      </div>
    </StaffLayout>
  )
}

function FeedbackCard({ item, active, onClick, onDelete }) {
  const date = new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return (
    <div
      onClick={onClick}
      style={{
        background: active ? C.accentBg : C.surface,
        border: `1.5px solid ${active ? C.accentDark : C.border}`,
        borderRadius: '14px', padding: '16px 18px',
        cursor: 'pointer', transition: 'all 0.12s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
            <CategoryBadge category={item.category} />
            <StatusDot status={item.status} />
          </div>
          <h3 style={{ margin: '6px 0 0', fontSize: '14px', fontWeight: 600, fontFamily: f.serif, color: C.text, lineHeight: 1.3 }}>
            {item.title}
          </h3>
        </div>
        <span style={{ fontSize: '10px', color: C.textMuted, fontFamily: f.sans, whiteSpace: 'nowrap', flexShrink: 0 }}>
          {date}
        </span>
      </div>
      <p style={{
        margin: 0, fontSize: '12px', color: C.textMid, fontFamily: f.sans,
        lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {item.description}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
        <span style={{ fontSize: '11px', color: C.textMuted, fontFamily: f.sans }}>
          {item.name}
        </span>
        <button
          onClick={e => { e.stopPropagation(); onDelete(item.id) }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#DC2626', fontFamily: f.sans, padding: 0 }}
        >
          Delete
        </button>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ padding: '56px 24px', textAlign: 'center' }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '14px', background: C.surfaceAlt,
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
      }}>
        <Mail size={22} style={{ color: C.textMuted }} />
      </div>
      <p style={{ color: C.textMid, fontSize: '15px', margin: 0, fontFamily: f.serif }}>
        No feedback yet
      </p>
      <p style={{ color: C.textMuted, fontSize: '12px', margin: '6px 0 0', fontFamily: f.sans }}>
        Messages from church members will appear here.
      </p>
    </div>
  )
}
