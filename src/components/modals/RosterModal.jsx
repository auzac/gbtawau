import React from 'react'
import ModalShell from '../ui/ModalShell'
import Button from '../ui/Button'

function RosterModal({
  form,
  setForm,
  onClose,
  onSave
}) {
  return (
    <ModalShell
      title="Edit Worship Week"
      onClose={onClose}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Week Start"
          value={form.weekStart}
          onChange={(e) => setForm(prev => ({ ...prev, weekStart: e.target.value }))}
          className="w-full border border-[#EAE1D4] rounded-xl px-4 py-3 text-sm"
        />

        <input
          type="text"
          placeholder="Leader"
          value={form.leader}
          onChange={(e) => setForm(prev => ({ ...prev, leader: e.target.value }))}
          className="w-full border border-[#EAE1D4] rounded-xl px-4 py-3 text-sm"
        />

        <input
          type="text"
          placeholder="Pianist"
          value={form.pianist}
          onChange={(e) => setForm(prev => ({ ...prev, pianist: e.target.value }))}
          className="w-full border border-[#EAE1D4] rounded-xl px-4 py-3 text-sm"
        />

        <input
          type="text"
          placeholder="Reader"
          value={form.reader}
          onChange={(e) => setForm(prev => ({ ...prev, reader: e.target.value }))}
          className="w-full border border-[#EAE1D4] rounded-xl px-4 py-3 text-sm"
        />

        <Button className="w-full" onClick={onSave}>
          Save Changes
        </Button>
      </div>
    </ModalShell>
  )
}

export default RosterModal