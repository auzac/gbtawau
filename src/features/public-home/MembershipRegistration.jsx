import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Loader } from 'lucide-react'
import { createMemberRequest } from '../../services/memberRequests'

const GENDERS = ['Male', 'Female']
const STATUSES = ['Single', 'Married']

export default function MembershipRegistration() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '',
    dob: '', sex: 'Male', marital_status: 'Single', notes: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    setError('')
    setIsLoading(true)
    try {
      await createMemberRequest({
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
        dob: form.dob || null,
        sex: form.sex,
        marital_status: form.marital_status,
        notes: form.notes.trim() || null,
      })
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    }
    setIsLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F5EFE6] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-[2rem] p-10 md:p-12 text-center shadow-sm border border-black/5 animate-fade-in-up">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Darker Grotesque', sans-serif" }}>
            Request Submitted
          </h1>
          <p className="text-black/60 text-sm leading-relaxed mb-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Thank you for your interest in becoming a member of GBT Church. Your registration has been received and will be reviewed by our team.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white text-[11px] uppercase tracking-[0.18em] hover:bg-black/80 transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <ArrowLeft size={14} /> Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] via-[#F7F2EB] to-[#EFE7DC] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* subtle background glow */}
      <div className="absolute w-[600px] h-[600px] bg-[#C4A88B]/10 rounded-full blur-3xl top-[-200px] right-[-150px]" />
      <div className="absolute w-[500px] h-[500px] bg-[#D8C2A8]/10 rounded-full blur-3xl bottom-[-200px] left-[-150px]" />

      <div className="relative w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-white/60 p-8 md:p-10 animate-fade-in-up">

        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 w-9 h-9 rounded-full hover:bg-[#F5EFE6] flex items-center justify-center transition-colors"
          aria-label="Back to homepage"
        >
          <ArrowLeft size={16} className="text-[#8A7A6E]" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center mb-8 mt-4">
          <div className="relative mb-5">
            <div className="absolute inset-0 bg-[#C4A88B]/20 blur-xl rounded-full scale-150" />
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute w-[2px] h-10 bg-gradient-to-b from-[#C8A97E] to-[#8C6A43] rounded-full" />
              <div className="absolute w-6 h-[2px] top-[11px] bg-gradient-to-r from-[#C8A97E] to-[#8C6A43] rounded-full" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center" style={{ fontFamily: "'Darker Grotesque', sans-serif" }}>
            Membership Registration
          </h1>
          <p className="text-sm text-[#9C8E84] mt-2 text-center max-w-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Gereja Baptis Tawau
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-[11px] uppercase tracking-[0.12em] text-[#8A7A6E] mb-1.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              name="name" value={form.name} onChange={handleChange}
              placeholder="Your full name"
              disabled={isLoading}
              className="w-full px-4 py-3.5 rounded-2xl border border-[#E8DED1] bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#C4A88B]/40 focus:border-[#C4A88B]/30 text-[#2D2926] placeholder:text-[#B6AAA2] text-sm transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.12em] text-[#8A7A6E] mb-1.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Email
              </label>
              <input
                name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="email@example.com"
                disabled={isLoading}
                className="w-full px-4 py-3.5 rounded-2xl border border-[#E8DED1] bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#C4A88B]/40 focus:border-[#C4A88B]/30 text-[#2D2926] placeholder:text-[#B6AAA2] text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.12em] text-[#8A7A6E] mb-1.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Phone
              </label>
              <input
                name="phone" type="tel" value={form.phone} onChange={handleChange}
                placeholder="+60 XX-XXX XXXX"
                disabled={isLoading}
                className="w-full px-4 py-3.5 rounded-2xl border border-[#E8DED1] bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#C4A88B]/40 focus:border-[#C4A88B]/30 text-[#2D2926] placeholder:text-[#B6AAA2] text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.12em] text-[#8A7A6E] mb-1.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Address
            </label>
            <input
              name="address" value={form.address} onChange={handleChange}
              placeholder="Your home address"
              disabled={isLoading}
              className="w-full px-4 py-3.5 rounded-2xl border border-[#E8DED1] bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#C4A88B]/40 focus:border-[#C4A88B]/30 text-[#2D2926] placeholder:text-[#B6AAA2] text-sm transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.12em] text-[#8A7A6E] mb-1.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Date of Birth
              </label>
              <input
                name="dob" type="date" value={form.dob} onChange={handleChange}
                disabled={isLoading}
                className="w-full px-4 py-3.5 rounded-2xl border border-[#E8DED1] bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#C4A88B]/40 focus:border-[#C4A88B]/30 text-[#2D2926] text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.12em] text-[#8A7A6E] mb-1.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Gender
              </label>
              <select
                name="sex" value={form.sex} onChange={handleChange}
                disabled={isLoading}
                className="w-full px-4 py-3.5 rounded-2xl border border-[#E8DED1] bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#C4A88B]/40 focus:border-[#C4A88B]/30 text-[#2D2926] text-sm transition-all appearance-none"
              >
                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.12em] text-[#8A7A6E] mb-1.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Marital Status
              </label>
              <select
                name="marital_status" value={form.marital_status} onChange={handleChange}
                disabled={isLoading}
                className="w-full px-4 py-3.5 rounded-2xl border border-[#E8DED1] bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#C4A88B]/40 focus:border-[#C4A88B]/30 text-[#2D2926] text-sm transition-all appearance-none"
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.12em] text-[#8A7A6E] mb-1.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Notes <span className="text-black/30">(optional)</span>
            </label>
            <textarea
              name="notes" value={form.notes} onChange={handleChange}
              placeholder="Anything you'd like us to know..."
              rows={3}
              disabled={isLoading}
              className="w-full px-4 py-3.5 rounded-2xl border border-[#E8DED1] bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#C4A88B]/40 focus:border-[#C4A88B]/30 text-[#2D2926] placeholder:text-[#B6AAA2] text-sm transition-all resize-none"
            />
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3">
              <p className="text-red-500 text-xs">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#2D2926] hover:bg-[#433A34] text-white py-3.5 rounded-2xl font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-black/5 disabled:opacity-60"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {isLoading ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              <span className="text-[13px] tracking-[0.06em]">Submit Registration</span>
            )}
          </button>
        </form>

        <p className="text-center text-[11px] text-[#B6AAA2] mt-6 leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Your request will be reviewed by our church staff.<br />We look forward to welcoming you.
        </p>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.45s ease-out;
        }
      `}</style>
    </div>
  )
}
