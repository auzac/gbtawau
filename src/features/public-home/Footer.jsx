// src/features/public-home/Footer.jsx

const NAV_LINKS = [
  { en: 'Home',   bm: 'Utama',         href: '#home' },
  { en: 'About',  bm: 'Tentang Kami',  href: '#about' },
  { en: 'Events', bm: 'Acara',         href: '#events', isModal: true },
  { en: 'Roster', bm: 'Petugas',       href: '#roster', isModal: true },
  { en: 'Join',   bm: 'Daftar',        href: '/register' },
  { en: 'Lyrics', bm: 'Lirik',         href: '/lyrics' },
  { en: 'Staff',  bm: 'Kakitangan',    href: '/login',  isRouterLink: true },
]

export default function Footer({ t, onOpenEvents }) {
  return (
    <footer id="footer" className="bg-white border-t border-black/5 px-8 md:px-16 lg:px-24 pt-16 pb-20">
      <div className="max-w-screen-lg mx-auto">
        <div className="flex flex-col md:flex-row md:items-start gap-12 md:gap-16 pb-14 border-b border-black/10">
          <div className="shrink-0">
            <img src="/logo.webp" alt="GBT" className="h-10 w-auto object-contain opacity-80" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-black/40 mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>Contact</p>
            <p className="text-sm text-black/70 leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {t('footer_church') || 'GBT Church'}<br />
              {t('footer_address') || 'Jalan Kuhara, 91000 Tawau, Sabah'}<br />
              {t('footer_phone') || '—'}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-black/40 mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>Links</p>
            <div className="flex flex-col gap-1.5">
              {NAV_LINKS.filter(l => !l.isRouterLink).map(l => (
                <a key={l.en} href={l.href} className="text-sm text-black/60 hover:text-black transition-colors"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                  onClick={l.isModal && l.en === 'Events' ? (e) => { e.preventDefault(); onOpenEvents() } : undefined}>
                  {l.en}
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-black/40 mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>Sunday Services</p>
            <div className="flex flex-col gap-1.5">
              {['9:00 AM', '11:30 AM', '5:00 PM (once a month)'].map(t2 => (
                <p key={t2} className="text-sm text-black/60" style={{ fontFamily: "'DM Sans', sans-serif" }}>{t2}</p>
              ))}
            </div>
          </div>
          <div className="flex-1 max-w-xs">
            <p className="text-[10px] uppercase tracking-[0.28em] text-black/40 mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>Newsletter</p>
            <p className="text-sm text-black/60 mb-4 leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Sign up to stay in the loop with what's happening.
            </p>
            <a href="#" className="inline-block px-5 py-2.5 rounded-full bg-black text-white text-[11px] uppercase tracking-[0.18em] hover:bg-black/80 transition-colors"
              style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Sign up
            </a>
          </div>
        </div>
        <p className="mt-8 text-[11px] text-black/30 leading-relaxed max-w-2xl" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          &copy; {new Date().getFullYear()} GBT Church. All rights reserved.{' '}
          {t('footer_tagline') || ''}
        </p>
      </div>
    </footer>
  )
}
