import RosterCard from './RosterCard'
import Button from '../ui/Button'

function RosterPanel({ roster, onEdit, onSave, onHistory }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-[#2D2926]">
            Worship Roster
          </h2>

          <p className="text-sm text-[#8A7A6E] mt-1">
            Four week worship scheduling
          </p>
        </div>

        <Button variant="secondary" onClick={onHistory}>
          History
        </Button>
      </div>

      <div className="space-y-3">
        {roster.map((week) => (
          <RosterCard
            key={week.id}
            week={week}
            onEdit={onEdit}
            onSave={onSave}
          />
        ))}
      </div>
    </div>
  )
}

export default RosterPanel