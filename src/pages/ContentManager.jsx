// src/pages/ContentManager.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, LogOut, BookOpen, CalendarDays, Music,
  Save, Plus, Pencil, Trash2, ChevronRight, Search, X,
  CheckCircle, AlertCircle, Download, Upload, MapPin, User, Trash,
  Megaphone, Image, Eye, EyeOff, Link, MoveUp, MoveDown
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

// ─── Design tokens (same as FinanceManager) ──────────────────────────────────
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
  paidBg:      '#F0FAF0',
  paidText:    '#2E7D32',
  paidBorder:  '#C8E6C9',
  pendBg:      '#FFF8F0',
  pendText:    '#B45309',
  pendBorder:  '#FDDCAA',
}

const font = { serif: "'Lora', serif", sans: "'DM Sans', sans-serif" }

// ─── Shared style atoms ──────────────────────────────────────────────────────
const inputStyle = {
  width: '100%', padding: '10px 12px',
  border: `1.5px solid ${C.border}`, borderRadius: '10px',
  fontSize: '14px', background: C.surface, color: C.text,
  outline: 'none', boxSizing: 'border-box', fontFamily: font.sans,
}

const thStyle = {
  padding: '11px 16px', textAlign: 'left',
  fontSize: '10px', fontWeight: 700, letterSpacing: '0.09em',
  textTransform: 'uppercase', color: C.textMuted, fontFamily: font.sans,
  whiteSpace: 'nowrap',
}

const tdStyle = {
  padding: '13px 16px', fontSize: '13px',
  color: C.textMid, fontFamily: font.sans, verticalAlign: 'middle',
}

// ─── FieldLabel ──────────────────────────────────────────────────────────────
const FieldLabel = ({ children }) => (
  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: C.textMuted, marginBottom: '6px', fontFamily: font.sans }}>
    {children}
  </label>
)

// ─── ModalShell (same as FinanceManager) ─────────────────────────────────────
function ModalShell({ title, onClose, isMobile, children }) {
  const overlayStyle = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', zIndex: 100, backdropFilter: 'blur(2px)',
    ...(isMobile
      ? { alignItems: 'flex-end', justifyContent: 'center' }
      : { alignItems: 'center', justifyContent: 'center', padding: '24px' }),
  }
  const panelStyle = {
    background: C.surface, width: '100%', overflowY: 'auto',
    ...(isMobile
      ? { borderRadius: '24px 24px 0 0', maxHeight: '92vh', paddingBottom: 'env(safe-area-inset-bottom,16px)' }
      : { borderRadius: '20px', maxWidth: '500px', maxHeight: '85vh' }),
  }
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={e => e.stopPropagation()}>
        {isMobile && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 2px' }}>
            <div style={{ width: '36px', height: '4px', borderRadius: '99px', background: C.border }} />
          </div>
        )}
        <div style={{ padding: isMobile ? '10px 20px 14px' : '24px 24px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: isMobile ? '18px' : '20px', fontWeight: 600, color: C.text, fontFamily: font.serif }}>{title}</h2>
          <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '50%', border: `1.5px solid ${C.border}`, background: C.surfaceAlt, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={14} color={C.textMid} />
          </button>
        </div>
        <div style={{ height: '1px', background: C.border }} />
        <div style={{ padding: isMobile ? '16px 20px' : '20px 24px 24px' }}>{children}</div>
      </div>
    </div>
  )
}

