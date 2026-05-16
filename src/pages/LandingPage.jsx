import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const NAV_LINKS = [
  { en: 'Home', bm: 'Utama', href: '#home' },
  { en: 'About', bm: 'Tentang Kami', href: '#about' },
  { en: 'Contact', bm: 'Hubungi', href: '#contact' },
  { en: 'Staff', bm: 'Kakitangan', href: '/login', isRouterLink: true },
]

export default function LandingPage() {
  const navigate = useNavigate()

  const [menuOpen, setMenuOpen] = useState(false)
  const [lang, setLang] = useState('en')
  const [scrolled, setScrolled] = useState(false)
  const [loading, setLoading] = useState(true)

  const [activeModal, setActiveModal] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedWeek, setSelectedWeek] = useState(0)

  const [verse, setVerse] = useState({
    reference: 'Matthew 11:28',
    text: 'Come to me, all you who are weary and burdened, and I will give you rest.',
    theme: 'Rest and Peace',
  })

  const [events, setEvents] = useState([])
  const [roster, setRoster] = useState([])

  const t = (en, bm) => (lang === 'bm' ? bm : en)

  useEffect(() => {
    loadContent()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)

    window.addEventListener('scroll', onScroll, { passive: true })

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen || activeModal ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen, activeModal])

  const loadContent = async () => {
    setLoading(true)

    await Promise.all([
      loadActiveVerse(),
      loadUpcomingEvents(),
      loadRoster(),
    ])

    setLoading(false)
  }

  const loadActiveVerse = async () => {
    const { data, error } = await supabase
      .from('verse_library')
      .select('reference, text, theme')
      .eq('is_active', true)
      .maybeSingle()

    if (!error && data) {
      setVerse(data)
    }
  }

  const loadUpcomingEvents = async () => {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('events')
      .select(`
        id,
        title_en,
        title_bm,
        description_en,
        description_bm,
        date,
        time,
        location
      `)
      .gte('date', today)
      .order('date', { ascending: true })
      .order('time', { ascending: true })
      .limit(6)

    if (!error && data) {
      setEvents(data)
    }
  }

  const loadRoster = async () => {
    const now = new Date()

    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0]

    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0]

    const { data, error } = await supabase
      .from('roster')
      .select('id, week_start, leader, pianist, reader')
      .gte('week_start', firstDay)
      .lte('week_start', lastDay)
      .order('week_start', { ascending: true })

    if (!error && data) {
      setRoster(data)
    }
  }

  const currentMonthRoster = roster

  const formatTimeForDisplay = (time24) => {
    if (!time24) return ''

    const [hour, minute] = time24.split(':')
    const h = parseInt(hour)

    const period = h >= 12 ? 'PM' : 'AM'
    const hour12 = h % 12 || 12

    return `${hour12}:${minute} ${period}`
  }

  const formatEventDate = (dateStr) => {
    if (!dateStr) return {}

    const date = new Date(dateStr)

    return {
      day: date.getDate(),
      month: date.toLocaleString('default', { month: 'short' }),
      dayName: date.toLocaleString('default', { weekday: 'long' }),
    }
  }

  const handleNavClick = (item) => {
    setMenuOpen(false)

    if (item.isRouterLink) {
      navigate(item.href)
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
    <div
      className="min-h-screen overflow-x-hidden bg-[#FAF8F5] text-[#2D2926]"
      style={{ fontFamily: "'Lora', serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap"
        rel="stylesheet"
      />

      {/* NAV */}
      <nav
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-500
          px-5
          ${
            scrolled
              ? 'bg-[#FAF8F5]/90 backdrop-blur-xl border-b border-[#EADFD2]'
              : 'bg-transparent border-b border-transparent'
          }
        `}
      >
        <div className="max-w-6xl mx-auto h-16 flex items-center justify-between">

          <span
            className="uppercase tracking-[0.22em] text-[11px] text-[#8A7A6E]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Gereja Baptis Tawau
          </span>

          <div className="flex items-center gap-3">

            <button
              onClick={() => setLang((l) => (l === 'en' ? 'bm' : 'en'))}
              className="
                rounded-full
                border border-[#D8C8B7]
                bg-white/80
                px-4
                py-2
                text-[11px]
                uppercase
                tracking-[0.14em]
                text-[#8A7A6E]
                transition
                hover:bg-white
              "
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {lang === 'en' ? 'BM' : 'EN'}
            </button>

            <button
              onClick={() => setMenuOpen((o) => !o)}
              className={`
                w-11 h-11 rounded-full border
                flex items-center justify-center
                transition-all duration-300
                ${
                  menuOpen
                    ? 'bg-[#2D2926] border-[#2D2926]'
                    : 'bg-white/85 border-[#D8C8B7]'
                }
              `}
            >
              <div className="flex flex-col gap-[5px]">
                {[0, 1].map((i) => (
                  <span
                    key={i}
                    className={`
                      block w-[18px] h-[1.5px] rounded-full transition-all duration-300
                      ${menuOpen ? 'bg-[#FAF8F5]' : 'bg-[#4A3F38]'}
                    `}
                    style={{
                      transform: menuOpen
                        ? i === 0
                          ? 'rotate(45deg) translate(4px, 4px)'
                          : 'rotate(-45deg) translate(4px, -4px)'
                        : 'none',
                    }}
                  />
                ))}
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* MENU */}
      <div
        className={`
          fixed inset-0 z-40
          bg-[#2D2926]
          flex flex-col items-center justify-center
          transition-all duration-500
          ${
            menuOpen
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'
          }
        `}
      >
        <div className="text-center">
          {NAV_LINKS.map((item, i) => (
            <div
              key={item.en}
              className={`
                overflow-hidden
                transition-all duration-500
                ${menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}
              `}
              style={{ transitionDelay: `${i * 70}ms` }}
            >
              {item.isRouterLink ? (
                <button
                  onClick={() => handleNavClick(item)}
                  className="
                    block
                    w-full
                    bg-transparent
                    border-none
                    text-[#F5F0EB]
                    text-[clamp(2rem,8vw,3.5rem)]
                    py-2
                    transition-colors
                    hover:text-[#C9A882]
                  "
                  style={{ fontFamily: "'Lora', serif" }}
                >
                  {t(item.en, item.bm)}
                </button>
              ) : (
                <a
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="
                    block
                    text-[#F5F0EB]
                    text-[clamp(2rem,8vw,3.5rem)]
                    py-2
                    transition-colors
                    hover:text-[#C9A882]
                  "
                  style={{ fontFamily: "'Lora', serif" }}
                >
                  {t(item.en, item.bm)}
                </a>
              )}
            </div>
          ))}
        </div>

        <p
          className="
            mt-12
            uppercase
            tracking-[0.25em]
            text-[11px]
            text-[#6B5E55]
          "
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Jalan Kuhara, 91000 Tawau, Sabah
        </p>
      </div>

      {/* HERO */}
      <section
        id="home"
        className="
          relative
          min-h-screen
          flex flex-col items-center justify-center
          px-6
          pt-32
          pb-20
          text-center
          overflow-hidden
          bg-gradient-to-br from-[#FAF8F5] to-[#F0E9DF]
        "
      >

        <div className="absolute top-[8%] left-[-5%] w-[260px] h-[260px] rounded-full bg-[radial-gradient(circle,rgba(210,185,160,0.25)_0%,transparent_70%)]" />
        <div className="absolute bottom-[10%] right-[-8%] w-[320px] h-[320px] rounded-full bg-[radial-gradient(circle,rgba(185,160,130,0.18)_0%,transparent_70%)]" />

        <div className="relative z-10 max-w-2xl w-full">

          <div className="flex justify-center mb-10">
            <img
              src="/logo.webp"
              alt="Gereja Baptis Tawau"
              className="w-[clamp(140px,38vw,200px)] object-contain opacity-95"
            />
          </div>

          <blockquote className="mb-10">
            <p
              className="
                italic
                text-[clamp(1.35rem,4vw,2rem)]
                leading-[1.6]
                tracking-[-0.02em]
                text-[#2D2926]
                mb-4
              "
            >
              “{verse.text}”
            </p>

            <cite
              className="
                uppercase
                tracking-[0.3em]
                text-[10px]
                text-[#B09882]
                not-italic
              "
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {verse.reference}
            </cite>
          </blockquote>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap justify-center gap-3">

            <a
              href="#about"
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-[#2D2926]
                px-7
                py-4
                text-[#FAF8F5]
                transition-all
                duration-300
                hover:bg-[#463C35]
                hover:scale-[1.02]
                shadow-[0_10px_30px_rgba(45,41,38,0.14)]
              "
              style={{
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              Welcome
            </a>

            <button
              onClick={() => setActiveModal('events')}
              className="
                rounded-full
                border
                border-[#D8C8B7]
                bg-white/80
                backdrop-blur-sm
                px-7
                py-4
                text-[#7A6A5E]
                transition-all
                duration-300
                hover:-translate-y-[2px]
                hover:bg-white
                hover:shadow-[0_10px_30px_rgba(80,55,35,0.08)]
              "
              style={{
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                fontSize: '11px',
                fontWeight: 500,
              }}
            >
              {t('Events', 'Acara')}
            </button>

            <button
              onClick={() => setActiveModal('roster')}
              className="
                rounded-full
                border
                border-[#D8C8B7]
                bg-white/80
                backdrop-blur-sm
                px-7
                py-4
                text-[#7A6A5E]
                transition-all
                duration-300
                hover:-translate-y-[2px]
                hover:bg-white
                hover:shadow-[0_10px_30px_rgba(80,55,35,0.08)]
              "
              style={{
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                fontSize: '11px',
                fontWeight: 500,
              }}
            >
              Roster
            </button>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="px-6 py-24">
        <div className="max-w-2xl mx-auto text-center">

          <p
            className="
              uppercase
              tracking-[0.3em]
              text-[10px]
              text-[#B09882]
              mb-6
            "
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {t('Welcome', 'Selamat Datang')}
          </p>

          <h2 className="text-[clamp(1.8rem,5vw,3rem)] leading-tight tracking-[-0.03em] mb-6">
            {t(
              'A community of faith, hope, and love.',
              'Komuniti iman, harapan, dan kasih.'
            )}
          </h2>

          <p
            className="
              text-[#7A6E66]
              leading-[2]
              text-[15px]
              font-light
            "
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {t(
              'Whether you are seeking spiritual growth, fellowship, healing, or simply a place to belong — you are welcome here. Together we worship, learn, serve, and grow in Christ.',
              'Sama ada anda mencari pertumbuhan rohani, persekutuan, penyembuhan, atau sekadar tempat untuk diterima — anda dialu-alukan di sini.'
            )}
          </p>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="px-6 py-20 bg-[#F4EEE6]">
        <div className="max-w-xl mx-auto text-center">

          <p
            className="
              uppercase
              tracking-[0.3em]
              text-[10px]
              text-[#B09882]
              mb-4
            "
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {t('Find Us', 'Lokasi Kami')}
          </p>

          <h2 className="text-[clamp(1.5rem,4vw,2.2rem)] tracking-[-0.03em] mb-3">
            {t("We'd love to meet you", 'Kami ingin berjumpa anda')}
          </h2>

          <p
            className="text-[#8A7A6E] text-[14px] leading-7 mb-10"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Jalan Kuhara, 91000 Tawau, Sabah
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                label: t('Sunday Worship', 'Kebaktian Ahad'),
                value: '11:00 AM',
              },
              {
                label: t('Wednesday Prayer', 'Doa Rabu'),
                value: '7:30 PM',
              },
              {
                label: t('Phone', 'Telefon'),
                value: '+60 XX-XXX XXXX',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="
                  rounded-3xl
                  border border-[#E6D8C8]
                  bg-white/75
                  p-5
                "
              >
                <p
                  className="
                    uppercase
                    tracking-[0.18em]
                    text-[10px]
                    text-[#B09882]
                    mb-3
                  "
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {item.label}
                </p>

                <p className="text-[#2D2926] text-[15px] font-medium">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#2D2926] px-6 py-12 text-center">

        <p
          className="
            uppercase
            tracking-[0.28em]
            text-[10px]
            text-[#6B5E55]
            mb-4
          "
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Gereja Baptis Tawau
        </p>

        <div className="w-8 h-px bg-white/10 mx-auto mb-6" />

        <p
          className="text-[#7A6A5E] italic text-[14px]"
          style={{ fontFamily: "'Lora', serif" }}
        >
          A new beginning.
        </p>
      </footer>

      {/* EVENTS MODAL */}
      {activeModal === 'events' && (
        <div className="fixed inset-0 z-[200] bg-[#2D2926]/45 backdrop-blur-md flex items-center justify-center px-5 py-8">

          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] bg-[#FAF8F5] shadow-2xl border border-[#E6D8C8] p-6 sm:p-8">

            <button
              onClick={() => {
                setActiveModal(null)
                setSelectedEvent(null)
              }}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-[#F3ECE3] text-[#7A6A5E] hover:bg-[#EADFD2] transition"
            >
              ✕
            </button>

            <div className="text-center mb-8">
              <p
                className="uppercase tracking-[0.3em] text-[10px] text-[#B09882] mb-3"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {t('Upcoming', 'Akan Datang')}
              </p>

              <h2 className="text-[clamp(1.7rem,4vw,2.5rem)] tracking-[-0.03em]">
                {t('Events', 'Acara')}
              </h2>
            </div>

            {selectedEvent ? (
              <div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="mb-6 text-[#8A7A6E] text-sm hover:text-[#2D2926] transition"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  ← {t('Back', 'Kembali')}
                </button>

                <div className="space-y-5">

                  <div>
                    <p
                      className="uppercase tracking-[0.18em] text-[10px] text-[#B09882] mb-2"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {formatEventDate(selectedEvent.date).day}{' '}
                      {formatEventDate(selectedEvent.date).month}
                    </p>

                    <h3 className="text-3xl leading-tight tracking-[-0.02em]">
                      {t(
                        selectedEvent.title_en,
                        selectedEvent.title_bm || selectedEvent.title_en
                      )}
                    </h3>
                  </div>

                  <div
                    className="flex flex-wrap gap-3 text-sm text-[#8A7A6E]"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    <span>
                      {formatTimeForDisplay(selectedEvent.time)}
                    </span>

                    {selectedEvent.location && (
                      <span>
                        · {selectedEvent.location}
                      </span>
                    )}
                  </div>

                  <p
                    className="leading-8 text-[#5E534B] text-[15px]"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {t(
                      selectedEvent.description_en,
                      selectedEvent.description_bm || selectedEvent.description_en
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event) => {
                  const { day, month, dayName } = formatEventDate(event.date)

                  return (
                    <button
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className="w-full text-left flex items-center gap-5 rounded-3xl border border-[#E6D8C8] bg-white/75 p-5 hover:bg-white hover:translate-x-[2px] transition-all"
                    >
                      <div className="min-w-[52px] text-center">
                        <div className="text-2xl font-medium">
                          {day}
                        </div>

                        <div
                          className="uppercase tracking-[0.18em] text-[10px] text-[#B09882]"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {month}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-[16px] mb-1 font-medium">
                          {t(event.title_en, event.title_bm || event.title_en)}
                        </p>

                        <p
                          className="text-[#9A8A7B] text-xs"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {dayName} · {formatTimeForDisplay(event.time)}
                        </p>
                      </div>

                      <span className="text-[#B09882] text-lg">
                        →
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ROSTER MODAL */}
      {activeModal === 'roster' && (
        <div className="fixed inset-0 z-[200] bg-[#2D2926]/45 backdrop-blur-md flex items-center justify-center px-5 py-8">

          <div className="relative w-full max-w-xl rounded-[32px] bg-[#FAF8F5] border border-[#E6D8C8] p-6 sm:p-8 shadow-2xl">

            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-[#F3ECE3] text-[#7A6A5E] hover:bg-[#EADFD2] transition"
            >
              ✕
            </button>

            <div className="text-center mb-8">
              <p
                className="uppercase tracking-[0.3em] text-[10px] text-[#B09882] mb-3"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {t('Schedule', 'Jadual')}
              </p>

              <h2 className="text-[clamp(1.7rem,4vw,2.4rem)]">
                {t('Week', 'Minggu')}
              </h2>
            </div>

            <div className="flex justify-center gap-2 mb-8">
              {currentMonthRoster.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedWeek(index)}
                  className={`
                    w-11 h-11 rounded-full transition-all text-sm
                    ${
                      selectedWeek === index
                        ? 'bg-[#2D2926] text-white'
                        : 'bg-[#F3ECE3] text-[#8A7A6E] hover:bg-[#E8DDD0]'
                    }
                  `}
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 500,
                  }}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {currentMonthRoster[selectedWeek] && (
              <div className="rounded-[28px] border border-[#E6D8C8] bg-white/75 p-6">

                <div className="mb-6 text-center">
                  <p
                    className="uppercase tracking-[0.18em] text-[10px] text-[#B09882] mb-2"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {t('Week Starting', 'Minggu Bermula')}
                  </p>

                  <h3 className="text-2xl font-medium">
                    {new Date(
                      currentMonthRoster[selectedWeek].week_start
                    ).toLocaleDateString('en-MY', {
                      day: 'numeric',
                      month: 'long',
                    })}
                  </h3>
                </div>

                <div className="space-y-5">
                  {[
                    {
                      label: t('Leader', 'Pemimpin'),
                      value: currentMonthRoster[selectedWeek].leader,
                    },
                    {
                      label: t('Pianist', 'Pemain Piano'),
                      value: currentMonthRoster[selectedWeek].pianist,
                    },
                    {
                      label: t('Reader', 'Pembaca'),
                      value: currentMonthRoster[selectedWeek].reader,
                    },
                  ].map((role) => (
                    <div
                      key={role.label}
                      className="border-b border-[#EFE4D8] pb-4 last:border-none last:pb-0"
                    >
                      <p
                        className="uppercase tracking-[0.16em] text-[10px] text-[#B09882] mb-2"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {role.label}
                      </p>

                      <p className="text-[18px] font-medium">
                        {role.value || '—'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}