// src/features/finance/FinanceManager.jsx
import React, { useState, useEffect, useMemo } from 'react'
import { fetchMembersForFinance, fetchRenewals, createRenewal } from '../../services/finance'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Toast from '../../components/ui/Toast'
import useIsMobile from '../../hooks/useIsMobile'
import { useToast } from '../../hooks/useToast'
import StaffLayout from '../../components/layout/StaffLayout'
import {
  CheckCircle, Search, Download
} from 'lucide-react'
import DonutChart from './DonutChart'
import MiniStat from './MiniStat'
import PaymentModal from './PaymentModal'

// ─── Design tokens ────────────────────────────────────────────────────────────
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
  paidBg:      '#F0FAF0',
  paidText:    '#2E7D32',
  paidBorder:  '#C8E6C9',
  pendBg:      '#FFF8F0',
  pendText:    '#B45309',
  pendBorder:  '#FDDCAA',
}

// ─── Shared style atoms ───────────────────────────────────────────────────────
const font = { serif: "'Lora', serif", sans: "'DM Sans', sans-serif" }
const inputStyle = {
  width: '100%', padding: '10px 12px',
  border: `1.5px solid ${C.border}`, borderRadius: '10px',
  fontSize: '14px', background: C.surface, color: C.text,
  outline: 'none', boxSizing: 'border-box', fontFamily: font.sans,
}
const thStyle = {
  padding: '11px 16px', textAlign: 'left',
  fontSize: '10px', fontWeight: 700, letterSpacing: '0.09em',
  textTransform: 'uppercase', color: C.textMuted, fontFamily: font.sans,
  whiteSpace: 'nowrap',
}
const tdStyle = {
  padding: '13px 16px', fontSize: '13px',
  color: C.textMid, fontFamily: font.sans, verticalAlign: 'middle',
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function FinanceManager() {

  const [loading,            setLoading]            = useState(true)
  const [members,            setMembers]            = useState([])
  const [renewals,           setRenewals]           = useState([])
  const [selectedYear,       setSelectedYear]       = useState(new Date().getFullYear())
  const [statusFilter,       setStatusFilter]       = useState('all')
  const [searchTerm,         setSearchTerm]         = useState('')
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedMember,     setSelectedMember]     = useState(null)
  const [paymentForm,        setPaymentForm]        = useState({
    amount: '', paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash', receiptNumber: '', notes: '',
  })
  const isMobile = useIsMobile()
  const { toast: savedMessage, showToast: showSaved } = useToast()

  const loadData = async () => {
    setLoading(true)
    try {
      const [md, rd] = await Promise.all([fetchMembersForFinance(), fetchRenewals()])
      setMembers(md || [])
      setRenewals(rd || [])
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const hasPaidForYear  = (id, yr) => renewals.some(r => r.member_id === id && r.renewal_year === yr)
  const getLastRenewal  = (id)     => renewals.filter(r => r.member_id === id).sort((a, b) => b.renewal_year - a.renewal_year)[0] ?? null

  const stats = useMemo(() => {
    const total   = members.length
    const paid    = members.filter(m => hasPaidForYear(m.id, selectedYear)).length
    const pending = total - paid
    const amount  = renewals.filter(r => r.renewal_year === selectedYear).reduce((s, r) => s + (r.amount_paid || 0), 0)
    const pct     = total ? Math.round((paid / total) * 100) : 0
    return { total, paid, pending, amount, pct }
  }, [members, renewals, selectedYear])

  const filteredMembers = useMemo(() => {
    let list = members
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      list = list.filter(m => m.name.toLowerCase().includes(q) || (m.contact_number || '').includes(q))
    }
    if (statusFilter === 'paid')    list = list.filter(m =>  hasPaidForYear(m.id, selectedYear))
    if (statusFilter === 'pending') list = list.filter(m => !hasPaidForYear(m.id, selectedYear))
    return [...list].sort((a, b) => {
      const ap = hasPaidForYear(a.id, selectedYear) ? 1 : 0
      const bp = hasPaidForYear(b.id, selectedYear) ? 1 : 0
      return ap - bp || a.name.localeCompare(b.name)
    })
  }, [members, searchTerm, statusFilter, selectedYear, renewals])

  const openPaymentModal = (member) => {
    setSelectedMember(member)
    setPaymentForm({ amount: '', paymentDate: new Date().toISOString().split('T')[0], paymentMethod: 'Cash', receiptNumber: '', notes: '' })
    setIsPaymentModalOpen(true)
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    const amount = parseFloat(paymentForm.amount)
    if (isNaN(amount) || amount <= 0) { showSaved('Enter a valid amount', true); return }
    try {
      await createRenewal({
        member_id: selectedMember.id, renewal_year: selectedYear,
        amount_paid: amount, payment_date: paymentForm.paymentDate,
        payment_method: paymentForm.paymentMethod,
        receipt_number: paymentForm.receiptNumber || null,
        notes: paymentForm.notes || null,
      })
      showSaved(`Renewal recorded — ${selectedMember.name}`)
      await loadData()
      setIsPaymentModalOpen(false)
    } catch { showSaved('Error recording payment', true) }
  }

  const exportCSV = () => {
    const rows = filteredMembers.map(m => {
      const paid = hasPaidForYear(m.id, selectedYear)
      const last = getLastRenewal(m.id)
      const cur  = renewals.find(r => r.member_id === m.id && r.renewal_year === selectedYear)
      return [`"${m.name}"`, m.contact_number || '', paid ? 'Paid' : 'Pending', last?.renewal_year ?? '—', last?.payment_date ?? '—', cur?.amount_paid ?? '—'].join(',')
    })
    const csv  = [['Name','Contact','Status','Last Year','Last Date','Amount'].join(','), ...rows].join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement('a'), { href: url, download: `renewals_${selectedYear}.csv` })
    a.click(); URL.revokeObjectURL(url)
    showSaved('Exported')
  }

  const years = [new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1]

  // ── Loading screen ──────────────────────────────────────────────────────────
  if (loading) return <LoadingSpinner />

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <StaffLayout title="Finance" subtitle={`Membership Renewals · ${selectedYear}`} rightActions={
      isMobile ? (
        <button onClick={exportCSV} style={{ width: '34px', height: '34px', borderRadius: '50%', border: `1.5px solid ${C.border}`, background: C.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Download size={14} color={C.textMid} />
        </button>
      ) : null
    }>
      {savedMessage && <Toast message={savedMessage.text} isError={savedMessage.isError} />}

      {/* ── Mobile stat strip ── */}
      {isMobile && (
        <div style={{ overflowX: 'auto', padding: '14px 16px 2px', display: 'flex', gap: '10px', scrollbarWidth: 'none' }}>
          <MiniStat label="Members" value={stats.total}  />
          <MiniStat label="Paid"    value={stats.paid}   hi />
          <MiniStat label="Pending" value={stats.pending} />
          <MiniStat label={`RM ${selectedYear}`} value={`${stats.amount.toFixed(0)}`} />
          <MiniStat label="Rate"    value={`${stats.pct}%`} />
        </div>
      )}

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '12px 16px 80px' : '28px', display: 'flex', gap: '28px', alignItems: 'flex-start' }}>

        {/* ── Desktop sidebar ── */}
        {!isMobile && (
          <aside style={{ width: '260px', flexShrink: 0, position: 'sticky', top: '84px' }}>
            {/* Donut card */}
            <div style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: '18px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <DonutChart pct={stats.pct} />
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: `1px solid ${C.border}` }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, fontFamily: font.sans }}>Paid</div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: C.paidText, fontFamily: font.serif }}>{stats.paid}</div>
                </div>
                <div style={{ width: '1px', background: C.border }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, fontFamily: font.sans }}>Pending</div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: C.pendText, fontFamily: font.serif }}>{stats.pending}</div>
                </div>
                <div style={{ width: '1px', background: C.border }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, fontFamily: font.sans }}>Total</div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: C.text, fontFamily: font.serif }}>{stats.total}</div>
                </div>
              </div>
            </div>

            {/* Collected card */}
            <div style={{ background: C.text, borderRadius: '18px', padding: '18px', marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#78716C', fontFamily: font.sans, marginBottom: '6px' }}>Collected · {selectedYear}</div>
              <div style={{ fontSize: '26px', fontWeight: 600, color: '#fff', fontFamily: font.serif, fontVariantNumeric: 'tabular-nums' }}>RM {stats.amount.toFixed(2)}</div>
            </div>

            {/* Year picker */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, fontFamily: font.sans, marginBottom: '6px' }}>Year</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {years.map(y => (
                  <button key={y} onClick={() => setSelectedYear(y)} style={{ flex: 1, padding: '8px 0', borderRadius: '10px', border: `1.5px solid ${selectedYear === y ? C.accentDark : C.border}`, background: selectedYear === y ? C.accentBg : C.surface, color: selectedYear === y ? C.accentDark : C.textMid, fontSize: '13px', fontWeight: 600, fontFamily: font.sans, cursor: 'pointer' }}>
                    {y}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={exportCSV} style={{ width: '100%', padding: '11px', borderRadius: '12px', border: `1.5px solid ${C.border}`, background: C.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', fontSize: '13px', fontWeight: 600, color: C.textMid, fontFamily: font.sans }}>
              <Download size={14} /> Export CSV
            </button>
          </aside>
        )}

        {/* ── Main panel ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Filter bar */}
          <div style={{ background: C.surface, borderRadius: '16px', border: `1.5px solid ${C.border}`, padding: '12px 14px', marginBottom: '14px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {isMobile && (
              <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} style={{ ...inputStyle, width: 'auto', padding: '7px 10px', fontSize: '13px' }}>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            )}
            <div style={{ display: 'flex', gap: '4px', background: C.bg, borderRadius: '10px', padding: '3px' }}>
              {[['all','All'], ['pending','Pending'], ['paid','Paid']].map(([val, lbl]) => (
                <button key={val} onClick={() => setStatusFilter(val)} style={{ padding: '5px 12px', borderRadius: '8px', border: 'none', background: statusFilter === val ? C.surface : 'transparent', color: statusFilter === val ? C.text : C.textMuted, fontSize: '12px', fontWeight: 600, fontFamily: font.sans, cursor: 'pointer', boxShadow: statusFilter === val ? `0 1px 3px rgba(0,0,0,0.08)` : 'none' }}>
                  {lbl}
                </button>
              ))}
            </div>
            <div style={{ flex: 1, minWidth: isMobile ? '100px' : '160px', position: 'relative' }}>
              <input
                type="text" placeholder="Search…" value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ ...inputStyle, padding: '7px 10px 7px 30px', fontSize: '13px' }}
              />
              <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: C.textMuted, pointerEvents: 'none' }} />
            </div>
            <span style={{ fontSize: '12px', color: C.textMuted, fontFamily: font.sans, whiteSpace: 'nowrap' }}>{filteredMembers.length} members</span>
          </div>

          {/* ── Member list ── */}
          {filteredMembers.length === 0 ? (
            <div style={{ padding: '56px 24px', textAlign: 'center', color: C.textMuted, fontFamily: font.sans, fontSize: '14px' }}>No members match your filters.</div>
          ) : isMobile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredMembers.map(member => {
                const paid  = hasPaidForYear(member.id, selectedYear)
                const last  = getLastRenewal(member.id)
                const cur   = renewals.find(r => r.member_id === member.id && r.renewal_year === selectedYear)
                return (
                  <div key={member.id} style={{ background: paid ? C.paidBg : C.surface, border: `1.5px solid ${paid ? C.paidBorder : C.border}`, borderRadius: '14px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: paid ? '#C8E6C9' : C.pendBorder, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: paid ? C.paidText : C.pendText, fontFamily: font.serif }}>
                      {member.name.split(' ').map(w => w[0]).slice(0,2).join('')}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: C.text, fontFamily: font.serif, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.name}</div>
                      <div style={{ fontSize: '11px', color: C.textMuted, fontFamily: font.sans, marginTop: '2px' }}>
                        {paid
                          ? `Paid ${cur?.payment_date ?? ''} · RM ${cur?.amount_paid ?? ''}`
                          : last ? `Last: ${last.renewal_year}` : 'No record'}
                      </div>
                    </div>
                    {paid ? (
                      <CheckCircle size={20} color={C.paidText} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                    ) : (
                      <button
                        onClick={() => openPaymentModal(member)}
                        style={{ flexShrink: 0, width: '32px', height: '32px', borderRadius: '50%', border: `1.5px solid ${C.accentDark}`, background: C.accentBg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        aria-label={`Record payment for ${member.name}`}
                      >
                        <span style={{ fontSize: '18px', lineHeight: 1, color: C.accentDark, fontWeight: 300, marginTop: '-1px' }}>+</span>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ background: C.surface, borderRadius: '18px', border: `1.5px solid ${C.border}`, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: C.surfaceAlt }}>
                    <th style={thStyle}>Member</th>
                    <th style={thStyle}>Contact</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Last Renewal</th>
                    <th style={thStyle}>Amount ({selectedYear})</th>
                    <th style={thStyle}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member, idx) => {
                    const paid = hasPaidForYear(member.id, selectedYear)
                    const last = getLastRenewal(member.id)
                    const cur  = renewals.find(r => r.member_id === member.id && r.renewal_year === selectedYear)
                    return (
                      <tr key={member.id} style={{ borderTop: `1px solid ${C.border}`, background: paid ? C.paidBg : 'transparent', transition: 'background 0.15s' }}
                          onMouseEnter={e => { if (!paid) e.currentTarget.style.background = C.surfaceAlt }}
                          onMouseLeave={e => { e.currentTarget.style.background = paid ? C.paidBg : 'transparent' }}>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: paid ? '#C8E6C9' : C.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: paid ? C.paidText : C.textMid, fontFamily: font.serif, flexShrink: 0 }}>
                              {member.name.split(' ').map(w => w[0]).slice(0,2).join('')}
                            </div>
                            <span style={{ color: C.text, fontFamily: font.serif, fontWeight: 500 }}>{member.name}</span>
                          </div>
                        </td>
                        <td style={tdStyle}>{member.contact_number || '—'}</td>
                        <td style={tdStyle}>
                          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, fontFamily: font.sans, background: paid ? C.paidBg : C.pendBg, color: paid ? C.paidText : C.pendText, border: `1px solid ${paid ? C.paidBorder : C.pendBorder}` }}>
                            {paid ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, color: C.textMuted }}>{last ? `${last.renewal_year} · ${last.payment_date}` : '—'}</td>
                        <td style={{ ...tdStyle, fontVariantNumeric: 'tabular-nums' }}>{cur ? `RM ${cur.amount_paid}` : '—'}</td>
                        <td style={tdStyle}>
                          {!paid ? (
                            <button onClick={() => openPaymentModal(member)} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: '99px', border: `1.5px solid ${C.accentDark}`, background: C.accentBg, color: C.accentDark, fontSize: '12px', fontWeight: 600, fontFamily: font.sans, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                              Record Payment
                            </button>
                          ) : (
                            <span style={{ color: C.textMuted, fontSize: '12px', fontFamily: font.sans }}>—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Payment Modal ── */}
      {isPaymentModalOpen && selectedMember && (
        <PaymentModal
          isOpen
          onClose={() => setIsPaymentModalOpen(false)}
          member={selectedMember}
          year={selectedYear}
          form={paymentForm}
          setForm={setPaymentForm}
          onSubmit={handlePaymentSubmit}
          isMobile={isMobile}
        />
      )}

    </StaffLayout>
  )
}
