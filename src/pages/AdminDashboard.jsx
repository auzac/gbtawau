// src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

function AdminDashboard() {
  const navigate = useNavigate()
  const [members, setMembers] = useState([])
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
      setMembers(prev =>
        prev.map(member =>
          member.id === editingId
            ? { ...formData, id: editingId }
            : member
        )
      )
    } else {
      const newMember = {
        ...formData,
        id: Date.now()
      }
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

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Name', 'Sex', 'Address', 'Date of Birth', 'Registered Since', 'Baptism Date', 'Marital Status']
    const rows = members.map(member => [
      `"${member.name}"`,
      member.sex || 'Male',
      `"${member.address}"`,
      member.dob,
      member.registeredSince || '',
      member.baptismDate || '',
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

  // Download CSV Template for bulk import
  const downloadTemplate = () => {
    const headers = ['Name', 'Sex', 'Address', 'Date of Birth', 'Registered Since', 'Baptism Date', 'Marital Status']
    const exampleRow = [
      '"John Tan"',
      'Male',
      '"Taman Indah, Tawau"',
      '1990-05-15',
      '2023-01-10',
      '2023-06-20',
      'Married'
    ]
    const exampleRow2 = [
      '"Mary Wong"',
      'Female',
      '"Jalan Kuhara, Tawau"',
      '1985-08-22',
      '2022-11-05',
      '',
      'Single'
    ]
    
    const csvContent = [headers.join(','), exampleRow.join(','), exampleRow2.join(',')].join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', 'church_members_template.csv')
    link.click()
    URL.revokeObjectURL(url)
  }

  // Parse and validate CSV for bulk import
  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const csvText = event.target.result
      const lines = csvText.split(/\r?\n/)
      
      // Remove BOM if present
      const firstLine = lines[0].replace(/^\uFEFF/, '')
      const headers = firstLine.split(',').map(h => h.replace(/"/g, '').trim())
      
      // Validate headers
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
        
        // Simple CSV parsing (handles quoted fields)
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
        
        // Validation
        if (!name || !address || !dob) {
          errors.push(`Row ${i}: Name, Address, and Date of Birth are required`)
          continue
        }
        
        // Validate sex
        const validSex = ['Male', 'Female']
        if (sex && !validSex.includes(sex)) {
          errors.push(`Row ${i}: Invalid Sex (use Male or Female)`)
          continue
        }
        
        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (dob && !dateRegex.test(dob)) {
          errors.push(`Row ${i}: Invalid Date of Birth format (use YYYY-MM-DD)`)
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
          dob,
          registeredSince: registeredSince || '',
          baptismDate: baptismDate || '',
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

  // Confirm and import members
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

  const formatDate = (dateString) => {
    if (!dateString) return '—'
    return dateString
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <header className="bg-white border-b border-[#EAE1D4] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-light text-[#2D2926]">
                Member Management
              </h1>
              <p className="text-xs text-[#8A7A6E] mt-0.5">
                Manage church members — add, edit, and remove
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setIsBulkImportOpen(true)}
                className="border border-[#EAE1D4] text-[#7A6A5E] px-4 py-2 rounded-full text-sm font-medium hover:bg-[#F5EFE6] transition"
              >
                📤 Bulk Import
              </button>
              <button
                onClick={handleExportCSV}
                disabled={members.length === 0}
                className={`border px-4 py-2 rounded-full text-sm font-medium transition ${
                  members.length === 0
                    ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                    : 'border-[#EAE1D4] text-[#7A6A5E] hover:bg-[#F5EFE6]'
                }`}
              >
                📥 Export CSV
              </button>
              <button
                onClick={() => {
                  setFormData({ name: '', sex: 'Male', address: '', dob: '', registeredSince: '', baptismDate: '', maritalStatus: 'Single' })
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Stats Summary */}
        <div className="mb-6 flex flex-wrap gap-3">
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
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setIsFormOpen(true)}
                className="text-[#2D2926] underline underline-offset-4 text-sm"
              >
                Add your first member
              </button>
              <button
                onClick={() => setIsBulkImportOpen(true)}
                className="text-[#2D2926] underline underline-offset-4 text-sm"
              >
                Or bulk import from CSV
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl border border-[#EAE1D4] overflow-hidden">
              <thead className="bg-[#F5EFE6]">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#5B534D]">Name</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#5B534D]">Sex</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#5B534D]">Address</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#5B534D]">DOB</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#5B534D]">Registered</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#5B534D]">Baptism</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#5B534D]">Status</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-[#5B534D]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-t border-[#EAE1D4] hover:bg-[#FAF8F5] transition">
                    <td className="px-6 py-4 text-[#2D2926] font-medium">{member.name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                        member.sex === 'Male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                      }`}>
                        {member.sex || 'Male'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#7A6A5E]">{member.address}</td>
                    <td className="px-6 py-4 text-[#7A6A5E]">{formatDate(member.dob)}</td>
                    <td className="px-6 py-4 text-[#7A6A5E]">{formatDate(member.registeredSince)}</td>
                    <td className="px-6 py-4 text-[#7A6A5E]">{formatDate(member.baptismDate)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                        member.maritalStatus === 'Married' 
                          ? 'bg-green-100 text-green-700'
                          : member.maritalStatus === 'Widowed'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {member.maritalStatus || 'Single'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleEdit(member)} className="text-[#8A7A6E] hover:text-[#2D2926] mr-4 text-sm transition">Edit</button>
                      <button onClick={() => handleDelete(member.id)} className="text-[#C4A88B] hover:text-red-600 text-sm transition">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
             </>
          </div>
        )}

        {/* Add/Edit Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif text-[#2D2926]">{editingId ? 'Edit Member' : 'Add New Member'}</h2>
                <button onClick={() => { setIsFormOpen(false); setEditingId(null); setFormData({ name: '', sex: 'Male', address: '', dob: '', registeredSince: '', baptismDate: '', maritalStatus: 'Single' }) }} className="text-[#8A7A6E] hover:text-[#2D2926] text-2xl leading-none">×</button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#5B534D] mb-1">Full Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-2 border border-[#EAE1D4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C4A88B]" placeholder="e.g., John Tan" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5B534D] mb-1">Sex *</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="sex" value="Male" checked={formData.sex === 'Male'} onChange={handleInputChange} className="text-[#2D2926]" />
                      <span className="text-sm">Male</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="sex" value="Female" checked={formData.sex === 'Female'} onChange={handleInputChange} className="text-[#2D2926]" />
                      <span className="text-sm">Female</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5B534D] mb-1">Address *</label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} required className="w-full px-4 py-2 border border-[#EAE1D4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C4A88B]" placeholder="e.g., Taman Indah, Tawau" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5B534D] mb-1">Date of Birth *</label>
                  <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} required className="w-full px-4 py-2 border border-[#EAE1D4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C4A88B]" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5B534D] mb-1">Registered Since</label>
                  <input type="date" name="registeredSince" value={formData.registeredSince} onChange={handleInputChange} className="w-full px-4 py-2 border border-[#EAE1D4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C4A88B]" />
                  <p className="text-xs text-[#8A7A6E] mt-1">Date they joined the church</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5B534D] mb-1">Baptism Date</label>
                  <input type="date" name="baptismDate" value={formData.baptismDate} onChange={handleInputChange} className="w-full px-4 py-2 border border-[#EAE1D4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C4A88B]" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5B534D] mb-1">Marital Status</label>
                  <select name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange} className="w-full px-4 py-2 border border-[#EAE1D4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C4A88B]">
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-[#2D2926] text-white py-2 rounded-full hover:bg-[#4A3F38] transition">{editingId ? 'Update Member' : 'Add Member'}</button>
                  <button type="button" onClick={() => { setIsFormOpen(false); setEditingId(null); setFormData({ name: '', sex: 'Male', address: '', dob: '', registeredSince: '', baptismDate: '', maritalStatus: 'Single' }) }} className="flex-1 border border-[#EAE1D4] text-[#7A6A5E] py-2 rounded-full hover:bg-[#F5EFE6] transition">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bulk Import Modal */}
        {isBulkImportOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif text-[#2D2926]">Bulk Import Members</h2>
                <button onClick={() => { setIsBulkImportOpen(false); setImportPreview([]); setImportErrors([]); if(fileInputRef.current) fileInputRef.current.value = '' }} className="text-[#8A7A6E] hover:text-[#2D2926] text-2xl leading-none">×</button>
              </div>

              {/* Step 1: Download Template */}
              <div className="mb-6 p-4 bg-[#F5EFE6] rounded-xl">
                <h3 className="font-medium text-[#2D2926] mb-2">1. Download Template</h3>
                <p className="text-sm text-[#7A6A5E] mb-3">Use this CSV template to prepare your member list</p>
                <button onClick={downloadTemplate} className="bg-[#2D2926] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#4A3F38] transition">📥 Download Template CSV</button>
              </div>

              {/* Step 2: Upload File */}
              <div className="mb-6 p-4 bg-[#F5EFE6] rounded-xl">
                <h3 className="font-medium text-[#2D2926] mb-2">2. Upload Your CSV</h3>
                <p className="text-sm text-[#7A6A5E] mb-3">Select the completed CSV file to preview members</p>
                <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="text-sm text-[#7A6A5E] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-[#2D2926] file:text-white hover:file:bg-[#4A3F38]" />
              </div>

              {/* Errors */}
              {importErrors.length > 0 && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <h3 className="font-medium text-red-700 mb-2">Errors Found:</h3>
                  <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                    {importErrors.slice(0, 10).map((err, i) => <li key={i}>{err}</li>)}
                    {importErrors.length > 10 && <li>...and {importErrors.length - 10} more errors</li>}
                  </ul>
                </div>
              )}

              {/* Preview */}
              {importPreview.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-[#2D2926] mb-2">3. Preview ({importPreview.length} members)</h3>
                  <div className="max-h-64 overflow-y-auto border border-[#EAE1D4] rounded-xl">
                    <table className="w-full text-sm">
                      <thead className="bg-[#F5EFE6] sticky top-0">
                        <tr><th className="px-3 py-2 text-left">Name</th><th className="px-3 py-2 text-left">Sex</th><th className="px-3 py-2 text-left">Address</th><th className="px-3 py-2 text-left">DOB</th><th className="px-3 py-2 text-left">Status</th></tr>
                      </thead>
                      <tbody>
                        {importPreview.slice(0, 10).map((member, i) => (
                          <tr key={i} className="border-t border-[#EAE1D4]">
                            <td className="px-3 py-2">{member.name}</td>
                            <td className="px-3 py-2">{member.sex}</td>
                            <td className="px-3 py-2 text-[#7A6A5E]">{member.address.substring(0, 30)}</td>
                            <td className="px-3 py-2">{member.dob}</td>
                            <td className="px-3 py-2">{member.maritalStatus}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {importPreview.length > 10 && <p className="text-center text-xs text-[#8A7A6E] py-2">+ {importPreview.length - 10} more members</p>}
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={confirmImport} className="flex-1 bg-[#2D2926] text-white py-2 rounded-full hover:bg-[#4A3F38] transition">Import {importPreview.length} Members</button>
                    <button onClick={() => { setImportPreview([]); setImportErrors([]); if(fileInputRef.current) fileInputRef.current.value = '' }} className="flex-1 border border-[#EAE1D4] text-[#7A6A5E] py-2 rounded-full hover:bg-[#F5EFE6] transition">Clear</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminDashboard