// src/pages/StaffHub.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  FileText,
  ShieldCheck,
  LogOut,
  CalendarDays,
  UserRound,
  DollarSign
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

// ─── Design tokens (same as FinanceManager) ──────────────────────────────────
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
}

const font = { serif: "'Lora', serif", sans: "'DM Sans', sans-serif" }

function StaffHub() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  
  const [stats, setStats] = useState({ totalMembers: null, upcomingEvents: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    const { count: membersCount } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
    const { count: eventsCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .gte('date', new Date().toISOString().split('T')[0])
    setStats({
      totalMembers: membersCount || 0,
      upcomingEvents: eventsCount || 0
    })
    setLoading(false)
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const modules = [
    { id: 'members', title: 'Membership', icon: Users, description: 'Manage church members, profiles, and directory records.', path: '/staff/members', active: true },
    { id: 'content', title: 'Content', icon: FileText, description: 'Update weekly verses, worship schedules, announcements, and events.', path: '/staff/content', active: true },
    { id: 'finance', title: 'Finance', icon: DollarSign, description: 'Track membership renewals, payments, and financial records.', path: '/staff/finance', active: true },
    { id: 'admin', title: 'Administrative', icon: ShieldCheck, description: 'Letters, reporting tools, approvals, and workflows.', path: null, active: false },
  ]

  const statItems = [
    { label: 'Total Members', value: stats.totalMembers, icon: UserRound },
    { label: 'Upcoming Events', value: stats.upcomingEvents, icon: CalendarDays },
  ]

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: font.sans }}>
      <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* Header */}
      <header style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: C.text, fontFamily: font.serif, lineHeight: 1.2 }}>Gereja Baptis Tawau</h1>
            <p style={{ margin: 0, fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9A8D82', marginTop: '2px' }}>Staff Portal</p>
          </div>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: C.textMid, background: 'none', border: 'none', cursor: 'pointer' }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 20px' }}>
        {/* Welcome */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ margin: 0, fontSize: 'clamp(28px,5vw,40px)', fontWeight: 400, color: C.text, fontFamily: font.serif, letterSpacing: '-0.02em' }}>Welcome back</h2>
          <p style={{ color: C.textMuted, fontSize: '14px', marginTop: '8px' }}>Manage church operations and internal content.</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {statItems.map(stat => {
            const Icon = stat.icon
            const displayValue = loading ? '—' : stat.value
            return (
              <div key={stat.label} style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: '24px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', color: C.textMuted, marginBottom: '6px' }}>{stat.label}</p>
                  <h3 style={{ margin: 0, fontSize: '32px', fontWeight: 400, color: C.text, fontFamily: font.serif, letterSpacing: '-0.02em' }}>{displayValue}</h3>
                </div>
                <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: C.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} strokeWidth={1.8} style={{ color: '#6F6258' }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Modules grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {modules.map(module => {
            const Icon = module.icon
            return (
              <div key={module.id} style={{
                background: module.active ? C.surface : '#F8F5F1',
                border: `1.5px solid ${C.border}`,
                borderRadius: '24px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '260px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: module.active ? 'pointer' : 'default',
                opacity: module.active ? 1 : 0.7,
              }}
              onMouseEnter={e => { if (module.active) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.05)' } }}
              onMouseLeave={e => { if (module.active) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' } }}
              onClick={() => module.active && navigate(module.path)}
              >
                <div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#F3EEE7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                    <Icon size={22} strokeWidth={1.8} style={{ color: '#6F6258' }} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 500, fontFamily: font.serif, color: C.text, letterSpacing: '-0.01em', marginBottom: '12px' }}>{module.title}</h3>
                  <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.6, color: C.textMid }}>{module.description}</p>
                </div>
                <div style={{ marginTop: '32px' }}>
                  <button disabled={!module.active} style={{
                    width: '100%', padding: '10px', borderRadius: '40px', border: `1.5px solid ${C.border}`,
                    background: module.active ? '#FAF8F5' : '#F1ECE6', color: module.active ? C.text : '#B0A49A',
                    fontSize: '13px', fontWeight: 500, fontFamily: font.sans, cursor: module.active ? 'pointer' : 'not-allowed'
                  }}>
                    {module.active ? `${module.action || 'Open Module'} →` : 'Coming Soon'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{ marginTop: '48px', textAlign: 'center' }}>
          <div style={{ width: '40px', height: '1px', background: '#D8CCC0', margin: '0 auto 16px' }} />
          <p style={{ fontSize: '10px', letterSpacing: '0.05em', color: '#B0A49A' }}>Gereja Baptis Tawau • Internal Staff System</p>
        </div>
      </main>
    </div>
  )
}

export default StaffHub