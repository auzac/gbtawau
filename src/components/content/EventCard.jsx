function EventCard({ event, onEdit, onDelete }) {
  return (
    <div className="bg-white border border-[#EEE6DC] rounded-2xl p-5 hover:shadow-sm transition-all">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="text-sm font-medium text-[#2D2926]">
              {event.titleEn}
            </span>

            <span className="text-xs text-[#8A7A6E]">
              {event.date}
            </span>
          </div>

          <p className="text-sm italic text-[#9B8E84] mb-2">
            {event.titleBm}
          </p>

          <p className="text-sm text-[#6E655F]">
            {event.descriptionEn}
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={() => onEdit(event)}>
            Edit
          </button>

          <button
            onClick={() => onDelete(event.id)}
            className="text-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default EventCard