import React from 'react'
import ModalShell from '../ui/ModalShell'
import Button from '../ui/Button'

function EventModal({
  form,
  setForm,
  editing,
  onClose,
  onSave
}) {
  return (
    <ModalShell
      title={editing ? 'Edit Event' : 'Add Event'}
      onClose={onClose}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
          className="w-full border border-[#EAE1D4] rounded-xl px-4 py-3 text-sm"
        />

        <input
          type="text"
          placeholder="Time"
          value={form.time}
          onChange={(e) => setForm(prev => ({ ...prev, time: e.target.value }))}
          className="w-full border border-[#EAE1D4] rounded-xl px-4 py-3 text-sm"
        />

        <input
          type="text"
          placeholder="English Title"
          value={form.titleEn}
          onChange={(e) => setForm(prev => ({ ...prev, titleEn: e.target.value }))}
          className="w-full border border-[#EAE1D4] rounded-xl px-4 py-3 text-sm"
        />

        <textarea
          rows={3}
          placeholder="Description"
          value={form.descriptionEn}
          onChange={(e) => setForm(prev => ({ ...prev, descriptionEn: e.target.value }))}
          className="w-full border border-[#EAE1D4] rounded-xl px-4 py-3 text-sm"
        />

        <Button className="w-full" onClick={onSave}>
          Save Event
        </Button>
      </div>
    </ModalShell>
  )
}

export default EventModal