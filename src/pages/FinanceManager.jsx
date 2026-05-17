
Claude finished the response

import React, { useState, useEffect } from 'react' import { useNavigate } from 'react-router-dom' import { ChevronLeft, ChevronRight, MapPin, Clock, Phone, X, Calendar, User, MapPinned, ArrowLeft, Users, ChevronDown } from 'lucide-react' import { supabase } from '../lib/supabase' import

pasted

modernize the carousel on this jsx file. I dont like how its currently stylized. so i want the pagination to be inline inside the carousel box subtle on top right. on desktop the arrows should be middle aligned, circular arrow just at the edge of the carousel box half outside and half in, on mobile it should be on the bottom right. a call to action button should be on the bottom left. this all should be housed in a dynamic container that is rectangle and rounded edges , looks more like a bar but slightly taller (not too thin) on desktop, but mobile view should have it fully end to edge still with rounded corners.  this carousel section should be labelled as announcements.

i pasted the current JSX. do not change the font used in this code. if there are any pleasing aesthetic improvement you can do, then propose first before committing.

12:33 PM
Before I commit to the redesign, let me propose the aesthetic direction for a few details:

Proposed improvements beyond your spec:

Card background — Frosted linen texture (bg-white/60 with a warm grain feel) instead of the current flat white, so it feels cohesive with the 
#FAF8F5 page background.
Tag pill — Instead of plain uppercase text, a small pill badge with a warm amber tint (bg-[#C9A882]/15 text-[#8A6A4A]) to make the theme label feel intentional.
Verse text — Slightly larger and italic with a subtle left-accent line (a 2px warm border) to give it a "quote card" feel rather than just a description paragraph.
CTA button (bottom left) — A minimal ghost-style pill: dark border, transparent fill, hover fills dark — matches the existing nav button language.
Pagination dots (top right) — Active dot slightly wider (pill shape) in warm brown, inactive dots small and muted — very subtle, no harsh contrast.
Desktop arrows — Half-protruding circular buttons with a drop shadow, sitting at vertical center of the bar, using the existing 
#2D2926 dark on hover.
Shall I proceed with all of these, or would you like to tweak anything before I write the code?

proceed and generate.

12:34 PM
Here's the redesigned carousel section. I'll replace the relevant carousel block and its styles in the JSX:



That's the preview. Here's exactly what changed and what to drop into your JSX — only the carousel block and its <style> section are touched, everything else is untouched.

Replace the carousel block (from {carouselItems.length > 0 && ( to its closing )}) with:

jsx
{carouselItems.length > 0 && (
  <div className="hero-carousel-outer">
    <div className="splide-carousel splide hero-carousel-bar" aria-label="Announcements">
      <p className="carousel-section-label">Announcements</p>

      {/* Pagination dots — top right, rendered by Splide into .splide__pagination via CSS repositioning */}
      <div className="splide__track">
        <ul className="splide__list">
          {carouselItems.map((item, idx) => (
            <li key={item.id || idx} className="splide__slide">
              <div className="announcement-card">
                <span className="card-theme-pill">{item.theme || 'Announcement'}</span>
                <h3 className="card-title">
                  {locale === 'bm' && item.title_bm ? item.title_bm : item.title_en}
                </h3>
                <p className="card-body-text">
                  {locale === 'bm' && item.description_bm
                    ? item.description_bm
                    : (item.description_en || '')}
                </p>

                {/* Bottom row: CTA left, arrows right (mobile) / arrows protruding (desktop) */}
                <div className="card-bottom-row">
                  <button className="card-cta-btn">{t('learn_more') || 'Read more'} ›</button>
                  <div className="card-mobile-arrows">
                    <button className="custom-prev card-arrow-sm" aria-label="Previous slide">
                      <ChevronLeft size={16} />
                    </button>
                    <button className="custom-next card-arrow-sm" aria-label="Next slide">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Desktop arrows — half outside the bar */}
      <button className="custom-prev carousel-arrow-desktop carousel-arrow-left" aria-label="Previous slide">
        <ChevronLeft size={20} />
      </button>
      <button className="custom-next carousel-arrow-desktop carousel-arrow-right" aria-label="Next slide">
        <ChevronRight size={20} />
      </button>
    </div>
  </div>
)}
Then replace the entire <style> block at the bottom with this (keeping your existing rules, swapping out the carousel ones):

jsx
<style>{`
  html { scroll-behavior: smooth; }
  * { box-sizing: border-box; }
  @keyframes bob {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50%       { transform: translateX(-50%) translateY(6px); }
  }
  .animate-bob { animation: bob 2.5s ease-in-out infinite; }

  /* ── CAROUSEL OUTER ── */
  .hero-carousel-outer {
    position: relative;
    width: 100%;
    margin-top: 1.5rem;
    padding: 0 1.25rem;          /* room for protruding arrows on desktop */
  }

  /* ── BAR SHAPE ── */
  .hero-carousel-bar {
    background: rgba(255,255,255,0.72);
    border: 1px solid rgba(217,201,183,0.45);
    border-radius: 1.25rem;
    padding: 1.4rem 3.75rem;     /* horizontal padding reserves arrow space */
    position: relative;
    overflow: visible !important; /* let arrows protrude */
  }

  /* Section label */
  .carousel-section-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 9px;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: #B09882;
    margin: 0 0 0.5rem;
    text-align: left;
  }

  /* Splide pagination repositioned to top-right */
  .hero-carousel-bar .splide__pagination {
    position: absolute !important;
    top: 1rem !important;
    right: 1.25rem !important;
    bottom: auto !important;
    left: auto !important;
    gap: 5px;
    padding: 0;
  }
  .hero-carousel-bar .splide__pagination__page {
    width: 5px;
    height: 5px;
    background: rgba(176,152,130,0.35);
    border-radius: 999px;
    border: none;
    transition: width 0.3s, background 0.3s;
    margin: 0 2px;
  }
  .hero-carousel-bar .splide__pagination__page.is-active {
    width: 14px;
    background: #8A6A4A;
    transform: none;
  }

  /* ── SLIDE CARD ── */
  .announcement-card {
    text-align: left;
    min-height: 90px;
  }

  .card-theme-pill {
    display: inline-block;
    background: rgba(201,168,130,0.15);
    color: #8A6A4A;
    font-family: 'DM Sans', sans-serif;
    font-size: 9px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    padding: 3px 10px;
    border-radius: 999px;
    margin-bottom: 0.45rem;
  }

  .card-title {
    font-family: 'Lora', serif;
    font-size: 1.2rem;
    color: #2D2926;
    margin: 0 0 0.35rem;
    line-height: 1.3;
  }

  .card-body-text {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem;
    color: #6B5E55;
    line-height: 1.65;
    font-style: italic;
    border-left: 2px solid rgba(176,152,130,0.4);
    padding-left: 0.75rem;
    margin: 0;
  }

  /* Bottom row: CTA + mobile arrows */
  .card-bottom-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 1rem;
  }

  .card-cta-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 14px;
    border-radius: 999px;
    border: 1px solid rgba(45,41,38,0.25);
    background: transparent;
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #4A3F38;
    cursor: pointer;
    transition: background 0.2s, color 0.2s, border-color 0.2s;
  }
  .card-cta-btn:hover { background: #2D2926; color: #FAF8F5; border-color: #2D2926; }

  /* Mobile arrows (bottom-right, inside card) */
  .card-mobile-arrows {
    display: none;
    gap: 6px;
  }
  .card-arrow-sm {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: white;
    border: 1px solid rgba(217,201,183,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #7A6A5E;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .card-arrow-sm:hover { background: #2D2926; color: #FAF8F5; }

  /* Desktop arrows — half outside the bar, vertically centred */
  .carousel-arrow-desktop {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: white;
    border: 1px solid rgba(217,201,183,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #7A6A5E;
    cursor: pointer;
    transition: background 0.2s, color 0.2s, border-color 0.2s;
    z-index: 10;
  }
  .carousel-arrow-desktop:hover { background: #2D2926; color: #FAF8F5; border-color: #2D2926; }
  .carousel-arrow-left  { left: -18px; }
  .carousel-arrow-right { right: -18px; }

  /* ── MOBILE OVERRIDES ── */
  @media (max-width: 640px) {
    .hero-carousel-outer {
      padding: 0;          /* full edge-to-edge */
    }
    .hero-carousel-bar {
      border-radius: 1.25rem;
      padding: 1.25rem 1.25rem 1rem;
    }
    .carousel-arrow-desktop { display: none; }  /* hide protruding arrows */
    .card-mobile-arrows    { display: flex; }   /* show bottom-right arrows */
  }
`}</style>
Two small things to keep in mind:

The Splide pagination: true option is already set in your existing config — the CSS above simply repositions Splide's own dots to the top-right corner, so no JS change needed.
If you want the CTA to do something (open the events modal, link somewhere), swap the <button className="card-cta-btn"> for whatever action makes sense — I left it as a plain button for you to wire up.

// src/pages/FinanceManager.jsx import React, { useState, useEffect, useMemo } from 'react' import { useNavigate } from 'react-router-dom' import { useAuth } from '../contexts/AuthContext' import { supabase } from '../lib/supabase' import { ArrowLeft, LogOut, DollarSign, Calendar, CheckCircl

pasted

my current finance manager, there might be some issue on mobile display (try to make it more intuitive knowing we are limited in space - i.e.,  smaller record payment button?) use font styling from my previous codes also to maintain style. Improve how you think a finance board should look like:

2:26 PM
Let me study the code before proposing changes.

Here are the key issues I spotted and improvements I'll make before generating:

Mobile problems in current code:

Member cards are too tall — name, contact, status, last paid, and a full-width "Record Payment" button stacked vertically is heavy
The "Record Payment" button at full width with padding is a large tap target that dominates the card
Stats are a 2-col grid of large dark cards — dense on a small screen
No visual hierarchy between paid vs pending members
Finance board improvements:

Stats bar becomes a horizontal scrollable strip on mobile (compact pill-style), not a 2×2 grid
Member rows become a tighter two-line layout: name + contact on the left, status badge + a small icon-only + button on the right — far less vertical bulk
Paid members get a subtle green tint on the row/card to immediately signal completion without reading
Pending members get a soft amber tint
Desktop gets a proper sidebar with a donut-style progress ring showing paid % instead of plain stat cards
Payment method icons (cash/bank/online) in the modal for a more polished feel
Lora for names, DM Sans for everything else — matching your existing codebase
Here's the full rewrite:


Created a file, read a file
Created a file, read a file
Here's a summary of every meaningful change:

Mobile

The 2×2 dark stat grid is gone — replaced with a horizontally scrollable pill strip that takes up one line and doesn't dominate the screen
Member rows are now compact single-line cards: initials circle on the left, name + status info in the middle, and a small circular + icon button on the right for pending members — paid members just show a green checkmark, no button needed
The + button is 32px — a deliberate tap target that doesn't flood the row
Pending members sort to the top automatically so the action items are always visible without scrolling
Desktop

The sidebar gets a donut ring showing the paid percentage visually, with a three-column breakdown underneath (Paid / Pending / Total)
A separate dark "Collected" card shows the RM total for the selected year
Year switcher is in the sidebar, keeping the filter bar clean
Table rows have a subtle green tint on paid members for instant at-a-glance scanning
Payment modal

Payment method is now four icon pill buttons (Cash, Transfer, Online, Cheque) — one tap, no dropdown
Amount and date sit side-by-side in a two-column grid
Receipt and Notes also side-by-side to save vertical height on mobile
Shared

Lora for names and headings, DM Sans for all UI text — matching your existing pages
Status badges use bordered pills (green / amber) consistent with the colour language already in the codebase
Initials circles on both mobile cards and the desktop table give the list a more human, less spreadsheet-y feel

Financemanager
Code · JSX 





Claude is AI and can make mistakes. Please double-check responses.
Financemanager · JSX
Copy

// src/pages/FinanceManager.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import {
  ArrowLeft, LogOut, CheckCircle, AlertCircle,
  Search, Download, X, Users, TrendingUp, Banknote,
  CreditCard, Smartphone, FileText, ChevronRight
} from 'lucide-react'
 
// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:          '#FAF8F5',
  surface:     '#FFFFFF',
  surfaceAlt:  '#F5EFE6',
  border:      '#EAE1D4',
  text:        '#2D2926',
  textMid:     '#57534E',
  textMuted:   '#9A8B80',
  accent:      '#C4A88B',
  accentDark:  '#92622E',
  accentBg:    '#FDF3E8',
  paidBg:      '#F0FAF0',
  paidText:    '#2E7D32',
  paidBorder:  '#C8E6C9',
  pendBg:      '#FFF8F0',
  pendText:    '#B45309',
  pendBorder:  '#FDDCAA',
}
 
// ─── Shared style atoms ───────────────────────────────────────────────────────
const font = { serif: "'Lora', serif", sans: "'DM Sans', sans-serif" }
const inputStyle = {
  width: '100%', padding: '10px 12px',
  border: `1.5px solid ${C.border}`, borderRadius: '10px',
  fontSize: '14px', background: C.surface, color: C.text,
  outline: 'none', boxSizing: 'border-box', fontFamily: font.sans,
}
const thStyle = {
  padding: '11px 16px', textAlign: 'left',
  fontSize: '10px', fontWeight: 700, letterSpacing: '0.09em',
  textTransform: 'uppercase', color: C.textMuted, fontFamily: font.sans,
  whiteSpace: 'nowrap',
}
const tdStyle = {
  padding: '13px 16px', fontSize: '13px',
  color: C.textMid, fontFamily: font.sans, verticalAlign: 'middle',
}
 
// ─── Payment method config ────────────────────────────────────────────────────
const METHODS = [
  { value: 'Cash',          label: 'Cash',          Icon: Banknote    },
  { value: 'Bank Transfer', label: 'Transfer',      Icon: CreditCard  },
  { value: 'Online',        label: 'Online',        Icon: Smartphone  },
  { value: 'Cheque',        label: 'Cheque',        Icon: FileText    },
]
 
// ─── DonutRing (desktop sidebar) ─────────────────────────────────────────────
function DonutRing({ pct }) {
  const r = 44, cx = 56, cy = 56
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)
  return (
    <svg width={112} height={112} viewBox="0 0 112 112">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth={10} />
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={C.accentDark} strokeWidth={10}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transform: 'rotate(-90deg)', transformOrigin: '56px 56px', transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text x={cx} y={cy - 6} textAnchor="middle" fontFamily={font.serif} fontSize="18" fontWeight="600" fill={C.text}>{pct}%</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontFamily={font.sans} fontSize="10" fill={C.textMuted}>paid</text>
    </svg>
  )
}
 
// ─── MobileStat strip item ────────────────────────────────────────────────────
function MiniStat({ label, value, hi }) {
  return (
    <div style={{ flexShrink: 0, textAlign: 'center', padding: '10px 16px', borderRadius: '12px', background: hi ? C.text : C.surface, border: `1.5px solid ${hi ? C.text : C.border}`, minWidth: '90px' }}>
      <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: font.serif, color: hi ? '#fff' : C.text, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: hi ? '#A89080' : C.textMuted, marginTop: '4px', fontFamily: font.sans }}>{label}</div>
    </div>
  )
}
 
