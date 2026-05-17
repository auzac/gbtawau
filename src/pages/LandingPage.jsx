import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  X, 
  MapPin, 
  Clock, 
  Phone, 
  Calendar, 
  User, 
  Users, 
  MapPinned, 
  ArrowLeft, 
  ArrowRight, 
  ChevronDown,
  Globe,
  LogIn,
  ShieldAlert
} from 'lucide-react';

// ==========================================
// BILINGUAL GBT LOCALIZATION DICTIONARY
// ==========================================
const DICTIONARY = {
  en: {
    nav_home: "Home",
    nav_about: "About Us",
    nav_events: "Gatherings",
    nav_roster: "Serve Schedule",
    nav_contact: "Contact",
    nav_portal: "Staff Portal",
    about_tagline: "Rooted in Faith, Growing in Grace, Serving Tawau.",
    about_text: "We do not exist to stand apart from our community, but to be a home within it. Gereja Baptis Tawau is dedicated to sharing the real truth of the Gospel, building strong multi-generational families, and putting love into daily action.",
    footer_church: "GEREJA BAPTIS TAWAU (GBT)",
    footer_address: "Jalan Kwong Ming, 91000 Tawau, Sabah, Malaysia",
    footer_worship: "Sundays @ 9:00 AM (BM/EN) & 11:15 AM (Chinese)",
    footer_phone: "+60 89-772 431",
    footer_tagline: "A community anchored in Christ, sharing light across Sabah.",
    events_modal_title: "Upcoming Services & Gatherings",
    event_details_title: "Gathering Details",
    no_events: "No upcoming events scheduled at the moment.",
    events_modal_back: "Back to all gatherings",
    events_modal_close: "Close Window",
    roster_modal_title: "Weekly Ministry Service Roster",
    roster_month: "Select Month",
    roster_week: "Select Sunday / Week",
    roster_leader: "Worship Leader",
    roster_pianist: "Pianist / Musicians",
    roster_reader: "Scripture Reader / Intercessor",
    roster_no_data: "No assignment data found for this period.",
    announcements_label: "Church Announcements",
    view_details: "View Details",
    notice_label: "Notice"
  },
  bm: {
    nav_home: "Utama",
    nav_about: "Tentang Kami",
    nav_events: "Perhimpunan",
    nav_roster: "Jadual Petugas",
    nav_contact: "Hubungi",
    nav_portal: "Portal Staf",
    about_tagline: "Berakar dalam Iman, Bertumbuh dalam Kasih Karunia, Melayani Tawau.",
    about_text: "Kami wujud bukan untuk mengasingkan diri daripada komuniti, tetapi untuk menjadi tempat perlindungan di dalamnya. Gereja Baptis Tawau berdedikasi untuk berkongsi kebenaran Injil yang sejati, membina keluarga berbilang generasi yang kukuh, dan menyatakan kasih melalui tindakan nyata.",
    footer_church: "GEREJA BAPTIS TAWAU (GBT)",
    footer_address: "Jalan Kwong Ming, 91000 Tawau, Sabah, Malaysia",
    footer_worship: "Hari Ahad @ 9:00 AM (BM/EN) & 11:15 AM (Cina)",
    footer_phone: "+60 89-772 431",
    footer_tagline: "Komuniti yang berakar dalam Kristus, memancarkan cahaya di Sabah.",
    events_modal_title: "Perhimpunan & Ibadah Akan Datang",
    event_details_title: "Butiran Perhimpunan",
    no_events: "Tiada acara akan datang dijadualkan buat masa ini.",
    events_modal_back: "Kembali ke semua perhimpunan",
    events_modal_close: "Tutup Tetingkap",
    roster_modal_title: "Jadual Petugas Pelayanan Mingguan",
    roster_month: "Pilih Bulan",
    roster_week: "Pilih Hari Ahad / Minggu",
    roster_leader: "Ketua Pujian",
    roster_pianist: "Pemain Pianis / Pemuzik",
    roster_reader: "Pembaca Alkitab / Syafaat",
    roster_no_data: "Tiada data tugasan ditemui untuk tempoh ini.",
    announcements_label: "Pengumuman Gereja",
    view_details: "Lihat Butiran",
    notice_label: "Notis"
  }
};

