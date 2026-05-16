// src/pages/ContentManager.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function ContentManager() {
  const navigate = useNavigate()
  
  // ── UI State
  const [activeTab, setActiveTab] = useState('verse')
  const [savedMessage, setSavedMessage] = useState(null)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)
  const [historyType, setHistoryType] = useState(null) // 'verse' or 'roster'
  const [verseHistory, setVerseHistory] = useState([])
  const [rosterHistory, setRosterHistory] = useState([])
  
  // Calendar State
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [calendarPreview, setCalendarPreview] = useState(null)
  
  // ── Content State
  const [verse, setVerse] = useState({
    reference: 'Matthew 11:28',
    text: 'Come to me, all you who are weary and burdened, and I will give you rest.',
    theme: 'Rest and Peace'
  })
  
  const [events, setEvents] = useState([
    { id: 1, date: '2026-06-01', day: 'Sunday', titleEn: 'Communion Sunday', titleBm: 'Hari Perjamuan Kudus', time: '9:00 AM', descriptionEn: 'Join us for Holy Communion', descriptionBm: 'Sertai kami untuk Perjamuan Kudus' },
    { id: 2, date: '2026-06-04', day: 'Wednesday', titleEn: 'Midweek Prayer', titleBm: 'Doa Pertengahan Minggu', time: '7:30 PM', descriptionEn: 'Prayer and worship gathering', descriptionBm: 'Perhimpunan doa dan penyembahan' },
    { id: 3, date: '2026-06-15', day: 'Sunday', titleEn: 'Youth Sunday', titleBm: 'Hari Belia', time: '11:00 AM', descriptionEn: 'Youth-led service', descriptionBm: 'Kebaktian yang dipimpin belia' }
  ])
  
  const [roster, setRoster] = useState([
    { id: 1, date: '2026-06-01', weekStart: '01/06/2026', leader: 'John Tan', pianist: 'Mary Wong', reader: 'David Lim' },
    { id: 2, date: '2026-06-08', weekStart: '08/06/2026', leader: 'Sarah Ong', pianist: 'Peter Chin', reader: 'Esther Lee' },
    { id: 3, date: '2026-06-15', weekStart: '15/06/2026', leader: 'Daniel Koh', pianist: 'Rachel Tee', reader: 'Samuel Ng' },
    { id: 4, date: '2026-06-22', weekStart: '22/06/2026', leader: 'Grace Tan', pianist: 'Michael Wong', reader: 'Hannah Chua' }
  ])
  
  // ── Modal States
  const [editingEvent, setEditingEvent] = useState(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [eventForm, setEventForm] = useState({
    date: '', day: '', titleEn: '', titleBm: '', time: '', descriptionEn: '', descriptionBm: ''
  })
  
  const [editingRoster, setEditingRoster] = useState(null)
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false)
  const [rosterForm, setRosterForm] = useState({
    weekStart: '', leader: '', pianist: '', reader: ''
  })

  // ── Load data from localStorage on mount
  useEffect(() => {
    // Load content
    const storedVerse = localStorage.getItem('churchVerse')
    if (storedVerse) setVerse(JSON.parse(storedVerse))
    
    const storedEvents = localStorage.getItem('churchEvents')
    if (storedEvents) setEvents(JSON.parse(storedEvents))
    
    const storedRoster = localStorage.getItem('churchRoster')
    if (storedRoster) setRoster(JSON.parse(storedRoster))
    
    // Load history
    const storedVerseHistory = localStorage.getItem('churchVerseHistory')
    if (storedVerseHistory) setVerseHistory(JSON.parse(storedVerseHistory))
    
    const storedRosterHistory = localStorage.getItem('churchRosterHistory')
    if (storedRosterHistory) setRosterHistory(JSON.parse(storedRosterHistory))
  }, [])

  // ── Helper: Show saved message
  const showSaved = (message) => {
    setSavedMessage(message)
    setTimeout(() => setSavedMessage(null), 2000)
  }

  // ── Save Verse (with history)
  const saveVerse = () => {
    // Save to current content
    localStorage.setItem('churchVerse', JSON.stringify(verse))
    
    // Save to history
    const historyEntry = {
      id: Date.now(),
      savedAt: new Date().toISOString(),
      reference: verse.reference,
      text: verse.text,
      theme: verse.theme
    }
    const newHistory = [historyEntry, ...verseHistory].slice(0, 50) // Keep last 50
    setVerseHistory(newHistory)
    localStorage.setItem('churchVerseHistory', JSON.stringify(newHistory))
    
    showSaved('✓ Verse saved')
  }

  // ── Save Events (full snapshot)
  const saveEvents = () => {
    localStorage.setItem('churchEvents', JSON.stringify(events))
    showSaved('✓ Events saved')
  }

  // ── Save single Roster week (with history)
  const saveRosterWeek = (week) => {
    // Update current roster
    const updatedRoster = roster.map(w => w.id === week.id ? week : w)
    setRoster(updatedRoster)
    localStorage.setItem('churchRoster', JSON.stringify(updatedRoster))
    
    // Save to history
    const historyEntry = {
      id: Date.now(),
      savedAt: new Date().toISOString(),
      weekStart: week.weekStart,
      date: week.date,
      leader: week.leader,
      pianist: week.pianist,
      reader: week.reader
    }
    const newHistory = [historyEntry, ...rosterHistory].slice(0, 100)
    setRosterHistory(newHistory)
    localStorage.setItem('churchRosterHistory', JSON.stringify(newHistory))
    
    showSaved('✓ Roster saved')
  }

  // ── Restore Verse from history
  const restoreVerse = (historyEntry) => {
    setVerse({
      reference: historyEntry.reference,
      text: historyEntry.text,
      theme: historyEntry.theme
    })
    localStorage.setItem('churchVerse', JSON.stringify({
      reference: historyEntry.reference,
      text: historyEntry.text,
      theme: historyEntry.theme
    }))
    showSaved('✓ Restored from history')
    setIsHistoryModalOpen(false)
  }

  // ── Restore Roster from history
  const restoreRoster = (historyEntry) => {
    const updatedRoster = roster.map(w => 
      w.weekStart === historyEntry.weekStart 
        ? { ...w, leader: historyEntry.leader, pianist: historyEntry.pianist, reader: historyEntry.reader }
        : w
    )
    setRoster(updatedRoster)
    localStorage.setItem('churchRoster', JSON.stringify(updatedRoster))
    showSaved('✓ Restored from history')
    setIsHistoryModalOpen(false)
  }

  // ── Calendar Helpers
  const getWeekDateRange = (year, month, weekNumber) => {
    // First day of month
    const firstDay = new Date(year, month, 1)
    const firstDayOfWeek = firstDay.getDay() // 0 = Sunday
    
    // Calculate start of week 1 (first Monday or Sunday?)
    let startDate = new Date(year, month, 1)
    
    // Adjust to start of week (Monday)
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
    
    // Find roster for this week
    const weekStartStr = startDate.toLocaleDateString('en-GB')
    const weekRoster = roster.find(r => r.weekStart === weekStartStr)
    
    // Find events within this week
    const weekEvents = events.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate >= startDate && eventDate <= endDate
    })
    
    setCalendarPreview({
      weekRange: formatDateRange(startDate, endDate),
      startDate,
      endDate,
      verse: verse,
      roster: weekRoster || null,
      events: weekEvents
    })
  }

  useEffect(() => {
    if (isCalendarModalOpen) {
      loadCalendarPreview()
    }
  }, [selectedMonth, selectedYear, selectedWeek, isCalendarModalOpen])

  // ── Event Handlers
  const handleAddEvent = () => {
    setEditingEvent(null)
    setEventForm({ date: '', day: '', titleEn: '', titleBm: '', time: '', descriptionEn: '', descriptionBm: '' })
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
  }

  const handleDeleteEvent = (id) => {
    if (window.confirm('Delete this event?')) {
      setEvents(prev => prev.filter(e => e.id !== id))
    }
  }

  const handleEditRoster = (week) => {
    setEditingRoster(week)
    setRosterForm(week)
    setIsRosterModalOpen(true)
  }

  const handleSaveRosterEdit = () => {
    const updatedWeek = { ...rosterForm, id: editingRoster.id, date: rosterForm.weekStart.split('/').reverse().join('-') }
    setRoster(prev => prev.map(w => w.id === editingRoster.id ? updatedWeek : w))
    saveRosterWeek(updatedWeek)
    setIsRosterModalOpen(false)
  }

  const getDayFromDate = (dateString) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const date = new Date(dateString)
    return days[date.getDay()]
  }

  const handleLogout = () => {
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <header className="bg-white border-b border-[#EAE1D4] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/staff')} 
                className="text-[#8A7A6E] hover:text-[#2D2926] text-xl leading-none"
                aria-label="Back to Staff Hub"
              >
                ←
              </button>
              <div>
                <h1 className="text-base font-serif font-light text-[#2D2926]">Content Manager</h1>
                <p className="text-[9px] text-[#8A7A6E] tracking-wide">Website content editor</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsCalendarModalOpen(true)}
                className="border border-[#EAE1D4] text-[#7A6A5E] px-3 py-1.5 rounded-full text-xs hover:bg-[#F5EFE6] transition"
              >
                📅 Calendar View
              </button>
              <button onClick={handleLogout} className="text-[#8A7A6E] hover:text-[#2D2926] text-xs transition">Logout</button>
            </div>
          </div>
        </div>
      </header>

      {/* Saved Message Toast */}
      {savedMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#2D2926] text-white px-4 py-2 rounded-full text-sm shadow-lg animate-fade-in">
          {savedMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-[#EAE1D4] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-6">
            {[
              { id: 'verse', label: '📖 Weekly Verse' },
              { id: 'events', label: '📅 Events' },
              { id: 'roster', label: '🎵 Worship Roster' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 text-sm transition border-b-2 ${
                  activeTab === tab.id
                    ? 'border-[#2D2926] text-[#2D2926] font-medium'
                    : 'border-transparent text-[#8A7A6E] hover:text-[#2D2926]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        
        {/* Weekly Verse Tab */}
        {activeTab === 'verse' && (
          <div className="bg-white rounded-xl border border-[#EAE1D4] p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-serif text-[#2D2926]">Weekly Scripture</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setHistoryType('verse'); setIsHistoryModalOpen(true); }}
                  className="text-[#8A7A6E] hover:text-[#2D2926] text-sm border border-[#EAE1D4] px-3 py-1 rounded-full"
                >
                  📜 History
                </button>
                <button 
                  onClick={saveVerse}
                  className="bg-[#2D2926] text-white px-4 py-1.5 rounded-full text-sm hover:bg-[#4A3F38] transition"
                >
                  Save Verse
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#5B534D] mb-1">Reference</label>
                <input
                  type="text"
                  value={verse.reference}
                  onChange={(e) => setVerse(prev => ({ ...prev, reference: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#EAE1D4] rounded-lg text-sm"
                  placeholder="e.g., Matthew 11:28"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5B534D] mb-1">Verse Text</label>
                <textarea
                  value={verse.text}
                  onChange={(e) => setVerse(prev => ({ ...prev, text: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-[#EAE1D4] rounded-lg text-sm"
                  placeholder="Enter the verse text..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5B534D] mb-1">Theme (optional)</label>
                <input
                  type="text"
                  value={verse.theme}
                  onChange={(e) => setVerse(prev => ({ ...prev, theme: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#EAE1D4] rounded-lg text-sm"
                  placeholder="e.g., Rest and Peace"
                />
              </div>
            </div>
            <div className="mt-4 p-3 bg-[#F5EFE6] rounded-lg text-sm text-[#7A6A5E]">
              📌 This verse will appear on the homepage hero section
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-serif text-[#2D2926]">Upcoming Events</h2>
              <div className="flex gap-2">
                <button 
                  onClick={saveEvents}
                  className="bg-[#2D2926] text-white px-4 py-1.5 rounded-full text-sm hover:bg-[#4A3F38] transition"
                >
                  Save Events
                </button>
                <button onClick={handleAddEvent} className="border border-[#EAE1D4] text-[#7A6A5E] px-3 py-1 rounded-full text-sm hover:bg-[#F5EFE6] transition">
                  + Add Event
                </button>
              </div>
            </div>
            
            {events.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#EAE1D4] p-8 text-center text-[#8A7A6E]">No events yet. Click "Add Event" to create one.</div>
            ) : (
              <div className="space-y-2">
                {events.map(event => (
                  <div key={event.id} className="bg-white rounded-xl border border-[#EAE1D4] p-4 hover:shadow-sm transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <span className="text-sm font-medium text-[#2D2926]">{event.date} • {event.day}</span>
                          <span className="text-xs text-[#8A7A6E]">{event.time}</span>
                        </div>
                        <p className="font-medium text-[#2D2926]">{event.titleEn}</p>
                        <p className="text-sm text-[#7A6A5E] italic">{event.titleBm}</p>
                        <p className="text-xs text-[#8A7A6E] mt-1">{event.descriptionEn}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditEvent(event)} className="text-[#8A7A6E] hover:text-[#2D2926] text-sm">✏️</button>
                        <button onClick={() => handleDeleteEvent(event.id)} className="text-[#C4A88B] hover:text-red-600 text-sm">🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Roster Tab */}
        {activeTab === 'roster' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-serif text-[#2D2926]">Worship Roster (4 Weeks)</h2>
              <button 
                onClick={() => { setHistoryType('roster'); setIsHistoryModalOpen(true); }}
                className="text-[#8A7A6E] hover:text-[#2D2926] text-sm border border-[#EAE1D4] px-3 py-1 rounded-full"
              >
                📜 History
              </button>
            </div>
            <div className="grid gap-3">
              {roster.map(week => (
                <div key={week.id} className="bg-white rounded-xl border border-[#EAE1D4] p-4 hover:shadow-sm transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-[#2D2926] mb-2">{week.weekStart} • {getDayFromDate(week.date)}</div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div><span className="text-[#8A7A6E]">Leader:</span> <span className="text-[#2D2926]">{week.leader}</span></div>
                        <div><span className="text-[#8A7A6E]">Pianist:</span> <span className="text-[#2D2926]">{week.pianist}</span></div>
                        <div><span className="text-[#8A7A6E]">Reader:</span> <span className="text-[#2D2926]">{week.reader}</span></div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => saveRosterWeek(week)} className="text-[#2D2926] hover:text-[#4A3F38] text-sm border border-[#EAE1D4] px-3 py-1 rounded-full">Save</button>
                      <button onClick={() => handleEditRoster(week)} className="text-[#8A7A6E] hover:text-[#2D2926] text-sm">✏️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 bg-[#F5EFE6] rounded-lg text-sm text-[#7A6A5E]">
              🎵 These 4 weeks will be displayed on the homepage roster section
            </div>
          </div>
        )}
      </main>

      {/* ── History Modal ── */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-serif text-[#2D2926]">
                {historyType === 'verse' ? '📖 Verse History' : '🎵 Roster History'}
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
                        <p className="text-sm text-[#7A6A5E] mt-1 line-clamp-2">{entry.text}</p>
                        {entry.theme && <p className="text-xs text-[#B0A49A] mt-1">Theme: {entry.theme}</p>}
                      </div>
                      <button 
                        onClick={() => restoreVerse(entry)}
                        className="bg-[#2D2926] text-white px-3 py-1 rounded-full text-xs hover:bg-[#4A3F38] transition"
                      >
                        Restore
                      </button>
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
                        <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                          <div><span className="text-[#8A7A6E]">Leader:</span> {entry.leader}</div>
                          <div><span className="text-[#8A7A6E]">Pianist:</span> {entry.pianist}</div>
                          <div><span className="text-[#8A7A6E]">Reader:</span> {entry.reader}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => restoreRoster(entry)}
                        className="bg-[#2D2926] text-white px-3 py-1 rounded-full text-xs hover:bg-[#4A3F38] transition"
                      >
                        Restore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Calendar Modal ── */}
      {isCalendarModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-serif text-[#2D2926]">📅 Content Calendar</h2>
              <button onClick={() => setIsCalendarModalOpen(false)} className="text-[#8A7A6E] hover:text-[#2D2926] text-2xl leading-none">×</button>
            </div>
            
            {/* Month and Week Selector */}
            <div className="bg-[#F5EFE6] rounded-xl p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2">
                  <select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="px-3 py-2 border border-[#EAE1D4] rounded-lg text-sm bg-white"
                  >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, idx) => (
                      <option key={idx} value={idx}>{month}</option>
                    ))}
                  </select>
                  <select 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="px-3 py-2 border border-[#EAE1D4] rounded-lg text-sm bg-white"
                  >
                    {[2025, 2026, 2027].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(week => (
                    <button
                      key={week}
                      onClick={() => setSelectedWeek(week)}
                      className={`w-10 h-10 rounded-full text-sm font-medium transition ${
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
              <button 
                onClick={loadCalendarPreview}
                className="w-full mt-4 bg-[#2D2926] text-white py-2 rounded-lg text-sm hover:bg-[#4A3F38] transition"
              >
                Load Week {selectedWeek}
              </button>
            </div>
            
            {/* Calendar Preview */}
            {calendarPreview && (
              <div className="space-y-5">
                <div className="text-center">
                  <p className="text-sm font-medium text-[#2D2926]">{calendarPreview.weekRange}</p>
                  <p className="text-xs text-[#8A7A6E] mt-1">
                    {calendarPreview.startDate.toLocaleDateString()} - {calendarPreview.endDate.toLocaleDateString()}
                  </p>
                </div>
                
                {/* Verse */}
                <div className="border border-[#EAE1D4] rounded-xl p-4">
                  <h3 className="text-sm font-medium text-[#2D2926] mb-2">📖 Weekly Verse</h3>
                  <p className="font-serif text-[#2D2926]">{calendarPreview.verse.reference}</p>
                  <p className="text-sm text-[#7A6A5E] mt-1 line-clamp-3">{calendarPreview.verse.text}</p>
                </div>
                
                {/* Roster */}
                <div className="border border-[#EAE1D4] rounded-xl p-4">
                  <h3 className="text-sm font-medium text-[#2D2926] mb-2">🎵 Worship Roster</h3>
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
                
                {/* Events */}
                <div className="border border-[#EAE1D4] rounded-xl p-4">
                  <h3 className="text-sm font-medium text-[#2D2926] mb-2">📅 Events</h3>
                  {calendarPreview.events.length > 0 ? (
                    <div className="space-y-2">
                      {calendarPreview.events.map(event => (
                        <div key={event.id} className="text-sm">
                          <span className="font-medium text-[#2D2926]">{event.date}</span>
                          <span className="text-[#8A7A6E] mx-2">•</span>
                          <span className="text-[#7A6A5E]">{event.titleEn}</span>
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

      {/* ── Event Modal ── */}
      {isEventModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-serif text-[#2D2926]">{editingEvent ? 'Edit Event' : 'Add Event'}</h2>
              <button onClick={() => setIsEventModalOpen(false)} className="text-[#8A7A6E] text-xl">×</button>
            </div>
            <div className="space-y-3">
              <input type="date" value={eventForm.date} onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value, day: getDayFromDate(e.target.value) }))} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input type="text" placeholder="Time (e.g., 9:00 AM)" value={eventForm.time} onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input type="text" placeholder="Title (English)" value={eventForm.titleEn} onChange={(e) => setEventForm(prev => ({ ...prev, titleEn: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input type="text" placeholder="Title (Bahasa Malaysia)" value={eventForm.titleBm} onChange={(e) => setEventForm(prev => ({ ...prev, titleBm: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <textarea placeholder="Description (English)" value={eventForm.descriptionEn} onChange={(e) => setEventForm(prev => ({ ...prev, descriptionEn: e.target.value }))} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <textarea placeholder="Description (Bahasa Malaysia)" value={eventForm.descriptionBm} onChange={(e) => setEventForm(prev => ({ ...prev, descriptionBm: e.target.value }))} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <button onClick={handleSaveEvent} className="w-full bg-[#2D2926] text-white py-2 rounded-full text-sm mt-2">Save Event</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Roster Edit Modal ── */}
      {isRosterModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-serif text-[#2D2926]">Edit Worship Week</h2>
              <button onClick={() => setIsRosterModalOpen(false)} className="text-[#8A7A6E] text-xl">×</button>
            </div>
            <div className="space-y-3">
              <input type="text" placeholder="Week Starting (DD/MM/YYYY)" value={rosterForm.weekStart} onChange={(e) => setRosterForm(prev => ({ ...prev, weekStart: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input type="text" placeholder="Worship Leader" value={rosterForm.leader} onChange={(e) => setRosterForm(prev => ({ ...prev, leader: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input type="text" placeholder="Pianist / Keyboardist" value={rosterForm.pianist} onChange={(e) => setRosterForm(prev => ({ ...prev, pianist: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input type="text" placeholder="Scripture Reader" value={rosterForm.reader} onChange={(e) => setRosterForm(prev => ({ ...prev, reader: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <button onClick={handleSaveRosterEdit} className="w-full bg-[#2D2926] text-white py-2 rounded-full text-sm mt-2">Save Changes</button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}

export default ContentManager