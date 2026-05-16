import React from 'react'
import ModalShell from '../ui/ModalShell'
import Button from '../ui/Button'

function HistoryModal({
  type,
  entries,
  onClose,
  onRestore
}) {
  return (
    <ModalShell
      title={type === 'verse' ? 'Verse History' : 'Roster History'}
      onClose={onClose}
      maxWidth="max-w-3xl"
    >
      {entries.length === 0 ? (
        <p className="text-center text-[#8A7A6E] py-10">
          No history available.
        </p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="border border-[#EAE1D4] rounded-2xl p-4"
            >
              <div className="flex justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs text-[#8A7A6E] mb-2">
                    {new Date(entry.savedAt).toLocaleString()}
                  </p>

                  {type === 'verse' ? (
                    <>
                      <p className="font-medium text-[#2D2926]">
                        {entry.reference}
                      </p>

                      <p className="text-sm text-[#7A6A5E] mt-1">
                        {entry.text}
                      </p>
                    </>
                  ) : (
                    <div className="grid sm:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-[#8A7A6E]">Leader:</span> {entry.leader}
                      </div>

                      <div>
                        <span className="text-[#8A7A6E]">Pianist:</span> {entry.pianist}
                      </div>

                      <div>
                        <span className="text-[#8A7A6E]">Reader:</span> {entry.reader}
                      </div>
                    </div>
                  )}
                </div>

                <Button onClick={() => onRestore(entry)}>
                  Restore
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ModalShell>
  )
}

export default HistoryModal