// src/pages/ContentManager.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  LogOut,
  BookOpen,
  CalendarDays,
  Music,
  Save,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  Search,
  X,
  CheckCircle,
  AlertCircle,
  Download,
  Upload,
  MapPin,
  User,
  Trash,
  Megaphone,
  Image,
  Eye,
  EyeOff,
  GripVertical,
  MoveUp,
  MoveDown
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

function ContentManager() {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  // UI State
  const [activeTab, setActiveTab] = useState('verse')
  const [savedMessage, setSavedMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)
  
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

  // Content State
  const [events, setEvents] = useState([])
  const [roster, setRoster] = useState([])

  // Announcements State (carousel_items)
  const [announcements, setAnnouncements] = useState([])
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState(null)
  const [announcementForm, setAnnouncementForm] = useState({
    title_en: '',
    title_bm: '',
    description_en: '',
    description_bm: '',
    image_url: '',
    link_url: '',
    display_order: 0,
    is_active: true
  })

  // Modal States
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [eventForm, setEventForm] = useState({ date: '', titleEn: '', time: '', descriptionEn: '', location: '', pic: '' })

  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false)
  const [editingRosterWeek, setEditingRosterWeek] = useState(null)
  const [rosterForm, setRosterForm] = useState({ weekStart: '', leader: '', pianist: '', reader: '' })

  // Helper: Format time for display (24-hour to 12-hour)
  const formatTimeForDisplay = (time24) => {
    if (!time24) return ''
    const [hour, minute] = time24.split(':')
    const h = parseInt(hour)
    const period = h >= 12 ? 'PM' : 'AM'
    const hour12 = h % 12 || 12
    return `${hour12}:${minute} ${period}`
  }

  // Helper: Format time for input
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

  // Load data from Supabase
  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setIsLoading(true)
    await Promise.all([
      loadVerseLibrary(),
      loadActiveVerse(),
      loadEvents(),
      loadRoster(),
      loadAnnouncements()
    ])
    setIsLoading(false)
  }

  const loadVerseLibrary = async () => {
    const { data, error } = await supabase
      .from('verse_library')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setVerseLibrary(data)
    }
  }

  const loadActiveVerse = async () => {
    const { data, error } = await supabase
      .from('verse_library')
      .select('*')
      .eq('is_active', true)
      .maybeSingle()

    if (!error && data) {
      setActiveVerseState({
        id: data.id,
        reference: data.reference,
        text: data.text,
        theme: data.theme || ''
      })
    }
  }

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .order('time', { ascending: true })

    if (!error && data) {
      setEvents(data.map(event => ({
        id: event.id,
        date: event.date,
        titleEn: event.title_en,
        time: event.time,
        descriptionEn: event.description_en,
        location: event.location || '',
        pic: event.pic || ''
      })))
    }
  }

  const loadRoster = async () => {
    const { data, error } = await supabase
      .from('roster')
      .select('*')
      .order('week_start', { ascending: true })
      .limit(4)

    if (!error && data) {
      setRoster(data.map(week => ({
        id: week.id,
        weekStart: week.week_start,
        leader: week.leader || '',
        pianist: week.pianist || '',
        reader: week.reader || ''
      })))
    }
  }

  // ─── Announcements (Carousel) Functions ─────────────────────────────────────
  const loadAnnouncements = async () => {
    const { data, error } = await supabase
      .from('carousel_items')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (!error && data) {
      setAnnouncements(data)
    }
  }

  const handleAddAnnouncement = () => {
    setEditingAnnouncement(null)
    setAnnouncementForm({
      title_en: '',
      title_bm: '',
      description_en: '',
      description_bm: '',
      image_url: '',
      link_url: '',
      display_order: announcements.length,
      is_active: true
    })
    setIsAnnouncementModalOpen(true)
  }

  const handleEditAnnouncement = (item) => {
    setEditingAnnouncement(item)
    setAnnouncementForm(item)
    setIsAnnouncementModalOpen(true)
  }

  const handleSaveAnnouncement = async () => {
    const payload = {
      title_en: announcementForm.title_en,
      title_bm: announcementForm.title_bm,
      description_en: announcementForm.description_en,
      description_bm: announcementForm.description_bm,
      image_url: announcementForm.image_url || null,
      link_url: announcementForm.link_url || null,
      display_order: announcementForm.display_order,
      is_active: announcementForm.is_active,
      updated_at: new Date()
    }

    if (editingAnnouncement) {
      const { error } = await supabase
        .from('carousel_items')
        .update(payload)
        .eq('id', editingAnnouncement.id)

      if (!error) {
        showSaved('Announcement updated')
        loadAnnouncements()
        setIsAnnouncementModalOpen(false)
      } else {
        showSaved('Error updating announcement', true)
      }
    } else {
      const { error } = await supabase
        .from('carousel_items')
        .insert(payload)

      if (!error) {
        showSaved('Announcement added')
        loadAnnouncements()
        setIsAnnouncementModalOpen(false)
      } else {
        showSaved('Error adding announcement', true)
      }
    }
  }

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm('Delete this announcement? It will be removed from the homepage carousel.')) {
      const { error } = await supabase
        .from('carousel_items')
        .delete()
        .eq('id', id)

      if (!error) {
        showSaved('Announcement deleted')
        loadAnnouncements()
      } else {
        showSaved('Error deleting announcement', true)
      }
    }
  }

  const toggleAnnouncementActive = async (id, currentActive) => {
    const { error } = await supabase
      .from('carousel_items')
      .update({ is_active: !currentActive, updated_at: new Date() })
      .eq('id', id)

    if (!error) {
      showSaved(`Announcement ${!currentActive ? 'activated' : 'deactivated'}`)
      loadAnnouncements()
    } else {
      showSaved('Error updating status', true)
    }
  }

  const moveAnnouncement = async (id, direction) => {
    const index = announcements.findIndex(a => a.id === id)
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === announcements.length - 1) return

    const newOrder = [...announcements]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    const tempOrder = newOrder[index].display_order
    newOrder[index].display_order = newOrder[swapIndex].display_order
    newOrder[swapIndex].display_order = tempOrder

    // Update both in Supabase
    const { error: error1 } = await supabase
      .from('carousel_items')
      .update({ display_order: newOrder[index].display_order })
      .eq('id', newOrder[index].id)

    const { error: error2 } = await supabase
      .from('carousel_items')
      .update({ display_order: newOrder[swapIndex].display_order })
      .eq('id', newOrder[swapIndex].id)

    if (!error1 && !error2) {
      loadAnnouncements()
    } else {
      showSaved('Error reordering', true)
    }
  }

  // ─── Verse Library Functions ────────────────────────────────────────────────
  const saveNewVerseToLibrary = async () => {
    if (!newVerseForm.reference || !newVerseForm.text) {
      showSaved('Please fill in reference and verse text', true)
      return
    }

    const { data: existing } = await supabase
      .from('verse_library')
      .select('id')
      .eq('reference', newVerseForm.reference)
      .maybeSingle()

    if (existing) {
      showSaved('Verse with this reference already exists', true)
      return
    }

    const { error } = await supabase
      .from('verse_library')
      .insert({
        reference: newVerseForm.reference,
        text: newVerseForm.text,
        theme: newVerseForm.theme,
        is_active: false
      })

    if (!error) {
      showSaved('Verse added to library')
      setNewVerseForm({ reference: '', text: '', theme: '' })
      setShowAddVerseForm(false)
      await loadVerseLibrary()
    } else {
      showSaved('Error saving verse', true)
    }
  }

  const activateVerse = async (verseId) => {
    await supabase
      .from('verse_library')
      .update({ is_active: false })
      .eq('is_active', true)

    const { error } = await supabase
      .from('verse_library')
      .update({ is_active: true })
      .eq('id', verseId)

    if (!error) {
      showSaved('Verse activated for homepage')
      await Promise.all([loadVerseLibrary(), loadActiveVerse()])
      setSelectedVerseId(null)
    } else {
      showSaved('Error activating verse', true)
    }
  }

  const deleteVerse = async (verseId, verseReference) => {
    if (window.confirm(`Delete "${verseReference}" from library? This cannot be undone.`)) {
      const { error } = await supabase
        .from('verse_library')
        .delete()
        .eq('id', verseId)

      if (!error) {
        showSaved('Verse deleted')
        if (selectedVerseId === verseId) setSelectedVerseId(null)
        await loadVerseLibrary()
      } else {
        showSaved('Error deleting verse', true)
      }
    }
  }

  const exportVersesToCSV = () => {
    const headers = ['Reference', 'Text', 'Theme']
    const rows = verseLibrary.map(v => [
      `"${v.reference}"`,
      `"${v.text.replace(/"/g, '""')}"`,
      `"${v.theme || ''}"`
    ])
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `verse_library_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
    showSaved('Verses exported')
  }

  const importVersesFromCSV = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const csvText = event.target.result
      const lines = csvText.split(/\r?\n/)
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
      
      const referenceIdx = headers.findIndex(h => h.toLowerCase() === 'reference')
      const textIdx = headers.findIndex(h => h.toLowerCase() === 'text')
      const themeIdx = headers.findIndex(h => h.toLowerCase() === 'theme')

      if (referenceIdx === -1 || textIdx === -1) {
        showSaved('CSV must have Reference and Text columns', true)
        return
      }

      let imported = 0
      let errors = 0

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue
        
        const row = []
        let inQuote = false
        let field = ''
        for (const char of lines[i]) {
          if (char === '"') {
            inQuote = !inQuote
          } else if (char === ',' && !inQuote) {
            row.push(field.trim())
            field = ''
          } else {
            field += char
          }
        }
        row.push(field.trim())
        
        const reference = row[referenceIdx]?.replace(/^"|"$/g, '')
        const text = row[textIdx]?.replace(/^"|"$/g, '')
        const theme = themeIdx !== -1 ? row[themeIdx]?.replace(/^"|"$/g, '') : ''

        if (reference && text) {
          const { error } = await supabase
            .from('verse_library')
            .insert({ reference, text, theme, is_active: false })
            .select()
          
          if (!error) imported++
          else errors++
        }
      }

      showSaved(`Imported ${imported} verses, ${errors} errors`)
      await loadVerseLibrary()
    }
    reader.readAsText(file, 'UTF-8')
    e.target.value = ''
  }

  const getSelectedVerse = () => {
    if (!selectedVerseId) return null
    return verseLibrary.find(v => v.id === selectedVerseId)
  }

  // ─── Event Functions ────────────────────────────────────────────────────────
  const handleAddEvent = () => {
    setEditingEvent(null)
    setEventForm({ date: '', titleEn: '', time: '', descriptionEn: '', location: '', pic: '' })
    setIsEventModalOpen(true)
  }

  const handleEditEvent = (event) => {
    setEditingEvent(event)
    setEventForm({
      date: event.date,
      titleEn: event.titleEn,
      time: formatTimeForInput(event.time),
      descriptionEn: event.descriptionEn || '',
      location: event.location || '',
      pic: event.pic || ''
    })
    setIsEventModalOpen(true)
  }

  const handleSaveEvent = async () => {
    if (editingEvent) {
      const { error } = await supabase
        .from('events')
        .update({
          date: eventForm.date,
          title_en: eventForm.titleEn,
          time: eventForm.time,
          description_en: eventForm.descriptionEn,
          location: eventForm.location,
          pic: eventForm.pic
        })
        .eq('id', editingEvent.id)

      if (!error) showSaved('Event updated')
    } else {
      const { error } = await supabase
        .from('events')
        .insert({
          date: eventForm.date,
          title_en: eventForm.titleEn,
          time: eventForm.time,
          description_en: eventForm.descriptionEn,
          location: eventForm.location,
          pic: eventForm.pic
        })

      if (!error) showSaved('Event added')
    }

    setIsEventModalOpen(false)
    loadEvents()
  }

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Delete this event?')) {
      const { error } = await supabase.from('events').delete().eq('id', id)
      if (!error) {
        showSaved('Event deleted')
        loadEvents()
      }
    }
  }

  // ─── Roster Functions ───────────────────────────────────────────────────────
  const saveRosterWeek = async (week) => {
    const { error } = await supabase
      .from('roster')
      .update({
        leader: week.leader,
        pianist: week.pianist,
        reader: week.reader
      })
      .eq('id', week.id)

    if (!error) {
      setRoster(prev => prev.map(w => w.id === week.id ? week : w))
      showSaved('Roster week updated')
    }
  }

  const handleEditRoster = (week) => {
    setEditingRosterWeek(week)
    setRosterForm(week)
    setIsRosterModalOpen(true)
  }

  const handleSaveRosterEdit = async () => {
    const { error } = await supabase
      .from('roster')
      .update({
        week_start: rosterForm.weekStart,
        leader: rosterForm.leader,
        pianist: rosterForm.pianist,
        reader: rosterForm.reader
      })
      .eq('id', editingRosterWeek.id)

    if (!error) {
      setIsRosterModalOpen(false)
      showSaved('Roster week updated')
      loadRoster()
    }
  }

  // ─── Calendar Functions ─────────────────────────────────────────────────────
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

  const formatDateRange = (start, end) => {
    const options = { day: 'numeric', month: 'short' }
    return `${start.toLocaleDateString('en-GB', options)} - ${end.toLocaleDateString('en-GB', options)}`
  }

  const loadCalendarPreview = () => {
    const { startDate, endDate } = getWeekDateRange(selectedYear, selectedMonth, selectedWeek)
    const weekStartStr = startDate.toLocaleDateString('en-GB')
    const weekRoster = roster.find(r => r.weekStart === weekStartStr)
    const weekEvents = events.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate >= startDate && eventDate <= endDate
    })
    setCalendarPreview({
      weekRange: formatDateRange(startDate, endDate),
      startDate,
      endDate,
      verse: activeVerse,
      roster: weekRoster || null,
      events: weekEvents
    })
  }

  useEffect(() => {
    if (isCalendarModalOpen) loadCalendarPreview()
  }, [selectedMonth, selectedYear, selectedWeek, isCalendarModalOpen, activeVerse, events, roster])

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const showSaved = (message, isError = false) => {
    setSavedMessage({ text: message, isError })
    setTimeout(() => setSavedMessage(null), 2200)
  }

  const tabs = [
    { id: 'verse', label: 'Weekly Verse', icon: BookOpen },
    { id: 'events', label: 'Events', icon: CalendarDays },
    { id: 'roster', label: 'Worship Roster', icon: Music },
    { id: 'announcements', label: 'Announcements', icon: Megaphone }
  ]

  const selectedVerse = getSelectedVerse()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2D2926]/20 border-t-[#2D2926] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-[#E7E0D7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/staff')}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-[#E7E0D7] bg-white flex items-center justify-center hover:bg-[#F4F1EC] transition"
            >
              <ArrowLeft size={18} className="text-[#5E5247]" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-serif text-[#2D2926] leading-none">Content Manager</h1>
              <p className="text-[10px] sm:text-xs text-[#8B7E72] mt-0.5 sm:mt-1">Website content administration</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsCalendarModalOpen(true)}
              className="hidden sm:flex items-center gap-2 px-4 h-10 rounded-xl border border-[#E7E0D7] bg-white hover:bg-[#F4F1EC] transition text-sm text-[#5E5247]"
            >
              <CalendarDays size={16} />
              Calendar
            </button>
            <button
              onClick={handleLogout}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-[#E7E0D7] bg-white flex items-center justify-center hover:bg-[#F4F1EC] transition"
            >
              <LogOut size={16} className="text-[#5E5247]" />
            </button>
          </div>
        </div>
      </header>

      {/* Save Toast */}
      {savedMessage && (
        <div className="fixed top-20 right-4 sm:right-6 z-50">
          <div className={`flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl shadow-xl text-sm animate-fade-in ${savedMessage.isError ? 'bg-red-600 text-white' : 'bg-[#2D2926] text-white'}`}>
            {savedMessage.isError ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
            {savedMessage.text}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-[#E7E0D7] bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex gap-1 sm:gap-2 py-3 sm:py-4 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 h-9 sm:h-11 rounded-2xl text-xs sm:text-sm transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-white border border-[#DDD2C5] shadow-sm text-[#2D2926]'
                      : 'text-[#8B7E72] hover:bg-white/70'
                  }`}
                >
                  <Icon size={15} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
        
        {/* Verse Tab (unchanged) */}
        {activeTab === 'verse' && (
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6">
            {/* LEFT COLUMN: Verse Library */}
            <div className="bg-white border border-[#E7E0D7] rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-serif text-[#2D2926]">Verse Library</h2>
                <div className="flex gap-2">
                  <button onClick={exportVersesToCSV} className="p-2 rounded-lg hover:bg-[#F5F1EB] transition" title="Export verses"><Download size={16} className="text-[#5E5247]" /></button>
                  <label className="p-2 rounded-lg hover:bg-[#F5F1EB] transition cursor-pointer"><Upload size={16} className="text-[#5E5247]" /><input type="file" accept=".csv" onChange={importVersesFromCSV} className="hidden" /></label>
                </div>
              </div>
              <div className="relative mb-4">
                <input type="text" placeholder="Search by reference or text..." value={verseSearchTerm} onChange={(e) => setVerseSearchTerm(e.target.value)} className="w-full px-4 py-2 pl-9 rounded-xl border border-[#EAE1D4] text-sm" />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A7A6E]" />
                {verseSearchTerm && <button onClick={() => setVerseSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={16} className="text-[#8A7A6E]" /></button>}
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto mb-4">
                {verseLibrary.filter(v => v.reference.toLowerCase().includes(verseSearchTerm.toLowerCase()) || v.text.toLowerCase().includes(verseSearchTerm.toLowerCase())).length === 0 ? (
                  <p className="text-center text-[#8A7A6E] py-4 text-sm">No verses found</p>
                ) : (
                  verseLibrary.filter(v => v.reference.toLowerCase().includes(verseSearchTerm.toLowerCase()) || v.text.toLowerCase().includes(verseSearchTerm.toLowerCase())).map(verse => (
                    <div key={verse.id} className={`border rounded-xl p-3 transition-all ${selectedVerseId === verse.id ? 'border-[#C4A88B] bg-[#F5EFE6] ring-2 ring-[#C4A88B]/30' : verse.is_active ? 'border-[#C4A88B] bg-[#FAF8F5]' : 'border-[#EAE1D4] hover:bg-[#F5F1EB]'}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1 cursor-pointer" onClick={() => setSelectedVerseId(verse.id)}>
                          <p className="font-medium text-[#2D2926] text-sm">{verse.reference}</p>
                          <p className="text-xs text-[#7A6A5E] mt-1 line-clamp-1">{verse.text}</p>
                          {verse.theme && <p className="text-[10px] text-[#B0A49A] mt-1">{verse.theme}</p>}
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          {verse.is_active && <span className="text-[10px] bg-[#2D2926] text-white px-2 py-0.5 rounded-full">Active</span>}
                          {!verse.is_active && <button onClick={() => deleteVerse(verse.id, verse.reference)} className="p-1 rounded hover:bg-red-50 transition"><Trash size={14} className="text-[#B07C68]" /></button>}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {!showAddVerseForm ? (
                <button onClick={() => setShowAddVerseForm(true)} className="w-full flex items-center justify-center gap-2 h-10 rounded-xl border border-dashed border-[#EAE1D4] text-sm text-[#5E5247] hover:bg-[#F5F1EB] transition"><Plus size={14} />Add New Verse</button>
              ) : (
                <div className="border border-[#EAE1D4] rounded-xl p-3 space-y-3 bg-[#FAF8F5]">
                  <input type="text" placeholder="Reference (e.g., Matthew 11:28)" value={newVerseForm.reference} onChange={(e) => setNewVerseForm(prev => ({ ...prev, reference: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" autoFocus />
                  <textarea placeholder="Verse text" rows={2} value={newVerseForm.text} onChange={(e) => setNewVerseForm(prev => ({ ...prev, text: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm resize-none" />
                  <input type="text" placeholder="Theme (optional)" value={newVerseForm.theme} onChange={(e) => setNewVerseForm(prev => ({ ...prev, theme: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" />
                  <div className="flex gap-2"><button onClick={saveNewVerseToLibrary} className="flex-1 bg-[#2D2926] text-white py-2 rounded-lg text-sm hover:bg-[#4A3F38]">Save</button><button onClick={() => setShowAddVerseForm(false)} className="flex-1 border border-[#EAE1D4] text-[#5E5247] py-2 rounded-lg text-sm hover:bg-white">Cancel</button></div>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="bg-[#2D2926] rounded-2xl p-5 text-white"><div className="flex items-center gap-2 mb-3"><CheckCircle size={16} className="text-[#C4A88B]" /><span className="text-xs uppercase tracking-wider text-[#C4A88B]">Currently Active</span></div><p className="text-xl font-serif leading-relaxed">"{activeVerse.text}"</p><div className="mt-4 pt-3 border-t border-white/10"><p className="text-sm font-medium">{activeVerse.reference}</p><p className="text-xs text-white/60 mt-1">{activeVerse.theme || 'No theme'}</p></div></div>
              {selectedVerse && (<div className="bg-white border-2 border-[#C4A88B] rounded-2xl p-5 shadow-lg"><div className="flex items-center gap-2 mb-3"><AlertCircle size={16} className="text-[#C4A88B]" /><span className="text-xs uppercase tracking-wider text-[#5E5247]">Preview — Will Become Active</span></div><p className="text-xl font-serif text-[#2D2926] leading-relaxed">"{selectedVerse.text}"</p><div className="mt-4 pt-3 border-t border-[#EAE1D4]"><p className="text-sm font-medium text-[#2D2926]">{selectedVerse.reference}</p><p className="text-xs text-[#8A7A6E] mt-1">{selectedVerse.theme || 'No theme'}</p></div><button onClick={() => activateVerse(selectedVerse.id)} className="w-full mt-4 bg-[#2D2926] text-white py-2 rounded-xl text-sm hover:bg-[#4A3F38] transition flex items-center justify-center gap-2"><CheckCircle size={14} />Activate This Verse</button></div>)}
            </div>
          </div>
        )}

        {/* Events Tab (unchanged) */}
        {activeTab === 'events' && (
          <div className="space-y-4 sm:space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div><h2 className="text-lg sm:text-xl font-serif text-[#2D2926]">Upcoming Events</h2><p className="text-xs sm:text-sm text-[#8B7E72] mt-0.5 sm:mt-1">Manage public-facing church events</p></div>
              <button onClick={handleAddEvent} className="flex items-center justify-center gap-2 h-10 sm:h-11 px-4 sm:px-5 rounded-2xl border border-[#E7E0D7] bg-white hover:bg-[#F5F1EB] transition"><Plus size={15} /><span className="hidden sm:inline">Add Event</span></button>
            </div>
            <div className="grid gap-3 sm:gap-4">
              {events.length === 0 ? (<div className="bg-white border border-[#E7E0D7] rounded-2xl p-8 text-center text-[#8A7A6E]">No upcoming events. Click "Add Event" to create one.</div>) : (
                events.map((event) => (
                  <div key={event.id} className="bg-white border border-[#E7E0D7] rounded-2xl sm:rounded-3xl p-4 sm:p-6 hover:shadow-md transition">
                    <div className="flex justify-between gap-4 sm:gap-6">
                      <div className="flex gap-3 sm:gap-5 flex-1">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#F5F1EB] flex flex-col items-center justify-center"><span className="text-[10px] sm:text-xs text-[#8B7E72]">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span><span className="text-lg sm:text-xl font-semibold text-[#2D2926] leading-none mt-1">{new Date(event.date).getDate()}</span></div>
                        <div className="flex-1"><div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2"><h3 className="text-base sm:text-lg font-medium text-[#2D2926]">{event.titleEn}</h3><ChevronRight size={14} className="text-[#B7A89A]" /></div><p className="text-xs sm:text-sm text-[#8B7E72] mb-2 sm:mb-3">{formatTimeForDisplay(event.time)}</p><p className="text-xs sm:text-sm text-[#5E5247] leading-relaxed">{event.descriptionEn}</p>{(event.location || event.pic) && (<div className="flex flex-wrap gap-3 mt-2 text-xs text-[#8A7A6E]">{event.location && <div className="flex items-center gap-1"><MapPin size={12} /> {event.location}</div>}{event.pic && <div className="flex items-center gap-1"><User size={12} /> {event.pic}</div>}</div>)}</div>
                      </div>
                      <div className="flex items-start gap-1 sm:gap-2"><button onClick={() => handleEditEvent(event)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl border border-[#E7E0D7] flex items-center justify-center hover:bg-[#F5F1EB] transition"><Pencil size={13} className="text-[#5E5247]" /></button><button onClick={() => handleDeleteEvent(event.id)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl border border-[#E7E0D7] flex items-center justify-center hover:bg-red-50 transition"><Trash2 size={13} className="text-[#B07C68]" /></button></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Roster Tab (unchanged) */}
        {activeTab === 'roster' && (
          <div className="space-y-4 sm:space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h2 className="text-lg sm:text-xl font-serif text-[#2D2926]">Worship Roster</h2><p className="text-xs sm:text-sm text-[#8B7E72] mt-0.5 sm:mt-1">Weekly ministry scheduling overview</p></div></div>
            <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
              {roster.map((week) => (
                <div key={week.id} className="bg-white border border-[#E7E0D7] rounded-2xl sm:rounded-3xl p-4 sm:p-6 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-4 sm:mb-6"><div><p className="text-[10px] sm:text-xs uppercase tracking-[0.15em] text-[#A39284] mb-1 sm:mb-2">Worship Week</p><h3 className="text-base sm:text-lg font-medium text-[#2D2926]">{week.weekStart}</h3></div><div className="flex gap-1 sm:gap-2"><button onClick={() => saveRosterWeek(week)} className="flex items-center justify-center gap-1 h-8 sm:h-9 px-2 sm:px-3 rounded-xl border border-[#E7E0D7] bg-white hover:bg-[#F5F1EB] transition text-xs"><Save size={12} /><span className="hidden sm:inline">Save</span></button><button onClick={() => handleEditRoster(week)} className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-[#E7E0D7] flex items-center justify-center hover:bg-[#F5F1EB] transition"><Pencil size={13} className="text-[#5E5247]" /></button></div></div>
                  <div className="space-y-3 sm:space-y-4"><div className="flex items-center justify-between py-2 sm:py-3 border-b border-[#F0EAE2]"><span className="text-xs sm:text-sm text-[#8B7E72]">Worship Leader</span><span className="text-xs sm:text-sm font-medium text-[#2D2926]">{week.leader}</span></div><div className="flex items-center justify-between py-2 sm:py-3 border-b border-[#F0EAE2]"><span className="text-xs sm:text-sm text-[#8B7E72]">Pianist</span><span className="text-xs sm:text-sm font-medium text-[#2D2926]">{week.pianist}</span></div><div className="flex items-center justify-between py-2 sm:py-3"><span className="text-xs sm:text-sm text-[#8B7E72]">Scripture Reader</span><span className="text-xs sm:text-sm font-medium text-[#2D2926]">{week.reader}</span></div></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Announcements Tab (NEW) */}
        {activeTab === 'announcements' && (
          <div className="space-y-4 sm:space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-serif text-[#2D2926]">Carousel Announcements</h2>
                <p className="text-xs sm:text-sm text-[#8B7E72] mt-0.5 sm:mt-1">Manage slides shown on the homepage carousel</p>
              </div>
              <button
                onClick={handleAddAnnouncement}
                className="flex items-center justify-center gap-2 h-10 sm:h-11 px-4 sm:px-5 rounded-2xl border border-[#E7E0D7] bg-white hover:bg-[#F5F1EB] transition"
              >
                <Plus size={15} />
                <span className="hidden sm:inline">Add Announcement</span>
              </button>
            </div>

            <div className="bg-white border border-[#E7E0D7] rounded-2xl overflow-hidden">
              {announcements.length === 0 ? (
                <div className="p-8 text-center text-[#8A7A6E]">
                  No announcements yet. Click "Add Announcement" to create one.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#FAF8F5] border-b border-[#E7E0D7]">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#8B7E72] uppercase tracking-wider">Order</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#8B7E72] uppercase tracking-wider">Title (EN)</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#8B7E72] uppercase tracking-wider">Title (BM)</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#8B7E72] uppercase tracking-wider">Image</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#8B7E72] uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-[#8B7E72] uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {announcements.map((item, idx) => (
                        <tr key={item.id} className="border-b border-[#E7E0D7] hover:bg-[#FAF8F5] transition">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-[#5E5247] w-6">{item.display_order}</span>
                              <button
                                onClick={() => moveAnnouncement(item.id, 'up')}
                                disabled={idx === 0}
                                className={`p-1 rounded hover:bg-[#F5F1EB] transition ${idx === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                              >
                                <MoveUp size={14} className="text-[#5E5247]" />
                              </button>
                              <button
                                onClick={() => moveAnnouncement(item.id, 'down')}
                                disabled={idx === announcements.length - 1}
                                className={`p-1 rounded hover:bg-[#F5F1EB] transition ${idx === announcements.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                              >
                                <MoveDown size={14} className="text-[#5E5247]" />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-[#2D2926]">{item.title_en || '—'}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-[#5E5247]">{item.title_bm || '—'}</p>
                          </td>
                          <td className="px-4 py-3">
                            {item.image_url ? (
                              <div className="w-12 h-12 rounded-lg bg-[#F5F1EB] flex items-center justify-center overflow-hidden">
                                <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-[#F5F1EB] flex items-center justify-center">
                                <Image size={16} className="text-[#B0A49A]" />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => toggleAnnouncementActive(item.id, item.is_active)}
                              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                item.is_active
                                  ? 'bg-green-50 text-green-700 border border-green-200'
                                  : 'bg-gray-50 text-gray-500 border border-gray-200'
                              }`}
                            >
                              {item.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                              {item.is_active ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditAnnouncement(item)}
                                className="p-2 rounded-lg hover:bg-[#F5F1EB] transition"
                              >
                                <Pencil size={14} className="text-[#5E5247]" />
                              </button>
                              <button
                                onClick={() => handleDeleteAnnouncement(item.id)}
                                className="p-2 rounded-lg hover:bg-red-50 transition"
                              >
                                <Trash2 size={14} className="text-[#B07C68]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Calendar Modal (unchanged) */}
      {isCalendarModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5"><h2 className="text-lg sm:text-xl font-serif text-[#2D2926]">Content Calendar</h2><button onClick={() => setIsCalendarModalOpen(false)} className="text-[#8A7A6E] hover:text-[#2D2926] text-2xl leading-none">×</button></div>
            <div className="bg-[#F5EFE6] rounded-xl p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2"><select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="px-3 py-2 border border-[#EAE1D4] rounded-lg text-sm bg-white">{['January','February','March','April','May','June','July','August','September','October','November','December'].map((month, idx) => (<option key={idx} value={idx}>{month}</option>))}</select><select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="px-3 py-2 border border-[#EAE1D4] rounded-lg text-sm bg-white">{[2025,2026,2027].map(year => <option key={year} value={year}>{year}</option>)}</select></div>
                <div className="flex gap-2">{ [1,2,3,4].map(week => (<button key={week} onClick={() => setSelectedWeek(week)} className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full text-sm font-medium transition ${selectedWeek === week ? 'bg-[#2D2926] text-white' : 'border border-[#EAE1D4] text-[#7A6A5E] hover:bg-[#F5EFE6]'}`}>{week}</button>)) }</div>
              </div>
              <button onClick={loadCalendarPreview} className="w-full mt-4 bg-[#2D2926] text-white py-2 rounded-lg text-sm hover:bg-[#4A3F38] transition">Load Week {selectedWeek}</button>
            </div>
            {calendarPreview && (
              <div className="space-y-5">
                <div className="text-center"><p className="text-sm font-medium text-[#2D2926]">{calendarPreview.weekRange}</p></div>
                <div className="border rounded-xl p-4"><h3 className="text-sm font-medium mb-2">📖 Weekly Verse</h3><p className="font-serif">{calendarPreview.verse.reference}</p><p className="text-sm text-[#7A6A5E] mt-1">{calendarPreview.verse.text.substring(0, 100)}...</p></div>
                <div className="border rounded-xl p-4"><h3 className="text-sm font-medium mb-2">🎵 Worship Roster</h3>{calendarPreview.roster ? (<div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm"><div><span className="text-[#8A7A6E]">Leader:</span> {calendarPreview.roster.leader}</div><div><span className="text-[#8A7A6E]">Pianist:</span> {calendarPreview.roster.pianist}</div><div><span className="text-[#8A7A6E]">Reader:</span> {calendarPreview.roster.reader}</div></div>) : <p className="text-sm text-[#8A7A6E]">No roster assigned for this week</p>}</div>
                <div className="border rounded-xl p-4"><h3 className="text-sm font-medium mb-2">📅 Events</h3>{calendarPreview.events.length > 0 ? (<div className="space-y-2">{calendarPreview.events.map(event => <div key={event.id} className="text-sm"><span className="font-medium">{event.date}</span><span className="text-[#8A7A6E] mx-2">•</span><span>{event.titleEn}</span></div>)}</div>) : <p className="text-sm text-[#8A7A6E]">No events scheduled this week</p>}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Event Modal (unchanged) */}
      {isEventModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl">
            <div className="flex justify-between items-center mb-5"><h2 className="text-lg sm:text-xl font-serif text-[#2D2926]">{editingEvent ? 'Edit Event' : 'Add Event'}</h2><button onClick={() => setIsEventModalOpen(false)} className="text-[#8A7A6E] hover:text-[#2D2926] text-2xl leading-none">×</button></div>
            <div className="space-y-4">
              <input type="date" value={eventForm.date} onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))} className="w-full px-4 py-2 border rounded-xl text-sm" />
              <input type="text" placeholder="Event Title" value={eventForm.titleEn} onChange={(e) => setEventForm(prev => ({ ...prev, titleEn: e.target.value }))} className="w-full px-4 py-2 border rounded-xl text-sm" />
              <input type="time" value={eventForm.time} onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))} className="w-full px-4 py-2 border rounded-xl text-sm" />
              <input type="text" placeholder="Location (e.g., Main Hall, Room 101)" value={eventForm.location} onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))} className="w-full px-4 py-2 border rounded-xl text-sm" />
              <input type="text" placeholder="Person In Charge (PIC)" value={eventForm.pic} onChange={(e) => setEventForm(prev => ({ ...prev, pic: e.target.value }))} className="w-full px-4 py-2 border rounded-xl text-sm" />
              <textarea placeholder="Description" value={eventForm.descriptionEn} onChange={(e) => setEventForm(prev => ({ ...prev, descriptionEn: e.target.value }))} rows={3} className="w-full px-4 py-2 border rounded-xl text-sm resize-none" />
              <button onClick={handleSaveEvent} className="w-full bg-[#2D2926] text-white py-2 rounded-xl hover:bg-[#433A34] transition">Save Event</button>
            </div>
          </div>
        </div>
      )}

      {/* Roster Edit Modal (unchanged) */}
      {isRosterModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl">
            <div className="flex justify-between items-center mb-5"><h2 className="text-lg sm:text-xl font-serif text-[#2D2926]">Edit Worship Week</h2><button onClick={() => setIsRosterModalOpen(false)} className="text-[#8A7A6E] hover:text-[#2D2926] text-2xl leading-none">×</button></div>
            <div className="space-y-4">
              <input type="text" placeholder="Week Starting (DD/MM/YYYY)" value={rosterForm.weekStart} onChange={(e) => setRosterForm(prev => ({ ...prev, weekStart: e.target.value }))} className="w-full px-4 py-2 border rounded-xl text-sm" />
              <input type="text" placeholder="Worship Leader" value={rosterForm.leader} onChange={(e) => setRosterForm(prev => ({ ...prev, leader: e.target.value }))} className="w-full px-4 py-2 border rounded-xl text-sm" />
              <input type="text" placeholder="Pianist / Keyboardist" value={rosterForm.pianist} onChange={(e) => setRosterForm(prev => ({ ...prev, pianist: e.target.value }))} className="w-full px-4 py-2 border rounded-xl text-sm" />
              <input type="text" placeholder="Scripture Reader" value={rosterForm.reader} onChange={(e) => setRosterForm(prev => ({ ...prev, reader: e.target.value }))} className="w-full px-4 py-2 border rounded-xl text-sm" />
              <button onClick={handleSaveRosterEdit} className="w-full bg-[#2D2926] text-white py-2 rounded-xl hover:bg-[#433A34] transition">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Announcement Add/Edit Modal */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg sm:text-xl font-serif text-[#2D2926]">{editingAnnouncement ? 'Edit Announcement' : 'Add Announcement'}</h2>
              <button onClick={() => setIsAnnouncementModalOpen(false)} className="text-[#8A7A6E] hover:text-[#2D2926] text-2xl leading-none">×</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveAnnouncement(); }} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold uppercase text-[#8B7E72] mb-1">Title (English) *</label><input type="text" required value={announcementForm.title_en} onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title_en: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Special Service" /></div>
                <div><label className="block text-xs font-semibold uppercase text-[#8B7E72] mb-1">Title (Bahasa Malaysia) *</label><input type="text" required value={announcementForm.title_bm} onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title_bm: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Kebaktian Istimewa" /></div>
              </div>
              <div><label className="block text-xs font-semibold uppercase text-[#8B7E72] mb-1">Description (English)</label><textarea rows={2} value={announcementForm.description_en} onChange={(e) => setAnnouncementForm(prev => ({ ...prev, description_en: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm resize-none" placeholder="Join us for a special service..." /></div>
              <div><label className="block text-xs font-semibold uppercase text-[#8B7E72] mb-1">Description (Bahasa Malaysia)</label><textarea rows={2} value={announcementForm.description_bm} onChange={(e) => setAnnouncementForm(prev => ({ ...prev, description_bm: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm resize-none" placeholder="Sertai kami untuk kebaktian istimewa..." /></div>
              <div><label className="block text-xs font-semibold uppercase text-[#8B7E72] mb-1">Image URL</label><input type="url" value={announcementForm.image_url} onChange={(e) => setAnnouncementForm(prev => ({ ...prev, image_url: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="https://example.com/image.jpg" /></div>
              <div><label className="block text-xs font-semibold uppercase text-[#8B7E72] mb-1">Link URL (optional)</label><input type="url" value={announcementForm.link_url} onChange={(e) => setAnnouncementForm(prev => ({ ...prev, link_url: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="https://example.com/event" /></div>
              <div><label className="block text-xs font-semibold uppercase text-[#8B7E72] mb-1">Display Order</label><input type="number" value={announcementForm.display_order} onChange={(e) => setAnnouncementForm(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              <div className="flex items-center gap-3"><label className="flex items-center gap-2"><input type="checkbox" checked={announcementForm.is_active} onChange={(e) => setAnnouncementForm(prev => ({ ...prev, is_active: e.target.checked }))} className="w-4 h-4" /> <span className="text-sm">Active (show on homepage)</span></label></div>
              <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setIsAnnouncementModalOpen(false)} className="px-4 py-2 rounded-xl border border-[#E7E0D7] text-[#5E5247] hover:bg-[#F5F1EB]">Cancel</button><button type="submit" className="px-4 py-2 rounded-xl bg-[#2D2926] text-white hover:bg-[#4A3F38]">Save</button></div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.25s ease-out; }
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  )
}

export default ContentManager