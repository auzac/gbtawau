import EventCard from './EventCard'
import Button from '../ui/Button'

function EventsPanel({ events, onSave, onAdd, onEdit, onDelete }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-[#2D2926]">
            Upcoming Events
          </h2>

          <p className="text-sm text-[#8A7A6E] mt-1">
            Manage homepage event listings
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={onAdd}>
            Add Event
          </Button>

          <Button onClick={onSave}>
            Save Events
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}

export default EventsPanel