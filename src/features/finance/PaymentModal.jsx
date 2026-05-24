// src/features/finance/PaymentModal.jsx
import { Banknote, CreditCard, Smartphone, FileText } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import FieldLabel from '../../components/ui/FieldLabel'

// ─── Design tokens ────────────────────────────────────────────────────────────
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
const font = { serif: "'Lora', serif", sans: "'DM Sans', sans-serif" }
const inputStyle = {
  width: '100%', padding: '10px 12px',
  border: `1.5px solid ${C.border}`, borderRadius: '10px',
  fontSize: '14px', background: C.surface, color: C.text,
  outline: 'none', boxSizing: 'border-box', fontFamily: font.sans,
}

// ─── Payment method config ────────────────────────────────────────────────────
const METHODS = [
  { value: 'Cash',          label: 'Cash',          Icon: Banknote    },
  { value: 'Bank Transfer', label: 'Transfer',      Icon: CreditCard  },
  { value: 'Online',        label: 'Online',        Icon: Smartphone  },
  { value: 'Cheque',        label: 'Cheque',        Icon: FileText    },
]

export default function PaymentModal({ isOpen, onClose, member, year, form, setForm, onSubmit, isMobile }) {
  return (
    <Modal isOpen title="Record Renewal" onClose={onClose} isMobile={isMobile}>
      {/* Member pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: C.surfaceAlt, borderRadius: '12px', marginBottom: '20px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: C.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: C.textMid, fontFamily: font.serif, flexShrink: 0 }}>
          {member.name.split(' ').map(w => w[0]).slice(0,2).join('')}
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: C.text, fontFamily: font.serif }}>{member.name}</div>
          <div style={{ fontSize: '11px', color: C.textMuted, fontFamily: font.sans }}>Renewal year · {year}</div>
        </div>
      </div>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <FieldLabel>Amount (RM) *</FieldLabel>
            <input type="number" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required style={inputStyle} placeholder="0.00" />
          </div>
          <div>
            <FieldLabel>Payment Date *</FieldLabel>
            <input type="date" value={form.paymentDate} onChange={e => setForm(p => ({ ...p, paymentDate: e.target.value }))} required style={inputStyle} />
          </div>
        </div>

        {/* Method selector — icon pills */}
        <div>
          <FieldLabel>Payment Method</FieldLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
            {METHODS.map(({ value, label, Icon }) => {
              const active = form.paymentMethod === value
              return (
                <button key={value} type="button" onClick={() => setForm(p => ({ ...p, paymentMethod: value }))} style={{ padding: '9px 4px', borderRadius: '10px', border: `1.5px solid ${active ? C.accentDark : C.border}`, background: active ? C.accentBg : C.surface, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                  <Icon size={16} color={active ? C.accentDark : C.textMuted} />
                  <span style={{ fontSize: '10px', fontWeight: 600, color: active ? C.accentDark : C.textMuted, fontFamily: font.sans }}>{label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <FieldLabel>Receipt No.</FieldLabel>
            <input type="text" value={form.receiptNumber} onChange={e => setForm(p => ({ ...p, receiptNumber: e.target.value }))} style={inputStyle} placeholder="Optional" />
          </div>
          <div>
            <FieldLabel>Notes</FieldLabel>
            <input type="text" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={inputStyle} placeholder="Optional" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '6px' }}>
          <button type="button" onClick={onClose} style={{ padding: '12px', borderRadius: '12px', border: `1.5px solid ${C.border}`, background: C.surface, color: C.textMid, fontSize: '14px', fontWeight: 600, fontFamily: font.sans, cursor: 'pointer' }}>Cancel</button>
          <button type="submit" style={{ padding: '12px', borderRadius: '12px', border: 'none', background: C.text, color: '#fff', fontSize: '14px', fontWeight: 600, fontFamily: font.sans, cursor: 'pointer' }}>Record Payment</button>
        </div>
      </form>
    </Modal>
  )
}
