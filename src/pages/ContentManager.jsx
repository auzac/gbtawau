// src/pages/ContentManager.jsx
import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, LogOut, BookOpen, CalendarDays, Music, Save,
  Plus, Pencil, Trash2, Search, X, CheckCircle, AlertCircle,
  Download, Upload, MapPin, User, Megaphone, Image, Eye, EyeOff,
  Link, MoveUp, MoveDown
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

// ─── Tokens ───────────────────────────────────────────────────────────────────
const C = {
  bg: '#FAF8F5', surface: '#FFFFFF', surfaceAlt: '#F5EFE6',
  border: '#EAE1D4', text: '#2D2926', textMid: '#57534E',
  textMuted: '#9A8B80', accent: '#C4A88B', accentDark: '#92622E',
  accentBg: '#FDF3E8',
}
const f = { serif: "'Lora', serif", sans: "'DM Sans', sans-serif" }

const inp = {
  width: '100%', padding: '10px 12px', border: `1.5px solid ${C.border}`,
  borderRadius: '10px', fontSize: '14px', background: C.surface,
  color: C.text, outline: 'none', boxSizing: 'border-box', fontFamily: f.sans,
}
const th = { padding: '11px 16px', textAlign: 'left', fontSize: '10px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: C.textMuted, fontFamily: f.sans, whiteSpace: 'nowrap' }
const td = { padding: '13px 16px', fontSize: '13px', color: C.textMid, fontFamily: f.sans, verticalAlign: 'middle' }

// ─── Micro components ─────────────────────────────────────────────────────────
const Label = ({ children }) => (
  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: C.textMuted, marginBottom: '6px', fontFamily: f.sans }}>{children}</label>
)
const Field = ({ label, children }) => <div><Label>{label}</Label>{children}</div>

// Circular icon button
const IBtn = ({ onClick, children, danger, style = {} }) => (
  <button onClick={onClick} style={{ width: '32px', height: '32px', borderRadius: '50%', border: `1.5px solid ${danger ? '#FECACA' : C.border}`, background: danger ? '#FEF2F2' : C.surfaceAlt, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...style }}>
    {children}
  </button>
)

// Text button (pill)
const PillBtn = ({ onClick, children, primary, danger, type = 'button', style = {} }) => (
  <button type={type} onClick={onClick} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 18px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, fontFamily: f.sans, cursor: 'pointer', border: primary ? 'none' : `1.5px solid ${danger ? '#FECACA' : C.border}`, background: primary ? C.text : danger ? '#FEF2F2' : C.surface, color: primary ? '#fff' : danger ? '#DC2626' : C.textMid, ...style }}>
    {children}
  </button>
)

