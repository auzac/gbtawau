// src/features/public-home/HowWeDoChurch.jsx
import React, { useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const HOW_WE_DO = [
  { title: 'Placeholder 1', body: 'This is a temporary card while we fix the carousel layout.', cta: 'Learn more', href: '#about' },
  { title: 'Placeholder 2', body: 'We will replace this with real content soon.', cta: 'Learn more', href: '#about' },
  { title: 'Placeholder 3', body: 'Thank you for your patience – the proper design is coming.', cta: 'Learn more', href: '#about' },
  { title: 'Placeholder 4', body: 'You can still use the Events and Roster modals below.', cta: 'Learn more', href: '#about' },
]

export default function HowWeDoChurch({ t }) {
  const howWeSplideRef = useRef(null)

  useEffect(() => {
    let splide = null
    const init = async () => {
      await new Promise(r => setTimeout(r, 200))
      const el = document.getElementById('how-we-splide')
      if (!el) return
      try {
        const Splide = (await import('@splidejs/splide')).default
        splide = new Splide(el, {
          perPage: 3, perMove: 1, type: 'slide', gap: '1.5rem',
          speed: 600, rewind: true, pagination: false, arrows: false,
          trimSpace: false,
          breakpoints: { 1024: { perPage: 2 }, 640: { perPage: 1 } },
        })
        splide.mount()
        howWeSplideRef.current = splide

        const prevBtn = document.querySelector('.how-we-arrow-prev')
        const nextBtn = document.querySelector('.how-we-arrow-next')
        const handlePrev = () => splide.go('<')
        const handleNext = () => splide.go('>')
        if (prevBtn) { prevBtn.removeEventListener('click', handlePrev); prevBtn.addEventListener('click', handlePrev) }
        if (nextBtn) { nextBtn.removeEventListener('click', handleNext); nextBtn.addEventListener('click', handleNext) }
      } catch (e) { console.error('HowWe Splide error:', e) }
    }
    init()
    return () => {
      if (howWeSplideRef.current) { howWeSplideRef.current.destroy(); howWeSplideRef.current = null }
    }
  }, [])

  return (
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
                    <p className="text-sm text-black/60 leading-relaxed flex-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      {card.body}
                    </p>
                    <a href={card.href} className="mt-6 inline-block px-5 py-2 rounded-full border border-black/30 text-[10px] uppercase tracking-[0.18em] text-black hover:bg-black hover:text-white hover:border-black transition-all self-start"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      {card.cta}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="splide__arrows flex gap-3 mt-8 justify-center">
            <button className="how-we-arrow how-we-arrow-prev"><ChevronLeft size={20} /></button>
            <button className="how-we-arrow how-we-arrow-next"><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>
    </section>
  )
}
