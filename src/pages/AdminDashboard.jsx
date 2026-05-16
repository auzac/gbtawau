// src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

// ─── Constants ────────────────────────────────────────────────────────────────
const MARITAL_OPTIONS = ['Single', 'Married', 'Divorced', 'Widowed']
const SEX_OPTIONS = ['Male', 'Female']
const DEFAULT_FORM = {
  name: '', sex: 'Male', address: '', dob: '',
  registeredSince: '', baptismDate: '', maritalStatus: 'Single'
}
const AGE_GROUPS = [
  { key: 'all',    label: 'All',    min: 0,   max: Infinity },
  { key: 'child',  label: 'Children', min: 0, max: 12 },
  { key: 'youth',  label: 'Youth',  min: 13,  max: 25 },
  { key: 'adult',  label: 'Adults', min: 26,  max: Infinity },
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
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return false
  const [, d, mo, y] = m
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

// ─── DateInput helper ─────────────────────────────────────────────────────────
function DateInput({ value, onChange, placeholder, required }) {
  const [raw, setRaw] = useState(value ? toDisplay(value) : '')

  useEffect(() => {
    setRaw(value ? toDisplay(value) : '')
  }, [value])

  const handleChange = (e) => {
    const v = e.target.value
    setRaw(v)
    if (!v) { onChange(''); return }
    if (isValidDate(v)) onChange(toStorage(v))
  }

  return (
    <input
      type="text"
      value={raw}
      onChange={handleChange}
      required={required}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-[#EAE1D4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A88B] focus:border-transparent transition"
    />
  )
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent }) {
  return (
    <div className={`bg-white rounded-2xl border border-[#EAE1D4] p-4 flex flex-col gap-1 ${accent ? 'border-l-4 border-l-[#2D2926]' : ''}`}>
      <span className="text-[11px] uppercase tracking-widest text-[#9A8B80] font-medium">{label}</span>
      <span className="text-3xl font-serif text-[#2D2926] leading-none">{value}</span>
      {sub && <span className="text-[11px] text-[#B0A49A]">{sub}</span>}
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate()
  const [members, setMembers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [ageFilter, setAgeFilter] = useState('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [importPreview, setImportPreview] = useState([])
  const [importErrors, setImportErrors] = useState([])
  const fileInputRef = useRef(null)
  const [formData, setFormData] = useState(DEFAULT_FORM)

  // ── Persistence
  useEffect(() => {
    try {
      const stored = localStorage.getItem('churchMembers')
      if (stored) setMembers(JSON.parse(stored))
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    localStorage.setItem('churchMembers', JSON.stringify(members))
  }, [members])

  // ── Stats
  const stats = useMemo(() => {
    const total = members.length
    const male = members.filter(m => m.sex === 'Male').length
    const female = members.filter(m => m.sex === 'Female').length
    const children = members.filter(m => { const a = calcAge(m.dob); return a !== null && a >= 0 && a <= 12 }).length
    const youth = members.filter(m => { const a = calcAge(m.dob); return a !== null && a >= 13 && a <= 25 }).length
    const adults = members.filter(m => { const a = calcAge(m.dob); return a !== null && a >= 26 }).length
    const baptised = members.filter(m => m.baptismDate).length
    return { total, male, female, children, youth, adults, baptised }
  }, [members])

  // ── Filtered members
  const filteredMembers = useMemo(() => {
    let list = members
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      list = list.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.address.toLowerCase().includes(q)
      )
    }
    if (ageFilter !== 'all') {
      const group = AGE_GROUPS.find(g => g.key === ageFilter)
      list = list.filter(m => {
        const a = calcAge(m.dob)
        return a !== null && a >= group.min && a <= group.max
      })
    }
    return list
  }, [members, searchTerm, ageFilter])

  // ── Form handlers
  const openAdd = () => { setFormData(DEFAULT_FORM); setEditingId(null); setIsFormOpen(true) }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(p => ({ ...p, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId !== null) {
      setMembers(p => p.map(m => m.id === editingId ? { ...formData, id: editingId } : m))
    } else {
      setMembers(p => [...p, { ...formData, id: Date.now() }])
    }
    setFormData(DEFAULT_FORM)
    setEditingId(null)
    setIsFormOpen(false)
  }

  const handleEdit = (member) => {
    setFormData({
      name: member.name,
      sex: member.sex || 'Male',
      address: member.address,
      dob: member.dob || '',
      registeredSince: member.registeredSince || '',
      baptismDate: member.baptismDate || '',
      maritalStatus: member.maritalStatus || 'Single'
    })
    setEditingId(member.id)
    setIsFormOpen(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Remove this member from the directory?')) {
      setMembers(p => p.filter(m => m.id !== id))
    }
  }

  // ── CSV Export
  const handleExportCSV = () => {
    const headers = ['Name', 'Sex', 'Address', 'Date of Birth', 'Registered Since', 'Baptism Date', 'Marital Status']
    const rows = filteredMembers.map(m => [
      `"${m.name}"`, m.sex || 'Male', `"${m.address}"`,
      toCSV(m.dob), toCSV(m.registeredSince), toCSV(m.baptismDate),
      m.maritalStatus || 'Single'
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `church_members_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // ── Template download
  const downloadTemplate = () => {
    const headers = ['Name', 'Sex', 'Address', 'Date of Birth', 'Registered Since', 'Baptism Date', 'Marital Status']
    const rows = [
      ['"John Tan"', 'Male', '"Taman Indah, Tawau"', '15/05/1990', '10/01/2023', '20/06/2023', 'Married'],
      ['"Mary Wong"', 'Female', '"Jalan Kuhara, Tawau"', '22/08/1985', '05/11/2022', '', 'Single']
    ]
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'church_members_template.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  // ── Bulk import
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
      if (missing.length > 0) {
        setImportErrors([`Missing columns: ${missing.join(', ')}`])
        setImportPreview([])
        return
      }
      const parsed = []
      const errors = []
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue
        const row = []
        let inQ = false, field = ''
        for (const char of lines[i]) {
          if (char === '"') { inQ = !inQ }
          else if (char === ',' && !inQ) { row.push(field.replace(/^"|"$/g, '').trim()); field = '' }
          else { field += char }
        }
        row.push(field.replace(/^"|"$/g, '').trim())
        if (row.length < 7) { errors.push(`Row ${i}: expected 7 columns, got ${row.length}`); continue }
        const [name, sex, address, dob, registeredSince, baptismDate, maritalStatus] = row
        if (!name || !address || !dob) { errors.push(`Row ${i}: Name, Address, and DOB are required`); continue }
        if (sex && !SEX_OPTIONS.includes(sex)) { errors.push(`Row ${i}: Sex must be Male or Female`); continue }
        if (!isValidDate(dob)) { errors.push(`Row ${i}: Invalid DOB format (DD/MM/YYYY)`); continue }
        if (registeredSince && !isValidDate(registeredSince)) { errors.push(`Row ${i}: Invalid Registered Since format`); continue }
        if (baptismDate && !isValidDate(baptismDate)) { errors.push(`Row ${i}: Invalid Baptism Date format`); continue }
        if (maritalStatus && !MARITAL_OPTIONS.includes(maritalStatus)) { errors.push(`Row ${i}: Invalid Marital Status`); continue }
        parsed.push({
          name, sex: sex || 'Male', address,
          dob: toStorage(dob),
          registeredSince: registeredSince ? toStorage(registeredSince) : '',
          baptismDate: baptismDate ? toStorage(baptismDate) : '',
          maritalStatus: maritalStatus || 'Single',
          id: null
        })
      }
      if (errors.length > 0) { setImportErrors(errors); setImportPreview([]) }
      else { setImportErrors([]); setImportPreview(parsed) }
    }
    reader.readAsText(file, 'UTF-8')
  }

  const confirmImport = () => {
    setMembers(p => [...p, ...importPreview.map(m => ({ ...m, id: Date.now() + Math.random() }))])
    setIsBulkImportOpen(false)
    setImportPreview([])
    setImportErrors([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const closeImport = () => {
    setIsBulkImportOpen(false)
    setImportPreview([])
    setImportErrors([])
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingId(null)
    setFormData(DEFAULT_FORM)
  }

  // ── Render
  return (
    <div className="min-h-screen bg-[#FAF8F5]">

      {/* ── Header */}
      <header className="bg-white border-b border-[#EAE1D4] sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-[#2D2926] text-xl">✝</span>
            <div>
              <h1 className="text-base font-serif font-semibold text-[#2D2926] leading-tight">Gereja Baptis Tawau</h1>
              <p className="text-[10px] text-[#9A8B80] tracking-widest uppercase">Member Directory</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="text-xs text-[#8A7A6E] hover:text-[#2D2926] border border-[#EAE1D4] px-3 py-1.5 rounded-full transition hover:bg-[#F5EFE6]"
          >
            Logout
          </button>
        </div>
      </header>

      {/* ── Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── Stats — primary focus */}
        <div>
          <h2 className="text-xs uppercase tracking-widest text-[#9A8B80] mb-3 font-medium">Congregation Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total Members" value={stats.total} accent />
            <StatCard label="Baptised" value={stats.baptised} sub={stats.total ? `${Math.round((stats.baptised / stats.total) * 100)}% of total` : '—'} />
            <StatCard label="Male" value={stats.male} sub={stats.total ? `${Math.round((stats.male / stats.total) * 100)}%` : '—'} />
            <StatCard label="Female" value={stats.female} sub={stats.total ? `${Math.round((stats.female / stats.total) * 100)}%` : '—'} />
          </div>
          <div className="grid grid-cols-3 gap-3 mt-3">
            <StatCard label="Children (0–12)" value={stats.children} />
            <StatCard label="Youth (13–25)" value={stats.youth} />
            <StatCard label="Adults (26+)" value={stats.adults} />
          </div>
        </div>

        {/* ── Actions */}
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={openAdd}
            className="bg-[#2D2926] text-white text-sm px-4 py-2 rounded-full hover:bg-[#4A3F38] transition font-medium"
          >
            + Add Member
          </button>
          <button
            onClick={() => setIsBulkImportOpen(true)}
            className="border border-[#EAE1D4] text-[#7A6A5E] text-sm px-4 py-2 rounded-full hover:bg-[#F5EFE6] transition"
          >
            Bulk Import
          </button>
          <button
            onClick={handleExportCSV}
            disabled={members.length === 0}
            className="border border-[#EAE1D4] text-[#7A6A5E] text-sm px-4 py-2 rounded-full hover:bg-[#F5EFE6] transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Export CSV
          </button>
        </div>

        {/* ── Directory panel */}
        <div className="bg-white rounded-2xl border border-[#EAE1D4] overflow-hidden">

          {/* Panel header */}
          <div className="px-4 pt-4 pb-3 border-b border-[#EAE1D4] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-[#2D2926]">Member Directory</h2>
                <p className="text-[11px] text-[#9A8B80]">
                  {filteredMembers.length !== members.length
                    ? `${filteredMembers.length} of ${members.length} shown`
                    : `${members.length} total`}
                </p>
              </div>
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or address…"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 pl-8 pr-3 py-1.5 border border-[#EAE1D4] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A88B] transition"
                />
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9A8B80]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Age group filter tabs */}
            <div className="flex gap-1 flex-wrap">
              {AGE_GROUPS.map(g => (
                <button
                  key={g.key}
                  onClick={() => setAgeFilter(g.key)}
                  className={`text-xs px-3 py-1 rounded-full border transition font-medium ${
                    ageFilter === g.key
                      ? 'bg-[#2D2926] text-white border-[#2D2926]'
                      : 'border-[#EAE1D4] text-[#7A6A5E] hover:bg-[#F5EFE6]'
                  }`}
                >
                  {g.label}
                  {g.key !== 'all' && (
                    <span className={`ml-1.5 ${ageFilter === g.key ? 'text-[#C4A88B]' : 'text-[#B0A49A]'}`}>
                      {g.key === 'child' ? stats.children : g.key === 'youth' ? stats.youth : stats.adults}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Table / empty state */}
          {filteredMembers.length === 0 ? (
            <div className="text-center py-14">
              <div className="text-4xl mb-3 opacity-20">📋</div>
              <p className="text-[#8A7A6E] text-sm">
                {searchTerm || ageFilter !== 'all'
                  ? 'No members match your filters'
                  : 'No members yet'}
              </p>
              {!searchTerm && ageFilter === 'all' && (
                <button onClick={openAdd} className="mt-3 text-[#2D2926] underline text-sm">
                  Add your first member
                </button>
              )}
              {(searchTerm || ageFilter !== 'all') && (
                <button
                  onClick={() => { setSearchTerm(''); setAgeFilter('all') }}
                  className="mt-3 text-[#2D2926] underline text-sm"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F5EFE6]">
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#5B534D] uppercase tracking-wide">Name</th>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#5B534D] uppercase tracking-wide hidden sm:table-cell">Sex</th>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#5B534D] uppercase tracking-wide hidden md:table-cell">Address</th>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#5B534D] uppercase tracking-wide hidden lg:table-cell">DOB</th>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#5B534D] uppercase tracking-wide hidden lg:table-cell">Age</th>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#5B534D] uppercase tracking-wide">Status</th>
                    <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-[#5B534D] uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map(member => {
                    const age = calcAge(member.dob)
                    return (
                      <tr key={member.id} className="border-t border-[#EAE1D4] hover:bg-[#FAF8F5] transition-colors">
                        <td className="px-4 py-3 font-medium text-[#2D2926]">{member.name}</td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            member.sex === 'Male'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-pink-50 text-pink-700'
                          }`}>
                            {member.sex || 'Male'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#7A6A5E] hidden md:table-cell max-w-[180px] truncate">{member.address}</td>
                        <td className="px-4 py-3 text-[#7A6A5E] hidden lg:table-cell">{toDisplay(member.dob)}</td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {age !== null ? (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              age <= 12 ? 'bg-amber-50 text-amber-700' :
                              age <= 25 ? 'bg-teal-50 text-teal-700' :
                              'bg-stone-100 text-stone-600'
                            }`}>
                              {age}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            member.maritalStatus === 'Married' ? 'bg-green-50 text-green-700' :
                            member.maritalStatus === 'Widowed' ? 'bg-gray-100 text-gray-600' :
                            member.maritalStatus === 'Divorced' ? 'bg-red-50 text-red-700' :
                            'bg-blue-50 text-blue-700'
                          }`}>
                            {member.maritalStatus || 'Single'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap space-x-3">
                          <button onClick={() => handleEdit(member)} className="text-xs text-[#8A7A6E] hover:text-[#2D2926] transition font-medium">Edit</button>
                          <button onClick={() => handleDelete(member.id)} className="text-xs text-[#C4A88B] hover:text-red-600 transition font-medium">Delete</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-center text-[10px] text-[#C0B5AF] tracking-widest uppercase">
          Data stored locally in your browser
        </p>
      </main>

      {/* ── Add / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-serif text-[#2D2926]">{editingId ? 'Edit Member' : 'Add Member'}</h2>
              <button onClick={closeForm} className="text-[#8A7A6E] hover:text-[#2D2926] text-2xl leading-none transition">×</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wide text-[#9A8B80] mb-1">Full Name *</label>
                <input
                  type="text" name="name" value={formData.name}
                  onChange={handleInputChange} required
                  placeholder="e.g. John Tan"
                  className="w-full px-3 py-2 border border-[#EAE1D4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A88B] transition"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wide text-[#9A8B80] mb-1">Sex</label>
                <div className="flex gap-4 text-sm">
                  {SEX_OPTIONS.map(s => (
                    <label key={s} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="sex" value={s} checked={formData.sex === s} onChange={handleInputChange} />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wide text-[#9A8B80] mb-1">Address *</label>
                <input
                  type="text" name="address" value={formData.address}
                  onChange={handleInputChange} required
                  placeholder="e.g. Taman Indah, Tawau"
                  className="w-full px-3 py-2 border border-[#EAE1D4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A88B] transition"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wide text-[#9A8B80] mb-1">Date of Birth * <span className="normal-case text-[#B0A49A]">(DD/MM/YYYY)</span></label>
                <DateInput value={formData.dob} onChange={v => setFormData(p => ({ ...p, dob: v }))} placeholder="15/05/1990" required />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wide text-[#9A8B80] mb-1">Registered Since <span className="normal-case text-[#B0A49A]">(DD/MM/YYYY)</span></label>
                <DateInput value={formData.registeredSince} onChange={v => setFormData(p => ({ ...p, registeredSince: v }))} placeholder="10/01/2023" />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wide text-[#9A8B80] mb-1">Baptism Date <span className="normal-case text-[#B0A49A]">(DD/MM/YYYY)</span></label>
                <DateInput value={formData.baptismDate} onChange={v => setFormData(p => ({ ...p, baptismDate: v }))} placeholder="20/06/2023" />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wide text-[#9A8B80] mb-1">Marital Status</label>
                <select
                  name="maritalStatus" value={formData.maritalStatus}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-[#EAE1D4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A88B] transition bg-white"
                >
                  {MARITAL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-[#2D2926] text-white py-2.5 rounded-full text-sm font-medium hover:bg-[#4A3F38] transition">
                  {editingId ? 'Update Member' : 'Add Member'}
                </button>
                <button type="button" onClick={closeForm} className="flex-1 border border-[#EAE1D4] text-[#7A6A5E] py-2.5 rounded-full text-sm hover:bg-[#F5EFE6] transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Bulk Import Modal */}
      {isBulkImportOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-serif text-[#2D2926]">Bulk Import</h2>
              <button onClick={closeImport} className="text-[#8A7A6E] hover:text-[#2D2926] text-2xl leading-none transition">×</button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-[#F5EFE6] rounded-xl">
                <p className="text-sm font-medium text-[#2D2926] mb-1">Step 1 — Download the template</p>
                <p className="text-xs text-[#9A8B80] mb-3">Fill in the CSV file with member data. Dates must be DD/MM/YYYY.</p>
                <button onClick={downloadTemplate} className="bg-[#2D2926] text-white px-4 py-1.5 rounded-full text-sm hover:bg-[#4A3F38] transition">
                  Download Template
                </button>
              </div>
              <div className="p-4 bg-[#F5EFE6] rounded-xl">
                <p className="text-sm font-medium text-[#2D2926] mb-1">Step 2 — Upload your CSV</p>
                <p className="text-xs text-[#9A8B80] mb-3">Select your completed CSV file below.</p>
                <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="text-xs text-[#5B534D]" />
              </div>

              {importErrors.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs space-y-1 max-h-36 overflow-y-auto">
                  {importErrors.slice(0, 8).map((err, i) => <div key={i}>⚠ {err}</div>)}
                  {importErrors.length > 8 && <div className="text-red-400">…and {importErrors.length - 8} more errors</div>}
                </div>
              )}

              {importPreview.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-[#2D2926] mb-2">{importPreview.length} members ready to import</p>
                  <div className="max-h-40 overflow-y-auto border border-[#EAE1D4] rounded-xl text-xs">
                    <table className="w-full">
                      <thead><tr className="bg-[#F5EFE6]"><th className="p-2 text-left text-[#5B534D]">Name</th><th className="p-2 text-left text-[#5B534D]">Sex</th><th className="p-2 text-left text-[#5B534D]">DOB</th></tr></thead>
                      <tbody>
                        {importPreview.slice(0, 8).map((m, i) => (
                          <tr key={i} className="border-t border-[#EAE1D4]">
                            <td className="p-2">{m.name}</td>
                            <td className="p-2">{m.sex}</td>
                            <td className="p-2">{toDisplay(m.dob)}</td>
                          </tr>
                        ))}
                        {importPreview.length > 8 && (
                          <tr className="border-t border-[#EAE1D4]">
                            <td className="p-2 text-[#9A8B80] col-span-3">…and {importPreview.length - 8} more</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <button
                    onClick={confirmImport}
                    className="w-full mt-3 bg-[#2D2926] text-white py-2.5 rounded-full text-sm font-medium hover:bg-[#4A3F38] transition"
                  >
                    Import {importPreview.length} Members
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}