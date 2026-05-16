// src/pages/MemberManager.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

// ─── Constants ────────────────────────────────────────────────────────────────
const MARITAL_OPTIONS = ['Single', 'Married', 'Divorced', 'Widowed']
const SEX_OPTIONS = ['Male', 'Female']
const DEFAULT_FORM = {
  name: '', sex: 'Male', address: '', dob: '',
  registeredSince: '', baptismDate: '', maritalStatus: 'Single',
  contactNumber: '', isDeceased: false, dateOfDeath: ''
}
const AGE_GROUPS = [
  { key: 'all',    label: 'All',      min: 0,   max: Infinity },
  { key: 'child',  label: 'Children', min: 0,   max: 12 },
  { key: 'youth',  label: 'Youth',    min: 13,  max: 25 },
  { key: 'adult',  label: 'Adults',   min: 26,  max: Infinity },
]

// ─── Date Utilities ───────────────────────────────────────────────────────────
const toDisplay = (s) => {
  if (!s) return '—'
  const [y, m, d] = s.split('-')
  return `${d}/${m}/${y}`
}
const toStorage = (s) => {
  if (!s) return ''
  const [d, m, y] = s.split('/')
  return `${y}-${m}-${d}`
}
const toCSV = (s) => {
  if (!s) return ''
  const [y, m, d] = s.split('-')
  return `${d}/${m}/${y}`
}
const isValidDate = (s) => {
  if (!s) return false
  const match = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return false
  const [, d, mo, y] = match
  const dt = new Date(y, mo - 1, d)
  return dt.getFullYear() === +y && dt.getMonth() === +mo - 1 && dt.getDate() === +d
}
const calcAge = (dob) => {
  if (!dob) return null
  const birth = new Date(dob)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const mDiff = now.getMonth() - birth.getMonth()
  if (mDiff < 0 || (mDiff === 0 && now.getDate() < birth.getDate())) age--
  return age
}

// ─── DateInput ────────────────────────────────────────────────────────────────
function DateInput({ value, onChange, placeholder, required }) {
  const [raw, setRaw] = useState(value ? toDisplay(value) : '')
  useEffect(() => { setRaw(value ? toDisplay(value) : '') }, [value])
  const handleChange = (e) => {
    const v = e.target.value
    setRaw(v)
    if (!v) { onChange(''); return }
    if (isValidDate(v)) onChange(toStorage(v))
  }
  return (
    <input
      type="text" value={raw} onChange={handleChange}
      required={required} placeholder={placeholder}
      style={inputStyle}
    />
  )
}

// ─── Inline styles (avoids Tailwind dependency issues on mobile) ──────────────
const colors = {
  bg: '#FDFCF9',
  surface: '#FFFFFF',
  surfaceAlt: '#F7F3EE',
  border: '#E8E0D5',
  borderDark: '#D4C8B8',
  text: '#1C1917',
  textMid: '#57534E',
  textMuted: '#A8A29E',
  accent: '#92622E',
  accentBg: '#FDF3E8',
  accentLight: '#F5E6D0',
  gold: '#B8874A',
  danger: '#DC2626',
  dangerBg: '#FEF2F2',
  success: '#16A34A',
  successBg: '#F0FDF4',
  male: '#1D4ED8',
  maleBg: '#EFF6FF',
  female: '#BE185D',
  femaleBg: '#FDF2F8',
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: `1.5px solid ${colors.border}`,
  borderRadius: '10px',
  fontSize: '15px',
  background: colors.surface,
  color: colors.text,
  outline: 'none',
  transition: 'border-color 0.15s',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

const selectStyle = {
  ...inputStyle,
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23A8A29E' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: '36px',
}

// ─── Components ───────────────────────────────────────────────────────────────

function Label({ children }) {
  return (
    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '6px' }}>
      {children}
    </label>
  )
}

function Badge({ children, variant = 'default' }) {
  const variants = {
    default: { bg: colors.surfaceAlt, color: colors.textMid },
    male: { bg: colors.maleBg, color: colors.male },
    female: { bg: colors.femaleBg, color: colors.female },
    married: { bg: '#F0FDF4', color: '#166534' },
    single: { bg: '#EFF6FF', color: '#1D4ED8' },
    widowed: { bg: '#F5F3FF', color: '#6D28D9' },
    divorced: { bg: '#FFF7ED', color: '#C2410C' },
    deceased: { bg: '#F3F4F6', color: '#6B7280' },
    child: { bg: '#FFFBEB', color: '#B45309' },
    youth: { bg: '#F0FDFA', color: '#0F766E' },
    adult: { bg: colors.surfaceAlt, color: colors.textMid },
  }
  const s = variants[variant] || variants.default
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
      background: s.bg, color: s.color, whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}

