// src/features/public-home/LandingPage.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, ArrowRight } from 'lucide-react'
import { fetchActiveVerse, fetchActiveCarouselItems, fetchAllRosters } from '../../services/content'
import { fetchUpcomingEvents } from '../../services/events'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useLocale } from '../../contexts/LocaleContext'
import '@splidejs/splide/css'
import NavBar from './NavBar'
import HeroSection from './HeroSection'
import AboutSection from './AboutSection'
import HowWeDoChurch from './HowWeDoChurch'
import Footer from './Footer'
import EventsModal from './EventsModal'
import RosterModal from './RosterModal'

// ─── CONFIG ────────────────────────────────────────────────────────────────────

const MARQUEE_VALUES = [
  'Christ Centred', 'People Empowering', 'Life Giving', 'Outward Focused', 'Spirit of Excellence',
]

// ─── COMPONENT ─────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate()
  const { t, locale, toggleLocale } = useLocale()

  // UI state
  const [menuOpen, setMenuOpen]   = useState(false)
  const [scrolled, setScrolled]   = useState(false)
  const [loading, setLoading]     = useState(true)
  const [videoError, setVideoError] = useState(false)

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

  // ── Data loading ─────────────────────────────────────────────────────────────

  useEffect(() => { loadContent() }, [])

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
    try {
      const data = await fetchActiveVerse()
      if (data) setVerse({ reference: data.reference, text: data.text, theme: data.theme || '' })
    } catch (err) { console.error(err) }
  }

  const loadUpcomingEvents = async () => {
    try {
      const data = await fetchUpcomingEvents()
      setEvents(data || [])
    } catch (err) { setEvents([]); console.error(err) }
  }

  const loadCarouselItems = async () => {
    try {
      const data = await fetchActiveCarouselItems()
      setCarouselItems(data || [])
    } catch (err) { setCarouselItems([]); console.error(err) }
  }

  const loadRosters = async () => {
    try {
      const data = await fetchAllRosters()
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
    } catch (err) { console.error(err) }
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

  // ── Modal helpers ─────────────────────────────────────────────────────────────

  const openEventsModal  = () => { setSelectedEvent(null); setIsEventsModalOpen(true) }
  const closeEventsModal = () => { setIsEventsModalOpen(false); setSelectedEvent(null) }
  const openRosterModal  = () => setIsRosterModalOpen(true)
  const closeRosterModal = () => setIsRosterModalOpen(false)

  // ─── LOADING ───────────────────────────────────────────────────────────────────

  if (loading) {
    return <LoadingSpinner background="#F5EFE6" borderColor="rgba(0,0,0,0.1)" accentColor="#000000" size="32px" thickness="2px" />
  }

  // ─── RENDER ────────────────────────────────────────────────────────────────────

  return (
    <div className="sc-page bg-[#F5EFE6] text-black overflow-x-hidden">


      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-black/10 h-11 flex items-center overflow-hidden select-none">
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
        <div className="hidden lg:flex items-center gap-2 shrink-0 border-l border-black/10 h-full px-4">
          <span className="text-[10px] uppercase tracking-[0.2em] text-black/50">Scroll down</span>
          <span className="text-black/40 animate-bounce-y text-xs">↓</span>
        </div>
      </div>

      <NavBar
        scrolled={scrolled}
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen(o => !o)}
        toggleLocale={toggleLocale}
        locale={locale}
        navigate={navigate}
        onOpenEvents={openEventsModal}
        onOpenRoster={openRosterModal}
        t={t}
      />

      <HeroSection
        carouselItems={carouselItems}
        videoError={videoError}
        onVideoError={setVideoError}
        onOpenEvents={openEventsModal}
        t={t}
        locale={locale}
      />

      <AboutSection
        verse={verse}
        onOpenEvents={openEventsModal}
        onOpenRoster={openRosterModal}
        t={t}
      />

      <HowWeDoChurch t={t} />

      {/* Marquee — values ticker */}
      <section className="bg-white py-6 border-y border-black/5 overflow-hidden">
        <div className="sc-marquee-outer flex">
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

      {/* Giving section */}
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
              <div className="flex flex-wrap gap-3 mt-8">
                <a href="#" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-[11px] uppercase tracking-[0.18em] hover:bg-black/80 transition-colors"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  <Heart size={14} /> Give now
                </a>
                <a href="#" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-black text-black text-[11px] uppercase tracking-[0.18em] hover:bg-black hover:text-white transition-colors"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Learn more <ArrowRight size={14} />
                </a>
              </div>
            </div>
            <div className="shrink-0 w-48 h-48 md:w-64 md:h-64 rounded-[40%_60%_50%_50%/40%_50%_60%_50%] bg-[#F5EFE6] flex items-center justify-center">
              <Heart size={64} className="text-black/60" />
            </div>
          </div>
        </div>
      </section>

      <Footer t={t} onOpenEvents={openEventsModal} />

      <EventsModal
        isOpen={isEventsModalOpen}
        onClose={closeEventsModal}
        events={events}
        selectedEvent={selectedEvent}
        onSelectEvent={setSelectedEvent}
        onBack={() => setSelectedEvent(null)}
        t={t}
        locale={locale}
      />

      <RosterModal
        isOpen={isRosterModalOpen}
        onClose={closeRosterModal}
        t={t}
        availableMonths={availableMonths}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        selectedWeek={selectedWeek}
        onWeekChange={setSelectedWeek}
        rosterForSelectedWeek={rosterForSelectedWeek}
      />

      <style>{`
        html { scroll-behavior: smooth; }
        *, *::before, *::after { box-sizing: border-box; }

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

        .hero-carousel-wrapper {
          width: 100%;
          max-width: 560px;
          margin: 0 auto;
          position: relative;
        }

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
        .card-cta:hover { background: #f0f0f0; }

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

        .desktop-arrows { display: none; }
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
        .desktop-arrow:hover { background: black; color: white; }
        .desktop-arrow-left { left: -22px; }
        .desktop-arrow-right { right: -22px; }

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
        .card-arrow-sm:hover { background: rgba(255,255,255,0.2); }

        @media (min-width: 768px) {
          .desktop-arrows { display: block; }
          .card-mobile-arrows { display: none; }
          .whats-on-card { padding: 1.5rem 2rem 1.8rem; }
        }
        @media (max-width: 767px) {
          .desktop-arrows { display: none; }
          .card-mobile-arrows { display: flex; }
          .whats-on-card { padding: 1rem; }
          .card-description {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
            font-size: 0.8rem;
            margin-bottom: 0.75rem;
          }
          .whats-on-slider .splide__pagination {
            top: 0.8rem !important;
            right: 0.8rem !important;
          }
          .hero-carousel-wrapper { margin-bottom: 0.5rem; }
        }

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
