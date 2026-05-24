// src/features/members/BulkImportModal.jsx
import { useState, useRef } from 'react'
import { AlertCircle, Download } from 'lucide-react'
import Modal from '../../components/ui/Modal'

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
const btnPrimary    = { ...btnBase, padding:'10px 18px', fontSize:'14px', background:C.text,    color:'#fff' }
const btnPrimaryFull   = { ...btnPrimary,   width:'100%', padding:'13px', borderRadius:'12px', fontSize:'15px' }

const downloadTemplate = () => {
  const headers = ['Name','Sex','Address','Contact Number','Date of Birth','Registered Since','Baptism Date','Marital Status','Deceased','Date of Death']
  const rows = [
    ['"John Tan"','Male','"Taman Indah, Tawau"','012-3456789','15/05/1990','10/01/2023','20/06/2023','Married','No',''],
    ['"Mary Wong"','Female','"Jalan Kuhara, Tawau"','019-8765432','22/08/1985','05/11/2022','','Single','No',''],
  ]
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob(['﻿'+csv], { type:'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob); const a=document.createElement('a')
  a.href=url; a.download='church_members_template.csv'; a.click()
}

export default function BulkImportModal({ isOpen, onClose, onImport, isMobile }) {
  const fileInputRef = useRef(null)
  const [importPreview, setImportPreview] = useState([])
  const [importErrors, setImportErrors] = useState([])

  const closeImport = () => { setImportPreview([]); setImportErrors([]); onClose() }

  const handleFileUpload = e => {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const lines = ev.target.result.split(/\r?\n/)
      const headers = lines[0].replace(/^﻿/,'').split(',').map(h => h.replace(/"/g,'').trim())
      const required = ['Name','Sex','Address','Date of Birth','Registered Since','Baptism Date','Marital Status']
      const missing = required.filter(h => !headers.includes(h))
      if (missing.length) { setImportErrors([`Missing columns: ${missing.join(', ')}`]); setImportPreview([]); return }
      const parsed=[], errors=[]
      for (let i=1; i<lines.length; i++) {
        if (!lines[i].trim()) continue
        const row=[]; let inQ=false, field=''
        for (const char of lines[i]) {
          if (char==='"') inQ=!inQ
          else if (char===','&&!inQ) { row.push(field.replace(/^"|"$/g,'').trim()); field='' }
          else field+=char
        }
        row.push(field.replace(/^"|"$/g,'').trim())
        const name=row[0],sex=row[1],address=row[2],contactNumber=row[3]||''
        const dob=row[4],registeredSince=row[5],baptismDate=row[6],maritalStatus=row[7]
        const isDeceased=row[8]?.toLowerCase()==='yes', dateOfDeath=row[9]||''
        if (!name||!address||!dob) { errors.push(`Row ${i}: Name, Address, DOB required`); continue }
        if (sex&&!SEX_OPTIONS.includes(sex)) { errors.push(`Row ${i}: Sex must be Male or Female`); continue }
        if (!isValidDate(dob)) { errors.push(`Row ${i}: Invalid DOB (DD/MM/YYYY)`); continue }
        if (registeredSince&&!isValidDate(registeredSince)) { errors.push(`Row ${i}: Invalid Registered Since`); continue }
        if (baptismDate&&!isValidDate(baptismDate)) { errors.push(`Row ${i}: Invalid Baptism Date`); continue }
        if (maritalStatus&&!MARITAL_OPTIONS.includes(maritalStatus)) { errors.push(`Row ${i}: Invalid Marital Status`); continue }
        if (dateOfDeath&&!isValidDate(dateOfDeath)) { errors.push(`Row ${i}: Invalid Date of Death`); continue }
        parsed.push({
          name, sex:sex||'Male', address, contact_number:contactNumber,
          dob:toStorage(dob), registered_since:registeredSince?toStorage(registeredSince):null,
          baptism_date:baptismDate?toStorage(baptismDate):null,
          marital_status:maritalStatus||'Single', is_deceased:isDeceased,
          date_of_death:dateOfDeath?toStorage(dateOfDeath):null
        })
      }
      if (errors.length) { setImportErrors(errors); setImportPreview([]) }
      else { setImportErrors([]); setImportPreview(parsed) }
    }
    reader.readAsText(file,'UTF-8')
  }

  const confirmImport = async () => {
    await onImport(importPreview)
    setImportPreview([]); setImportErrors([])
    if (fileInputRef.current) fileInputRef.current.value=''
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={closeImport} title="Bulk Import" isMobile={isMobile}>
      <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
        {[
          { n:1, title:'Download the template', sub:'Fill in with member data. Dates in DD/MM/YYYY format.', btn: <button onClick={downloadTemplate} style={{ ...btnPrimary, fontSize:'13px', padding:'8px 16px' }}><Download size={13} />Download Template</button> },
          { n:2, title:'Upload your CSV', sub:'Select your completed CSV file.', btn: <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} style={{ fontSize:'13px', color:C.textMid, fontFamily:"'DM Sans', system-ui, sans-serif" }} /> },
        ].map(({ n, title, sub, btn }) => (
          <div key={n} style={{ background:C.surfaceAlt, borderRadius:'14px', padding:'16px' }}>
            <div style={{ display:'flex', gap:'10px', alignItems:'flex-start', marginBottom:'10px' }}>
              <div style={{ width:'26px', height:'26px', borderRadius:'50%', background:C.text, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:700, flexShrink:0, fontFamily:"'DM Sans', system-ui, sans-serif" }}>{n}</div>
              <div>
                <p style={{ margin:0, fontSize:'14px', fontWeight:700, color:C.text, fontFamily:"'Lora', 'Georgia', serif" }}>{title}</p>
                <p style={{ margin:'3px 0 0', fontSize:'12px', color:C.textMuted, fontFamily:"'DM Sans', system-ui, sans-serif" }}>{sub}</p>
              </div>
            </div>
            {btn}
          </div>
        ))}

        {importErrors.length > 0 && (
          <div style={{ background:'#FEF2F2', border:'1.5px solid #FECACA', borderRadius:'12px', padding:'12px', maxHeight:'140px', overflowY:'auto' }}>
            {importErrors.slice(0,8).map((err,i) => (
              <div key={i} style={{ display:'flex', gap:'6px', alignItems:'flex-start', marginTop: i===0?0:'6px' }}>
                <AlertCircle size={13} style={{ color:'#DC2626', flexShrink:0, marginTop:'1px' }} />
                <p style={{ margin:0, fontSize:'12px', color:'#DC2626', fontFamily:"'DM Sans', system-ui, sans-serif" }}>{err}</p>
              </div>
            ))}
            {importErrors.length > 8 && <p style={{ margin:'6px 0 0', fontSize:'12px', color:C.textMuted, fontFamily:"'DM Sans', system-ui, sans-serif" }}>…and {importErrors.length-8} more</p>}
          </div>
        )}

        {importPreview.length > 0 && (
          <div>
            <p style={{ margin:'0 0 10px', fontSize:'14px', fontWeight:600, color:C.text, fontFamily:"'Lora', 'Georgia', serif" }}>
              {importPreview.length} members ready to import
            </p>
            <div style={{ border:`1.5px solid ${C.border}`, borderRadius:'12px', overflow:'hidden', maxHeight:'160px', overflowY:'auto' }}>
              {importPreview.slice(0,8).map((m,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', gap:'10px', padding:'9px 14px', borderTop:i===0?'none':`1px solid ${C.border}`, background:C.surface }}>
                  <span style={{ fontSize:'13px', fontWeight:600, color:C.text, fontFamily:"'Lora', 'Georgia', serif", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.name}</span>
                  <span style={{ fontSize:'12px', color:C.textMuted, fontFamily:"'DM Sans', system-ui, sans-serif", whiteSpace:'nowrap' }}>{m.sex} · {toDisplay(m.dob)}</span>
                </div>
              ))}
              {importPreview.length > 8 && (
                <div style={{ padding:'9px 14px', textAlign:'center', fontSize:'12px', color:C.textMuted, fontFamily:"'DM Sans', system-ui, sans-serif", borderTop:`1px solid ${C.border}` }}>
                  …and {importPreview.length-8} more
                </div>
              )}
            </div>
            <button onClick={confirmImport} style={{ ...btnPrimaryFull, marginTop:'12px' }}>
              Import {importPreview.length} Members
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}
