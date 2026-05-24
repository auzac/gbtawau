// src/features/members/MemberManager.jsx
import React, { useState, useEffect, useMemo } from 'react'
import StaffLayout from '../../components/layout/StaffLayout'
import { fetchMembers, createMember, updateMember, deleteMember, bulkImportMembers } from '../../services/members'
import {
  Plus, Upload, Download, Search,
  User, Users, Baby, Zap, BookOpen, Skull,
  Mars, Venus
} from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import StatCard from '../../components/ui/StatCard'
import Toast from '../../components/ui/Toast'
import useIsMobile from '../../hooks/useIsMobile'
import { useToast } from '../../hooks/useToast'
import MemberProfileModal from './MemberProfileModal'
import MemberForm from './MemberForm'
import BulkImportModal from './BulkImportModal'
import MemberCard from './MemberCard'
import MemberTable from './MemberTable'

// ─── Constants ────────────────────────────────────────────────────────────────
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
const toCSV = s => { if (!s) return ''; const [y,m,d]=s.split('-'); return `${d}/${m}/${y}` }
const calcAge = dob => {
  if (!dob) return null
  const birth=new Date(dob), now=new Date()
  let age = now.getFullYear()-birth.getFullYear()
  const md = now.getMonth()-birth.getMonth()
  if (md<0||(md===0&&now.getDate()<birth.getDate())) age--
  return age
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

// ─── Shared button styles ───────────────────────────────────────────────────
const btnBase = {
  display:'inline-flex', alignItems:'center', justifyContent:'center',
  gap:'7px', borderRadius:'99px', fontFamily:"'DM Sans', system-ui, sans-serif",
  fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', border:'none',
}
const btnPrimary    = { ...btnBase, padding:'10px 18px', fontSize:'14px', background:C.text,    color:'#fff' }
const btnSecondary  = { ...btnBase, padding:'10px 18px', fontSize:'14px', background:C.surface, color:C.textMid, border:`1.5px solid ${C.border}` }
// ─── Main Component ───────────────────────────────────────────────────────────
export default function MemberManager() {
  const [members,         setMembers]         = useState([])
  const [loading,         setLoading]         = useState(true)
  const [searchTerm,      setSearchTerm]      = useState('')
  const [ageFilter,       setAgeFilter]       = useState('all')
  const [isFormOpen,      setIsFormOpen]      = useState(false)
  const [isBulkImportOpen,setIsBulkImportOpen]= useState(false)
  const [editingId,       setEditingId]       = useState(null)
  const [selectedMember,  setSelectedMember]  = useState(null)
  const [formData, setFormData] = useState(DEFAULT_FORM)
  const isMobile = useIsMobile()
  const { toast, showToast } = useToast()

  const loadMembers = async () => {
    setLoading(true)
    try {
      const data = await fetchMembers()
      setMembers(data)
    } catch (err) { showToast('Error loading members', true); console.error(err) }
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
      try { await updateMember(editingId, payload); showToast('Member updated'); loadMembers() }
      catch { showToast('Error updating member', true) }
    } else {
      try { await createMember(payload); showToast('Member added'); loadMembers() }
      catch { showToast('Error adding member', true) }
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
      try { await deleteMember(id); showToast('Member removed'); loadMembers() }
      catch { showToast('Error deleting member', true) }
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
    const blob = new Blob(['﻿'+csv], { type:'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href=url; a.download=`church_members_${new Date().toISOString().split('T')[0]}.csv`; a.click()
    URL.revokeObjectURL(url); showToast('Exported successfully')
  }

  const handleBulkImport = async (members) => {
    try { await bulkImportMembers(members); showToast(`${members.length} members imported`); loadMembers() }
    catch { showToast('Error importing members', true) }
    setIsBulkImportOpen(false)
  }

  if (loading) return <LoadingSpinner accentColor="#C4A88B"><p style={{ color:'#9A8B80', fontSize:'13px', margin:0, fontFamily:"'DM Sans', system-ui, sans-serif" }}>Loading directory…</p></LoadingSpinner>

  return (
    <StaffLayout title="Member Management" subtitle="Church Directory">
      {toast && <Toast message={toast.text} isError={toast.isError} />}
      {selectedMember && <MemberProfileModal member={selectedMember} onClose={() => setSelectedMember(null)} isMobile={isMobile} />}

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
              <MemberCard
                members={filteredMembers}
                onSelect={setSelectedMember}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />

            ) : (
              <MemberTable
                members={filteredMembers}
                onSelect={setSelectedMember}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>

          {isMobile && (
            <p style={{ textAlign:'center', fontSize:'10px', color:C.textMuted, margin:0, fontFamily:"'DM Sans', system-ui, sans-serif", letterSpacing:'0.05em' }}>
              Synced to Supabase · Cloud storage
            </p>
          )}
        </div>
      </div>

      <MemberForm
        isOpen={isFormOpen}
        onClose={closeForm}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        editingId={editingId}
        isMobile={isMobile}
      />

      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImport={handleBulkImport}
        isMobile={isMobile}
      />

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
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        button { transition: opacity 0.12s; }
        button:active { opacity: 0.78; }
      `}</style>
    </StaffLayout>
  )
}
