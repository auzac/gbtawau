// src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

function AdminDashboard() {
  const navigate = useNavigate()
  const [members, setMembers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showMemberTable, setShowMemberTable] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [importPreview, setImportPreview] = useState([])
  const [importErrors, setImportErrors] = useState([])
  const fileInputRef = useRef(null)
  const [formData, setFormData] = useState({
    name: '',
    sex: 'Male',
    address: '',
    dob: '',
    registeredSince: '',
    baptismDate: '',
    maritalStatus: 'Single'
  })

  // Helper functions
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '—'
    const [year, month, day] = dateString.split('-')
    return `${day}/${month}/${year}`
  }

  const convertToStorageFormat = (dateString) => {
    if (!dateString) return ''
    const [day, month, year] = dateString.split('/')
    return `${year}-${month}-${day}`
  }

  const formatDateForCSV = (dateString) => {
    if (!dateString) return ''
    const [year, month, day] = dateString.split('-')
    return `${day}/${month}/${year}`
  }

  const isValidDate = (dateString) => {
    if (!dateString) return false
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/
    if (!regex.test(dateString)) return false
    const [_, day, month, year] = dateString.match(regex)
    const date = new Date(year, month - 1, day)
    return date.getFullYear() === parseInt(year) && 
           date.getMonth() === parseInt(month) - 1 && 
           date.getDate() === parseInt(day)
  }

  // Load and save members
  useEffect(() => {
    const storedMembers = localStorage.getItem('churchMembers')
    if (storedMembers) {
      setMembers(JSON.parse(storedMembers))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('churchMembers', JSON.stringify(members))
  }, [members])

  // Calculate stats
  const maleCount = members.filter(m => m.sex === 'Male').length
  const femaleCount = members.filter(m => m.sex === 'Female').length

  const filteredMembers = members.filter(member => {
    const searchLower = searchTerm.toLowerCase()
    return (
      member.name.toLowerCase().includes(searchLower) ||
      member.address.toLowerCase().includes(searchLower)
    )
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingId !== null) {
      setMembers(prev =>
        prev.map(member =>
          member.id === editingId
            ? { ...formData, id: editingId }
            : member
        )
      )
    } else {
      const newMember = { ...formData, id: Date.now() }
      setMembers(prev => [...prev, newMember])
    }
    
    setFormData({ name: '', sex: 'Male', address: '', dob: '', registeredSince: '', baptismDate: '', maritalStatus: 'Single' })
    setEditingId(null)
    setIsFormOpen(false)
  }

  const handleEdit = (member) => {
    setFormData({
      name: member.name,
      sex: member.sex || 'Male',
      address: member.address,
      dob: member.dob,
      registeredSince: member.registeredSince || '',
      baptismDate: member.baptismDate || '',
      maritalStatus: member.maritalStatus || 'Single'
    })
    setEditingId(member.id)
    setIsFormOpen(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      setMembers(prev => prev.filter(member => member.id !== id))
    }
  }

  const handleExportCSV = () => {
    const headers = ['Name', 'Sex', 'Address', 'Date of Birth', 'Registered Since', 'Baptism Date', 'Marital Status']
    const rows = filteredMembers.map(member => [
      `"${member.name}"`,
      member.sex || 'Male',
      `"${member.address}"`,
      formatDateForCSV(member.dob),
      formatDateForCSV(member.registeredSince),
      formatDateForCSV(member.baptismDate),
      member.maritalStatus || 'Single'
    ])

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `church_members_${new Date().toISOString().split('T')[0]}.csv`)
    link.click()
    URL.revokeObjectURL(url)
  }

  const downloadTemplate = () => {
    const headers = ['Name', 'Sex', 'Address', 'Date of Birth', 'Registered Since', 'Baptism Date', 'Marital Status']
    const exampleRow = ['"John Tan"', 'Male', '"Taman Indah, Tawau"', '15/05/1990', '10/01/2023', '20/06/2023', 'Married']
    const exampleRow2 = ['"Mary Wong"', 'Female', '"Jalan Kuhara, Tawau"', '22/08/1985', '05/11/2022', '', 'Single']
    const csvContent = [headers.join(','), exampleRow.join(','), exampleRow2.join(',')].join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'church_members_template.csv')
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const csvText = event.target.result
      const lines = csvText.split(/\r?\n/)
      const firstLine = lines[0].replace(/^\uFEFF/, '')
      const headers = firstLine.split(',').map(h => h.replace(/"/g, '').trim())
      
      const requiredHeaders = ['Name', 'Sex', 'Address', 'Date of Birth', 'Registered Since', 'Baptism Date', 'Marital Status']
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
      
      if (missingHeaders.length > 0) {
        setImportErrors([`Missing required columns: ${missingHeaders.join(', ')}`])
        setImportPreview([])
        return
      }

      const parsedMembers = []
      const errors = []
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue
        
        const row = []
        let inQuote = false
        let currentField = ''
        
        for (let j = 0; j < lines[i].length; j++) {
          const char = lines[i][j]
          if (char === '"') {
            inQuote = !inQuote
          } else if (char === ',' && !inQuote) {
            row.push(currentField.replace(/^"|"$/g, '').trim())
            currentField = ''
          } else {
            currentField += char
          }
        }
        row.push(currentField.replace(/^"|"$/g, '').trim())
        
        if (row.length < 7) {
          errors.push(`Row ${i}: Invalid number of columns (expected 7, got ${row.length})`)
          continue
        }
        
        const [name, sex, address, dob, registeredSince, baptismDate, maritalStatus] = row
        
        if (!name || !address || !dob) {
          errors.push(`Row ${i}: Name, Address, and Date of Birth are required`)
          continue
        }
        
        const validSex = ['Male', 'Female']
        if (sex && !validSex.includes(sex)) {
          errors.push(`Row ${i}: Invalid Sex (use Male or Female)`)
          continue
        }
        
        if (!isValidDate(dob)) {
          errors.push(`Row ${i}: Invalid Date of Birth format (use DD/MM/YYYY)`)
          continue
        }
        
        if (registeredSince && !isValidDate(registeredSince)) {
          errors.push(`Row ${i}: Invalid Registered Since format (use DD/MM/YYYY or leave empty)`)
          continue
        }
        
        if (baptismDate && !isValidDate(baptismDate)) {
          errors.push(`Row ${i}: Invalid Baptism Date format (use DD/MM/YYYY or leave empty)`)
          continue
        }
        
        const validMaritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed', '']
        if (maritalStatus && !validMaritalStatuses.includes(maritalStatus)) {
          errors.push(`Row ${i}: Invalid Marital Status (use Single, Married, Divorced, or Widowed)`)
          continue
        }
        
        parsedMembers.push({
          name,
          sex: sex || 'Male',
          address,
          dob: convertToStorageFormat(dob),
          registeredSince: registeredSince ? convertToStorageFormat(registeredSince) : '',
          baptismDate: baptismDate ? convertToStorageFormat(baptismDate) : '',
          maritalStatus: maritalStatus || 'Single',
          id: null
        })
      }
      
      if (errors.length > 0) {
        setImportErrors(errors)
        setImportPreview([])
      } else {
        setImportErrors([])
        setImportPreview(parsedMembers)
      }
    }
    reader.readAsText(file, 'UTF-8')
  }

  const confirmImport = () => {
    const newMembers = importPreview.map(member => ({
      ...member,
      id: Date.now() + Math.random()
    }))
    setMembers(prev => [...prev, ...newMembers])
    setIsBulkImportOpen(false)
    setImportPreview([])
    setImportErrors([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleLogout = () => {
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <header className="bg-white border-b border-[#EAE1D4] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-lg">✝</span>
              <div>
                <h1 className="text-base font-serif font-light text-[#2D2926]">Gereja Baptis Tawau</h1>
                <p className="text-[9px] text-[#8A7A6E] tracking-wide">Member Directory</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-[#8A7A6E] hover:text-[#2D2926] text-xs transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        
        {/* Stats Cards - Simple */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-3 border border-[#EAE1D4] text-center">
            <div className="text-xl font-serif text-[#2D2926]">{members.length}</div>
            <div className="text-[10px] text-[#8A7A6E] uppercase tracking-wide">Total</div>
          </div>
          <div className="bg-white rounded-xl p-3 border border-[#EAE1D4] text-center">
            <div className="text-xl font-serif text-[#2D2926]">{maleCount}</div>
            <div className="text-[10px] text-[#8A7A6E] uppercase tracking-wide">Male</div>
          </div>
          <div className="bg-white rounded-xl p-3 border border-[#EAE1D4] text-center">
            <div className="text-xl font-serif text-[#2D2926]">{femaleCount}</div>
            <div className="text-[10px] text-[#8A7A6E] uppercase tracking-wide">Female</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => {
              setFormData({ name: '', sex: 'Male', address: '', dob: '', registeredSince: '', baptismDate: '', maritalStatus: 'Single' })
              setEditingId(null)
              setIsFormOpen(true)
            }}
            className="bg-[#2D2926] text-white px-4 py-1.5 rounded-full text-sm hover:bg-[#4A3F38] transition"
          >
            + Add Member
          </button>
          <button
            onClick={() => setIsBulkImportOpen(true)}
            className="border border-[#EAE1D4] text-[#7A6A5E] px-4 py-1.5 rounded-full text-sm hover:bg-[#F5EFE6] transition"
          >
            Bulk Import
          </button>
          <button
            onClick={handleExportCSV}
            disabled={members.length === 0}
            className={`border px-4 py-1.5 rounded-full text-sm transition ${
              members.length === 0
                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                : 'border-[#EAE1D4] text-[#7A6A5E] hover:bg-[#F5EFE6]'
            }`}
          >
            Export CSV
          </button>
        </div>

        {/* Member Directory */}
        <div className="bg-white rounded-xl border border-[#EAE1D4] overflow-hidden">
          <div className="px-4 py-3 bg-[#FBF9F6] border-b border-[#EAE1D4] flex justify-between items-center">
            <div>
              <h2 className="text-sm font-medium text-[#2D2926]">Member Directory</h2>
              <p className="text-[10px] text-[#8A7A6E]">{members.length} total</p>
            </div>
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-40 sm:w-56 px-3 py-1.5 pl-8 border border-[#EAE1D4] rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-[#C4A88B]"
              />
              <svg className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-[#8A7A6E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Table */}
          {(searchTerm ? filteredMembers : members).length === 0 ? (
            <div className="text-center py-12">
              <div className="text-3xl mb-2 opacity-30">📋</div>
              <p className="text-[#8A7A6E] text-sm">
                {searchTerm ? `No results for "${searchTerm}"` : 'No members yet'}
              </p>
              {!searchTerm && (
                <button onClick={() => setIsFormOpen(true)} className="mt-3 text-[#2D2926] underline text-sm">
                  Add your first member
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F5EFE6]">
                  <tr>
                    <th className="text-left px-4 py-2 text-xs font-medium text-[#5B534D]">Name</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-[#5B534D] hidden sm:table-cell">Sex</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-[#5B534D] hidden md:table-cell">Address</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-[#5B534D] hidden lg:table-cell">DOB</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-[#5B534D]">Status</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-[#5B534D]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(searchTerm ? filteredMembers : members).map((member) => (
                    <tr key={member.id} className="border-t border-[#EAE1D4] hover:bg-[#FAF8F5]">
                      <td className="px-4 py-2 text-[#2D2926] font-medium text-sm">{member.name}</td>
                      <td className="px-4 py-2 hidden sm:table-cell">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          member.sex === 'Male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                        }`}>
                          {member.sex || 'Male'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-[#7A6A5E] text-sm hidden md:table-cell truncate max-w-[180px]">{member.address}</td>
                      <td className="px-4 py-2 text-[#7A6A5E] text-sm hidden lg:table-cell">{formatDateForDisplay(member.dob)}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          member.maritalStatus === 'Married' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {member.maritalStatus || 'Single'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right whitespace-nowrap">
                        <button onClick={() => handleEdit(member)} className="text-[#8A7A6E] hover:text-[#2D2926] mr-2 text-xs transition">Edit</button>
                        <button onClick={() => handleDelete(member.id)} className="text-[#C4A88B] hover:text-red-600 text-xs transition">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-[9px] text-[#B0A49A] mt-5 tracking-wide">
          Data stored locally in your browser
        </p>
      </main>

      {/* Add/Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-serif text-[#2D2926]">{editingId ? 'Edit Member' : 'Add Member'}</h2>
              <button onClick={() => { setIsFormOpen(false); setEditingId(null); }} className="text-[#8A7A6E] text-xl">×</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Full Name" className="w-full px-3 py-2 border border-[#EAE1D4] rounded-lg text-sm" />
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-1"><input type="radio" name="sex" value="Male" checked={formData.sex === 'Male'} onChange={handleInputChange} /> Male</label>
                <label className="flex items-center gap-1"><input type="radio" name="sex" value="Female" checked={formData.sex === 'Female'} onChange={handleInputChange} /> Female</label>
              </div>
              <input type="text" name="address" value={formData.address} onChange={handleInputChange} required placeholder="Address" className="w-full px-3 py-2 border border-[#EAE1D4] rounded-lg text-sm" />
              <input type="text" name="dob" value={formData.dob ? formatDateForDisplay(formData.dob) : ''} onChange={(e) => { const v = e.target.value; if (isValidDate(v)) setFormData(prev => ({ ...prev, dob: convertToStorageFormat(v) })); else if (!v) setFormData(prev => ({ ...prev, dob: '' })) }} required placeholder="Date of Birth (DD/MM/YYYY)" className="w-full px-3 py-2 border border-[#EAE1D4] rounded-lg text-sm" />
              <input type="text" name="registeredSince" value={formData.registeredSince ? formatDateForDisplay(formData.registeredSince) : ''} onChange={(e) => { const v = e.target.value; if (isValidDate(v)) setFormData(prev => ({ ...prev, registeredSince: convertToStorageFormat(v) })); else if (!v) setFormData(prev => ({ ...prev, registeredSince: '' })) }} placeholder="Registered Since (DD/MM/YYYY)" className="w-full px-3 py-2 border border-[#EAE1D4] rounded-lg text-sm" />
              <input type="text" name="baptismDate" value={formData.baptismDate ? formatDateForDisplay(formData.baptismDate) : ''} onChange={(e) => { const v = e.target.value; if (isValidDate(v)) setFormData(prev => ({ ...prev, baptismDate: convertToStorageFormat(v) })); else if (!v) setFormData(prev => ({ ...prev, baptismDate: '' })) }} placeholder="Baptism Date (DD/MM/YYYY)" className="w-full px-3 py-2 border border-[#EAE1D4] rounded-lg text-sm" />
              <select name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange} className="w-full px-3 py-2 border border-[#EAE1D4] rounded-lg text-sm">
                <option value="Single">Single</option><option value="Married">Married</option><option value="Divorced">Divorced</option><option value="Widowed">Widowed</option>
              </select>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-[#2D2926] text-white py-2 rounded-full text-sm">{editingId ? 'Update' : 'Add'}</button>
                <button type="button" onClick={() => { setIsFormOpen(false); setEditingId(null); setFormData({ name: '', sex: 'Male', address: '', dob: '', registeredSince: '', baptismDate: '', maritalStatus: 'Single' }) }} className="flex-1 border border-[#EAE1D4] text-[#7A6A5E] py-2 rounded-full text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {isBulkImportOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-serif text-[#2D2926]">Bulk Import</h2>
              <button onClick={() => { setIsBulkImportOpen(false); setImportPreview([]); setImportErrors([]); }} className="text-[#8A7A6E] text-xl">×</button>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-[#F5EFE6] rounded-lg">
                <p className="text-sm text-[#2D2926] mb-2">1. Download template</p>
                <button onClick={downloadTemplate} className="bg-[#2D2926] text-white px-3 py-1 rounded-lg text-sm">Download CSV Template</button>
              </div>
              <div className="p-3 bg-[#F5EFE6] rounded-lg">
                <p className="text-sm text-[#2D2926] mb-2">2. Upload your CSV</p>
                <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="text-xs" />
              </div>
              {importErrors.length > 0 && <div className="p-2 bg-red-50 rounded-lg text-red-600 text-xs max-h-32 overflow-y-auto">{importErrors.slice(0, 5).map((e, i) => <div key={i}>⚠️ {e}</div>)}</div>}
              {importPreview.length > 0 && (
                <div>
                  <p className="text-sm mb-2">{importPreview.length} members ready</p>
                  <div className="max-h-40 overflow-y-auto border rounded-lg text-xs"><table className="w-full"><tbody>{importPreview.slice(0, 6).map((m, i) => <tr key={i} className="border-t"><td className="p-2">{m.name}</td><td className="p-2">{m.sex}</td></tr>)}</tbody></table></div>
                  <button onClick={confirmImport} className="w-full mt-3 bg-[#2D2926] text-white py-2 rounded-full text-sm">Import {importPreview.length}</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard