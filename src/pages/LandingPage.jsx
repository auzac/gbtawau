// src/pages/LandingPage.jsx

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const NAV_LINKS = [
  { en: 'Home', bm: 'Utama', href: '#home' },
  { en: 'About', bm: 'Tentang Kami', href: '#about' },
  { en: 'Events', bm: 'Acara', href: '#events' },
  { en: 'Contact', bm: 'Hubungi', href: '#contact' },
  { en: 'Staff', bm: 'Kakitangan', href: '/login', isRouterLink: true },
]

export default function LandingPage() {
  const navigate = useNavigate()

  const [menuOpen, setMenuOpen] = useState(false)
  const [lang, setLang] = useState('en')
  const [scrolled, setScrolled] = useState(false)
  const [loading, setLoading] = useState(true)

  const [verse, setVerse] = useState({
    reference: 'Matthew 11:28',
    text: 'Come to me, all you who are weary and burdened, and I will give you rest.',
    theme: 'Rest and Peace',
  })

  const [events, setEvents] = useState([])

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
    document.body.style.overflow = menuOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const loadContent = async () => {
    setLoading(true)

    await Promise.all([
      loadActiveVerse(),
      loadUpcomingEvents(),
    ])

    setLoading(false)
  }

  const loadActiveVerse = async () => {
    const { data, error } = await supabase
      .from('verse_library')
      .select('*')
      .eq('is_active', true)
      .maybeSingle()

    if (!error && data) {
      setVerse({
        reference: data.reference,
        text: data.text,
        theme: data.theme || '',
      })
    }
  }

  const loadUpcomingEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .order('time', { ascending: true })
      .limit(6)

    if (!error && data) {
      setEvents(data)
    }
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
    <div className="bg-[#FAF8F5] text-[#2D2926] overflow-x-hidden">
      {/* Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap"
        rel="stylesheet"
      />

      {/* NAVBAR */}
      <nav
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-300
          px-5
          ${scrolled
            ? 'bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#d9c9b7]/20'
            : 'bg-transparent border-b border-transparent'}
        `}
      >
        <div className="max-w-6xl mx-auto h-16 flex items-center justify-between">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="relative w-4 h-4 opacity-70">
              <div className="absolute left-1/2 -translate-x-1/2 w-[1.5px] h-4 bg-[#A58B75] rounded-full" />
              <div className="absolute top-[4px] left-1/2 -translate-x-1/2 w-3 h-[1.5px] bg-[#A58B75] rounded-full" />
            </div>

            <span
              className="
                uppercase tracking-[0.22em]
                text-[11px]
                text-[#8A7A6E]
                font-normal
              "
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Gereja Baptis Tawau
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">

            {/* Language */}
            <button
              onClick={() => setLang((l) => (l === 'en' ? 'bm' : 'en'))}
              className="
                h-9 px-4 rounded-full
                border border-[#d9c9b7]/40
                bg-white/70
                text-[#8A7A6E]
                uppercase tracking-[0.14em]
                text-[11px]
                font-medium
                transition-all duration-200
                hover:bg-white
              "
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {lang === 'en' ? 'BM' : 'EN'}
            </button>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              className={`
                w-11 h-11 rounded-full
                border border-[#d9c9b7]/30
                flex flex-col items-center justify-center gap-[5px]
                transition-all duration-300
                ${menuOpen ? 'bg-[#2D2926]' : 'bg-white/80'}
              `}
            >
              {[0, 1].map((i) => (
                <span
                  key={i}
                  className={`
                    block w-[18px] h-[1.5px] rounded-full
                    transition-all duration-300
                    ${menuOpen ? 'bg-[#FAF8F5]' : 'bg-[#4A3F38]'}
                    ${menuOpen && i === 0 ? 'rotate-45 translate-y-[3px]' : ''}
                    ${menuOpen && i === 1 ? '-rotate-45 -translate-y-[3px]' : ''}
                  `}
                />
              ))}
            </button>
          </div>
        </div>
      </nav>

      {/* FULLSCREEN MENU */}
      <div
        className={`
          fixed inset-0 z-40
          bg-[#2D2926]
          flex flex-col items-center justify-center
          transition-all duration-500
          ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
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
              style={{
                transitionDelay: `${i * 60 + 100}ms`,
              }}
            >
              {item.isRouterLink ? (
                <button
                  onClick={() => handleNavClick(item)}
                  className="
                    block w-full
                    py-1
                    text-[#F5F0EB]
                    hover:text-[#C9A882]
                    transition-colors
                    text-[clamp(2rem,8vw,3.5rem)]
                  "
                  style={{
                    fontFamily: "'Lora', serif",
                    fontWeight: 400,
                  }}
                >
                  {t(item.en, item.bm)}
                </button>
              ) : (
                <a
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="
                    block
                    py-1
                    text-[#F5F0EB]
                    hover:text-[#C9A882]
                    transition-colors
                    text-[clamp(2rem,8vw,3.5rem)]
                  "
                  style={{
                    fontFamily: "'Lora', serif",
                    fontWeight: 400,
                  }}
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
          text-center
          px-6
          pt-32
          pb-20
          overflow-hidden
          bg-gradient-to-b from-[#FAF8F5] to-[#F0E9DF]
        "
      >

        {/* Ambient Orbs */}
        <div className="absolute top-[8%] left-[-5%] w-[260px] h-[260px] rounded-full bg-[radial-gradient(circle,rgba(210,185,160,0.25)_0%,transparent_70%)]" />

        <div className="absolute bottom-[10%] right-[-8%] w-[320px] h-[320px] rounded-full bg-[radial-gradient(circle,rgba(185,160,130,0.18)_0%,transparent_70%)]" />

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-[12vh] bg-gradient-to-b from-transparent to-[#b49b7d]/40" />

        <div className="relative z-10 w-full max-w-2xl">

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img
              src="/logo.webp"
              alt="Gereja Baptis Tawau"
              loading="eager"
              className="w-[clamp(140px,38vw,200px)] object-contain opacity-95"
            />
          </div>

          {/* Verse */}
          <blockquote className="mb-10">
            <p
              className="
                italic
                text-[clamp(1.3rem,4vw,2rem)]
                leading-relaxed
                tracking-[-0.01em]
                text-[#2D2926]
                mb-4
              "
              style={{ fontFamily: "'Lora', serif" }}
            >
              "{verse.text}"
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

          {/* Welcome CTA */}
          <div className="mb-10">
            <a
              href="#about"
              className="
                inline-flex items-center gap-3
                px-9 py-4
                rounded-full
                bg-[#2D2926]
                text-[#FAF8F5]
                uppercase tracking-[0.12em]
                text-sm font-medium
                transition-all duration-300
                hover:bg-[#4A3F38]
                hover:scale-[1.02]
                shadow-lg shadow-black/10
              "
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 3H19C19.5523 3 20 3.44772 20 4V20C20 20.5523 19.5523 21 19 21H15"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>

              {t('Welcome', 'Masuk')}
            </a>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-3">

            {/* Events */}
            <a
              href="#events"
              className="
                min-w-[120px]
                rounded-2xl
                px-6 py-5
                bg-white/70
                border border-[#d9c9b7]/30
                backdrop-blur-sm
                flex flex-col items-center gap-3
                transition-all duration-300
                hover:-translate-y-1
                hover:shadow-xl hover:shadow-black/5
              "
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#7A6A5E"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="3"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>

              <span
                className="
                  uppercase tracking-[0.18em]
                  text-[10px]
                  text-[#7A6A5E]
                  font-medium
                "
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {t('Calendar', 'Kalendar')}
              </span>
            </a>

            {/* Roster */}
            <a
              href="#contact"
              className="
                min-w-[120px]
                rounded-2xl
                px-6 py-5
                bg-white/70
                border border-[#d9c9b7]/30
                backdrop-blur-sm
                flex flex-col items-center gap-3
                transition-all duration-300
                hover:-translate-y-1
                hover:shadow-xl hover:shadow-black/5
              "
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#7A6A5E"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="7" r="3"/>
                <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
              </svg>

              <span
                className="
                  uppercase tracking-[0.18em]
                  text-[10px]
                  text-[#7A6A5E]
                  font-medium
                "
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {t('Contact', 'Hubungi')}
              </span>
            </a>
          </div>
        </div>

        {/* Scroll Cue */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-35 animate-bob flex flex-col items-center gap-2">
          <div className="w-px h-9 bg-gradient-to-b from-transparent to-[#8A7A6E]" />
          <div className="w-1 h-1 rounded-full bg-[#8A7A6E]" />
        </div>
      </section>

      {/* ABOUT */}
      <section
        id="about"
        className="px-6 py-20 md:py-28"
      >
        <div className="max-w-3xl mx-auto text-center">

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

          <h2
            className="
              text-[clamp(1.9rem,5vw,3rem)]
              leading-tight
              tracking-[-0.02em]
              mb-6
              text-[#2D2926]
            "
            style={{
              fontFamily: "'Lora', serif",
              fontWeight: 400,
            }}
          >
            {t(
              <>A community of <em>faith,</em> hope, and love.</>,
              <>Komuniti <em>iman,</em> harapan, dan kasih.</>
            )}
          </h2>

          <p
            className="
              text-[#7A6E66]
              leading-8
              text-[15px]
              md:text-[17px]
              max-w-2xl
              mx-auto
              font-light
            "
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {t(
              'Whether you are seeking spiritual growth, fellowship, healing, or simply a place to belong — you are welcome here. Together we worship, learn, serve, and grow in Christ.',
              'Sama ada anda mencari pertumbuhan rohani, persekutuan, penyembuhan, atau sekadar tempat untuk diterima — anda dialu-alukan di sini. Bersama-sama kita menyembah, belajar, melayani, dan bertumbuh dalam Kristus.'
            )}
          </p>

          {/* Divider */}
          <div className="flex items-center justify-center gap-3 mt-10">
            <div className="w-10 h-px bg-[#b49b7d]/40" />
            <div className="w-[5px] h-[5px] rounded-full border border-[#b49b7d]/50" />
            <div className="w-10 h-px bg-[#b49b7d]/40" />
          </div>
        </div>
      </section>

      {/* EVENTS */}
      <section
        id="events"
        className="bg-[#F2EBE1] px-5 py-20 md:py-24"
      >
        <div className="max-w-3xl mx-auto">

          <div className="text-center mb-12">
            <p
              className="
                uppercase
                tracking-[0.3em]
                text-[10px]
                text-[#B09882]
                mb-3
              "
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {t('Upcoming', 'Acara Akan Datang')}
            </p>

            <h2
              className="
                text-[clamp(1.7rem,4vw,2.5rem)]
                tracking-[-0.02em]
              "
              style={{
                fontFamily: "'Lora', serif",
                fontWeight: 400,
              }}
            >
              {t("What's happening", 'Apa yang berlaku')}
            </h2>
          </div>

          <div className="flex flex-col gap-3">

            {events.length === 0 ? (
              <div className="text-center py-10 text-[#8A7A6E]">
                {t('No upcoming events', 'Tiada acara akan datang')}
              </div>
            ) : (
              events.map((event) => {
                const { day, month, dayName } = formatEventDate(event.date)

                return (
                  <div
                    key={event.id}
                    className="
                      bg-white/70
                      border border-[#d9c9b7]/30
                      rounded-2xl
                      px-6 py-5
                      flex items-center gap-5
                      transition-all duration-300
                      hover:translate-x-1
                    "
                  >
                    {/* Date */}
                    <div className="min-w-[54px] text-center shrink-0">
                      <div
                        className="text-[24px] leading-none text-[#2D2926]"
                        style={{
                          fontFamily: "'Lora', serif",
                          fontWeight: 500,
                        }}
                      >
                        {day}
                      </div>

                      <div
                        className="
                          uppercase
                          tracking-[0.18em]
                          text-[10px]
                          text-[#B09882]
                          mt-1
                        "
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {month}
                      </div>
                    </div>

                    <div className="w-px h-11 bg-[#b49b7d]/25 shrink-0" />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[16px] mb-1 text-[#2D2926]"
                        style={{
                          fontFamily: "'Lora', serif",
                          fontWeight: 500,
                        }}
                      >
                        {t(event.title_en, event.title_bm || event.title_en)}
                      </p>

                      <p
                        className="text-[12px] text-[#A08070]"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {dayName} · {formatTimeForDisplay(event.time)}
                      </p>

                      {event.location && (
                        <p
                          className="text-[10px] text-[#B09882] mt-1"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          📍 {event.location}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        className="px-6 py-20 md:py-24 bg-[#FAF8F5]"
      >
        <div className="max-w-2xl mx-auto text-center">

          <p
            className="
              uppercase
              tracking-[0.3em]
              text-[10px]
              text-[#B09882]
              mb-3
            "
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {t('Find Us', 'Lokasi Kami')}
          </p>

          <h2
            className="
              text-[clamp(1.7rem,4vw,2.5rem)]
              tracking-[-0.02em]
              mb-4
            "
            style={{
              fontFamily: "'Lora', serif",
              fontWeight: 400,
            }}
          >
            {t("We'd love to meet you", 'Kami ingin berjumpa anda')}
          </h2>

          <p
            className="
              text-[#8A7A6E]
              text-sm md:text-base
              leading-7
              mb-10
              font-light
            "
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Jalan Kuhara, 91000 Tawau, Sabah
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

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
                  bg-white/70
                  border border-[#d9c9b7]/30
                  backdrop-blur-sm
                  rounded-2xl
                  p-5
                "
              >
                <p
                  className="
                    uppercase
                    tracking-[0.2em]
                    text-[10px]
                    text-[#B09882]
                    mb-2
                  "
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {item.label}
                </p>

                <p
                  className="text-[15px] text-[#2D2926]"
                  style={{
                    fontFamily: "'Lora', serif",
                    fontWeight: 500,
                  }}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#2D2926] px-6 py-10 text-center">

        <p
          className="
            uppercase
            tracking-[0.28em]
            text-[10px]
            text-[#6B5E55]
            mb-2
          "
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Gereja Baptis Tawau
        </p>

        <p
          className="
            text-[#5A4E46]
            text-sm
            mb-6
          "
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Jalan Kuhara, 91000 Tawau, Sabah
        </p>

        <div className="w-8 h-px bg-white/10 mx-auto mb-6" />

        <p
          className="
            text-[#7A6A5E]
            text-sm italic
          "
          style={{ fontFamily: "'Lora', serif" }}
        >
          A new beginning.
        </p>
      </footer>

      <style>{`
        html {
          scroll-behavior: smooth;
        }

        * {
          box-sizing: border-box;
        }

        @keyframes bob {
          0%, 100% {
            transform: translateX(-50%) translateY(0);
          }

          50% {
            transform: translateX(-50%) translateY(6px);
          }
        }

        .animate-bob {
          animation: bob 2.5s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  )
}