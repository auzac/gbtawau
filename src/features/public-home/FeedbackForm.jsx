import { useState } from 'react'
import { MessageSquare, Send, CheckCircle } from 'lucide-react'
import { createFeedback } from '../../services/feedback'

const CATEGORIES = [
  { value: 'General', label: 'General' },
  { value: 'Request', label: 'Request' },
  { value: 'Improvement', label: 'Improvement' },
]

export default function FeedbackForm() {
  const [form, setForm]         = useState({ name: '', category: 'General', title: '', description: '' })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError]         = useState('')
  const [sending, setSending]     = useState(false)

  const set = key => e => setForm(p => ({ ...p, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.title.trim() || !form.description.trim()) {
      setError('Please fill in all fields.')
      return
    }
    setError('')
    setSending(true)
    try {
      await createFeedback({ ...form, status: 'Open' })
      setSubmitted(true)
    } catch (err) {
      setError('Something went wrong. Please try again later.')
    } finally {
      setSending(false)
    }
  }

  if (submitted) {
    return (
      <section className="bg-[#F5EFE6] px-8 md:px-16 lg:px-24 py-20 md:py-28">
        <div className="max-w-screen-lg mx-auto">
          <div className="bg-white rounded-[2rem] p-10 md:p-16 text-center">
            <CheckCircle size={48} className="mx-auto text-green-600 mb-4" />
            <h2 style={{ fontFamily: "'Darker Grotesque', sans-serif", fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 800, marginBottom: '0.75rem' }}>
              Thank you for your feedback!
            </h2>
            <p className="text-black/60 text-base max-w-md mx-auto" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
              We appreciate your input and will review it shortly.
            </p>
            <button
              onClick={() => { setSubmitted(false); setForm({ name: '', category: 'General', title: '', description: '' }) }}
              className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-[11px] uppercase tracking-[0.18em] hover:bg-black/80 transition-colors"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Send another
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="feedback" className="bg-[#F5EFE6] px-8 md:px-16 lg:px-24 py-20 md:py-28">
      <div className="max-w-screen-lg mx-auto">
        <div className="bg-white rounded-[2rem] p-10 md:p-16">
          <div className="flex flex-col md:flex-row gap-10">
            {/* Left — copy */}
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-[0.28em] text-black/40 mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Feedback
              </p>
              <h2 style={{ fontFamily: "'Darker Grotesque', sans-serif", fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 800, lineHeight: 1.05, marginBottom: '1.25rem' }}>
                We'd love to<br />hear from you
              </h2>
              <p className="text-black/60 text-base leading-relaxed max-w-md" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
                Your thoughts help us grow. Whether it's a suggestion, a request, or just something on your mind — share it with us.
              </p>
              <div className="mt-8 hidden md:block">
                <div className="w-24 h-24 rounded-[40%_60%_50%_50%/40%_50%_60%_50%] bg-[#F5EFE6] flex items-center justify-center">
                  <MessageSquare size={36} className="text-black/40" />
                </div>
              </div>
            </div>

            {/* Right — form */}
            <form onSubmit={handleSubmit} className="flex-1 space-y-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {/* Name */}
              <div>
                <label className="block text-[11px] uppercase tracking-[0.14em] text-black/50 mb-1.5">Your name</label>
                <input
                  required
                  value={form.name}
                  onChange={set('name')}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-3 rounded-xl border border-black/10 bg-[#F5EFE6] text-sm outline-none focus:border-black/30 transition-colors"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[11px] uppercase tracking-[0.14em] text-black/50 mb-1.5">Category</label>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, category: cat.value }))}
                      className={`px-4 py-2 rounded-full text-[11px] font-semibold uppercase tracking-[0.1em] border transition-colors ${
                        form.category === cat.value
                          ? 'bg-black text-white border-black'
                          : 'bg-[#F5EFE6] text-black/60 border-black/10 hover:border-black/30'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-[11px] uppercase tracking-[0.14em] text-black/50 mb-1.5">Subject</label>
                <input
                  required
                  value={form.title}
                  onChange={set('title')}
                  placeholder="Brief title for your feedback"
                  className="w-full px-4 py-3 rounded-xl border border-black/10 bg-[#F5EFE6] text-sm outline-none focus:border-black/30 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] uppercase tracking-[0.14em] text-black/50 mb-1.5">Message</label>
                <textarea
                  required
                  value={form.description}
                  onChange={set('description')}
                  placeholder="Tell us more…"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-black/10 bg-[#F5EFE6] text-sm outline-none focus:border-black/30 transition-colors resize-none"
                />
              </div>

              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-[11px] uppercase tracking-[0.18em] hover:bg-black/80 transition-colors disabled:opacity-50"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                <Send size={14} /> {sending ? 'Sending…' : 'Send feedback'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
