// src/pages/FinanceManager.jsx
import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import {
  ArrowLeft, LogOut, DollarSign, Calendar, CheckCircle, AlertCircle,
  Search, Download, Plus, X, CreditCard, Receipt, Users, TrendingUp
} from 'lucide-react'

const C = {
  bg: '#FAF8F5',
  surface: '#FFFFFF',
  surfaceAlt: '#F5EFE6',
  border: '#EAE1D4',
  text: '#2D2926',
  textMid: '#57534E',
  textMuted: '#9A8B80',
  accent: '#C4A88B',
  accentDark: '#92622E',
  accentBg: '#FDF3E8',
}

export default function FinanceManager() {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState([])
  const [renewals, setRenewals] = useState([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [statusFilter, setStatusFilter] = useState('all') // all, paid, pending
  const [searchTerm, setSearchTerm] = useState('')
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    receiptNumber: '',
    notes: ''
  })
  const [savedMessage, setSavedMessage] = useState(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const loadData = async () => {
    setLoading(true)
    // Load members
    const { data: membersData, error: membersError } = await supabase
      .from('members')
      .select('id, name, contact_number, address')
      .order('name')
    if (membersError) console.error(membersError)
    else setMembers(membersData || [])

    // Load renewals
    const { data: renewalsData, error: renewalsError } = await supabase
      .from('membership_renewals')
      .select('*')
      .order('payment_date', { ascending: false })
    if (renewalsError) console.error(renewalsError)
    else setRenewals(renewalsData || [])

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const showSaved = (text, isError = false) => {
    setSavedMessage({ text, isError })
    setTimeout(() => setSavedMessage(null), 2500)
  }

  // Check if a member has paid for a given year
  const hasPaidForYear = (memberId, year) => {
    return renewals.some(r => r.member_id === memberId && r.renewal_year === year)
  }

  // Get last renewal date for member
  const getLastRenewal = (memberId) => {
    const memberRenewals = renewals.filter(r => r.member_id === memberId)
    if (memberRenewals.length === 0) return null
    return memberRenewals.sort((a,b) => b.renewal_year - a.renewal_year)[0]
  }

  const stats = useMemo(() => {
    const totalMembers = members.length
    const paidCount = members.filter(m => hasPaidForYear(m.id, selectedYear)).length
    const pendingCount = totalMembers - paidCount
    const totalAmount = renewals
      .filter(r => r.renewal_year === selectedYear)
      .reduce((sum, r) => sum + (r.amount_paid || 0), 0)
    return { totalMembers, paidCount, pendingCount, totalAmount }
  }, [members, renewals, selectedYear])

  const filteredMembers = useMemo(() => {
    let list = members
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      list = list.filter(m => m.name.toLowerCase().includes(q) || (m.contact_number && m.contact_number.includes(q)))
    }
    if (statusFilter === 'paid') {
      list = list.filter(m => hasPaidForYear(m.id, selectedYear))
    } else if (statusFilter === 'pending') {
      list = list.filter(m => !hasPaidForYear(m.id, selectedYear))
    }
    return list
  }, [members, searchTerm, statusFilter, selectedYear])

  const openPaymentModal = (member) => {
    setSelectedMember(member)
    setPaymentForm({
      amount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Cash',
      receiptNumber: '',
      notes: ''
    })
    setIsPaymentModalOpen(true)
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    const amount = parseFloat(paymentForm.amount)
    if (isNaN(amount) || amount <= 0) {
      showSaved('Please enter a valid amount', true)
      return
    }

    const newRenewal = {
      member_id: selectedMember.id,
      renewal_year: selectedYear,
      amount_paid: amount,
      payment_date: paymentForm.paymentDate,
      payment_method: paymentForm.paymentMethod,
      receipt_number: paymentForm.receiptNumber || null,
      notes: paymentForm.notes || null
    }

    const { error } = await supabase.from('membership_renewals').insert(newRenewal)
    if (error) {
      if (error.code === '23505') { // duplicate key
        showSaved(`Renewal for ${selectedMember.name} (${selectedYear}) already recorded`, true)
      } else {
        showSaved('Error recording payment', true)
        console.error(error)
      }
    } else {
      showSaved(`Renewal recorded for ${selectedMember.name} (${selectedYear})`)
      await loadData()
      setIsPaymentModalOpen(false)
    }
  }

  const exportCSV = () => {
    const headers = ['Name', 'Contact', 'Status', 'Last Renewal Year', 'Last Payment Date', 'Amount Paid (Current Year)']
    const rows = filteredMembers.map(m => {
      const paid = hasPaidForYear(m.id, selectedYear)
      const lastRenewal = getLastRenewal(m.id)
      const currentYearPayment = renewals.find(r => r.member_id === m.id && r.renewal_year === selectedYear)
      return [
        `"${m.name}"`,
        m.contact_number || '',
        paid ? 'Paid' : 'Pending',
        lastRenewal ? lastRenewal.renewal_year : '—',
        lastRenewal ? lastRenewal.payment_date : '—',
        currentYearPayment ? currentYearPayment.amount_paid : '—'
      ]
    })
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `membership_renewals_${selectedYear}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showSaved('Exported successfully')
  }

  const years = [new Date().getFullYear(), new Date().getFullYear() + 1, new Date().getFullYear() - 1]

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '50%', border: `3px solid ${C.border}`, borderTopColor: C.accent, animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      {savedMessage && (
        <div style={{ position: 'fixed', top: '76px', left: '50%', transform: 'translateX(-50%)', zIndex: 200, animation: 'slideDown 0.2s ease-out' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '99px',
            background: savedMessage.isError ? '#DC2626' : C.text, color: '#fff', fontSize: '13px',
            fontFamily: "'DM Sans', sans-serif", boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            {savedMessage.isError ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
            {savedMessage.text}
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button onClick={() => navigate('/staff')} style={{ width: '36px', height: '36px', borderRadius: '50%', border: `1.5px solid ${C.border}`, background: C.surfaceAlt, cursor: 'pointer' }}>
              <ArrowLeft size={16} style={{ color: C.textMid }} />
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: C.text, fontFamily: "'Lora', serif" }}>Finance</h1>
              <p style={{ margin: 0, fontSize: '11px', color: C.textMuted }}>Membership Renewals</p>
            </div>
          </div>
          <button onClick={signOut} style={{ padding: '8px 14px', borderRadius: '99px', border: `1.5px solid ${C.border}`, background: C.surface, cursor: 'pointer', fontSize: '13px', color: C.textMid }}>
            <LogOut size={13} /> {!isMobile && 'Sign out'}
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '20px 16px' : '28px', display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
        {/* Sidebar stats (desktop) */}
        {!isMobile && (
          <aside style={{ width: '280px', flexShrink: 0, position: 'sticky', top: '84px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <StatCard icon={Users} label="Total Members" value={stats.totalMembers} dark />
              <StatCard icon={CheckCircle} label="Paid" value={stats.paidCount} sub={`${Math.round((stats.paidCount/stats.totalMembers)*100)}%`} dark />
              <StatCard icon={AlertCircle} label="Pending" value={stats.pendingCount} dark />
              <StatCard icon={DollarSign} label="Total Collected" value={`RM ${stats.totalAmount.toFixed(2)}`} dark />
            </div>
            <button onClick={exportCSV} style={{ marginTop: '20px', ...btnSecondary, width: '100%', borderRadius: '12px', padding: '11px' }}>
              <Download size={14} /> Export CSV
            </button>
          </aside>
        )}

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Mobile stats */}
          {isMobile && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              <StatCard icon={Users} label="Total" value={stats.totalMembers} dark />
              <StatCard icon={CheckCircle} label="Paid" value={stats.paidCount} dark />
              <StatCard icon={AlertCircle} label="Pending" value={stats.pendingCount} dark />
              <StatCard icon={DollarSign} label="Total RM" value={`RM ${stats.totalAmount.toFixed(2)}`} dark />
            </div>
          )}

          {/* Filter bar */}
          <div style={{ background: C.surface, borderRadius: '18px', border: `1.5px solid ${C.border}`, overflow: 'hidden', marginBottom: '20px' }}>
            <div style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} style={{ ...inputStyle, width: 'auto', padding: '8px 12px' }}>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...inputStyle, width: 'auto', padding: '8px 12px' }}>
                  <option value="all">All</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>
                <div style={{ position: 'relative' }}>
                  <input type="text" placeholder="Search name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ ...inputStyle, paddingLeft: '32px', width: isMobile ? '140px' : '220px' }} />
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: C.textMuted }} />
                </div>
              </div>
              {isMobile && (
                <button onClick={exportCSV} style={{ ...btnSecondary, padding: '8px 12px' }}><Download size={14} /></button>
              )}
            </div>
          </div>

          {/* Members table */}
          <div style={{ background: C.surface, borderRadius: '18px', border: `1.5px solid ${C.border}`, overflow: 'hidden' }}>
            {isMobile ? (
              <div>
                {filteredMembers.map((member, idx) => {
                  const paid = hasPaidForYear(member.id, selectedYear)
                  const lastRenewal = getLastRenewal(member.id)
                  return (
                    <div key={member.id} style={{ borderTop: idx === 0 ? 'none' : `1px solid ${C.border}`, padding: '14px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, color: C.text, fontFamily: "'Lora', serif" }}>{member.name}</p>
                          <p style={{ margin: '4px 0 0', fontSize: '12px', color: C.textMuted }}>{member.contact_number || '—'}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: paid ? '#E6F7E6' : '#FFF3E3', color: paid ? '#2E7D32' : '#B85C00' }}>
                            {paid ? 'Paid' : 'Pending'}
                          </span>
                        </div>
                      </div>
                      {lastRenewal && (
                        <p style={{ margin: '6px 0 0', fontSize: '11px', color: C.textMuted }}>Last paid: {lastRenewal.payment_date} (RM {lastRenewal.amount_paid})</p>
                      )}
                      <button onClick={() => openPaymentModal(member)} style={{ ...btnPrimary, marginTop: '10px', width: '100%', padding: '8px' }} disabled={paid}>
                        {paid ? 'Renewal Recorded' : 'Record Payment'}
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: C.surfaceAlt }}>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Contact</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Last Renewal</th>
                    <th style={thStyle}>Amount (Current Year)</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map(member => {
                    const paid = hasPaidForYear(member.id, selectedYear)
                    const lastRenewal = getLastRenewal(member.id)
                    const currentPayment = renewals.find(r => r.member_id === member.id && r.renewal_year === selectedYear)
                    return (
                      <tr key={member.id} style={{ borderTop: `1px solid ${C.border}` }}>
                        <td style={tdStyle}>{member.name}</td>
                        <td style={tdStyle}>{member.contact_number || '—'}</td>
                        <td style={tdStyle}>
                          <span style={{ padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: paid ? '#E6F7E6' : '#FFF3E3', color: paid ? '#2E7D32' : '#B85C00' }}>
                            {paid ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                        <td style={tdStyle}>{lastRenewal ? `${lastRenewal.renewal_year} · ${lastRenewal.payment_date}` : '—'}</td>
                        <td style={tdStyle}>{currentPayment ? `RM ${currentPayment.amount_paid}` : '—'}</td>
                        <td style={tdStyle}>
                          <button onClick={() => openPaymentModal(member)} disabled={paid} style={{ ...btnPrimary, padding: '6px 14px', fontSize: '12px', opacity: paid ? 0.6 : 1 }}>
                            {paid ? 'Renewed' : 'Record Payment'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
            {filteredMembers.length === 0 && (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: C.textMuted }}>No members match your filters.</div>
            )}
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isPaymentModalOpen && selectedMember && (
        <ModalShell title={`Record Membership Renewal – ${selectedMember.name}`} onClose={() => setIsPaymentModalOpen(false)} isMobile={isMobile}>
          <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <FieldLabel>Amount (RM) *</FieldLabel>
              <input type="number" step="0.01" value={paymentForm.amount} onChange={(e) => setPaymentForm(p => ({ ...p, amount: e.target.value }))} required className="mm-input" />
            </div>
            <div>
              <FieldLabel>Payment Date *</FieldLabel>
              <input type="date" value={paymentForm.paymentDate} onChange={(e) => setPaymentForm(p => ({ ...p, paymentDate: e.target.value }))} required className="mm-input" />
            </div>
            <div>
              <FieldLabel>Payment Method</FieldLabel>
              <select value={paymentForm.paymentMethod} onChange={(e) => setPaymentForm(p => ({ ...p, paymentMethod: e.target.value }))} className="mm-input">
                <option>Cash</option>
                <option>Bank Transfer</option>
                <option>Online</option>
                <option>Cheque</option>
              </select>
            </div>
            <div>
              <FieldLabel>Receipt Number (optional)</FieldLabel>
              <input type="text" value={paymentForm.receiptNumber} onChange={(e) => setPaymentForm(p => ({ ...p, receiptNumber: e.target.value }))} className="mm-input" />
            </div>
            <div>
              <FieldLabel>Notes</FieldLabel>
              <textarea rows={2} value={paymentForm.notes} onChange={(e) => setPaymentForm(p => ({ ...p, notes: e.target.value }))} className="mm-input" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
              <button type="button" onClick={() => setIsPaymentModalOpen(false)} style={btnSecondaryFull}>Cancel</button>
              <button type="submit" style={btnPrimaryFull}>Record Payment</button>
            </div>
          </form>
        </ModalShell>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideDown { from { opacity: 0; transform: translate(-50%, -10px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .mm-input { width: 100%; padding: 10px 12px; border: 1.5px solid ${C.border}; border-radius: 10px; font-size: 14px; background: ${C.surface}; color: ${C.text}; outline: none; transition: all 0.15s; box-sizing: border-box; font-family: 'DM Sans', sans-serif; }
        .mm-input:focus { border-color: ${C.accentDark}; box-shadow: 0 0 0 3px ${C.accentBg}; }
      `}</style>
    </div>
  )
}

