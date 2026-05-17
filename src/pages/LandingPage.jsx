import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ChevronLeft, ChevronRight, MapPin, Clock, Phone, X, 
  Calendar, User, MapPinned, ArrowLeft, Users, ChevronDown
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useLocale } from '../contexts/LocaleContext'

// Import Splide styles
import '@splidejs/splide/css'

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

  // States
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [verse, setVerse] = useState({ reference: 'Matthew 11:28', text: 'Come to me...', theme: '' })
  const [events, setEvents] = useState([])
  const [carouselItems, setCarouselItems] = useState([])
  const [splideInitialized, setSplideInitialized] = useState(false)

  // Events modal
  const [isEventsModalOpen, setIsEventsModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)

  // Roster modal
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false)
  const [rosters, setRosters] = useState([])
  const [rosterMap, setRosterMap] = useState({})
  const [availableMonths, setAvailableMonths] = useState([])
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedWeek, setSelectedWeek] = useState(1)

  const getNavText = (item) => (locale === 'bm' ? item.bm : item.en)

  // Load all data
  useEffect(() => {
    loadContent()
  }, [])

  // Initialize Splide carousel
useEffect(() => {
  let splide = null
  
  const initSplide = async () => {
    if (carouselItems.length === 0) return
    
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const container = document.querySelector('.splide-carousel')
    if (!container || splide) return
    
    try {
      const Splide = (await import('@splidejs/splide')).default
      
      splide = new Splide('.splide-carousel', {
        type: 'slide',
        perPage: 1,
        perMove: 1,
        gap: '0rem',
        focus: 'center',
        speed: 600,
        rewind: true,
        rewindSpeed: 400,
        pagination: true,
        arrows: false,
        dragAngleThreshold: 30,
        updateOnMove: true,
        trimSpace: false,
        // Add these for better touch handling
        wheel: false,
        waitForTransition: false,
      })
      
      splide.mount()
      window.splideInstance = splide
      setSplideInitialized(true)
      
    } catch (err) {
      console.error('Splide initialization failed:', err)
    }
  }
  
  const timeoutId = setTimeout(initSplide, 200)
  
  return () => {
    clearTimeout(timeoutId)
    if (splide) {
      splide.destroy()
      window.splideInstance = null
    }
  }
}, [carouselItems.length])

  // Custom navigation for carousel
