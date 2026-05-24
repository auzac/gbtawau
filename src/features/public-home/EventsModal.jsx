// src/features/public-home/EventsModal.jsx
import { X, Calendar, Clock, MapPinned, User, ChevronRight, ArrowLeft } from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatTimeForDisplay = (time24) => {
  if (!time24) return ''
  const [hour, minute] = time24.split(':')
  const h = parseInt(hour)
  const period = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${minute} ${period}`
}

const formatEventDate = (dateStr) => {
  if (!dateStr) return { day: '', month: '', dayName: '' }
  const date = new Date(dateStr)
  return {
    day: date.getDate(),
    month: date.toLocaleString('default', { month: 'short' }),
    dayName: date.toLocaleString('default', { weekday: 'long' }),
  }
}

export default function EventsModal({ isOpen, onClose, events, selectedEvent, onSelectEvent, onBack, t, locale }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-black/5">
          <h2 style={{ fontFamily: "'Darker Grotesque', sans-serif", fontSize: '1.5rem', fontWeight: 700 }}>
            {selectedEvent ? (t('event_details_title') || 'Event Details') : (t('events_modal_title') || 'Upcoming Events')}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-black/5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {!selectedEvent ? (
            events.length === 0
              ? <p className="text-center text-black/40 py-10" style={{ fontFamily: "'DM Sans', sans-serif" }}>{t('no_events') || 'No upcoming events'}</p>
              : (
                <div className="space-y-3">
                  {events.map(event => {
                    if (!event) return null
                    const { day, month, dayName } = formatEventDate(event.date)
                    const title = (locale === 'bm' && event.title_bm) ? event.title_bm : (event.title_en || 'Untitled')
                    return (
                      <button
                        key={event.id}
                        onClick={() => onSelectEvent(event)}
                        className="w-full text-left bg-[#F5EFE6] rounded-xl p-4 flex items-center gap-4 hover:bg-[#ede6da] transition-colors"
                      >
                        <div className="min-w-[56px] text-center">
                          <div style={{ fontFamily: "'Darker Grotesque', sans-serif", fontSize: '1.8rem', fontWeight: 700 }}>{day}</div>
                          <div className="text-[10px] uppercase tracking-[0.18em] text-black/40" style={{ fontFamily: "'DM Sans', sans-serif" }}>{month}</div>
                        </div>
                        <div className="flex-1">
                          <p style={{ fontFamily: "'Darker Grotesque', sans-serif", fontWeight: 600, fontSize: '1.05rem' }}>{title}</p>
                          <p className="text-xs text-black/40 mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>{dayName} · {formatTimeForDisplay(event.time)}</p>
                        </div>
                        <ChevronRight size={16} className="text-black/30 shrink-0" />
                      </button>
                    )
                  })}
                </div>
              )
          ) : (
            <div>
              <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-black/40 hover:text-black mb-5 transition-colors" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <ArrowLeft size={14} /> {t('events_modal_back') || 'Back'}
              </button>
              <div className="bg-[#F5EFE6] rounded-xl p-6 space-y-4">
                <h3 style={{ fontFamily: "'Darker Grotesque', sans-serif", fontSize: '1.6rem', fontWeight: 700 }}>
                  {locale === 'bm' && selectedEvent.title_bm ? selectedEvent.title_bm : (selectedEvent.title_en || 'Untitled')}
                </h3>
                <div className="space-y-3 text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  <div className="flex items-center gap-3 text-black/60"><Calendar size={16} /><span>{new Date(selectedEvent.date).toLocaleDateString(locale === 'bm' ? 'ms-MY' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                  {selectedEvent.time && <div className="flex items-center gap-3 text-black/60"><Clock size={16} /><span>{formatTimeForDisplay(selectedEvent.time)}</span></div>}
                  {selectedEvent.location && <div className="flex items-center gap-3 text-black/60"><MapPinned size={16} /><span>{selectedEvent.location}</span></div>}
                  <div className="flex items-center gap-3 text-black/60"><User size={16} /><span>{selectedEvent.pic || selectedEvent.contact_person || 'Church Office'}</span></div>
                  {(selectedEvent.description_en || selectedEvent.description_bm) && (
                    <div className="pt-3 border-t border-black/10">
                      <p className="text-black/60 leading-relaxed">{locale === 'bm' && selectedEvent.description_bm ? selectedEvent.description_bm : selectedEvent.description_en}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-5 border-t border-black/5 flex justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-full bg-black text-white text-[11px] uppercase tracking-[0.18em] hover:bg-black/80 transition-colors" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {t('events_modal_close') || 'Close'}
          </button>
        </div>
      </div>
    </div>
  )
}
