// src/features/public-home/AboutSection.jsx
import { Calendar, Users } from 'lucide-react'

export default function AboutSection({ verse, onOpenEvents, onOpenRoster, t }) {
  return (
    <section id="about" className="bg-white rounded-t-[2rem] -mt-8 relative z-10 px-8 md:px-16 lg:px-24 py-20 md:py-28">
      <div className="max-w-screen-lg mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 style={{ fontFamily: "'Darker Grotesque', sans-serif", fontSize: 'clamp(3rem,8vw,6rem)', fontWeight: 800, lineHeight: 1.0 }}>
            {verse.reference || t('about_tagline') || 'This is Home'}
          </h1>
          <p className="mt-8 text-base md:text-lg text-black/60 leading-relaxed max-w-md" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
            {verse.text || t('about_text') || "We are a vibrant and friendly church. We love Jesus and we love people. We'd love to see you here soon!"}
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <button
              onClick={onOpenEvents}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-[11px] uppercase tracking-[0.18em] font-medium hover:bg-black/80 transition-colors"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <Calendar size={14} />
              {t('events_button') || 'Events'}
            </button>
            <button
              onClick={onOpenRoster}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-black text-black text-[11px] uppercase tracking-[0.18em] font-medium hover:bg-black hover:text-white transition-colors"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <Users size={14} />
              {t('roster_button') || 'Roster'}
            </button>
          </div>
        </div>
        <div className="relative flex justify-center">
          <div className="w-full max-w-sm aspect-[4/5] rounded-[3rem] bg-[#F5EFE6] overflow-hidden shadow-xl flex items-center justify-center">
            <img src="/logo_2.webp" alt="Church logo" className="w-full h-full object-contain p-8"
              onError={(e) => { e.target.style.display = 'none' }} />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-black/20 text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>Logo</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
