// src/pages/LandingPage.jsx

import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  ArrowUpRight,
  ArrowLeft,
  Clock,
  MapPinned,
  User,
  MapPin,
  Phone,
  X,
  ChevronDown,
} from 'lucide-react'

import { supabase } from '../lib/supabase'
import { useLocale } from '../contexts/LocaleContext'

import '@splidejs/splide/css'

const NAV_LINKS = [
  { en: 'Home', bm: 'Utama', href: '#home' },
  { en: 'About', bm: 'Tentang Kami', href: '#about' },
  { en: 'Events', bm: 'Acara', href: '#events' },
  { en: 'Roster', bm: 'Petugas', href: '#roster' },
  { en: 'Lyrics', bm: 'Lirik', href: '/lyrics' },
  { en: 'Staff', bm: 'Kakitangan', href: '/login', isRouterLink: true },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { t, locale, toggleLocale } = useLocale()

  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [loading, setLoading] = useState(true)

  const [verse, setVerse] = useState({
    reference: 'Matthew 11:28',
    text: 'Come to me...',
    theme: '',
  })

  const [events, setEvents] = useState([])
  const [carouselItems, setCarouselItems] = useState([])
  const [splideReady, setSplideReady] = useState(false)

  // Events Modal
  const [isEventsModalOpen, setIsEventsModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)

  // Roster Modal
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false)
  const [rosters, setRosters] = useState([])
  const [rosterMap, setRosterMap] = useState({})
  const [availableMonths, setAvailableMonths] = useState([])
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedWeek, setSelectedWeek] = useState(1)

  const getNavText = (item) => (locale === 'bm' ? item.bm : item.en)

  const marqueeItems = useMemo(
    () => [
      'Grace Bible Church Tawau',
      'Sunday Worship',
      'Community',
      'Faith',
      'Prayer',
      'Discipleship',
      'Worship',
      'Fellowship',
      'Kingdom Living',
      'Youth',
    ],
    []
  )

  useEffect(() => {
    loadContent()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow =
      menuOpen || isEventsModalOpen || isRosterModalOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen, isEventsModalOpen, isRosterModalOpen])

  // Splide Init
  useEffect(() => {
    let splide = null

    async function initSplide() {
      if (!carouselItems.length) return

      const Splide = (await import('@splidejs/splide')).default

      splide = new Splide('.editorial-carousel', {
        type: 'loop',
        perPage: 1,
        gap: '1rem',
        arrows: false,
        pagination: true,
        speed: 900,
        drag: true,
        autoplay: true,
        interval: 5500,
        pauseOnHover: false,
        pauseOnFocus: false,
      })

      splide.mount()

      window.heroSplide = splide
      setSplideReady(true)
    }

    const timer = setTimeout(initSplide, 120)

    return () => {
      clearTimeout(timer)
      if (splide) splide.destroy()
    }
  }, [carouselItems])

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
    const { data } = await supabase
      .from('verse_library')
      .select('*')
      .eq('is_active', true)
      .maybeSingle()

    if (data) {
      setVerse({
        reference: data.reference,
        text: data.text,
        theme: data.theme || '',
      })
    }
  }

  const loadUpcomingEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .order('time', { ascending: true })

    setEvents(data || [])
  }

  const loadCarouselItems = async () => {
    const { data } = await supabase
      .from('carousel_items')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    setCarouselItems(data || [])
  }

  const loadRosters = async () => {
    const { data } = await supabase
      .from('roster')
      .select('*')
      .order('week_start', { ascending: true })

    if (!data) return

    setRosters(data)

    const map = {}
    const monthsSet = new Set()

    data.forEach((roster) => {
      if (!roster.week_start) return

      const [year, month, day] = roster.week_start
        .split('-')
        .map(Number)

      const monthStr = `${year}-${String(month).padStart(2, '0')}`

      const firstDayOfMonth = new Date(Date.UTC(year, month - 1, 1))
      const firstMondayUTC = new Date(Date.UTC(year, month - 1, 1))

      const firstDayOfWeek = firstDayOfMonth.getUTCDay()

      const daysToMonday =
        firstDayOfWeek === 0
          ? 1
          : (8 - firstDayOfWeek) % 7

      firstMondayUTC.setUTCDate(1 + daysToMonday)

      const rosterDateUTC = new Date(
        Date.UTC(year, month - 1, day)
      )

      const diffDays = Math.floor(
        (rosterDateUTC - firstMondayUTC) /
          (1000 * 60 * 60 * 24)
      )

      const weekNumber = Math.floor(diffDays / 7) + 1

      if (weekNumber >= 1 && weekNumber <= 4) {
        map[`${monthStr}-${weekNumber}`] = roster
      }

      const monthName = new Date(
        Date.UTC(year, month - 1, 1)
      ).toLocaleString(locale === 'bm' ? 'ms-MY' : 'en-US', {
        month: 'long',
        year: 'numeric',
      })

      monthsSet.add(
        JSON.stringify({
          value: monthStr,
          label: monthName,
        })
      )
    })

    const monthsArray = Array.from(monthsSet).map((m) =>
      JSON.parse(m)
    )

    monthsArray.sort((a, b) =>
      a.value.localeCompare(b.value)
    )

    setAvailableMonths(monthsArray)
    setRosterMap(map)

    if (monthsArray.length > 0) {
      setSelectedMonth(monthsArray[0].value)
    }
  }

  const rosterForSelectedWeek =
    rosterMap[`${selectedMonth}-${selectedWeek}`]

  const formatTimeForDisplay = (time24) => {
    if (!time24) return ''

    const [hour, minute] = time24.split(':')
    const h = parseInt(hour)

    const period = h >= 12 ? 'PM' : 'AM'
    const hour12 = h % 12 || 12

    return `${hour12}:${minute} ${period}`
  }

  const formatEventDate = (dateStr) => {
    const date = new Date(dateStr)

    return {
      day: date.getDate(),
      month: date.toLocaleString('default', {
        month: 'short',
      }),
      weekday: date.toLocaleString('default', {
        weekday: 'long',
      }),
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f1ea] flex items-center justify-center">
        <div className="w-9 h-9 border-2 border-[#1d1d1d]/10 border-t-[#1d1d1d] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-[#f6f1ea] text-[#1e1e1e] overflow-x-hidden">
      <link
        href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;700&display=swap"
        rel="stylesheet"
      />

      {/* NAV */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'px-4 pt-4'
            : 'px-5 pt-5'
        }`}
      >
        <div
          className={`mx-auto max-w-7xl transition-all duration-500 ${
            scrolled
              ? 'bg-white/65 backdrop-blur-xl border border-white/40 shadow-[0_10px_40px_rgba(0,0,0,0.08)]'
              : 'bg-transparent border border-transparent'
          } rounded-[2rem]`}
        >
          <div className="h-[74px] px-6 flex items-center justify-between">
            <img
              src="/logo.webp"
              alt="GBT"
              className="h-10 w-auto object-contain"
            />

            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((item) =>
                item.isRouterLink ? (
                  <button
                    key={item.en}
                    onClick={() => navigate(item.href)}
                    className="text-[14px] text-[#3a332d] hover:text-black transition font-['DM_Sans']"
                  >
                    {getNavText(item)}
                  </button>
                ) : (
                  <a
                    key={item.en}
                    href={item.href}
                    className="text-[14px] text-[#3a332d] hover:text-black transition font-['DM_Sans']"
                  >
                    {getNavText(item)}
                  </a>
                )
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleLocale}
                className="h-11 px-5 rounded-full bg-white/70 border border-black/5 text-[12px] tracking-[0.18em] uppercase font-medium font-['DM_Sans']"
              >
                {locale === 'en' ? 'BM' : 'EN'}
              </button>

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-11 h-11 rounded-full bg-[#1f1f1f] flex items-center justify-center"
              >
                <div className="flex flex-col gap-[4px]">
                  <span
                    className={`w-[18px] h-[1.5px] bg-white rounded-full transition-all ${
                      menuOpen
                        ? 'translate-y-[3px] rotate-45'
                        : ''
                    }`}
                  />
                  <span
                    className={`w-[18px] h-[1.5px] bg-white rounded-full transition-all ${
                      menuOpen
                        ? '-translate-y-[3px] -rotate-45'
                        : ''
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MENU */}
      <div
        className={`fixed inset-0 z-40 bg-[#171717] transition-all duration-500 ${
          menuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="h-full flex flex-col items-center justify-center">
          <div className="text-center">
            {NAV_LINKS.map((item, i) =>
              item.isRouterLink ? (
                <button
                  key={item.en}
                  onClick={() => {
                    navigate(item.href)
                    setMenuOpen(false)
                  }}
                  style={{
                    transitionDelay: `${i * 60}ms`,
                  }}
                  className={`block w-full text-center text-[clamp(2.5rem,8vw,5rem)] leading-none mb-4 font-['Lora'] text-white transition-all duration-500 ${
                    menuOpen
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-10 opacity-0'
                  }`}
                >
                  {getNavText(item)}
                </button>
              ) : (
                <a
                  key={item.en}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    transitionDelay: `${i * 60}ms`,
                  }}
                  className={`block text-[clamp(2.5rem,8vw,5rem)] leading-none mb-4 font-['Lora'] text-white transition-all duration-500 ${
                    menuOpen
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-10 opacity-0'
                  }`}
                >
                  {getNavText(item)}
                </a>
              )
            )}
          </div>
        </div>
      </div>

      {/* HERO */}
      <section
        id="home"
        className="relative min-h-screen overflow-hidden px-5 pt-[120px] pb-10"
      >
        {/* Background */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/backdrop.webp')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.12,
            }}
          />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.7),transparent_40%)]" />
        </div>

        {/* Floating Orb */}
        <div className="absolute top-[12%] right-[-140px] w-[340px] h-[340px] rounded-full bg-[#d8c4aa]/30 blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Top Hero */}
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-end min-h-[75vh]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/70 backdrop-blur-md px-4 py-2 mb-8">
                <div className="w-2 h-2 rounded-full bg-[#9d7b55]" />
                <span className="uppercase tracking-[0.2em] text-[10px] font-medium text-[#8a7560] font-['DM_Sans']">
                  Grace Bible Church Tawau
                </span>
              </div>

              <h1 className="text-[clamp(4rem,12vw,9rem)] leading-[0.92] tracking-[-0.06em] text-[#171717] font-['Lora'] max-w-[11ch]">
                A house
                <br />
                for grace,
                <br />
                truth &
                <br />
                worship.
              </h1>

              <div className="mt-10 max-w-xl">
                <p className="text-[15px] md:text-[18px] leading-8 text-[#5f554d] font-['DM_Sans']">
                  {verse.text}
                </p>

                <p className="mt-5 uppercase tracking-[0.28em] text-[10px] text-[#9b846e] font-medium font-['DM_Sans']">
                  {verse.reference}
                </p>
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="#about"
                  className="group h-[58px] px-7 rounded-full bg-[#171717] text-white inline-flex items-center gap-3 text-[13px] uppercase tracking-[0.18em] font-medium font-['DM_Sans']"
                >
                  {t('welcome_cta')}
                  <ArrowUpRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-[2px] group-hover:-translate-y-[2px]"
                  />
                </a>

                <button
                  onClick={() => setIsEventsModalOpen(true)}
                  className="h-[58px] px-7 rounded-full bg-white/70 border border-black/5 backdrop-blur-md inline-flex items-center gap-3 text-[13px] uppercase tracking-[0.18em] font-medium font-['DM_Sans']"
                >
                  <Calendar size={16} />
                  {t('events_button')}
                </button>

                <button
                  onClick={() => setIsRosterModalOpen(true)}
                  className="h-[58px] px-7 rounded-full bg-white/70 border border-black/5 backdrop-blur-md inline-flex items-center gap-3 text-[13px] uppercase tracking-[0.18em] font-medium font-['DM_Sans']"
                >
                  <Users size={16} />
                  {t('roster_button')}
                </button>
              </div>
            </div>

            {/* Carousel */}
            {carouselItems.length > 0 && (
              <div className="relative">
                <div className="rounded-[2.5rem] bg-[#1f1f1f] text-white p-6 md:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.18)] border border-white/5">
                  <div className="flex items-center justify-between mb-7">
                    <div>
                      <p className="uppercase tracking-[0.28em] text-[10px] text-[#b89c79] font-medium font-['DM_Sans']">
                        Community Updates
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          window.heroSplide?.go('<')
                        }
                        className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition"
                      >
                        <ChevronLeft size={18} />
                      </button>

                      <button
                        onClick={() =>
                          window.heroSplide?.go('>')
                        }
                        className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>

                  <div
                    className="editorial-carousel splide"
                    aria-label="Announcements"
                  >
                    <div className="splide__track">
                      <ul className="splide__list">
                        {carouselItems.map((item) => (
                          <li
                            key={item.id}
                            className="splide__slide"
                          >
                            <div className="min-h-[360px] flex flex-col justify-between">
                              <div>
                                <span className="inline-flex rounded-full bg-[#c8a57f]/15 border border-[#c8a57f]/20 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-[#c8a57f] font-medium font-['DM_Sans']">
                                  {item.theme || 'Announcement'}
                                </span>

                                <h3 className="mt-6 text-[clamp(2rem,4vw,3rem)] leading-[1.04] tracking-[-0.04em] font-['Lora'] max-w-[11ch]">
                                  {locale === 'bm' &&
                                  item.title_bm
                                    ? item.title_bm
                                    : item.title_en}
                                </h3>

                                <p className="mt-6 text-[15px] leading-8 text-white/70 font-['DM_Sans'] max-w-[42ch]">
                                  {locale === 'bm' &&
                                  item.description_bm
                                    ? item.description_bm
                                    : item.description_en}
                                </p>
                              </div>

                              <button className="mt-10 self-start h-[52px] px-6 rounded-full border border-white/10 bg-white/5 backdrop-blur-md inline-flex items-center gap-3 text-[12px] uppercase tracking-[0.16em] font-medium font-['DM_Sans'] hover:bg-white hover:text-black transition">
                                {t('learn_more') || 'Read More'}
                                <ArrowUpRight size={14} />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Floating Bottom Info */}
                  <div className="mt-8 rounded-[2rem] bg-white/6 border border-white/10 backdrop-blur-md p-5 flex items-center justify-between gap-5">
                    <div>
                      <p className="uppercase tracking-[0.24em] text-[10px] text-[#c8a57f] mb-2 font-medium font-['DM_Sans']">
                        Sunday Worship
                      </p>

                      <h4 className="text-[1.2rem] font-['Lora']">
                        9:00 AM — Main Sanctuary
                      </h4>
                    </div>

                    <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shrink-0">
                      <ArrowUpRight size={20} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Scroll Separator */}
          <div className="mt-14">
            <div className="rounded-[2.5rem] overflow-hidden border border-black/5 bg-white/55 backdrop-blur-xl">
              <div className="marquee-wrap">
                <div className="marquee-track">
                  {[...marqueeItems, ...marqueeItems].map(
                    (item, idx) => (
                      <div
                        key={idx}
                        className="marquee-item"
                      >
                        <span>{item}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section
        id="about"
        className="relative px-5 pb-24 md:pb-36"
      >
        <div className="max-w-7xl mx-auto">
          <div className="rounded-[3rem] bg-[#1d1d1d] overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.09),transparent_30%)]" />

            <div className="relative z-10 grid lg:grid-cols-2 gap-16 p-8 md:p-16 lg:p-20">
              <div>
                <p className="uppercase tracking-[0.28em] text-[10px] text-[#c8a57f] mb-5 font-medium font-['DM_Sans']">
                  About Us
                </p>

                <h2 className="text-white text-[clamp(2.5rem,6vw,5rem)] leading-[0.96] tracking-[-0.05em] font-['Lora'] max-w-[9ch]">
                  Building
                  <br />
                  people
                  <br />
                  through
                  <br />
                  Christ.
                </h2>
              </div>

              <div className="flex flex-col justify-between">
                <p className="text-[16px] md:text-[18px] leading-9 text-white/72 font-['DM_Sans'] max-w-[36ch]">
                  {t('about_text')}
                </p>

                <div className="mt-14 grid sm:grid-cols-2 gap-5">
                  <div className="rounded-[2rem] bg-white/6 border border-white/10 p-6">
                    <p className="uppercase tracking-[0.22em] text-[10px] text-[#c8a57f] mb-4 font-medium font-['DM_Sans']">
                      Worship
                    </p>

                    <p className="text-white/75 leading-7 font-['DM_Sans']">
                      Christ-centred gatherings rooted in
                      scripture, prayer and worship.
                    </p>
                  </div>

                  <div className="rounded-[2rem] bg-white/6 border border-white/10 p-6">
                    <p className="uppercase tracking-[0.22em] text-[10px] text-[#c8a57f] mb-4 font-medium font-['DM_Sans']">
                      Community
                    </p>

                    <p className="text-white/75 leading-7 font-['DM_Sans']">
                      A church family growing together
                      through discipleship and fellowship.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-5 pb-8">
        <div className="max-w-7xl mx-auto rounded-[2.5rem] bg-white border border-black/5 px-8 py-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
            <div>
              <p className="uppercase tracking-[0.28em] text-[10px] text-[#9f8466] mb-4 font-medium font-['DM_Sans']">
                Grace Bible Church Tawau
              </p>

              <h3 className="text-[clamp(2rem,5vw,4rem)] leading-[1] tracking-[-0.05em] font-['Lora'] max-w-[10ch]">
                A place to belong.
              </h3>
            </div>

            <div className="space-y-4 text-[#5f554d] font-['DM_Sans']">
              <div className="flex items-center gap-3">
                <MapPin size={16} />
                <span>{t('footer_address')}</span>
              </div>

              <div className="flex items-center gap-3">
                <Clock size={16} />
                <span>{t('footer_worship')}</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone size={16} />
                <span>{t('footer_phone')}</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* EVENTS MODAL */}
      {isEventsModalOpen && (
        <div className="fixed inset-0 z-[70] p-4 bg-black/50 backdrop-blur-xl flex items-center justify-center">
          <div className="w-full max-w-3xl bg-[#f6f1ea] rounded-[2rem] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.25)]">
            <div className="flex items-center justify-between px-7 py-6 border-b border-black/5">
              <h2 className="text-[1.7rem] font-['Lora']">
                {selectedEvent
                  ? t('event_details_title')
                  : t('events_modal_title')}
              </h2>

              <button
                onClick={() => {
                  setIsEventsModalOpen(false)
                  setSelectedEvent(null)
                }}
                className="w-11 h-11 rounded-full bg-black/5 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-7">
              {!selectedEvent ? (
                <div className="space-y-4">
                  {events.map((event) => {
                    const formatted =
                      formatEventDate(event.date)

                    return (
                      <button
                        key={event.id}
                        onClick={() =>
                          setSelectedEvent(event)
                        }
                        className="w-full rounded-[1.8rem] bg-white border border-black/5 p-5 flex items-center justify-between gap-5 hover:-translate-y-[2px] transition"
                      >
                        <div className="flex items-center gap-5 text-left">
                          <div className="w-[76px] h-[76px] rounded-[1.5rem] bg-[#1f1f1f] text-white flex flex-col items-center justify-center shrink-0">
                            <span className="text-[1.6rem] leading-none font-['Lora']">
                              {formatted.day}
                            </span>

                            <span className="uppercase tracking-[0.18em] text-[10px] text-white/60 mt-1 font-['DM_Sans']">
                              {formatted.month}
                            </span>
                          </div>

                          <div>
                            <h3 className="text-[1.25rem] font-['Lora']">
                              {locale === 'bm' &&
                              event.title_bm
                                ? event.title_bm
                                : event.title_en}
                            </h3>

                            <p className="mt-2 text-[#7b6d61] text-sm font-['DM_Sans']">
                              {formatted.weekday} ·{' '}
                              {formatTimeForDisplay(
                                event.time
                              )}
                            </p>
                          </div>
                        </div>

                        <ArrowUpRight size={18} />
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div>
                  <button
                    onClick={() =>
                      setSelectedEvent(null)
                    }
                    className="inline-flex items-center gap-2 mb-6 text-sm font-['DM_Sans']"
                  >
                    <ArrowLeft size={16} />
                    {t('events_modal_back')}
                  </button>

                  <div className="rounded-[2rem] bg-white border border-black/5 p-7">
                    <h3 className="text-[2rem] leading-tight font-['Lora']">
                      {locale === 'bm' &&
                      selectedEvent.title_bm
                        ? selectedEvent.title_bm
                        : selectedEvent.title_en}
                    </h3>

                    <div className="mt-8 space-y-5 text-[#5f554d] font-['DM_Sans']">
                      <div className="flex items-center gap-4">
                        <Calendar size={18} />
                        <span>
                          {new Date(
                            selectedEvent.date
                          ).toLocaleDateString(
                            locale === 'bm'
                              ? 'ms-MY'
                              : 'en-US',
                            {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            }
                          )}
                        </span>
                      </div>

                      {selectedEvent.time && (
                        <div className="flex items-center gap-4">
                          <Clock size={18} />
                          <span>
                            {formatTimeForDisplay(
                              selectedEvent.time
                            )}
                          </span>
                        </div>
                      )}

                      {selectedEvent.location && (
                        <div className="flex items-center gap-4">
                          <MapPinned size={18} />
                          <span>
                            {selectedEvent.location}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-4">
                        <User size={18} />
                        <span>
                          {selectedEvent.pic ||
                            selectedEvent.contact_person ||
                            'Church Office'}
                        </span>
                      </div>

                      {(selectedEvent.description_en ||
                        selectedEvent.description_bm) && (
                        <div className="pt-5 border-t border-black/5">
                          <p className="leading-8">
                            {locale === 'bm' &&
                            selectedEvent.description_bm
                              ? selectedEvent.description_bm
                              : selectedEvent.description_en}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ROSTER MODAL */}
      {isRosterModalOpen && (
        <div className="fixed inset-0 z-[70] p-4 bg-black/50 backdrop-blur-xl flex items-center justify-center">
          <div className="w-full max-w-2xl bg-[#f6f1ea] rounded-[2rem] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.25)]">
            <div className="flex items-center justify-between px-7 py-6 border-b border-black/5">
              <h2 className="text-[1.7rem] font-['Lora']">
                {t('roster_modal_title')}
              </h2>

              <button
                onClick={() =>
                  setIsRosterModalOpen(false)
                }
                className="w-11 h-11 rounded-full bg-black/5 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-7">
              <div className="mb-6">
                <label className="block uppercase tracking-[0.18em] text-[10px] text-[#a18467] mb-3 font-medium font-['DM_Sans']">
                  {t('roster_month')}
                </label>

                <div className="relative">
                  <select
                    value={selectedMonth}
                    onChange={(e) =>
                      setSelectedMonth(
                        e.target.value
                      )
                    }
                    className="w-full h-[58px] rounded-[1.2rem] border border-black/5 bg-white px-5 appearance-none font-['DM_Sans']"
                  >
                    {availableMonths.map((month) => (
                      <option
                        key={month.value}
                        value={month.value}
                      >
                        {month.label}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={18}
                    className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-7">
                {[1, 2, 3, 4].map((week) => (
                  <button
                    key={week}
                    onClick={() =>
                      setSelectedWeek(week)
                    }
                    className={`h-[52px] rounded-full text-sm transition font-medium font-['DM_Sans'] ${
                      selectedWeek === week
                        ? 'bg-[#1f1f1f] text-white'
                        : 'bg-white border border-black/5'
                    }`}
                  >
                    Week {week}
                  </button>
                ))}
              </div>

              <div className="rounded-[2rem] bg-white border border-black/5 p-6">
                {rosterForSelectedWeek ? (
                  <div className="space-y-6">
                    <div>
                      <p className="uppercase tracking-[0.2em] text-[10px] text-[#a18467] mb-2 font-medium font-['DM_Sans']">
                        {t('roster_leader')}
                      </p>

                      <h3 className="text-[1.5rem] font-['Lora']">
                        {rosterForSelectedWeek.leader ||
                          '—'}
                      </h3>
                    </div>

                    <div>
                      <p className="uppercase tracking-[0.2em] text-[10px] text-[#a18467] mb-2 font-medium font-['DM_Sans']">
                        {t('roster_pianist')}
                      </p>

                      <h3 className="text-[1.5rem] font-['Lora']">
                        {rosterForSelectedWeek.pianist ||
                          '—'}
                      </h3>
                    </div>

                    <div>
                      <p className="uppercase tracking-[0.2em] text-[10px] text-[#a18467] mb-2 font-medium font-['DM_Sans']">
                        {t('roster_reader')}
                      </p>

                      <h3 className="text-[1.5rem] font-['Lora']">
                        {rosterForSelectedWeek.reader ||
                          '—'}
                      </h3>
                    </div>
                  </div>
                ) : (
                  <p className="text-[#7a7067] font-['DM_Sans']">
                    {t('roster_no_data')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        html {
          scroll-behavior: smooth;
        }

        * {
          box-sizing: border-box;
        }

        body {
          background: #f6f1ea;
        }

        .splide__pagination {
          bottom: -2.5rem !important;
        }

        .splide__pagination__page {
          width: 7px;
          height: 7px;
          background: rgba(255,255,255,0.3);
          opacity: 1;
          margin: 0 5px;
          transition: all 0.3s ease;
        }

        .splide__pagination__page.is-active {
          width: 28px;
          border-radius: 999px;
          transform: none;
          background: #c8a57f;
        }

        .marquee-wrap {
          overflow: hidden;
          width: 100%;
          padding: 1.4rem 0;
        }

        .marquee-track {
          display: flex;
          width: fit-content;
          animation: marqueeMove 28s linear infinite;
        }

        .marquee-item {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0 2rem;
          font-family: 'DM Sans', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-size: 11px;
          color: #7f6d5f;
        }

        .marquee-item::after {
          content: '•';
          margin-left: 2rem;
          color: #c8a57f;
        }

        @keyframes marqueeMove {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  )
}