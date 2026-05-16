import React from 'react'
import ModalShell from '../ui/ModalShell'

function CalendarModal({ preview, onClose }) {
  return (
    <ModalShell
      title="Content Calendar"
      onClose={onClose}
      maxWidth="max-w-3xl"
    >
      {!preview ? (
        <p className="text-[#8A7A6E] text-sm">
          No preview available.
        </p>
      ) : (
        <div className="space-y-5">
          <div className="border border-[#EAE1D4] rounded-2xl p-5">
            <p className="font-medium text-[#2D2926] mb-2">
              Weekly Verse
            </p>

            <p className="font-serif text-lg text-[#2D2926]">
              {preview.verse.reference}
            </p>

            <p className="text-sm text-[#7A6A5E] mt-2">
              {preview.verse.text}
            </p>
          </div>

          <div className="border border-[#EAE1D4] rounded-2xl p-5">
            <p className="font-medium text-[#2D2926] mb-3">
              Events
            </p>

            <div className="space-y-2">
              {preview.events.map(event => (
                <div key={event.id} className="text-sm text-[#7A6A5E]">
                  {event.date} — {event.titleEn}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </ModalShell>
  )
}

export default CalendarModal