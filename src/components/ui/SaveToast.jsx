function SaveToast({ message }) {
  if (!message) return null

  return (
    <div className="fixed top-20 right-4 z-50 bg-[#2D2926] text-white px-4 py-2 rounded-2xl text-sm shadow-lg animate-fade-in">
      {message}
    </div>
  )
}

export default SaveToast