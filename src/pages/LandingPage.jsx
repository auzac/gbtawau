import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ChevronLeft, ChevronRight, MapPin, Clock, Phone, X, 
  Calendar, User, MapPinned, ArrowLeft, Users, ChevronDown
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useLocale } from '../contexts/LocaleContext'

const NAV_LINKS = [
  { en: 'Home', bm: 'Utama', href: '#home' },
  { en: 'About', bm: 'Tentang Kami', href: '#about' },
  { en: 'Events', bm: 'Acara', href: '#events' },
  { en: 'Roster', bm: 'Petugas', href: '#roster' },
  { en: 'Staff', bm: 'Kakitangan', href: '/login', isRouterLink: true },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { t, locale, toggleLocale } = useLocale()

  // Existing states
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [verse, setVerse] = useState({ reference: 'Matthew 11:28', text: 'Come to me...', theme: '' })
  const [events, setEvents] = useState([])
  const [carouselItems, setCarouselItems] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  // Events modal
  const [isEventsModalOpen, setIsEventsModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)

  // Roster modal
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false)
  const [rosters, setRosters] = useState([])               // raw roster data from DB
  const [availableMonths, setAvailableMonths] = useState([]) // array of {value: "2025-01", label: "January 2025"}
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedWeek, setSelectedWeek] = useState(1)      // 1..4

  const getNavText = (item) => (locale === 'bm' ? item.bm : item.en)

  // Load all data
  useEffect(() => {
    loadContent()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // Carousel autoplay
  useEffect(() => {
    if (!autoplay || carouselItems.length === 0) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [autoplay, carouselItems.length])

  // Block body scroll when any modal is open
  useEffect(() => {
    if (isEventsModalOpen || isRosterModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isEventsModalOpen, isRosterModalOpen])

  // Data fetching
  const loadContent = async () => {
    setLoading(true)
    await Promise.all([
      loadActiveVerse(),
      loadUpcomingEvents(),
      loadCarouselItems(),
      loadRosters(),
    ])
    setLoading(false)
  }

  const loadActiveVerse = async () => {
    const { data, error } = await supabase
      .from('verse_library')
      .select('*')
      .eq('is_active', true)
      .maybeSingle()
    if (!error && data) setVerse({ reference: data.reference, text: data.text, theme: data.theme || '' })
  }

  const loadUpcomingEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .order('time', { ascending: true })
    if (!error && data) setEvents(data)
    else setEvents([])
  }

  const loadCarouselItems = async () => {
    const { data, error } = await supabase
      .from('carousel_items')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
    if (!error && data && data.length > 0) {
      setCarouselItems(data)
      setCurrentSlide(0)
    } else {
      setCarouselItems([])
    }
  }

  const loadRosters = async () => {
  const { data, error } = await supabase
    .from('roster')
    .select('*')
    .order('week_start', { ascending: true })

  console.log('Raw roster data from Supabase:', data)  // <-- Debug

  if (!error && data) {
    setRosters(data)
    // Build available months from week_start dates
    const monthsSet = new Set()
    data.forEach(roster => {
      if (roster.week_start) {
        // Handle both date string and timestamp
        const date = new Date(roster.week_start)
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear()
          const month = date.getMonth() // 0-11
          const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
          const monthName = date.toLocaleString(locale === 'bm' ? 'ms-MY' : 'en-US', { month: 'long', year: 'numeric' })
          monthsSet.add(JSON.stringify({ value: monthStr, label: monthName }))
        }
      }
    })
    const monthsArray = Array.from(monthsSet).map(m => JSON.parse(m))
    monthsArray.sort((a,b) => a.value.localeCompare(b.value))
    setAvailableMonths(monthsArray)
    if (monthsArray.length > 0) {
      setSelectedMonth(monthsArray[0].value)
    }
  } else {
    console.error('Error loading rosters:', error)
    setRosters([])
  }
}

const getRosterForWeek = (weekNumber) => {
  if (!selectedMonth) return null
  const [year, month] = selectedMonth.split('-').map(Number)
  
  // Find the first Monday of the month
  const firstDayOfMonth = new Date(year, month - 1, 1)
  const firstMonday = new Date(firstDayOfMonth)
  const dayOfWeek = firstDayOfMonth.getDay() // 0 = Sunday, 1 = Monday, ...
  // Days until next Monday (if today is Sunday, next Monday is 1 day later)
  const daysToMonday = (dayOfWeek === 0 ? 1 : 8 - dayOfWeek) % 7
  firstMonday.setDate(firstDayOfMonth.getDate() + daysToMonday)
  
  // Calculate target Monday for the selected week (week 1 = first Monday)
  const targetMonday = new Date(firstMonday)
  targetMonday.setDate(firstMonday.getDate() + (weekNumber - 1) * 7)
  
  // Format as YYYY-MM-DD (date only)
  const targetDateStr = targetMonday.toISOString().split('T')[0]
  
  // Find a roster with matching week_start (use first match if duplicates)
  const matched = rosters.find(r => {
    if (!r.week_start) return false
    const rosterDate = new Date(r.week_start)
    if (isNaN(rosterDate.getTime())) return false
    return rosterDate.toISOString().split('T')[0] === targetDateStr
  })
  
  return matched || null
}

  const rosterForSelectedWeek = getRosterForWeek(selectedWeek)

  // Handlers
  const goToPrevSlide = () => {
    if (carouselItems.length === 0) return
    setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length)
    setAutoplay(false)
    setTimeout(() => setAutoplay(true), 10000)
  }

  const goToNextSlide = () => {
    if (carouselItems.length === 0) return
    setCurrentSlide((prev) => (prev + 1) % carouselItems.length)
    setAutoplay(false)
    setTimeout(() => setAutoplay(true), 10000)
  }

  const openEventsModal = () => {
    setSelectedEvent(null)
    setIsEventsModalOpen(true)
  }

  const closeEventsModal = () => {
    setIsEventsModalOpen(false)
    setSelectedEvent(null)
  }

  const showEventDetails = (event) => setSelectedEvent(event)
  const backToList = () => setSelectedEvent(null)

  const openRosterModal = () => {
    setIsRosterModalOpen(true)
  }

  const closeRosterModal = () => {
    setIsRosterModalOpen(false)
  }

  const formatTimeForDisplay = (time24) => {
    if (!time24) return ''
    const [hour, minute] = time24.split(':')
    const h = parseInt(hour)
    const period = h >= 12 ? 'PM' : 'AM'
    const hour12 = h % 12 || 12
    return `${hour12}:${minute} ${period}`
  }

  const formatEventDate = (dateStr) => {
    if (!dateStr) return { day: '', month: '', dayName: '' }
    const date = new Date(dateStr)
    return {
      day: date.getDate(),
      month: date.toLocaleString('default', { month: 'short' }),
      dayName: date.toLocaleString('default', { weekday: 'long' }),
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2D2926]/20 border-t-[#2D2926] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-[#FAF8F5] text-[#2D2926] overflow-x-hidden">
      <link
        href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap"
        rel="stylesheet"
      />

      {/* ========== NAVBAR (unchanged except nav links) ========== */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-5 ${scrolled ? 'bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#d9c9b7]/20' : 'bg-transparent border-b border-transparent'}`}>
        <div className="max-w-6xl mx-auto h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-4 h-4 opacity-70">
              <div className="absolute left-1/2 -translate-x-1/2 w-[1.5px] h-4 bg-[#A58B75] rounded-full" />
              <div className="absolute top-[4px] left-1/2 -translate-x-1/2 w-3 h-[1.5px] bg-[#A58B75] rounded-full" />
            </div>
            <span className="uppercase tracking-[0.22em] text-[11px] text-[#8A7A6E] font-normal font-['DM_Sans',sans-serif]">
              Gereja Baptis Tawau
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleLocale} className="h-9 px-4 rounded-full border border-[#d9c9b7]/40 bg-white/70 text-[#8A7A6E] uppercase tracking-[0.14em] text-[11px] font-medium transition-all duration-200 hover:bg-white font-['DM_Sans',sans-serif]">
              {locale === 'en' ? 'BM' : 'EN'}
            </button>
            <button onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu" className={`w-11 h-11 rounded-full border border-[#d9c9b7]/30 flex flex-col items-center justify-center gap-[5px] transition-all duration-300 ${menuOpen ? 'bg-[#2D2926]' : 'bg-white/80'}`}>
              {[0,1].map(i => (
                <span key={i} className={`block w-[18px] h-[1.5px] rounded-full transition-all duration-300 ${menuOpen ? 'bg-[#FAF8F5]' : 'bg-[#4A3F38]'} ${menuOpen && i===0 ? 'rotate-45 translate-y-[3px]' : ''} ${menuOpen && i===1 ? '-rotate-45 -translate-y-[3px]' : ''}`} />
              ))}
            </button>
          </div>
        </div>
      </nav>

      {/* FULLSCREEN MENU */}
      <div className={`fixed inset-0 z-40 bg-[#2D2926] flex flex-col items-center justify-center transition-all duration-500 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="text-center">
          {NAV_LINKS.map((item, i) => (
            <div key={item.en} className={`overflow-hidden transition-all duration-500 ${menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: `${i*60+100}ms` }}>
              {item.isRouterLink ? (
                <button onClick={() => { setMenuOpen(false); navigate(item.href) }} className="block w-full py-1 text-[#F5F0EB] hover:text-[#C9A882] transition-colors text-[clamp(2rem,8vw,3.5rem)] font-['Lora',serif] font-normal">
                  {getNavText(item)}
                </button>
              ) : (
                <a href={item.href} onClick={() => setMenuOpen(false)} className="block py-1 text-[#F5F0EB] hover:text-[#C9A882] transition-colors text-[clamp(2rem,8vw,3.5rem)] font-['Lora',serif] font-normal">
                  {getNavText(item)}
                </a>
              )}
            </div>
          ))}
        </div>
        <p className="mt-12 uppercase tracking-[0.25em] text-[11px] text-[#6B5E55] font-['DM_Sans',sans-serif]">Jalan Kuhara, 91000 Tawau, Sabah</p>
      </div>

      {/* ========== HERO SECTION ========== */}
      <section id="home" className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 overflow-hidden bg-gradient-to-b from-[#FAF8F5] to-[#F0E9DF]">
        <div className="absolute top-[8%] left-[-5%] w-[260px] h-[260px] rounded-full bg-[radial-gradient(circle,rgba(210,185,160,0.25)_0%,transparent_70%)]" />
        <div className="absolute bottom-[10%] right-[-8%] w-[320px] h-[320px] rounded-full bg-[radial-gradient(circle,rgba(185,160,130,0.18)_0%,transparent_70%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-[12vh] bg-gradient-to-b from-transparent to-[#b49b7d]/40" />
        <div className="relative z-10 w-full max-w-2xl">
          <div className="flex justify-center mb-8">
            <img src="/logo.webp" alt="Gereja Baptis Tawau" loading="eager" className="w-[clamp(140px,38vw,200px)] object-contain opacity-95" />
          </div>
          <blockquote className="mb-10">
            <p className="italic text-[clamp(1.3rem,4vw,2rem)] leading-relaxed tracking-[-0.01em] text-[#2D2926] mb-4 font-['Lora',serif]">"{verse.text}"</p>
            <cite className="uppercase tracking-[0.3em] text-[10px] text-[#B09882] not-italic font-['DM_Sans',sans-serif]">{verse.reference}</cite>
          </blockquote>
          <div className="mb-10">
            <a href="#about" className="inline-flex items-center gap-3 px-9 py-4 rounded-full bg-[#2D2926] text-[#FAF8F5] uppercase tracking-[0.12em] text-sm font-medium transition-all duration-300 hover:bg-[#4A3F38] hover:scale-[1.02] shadow-lg shadow-black/10 font-['DM_Sans',sans-serif]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M15 3H19C19.5523 3 20 3.44772 20 4V20C20 20.5523 19.5523 21 19 21H15"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              {t('welcome_cta')}
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={openEventsModal} className="min-w-[120px] rounded-2xl px-6 py-5 bg-white/70 border border-[#d9c9b7]/30 backdrop-blur-sm flex flex-col items-center gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 cursor-pointer">
              <Calendar size={22} stroke="#7A6A5E" strokeWidth="1.5" />
              <span className="uppercase tracking-[0.18em] text-[10px] text-[#7A6A5E] font-medium font-['DM_Sans',sans-serif]">{t('events_button')}</span>
            </button>
            <button onClick={openRosterModal} className="min-w-[120px] rounded-2xl px-6 py-5 bg-white/70 border border-[#d9c9b7]/30 backdrop-blur-sm flex flex-col items-center gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 cursor-pointer">
              <Users size={22} stroke="#7A6A5E" strokeWidth="1.5" />
              <span className="uppercase tracking-[0.18em] text-[10px] text-[#7A6A5E] font-medium font-['DM_Sans',sans-serif]">{t('roster_button')}</span>
            </button>
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-35 animate-bob flex flex-col items-center gap-2">
          <div className="w-px h-9 bg-gradient-to-b from-transparent to-[#8A7A6E]" />
          <div className="w-1 h-1 rounded-full bg-[#8A7A6E]" />
        </div>
      </section>

      {/* ========== CAROUSEL ========== */}
      {carouselItems.length > 0 && carouselItems[currentSlide] && (
        <section className="px-5 py-12 md:py-16 bg-white/40">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-center text-[clamp(1.3rem,3vw,1.8rem)] font-['Lora',serif] tracking-[-0.01em] text-[#2D2926] mb-8">{t('announcements_title')}</h2>
            <div className="relative w-full rounded-2xl overflow-hidden shadow-lg" onMouseEnter={() => setAutoplay(false)} onMouseLeave={() => setAutoplay(true)}>
              <div className="relative aspect-video">
                <img src={carouselItems[currentSlide].image_url} alt={carouselItems[currentSlide][`title_${locale}`] || ''} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6 text-white text-left">
                  <h3 className="text-xl md:text-2xl font-semibold font-['Lora',serif] mb-1">{carouselItems[currentSlide][`title_${locale}`]}</h3>
                  {carouselItems[currentSlide][`description_${locale}`] && <p className="text-sm md:text-base opacity-90">{carouselItems[currentSlide][`description_${locale}`]}</p>}
                  {carouselItems[currentSlide].link_url && <a href={carouselItems[currentSlide].link_url} className="mt-3 text-sm underline" target="_blank" rel="noopener noreferrer">{t('learn_more')}</a>}
                </div>
              </div>
              {carouselItems.length > 1 && (
                <>
                  <button onClick={goToPrevSlide} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-1.5 transition"><ChevronLeft size={24} className="text-white" /></button>
                  <button onClick={goToNextSlide} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-1.5 transition"><ChevronRight size={24} className="text-white" /></button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                    {carouselItems.map((_, idx) => (
                      <button key={idx} onClick={() => { setCurrentSlide(idx); setAutoplay(false); setTimeout(() => setAutoplay(true), 10000) }} className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-white w-5' : 'bg-white/50'}`} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ========== ABOUT SECTION ========== */}
      <section id="about" className="px-6 py-20 md:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <p className="uppercase tracking-[0.3em] text-[10px] text-[#B09882] mb-6 font-['DM_Sans',sans-serif]">{t('nav_about')}</p>
          <h2 className="text-[clamp(1.9rem,5vw,3rem)] leading-tight tracking-[-0.02em] mb-6 text-[#2D2926] font-['Lora',serif] font-normal">{t('about_tagline')}</h2>
          <p className="text-[#7A6E66] leading-8 text-[15px] md:text-[17px] max-w-2xl mx-auto font-light font-['DM_Sans',sans-serif]">{t('about_text')}</p>
          <div className="flex items-center justify-center gap-3 mt-10"><div className="w-10 h-px bg-[#b49b7d]/40" /><div className="w-[5px] h-[5px] rounded-full border border-[#b49b7d]/50" /><div className="w-10 h-px bg-[#b49b7d]/40" /></div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer id="footer" className="bg-[#2D2926] px-6 py-10 text-center">
        <p className="uppercase tracking-[0.28em] text-[10px] text-[#6B5E55] mb-2 font-['DM_Sans',sans-serif]">{t('footer_church')}</p>
        <div className="flex flex-col items-center gap-2 text-[#6B5E55] text-sm font-['DM_Sans',sans-serif]">
          <div className="flex items-center gap-2"><MapPin size={14} /><span>{t('footer_address')}</span></div>
          <div className="flex items-center gap-2"><Clock size={14} /><span>{t('footer_worship')}</span></div>
          <div className="flex items-center gap-2"><Phone size={14} /><span>{t('footer_phone')}</span></div>
        </div>
        <div className="w-8 h-px bg-white/10 mx-auto my-6" />
        <p className="text-[#7A6A5E] text-sm italic font-['Lora',serif]">{t('footer_tagline')}</p>
      </footer>

      {/* ========== EVENTS MODAL (unchanged) ========== */}
      {isEventsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#FAF8F5] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-[#d9c9b7]/40">
              <h2 className="text-xl font-['Lora',serif] text-[#2D2926]">{selectedEvent ? t('event_details_title') : t('events_modal_title')}</h2>
              <button onClick={closeEventsModal} className="p-1 hover:bg-[#d9c9b7]/30 rounded-full"><X size={20} className="text-[#7A6A5E]" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {!selectedEvent ? (
                events.length === 0 ? <p className="text-center text-[#8A7A6E] py-10">{t('no_events')}</p> :
                <div className="space-y-3">
                  {events.map(event => {
                    if (!event) return null
                    const { day, month, dayName } = formatEventDate(event.date)
                    const title = (locale === 'bm' && event.title_bm) ? event.title_bm : (event.title_en || 'Untitled')
                    return (
                      <button key={event.id} onClick={() => showEventDetails(event)} className="w-full text-left bg-white/70 border border-[#d9c9b7]/30 rounded-xl p-4 flex items-center gap-4 hover:shadow-md">
                        <div className="min-w-[60px] text-center"><div className="text-2xl font-['Lora',serif] font-medium">{day}</div><div className="uppercase text-[10px] text-[#B09882]">{month}</div></div>
                        <div className="flex-1"><h3 className="font-['Lora',serif] font-medium">{title}</h3><p className="text-xs text-[#A08070] mt-1">{dayName} · {formatTimeForDisplay(event.time)}</p></div>
                        <ArrowLeft size={18} className="text-[#B09882] rotate-180" />
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div>
                  <button onClick={backToList} className="inline-flex items-center gap-2 text-sm text-[#7A6A5E] hover:text-[#2D2926] mb-4"><ArrowLeft size={16} />{t('events_modal_back')}</button>
                  <div className="bg-white/70 border border-[#d9c9b7]/30 rounded-xl p-5 space-y-4">
                    <h3 className="text-2xl font-['Lora',serif]">{locale === 'bm' && selectedEvent.title_bm ? selectedEvent.title_bm : (selectedEvent.title_en || 'Untitled')}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3"><Calendar size={18} className="text-[#B09882]" /><span>{new Date(selectedEvent.date).toLocaleDateString(locale === 'bm' ? 'ms-MY' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                      {selectedEvent.time && <div className="flex items-center gap-3"><Clock size={18} className="text-[#B09882]" /><span>{formatTimeForDisplay(selectedEvent.time)}</span></div>}
                      {selectedEvent.location && <div className="flex items-center gap-3"><MapPinned size={18} className="text-[#B09882]" /><span>{selectedEvent.location}</span></div>}
                      <div className="flex items-center gap-3"><User size={18} className="text-[#B09882]" /><span>{selectedEvent.pic || selectedEvent.contact_person || 'Church Office'}</span></div>
                      {(selectedEvent.description_en || selectedEvent.description_bm) && <div className="pt-2 border-t border-[#d9c9b7]/30"><p className="text-[#5A4E46] text-sm">{locale === 'bm' && selectedEvent.description_bm ? selectedEvent.description_bm : selectedEvent.description_en}</p></div>}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-[#d9c9b7]/40 flex justify-end">
              <button onClick={closeEventsModal} className="px-5 py-2 rounded-full bg-[#2D2926] text-[#FAF8F5] text-sm uppercase tracking-wide hover:bg-[#4A3F38]">{t('events_modal_close')}</button>
            </div>
          </div>
        </div>
      )}

      {/* ========== ROSTER MODAL ========== */}
      {isRosterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#FAF8F5] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#d9c9b7]/40">
              <h2 className="text-xl font-['Lora',serif] text-[#2D2926]">{t('roster_modal_title')}</h2>
              <button onClick={closeRosterModal} className="p-1 hover:bg-[#d9c9b7]/30 rounded-full"><X size={20} className="text-[#7A6A5E]" /></button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* Month dropdown */}
              <div className="mb-6">
                <label className="block text-xs uppercase tracking-wide text-[#B09882] mb-2 font-['DM_Sans',sans-serif]">{t('roster_month')}</label>
                <div className="relative">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full appearance-none bg-white/70 border border-[#d9c9b7]/40 rounded-xl px-4 py-2 pr-10 text-[#2D2926] font-['DM_Sans',sans-serif] focus:outline-none focus:ring-1 focus:ring-[#B09882]"
                  >
                    {availableMonths.length === 0 && <option disabled>{t('roster_no_data')}</option>}
                    {availableMonths.map(month => (
                      <option key={month.value} value={month.value}>{month.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A6A5E] pointer-events-none" />
                </div>
              </div>

              {/* Week tabs (1-4) */}
              <div className="mb-6">
                <label className="block text-xs uppercase tracking-wide text-[#B09882] mb-2 font-['DM_Sans',sans-serif]">{t('roster_week')}</label>
                <div className="flex gap-2">
                  {[1,2,3,4].map(week => (
                    <button
                      key={week}
                      onClick={() => setSelectedWeek(week)}
                      className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedWeek === week
                          ? 'bg-[#2D2926] text-[#FAF8F5]'
                          : 'bg-white/70 border border-[#d9c9b7]/30 text-[#7A6A5E] hover:bg-white'
                      }`}
                    >
                      {week}
                    </button>
                  ))}
                </div>
              </div>

              {/* Roster details */}
              <div className="bg-white/70 border border-[#d9c9b7]/30 rounded-xl p-5">
                {rosterForSelectedWeek ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User size={18} className="text-[#B09882]" />
                      <div>
                        <p className="text-xs uppercase tracking-wide text-[#B09882] font-['DM_Sans',sans-serif]">{t('roster_leader')}</p>
                        <p className="text-[#2D2926] font-medium">{rosterForSelectedWeek.leader || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users size={18} className="text-[#B09882]" />
                      <div>
                        <p className="text-xs uppercase tracking-wide text-[#B09882] font-['DM_Sans',sans-serif]">{t('roster_pianist')}</p>
                        <p className="text-[#2D2926] font-medium">{rosterForSelectedWeek.pianist || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <User size={18} className="text-[#B09882]" />
                      <div>
                        <p className="text-xs uppercase tracking-wide text-[#B09882] font-['DM_Sans',sans-serif]">{t('roster_reader')}</p>
                        <p className="text-[#2D2926] font-medium">{rosterForSelectedWeek.reader || '—'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-[#8A7A6E] py-6">{t('roster_no_data')}</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-[#d9c9b7]/40 flex justify-end">
              <button onClick={closeRosterModal} className="px-5 py-2 rounded-full bg-[#2D2926] text-[#FAF8F5] text-sm uppercase tracking-wide hover:bg-[#4A3F38]">{t('events_modal_close')}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        html { scroll-behavior: smooth; }
        * { box-sizing: border-box; }
        @keyframes bob {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(6px); }
        }
        .animate-bob { animation: bob 2.5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  )
}