// ─── Button presets ──────────────────────────────────────────────────────────
const btnPrimaryFull = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
  width: '100%', padding: '13px', borderRadius: '12px', fontSize: '15px',
  fontWeight: 600, background: C.text, color: '#fff', border: 'none',
  cursor: 'pointer', fontFamily: font.sans,
}
const btnSecondaryFull = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
  width: '100%', padding: '13px', borderRadius: '12px', fontSize: '15px',
  fontWeight: 600, background: C.surface, color: C.textMid,
  border: `1.5px solid ${C.border}`, cursor: 'pointer', fontFamily: font.sans,
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ContentManager() {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  // UI State
  const [activeTab, setActiveTab] = useState('verse')
  const [savedMessage, setSavedMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Verse Library State
  const [verseLibrary, setVerseLibrary] = useState([])
  const [verseSearchTerm, setVerseSearchTerm] = useState('')
  const [showAddVerseForm, setShowAddVerseForm] = useState(false)
  const [selectedVerseId, setSelectedVerseId] = useState(null)
  const [newVerseForm, setNewVerseForm] = useState({ reference: '', text: '', theme: '' })
  const [activeVerse, setActiveVerseState] = useState({
    id: null,
    reference: 'Matthew 11:28',
    text: 'Come to me, all you who are weary and burdened, and I will give you rest.',
    theme: 'Rest and Peace'
  })

  // Calendar State
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [calendarPreview, setCalendarPreview] = useState(null)

  // Events State
  const [events, setEvents] = useState([])
  // Roster State
  const [roster, setRoster] = useState([])

  // Announcements State
  const [announcements, setAnnouncements] = useState([])
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState(null)
  const [announcementForm, setAnnouncementForm] = useState({
    title_en: '', title_bm: '', description_en: '', description_bm: '',
    image_url: '', link_url: '', display_order: 0, is_active: true
  })

  // Modal States
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [eventForm, setEventForm] = useState({ date: '', titleEn: '', time: '', descriptionEn: '', location: '', pic: '' })

  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false)
  const [editingRosterWeek, setEditingRosterWeek] = useState(null)
  const [rosterForm, setRosterForm] = useState({ weekStart: '', leader: '', pianist: '', reader: '' })

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const formatTimeForDisplay = (time24) => {
    if (!time24) return ''
    const [hour, minute] = time24.split(':')
    const h = parseInt(hour)
    const period = h >= 12 ? 'PM' : 'AM'
    const hour12 = h % 12 || 12
    return `${hour12}:${minute} ${period}`
  }

  const formatTimeForInput = (timeStr) => {
    if (!timeStr) return ''
    if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
    if (match) {
      let hour = parseInt(match[1])
      const minute = match[2]
      const period = match[3].toUpperCase()
      if (period === 'PM' && hour !== 12) hour += 12
      if (period === 'AM' && hour === 12) hour = 0
      return `${hour.toString().padStart(2, '0')}:${minute}`
    }
    return timeStr
  }

  const showSaved = (text, isError = false) => {
    setSavedMessage({ text, isError })
    setTimeout(() => setSavedMessage(null), 2200)
  }

  // ─── Data loading ──────────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const loadAllData = async () => {
    setIsLoading(true)
    await Promise.all([
      loadVerseLibrary(),
      loadActiveVerse(),
      loadEvents(),
      loadRoster(),
      loadAnnouncements(),
    ])
    setIsLoading(false)
  }

  const loadVerseLibrary = async () => {
    const { data, error } = await supabase.from('verse_library').select('*').order('created_at', { ascending: false })
    if (!error && data) setVerseLibrary(data)
  }

  const loadActiveVerse = async () => {
    const { data, error } = await supabase.from('verse_library').select('*').eq('is_active', true).maybeSingle()
    if (!error && data) setActiveVerseState({ id: data.id, reference: data.reference, text: data.text, theme: data.theme || '' })
  }

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .order('time', { ascending: true })
    if (!error && data) setEvents(data.map(e => ({ id: e.id, date: e.date, titleEn: e.title_en, time: e.time, descriptionEn: e.description_en, location: e.location || '', pic: e.pic || '' })))
  }

  const loadRoster = async () => {
    const { data, error } = await supabase.from('roster').select('*').order('week_start', { ascending: true }).limit(4)
    if (!error && data) setRoster(data.map(w => ({ id: w.id, weekStart: w.week_start, leader: w.leader || '', pianist: w.pianist || '', reader: w.reader || '' })))
  }

  const loadAnnouncements = async () => {
    const { data, error } = await supabase.from('carousel_items').select('*').order('display_order', { ascending: true }).order('created_at', { ascending: true })
    if (!error && data) setAnnouncements(data)
  }

  useEffect(() => { loadAllData() }, [])

  // ─── Verse functions ───────────────────────────────────────────────────────
  const saveNewVerseToLibrary = async () => {
    if (!newVerseForm.reference || !newVerseForm.text) { showSaved('Please fill in reference and verse text', true); return }
    const { data: existing } = await supabase.from('verse_library').select('id').eq('reference', newVerseForm.reference).maybeSingle()
    if (existing) { showSaved('Verse with this reference already exists', true); return }
    const { error } = await supabase.from('verse_library').insert({ reference: newVerseForm.reference, text: newVerseForm.text, theme: newVerseForm.theme, is_active: false })
    if (!error) { showSaved('Verse added to library'); setNewVerseForm({ reference: '', text: '', theme: '' }); setShowAddVerseForm(false); loadVerseLibrary() }
    else showSaved('Error saving verse', true)
  }

  const activateVerse = async (verseId) => {
    await supabase.from('verse_library').update({ is_active: false }).eq('is_active', true)
    const { error } = await supabase.from('verse_library').update({ is_active: true }).eq('id', verseId)
    if (!error) { showSaved('Verse activated for homepage'); await Promise.all([loadVerseLibrary(), loadActiveVerse()]); setSelectedVerseId(null) }
    else showSaved('Error activating verse', true)
  }

  const deleteVerse = async (verseId, verseReference) => {
    if (window.confirm(`Delete "${verseReference}" from library?`)) {
      const { error } = await supabase.from('verse_library').delete().eq('id', verseId)
      if (!error) { showSaved('Verse deleted'); if (selectedVerseId === verseId) setSelectedVerseId(null); loadVerseLibrary() }
      else showSaved('Error deleting verse', true)
    }
  }

  const exportVersesToCSV = () => {
    const headers = ['Reference', 'Text', 'Theme']
    const rows = verseLibrary.map(v => [`"${v.reference}"`, `"${v.text.replace(/"/g, '""')}"`, `"${v.theme || ''}"`])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement('a'), { href: url, download: `verse_library_${new Date().toISOString().split('T')[0]}.csv` })
    a.click()
    URL.revokeObjectURL(url)
    showSaved('Verses exported')
  }

  const importVersesFromCSV = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (event) => {
      const lines = event.target.result.split(/\r?\n/)
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
      const refIdx = headers.findIndex(h => h.toLowerCase() === 'reference')
      const textIdx = headers.findIndex(h => h.toLowerCase() === 'text')
      const themeIdx = headers.findIndex(h => h.toLowerCase() === 'theme')
      if (refIdx === -1 || textIdx === -1) { showSaved('CSV must have Reference and Text columns', true); return }
      let imported = 0, errors = 0
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue
        const row = lines[i].split(',').map(cell => cell.replace(/^"|"$/g, '').trim())
        const reference = row[refIdx], text = row[textIdx], theme = themeIdx !== -1 ? row[themeIdx] : ''
        if (reference && text) {
          const { error } = await supabase.from('verse_library').insert({ reference, text, theme, is_active: false })
          if (!error) imported++; else errors++
        }
      }
      showSaved(`Imported ${imported} verses, ${errors} errors`)
      loadVerseLibrary()
    }
    reader.readAsText(file, 'UTF-8')
    e.target.value = ''
  }

  const getSelectedVerse = () => selectedVerseId ? verseLibrary.find(v => v.id === selectedVerseId) : null

  // ─── Event functions ───────────────────────────────────────────────────────
  const handleAddEvent = () => { setEditingEvent(null); setEventForm({ date: '', titleEn: '', time: '', descriptionEn: '', location: '', pic: '' }); setIsEventModalOpen(true) }
  const handleEditEvent = (event) => { setEditingEvent(event); setEventForm({ date: event.date, titleEn: event.titleEn, time: formatTimeForInput(event.time), descriptionEn: event.descriptionEn || '', location: event.location || '', pic: event.pic || '' }); setIsEventModalOpen(true) }
  const handleSaveEvent = async () => {
    const payload = { date: eventForm.date, title_en: eventForm.titleEn, time: eventForm.time, description_en: eventForm.descriptionEn, location: eventForm.location, pic: eventForm.pic }
    if (editingEvent) {
      const { error } = await supabase.from('events').update(payload).eq('id', editingEvent.id)
      if (!error) showSaved('Event updated')
    } else {
      const { error } = await supabase.from('events').insert(payload)
      if (!error) showSaved('Event added')
    }
    setIsEventModalOpen(false)
    loadEvents()
  }
  const handleDeleteEvent = async (id) => {
    if (window.confirm('Delete this event?')) {
      const { error } = await supabase.from('events').delete().eq('id', id)
      if (!error) { showSaved('Event deleted'); loadEvents() }
    }
  }

  // ─── Roster functions ──────────────────────────────────────────────────────
  const saveRosterWeek = async (week) => {
    const { error } = await supabase.from('roster').update({ leader: week.leader, pianist: week.pianist, reader: week.reader }).eq('id', week.id)
    if (!error) { setRoster(prev => prev.map(w => w.id === week.id ? week : w)); showSaved('Roster week updated') }
  }
  const handleEditRoster = (week) => { setEditingRosterWeek(week); setRosterForm(week); setIsRosterModalOpen(true) }
  const handleSaveRosterEdit = async () => {
    const { error } = await supabase.from('roster').update({ week_start: rosterForm.weekStart, leader: rosterForm.leader, pianist: rosterForm.pianist, reader: rosterForm.reader }).eq('id', editingRosterWeek.id)
    if (!error) { setIsRosterModalOpen(false); showSaved('Roster week updated'); loadRoster() }
  }

  // ─── Announcements functions ───────────────────────────────────────────────
  const handleAddAnnouncement = () => {
    setEditingAnnouncement(null)
    setAnnouncementForm({ title_en: '', title_bm: '', description_en: '', description_bm: '', image_url: '', link_url: '', display_order: announcements.length, is_active: true })
    setIsAnnouncementModalOpen(true)
  }
  const handleEditAnnouncement = (item) => { setEditingAnnouncement(item); setAnnouncementForm(item); setIsAnnouncementModalOpen(true) }
  const handleSaveAnnouncement = async () => {
    const payload = {
      title_en: announcementForm.title_en, title_bm: announcementForm.title_bm,
      description_en: announcementForm.description_en, description_bm: announcementForm.description_bm,
      image_url: announcementForm.image_url || null, link_url: announcementForm.link_url || null,
      display_order: announcementForm.display_order, is_active: announcementForm.is_active, updated_at: new Date()
    }
    if (editingAnnouncement) {
      const { error } = await supabase.from('carousel_items').update(payload).eq('id', editingAnnouncement.id)
      if (!error) { showSaved('Announcement updated'); loadAnnouncements(); setIsAnnouncementModalOpen(false) }
      else showSaved('Error updating announcement', true)
    } else {
      const { error } = await supabase.from('carousel_items').insert(payload)
      if (!error) { showSaved('Announcement added'); loadAnnouncements(); setIsAnnouncementModalOpen(false) }
      else showSaved('Error adding announcement', true)
    }
  }
  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm('Delete this announcement?')) {
      const { error } = await supabase.from('carousel_items').delete().eq('id', id)
      if (!error) { showSaved('Announcement deleted'); loadAnnouncements() }
      else showSaved('Error deleting announcement', true)
    }
  }
  const toggleAnnouncementActive = async (id, currentActive) => {
    const { error } = await supabase.from('carousel_items').update({ is_active: !currentActive, updated_at: new Date() }).eq('id', id)
    if (!error) { showSaved(`Announcement ${!currentActive ? 'activated' : 'deactivated'}`); loadAnnouncements() }
    else showSaved('Error updating status', true)
  }
  const moveAnnouncement = async (id, direction) => {
    const index = announcements.findIndex(a => a.id === id)
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === announcements.length - 1)) return
    const newOrder = [...announcements]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    const tempOrder = newOrder[index].display_order
    newOrder[index].display_order = newOrder[swapIndex].display_order
    newOrder[swapIndex].display_order = tempOrder
    await supabase.from('carousel_items').update({ display_order: newOrder[index].display_order }).eq('id', newOrder[index].id)
    await supabase.from('carousel_items').update({ display_order: newOrder[swapIndex].display_order }).eq('id', newOrder[swapIndex].id)
    loadAnnouncements()
  }

  // ─── Calendar ──────────────────────────────────────────────────────────────
  const getWeekDateRange = (year, month, weekNumber) => {
    const firstDay = new Date(year, month, 1)
    const firstDayOfWeek = firstDay.getDay()
    let startDate = new Date(year, month, 1)
    const dayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1
    startDate.setDate(1 - dayOffset + (weekNumber - 1) * 7)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
    return { startDate, endDate }
  }
  const formatDateRange = (start, end) => `${start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
  const loadCalendarPreview = () => {
    const { startDate, endDate } = getWeekDateRange(selectedYear, selectedMonth, selectedWeek)
    const weekStartStr = startDate.toLocaleDateString('en-GB')
    const weekRoster = roster.find(r => r.weekStart === weekStartStr)
    const weekEvents = events.filter(event => { const d = new Date(event.date); return d >= startDate && d <= endDate })
    setCalendarPreview({ weekRange: formatDateRange(startDate, endDate), startDate, endDate, verse: activeVerse, roster: weekRoster || null, events: weekEvents })
  }
  useEffect(() => { if (isCalendarModalOpen) loadCalendarPreview() }, [selectedMonth, selectedYear, selectedWeek, isCalendarModalOpen, activeVerse, events, roster])

  const handleLogout = async () => { await signOut(); navigate('/login') }

  const tabs = [
    { id: 'verse', label: 'Weekly Verse', icon: BookOpen },
    { id: 'events', label: 'Events', icon: CalendarDays },
    { id: 'roster', label: 'Worship Roster', icon: Music },
    { id: 'announcements', label: 'Announcements', icon: Megaphone }
  ]

  if (isLoading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '34px', height: '34px', borderRadius: '50%', border: `3px solid ${C.border}`, borderTopColor: C.accentDark, animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* Toast */}
      {savedMessage && (
        <div style={{ position: 'fixed', top: '72px', left: '50%', transform: 'translateX(-50%)', zIndex: 200, animation: 'slideDown 0.2s ease-out', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '99px', background: savedMessage.isError ? '#DC2626' : C.text, color: '#fff', fontSize: '13px', fontFamily: font.sans }}>
            {savedMessage.isError ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
            {savedMessage.text}
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button onClick={() => navigate('/staff')} style={{ width: '34px', height: '34px', borderRadius: '50%', border: `1.5px solid ${C.border}`, background: C.surfaceAlt, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={15} color={C.textMid} />
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: C.text, fontFamily: font.serif, lineHeight: 1.2 }}>Content Manager</h1>
              <p style={{ margin: 0, fontSize: '11px', color: C.textMuted, fontFamily: font.sans }}>Website content administration</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={() => setIsCalendarModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: '99px', border: `1.5px solid ${C.border}`, background: C.surface, cursor: 'pointer', fontSize: '12px', color: C.textMid, fontFamily: font.sans }}>
              <CalendarDays size={13} /> Calendar
            </button>
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '99px', border: `1.5px solid ${C.border}`, background: C.surface, cursor: 'pointer', fontSize: '13px', color: C.textMid, fontFamily: font.sans }}>
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ borderBottom: `1px solid ${C.border}`, background: C.bg, padding: '0 20px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '4px', overflowX: 'auto' }}>
          {tabs.map(tab => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px',
                fontSize: '13px', fontWeight: 600, fontFamily: font.sans, color: active ? C.text : C.textMuted,
                borderBottom: active ? `2px solid ${C.accentDark}` : '2px solid transparent',
                background: 'transparent', cursor: 'pointer', whiteSpace: 'nowrap',
              }}>
                <Icon size={15} /> <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '20px 16px' : '28px', minWidth: 0 }}>

        {/* ========== VERSE TAB ========== */}
        {activeTab === 'verse' && (
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '24px' }}>
            {/* Left: Library */}
            <div style={{ flex: 1, background: C.surface, borderRadius: '18px', border: `1.5px solid ${C.border}`, padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, fontFamily: font.serif, color: C.text }}>Verse Library</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={exportVersesToCSV} style={{ padding: '6px', borderRadius: '8px', background: C.surfaceAlt, border: 'none', cursor: 'pointer' }}><Download size={14} color={C.textMid} /></button>
                  <label style={{ padding: '6px', borderRadius: '8px', background: C.surfaceAlt, cursor: 'pointer' }}><Upload size={14} color={C.textMid} /><input type="file" accept=".csv" onChange={importVersesFromCSV} style={{ display: 'none' }} /></label>
                </div>
              </div>
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <input type="text" placeholder="Search by reference or text..." value={verseSearchTerm} onChange={e => setVerseSearchTerm(e.target.value)} style={inputStyle} />
                <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: C.textMuted }} />
              </div>
              <div style={{ maxHeight: '320px', overflowY: 'auto', marginBottom: '16px' }}>
                {verseLibrary.filter(v => v.reference.toLowerCase().includes(verseSearchTerm.toLowerCase()) || v.text.toLowerCase().includes(verseSearchTerm.toLowerCase())).length === 0 ? (
                  <p style={{ textAlign: 'center', color: C.textMuted, padding: '24px' }}>No verses found</p>
                ) : (
                  verseLibrary.filter(v => v.reference.toLowerCase().includes(verseSearchTerm.toLowerCase()) || v.text.toLowerCase().includes(verseSearchTerm.toLowerCase())).map(verse => {
                    const isSelected = selectedVerseId === verse.id
                    return (
                      <div key={verse.id} style={{ padding: '12px', borderRadius: '10px', marginBottom: '8px', background: verse.is_active ? C.accentBg : 'transparent', border: `1.5px solid ${isSelected ? C.accentDark : C.border}`, cursor: 'pointer' }} onClick={() => setSelectedVerseId(verse.id)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div><p style={{ fontWeight: 600, fontFamily: font.serif, margin: 0 }}>{verse.reference}</p><p style={{ fontSize: '12px', color: C.textMuted, marginTop: '4px' }}>{verse.text.length > 80 ? verse.text.substring(0, 80) + '…' : verse.text}</p></div>
                          {verse.is_active && <span style={{ background: C.accentDark, color: '#fff', fontSize: '10px', padding: '2px 8px', borderRadius: '12px' }}>Active</span>}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              {!showAddVerseForm ? (
                <button onClick={() => setShowAddVerseForm(true)} style={{ width: '100%', padding: '10px', borderRadius: '12px', border: `1.5px dashed ${C.border}`, background: C.surface, cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: C.textMid, fontFamily: font.sans }}><Plus size={14} /> Add New Verse</button>
              ) : (
                <div style={{ padding: '16px', background: C.surfaceAlt, borderRadius: '12px' }}>
                  <input type="text" placeholder="Reference" value={newVerseForm.reference} onChange={e => setNewVerseForm({ ...newVerseForm, reference: e.target.value })} style={{ ...inputStyle, marginBottom: '10px' }} />
                  <textarea placeholder="Verse text" rows={3} value={newVerseForm.text} onChange={e => setNewVerseForm({ ...newVerseForm, text: e.target.value })} style={inputStyle} />
                  <input type="text" placeholder="Theme (optional)" value={newVerseForm.theme} onChange={e => setNewVerseForm({ ...newVerseForm, theme: e.target.value })} style={{ ...inputStyle, marginTop: '10px' }} />
                  <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                    <button onClick={saveNewVerseToLibrary} style={btnPrimaryFull}>Save</button>
                    <button onClick={() => setShowAddVerseForm(false)} style={btnSecondaryFull}>Cancel</button>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Preview */}
            <div style={{ flex: 1 }}>
              <div style={{ background: C.text, borderRadius: '18px', padding: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <CheckCircle size={16} color="#C4A88B" />
                  <span style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C4A88B', fontFamily: font.sans }}>Currently Active</span>
                </div>
                <p style={{ fontSize: '18px', fontFamily: font.serif, color: '#fff', lineHeight: 1.4 }}>“{activeVerse.text}”</p>
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: '#fff' }}>{activeVerse.reference}</p>
                  <p style={{ fontSize: '11px', color: '#78716C' }}>{activeVerse.theme || 'No theme'}</p>
                </div>
              </div>
              {getSelectedVerse() && (
                <div style={{ background: C.surface, borderRadius: '18px', border: `2px solid ${C.accentDark}`, padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <AlertCircle size={16} color={C.accentDark} />
                    <span style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMid }}>Preview — Will Become Active</span>
                  </div>
                  <p style={{ fontSize: '18px', fontFamily: font.serif, color: C.text, lineHeight: 1.4 }}>“{getSelectedVerse().text}”</p>
                  <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: `1px solid ${C.border}` }}>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: C.text }}>{getSelectedVerse().reference}</p>
                    <p style={{ fontSize: '11px', color: C.textMuted }}>{getSelectedVerse().theme || 'No theme'}</p>
                  </div>
                  <button onClick={() => activateVerse(getSelectedVerse().id)} style={{ ...btnPrimaryFull, marginTop: '20px' }}><CheckCircle size={14} /> Activate This Verse</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========== EVENTS TAB ========== */}
        {activeTab === 'events' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div><h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, fontFamily: font.serif, color: C.text }}>Upcoming Events</h2><p style={{ margin: '4px 0 0', fontSize: '12px', color: C.textMuted }}>Manage public‑facing church events</p></div>
              <button onClick={handleAddEvent} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '40px', border: `1.5px solid ${C.border}`, background: C.surface, cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: C.textMid, fontFamily: font.sans }}><Plus size={14} /> Add Event</button>
            </div>
            {events.length === 0 ? (
              <div style={{ background: C.surface, borderRadius: '20px', border: `1.5px solid ${C.border}`, padding: '48px 24px', textAlign: 'center', color: C.textMuted }}>No upcoming events. Click "Add Event" to create one.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {events.map(event => (
                  <div key={event.id} style={{ background: C.surface, borderRadius: '18px', border: `1.5px solid ${C.border}`, padding: '16px', transition: 'box-shadow 0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: C.surfaceAlt, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                          <span style={{ fontSize: '10px', fontWeight: 600, color: C.textMuted }}>{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                          <span style={{ fontSize: '20px', fontWeight: 700, fontFamily: font.serif, lineHeight: 1 }}>{new Date(event.date).getDate()}</span>
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, fontFamily: font.serif, color: C.text }}>{event.titleEn}</h3>
                          <p style={{ margin: '4px 0 0', fontSize: '12px', color: C.textMuted }}>{formatTimeForDisplay(event.time)}</p>
                          <p style={{ margin: '8px 0 0', fontSize: '13px', color: C.textMid }}>{event.descriptionEn}</p>
                          {(event.location || event.pic) && (
                            <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '11px', color: C.textMuted }}>
                              {event.location && <span><MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} /> {event.location}</span>}
                              {event.pic && <span><User size={12} style={{ display: 'inline', marginRight: '4px' }} /> {event.pic}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <button onClick={() => handleEditEvent(event)} style={{ padding: '6px 14px', borderRadius: '40px', border: `1.5px solid ${C.border}`, background: C.surface, cursor: 'pointer', fontSize: '12px', color: C.textMid, fontFamily: font.sans }}><Pencil size={12} /> Edit</button>
                        <button onClick={() => handleDeleteEvent(event.id)} style={{ padding: '6px 14px', borderRadius: '40px', border: `1.5px solid #FECACA`, background: '#FEF2F2', cursor: 'pointer', fontSize: '12px', color: '#DC2626', fontFamily: font.sans }}><Trash2 size={12} /> Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========== ROSTER TAB ========== */}
        {activeTab === 'roster' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, fontFamily: font.serif, color: C.text }}>Worship Roster</h2>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: C.textMuted }}>Weekly ministry scheduling overview</p>
            </div>
            <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)' }}>
              {roster.map(week => (
                <div key={week.id} style={{ background: C.surface, borderRadius: '18px', border: `1.5px solid ${C.border}`, padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div><p style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted }}>Worship Week</p><h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, fontFamily: font.serif }}>{week.weekStart}</h3></div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => saveRosterWeek(week)} style={{ padding: '6px 12px', borderRadius: '40px', border: `1.5px solid ${C.border}`, background: C.surface, cursor: 'pointer', fontSize: '12px' }}><Save size={12} /> Save</button>
                      <button onClick={() => handleEditRoster(week)} style={{ padding: '6px 12px', borderRadius: '40px', border: `1.5px solid ${C.border}`, background: C.surface, cursor: 'pointer', fontSize: '12px' }}><Pencil size={12} /> Edit</button>
                    </div>
                  </div>
                  <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div><span style={{ fontSize: '12px', color: C.textMuted }}>Leader:</span> <span style={{ fontWeight: 500 }}>{week.leader}</span></div>
                    <div><span style={{ fontSize: '12px', color: C.textMuted }}>Pianist:</span> <span style={{ fontWeight: 500 }}>{week.pianist}</span></div>
                    <div><span style={{ fontSize: '12px', color: C.textMuted }}>Reader:</span> <span style={{ fontWeight: 500 }}>{week.reader}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== ANNOUNCEMENTS TAB ========== */}
        {activeTab === 'announcements' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div><h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, fontFamily: font.serif, color: C.text }}>Carousel Announcements</h2><p style={{ margin: '4px 0 0', fontSize: '12px', color: C.textMuted }}>Manage slides shown on the homepage carousel</p></div>
              <button onClick={handleAddAnnouncement} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '40px', border: `1.5px solid ${C.border}`, background: C.surface, cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: C.textMid, fontFamily: font.sans }}><Plus size={14} /> Add Announcement</button>
            </div>
            {announcements.length === 0 ? (
              <div style={{ background: C.surface, borderRadius: '20px', border: `1.5px solid ${C.border}`, padding: '48px 24px', textAlign: 'center', color: C.textMuted }}>No announcements yet. Click "Add Announcement" to create one.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {announcements.map((item, idx) => (
                  <div key={item.id} style={{ background: item.is_active ? C.surface : '#F9F7F4', borderRadius: '18px', border: `1.5px solid ${C.border}`, padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: C.textMuted }}>{item.display_order}</span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={() => moveAnnouncement(item.id, 'up')} disabled={idx === 0} style={{ padding: '4px', borderRadius: '8px', background: C.surfaceAlt, border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.4 : 1 }}><MoveUp size={12} /></button>
                            <button onClick={() => moveAnnouncement(item.id, 'down')} disabled={idx === announcements.length-1} style={{ padding: '4px', borderRadius: '8px', background: C.surfaceAlt, border: 'none', cursor: idx === announcements.length-1 ? 'not-allowed' : 'pointer', opacity: idx === announcements.length-1 ? 0.4 : 1 }}><MoveDown size={12} /></button>
                          </div>
                        </div>
                        <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: C.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {item.image_url ? <img src={item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Image size={22} color={C.textMuted} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 600, fontFamily: font.serif, margin: 0 }}>{item.title_en}</p>
                          <p style={{ fontSize: '13px', color: C.textMuted, marginTop: '4px' }}>{item.title_bm}</p>
                          {item.link_url && <p style={{ fontSize: '11px', color: C.accentDark, marginTop: '6px' }}><Link size={11} style={{ display: 'inline', marginRight: '4px' }} /> {item.link_url.substring(0, 50)}…</p>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                        <button onClick={() => toggleAnnouncementActive(item.id, item.is_active)} style={{ padding: '4px 12px', borderRadius: '40px', border: 'none', background: item.is_active ? '#E6F4E6' : '#F3F4F6', color: item.is_active ? '#2E7D32' : '#6B7280', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>{item.is_active ? <Eye size={12} /> : <EyeOff size={12} />} {item.is_active ? 'Active' : 'Inactive'}</button>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleEditAnnouncement(item)} style={{ padding: '6px 14px', borderRadius: '40px', border: `1.5px solid ${C.border}`, background: C.surface, cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><Pencil size={12} /> Edit</button>
                          <button onClick={() => handleDeleteAnnouncement(item.id)} style={{ padding: '6px 14px', borderRadius: '40px', border: `1.5px solid #FECACA`, background: '#FEF2F2', cursor: 'pointer', fontSize: '12px', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '4px' }}><Trash2 size={12} /> Delete</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CALENDAR MODAL */}
      {isCalendarModalOpen && (
        <ModalShell title="Content Calendar" onClose={() => setIsCalendarModalOpen(false)} isMobile={isMobile}>
          <div style={{ background: C.surfaceAlt, borderRadius: '14px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))} style={{ ...inputStyle, width: 'auto', padding: '6px 10px' }}>
                  {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
                <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} style={{ ...inputStyle, width: 'auto', padding: '6px 10px' }}>
                  {[2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[1,2,3,4].map(w => <button key={w} onClick={() => setSelectedWeek(w)} style={{ width: '36px', height: '36px', borderRadius: '50%', background: selectedWeek===w ? C.text : C.surface, color: selectedWeek===w ? '#fff' : C.textMid, border: `1.5px solid ${selectedWeek===w ? C.text : C.border}`, cursor: 'pointer', fontSize: '13px' }}>{w}</button>)}
              </div>
            </div>
            <button onClick={loadCalendarPreview} style={{ ...btnPrimaryFull, marginTop: '16px', padding: '10px' }}>Load Week {selectedWeek}</button>
          </div>
          {calendarPreview && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ textAlign: 'center', fontWeight: 600, fontFamily: font.serif }}>{calendarPreview.weekRange}</p>
              <div style={{ background: C.surfaceAlt, borderRadius: '14px', padding: '16px' }}><h3 style={{ fontSize: '14px', fontWeight: 600 }}>📖 Weekly Verse</h3><p style={{ fontFamily: font.serif, marginTop: '4px' }}>{calendarPreview.verse.reference}</p><p style={{ fontSize: '12px', color: C.textMuted, marginTop: '4px' }}>{calendarPreview.verse.text.substring(0, 120)}…</p></div>
              <div style={{ background: C.surfaceAlt, borderRadius: '14px', padding: '16px' }}><h3 style={{ fontSize: '14px', fontWeight: 600 }}>🎵 Worship Roster</h3>{calendarPreview.roster ? (<div><div><strong>Leader:</strong> {calendarPreview.roster.leader}</div><div><strong>Pianist:</strong> {calendarPreview.roster.pianist}</div><div><strong>Reader:</strong> {calendarPreview.roster.reader}</div></div>) : <p>No roster assigned</p>}</div>
              <div style={{ background: C.surfaceAlt, borderRadius: '14px', padding: '16px' }}><h3 style={{ fontSize: '14px', fontWeight: 600 }}>📅 Events</h3>{calendarPreview.events.length ? calendarPreview.events.map(e => <div key={e.id} style={{ marginTop: '6px' }}><strong>{e.date}</strong> – {e.titleEn}</div>) : <p>No events</p>}</div>
            </div>
          )}
        </ModalShell>
      )}

      {/* EVENT MODAL */}
      {isEventModalOpen && (
        <ModalShell title={editingEvent ? 'Edit Event' : 'Add Event'} onClose={() => setIsEventModalOpen(false)} isMobile={isMobile}>
          <form onSubmit={(e) => { e.preventDefault(); handleSaveEvent() }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div><FieldLabel>Date *</FieldLabel><input type="date" value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} required style={inputStyle} /></div>
            <div><FieldLabel>Title *</FieldLabel><input type="text" value={eventForm.titleEn} onChange={e => setEventForm({ ...eventForm, titleEn: e.target.value })} required style={inputStyle} /></div>
            <div><FieldLabel>Time</FieldLabel><input type="time" value={eventForm.time} onChange={e => setEventForm({ ...eventForm, time: e.target.value })} style={inputStyle} /></div>
            <div><FieldLabel>Location</FieldLabel><input type="text" value={eventForm.location} onChange={e => setEventForm({ ...eventForm, location: e.target.value })} style={inputStyle} /></div>
            <div><FieldLabel>Person In Charge (PIC)</FieldLabel><input type="text" value={eventForm.pic} onChange={e => setEventForm({ ...eventForm, pic: e.target.value })} style={inputStyle} /></div>
            <div><FieldLabel>Description</FieldLabel><textarea rows={3} value={eventForm.descriptionEn} onChange={e => setEventForm({ ...eventForm, descriptionEn: e.target.value })} style={inputStyle} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
              <button type="button" onClick={() => setIsEventModalOpen(false)} style={btnSecondaryFull}>Cancel</button>
              <button type="submit" style={btnPrimaryFull}>{editingEvent ? 'Update' : 'Save'}</button>
            </div>
          </form>
        </ModalShell>
      )}

      {/* ROSTER MODAL */}
      {isRosterModalOpen && (
        <ModalShell title="Edit Worship Week" onClose={() => setIsRosterModalOpen(false)} isMobile={isMobile}>
          <form onSubmit={(e) => { e.preventDefault(); handleSaveRosterEdit() }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div><FieldLabel>Week Starting (DD/MM/YYYY)</FieldLabel><input type="text" value={rosterForm.weekStart} onChange={e => setRosterForm({ ...rosterForm, weekStart: e.target.value })} style={inputStyle} /></div>
            <div><FieldLabel>Worship Leader</FieldLabel><input type="text" value={rosterForm.leader} onChange={e => setRosterForm({ ...rosterForm, leader: e.target.value })} style={inputStyle} /></div>
            <div><FieldLabel>Pianist</FieldLabel><input type="text" value={rosterForm.pianist} onChange={e => setRosterForm({ ...rosterForm, pianist: e.target.value })} style={inputStyle} /></div>
            <div><FieldLabel>Scripture Reader</FieldLabel><input type="text" value={rosterForm.reader} onChange={e => setRosterForm({ ...rosterForm, reader: e.target.value })} style={inputStyle} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
              <button type="button" onClick={() => setIsRosterModalOpen(false)} style={btnSecondaryFull}>Cancel</button>
              <button type="submit" style={btnPrimaryFull}>Save Changes</button>
            </div>
          </form>
        </ModalShell>
      )}

      {/* ANNOUNCEMENT MODAL */}
      {isAnnouncementModalOpen && (
        <ModalShell title={editingAnnouncement ? 'Edit Announcement' : 'Add Announcement'} onClose={() => setIsAnnouncementModalOpen(false)} isMobile={isMobile}>
          <form onSubmit={(e) => { e.preventDefault(); handleSaveAnnouncement() }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
              <div><FieldLabel>Title (English) *</FieldLabel><input type="text" required value={announcementForm.title_en} onChange={e => setAnnouncementForm({ ...announcementForm, title_en: e.target.value })} style={inputStyle} /></div>
              <div><FieldLabel>Title (Bahasa Malaysia) *</FieldLabel><input type="text" required value={announcementForm.title_bm} onChange={e => setAnnouncementForm({ ...announcementForm, title_bm: e.target.value })} style={inputStyle} /></div>
            </div>
            <div><FieldLabel>Description (English)</FieldLabel><textarea rows={2} value={announcementForm.description_en} onChange={e => setAnnouncementForm({ ...announcementForm, description_en: e.target.value })} style={inputStyle} /></div>
            <div><FieldLabel>Description (Bahasa Malaysia)</FieldLabel><textarea rows={2} value={announcementForm.description_bm} onChange={e => setAnnouncementForm({ ...announcementForm, description_bm: e.target.value })} style={inputStyle} /></div>
            <div><FieldLabel>Image URL</FieldLabel><input type="url" value={announcementForm.image_url} onChange={e => setAnnouncementForm({ ...announcementForm, image_url: e.target.value })} style={inputStyle} /></div>
            <div><FieldLabel>Link URL (optional)</FieldLabel><input type="url" value={announcementForm.link_url} onChange={e => setAnnouncementForm({ ...announcementForm, link_url: e.target.value })} style={inputStyle} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><FieldLabel>Display Order</FieldLabel><input type="number" value={announcementForm.display_order} onChange={e => setAnnouncementForm({ ...announcementForm, display_order: parseInt(e.target.value) || 0 })} style={inputStyle} /></div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={announcementForm.is_active} onChange={e => setAnnouncementForm({ ...announcementForm, is_active: e.target.checked })} style={{ width: '16px', height: '16px', accentColor: C.accentDark }} />
                  <span style={{ fontSize: '13px', fontFamily: font.sans }}>Active (show on homepage)</span>
                </label>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
              <button type="button" onClick={() => setIsAnnouncementModalOpen(false)} style={btnSecondaryFull}>Cancel</button>
              <button type="submit" style={btnPrimaryFull}>Save</button>
            </div>
          </form>
        </ModalShell>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideDown { from { opacity:0; transform:translate(-50%,-10px); } to { opacity:1; transform:translate(-50%,0); } }
        input:focus, textarea:focus, select:focus { border-color: ${C.accentDark} !important; box-shadow: 0 0 0 3px ${C.accentBg} !important; outline: none; }
        ::-webkit-scrollbar { display: none; }
        .hidden { display: none; }
        @media (min-width: 768px) { .hidden { display: inline; } }
      `}</style>
    </div>
  )
}