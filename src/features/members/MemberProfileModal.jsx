// src/features/members/MemberProfileModal.jsx
import { X, Calendar, MapPin, Phone, User, Cross } from 'lucide-react'

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

const toDisplay = s => { if (!s) return '—'; const [y,m,d]=s.split('-'); return `${d}/${m}/${y}` }
const calcAge = dob => {
  if (!dob) return null
  const birth=new Date(dob), now=new Date()
  let age = now.getFullYear()-birth.getFullYear()
  const md = now.getMonth()-birth.getMonth()
  if (md<0||(md===0&&now.getDate()<birth.getDate())) age--
  return age
}

function SectionLabel({ children, style={} }) {
  return (
    <p style={{
      margin:'0 0 10px', fontSize:'10px', fontWeight:700, letterSpacing:'0.12em',
      textTransform:'uppercase', color:C.textMuted, fontFamily:"'DM Sans', system-ui, sans-serif",
      ...style,
    }}>{children}</p>
  )
}

export default function MemberProfileModal({ member, onClose, isMobile }) {
  const age = calcAge(member.dob)
  const isDeceased = member.is_deceased

  const InfoRow = ({ icon: Icon, label, value }) => {
    if (!value || value === '—') return null
    return (
      <div style={{ display:'flex', gap:'12px', alignItems:'flex-start' }}>
        <div style={{ width:'34px', height:'34px', borderRadius:'10px', flexShrink:0, background:C.accentBg, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon size={15} style={{ color:C.accentDark }} />
        </div>
        <div style={{ minWidth:0 }}>
          <p style={{ margin:0, fontSize:'10px', fontWeight:700, letterSpacing:'0.09em', textTransform:'uppercase', color:C.textMuted, fontFamily:"'DM Sans', system-ui, sans-serif" }}>{label}</p>
          <p style={{ margin:'3px 0 0', fontSize:'14px', color:C.text, wordBreak:'break-word', fontFamily:'system-ui, sans-serif' }}>{value}</p>
        </div>
      </div>
    )
  }

  const overlayStyle = {
    position:'fixed', inset:0, background:'rgba(0,0,0,0.5)',
    display:'flex', zIndex:100, backdropFilter:'blur(2px)',
    ...(isMobile
      ? { alignItems:'flex-end', justifyContent:'center' }
      : { alignItems:'center', justifyContent:'center', padding:'24px' }),
  }
  const panelStyle = {
    background:C.surface, width:'100%', overflowY:'auto',
    ...(isMobile
      ? { borderRadius:'24px 24px 0 0', maxHeight:'88vh', boxShadow:'0 -8px 40px rgba(0,0,0,0.18)', paddingBottom:'env(safe-area-inset-bottom,16px)' }
      : { borderRadius:'20px', maxWidth:'460px', maxHeight:'85vh', boxShadow:'0 24px 64px rgba(0,0,0,0.18)' }),
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={e => e.stopPropagation()}>
        {isMobile && (
          <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 4px' }}>
            <div style={{ width:'40px', height:'4px', borderRadius:'99px', background:C.border }} />
          </div>
        )}
        {/* Header */}
        <div style={{ padding: isMobile ? '8px 20px 16px' : '24px 24px 0', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'12px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <div style={{
              width:'46px', height:'46px', borderRadius:'14px', flexShrink:0,
              background: isDeceased ? '#F3F4F6' : (member.sex==='Male'?'#EFF6FF':'#FDF2F8'),
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              {isDeceased
                ? <Cross size={18} style={{ color:'#9CA3AF' }} />
                : <span style={{ fontSize:'19px', fontWeight:700, color:member.sex==='Male'?'#1D4ED8':'#BE185D', fontFamily:"'Lora', 'Georgia', serif" }}>{member.name.charAt(0)}</span>
              }
            </div>
            <div>
              <h2 style={{ margin:0, fontSize:'20px', fontWeight:700, lineHeight:1.1, color: isDeceased ? C.textMuted : C.text, fontFamily:"'Lora', 'Georgia', 'Times New Roman', serif" }}>
                {member.name}
              </h2>
              {isDeceased && <p style={{ margin:'4px 0 0', fontSize:'12px', color:C.textMuted, fontFamily:"'DM Sans', system-ui, sans-serif" }}>Home with the Lord{member.date_of_death?` · ${toDisplay(member.date_of_death)}`:''}</p>}
            </div>
          </div>
          <button onClick={onClose} style={{ width:'32px', height:'32px', borderRadius:'50%', border:`1.5px solid ${C.border}`, background:C.surfaceAlt, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <X size={15} style={{ color:C.textMid }} />
          </button>
        </div>

        <div style={{ height:'1px', background:C.border, margin:'16px 0' }} />

        <div style={{ padding: isMobile ? '0 20px 8px' : '0 24px 24px', display:'flex', flexDirection:'column', gap:'14px' }}>
          <InfoRow icon={Calendar} label="Date of Birth" value={member.dob ? `${toDisplay(member.dob)}${age!==null?` · Age ${age}`:''}` : null} />
          <InfoRow icon={MapPin}   label="Address"       value={member.address} />
          <InfoRow icon={Phone}    label="Contact"       value={member.contact_number} />
          <InfoRow icon={User}     label="Gender & Status" value={`${member.sex} · ${member.marital_status||'Single'}`} />
          <div style={{ height:'1px', background:C.border }} />
          <SectionLabel>Church Life</SectionLabel>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
            {[
              { label:'Registered Since', val:toDisplay(member.registered_since) },
              { label:'Baptism Date',     val:toDisplay(member.baptism_date) },
            ].map(({ label, val }) => (
              <div key={label} style={{ background:C.surfaceAlt, borderRadius:'12px', padding:'12px' }}>
                <p style={{ margin:'0 0 4px', fontSize:'10px', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', color:C.textMuted, fontFamily:"'DM Sans', system-ui, sans-serif" }}>{label}</p>
                <p style={{ margin:0, fontSize:'14px', fontWeight:600, color:C.text, fontFamily:"'Lora', 'Georgia', serif" }}>{val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