function StatCard({ label, value, sub, highlight }) {
  return (
    <div style={{
      background: highlight ? colors.text : colors.surface,
      border: `1.5px solid ${highlight ? colors.text : colors.border}`,
      borderRadius: '14px',
      padding: '14px',
      display: 'flex', flexDirection: 'column', gap: '4px',
      minWidth: 0,
    }}>
      <span style={{
        fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: highlight ? '#A8A29E' : colors.textMuted,
        lineHeight: 1.2,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
      <span style={{
        fontSize: '28px', fontWeight: 700, lineHeight: 1,
        color: highlight ? '#FFFFFF' : colors.text,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </span>
      {sub && (
        <span style={{ fontSize: '11px', color: highlight ? '#78716C' : colors.textMuted, lineHeight: 1.2 }}>
          {sub}
        </span>
      )}
    </div>
  )
}

function Divider() {
  return <div style={{ height: '1px', background: colors.border, margin: '0 -24px' }} />
}

// ─── Member Profile Modal ─────────────────────────────────────────────────────
function MemberProfileModal({ member, onClose }) {
  const age = calcAge(member.dob)
  const isDeceased = member.is_deceased

  const row = (icon, label, val) => val ? (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
      <div style={{
        width: '34px', height: '34px', borderRadius: '10px',
        background: colors.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, fontSize: '16px',
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.textMuted, margin: 0 }}>{label}</p>
        <p style={{ fontSize: '15px', color: colors.text, margin: '2px 0 0', wordBreak: 'break-word' }}>{val}</p>
      </div>
    </div>
  ) : null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        zIndex: 100, padding: '0',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: colors.surface, borderRadius: '24px 24px 0 0',
          width: '100%', maxWidth: '520px', maxHeight: '88vh',
          overflowY: 'auto', boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
          paddingBottom: 'env(safe-area-inset-bottom, 16px)',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: '40px', height: '4px', borderRadius: '99px', background: colors.border }} />
        </div>

        {/* Header */}
        <div style={{ padding: '8px 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: isDeceased ? colors.textMuted : colors.text }}>
              {isDeceased ? '✝ ' : ''}{member.name}
            </h2>
            {isDeceased && (
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: colors.textMuted }}>
                Home with the Lord{member.date_of_death ? ` · ${toDisplay(member.date_of_death)}` : ''}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '50%', border: `1.5px solid ${colors.border}`,
              background: colors.surfaceAlt, cursor: 'pointer', fontSize: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: colors.textMid, flexShrink: 0, marginLeft: '12px',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ height: '1px', background: colors.border }} />

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {row('🎂', 'Date of Birth', member.dob ? `${toDisplay(member.dob)}${age !== null ? ` · Age ${age}` : ''}` : null)}
          {row('📍', 'Address', member.address)}
          {row('📞', 'Contact', member.contact_number)}
          {row('👤', 'Gender & Status', `${member.sex} · ${member.marital_status || 'Single'}`)}

          <div style={{ height: '1px', background: colors.border }} />

          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.textMuted, margin: 0 }}>Church Life</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { label: 'Registered Since', val: toDisplay(member.registered_since) },
              { label: 'Baptism Date', val: toDisplay(member.baptism_date) },
            ].map(({ label, val }) => (
              <div key={label} style={{ background: colors.surfaceAlt, borderRadius: '10px', padding: '12px' }}>
                <p style={{ fontSize: '10px', fontWeight: 600, color: colors.textMuted, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: colors.text, margin: 0 }}>{val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
function MemberManager() {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [ageFilter, setAgeFilter] = useState('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [importPreview, setImportPreview] = useState([])
  const [importErrors, setImportErrors] = useState([])
  const [savedMessage, setSavedMessage] = useState(null)
  const [selectedMember, setSelectedMember] = useState(null)
  const fileInputRef = useRef(null)
  const [formData, setFormData] = useState(DEFAULT_FORM)
  const [focusedInput, setFocusedInput] = useState(null)

  const handleLogout = async () => { await signOut(); navigate('/login') }

  const showSaved = (message, isError = false) => {
    setSavedMessage({ text: message, isError })
    setTimeout(() => setSavedMessage(null), 2500)
  }

  const loadMembers = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('members').select('*').order('name', { ascending: true })
    if (error) { showSaved('Error loading members', true); console.error(error) }
    else if (data) setMembers(data)
    setLoading(false)
  }

  useEffect(() => { loadMembers() }, [])

  const stats = useMemo(() => {
    const total = members.length
    const male = members.filter(m => m.sex === 'Male').length
    const female = members.filter(m => m.sex === 'Female').length
    const children = members.filter(m => { const a = calcAge(m.dob); return a !== null && a >= 0 && a <= 12 }).length
    const youth = members.filter(m => { const a = calcAge(m.dob); return a !== null && a >= 13 && a <= 25 }).length
    const adults = members.filter(m => { const a = calcAge(m.dob); return a !== null && a >= 26 }).length
    const baptised = members.filter(m => m.baptism_date).length
    const deceased = members.filter(m => m.is_deceased).length
    return { total, male, female, children, youth, adults, baptised, deceased }
  }, [members])

  const filteredMembers = useMemo(() => {
    let list = members
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      list = list.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.address.toLowerCase().includes(q) ||
        (m.contact_number && m.contact_number.includes(q))
      )
    }
    if (ageFilter !== 'all') {
      const group = AGE_GROUPS.find(g => g.key === ageFilter)
      list = list.filter(m => { const a = calcAge(m.dob); return a !== null && a >= group.min && a <= group.max })
    }
    return list
  }, [members, searchTerm, ageFilter])

  const openAdd = () => { setFormData(DEFAULT_FORM); setEditingId(null); setIsFormOpen(true) }
  const closeForm = () => { setIsFormOpen(false); setEditingId(null); setFormData(DEFAULT_FORM) }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      name: formData.name, sex: formData.sex, address: formData.address, dob: formData.dob,
      registered_since: formData.registeredSince || null, baptism_date: formData.baptismDate || null,
      marital_status: formData.maritalStatus, contact_number: formData.contactNumber || null,
      is_deceased: formData.isDeceased, date_of_death: formData.dateOfDeath || null,
      updated_at: new Date()
    }
    if (editingId !== null) {
      const { error } = await supabase.from('members').update(payload).eq('id', editingId)
      if (error) showSaved('Error updating member', true)
      else { showSaved('Member updated'); loadMembers() }
    } else {
      const { error } = await supabase.from('members').insert(payload)
      if (error) showSaved('Error adding member', true)
      else { showSaved('Member added'); loadMembers() }
    }
    closeForm()
  }

  const handleEdit = (member) => {
    setFormData({
      name: member.name, sex: member.sex || 'Male', address: member.address,
      dob: member.dob || '', registeredSince: member.registered_since || '',
      baptismDate: member.baptism_date || '', maritalStatus: member.marital_status || 'Single',
      contactNumber: member.contact_number || '', isDeceased: member.is_deceased || false,
      dateOfDeath: member.date_of_death || ''
    })
    setEditingId(member.id)
    setIsFormOpen(true)
  }

  const handleDelete = async (id, name) => {
    if (window.confirm(`Remove "${name}" from the directory?`)) {
      const { error } = await supabase.from('members').delete().eq('id', id)
      if (error) showSaved('Error deleting member', true)
      else { showSaved('Member removed'); loadMembers() }
    }
  }

  const handleExportCSV = () => {
    const headers = ['Name', 'Sex', 'Address', 'Contact Number', 'Date of Birth', 'Registered Since', 'Baptism Date', 'Marital Status', 'Deceased', 'Date of Death']
    const rows = filteredMembers.map(m => [
      `"${m.name}"`, m.sex || 'Male', `"${m.address}"`, m.contact_number || '',
      toCSV(m.dob), toCSV(m.registered_since), toCSV(m.baptism_date),
      m.marital_status || 'Single', m.is_deceased ? 'Yes' : 'No', toCSV(m.date_of_death) || ''
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `church_members_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
    showSaved('Exported successfully')
  }

  const downloadTemplate = () => {
    const headers = ['Name', 'Sex', 'Address', 'Contact Number', 'Date of Birth', 'Registered Since', 'Baptism Date', 'Marital Status', 'Deceased', 'Date of Death']
    const rows = [
      ['"John Tan"', 'Male', '"Taman Indah, Tawau"', '012-3456789', '15/05/1990', '10/01/2023', '20/06/2023', 'Married', 'No', ''],
      ['"Mary Wong"', 'Female', '"Jalan Kuhara, Tawau"', '019-8765432', '22/08/1985', '05/11/2022', '', 'Single', 'No', '']
    ]
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'church_members_template.csv'
    link.click()
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const lines = ev.target.result.split(/\r?\n/)
      const firstLine = lines[0].replace(/^\uFEFF/, '')
      const headers = firstLine.split(',').map(h => h.replace(/"/g, '').trim())
      const required = ['Name', 'Sex', 'Address', 'Date of Birth', 'Registered Since', 'Baptism Date', 'Marital Status']
      const missing = required.filter(h => !headers.includes(h))
      if (missing.length > 0) { setImportErrors([`Missing columns: ${missing.join(', ')}`]); setImportPreview([]); return }
      const parsed = [], errors = []
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue
        const row = []
        let inQ = false, field = ''
        for (const char of lines[i]) {
          if (char === '"') inQ = !inQ
          else if (char === ',' && !inQ) { row.push(field.replace(/^"|"$/g, '').trim()); field = '' }
          else field += char
        }
        row.push(field.replace(/^"|"$/g, '').trim())
        const name = row[0], sex = row[1], address = row[2], contactNumber = row[3] || ''
        const dob = row[4], registeredSince = row[5], baptismDate = row[6], maritalStatus = row[7]
        const isDeceased = row[8]?.toLowerCase() === 'yes', dateOfDeath = row[9] || ''
        if (!name || !address || !dob) { errors.push(`Row ${i}: Name, Address, and DOB required`); continue }
        if (sex && !SEX_OPTIONS.includes(sex)) { errors.push(`Row ${i}: Sex must be Male or Female`); continue }
        if (!isValidDate(dob)) { errors.push(`Row ${i}: Invalid DOB (DD/MM/YYYY)`); continue }
        if (registeredSince && !isValidDate(registeredSince)) { errors.push(`Row ${i}: Invalid Registered Since`); continue }
        if (baptismDate && !isValidDate(baptismDate)) { errors.push(`Row ${i}: Invalid Baptism Date`); continue }
        if (maritalStatus && !MARITAL_OPTIONS.includes(maritalStatus)) { errors.push(`Row ${i}: Invalid Marital Status`); continue }
        if (dateOfDeath && !isValidDate(dateOfDeath)) { errors.push(`Row ${i}: Invalid Date of Death`); continue }
        parsed.push({
          name, sex: sex || 'Male', address, contact_number: contactNumber,
          dob: toStorage(dob), registered_since: registeredSince ? toStorage(registeredSince) : null,
          baptism_date: baptismDate ? toStorage(baptismDate) : null,
          marital_status: maritalStatus || 'Single', is_deceased: isDeceased,
          date_of_death: dateOfDeath ? toStorage(dateOfDeath) : null
        })
      }
      if (errors.length > 0) { setImportErrors(errors); setImportPreview([]) }
      else { setImportErrors([]); setImportPreview(parsed) }
    }
    reader.readAsText(file, 'UTF-8')
  }

  const confirmImport = async () => {
    const { error } = await supabase.from('members').insert(importPreview)
    if (error) showSaved('Error importing members', true)
    else { showSaved(`${importPreview.length} members imported`); loadMembers() }
    setIsBulkImportOpen(false); setImportPreview([]); setImportErrors([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const closeImport = () => { setIsBulkImportOpen(false); setImportPreview([]); setImportErrors([]) }

  const getMaritalBadgeVariant = (status) => {
    if (status === 'Married') return 'married'
    if (status === 'Widowed') return 'widowed'
    if (status === 'Divorced') return 'divorced'
    return 'single'
  }

  const getAgeBadgeVariant = (age) => {
    if (age <= 12) return 'child'
    if (age <= 25) return 'youth'
    return 'adult'
  }

  // ── Modal sheet style
  const sheetStyle = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100,
  }
  const sheetContentStyle = {
    background: colors.surface, borderRadius: '24px 24px 0 0',
    width: '100%', maxWidth: '520px', maxHeight: '92vh', overflowY: 'auto',
    boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
    paddingBottom: 'env(safe-area-inset-bottom, 16px)',
  }
  const dragHandle = (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
      <div style={{ width: '40px', height: '4px', borderRadius: '99px', background: colors.border }} />
    </div>
  )

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          border: `3px solid ${colors.border}`, borderTopColor: colors.accent,
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ color: colors.textMuted, fontSize: '14px', margin: 0 }}>Loading members…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: "'Georgia', serif" }}>

      {/* ── Toast */}
      {savedMessage && (
        <div style={{
          position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 200, animation: 'slideDown 0.25s ease-out',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', borderRadius: '99px',
            background: savedMessage.isError ? colors.danger : colors.text,
            color: '#fff', fontSize: '14px', fontFamily: 'system-ui, sans-serif',
            fontWeight: 500, boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            whiteSpace: 'nowrap',
          }}>
            {savedMessage.isError ? '⚠ ' : '✓ '}{savedMessage.text}
          </div>
        </div>
      )}

      {/* ── Profile Modal */}
      {selectedMember && <MemberProfileModal member={selectedMember} onClose={() => setSelectedMember(null)} />}

      {/* ── Header */}
      <header style={{
        background: colors.surface, borderBottom: `1px solid ${colors.border}`,
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 16px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => navigate('/staff')}
              style={{
                width: '36px', height: '36px', borderRadius: '50%', border: `1.5px solid ${colors.border}`,
                background: colors.surfaceAlt, cursor: 'pointer', fontSize: '18px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textMid,
              }}
              aria-label="Back"
            >
              ←
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: colors.text, lineHeight: 1 }}>Members</h1>
              <p style={{ margin: 0, fontSize: '11px', color: colors.textMuted, fontFamily: 'system-ui, sans-serif', marginTop: '1px' }}>Church Directory</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{ fontSize: '13px', color: colors.textMuted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'system-ui, sans-serif', padding: '8px' }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* ── Main content */}
      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '20px 16px 40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* ── Stats grid */}
        <section>
          <p style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.textMuted, fontFamily: 'system-ui, sans-serif' }}>
            Congregation Overview
          </p>
          {/* Top row: 2 cols always */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <StatCard label="Total Members" value={stats.total} highlight />
            <StatCard label="Baptised" value={stats.baptised} sub={stats.total ? `${Math.round((stats.baptised / stats.total) * 100)}% of total` : '—'} />
          </div>
          {/* Second row: 2+2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <StatCard label="Male" value={stats.male} sub={stats.total ? `${Math.round((stats.male / stats.total) * 100)}%` : '—'} />
            <StatCard label="Female" value={stats.female} sub={stats.total ? `${Math.round((stats.female / stats.total) * 100)}%` : '—'} />
          </div>
          {/* Third row: 2+2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <StatCard label="Children (0–12)" value={stats.children} />
            <StatCard label="Youth (13–25)" value={stats.youth} />
            <StatCard label="Adults (26+)" value={stats.adults} />
            <StatCard label="Deceased" value={stats.deceased} />
          </div>
        </section>

        {/* ── Action buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={openAdd}
            style={{
              background: colors.text, color: '#fff', border: 'none',
              padding: '11px 20px', borderRadius: '99px', fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            + Add Member
          </button>
          <button
            onClick={() => setIsBulkImportOpen(true)}
            style={{
              background: colors.surface, color: colors.textMid, border: `1.5px solid ${colors.border}`,
              padding: '11px 18px', borderRadius: '99px', fontSize: '14px', fontWeight: 500,
              cursor: 'pointer', fontFamily: 'system-ui, sans-serif',
            }}
          >
            Bulk Import
          </button>
          <button
            onClick={handleExportCSV}
            disabled={members.length === 0}
            style={{
              background: colors.surface, color: colors.textMid, border: `1.5px solid ${colors.border}`,
              padding: '11px 18px', borderRadius: '99px', fontSize: '14px', fontWeight: 500,
              cursor: members.length === 0 ? 'not-allowed' : 'pointer',
              opacity: members.length === 0 ? 0.4 : 1,
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            Export CSV
          </button>
        </div>

        {/* ── Directory */}
        <section style={{ background: colors.surface, borderRadius: '18px', border: `1.5px solid ${colors.border}`, overflow: 'hidden' }}>

          {/* Panel header */}
          <div style={{ padding: '16px 16px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: colors.text }}>Directory</h2>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: colors.textMuted, fontFamily: 'system-ui, sans-serif' }}>
                  {filteredMembers.length !== members.length
                    ? `${filteredMembers.length} of ${members.length} shown`
                    : `${members.length} members`}
                </p>
              </div>
              {/* Search */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <input
                  type="text"
                  placeholder="Search…"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{
                    ...inputStyle,
                    width: '160px',
                    paddingLeft: '34px',
                    fontSize: '14px',
                    padding: '8px 12px 8px 34px',
                    borderRadius: '99px',
                  }}
                />
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted, fontSize: '15px', pointerEvents: 'none' }}>⌕</span>
              </div>
            </div>

            {/* Age filter pills */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {AGE_GROUPS.map(g => (
                <button
                  key={g.key}
                  onClick={() => setAgeFilter(g.key)}
                  style={{
                    padding: '5px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
                    border: `1.5px solid ${ageFilter === g.key ? colors.text : colors.border}`,
                    background: ageFilter === g.key ? colors.text : colors.surface,
                    color: ageFilter === g.key ? '#fff' : colors.textMid,
                    cursor: 'pointer', fontFamily: 'system-ui, sans-serif',
                    transition: 'all 0.15s',
                  }}
                >
                  {g.label}
                  {g.key !== 'all' && (
                    <span style={{ marginLeft: '5px', opacity: 0.65 }}>
                      {g.key === 'child' ? stats.children : g.key === 'youth' ? stats.youth : stats.adults}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: '1px', background: colors.border }} />

          {/* Empty state */}
          {filteredMembers.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.25 }}>🕊</div>
              <p style={{ color: colors.textMid, fontSize: '15px', margin: 0, fontFamily: 'system-ui, sans-serif' }}>
                {searchTerm || ageFilter !== 'all' ? 'No members match your filters' : 'No members yet'}
              </p>
              {!searchTerm && ageFilter === 'all' ? (
                <button onClick={openAdd} style={{ marginTop: '12px', color: colors.accent, background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontFamily: 'system-ui, sans-serif', fontWeight: 600 }}>
                  Add your first member →
                </button>
              ) : (
                <button onClick={() => { setSearchTerm(''); setAgeFilter('all') }} style={{ marginTop: '12px', color: colors.accent, background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontFamily: 'system-ui, sans-serif', fontWeight: 600 }}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            /* Member list — card-style rows for mobile friendliness */
            <div>
              {filteredMembers.map((member, idx) => {
                const age = calcAge(member.dob)
                const isDeceased = member.is_deceased
                return (
                  <div
                    key={member.id}
                    style={{
                      borderTop: idx === 0 ? 'none' : `1px solid ${colors.border}`,
                      padding: '14px 16px',
                      display: 'flex', alignItems: 'center', gap: '12px',
                      background: isDeceased ? colors.surfaceAlt : colors.surface,
                      opacity: isDeceased ? 0.7 : 1,
                      transition: 'background 0.1s',
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
                      background: isDeceased ? colors.border : (member.sex === 'Male' ? colors.maleBg : colors.femaleBg),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '15px', fontWeight: 700,
                      color: isDeceased ? colors.textMuted : (member.sex === 'Male' ? colors.male : colors.female),
                      fontFamily: 'system-ui, sans-serif',
                    }}>
                      {isDeceased ? '✝' : member.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Main info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <button
                        onClick={() => setSelectedMember(member)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                          textAlign: 'left', display: 'block', width: '100%',
                        }}
                      >
                        <p style={{
                          margin: 0, fontSize: '15px', fontWeight: 600,
                          color: isDeceased ? colors.textMuted : colors.text,
                          textDecoration: isDeceased ? 'line-through' : 'none',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          fontFamily: "'Georgia', serif",
                        }}>
                          {member.name}
                        </p>
                        <p style={{
                          margin: '2px 0 0', fontSize: '12px', color: colors.textMuted,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          fontFamily: 'system-ui, sans-serif',
                        }}>
                          {member.address}{age !== null && !isDeceased ? ` · ${age} yrs` : ''}
                        </p>
                      </button>
                    </div>

                    {/* Badges — visible on wider mobile */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                      {isDeceased ? (
                        <Badge variant="deceased">Deceased</Badge>
                      ) : (
                        <>
                          {age !== null && <Badge variant={getAgeBadgeVariant(age)}>{age}y</Badge>}
                          <Badge variant={getMaritalBadgeVariant(member.marital_status)}>{member.marital_status || 'Single'}</Badge>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0, marginLeft: '4px' }}>
                      <button
                        onClick={() => handleEdit(member)}
                        style={{
                          padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                          border: `1.5px solid ${colors.border}`, background: colors.surface,
                          cursor: 'pointer', color: colors.textMid, fontFamily: 'system-ui, sans-serif',
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(member.id, member.name)}
                        style={{
                          padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                          border: `1.5px solid #FECACA`, background: colors.dangerBg,
                          cursor: 'pointer', color: colors.danger, fontFamily: 'system-ui, sans-serif',
                        }}
                      >
                        Del
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <p style={{ textAlign: 'center', fontSize: '11px', color: colors.textMuted, margin: 0, fontFamily: 'system-ui, sans-serif', letterSpacing: '0.05em' }}>
          Synced to Supabase
        </p>
      </main>

      {/* ── Add/Edit Sheet */}
      {isFormOpen && (
        <div style={sheetStyle} onClick={closeForm}>
          <div style={sheetContentStyle} onClick={e => e.stopPropagation()}>
            {dragHandle}
            <div style={{ padding: '4px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: colors.text }}>
                {editingId ? 'Edit Member' : 'New Member'}
              </h2>
              <button onClick={closeForm} style={{ width: '32px', height: '32px', borderRadius: '50%', border: `1.5px solid ${colors.border}`, background: colors.surfaceAlt, cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textMid }}>×</button>
            </div>

            <div style={{ height: '1px', background: colors.border, margin: '8px 0' }} />

            <form onSubmit={handleSubmit} style={{ padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <Label>Full Name *</Label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g. John Tan" style={{ ...inputStyle, fontFamily: 'system-ui, sans-serif' }} />
              </div>

              <div>
                <Label>Sex</Label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {SEX_OPTIONS.map(s => (
                    <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px', color: colors.textMid, fontFamily: 'system-ui, sans-serif', flex: 1, padding: '10px 14px', border: `1.5px solid ${formData.sex === s ? colors.accent : colors.border}`, borderRadius: '10px', background: formData.sex === s ? colors.accentBg : colors.surface }}>
                      <input type="radio" name="sex" value={s} checked={formData.sex === s} onChange={handleInputChange} style={{ accentColor: colors.accent }} />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label>Address *</Label>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} required placeholder="e.g. Taman Indah, Tawau" style={{ ...inputStyle, fontFamily: 'system-ui, sans-serif' }} />
              </div>

              <div>
                <Label>Contact Number</Label>
                <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} placeholder="012-3456789" style={{ ...inputStyle, fontFamily: 'system-ui, sans-serif' }} />
              </div>

              <div>
                <Label>Date of Birth * <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: colors.textMuted }}>(DD/MM/YYYY)</span></Label>
                <DateInput value={formData.dob} onChange={v => setFormData(p => ({ ...p, dob: v }))} placeholder="15/05/1990" required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <Label>Registered Since</Label>
                  <DateInput value={formData.registeredSince} onChange={v => setFormData(p => ({ ...p, registeredSince: v }))} placeholder="10/01/2023" />
                </div>
                <div>
                  <Label>Baptism Date</Label>
                  <DateInput value={formData.baptismDate} onChange={v => setFormData(p => ({ ...p, baptismDate: v }))} placeholder="20/06/2023" />
                </div>
              </div>

              <div>
                <Label>Marital Status</Label>
                <select name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange} style={{ ...selectStyle, fontFamily: 'system-ui, sans-serif' }}>
                  {MARITAL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div style={{ background: colors.surfaceAlt, borderRadius: '12px', padding: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input type="checkbox" name="isDeceased" checked={formData.isDeceased} onChange={handleInputChange} style={{ width: '18px', height: '18px', accentColor: colors.accent, cursor: 'pointer' }} />
                  <span style={{ fontSize: '15px', color: colors.text, fontFamily: 'system-ui, sans-serif' }}>Mark as Deceased</span>
                </label>
                {formData.isDeceased && (
                  <div style={{ marginTop: '12px' }}>
                    <Label>Date of Death <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(DD/MM/YYYY)</span></Label>
                    <DateInput value={formData.dateOfDeath} onChange={v => setFormData(p => ({ ...p, dateOfDeath: v }))} placeholder="15/05/2024" />
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '4px' }}>
                <button type="button" onClick={closeForm} style={{ padding: '13px', borderRadius: '12px', border: `1.5px solid ${colors.border}`, background: colors.surface, color: colors.textMid, fontSize: '15px', fontWeight: 600, cursor: 'pointer', fontFamily: 'system-ui, sans-serif' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '13px', borderRadius: '12px', border: 'none', background: colors.text, color: '#fff', fontSize: '15px', fontWeight: 600, cursor: 'pointer', fontFamily: 'system-ui, sans-serif' }}>
                  {editingId ? 'Update' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Bulk Import Sheet */}
      {isBulkImportOpen && (
        <div style={sheetStyle} onClick={closeImport}>
          <div style={sheetContentStyle} onClick={e => e.stopPropagation()}>
            {dragHandle}
            <div style={{ padding: '4px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: colors.text }}>Bulk Import</h2>
              <button onClick={closeImport} style={{ width: '32px', height: '32px', borderRadius: '50%', border: `1.5px solid ${colors.border}`, background: colors.surfaceAlt, cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textMid }}>×</button>
            </div>

            <div style={{ height: '1px', background: colors.border, margin: '8px 0' }} />

            <div style={{ padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Step 1 */}
              <div style={{ background: colors.surfaceAlt, borderRadius: '14px', padding: '16px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: colors.text, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, flexShrink: 0, fontFamily: 'system-ui, sans-serif' }}>1</div>
                  <div>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: colors.text, fontFamily: 'system-ui, sans-serif' }}>Download the template</p>
                    <p style={{ margin: '3px 0 0', fontSize: '12px', color: colors.textMuted, fontFamily: 'system-ui, sans-serif' }}>Fill in with member data. Dates must be DD/MM/YYYY.</p>
                  </div>
                </div>
                <button onClick={downloadTemplate} style={{ padding: '9px 18px', borderRadius: '99px', border: 'none', background: colors.text, color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'system-ui, sans-serif' }}>
                  Download Template
                </button>
              </div>

              {/* Step 2 */}
              <div style={{ background: colors.surfaceAlt, borderRadius: '14px', padding: '16px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: colors.text, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, flexShrink: 0, fontFamily: 'system-ui, sans-serif' }}>2</div>
                  <div>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: colors.text, fontFamily: 'system-ui, sans-serif' }}>Upload your CSV</p>
                    <p style={{ margin: '3px 0 0', fontSize: '12px', color: colors.textMuted, fontFamily: 'system-ui, sans-serif' }}>Select your completed CSV file below.</p>
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} style={{ fontSize: '13px', color: colors.textMid, fontFamily: 'system-ui, sans-serif' }} />
              </div>

              {/* Errors */}
              {importErrors.length > 0 && (
                <div style={{ background: colors.dangerBg, border: `1.5px solid #FECACA`, borderRadius: '12px', padding: '12px', maxHeight: '140px', overflowY: 'auto' }}>
                  {importErrors.slice(0, 8).map((err, i) => (
                    <p key={i} style={{ margin: i === 0 ? 0 : '6px 0 0', fontSize: '12px', color: colors.danger, fontFamily: 'system-ui, sans-serif' }}>⚠ {err}</p>
                  ))}
                  {importErrors.length > 8 && <p style={{ margin: '6px 0 0', fontSize: '12px', color: colors.textMuted, fontFamily: 'system-ui, sans-serif' }}>…and {importErrors.length - 8} more</p>}
                </div>
              )}

              {/* Preview */}
              {importPreview.length > 0 && (
                <div>
                  <p style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 700, color: colors.text, fontFamily: 'system-ui, sans-serif' }}>{importPreview.length} members ready to import</p>
                  <div style={{ border: `1.5px solid ${colors.border}`, borderRadius: '12px', overflow: 'hidden', maxHeight: '160px', overflowY: 'auto' }}>
                    {importPreview.slice(0, 8).map((m, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', padding: '10px 14px', borderTop: i === 0 ? 'none' : `1px solid ${colors.border}`, background: colors.surface }}>
                        <span style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: colors.text, fontFamily: "'Georgia', serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                        <span style={{ fontSize: '12px', color: colors.textMuted, fontFamily: 'system-ui, sans-serif', whiteSpace: 'nowrap' }}>{m.sex} · {toDisplay(m.dob)}</span>
                      </div>
                    ))}
                    {importPreview.length > 8 && (
                      <div style={{ padding: '10px 14px', textAlign: 'center', fontSize: '12px', color: colors.textMuted, fontFamily: 'system-ui, sans-serif', borderTop: `1px solid ${colors.border}` }}>
                        …and {importPreview.length - 8} more
                      </div>
                    )}
                  </div>
                  <button onClick={confirmImport} style={{ marginTop: '12px', width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: colors.text, color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'system-ui, sans-serif' }}>
                    Import {importPreview.length} Members
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -12px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        input:focus, select:focus, textarea:focus { outline: none; border-color: ${colors.accent} !important; box-shadow: 0 0 0 3px ${colors.accentLight}; }
      `}</style>
    </div>
  )
}

export default MemberManager