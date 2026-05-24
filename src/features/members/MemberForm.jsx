// src/features/members/MemberForm.jsx
import React, { useState, useEffect } from 'react'
import { ChevronDown, Cross } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import FieldLabel from '../../components/ui/FieldLabel'

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

const MARITAL_OPTIONS = ['Single', 'Married', 'Divorced', 'Widowed']
const SEX_OPTIONS = ['Male', 'Female']

const toDisplay = s => { if (!s) return '—'; const [y,m,d]=s.split('-'); return `${d}/${m}/${y}` }
const toStorage = s => { if (!s) return ''; const [d,m,y]=s.split('/'); return `${y}-${m}-${d}` }
const isValidDate = s => {
  if (!s) return false
  const match = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return false
  const [,d,mo,y] = match
  const dt = new Date(y, mo-1, d)
  return dt.getFullYear()===+y && dt.getMonth()===+mo-1 && dt.getDate()===+d
}

const btnBase = {
  display:'inline-flex', alignItems:'center', justifyContent:'center',
  gap:'7px', borderRadius:'99px', fontFamily:"'DM Sans', system-ui, sans-serif",
  fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', border:'none',
}
const btnPrimaryFull   = { ...btnBase, width:'100%', padding:'13px', borderRadius:'12px', fontSize:'15px', background:C.text,    color:'#fff' }
const btnSecondaryFull = { ...btnBase, width:'100%', padding:'13px', borderRadius:'12px', fontSize:'15px', background:C.surface, color:C.textMid, border:`1.5px solid ${C.border}` }

function DateInput({ value, onChange, placeholder, required }) {
  const [raw, setRaw] = useState(value ? toDisplay(value) : '')
  useEffect(() => { setRaw(value ? toDisplay(value) : '') }, [value])
  const handleChange = e => {
    const v = e.target.value; setRaw(v)
    if (!v) { onChange(''); return }
    if (isValidDate(v)) onChange(toStorage(v))
  }
  return <input type="text" value={raw} onChange={handleChange} required={required} placeholder={placeholder} className="mm-input" />
}

export default function MemberForm({ isOpen, onClose, formData, onInputChange, onSubmit, editingId, isMobile }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingId ? 'Edit Member' : 'New Member'} isMobile={isMobile}>
      <form onSubmit={onSubmit} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
        <div>
          <FieldLabel>Full Name *</FieldLabel>
          <input type="text" name="name" value={formData.name} onChange={onInputChange} required placeholder="e.g. John Tan" className="mm-input" />
        </div>

        <div>
          <FieldLabel>Sex</FieldLabel>
          <div style={{ display:'flex', gap:'10px' }}>
            {SEX_OPTIONS.map(s => (
              <label key={s} style={{
                display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', flex:1,
                fontSize:'14px', color:C.textMid, fontFamily:"'DM Sans', system-ui, sans-serif",
                padding:'10px 14px', borderRadius:'10px',
                border:`1.5px solid ${formData.sex===s ? C.accentDark : C.border}`,
                background: formData.sex===s ? C.accentBg : C.surface,
              }}>
                <input type="radio" name="sex" value={s} checked={formData.sex===s} onChange={onInputChange} style={{ accentColor:C.accentDark }} />
                {s}
              </label>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel>Address *</FieldLabel>
          <input type="text" name="address" value={formData.address} onChange={onInputChange} required placeholder="e.g. Taman Indah, Tawau" className="mm-input" />
        </div>

        <div>
          <FieldLabel>Contact Number</FieldLabel>
          <input type="text" name="contactNumber" value={formData.contactNumber} onChange={onInputChange} placeholder="012-3456789" className="mm-input" />
        </div>

        <div>
          <FieldLabel>Date of Birth * <span style={{ fontWeight:400, textTransform:'none', letterSpacing:0, color:C.textMuted }}>(DD/MM/YYYY)</span></FieldLabel>
          <DateInput value={formData.dob} onChange={v => onInputChange({ target: { name: 'dob', value: v } })} placeholder="15/05/1990" required />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          <div>
            <FieldLabel>Registered Since</FieldLabel>
            <DateInput value={formData.registeredSince} onChange={v => onInputChange({ target: { name: 'registeredSince', value: v } })} placeholder="10/01/2023" />
          </div>
          <div>
            <FieldLabel>Baptism Date</FieldLabel>
            <DateInput value={formData.baptismDate} onChange={v => onInputChange({ target: { name: 'baptismDate', value: v } })} placeholder="20/06/2023" />
          </div>
        </div>

        <div>
          <FieldLabel>Marital Status</FieldLabel>
          <div style={{ position:'relative' }}>
            <select name="maritalStatus" value={formData.maritalStatus} onChange={onInputChange} className="mm-input" style={{ appearance:'none', paddingRight:'36px' }}>
              {MARITAL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <ChevronDown size={14} style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', color:C.textMuted, pointerEvents:'none' }} />
          </div>
        </div>

        <div style={{ background:C.surfaceAlt, borderRadius:'12px', padding:'14px' }}>
          <label style={{ display:'flex', alignItems:'center', gap:'10px', cursor:'pointer' }}>
            <input type="checkbox" name="isDeceased" checked={formData.isDeceased} onChange={onInputChange} style={{ width:'18px', height:'18px', accentColor:C.accentDark, cursor:'pointer' }} />
            <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
              <Cross size={14} style={{ color:C.textMuted }} />
              <span style={{ fontSize:'14px', color:C.text, fontFamily:"'DM Sans', system-ui, sans-serif" }}>Mark as Deceased</span>
            </div>
          </label>
          {formData.isDeceased && (
            <div style={{ marginTop:'12px' }}>
              <FieldLabel>Date of Death (DD/MM/YYYY)</FieldLabel>
              <DateInput value={formData.dateOfDeath} onChange={v => onInputChange({ target: { name: 'dateOfDeath', value: v } })} placeholder="15/05/2024" />
            </div>
          )}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', paddingTop:'4px' }}>
          <button type="button" onClick={onClose} style={btnSecondaryFull}>Cancel</button>
          <button type="submit" style={btnPrimaryFull}>{editingId ? 'Update' : 'Add Member'}</button>
        </div>
      </form>
    </Modal>
  )
}