function ModalShell({ title, onClose, isMobile, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', zIndex: 100, backdropFilter: 'blur(2px)', ...(isMobile ? { alignItems: 'flex-end' } : { alignItems: 'center', justifyContent: 'center', padding: '24px' }) }} onClick={onClose}>
      <div style={{ background: C.surface, width: '100%', overflowY: 'auto', ...(isMobile ? { borderRadius: '24px 24px 0 0', maxHeight: '92vh', paddingBottom: 'env(safe-area-inset-bottom,16px)' } : { borderRadius: '20px', maxWidth: '500px', maxHeight: '88vh' }) }} onClick={e => e.stopPropagation()}>
        {isMobile && <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 2px' }}><div style={{ width: '36px', height: '4px', borderRadius: '99px', background: C.border }} /></div>}
        <div style={{ padding: isMobile ? '10px 20px 14px' : '24px 24px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: isMobile ? '18px' : '20px', fontWeight: 600, color: C.text, fontFamily: f.serif }}>{title}</h2>
          <IBtn onClick={onClose}><X size={14} color={C.textMid} /></IBtn>
        </div>
        <div style={{ height: '1px', background: C.border }} />
        <div style={{ padding: isMobile ? '16px 20px' : '20px 24px 24px' }}>{children}</div>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const to12 = t => { if (!t) return ''; const [h, m] = t.split(':'); const hr = +h; return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}` }
const to24 = t => { if (!t) return ''; if (/^\d{2}:\d{2}$/.test(t)) return t; const m = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i); if (!m) return t; let h = +m[1]; if (m[3].toUpperCase() === 'PM' && h !== 12) h += 12; if (m[3].toUpperCase() === 'AM' && h === 12) h = 0; return `${String(h).padStart(2,'0')}:${m[2]}` }
const confirmDelete = (msg, fn) => { if (window.confirm(msg)) fn() }

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ContentManager() {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const [tab,         setTab]         = useState('verse')
  const [toast,       setToast]       = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [isMobile,    setIsMobile]    = useState(false)

  // Data
  const [verseLib,    setVerseLib]    = useState([])
  const [activeVerse, setActiveVerse] = useState({ id: null, reference: 'Matthew 11:28', text: 'Come to me, all you who are weary and burdened, and I will give you rest.', theme: 'Rest and Peace' })
  const [events,      setEvents]      = useState([])
  const [roster,      setRoster]      = useState([])
  const [announces,   setAnnounces]   = useState([])

  // UI toggles
  const [verseSearch,    setVerseSearch]    = useState('')
  const [showAddVerse,   setShowAddVerse]   = useState(false)
  const [selectedVerse,  setSelectedVerse]  = useState(null)
  const [newVerse,       setNewVerse]       = useState({ reference: '', text: '', theme: '' })

  // Calendar
  const [calOpen,    setCalOpen]    = useState(false)
  const [calMonth,   setCalMonth]   = useState(new Date().getMonth())
  const [calYear,    setCalYear]    = useState(new Date().getFullYear())
  const [calWeek,    setCalWeek]    = useState(1)
  const [calPreview, setCalPreview] = useState(null)

  // Modals — event
  const [evtOpen,    setEvtOpen]    = useState(false)
  const [editEvt,    setEditEvt]    = useState(null)
  const [evtForm,    setEvtForm]    = useState({ date:'', titleEn:'', time:'', descriptionEn:'', location:'', pic:'' })

  // Modals — roster
  const [rstOpen,    setRstOpen]    = useState(false)
  const [editRst,    setEditRst]    = useState(null)
  const [rstForm,    setRstForm]    = useState({ weekStart:'', leader:'', pianist:'', reader:'' })

  // Modals — announcement
  const [annOpen,    setAnnOpen]    = useState(false)
  const [editAnn,    setEditAnn]    = useState(null)
  const [annForm,    setAnnForm]    = useState({ title_en:'', title_bm:'', description_en:'', description_bm:'', image_url:'', link_url:'', display_order:0, is_active:true })

  // ─── Init ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check(); window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const msg = (text, isError = false) => { setToast({ text, isError }); setTimeout(() => setToast(null), 2200) }

  const loadAll = useCallback(async () => {
    setLoading(true)
    const [vLib, vActive, evts, rst, ann] = await Promise.all([
      supabase.from('verse_library').select('*').order('created_at', { ascending: false }),
      supabase.from('verse_library').select('*').eq('is_active', true).maybeSingle(),
      supabase.from('events').select('*').gte('date', new Date().toISOString().split('T')[0]).order('date').order('time'),
      supabase.from('roster').select('*').order('week_start').limit(4),
      supabase.from('carousel_items').select('*').order('display_order').order('created_at'),
    ])
    if (!vLib.error)    setVerseLib(vLib.data || [])
    if (!vActive.error && vActive.data) setActiveVerse({ id: vActive.data.id, reference: vActive.data.reference, text: vActive.data.text, theme: vActive.data.theme || '' })
    if (!evts.error)    setEvents((evts.data || []).map(e => ({ id: e.id, date: e.date, titleEn: e.title_en, time: e.time, descriptionEn: e.description_en, location: e.location||'', pic: e.pic||'' })))
    if (!rst.error)     setRoster((rst.data || []).map(w => ({ id: w.id, weekStart: w.week_start, leader: w.leader||'', pianist: w.pianist||'', reader: w.reader||'' })))
    if (!ann.error)     setAnnounces(ann.data || [])
    setLoading(false)
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  // ─── Verse ──────────────────────────────────────────────────────────────────
  const saveVerse = async () => {
    if (!newVerse.reference || !newVerse.text) { msg('Fill in reference and text', true); return }
    const { data: ex } = await supabase.from('verse_library').select('id').eq('reference', newVerse.reference).maybeSingle()
    if (ex) { msg('Reference already exists', true); return }
    const { error } = await supabase.from('verse_library').insert({ ...newVerse, is_active: false })
    if (!error) { msg('Verse added'); setNewVerse({ reference:'', text:'', theme:'' }); setShowAddVerse(false); loadAll() }
    else msg('Error saving', true)
  }

  const activateVerse = async id => {
    await supabase.from('verse_library').update({ is_active: false }).eq('is_active', true)
    const { error } = await supabase.from('verse_library').update({ is_active: true }).eq('id', id)
    if (!error) { msg('Verse activated'); setSelectedVerse(null); loadAll() }
    else msg('Error activating', true)
  }

  const deleteVerse = (id, ref) => confirmDelete(`Delete "${ref}"?`, async () => {
    const { error } = await supabase.from('verse_library').delete().eq('id', id)
    if (!error) { msg('Verse deleted'); if (selectedVerse?.id === id) setSelectedVerse(null); loadAll() }
    else msg('Error deleting', true)
  })

  const exportCSV = () => {
    const rows = verseLib.map(v => [`"${v.reference}"`, `"${v.text.replace(/"/g,'""')}"`, `"${v.theme||''}"`])
    const csv = [['Reference','Text','Theme'].join(','), ...rows.map(r => r.join(','))].join('\n')
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob(['\uFEFF'+csv], { type:'text/csv' })), download: `verses_${Date.now()}.csv` })
    a.click(); msg('Exported')
  }

  const importCSV = e => {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = async ({ target }) => {
      const lines = target.result.split(/\r?\n/)
      const hdrs = lines[0].split(',').map(h => h.replace(/"/g,'').trim().toLowerCase())
      const ri = hdrs.indexOf('reference'), ti = hdrs.indexOf('text'), thi = hdrs.indexOf('theme')
      if (ri < 0 || ti < 0) { msg('CSV needs Reference + Text columns', true); return }
      let ok = 0, err = 0
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue
        const r = lines[i].split(',').map(c => c.replace(/^"|"$/g,'').trim())
        if (r[ri] && r[ti]) { const { error } = await supabase.from('verse_library').insert({ reference: r[ri], text: r[ti], theme: thi>=0 ? r[thi] : '', is_active: false }); error ? err++ : ok++ }
      }
      msg(`Imported ${ok}, ${err} errors`); loadAll()
    }
    reader.readAsText(file, 'UTF-8'); e.target.value = ''
  }

  const selVerse = selectedVerse ? verseLib.find(v => v.id === selectedVerse) : null

  // ─── Events ─────────────────────────────────────────────────────────────────
  const openEvt = (evt = null) => { setEditEvt(evt); setEvtForm(evt ? { ...evt, time: to24(evt.time) } : { date:'', titleEn:'', time:'', descriptionEn:'', location:'', pic:'' }); setEvtOpen(true) }
  const saveEvt = async e => {
    e.preventDefault()
    const p = { date: evtForm.date, title_en: evtForm.titleEn, time: evtForm.time, description_en: evtForm.descriptionEn, location: evtForm.location, pic: evtForm.pic }
    const { error } = editEvt ? await supabase.from('events').update(p).eq('id', editEvt.id) : await supabase.from('events').insert(p)
    if (!error) { msg(editEvt ? 'Event updated' : 'Event added'); setEvtOpen(false); loadAll() }
    else msg('Error saving event', true)
  }
  const delEvt = id => confirmDelete('Delete this event?', async () => { await supabase.from('events').delete().eq('id', id); msg('Deleted'); loadAll() })

  // ─── Roster ─────────────────────────────────────────────────────────────────
  const openRst = w => { setEditRst(w); setRstForm(w); setRstOpen(true) }
  const saveRst = async e => {
    e.preventDefault()
    const { error } = await supabase.from('roster').update({ week_start: rstForm.weekStart, leader: rstForm.leader, pianist: rstForm.pianist, reader: rstForm.reader }).eq('id', editRst.id)
    if (!error) { msg('Roster updated'); setRstOpen(false); loadAll() }
    else msg('Error saving roster', true)
  }

  // ─── Announcements ──────────────────────────────────────────────────────────
  const openAnn = (item = null) => { setEditAnn(item); setAnnForm(item || { title_en:'', title_bm:'', description_en:'', description_bm:'', image_url:'', link_url:'', display_order: announces.length, is_active: true }); setAnnOpen(true) }
  const saveAnn = async e => {
    e.preventDefault()
    const p = { ...annForm, image_url: annForm.image_url||null, link_url: annForm.link_url||null, updated_at: new Date() }
    const { error } = editAnn ? await supabase.from('carousel_items').update(p).eq('id', editAnn.id) : await supabase.from('carousel_items').insert(p)
    if (!error) { msg(editAnn ? 'Updated' : 'Added'); setAnnOpen(false); loadAll() }
    else msg('Error saving', true)
  }
  const delAnn = id => confirmDelete('Delete this announcement?', async () => { await supabase.from('carousel_items').delete().eq('id', id); msg('Deleted'); loadAll() })
  const toggleAnn = async (id, cur) => { await supabase.from('carousel_items').update({ is_active: !cur, updated_at: new Date() }).eq('id', id); msg(`${!cur ? 'Activated' : 'Deactivated'}`); loadAll() }
  const moveAnn = async (id, dir) => {
    const idx = announces.findIndex(a => a.id === id)
    if ((dir==='up' && idx===0) || (dir==='down' && idx===announces.length-1)) return
    const swap = dir==='up' ? idx-1 : idx+1
    const arr = [...announces]
    const tmp = arr[idx].display_order; arr[idx].display_order = arr[swap].display_order; arr[swap].display_order = tmp
    await Promise.all([supabase.from('carousel_items').update({ display_order: arr[idx].display_order }).eq('id', arr[idx].id), supabase.from('carousel_items').update({ display_order: arr[swap].display_order }).eq('id', arr[swap].id)])
    loadAll()
  }

  // ─── Calendar ───────────────────────────────────────────────────────────────
  const loadCalPreview = useCallback(() => {
    const first = new Date(calYear, calMonth, 1)
    const dow = first.getDay()
    const start = new Date(calYear, calMonth, 1 - (dow===0?6:dow-1) + (calWeek-1)*7)
    const end = new Date(start); end.setDate(start.getDate()+6)
    const fmt = d => d.toLocaleDateString('en-GB',{day:'numeric',month:'short'})
    const startStr = start.toLocaleDateString('en-GB')
    setCalPreview({
      range: `${fmt(start)} – ${fmt(end)}`,
      roster: roster.find(r => r.weekStart === startStr) || null,
      events: events.filter(e => { const d = new Date(e.date); return d>=start && d<=end }),
    })
  }, [calYear, calMonth, calWeek, roster, events])

  useEffect(() => { if (calOpen) loadCalPreview() }, [calOpen, calMonth, calYear, calWeek, loadCalPreview])

  // ─── Tabs config ────────────────────────────────────────────────────────────
  const TABS = [
    { id:'verse',         label:'Weekly Verse',  Icon: BookOpen   },
    { id:'events',        label:'Events',        Icon: CalendarDays },
    { id:'roster',        label:'Roster',        Icon: Music      },
    { id:'announcements', label:'Announcements', Icon: Megaphone  },
  ]

  if (loading) return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:'34px', height:'34px', borderRadius:'50%', border:`3px solid ${C.border}`, borderTopColor:C.accentDark, animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', background:C.bg }}>
      <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:'72px', left:'50%', transform:'translateX(-50%)', zIndex:200, animation:'slideDown 0.2s ease-out', whiteSpace:'nowrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'7px', padding:'9px 18px', borderRadius:'99px', background: toast.isError ? '#DC2626' : C.text, color:'#fff', fontSize:'13px', fontFamily:f.sans }}>
            {toast.isError ? <AlertCircle size={14}/> : <CheckCircle size={14}/>} {toast.text}
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, position:'sticky', top:0, zIndex:50 }}>
        <div style={{ maxWidth:'1400px', margin:'0 auto', padding:'0 20px', height:'60px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <IBtn onClick={() => navigate('/staff')}><ArrowLeft size={15} color={C.textMid}/></IBtn>
            <div>
              <h1 style={{ margin:0, fontSize:'17px', fontWeight:600, color:C.text, fontFamily:f.serif, lineHeight:1.2 }}>Content Manager</h1>
              {!isMobile && <p style={{ margin:0, fontSize:'11px', color:C.textMuted, fontFamily:f.sans }}>Website content administration</p>}
            </div>
          </div>
          <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
            {isMobile ? (
              <IBtn onClick={() => setCalOpen(true)}><CalendarDays size={15} color={C.textMid}/></IBtn>
            ) : (
              <PillBtn onClick={() => setCalOpen(true)} style={{ padding:'7px 14px', borderRadius:'99px', fontSize:'12px' }}>
                <CalendarDays size={13}/> Calendar
              </PillBtn>
            )}
            {isMobile ? (
              <IBtn onClick={signOut}><LogOut size={15} color={C.textMid}/></IBtn>
            ) : (
              <PillBtn onClick={signOut} style={{ padding:'7px 14px', borderRadius:'99px', fontSize:'12px' }}>
                <LogOut size={13}/> Sign out
              </PillBtn>
            )}
          </div>
        </div>
      </header>

      {/* Tab bar */}
      <div style={{ borderBottom:`1px solid ${C.border}`, background:C.bg }}>
        <div style={{ maxWidth:'1400px', margin:'0 auto', padding:'0 20px', display:'flex', overflowX:'auto' }}>
          {TABS.map(({ id, label, Icon }) => {
            const active = tab === id
            return (
              <button key={id} onClick={() => setTab(id)} style={{ display:'flex', alignItems:'center', gap:'7px', padding: isMobile ? '12px 14px' : '12px 18px', fontSize:'13px', fontWeight:600, fontFamily:f.sans, color: active ? C.text : C.textMuted, borderBottom: active ? `2px solid ${C.accentDark}` : '2px solid transparent', background:'transparent', cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
                <Icon size={15}/>
                {!isMobile && label}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ maxWidth:'1400px', margin:'0 auto', padding: isMobile ? '16px 14px 80px' : '28px' }}>

        {/* ══ VERSE TAB ══════════════════════════════════════════════════════ */}
        {tab === 'verse' && (
          <div style={{ display:'flex', flexDirection: isMobile ? 'column' : 'row', gap:'24px' }}>
            {/* Library panel */}
            <div style={{ flex:1, minWidth:0, background:C.surface, borderRadius:'18px', border:`1.5px solid ${C.border}`, padding:'20px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
                <h2 style={{ margin:0, fontSize:'17px', fontWeight:600, fontFamily:f.serif, color:C.text }}>Verse Library</h2>
                <div style={{ display:'flex', gap:'6px' }}>
                  <IBtn onClick={exportCSV}><Download size={14} color={C.textMid}/></IBtn>
                  <label style={{ width:'32px', height:'32px', borderRadius:'50%', border:`1.5px solid ${C.border}`, background:C.surfaceAlt, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Upload size={14} color={C.textMid}/>
                    <input type="file" accept=".csv" onChange={importCSV} style={{ display:'none' }}/>
                  </label>
                </div>
              </div>
              {/* Search */}
              <div style={{ position:'relative', marginBottom:'14px' }}>
                <Search size={13} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:C.textMuted, pointerEvents:'none' }}/>
                <input type="text" placeholder="Search reference or text…" value={verseSearch} onChange={e => setVerseSearch(e.target.value)} style={{ ...inp, paddingLeft:'34px' }}/>
              </div>
              {/* List */}
              <div style={{ maxHeight:'300px', overflowY:'auto', marginBottom:'14px' }}>
                {verseLib.filter(v => v.reference.toLowerCase().includes(verseSearch.toLowerCase()) || v.text.toLowerCase().includes(verseSearch.toLowerCase())).map(v => (
                  <div key={v.id} onClick={() => setSelectedVerse(v.id)} style={{ padding:'11px 12px', borderRadius:'10px', marginBottom:'7px', background: v.is_active ? C.accentBg : 'transparent', border:`1.5px solid ${selectedVerse===v.id ? C.accentDark : C.border}`, cursor:'pointer' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'8px' }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontWeight:600, fontFamily:f.serif, margin:0, fontSize:'14px' }}>{v.reference}</p>
                        <p style={{ fontSize:'12px', color:C.textMuted, marginTop:'3px', wordBreak:'break-word' }}>{v.text}</p>
                      </div>
                      <div style={{ display:'flex', gap:'5px', alignItems:'center', flexShrink:0 }}>
                        {v.is_active && <span style={{ background:C.accentDark, color:'#fff', fontSize:'10px', padding:'2px 8px', borderRadius:'12px' }}>Active</span>}
                        <IBtn onClick={e => { e.stopPropagation(); deleteVerse(v.id, v.reference) }} danger><Trash2 size={12} color="#DC2626"/></IBtn>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Add verse */}
              {!showAddVerse ? (
                <button onClick={() => setShowAddVerse(true)} style={{ width:'100%', padding:'10px', borderRadius:'12px', border:`1.5px dashed ${C.border}`, background:C.surface, cursor:'pointer', fontSize:'13px', fontWeight:600, color:C.textMid, fontFamily:f.sans, display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                  <Plus size={14}/> Add New Verse
                </button>
              ) : (
                <div style={{ padding:'14px', background:C.surfaceAlt, borderRadius:'12px', display:'flex', flexDirection:'column', gap:'10px' }}>
                  <input placeholder="Reference" value={newVerse.reference} onChange={e => setNewVerse(p=>({...p,reference:e.target.value}))} style={inp}/>
                  <textarea placeholder="Verse text" rows={3} value={newVerse.text} onChange={e => setNewVerse(p=>({...p,text:e.target.value}))} style={inp}/>
                  <input placeholder="Theme (optional)" value={newVerse.theme} onChange={e => setNewVerse(p=>({...p,theme:e.target.value}))} style={inp}/>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                    <PillBtn primary onClick={saveVerse}>Save</PillBtn>
                    <PillBtn onClick={() => setShowAddVerse(false)}>Cancel</PillBtn>
                  </div>
                </div>
              )}
            </div>

            {/* Preview panel */}
            <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:'16px' }}>
              {/* Active verse */}
              <div style={{ background:C.text, borderRadius:'18px', padding:'20px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
                  <CheckCircle size={15} color="#C4A88B"/>
                  <span style={{ fontSize:'10px', letterSpacing:'0.1em', textTransform:'uppercase', color:'#C4A88B', fontFamily:f.sans }}>Currently Active</span>
                </div>
                <p style={{ fontSize:'17px', fontFamily:f.serif, color:'#fff', lineHeight:1.5, fontStyle:'italic', margin:0 }}>"{activeVerse.text}"</p>
                <div style={{ marginTop:'14px', paddingTop:'12px', borderTop:'1px solid rgba(255,255,255,0.1)' }}>
                  <p style={{ fontSize:'14px', fontWeight:500, color:'#fff', margin:0 }}>{activeVerse.reference}</p>
                  <p style={{ fontSize:'11px', color:'#78716C', marginTop:'2px', fontFamily:f.sans }}>{activeVerse.theme || 'No theme'}</p>
                </div>
              </div>
              {/* Selected preview */}
              {selVerse && (
                <div style={{ background:C.surface, borderRadius:'18px', border:`2px solid ${C.accentDark}`, padding:'20px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
                    <AlertCircle size={15} color={C.accentDark}/>
                    <span style={{ fontSize:'10px', letterSpacing:'0.1em', textTransform:'uppercase', color:C.textMid, fontFamily:f.sans }}>Preview — will become active</span>
                  </div>
                  <p style={{ fontSize:'17px', fontFamily:f.serif, color:C.text, lineHeight:1.5, fontStyle:'italic', margin:0 }}>"{selVerse.text}"</p>
                  <div style={{ marginTop:'14px', paddingTop:'12px', borderTop:`1px solid ${C.border}` }}>
                    <p style={{ fontSize:'14px', fontWeight:500, color:C.text, margin:0 }}>{selVerse.reference}</p>
                    <p style={{ fontSize:'11px', color:C.textMuted, marginTop:'2px', fontFamily:f.sans }}>{selVerse.theme || 'No theme'}</p>
                  </div>
                  <PillBtn primary onClick={() => activateVerse(selVerse.id)} style={{ marginTop:'16px', width:'100%' }}>
                    <CheckCircle size={14}/> Activate This Verse
                  </PillBtn>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ EVENTS TAB ═════════════════════════════════════════════════════ */}
        {tab === 'events' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px', gap:'12px' }}>
              <div>
                <h2 style={{ margin:0, fontSize:'18px', fontWeight:600, fontFamily:f.serif, color:C.text }}>Upcoming Events</h2>
                <p style={{ margin:'3px 0 0', fontSize:'12px', color:C.textMuted, fontFamily:f.sans }}>Manage public-facing church events</p>
              </div>
              <PillBtn onClick={() => openEvt()} style={{ padding:'8px 16px', borderRadius:'99px', fontSize:'13px', flexShrink:0 }}>
                {isMobile ? <Plus size={16}/> : <><Plus size={14}/> Add Event</>}
              </PillBtn>
            </div>
            {events.length === 0 ? (
              <div style={{ background:C.surface, borderRadius:'18px', border:`1.5px solid ${C.border}`, padding:'48px 24px', textAlign:'center', color:C.textMuted, fontFamily:f.sans }}>
                No upcoming events. Click + to create one.
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {events.map(evt => (
                  <div key={evt.id} style={{ background:C.surface, borderRadius:'16px', border:`1.5px solid ${C.border}`, padding:'14px 16px' }}>
                    <div style={{ display:'flex', gap:'14px', alignItems:'flex-start' }}>
                      {/* Date badge */}
                      <div style={{ width:'50px', height:'50px', borderRadius:'12px', background:C.surfaceAlt, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <span style={{ fontSize:'10px', fontWeight:600, color:C.textMuted, fontFamily:f.sans }}>{new Date(evt.date).toLocaleString('default',{month:'short'})}</span>
                        <span style={{ fontSize:'20px', fontWeight:700, fontFamily:f.serif, lineHeight:1 }}>{new Date(evt.date).getDate()}</span>
                      </div>
                      {/* Info */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <h3 style={{ margin:0, fontSize:'15px', fontWeight:600, fontFamily:f.serif, color:C.text }}>{evt.titleEn}</h3>
                        <p style={{ margin:'3px 0 0', fontSize:'12px', color:C.textMuted, fontFamily:f.sans }}>{to12(evt.time)}</p>
                        {evt.descriptionEn && <p style={{ margin:'6px 0 0', fontSize:'13px', color:C.textMid, fontFamily:f.sans }}>{evt.descriptionEn}</p>}
                        {(evt.location||evt.pic) && (
                          <div style={{ display:'flex', gap:'14px', marginTop:'7px', fontSize:'11px', color:C.textMuted, fontFamily:f.sans, flexWrap:'wrap' }}>
                            {evt.location && <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><MapPin size={11}/>{evt.location}</span>}
                            {evt.pic && <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><User size={11}/>{evt.pic}</span>}
                          </div>
                        )}
                      </div>
                      {/* Actions */}
                      <div style={{ display:'flex', gap:'6px', flexShrink:0 }}>
                        <IBtn onClick={() => openEvt(evt)}><Pencil size={13} color={C.textMid}/></IBtn>
                        <IBtn onClick={() => delEvt(evt.id)} danger><Trash2 size={13} color="#DC2626"/></IBtn>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ ROSTER TAB ═════════════════════════════════════════════════════ */}
        {tab === 'roster' && (
          <div>
            <div style={{ marginBottom:'18px' }}>
              <h2 style={{ margin:0, fontSize:'18px', fontWeight:600, fontFamily:f.serif, color:C.text }}>Worship Roster</h2>
              <p style={{ margin:'3px 0 0', fontSize:'12px', color:C.textMuted, fontFamily:f.sans }}>Weekly ministry scheduling</p>
            </div>
            <div style={{ display:'grid', gap:'14px', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)' }}>
              {roster.map(week => (
                <div key={week.id} style={{ background:C.surface, borderRadius:'18px', border:`1.5px solid ${C.border}`, padding:'16px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
                    <div>
                      <p style={{ fontSize:'10px', letterSpacing:'0.1em', textTransform:'uppercase', color:C.textMuted, margin:0, fontFamily:f.sans }}>Week of</p>
                      <h3 style={{ margin:'3px 0 0', fontSize:'15px', fontWeight:600, fontFamily:f.serif, color:C.text }}>{week.weekStart}</h3>
                    </div>
                    <IBtn onClick={() => openRst(week)}><Pencil size={13} color={C.textMid}/></IBtn>
                  </div>
                  <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:'12px', display:'flex', flexDirection:'column', gap:'9px' }}>
                    {[['Leader', week.leader], ['Pianist', week.pianist], ['Reader', week.reader]].map(([role, name]) => (
                      <div key={role} style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', fontFamily:f.sans }}>
                        <span style={{ color:C.textMuted }}>{role}</span>
                        <span style={{ fontWeight:500, color:C.text }}>{name || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ ANNOUNCEMENTS TAB ══════════════════════════════════════════════ */}
        {tab === 'announcements' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px', gap:'12px' }}>
              <div>
                <h2 style={{ margin:0, fontSize:'18px', fontWeight:600, fontFamily:f.serif, color:C.text }}>Carousel Announcements</h2>
                <p style={{ margin:'3px 0 0', fontSize:'12px', color:C.textMuted, fontFamily:f.sans }}>Slides shown on the homepage carousel</p>
              </div>
              <PillBtn onClick={() => openAnn()} style={{ padding:'8px 16px', borderRadius:'99px', fontSize:'13px', flexShrink:0 }}>
                {isMobile ? <Plus size={16}/> : <><Plus size={14}/> Add Announcement</>}
              </PillBtn>
            </div>
            {announces.length === 0 ? (
              <div style={{ background:C.surface, borderRadius:'18px', border:`1.5px solid ${C.border}`, padding:'48px 24px', textAlign:'center', color:C.textMuted, fontFamily:f.sans }}>No announcements yet. Click + to create one.</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {announces.map((item, idx) => (
                  <div key={item.id} style={{ background: item.is_active ? C.surface : '#F9F7F4', borderRadius:'16px', border:`1.5px solid ${C.border}`, padding:'14px 16px', opacity: item.is_active ? 1 : 0.7 }}>
                    <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
                      {/* Order controls */}
                      <div style={{ display:'flex', flexDirection:'column', gap:'3px', flexShrink:0 }}>
                        <IBtn onClick={() => moveAnn(item.id,'up')} style={{ width:'26px', height:'26px', opacity: idx===0?0.35:1 }}><MoveUp size={11} color={C.textMid}/></IBtn>
                        <IBtn onClick={() => moveAnn(item.id,'down')} style={{ width:'26px', height:'26px', opacity: idx===announces.length-1?0.35:1 }}><MoveDown size={11} color={C.textMid}/></IBtn>
                      </div>
                      {/* Thumbnail */}
                      <div style={{ width:'52px', height:'52px', borderRadius:'10px', background:C.surfaceAlt, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>
                        {item.image_url ? <img src={item.image_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <Image size={20} color={C.textMuted}/>}
                      </div>
                      {/* Text */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontWeight:600, fontFamily:f.serif, margin:0, fontSize:'14px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.title_en}</p>
                        <p style={{ fontSize:'12px', color:C.textMuted, marginTop:'2px', fontFamily:f.sans }}>{item.title_bm}</p>
                        {item.link_url && <p style={{ fontSize:'11px', color:C.accentDark, marginTop:'4px', display:'flex', alignItems:'center', gap:'3px', fontFamily:f.sans }}><Link size={11}/>{item.link_url.substring(0,40)}…</p>}
                      </div>
                      {/* Actions */}
                      <div style={{ display:'flex', gap:'6px', flexShrink:0, alignItems:'center' }}>
                        <IBtn onClick={() => toggleAnn(item.id, item.is_active)} style={{ background: item.is_active ? '#E6F4E6' : C.surfaceAlt }}>
                          {item.is_active ? <Eye size={13} color="#2E7D32"/> : <EyeOff size={13} color={C.textMuted}/>}
                        </IBtn>
                        <IBtn onClick={() => openAnn(item)}><Pencil size={13} color={C.textMid}/></IBtn>
                        <IBtn onClick={() => delAnn(item.id)} danger><Trash2 size={13} color="#DC2626"/></IBtn>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══ CALENDAR MODAL ═════════════════════════════════════════════════════ */}
      {calOpen && (
        <ModalShell title="Content Calendar" onClose={() => setCalOpen(false)} isMobile={isMobile}>
          <div style={{ background:C.surfaceAlt, borderRadius:'14px', padding:'16px', marginBottom:'18px' }}>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'10px', alignItems:'center', marginBottom:'12px' }}>
              <select value={calMonth} onChange={e => setCalMonth(+e.target.value)} style={{ ...inp, width:'auto', padding:'7px 10px', flex:1 }}>
                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m,i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <select value={calYear} onChange={e => setCalYear(+e.target.value)} style={{ ...inp, width:'auto', padding:'7px 10px', flex:1 }}>
                {[2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <div style={{ display:'flex', gap:'5px' }}>
                {[1,2,3,4].map(w => (
                  <button key={w} onClick={() => setCalWeek(w)} style={{ width:'36px', height:'36px', borderRadius:'50%', background: calWeek===w ? C.text : C.surface, color: calWeek===w ? '#fff' : C.textMid, border:`1.5px solid ${calWeek===w ? C.text : C.border}`, cursor:'pointer', fontSize:'13px', fontWeight:600 }}>{w}</button>
                ))}
              </div>
            </div>
            <PillBtn primary onClick={loadCalPreview} style={{ width:'100%', padding:'10px', borderRadius:'10px' }}>
              Load Week {calWeek}
            </PillBtn>
          </div>
          {calPreview && (
            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <p style={{ textAlign:'center', fontWeight:600, fontFamily:f.serif, margin:0, color:C.text }}>{calPreview.range}</p>
              <div style={{ background:C.surfaceAlt, borderRadius:'14px', padding:'14px' }}>
                <p style={{ fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.09em', color:C.textMuted, margin:'0 0 6px', fontFamily:f.sans }}>Weekly Verse</p>
                <p style={{ fontFamily:f.serif, margin:0, fontWeight:600 }}>{activeVerse.reference}</p>
                <p style={{ fontSize:'12px', color:C.textMuted, marginTop:'4px', fontFamily:f.sans }}>{activeVerse.text.substring(0,120)}…</p>
              </div>
              <div style={{ background:C.surfaceAlt, borderRadius:'14px', padding:'14px' }}>
                <p style={{ fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.09em', color:C.textMuted, margin:'0 0 8px', fontFamily:f.sans }}>Worship Roster</p>
                {calPreview.roster ? (
                  [['Leader', calPreview.roster.leader], ['Pianist', calPreview.roster.pianist], ['Reader', calPreview.roster.reader]].map(([role, name]) => (
                    <div key={role} style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', marginBottom:'5px', fontFamily:f.sans }}>
                      <span style={{ color:C.textMuted }}>{role}</span><span style={{ fontWeight:500 }}>{name||'—'}</span>
                    </div>
                  ))
                ) : <p style={{ color:C.textMuted, fontSize:'13px', margin:0, fontFamily:f.sans }}>No roster assigned</p>}
              </div>
              <div style={{ background:C.surfaceAlt, borderRadius:'14px', padding:'14px' }}>
                <p style={{ fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.09em', color:C.textMuted, margin:'0 0 8px', fontFamily:f.sans }}>Events</p>
                {calPreview.events.length ? calPreview.events.map(e => (
                  <div key={e.id} style={{ fontSize:'13px', marginBottom:'6px', fontFamily:f.sans }}><strong>{e.date}</strong> – {e.titleEn}</div>
                )) : <p style={{ color:C.textMuted, fontSize:'13px', margin:0, fontFamily:f.sans }}>No events this week</p>}
              </div>
            </div>
          )}
        </ModalShell>
      )}

      {/* ══ EVENT MODAL ════════════════════════════════════════════════════════ */}
      {evtOpen && (
        <ModalShell title={editEvt ? 'Edit Event' : 'Add Event'} onClose={() => setEvtOpen(false)} isMobile={isMobile}>
          <form onSubmit={saveEvt} style={{ display:'flex', flexDirection:'column', gap:'13px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
              <Field label="Date *"><input type="date" value={evtForm.date} onChange={e => setEvtForm(p=>({...p,date:e.target.value}))} required style={inp}/></Field>
              <Field label="Time"><input type="time" value={evtForm.time} onChange={e => setEvtForm(p=>({...p,time:e.target.value}))} style={inp}/></Field>
            </div>
            <Field label="Title *"><input type="text" value={evtForm.titleEn} onChange={e => setEvtForm(p=>({...p,titleEn:e.target.value}))} required style={inp}/></Field>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
              <Field label="Location"><input type="text" value={evtForm.location} onChange={e => setEvtForm(p=>({...p,location:e.target.value}))} style={inp}/></Field>
              <Field label="PIC"><input type="text" value={evtForm.pic} onChange={e => setEvtForm(p=>({...p,pic:e.target.value}))} style={inp}/></Field>
            </div>
            <Field label="Description"><textarea rows={3} value={evtForm.descriptionEn} onChange={e => setEvtForm(p=>({...p,descriptionEn:e.target.value}))} style={inp}/></Field>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginTop:'4px' }}>
              <PillBtn onClick={() => setEvtOpen(false)}>Cancel</PillBtn>
              <PillBtn type="submit" primary>{editEvt ? 'Update' : 'Save'}</PillBtn>
            </div>
          </form>
        </ModalShell>
      )}

      {/* ══ ROSTER MODAL ═══════════════════════════════════════════════════════ */}
      {rstOpen && (
        <ModalShell title="Edit Worship Week" onClose={() => setRstOpen(false)} isMobile={isMobile}>
          <form onSubmit={saveRst} style={{ display:'flex', flexDirection:'column', gap:'13px' }}>
            <Field label="Week Starting (DD/MM/YYYY)"><input type="text" value={rstForm.weekStart} onChange={e => setRstForm(p=>({...p,weekStart:e.target.value}))} style={inp}/></Field>
            <Field label="Worship Leader"><input type="text" value={rstForm.leader} onChange={e => setRstForm(p=>({...p,leader:e.target.value}))} style={inp}/></Field>
            <Field label="Pianist"><input type="text" value={rstForm.pianist} onChange={e => setRstForm(p=>({...p,pianist:e.target.value}))} style={inp}/></Field>
            <Field label="Scripture Reader"><input type="text" value={rstForm.reader} onChange={e => setRstForm(p=>({...p,reader:e.target.value}))} style={inp}/></Field>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginTop:'4px' }}>
              <PillBtn onClick={() => setRstOpen(false)}>Cancel</PillBtn>
              <PillBtn type="submit" primary>Save Changes</PillBtn>
            </div>
          </form>
        </ModalShell>
      )}

      {/* ══ ANNOUNCEMENT MODAL ═════════════════════════════════════════════════ */}
      {annOpen && (
        <ModalShell title={editAnn ? 'Edit Announcement' : 'Add Announcement'} onClose={() => setAnnOpen(false)} isMobile={isMobile}>
          <form onSubmit={saveAnn} style={{ display:'flex', flexDirection:'column', gap:'13px' }}>
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:'12px' }}>
              <Field label="Title (English) *"><input type="text" required value={annForm.title_en} onChange={e => setAnnForm(p=>({...p,title_en:e.target.value}))} style={inp}/></Field>
              <Field label="Title (Bahasa Malaysia) *"><input type="text" required value={annForm.title_bm} onChange={e => setAnnForm(p=>({...p,title_bm:e.target.value}))} style={inp}/></Field>
            </div>
            <Field label="Description (English)"><textarea rows={2} value={annForm.description_en} onChange={e => setAnnForm(p=>({...p,description_en:e.target.value}))} style={inp}/></Field>
            <Field label="Description (Bahasa Malaysia)"><textarea rows={2} value={annForm.description_bm} onChange={e => setAnnForm(p=>({...p,description_bm:e.target.value}))} style={inp}/></Field>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
              <Field label="Image URL"><input type="url" value={annForm.image_url||''} onChange={e => setAnnForm(p=>({...p,image_url:e.target.value}))} style={inp} placeholder="https://…"/></Field>
              <Field label="Link URL"><input type="url" value={annForm.link_url||''} onChange={e => setAnnForm(p=>({...p,link_url:e.target.value}))} style={inp} placeholder="https://…"/></Field>
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <Field label="Display Order"><input type="number" value={annForm.display_order} onChange={e => setAnnForm(p=>({...p,display_order:+e.target.value||0}))} style={{ ...inp, width:'80px' }}/></Field>
              <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontFamily:f.sans, fontSize:'13px', color:C.textMid, marginTop:'16px' }}>
                <input type="checkbox" checked={annForm.is_active} onChange={e => setAnnForm(p=>({...p,is_active:e.target.checked}))} style={{ width:'15px', height:'15px', accentColor:C.accentDark }}/>
                Show on homepage
              </label>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginTop:'4px' }}>
              <PillBtn onClick={() => setAnnOpen(false)}>Cancel</PillBtn>
              <PillBtn type="submit" primary>Save</PillBtn>
            </div>
          </form>
        </ModalShell>
      )}

      <style>{`
        @keyframes spin      { to { transform: rotate(360deg); } }
        @keyframes slideDown { from { opacity:0; transform:translate(-50%,-10px); } to { opacity:1; transform:translate(-50%,0); } }
        input:focus, textarea:focus, select:focus { border-color: ${C.accentDark} !important; box-shadow: 0 0 0 3px ${C.accentBg} !important; outline: none; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}