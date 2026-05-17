// src/pages/StaffHub.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, FileText, ShieldCheck, LogOut,
  CalendarDays, DollarSign, Music2, ChevronRight
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const C = {
  bg:         '#FAF8F5',
  surface:    '#FFFFFF',
  surfaceAlt: '#F5EFE6',
  border:     '#EAE1D4',
  text:       '#2D2926',
  textMid:    '#57534E',
  textMuted:  '#9A8B80',
  accentDark: '#92622E',
  accentBg:   '#FDF3E8',
}
const f = { serif: "'Lora', serif", sans: "'DM Sans', sans-serif" }

// ─── Module definitions ───────────────────────────────────────────────────────
const MODULES = [
  {
    id: 'members',
    title: 'Membership',
    desc: 'Members, profiles & directory',
    Icon: Users,
    path: '/staff/members',
    active: true,
  },
  {
    id: 'content',
    title: 'Content',
    desc: 'Verses, roster & announcements',
    Icon: FileText,
    path: '/staff/content',
    active: true,
    showEvents: true,
  },
  {
    id: 'finance',
    title: 'Finance',
    desc: 'Renewals & payment records',
    Icon: DollarSign,
    path: '/staff/finance',
    active: true,
  },
  {
    id: 'lyrics',
    title: 'Lyrics',
    desc: 'Live worship lyrics sessions',
    Icon: Music2,
    path: '/lyrics',
    active: true,
  },
  {
    id: 'admin',
    title: 'Administrative',
    desc: 'Letters, reports & approvals',
    Icon: ShieldCheck,
    path: null,
    active: false,
  },
]

// ─── Module card ──────────────────────────────────────────────────────────────
function ModuleCard({ mod, upcomingEvents, onClick }) {
  const { Icon, title, desc, active, showEvents } = mod
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      disabled={!active}
      onMouseEnter={() => active && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px',
        background: hovered ? C.accentBg : active ? C.surface : '#F5F1EC',
        border: `1.5px solid ${hovered ? C.accentDark : C.border}`,
        borderRadius: '18px',
        cursor: active ? 'pointer' : 'default',
        opacity: active ? 1 : 0.55,
        textAlign: 'left',
        transition: 'background 0.15s, border-color 0.15s',
        fontFamily: f.sans,
        minHeight: 0,
      }}
    >
      {/* Top row: icon + badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: hovered ? '#EFE0CC' : C.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
          <Icon size={18} strokeWidth={1.75} color={hovered ? C.accentDark : C.textMid} />
        </div>
        {showEvents && upcomingEvents > 0 && (
          <span style={{ fontSize: '11px', fontWeight: 600, background: C.accentBg, color: C.accentDark, border: `1px solid #DFC0A0`, borderRadius: '99px', padding: '2px 9px', lineHeight: 1.5 }}>
            {upcomingEvents} upcoming
          </span>
        )}
        {!active && (
          <span style={{ fontSize: '10px', fontWeight: 600, background: '#EDE8E2', color: '#9A8B80', borderRadius: '99px', padding: '2px 8px', lineHeight: 1.5 }}>
            Soon
          </span>
        )}
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <p style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 600, fontFamily: f.serif, color: C.text, lineHeight: 1.2 }}>{title}</p>
        <p style={{ margin: 0, fontSize: '12px', color: C.textMuted, lineHeight: 1.4 }}>{desc}</p>
      </div>

      {/* Arrow */}
      {active && (
        <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
          <ChevronRight size={16} color={hovered ? C.accentDark : C.border} style={{ transition: 'color 0.15s' }} />
        </div>
      )}
    </button>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StaffHub() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const [upcomingEvents, setUpcomingEvents] = useState(0)

  useEffect(() => {
    supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .gte('date', new Date().toISOString().split('T')[0])
      .then(({ count }) => setUpcomingEvents(count || 0))
  }, [])

  const handleLogout = async () => { await signOut(); navigate('/login') }

  // Greeting based on time of day
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: f.sans, display: 'flex', flexDirection: 'column' }}>
      <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* ── Header ── */}
      <header style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 20px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.webp" alt="GBT" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
            <div style={{ width: '1px', height: '20px', background: C.border }} />
            <span style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: C.textMuted }}>Staff Portal</span>
          </div>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: C.textMuted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: f.sans }}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '28px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', boxSizing: 'border-box' }}>

        {/* Greeting */}
        <div>
          <h1 style={{ margin: 0, fontSize: 'clamp(22px,4vw,30px)', fontWeight: 400, color: C.text, fontFamily: f.serif, letterSpacing: '-0.01em' }}>{greeting}.</h1>
          <p style={{ margin: '5px 0 0', fontSize: '13px', color: C.textMuted }}>What would you like to manage today?</p>
        </div>

        {/* Module grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px', flex: 1 }}>
          {MODULES.map(mod => (
            <ModuleCard
              key={mod.id}
              mod={mod}
              upcomingEvents={upcomingEvents}
              onClick={() => mod.active && navigate(mod.path)}
            />
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', paddingTop: '4px' }}>
          <p style={{ margin: 0, fontSize: '10px', letterSpacing: '0.06em', color: '#C0B4A8', fontFamily: f.sans }}>
            GBT&nbsp;·&nbsp;Internal Staff System&nbsp;·&nbsp;Powered by Supabase
          </p>
        </div>
      </main>

      <style>{`
        @media (min-width: 600px) {
          .module-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
        }
        @media (min-width: 900px) {
          .module-grid { grid-template-columns: repeat(5, minmax(0, 1fr)) !important; }
        }
      `}</style>
    </div>
  )
}