useEffect(() => {
  if (!splideInitialized) return
  
  // Small delay to ensure DOM is ready
  const timer = setTimeout(() => {
    const prevButtons = document.querySelectorAll('.custom-prev')
    const nextButtons = document.querySelectorAll('.custom-next')
    
    const handlePrev = (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (window.splideInstance) {
        window.splideInstance.go('<')
      }
    }
    
    const handleNext = (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (window.splideInstance) {
        window.splideInstance.go('>')
      }
    }
    
    // Desktop arrows (have class .carousel-arrow-desktop)
    const desktopPrev = document.querySelector('.carousel-arrow-left')
    const desktopNext = document.querySelector('.carousel-arrow-right')
    
    if (desktopPrev) {
      desktopPrev.removeEventListener('click', handlePrev)
      desktopPrev.addEventListener('click', handlePrev)
    }
    if (desktopNext) {
      desktopNext.removeEventListener('click', handleNext)
      desktopNext.addEventListener('click', handleNext)
    }
    
    // Mobile arrows (inside card)
    prevButtons.forEach(btn => {
      btn.removeEventListener('click', handlePrev)
      btn.addEventListener('click', handlePrev)
    })
    nextButtons.forEach(btn => {
      btn.removeEventListener('click', handleNext)
      btn.addEventListener('click', handleNext)
    })
  }, 100)
  
  return () => {
    clearTimeout(timer)
    const prevButtons = document.querySelectorAll('.custom-prev')
    const nextButtons = document.querySelectorAll('.custom-next')
    const desktopPrev = document.querySelector('.carousel-arrow-left')
    const desktopNext = document.querySelector('.carousel-arrow-right')
    
    const handlePrev = (e) => {
      if (window.splideInstance) window.splideInstance.go('<')
    }
    const handleNext = (e) => {
      if (window.splideInstance) window.splideInstance.go('>')
    }
    
    if (desktopPrev) desktopPrev.removeEventListener('click', handlePrev)
    if (desktopNext) desktopNext.removeEventListener('click', handleNext)
    prevButtons.forEach(btn => btn.removeEventListener('click', handlePrev))
    nextButtons.forEach(btn => btn.removeEventListener('click', handleNext))
  }
}, [splideInitialized])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  useEffect(() => {
    if (isEventsModalOpen || isRosterModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isEventsModalOpen, isRosterModalOpen])

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
    try {
      const { data, error } = await supabase
        .from('verse_library')
        .select('*')
      
      if (!error && data && data.length > 0) {
        const shuffled = [...data]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        const randomVerses = shuffled.slice(0, 3)
        
        const carouselData = randomVerses.map((vItem, index) => ({
          id: vItem.id,
          image_url: `/placeholder-${(index % 3) + 1}.jpg`,
          title_en: vItem.reference,
          title_bm: vItem.reference,
          description_en: vItem.text,
          description_bm: vItem.text,
          theme: vItem.theme || 'Bible Verse'
        }))
        
        setCarouselItems(carouselData)
      } else {
        setCarouselItems([
          { id: 1, image_url: '/placeholder-1.jpg', title_en: 'Psalm 23:1', title_bm: 'Mazmur 23:1', description_en: 'The Lord is my shepherd; I shall not want.', description_bm: 'Tuhan adalah gembalaku; aku tidak kekurangan apa pun.', theme: 'Psalm' },
          { id: 2, image_url: '/placeholder-2.jpg', title_en: 'John 3:16', title_bm: 'Yohanes 3:16', description_en: 'For God so loved the world that He gave His only Son.', description_bm: 'Karena begitu besar kasih Allah akan dunia ini, sehingga Ia mengaruniakan Anak-Nya yang tunggal.', theme: 'Gospel' },
          { id: 3, image_url: '/placeholder-3.jpg', title_en: 'Philippians 4:13', title_bm: 'Filipi 4:13', description_en: 'I can do all things through Christ who strengthens me.', description_bm: 'Segala perkara dapat kutanggung di dalam Dia yang memberi kekuatan kepadaku.', theme: 'Encouragement' },
        ])
      }
    } catch (error) {
      console.error('Error loading carousel verses:', error)
      setCarouselItems([
        { id: 1, image_url: '/placeholder-1.jpg', title_en: 'Psalm 23:1', title_bm: 'Mazmur 23:1', description_en: 'The Lord is my shepherd; I shall not want.', description_bm: 'Tuhan adalah gembalaku; aku tidak kekurangan apa pun.', theme: 'Psalm' },
        { id: 2, image_url: '/placeholder-2.jpg', title_en: 'John 3:16', title_bm: 'Yohanes 3:16', description_en: 'For God so loved the world that He gave His only Son.', description_bm: 'Karena begitu besar kasih Allah akan dunia ini, sehingga Ia mengaruniakan Anak-Nya yang tunggal.', theme: 'Gospel' },
        { id: 3, image_url: '/placeholder-3.jpg', title_en: 'Philippians 4:13', title_bm: 'Filipi 4:13', description_en: 'I can do all things through Christ who strengthens me.', description_bm: 'Segala perkara dapat kutanggung di dalam Dia yang memberi kekuatan kepadaku.', theme: 'Encouragement' },
      ])
    }
  }

  const loadRosters = async () => {
    const { data, error } = await supabase
      .from('roster')
      .select('*')
      .order('week_start', { ascending: true })

    if (!error && data) {
      setRosters(data)
      const monthsSet = new Set()
      const map = {}

      data.forEach(roster => {
        if (!roster.week_start) return
        const [year, month, day] = roster.week_start.split('-').map(Number)
        const monthStr = `${year}-${String(month).padStart(2, '0')}`

        const firstDayOfMonth = new Date(Date.UTC(year, month-1, 1))
        const firstMondayUTC = new Date(Date.UTC(year, month-1, 1))
        const firstDayOfWeek = firstDayOfMonth.getUTCDay()
        const daysToMonday = firstDayOfWeek === 0 ? 1 : (8 - firstDayOfWeek) % 7
        firstMondayUTC.setUTCDate(1 + daysToMonday)

        const rosterDateUTC = new Date(Date.UTC(year, month-1, day))
        const diffDays = Math.floor((rosterDateUTC - firstMondayUTC) / (1000 * 60 * 60 * 24))
        const weekNumber = Math.floor(diffDays / 7) + 1
        if (weekNumber >= 1 && weekNumber <= 4) {
          const key = `${monthStr}-${weekNumber}`
          map[key] = roster
        }

        const monthName = new Date(Date.UTC(year, month-1, 1)).toLocaleString(
          locale === 'bm' ? 'ms-MY' : 'en-US',
          { month: 'long', year: 'numeric' }
        )
        monthsSet.add(JSON.stringify({ value: monthStr, label: monthName }))
      })

      const monthsArray = Array.from(monthsSet).map(m => JSON.parse(m))
      monthsArray.sort((a,b) => a.value.localeCompare(b.value))

      setAvailableMonths(monthsArray)
      setRosterMap(map)
      if (monthsArray.length > 0) {
        setSelectedMonth(monthsArray[0].value)
      }
    }
  }

  const getRosterForWeek = (weekNumber) => {
    if (!selectedMonth) return null
    const key = `${selectedMonth}-${weekNumber}`
    return rosterMap[key] || null
  }

  const rosterForSelectedWeek = getRosterForWeek(selectedWeek)

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

      {/* ========== NAVBAR ========== */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-5 ${scrolled ? 'bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#d9c9b7]/20' : 'bg-transparent border-b border-transparent'}`}>
        <div className="max-w-6xl mx-auto h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.webp" alt="GBT" className="h-8 w-auto object-contain" />
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
      <section
        id="home"
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden bg-gradient-to-b from-[#FAF8F5] to-[#F0E9DF]"
      >
        {/* Ambient Orbs */}
        <div className="absolute top-[8%] left-[-5%] w-[260px] h-[260px] rounded-full bg-[radial-gradient(circle,rgba(210,185,160,0.25)_0%,transparent_70%)]" />
        <div className="absolute bottom-[10%] right-[-8%] w-[320px] h-[320px] rounded-full bg-[radial-gradient(circle,rgba(185,160,130,0.18)_0%,transparent_70%)]" />

        {/* Large Cross Logo Background */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: "url('/logo_2.webp')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right center",
            backgroundSize: "auto 60%",
            opacity: 0.07,
          }}
        />

        <div className="relative z-10 w-full max-w-3xl mx-auto">
          
          {/* VERSE WRAPPER */}
          <div className="hero-verse-wrapper mx-auto mb-6 min-h-[100px] flex items-center justify-center">
            <blockquote className="w-full">
              <p 
                className="hero-verse-text italic text-[clamp(1rem,3vw,1.5rem)] leading-relaxed tracking-[-0.01em] text-[#2D2926] mb-3 font-['Lora',serif] text-center"
                style={{
                  overflowWrap: 'break-word',
                  wordWrap: 'break-word',
                }}
              >
                "{verse.text}"
              </p>
              <cite className="uppercase tracking-[0.3em] text-[9px] text-[#B09882] not-italic font-['DM_Sans',sans-serif]">
                {verse.reference}
              </cite>
            </blockquote>
          </div>

          {/* WELCOME BUTTON */}
          <div className="hero-button-group mb-8">
            <a
              href="#about"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#2D2926] text-[#FAF8F5] uppercase tracking-[0.12em] text-sm font-medium transition-all duration-300 hover:bg-[#4A3F38] hover:scale-[1.02] shadow-lg shadow-black/10 font-['DM_Sans',sans-serif]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M15 3H19C19.5523 3 20 3.44772 20 4V20C20 20.5523 19.5523 21 19 21H15"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              {t('welcome_cta')}
            </a>
          </div>

          {/* QUICK ACTION CARDS */}
          <div className="hero-button-group flex flex-wrap justify-center gap-3 mb-12">
            <button
              onClick={openEventsModal}
              className="min-w-[100px] rounded-xl px-4 py-3 bg-white/70 border border-[#d9c9b7]/30 backdrop-blur-sm flex flex-col items-center gap-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 cursor-pointer"
            >
              <Calendar size={18} stroke="#7A6A5E" strokeWidth="1.5" />
              <span className="uppercase tracking-[0.18em] text-[9px] text-[#7A6A5E] font-medium font-['DM_Sans',sans-serif]">
                {t('events_button')}
              </span>
            </button>
            <button
              onClick={openRosterModal}
              className="min-w-[100px] rounded-xl px-4 py-3 bg-white/70 border border-[#d9c9b7]/30 backdrop-blur-sm flex flex-col items-center gap-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 cursor-pointer"
            >
              <Users size={18} stroke="#7A6A5E" strokeWidth="1.5" />
              <span className="uppercase tracking-[0.18em] text-[9px] text-[#7A6A5E] font-medium font-['DM_Sans',sans-serif]">
                {t('roster_button')}
              </span>
            </button>
          </div>

          {/* SPLIDE CAROUSEL - Single Card, No Images, Wide Format */}
          {carouselItems.length > 0 && (
  <div className="hero-carousel-outer">
    <div className="splide-carousel splide hero-carousel-bar" aria-label="Announcements">
      <p className="carousel-section-label">Announcements</p>

      {/* Pagination dots — top right, rendered by Splide into .splide__pagination via CSS repositioning */}
      <div className="splide__track">
        <ul className="splide__list">
          {carouselItems.map((item, idx) => (
            <li key={item.id || idx} className="splide__slide">
              <div className="announcement-card">
                <span className="card-theme-pill">{item.theme || 'Announcement'}</span>
                <h3 className="card-title">
                  {locale === 'bm' && item.title_bm ? item.title_bm : item.title_en}
                </h3>
                <p className="card-body-text">
                  {locale === 'bm' && item.description_bm
                    ? item.description_bm
                    : (item.description_en || '')}
                </p>

                {/* Bottom row: CTA left, arrows right (mobile) / arrows protruding (desktop) */}
                <div className="card-bottom-row">
                  <button className="card-cta-btn">{t('learn_more') || 'Read more'} ›</button>
                  <div className="card-mobile-arrows">
                    <button className="custom-prev card-arrow-sm" aria-label="Previous slide">
                      <ChevronLeft size={16} />
                    </button>
                    <button className="custom-next card-arrow-sm" aria-label="Next slide">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Desktop arrows — half outside the bar */}
      <button className="custom-prev carousel-arrow-desktop carousel-arrow-left" aria-label="Previous slide">
        <ChevronLeft size={20} />
      </button>
      <button className="custom-next carousel-arrow-desktop carousel-arrow-right" aria-label="Next slide">
        <ChevronRight size={20} />
      </button>
    </div>
  </div>
)}
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="px-6 py-20 md:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <p className="uppercase tracking-[0.3em] text-[10px] text-[#B09882] mb-6 font-['DM_Sans',sans-serif]">{t('nav_about')}</p>
          <h2 className="text-[clamp(1.9rem,5vw,3rem)] leading-tight tracking-[-0.02em] mb-6 text-[#2D2926] font-['Lora',serif] font-normal">{t('about_tagline')}</h2>
          <p className="text-[#7A6E66] leading-8 text-[15px] md:text-[17px] max-w-2xl mx-auto font-light font-['DM_Sans',sans-serif]">{t('about_text')}</p>
          <div className="flex items-center justify-center gap-3 mt-10"><div className="w-10 h-px bg-[#b49b7d]/40" /><div className="w-[5px] h-[5px] rounded-full border border-[#b49b7d]/50" /><div className="w-10 h-px bg-[#b49b7d]/40" /></div>
        </div>
      </section>

      {/* FOOTER */}
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

      {/* EVENTS MODAL */}
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

      {/* ROSTER MODAL */}
      {isRosterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#FAF8F5] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-[#d9c9b7]/40">
              <h2 className="text-xl font-['Lora',serif] text-[#2D2926]">{t('roster_modal_title')}</h2>
              <button onClick={closeRosterModal} className="p-1 hover:bg-[#d9c9b7]/30 rounded-full"><X size={20} className="text-[#7A6A5E]" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
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
  50%       { transform: translateX(-50%) translateY(6px); }
}
.animate-bob { animation: bob 2.5s ease-in-out infinite; }

/* ── CAROUSEL OUTER ── */
.hero-carousel-outer {
  position: relative;
  width: 100%;
  margin-top: 1.5rem;
  padding: 0 1.25rem;
}

/* Mobile: Option A - edge-to-edge with small margins for rounded corners */
@media (max-width: 640px) {
  .hero-carousel-outer {
    padding: 0 0.5rem;
    margin-top: 1rem;
    margin-bottom: 0;
  }
}

/* ── BAR SHAPE ── */
.hero-carousel-bar {
  background: rgba(35, 31, 28, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(201, 168, 130, 0.3);
  border-radius: 1.25rem;
  padding: 1.4rem 3.75rem;
  position: relative;
  overflow: visible !important;
  transition: all 0.3s ease;
}

/* Mobile: rounded corners with small side margins */
@media (max-width: 640px) {
  .hero-carousel-bar {
    border-radius: 20px;
    padding: 1rem 1rem 0.75rem;
    margin-bottom: 0;
  }
}

/* Section label */
.carousel-section-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 9px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: #C9A882;
  margin: 0 0 0.5rem;
  text-align: left;
}

/* Splide pagination repositioned to top-right */
.hero-carousel-bar .splide__pagination {
  position: absolute !important;
  top: 1rem !important;
  right: 1.25rem !important;
  bottom: auto !important;
  left: auto !important;
  gap: 5px;
  padding: 0;
}

@media (max-width: 640px) {
  .hero-carousel-bar .splide__pagination {
    top: 0.75rem !important;
    right: 1rem !important;
  }
}

.hero-carousel-bar .splide__pagination__page {
  width: 5px;
  height: 5px;
  background: rgba(201, 168, 130, 0.5);
  border-radius: 999px;
  border: none;
  transition: width 0.3s, background 0.3s;
  margin: 0 2px;
}

.hero-carousel-bar .splide__pagination__page.is-active {
  width: 14px;
  background: #C9A882;
  transform: none;
}

/* ── SLIDE CARD ── */
.announcement-card {
  text-align: left;
  min-height: 90px;
}

@media (max-width: 640px) {
  .announcement-card {
    min-height: auto;
  }
}

.card-theme-pill {
  display: inline-block;
  background: rgba(201, 168, 130, 0.2);
  color: #C9A882;
  font-family: 'DM Sans', sans-serif;
  font-size: 9px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 999px;
  margin-bottom: 0.45rem;
}

.card-title {
  font-family: 'Lora', serif;
  font-size: 1.2rem;
  color: #FFFFFF;
  margin: 0 0 0.35rem;
  line-height: 1.3;
}

.card-body-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.65;
  font-style: italic;
  border-left: 2px solid rgba(201, 168, 130, 0.4);
  padding-left: 0.75rem;
  margin: 0;
}

/* Bottom row: CTA + mobile arrows */
.card-bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
}

@media (max-width: 640px) {
  .card-bottom-row {
    margin-top: 0.75rem;
  }
}

.card-cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 14px;
  border-radius: 999px;
  border: 1px solid rgba(201, 168, 130, 0.5);
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #C9A882;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}

.card-cta-btn:hover {
  background: #C9A882;
  color: #2D2926;
  border-color: #C9A882;
}

/* Mobile arrows (bottom-right, inside card) */
.card-mobile-arrows {
  display: none;
  gap: 6px;
}

.card-arrow-sm {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(201, 168, 130, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #C9A882;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.card-arrow-sm:hover {
  background: #C9A882;
  color: #2D2926;
}

/* Desktop arrows — half outside the bar, vertically centred */
.carousel-arrow-desktop {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(201, 168, 130, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #C9A882;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
  z-index: 10;
}

.carousel-arrow-desktop:hover {
  background: #C9A882;
  color: #2D2926;
  border-color: #C9A882;
}

.carousel-arrow-left {
  left: -18px;
}

.carousel-arrow-right {
  right: -18px;
}

/* ── MOBILE OVERRIDES ── */
@media (max-width: 640px) {
  .carousel-arrow-desktop {
    display: none;
  }
  
  .card-mobile-arrows {
    display: flex;
  }
  
  /* Remove all extra spacing below carousel */
  .hero-carousel-bar .splide__track {
    margin-bottom: 0;
    padding-bottom: 0;
  }
  
  .hero-carousel-bar .splide__list {
    margin-bottom: 0;
    padding-bottom: 0;
  }
  
  .splide__slide {
    margin-bottom: 0;
    padding-bottom: 0;
  }
}
`}</style>
    </div>
  )
}