// src/features/public-home/HeroSection.jsx
import React, { useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function HeroSection({ carouselItems, videoError, onVideoError, onOpenEvents, t, locale }) {
  const whatsOnSplideRef = useRef(null)

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
          perPage: 1, perMove: 1, type: 'slide', speed: 900,
          rewind: true, pagination: false, arrows: false, gap: 0,
          waitForTransition: false, updateOnMove: true,
        })
        splide.mount()
        whatsOnSplideRef.current = splide

        const prevBtn = document.querySelector('.whats-on-arrow-prev')
        const nextBtn = document.querySelector('.whats-on-arrow-next')
        const handlePrev = () => splide.go('<')
        const handleNext = () => splide.go('>')
        if (prevBtn) { prevBtn.removeEventListener('click', handlePrev); prevBtn.addEventListener('click', handlePrev) }
        if (nextBtn) { nextBtn.removeEventListener('click', handleNext); nextBtn.addEventListener('click', handleNext) }
      } catch (e) { console.error('WhatsOn Splide error:', e) }
    }

    init()
    return () => {
      if (whatsOnSplideRef.current) { whatsOnSplideRef.current.destroy(); whatsOnSplideRef.current = null }
      const prevBtn = document.querySelector('.whats-on-arrow-prev')
      const nextBtn = document.querySelector('.whats-on-arrow-next')
      const handlePrev = () => {}
      const handleNext = () => {}
      if (prevBtn) prevBtn.removeEventListener('click', handlePrev)
      if (nextBtn) nextBtn.removeEventListener('click', handleNext)
    }
  }, [carouselItems.length])

  return (
    <section id="home" className="relative min-h-[100dvh] overflow-hidden bg-black">
      {!videoError ? (
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-70"
          autoPlay loop muted playsInline
          poster="/hero-poster.jpg"
          onError={() => onVideoError(true)}
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
      ) : (
        <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: "url('/backdrop.webp')" }} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 flex flex-col min-h-[100dvh] justify-end pb-12 md:pb-16">
        <div className="w-full">
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
                          <button onClick={onOpenEvents} className="card-cta">FIND OUT MORE</button>
                          <div className="card-mobile-arrows">
                            <button className="custom-prev card-arrow-sm"><ChevronLeft size={18} /></button>
                            <button className="custom-next card-arrow-sm"><ChevronRight size={18} /></button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="desktop-arrows">
                  <button className="custom-prev desktop-arrow desktop-arrow-left"><ChevronLeft size={24} /></button>
                  <button className="custom-next desktop-arrow desktop-arrow-right"><ChevronRight size={24} /></button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
