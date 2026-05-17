// LandingPage.jsx
// Soul Church–inspired redesign
// Preserves: all Supabase hooks, Events modal, Roster modal, useLocale, routing

import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X, Calendar, User, MapPinned, ArrowLeft, Users, ChevronDown,
  Clock, MapPin, Phone, ChevronLeft, ChevronRight
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
  { title: 'Services',      body: 'Everyone is welcome at our Sunday services. Find out what to expect when you visit us for the first time.',  cta: 'Learn more',   href: '#about' },
  { title: 'Worship',       body: 'We gather to sing, pray and encounter God together. Music is at the heart of who we are.',                   cta: 'Learn more',   href: '#about' },
  { title: 'Community',     body: 'We\'re big on friendship and community, so we run lots of groups where you can connect with like-minded people.',  cta: 'Learn more',   href: '#about' },
  { title: 'Grow',          body: 'Discover opportunities to volunteer, serve and grow in your faith within our family.',                        cta: 'Get involved', href: '#about' },
  { title: 'Giving',        body: 'Generous giving is part of our DNA. Your generosity helps us love our city and change lives.',                cta: 'Give now',     href: '#giving' },
  { title: 'Pastoral Care', body: 'Need prayer or support? Our pastoral team is here for you — submit a prayer request anytime.',               cta: 'Contact us',   href: '#footer' },
]

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

  // ── Data loading ──────────────────────────────────────────────────────────────

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

  // ── "What's On" Splide (hero thumbnail) ───────────────────────────────────────
  // Initialises after carouselItems are loaded and DOM is ready
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
          pagination: false,
          arrows: true,
          gap: 0,
          waitForTransition: false,
          updateOnMove: true,
        })
        splide.mount()
        whatsOnSplideRef.current = splide
      } catch (e) {
        console.error('WhatsOn Splide error:', e)
      }
    }

    init()
    return () => { if (whatsOnSplideRef.current) { whatsOnSplideRef.current.destroy(); whatsOnSplideRef.current = null } }
  }, [carouselItems.length])

  // ── "How We Do Church" Splide ─────────────────────────────────────────────────
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
          arrows: true,
          trimSpace: false,
          breakpoints: {
            1024: { perPage: 2 },
            640:  { perPage: 1 },
          },
        })
        splide.mount()
        howWeSplideRef.current = splide
      } catch (e) {
        console.error('HowWe Splide error:', e)
      }
    }
    init()
    return () => { if (howWeSplideRef.current) { howWeSplideRef.current.destroy(); howWeSplideRef.current = null } }
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
          HERO — full-viewport, video bg, "What's On" card
      ══════════════════════════════════════════════ */}
      <section id="home" className="relative min-h-screen overflow-hidden bg-black pb-11">
        {/* Video background — replace src with your video URL */}
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-70"
          autoPlay
          loop
          muted
          playsInline
          poster="/hero-poster.jpg"
        >
          {/* Replace with your actual video sources */}
          <source src="/hero.mp4" type="video/mp4" />
        </video>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

        {/* "WHAT'S ON" thumbnail slider — bottom center */}
        {carouselItems.length > 0 && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[90vw] max-w-2xl z-10">
            {/* Label */}
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/60 mb-3 pl-1"
               style={{ fontFamily: "'DM Sans', sans-serif" }}>
              What's On
            </p>

            {/* Card container */}
            <div id="whats-on-splide" className="splide whats-on-slider">
              <div className="splide__track">
                <ul className="splide__list">
                  {carouselItems.map((item, idx) => (
                    <li key={item.id || idx} className="splide__slide">
                      <div className="whats-on-card rounded-2xl p-6 md:p-7 flex flex-col md:flex-row md:items-end md:gap-8"
                           style={{
                             background: 'rgba(240,234,224,0.95)',
                             backdropFilter: 'blur(12px)',
                             border: '1px solid rgba(255,255,255,0.3)',
                           }}>
                        <div className="flex-1">
                          <h3 className="whats-on-title mb-2"
                              style={{ fontFamily: "'Darker Grotesque', sans-serif", fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, lineHeight: 1.1 }}>
                            {locale === 'bm' && item.title_bm ? item.title_bm : item.title_en}
                          </h3>
                          <p className="text-black/70 text-sm leading-relaxed line-clamp-3"
                             style={{ fontFamily: "'DM Sans', sans-serif" }}>
                            {locale === 'bm' && item.description_bm ? item.description_bm : item.description_en}
                          </p>
                        </div>
                        <div className="mt-4 md:mt-0 shrink-0">
                          <button
                            onClick={openEventsModal}
                            className="inline-block px-6 py-2.5 rounded-full bg-black text-white text-[11px] uppercase tracking-[0.18em] font-medium hover:bg-black/80 transition-colors"
                            style={{ fontFamily: "'DM Sans', sans-serif" }}
                          >
                            {t('learn_more') || 'Find out more'}
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Custom arrows */}
              <div className="splide__arrows">
                <button className="splide__arrow splide__arrow--prev whats-on-arrow">
                  <ChevronLeft size={18} />
                </button>
                <button className="splide__arrow splide__arrow--next whats-on-arrow">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Pagination dots */}
            <div className="flex gap-1.5 mt-3 justify-end pr-1">
              {carouselItems.map((_, i) => (
                <button
                  key={i}
                  onClick={() => whatsOnSplideRef.current?.go(i)}
                  className="w-1.5 h-1.5 rounded-full bg-white/40 hover:bg-white/80 transition-all"
                />
              ))}
            </div>
          </div>
        )}

        {/* Verse overlay — top center, subtle */}
        {verse.text && (
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center px-6 max-w-xl">
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

        {/* Quick action pills — hero bottom-left (mobile) */}
        <div className="absolute top-20 right-5 md:hidden flex flex-col gap-2 z-10">
          <button
            onClick={openEventsModal}
            className="px-3 py-1.5 rounded-full bg-white/90 text-black text-[9px] uppercase tracking-[0.18em] font-medium"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {t('events_button') || 'Events'}
          </button>
          <button
            onClick={openRosterModal}
            className="px-3 py-1.5 rounded-full bg-white/90 text-black text-[9px] uppercase tracking-[0.18em] font-medium"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {t('roster_button') || 'Roster'}
          </button>
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

          {/* Right — decorative image placeholder (swap with real photo) */}
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
          "HOW WE DO CHURCH" — dark section
      ══════════════════════════════════════════════ */}
      <section className="bg-[#1A1A18] rounded-[2rem] mx-2 md:mx-4 my-4 px-8 md:px-14 lg:px-20 py-16 md:py-24">
        <h2 style={{ fontFamily: "'Darker Grotesque', sans-serif", fontSize: 'clamp(2.5rem,7vw,5rem)', fontWeight: 800, color: 'white', marginBottom: '2.5rem', lineHeight: 1.0 }}>
          {t('how_we_do') || 'How we do church'}
        </h2>

        <div id="how-we-splide" className="splide how-we-splide">
          <div className="splide__track" style={{ overflow: 'visible' }}>
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

          {/* Arrows */}
          <div className="splide__arrows flex gap-3 mt-8">
            <button className="splide__arrow splide__arrow--prev how-we-arrow">
              <ChevronLeft size={20} />
            </button>
            <button className="splide__arrow splide__arrow--next how-we-arrow">
              <ChevronRight size={20} />
            </button>
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
          GIVING PLACEHOLDER
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
            {/* Decorative blob */}
            <div className="shrink-0 w-48 h-48 md:w-64 md:h-64 rounded-[40%_60%_50%_50%/40%_50%_60%_50%] bg-[#F5EFE6] flex items-center justify-center text-5xl select-none">
              🙏
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER
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

      {/* ══════════════════════════════════════════════
          EVENTS MODAL (unchanged logic)
      ══════════════════════════════════════════════ */}
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

      {/* ══════════════════════════════════════════════
          ROSTER MODAL (unchanged logic)
      ══════════════════════════════════════════════ */}
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
          STYLES
      ══════════════════════════════════════════════ */}
      <style>{`
        html { scroll-behavior: smooth; }
        *, *::before, *::after { box-sizing: border-box; }

        /* ── Bottom bar marquee (fast) ── */
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 22s linear infinite;
          width: max-content;
        }

        /* ── Values marquee (slow) ── */
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

        /* ── Bounce Y arrow ── */
        @keyframes bounceY {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(4px); }
        }
        .animate-bounce-y { animation: bounceY 1.8s ease-in-out infinite; }

        /* ── Splide: hide default styles we override ── */
        .splide__track { overflow: visible !important; }

        /* ── "What's On" slider arrows ── */
        .whats-on-slider .splide__arrows {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          transform: translateY(-50%);
          pointer-events: none;
          display: flex;
          justify-content: space-between;
          padding: 0 -1.5rem;
        }
        .whats-on-arrow {
          pointer-events: auto;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: white;
          border: 1px solid rgba(0,0,0,0.1);
          display: flex !important;
          align-items: center;
          justify-content: center;
          color: black;
          cursor: pointer;
          position: static !important;
          transform: none !important;
          opacity: 1 !important;
          transition: background 0.2s, color 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }
        .whats-on-arrow:hover { background: black; color: white; }
        .whats-on-slider .splide__arrow--prev { margin-left: -1.5rem; }
        .whats-on-slider .splide__arrow--next { margin-right: -1.5rem; }
        
        /* ── "How We Do" slider arrows ── */
        .how-we-splide .splide__arrows {
          display: flex;
          gap: 0.75rem;
          margin-top: 2rem;
          pointer-events: none;
        }
        .how-we-arrow {
          pointer-events: auto;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          display: flex !important;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          position: static !important;
          transform: none !important;
          opacity: 1 !important;
          transition: background 0.2s;
        }
        .how-we-arrow:hover { background: rgba(255,255,255,0.2); }
        .how-we-splide .splide__arrow:disabled { opacity: 0.3 !important; }

        /* Splide default arrow reset */
        .splide__arrow { background: none !important; }
        .splide__arrow svg { display: none; }

        /* Carousel slide height fix */
        .how-we-splide .splide__slide { height: auto !important; }
        .whats-on-slider .splide__slide { height: auto !important; }
      `}</style>
    </div>
  )
}