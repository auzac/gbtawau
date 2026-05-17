import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, ChevronRight, Menu, X, MapPin, Clock, Phone, 
  Calendar, User, Users, MapPinned, ArrowLeft, ArrowRight, ChevronDown 
} from 'lucide-react';
// Keep your existing custom hooks or contexts intact
// import { useLocale } from '../hooks/useLocale'; 

export default function LandingPage({ 
  // Accept your existing fetched data from your parent controller/Supabase setup
  events = [], 
  roster = [], 
  carousel_items = [], 
  verse = null,
  locale = 'en',
  t = (key) => key // Fallback translation helper if using lightweight translation setup
}) {
  // Navigation & Modal State Management
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEventsModalOpen, setIsEventsModalOpen] = useState(false);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Roster Filter States
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [availableMonths, setAvailableMonths] = useState([]);

  // About Section Carousel State
  const [currentAboutIndex, setCurrentAboutIndex] = useState(0);

  // "Love in Action" Scroll Interaction State
  const circleSectionRef = useRef(null);
  const [circleScale, setCircleScale] = useState(0);

  // Dummy fallback data if your Supabase table isn't seeded yet
  const aboutSlides = carousel_items.length > 0 ? carousel_items : [
    { id: 1, tag: 'Our Vision', text: 'We don’t exist to build walls that separate, but tables that connect. Our home is engineered specifically for those searching for raw authenticity over rigid tradition.' },
    { id: 2, tag: 'Our Culture', text: 'Come as you are. We value real stories, genuine questions, and open hearts over rehearsed perfections.' },
    { id: 3, tag: 'Our Core', text: 'Centered on grace, driven by community, and dedicated to expressing unconditional love in every action.' }
  ];

  // Calculate "Love in Action" circle mask scaling on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!circleSectionRef.current) return;
      const rect = circleSectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const elementTop = rect.top;
      const startTrigger = windowHeight;
      const endTrigger = windowHeight / 3;
      
      let progress = (startTrigger - elementTop) / (startTrigger - endTrigger);
      progress = Math.max(0, Math.min(1, progress)); 
      
      setCircleScale(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Basic Next/Prev helper for About Carousel
  const nextAboutSlide = () => {
    setCurrentAboutIndex((prev) => (prev + 1) % aboutSlides.length);
  };
  const prevAboutSlide = () => {
    setCurrentAboutIndex((prev) => (prev - 1 + aboutSlides.length) % aboutSlides.length);
  };

  // Roster helpers
  const rosterForSelectedWeek = roster.find(r => r.week === selectedWeek) || null;

  return (
    <div className="bg-[#FAF8F5] text-[#2D2926] font-['DM_Sans',sans-serif] antialiased overflow-x-hidden min-h-[100dvh] pb-28 selection:bg-[#C9A882]/30">
      
      {/* ── PREMIUM FLOATING NAVIGATION HEADER (Soul Church Inspired) ── */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-7xl z-50 bg-[#FAF8F5]/80 backdrop-blur-xl rounded-full px-6 py-3.5 border border-[#d9c9b7]/30 flex items-center justify-between transition-all duration-300 shadow-sm">
        <div className="font-['Lora',serif] text-xl font-medium tracking-wide text-[#2D2926]">SOUL.</div>
        
        {/* Desktop Navigation Link Cluster */}
        <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-[0.25em] font-medium text-[#7A6E66]">
          <a href="#hero" className="hover:text-[#2D2926] transition-colors duration-200">Home</a>
          <a href="#about-carousel" className="hover:text-[#2D2926] transition-colors duration-200">About</a>
          <a href="#love-action" className="hover:text-[#2D2926] transition-colors duration-200">Action</a>
          <a href="#footer" className="hover:text-[#2D2926] transition-colors duration-200">Contact</a>
        </nav>

        {/* Mobile Menu Icon */}
        <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-[#2D2926]/5 rounded-full md:hidden transition-colors">
          <Menu size={18} className="text-[#2D2926]" />
        </button>
      </header>

      {/* ── HERO SECTION (IPhone Safari Browser Chrome Guarded via svh) ── */}
      <section id="hero" className="relative min-h-[100svh] w-full flex flex-col justify-between p-6 pt-28 bg-[#2D2926] text-[#FAF8F5] rounded-b-[2.5rem] md:rounded-b-[5rem] overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,168,130,0.12)_0%,transparent_75%)] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center my-auto px-4 z-10 space-y-6">
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#C9A882] block font-medium">Welcome Home</span>
          <h1 className="text-[clamp(2.2rem,6.5vw,4.5rem)] font-['Lora',serif] font-normal leading-[1.15] tracking-[-0.03em]">
            Where broken pieces find <span className="italic font-light text-[#C9A882]">beautiful</span> peace.
          </h1>
          
          {verse && (
            <p className="text-xs md:text-sm text-[#FAF8F5]/70 italic font-['Lora',serif] max-w-xl mx-auto pt-4 border-t border-white/5">
              "{verse.text}" — {verse.reference}
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-4 pt-6">
            <button onClick={() => setIsEventsModalOpen(true)} className="px-7 py-3 bg-[#FAF8F5] text-[#2D2926] text-xs uppercase tracking-widest font-semibold rounded-full hover:bg-[#C9A882] hover:text-[#2D2926] transition-all transform active:scale-95 shadow-sm">
              {t('nav_events') || 'Gatherings'}
            </button>
            <button onClick={() => setIsRosterModalOpen(true)} className="px-7 py-3 bg-white/10 border border-white/15 text-[#FAF8F5] text-xs uppercase tracking-widest font-semibold rounded-full hover:bg-white/20 backdrop-blur-sm transition-all transform active:scale-95">
              {t('nav_roster') || 'Serve Schedule'}
            </button>
          </div>
        </div>

        {/* Ambient Arrow Accent indicator */}
        <div className="mx-auto pb-4 opacity-40 animate-bounce hidden md:block">
          <ArrowLeft size={16} className="-rotate-90 text-[#FAF8F5]" />
        </div>
      </section>

      {/* ── NEW ABOUT CAROUSEL SECTION (Replaces Old Static About Block) ── */}
      <section id="about-carousel" className="px-4 py-24 md:py-32 max-w-7xl mx-auto rounded-full">
        <div className="text-center mb-14">
          <p className="uppercase tracking-[0.35em] text-[10px] text-[#B09882] mb-3 font-semibold">{t('nav_about') || 'Discover Us'}</p>
          <h2 className="text-3xl md:text-4xl font-['Lora',serif] tracking-tight text-[#2D2926]">{t('about_tagline') || 'Who We Are'}</h2>
        </div>

        {/* Soft Rounded Fluid Carousel Deck */}
        <div className="relative overflow-hidden rounded-[2.5rem] md:rounded-[4.5rem] bg-[#2D2926]/5 border border-[#d9c9b7]/40 p-8 md:p-20 min-h-[380px] md:min-h-[420px] flex items-center transition-all duration-300">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-block px-3.5 py-1 rounded-full bg-[#C9A882]/10 text-[#B09882] text-[9px] uppercase tracking-widest font-bold">
              {aboutSlides[currentAboutIndex]?.tag}
            </div>
            <p className="text-xl md:text-2xl font-['Lora',serif] text-[#2D2926] leading-relaxed font-light italic transition-opacity duration-300">
              "{aboutSlides[currentAboutIndex]?.text}"
            </p>
          </div>
          
          {/* Custom Navigation Pill Controls */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
            <button onClick={prevAboutSlide} className="w-10 h-10 rounded-full border border-[#d9c9b7] bg-[#FAF8F5] flex items-center justify-center text-[#7A6E66] hover:bg-[#2D2926] hover:text-[#FAF8F5] hover:border-[#2D2926] transition-all active:scale-90 shadow-sm">
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1.5 px-2">
              {aboutSlides.map((_, idx) => (
                <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentAboutIndex ? 'w-5 bg-[#C9A882]' : 'w-1.5 bg-[#d9c9b7]'}`} />
              ))}
            </div>
            <button onClick={nextAboutSlide} className="w-10 h-10 rounded-full border border-[#d9c9b7] bg-[#FAF8F5] flex items-center justify-center text-[#7A6E66] hover:bg-[#2D2926] hover:text-[#FAF8F5] hover:border-[#2D2926] transition-all active:scale-90 shadow-sm">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── "LOVE IN ACTION" SMOOTH EXPANDING CIRCLE MASK SECTION ── */}
      <section ref={circleSectionRef} id="love-action" className="relative bg-[#2D2926] text-[#FAF8F5] py-36 md:py-52 rounded-[2.5rem] md:rounded-[5rem] overflow-hidden min-h-[85svh] flex items-center justify-center shadow-inner">
        
        {/* Dynamic Expanding Mask Layer via Scroll Values */}
        <div 
          className="absolute inset-0 bg-[#FAF8F5] transition-transform duration-75 ease-out pointer-events-none origin-center mix-blend-difference"
          style={{
            clipPath: `circle(${circleScale * 100}% at 50% 50%)`
          }}
        />

        {/* Contents Fixed Inside Matrix Center */}
        <div className="relative max-w-4xl mx-auto text-center px-6 z-10 select-none space-y-6">
          <p className="uppercase tracking-[0.35em] text-[10px] text-[#C9A882] font-semibold">Our Core Rhythm</p>
          <h2 className="text-[clamp(2.5rem,7.5vw,5.5rem)] font-['Lora',serif] font-normal leading-none tracking-[-0.03em]">
            Love In Action.
          </h2>
          <p className="max-w-xl mx-auto text-sm md:text-base leading-relaxed opacity-80 font-light font-['DM_Sans',sans-serif]">
            Faith is not an intellectual concept to analyze, but an active movement of grace inside our local community. Through local soup kitchen sponsorships, student mentorship pipelines, and crisis aid partnerships.
          </p>
        </div>
      </section>

      {/* ── RE-DESIGNED ORGANIC INTERACTION FOOTER ── */}
      <footer id="footer" className="bg-[#FAF8F5] text-[#2D2926] pt-28 pb-36 px-6 rounded-t-[2.5rem] md:rounded-t-[5rem]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div className="space-y-4">
            <h3 className="font-['Lora',serif] text-2xl font-normal tracking-wide">SOUL CHURCH</h3>
            <p className="text-[#7A6E66] text-xs italic font-['Lora',serif] max-w-xs mx-auto md:mx-0">
              {t('footer_tagline') || 'Where brokenness encounters unconditional presence.'}
            </p>
          </div>
          
          <div className="space-y-4 text-sm text-[#7A6E66]">
            <h4 className="text-xs uppercase tracking-widest font-bold text-[#2D2926]">Gatherings</h4>
            <div className="space-y-2.5">
              <div className="flex items-center justify-center md:justify-start gap-2.5"><MapPinned size={14} className="text-[#C9A882]" /> <span>{t('footer_address') || '12A Jalan Dataran, Selangor'}</span></div>
              <div className="flex items-center justify-center md:justify-start gap-2.5"><Clock size={14} className="text-[#C9A882]" /> <span>{t('footer_worship') || 'Sundays @ 10:00 AM / 5:00 PM'}</span></div>
            </div>
          </div>

          <div className="space-y-4 text-sm text-[#7A6E66]">
            <h4 className="text-xs uppercase tracking-widest font-bold text-[#2D2926]">Connect</h4>
            <div className="space-y-2.5">
              <div className="flex items-center justify-center md:justify-start gap-2.5"><Phone size={14} className="text-[#C9A882]" /> <span>{t('footer_phone') || '+60 3-5510 0000'}</span></div>
              <p className="text-[11px] opacity-60 mt-4">© 2026 Soul Church. All Rights Reserved.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* ── HOVERING FIXED RUNNING TEXT TICKER BAR (Bottom Viewport Anchored) ── */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-5xl z-40 bg-[#2D2926] text-[#FAF8F5] py-4 px-5 rounded-full shadow-xl border border-white/10 overflow-hidden flex items-center backdrop-blur-md">
        <div className="bg-[#C9A882] text-[#2D2926] text-[9px] uppercase tracking-widest font-bold px-3 py-1 rounded-full z-10 shrink-0 mr-4 select-none">
          Notice
        </div>
        
        {/* Infinite CSS Marquee Matrix */}
        <div className="relative w-full overflow-hidden whitespace-nowrap mask-gradient">
          <div className="inline-block animate-marquee text-xs uppercase tracking-[0.2em] font-light">
            • Joint Bilingual Service next Sunday at 10AM • Youth Camp Registrations closing this Friday evening • Join a local home care cell group this week &nbsp;
          </div>
          <div className="inline-block animate-marquee text-xs uppercase tracking-[0.2em] font-light" aria-hidden="true">
            • Joint Bilingual Service next Sunday at 10AM • Youth Camp Registrations closing this Friday evening • Join a local home care cell group this week &nbsp;
          </div>
        </div>
      </div>

      {/* ── MOBILE FULLSCREEN NAVIGATION OVERLAY ── */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-[#FAF8F5] z-[100] flex flex-col justify-between p-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="font-['Lora',serif] text-xl font-medium tracking-wide">SOUL.</div>
            <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-[#2D2926]/5 rounded-full"><X size={20} /></button>
          </div>
          <nav className="flex flex-col gap-6 text-xl font-['Lora',serif] my-auto pl-4">
            <a href="#hero" onClick={() => setIsMenuOpen(false)} className="hover:text-[#C9A882] transition-colors">Home</a>
            <a href="#about-carousel" onClick={() => setIsMenuOpen(false)} className="hover:text-[#C9A882] transition-colors">About</a>
            <a href="#love-action" onClick={() => setIsMenuOpen(false)} className="hover:text-[#C9A882] transition-colors">Action</a>
            <a href="#footer" onClick={() => setIsMenuOpen(false)} className="hover:text-[#C9A882] transition-colors">Contact</a>
          </nav>
          <div className="text-xs text-[#7A6E66] border-t border-[#d9c9b7]/30 pt-4 text-center">© 2026 Soul Church.</div>
        </div>
      )}

      {/* ── INJECTED ENGINE CUSTOM STYLES (Scoped Animations) ── */}
      <style>{`
        html { scroll-behavior: smooth; }
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-100%, 0, 0); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 30s linear infinite;
          will-change: transform;
        }
        .mask-gradient {
          mask-image: linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}