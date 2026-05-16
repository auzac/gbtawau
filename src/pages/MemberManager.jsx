// src/pages/MemberManager.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import {
  X, Phone, Calendar, MapPin, Heart, Cross, AlertCircle,
  ArrowLeft, LogOut, Plus, Upload, Download, Search,
  User, Users, Baby, Zap, BookOpen, Skull, ChevronDown,
  CheckCircle, UserCheck, Mars, Venus
} from 'lucide-react'

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

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:          '#FAF8F5',
  surface:     '#FFFFFF',
  surfaceAlt:  '#F5EFE6',
  border:      '#EAE1D4',
  text:        '#2D2926',
  textMid:     '#57534E',
  textMuted:   '#9A8B80',
  accent:      '#C4A88B',
  accentDark:  '#92622E',
  accentBg:    '#FDF3E8',
}

// ─── Date Utilities ───────────────────────────────────────────────────────────
const toDisplay = s => { if (!s) return '—'; const [y,m,d]=s.split('-'); return `${d}/${m}/${y}` }
const toStorage = s => { if (!s) return ''; const [d,m,y]=s.split('/'); return `${y}-${m}-${d}` }
const toCSV     = s => { if (!s) return ''; const [y,m,d]=s.split('-'); return `${d}/${m}/${y}` }
const isValidDate = s => {
  if (!s) return false
  const match = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return false
  const [,d,mo,y] = match
  const dt = new Date(y, mo-1, d)
  return dt.getFullYear()===+y && dt.getMonth()===+mo-1 && dt.getDate()===+d
}
const calcAge = dob => {
  if (!dob) return null
  const birth=new Date(dob), now=new Date()
  let age = now.getFullYear()-birth.getFullYear()
  const md = now.getMonth()-birth.getMonth()
  if (md<0||(md===0&&now.getDate()<birth.getDate())) age--
  return age
}

// ─── DateInput ────────────────────────────────────────────────────────────────
function DateInput({ value, onChange, placeholder, required }) {
  const [raw, setRaw] = useState(value ? toDisplay(value) : '')
  useEffect(() => { setRaw(value ? toDisplay(value) : '') }, [value])
  const handleChange = e => {
    const v = e.target.value; setRaw(v)
    if (!v) { onChange(''); return }
    if (isValidDate(v)) onChange(toStorage(v))
  }
  return <input type="text" value={raw} onChange={handleChange} required={required} placeholder={placeholder} className="mm-input" />
}

// ─── Badge ────────────────────────────────────────────────────────────────────
const BADGE_MAP = {
  male:     { bg:'#EFF6FF', color:'#1D4ED8' },
  female:   { bg:'#FDF2F8', color:'#BE185D' },
  married:  { bg:'#F0FDF4', color:'#166534' },
  single:   { bg:'#EFF6FF', color:'#1D4ED8' },
  widowed:  { bg:'#F5F3FF', color:'#6D28D9' },
  divorced: { bg:'#FFF7ED', color:'#C2410C' },
  deceased: { bg:'#F3F4F6', color:'#6B7280' },
  child:    { bg:'#FFFBEB', color:'#B45309' },
  youth:    { bg:'#F0FDFA', color:'#0F766E' },
  adult:    { bg:C.surfaceAlt, color:C.textMid },
  baptised: { bg:'#F0FDF4', color:'#166534' },
}
function Badge({ variant='adult', children }) {
  const s = BADGE_MAP[variant] || BADGE_MAP.adult
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:'3px',
      padding:'2px 8px', borderRadius:'20px', fontSize:'11px', fontWeight:600,
      background:s.bg, color:s.color, whiteSpace:'nowrap',
      fontFamily:"'DM Sans', system-ui, sans-serif",
    }}>
      {children}
    </span>
  )
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, dark }) {
  return (
    <div style={{
      background: dark ? C.text : C.surface,
      border:`1.5px solid ${dark ? C.text : C.border}`,
      borderRadius:'16px', padding:'14px 16px',
      display:'flex', flexDirection:'column', gap:'5px', minWidth:0,
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{
          fontSize:'10px', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase',
          color: dark ? '#78716C' : C.textMuted,
          fontFamily:"'DM Sans', system-ui, sans-serif",
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
        }}>{label}</span>
        {Icon && <Icon size={13} style={{ color: dark ? '#78716C' : C.accent, flexShrink:0 }} />}
      </div>
      <span style={{
        fontSize:'30px', fontWeight:700, lineHeight:1,
        color: dark ? '#FFFFFF' : C.text,
        fontFamily:"'Lora', 'Georgia', 'Times New Roman', serif",
        fontVariantNumeric:'tabular-nums',
      }}>{value}</span>
      {sub && <span style={{ fontSize:'11px', color: dark ? '#78716C' : C.textMuted, fontFamily:"'DM Sans', system-ui, sans-serif" }}>{sub}</span>}
    </div>
  )
}

// ─── Field label ──────────────────────────────────────────────────────────────
function FieldLabel({ children }) {
  return (
    <label style={{
      display:'block', fontSize:'10px', fontWeight:700, letterSpacing:'0.09em',
      textTransform:'uppercase', color:C.textMuted, marginBottom:'6px',
      fontFamily:"'DM Sans', system-ui, sans-serif",
    }}>{children}</label>
  )
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ children, style={} }) {
  return (
    <p style={{
      margin:'0 0 10px', fontSize:'10px', fontWeight:700, letterSpacing:'0.12em',
      textTransform:'uppercase', color:C.textMuted, fontFamily:"'DM Sans', system-ui, sans-serif",
      ...style,
    }}>{children}</p>
  )
}

