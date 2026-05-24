// src/features/content/ContentManager.jsx
import React, { useState, useEffect, useCallback } from 'react'
import { BookOpen, CalendarDays, Music, Megaphone } from 'lucide-react'
import StaffLayout from '../../components/layout/StaffLayout'
import { fetchVerseLibrary, fetchActiveVerse, fetchVerseByReference, createVerse, deactivateAllVerses, activateVerse as activateVerseService, deleteVerse as removeVerseFromDB, fetchCarouselItems, createCarouselItem, updateCarouselItem, deleteCarouselItem, toggleCarouselItem, updateCarouselOrder, fetchRoster, updateRoster } from '../../services/content'
import { fetchUpcomingEvents, createEvent, updateEvent, deleteEvent } from '../../services/events'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Modal from '../../components/ui/Modal'
import Field from '../../components/ui/Field'
import IconButton from '../../components/ui/IconButton'
import PillButton from '../../components/ui/PillButton'
import Toast from '../../components/ui/Toast'
import useIsMobile from '../../hooks/useIsMobile'
import { useToast } from '../../hooks/useToast'
import VerseTab from './VerseTab'
import EventsTab from './EventsTab'
import RosterTab from './RosterTab'
import AnnouncementsTab from './AnnouncementsTab'

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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const to24 = t => { if (!t) return ''; if (/^\d{2}:\d{2}$/.test(t)) return t; const m = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i); if (!m) return t; let h = +m[1]; if (m[3].toUpperCase() === 'PM' && h !== 12) h += 12; if (m[3].toUpperCase() === 'AM' && h === 12) h = 0; return `${String(h).padStart(2,'0')}:${m[2]}` }
const confirmDelete = (msg, fn) => { if (window.confirm(msg)) fn() }

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ContentManager() {
  const [tab,         setTab]         = useState('verse')
  const [loading,     setLoading]     = useState(true)
  const isMobile = useIsMobile()
  const { toast, showToast } = useToast()
  const msg = (text, isError = false) => showToast(text, isError, 2200)

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

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [vLib, vActive, evts, rst, ann] = await Promise.all([
        fetchVerseLibrary(),
        fetchActiveVerse(),
        fetchUpcomingEvents(),
        fetchRoster(4),
        fetchCarouselItems(),
      ])
      setVerseLib(vLib || [])
      if (vActive) setActiveVerse({ id: vActive.id, reference: vActive.reference, text: vActive.text, theme: vActive.theme || '' })
      setEvents((evts || []).map(e => ({ id: e.id, date: e.date, titleEn: e.title_en, time: e.time, descriptionEn: e.description_en, location: e.location||'', pic: e.pic||'' })))
      setRoster((rst || []).map(w => ({ id: w.id, weekStart: w.week_start, leader: w.leader||'', pianist: w.pianist||'', reader: w.reader||'' })))
      setAnnounces(ann || [])
    } catch (err) { console.error(err) }
    setLoading(false)
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  // ─── Verse ──────────────────────────────────────────────────────────────────
  const saveVerse = async () => {
    if (!newVerse.reference || !newVerse.text) { msg('Fill in reference and text', true); return }
    try {
      const ex = await fetchVerseByReference(newVerse.reference)
      if (ex) { msg('Reference already exists', true); return }
      await createVerse(newVerse)
      msg('Verse added'); setNewVerse({ reference:'', text:'', theme:'' }); setShowAddVerse(false); loadAll()
    } catch { msg('Error saving', true) }
  }

  const activateVerse = async id => {
    try {
      await deactivateAllVerses()
      await activateVerseService(id)
      msg('Verse activated'); setSelectedVerse(null); loadAll()
    } catch { msg('Error activating', true) }
  }

  const deleteVerse = (id, ref) => confirmDelete(`Delete "${ref}"?`, async () => {
    try { await removeVerseFromDB(id); msg('Verse deleted'); if (selectedVerse?.id === id) setSelectedVerse(null); loadAll() }
    catch { msg('Error deleting', true) }
  })

  const exportCSV = () => {
    const rows = verseLib.map(v => [`"${v.reference}"`, `"${v.text.replace(/"/g,'""')}"`, `"${v.theme||''}"`])
    const csv = [['Reference','Text','Theme'].join(','), ...rows.map(r => r.join(','))].join('\n')
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob(['﻿'+csv], { type:'text/csv' })), download: `verses_${Date.now()}.csv` })
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
        if (r[ri] && r[ti]) { try { await createVerse({ reference: r[ri], text: r[ti], theme: thi>=0 ? r[thi] : '' }); ok++ } catch { err++ } }
      }
      msg(`Imported ${ok}, ${err} errors`); loadAll()
    }
    reader.readAsText(file, 'UTF-8'); e.target.value = ''
  }

  // ─── Events ─────────────────────────────────────────────────────────────────
  const openEvt = (evt = null) => { setEditEvt(evt); setEvtForm(evt ? { ...evt, time: to24(evt.time) } : { date:'', titleEn:'', time:'', descriptionEn:'', location:'', pic:'' }); setEvtOpen(true) }
  const saveEvt = async e => {
    e.preventDefault()
    const p = { date: evtForm.date, title_en: evtForm.titleEn, time: evtForm.time, description_en: evtForm.descriptionEn, location: evtForm.location, pic: evtForm.pic }
    try {
      if (editEvt) await updateEvent(editEvt.id, p); else await createEvent(p)
      msg(editEvt ? 'Event updated' : 'Event added'); setEvtOpen(false); loadAll()
    } catch { msg('Error saving event', true) }
  }
  const delEvt = id => confirmDelete('Delete this event?', async () => { try { await deleteEvent(id); msg('Deleted'); loadAll() } catch { msg('Error deleting', true) } })

  // ─── Roster ─────────────────────────────────────────────────────────────────
  const openRst = w => { setEditRst(w); setRstForm(w); setRstOpen(true) }
  const saveRst = async e => {
    e.preventDefault()
    try { await updateRoster(editRst.id, { week_start: rstForm.weekStart, leader: rstForm.leader, pianist: rstForm.pianist, reader: rstForm.reader }); msg('Roster updated'); setRstOpen(false); loadAll() }
    catch { msg('Error saving roster', true) }
  }

  // ─── Announcements ──────────────────────────────────────────────────────────
  const openAnn = (item = null) => { setEditAnn(item); setAnnForm(item || { title_en:'', title_bm:'', description_en:'', description_bm:'', image_url:'', link_url:'', display_order: announces.length, is_active: true }); setAnnOpen(true) }
  const saveAnn = async e => {
    e.preventDefault()
    const p = { ...annForm, image_url: annForm.image_url||null, link_url: annForm.link_url||null, updated_at: new Date() }
    try {
      if (editAnn) await updateCarouselItem(editAnn.id, p); else await createCarouselItem(p)
      msg(editAnn ? 'Updated' : 'Added'); setAnnOpen(false); loadAll()
    } catch { msg('Error saving', true) }
  }
  const delAnn = id => confirmDelete('Delete this announcement?', async () => { try { await deleteCarouselItem(id); msg('Deleted'); loadAll() } catch { msg('Error deleting', true) } })
  const toggleAnn = async (id, cur) => { try { await toggleCarouselItem(id, cur); msg(`${!cur ? 'Activated' : 'Deactivated'}`); loadAll() } catch { msg('Error toggling', true) } }
  const moveAnn = async (id, dir) => {
    const idx = announces.findIndex(a => a.id === id)
    if ((dir==='up' && idx===0) || (dir==='down' && idx===announces.length-1)) return
    const swap = dir==='up' ? idx-1 : idx+1
    const arr = [...announces]
    const tmp = arr[idx].display_order; arr[idx].display_order = arr[swap].display_order; arr[swap].display_order = tmp
    await Promise.all([updateCarouselOrder(arr[idx].id, arr[idx].display_order), updateCarouselOrder(arr[swap].id, arr[swap].display_order)])
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

  if (loading) return <LoadingSpinner />

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <StaffLayout title="Content Manager" subtitle="Website content administration" rightActions={
      <>
        {isMobile ? (
          <IconButton onClick={() => setCalOpen(true)}><CalendarDays size={15} color={C.textMid}/></IconButton>
        ) : (
          <PillButton onClick={() => setCalOpen(true)} style={{ padding:'7px 14px', borderRadius:'99px', fontSize:'12px' }}>
            <CalendarDays size={13}/> Calendar
          </PillButton>
        )}
      </>
    }>
      {toast && <Toast message={toast.text} isError={toast.isError} />}

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
          <VerseTab
            verseLib={verseLib}
            verseSearch={verseSearch}
            onVerseSearchChange={setVerseSearch}
            selectedVerse={selectedVerse}
            onVerseSelect={setSelectedVerse}
            activeVerse={activeVerse}
            showAddVerse={showAddVerse}
            onToggleAddVerse={() => setShowAddVerse(p => !p)}
            newVerse={newVerse}
            onNewVerseChange={setNewVerse}
            onSaveVerse={saveVerse}
            onActivateVerse={activateVerse}
            onDeleteVerse={deleteVerse}
            onExportCSV={exportCSV}
            onImportCSV={importCSV}
            isMobile={isMobile}
          />
        )}

        {/* ══ EVENTS TAB ═════════════════════════════════════════════════════ */}
        {tab === 'events' && (
          <EventsTab
            events={events}
            onAdd={() => openEvt()}
            onEdit={openEvt}
            onDelete={delEvt}
            isMobile={isMobile}
          />
        )}

        {/* ══ ROSTER TAB ═════════════════════════════════════════════════════ */}
        {tab === 'roster' && (
          <RosterTab
            roster={roster}
            onEdit={openRst}
            isMobile={isMobile}
          />
        )}

        {/* ══ ANNOUNCEMENTS TAB ══════════════════════════════════════════════ */}
        {tab === 'announcements' && (
          <AnnouncementsTab
            announces={announces}
            onAdd={() => openAnn()}
            onEdit={openAnn}
            onDelete={delAnn}
            onToggle={toggleAnn}
            onMove={moveAnn}
            isMobile={isMobile}
          />
        )}
      </div>

      {/* ══ CALENDAR MODAL ═════════════════════════════════════════════════════ */}
        <Modal isOpen={calOpen} onClose={() => setCalOpen(false)} title="Content Calendar" isMobile={isMobile}>
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
            <PillButton primary onClick={loadCalPreview} style={{ width:'100%', padding:'10px', borderRadius:'10px' }}>
              Load Week {calWeek}
            </PillButton>
          </div>
          {calPreview && (
            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <p style={{ textAlign:'center', fontWeight:600, fontFamily:f.serif, margin:0, color:C.text }}>{calPreview.range}</p>
              <div style={{ background:C.surfaceAlt, borderRadius:'14px', padding:'14px' }}>
                <p style={{ fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.09em', color:C.textMuted, margin:'0 0 6px', fontFamily:f.sans }}>Weekly Verse</p>
                <p style={{ fontFamily:f.serif, margin:0, fontWeight:600 }}>{activeVerse.reference}</p>
                <p style={{ fontSize:'12px', color:C.textMuted, marginTop:'4px', fontFamily:f.sans }}>{activeVerse.text.substring(0,120)}...</p>
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
        </Modal>

      {/* ══ EVENT MODAL ════════════════════════════════════════════════════════ */}
        <Modal isOpen={evtOpen} onClose={() => setEvtOpen(false)} title={editEvt ? 'Edit Event' : 'Add Event'} isMobile={isMobile}>
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
              <PillButton onClick={() => setEvtOpen(false)}>Cancel</PillButton>
              <PillButton type="submit" primary>{editEvt ? 'Update' : 'Save'}</PillButton>
            </div>
          </form>
        </Modal>

      {/* ══ ROSTER MODAL ═══════════════════════════════════════════════════════ */}
        <Modal isOpen={rstOpen} onClose={() => setRstOpen(false)} title="Edit Worship Week" isMobile={isMobile}>
          <form onSubmit={saveRst} style={{ display:'flex', flexDirection:'column', gap:'13px' }}>
            <Field label="Week Starting (DD/MM/YYYY)"><input type="text" value={rstForm.weekStart} onChange={e => setRstForm(p=>({...p,weekStart:e.target.value}))} style={inp}/></Field>
            <Field label="Worship Leader"><input type="text" value={rstForm.leader} onChange={e => setRstForm(p=>({...p,leader:e.target.value}))} style={inp}/></Field>
            <Field label="Pianist"><input type="text" value={rstForm.pianist} onChange={e => setRstForm(p=>({...p,pianist:e.target.value}))} style={inp}/></Field>
            <Field label="Scripture Reader"><input type="text" value={rstForm.reader} onChange={e => setRstForm(p=>({...p,reader:e.target.value}))} style={inp}/></Field>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginTop:'4px' }}>
              <PillButton onClick={() => setRstOpen(false)}>Cancel</PillButton>
              <PillButton type="submit" primary>Save Changes</PillButton>
            </div>
          </form>
        </Modal>

      {/* ══ ANNOUNCEMENT MODAL ═════════════════════════════════════════════════ */}
        <Modal isOpen={annOpen} onClose={() => setAnnOpen(false)} title={editAnn ? 'Edit Announcement' : 'Add Announcement'} isMobile={isMobile}>
          <form onSubmit={saveAnn} style={{ display:'flex', flexDirection:'column', gap:'13px' }}>
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:'12px' }}>
              <Field label="Title (English) *"><input type="text" required value={annForm.title_en} onChange={e => setAnnForm(p=>({...p,title_en:e.target.value}))} style={inp}/></Field>
              <Field label="Title (Bahasa Malaysia) *"><input type="text" required value={annForm.title_bm} onChange={e => setAnnForm(p=>({...p,title_bm:e.target.value}))} style={inp}/></Field>
            </div>
            <Field label="Description (English)"><textarea rows={2} value={annForm.description_en} onChange={e => setAnnForm(p=>({...p,description_en:e.target.value}))} style={inp}/></Field>
            <Field label="Description (Bahasa Malaysia)"><textarea rows={2} value={annForm.description_bm} onChange={e => setAnnForm(p=>({...p,description_bm:e.target.value}))} style={inp}/></Field>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
              <Field label="Image URL"><input type="url" value={annForm.image_url||''} onChange={e => setAnnForm(p=>({...p,image_url:e.target.value}))} style={inp} placeholder="https://..."/></Field>
              <Field label="Link URL"><input type="url" value={annForm.link_url||''} onChange={e => setAnnForm(p=>({...p,link_url:e.target.value}))} style={inp} placeholder="https://..."/></Field>
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <Field label="Display Order"><input type="number" value={annForm.display_order} onChange={e => setAnnForm(p=>({...p,display_order:+e.target.value||0}))} style={{ ...inp, width:'80px' }}/></Field>
              <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontFamily:f.sans, fontSize:'13px', color:C.textMid, marginTop:'16px' }}>
                <input type="checkbox" checked={annForm.is_active} onChange={e => setAnnForm(p=>({...p,is_active:e.target.checked}))} style={{ width:'15px', height:'15px', accentColor:C.accentDark }}/>
                Show on homepage
              </label>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginTop:'4px' }}>
              <PillButton onClick={() => setAnnOpen(false)}>Cancel</PillButton>
              <PillButton type="submit" primary>Save</PillButton>
            </div>
          </form>
        </Modal>

    </StaffLayout>
  )
}
