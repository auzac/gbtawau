// src/features/dashboard/ModuleCard.jsx
import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'

// ─── Tokens ───────────────────────────────────────────────────────────────────
const C = {
  surface:     '#FFFFFF',
  surfaceAlt:  '#F5EFE6',
  border:      '#EAE1D4',
  text:        '#2D2926',
  textMid:     '#57534E',
  textMuted:   '#9A8B80',
  accentDark:  '#92622E',
  accentBg:    '#FDF3E8',
}
const f = { serif: "'Lora', serif", sans: "'DM Sans', sans-serif" }

// ─── Shared atoms ─────────────────────────────────────────────────────────────
export const SoonBadge = () => (
  <span style={{ fontSize: '10px', fontWeight: 600, background: '#EDE8E2', color: '#9A8B80', borderRadius: '99px', padding: '2px 8px', lineHeight: 1.5, whiteSpace: 'nowrap' }}>
    Soon
  </span>
)

// ─── Mobile card ──────────────────────────────────────────────────────────────
export function MobileCard({ mod, stats, onClick }) {
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
export function DesktopCard({ mod, stats, onClick }) {
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
