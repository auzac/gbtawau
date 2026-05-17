import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, Menu, X, MapPin, Clock, Phone, 
  Calendar, User, Users, MapPinned, ArrowLeft, ArrowRight, ChevronDown,
  Globe, LogIn
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLocale } from '../contexts/LocaleContext';
import '@splidejs/splide/css';

// ==========================================
// STATIC CONTENT (matches SOUL Church design)
// ==========================================
const HOW_WE_DO_SECTIONS = [
  {
    id: 'services',
    title: { en: 'Services', bm: 'Perkhidmatan' },
    description: { en: 'With accessible parking, a SEN room and more, everyone is welcome. Click below to find out what to expect when you visit us.', bm: 'Dengan tempat letak kenderaan yang mudah, bilik SEN dan banyak lagi, semua orang dialu-alukan. Klik di bawah untuk mengetahui apa yang diharapkan semasa anda melawat kami.' },
    link: '/plan-your-visit',
    cta: { en: 'LEARN MORE', bm: 'KETAHUI LEBIH' }
  },
  {
    id: 'pastoral',
    title: { en: 'Pastoral Care', bm: 'Penjagaan Pastoral' },
    description: { en: 'Looking for prayer support? Our pastoral care team is on hand to pray with you. Submit your prayer requests here.', bm: 'Mencari sokongan doa? Pasukan penjagaan pastoral kami sedia berdoa bersama anda. Hantar permintaan doa anda di sini.' },
    link: 'mailto:pastoral@soulchurch.com',
    cta: { en: 'EMAIL US', bm: 'EMEL KAMI' }
  },
  {
    id: 'connect',
    title: { en: 'Connect', bm: 'Berhubung' },
    description: { en: 'We\'re big on friendship and community, so we run lots of groups where you can connect with like-minded people.', bm: 'Kami mementingkan persahabatan dan komuniti, jadi kami menjalankan banyak kumpulan di mana anda boleh berhubung dengan orang yang sama pemikiran.' },
    link: '/connect',
    cta: { en: 'LEARN MORE', bm: 'KETAHUI LEBIH' }
  },
  {
    id: 'grow',
    title: { en: 'Grow', bm: 'Tumbuh' },
    description: { en: 'We love our amazing Dream Team! There are so many opportunities at SOUL for volunteers – and it’s a great way to meet people too.', bm: 'Kami menyukai Dream Team kami yang hebat! Terdapat banyak peluang di SOUL untuk sukarelawan – dan ia juga cara yang baik untuk bertemu orang.' },
    link: '/volunteer',
    cta: { en: 'LEARN MORE', bm: 'KETAHUI LEBIH' }
  },
  {
    id: 'generations',
    title: { en: 'Generations', bm: 'Generasi' },
    description: { en: 'From tots to teens and beyond, we have groups for every age. You’re never too young or too old to be part of SOUL Church!', bm: 'Dari kanak-kanak hingga remaja dan seterusnya, kami mempunyai kumpulan untuk setiap peringkat umur. Anda tidak pernah terlalu muda atau terlalu tua untuk menjadi sebahagian daripada Gereja SOUL!' },
    link: '/church-life',
    cta: { en: 'LEARN MORE', bm: 'KETAHUI LEBIH' }
  }
];

const VALUES = ['Christ Centred', 'People Empowering', 'Life Giving', 'Outward Focused'];