export default function LandingPage({ 
  dbEvents = [], 
  dbRoster = [], 
  dbAnnouncements = [], 
  dbVerse = null 
}) {
  
  // ── STATE MANAGEMENT ──
  const [locale, setLocale] = useState('en');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEventsModalOpen, setIsEventsModalOpen] = useState(false);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Roster Filter Indexes
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [availableMonths, setAvailableMonths] = useState([]);

  // Integrated Carousels Component Trackers
  const [activeAnnouncementIdx, setActiveAnnouncementIdx] = useState(0);
  const [activeAboutIdx, setActiveAboutIdx] = useState(0);

  // Scroll Tracking Animation Ref Matrix
  const circleSectionRef = useRef(null);
  const [circleScale, setCircleScale] = useState(0);

  // ── TRANSLATION ENGINE HELPER ──
  const t = (key) => {
    return DICTIONARY[locale]?.[key] || DICTIONARY['en']?.[key] || key;
  };

  // ── GBT SEEDED DATA SETS ──
  const verse = dbVerse || {
    text: "But grow in the grace and knowledge of our Lord and Savior Jesus Christ. To him be glory both now and forever! Amen.",
    reference: "2 Peter 3:18"
  };

  const announcements = dbAnnouncements.length > 0 ? dbAnnouncements : [
    { id: 1, theme: "Ibadah", title_en: "Combined GBT Celebration", title_bm: "Ibadah Gabungan GBT", text_en: "Join us for our special unified translation service this coming Sunday at 9:00 AM.", text_bm: "Sertai ibadah gabungan penterjemahan khas kami pada hari Ahad ini jam 9:00 pagi." },
    { id: 2, theme: "Pelayanan", title_en: "Tawau Community Outreach", title_bm: "Program Prihatin Komuniti Tawau", text_en: "Volunteers needed for our food bank program operations this coming Saturday morning.", text_bm: "Sukarelawan diperlukan untuk operasi program bank makanan pada pagi Sabtu ini." }
  ];

  const events = dbEvents.length > 0 ? dbEvents : [
    { id: 1, date: "2026-05-24", time: "09:00:00", title_en: "Sunday Worship Service", title_bm: "Ibadah Hari Ahad", location: "Main Sanctuary", pic: "Rev. Wong", description_en: "Weekly corporate gathering in BM and English languages.", description_bm: "Perhimpunan korporat mingguan dalam Bahasa Malaysia dan Bahasa Inggeris." },
    { id: 2, date: "2026-05-24", time: "11:15:00", title_en: "Chinese Worship Service", title_bm: "Ibadah Bahasa Cina", location: "Grace Hall", pic: "Pastor Lee", description_en: "Weekly corporate celebration and teaching tailored in Chinese languages.", description_bm: "Perhimpunan mingguan dan pengajaran dalam Bahasa Cina." }
  ];

  const roster = dbRoster.length > 0 ? dbRoster : [
    { id: 1, month: "2026-05", week: 1, leader: "Bro. Edison", pianist: "Sis. Hannah", reader: "Sis. Deborah" },
    { id: 2, month: "2026-05", week: 2, leader: "Sis. Grace", pianist: "Bro. Caleb", reader: "Bro. Jonathan" },
    { id: 3, month: "2026-05", week: 3, leader: "Bro. Samuel", pianist: "Sis. Hannah", reader: "Sis. Priscilla" },
    { id: 4, month: "2026-05", week: 4, leader: "Bro. Edison", pianist: "Bro. Caleb", reader: "Bro. Michael" }
  ];

  const aboutSlides = [
    { id: 1, tag: "Our Foundation", tag_bm: "Asas Kami", text_en: "We are firmly built upon biblical truth, seeking to lift up the name of Jesus Christ across Tawau through real discipleship and loving fellowship.", text_bm: "Kami dibina teguh di atas kebenaran alkitabiah, berusaha untuk meninggikan nama Yesus Kristus di seluruh Tawau melalui pemuridan sejati dan persekutuan yang penuh kasih." },
    { id: 2, tag: "Our Generations", tag_bm: "Generasi Kami", text_en: "From our seniors to the youngest children, we value family-oriented care, protecting the faith legacy of our heritage while equipping tomorrow's leaders.", text_bm: "Daripada warga emas hinggalah kanak-kanak, kami menghargai penjagaan berorientasikan keluarga, melindungi warisan iman sambil melengkapi pemimpin masa depan." },
    { id: 3, tag: "Our Mission", tag_bm: "Misi Kami", text_en: "To know Him intimately and to make Him known dynamically. Expressing structural grace and compassion across Sabah.", text_bm: "Untuk mengenali-Nya secara mendalam dan memperkenalkan-Nya secara dinamik. Menyatakan kasih karunia dan belas kasihan di seluruh Sabah." }
  ];

  // ── DATE UTILITY FORMATTERS ──
  const formatEventDate = (dateString) => {
    if (!dateString) return { day: '00', month: 'MMM', dayName: '' };
    const dateObj = new Date(dateString);
    const optionsObj = { month: 'short', day: '2-digit', weekday: 'long' };
    const localeStr = locale === 'bm' ? 'ms-MY' : 'en-US';
    const formattedParts = new Intl.DateTimeFormat(localeStr, optionsObj).formatToParts(dateObj);
    
    const day = formattedParts.find(p => p.type === 'day')?.value || '00';
    const month = formattedParts.find(p => p.type === 'month')?.value || 'MMM';
    const dayName = formattedParts.find(p => p.type === 'weekday')?.value || '';
    return { day, month: month.toUpperCase(), dayName };
  };

  const formatTimeForDisplay = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hrInt = parseInt(hours, 10);
    const ampm = hrInt >= 12 ? 'PM' : 'AM';
    const displayHr = hrInt % 12 || 12;
    return `${displayHr}:${minutes} ${ampm}`;
  };

  // ── LIVE RUNNING INTERACTION UTILITIES ──
  useEffect(() => {
    const uniqueMonths = Array.from(new Set(roster.map(r => r.month))).map(m => {
      const [yr, mo] = m.split('-');
      const d = new Date(parseInt(yr, 10), parseInt(mo, 10) - 1, 1);
      return {
        value: m,
        label: d.toLocaleDateString(locale === 'bm' ? 'ms-MY' : 'en-US', { month: 'long', year: 'numeric' })
      };
    });
    setAvailableMonths(uniqueMonths);
    if (uniqueMonths.length > 0 && !selectedMonth) {
      setSelectedMonth(uniqueMonths[0].value);
    }
  }, [roster, locale]);

  useEffect(() => {
    const calculateCircleMask = () => {
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

    window.addEventListener('scroll', calculateCircleMask, { passive: true });
    return () => window.removeEventListener('scroll', calculateCircleMask);
  }, []);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const interval = setInterval(() => {
      setActiveAnnouncementIdx(p => (p + 1) % announcements.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [announcements]);

  const rosterForSelectedWeek = roster.find(r => r.month === selectedMonth && r.week === selectedWeek) || null;

  return (
    <div className="bg-[#FAF8F5] text-[#2D2926] font-['DM_Sans',sans-serif] antialiased overflow-x-hidden min-h-[100dvh] pb-32 selection:bg-[#C9A882]/30">
      
      {/* ── GBT PREMIUM FLOATING NAVIGATION HEADER ── */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-7xl z-50 bg-[#FAF8F5]/80 backdrop-blur-xl rounded-full px-5 py-3 md:px-7 md:py-3.5 border border-[#d9c9b7]/40 flex items-center justify-between transition-all duration-300 shadow-sm">
        <div className="font-['Lora',serif] text-xl md:text-2xl font-bold tracking-tight text-[#2D2926]">
          GBT<span className="text-[#C9A882]">.</span>
        </div>
        
        {/* Central Links Grid */}
        <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-[0.25em] font-semibold text-[#7A6E66]">
          <a href="#hero" className="hover:text-[#2D2926] transition-colors duration-200">Home</a>
          <a href="#announcements" className="hover:text-[#2D2926] transition-colors duration-200">Notices</a>
          <a href="#about-carousel" className="hover:text-[#2D2926] transition-colors duration-200">{t('nav_about')}</a>
          <a href="#love-action" className="hover:text-[#2D2926] transition-colors duration-200">Vision</a>
        </nav>

        {/* Action Blocks: Language and React Router Login/Staff Anchor */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setLocale(l => l === 'en' ? 'bm' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#d9c9b7]/60 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#7A6E66] hover:bg-[#2D2926] hover:text-[#FAF8F5] transition-all"
          >
            <Globe size={11} />
            <span>{locale === 'en' ? 'BM' : 'EN'}</span>
          </button>
          
          {/* Main Retained App Links - Cleanly Structured as a Premium Button */}
          <Link 
            to="/login" 
            className="hidden md:flex items-center gap-1.5 px-4 py-1.5 bg-[#2D2926] text-[#FAF8F5] rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[#C9A882] hover:text-[#2D2926] transition-all shadow-sm"
          >
            <LogIn size={11} />
            <span>{t('nav_portal')}</span>
          </Link>
          
          <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-[#2D2926]/5 rounded-full md:hidden transition-colors">
            <Menu size={18} className="text-[#2D2926]" />
          </button>
        </div>
      </header>

      {/* ── GBT HERO FRAME (Safari Viewport Protected) ── */}
      <section id="hero" className="relative min-h-[100svh] w-full flex flex-col justify-between p-6 pt-28 bg-[#2D2926] text-[#FAF8F5] rounded-b-[2.5rem] md:rounded-b-[5rem] overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,168,130,0.15)_0%,transparent_75%)] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center my-auto px-2 z-10 space-y-6 md:space-y-8">
          <span className="text-[10px] md:text-xs uppercase tracking-[0.40em] text-[#C9A882] block font-semibold">Gereja Baptis Tawau</span>
          <h1 className="text-[clamp(2.1rem,6.5vw,4.5rem)] font-['Lora',serif] font-normal leading-[1.15] tracking-[-0.03em]">
            A community anchored in Christ, <br className="hidden md:block"/>growing in <span className="italic font-light text-[#C9A882]">grace</span>.
          </h1>
          
          {verse && (
            <div className="max-w-xl mx-auto pt-6 border-t border-white/10 space-y-2">
              <p className="text-xs md:text-sm text-[#FAF8F5]/80 italic font-['Lora',serif] leading-relaxed">
                "{verse.text}"
              </p>
              <span className="block text-[10px] uppercase tracking-widest text-[#C9A882] font-mono">{verse.reference}</span>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button onClick={() => setIsEventsModalOpen(true)} className="px-7 py-3.5 bg-[#FAF8F5] text-[#2D2926] text-xs uppercase tracking-widest font-semibold rounded-full hover:bg-[#C9A882] hover:text-[#2D2926] transition-all transform active:scale-95 shadow-md">
              {t('nav_events')}
            </button>
            <button onClick={() => setIsRosterModalOpen(true)} className="px-7 py-3.5 bg-white/10 border border-white/15 text-[#FAF8F5] text-xs uppercase tracking-widest font-semibold rounded-full hover:bg-white/20 backdrop-blur-sm transition-all transform active:scale-95">
              {t('nav_roster')}
            </button>
          </div>
        </div>

        <div className="mx-auto pb-2 opacity-30 animate-bounce hidden md:block">
          <ArrowLeft size={16} className="-rotate-90 text-[#FAF8F5]" />
        </div>
      </section>

      {/* ── NOTICES / ANNOUNCEMENTS SLIDER BLOCK ── */}
      <section id="announcements" className="max-w-5xl mx-auto px-4 -mt-12 relative z-20">
        <div className="bg-[#2D2926]/90 backdrop-blur-md border border-[#C9A882]/30 rounded-[1.75rem] p-6 md:p-8 text-[#FAF8F5] shadow-xl">
          <p className="text-[9px] uppercase tracking-[0.28em] text-[#C9A882] mb-4 font-semibold">{t('announcements_label')}</p>
          
          <div className="min-h-[110px] md:min-h-[90px] flex flex-col justify-between">
            <div>
              <span className="inline-block px-2 py-0.5 rounded-full bg-[#C9A882]/20 text-[#C9A882] text-[8px] uppercase tracking-widest font-bold mb-2">
                {announcements[activeAnnouncementIdx]?.theme}
              </span>
              <h3 className="font-['Lora',serif] text-lg md:text-xl font-normal mb-1">
                {locale === 'bm' ? announcements[activeAnnouncementIdx]?.title_bm : announcements[activeAnnouncementIdx]?.title_en}
              </h3>
              <p className="text-xs text-[#FAF8F5]/70 font-light leading-relaxed max-w-3xl">
                {locale === 'bm' ? announcements[activeAnnouncementIdx]?.text_bm : announcements[activeAnnouncementIdx]?.text_en}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-white/5">
            <button 
              onClick={() => setActiveAnnouncementIdx(p => (p - 1 + announcements.length) % announcements.length)}
              className="p-2 border border-white/10 rounded-full hover:bg-white/10 text-[#C9A882] transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-[10px] font-mono opacity-50 px-2">
              {activeAnnouncementIdx + 1} / {announcements.length}
            </span>
            <button 
              onClick={() => setActiveAnnouncementIdx(p => (p + 1) % announcements.length)}
              className="p-2 border border-white/10 rounded-full hover:bg-white/10 text-[#C9A882] transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ── GBT DESIGN CAROUSEL (Replaces Static About Framework) ── */}
      <section id="about-carousel" className="px-4 py-24 md:py-32 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="uppercase tracking-[0.35em] text-[10px] text-[#B09882] mb-3 font-bold">{t('nav_about')}</p>
          <h2 className="text-3xl md:text-4xl font-['Lora',serif] tracking-tight text-[#2D2926]">{t('about_tagline')}</h2>
        </div>

        <div className="relative overflow-hidden rounded-[2.5rem] md:rounded-[4.5rem] bg-[#2D2926]/5 border border-[#d9c9b7]/40 p-8 py-16 md:p-20 min-h-[380px] md:min-h-[400px] flex items-center transition-all">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-block px-3.5 py-1 rounded-full bg-[#C9A882]/10 text-[#B09882] text-[9px] uppercase tracking-widest font-bold">
              {locale === 'bm' ? aboutSlides[activeAboutIdx]?.tag_bm : aboutSlides[activeAboutIdx]?.tag}
            </div>
            <p className="text-xl md:text-2xl font-['Lora',serif] text-[#2D2926] leading-relaxed font-light italic transition-all duration-300">
              "{locale === 'bm' ? aboutSlides[activeAboutIdx]?.text_bm : aboutSlides[activeAboutIdx]?.text_en}"
            </p>
          </div>
          
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
            <button 
              onClick={() => setActiveAboutIdx(p => (p - 1 + aboutSlides.length) % aboutSlides.length)} 
              className="w-9 h-9 rounded-full border border-[#d9c9b7] bg-[#FAF8F5] flex items-center justify-center text-[#7A6E66] hover:bg-[#2D2926] hover:text-[#FAF8F5] transition-all active:scale-90 shadow-sm"
            >
              <ChevronLeft size={14} />
            </button>
            <div className="flex items-center gap-1.5 px-1.5">
              {aboutSlides.map((_, idx) => (
                <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeAboutIdx ? 'w-5 bg-[#C9A882]' : 'w-1.5 bg-[#d9c9b7]'}`} />
              ))}
            </div>
            <button 
              onClick={() => setActiveAboutIdx(p => (p + 1) % aboutSlides.length)} 
              className="w-9 h-9 rounded-full border border-[#d9c9b7] bg-[#FAF8F5] flex items-center justify-center text-[#7A6E66] hover:bg-[#2D2926] hover:text-[#FAF8F5] transition-all active:scale-90 shadow-sm"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ── GBT LOVE IN ACTION (Scroll-Driven Expanding Dynamic Circle) ── */}
      <section ref={circleSectionRef} id="love-action" className="relative bg-[#2D2926] text-[#FAF8F5] py-36 md:py-52 rounded-[2.5rem] md:rounded-[5rem] overflow-hidden min-h-[85svh] flex items-center justify-center shadow-inner">
        
        <div 
          className="absolute inset-0 bg-[#FAF8F5] transition-transform duration-75 ease-out pointer-events-none origin-center mix-blend-difference"
          style={{
            clipPath: `circle(${circleScale * 100}% at 50% 50%)`
          }}
        />

        <div className="relative max-w-4xl mx-auto text-center px-6 z-10 select-none space-y-6">
          <p className="uppercase tracking-[0.35em] text-[10px] text-[#C9A882] font-semibold">Our Core Vision</p>
          <h2 className="text-[clamp(2.5rem,7.5vw,5.5rem)] font-['Lora',serif] font-normal leading-none tracking-[-0.03em]">
            Love In Action<span className="text-[#C9A882]">.</span>
          </h2>
          <p className="max-w-xl mx-auto text-xs md:text-base leading-relaxed opacity-80 font-light font-['DM_Sans',sans-serif]">
            Faith is expressed through serving. At GBT, we live out our identity by actively engaging with families throughout Tawau, caring for those in need, and developing faithful leadership infrastructures across generations.
          </p>
        </div>
      </section>

      {/* ── GBT STRUCTURAL FOOTER BLOCKS ── */}
      <footer id="footer" className="bg-[#FAF8F5] text-[#2D2926] pt-28 pb-36 px-6 rounded-t-[2.5rem] md:rounded-t-[5rem]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div className="space-y-4">
            <h3 className="font-['Lora',serif] text-2xl font-bold tracking-wide">{t('footer_church')}</h3>
            <p className="text-[#7A6E66] text-xs italic font-['Lora',serif] max-w-xs mx-auto md:mx-0">
              {t('footer_tagline')}
            </p>
          </div>
          
          <div className="space-y-4 text-sm text-[#7A6E66]">
            <h4 className="text-xs uppercase tracking-widest font-bold text-[#2D2926]">Gatherings</h4>
            <div className="space-y-2.5 font-light">
              <div className="flex items-center justify-center md:justify-start gap-2.5"><MapPinned size={14} className="text-[#C9A882]" /> <span>{t('footer_address')}</span></div>
              <div className="flex items-center justify-center md:justify-start gap-2.5"><Clock size={14} className="text-[#C9A882]" /> <span>{t('footer_worship')}</span></div>
            </div>
          </div>

          <div className="space-y-4 text-sm text-[#7A6E66]">
            <h4 className="text-xs uppercase tracking-widest font-bold text-[#2D2926]">Connect</h4>
            <div className="space-y-2.5 font-light">
              <div className="flex items-center justify-center md:justify-start gap-2.5"><Phone size={14} className="text-[#C9A882]" /> <span>{t('footer_phone')}</span></div>
              <p className="text-[11px] opacity-60 mt-4">© 2026 Gereja Baptis Tawau. All Rights Reserved.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* ── HOVERING FIXED BOTTOM RUNNING TEXT MARQUEE TICKER BAR ── */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-5xl z-40 bg-[#2D2926] text-[#FAF8F5] py-4 px-5 rounded-full shadow-xl border border-white/10 overflow-hidden flex items-center backdrop-blur-md">
        <div className="bg-[#C9A882] text-[#2D2926] text-[9px] uppercase tracking-widest font-bold px-3 py-1 rounded-full z-10 shrink-0 mr-4 select-none">
          {t('notice_label')}
        </div>
        
        <div className="relative w-full overflow-hidden whitespace-nowrap mask-gradient">
          <div className="inline-block animate-marquee text-[11px] uppercase tracking-[0.2em] font-light">
            • Welcome to GBT Tawau Services • Worship services next Sunday at 9:00 AM (BM/EN) and 11:15 AM (Chinese) • Join our weekly corporate prayer group meetings on Wednesday evenings • 
          </div>
          <div className="inline-block animate-marquee text-[11px] uppercase tracking-[0.2em] font-light" aria-hidden="true">
            • Welcome to GBT Tawau Services • Worship services next Sunday at 9:00 AM (BM/EN) and 11:15 AM (Chinese) • Join our weekly corporate prayer group meetings on Wednesday evenings • 
          </div>
        </div>
      </div>

      {/* ── MOBILE FULLSCREEN DRAWER OVERLAY ── */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-[#FAF8F5] z-[100] flex flex-col justify-between p-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="font-['Lora',serif] text-xl font-bold tracking-wide">GBT<span className="text-[#C9A882]">.</span></div>
            <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-[#2D2926]/5 rounded-full"><X size={20} /></button>
          </div>
          <nav className="flex flex-col gap-5 text-xl font-['Lora',serif] my-auto pl-4">
            <a href="#hero" onClick={() => setIsMenuOpen(false)} className="hover:text-[#C9A882] transition-colors">Home</a>
            <a href="#announcements" onClick={() => setIsMenuOpen(false)} className="hover:text-[#C9A882] transition-colors">Notices</a>
            <a href="#about-carousel" onClick={() => setIsMenuOpen(false)} className="hover:text-[#C9A882] transition-colors">{t('nav_about')}</a>
            <a href="#love-action" onClick={() => setIsMenuOpen(false)} className="hover:text-[#C9A882] transition-colors">Vision</a>
            
            {/* Kept Mobile Access Route Link */}
            <Link 
              to="/login" 
              onClick={() => setIsMenuOpen(false)} 
              className="inline-flex items-center gap-2 mt-4 text-sm font-sans uppercase tracking-widest font-bold text-[#C9A882]"
            >
              <ShieldAlert size={16} />
              {t('nav_portal')}
            </Link>
          </nav>
          <div className="text-xs text-[#7A6E66] border-t border-[#d9c9b7]/30 pt-4 text-center">© 2026 GBT Tawau.</div>
        </div>
      )}

      {/* ── EVENTS MODAL ── */}
      {isEventsModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FAF8F5] rounded-[2rem] w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col border border-[#d9c9b7]/30">
            <div className="flex items-center justify-between p-5 border-b border-[#d9c9b7]/40">
              <h2 className="text-lg font-['Lora',serif] text-[#2D2926] font-medium">{selectedEvent ? t('event_details_title') : t('events_modal_title')}</h2>
              <button onClick={() => { setIsEventsModalOpen(false); setSelectedEvent(null); }} className="p-2 hover:bg-[#2D2926]/5 rounded-full transition-colors"><X size={18} className="text-[#7A6A5E]" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5">
              {!selectedEvent ? (
                events.length === 0 ? <p className="text-center text-[#8A7A6E] py-10">{t('no_events')}</p> :
                <div className="space-y-3">
                  {events.map(event => {
                    if (!event) return null;
                    const { day, month, dayName } = formatEventDate(event.date);
                    const title = locale === 'bm' && event.title_bm ? event.title_bm : event.title_en;
                    return (
                      <button key={event.id} onClick={() => setSelectedEvent(event)} className="w-full text-left bg-white/80 border border-[#d9c9b7]/40 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-all group">
                        <div className="min-w-[60px] text-center bg-[#2D2926]/5 py-2 px-1 rounded-xl"><div className="text-xl font-['Lora',serif] font-semibold text-[#2D2926]">{day}</div><div className="text-[9px] text-[#B09882] font-bold tracking-widest">{month}</div></div>
                        <div className="flex-1"><h3 className="font-['Lora',serif] text-base text-[#2D2926] font-normal group-hover:text-[#C9A882] transition-colors">{title}</h3><p className="text-[11px] text-[#A08070] mt-0.5">{dayName} · {formatTimeForDisplay(event.time)}</p></div>
                        <ArrowRight size={16} className="text-[#B09882] transform group-hover:translate-x-1 transition-transform" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4 animate-fadeIn">
                  <button onClick={() => setSelectedEvent(null)} className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#7A6A5E] hover:text-[#2D2926] mb-2 font-bold"><ArrowLeft size={14} />{t('events_modal_back')}</button>
                  <div className="bg-white/90 border border-[#d9c9b7]/40 rounded-2xl p-5 space-y-4 shadow-sm">
                    <h3 className="text-xl font-['Lora',serif] text-[#2D2926] font-medium">{locale === 'bm' && selectedEvent.title_bm ? selectedEvent.title_bm : selectedEvent.title_en}</h3>
                    <div className="space-y-3 text-sm text-[#5A4E46] font-light">
                      <div className="flex items-center gap-3"><Calendar size={16} className="text-[#B09882]" /><span>{new Date(selectedEvent.date).toLocaleDateString(locale === 'bm' ? 'ms-MY' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                      {selectedEvent.time && <div className="flex items-center gap-3"><Clock size={16} className="text-[#B09882]" /><span>{formatTimeForDisplay(selectedEvent.time)}</span></div>}
                      {selectedEvent.location && <div className="flex items-center gap-3"><MapPinned size={16} className="text-[#B09882]" /><span>{selectedEvent.location}</span></div>}
                      <div className="flex items-center gap-3"><User size={16} className="text-[#B09882]" /><span>{selectedEvent.pic || selectedEvent.contact_person || 'Church Office'}</span></div>
                      <div className="pt-3 border-t border-[#d9c9b7]/40 text-xs leading-relaxed text-[#7A6E66]">
                        {locale === 'bm' && selectedEvent.description_bm ? selectedEvent.description_bm : selectedEvent.description_en}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-[#d9c9b7]/40 flex justify-end">
              <button onClick={() => { setIsEventsModalOpen(false); setSelectedEvent(null); }} className="px-5 py-2.5 rounded-full bg-[#2D2926] text-[#FAF8F5] text-xs uppercase tracking-widest font-semibold hover:bg-[#4A3F38] transition-colors">{t('events_modal_close')}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── SERVICE ROSTER MODAL ── */}
      {isRosterModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FAF8F5] rounded-[2rem] w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col border border-[#d9c9b7]/30">
            <div className="flex items-center justify-between p-5 border-b border-[#d9c9b7]/40">
              <h2 className="text-lg font-['Lora',serif] text-[#2D2926] font-medium">{t('roster_modal_title')}</h2>
              <button onClick={() => setIsRosterModalOpen(false)} className="p-2 hover:bg-[#2D2926]/5 rounded-full transition-colors"><X size={18} className="text-[#7A6A5E]" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#B09882] mb-1.5 font-bold">{t('roster_month')}</label>
                <div className="relative">
                  <select
                    value={selectedMonth}
                    onChange={(e) => { setSelectedMonth(e.target.value); setSelectedWeek(1); }}
                    className="w-full appearance-none bg-white/90 border border-[#d9c9b7]/60 rounded-xl px-4 py-2.5 text-sm text-[#2D2926] font-medium focus:outline-none focus:ring-1 focus:ring-[#B09882]"
                  >
                    {availableMonths.length === 0 && <option disabled>{t('roster_no_data')}</option>}
                    {availableMonths.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A6A5E] pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#B09882] mb-1.5 font-bold">{t('roster_week')}</label>
                <div className="flex gap-1.5 flex-wrap">
                  {[1, 2, 3, 4, 5].map(week => (
                    <button
                      key={week}
                      onClick={() => setSelectedWeek(week)}
                      className={`flex-1 min-w-[50px] py-2 rounded-xl text-xs font-semibold transition-all ${selectedWeek === week ? 'bg-[#2D2926] text-[#FAF8F5]' : 'bg-white/80 border border-[#d9c9b7]/30 text-[#7A6A5E] hover:bg-white'}`}
                    >
                      W{week}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white/90 border border-[#d9c9b7]/40 rounded-2xl p-5 shadow-sm">
                {rosterForSelectedWeek ? (
                  <div className="space-y-4 font-light text-sm">
                    <div className="flex items-center gap-3.5"><div className="p-2.5 bg-[#2D2926]/5 rounded-xl text-[#B09882]"><User size={16} /></div><div><p className="text-[10px] uppercase tracking-wider text-[#B09882] font-bold">{t('roster_leader')}</p><p className="text-[#2D2926] font-medium mt-0.5">{rosterForSelectedWeek.leader || '—'}</p></div></div>
                    <div className="flex items-center gap-3.5"><div className="p-2.5 bg-[#2D2926]/5 rounded-xl text-[#B09882]"><Users size={16} /></div><div><p className="text-[10px] uppercase tracking-wider text-[#B09882] font-bold">{t('roster_pianist')}</p><p className="text-[#2D2926] font-medium mt-0.5">{rosterForSelectedWeek.pianist || '—'}</p></div></div>
                    <div className="flex items-center gap-3.5"><div className="p-2.5 bg-[#2D2926]/5 rounded-xl text-[#B09882]"><User size={16} /></div><div><p className="text-[10px] uppercase tracking-wider text-[#B09882] font-bold">{t('roster_reader')}</p><p className="text-[#2D2926] font-medium mt-0.5">{rosterForSelectedWeek.reader || '—'}</p></div></div>
                  </div>
                ) : (
                  <p className="text-center text-[#8A7A6E] text-xs py-6 font-light">{t('roster_no_data')}</p>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-[#d9c9b7]/40 flex justify-end">
              <button onClick={() => { setIsRosterModalOpen(false); }} className="px-5 py-2.5 rounded-full bg-[#2D2926] text-[#FAF8F5] text-xs uppercase tracking-widest font-semibold hover:bg-[#4A3F38] transition-colors">{t('events_modal_close')}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── STYLE UTILITY UTILITIES ── */}
      <style>{`
        html { scroll-behavior: smooth; }
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-100%, 0, 0); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 28s linear infinite;
          will-change: transform;
        }
        .mask-gradient {
          mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}