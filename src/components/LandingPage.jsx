import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const NAV_LINKS = [
  { en: 'Home', bm: 'Utama', href: '#home' },
  { en: 'About', bm: 'Tentang Kami', href: '#about' },
  { en: 'Ministries', bm: 'Pelayanan', href: '#ministries' },
  { en: 'Events', bm: 'Acara', href: '#events' },
  { en: 'Contact', bm: 'Hubungi', href: '#contact' },

  // Staff login route
  { en: 'Staff', bm: 'Staf', href: '/login' },
]

const MINISTRIES = [
  {
    icon: '✦',
    en: 'Youth Ministry',
    bm: 'Pelayanan Belia',
    desc: 'Empowering the next generation to live boldly for Christ.',
    descBM: 'Memperkasakan generasi muda untuk hidup dalam Kristus.',
  },
  {
    icon: '✦',
    en: "Children's Church",
    bm: 'Gereja Kanak-Kanak',
    desc: "A safe, joyful space where children encounter God's love.",
    descBM: 'Ruang yang selamat dan gembira untuk kanak-kanak mengenali kasih Tuhan.',
  },
  {
    icon: '✦',
    en: 'Community Outreach',
    bm: 'Penjangkauan Komuniti',
    desc: 'Serving Tawau through compassion, care, and generosity.',
    descBM: 'Melayani Tawau dengan belas kasihan dan kemurahan hati.',
  },
  {
    icon: '✦',
    en: 'Prayer & Worship',
    bm: 'Doa & Penyembahan',
    desc: 'Gathering mid-week to seek God in prayer and song.',
    descBM: 'Berkumpul pada pertengahan minggu untuk berdoa dan memuji Tuhan.',
  },
]

const EVENTS = [
  { date: 'Jun 1', day: 'Sunday', en: 'Communion Sunday', bm: 'Hari Perjamuan Kudus', time: '9:00 & 11:00 AM' },
  { date: 'Jun 4', day: 'Wednesday', en: 'Midweek Prayer', bm: 'Doa Pertengahan Minggu', time: '7:30 PM' },
  { date: 'Jun 15', day: 'Sunday', en: 'Youth Sunday', bm: 'Hari Belia', time: '11:00 AM' },
  { date: 'Jun 22', day: 'Sunday', en: 'Baptism Service', bm: 'Majlis Pembaptisan', time: '9:00 AM' },
]

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [lang, setLang] = useState('en')
  const [scrolled, setScrolled] = useState(false)

  const t = (en, bm) => (lang === 'bm' ? bm : en)

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

  return (
    <div
      style={{
        fontFamily: "'Lora', 'Georgia', serif",
        background: '#FAF8F5',
        color: '#2D2926',
        minHeight: '100vh',
        overflowX: 'hidden',
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap"
        rel="stylesheet"
      />

      {/* ── NAV ── */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: '0 1.25rem',
          background: scrolled ? 'rgba(250,248,245,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          transition: 'background 0.4s, backdrop-filter 0.4s',
          borderBottom: scrolled
            ? '1px solid rgba(180,160,140,0.15)'
            : '1px solid transparent',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 64,
          }}
        >
          {/* Logo text */}
          <div>
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#8A7A6E',
                fontWeight: 400,
              }}
            >
              Gereja Baptis Tawau
            </span>
          </div>

          {/* Right controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {/* Language toggle */}
            <button
              onClick={() => setLang((l) => (l === 'en' ? 'bm' : 'en'))}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#8A7A6E',
                background: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(180,160,140,0.3)',
                borderRadius: 20,
                padding: '5px 12px',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'all 0.2s',
              }}
            >
              {lang === 'en' ? 'BM' : 'EN'}
            </button>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: menuOpen
                  ? '#2D2926'
                  : 'rgba(255,255,255,0.85)',
                border: '1px solid rgba(180,160,140,0.25)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                cursor: 'pointer',
                transition: 'background 0.3s',
              }}
            >
              {[0, 1].map((i) => (
                <span
                  key={i}
                  style={{
                    display: 'block',
                    width: 18,
                    height: 1.5,
                    background: menuOpen ? '#FAF8F5' : '#4A3F38',
                    borderRadius: 2,
                    transition: 'transform 0.3s, opacity 0.3s',
                    transform: menuOpen
                      ? i === 0
                        ? 'rotate(45deg) translate(4px, 4px)'
                        : 'rotate(-45deg) translate(4px, -4px)'
                      : 'none',
                  }}
                />
              ))}
            </button>
          </div>
        </div>
      </nav>

      {/* ── FULLSCREEN MENU ── */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 90,
          background: '#2D2926',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'all' : 'none',
          transition: 'opacity 0.45s cubic-bezier(.4,0,.2,1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          {NAV_LINKS.map((item, i) => {
            const isRoute = item.href.startsWith('/')

            return (
              <div
                key={item.en}
                style={{
                  overflow: 'hidden',
                  transform: menuOpen
                    ? 'translateY(0)'
                    : 'translateY(20px)',
                  opacity: menuOpen ? 1 : 0,
                  transition: `transform 0.5s ${
                    0.05 * i + 0.1
                  }s cubic-bezier(.4,0,.2,1), opacity 0.5s ${
                    0.05 * i + 0.1
                  }s`,
                }}
              >
                {isRoute ? (
                  <Link
                    to={item.href}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: 'block',
                      fontFamily: "'Lora', serif",
                      fontSize: 'clamp(2rem, 8vw, 3.5rem)',
                      fontWeight: 400,
                      color: '#F5F0EB',
                      textDecoration: 'none',
                      letterSpacing: '-0.01em',
                      padding: '0.3rem 0',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#C9A882'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#F5F0EB'
                    }}
                  >
                    {t(item.en, item.bm)}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: 'block',
                      fontFamily: "'Lora', serif",
                      fontSize: 'clamp(2rem, 8vw, 3.5rem)',
                      fontWeight: 400,
                      color: '#F5F0EB',
                      textDecoration: 'none',
                      letterSpacing: '-0.01em',
                      padding: '0.3rem 0',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#C9A882'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#F5F0EB'
                    }}
                  >
                    {t(item.en, item.bm)}
                  </a>
                )}
              </div>
            )
          })}
        </div>

        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: '#6B5E55',
            fontSize: 11,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            marginTop: '3rem',
            opacity: menuOpen ? 1 : 0,
            transition: 'opacity 0.5s 0.35s',
          }}
        >
          Jalan Kuhara, 91000 Tawau, Sabah
        </p>
      </div>

      {/* KEEP REST OF YOUR EXISTING SECTIONS UNCHANGED */}
    </div>
  )
}