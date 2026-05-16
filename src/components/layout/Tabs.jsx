function Tabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'verse', label: 'Scripture' },
    { id: 'events', label: 'Events' },
    { id: 'roster', label: 'Worship' }
  ]

  return (
    <div className="border-b border-[#EEE6DC] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-4 text-sm border-b-2 transition ${
              activeTab === tab.id
                ? 'border-[#2D2926] text-[#2D2926]'
                : 'border-transparent text-[#8A7A6E] hover:text-[#2D2926]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Tabs