export default function LandingPage() {
  const { t, locale, toggleLocale } = useLocale();
  
  // State
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verse, setVerse] = useState({ reference: 'Matthew 11:28', text: 'Come to me...' });
  const [events, setEvents] = useState([]);
  const [carouselItems, setCarouselItems] = useState([]);
  const [rosters, setRosters] = useState([]);
  const [rosterMap, setRosterMap] = useState({});
  const [availableMonths, setAvailableMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedWeek, setSelectedWeek] = useState(1);
  
  // Modal states
  const [isEventsModalOpen, setIsEventsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  
  // Splide refs
  const mainSplideRef = useRef(null);
  const thumbsSplideRef = useRef(null);
  const howWeDoSplideRef = useRef(null);
  
  // Fetch all data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        loadActiveVerse(),
        loadUpcomingEvents(),
        loadCarouselItems(),
        loadRosters()
      ]);
      setLoading(false);
    };
    loadData();
  }, []);
  
  // Splide initialisation (What's On thumbnail slider + main hero slider)
  useEffect(() => {
    if (carouselItems.length === 0) return;
    
    const initSplides = async () => {
      const Splide = (await import('@splidejs/splide')).default;
      
      // Main hero slider (background images)
      const main = new Splide('#main-hero-slider', {
        type: 'fade',
        rewind: true,
        autoplay: true,
        pagination: false,
        arrows: false,
      });
      
      // Thumbnail slider (What's On)
      const thumbs = new Splide('#thumbnail-slider', {
        perPage: 1,
        gap: '0rem',
        rewind: true,
        autoplay: true,
        arrows: true,
        pagination: false,
        speed: 1200,
      });
      
      main.sync(thumbs);
      main.mount();
      thumbs.mount();
      
      mainSplideRef.current = main;
      thumbsSplideRef.current = thumbs;
    };
    
    initSplides();
    return () => {
      if (mainSplideRef.current) mainSplideRef.current.destroy();
      if (thumbsSplideRef.current) thumbsSplideRef.current.destroy();
    };
  }, [carouselItems]);
  
  // How we do church slider
  useEffect(() => {
    const initHowWeDo = async () => {
      const Splide = (await import('@splidejs/splide')).default;
      const splide = new Splide('#how-we-do-slider', {
        perPage: 3,
        gap: '2rem',
        breakpoints: {
          991: { perPage: 2 },
          640: { perPage: 1 }
        },
        arrows: true,
        pagination: false,
      });
      splide.mount();
      howWeDoSplideRef.current = splide;
    };
    initHowWeDo();
    return () => {
      if (howWeDoSplideRef.current) howWeDoSplideRef.current.destroy();
    };
  }, []);
  
  // Scroll effect for navbar
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  
  // Body scroll lock for modals & menu
  useEffect(() => {
    document.body.style.overflow = (menuOpen || isEventsModalOpen || isRosterModalOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen, isEventsModalOpen, isRosterModalOpen]);
  
  // Data fetching functions (same as your original)
  const loadActiveVerse = async () => {
    const { data, error } = await supabase
      .from('verse_library')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();
    if (!error && data) setVerse({ reference: data.reference, text: data.text });
  };
  
  const loadUpcomingEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .order('time', { ascending: true });
    if (!error && data) setEvents(data);
    else setEvents([]);
  };
  
  const loadCarouselItems = async () => {
    const { data, error } = await supabase
      .from('carousel_items')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (!error && data) setCarouselItems(data);
    else setCarouselItems([]);
  };
  
  const loadRosters = async () => {
    const { data, error } = await supabase
      .from('roster')
      .select('*')
      .order('week_start', { ascending: true });
    if (!error && data) {
      setRosters(data);
      const monthsSet = new Set();
      const map = {};
      
      data.forEach(roster => {
        if (!roster.week_start) return;
        const [year, month, day] = roster.week_start.split('-').map(Number);
        const monthStr = `${year}-${String(month).padStart(2, '0')}`;
        
        // Calculate week number (1-4) based on first Monday of month
        const firstDayOfMonth = new Date(Date.UTC(year, month-1, 1));
        const firstMondayUTC = new Date(Date.UTC(year, month-1, 1));
        const firstDayOfWeek = firstDayOfMonth.getUTCDay();
        const daysToMonday = firstDayOfWeek === 0 ? 1 : (8 - firstDayOfWeek) % 7;
        firstMondayUTC.setUTCDate(1 + daysToMonday);
        
        const rosterDateUTC = new Date(Date.UTC(year, month-1, day));
        const diffDays = Math.floor((rosterDateUTC - firstMondayUTC) / (1000 * 60 * 60 * 24));
        const weekNumber = Math.floor(diffDays / 7) + 1;
        if (weekNumber >= 1 && weekNumber <= 4) {
          const key = `${monthStr}-${weekNumber}`;
          map[key] = roster;
        }
        
        const monthName = new Date(Date.UTC(year, month-1, 1)).toLocaleString(
          locale === 'bm' ? 'ms-MY' : 'en-US',
          { month: 'long', year: 'numeric' }
        );
        monthsSet.add(JSON.stringify({ value: monthStr, label: monthName }));
      });
      
      const monthsArray = Array.from(monthsSet).map(m => JSON.parse(m));
      monthsArray.sort((a,b) => a.value.localeCompare(b.value));
      setAvailableMonths(monthsArray);
      setRosterMap(map);
      if (monthsArray.length > 0) setSelectedMonth(monthsArray[0].value);
    }
  };
  
  const getRosterForWeek = (week) => {
    if (!selectedMonth) return null;
    const key = `${selectedMonth}-${week}`;
    return rosterMap[key] || null;
  };
  
  const rosterForSelectedWeek = getRosterForWeek(selectedWeek);
  
  // Helpers
  const formatEventDate = (dateStr) => {
    if (!dateStr) return { day: '', month: '', dayName: '' };
    const date = new Date(dateStr);
    return {
      day: date.getDate(),
      month: date.toLocaleString(locale === 'bm' ? 'ms-MY' : 'en-US', { month: 'short' }).toUpperCase(),
      dayName: date.toLocaleString(locale === 'bm' ? 'ms-MY' : 'en-US', { weekday: 'long' }),
    };
  };
  
  const formatTimeForDisplay = (time24) => {
    if (!time24) return '';
    const [hour, minute] = time24.split(':');
    const h = parseInt(hour);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minute} ${period}`;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2D2926]/20 border-t-[#2D2926] rounded-full animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="bg-[#FAF8F5] text-[#2D2926] font-['DM_Sans',sans-serif] antialiased overflow-x-hidden">
      {/* Font imports */}
      <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      
      {/* ========== NAVBAR ========== */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-5 ${scrolled ? 'bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#d9c9b7]/20' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.webp" alt="SOUL Church" className="h-8 w-auto object-contain" />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleLocale} className="h-9 px-4 rounded-full border border-[#d9c9b7]/40 bg-white/70 text-[#8A7A6E] uppercase tracking-[0.14em] text-[11px] font-medium transition hover:bg-white">
              {locale === 'en' ? 'BM' : 'EN'}
            </button>
            <button onClick={() => setMenuOpen(o => !o)} className={`w-11 h-11 rounded-full border border-[#d9c9b7]/30 flex flex-col items-center justify-center gap-[5px] transition-all ${menuOpen ? 'bg-[#2D2926]' : 'bg-white/80'}`}>
              <span className={`block w-[18px] h-[1.5px] rounded-full transition-all ${menuOpen ? 'bg-[#FAF8F5] rotate-45 translate-y-[3px]' : 'bg-[#4A3F38]'}`} />
              <span className={`block w-[18px] h-[1.5px] rounded-full transition-all ${menuOpen ? 'bg-[#FAF8F5] -rotate-45 -translate-y-[3px]' : 'bg-[#4A3F38]'}`} />
            </button>
          </div>
        </div>
      </nav>
      
      {/* FULLSCREEN MENU */}
      <div className={`fixed inset-0 z-40 bg-[#2D2926] flex flex-col items-center justify-center transition-all duration-500 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="text-center">
          {[
            { en: 'Home', bm: 'Utama', href: '#home' },
            { en: 'About', bm: 'Tentang Kami', href: '#about' },
            { en: 'Events', bm: 'Acara', href: '#events' },
            { en: 'Roster', bm: 'Petugas', href: '#roster' },
            { en: 'Connect', bm: 'Berhubung', href: '/connect', isRouterLink: true }
          ].map((item, i) => (
            <div key={item.en} className={`overflow-hidden transition-all duration-500 ${menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: `${i*60+100}ms` }}>
              {item.isRouterLink ? (
                <Link to={item.href} onClick={() => setMenuOpen(false)} className="block py-1 text-[#F5F0EB] hover:text-[#C9A882] transition-colors text-[clamp(2rem,8vw,3.5rem)] font-['Lora',serif] font-normal">
                  {locale === 'bm' ? item.bm : item.en}
                </Link>
              ) : (
                <a href={item.href} onClick={() => setMenuOpen(false)} className="block py-1 text-[#F5F0EB] hover:text-[#C9A882] transition-colors text-[clamp(2rem,8vw,3.5rem)] font-['Lora',serif] font-normal">
                  {locale === 'bm' ? item.bm : item.en}
                </a>
              )}
            </div>
          ))}
          <div className="flex justify-center gap-6 mt-12">
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer" className="text-[#F5F0EB]/60 hover:text-[#C9A882]"><img src="/instagram.svg" className="w-5 h-5" alt="IG" /></a>
            <a href="https://www.facebook.com" target="_blank" rel="noreferrer" className="text-[#F5F0EB]/60 hover:text-[#C9A882]"><img src="/facebook.svg" className="w-5 h-5" alt="FB" /></a>
            <a href="https://www.youtube.com" target="_blank" rel="noreferrer" className="text-[#F5F0EB]/60 hover:text-[#C9A882]"><img src="/youtube.svg" className="w-5 h-5" alt="YT" /></a>
          </div>
        </div>
        <p className="mt-12 uppercase tracking-[0.25em] text-[11px] text-[#6B5E55] font-['DM_Sans',sans-serif]">4 Mason Rd, NR6 6RF</p>
      </div>
      
      {/* ========== HERO SECTION (Video + What's On Slider) ========== */}
      <section id="home" className="relative min-h-screen overflow-hidden">
        {/* Video Background */}
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0">
          <source src="https://cdn.prod.website-files.com/645d0531bc3a8553911de9f1/645d0531bc3a8553911dea35_Soul-Church-video-bg-transcode.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/30 z-10" />
        
        <div className="relative z-20 h-screen flex flex-col justify-center items-center px-6">
          <div className="w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
            {/* Left side - can be empty or decorative */}
            <div></div>
            {/* Right side - What's On Thumbnail Slider */}
            <div className="bg-black/50 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <p className="text-white/70 text-xs uppercase tracking-wider mb-4">WHAT'S ON</p>
              <div id="thumbnail-slider" className="splide">
                <div className="splide__track">
                  <ul className="splide__list">
                    {carouselItems.map((item, idx) => (
                      <li key={item.id || idx} className="splide__slide">
                        <h3 className="text-white text-2xl font-['Lora',serif] mb-2">
                          {locale === 'bm' && item.title_bm ? item.title_bm : item.title_en}
                        </h3>
                        <p className="text-white/80 text-sm mb-4">
                          {locale === 'bm' && item.description_bm ? item.description_bm : item.description_en}
                        </p>
                        <button className="bg-white text-black px-5 py-2 rounded-full text-xs uppercase tracking-wider hover:bg-opacity-90 transition">
                          {locale === 'bm' ? 'DAFTAR' : 'SIGN UP'}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom bar: Sunday Services */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm py-3 px-6 flex flex-wrap justify-between items-center text-xs z-20">
          <div className="flex gap-4">
            <span className="font-semibold">SUNDAY SERVICES</span>
            <div className="flex gap-2"><span>9AM</span><span>11AM</span><span>5PM</span></div>
          </div>
          <a href="#" className="flex items-center gap-1">WATCH ONLINE <ArrowRight size={12} /></a>
          <span className="hidden md:block text-[10px] tracking-wider animate-pulse">SCROLL DOWN ↓</span>
        </div>
      </section>
      
      {/* ========== WELCOME HOME SECTION ========== */}
      <section id="about" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-['Lora',serif] tracking-tight mb-6">Welcome Home</h1>
            <p className="text-[#7A6E66] text-lg leading-relaxed">
              SOUL Church is a vibrant and friendly church in the beautiful city of Norwich. We love Jesus and we love people. We'd love to see you here soon!
            </p>
          </div>
          <div>
            <img src="/auditorium.jpg" alt="Church Auditorium" className="rounded-2xl shadow-xl w-full object-cover" />
          </div>
        </div>
      </section>
      
      {/* ========== HOW WE DO CHURCH (Splide Carousel) ========== */}
      <section className="bg-[#2D2926] text-white py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-['Lora',serif] mb-12">How we do church</h2>
          <div id="how-we-do-slider" className="splide">
            <div className="splide__track">
              <ul className="splide__list">
                {HOW_WE_DO_SECTIONS.map(section => (
                  <li key={section.id} className="splide__slide bg-white/10 rounded-2xl p-6 border border-white/20 h-full">
                    <h3 className="text-2xl font-['Lora',serif] mb-3">{locale === 'bm' ? section.title.bm : section.title.en}</h3>
                    <p className="text-white/70 text-sm mb-6">{locale === 'bm' ? section.description.bm : section.description.en}</p>
                    {section.link.startsWith('mailto:') ? (
                      <a href={section.link} className="inline-block border border-white/40 rounded-full px-5 py-2 text-xs uppercase tracking-wider hover:bg-white hover:text-black transition">
                        {locale === 'bm' ? section.cta.bm : section.cta.en}
                      </a>
                    ) : (
                      <Link to={section.link} className="inline-block border border-white/40 rounded-full px-5 py-2 text-xs uppercase tracking-wider hover:bg-white hover:text-black transition">
                        {locale === 'bm' ? section.cta.bm : section.cta.en}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* ========== MARQUEE VALUES ========== */}
      <div className="overflow-hidden py-6 border-y border-[#d9c9b7]/40">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...VALUES, ...VALUES].map((value, i) => (
            <span key={i} className="mx-8 text-sm uppercase tracking-wider font-medium text-[#7A6E66]">{value} –</span>
          ))}
        </div>
      </div>
      
      {/* ========== FOOTER ========== */}
      <footer className="bg-white py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <img src="/logo-black.webp" alt="SOUL Church" className="h-10 mb-4" />
            <p className="text-xs text-[#7A6E66]">© 2026 SOUL Church</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">CONTACT US</h4>
            <p className="text-sm text-[#7A6E66]">4 Mason Rd, NR6 6RF<br />info@soulchurch.com<br />01234 567890</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">LINKS</h4>
            <ul className="space-y-2 text-sm text-[#7A6E66]">
              <li><Link to="/connect">Connect</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/give">Giving</Link></li>
              <li><Link to="/plan-your-visit">Plan your visit</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">STAY TUNED</h4>
            <form className="space-y-3">
              <input type="text" placeholder="First Name" className="w-full border border-[#d9c9b7] rounded-full px-4 py-2 text-sm" />
              <input type="email" placeholder="Email address" className="w-full border border-[#d9c9b7] rounded-full px-4 py-2 text-sm" />
              <button className="bg-black text-white rounded-full px-6 py-2 text-sm uppercase tracking-wider w-full">Submit</button>
            </form>
          </div>
        </div>
      </footer>
      
      {/* ========== MODALS (Events & Roster) ========== */}
      {/* Events Modal (same as your original but simplified) */}
      {isEventsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#FAF8F5] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="font-['Lora',serif] text-xl">{selectedEvent ? 'Event Details' : 'Upcoming Events'}</h2>
              <button onClick={() => { setIsEventsModalOpen(false); setSelectedEvent(null); }}><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-auto p-5">
              {!selectedEvent ? (
                events.length === 0 ? <p className="text-center text-[#8A7A6E]">No events</p> :
                events.map(event => {
                  const { day, month, dayName } = formatEventDate(event.date);
                  const title = locale === 'bm' && event.title_bm ? event.title_bm : event.title_en;
                  return (
                    <button key={event.id} onClick={() => setSelectedEvent(event)} className="w-full text-left flex items-center gap-4 border-b py-4">
                      <div className="text-center min-w-[60px]"><div className="text-2xl font-['Lora']">{day}</div><div className="text-[10px] uppercase">{month}</div></div>
                      <div><div className="font-medium">{title}</div><div className="text-xs text-[#A08070]">{dayName} · {formatTimeForDisplay(event.time)}</div></div>
                      <ArrowRight size={16} className="ml-auto" />
                    </button>
                  );
                })
              ) : (
                <div>
                  <button onClick={() => setSelectedEvent(null)} className="flex items-center gap-2 text-sm mb-4"><ArrowLeft size={14} /> Back</button>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-['Lora']">{locale === 'bm' && selectedEvent.title_bm ? selectedEvent.title_bm : selectedEvent.title_en}</h3>
                    <div className="flex gap-2"><Calendar size={16} />{new Date(selectedEvent.date).toLocaleDateString()}</div>
                    {selectedEvent.time && <div className="flex gap-2"><Clock size={16} />{formatTimeForDisplay(selectedEvent.time)}</div>}
                    {selectedEvent.location && <div className="flex gap-2"><MapPinned size={16} />{selectedEvent.location}</div>}
                    <div className="pt-3 text-sm">{locale === 'bm' ? selectedEvent.description_bm : selectedEvent.description_en}</div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t flex justify-end">
              <button onClick={() => { setIsEventsModalOpen(false); setSelectedEvent(null); }} className="bg-black text-white px-5 py-2 rounded-full text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Roster Modal */}
      {isRosterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#FAF8F5] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="font-['Lora',serif] text-xl">Weekly Service Roster</h2>
              <button onClick={() => setIsRosterModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-auto p-5 space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wide">Select Month</label>
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full border rounded-xl p-2 mt-1">
                  {availableMonths.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide">Select Week</label>
                <div className="flex gap-2 mt-1">
                  {[1,2,3,4].map(w => (
                    <button key={w} onClick={() => setSelectedWeek(w)} className={`flex-1 py-2 rounded-full text-sm ${selectedWeek === w ? 'bg-black text-white' : 'bg-gray-100'}`}>Week {w}</button>
                  ))}
                </div>
              </div>
              <div className="bg-white border rounded-xl p-4 space-y-3">
                {rosterForSelectedWeek ? (
                  <>
                    <div><span className="font-bold">Worship Leader:</span> {rosterForSelectedWeek.leader || '—'}</div>
                    <div><span className="font-bold">Pianist:</span> {rosterForSelectedWeek.pianist || '—'}</div>
                    <div><span className="font-bold">Reader:</span> {rosterForSelectedWeek.reader || '—'}</div>
                  </>
                ) : <p className="text-center text-gray-500">No roster data</p>}
              </div>
            </div>
            <div className="p-4 border-t flex justify-end">
              <button onClick={() => setIsRosterModalOpen(false)} className="bg-black text-white px-5 py-2 rounded-full text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Quick action buttons (Events & Roster) fixed at bottom right? Actually we add floating buttons */}
      <div className="fixed bottom-24 right-4 flex flex-col gap-2 z-30">
        <button onClick={() => setIsEventsModalOpen(true)} className="bg-[#2D2926] text-white p-3 rounded-full shadow-lg hover:bg-[#C9A882] transition">
          <Calendar size={20} />
        </button>
        <button onClick={() => setIsRosterModalOpen(true)} className="bg-[#2D2926] text-white p-3 rounded-full shadow-lg hover:bg-[#C9A882] transition">
          <Users size={20} />
        </button>
      </div>
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
          display: inline-flex;
        }
        .splide__arrow {
          background: rgba(0,0,0,0.5);
          border-radius: 50%;
          opacity: 0.7;
        }
        .splide__arrow svg {
          fill: white;
        }
      `}</style>
    </div>
  );
}