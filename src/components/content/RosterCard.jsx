function RosterCard({ week, onEdit, onSave }) {
  return (
    <div className="bg-white border border-[#EEE6DC] rounded-2xl p-5 hover:shadow-sm transition-all">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="text-sm font-medium text-[#2D2926] mb-4">
            Week of {week.weekStart}
          </div>

          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-[#9B8E84] mb-1">Leader</p>
              <p className="text-[#2D2926]">{week.leader}</p>
            </div>

            <div>
              <p className="text-[#9B8E84] mb-1">Pianist</p>
              <p className="text-[#2D2926]">{week.pianist}</p>
            </div>

            <div>
              <p className="text-[#9B8E84] mb-1">Reader</p>
              <p className="text-[#2D2926]">{week.reader}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => onSave(week)}>
            Save
          </button>

          <button onClick={() => onEdit(week)}>
            Edit
          </button>
        </div>
      </div>
    </div>
  )
}

export default RosterCard