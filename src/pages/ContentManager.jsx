// src/pages/ContentManager.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  LogOut,
  BookOpen,
  CalendarDays,
  Music,
  History,
  Save,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  Search,
  X
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
  const [isVerseLibraryOpen, setIsVerseLibraryOpen] = useState(false)
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)
  
  // Verse Library State
  const [verseLibrary, setVerseLibrary] = useState([])
  const [verseSearchTerm, setVerseSearchTerm] = useState('')
  const [newVerseForm, setNewVerseForm] = useState({ reference: '', text: '', theme: '' })
  const [activeVerse, setActiveVerseState] = useState({
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

  // Modal States
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [eventForm, setEventForm] = useState({ date: '', titleEn: '', time: '', descriptionEn: '' })

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

  // Helper: Format time for input (12-hour to 24-hour if needed, but input uses 24-hour)
  const formatTimeForInput = (timeStr) => {
    if (!timeStr) return ''
    // If already in 24-hour format (e.g., "14:30"), return as is
    if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr
    // If in 12-hour format (e.g., "2:30 PM"), convert to 24-hour
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
      loadRoster()
    ])
    setIsLoading(false)
  }

  const loadVerseLibrary = async () => {
    const { data, error } = await supabase
      .from('verse_library')
      .select('*')
      .order('used_count', { ascending: false })
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
        descriptionEn: event.description_en
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

  const showSaved = (message) => {
    setSavedMessage(message)
    setTimeout(() => setSavedMessage(null), 2200)
  }

  // ─── Verse Library Functions ────────────────────────────────────────────────
  const saveNewVerseToLibrary = async () => {
    if (!newVerseForm.reference || !newVerseForm.text) {
      showSaved('Please fill in reference and verse text')
      return
    }

    // Check if verse already exists
    const { data: existing } = await supabase
      .from('verse_library')
      .select('id')
      .eq('reference', newVerseForm.reference)
      .maybeSingle()

    if (existing) {
      showSaved('Verse with this reference already exists')
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
      loadVerseLibrary()
    } else {
      showSaved('Error saving verse')
    }
  }

  const setActiveVerse = async (verseId) => {
    // Mark all as inactive
    await supabase
      .from('verse_library')
      .update({ is_active: false })
      .eq('is_active', true)

    // Mark selected as active
    const { error } = await supabase
      .from('verse_library')
      .update({ is_active: true })
      .eq('id', verseId)

    if (!error) {
      showSaved('Verse activated for homepage')
      loadActiveVerse()
      setIsVerseLibraryOpen(false)
    }
  }

  // ─── Event Functions ────────────────────────────────────────────────────────
  const handleAddEvent = () => {
    setEditingEvent(null)
    setEventForm({ date: '', titleEn: '', time: '', descriptionEn: '' })
    setIsEventModalOpen(true)
  }

  const handleEditEvent = (event) => {
    setEditingEvent(event)
    setEventForm({
      date: event.date,
      titleEn: event.titleEn,
      time: formatTimeForInput(event.time),
      descriptionEn: event.descriptionEn || ''
    })
    setIsEventModalOpen(true)
  }

  const handleSaveEvent = async () => {
    if (editingEvent) {
      // Update existing event
      const { error } = await supabase
        .from('events')
        .update({
          date: eventForm.date,
          title_en: eventForm.titleEn,
          time: eventForm.time,
          description_en: eventForm.descriptionEn
        })
        .eq('id', editingEvent.id)

      if (!error) {
        showSaved('Event updated')
      }
    } else {
      // Insert new event
      const { error } = await supabase
        .from('events')
        .insert({
          date: eventForm.date,
          title_en: eventForm.titleEn,
          time: eventForm.time,
          description_en: eventForm.descriptionEn
        })

      if (!error) {
        showSaved('Event added')
      }
    }

    setIsEventModalOpen(false)
    loadEvents()
  }

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Delete this event?')) {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)

      if (!error) {
        showSaved('Event deleted')
        loadEvents()
      } else {
        showSaved('Error deleting event')
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
    } else {
      showSaved('Error updating roster')
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
    } else {
      showSaved('Error updating roster')
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
    if (isCalendarModalOpen) {
      loadCalendarPreview()
    }
  }, [selectedMonth, selectedYear, selectedWeek, isCalendarModalOpen, activeVerse, events, roster])

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const tabs = [
    { id: 'verse', label: 'Weekly Verse', icon: BookOpen },
    { id: 'events', label: 'Events', icon: CalendarDays },
    { id: 'roster', label: 'Worship Roster', icon: Music }
  ]

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
          <div className="bg-[#2D2926] text-white px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl shadow-xl text-sm animate-fade-in">
            {savedMessage}
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
        
        {/* Verse Tab */}
        {activeTab === 'verse' && (
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-5 sm:gap-6">
            {/* Editor */}
            <div className="bg-white border border-[#E7E0D7] rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                <div>
                  <h2 className="text-lg sm:text-xl font-serif text-[#2D2926]">Weekly Scripture</h2>
                  <p className="text-xs sm:text-sm text-[#8B7E72] mt-0.5 sm:mt-1">The verse shown on the homepage</p>
                </div>
                <button
                  onClick={() => {
                    loadVerseLibrary()
                    setIsVerseLibraryOpen(true)
                  }}
                  className="flex items-center justify-center gap-2 h-9 sm:h-10 px-3 sm:px-4 rounded-xl border border-[#E7E0D7] text-xs sm:text-sm text-[#5E5247] hover:bg-[#F5F1EB] transition"
                >
                  <BookOpen size={15} />
                  Change Verse
                </button>
              </div>
              
              {/* Current Verse Display */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#5E5247] mb-2">Reference</label>
                  <div className="w-full h-11 sm:h-12 px-4 rounded-2xl border border-[#E7E0D7] bg-[#FCFBF9] flex items-center text-[#2D2926] text-sm">
                    {activeVerse.reference}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5E5247] mb-2">Verse Text</label>
                  <div className="w-full px-4 py-3 rounded-2xl border border-[#E7E0D7] bg-[#FCFBF9] text-[#2D2926] text-sm leading-relaxed">
                    {activeVerse.text}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5E5247] mb-2">Theme</label>
                  <div className="w-full h-11 sm:h-12 px-4 rounded-2xl border border-[#E7E0D7] bg-[#FCFBF9] flex items-center text-[#2D2926] text-sm">
                    {activeVerse.theme || '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-[#2D2926] rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 sm:w-48 sm:h-48 bg-white/5 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4 sm:mb-6">
                  <BookOpen size={20} />
                </div>
                <p className="text-[10px] sm:text-sm uppercase tracking-[0.2em] text-white/60 mb-4 sm:mb-6">Weekly Verse</p>
                <p className="text-lg sm:text-2xl leading-relaxed font-serif">"{activeVerse.text}"</p>
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10">
                  <p className="text-base sm:text-lg font-medium">{activeVerse.reference}</p>
                  <p className="text-xs sm:text-sm text-white/60 mt-1">{activeVerse.theme}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-4 sm:space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-serif text-[#2D2926]">Upcoming Events</h2>
                <p className="text-xs sm:text-sm text-[#8B7E72] mt-0.5 sm:mt-1">Manage public-facing church events</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={handleAddEvent}
                  className="flex items-center justify-center gap-2 h-10 sm:h-11 px-4 sm:px-5 rounded-2xl border border-[#E7E0D7] bg-white hover:bg-[#F5F1EB] transition"
                >
                  <Plus size={15} />
                  <span className="hidden sm:inline">Add Event</span>
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:gap-4">
              {events.length === 0 ? (
                <div className="bg-white border border-[#E7E0D7] rounded-2xl p-8 text-center text-[#8A7A6E]">
                  No upcoming events. Click "Add Event" to create one.
                </div>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="bg-white border border-[#E7E0D7] rounded-2xl sm:rounded-3xl p-4 sm:p-6 hover:shadow-md transition">
                    <div className="flex justify-between gap-4 sm:gap-6">
                      <div className="flex gap-3 sm:gap-5 flex-1">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#F5F1EB] flex flex-col items-center justify-center">
                          <span className="text-[10px] sm:text-xs text-[#8B7E72]">
                            {new Date(event.date).toLocaleString('default', { month: 'short' })}
                          </span>
                          <span className="text-lg sm:text-xl font-semibold text-[#2D2926] leading-none mt-1">
                            {new Date(event.date).getDate()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                            <h3 className="text-base sm:text-lg font-medium text-[#2D2926]">{event.titleEn}</h3>
                            <ChevronRight size={14} className="text-[#B7A89A]" />
                          </div>
                          <p className="text-xs sm:text-sm text-[#8B7E72] mb-2 sm:mb-3">{formatTimeForDisplay(event.time)}</p>
                          <p className="text-xs sm:text-sm text-[#5E5247] leading-relaxed">{event.descriptionEn}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-1 sm:gap-2">
                        <button onClick={() => handleEditEvent(event)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl border border-[#E7E0D7] flex items-center justify-center hover:bg-[#F5F1EB] transition">
                          <Pencil size={13} className="text-[#5E5247]" />
                        </button>
                        <button onClick={() => handleDeleteEvent(event.id)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl border border-[#E7E0D7] flex items-center justify-center hover:bg-red-50 transition">
                          <Trash2 size={13} className="text-[#B07C68]" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Roster Tab */}
        {activeTab === 'roster' && (
          <div className="space-y-4 sm:space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-serif text-[#2D2926]">Worship Roster</h2>
                <p className="text-xs sm:text-sm text-[#8B7E72] mt-0.5 sm:mt-1">Weekly ministry scheduling overview</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
              {roster.map((week) => (
                <div key={week.id} className="bg-white border border-[#E7E0D7] rounded-2xl sm:rounded-3xl p-4 sm:p-6 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-4 sm:mb-6">
                    <div>
                      <p className="text-[10px] sm:text-xs uppercase tracking-[0.15em] text-[#A39284] mb-1 sm:mb-2">Worship Week</p>
                      <h3 className="text-base sm:text-lg font-medium text-[#2D2926]">{week.weekStart}</h3>
                    </div>
                    <div className="flex gap-1 sm:gap-2">
                      <button
                        onClick={() => saveRosterWeek(week)}
                        className="flex items-center justify-center gap-1 h-8 sm:h-9 px-2 sm:px-3 rounded-xl border border-[#E7E0D7] bg-white hover:bg-[#F5F1EB] transition text-xs"
                      >
                        <Save size={12} />
                        <span className="hidden sm:inline">Save</span>
                      </button>
                      <button
                        onClick={() => handleEditRoster(week)}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-[#E7E0D7] flex items-center justify-center hover:bg-[#F5F1EB] transition"
                      >
                        <Pencil size={13} className="text-[#5E5247]" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between py-2 sm:py-3 border-b border-[#F0EAE2]">
                      <span className="text-xs sm:text-sm text-[#8B7E72]">Worship Leader</span>
                      <span className="text-xs sm:text-sm font-medium text-[#2D2926]">{week.leader}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 sm:py-3 border-b border-[#F0EAE2]">
                      <span className="text-xs sm:text-sm text-[#8B7E72]">Pianist</span>
                      <span className="text-xs sm:text-sm font-medium text-[#2D2926]">{week.pianist}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 sm:py-3">
                      <span className="text-xs sm:text-sm text-[#8B7E72]">Scripture Reader</span>
                      <span className="text-xs sm:text-sm font-medium text-[#2D2926]">{week.reader}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Verse Library Modal */}
      {isVerseLibraryOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-serif text-[#2D2926]">Verse Library</h2>
              <button onClick={() => setIsVerseLibraryOpen(false)} className="text-[#8A7A6E] hover:text-[#2D2926] text-2xl leading-none">×</button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search by reference or text..."
                value={verseSearchTerm}
                onChange={(e) => setVerseSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-9 rounded-xl border border-[#EAE1D4] text-sm"
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A7A6E]" />
              {verseSearchTerm && (
                <button onClick={() => setVerseSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X size={16} className="text-[#8A7A6E]" />
                </button>
              )}
            </div>

            {/* Saved Verses List */}
            <div className="space-y-2 max-h-64 overflow-y-auto mb-6">
              {verseLibrary.filter(v => 
                v.reference.toLowerCase().includes(verseSearchTerm.toLowerCase()) ||
                v.text.toLowerCase().includes(verseSearchTerm.toLowerCase())
              ).length === 0 ? (
                <p className="text-center text-[#8A7A6E] py-4">No verses found</p>
              ) : (
                verseLibrary.filter(v => 
                  v.reference.toLowerCase().includes(verseSearchTerm.toLowerCase()) ||
                  v.text.toLowerCase().includes(verseSearchTerm.toLowerCase())
                ).map(verse => (
                  <div key={verse.id} className={`border rounded-xl p-3 flex justify-between items-center ${verse.is_active ? 'bg-[#F5EFE6] border-[#C4A88B]' : 'border-[#EAE1D4]'}`}>
                    <div className="flex-1">
                      <p className="font-medium text-[#2D2926]">{verse.reference}</p>
                      <p className="text-sm text-[#7A6A5E] line-clamp-1">{verse.text}</p>
                      {verse.theme && <p className="text-xs text-[#B0A49A] mt-1">{verse.theme}</p>}
                    </div>
                    {verse.is_active ? (
                      <span className="text-xs bg-[#2D2926] text-white px-2 py-1 rounded-full">Active</span>
                    ) : (
                      <button onClick={() => setActiveVerse(verse.id)} className="text-sm border border-[#EAE1D4] px-3 py-1 rounded-full hover:bg-[#F5EFE6]">Use</button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Add New Verse */}
            <div className="border-t border-[#EAE1D4] pt-4">
              <h3 className="text-sm font-medium text-[#2D2926] mb-3">Add New Verse</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Reference (e.g., Matthew 11:28)"
                  value={newVerseForm.reference}
                  onChange={(e) => setNewVerseForm(prev => ({ ...prev, reference: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
                <textarea
                  placeholder="Verse text"
                  rows={2}
                  value={newVerseForm.text}
                  onChange={(e) => setNewVerseForm(prev => ({ ...prev, text: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
                <input
                  type="text"
                  placeholder="Theme (optional)"
                  value={newVerseForm.theme}
                  onChange={(e) => setNewVerseForm(prev => ({ ...prev, theme: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
                <button onClick={saveNewVerseToLibrary} className="w-full bg-[#2D2926] text-white py-2 rounded-lg text-sm hover:bg-[#4A3F38]">
                  Save to Library
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      {isCalendarModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg sm:text-xl font-serif text-[#2D2926]">Content Calendar</h2>
              <button onClick={() => setIsCalendarModalOpen(false)} className="text-[#8A7A6E] hover:text-[#2D2926] text-2xl leading-none">×</button>
            </div>
            <div className="bg-[#F5EFE6] rounded-xl p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2">
                  <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="px-3 py-2 border border-[#EAE1D4] rounded-lg text-sm bg-white">
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, idx) => (
                      <option key={idx} value={idx}>{month}</option>
                    ))}
                  </select>
                  <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="px-3 py-2 border border-[#EAE1D4] rounded-lg text-sm bg-white">
                    {[2025, 2026, 2027].map(year => <option key={year} value={year}>{year}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(week => (
                    <button
                      key={week}
                      onClick={() => setSelectedWeek(week)}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full text-sm font-medium transition ${
                        selectedWeek === week
                          ? 'bg-[#2D2926] text-white'
                          : 'border border-[#EAE1D4] text-[#7A6A5E] hover:bg-[#F5EFE6]'
                      }`}
                    >
                      {week}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={loadCalendarPreview} className="w-full mt-4 bg-[#2D2926] text-white py-2 rounded-lg text-sm hover:bg-[#4A3F38] transition">Load Week {selectedWeek}</button>
            </div>
            {calendarPreview && (
              <div className="space-y-5">
                <div className="text-center">
                  <p className="text-sm font-medium text-[#2D2926]">{calendarPreview.weekRange}</p>
                </div>
                <div className="border rounded-xl p-4">
                  <h3 className="text-sm font-medium mb-2">📖 Weekly Verse</h3>
                  <p className="font-serif">{calendarPreview.verse.reference}</p>
                  <p className="text-sm text-[#7A6A5E] mt-1">{calendarPreview.verse.text.substring(0, 100)}...</p>
                </div>
                <div className="border rounded-xl p-4">
                  <h3 className="text-sm font-medium mb-2">🎵 Worship Roster</h3>
                  {calendarPreview.roster ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                      <div><span className="text-[#8A7A6E]">Leader:</span> {calendarPreview.roster.leader}</div>
                      <div><span className="text-[#8A7A6E]">Pianist:</span> {calendarPreview.roster.pianist}</div>
                      <div><span className="text-[#8A7A6E]">Reader:</span> {calendarPreview.roster.reader}</div>
                    </div>
                  ) : (
                    <p className="text-sm text-[#8A7A6E]">No roster assigned for this week</p>
                  )}
                </div>
                <div className="border rounded-xl p-4">
                  <h3 className="text-sm font-medium mb-2">📅 Events</h3>
                  {calendarPreview.events.length > 0 ? (
                    <div className="space-y-2">
                      {calendarPreview.events.map(event => (
                        <div key={event.id} className="text-sm">
                          <span className="font-medium">{event.date}</span>
                          <span className="text-[#8A7A6E] mx-2">•</span>
                          <span>{event.titleEn}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#8A7A6E]">No events scheduled this week</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Event Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg sm:text-xl font-serif text-[#2D2926]">{editingEvent ? 'Edit Event' : 'Add Event'}</h2>
              <button onClick={() => setIsEventModalOpen(false)} className="text-[#8A7A6E] hover:text-[#2D2926] text-2xl leading-none">×</button>
            </div>
            <div className="space-y-4">
              <input 
                type="date" 
                value={eventForm.date} 
                onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))} 
                className="w-full px-4 py-2 border rounded-xl text-sm" 
              />
              <input 
                type="text" 
                placeholder="Event Title" 
                value={eventForm.titleEn} 
                onChange={(e) => setEventForm(prev => ({ ...prev, titleEn: e.target.value }))} 
                className="w-full px-4 py-2 border rounded-xl text-sm" 
              />
              <input 
                type="time" 
                value={eventForm.time} 
                onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))} 
                className="w-full px-4 py-2 border rounded-xl text-sm" 
              />
              <textarea 
                placeholder="Description" 
                value={eventForm.descriptionEn} 
                onChange={(e) => setEventForm(prev => ({ ...prev, descriptionEn: e.target.value }))} 
                rows={3} 
                className="w-full px-4 py-2 border rounded-xl text-sm resize-none" 
              />
              <button onClick={handleSaveEvent} className="w-full bg-[#2D2926] text-white py-2 rounded-xl hover:bg-[#433A34] transition">Save Event</button>
            </div>
          </div>
        </div>
      )}

      {/* Roster Edit Modal */}
      {isRosterModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg sm:text-xl font-serif text-[#2D2926]">Edit Worship Week</h2>
              <button onClick={() => setIsRosterModalOpen(false)} className="text-[#8A7A6E] hover:text-[#2D2926] text-2xl leading-none">×</button>
            </div>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Week Starting (DD/MM/YYYY)" 
                value={rosterForm.weekStart} 
                onChange={(e) => setRosterForm(prev => ({ ...prev, weekStart: e.target.value }))} 
                className="w-full px-4 py-2 border rounded-xl text-sm" 
              />
              <input 
                type="text" 
                placeholder="Worship Leader" 
                value={rosterForm.leader} 
                onChange={(e) => setRosterForm(prev => ({ ...prev, leader: e.target.value }))} 
                className="w-full px-4 py-2 border rounded-xl text-sm" 
              />
              <input 
                type="text" 
                placeholder="Pianist / Keyboardist" 
                value={rosterForm.pianist} 
                onChange={(e) => setRosterForm(prev => ({ ...prev, pianist: e.target.value }))} 
                className="w-full px-4 py-2 border rounded-xl text-sm" 
              />
              <input 
                type="text" 
                placeholder="Scripture Reader" 
                value={rosterForm.reader} 
                onChange={(e) => setRosterForm(prev => ({ ...prev, reader: e.target.value }))} 
                className="w-full px-4 py-2 border rounded-xl text-sm" 
              />
              <button onClick={handleSaveRosterEdit} className="w-full bg-[#2D2926] text-white py-2 rounded-xl hover:bg-[#433A34] transition">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.25s ease-out; }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}

export default ContentManager