// ─── Desktop StatCard ─────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div style={{ background: C.text, borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#78716C', fontFamily: font.sans }}>{label}</span>
        {Icon && <Icon size={13} color="#78716C" />}
      </div>
      <span style={{ fontSize: '28px', fontWeight: 700, lineHeight: 1, color: '#fff', fontFamily: font.serif, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
      {sub && <span style={{ fontSize: '11px', color: '#78716C', fontFamily: font.sans }}>{sub}</span>}
    </div>
  )
}
 
// ─── FieldLabel ───────────────────────────────────────────────────────────────
const FieldLabel = ({ children }) => (
  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: C.textMuted, marginBottom: '6px', fontFamily: font.sans }}>{children}</label>
)
 
// ─── ModalShell ───────────────────────────────────────────────────────────────
function ModalShell({ title, onClose, isMobile, children }) {
  const overlayStyle = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', zIndex: 100, backdropFilter: 'blur(2px)',
    ...(isMobile
      ? { alignItems: 'flex-end', justifyContent: 'center' }
      : { alignItems: 'center', justifyContent: 'center', padding: '24px' }),
  }
  const panelStyle = {
    background: C.surface, width: '100%', overflowY: 'auto',
    ...(isMobile
      ? { borderRadius: '24px 24px 0 0', maxHeight: '92vh', paddingBottom: 'env(safe-area-inset-bottom,16px)' }
      : { borderRadius: '20px', maxWidth: '480px', maxHeight: '88vh' }),
  }
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={e => e.stopPropagation()}>
        {isMobile && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 2px' }}>
            <div style={{ width: '36px', height: '4px', borderRadius: '99px', background: C.border }} />
          </div>
        )}
        <div style={{ padding: isMobile ? '10px 20px 14px' : '24px 24px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: isMobile ? '18px' : '20px', fontWeight: 600, color: C.text, fontFamily: font.serif }}>{title}</h2>
          <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '50%', border: `1.5px solid ${C.border}`, background: C.surfaceAlt, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={14} color={C.textMid} />
          </button>
        </div>
        <div style={{ height: '1px', background: C.border }} />
        <div style={{ padding: isMobile ? '16px 20px' : '20px 24px 24px' }}>{children}</div>
      </div>
    </div>
  )
}
 