// ─── Helper Components (same style as MemberManager) ──────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, dark }) => (
  <div style={{ background: dark ? C.text : C.surface, border: `1.5px solid ${dark ? C.text : C.border}`, borderRadius: '16px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: dark ? '#78716C' : C.textMuted }}>{label}</span>
      {Icon && <Icon size={13} style={{ color: dark ? '#78716C' : C.accent }} />}
    </div>
    <span style={{ fontSize: '30px', fontWeight: 700, lineHeight: 1, color: dark ? '#FFFFFF' : C.text, fontFamily: "'Lora', serif", fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    {sub && <span style={{ fontSize: '11px', color: dark ? '#78716C' : C.textMuted }}>{sub}</span>}
  </div>
)

const FieldLabel = ({ children }) => (
  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: C.textMuted, marginBottom: '6px', fontFamily: "'DM Sans', sans-serif" }}>{children}</label>
)

const ModalShell = ({ title, onClose, isMobile, children }) => {
  const overlayStyle = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', zIndex: 100, backdropFilter: 'blur(2px)',
    ...(isMobile ? { alignItems: 'flex-end', justifyContent: 'center' } : { alignItems: 'center', justifyContent: 'center', padding: '24px' })
  }
  const panelStyle = {
    background: C.surface, width: '100%', overflowY: 'auto',
    ...(isMobile ? { borderRadius: '24px 24px 0 0', maxHeight: '88vh', paddingBottom: 'env(safe-area-inset-bottom,16px)' } : { borderRadius: '20px', maxWidth: '500px', maxHeight: '85vh', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' })
  }
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={e => e.stopPropagation()}>
        {isMobile && <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}><div style={{ width: '40px', height: '4px', borderRadius: '99px', background: C.border }} /></div>}
        <div style={{ padding: isMobile ? '8px 20px 16px' : '24px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: isMobile ? '20px' : '22px', fontWeight: 700, color: C.text, fontFamily: "'Lora', serif" }}>{title}</h2>
          <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '50%', border: `1.5px solid ${C.border}`, background: C.surfaceAlt, cursor: 'pointer' }}><X size={15} /></button>
        </div>
        <div style={{ height: '1px', background: C.border }} />
        <div style={{ padding: isMobile ? '16px 20px 8px' : '20px 24px 24px' }}>{children}</div>
      </div>
    </div>
  )
}

const btnBase = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px', borderRadius: '99px', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', border: 'none' }
const btnPrimary = { ...btnBase, padding: '10px 18px', fontSize: '14px', background: C.text, color: '#fff' }
const btnSecondary = { ...btnBase, padding: '10px 18px', fontSize: '14px', background: C.surface, color: C.textMid, border: `1.5px solid ${C.border}` }
const btnPrimaryFull = { ...btnPrimary, width: '100%', padding: '13px', borderRadius: '12px', fontSize: '15px' }
const btnSecondaryFull = { ...btnSecondary, width: '100%', padding: '13px', borderRadius: '12px', fontSize: '15px' }
const thStyle = { padding: '12px 16px', textAlign: 'left', fontSize: '10px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: C.textMid, fontFamily: "'DM Sans', sans-serif" }
const tdStyle = { padding: '12px 16px', fontSize: '13px', color: C.textMid, fontFamily: "'DM Sans', sans-serif" }
const inputStyle = { background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: '10px', fontSize: '14px', padding: '8px 12px', fontFamily: "'DM Sans', sans-serif", color: C.text }