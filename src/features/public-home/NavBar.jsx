// src/features/public-home/NavBar.jsx
import React from 'react'

const NAV_LINKS = [
  { en: 'Home',   bm: 'Utama',         href: '#home' },
  { en: 'About',  bm: 'Tentang Kami',  href: '#about' },
  { en: 'Events', bm: 'Acara',         href: '#events', isModal: true },
  { en: 'Roster', bm: 'Petugas',       href: '#roster', isModal: true },
  { en: 'Join',   bm: 'Daftar',        href: '/register', isRouterLink: true },
  { en: 'Lyrics', bm: 'Lirik',         href: '/lyrics' },
  { en: 'Staff',  bm: 'Kakitangan',    href: '/login',  isRouterLink: true },
]

export default function NavBar({ scrolled, menuOpen, onToggleMenu, toggleLocale, locale, navigate, onOpenEvents, onOpenRoster, t }) {
  const getNavText = (item) => (locale === 'bm' ? item.bm : item.en)

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 px-5 md:px-8 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-black/5' : ''}`}>
        <div className="max-w-screen-xl mx-auto h-16 flex items-center justify-between">
          <a href="#home" className="flex items-center">
            <img src="/logo.webp" alt="GBT" className="h-9 w-auto object-contain" />
          </a>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLocale}
              className="h-8 px-4 rounded-full border border-black/20 text-[10px] uppercase tracking-[0.18em] font-medium transition-all hover:bg-black hover:text-white hover:border-black"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {locale === 'en' ? 'BM' : 'EN'}
            </button>
            <button
              onClick={onToggleMenu}
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

      {/* Fullscreen menu */}
      <div className={`fixed inset-0 z-40 bg-[#E8E0D5] flex transition-all duration-500 ${
        menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="flex-1 flex flex-col justify-center pl-10 md:pl-16 lg:pl-24 pt-20 pb-14 border-r border-black/10">
          <div className="space-y-1">
            {NAV_LINKS.map((item, i) => (
              <div key={item.en} className={`overflow-hidden transition-all duration-500 ${menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ transitionDelay: `${i * 55 + 80}ms` }}>
                {item.isModal && item.en === 'Events' ? (
                  <button onClick={() => { onToggleMenu(); onOpenEvents() }} className="sc-menu-link block text-left hover:opacity-40 transition-opacity duration-200"
                    style={{ fontFamily: "'Darker Grotesque', sans-serif", fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', fontWeight: 800, lineHeight: 1.05 }}>
                    {getNavText(item)}
                  </button>
                ) : item.isModal && item.en === 'Roster' ? (
                  <button onClick={() => { onToggleMenu(); onOpenRoster() }} className="sc-menu-link block text-left hover:opacity-40 transition-opacity duration-200"
                    style={{ fontFamily: "'Darker Grotesque', sans-serif", fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', fontWeight: 800, lineHeight: 1.05 }}>
                    {getNavText(item)}
                  </button>
                ) : item.isRouterLink ? (
                  <button onClick={() => { onToggleMenu(); navigate(item.href) }} className="sc-menu-link block text-left hover:opacity-40 transition-opacity duration-200"
                    style={{ fontFamily: "'Darker Grotesque', sans-serif", fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', fontWeight: 800, lineHeight: 1.05 }}>
                    {getNavText(item)}
                  </button>
                ) : (
                  <a href={item.href} onClick={onToggleMenu} className="sc-menu-link block hover:opacity-40 transition-opacity duration-200"
                    style={{ fontFamily: "'Darker Grotesque', sans-serif", fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', fontWeight: 800, lineHeight: 1.05 }}>
                    {getNavText(item)}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="hidden md:flex w-[38%] lg:w-[34%] flex-col justify-between pl-10 lg:pl-16 pt-24 pb-14 pr-10">
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
          <div className="flex flex-col gap-1">
            {['Facebook', 'Instagram', 'YouTube'].map(soc => (
              <a key={soc} href="#" className="text-sm hover:opacity-40 transition-opacity" style={{ fontFamily: "'DM Sans', sans-serif" }}>{soc}</a>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