// ─── Member Profile Modal ─────────────────────────────────────────────────────
function MemberProfileModal({ member, onClose, isMobile }) {
  const age = calcAge(member.dob)
  const isDeceased = member.is_deceased

  const InfoRow = ({ icon: Icon, label, value }) => {
    if (!value || value === '—') return null
    return (
      <div style={{ display:'flex', gap:'12px', alignItems:'flex-start' }}>
        <div style={{ width:'34px', height:'34px', borderRadius:'10px', flexShrink:0, background:C.accentBg, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon size={15} style={{ color:C.accentDark }} />
        </div>
        <div style={{ minWidth:0 }}>
          <p style={{ margin:0, fontSize:'10px', fontWeight:700, letterSpacing:'0.09em', textTransform:'uppercase', color:C.textMuted, fontFamily:"'DM Sans', system-ui, sans-serif" }}>{label}</p>
          <p style={{ margin:'3px 0 0', fontSize:'14px', color:C.text, wordBreak:'break-word', fontFamily:'system-ui, sans-serif' }}>{value}</p>
        </div>
      </div>
    )
  }

  const overlayStyle = {
    position:'fixed', inset:0, background:'rgba(0,0,0,0.5)',
    display:'flex', zIndex:100, backdropFilter:'blur(2px)',
    ...(isMobile
      ? { alignItems:'flex-end', justifyContent:'center' }
      : { alignItems:'center', justifyContent:'center', padding:'24px' }),
  }
  const panelStyle = {
    background:C.surface, width:'100%', overflowY:'auto',
    ...(isMobile
      ? { borderRadius:'24px 24px 0 0', maxHeight:'88vh', boxShadow:'0 -8px 40px rgba(0,0,0,0.18)', paddingBottom:'env(safe-area-inset-bottom,16px)' }
      : { borderRadius:'20px', maxWidth:'460px', maxHeight:'85vh', boxShadow:'0 24px 64px rgba(0,0,0,0.18)' }),
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={e => e.stopPropagation()}>
        {isMobile && (
          <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 4px' }}>
            <div style={{ width:'40px', height:'4px', borderRadius:'99px', background:C.border }} />
          </div>
        )}
        {/* Header */}
        <div style={{ padding: isMobile ? '8px 20px 16px' : '24px 24px 0', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'12px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <div style={{
              width:'46px', height:'46px', borderRadius:'14px', flexShrink:0,
              background: isDeceased ? '#F3F4F6' : (member.sex==='Male'?'#EFF6FF':'#FDF2F8'),
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              {isDeceased
                ? <Cross size={18} style={{ color:'#9CA3AF' }} />
                : <span style={{ fontSize:'19px', fontWeight:700, color:member.sex==='Male'?'#1D4ED8':'#BE185D', fontFamily:"'Lora', 'Georgia', serif" }}>{member.name.charAt(0)}</span>
              }
            </div>
            <div>
              <h2 style={{ margin:0, fontSize:'20px', fontWeight:700, lineHeight:1.1, color: isDeceased ? C.textMuted : C.text, fontFamily:"'Lora', 'Georgia', 'Times New Roman', serif" }}>
                {member.name}
              </h2>
              {isDeceased && <p style={{ margin:'4px 0 0', fontSize:'12px', color:C.textMuted, fontFamily:"'DM Sans', system-ui, sans-serif" }}>Home with the Lord{member.date_of_death?` · ${toDisplay(member.date_of_death)}`:''}</p>}
            </div>
          </div>
          <button onClick={onClose} style={{ width:'32px', height:'32px', borderRadius:'50%', border:`1.5px solid ${C.border}`, background:C.surfaceAlt, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <X size={15} style={{ color:C.textMid }} />
          </button>
        </div>

        <div style={{ height:'1px', background:C.border, margin:'16px 0' }} />

        <div style={{ padding: isMobile ? '0 20px 8px' : '0 24px 24px', display:'flex', flexDirection:'column', gap:'14px' }}>
          <InfoRow icon={Calendar} label="Date of Birth" value={member.dob ? `${toDisplay(member.dob)}${age!==null?` · Age ${age}`:''}` : null} />
          <InfoRow icon={MapPin}   label="Address"       value={member.address} />
          <InfoRow icon={Phone}    label="Contact"       value={member.contact_number} />
          <InfoRow icon={User}     label="Gender & Status" value={`${member.sex} · ${member.marital_status||'Single'}`} />
          <div style={{ height:'1px', background:C.border }} />
          <SectionLabel>Church Life</SectionLabel>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
            {[
              { label:'Registered Since', val:toDisplay(member.registered_since) },
              { label:'Baptism Date',     val:toDisplay(member.baptism_date) },
            ].map(({ label, val }) => (
              <div key={label} style={{ background:C.surfaceAlt, borderRadius:'12px', padding:'12px' }}>
                <p style={{ margin:'0 0 4px', fontSize:'10px', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', color:C.textMuted, fontFamily:"'DM Sans', system-ui, sans-serif" }}>{label}</p>
                <p style={{ margin:0, fontSize:'14px', fontWeight:600, color:C.text, fontFamily:"'Lora', 'Georgia', serif" }}>{val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Modal Shell (form & import) ──────────────────────────────────────────────
function ModalShell({ title, onClose, isMobile, children }) {
  const overlayStyle = {
    position:'fixed', inset:0, background:'rgba(0,0,0,0.5)',
    display:'flex', zIndex:100, backdropFilter:'blur(2px)',
    ...(isMobile
      ? { alignItems:'flex-end', justifyContent:'center' }
      : { alignItems:'center', justifyContent:'center', padding:'24px' }),
  }
  const panelStyle = {
    background:C.surface, width:'100%', overflowY:'auto',
    ...(isMobile
      ? { borderRadius:'24px 24px 0 0', maxHeight:'92vh', boxShadow:'0 -8px 40px rgba(0,0,0,0.18)', paddingBottom:'env(safe-area-inset-bottom,16px)' }
      : { borderRadius:'20px', maxWidth:'500px', maxHeight:'88vh', boxShadow:'0 24px 64px rgba(0,0,0,0.2)' }),
  }
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={e => e.stopPropagation()}>
        {isMobile && (
          <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 4px' }}>
            <div style={{ width:'40px', height:'4px', borderRadius:'99px', background:C.border }} />
          </div>
        )}
        <div style={{ padding: isMobile ? '8px 20px 16px' : '24px 24px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h2 style={{ margin:0, fontSize:isMobile?'20px':'22px', fontWeight:700, color:C.text, fontFamily:"'Lora', 'Georgia', 'Times New Roman', serif" }}>
            {title}
          </h2>
          <button onClick={onClose} style={{ width:'32px', height:'32px', borderRadius:'50%', border:`1.5px solid ${C.border}`, background:C.surfaceAlt, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X size={15} style={{ color:C.textMid }} />
          </button>
        </div>
        <div style={{ height:'1px', background:C.border }} />
        <div style={{ padding: isMobile ? '16px 20px 8px' : '20px 24px 24px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// ─── Shared button styles ───────────────────────────────────────────────────
const btnBase = {
  display:'inline-flex', alignItems:'center', justifyContent:'center',
  gap:'7px', borderRadius:'99px', fontFamily:"'DM Sans', system-ui, sans-serif",
  fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', border:'none',
}
const btnPrimary    = { ...btnBase, padding:'10px 18px', fontSize:'14px', background:C.text,    color:'#fff' }
const btnSecondary  = { ...btnBase, padding:'10px 18px', fontSize:'14px', background:C.surface, color:C.textMid, border:`1.5px solid ${C.border}` }
const btnPrimaryFull   = { ...btnPrimary,   width:'100%', padding:'13px', borderRadius:'12px', fontSize:'15px' }
const btnSecondaryFull = { ...btnSecondary, width:'100%', padding:'13px', borderRadius:'12px', fontSize:'15px' }
const rowBtnEdit = { padding:'6px 14px', borderRadius:'8px', fontSize:'12px', fontWeight:600, border:`1.5px solid ${C.border}`, background:C.surface, cursor:'pointer', color:C.textMid, fontFamily:"'DM Sans', system-ui, sans-serif" }
const rowBtnDel  = { padding:'6px 14px', borderRadius:'8px', fontSize:'12px', fontWeight:600, border:'1.5px solid #FECACA', background:'#FEF2F2', cursor:'pointer', color:'#DC2626', fontFamily:"'DM Sans', system-ui, sans-serif" }

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MemberManager() {
  const navigate    = useNavigate()
  const { signOut } = useAuth()

  const [members,         setMembers]         = useState([])
  const [loading,         setLoading]         = useState(true)
  const [searchTerm,      setSearchTerm]      = useState('')
  const [ageFilter,       setAgeFilter]       = useState('all')
  const [isFormOpen,      setIsFormOpen]      = useState(false)
  const [isBulkImportOpen,setIsBulkImportOpen]= useState(false)
  const [editingId,       setEditingId]       = useState(null)
  const [importPreview,   setImportPreview]   = useState([])
  const [importErrors,    setImportErrors]    = useState([])
  const [savedMessage,    setSavedMessage]    = useState(null)
  const [selectedMember,  setSelectedMember]  = useState(null)
  const [isMobile,        setIsMobile]        = useState(false)
  const fileInputRef = useRef(null)
  const [formData, setFormData] = useState(DEFAULT_FORM)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleLogout = async () => { await signOut(); navigate('/login') }

  const showSaved = (text, isError=false) => {
    setSavedMessage({ text, isError })
    setTimeout(() => setSavedMessage(null), 2500)
  }

  const loadMembers = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('members').select('*').order('name', { ascending:true })
    if (error) { showSaved('Error loading members', true); console.error(error) }
    else if (data) setMembers(data)
    setLoading(false)
  }
  useEffect(() => { loadMembers() }, [])

  const stats = useMemo(() => {
    const total    = members.length
    const male     = members.filter(m => m.sex==='Male').length
    const female   = members.filter(m => m.sex==='Female').length
    const children = members.filter(m => { const a=calcAge(m.dob); return a!==null&&a>=0&&a<=12 }).length
    const youth    = members.filter(m => { const a=calcAge(m.dob); return a!==null&&a>=13&&a<=25 }).length
    const adults   = members.filter(m => { const a=calcAge(m.dob); return a!==null&&a>=26 }).length
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
      const g = AGE_GROUPS.find(g => g.key===ageFilter)
      list = list.filter(m => { const a=calcAge(m.dob); return a!==null&&a>=g.min&&a<=g.max })
    }
    return list
  }, [members, searchTerm, ageFilter])

  const openAdd   = () => { setFormData(DEFAULT_FORM); setEditingId(null); setIsFormOpen(true) }
  const closeForm = () => { setIsFormOpen(false); setEditingId(null); setFormData(DEFAULT_FORM) }

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target
    setFormData(p => ({ ...p, [name]: type==='checkbox' ? checked : value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const payload = {
      name:formData.name, sex:formData.sex, address:formData.address, dob:formData.dob,
      registered_since:formData.registeredSince||null, baptism_date:formData.baptismDate||null,
      marital_status:formData.maritalStatus, contact_number:formData.contactNumber||null,
      is_deceased:formData.isDeceased, date_of_death:formData.dateOfDeath||null,
      updated_at:new Date()
    }
    if (editingId !== null) {
      const { error } = await supabase.from('members').update(payload).eq('id', editingId)
      error ? showSaved('Error updating member', true) : (showSaved('Member updated'), loadMembers())
    } else {
      const { error } = await supabase.from('members').insert(payload)
      error ? showSaved('Error adding member', true) : (showSaved('Member added'), loadMembers())
    }
    closeForm()
  }

  const handleEdit = member => {
    setFormData({
      name:member.name, sex:member.sex||'Male', address:member.address,
      dob:member.dob||'', registeredSince:member.registered_since||'',
      baptismDate:member.baptism_date||'', maritalStatus:member.marital_status||'Single',
      contactNumber:member.contact_number||'', isDeceased:member.is_deceased||false,
      dateOfDeath:member.date_of_death||''
    })
    setEditingId(member.id); setIsFormOpen(true)
  }

  const handleDelete = async (id, name) => {
    if (window.confirm(`Remove "${name}" from the directory?`)) {
      const { error } = await supabase.from('members').delete().eq('id', id)
      error ? showSaved('Error deleting member', true) : (showSaved('Member removed'), loadMembers())
    }
  }

  const handleExportCSV = () => {
    const headers = ['Name','Sex','Address','Contact Number','Date of Birth','Registered Since','Baptism Date','Marital Status','Deceased','Date of Death']
    const rows = filteredMembers.map(m => [
      `"${m.name}"`, m.sex||'Male', `"${m.address}"`, m.contact_number||'',
      toCSV(m.dob), toCSV(m.registered_since), toCSV(m.baptism_date),
      m.marital_status||'Single', m.is_deceased?'Yes':'No', toCSV(m.date_of_death)||''
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob(['\uFEFF'+csv], { type:'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href=url; a.download=`church_members_${new Date().toISOString().split('T')[0]}.csv`; a.click()
    URL.revokeObjectURL(url); showSaved('Exported successfully')
  }

  const downloadTemplate = () => {
    const headers = ['Name','Sex','Address','Contact Number','Date of Birth','Registered Since','Baptism Date','Marital Status','Deceased','Date of Death']
    const rows = [
      ['"John Tan"','Male','"Taman Indah, Tawau"','012-3456789','15/05/1990','10/01/2023','20/06/2023','Married','No',''],
      ['"Mary Wong"','Female','"Jalan Kuhara, Tawau"','019-8765432','22/08/1985','05/11/2022','','Single','No',''],
    ]
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob(['\uFEFF'+csv], { type:'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob); const a=document.createElement('a')
    a.href=url; a.download='church_members_template.csv'; a.click()
  }

  const handleFileUpload = e => {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const lines = ev.target.result.split(/\r?\n/)
      const headers = lines[0].replace(/^\uFEFF/,'').split(',').map(h => h.replace(/"/g,'').trim())
      const required = ['Name','Sex','Address','Date of Birth','Registered Since','Baptism Date','Marital Status']
      const missing = required.filter(h => !headers.includes(h))
      if (missing.length) { setImportErrors([`Missing columns: ${missing.join(', ')}`]); setImportPreview([]); return }
      const parsed=[], errors=[]
      for (let i=1; i<lines.length; i++) {
        if (!lines[i].trim()) continue
        const row=[]; let inQ=false, field=''
        for (const char of lines[i]) {
          if (char==='"') inQ=!inQ
          else if (char===','&&!inQ) { row.push(field.replace(/^"|"$/g,'').trim()); field='' }
          else field+=char
        }
        row.push(field.replace(/^"|"$/g,'').trim())
        const name=row[0],sex=row[1],address=row[2],contactNumber=row[3]||''
        const dob=row[4],registeredSince=row[5],baptismDate=row[6],maritalStatus=row[7]
        const isDeceased=row[8]?.toLowerCase()==='yes', dateOfDeath=row[9]||''
        if (!name||!address||!dob) { errors.push(`Row ${i}: Name, Address, DOB required`); continue }
        if (sex&&!SEX_OPTIONS.includes(sex)) { errors.push(`Row ${i}: Sex must be Male or Female`); continue }
        if (!isValidDate(dob)) { errors.push(`Row ${i}: Invalid DOB (DD/MM/YYYY)`); continue }
        if (registeredSince&&!isValidDate(registeredSince)) { errors.push(`Row ${i}: Invalid Registered Since`); continue }
        if (baptismDate&&!isValidDate(baptismDate)) { errors.push(`Row ${i}: Invalid Baptism Date`); continue }
        if (maritalStatus&&!MARITAL_OPTIONS.includes(maritalStatus)) { errors.push(`Row ${i}: Invalid Marital Status`); continue }
        if (dateOfDeath&&!isValidDate(dateOfDeath)) { errors.push(`Row ${i}: Invalid Date of Death`); continue }
        parsed.push({
          name, sex:sex||'Male', address, contact_number:contactNumber,
          dob:toStorage(dob), registered_since:registeredSince?toStorage(registeredSince):null,
          baptism_date:baptismDate?toStorage(baptismDate):null,
          marital_status:maritalStatus||'Single', is_deceased:isDeceased,
          date_of_death:dateOfDeath?toStorage(dateOfDeath):null
        })
      }
      if (errors.length) { setImportErrors(errors); setImportPreview([]) }
      else { setImportErrors([]); setImportPreview(parsed) }
    }
    reader.readAsText(file,'UTF-8')
  }

  const confirmImport = async () => {
    const { error } = await supabase.from('members').insert(importPreview)
    error ? showSaved('Error importing members', true) : (showSaved(`${importPreview.length} members imported`), loadMembers())
    setIsBulkImportOpen(false); setImportPreview([]); setImportErrors([])
    if (fileInputRef.current) fileInputRef.current.value=''
  }
  const closeImport = () => { setIsBulkImportOpen(false); setImportPreview([]); setImportErrors([]) }

  const maritalVariant = s => s==='Married'?'married':s==='Widowed'?'widowed':s==='Divorced'?'divorced':'single'
  const ageVariant     = a => a<=12?'child':a<=25?'youth':'adult'

  if (loading) return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'14px' }}>
      <div style={{ width:'34px', height:'34px', borderRadius:'50%', border:`3px solid ${C.border}`, borderTopColor:C.accent, animation:'spin 0.8s linear infinite' }} />
      <p style={{ color:C.textMuted, fontSize:'13px', margin:0, fontFamily:"'DM Sans', system-ui, sans-serif" }}>Loading directory…</p>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:C.bg }}>

      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

      {/* ── Toast */}
      {savedMessage && (
        <div style={{ position:'fixed', top:'76px', left:'50%', transform:'translateX(-50%)', zIndex:200, animation:'slideDown 0.2s ease-out', pointerEvents:'none' }}>
          <div style={{
            display:'flex', alignItems:'center', gap:'7px',
            padding:'9px 18px', borderRadius:'99px',
            background: savedMessage.isError ? '#DC2626' : C.text,
            color:'#fff', fontSize:'13px', fontWeight:600,
            fontFamily:"'DM Sans', system-ui, sans-serif",
            boxShadow:'0 4px 20px rgba(0,0,0,0.2)', whiteSpace:'nowrap',
          }}>
            {savedMessage.isError ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
            {savedMessage.text}
          </div>
        </div>
      )}

      {/* Profile modal */}
      {selectedMember && <MemberProfileModal member={selectedMember} onClose={() => setSelectedMember(null)} isMobile={isMobile} />}

      {/* ── Header */}
      <header style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, position:'sticky', top:0, zIndex:50 }}>
        <div style={{ maxWidth:'1400px', margin:'0 auto', padding:'0 20px', height:'60px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
            <button onClick={() => navigate('/staff')} style={{ width:'36px', height:'36px', borderRadius:'50%', border:`1.5px solid ${C.border}`, background:C.surfaceAlt, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <ArrowLeft size={16} style={{ color:C.textMid }} />
            </button>
            <div>
              <h1 style={{ margin:0, fontSize:'17px', fontWeight:700, color:C.text, lineHeight:1.1, fontFamily:"'Lora', 'Georgia', 'Times New Roman', serif" }}>
                Member Management
              </h1>
              <p style={{ margin:0, fontSize:'11px', color:C.textMuted, fontFamily:"'DM Sans', system-ui, sans-serif", letterSpacing:'0.03em' }}>
                Church Directory
              </p>
            </div>
          </div>
          <button onClick={handleLogout} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 14px', borderRadius:'99px', border:`1.5px solid ${C.border}`, background:C.surface, cursor:'pointer', fontSize:'13px', color:C.textMid, fontFamily:"'DM Sans', system-ui, sans-serif", fontWeight:500 }}>
            <LogOut size={13} />
            {!isMobile && 'Sign out'}
          </button>
        </div>
      </header>

      {/* ── Body */}
      <div style={{ maxWidth:'1400px', margin:'0 auto', padding: isMobile ? '20px 16px 48px' : '28px 28px 56px', display:'flex', gap:'28px', alignItems:'flex-start' }}>

        {/* ── Sidebar (desktop) */}
        {!isMobile && (
          <aside style={{ width:'280px', flexShrink:0, position:'sticky', top:'84px', display:'flex', flexDirection:'column', gap:'20px' }}>

            <div>
              <SectionLabel>Overview</SectionLabel>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                <StatCard icon={Users}    label="Total Members" value={stats.total} dark />
                <StatCard icon={BookOpen} label="Baptised"      value={stats.baptised}
                  sub={stats.total ? `${Math.round((stats.baptised/stats.total)*100)}% of total` : '—'} />
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <StatCard icon={Mars}  label="Male"   value={stats.male}   sub={stats.total?`${Math.round((stats.male/stats.total)*100)}%`:'—'} />
                  <StatCard icon={Venus} label="Female" value={stats.female} sub={stats.total?`${Math.round((stats.female/stats.total)*100)}%`:'—'} />
                </div>
              </div>
            </div>

            <div>
              <SectionLabel>Age Groups</SectionLabel>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {[
                  { label:'Children', value:stats.children, sub:'0 – 12 years',  variant:'child',    icon:Baby },
                  { label:'Youth',    value:stats.youth,    sub:'13 – 25 years',  variant:'youth',    icon:Zap },
                  { label:'Adults',   value:stats.adults,   sub:'26 and above',   variant:'adult',    icon:User },
                  { label:'Deceased', value:stats.deceased, sub:'On record',       variant:'deceased', icon:Skull },
                ].map(({ label, value, sub, variant, icon:Icon }) => (
                  <div key={label} style={{ background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:'14px', padding:'12px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <Icon size={14} style={{ color:C.textMuted }} />
                      <div>
                        <p style={{ margin:0, fontSize:'13px', fontWeight:600, color:C.text, fontFamily:"'Lora', 'Georgia', serif" }}>{label}</p>
                        <p style={{ margin:'1px 0 0', fontSize:'10px', color:C.textMuted, fontFamily:"'DM Sans', system-ui, sans-serif" }}>{sub}</p>
                      </div>
                    </div>
                    <Badge variant={variant}>{value}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <SectionLabel>Actions</SectionLabel>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                <button onClick={openAdd} style={{ ...btnPrimary, width:'100%', borderRadius:'12px', padding:'11px' }}>
                  <Plus size={15} /> Add Member
                </button>
                <button onClick={() => setIsBulkImportOpen(true)} style={{ ...btnSecondary, width:'100%', borderRadius:'12px', padding:'11px' }}>
                  <Upload size={14} /> Bulk Import
                </button>
                <button onClick={handleExportCSV} disabled={members.length===0} style={{ ...btnSecondary, width:'100%', borderRadius:'12px', padding:'11px', opacity:members.length===0?0.4:1 }}>
                  <Download size={14} /> Export CSV
                </button>
              </div>
            </div>

            <p style={{ margin:0, fontSize:'10px', color:C.textMuted, fontFamily:"'DM Sans', system-ui, sans-serif", textAlign:'center', letterSpacing:'0.05em' }}>
              Synced to Supabase
            </p>
          </aside>
        )}

        {/* ── Main column */}
        <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:'16px' }}>

          {/* Mobile stats */}
          {isMobile && (
            <section>
              <SectionLabel>Congregation Overview</SectionLabel>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' }}>
                <StatCard icon={Users}    label="Total Members" value={stats.total} dark />
                <StatCard icon={BookOpen} label="Baptised"      value={stats.baptised} sub={stats.total?`${Math.round((stats.baptised/stats.total)*100)}%`:'—'} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' }}>
                <StatCard icon={Mars}  label="Male"   value={stats.male}   sub={stats.total?`${Math.round((stats.male/stats.total)*100)}%`:'—'} />
                <StatCard icon={Venus} label="Female" value={stats.female} sub={stats.total?`${Math.round((stats.female/stats.total)*100)}%`:'—'} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                <StatCard icon={Baby}  label="Children (0–12)" value={stats.children} />
                <StatCard icon={Zap}   label="Youth (13–25)"   value={stats.youth} />
                <StatCard icon={User}  label="Adults (26+)"    value={stats.adults} />
                <StatCard icon={Skull} label="Deceased"         value={stats.deceased} />
              </div>
            </section>
          )}

          {/* Mobile actions */}
          {isMobile && (
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              <button onClick={openAdd} style={btnPrimary}><Plus size={15} /> Add Member</button>
              <button onClick={() => setIsBulkImportOpen(true)} style={btnSecondary}><Upload size={14} /></button>
              <button onClick={handleExportCSV} disabled={members.length===0} style={{ ...btnSecondary, opacity:members.length===0?0.4:1 }}><Download size={14} /></button>
            </div>
          )}

          {/* ── Directory panel */}
          <div style={{ background:C.surface, borderRadius:'18px', border:`1.5px solid ${C.border}`, overflow:'hidden' }}>

            {/* Panel header */}
            <div style={{ padding: isMobile ? '14px 16px 12px' : '18px 20px 14px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'12px', marginBottom:'12px' }}>
                <div>
                  <h2 style={{ margin:0, fontSize:'16px', fontWeight:700, color:C.text, fontFamily:"'Lora', 'Georgia', 'Times New Roman', serif" }}>
                    Member Directory
                  </h2>
                  <p style={{ margin:'2px 0 0', fontSize:'12px', color:C.textMuted, fontFamily:"'DM Sans', system-ui, sans-serif" }}>
                    {filteredMembers.length !== members.length
                      ? `${filteredMembers.length} of ${members.length} shown`
                      : `${members.length} total members`}
                  </p>
                </div>
                <div style={{ position:'relative', flexShrink:0 }}>
                  <input
                    type="text" placeholder="Search…" value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="mm-input"
                    style={{ width: isMobile ? '130px' : '240px', padding:'8px 12px 8px 34px', borderRadius:'99px', fontSize:'13px' }}
                  />
                  <Search size={13} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:C.textMuted, pointerEvents:'none' }} />
                </div>
              </div>

              {/* Age filter pills */}
              <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                {AGE_GROUPS.map(g => (
                  <button key={g.key} onClick={() => setAgeFilter(g.key)} style={{
                    padding:'5px 12px', borderRadius:'99px', fontSize:'12px', fontWeight:600,
                    border:`1.5px solid ${ageFilter===g.key ? C.text : C.border}`,
                    background: ageFilter===g.key ? C.text : C.surface,
                    color: ageFilter===g.key ? '#fff' : C.textMid,
                    cursor:'pointer', fontFamily:"'DM Sans', system-ui, sans-serif",
                    display:'flex', alignItems:'center', gap:'5px',
                  }}>
                    {g.label}
                    {g.key !== 'all' && <span style={{ opacity:0.6 }}>{g.key==='child'?stats.children:g.key==='youth'?stats.youth:stats.adults}</span>}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height:'1px', background:C.border }} />

            {/* Empty state */}
            {filteredMembers.length === 0 ? (
              <div style={{ padding:'56px 24px', textAlign:'center' }}>
                <div style={{ width:'48px', height:'48px', borderRadius:'14px', background:C.surfaceAlt, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
                  <Users size={22} style={{ color:C.textMuted }} />
                </div>
                <p style={{ color:C.textMid, fontSize:'15px', margin:0, fontFamily:"'Lora', 'Georgia', serif" }}>
                  {searchTerm||ageFilter!=='all' ? 'No members match your filters' : 'No members yet'}
                </p>
                <button
                  onClick={searchTerm||ageFilter!=='all' ? ()=>{ setSearchTerm(''); setAgeFilter('all') } : openAdd}
                  style={{ marginTop:'12px', color:C.accentDark, background:'none', border:'none', cursor:'pointer', fontSize:'14px', fontFamily:"'DM Sans', system-ui, sans-serif", fontWeight:600 }}
                >
                  {searchTerm||ageFilter!=='all' ? 'Clear filters' : 'Add your first member →'}
                </button>
              </div>

            ) : isMobile ? (
              /* ── Mobile: card rows (unchanged) */
              <div>
                {filteredMembers.map((member, idx) => {
                  const age = calcAge(member.dob)
                  const isDeceased = member.is_deceased
                  return (
                    <div key={member.id} style={{
                      borderTop: idx===0 ? 'none' : `1px solid ${C.border}`,
                      padding:'12px 16px', display:'flex', alignItems:'center', gap:'12px',
                      background: isDeceased ? C.surfaceAlt : C.surface,
                      opacity: isDeceased ? 0.72 : 1,
                    }}>
                      <div style={{
                        width:'40px', height:'40px', borderRadius:'12px', flexShrink:0,
                        background: isDeceased ? '#F3F4F6' : (member.sex==='Male'?'#EFF6FF':'#FDF2F8'),
                        display:'flex', alignItems:'center', justifyContent:'center',
                      }}>
                        {isDeceased
                          ? <Cross size={15} style={{ color:'#9CA3AF' }} />
                          : <span style={{ fontSize:'16px', fontWeight:700, color:member.sex==='Male'?'#1D4ED8':'#BE185D', fontFamily:"'Lora', 'Georgia', serif" }}>{member.name.charAt(0)}</span>
                        }
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <button onClick={() => setSelectedMember(member)} style={{ background:'none', border:'none', cursor:'pointer', padding:0, textAlign:'left', width:'100%' }}>
                          <p style={{ margin:0, fontSize:'15px', fontWeight:700, color: isDeceased ? C.textMuted : C.text, textDecoration: isDeceased ? 'line-through' : 'none', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontFamily:"'Lora', 'Georgia', 'Times New Roman', serif" }}>
                            {member.name}
                          </p>
                          <p style={{ margin:'2px 0 0', fontSize:'12px', color:C.textMuted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontFamily:"'DM Sans', system-ui, sans-serif" }}>
                            {member.address}{age!==null&&!isDeceased?` · ${age} yrs`:''}
                          </p>
                        </button>
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:'4px', flexShrink:0, alignItems:'flex-end' }}>
                        {isDeceased ? <Badge variant="deceased">Deceased</Badge> : (
                          <>
                            {age!==null && <Badge variant={ageVariant(age)}>{age}y</Badge>}
                            <Badge variant={maritalVariant(member.marital_status)}>{member.marital_status||'Single'}</Badge>
                          </>
                        )}
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:'4px', flexShrink:0 }}>
                        <button onClick={() => handleEdit(member)} style={rowBtnEdit}>Edit</button>
                        <button onClick={() => handleDelete(member.id, member.name)} style={rowBtnDel}>Del</button>
                      </div>
                    </div>
                  )
                })}
              </div>

            ) : (
              /* ── Desktop: simplified table (Name, Sex, Address, Status, Actions) */
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
                  <thead>
                    <tr style={{ background:C.surfaceAlt }}>
                      <th style={{ padding:'12px 16px', textAlign:'left', fontSize:'10px', fontWeight:700, letterSpacing:'0.09em', textTransform:'uppercase', color:C.textMid, fontFamily:"'DM Sans', system-ui, sans-serif", width:'30%' }}>Name</th>
                      <th style={{ padding:'12px 16px', textAlign:'left', fontSize:'10px', fontWeight:700, letterSpacing:'0.09em', textTransform:'uppercase', color:C.textMid, fontFamily:"'DM Sans', system-ui, sans-serif", width:'10%' }}>Sex</th>
                      <th style={{ padding:'12px 16px', textAlign:'left', fontSize:'10px', fontWeight:700, letterSpacing:'0.09em', textTransform:'uppercase', color:C.textMid, fontFamily:"'DM Sans', system-ui, sans-serif", width:'35%' }}>Address</th>
                      <th style={{ padding:'12px 16px', textAlign:'left', fontSize:'10px', fontWeight:700, letterSpacing:'0.09em', textTransform:'uppercase', color:C.textMid, fontFamily:"'DM Sans', system-ui, sans-serif", width:'15%' }}>Status</th>
                      <th style={{ padding:'12px 16px', textAlign:'right', fontSize:'10px', fontWeight:700, letterSpacing:'0.09em', textTransform:'uppercase', color:C.textMid, fontFamily:"'DM Sans', system-ui, sans-serif", width:'10%' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map(member => {
                      const isDeceased = member.is_deceased
                      return (
                        <tr
                          key={member.id}
                          style={{ borderTop:`1px solid ${C.border}`, background: isDeceased ? C.surfaceAlt : C.surface, opacity: isDeceased ? 0.72 : 1, transition:'background 0.1s' }}
                          onMouseEnter={e => { if (!isDeceased) e.currentTarget.style.background = C.bg }}
                          onMouseLeave={e => { e.currentTarget.style.background = isDeceased ? C.surfaceAlt : C.surface }}
                        >
                          {/* Name */}
                          <td style={{ padding:'12px 16px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                              <div style={{
                                width:'32px', height:'32px', borderRadius:'9px', flexShrink:0,
                                background: isDeceased ? '#F3F4F6' : (member.sex==='Male'?'#EFF6FF':'#FDF2F8'),
                                display:'flex', alignItems:'center', justifyContent:'center',
                              }}>
                                {isDeceased
                                  ? <Cross size={13} style={{ color:'#9CA3AF' }} />
                                  : <span style={{ fontSize:'13px', fontWeight:700, color:member.sex==='Male'?'#1D4ED8':'#BE185D', fontFamily:"'Lora', 'Georgia', serif" }}>{member.name.charAt(0)}</span>
                                }
                              </div>
                              <button onClick={() => setSelectedMember(member)} style={{
                                background:'none', border:'none', cursor:'pointer', padding:0,
                                fontSize:'14px', fontWeight:600, textAlign:'left',
                                color: isDeceased ? C.textMuted : C.text,
                                textDecoration: isDeceased ? 'line-through' : 'none',
                                fontFamily:"'Lora', 'Georgia', 'Times New Roman', serif",
                                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                              }}>
                                {member.name}
                              </button>
                            </div>
                          </td>
                          {/* Sex */}
                          <td style={{ padding:'12px 16px', whiteSpace:'nowrap' }}>
                            <Badge variant={member.sex==='Male'?'male':'female'}>{member.sex||'Male'}</Badge>
                          </td>
                          {/* Address */}
                          <td style={{ padding:'12px 16px', color:C.textMid, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontFamily:"'DM Sans', system-ui, sans-serif", fontSize:'13px' }}>
                            {member.address}
                          </td>
                          {/* Status */}
                          <td style={{ padding:'12px 16px' }}>
                            {isDeceased
                              ? <Badge variant="deceased">Deceased</Badge>
                              : member.baptism_date
                                ? <Badge variant="baptised"><UserCheck size={10} style={{ marginRight:'2px' }} />Baptised</Badge>
                                : <span style={{ color:C.textMuted, fontSize:'12px', fontFamily:"'DM Sans', system-ui, sans-serif" }}>—</span>
                            }
                          </td>
                          {/* Actions */}
                          <td style={{ padding:'12px 16px', textAlign:'right', whiteSpace:'nowrap' }}>
                            <button onClick={() => handleEdit(member)} style={{ ...rowBtnEdit, marginRight:'8px' }}>Edit</button>
                            <button onClick={() => handleDelete(member.id, member.name)} style={rowBtnDel}>Delete</button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {isMobile && (
            <p style={{ textAlign:'center', fontSize:'10px', color:C.textMuted, margin:0, fontFamily:"'DM Sans', system-ui, sans-serif", letterSpacing:'0.05em' }}>
              Synced to Supabase · Cloud storage
            </p>
          )}
        </div>
      </div>

      {/* ── Add / Edit Modal (unchanged) */}
      {isFormOpen && (
        <ModalShell title={editingId ? 'Edit Member' : 'New Member'} onClose={closeForm} isMobile={isMobile}>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            <div>
              <FieldLabel>Full Name *</FieldLabel>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g. John Tan" className="mm-input" />
            </div>

            <div>
              <FieldLabel>Sex</FieldLabel>
              <div style={{ display:'flex', gap:'10px' }}>
                {SEX_OPTIONS.map(s => (
                  <label key={s} style={{
                    display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', flex:1,
                    fontSize:'14px', color:C.textMid, fontFamily:"'DM Sans', system-ui, sans-serif",
                    padding:'10px 14px', borderRadius:'10px',
                    border:`1.5px solid ${formData.sex===s ? C.accentDark : C.border}`,
                    background: formData.sex===s ? C.accentBg : C.surface,
                  }}>
                    <input type="radio" name="sex" value={s} checked={formData.sex===s} onChange={handleInputChange} style={{ accentColor:C.accentDark }} />
                    {s}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>Address *</FieldLabel>
              <input type="text" name="address" value={formData.address} onChange={handleInputChange} required placeholder="e.g. Taman Indah, Tawau" className="mm-input" />
            </div>

            <div>
              <FieldLabel>Contact Number</FieldLabel>
              <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} placeholder="012-3456789" className="mm-input" />
            </div>

            <div>
              <FieldLabel>Date of Birth * <span style={{ fontWeight:400, textTransform:'none', letterSpacing:0, color:C.textMuted }}>(DD/MM/YYYY)</span></FieldLabel>
              <DateInput value={formData.dob} onChange={v => setFormData(p=>({...p,dob:v}))} placeholder="15/05/1990" required />
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
              <div>
                <FieldLabel>Registered Since</FieldLabel>
                <DateInput value={formData.registeredSince} onChange={v => setFormData(p=>({...p,registeredSince:v}))} placeholder="10/01/2023" />
              </div>
              <div>
                <FieldLabel>Baptism Date</FieldLabel>
                <DateInput value={formData.baptismDate} onChange={v => setFormData(p=>({...p,baptismDate:v}))} placeholder="20/06/2023" />
              </div>
            </div>

            <div>
              <FieldLabel>Marital Status</FieldLabel>
              <div style={{ position:'relative' }}>
                <select name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange} className="mm-input" style={{ appearance:'none', paddingRight:'36px' }}>
                  {MARITAL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <ChevronDown size={14} style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', color:C.textMuted, pointerEvents:'none' }} />
              </div>
            </div>

            <div style={{ background:C.surfaceAlt, borderRadius:'12px', padding:'14px' }}>
              <label style={{ display:'flex', alignItems:'center', gap:'10px', cursor:'pointer' }}>
                <input type="checkbox" name="isDeceased" checked={formData.isDeceased} onChange={handleInputChange} style={{ width:'18px', height:'18px', accentColor:C.accentDark, cursor:'pointer' }} />
                <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                  <Cross size={14} style={{ color:C.textMuted }} />
                  <span style={{ fontSize:'14px', color:C.text, fontFamily:"'DM Sans', system-ui, sans-serif" }}>Mark as Deceased</span>
                </div>
              </label>
              {formData.isDeceased && (
                <div style={{ marginTop:'12px' }}>
                  <FieldLabel>Date of Death (DD/MM/YYYY)</FieldLabel>
                  <DateInput value={formData.dateOfDeath} onChange={v => setFormData(p=>({...p,dateOfDeath:v}))} placeholder="15/05/2024" />
                </div>
              )}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', paddingTop:'4px' }}>
              <button type="button" onClick={closeForm} style={btnSecondaryFull}>Cancel</button>
              <button type="submit" style={btnPrimaryFull}>{editingId ? 'Update' : 'Add Member'}</button>
            </div>
          </form>
        </ModalShell>
      )}

      {/* ── Bulk Import Modal (unchanged) */}
      {isBulkImportOpen && (
        <ModalShell title="Bulk Import" onClose={closeImport} isMobile={isMobile}>
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            {[
              { n:1, title:'Download the template', sub:'Fill in with member data. Dates in DD/MM/YYYY format.', btn: <button onClick={downloadTemplate} style={{ ...btnPrimary, fontSize:'13px', padding:'8px 16px' }}><Download size={13} />Download Template</button> },
              { n:2, title:'Upload your CSV', sub:'Select your completed CSV file.', btn: <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} style={{ fontSize:'13px', color:C.textMid, fontFamily:"'DM Sans', system-ui, sans-serif" }} /> },
            ].map(({ n, title, sub, btn }) => (
              <div key={n} style={{ background:C.surfaceAlt, borderRadius:'14px', padding:'16px' }}>
                <div style={{ display:'flex', gap:'10px', alignItems:'flex-start', marginBottom:'10px' }}>
                  <div style={{ width:'26px', height:'26px', borderRadius:'50%', background:C.text, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:700, flexShrink:0, fontFamily:"'DM Sans', system-ui, sans-serif" }}>{n}</div>
                  <div>
                    <p style={{ margin:0, fontSize:'14px', fontWeight:700, color:C.text, fontFamily:"'Lora', 'Georgia', serif" }}>{title}</p>
                    <p style={{ margin:'3px 0 0', fontSize:'12px', color:C.textMuted, fontFamily:"'DM Sans', system-ui, sans-serif" }}>{sub}</p>
                  </div>
                </div>
                {btn}
              </div>
            ))}

            {importErrors.length > 0 && (
              <div style={{ background:'#FEF2F2', border:'1.5px solid #FECACA', borderRadius:'12px', padding:'12px', maxHeight:'140px', overflowY:'auto' }}>
                {importErrors.slice(0,8).map((err,i) => (
                  <div key={i} style={{ display:'flex', gap:'6px', alignItems:'flex-start', marginTop: i===0?0:'6px' }}>
                    <AlertCircle size={13} style={{ color:'#DC2626', flexShrink:0, marginTop:'1px' }} />
                    <p style={{ margin:0, fontSize:'12px', color:'#DC2626', fontFamily:"'DM Sans', system-ui, sans-serif" }}>{err}</p>
                  </div>
                ))}
                {importErrors.length > 8 && <p style={{ margin:'6px 0 0', fontSize:'12px', color:C.textMuted, fontFamily:"'DM Sans', system-ui, sans-serif" }}>…and {importErrors.length-8} more</p>}
              </div>
            )}

            {importPreview.length > 0 && (
              <div>
                <p style={{ margin:'0 0 10px', fontSize:'14px', fontWeight:600, color:C.text, fontFamily:"'Lora', 'Georgia', serif" }}>
                  {importPreview.length} members ready to import
                </p>
                <div style={{ border:`1.5px solid ${C.border}`, borderRadius:'12px', overflow:'hidden', maxHeight:'160px', overflowY:'auto' }}>
                  {importPreview.slice(0,8).map((m,i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', gap:'10px', padding:'9px 14px', borderTop:i===0?'none':`1px solid ${C.border}`, background:C.surface }}>
                      <span style={{ fontSize:'13px', fontWeight:600, color:C.text, fontFamily:"'Lora', 'Georgia', serif", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.name}</span>
                      <span style={{ fontSize:'12px', color:C.textMuted, fontFamily:"'DM Sans', system-ui, sans-serif", whiteSpace:'nowrap' }}>{m.sex} · {toDisplay(m.dob)}</span>
                    </div>
                  ))}
                  {importPreview.length > 8 && (
                    <div style={{ padding:'9px 14px', textAlign:'center', fontSize:'12px', color:C.textMuted, fontFamily:"'DM Sans', system-ui, sans-serif", borderTop:`1px solid ${C.border}` }}>
                      …and {importPreview.length-8} more
                    </div>
                  )}
                </div>
                <button onClick={confirmImport} style={{ ...btnPrimaryFull, marginTop:'12px' }}>
                  Import {importPreview.length} Members
                </button>
              </div>
            )}
          </div>
        </ModalShell>
      )}

      <style>{`
        .mm-input {
          width: 100%;
          padding: 10px 12px;
          border: 1.5px solid ${C.border};
          border-radius: 10px;
          font-size: 14px;
          background: ${C.surface};
          color: ${C.text};
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .mm-input:focus {
          border-color: ${C.accentDark};
          box-shadow: 0 0 0 3px ${C.accentBg};
        }
        .mm-input::placeholder { color: ${C.textMuted}; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -10px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        button { transition: opacity 0.12s; }
        button:active { opacity: 0.78; }
      `}</style>
    </div>
  )
}