import Button from '../ui/Button'

function VerseEditor({ verse, setVerse, onSave, onHistory }) {
  return (
    <div className="bg-white border border-[#EEE6DC] rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg text-[#2D2926] font-medium">
            Weekly Scripture
          </h2>

          <p className="text-sm text-[#8A7A6E] mt-1">
            Homepage featured verse
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={onHistory}>
            History
          </Button>

          <Button onClick={onSave}>
            Save Verse
          </Button>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm text-[#5B534D] mb-2">
            Reference
          </label>

          <input
            value={verse.reference}
            onChange={(e) =>
              setVerse((prev) => ({
                ...prev,
                reference: e.target.value
              }))
            }
            className="w-full border border-[#E8DED2] rounded-2xl px-4 py-3 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-[#5B534D] mb-2">
            Scripture Text
          </label>

          <textarea
            rows={5}
            value={verse.text}
            onChange={(e) =>
              setVerse((prev) => ({
                ...prev,
                text: e.target.value
              }))
            }
            className="w-full border border-[#E8DED2] rounded-2xl px-4 py-3 text-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-sm text-[#5B534D] mb-2">
            Theme
          </label>

          <input
            value={verse.theme}
            onChange={(e) =>
              setVerse((prev) => ({
                ...prev,
                theme: e.target.value
              }))
            }
            className="w-full border border-[#E8DED2] rounded-2xl px-4 py-3 text-sm"
          />
        </div>
      </div>
    </div>
  )
}

export default VerseEditor