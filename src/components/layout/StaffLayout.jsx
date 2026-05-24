// src/components/layout/StaffLayout.jsx
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ArrowLeft, LogOut } from 'lucide-react'
import useIsMobile from '../../hooks/useIsMobile'

const C = {
  bg: '#FAF8F5', surface: '#FFFFFF', surfaceAlt: '#F5EFE6',
  border: '#EAE1D4', text: '#2D2926', textMid: '#57534E',
  textMuted: '#9A8B80', accent: '#C4A88B', accentDark: '#92622E',
  accentBg: '#FDF3E8',
}
const f = { serif: "'Lora', serif", sans: "'DM Sans', sans-serif" }

export default function StaffLayout({ children, title, subtitle, rightActions, hideBack, onBack, onSignOut }) {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const isMobile = useIsMobile()

  const handleLogout = onSignOut || (async () => { await signOut(); navigate('/login') })
  const handleBack = onBack || (() => navigate('/staff'))

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: f.sans }}>

      {/* Sticky header */}
      <header style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {!hideBack && (
              <button
                onClick={handleBack}
                style={{ width: '36px', height: '36px', borderRadius: '50%', border: `1.5px solid ${C.border}`, background: C.surfaceAlt, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                <ArrowLeft size={16} color={C.textMid} />
              </button>
            )}
            <div>
              <h1 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: C.text, fontFamily: f.serif, lineHeight: 1.2 }}>{title}</h1>
              {!isMobile && subtitle && <p style={{ margin: 0, fontSize: '11px', color: C.textMuted, fontFamily: f.sans }}>{subtitle}</p>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {rightActions}
            <button
              onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: isMobile ? '8px' : '8px 14px', borderRadius: '99px', border: `1.5px solid ${C.border}`, background: C.surface, cursor: 'pointer', fontSize: '13px', color: C.textMid, fontFamily: f.sans, fontWeight: 500, whiteSpace: 'nowrap' }}
            >
              <LogOut size={13} />
              {!isMobile && 'Sign out'}
            </button>
          </div>
        </div>
      </header>

      {children}

      <style>{`
        @keyframes spin      { to { transform: rotate(360deg); } }
        @keyframes slideDown { from { opacity:0; transform:translate(-50%,-10px); } to { opacity:1; transform:translate(-50%,0); } }
        input:focus, select:focus, textarea:focus { border-color: ${C.accentDark} !important; box-shadow: 0 0 0 3px ${C.accentBg} !important; outline: none; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
