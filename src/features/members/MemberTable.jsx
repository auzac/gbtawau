// src/features/members/MemberTable.jsx
import { Cross, UserCheck } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'

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

const calcAge = dob => {
  if (!dob) return null
  const birth=new Date(dob), now=new Date()
  let age = now.getFullYear()-birth.getFullYear()
  const md = now.getMonth()-birth.getMonth()
  if (md<0||(md===0&&now.getDate()<birth.getDate())) age--
  return age
}

const rowBtnEdit = { padding:'6px 14px', borderRadius:'8px', fontSize:'12px', fontWeight:600, border:`1.5px solid ${C.border}`, background:C.surface, cursor:'pointer', color:C.textMid, fontFamily:"'DM Sans', system-ui, sans-serif" }
const rowBtnDel  = { padding:'6px 14px', borderRadius:'8px', fontSize:'12px', fontWeight:600, border:'1.5px solid #FECACA', background:'#FEF2F2', cursor:'pointer', color:'#DC2626', fontFamily:"'DM Sans', system-ui, sans-serif" }

export default function MemberTable({ members, onSelect, onEdit, onDelete }) {
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
        <thead>
          <tr style={{ background:C.surfaceAlt }}>
            <th style={{ padding:'12px 16px', textAlign:'left', fontSize:'10px', fontWeight:700, letterSpacing:'0.09em', textTransform:'uppercase', color:C.textMid, fontFamily:"'DM Sans', system-ui, sans-serif", width:'30%' }}>Name</th>
            <th style={{ padding:'12px 16px', textAlign:'left', fontSize:'10px', fontWeight:700, letterSpacing:'0.09em', textTransform:'uppercase', color:C.textMid, fontFamily:"'DM Sans', system-ui, sans-serif", width:'10%' }}>Sex</th>
            <th style={{ padding:'12px 16px', textAlign:'left', fontSize:'10px', fontWeight:700, letterSpacing:'0.09em', textTransform:'uppercase', color:C.textMid, fontFamily:"'DM Sans', system-ui, sans-serif", width:'35%' }}>Address</th>
            <th style={{ padding:'12px 16px', textAlign:'left', fontSize:'10px', fontWeight:700, letterSpacing:'0.09em', textTransform:'uppercase', color:C.textMid, fontFamily:"'DM Sans', system-ui, sans-serif", width:'15%' }}>Status</th>
            <th style={{ padding:'12px 16px', textAlign:'right', fontSize:'10px', fontWeight:700, letterSpacing:'0.09em', textTransform:'uppercase', color:C.textMid, fontFamily:"'DM Sans', system-ui, sans-serif", width:'10%' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map(member => {
            const isDeceased = member.is_deceased
            return (
              <tr
                key={member.id}
                style={{ borderTop:`1px solid ${C.border}`, background: isDeceased ? C.surfaceAlt : C.surface, opacity: isDeceased ? 0.72 : 1, transition:'background 0.1s' }}
                onMouseEnter={e => { if (!isDeceased) e.currentTarget.style.background = C.bg }}
                onMouseLeave={e => { e.currentTarget.style.background = isDeceased ? C.surfaceAlt : C.surface }}
              >
                {/* Name */}
                <td style={{ padding:'12px 16px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <div style={{
                      width:'32px', height:'32px', borderRadius:'9px', flexShrink:0,
                      background: isDeceased ? '#F3F4F6' : (member.sex==='Male'?'#EFF6FF':'#FDF2F8'),
                      display:'flex', alignItems:'center', justifyContent:'center',
                    }}>
                      {isDeceased
                        ? <Cross size={13} style={{ color:'#9CA3AF' }} />
                        : <span style={{ fontSize:'13px', fontWeight:700, color:member.sex==='Male'?'#1D4ED8':'#BE185D', fontFamily:"'Lora', 'Georgia', serif" }}>{member.name.charAt(0)}</span>
                      }
                    </div>
                    <button onClick={() => onSelect(member)} style={{
                      background:'none', border:'none', cursor:'pointer', padding:0,
                      fontSize:'14px', fontWeight:600, textAlign:'left',
                      color: isDeceased ? C.textMuted : C.text,
                      textDecoration: isDeceased ? 'line-through' : 'none',
                      fontFamily:"'Lora', 'Georgia', 'Times New Roman', serif",
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                    }}>
                      {member.name}
                    </button>
                  </div>
                </td>
                {/* Sex */}
                <td style={{ padding:'12px 16px', whiteSpace:'nowrap' }}>
                  <Badge variant={member.sex==='Male'?'male':'female'}>{member.sex||'Male'}</Badge>
                </td>
                {/* Address */}
                <td style={{ padding:'12px 16px', color:C.textMid, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontFamily:"'DM Sans', system-ui, sans-serif", fontSize:'13px' }}>
                  {member.address}
                </td>
                {/* Status */}
                <td style={{ padding:'12px 16px' }}>
                  {isDeceased
                    ? <Badge variant="deceased">Deceased</Badge>
                    : member.baptism_date
                      ? <Badge variant="baptised"><UserCheck size={10} style={{ marginRight:'2px' }} />Baptised</Badge>
                      : <span style={{ color:C.textMuted, fontSize:'12px', fontFamily:"'DM Sans', system-ui, sans-serif" }}>—</span>
                  }
                </td>
                {/* Actions */}
                <td style={{ padding:'12px 16px', textAlign:'right', whiteSpace:'nowrap' }}>
                  <button onClick={() => onEdit(member)} style={{ ...rowBtnEdit, marginRight:'8px' }}>Edit</button>
                  <button onClick={() => onDelete(member.id, member.name)} style={rowBtnDel}>Delete</button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
