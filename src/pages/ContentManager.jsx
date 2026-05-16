import React, { useEffect, useState } from 'react'

import { loadVerse, saveVerse } from '../services/verseService'
import { loadEvents, saveEvents } from '../services/eventService'
import { loadRoster, saveRoster } from '../services/rosterService'

function ContentManager() {
  const [activeTab, setActiveTab] = useState('verse')

  const [savedMessage, setSavedMessage] = useState(null)

  const [verse, setVerse] = useState({
    reference: '',
    text: '',
    theme: ''
  })

  const [events, setEvents] = useState([])
  const [roster, setRoster] = useState([])

  useEffect(() => {
    setVerse(loadVerse())
    setEvents(loadEvents())
    setRoster(loadRoster())
  }, [])

  const triggerToast = (message) => {
    setSavedMessage(message)

    setTimeout(() => {
      setSavedMessage(null)
    }, 2000)
  }

  const handleSaveVerse = () => {
    saveVerse(verse)
    triggerToast('Verse saved')
  }

  const handleSaveEvents = () => {
    saveEvents(events)
    triggerToast('Events saved')
  }

  const handleSaveRoster = (updatedRoster) => {
    saveRoster(updatedRoster)
    triggerToast('Roster saved')
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <PageHeader
        title="Content Manager"
        subtitle="Church website content administration"
        actions={
          <>
            <Button variant="secondary">
              Calendar
            </Button>

            <Button variant="ghost">
              Logout
            </Button>
          </>
        }
      />

      <SaveToast message={savedMessage} />

      <Tabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'verse' && (
          <VerseEditor
            verse={verse}
            setVerse={setVerse}
            onSave={handleSaveVerse}
            onHistory={() => console.log('open verse history')}
          />
        )}

        {activeTab === 'events' && (
          <EventsPanel
            events={events}
            onSave={handleSaveEvents}
            onAdd={() => console.log('add event')}
            onEdit={() => console.log('edit event')}
            onDelete={() => console.log('delete event')}
          />
        )}

        {activeTab === 'roster' && (
          <RosterPanel
            roster={roster}
            onEdit={() => console.log('edit roster')}
            onSave={handleSaveRoster}
            onHistory={() => console.log('open roster history')}
          />
        )}
      </main>
    </div>
  )
}

export default ContentManager