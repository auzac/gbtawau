import React, { useState, useEffect } from 'react'

const NAV_LINKS = [
  { en: 'Home', bm: 'Utama', href: '#home' },
  { en: 'About', bm: 'Tentang Kami', href: '#about' },
  { en: 'Ministries', bm: 'Pelayanan', href: '#ministries' },
  { en: 'Events', bm: 'Acara', href: '#events' },
  { en: 'Contact', bm: 'Hubungi', href: '#contact' },
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

  const t = (en, bm) => lang === 'bm' ? bm : en

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <div style={{ fontFamily: "'Lora', 'Georgia', serif", background: '#FAF8F5', color: '#2D2926', minHeight: '100vh', overflowX: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 1.25rem',
        background: scrolled ? 'rgba(250,248,245,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'background 0.4s, backdrop-filter 0.4s',
        borderBottom: scrolled ? '1px solid rgba(180,160,140,0.15)' : '1px solid transparent',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

          {/* Logo text */}
          <div>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#8A7A6E', fontWeight: 400 }}>
              Gereja Baptis Tawau
            </span>
          </div>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

            {/* Language toggle */}
            <button
              onClick={() => setLang(l => l === 'en' ? 'bm' : 'en')}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
                color: '#8A7A6E', background: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(180,160,140,0.3)',
                borderRadius: 20, padding: '5px 12px', cursor: 'pointer',
                fontWeight: 500, transition: 'all 0.2s',
              }}
            >
              {lang === 'en' ? 'BM' : 'EN'}
            </button>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu"
              style={{
                width: 42, height: 42, borderRadius: '50%',
                background: menuOpen ? '#2D2926' : 'rgba(255,255,255,0.85)',
                border: '1px solid rgba(180,160,140,0.25)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 5, cursor: 'pointer', transition: 'background 0.3s',
              }}
            >
              {[0, 1].map(i => (
                <span key={i} style={{
                  display: 'block', width: 18, height: 1.5,
                  background: menuOpen ? '#FAF8F5' : '#4A3F38',
                  borderRadius: 2,
                  transition: 'transform 0.3s, opacity 0.3s',
                  transform: menuOpen
                    ? i === 0 ? 'rotate(45deg) translate(4px, 4px)' : 'rotate(-45deg) translate(4px, -4px)'
                    : 'none',
                }} />
              ))}
            </button>
          </div>
        </div>
      </nav>

      {/* ── FULLSCREEN MENU ── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 90,
        background: '#2D2926',
        opacity: menuOpen ? 1 : 0,
        pointerEvents: menuOpen ? 'all' : 'none',
        transition: 'opacity 0.45s cubic-bezier(.4,0,.2,1)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 0,
      }}>
        <div style={{ textAlign: 'center' }}>
          {NAV_LINKS.map((item, i) => (
            <div key={item.en} style={{
              overflow: 'hidden',
              transform: menuOpen ? 'translateY(0)' : 'translateY(20px)',
              opacity: menuOpen ? 1 : 0,
              transition: `transform 0.5s ${0.05 * i + 0.1}s cubic-bezier(.4,0,.2,1), opacity 0.5s ${0.05 * i + 0.1}s`,
            }}>
              <a
                href={item.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'block',
                  fontFamily: "'Lora', serif",
                  fontSize: 'clamp(2rem, 8vw, 3.5rem)',
                  fontWeight: 400, color: '#F5F0EB',
                  textDecoration: 'none', letterSpacing: '-0.01em',
                  padding: '0.3rem 0',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#C9A882' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#F5F0EB' }}
              >
                {t(item.en, item.bm)}
              </a>
            </div>
          ))}
        </div>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          color: '#6B5E55', fontSize: 11, letterSpacing: '0.25em',
          textTransform: 'uppercase', marginTop: '3rem',
          opacity: menuOpen ? 1 : 0, transition: 'opacity 0.5s 0.35s',
        }}>
          Jalan Kuhara, 91000 Tawau, Sabah
        </p>
      </div>

      {/* ── HERO ── */}
      <section id="home" style={{
        minHeight: '100svh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '7rem 1.5rem 5rem',
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(170deg, #FAF8F5 0%, #F0E9DF 100%)',
        textAlign: 'center',
      }}>

        {/* Decorative orbs */}
        <div style={{ position: 'absolute', top: '8%', left: '-5%', width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(210,185,160,0.25) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '-8%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(185,160,130,0.18) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 1, height: '12vh', background: 'linear-gradient(to bottom, transparent, rgba(180,155,125,0.35))' }} />

        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 600 }}>

          {/* Logo — centered, prominent */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <img
              src="/logo.webp"
              alt="Gereja Baptis Tawau"
              loading="eager"
              style={{ width: 'clamp(140px, 38vw, 200px)', objectFit: 'contain', opacity: 0.93 }}
            />
          </div>

          {/* Scripture */}
          <blockquote style={{ margin: '0 0 2rem', padding: 0 }}>
            <p style={{
              fontSize: 'clamp(1.3rem, 4vw, 2rem)',
              fontWeight: 400, lineHeight: 1.5, color: '#2D2926',
              fontStyle: 'italic', marginBottom: '0.85rem',
              letterSpacing: '-0.01em',
            }}>
              "Come to me, all you who are weary and burdened, and I will give you rest."
            </p>
            <cite style={{
              fontFamily: "'DM Sans', sans-serif",
              fontStyle: 'normal', fontSize: 10, letterSpacing: '0.3em',
              textTransform: 'uppercase', color: '#B09882',
            }}>
              Matthew 11:28
            </cite>
          </blockquote>

          {/* Primary CTA — Masuk / Welcome */}
          <div style={{ marginBottom: '2.5rem' }}>
            <a href="#today" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14, letterSpacing: '0.12em', textTransform: 'uppercase',
              fontWeight: 500, color: '#FAF8F5',
              background: '#2D2926', borderRadius: 999,
              padding: '15px 36px', textDecoration: 'none',
              transition: 'background 0.25s, transform 0.2s',
              boxShadow: '0 4px 20px rgba(45,41,38,0.18)',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#4A3F38'; e.currentTarget.style.transform = 'scale(1.02)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#2D2926'; e.currentTarget.style.transform = 'scale(1)' }}
            >
              {/* Door/enter icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 3H19C19.5523 3 20 3.44772 20 4V20C20 20.5523 19.5523 21 19 21H15"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              {t('Welcome', 'Masuk')}
            </a>
          </div>

          {/* Quick action buttons — Calendar & Roster */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>

            {/* Calendar / Events */}
            <a href="#events" style={{
              display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.75)',
              border: '1px solid rgba(180,155,125,0.25)',
              borderRadius: 20, padding: '16px 24px',
              textDecoration: 'none', minWidth: 110,
              transition: 'transform 0.2s, box-shadow 0.2s, background 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(80,55,35,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.95)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = 'rgba(255,255,255,0.75)' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7A6A5E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="3"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
                <circle cx="8" cy="15" r="1" fill="#7A6A5E"/>
                <circle cx="12" cy="15" r="1" fill="#7A6A5E"/>
              </svg>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
                color: '#7A6A5E', fontWeight: 500,
              }}>
                {t('Calendar', 'Kalendar')}
              </span>
            </a>

            {/* Roster / Worship Team */}
            <a href="#roster" style={{
              display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.75)',
              border: '1px solid rgba(180,155,125,0.25)',
              borderRadius: 20, padding: '16px 24px',
              textDecoration: 'none', minWidth: 110,
              transition: 'transform 0.2s, box-shadow 0.2s, background 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(80,55,35,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.95)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = 'rgba(255,255,255,0.75)' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7A6A5E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="9" cy="7" r="3"/>
                <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                <path d="M21 21v-2a4 4 0 0 0-3-3.85"/>
              </svg>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
                color: '#7A6A5E', fontWeight: 500,
              }}>
                {t('Roster', 'Jadual')}
              </span>
            </a>

          </div>
        </div>

        {/* Scroll cue */}
        <div style={{
          position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          opacity: 0.35, animation: 'bob 2.5s ease-in-out infinite',
        }}>
          <div style={{ width: 1, height: 36, background: 'linear-gradient(to bottom, transparent, #8A7A6E)' }} />
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#8A7A6E' }} />
        </div>
      </section>

      {/* ── ABOUT / WELCOME ── */}
      <section id="about" style={{ padding: 'clamp(4rem, 10vw, 7rem) 1.5rem' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#B09882', marginBottom: '1.5rem' }}>
            {t('Welcome', 'Selamat Datang')}
          </p>
          <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 400, lineHeight: 1.3, margin: '0 0 1.5rem', letterSpacing: '-0.02em' }}>
            {t(
              <>A community of <em>faith,</em> hope, and love.</>,
              <>Komuniti <em>iman,</em> harapan, dan kasih.</>
            )}
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(15px, 2.5vw, 17px)', lineHeight: 1.85, color: '#7A6E66', fontWeight: 300, maxWidth: 560, margin: '0 auto' }}>
            {t(
              'Whether you are seeking spiritual growth, fellowship, healing, or simply a place to belong — you are welcome here. Together we worship, learn, serve, and grow in Christ.',
              'Sama ada anda mencari pertumbuhan rohani, persekutuan, penyembuhan, atau sekadar tempat untuk diterima — anda dialu-alukan di sini. Bersama-sama kita menyembah, belajar, melayani, dan bertumbuh dalam Kristus.'
            )}
          </p>

          {/* Divider ornament */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '2.5rem 0 0' }}>
            <div style={{ width: 40, height: 1, background: 'rgba(180,155,125,0.4)' }} />
            <div style={{ width: 5, height: 5, borderRadius: '50%', border: '1px solid rgba(180,155,125,0.5)' }} />
            <div style={{ width: 40, height: 1, background: 'rgba(180,155,125,0.4)' }} />
          </div>
        </div>
      </section>

      {/* ── MINISTRIES ── */}
      <section id="ministries" style={{ padding: '0 1.25rem clamp(4rem, 10vw, 7rem)', background: '#FAF8F5' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#B09882', marginBottom: 12 }}>
              {t('Our Ministries', 'Pelayanan Kami')}
            </p>
            <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 400, margin: 0, letterSpacing: '-0.02em' }}>
              {t('Serving together in love', 'Melayani bersama dalam kasih')}
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 16 }}>
            {MINISTRIES.map((m, i) => (
              <div key={m.en} style={{
                background: i % 2 === 0 ? 'rgba(255,255,255,0.8)' : 'rgba(240,233,225,0.55)',
                border: '1px solid rgba(180,155,125,0.18)',
                borderRadius: 20, padding: 'clamp(1.25rem, 4vw, 1.75rem)',
                transition: 'transform 0.25s, box-shadow 0.25s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(80,55,35,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(200,168,130,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', fontSize: 16, color: '#A08060' }}>
                  {m.icon}
                </div>
                <h3 style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(1rem, 3vw, 1.2rem)', fontWeight: 500, margin: '0 0 0.6rem', color: '#2D2926' }}>
                  {t(m.en, m.bm)}
                </h3>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, lineHeight: 1.75, color: '#8A7A6E', margin: 0, fontWeight: 300 }}>
                  {t(m.desc, m.descBM)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EVENTS ── */}
      <section id="events" style={{ padding: 'clamp(4rem, 10vw, 6rem) 1.25rem', background: '#F2EBE1' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#B09882', marginBottom: 12 }}>
              {t('Upcoming', 'Acara Akan Datang')}
            </p>
            <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 400, margin: 0, letterSpacing: '-0.02em' }}>
              {t("What's happening", 'Apa yang berlaku')}
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {EVENTS.map((ev, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.75)',
                border: '1px solid rgba(180,155,125,0.2)',
                borderRadius: 16,
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '1rem 1.25rem',
                transition: 'transform 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
              >
                {/* Date block */}
                <div style={{ minWidth: 52, textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 500, color: '#2D2926', lineHeight: 1 }}>{ev.date.split(' ')[1]}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#B09882', marginTop: 2 }}>{ev.date.split(' ')[0]}</div>
                </div>

                {/* Divider */}
                <div style={{ width: 1, height: 40, background: 'rgba(180,155,125,0.25)', flexShrink: 0 }} />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(14px, 3vw, 16px)', fontWeight: 500, margin: '0 0 3px', color: '#2D2926' }}>
                    {t(ev.en, ev.bm)}
                  </p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#A08070', margin: 0 }}>
                    {ev.day} · {ev.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ padding: 'clamp(4rem, 10vw, 7rem) 1.25rem', background: '#FAF8F5' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#B09882', marginBottom: 12 }}>
            {t('Find Us', 'Lokasi Kami')}
          </p>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 400, margin: '0 0 1rem', letterSpacing: '-0.02em' }}>
            {t("We'd love to meet you", 'Kami ingin berjumpa anda')}
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#8A7A6E', lineHeight: 1.8, fontWeight: 300, marginBottom: '2.5rem' }}>
            Jalan Kuhara, 91000 Tawau, Sabah
          </p>

          {/* Contact cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 12, marginBottom: '2rem' }}>
            {[
              { label: t('Sunday Worship', 'Kebaktian Ahad'), value: '11:00 AM', icon: '◯' },
              { label: t('Wednesday Prayer', 'Doa Rabu'), value: '7:30 PM', icon: '◯' },
              { label: t('Phone', 'Telefon'), value: '+60 XX-XXX XXXX', icon: '◯' },
            ].map(c => (
              <div key={c.label} style={{
                background: 'rgba(255,255,255,0.8)',
                border: '1px solid rgba(180,155,125,0.2)',
                borderRadius: 16, padding: '1.25rem 1rem',
              }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B09882', margin: '0 0 8px' }}>{c.label}</p>
                <p style={{ fontFamily: "'Lora', serif", fontSize: 15, fontWeight: 500, color: '#2D2926', margin: 0 }}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* Member portal CTA */}
          <a href="#" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase',
            fontWeight: 500, color: '#FAF8F5',
            background: '#2D2926', borderRadius: 999,
            padding: '14px 32px', textDecoration: 'none',
            transition: 'background 0.25s, transform 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#4A3F38' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#2D2926' }}
          >
            {t('Member Portal', 'Portal Ahli')}
            <span style={{ fontSize: 16, opacity: 0.7 }}>→</span>
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#2D2926', padding: '2.5rem 1.5rem 2rem', textAlign: 'center' }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#6B5E55', marginBottom: 8 }}>
          Gereja Baptis Tawau
        </p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#5A4E46', margin: '0 0 1.5rem' }}>
          Jalan Kuhara, 91000 Tawau, Sabah
        </p>
        <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.1)', margin: '0 auto 1.5rem' }} />
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#4A4038', margin: 0 }}>
          © 2026 All Rights Reserved
        </p>
      </footer>

      <style>{`
        @keyframes bob {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(6px); }
        }
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  )
}