// ─── Main component ───────────────────────────────────────────────────────────
export default function FinanceManager() {
  const navigate  = useNavigate()
  const { signOut } = useAuth()
 
  const [loading,            setLoading]            = useState(true)
  const [members,            setMembers]            = useState([])
  const [renewals,           setRenewals]           = useState([])
  const [selectedYear,       setSelectedYear]       = useState(new Date().getFullYear())
  const [statusFilter,       setStatusFilter]       = useState('all')
  const [searchTerm,         setSearchTerm]         = useState('')
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedMember,     setSelectedMember]     = useState(null)
  const [paymentForm,        setPaymentForm]        = useState({
    amount: '', paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash', receiptNumber: '', notes: '',
  })
  const [savedMessage, setSavedMessage] = useState(null)
  const [isMobile,     setIsMobile]     = useState(false)
 
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
 
  const loadData = async () => {
    setLoading(true)
    const [{ data: md, error: me }, { data: rd, error: re }] = await Promise.all([
      supabase.from('members').select('id, name, contact_number, address').order('name'),
      supabase.from('membership_renewals').select('*').order('payment_date', { ascending: false }),
    ])
    if (!me) setMembers(md || [])
    if (!re) setRenewals(rd || [])
    setLoading(false)
  }
 
  useEffect(() => { loadData() }, [])
 
  const showSaved = (text, isError = false) => {
    setSavedMessage({ text, isError })
    setTimeout(() => setSavedMessage(null), 2500)
  }
 
  const hasPaidForYear  = (id, yr) => renewals.some(r => r.member_id === id && r.renewal_year === yr)
  const getLastRenewal  = (id)     => renewals.filter(r => r.member_id === id).sort((a, b) => b.renewal_year - a.renewal_year)[0] ?? null
 
  const stats = useMemo(() => {
    const total   = members.length
    const paid    = members.filter(m => hasPaidForYear(m.id, selectedYear)).length
    const pending = total - paid
    const amount  = renewals.filter(r => r.renewal_year === selectedYear).reduce((s, r) => s + (r.amount_paid || 0), 0)
    const pct     = total ? Math.round((paid / total) * 100) : 0
    return { total, paid, pending, amount, pct }
  }, [members, renewals, selectedYear])
 
  const filteredMembers = useMemo(() => {
    let list = members
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      list = list.filter(m => m.name.toLowerCase().includes(q) || (m.contact_number || '').includes(q))
    }
    if (statusFilter === 'paid')    list = list.filter(m =>  hasPaidForYear(m.id, selectedYear))
    if (statusFilter === 'pending') list = list.filter(m => !hasPaidForYear(m.id, selectedYear))
    // Sort: pending first so action items surface at top
    return [...list].sort((a, b) => {
      const ap = hasPaidForYear(a.id, selectedYear) ? 1 : 0
      const bp = hasPaidForYear(b.id, selectedYear) ? 1 : 0
      return ap - bp || a.name.localeCompare(b.name)
    })
  }, [members, searchTerm, statusFilter, selectedYear, renewals])
 
  const openPaymentModal = (member) => {
    setSelectedMember(member)
    setPaymentForm({ amount: '', paymentDate: new Date().toISOString().split('T')[0], paymentMethod: 'Cash', receiptNumber: '', notes: '' })
    setIsPaymentModalOpen(true)
  }
 
  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    const amount = parseFloat(paymentForm.amount)
    if (isNaN(amount) || amount <= 0) { showSaved('Enter a valid amount', true); return }
    const { error } = await supabase.from('membership_renewals').insert({
      member_id: selectedMember.id, renewal_year: selectedYear,
      amount_paid: amount, payment_date: paymentForm.paymentDate,
      payment_method: paymentForm.paymentMethod,
      receipt_number: paymentForm.receiptNumber || null,
      notes: paymentForm.notes || null,
    })
    if (error) {
      showSaved(error.code === '23505' ? `Already recorded for ${selectedYear}` : 'Error recording payment', true)
    } else {
      showSaved(`Renewal recorded — ${selectedMember.name}`)
      await loadData()
      setIsPaymentModalOpen(false)
    }
  }
 
  const exportCSV = () => {
    const rows = filteredMembers.map(m => {
      const paid = hasPaidForYear(m.id, selectedYear)
      const last = getLastRenewal(m.id)
      const cur  = renewals.find(r => r.member_id === m.id && r.renewal_year === selectedYear)
      return [`"${m.name}"`, m.contact_number || '', paid ? 'Paid' : 'Pending', last?.renewal_year ?? '—', last?.payment_date ?? '—', cur?.amount_paid ?? '—'].join(',')
    })
    const csv  = [['Name','Contact','Status','Last Year','Last Date','Amount'].join(','), ...rows].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement('a'), { href: url, download: `renewals_${selectedYear}.csv` })
    a.click(); URL.revokeObjectURL(url)
    showSaved('Exported')
  }
 
  const years = [new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1]
 
  // ── Loading screen ──────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '34px', height: '34px', borderRadius: '50%', border: `3px solid ${C.border}`, borderTopColor: C.accentDark, animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
 
  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
 
      {/* Toast */}
      {savedMessage && (
        <div style={{ position: 'fixed', top: '72px', left: '50%', transform: 'translateX(-50%)', zIndex: 200, animation: 'slideDown 0.2s ease-out', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '99px', background: savedMessage.isError ? '#DC2626' : C.text, color: '#fff', fontSize: '13px', fontFamily: font.sans }}>
            {savedMessage.isError ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
            {savedMessage.text}
          </div>
        </div>
      )}
 
      {/* ── Header ── */}
      <header style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button onClick={() => navigate('/staff')} style={{ width: '34px', height: '34px', borderRadius: '50%', border: `1.5px solid ${C.border}`, background: C.surfaceAlt, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={15} color={C.textMid} />
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: C.text, fontFamily: font.serif, lineHeight: 1.2 }}>Finance</h1>
              <p  style={{ margin: 0, fontSize: '11px', color: C.textMuted, fontFamily: font.sans }}>Membership Renewals · {selectedYear}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {isMobile && (
              <button onClick={exportCSV} style={{ width: '34px', height: '34px', borderRadius: '50%', border: `1.5px solid ${C.border}`, background: C.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Download size={14} color={C.textMid} />
              </button>
            )}
            <button onClick={signOut} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '99px', border: `1.5px solid ${C.border}`, background: C.surface, cursor: 'pointer', fontSize: '13px', color: C.textMid, fontFamily: font.sans }}>
              <LogOut size={13} />{!isMobile && 'Sign out'}
            </button>
          </div>
        </div>
      </header>
 
      {/* ── Mobile stat strip ── */}
      {isMobile && (
        <div style={{ overflowX: 'auto', padding: '14px 16px 2px', display: 'flex', gap: '10px', scrollbarWidth: 'none' }}>
          <MiniStat label="Members" value={stats.total}  />
          <MiniStat label="Paid"    value={stats.paid}   hi />
          <MiniStat label="Pending" value={stats.pending} />
          <MiniStat label={`RM ${selectedYear}`} value={`${stats.amount.toFixed(0)}`} />
          <MiniStat label="Rate"    value={`${stats.pct}%`} />
        </div>
      )}
 
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '12px 16px 80px' : '28px', display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
 
        {/* ── Desktop sidebar ── */}
        {!isMobile && (
          <aside style={{ width: '260px', flexShrink: 0, position: 'sticky', top: '84px' }}>
            {/* Donut card */}
            <div style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: '18px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <DonutRing pct={stats.pct} />
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: `1px solid ${C.border}` }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, fontFamily: font.sans }}>Paid</div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: C.paidText, fontFamily: font.serif }}>{stats.paid}</div>
                </div>
                <div style={{ width: '1px', background: C.border }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, fontFamily: font.sans }}>Pending</div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: C.pendText, fontFamily: font.serif }}>{stats.pending}</div>
                </div>
                <div style={{ width: '1px', background: C.border }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, fontFamily: font.sans }}>Total</div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: C.text, fontFamily: font.serif }}>{stats.total}</div>
                </div>
              </div>
            </div>
 
            {/* Collected card */}
            <div style={{ background: C.text, borderRadius: '18px', padding: '18px', marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#78716C', fontFamily: font.sans, marginBottom: '6px' }}>Collected · {selectedYear}</div>
              <div style={{ fontSize: '26px', fontWeight: 600, color: '#fff', fontFamily: font.serif, fontVariantNumeric: 'tabular-nums' }}>RM {stats.amount.toFixed(2)}</div>
            </div>
 
            {/* Year picker */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, fontFamily: font.sans, marginBottom: '6px' }}>Year</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {years.map(y => (
                  <button key={y} onClick={() => setSelectedYear(y)} style={{ flex: 1, padding: '8px 0', borderRadius: '10px', border: `1.5px solid ${selectedYear === y ? C.accentDark : C.border}`, background: selectedYear === y ? C.accentBg : C.surface, color: selectedYear === y ? C.accentDark : C.textMid, fontSize: '13px', fontWeight: 600, fontFamily: font.sans, cursor: 'pointer' }}>
                    {y}
                  </button>
                ))}
              </div>
            </div>
 
            <button onClick={exportCSV} style={{ width: '100%', padding: '11px', borderRadius: '12px', border: `1.5px solid ${C.border}`, background: C.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', fontSize: '13px', fontWeight: 600, color: C.textMid, fontFamily: font.sans }}>
              <Download size={14} /> Export CSV
            </button>
          </aside>
        )}
 
        {/* ── Main panel ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
 
          {/* Filter bar */}
          <div style={{ background: C.surface, borderRadius: '16px', border: `1.5px solid ${C.border}`, padding: '12px 14px', marginBottom: '14px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Year picker on mobile */}
            {isMobile && (
              <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} style={{ ...inputStyle, width: 'auto', padding: '7px 10px', fontSize: '13px' }}>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            )}
            {/* Status tabs */}
            <div style={{ display: 'flex', gap: '4px', background: C.bg, borderRadius: '10px', padding: '3px' }}>
              {[['all','All'], ['pending','Pending'], ['paid','Paid']].map(([val, lbl]) => (
                <button key={val} onClick={() => setStatusFilter(val)} style={{ padding: '5px 12px', borderRadius: '8px', border: 'none', background: statusFilter === val ? C.surface : 'transparent', color: statusFilter === val ? C.text : C.textMuted, fontSize: '12px', fontWeight: 600, fontFamily: font.sans, cursor: 'pointer', boxShadow: statusFilter === val ? `0 1px 3px rgba(0,0,0,0.08)` : 'none' }}>
                  {lbl}
                </button>
              ))}
            </div>
            {/* Search */}
            <div style={{ flex: 1, minWidth: isMobile ? '100px' : '160px', position: 'relative' }}>
              <input
                type="text" placeholder="Search…" value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ ...inputStyle, padding: '7px 10px 7px 30px', fontSize: '13px' }}
              />
              <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: C.textMuted, pointerEvents: 'none' }} />
            </div>
            {/* Count badge */}
            <span style={{ fontSize: '12px', color: C.textMuted, fontFamily: font.sans, whiteSpace: 'nowrap' }}>{filteredMembers.length} members</span>
          </div>
 
          {/* ── Member list ── */}
          {filteredMembers.length === 0 ? (
            <div style={{ padding: '56px 24px', textAlign: 'center', color: C.textMuted, fontFamily: font.sans, fontSize: '14px' }}>No members match your filters.</div>
          ) : isMobile ? (
            // ── MOBILE LIST ──────────────────────────────────────────────────
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredMembers.map(member => {
                const paid  = hasPaidForYear(member.id, selectedYear)
                const last  = getLastRenewal(member.id)
                const cur   = renewals.find(r => r.member_id === member.id && r.renewal_year === selectedYear)
                return (
                  <div key={member.id} style={{ background: paid ? C.paidBg : C.surface, border: `1.5px solid ${paid ? C.paidBorder : C.border}`, borderRadius: '14px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Initials circle */}
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: paid ? '#C8E6C9' : C.pendBorder, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: paid ? C.paidText : C.pendText, fontFamily: font.serif }}>
                      {member.name.split(' ').map(w => w[0]).slice(0,2).join('')}
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: C.text, fontFamily: font.serif, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.name}</div>
                      <div style={{ fontSize: '11px', color: C.textMuted, fontFamily: font.sans, marginTop: '2px' }}>
                        {paid
                          ? `Paid ${cur?.payment_date ?? ''} · RM ${cur?.amount_paid ?? ''}`
                          : last ? `Last: ${last.renewal_year}` : 'No record'}
                      </div>
                    </div>
                    {/* Status / action */}
                    {paid ? (
                      <CheckCircle size={20} color={C.paidText} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                    ) : (
                      <button
                        onClick={() => openPaymentModal(member)}
                        style={{ flexShrink: 0, width: '32px', height: '32px', borderRadius: '50%', border: `1.5px solid ${C.accentDark}`, background: C.accentBg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        aria-label={`Record payment for ${member.name}`}
                      >
                        <span style={{ fontSize: '18px', lineHeight: 1, color: C.accentDark, fontWeight: 300, marginTop: '-1px' }}>+</span>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            // ── DESKTOP TABLE ────────────────────────────────────────────────
            <div style={{ background: C.surface, borderRadius: '18px', border: `1.5px solid ${C.border}`, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: C.surfaceAlt }}>
                    <th style={thStyle}>Member</th>
                    <th style={thStyle}>Contact</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Last Renewal</th>
                    <th style={thStyle}>Amount ({selectedYear})</th>
                    <th style={thStyle}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member, idx) => {
                    const paid = hasPaidForYear(member.id, selectedYear)
                    const last = getLastRenewal(member.id)
                    const cur  = renewals.find(r => r.member_id === member.id && r.renewal_year === selectedYear)
                    return (
                      <tr key={member.id} style={{ borderTop: `1px solid ${C.border}`, background: paid ? C.paidBg : 'transparent', transition: 'background 0.15s' }}
                          onMouseEnter={e => { if (!paid) e.currentTarget.style.background = C.surfaceAlt }}
                          onMouseLeave={e => { e.currentTarget.style.background = paid ? C.paidBg : 'transparent' }}>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: paid ? '#C8E6C9' : C.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: paid ? C.paidText : C.textMid, fontFamily: font.serif, flexShrink: 0 }}>
                              {member.name.split(' ').map(w => w[0]).slice(0,2).join('')}
                            </div>
                            <span style={{ color: C.text, fontFamily: font.serif, fontWeight: 500 }}>{member.name}</span>
                          </div>
                        </td>
                        <td style={tdStyle}>{member.contact_number || '—'}</td>
                        <td style={tdStyle}>
                          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, fontFamily: font.sans, background: paid ? C.paidBg : C.pendBg, color: paid ? C.paidText : C.pendText, border: `1px solid ${paid ? C.paidBorder : C.pendBorder}` }}>
                            {paid ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, color: C.textMuted }}>{last ? `${last.renewal_year} · ${last.payment_date}` : '—'}</td>
                        <td style={{ ...tdStyle, fontVariantNumeric: 'tabular-nums' }}>{cur ? `RM ${cur.amount_paid}` : '—'}</td>
                        <td style={tdStyle}>
                          {!paid ? (
                            <button onClick={() => openPaymentModal(member)} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: '99px', border: `1.5px solid ${C.accentDark}`, background: C.accentBg, color: C.accentDark, fontSize: '12px', fontWeight: 600, fontFamily: font.sans, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                              Record Payment
                            </button>
                          ) : (
                            <span style={{ color: C.textMuted, fontSize: '12px', fontFamily: font.sans }}>—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
 
      {/* ── Payment Modal ── */}
      {isPaymentModalOpen && selectedMember && (
        <ModalShell title={`Record Renewal`} onClose={() => setIsPaymentModalOpen(false)} isMobile={isMobile}>
          {/* Member pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: C.surfaceAlt, borderRadius: '12px', marginBottom: '20px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: C.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: C.textMid, fontFamily: font.serif, flexShrink: 0 }}>
              {selectedMember.name.split(' ').map(w => w[0]).slice(0,2).join('')}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: C.text, fontFamily: font.serif }}>{selectedMember.name}</div>
              <div style={{ fontSize: '11px', color: C.textMuted, fontFamily: font.sans }}>Renewal year · {selectedYear}</div>
            </div>
          </div>
 
          <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <FieldLabel>Amount (RM) *</FieldLabel>
                <input type="number" step="0.01" value={paymentForm.amount} onChange={e => setPaymentForm(p => ({ ...p, amount: e.target.value }))} required style={inputStyle} placeholder="0.00" />
              </div>
              <div>
                <FieldLabel>Payment Date *</FieldLabel>
                <input type="date" value={paymentForm.paymentDate} onChange={e => setPaymentForm(p => ({ ...p, paymentDate: e.target.value }))} required style={inputStyle} />
              </div>
            </div>
 
            {/* Method selector — icon pills */}
            <div>
              <FieldLabel>Payment Method</FieldLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
                {METHODS.map(({ value, label, Icon }) => {
                  const active = paymentForm.paymentMethod === value
                  return (
                    <button key={value} type="button" onClick={() => setPaymentForm(p => ({ ...p, paymentMethod: value }))} style={{ padding: '9px 4px', borderRadius: '10px', border: `1.5px solid ${active ? C.accentDark : C.border}`, background: active ? C.accentBg : C.surface, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                      <Icon size={16} color={active ? C.accentDark : C.textMuted} />
                      <span style={{ fontSize: '10px', fontWeight: 600, color: active ? C.accentDark : C.textMuted, fontFamily: font.sans }}>{label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
 
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <FieldLabel>Receipt No.</FieldLabel>
                <input type="text" value={paymentForm.receiptNumber} onChange={e => setPaymentForm(p => ({ ...p, receiptNumber: e.target.value }))} style={inputStyle} placeholder="Optional" />
              </div>
              <div>
                <FieldLabel>Notes</FieldLabel>
                <input type="text" value={paymentForm.notes} onChange={e => setPaymentForm(p => ({ ...p, notes: e.target.value }))} style={inputStyle} placeholder="Optional" />
              </div>
            </div>
 
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '6px' }}>
              <button type="button" onClick={() => setIsPaymentModalOpen(false)} style={{ padding: '12px', borderRadius: '12px', border: `1.5px solid ${C.border}`, background: C.surface, color: C.textMid, fontSize: '14px', fontWeight: 600, fontFamily: font.sans, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '12px', borderRadius: '12px', border: 'none', background: C.text, color: '#fff', fontSize: '14px', fontWeight: 600, fontFamily: font.sans, cursor: 'pointer' }}>Record Payment</button>
            </div>
          </form>
        </ModalShell>
      )}
 
      <style>{`
        @keyframes spin      { to { transform: rotate(360deg); } }
        @keyframes slideDown { from { opacity:0; transform:translate(-50%,-10px); } to { opacity:1; transform:translate(-50%,0); } }
        input:focus, select:focus, textarea:focus { border-color: ${C.accentDark} !important; box-shadow: 0 0 0 3px ${C.accentBg} !important; outline: none; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
 
