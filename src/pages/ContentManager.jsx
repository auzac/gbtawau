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
  Eye,
  X,
  ChevronRight
} from 'lucide-react'

function ContentManager() {
  const navigate = useNavigate()

  // ── UI State
  const [activeTab, setActiveTab] = useState('verse')
  const [savedMessage, setSavedMessage] = useState(null)

  // ── Content State
  const [verse, setVerse] = useState({
    reference: 'Matthew 11:28',
    text: 'Come to me, all you who are weary and burdened, and I will give you rest.',
    theme: 'Rest and Peace'
  })

  const [events, setEvents] = useState([
    {
      id: 1,
      date: '2026-06-01',
      titleEn: 'Communion Sunday',
      time: '9:00 AM',
      descriptionEn: 'Join us for Holy Communion'
    },
    {
      id: 2,
      date: '2026-06-04',
      titleEn: 'Midweek Prayer',
      time: '7:30 PM',
      descriptionEn: 'Prayer and worship gathering'
    }
  ])

  const [roster, setRoster] = useState([
    {
      id: 1,
      weekStart: '01/06/2026',
      leader: 'John Tan',
      pianist: 'Mary Wong',
      reader: 'David Lim'
    },
    {
      id: 2,
      weekStart: '08/06/2026',
      leader: 'Sarah Ong',
      pianist: 'Peter Chin',
      reader: 'Esther Lee'
    }
  ])

  useEffect(() => {
    const storedVerse = localStorage.getItem('churchVerse')
    const storedEvents = localStorage.getItem('churchEvents')
    const storedRoster = localStorage.getItem('churchRoster')

    if (storedVerse) setVerse(JSON.parse(storedVerse))
    if (storedEvents) setEvents(JSON.parse(storedEvents))
    if (storedRoster) setRoster(JSON.parse(storedRoster))
  }, [])

  const showSaved = (message) => {
    setSavedMessage(message)
    setTimeout(() => setSavedMessage(null), 2200)
  }

  const saveVerse = () => {
    localStorage.setItem('churchVerse', JSON.stringify(verse))
    showSaved('Verse updated')
  }

  const saveEvents = () => {
    localStorage.setItem('churchEvents', JSON.stringify(events))
    showSaved('Events updated')
  }

  const handleLogout = () => {
    navigate('/login')
  }

  const tabs = [
    {
      id: 'verse',
      label: 'Weekly Verse',
      icon: BookOpen
    },
    {
      id: 'events',
      label: 'Events',
      icon: CalendarDays
    },
    {
      id: 'roster',
      label: 'Worship Roster',
      icon: Music
    }
  ]

  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-[#E7E0D7]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/staff')}
              className="w-10 h-10 rounded-xl border border-[#E7E0D7] bg-white flex items-center justify-center hover:bg-[#F4F1EC] transition"
            >
              <ArrowLeft size={18} className="text-[#5E5247]" />
            </button>

            <div>
              <h1 className="text-[20px] font-serif text-[#2D2926] leading-none">
                Content Manager
              </h1>
              <p className="text-xs text-[#8B7E72] mt-1">
                Website content administration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="hidden sm:flex items-center gap-2 px-4 h-10 rounded-xl border border-[#E7E0D7] bg-white hover:bg-[#F4F1EC] transition text-sm text-[#5E5247]">
              <Eye size={16} />
              Preview
            </button>

            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-xl border border-[#E7E0D7] bg-white flex items-center justify-center hover:bg-[#F4F1EC] transition"
            >
              <LogOut size={16} className="text-[#5E5247]" />
            </button>
          </div>
        </div>
      </header>

      {/* Save Toast */}
      {savedMessage && (
        <div className="fixed top-20 right-6 z-50">
          <div className="bg-[#2D2926] text-white px-5 py-3 rounded-2xl shadow-xl text-sm animate-fade-in">
            {savedMessage}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-[#E7E0D7] bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex gap-2 py-4 overflow-x-auto">

            {tabs.map((tab) => {
              const Icon = tab.icon

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 h-11 rounded-2xl text-sm transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-white border border-[#DDD2C5] shadow-sm text-[#2D2926]'
                      : 'text-[#8B7E72] hover:bg-white/70'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-8">

        {/* Verse */}
        {activeTab === 'verse' && (
          <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-6">

            {/* Editor */}
            <div className="bg-white border border-[#E7E0D7] rounded-3xl p-7 shadow-sm">

              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-serif text-[#2D2926]">
                    Weekly Scripture
                  </h2>
                  <p className="text-sm text-[#8B7E72] mt-1">
                    Update the homepage scripture section
                  </p>
                </div>

                <button className="flex items-center gap-2 h-10 px-4 rounded-xl border border-[#E7E0D7] text-sm text-[#5E5247] hover:bg-[#F5F1EB] transition">
                  <History size={15} />
                  History
                </button>
              </div>

              <div className="space-y-6">

                <div>
                  <label className="block text-sm font-medium text-[#5E5247] mb-2">
                    Scripture Reference
                  </label>

                  <input
                    type="text"
                    value={verse.reference}
                    onChange={(e) =>
                      setVerse(prev => ({
                        ...prev,
                        reference: e.target.value
                      }))
                    }
                    className="w-full h-12 px-4 rounded-2xl border border-[#E7E0D7] bg-[#FCFBF9] focus:outline-none focus:ring-2 focus:ring-[#D7C7B4]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5E5247] mb-2">
                    Verse Text
                  </label>

                  <textarea
                    rows={6}
                    value={verse.text}
                    onChange={(e) =>
                      setVerse(prev => ({
                        ...prev,
                        text: e.target.value
                      }))
                    }
                    className="w-full px-4 py-3 rounded-2xl border border-[#E7E0D7] bg-[#FCFBF9] focus:outline-none focus:ring-2 focus:ring-[#D7C7B4] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5E5247] mb-2">
                    Theme
                  </label>

                  <input
                    type="text"
                    value={verse.theme}
                    onChange={(e) =>
                      setVerse(prev => ({
                        ...prev,
                        theme: e.target.value
                      }))
                    }
                    className="w-full h-12 px-4 rounded-2xl border border-[#E7E0D7] bg-[#FCFBF9] focus:outline-none focus:ring-2 focus:ring-[#D7C7B4]"
                  />
                </div>

                <button
                  onClick={saveVerse}
                  className="flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-[#2D2926] hover:bg-[#433A34] text-white transition"
                >
                  <Save size={16} />
                  Save Scripture
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-[#2D2926] rounded-3xl p-8 text-white relative overflow-hidden">
              
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                  <BookOpen size={22} />
                </div>

                <p className="text-sm uppercase tracking-[0.2em] text-white/60 mb-6">
                  Weekly Verse
                </p>

                <p className="text-2xl leading-relaxed font-serif">
                  “{verse.text}”
                </p>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-lg font-medium">
                    {verse.reference}
                  </p>

                  <p className="text-sm text-white/60 mt-1">
                    {verse.theme}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Events */}
        {activeTab === 'events' && (
          <div className="space-y-5">

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif text-[#2D2926]">
                  Upcoming Events
                </h2>

                <p className="text-sm text-[#8B7E72] mt-1">
                  Manage public-facing church events
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={saveEvents}
                  className="flex items-center gap-2 h-11 px-5 rounded-2xl bg-[#2D2926] text-white hover:bg-[#433A34] transition"
                >
                  <Save size={15} />
                  Save
                </button>

                <button className="flex items-center gap-2 h-11 px-5 rounded-2xl border border-[#E7E0D7] bg-white hover:bg-[#F5F1EB] transition">
                  <Plus size={15} />
                  Add Event
                </button>
              </div>
            </div>

            <div className="grid gap-4">

              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white border border-[#E7E0D7] rounded-3xl p-6 hover:shadow-md transition"
                >
                  <div className="flex justify-between gap-6">

                    <div className="flex gap-5 flex-1">

                      <div className="w-16 min-w-16 h-16 rounded-2xl bg-[#F5F1EB] flex flex-col items-center justify-center">
                        <span className="text-xs text-[#8B7E72]">
                          {new Date(event.date).toLocaleString('default', { month: 'short' })}
                        </span>

                        <span className="text-xl font-semibold text-[#2D2926] leading-none mt-1">
                          {new Date(event.date).getDate()}
                        </span>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-medium text-[#2D2926]">
                            {event.titleEn}
                          </h3>

                          <ChevronRight size={15} className="text-[#B7A89A]" />
                        </div>

                        <p className="text-sm text-[#8B7E72] mb-3">
                          {event.time}
                        </p>

                        <p className="text-sm text-[#5E5247] leading-relaxed">
                          {event.descriptionEn}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <button className="w-10 h-10 rounded-xl border border-[#E7E0D7] flex items-center justify-center hover:bg-[#F5F1EB] transition">
                        <Pencil size={15} className="text-[#5E5247]" />
                      </button>

                      <button className="w-10 h-10 rounded-xl border border-[#E7E0D7] flex items-center justify-center hover:bg-red-50 transition">
                        <Trash2 size={15} className="text-[#B07C68]" />
                      </button>
                    </div>

                  </div>
                </div>
              ))}

            </div>
          </div>
        )}

        {/* Roster */}
        {activeTab === 'roster' && (
          <div className="space-y-5">

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif text-[#2D2926]">
                  Worship Roster
                </h2>

                <p className="text-sm text-[#8B7E72] mt-1">
                  Weekly ministry scheduling overview
                </p>
              </div>

              <button className="flex items-center gap-2 h-11 px-5 rounded-2xl border border-[#E7E0D7] bg-white hover:bg-[#F5F1EB] transition">
                <History size={15} />
                View History
              </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-5">

              {roster.map((week) => (
                <div
                  key={week.id}
                  className="bg-white border border-[#E7E0D7] rounded-3xl p-6 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-6">

                    <div>
                      <p className="text-xs uppercase tracking-[0.15em] text-[#A39284] mb-2">
                        Worship Week
                      </p>

                      <h3 className="text-lg font-medium text-[#2D2926]">
                        {week.weekStart}
                      </h3>
                    </div>

                    <button className="w-10 h-10 rounded-xl border border-[#E7E0D7] flex items-center justify-center hover:bg-[#F5F1EB] transition">
                      <Pencil size={15} className="text-[#5E5247]" />
                    </button>
                  </div>

                  <div className="space-y-4">

                    <div className="flex items-center justify-between py-3 border-b border-[#F0EAE2]">
                      <span className="text-sm text-[#8B7E72]">
                        Worship Leader
                      </span>

                      <span className="text-sm font-medium text-[#2D2926]">
                        {week.leader}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-[#F0EAE2]">
                      <span className="text-sm text-[#8B7E72]">
                        Pianist
                      </span>

                      <span className="text-sm font-medium text-[#2D2926]">
                        {week.pianist}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <span className="text-sm text-[#8B7E72]">
                        Scripture Reader
                      </span>

                      <span className="text-sm font-medium text-[#2D2926]">
                        {week.reader}
                      </span>
                    </div>

                  </div>
                </div>
              ))}

            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.25s ease-out;
        }
      `}</style>
    </div>
  )
}

export default ContentManager