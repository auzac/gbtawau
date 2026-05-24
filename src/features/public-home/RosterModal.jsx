// src/features/public-home/RosterModal.jsx
import { X, ChevronDown, User, Users } from 'lucide-react'

export default function RosterModal({ isOpen, onClose, t, availableMonths, selectedMonth, onMonthChange, selectedWeek, onWeekChange, rosterForSelectedWeek }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-black/5">
          <h2 style={{ fontFamily: "'Darker Grotesque', sans-serif", fontSize: '1.5rem', fontWeight: 700 }}>
            {t('roster_modal_title') || 'Service Roster'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-black/5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <div className="mb-5">
            <label className="block text-[10px] uppercase tracking-[0.22em] text-black/40 mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>{t('roster_month') || 'Month'}</label>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => onMonthChange(e.target.value)}
                className="w-full appearance-none bg-[#F5EFE6] border-none rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-1 focus:ring-black/20"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {availableMonths.length === 0 && <option disabled>{t('roster_no_data') || 'No data'}</option>}
                {availableMonths.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none" />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-[10px] uppercase tracking-[0.22em] text-black/40 mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>{t('roster_week') || 'Week'}</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(w => (
                <button
                  key={w}
                  onClick={() => onWeekChange(w)}
                  className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${selectedWeek === w ? 'bg-black text-white' : 'bg-[#F5EFE6] text-black/60 hover:bg-black/5'}`}
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-[#F5EFE6] rounded-xl p-5">
            {rosterForSelectedWeek ? (
              <div className="space-y-4">
                {[
                  { icon: <User size={16} />, label: t('roster_leader') || 'Leader', value: rosterForSelectedWeek.leader },
                  { icon: <Users size={16} />, label: t('roster_pianist') || 'Pianist', value: rosterForSelectedWeek.pianist },
                  { icon: <User size={16} />, label: t('roster_reader') || 'Reader', value: rosterForSelectedWeek.reader },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <span className="text-black/30 mt-0.5">{icon}</span>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-black/40 mb-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>{label}</p>
                      <p className="font-medium" style={{ fontFamily: "'Darker Grotesque', sans-serif", fontSize: '1.05rem' }}>{value || '—'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-black/30 py-6 text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>{t('roster_no_data') || 'No roster for this week'}</p>
            )}
          </div>
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
