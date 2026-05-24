// src/pages/StaffHub.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, FileText, ShieldCheck, LogOut,
  CalendarDays, DollarSign, Music2, ChevronRight
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import useIsMobile from '../hooks/useIsMobile'

// ─── Tokens ───────────────────────────────────────────────────────────────────
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

// ─── Modules ──────────────────────────────────────────────────────────────────
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
    badgeKey: 'upcomingEvents',
    badgeLabel: 'upcoming',
  },
  {
    id: 'finance',
    title: 'Finance',
    desc: 'Renewals & payment records',
    Icon: DollarSign,
    path: '/staff/finance',
    active: true,
    badgeKey: 'pendingRenewals',
    badgeLabel: 'pending',
  },
  {
    id: 'lyrics',
    title: 'Lyrics Master',
    desc: 'Song library & lyric management',
    Icon: Music2,
    path: null,
    active: false,
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

// ─── Shared atoms ─────────────────────────────────────────────────────────────
import { Badge } from '../components/ui/Badge'

const SoonBadge = () => (
  <span style={{ fontSize: '10px', fontWeight: 600, background: '#EDE8E2', color: '#9A8B80', borderRadius: '99px', padding: '2px 8px', lineHeight: 1.5, whiteSpace: 'nowrap' }}>
    Soon
  </span>
)

// ─── Mobile card ──────────────────────────────────────────────────────────────
function MobileCard({ mod, stats, onClick }) {
  const { Icon, title, desc, active, badgeKey, badgeLabel } = mod
  const [hov, setHov] = useState(false)
  const badgeVal = badgeKey && stats[badgeKey] > 0 ? stats[badgeKey] : null

  return (
    <button
      onClick={onClick} disabled={!active}
      onMouseEnter={() => active && setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '14px', textAlign: 'left', fontFamily: f.sans,
        background: hov ? C.accentBg : active ? C.surface : '#F5F1EC',
        border: `1.5px solid ${hov ? C.accentDark : C.border}`,
        borderRadius: '18px', cursor: active ? 'pointer' : 'default',
        opacity: active ? 1 : 0.55, transition: 'background 0.15s, border-color 0.15s', minHeight: 0,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: hov ? '#EFE0CC' : C.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
          <Icon size={17} strokeWidth={1.75} color={hov ? C.accentDark : C.textMid} />
        </div>
        {badgeVal ? <Badge>{badgeVal} {badgeLabel}</Badge> : !active ? <SoonBadge /> : null}
      </div>
      <div>
        <p style={{ margin: '0 0 3px', fontSize: '14px', fontWeight: 600, fontFamily: f.serif, color: C.text, lineHeight: 1.2 }}>{title}</p>
        <p style={{ margin: 0, fontSize: '11px', color: C.textMuted, lineHeight: 1.4 }}>{desc}</p>
      </div>
      {active && (
        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
          <ChevronRight size={15} color={hov ? C.accentDark : C.border} />
        </div>
      )}
    </button>
  )
}

// ─── Desktop card ─────────────────────────────────────────────────────────────
function DesktopCard({ mod, stats, onClick }) {
  const { Icon, title, desc, active, badgeKey, badgeLabel } = mod
  const [hov, setHov] = useState(false)
  const badgeVal = badgeKey && stats[badgeKey] > 0 ? stats[badgeKey] : null

  return (
    <button
      onClick={onClick} disabled={!active}
      onMouseEnter={() => active && setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', flexDirection: 'column', padding: '24px', textAlign: 'left',
        fontFamily: f.sans, background: hov ? C.accentBg : active ? C.surface : '#F8F5F1',
        border: `1.5px solid ${hov ? C.accentDark : C.border}`,
        borderRadius: '20px', cursor: active ? 'pointer' : 'default',
        opacity: active ? 1 : 0.6, transition: 'background 0.15s, border-color 0.15s', gap: '18px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: '46px', height: '46px', borderRadius: '13px', background: hov ? '#EFE0CC' : C.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
          <Icon size={21} strokeWidth={1.75} color={hov ? C.accentDark : C.textMid} />
        </div>
        {badgeVal ? <Badge>{badgeVal} {badgeLabel}</Badge> : !active ? <SoonBadge /> : null}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 500, fontFamily: f.serif, color: C.text, lineHeight: 1.2 }}>{title}</p>
        <p style={{ margin: 0, fontSize: '13px', color: C.textMuted, lineHeight: 1.5 }}>{desc}</p>
      </div>
      {active && (
        <div style={{ paddingTop: '14px', borderTop: `1px solid ${hov ? '#DFC0A0' : C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'border-color 0.15s' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: hov ? C.accentDark : C.textMuted, fontFamily: f.sans }}>Open module</span>
          <ChevronRight size={15} color={hov ? C.accentDark : C.border} />
        </div>
      )}
    </button>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StaffHub() {
  const navigate  = useNavigate()
  const { signOut } = useAuth()
  const [stats,    setStats]    = useState({ upcomingEvents: 0, pendingRenewals: 0 })
  const isMobile = useIsMobile()

  useEffect(() => {
    const load = async () => {
      const today = new Date().toISOString().split('T')[0]
      const year  = new Date().getFullYear()
      const [{ count: ev }, { count: total }, { count: paid }] = await Promise.all([
        supabase.from('events').select('*', { count: 'exact', head: true }).gte('date', today),
        supabase.from('members').select('*', { count: 'exact', head: true }),
        supabase.from('membership_renewals').select('*', { count: 'exact', head: true }).eq('renewal_year', year),
      ])
      setStats({ upcomingEvents: ev || 0, pendingRenewals: Math.max(0, (total || 0) - (paid || 0)) })
    }
    load()
  }, [])

  const handleLogout = async () => { await signOut(); navigate('/login') }
  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const date     = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })

  const activeModules   = MODULES.filter(m =>  m.active)
  const inactiveModules = MODULES.filter(m => !m.active)

  // ── MOBILE ────────────────────────────────────────────────────────────────
  if (isMobile) return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: f.sans, display: 'flex', flexDirection: 'column' }}>
      <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <header style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ padding: '0 18px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.webp" alt="GBT" style={{ height: '26px', width: 'auto', objectFit: 'contain' }} />
            <div style={{ width: '1px', height: '18px', background: C.border }} />
            <span style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: C.textMuted }}>Staff Portal</span>
          </div>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: C.textMuted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: f.sans }}>
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </header>

      <main style={{ padding: '22px 16px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 400, color: C.text, fontFamily: f.serif, letterSpacing: '-0.01em' }}>{greeting}.</h1>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: C.textMuted }}>What would you like to manage today?</p>
        </div>

        {/* Active — 2×2 grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {activeModules.map(mod => (
            <MobileCard key={mod.id} mod={mod} stats={stats} onClick={() => navigate(mod.path)} />
          ))}
        </div>

        {/* Inactive — horizontal rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {inactiveModules.map(mod => {
            const { Icon, title, desc } = mod
            return (
              <div key={mod.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', background: '#F5F1EC', border: `1.5px solid ${C.border}`, borderRadius: '14px', opacity: 0.55 }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: '#EDE8E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={15} strokeWidth={1.75} color={C.textMuted} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, fontFamily: f.serif, color: C.text }}>{title}</p>
                  <p style={{ margin: '1px 0 0', fontSize: '11px', color: C.textMuted }}>{desc}</p>
                </div>
                <SoonBadge />
              </div>
            )
          })}
        </div>

        <p style={{ margin: 0, textAlign: 'center', fontSize: '10px', letterSpacing: '0.06em', color: '#C0B4A8' }}>
          GBT · Internal Staff System · Powered by Supabase
        </p>
      </main>
    </div>
  )

  // ── DESKTOP ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: f.sans, display: 'flex' }}>
      <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <aside style={{ width: '272px', flexShrink: 0, background: C.text, minHeight: '100vh', position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column', padding: '36px 28px', overflowY: 'auto' }}>
        {/* Logo */}
        <div style={{ marginBottom: '44px' }}>
          <img src="/logo.webp" alt="GBT" style={{ height: '30px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.85 }} />
        </div>

        {/* Greeting */}
        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 6px', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5A4E48', fontFamily: f.sans }}>{date}</p>
          <h1 style={{ margin: '0 0 8px', fontSize: '26px', fontWeight: 400, fontFamily: f.serif, color: '#F0EBE4', lineHeight: 1.25, letterSpacing: '-0.01em' }}>{greeting}.</h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#5A4E48', lineHeight: 1.6 }}>Manage church operations and internal content.</p>

          <div style={{ margin: '28px 0', height: '1px', background: 'rgba(255,255,255,0.07)' }} />

          {/* Stat items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { Icon: CalendarDays, label: 'Upcoming events', key: 'upcomingEvents' },
              { Icon: DollarSign,   label: 'Pending renewals', key: 'pendingRenewals' },
            ].map(({ Icon, label, key }) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon size={14} color="#5A4E48" strokeWidth={1.75} />
                  <span style={{ fontSize: '12px', color: '#7A6A60', fontFamily: f.sans }}>{label}</span>
                </div>
                <span style={{ fontSize: '15px', fontWeight: 600, color: stats[key] > 0 ? '#C9A882' : '#3D3530', fontFamily: f.serif }}>{stats[key]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', color: '#5A4E48', background: 'none', border: 'none', cursor: 'pointer', fontFamily: f.sans, padding: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = '#C9A882'}
            onMouseLeave={e => e.currentTarget.style.color = '#5A4E48'}
          >
            <LogOut size={14} /> Sign out
          </button>
          <p style={{ margin: '20px 0 0', fontSize: '10px', letterSpacing: '0.05em', color: '#3A3230', lineHeight: 1.7 }}>
            GBT · Internal Staff System<br />Powered by Supabase
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0, padding: '48px 52px 48px', display: 'flex', flexDirection: 'column' }}>
        <p style={{ margin: '0 0 22px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.textMuted }}>Modules</p>

        {/* Active: 3-col grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px', marginBottom: '16px' }}>
          {activeModules.map(mod => (
            <DesktopCard key={mod.id} mod={mod} stats={stats} onClick={() => navigate(mod.path)} />
          ))}
        </div>

        {/* Inactive: 2-col horizontal strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
          {inactiveModules.map(mod => {
            const { Icon, title, desc } = mod
            return (
              <div key={mod.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px', background: '#F8F5F1', border: `1.5px solid ${C.border}`, borderRadius: '20px', opacity: 0.6 }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '13px', background: '#EDE8E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} strokeWidth={1.75} color={C.textMuted} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: 500, fontFamily: f.serif, color: C.text }}>{title}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: C.textMuted }}>{desc}</p>
                </div>
                <SoonBadge />
              </div>
            )
          })}
        </div>

        {/* Bottom accent — verse */}
        <div style={{ flex: 1 }} />
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '24px', marginTop: '40px' }}>
          <p style={{ margin: 0, fontSize: '13px', fontStyle: 'italic', fontFamily: f.serif, color: C.textMuted, lineHeight: 1.7 }}>
            "For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future."
          </p>
          <p style={{ margin: '6px 0 0', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C0B4A8', fontFamily: f.sans }}>Jeremiah 29:11</p>
        </div>
      </div>
    </div>
  )
}