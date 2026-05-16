// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function AdminDashboard() {
  const navigate = useNavigate()
  const [members, setMembers] = useState([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    dob: ''
  })

  // Load members from localStorage on mount
  useEffect(() => {
    const storedMembers = localStorage.getItem('churchMembers')
    if (storedMembers) {
      setMembers(JSON.parse(storedMembers))
    }
  }, [])

  // Save members to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('churchMembers', JSON.stringify(members))
  }, [members])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingId !== null) {
      // Edit existing member
      setMembers(prev =>
        prev.map(member =>
          member.id === editingId
            ? { ...formData, id: editingId }
            : member
        )
      )
    } else {
      // Add new member
      const newMember = {
        ...formData,
        id: Date.now()
      }
      setMembers(prev => [...prev, newMember])
    }
    
    // Reset form
    setFormData({ name: '', address: '', dob: '' })
    setEditingId(null)
    setIsFormOpen(false)
  }

  const handleEdit = (member) => {
    setFormData({
      name: member.name,
      address: member.address,
      dob: member.dob
    })
    setEditingId(member.id)
    setIsFormOpen(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      setMembers(prev => prev.filter(member => member.id !== id))
    }
  }

  const handleLogout = () => {
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <header className="bg-white border-b border-[#EAE1D4] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-light text-[#2D2926]">
              Member Management
            </h1>
            <p className="text-xs text-[#8A7A6E] mt-0.5">
              Manage church members — add, edit, and remove
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setFormData({ name: '', address: '', dob: '' })
                setEditingId(null)
                setIsFormOpen(true)
              }}
              className="bg-[#2D2926] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#4A3F38] transition"
            >
              + Add Member
            </button>
            <button
              onClick={handleLogout}
              className="border border-[#EAE1D4] text-[#7A6A5E] px-4 py-2 rounded-full text-sm font-medium hover:bg-[#F5EFE6] transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Stats Summary */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-[#EAE1D4] text-sm text-[#5B534D]">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            {members.length} {members.length === 1 ? 'member' : 'members'} registered
          </div>
        </div>

        {/* Member List */}
        {members.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#EAE1D4]">
            <div className="text-5xl mb-4 opacity-30">👥</div>
            <p className="text-[#8A7A6E] mb-4">No members yet</p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="text-[#2D2926] underline underline-offset-4 text-sm"
            >
              Add your first member
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl border border-[#EAE1D4] overflow-hidden">
              <thead className="bg-[#F5EFE6]">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#5B534D]">Name</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#5B534D]">Address</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#5B534D]">Date of Birth</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-[#5B534D]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-t border-[#EAE1D4] hover:bg-[#FAF8F5] transition">
                    <td className="px-6 py-4 text-[#2D2926] font-medium">
                      {member.name}
                    </td>
                    <td className="px-6 py-4 text-[#7A6A5E]">
                      {member.address}
                    </td>
                    <td className="px-6 py-4 text-[#7A6A5E]">
                      {member.dob}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEdit(member)}
                        className="text-[#8A7A6E] hover:text-[#2D2926] mr-4 text-sm transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="text-[#C4A88B] hover:text-red-600 text-sm transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add/Edit Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif text-[#2D2926]">
                  {editingId ? 'Edit Member' : 'Add New Member'}
                </h2>
                <button
                  onClick={() => {
                    setIsFormOpen(false)
                    setEditingId(null)
                    setFormData({ name: '', address: '', dob: '' })
                  }}
                  className="text-[#8A7A6E] hover:text-[#2D2926] text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#5B534D] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-[#EAE1D4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C4A88B] focus:border-transparent bg-white"
                    placeholder="e.g., John Tan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5B534D] mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-[#EAE1D4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C4A88B] focus:border-transparent bg-white"
                    placeholder="e.g., Taman Indah, Tawau"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5B534D] mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-[#EAE1D4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C4A88B] focus:border-transparent bg-white"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[#2D2926] text-white py-2 rounded-full hover:bg-[#4A3F38] transition"
                  >
                    {editingId ? 'Update Member' : 'Add Member'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false)
                      setEditingId(null)
                      setFormData({ name: '', address: '', dob: '' })
                    }}
                    className="flex-1 border border-[#EAE1D4] text-[#7A6A5E] py-2 rounded-full hover:bg-[#F5EFE6] transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminDashboard