// src/features/members/MemberCard.jsx
import { Cross } from 'lucide-react'
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

const maritalVariant = s => s==='Married'?'married':s==='Widowed'?'widowed':s==='Divorced'?'divorced':'single'
const ageVariant     = a => a<=12?'child':a<=25?'youth':'adult'

const rowBtnEdit = { padding:'6px 14px', borderRadius:'8px', fontSize:'12px', fontWeight:600, border:`1.5px solid ${C.border}`, background:C.surface, cursor:'pointer', color:C.textMid, fontFamily:"'DM Sans', system-ui, sans-serif" }
const rowBtnDel  = { padding:'6px 14px', borderRadius:'8px', fontSize:'12px', fontWeight:600, border:'1.5px solid #FECACA', background:'#FEF2F2', cursor:'pointer', color:'#DC2626', fontFamily:"'DM Sans', system-ui, sans-serif" }

export default function MemberCard({ members, onSelect, onEdit, onDelete }) {
  return (
    <div>
      {members.map((member, idx) => {
        const age = calcAge(member.dob)
        const isDeceased = member.is_deceased
        return (
          <div key={member.id} style={{
            borderTop: idx===0 ? 'none' : `1px solid ${C.border}`,
            padding:'12px 16px', display:'flex', alignItems:'center', gap:'12px',
            background: isDeceased ? C.surfaceAlt : C.surface,
            opacity: isDeceased ? 0.72 : 1,
          }}>
            <div style={{
              width:'40px', height:'40px', borderRadius:'12px', flexShrink:0,
              background: isDeceased ? '#F3F4F6' : (member.sex==='Male'?'#EFF6FF':'#FDF2F8'),
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              {isDeceased
                ? <Cross size={15} style={{ color:'#9CA3AF' }} />
                : <span style={{ fontSize:'16px', fontWeight:700, color:member.sex==='Male'?'#1D4ED8':'#BE185D', fontFamily:"'Lora', 'Georgia', serif" }}>{member.name.charAt(0)}</span>
              }
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <button onClick={() => onSelect(member)} style={{ background:'none', border:'none', cursor:'pointer', padding:0, textAlign:'left', width:'100%' }}>
                <p style={{ margin:0, fontSize:'15px', fontWeight:700, color: isDeceased ? C.textMuted : C.text, textDecoration: isDeceased ? 'line-through' : 'none', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontFamily:"'Lora', 'Georgia', 'Times New Roman', serif" }}>
                  {member.name}
                </p>
                <p style={{ margin:'2px 0 0', fontSize:'12px', color:C.textMuted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontFamily:"'DM Sans', system-ui, sans-serif" }}>
                  {member.address}{age!==null&&!isDeceased?` · ${age} yrs`:''}
                </p>
              </button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'4px', flexShrink:0, alignItems:'flex-end' }}>
              {isDeceased ? <Badge variant="deceased">Deceased</Badge> : (
                <>
                  {age!==null && <Badge variant={ageVariant(age)}>{age}y</Badge>}
                  <Badge variant={maritalVariant(member.marital_status)}>{member.marital_status||'Single'}</Badge>
                </>
              )}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'4px', flexShrink:0 }}>
              <button onClick={() => onEdit(member)} style={rowBtnEdit}>Edit</button>
              <button onClick={() => onDelete(member.id, member.name)} style={rowBtnDel}>Del</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
