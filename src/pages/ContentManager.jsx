// src/pages/ContentManager.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function ContentManager() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('verse')
  const [saved, setSaved] = useState(false)
  
  // Weekly Verse State
  const [verse, setVerse] = useState({
    reference: 'Matthew 11:28',
    text: 'Come to me, all you who are weary and burdened, and I will give you rest.',
    theme: 'Rest and Peace'
  })
  
  // Events State
  const [events, setEvents] = useState([
    { id: 1, date: '2026-06-01', day: 'Sunday', titleEn: 'Communion Sunday', titleBm: 'Hari Perjamuan Kudus', time: '9:00 AM', descriptionEn: 'Join us for Holy Communion', descriptionBm: 'Sertai kami untuk Perjamuan Kudus' },
    { id: 2, date: '2026-06-04', day: 'Wednesday', titleEn: 'Midweek Prayer', titleBm: 'Doa Pertengahan Minggu', time: '7:30 PM', descriptionEn: 'Prayer and worship gathering', descriptionBm: 'Perhimpunan doa dan penyembahan' },
    { id: 3, date: '2026-06-15', day: 'Sunday', titleEn: 'Youth Sunday', titleBm: 'Hari Belia', time: '11:00 AM', descriptionEn: 'Youth-led service', descriptionBm: 'Kebaktian yang dipimpin belia' }
  ])
  
  // Roster State (4 weeks)
  const [roster, setRoster] = useState([
    { id: 1, date: '2026-06-01', weekStart: '01/06/2026', leader: 'John Tan', pianist: 'Mary Wong', reader: 'David Lim' },
    { id: 2, date: '2026-06-08', weekStart: '08/06/2026', leader: 'Sarah Ong', pianist: 'Peter Chin', reader: 'Esther Lee' },
    { id: 3, date: '2026-06-15', weekStart: '15/06/2026', leader: 'Daniel Koh', pianist: 'Rachel Tee', reader: 'Samuel Ng' },
    { id: 4, date: '2026-06-22', weekStart: '22/06/2026', leader: 'Grace Tan', pianist: 'Michael Wong', reader: 'Hannah Chua' }
  ])
  
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

  // Load data from localStorage on mount
  useEffect(() => {
    const storedVerse = localStorage.getItem('churchVerse')
    if (storedVerse) setVerse(JSON.parse(storedVerse))
    
    const storedEvents = localStorage.getItem('churchEvents')
    if (storedEvents) setEvents(JSON.parse(storedEvents))
    
    const storedRoster = localStorage.getItem('churchRoster')
    if (storedRoster) setRoster(JSON.parse(storedRoster))
  }, [])

  // Save all data
  const saveAll = () => {
    localStorage.setItem('churchVerse', JSON.stringify(verse))
    localStorage.setItem('churchEvents', JSON.stringify(events))
    localStorage.setItem('churchRoster', JSON.stringify(roster))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Event Handlers
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
    if (editingEvent) {
      setEvents(prev => prev.map(e => e.id === editingEvent.id ? { ...eventForm, id: editingEvent.id } : e))
    } else {
      setEvents(prev => [...prev, { ...eventForm, id: Date.now() }])
    }
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

  const handleSaveRoster = () => {
    setRoster(prev => prev.map(w => w.id === editingRoster.id ? { ...rosterForm, id: editingRoster.id, date: rosterForm.weekStart.split('/').reverse().join('-') } : w))
    setIsRosterModalOpen(false)
  }

  // Helper for day of week
  const getDayFromDate = (dateString) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const date = new Date(dateString)
    return days[date.getDay()]
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <header className="bg-white border-b border-[#EAE1D4] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/staff')} className="text-[#8A7A6E] hover:text-[#2D2926] text-xl">←</button>
              <div>
                <h1 className="text-base font-serif font-light text-[#2D2926]">Content Manager</h1>
                <p className="text-[9px] text-[#8A7A6E] tracking-wide">Website content editor</p>
              </div>
            </div>
            <button
              onClick={saveAll}
              className="bg-[#2D2926] text-white px-4 py-1.5 rounded-full text-sm hover:bg-[#4A3F38] transition"
            >
              {saved ? '✓ Saved!' : 'Save All'}
            </button>
          </div>
        </div>
      </header>

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
            <h2 className="text-lg font-serif text-[#2D2926] mb-4">Weekly Scripture</h2>
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
              <button onClick={handleAddEvent} className="bg-[#2D2926] text-white px-3 py-1 rounded-full text-sm">+ Add Event</button>
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
            <h2 className="text-lg font-serif text-[#2D2926]">Worship Roster (4 Weeks)</h2>
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
                    <button onClick={() => handleEditRoster(week)} className="text-[#8A7A6E] hover:text-[#2D2926] text-sm">✏️ Edit</button>
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

      {/* Event Modal */}
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

      {/* Roster Modal */}
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
              <button onClick={handleSaveRoster} className="w-full bg-[#2D2926] text-white py-2 rounded-full text-sm mt-2">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContentManager