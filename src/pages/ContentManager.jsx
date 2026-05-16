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
  ChevronRight
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function ContentManager() {
  const navigate = useNavigate()
  const { signOut } = useAuth()  // ✅ Called inside component

  // UI State
  const [activeTab, setActiveTab] = useState('verse')
  const [savedMessage, setSavedMessage] = useState(null)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)
  const [historyType, setHistoryType] = useState(null)
  const [verseHistory, setVerseHistory] = useState([])
  const [rosterHistory, setRosterHistory] = useState([])

  // Calendar State
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [calendarPreview, setCalendarPreview] = useState(null)

  // Content State
  const [verse, setVerse] = useState({
    reference: 'Matthew 11:28',
    text: 'Come to me, all you who are weary and burdened, and I will give you rest.',
    theme: 'Rest and Peace'
  })

  const [events, setEvents] = useState([
    { id: 1, date: '2026-06-01', titleEn: 'Communion Sunday', time: '9:00 AM', descriptionEn: 'Join us for Holy Communion' },
    { id: 2, date: '2026-06-04', titleEn: 'Midweek Prayer', time: '7:30 PM', descriptionEn: 'Prayer and worship gathering' },
    { id: 3, date: '2026-06-15', titleEn: 'Youth Sunday', time: '11:00 AM', descriptionEn: 'Youth-led service' }
  ])

  const [roster, setRoster] = useState([
    { id: 1, weekStart: '01/06/2026', leader: 'John Tan', pianist: 'Mary Wong', reader: 'David Lim' },
    { id: 2, weekStart: '08/06/2026', leader: 'Sarah Ong', pianist: 'Peter Chin', reader: 'Esther Lee' },
    { id: 3, weekStart: '15/06/2026', leader: 'Daniel Koh', pianist: 'Rachel Tee', reader: 'Samuel Ng' },
    { id: 4, weekStart: '22/06/2026', leader: 'Grace Tan', pianist: 'Michael Wong', reader: 'Hannah Chua' }
  ])

  // Modal States
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [eventForm, setEventForm] = useState({ date: '', titleEn: '', time: '', descriptionEn: '' })

  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false)
  const [editingRosterWeek, setEditingRosterWeek] = useState(null)
  const [rosterForm, setRosterForm] = useState({ weekStart: '', leader: '', pianist: '', reader: '' })

  // Load data
  useEffect(() => {
    const storedVerse = localStorage.getItem('churchVerse')
    const storedEvents = localStorage.getItem('churchEvents')
    const storedRoster = localStorage.getItem('churchRoster')
    const storedVerseHistory = localStorage.getItem('churchVerseHistory')
    const storedRosterHistory = localStorage.getItem('churchRosterHistory')

    if (storedVerse) setVerse(JSON.parse(storedVerse))
    if (storedEvents) setEvents(JSON.parse(storedEvents))
    if (storedRoster) setRoster(JSON.parse(storedRoster))
    if (storedVerseHistory) setVerseHistory(JSON.parse(storedVerseHistory))
    if (storedRosterHistory) setRosterHistory(JSON.parse(storedRosterHistory))
  }, [])

  const showSaved = (message) => {
    setSavedMessage(message)
    setTimeout(() => setSavedMessage(null), 2200)
  }

  // Verse
  const saveVerse = () => {
    localStorage.setItem('churchVerse', JSON.stringify(verse))
    const historyEntry = {
      id: Date.now(),
      savedAt: new Date().toISOString(),
      reference: verse.reference,
      text: verse.text,
      theme: verse.theme
    }
    const newHistory = [historyEntry, ...verseHistory].slice(0, 50)
    setVerseHistory(newHistory)
    localStorage.setItem('churchVerseHistory', JSON.stringify(newHistory))
    showSaved('Verse updated')
  }

  const restoreVerse = (entry) => {
    setVerse({
      reference: entry.reference,
      text: entry.text,
      theme: entry.theme
    })
    localStorage.setItem('churchVerse', JSON.stringify({
      reference: entry.reference,
      text: entry.text,
      theme: entry.theme
    }))
    showSaved('Restored from history')
    setIsHistoryModalOpen(false)
  }

  // Events
  const saveEvents = () => {
    localStorage.setItem('churchEvents', JSON.stringify(events))
    showSaved('Events updated')
  }

  const handleAddEvent = () => {
    setEditingEvent(null)
    setEventForm({ date: '', titleEn: '', time: '', descriptionEn: '' })
    setIsEventModalOpen(true)
  }

  const handleEditEvent = (event) => {
    setEditingEvent(event)
    setEventForm(event)
    setIsEventModalOpen(true)
  }

  const handleSaveEvent = () => {
    let newEvents
    if (editingEvent) {
      newEvents = events.map(e => e.id === editingEvent.id ? { ...eventForm, id: editingEvent.id } : e)
    } else {
      newEvents = [...events, { ...eventForm, id: Date.now() }]
    }
    setEvents(newEvents)
    setIsEventModalOpen(false)
    showSaved('Event saved')
  }

  const handleDeleteEvent = (id) => {
    if (window.confirm('Delete this event?')) {
      setEvents(prev => prev.filter(e => e.id !== id))
      showSaved('Event deleted')
    }
  }

  // Roster
  const saveRosterWeek = (week) => {
    const updatedRoster = roster.map(w => w.id === week.id ? week : w)
    setRoster(updatedRoster)
    localStorage.setItem('churchRoster', JSON.stringify(updatedRoster))
    const historyEntry = {
      id: Date.now(),
      savedAt: new Date().toISOString(),
      weekStart: week.weekStart,
      leader: week.leader,
      pianist: week.pianist,
      reader: week.reader
    }
    const newHistory = [historyEntry, ...rosterHistory].slice(0, 100)
    setRosterHistory(newHistory)
    localStorage.setItem('churchRosterHistory', JSON.stringify(newHistory))
    showSaved('Roster week saved')
  }

  const handleEditRoster = (week) => {
    setEditingRosterWeek(week)
    setRosterForm(week)
    setIsRosterModalOpen(true)
  }

  const handleSaveRosterEdit = () => {
    const updatedWeek = { ...rosterForm, id: editingRosterWeek.id }
    const updatedRoster = roster.map(w => w.id === editingRosterWeek.id ? updatedWeek : w)
    setRoster(updatedRoster)
    localStorage.setItem('churchRoster', JSON.stringify(updatedRoster))
    const historyEntry = {
      id: Date.now(),
      savedAt: new Date().toISOString(),
      weekStart: updatedWeek.weekStart,
      leader: updatedWeek.leader,
      pianist: updatedWeek.pianist,
      reader: updatedWeek.reader
    }
    const newHistory = [historyEntry, ...rosterHistory].slice(0, 100)
    setRosterHistory(newHistory)
    localStorage.setItem('churchRosterHistory', JSON.stringify(newHistory))
    setIsRosterModalOpen(false)
    showSaved('Roster week updated')
  }

  const restoreRoster = (entry) => {
    const updatedRoster = roster.map(w =>
      w.weekStart === entry.weekStart
        ? { ...w, leader: entry.leader, pianist: entry.pianist, reader: entry.reader }
        : w
    )
    setRoster(updatedRoster)
    localStorage.setItem('churchRoster', JSON.stringify(updatedRoster))
    showSaved('Restored from history')
    setIsHistoryModalOpen(false)
  }

  // Calendar
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
      verse,
      roster: weekRoster || null,
      events: weekEvents
    })
  }

  useEffect(() => {
    if (isCalendarModalOpen) {
      loadCalendarPreview()
    }
  }, [selectedMonth, selectedYear, selectedWeek, isCalendarModalOpen])

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const tabs = [
    { id: 'verse', label: 'Weekly Verse', icon: BookOpen },
    { id: 'events', label: 'Events', icon: CalendarDays },
    { id: 'roster', label: 'Worship Roster', icon: Music }
  ]

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
            <div className="bg-white border border-[#E7E0D7] rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                <div>
                  <h2 className="text-lg sm:text-xl font-serif text-[#2D2926]">Weekly Scripture</h2>
                  <p className="text-xs sm:text-sm text-[#8B7E72] mt-0.5 sm:mt-1">Update the homepage scripture section</p>
                </div>
                <button
                  onClick={() => { setHistoryType('verse'); setIsHistoryModalOpen(true); }}
                  className="flex items-center justify-center gap-2 h-9 sm:h-10 px-3 sm:px-4 rounded-xl border border-[#E7E0D7] text-xs sm:text-sm text-[#5E5247] hover:bg-[#F5F1EB] transition"
                >
                  <History size={15} />
                  <span className="hidden sm:inline">History</span>
                </button>
              </div>
              <div className="space-y-5 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#5E5247] mb-2">Scripture Reference</label>
                  <input
                    type="text"
                    value={verse.reference}
                    onChange={(e) => setVerse(prev => ({ ...prev, reference: e.target.value }))}
                    className="w-full h-11 sm:h-12 px-4 rounded-2xl border border-[#E7E0D7] bg-[#FCFBF9] focus:outline-none focus:ring-2 focus:ring-[#D7C7B4] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5E5247] mb-2">Verse Text</label>
                  <textarea
                    rows={5}
                    value={verse.text}
                    onChange={(e) => setVerse(prev => ({ ...prev, text: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl border border-[#E7E0D7] bg-[#FCFBF9] focus:outline-none focus:ring-2 focus:ring-[#D7C7B4] resize-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5E5247] mb-2">Theme</label>
                  <input
                    type="text"
                    value={verse.theme}
                    onChange={(e) => setVerse(prev => ({ ...prev, theme: e.target.value }))}
                    className="w-full h-11 sm:h-12 px-4 rounded-2xl border border-[#E7E0D7] bg-[#FCFBF9] focus:outline-none focus:ring-2 focus:ring-[#D7C7B4] text-sm"
                  />
                </div>
                <button
                  onClick={saveVerse}
                  className="flex items-center justify-center gap-2 h-11 sm:h-12 px-5 sm:px-6 rounded-2xl bg-[#2D2926] hover:bg-[#433A34] text-white transition w-full sm:w-auto"
                >
                  <Save size={16} />
                  Save Scripture
                </button>
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
                <p className="text-lg sm:text-2xl leading-relaxed font-serif">"{verse.text}"</p>
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10">
                  <p className="text-base sm:text-lg font-medium">{verse.reference}</p>
                  <p className="text-xs sm:text-sm text-white/60 mt-1">{verse.theme}</p>
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
                  onClick={saveEvents}
                  className="flex items-center justify-center gap-2 h-10 sm:h-11 px-4 sm:px-5 rounded-2xl bg-[#2D2926] text-white hover:bg-[#433A34] transition"
                >
                  <Save size={15} />
                  <span className="hidden sm:inline">Save All</span>
                </button>
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
              {events.map((event) => (
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
                        <p className="text-xs sm:text-sm text-[#8B7E72] mb-2 sm:mb-3">{event.time}</p>
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
              ))}
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
              <button
                onClick={() => { setHistoryType('roster'); setIsHistoryModalOpen(true); }}
                className="flex items-center justify-center gap-2 h-10 sm:h-11 px-4 sm:px-5 rounded-2xl border border-[#E7E0D7] bg-white hover:bg-[#F5F1EB] transition"
              >
                <History size={15} />
                <span className="hidden sm:inline">View History</span>
              </button>
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

      {/* History Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg sm:text-xl font-serif text-[#2D2926]">
                {historyType === 'verse' ? 'Verse History' : 'Roster History'}
              </h2>
              <button onClick={() => setIsHistoryModalOpen(false)} className="text-[#8A7A6E] hover:text-[#2D2926] text-2xl leading-none">×</button>
            </div>
            {historyType === 'verse' && verseHistory.length === 0 && (
              <p className="text-center text-[#8A7A6E] py-8">No saved versions yet. Save a verse to see history.</p>
            )}
            {historyType === 'verse' && verseHistory.length > 0 && (
              <div className="space-y-3">
                {verseHistory.map(entry => (
                  <div key={entry.id} className="border border-[#EAE1D4] rounded-xl p-4 hover:bg-[#FAF8F5] transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-xs text-[#8A7A6E] mb-1">{new Date(entry.savedAt).toLocaleString()}</p>
                        <p className="font-medium text-[#2D2926]">{entry.reference}</p>
                        <p className="text-sm text-[#7A6A5E] mt-1">{entry.text.substring(0, 100)}...</p>
                      </div>
                      <button onClick={() => restoreVerse(entry)} className="bg-[#2D2926] text-white px-3 py-1 rounded-full text-xs hover:bg-[#4A3F38] transition">Restore</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {historyType === 'roster' && rosterHistory.length === 0 && (
              <p className="text-center text-[#8A7A6E] py-8">No saved versions yet. Save a roster week to see history.</p>
            )}
            {historyType === 'roster' && rosterHistory.length > 0 && (
              <div className="space-y-3">
                {rosterHistory.map(entry => (
                  <div key={entry.id} className="border border-[#EAE1D4] rounded-xl p-4 hover:bg-[#FAF8F5] transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-xs text-[#8A7A6E] mb-1">{new Date(entry.savedAt).toLocaleString()}</p>
                        <p className="font-medium text-[#2D2926]">Week of {entry.weekStart}</p>
                        <div className="grid grid-cols-3 gap-2 mt-2 text-xs sm:text-sm">
                          <div><span className="text-[#8A7A6E]">Leader:</span> {entry.leader}</div>
                          <div><span className="text-[#8A7A6E]">Pianist:</span> {entry.pianist}</div>
                          <div><span className="text-[#8A7A6E]">Reader:</span> {entry.reader}</div>
                        </div>
                      </div>
                      <button onClick={() => restoreRoster(entry)} className="bg-[#2D2926] text-white px-3 py-1 rounded-full text-xs hover:bg-[#4A3F38] transition">Restore</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              <input type="date" value={eventForm.date} onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))} className="w-full px-4 py-2 border rounded-xl text-sm" />
              <input type="text" placeholder="Event Title" value={eventForm.titleEn} onChange={(e) => setEventForm(prev => ({ ...prev, titleEn: e.target.value }))} className="w-full px-4 py-2 border rounded-xl text-sm" />
              <input type="text" placeholder="Time (e.g., 9:00 AM)" value={eventForm.time} onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))} className="w-full px-4 py-2 border rounded-xl text-sm" />
              <textarea placeholder="Description" value={eventForm.descriptionEn} onChange={(e) => setEventForm(prev => ({ ...prev, descriptionEn: e.target.value }))} rows={3} className="w-full px-4 py-2 border rounded-xl text-sm resize-none" />
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
              <input type="text" placeholder="Week Starting (DD/MM/YYYY)" value={rosterForm.weekStart} onChange={(e) => setRosterForm(prev => ({ ...prev, weekStart: e.target.value }))} className="w-full px-4 py-2 border rounded-xl text-sm" />
              <input type="text" placeholder="Worship Leader" value={rosterForm.leader} onChange={(e) => setRosterForm(prev => ({ ...prev, leader: e.target.value }))} className="w-full px-4 py-2 border rounded-xl text-sm" />
              <input type="text" placeholder="Pianist / Keyboardist" value={rosterForm.pianist} onChange={(e) => setRosterForm(prev => ({ ...prev, pianist: e.target.value }))} className="w-full px-4 py-2 border rounded-xl text-sm" />
              <input type="text" placeholder="Scripture Reader" value={rosterForm.reader} onChange={(e) => setRosterForm(prev => ({ ...prev, reader: e.target.value }))} className="w-full px-4 py-2 border rounded-xl text-sm" />
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
      `}</style>
    </div>
  )
}

export default ContentManager