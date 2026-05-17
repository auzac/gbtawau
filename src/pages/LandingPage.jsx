// src/pages/LandingPage.jsx
// Soul Church–inspired redesign – FIXED carousel arrows + video fallback + no emoji
// Preserves: all Supabase hooks, Events modal, Roster modal, useLocale, routing

import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X, Calendar, User, MapPinned, ArrowLeft, Users, ChevronDown,
  Clock, MapPin, Phone, ChevronLeft, ChevronRight, Heart
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useLocale } from '../contexts/LocaleContext'
import '@splidejs/splide/css'

// ─── CONFIG ────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { en: 'Home',   bm: 'Utama',         href: '#home' },
  { en: 'About',  bm: 'Tentang Kami',  href: '#about' },
  { en: 'Events', bm: 'Acara',         href: '#events', isModal: true },
  { en: 'Roster', bm: 'Petugas',       href: '#roster', isModal: true },
  { en: 'Lyrics', bm: 'Lirik',         href: '/lyrics' },
  { en: 'Staff',  bm: 'Kakitangan',    href: '/login',  isRouterLink: true },
]

const HOW_WE_DO = [
  { title: 'Placeholder 1', body: 'This is a temporary card while we fix the carousel layout.', cta: 'Learn more', href: '#about' },
  { title: 'Placeholder 2', body: 'We will replace this with real content soon.', cta: 'Learn more', href: '#about' },
  { title: 'Placeholder 3', body: 'Thank you for your patience – the proper design is coming.', cta: 'Learn more', href: '#about' },
  { title: 'Placeholder 4', body: 'You can still use the Events and Roster modals below.', cta: 'Learn more', href: '#about' },
];

const MARQUEE_VALUES = [
  'Christ Centred', 'People Empowering', 'Life Giving', 'Outward Focused', 'Spirit of Excellence',
]

// ─── HELPERS ───────────────────────────────────────────────────────────────────

