import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, MapPin, Clock, Phone } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useLocale } from '../contexts/LocaleContext'

const NAV_LINKS = [
  { en: 'Home', bm: 'Utama', href: '#home' },
  { en: 'About', bm: 'Tentang Kami', href: '#about' },
  { en: 'Events', bm: 'Acara', href: '#events' },
  { en: 'Contact', bm: 'Hubungi', href: '#contact' },
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
    text: 'Come to me, all you who are weary and burdened, and I will give you rest.',
    theme: 'Rest and Peace',
  })

  const [events, setEvents] = useState([])
  const [carouselItems, setCarouselItems] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  // Helper for bilingual nav
  const getNavText = (item) => (locale === 'bm' ? item.bm : item.en)

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

  // Autoplay carousel
  useEffect(() => {
    if (!autoplay || carouselItems.length === 0) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [autoplay, carouselItems.length])

  const loadContent = async () => {
    setLoading(true)
    await Promise.all([
      loadActiveVerse(),
      loadUpcomingEvents(),
      loadCarouselItems(),
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

  const loadCarouselItems = async () => {
    const { data, error } = await supabase
      .from('carousel_items')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (!error && data) {
      setCarouselItems(data)
      setCurrentSlide(0)
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

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length)
    setAutoplay(false)
    setTimeout(() => setAutoplay(true), 10000) // resume after 10s idle
  }

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselItems.length)
    setAutoplay(false)
    setTimeout(() => setAutoplay(true), 10000)
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

      {/* NAVBAR (same as before, but with toggleLocale) */}
      <nav
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-5
          ${scrolled ? 'bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#d9c9b7]/20' : 'bg-transparent border-b border-transparent'}
        `}
      >
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
            <button
              onClick={toggleLocale}
              className="h-9 px-4 rounded-full border border-[#d9c9b7]/40 bg-white/70 text-[#8A7A6E] uppercase tracking-[0.14em] text-[11px] font-medium transition-all duration-200 hover:bg-white font-['DM_Sans',sans-serif]"
            >
              {locale === 'en' ? 'BM' : 'EN'}
            </button>

            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              className={`w-11 h-11 rounded-full border border-[#d9c9b7]/30 flex flex-col items-center justify-center gap-[5px] transition-all duration-300 ${menuOpen ? 'bg-[#2D2926]' : 'bg-white/80'}`}
            >
              {[0, 1].map((i) => (
                <span
                  key={i}
                  className={`block w-[18px] h-[1.5px] rounded-full transition-all duration-300 ${
                    menuOpen ? 'bg-[#FAF8F5]' : 'bg-[#4A3F38]'
                  } ${menuOpen && i === 0 ? 'rotate-45 translate-y-[3px]' : ''} ${
                    menuOpen && i === 1 ? '-rotate-45 -translate-y-[3px]' : ''
                  }`}
                />
              ))}
            </button>
          </div>
        </div>
      </nav>

      {/* FULLSCREEN MENU (unchanged, uses getNavText) */}
      <div
        className={`
          fixed inset-0 z-40 bg-[#2D2926] flex flex-col items-center justify-center transition-all duration-500
          ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      >
        <div className="text-center">
          {NAV_LINKS.map((item, i) => (
            <div
              key={item.en}
              className={`overflow-hidden transition-all duration-500 ${menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
              style={{ transitionDelay: `${i * 60 + 100}ms` }}
            >
              {item.isRouterLink ? (
                <button
                  onClick={() => handleNavClick(item)}
                  className="block w-full py-1 text-[#F5F0EB] hover:text-[#C9A882] transition-colors text-[clamp(2rem,8vw,3.5rem)] font-['Lora',serif] font-normal"
                >
                  {getNavText(item)}
                </button>
              ) : (
                <a
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-1 text-[#F5F0EB] hover:text-[#C9A882] transition-colors text-[clamp(2rem,8vw,3.5rem)] font-['Lora',serif] font-normal"
                >
                  {getNavText(item)}
                </a>
              )}
            </div>
          ))}
        </div>
        <p className="mt-12 uppercase tracking-[0.25em] text-[11px] text-[#6B5E55] font-['DM_Sans',sans-serif]">
          Jalan Kuhara, 91000 Tawau, Sabah
        </p>
      </div>

      {/* HERO SECTION with CAROUSEL */}
      <section id="home" className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 overflow-hidden bg-gradient-to-b from-[#FAF8F5] to-[#F0E9DF]">
        <div className="absolute top-[8%] left-[-5%] w-[260px] h-[260px] rounded-full bg-[radial-gradient(circle,rgba(210,185,160,0.25)_0%,transparent_70%)]" />
        <div className="absolute bottom-[10%] right-[-8%] w-[320px] h-[320px] rounded-full bg-[radial-gradient(circle,rgba(185,160,130,0.18)_0%,transparent_70%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-[12vh] bg-gradient-to-b from-transparent to-[#b49b7d]/40" />

        <div className="relative z-10 w-full max-w-2xl">
          <div className="flex justify-center mb-8">
            <img src="/logo.webp" alt="Gereja Baptis Tawau" loading="eager" className="w-[clamp(140px,38vw,200px)] object-contain opacity-95" />
          </div>

          <blockquote className="mb-10">
            <p className="italic text-[clamp(1.3rem,4vw,2rem)] leading-relaxed tracking-[-0.01em] text-[#2D2926] mb-4 font-['Lora',serif]">
              "{verse.text}"
            </p>
            <cite className="uppercase tracking-[0.3em] text-[10px] text-[#B09882] not-italic font-['DM_Sans',sans-serif]">
              {verse.reference}
            </cite>
          </blockquote>

          {/* CAROUSEL - replaces old CTA + cards */}
          {carouselItems.length > 0 && (
            <div
              className="relative w-full max-w-3xl mx-auto mt-6 rounded-2xl overflow-hidden shadow-lg"
              onMouseEnter={() => setAutoplay(false)}
              onMouseLeave={() => setAutoplay(true)}
            >
              <div className="relative aspect-video">
                <img
                  src={carouselItems[currentSlide].image_url}
                  alt={carouselItems[currentSlide][`title_${locale}`]}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6 text-white text-left">
                  <h3 className="text-xl md:text-2xl font-semibold font-['Lora',serif] mb-1">
                    {carouselItems[currentSlide][`title_${locale}`]}
                  </h3>
                  {carouselItems[currentSlide][`description_${locale}`] && (
                    <p className="text-sm md:text-base opacity-90">
                      {carouselItems[currentSlide][`description_${locale}`]}
                    </p>
                  )}
                  {carouselItems[currentSlide].link_url && (
                    <a
                      href={carouselItems[currentSlide].link_url}
                      className="mt-3 text-sm underline inline-flex items-center gap-1"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t('learn_more')}
                    </a>
                  )}
                </div>
              </div>

              {/* Navigation Arrows */}
              {carouselItems.length > 1 && (
                <>
                  <button
                    onClick={goToPrevSlide}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-1.5 transition"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={24} className="text-white" />
                  </button>
                  <button
                    onClick={goToNextSlide}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-1.5 transition"
                    aria-label="Next slide"
                  >
                    <ChevronRight size={24} className="text-white" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                    {carouselItems.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentSlide(idx)
                          setAutoplay(false)
                          setTimeout(() => setAutoplay(true), 10000)
                        }}
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx === currentSlide ? 'bg-white w-5' : 'bg-white/50'
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Scroll Cue */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-35 animate-bob flex flex-col items-center gap-2">
            <div className="w-px h-9 bg-gradient-to-b from-transparent to-[#8A7A6E]" />
            <div className="w-1 h-1 rounded-full bg-[#8A7A6E]" />
          </div>
        </div>
      </section>

      {/* ABOUT section (unchanged, just use t() instead of old function) */}
      <section id="about" className="px-6 py-20 md:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <p className="uppercase tracking-[0.3em] text-[10px] text-[#B09882] mb-6 font-['DM_Sans',sans-serif]">
            {t('nav_about')}
          </p>
          <h2 className="text-[clamp(1.9rem,5vw,3rem)] leading-tight tracking-[-0.02em] mb-6 text-[#2D2926] font-['Lora',serif] font-normal">
            {t('about_tagline')}
          </h2>
          <p className="text-[#7A6E66] leading-8 text-[15px] md:text-[17px] max-w-2xl mx-auto font-light font-['DM_Sans',sans-serif]">
            {t('about_text')}
          </p>
          <div className="flex items-center justify-center gap-3 mt-10">
            <div className="w-10 h-px bg-[#b49b7d]/40" />
            <div className="w-[5px] h-[5px] rounded-full border border-[#b49b7d]/50" />
            <div className="w-10 h-px bg-[#b49b7d]/40" />
          </div>
        </div>
      </section>

      {/* EVENTS section (unchanged) */}
      <section id="events" className="bg-[#F2EBE1] px-5 py-20 md:py-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="uppercase tracking-[0.3em] text-[10px] text-[#B09882] mb-3 font-['DM_Sans',sans-serif]">
              {t('events_title')}
            </p>
            <h2 className="text-[clamp(1.7rem,4vw,2.5rem)] tracking-[-0.02em] font-['Lora',serif] font-normal">
              {t('events_subtitle')}
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {events.length === 0 ? (
              <div className="text-center py-10 text-[#8A7A6E]">{t('events_empty')}</div>
            ) : (
              events.map((event) => {
                const { day, month, dayName } = formatEventDate(event.date)
                const title = locale === 'bm' && event.title_bm ? event.title_bm : event.title_en
                return (
                  <div key={event.id} className="bg-white/70 border border-[#d9c9b7]/30 rounded-2xl px-6 py-5 flex items-center gap-5 transition-all duration-300 hover:translate-x-1">
                    <div className="min-w-[54px] text-center shrink-0">
                      <div className="text-[24px] leading-none text-[#2D2926] font-['Lora',serif] font-medium">{day}</div>
                      <div className="uppercase tracking-[0.18em] text-[10px] text-[#B09882] mt-1 font-['DM_Sans',sans-serif]">{month}</div>
                    </div>
                    <div className="w-px h-11 bg-[#b49b7d]/25 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[16px] mb-1 text-[#2D2926] font-['Lora',serif] font-medium">{title}</p>
                      <p className="text-[12px] text-[#A08070] font-['DM_Sans',sans-serif]">{dayName} · {formatTimeForDisplay(event.time)}</p>
                      {event.location && <p className="text-[10px] text-[#B09882] mt-1 font-['DM_Sans',sans-serif]">📍 {event.location}</p>}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </section>

      {/* FOOTER - with Lucide icons, no contact section above */}
      <footer className="bg-[#2D2926] px-6 py-10 text-center">
        <p className="uppercase tracking-[0.28em] text-[10px] text-[#6B5E55] mb-2 font-['DM_Sans',sans-serif]">
          {t('footer_church')}
        </p>
        <div className="flex flex-col items-center gap-2 text-[#6B5E55] text-sm font-['DM_Sans',sans-serif]">
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            <span>{t('footer_address')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} />
            <span>{t('footer_worship')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={14} />
            <span>{t('footer_phone')}</span>
          </div>
        </div>
        <div className="w-8 h-px bg-white/10 mx-auto my-6" />
        <p className="text-[#7A6A5E] text-sm italic font-['Lora',serif]">
          {t('footer_tagline')}
        </p>
      </footer>

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