const formatTimeForDisplay = (time24) => {
  if (!time24) return ''
  const [hour, minute] = time24.split(':')
  const h = parseInt(hour)
  const period = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${minute} ${period}`
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

// ─── COMPONENT ─────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate()
  const { t, locale, toggleLocale } = useLocale()

  // UI state
  const [menuOpen, setMenuOpen]   = useState(false)
  const [scrolled, setScrolled]   = useState(false)
  const [loading, setLoading]     = useState(true)
  const [videoError, setVideoError] = useState(false)  // fallback to static image

  // Data state
  const [verse, setVerse]               = useState({ reference: '', text: '', theme: '' })
  const [events, setEvents]             = useState([])
  const [carouselItems, setCarouselItems] = useState([])

  // Events modal
  const [isEventsModalOpen, setIsEventsModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent]         = useState(null)

  // Roster modal
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false)
  const [rosters, setRosters]                     = useState([])
  const [rosterMap, setRosterMap]                 = useState({})
  const [availableMonths, setAvailableMonths]     = useState([])
  const [selectedMonth, setSelectedMonth]         = useState('')
  const [selectedWeek, setSelectedWeek]           = useState(1)

  // Splide refs
  const whatsOnSplideRef  = useRef(null)
  const howWeSplideRef    = useRef(null)

  const getNavText = (item) => (locale === 'bm' ? item.bm : item.en)

  // ── Data loading (unchanged) ─────────────────────────────────────────────────

  useEffect(() => {
    loadContent()
  }, [])

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
      .order('created_at', { ascending: true })
    if (!error && data && data.length > 0) setCarouselItems(data)
    else setCarouselItems([])
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

        const firstMondayUTC = new Date(Date.UTC(year, month - 1, 1))
        const firstDayOfWeek = firstMondayUTC.getUTCDay()
        const daysToMonday = firstDayOfWeek === 0 ? 1 : (8 - firstDayOfWeek) % 7
        firstMondayUTC.setUTCDate(1 + daysToMonday)

        const rosterDateUTC = new Date(Date.UTC(year, month - 1, day))
        const diffDays = Math.floor((rosterDateUTC - firstMondayUTC) / (1000 * 60 * 60 * 24))
        const weekNumber = Math.floor(diffDays / 7) + 1
        if (weekNumber >= 1 && weekNumber <= 4) {
          map[`${monthStr}-${weekNumber}`] = roster
        }

        const monthName = new Date(Date.UTC(year, month - 1, 1)).toLocaleString(
          locale === 'bm' ? 'ms-MY' : 'en-US',
          { month: 'long', year: 'numeric' }
        )
        monthsSet.add(JSON.stringify({ value: monthStr, label: monthName }))
      })

      const monthsArray = Array.from(monthsSet).map(m => JSON.parse(m))
      monthsArray.sort((a, b) => a.value.localeCompare(b.value))

      setAvailableMonths(monthsArray)
      setRosterMap(map)
      if (monthsArray.length > 0) setSelectedMonth(monthsArray[0].value)
    }
  }

  const getRosterForWeek = (weekNumber) => {
    if (!selectedMonth) return null
    return rosterMap[`${selectedMonth}-${weekNumber}`] || null
  }
  const rosterForSelectedWeek = getRosterForWeek(selectedWeek)

  // ── Scroll handler ────────────────────────────────────────────────────────────

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── Body scroll lock ──────────────────────────────────────────────────────────

  useEffect(() => {
    document.body.style.overflow = (menuOpen || isEventsModalOpen || isRosterModalOpen) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen, isEventsModalOpen, isRosterModalOpen])

  // ── "What's On" Splide (hero thumbnail) – FIXED arrows ────────────────────────
  // Now uses `arrows: false` and manually attaches click handlers to custom buttons
  useEffect(() => {
    if (carouselItems.length === 0) return
    let splide = null

    const init = async () => {
      await new Promise(r => setTimeout(r, 150))
      const el = document.getElementById('whats-on-splide')
      if (!el) return
      try {
        const Splide = (await import('@splidejs/splide')).default
        splide = new Splide(el, {
          perPage: 1,
          perMove: 1,
          type: 'slide',
          speed: 900,
          rewind: true,
          pagination: false,     // we use our own dots
          arrows: false,         // we use custom arrow buttons
          gap: 0,
          waitForTransition: false,
          updateOnMove: true,
        })
        splide.mount()
        whatsOnSplideRef.current = splide

        // Attach event listeners for custom arrows
        const prevBtn = document.querySelector('.whats-on-arrow-prev')
        const nextBtn = document.querySelector('.whats-on-arrow-next')
        const handlePrev = () => splide.go('<')
        const handleNext = () => splide.go('>')
        if (prevBtn) {
          prevBtn.removeEventListener('click', handlePrev)
          prevBtn.addEventListener('click', handlePrev)
        }
        if (nextBtn) {
          nextBtn.removeEventListener('click', handleNext)
          nextBtn.addEventListener('click', handleNext)
        }
      } catch (e) {
        console.error('WhatsOn Splide error:', e)
      }
    }

    init()
    return () => {
      if (whatsOnSplideRef.current) {
        whatsOnSplideRef.current.destroy()
        whatsOnSplideRef.current = null
      }
      // Cleanup listeners
      const prevBtn = document.querySelector('.whats-on-arrow-prev')
      const nextBtn = document.querySelector('.whats-on-arrow-next')
      const handlePrev = () => {}
      const handleNext = () => {}
      if (prevBtn) prevBtn.removeEventListener('click', handlePrev)
      if (nextBtn) nextBtn.removeEventListener('click', handleNext)
    }
  }, [carouselItems.length])

  // ── "How We Do Church" Splide (unchanged, arrows working) ─────────────────────
  useEffect(() => {
    let splide = null
    const init = async () => {
      await new Promise(r => setTimeout(r, 200))
      const el = document.getElementById('how-we-splide')
      if (!el) return
      try {
        const Splide = (await import('@splidejs/splide')).default
        splide = new Splide(el, {
          perPage: 3,
          perMove: 1,
          type: 'slide',
          gap: '1.5rem',
          speed: 600,
          rewind: true,
          pagination: false,
          arrows: false,         // we use custom buttons
          trimSpace: false,
          breakpoints: {
            1024: { perPage: 2 },
            640:  { perPage: 1 },
          },
        })
        splide.mount()
        howWeSplideRef.current = splide

        // Attach custom arrow handlers
        const prevBtn = document.querySelector('.how-we-arrow-prev')
        const nextBtn = document.querySelector('.how-we-arrow-next')
        const handlePrev = () => splide.go('<')
        const handleNext = () => splide.go('>')
        if (prevBtn) {
          prevBtn.removeEventListener('click', handlePrev)
          prevBtn.addEventListener('click', handlePrev)
        }
        if (nextBtn) {
          nextBtn.removeEventListener('click', handleNext)
          nextBtn.addEventListener('click', handleNext)
        }
      } catch (e) {
        console.error('HowWe Splide error:', e)
      }
    }
    init()
    return () => {
      if (howWeSplideRef.current) {
        howWeSplideRef.current.destroy()
        howWeSplideRef.current = null
      }
    }
  }, [])

  // ── Modal helpers ─────────────────────────────────────────────────────────────

  const openEventsModal  = () => { setSelectedEvent(null); setIsEventsModalOpen(true) }
  const closeEventsModal = () => { setIsEventsModalOpen(false); setSelectedEvent(null) }
  const openRosterModal  = () => setIsRosterModalOpen(true)
  const closeRosterModal = () => setIsRosterModalOpen(false)

  // ─── LOADING ───────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5EFE6] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black/10 border-t-black rounded-full animate-spin" />
      </div>
    )
  }

  // ─── RENDER ────────────────────────────────────────────────────────────────────

  return (
    <div className="sc-page bg-[#F5EFE6] text-black overflow-x-hidden">

      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Darker+Grotesque:wght@400;500;600;700;800;900&family=DM+Sans:wght@300;400;500&display=swap"
        rel="stylesheet"
      />

      {/* ══════════════════════════════════════════════
          FIXED BOTTOM BAR
      ══════════════════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-black/10 h-11 flex items-center overflow-hidden select-none">
        {/* Service times — left */}
        <div className="hidden md:flex items-center shrink-0 border-r border-black/10 h-full px-4 gap-3">
          <span className="sc-label text-[10px] uppercase tracking-[0.2em] text-black/50 whitespace-nowrap">Sunday Services</span>
          <span className="sc-pipe text-black/20">|</span>
          <span className="sc-label text-[10px] uppercase tracking-[0.2em] whitespace-nowrap">9am</span>
          <span className="sc-pipe text-black/20">|</span>
          <span className="sc-label text-[10px] uppercase tracking-[0.2em] whitespace-nowrap">11.30am</span>
          <span className="sc-pipe text-black/20">|</span>
          <span className="sc-label text-[10px] uppercase tracking-[0.2em] whitespace-nowrap">5pm (once a month)</span>
          <span className="sc-pipe text-black/20">|</span>
          <a href="#" className="sc-label text-[10px] uppercase tracking-[0.2em] whitespace-nowrap flex items-center gap-1 hover:opacity-60 transition-opacity">
            {t('footer_worship') || 'Watch Online'} <span className="text-[8px]">▶</span>
          </a>
        </div>

        {/* Marquee ticker — center */}
        <div className="flex-1 overflow-hidden relative">
          <div className="sc-marquee-track flex items-center gap-8 whitespace-nowrap animate-marquee">
            {[...MARQUEE_VALUES, ...MARQUEE_VALUES, ...MARQUEE_VALUES].map((v, i) => (
              <React.Fragment key={i}>
                <span className="text-[10px] uppercase tracking-[0.2em] text-black/60">{v}</span>
                <span className="text-black/30 text-[10px]">–</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Scroll down — right */}
        <div className="hidden lg:flex items-center gap-2 shrink-0 border-l border-black/10 h-full px-4">
          <span className="text-[10px] uppercase tracking-[0.2em] text-black/50">Scroll down</span>
          <span className="text-black/40 animate-bounce-y text-xs">↓</span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-5 md:px-8 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-black/5' : ''}`}>
        <div className="max-w-screen-xl mx-auto h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="#home" className="flex items-center">
            <img src="/logo.webp" alt="GBT" className="h-9 w-auto object-contain" />
          </a>

          {/* Right: locale toggle + menu pill */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLocale}
              className="h-8 px-4 rounded-full border border-black/20 text-[10px] uppercase tracking-[0.18em] font-medium transition-all hover:bg-black hover:text-white hover:border-black"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {locale === 'en' ? 'BM' : 'EN'}
            </button>
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu"
              className={`flex items-center gap-2 h-9 px-4 rounded-full border transition-all duration-300 ${
                menuOpen
                  ? 'bg-black text-white border-black'
                  : 'bg-white/90 text-black border-black/20 hover:bg-black hover:text-white hover:border-black'
              }`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <span className="text-[10px] uppercase tracking-[0.18em] font-medium">{menuOpen ? 'Close' : 'Menu'}</span>
              <div className="flex flex-col gap-[4px]">
                <span className={`block w-[14px] h-[1.5px] bg-current rounded-full transition-all duration-300 origin-center ${menuOpen ? 'rotate-45 translate-y-[2.75px]' : ''}`} />
                <span className={`block w-[14px] h-[1.5px] bg-current rounded-full transition-all duration-300 origin-center ${menuOpen ? '-rotate-45 -translate-y-[2.75px]' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════
          FULLSCREEN MENU — linen background, massive type
      ══════════════════════════════════════════════ */}
      <div
        className={`fixed inset-0 z-40 bg-[#E8E0D5] flex transition-all duration-500 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Left col — nav links */}
        <div className="flex-1 flex flex-col justify-center pl-10 md:pl-16 lg:pl-24 pt-20 pb-14 border-r border-black/10">
          <div className="space-y-1">
            {NAV_LINKS.map((item, i) => (
              <div
                key={item.en}
                className={`overflow-hidden transition-all duration-500 ${menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{ transitionDelay: `${i * 55 + 80}ms` }}
              >
                {item.isModal && item.en === 'Events' ? (
                  <button
                    onClick={() => { setMenuOpen(false); openEventsModal() }}
                    className="sc-menu-link block text-left hover:opacity-40 transition-opacity duration-200"
                    style={{ fontFamily: "'Darker Grotesque', sans-serif", fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', fontWeight: 800, lineHeight: 1.05 }}
                  >
                    {getNavText(item)}
                  </button>
                ) : item.isModal && item.en === 'Roster' ? (
                  <button
                    onClick={() => { setMenuOpen(false); openRosterModal() }}
                    className="sc-menu-link block text-left hover:opacity-40 transition-opacity duration-200"
                    style={{ fontFamily: "'Darker Grotesque', sans-serif", fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', fontWeight: 800, lineHeight: 1.05 }}
                  >
                    {getNavText(item)}
                  </button>
                ) : item.isRouterLink ? (
                  <button
                    onClick={() => { setMenuOpen(false); navigate(item.href) }}
                    className="sc-menu-link block text-left hover:opacity-40 transition-opacity duration-200"
                    style={{ fontFamily: "'Darker Grotesque', sans-serif", fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', fontWeight: 800, lineHeight: 1.05 }}
                  >
                    {getNavText(item)}
                  </button>
                ) : (
                  <a
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="sc-menu-link block hover:opacity-40 transition-opacity duration-200"
                    style={{ fontFamily: "'Darker Grotesque', sans-serif", fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', fontWeight: 800, lineHeight: 1.05 }}
                  >
                    {getNavText(item)}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right col — contact + social */}
        <div className="hidden md:flex w-[38%] lg:w-[34%] flex-col justify-between pl-10 lg:pl-16 pt-24 pb-14 pr-10">
          {/* Contact info */}
          <div className="space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-black/40 mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>Address</p>
              <p className="text-sm leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                GBT Church<br />
                {t('footer_address') || 'Jalan Kuhara, 91000 Tawau, Sabah'}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-black/40 mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>Contact</p>
              <p className="text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>{t('footer_phone') || '—'}</p>
            </div>
          </div>

          {/* Social links */}
          <div className="flex flex-col gap-1">
            {['Facebook', 'Instagram', 'YouTube'].map(soc => (
              <a key={soc} href="#" className="text-sm hover:opacity-40 transition-opacity" style={{ fontFamily: "'DM Sans', sans-serif" }}>{soc}</a>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          HERO — full-viewport, video bg (with fallback), "What's On" card
      ══════════════════════════════════════════════ */}
      <section id="home" className="relative min-h-screen overflow-hidden bg-black">
  {/* Video background – unchanged */}
  {!videoError ? (
    <video
      className="absolute inset-0 w-full h-full object-cover opacity-70"
      autoPlay
      loop
      muted
      playsInline
      poster="/hero-poster.jpg"
      onError={() => setVideoError(true)}
    >
      <source src="/hero.mp4" type="video/mp4" />
    </video>
  ) : (
    <div
      className="absolute inset-0 bg-cover bg-center opacity-70"
      style={{ backgroundImage: "url('/backdrop.webp')" }}
    />
  )}

  {/* Gradient overlays */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />
  <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

  {/* Main content – flex column, no absolute positioning for carousel */}
  <div className="relative z-10 max-w-7xl mx-auto px-5 flex flex-col min-h-screen justify-between py-12 md:py-16">
    {/* Top section: verse and optional content (centred) */}
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      {verse.text && (
        <div className="max-w-xl mx-auto mb-8">
          <p className="text-white/80 italic text-lg md:text-xl leading-relaxed"
             style={{ fontFamily: "'Darker Grotesque', sans-serif", fontWeight: 500 }}>
            "{verse.text}"
          </p>
          <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] mt-3"
             style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {verse.reference}
          </p>
        </div>
      )}

      {/* Welcome button & quick actions – optional, keep if you want */}
      <div className="hero-button-group mb-8">
        <a
          href="#about"
          className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white text-black text-[13px] uppercase tracking-[0.18em] font-medium hover:bg-white/90 transition"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {t('welcome_cta') || 'Welcome Home'}
        </a>
      </div>

      {/* Quick action pills – mobile only (or keep both) */}
      <div className="flex flex-wrap justify-center gap-3 md:hidden">
        <button onClick={openEventsModal} className="px-4 py-2 rounded-full bg-white/90 text-black text-[10px] uppercase tracking-wide">
          {t('events_button') || 'Events'}
        </button>
        <button onClick={openRosterModal} className="px-4 py-2 rounded-full bg-white/90 text-black text-[10px] uppercase tracking-wide">
          {t('roster_button') || 'Roster'}
        </button>
      </div>
    </div>

    {/* Bottom: Carousel – now in normal flow, not absolute */}
    <div className="w-full pb-8 md:pb-12 mt-8">
      {carouselItems.length > 0 && (
        <div className="hero-carousel-wrapper">
          <div id="whats-on-splide" className="splide whats-on-slider">
            <div className="splide__track">
              <ul className="splide__list">
                {carouselItems.map((item, idx) => (
                  <li key={item.id || idx} className="splide__slide">
                    <div className="whats-on-card">
                      <p className="card-label">WHAT'S ON</p>
                      <h3 className="card-title">
                        {locale === 'bm' && item.title_bm ? item.title_bm : item.title_en}
                      </h3>
                      <p className="card-description">
                        {locale === 'bm' && item.description_bm ? item.description_bm : item.description_en}
                      </p>
                      <button onClick={openEventsModal} className="card-cta">
                        FIND OUT MORE
                      </button>
                      {/* Mobile arrows */}
                      <div className="card-mobile-arrows">
                        <button className="custom-prev card-arrow-sm">
                          <ChevronLeft size={18} />
                        </button>
                        <button className="custom-next card-arrow-sm">
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {/* Desktop arrows */}
            <div className="desktop-arrows">
              <button className="custom-prev desktop-arrow desktop-arrow-left">
                <ChevronLeft size={24} />
              </button>
              <button className="custom-next desktop-arrow desktop-arrow-right">
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
</section>

      {/* ══════════════════════════════════════════════
          "THIS IS HOME" — white section
      ══════════════════════════════════════════════ */}
      <section id="about" className="bg-white rounded-t-[2rem] -mt-8 relative z-10 px-8 md:px-16 lg:px-24 py-20 md:py-28">
        <div className="max-w-screen-lg mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 style={{ fontFamily: "'Darker Grotesque', sans-serif", fontSize: 'clamp(3rem,8vw,6rem)', fontWeight: 800, lineHeight: 1.0 }}>
              {t('about_tagline') || 'This is Home'}
            </h1>
            <p className="mt-8 text-base md:text-lg text-black/60 leading-relaxed max-w-md"
               style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
              {t('about_text') || 'We are a vibrant and friendly church. We love Jesus and we love people. We\'d love to see you here soon!'}
            </p>
            {/* Quick action buttons */}
            <div className="flex flex-wrap gap-3 mt-8">
              <button
                onClick={openEventsModal}
                className="px-5 py-2.5 rounded-full bg-black text-white text-[11px] uppercase tracking-[0.18em] hover:bg-black/80 transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {t('events_button') || 'Events'}
              </button>
              <button
                onClick={openRosterModal}
                className="px-5 py-2.5 rounded-full border border-black text-black text-[11px] uppercase tracking-[0.18em] hover:bg-black hover:text-white transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {t('roster_button') || 'Roster'}
              </button>
            </div>
          </div>

          {/* Right — decorative image placeholder */}
          <div className="relative flex justify-center">
            <div className="w-full max-w-sm aspect-[4/5] rounded-[3rem] bg-[#F5EFE6] overflow-hidden shadow-xl flex items-center justify-center">
              <img
                src="/church-photo.jpg"
                alt="Church community"
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-black/20 text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>Church photo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
    "HOW WE DO CHURCH" — full‑width, rounded, with proper padding
══════════════════════════════════════════════ */}
<section className="bg-[#1A1A18] w-full rounded-[2rem] my-4 py-16 md:py-24">
  <div className="px-6 md:px-12 lg:px-20">
    <h2 style={{ fontFamily: "'Darker Grotesque', sans-serif", fontSize: 'clamp(2.5rem,7vw,5rem)', fontWeight: 800, color: 'white', marginBottom: '2.5rem', lineHeight: 1.0 }}>
      {t('how_we_do') || 'How we do church'}
    </h2>

    <div id="how-we-splide" className="splide how-we-splide">
      <div className="splide__track" style={{ overflow: 'hidden' }}>
        <ul className="splide__list">
          {HOW_WE_DO.map((card, i) => (
            <li key={i} className="splide__slide">
              <div className="bg-white rounded-2xl p-6 md:p-8 flex flex-col h-full min-h-[280px]">
                <h3 style={{ fontFamily: "'Darker Grotesque', sans-serif", fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                  {card.title}
                </h3>
                <p className="text-sm text-black/60 leading-relaxed flex-1"
                   style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {card.body}
                </p>
                <a
                  href={card.href}
                  className="mt-6 inline-block px-5 py-2 rounded-full border border-black/30 text-[10px] uppercase tracking-[0.18em] text-black hover:bg-black hover:text-white hover:border-black transition-all self-start"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {card.cta}
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Custom arrows */}
      <div className="splide__arrows flex gap-3 mt-8 justify-center">
        <button className="how-we-arrow how-we-arrow-prev">
          <ChevronLeft size={20} />
        </button>
        <button className="how-we-arrow how-we-arrow-next">
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  </div>
</section>

      {/* ══════════════════════════════════════════════
          MARQUEE — values ticker
      ══════════════════════════════════════════════ */}
      <section className="bg-white py-6 border-y border-black/5 overflow-hidden">
        <div className="sc-marquee-outer flex">
          {/* Two copies for seamless loop */}
          {[0, 1].map(copy => (
            <div key={copy} className="sc-marquee-values flex items-center gap-8 shrink-0 animate-marquee-slow" aria-hidden={copy === 1}>
              {MARQUEE_VALUES.map((v, i) => (
                <React.Fragment key={i}>
                  <span style={{ fontFamily: "'Darker Grotesque', sans-serif", fontSize: 'clamp(1.6rem,3vw,2.5rem)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {v}
                  </span>
                  <span className="text-black/25 text-2xl">–</span>
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          GIVING SECTION — replaces emoji with Heart icon
      ══════════════════════════════════════════════ */}
      <section id="giving" className="bg-[#F5EFE6] px-8 md:px-16 lg:px-24 py-20 md:py-28">
        <div className="max-w-screen-lg mx-auto">
          <div className="bg-white rounded-[2rem] p-10 md:p-16 flex flex-col md:flex-row gap-10 items-center">
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-[0.28em] text-black/40 mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Giving
              </p>
              <h2 style={{ fontFamily: "'Darker Grotesque', sans-serif", fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 800, lineHeight: 1.05, marginBottom: '1.25rem' }}>
                Generous living<br />changes everything
              </h2>
              <p className="text-black/60 text-base leading-relaxed max-w-md" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
                Your generosity fuels our mission — from Sunday services to community outreach. Every gift makes a difference.
              </p>
              <div className="flex gap-3 mt-8">
                <a
                  href="#"
                  className="px-6 py-3 rounded-full bg-black text-white text-[11px] uppercase tracking-[0.18em] hover:bg-black/80 transition-colors"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Give now
                </a>
                <a
                  href="#"
                  className="px-6 py-3 rounded-full border border-black text-black text-[11px] uppercase tracking-[0.18em] hover:bg-black hover:text-white transition-colors"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Learn more
                </a>
              </div>
            </div>
            {/* Replaced emoji with Heart icon from lucide-react */}
            <div className="shrink-0 w-48 h-48 md:w-64 md:h-64 rounded-[40%_60%_50%_50%/40%_50%_60%_50%] bg-[#F5EFE6] flex items-center justify-center">
              <Heart size={64} className="text-black/60" />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER (unchanged)
      ══════════════════════════════════════════════ */}
      <footer id="footer" className="bg-white border-t border-black/5 px-8 md:px-16 lg:px-24 pt-16 pb-20">
        <div className="max-w-screen-lg mx-auto">
          {/* Top row */}
          <div className="flex flex-col md:flex-row md:items-start gap-12 md:gap-16 pb-14 border-b border-black/10">
            {/* Logo */}
            <div className="shrink-0">
              <img src="/logo.webp" alt="GBT" className="h-10 w-auto object-contain opacity-80" />
            </div>

            {/* Contact */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-black/40 mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>Contact</p>
              <p className="text-sm text-black/70 leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {t('footer_church') || 'GBT Church'}<br />
                {t('footer_address') || 'Jalan Kuhara, 91000 Tawau, Sabah'}<br />
                {t('footer_phone') || '—'}
              </p>
            </div>

            {/* Links */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-black/40 mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>Links</p>
              <div className="flex flex-col gap-1.5">
                {NAV_LINKS.filter(l => !l.isRouterLink).map(l => (
                  <a
                    key={l.en}
                    href={l.href}
                    className="text-sm text-black/60 hover:text-black transition-colors"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                    onClick={l.isModal && l.en === 'Events' ? (e) => { e.preventDefault(); openEventsModal() } : undefined}
                  >
                    {l.en}
                  </a>
                ))}
              </div>
            </div>

            {/* Service times */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-black/40 mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>Sunday Services</p>
              <div className="flex flex-col gap-1.5">
                {['9:00 AM', '11:30 AM', '5:00 PM (once a month)'].map(t2 => (
                  <p key={t2} className="text-sm text-black/60" style={{ fontFamily: "'DM Sans', sans-serif" }}>{t2}</p>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="flex-1 max-w-xs">
              <p className="text-[10px] uppercase tracking-[0.28em] text-black/40 mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>Newsletter</p>
              <p className="text-sm text-black/60 mb-4 leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Sign up to stay in the loop with what's happening.
              </p>
              <a
                href="#"
                className="inline-block px-5 py-2.5 rounded-full bg-black text-white text-[11px] uppercase tracking-[0.18em] hover:bg-black/80 transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Sign up
              </a>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="mt-8 text-[11px] text-black/30 leading-relaxed max-w-2xl" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            © {new Date().getFullYear()} GBT Church. All rights reserved.{' '}
            {t('footer_tagline') || ''}
          </p>
        </div>
      </footer>

      {/* ===== EVENTS MODAL (unchanged) ===== */}
      {isEventsModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-black/5">
              <h2 style={{ fontFamily: "'Darker Grotesque', sans-serif", fontSize: '1.5rem', fontWeight: 700 }}>
                {selectedEvent ? (t('event_details_title') || 'Event Details') : (t('events_modal_title') || 'Upcoming Events')}
              </h2>
              <button onClick={closeEventsModal} className="p-1.5 hover:bg-black/5 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {!selectedEvent ? (
                events.length === 0
                  ? <p className="text-center text-black/40 py-10" style={{ fontFamily: "'DM Sans', sans-serif" }}>{t('no_events') || 'No upcoming events'}</p>
                  : (
                    <div className="space-y-3">
                      {events.map(event => {
                        if (!event) return null
                        const { day, month, dayName } = formatEventDate(event.date)
                        const title = (locale === 'bm' && event.title_bm) ? event.title_bm : (event.title_en || 'Untitled')
                        return (
                          <button
                            key={event.id}
                            onClick={() => setSelectedEvent(event)}
                            className="w-full text-left bg-[#F5EFE6] rounded-xl p-4 flex items-center gap-4 hover:bg-[#ede6da] transition-colors"
                          >
                            <div className="min-w-[56px] text-center">
                              <div style={{ fontFamily: "'Darker Grotesque', sans-serif", fontSize: '1.8rem', fontWeight: 700 }}>{day}</div>
                              <div className="text-[10px] uppercase tracking-[0.18em] text-black/40" style={{ fontFamily: "'DM Sans', sans-serif" }}>{month}</div>
                            </div>
                            <div className="flex-1">
                              <p style={{ fontFamily: "'Darker Grotesque', sans-serif", fontWeight: 600, fontSize: '1.05rem' }}>{title}</p>
                              <p className="text-xs text-black/40 mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>{dayName} · {formatTimeForDisplay(event.time)}</p>
                            </div>
                            <ChevronRight size={16} className="text-black/30 shrink-0" />
                          </button>
                        )
                      })}
                    </div>
                  )
              ) : (
                <div>
                  <button onClick={() => setSelectedEvent(null)} className="inline-flex items-center gap-2 text-sm text-black/40 hover:text-black mb-5 transition-colors" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    <ArrowLeft size={14} /> {t('events_modal_back') || 'Back'}
                  </button>
                  <div className="bg-[#F5EFE6] rounded-xl p-6 space-y-4">
                    <h3 style={{ fontFamily: "'Darker Grotesque', sans-serif", fontSize: '1.6rem', fontWeight: 700 }}>
                      {locale === 'bm' && selectedEvent.title_bm ? selectedEvent.title_bm : (selectedEvent.title_en || 'Untitled')}
                    </h3>
                    <div className="space-y-3 text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      <div className="flex items-center gap-3 text-black/60"><Calendar size={16} /><span>{new Date(selectedEvent.date).toLocaleDateString(locale === 'bm' ? 'ms-MY' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                      {selectedEvent.time && <div className="flex items-center gap-3 text-black/60"><Clock size={16} /><span>{formatTimeForDisplay(selectedEvent.time)}</span></div>}
                      {selectedEvent.location && <div className="flex items-center gap-3 text-black/60"><MapPinned size={16} /><span>{selectedEvent.location}</span></div>}
                      <div className="flex items-center gap-3 text-black/60"><User size={16} /><span>{selectedEvent.pic || selectedEvent.contact_person || 'Church Office'}</span></div>
                      {(selectedEvent.description_en || selectedEvent.description_bm) && (
                        <div className="pt-3 border-t border-black/10">
                          <p className="text-black/60 leading-relaxed">{locale === 'bm' && selectedEvent.description_bm ? selectedEvent.description_bm : selectedEvent.description_en}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-black/5 flex justify-end">
              <button onClick={closeEventsModal} className="px-5 py-2.5 rounded-full bg-black text-white text-[11px] uppercase tracking-[0.18em] hover:bg-black/80 transition-colors" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {t('events_modal_close') || 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== ROSTER MODAL (unchanged) ===== */}
      {isRosterModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-black/5">
              <h2 style={{ fontFamily: "'Darker Grotesque', sans-serif", fontSize: '1.5rem', fontWeight: 700 }}>
                {t('roster_modal_title') || 'Service Roster'}
              </h2>
              <button onClick={closeRosterModal} className="p-1.5 hover:bg-black/5 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {/* Month selector */}
              <div className="mb-5">
                <label className="block text-[10px] uppercase tracking-[0.22em] text-black/40 mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>{t('roster_month') || 'Month'}</label>
                <div className="relative">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full appearance-none bg-[#F5EFE6] border-none rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-1 focus:ring-black/20"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {availableMonths.length === 0 && <option disabled>{t('roster_no_data') || 'No data'}</option>}
                    {availableMonths.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none" />
                </div>
              </div>

              {/* Week tabs */}
              <div className="mb-6">
                <label className="block text-[10px] uppercase tracking-[0.22em] text-black/40 mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>{t('roster_week') || 'Week'}</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(w => (
                    <button
                      key={w}
                      onClick={() => setSelectedWeek(w)}
                      className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${selectedWeek === w ? 'bg-black text-white' : 'bg-[#F5EFE6] text-black/60 hover:bg-black/5'}`}
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              {/* Roster data */}
              <div className="bg-[#F5EFE6] rounded-xl p-5">
                {rosterForSelectedWeek ? (
                  <div className="space-y-4">
                    {[
                      { icon: <User size={16} />, label: t('roster_leader') || 'Leader', value: rosterForSelectedWeek.leader },
                      { icon: <Users size={16} />, label: t('roster_pianist') || 'Pianist', value: rosterForSelectedWeek.pianist },
                      { icon: <User size={16} />, label: t('roster_reader') || 'Reader', value: rosterForSelectedWeek.reader },
                    ].map(({ icon, label, value }) => (
                      <div key={label} className="flex items-start gap-3">
                        <span className="text-black/30 mt-0.5">{icon}</span>
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-black/40 mb-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>{label}</p>
                          <p className="font-medium" style={{ fontFamily: "'Darker Grotesque', sans-serif", fontSize: '1.05rem' }}>{value || '—'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-black/30 py-6 text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>{t('roster_no_data') || 'No roster for this week'}</p>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-black/5 flex justify-end">
              <button onClick={closeRosterModal} className="px-5 py-2.5 rounded-full bg-black text-white text-[11px] uppercase tracking-[0.18em] hover:bg-black/80 transition-colors" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {t('events_modal_close') || 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          STYLES (updated for new arrow classes)
      ══════════════════════════════════════════════ */}
      <style>{`
        html { scroll-behavior: smooth; }
*, *::before, *::after { box-sizing: border-box; }

/* ── Marquee animations (unchanged) ── */
@keyframes marquee {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.animate-marquee {
  display: flex;
  animation: marquee 22s linear infinite;
  width: max-content;
}

@keyframes marqueeSlow {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-100%); }
}
.sc-marquee-outer {
  display: flex;
  width: 100%;
}
.animate-marquee-slow {
  animation: marqueeSlow 30s linear infinite;
}

@keyframes bounceY {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(4px); }
}
.animate-bounce-y { animation: bounceY 1.8s ease-in-out infinite; }

.splide__track { overflow: visible !important; }

/* ========== HERO "WHAT'S ON" CAROUSEL ========== */
.hero-carousel-wrapper {
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  position: relative;
}

/* Card styles (matches screenshot) */
.whats-on-card {
  background: rgba(20, 20, 20, 0.85);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 1.5rem;
  padding: 1.5rem;
  position: relative;
  box-shadow: 0 25px 40px -12px rgba(0, 0, 0, 0.3);
}

.card-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #C9A882;
  margin-bottom: 0.75rem;
}

.card-title {
  font-family: 'Darker Grotesque', sans-serif;
  font-size: clamp(1.4rem, 5vw, 2rem);
  font-weight: 800;
  color: white;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.card-description {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1.25rem;
}

.card-cta {
  display: inline-block;
  background: white;
  color: black;
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 0.6rem 1.4rem;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}
.card-cta:hover {
  background: #f0f0f0;
}

/* Pagination dots – inside card, top-right */
.whats-on-slider .splide__pagination {
  position: absolute !important;
  top: 1.25rem !important;
  right: 1.25rem !important;
  bottom: auto !important;
  left: auto !important;
  display: flex;
  gap: 6px;
  padding: 0;
  z-index: 5;
}
.whats-on-slider .splide__pagination__page {
  width: 6px;
  height: 6px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 999px;
  margin: 0;
  transition: all 0.2s;
}
.whats-on-slider .splide__pagination__page.is-active {
  width: 18px;
  background: #C9A882;
}

/* Desktop arrows – half inside / half outside card */
.desktop-arrows {
  display: none; /* hidden on mobile, shown via media query */
}
.desktop-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: white;
  border: 1px solid rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: black;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: background 0.2s, color 0.2s;
  z-index: 10;
}
.desktop-arrow:hover {
  background: black;
  color: white;
}
.desktop-arrow-left {
  left: -22px;  /* half of 44px */
}
.desktop-arrow-right {
  right: -22px;
}

/* Mobile arrows – inside card, bottom-right */
.card-mobile-arrows {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  gap: 8px;
  z-index: 10;
}
.card-arrow-sm {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
}
.card-arrow-sm:hover {
  background: rgba(255,255,255,0.2);
}

/* Responsive: show/hide appropriate arrows */
@media (min-width: 768px) {
  .desktop-arrows {
    display: block;
  }
  .card-mobile-arrows {
    display: none;
  }
  .whats-on-card {
    padding: 1.5rem 2rem 1.8rem;
  }
}
@media (max-width: 767px) {
  .desktop-arrows {
    display: none;
  }
  .card-mobile-arrows {
    display: flex;
  }
  .whats-on-card {
    padding: 1.2rem;
  }
  .whats-on-slider .splide__pagination {
    top: 0.8rem !important;
    right: 0.8rem !important;
  }
}

/* ========== "HOW WE DO CHURCH" CAROUSEL ========== */
.how-we-arrow {
  pointer-events: auto;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
}
.how-we-arrow:hover { background: rgba(255,255,255,0.2); }
.how-we-splide .splide__arrows {
  display: flex;
  gap: 0.75rem;
  margin-top: 2rem;
  pointer-events: none;
}
.splide__arrow svg { display: none; }
.how-we-splide .splide__slide { height: auto !important; }
.whats-on-slider .splide__slide { height: auto !important; }
      `}</style>
    </div>
  )
}