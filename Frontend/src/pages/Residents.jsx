import React, { useState, useEffect } from 'react';
import api, { handleApiError } from '../services/api';
import { 
  Users, UserCheck, UserMinus, Search, Plus, 
  Edit2, Trash2, X, AlertCircle, Loader2, CheckCircle2 
} from 'lucide-react';

const Residents = () => {
  const [residents, setResidents] = useState([]);
  const [filteredResidents, setFilteredResidents] = useState([]);
  const [users, setUsers] = useState([]); 
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [residentToDelete, setResidentToDelete] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    userId: '',
    registerNumber: '',
    phone: '',
    department: '',
    year: '',
    guardianName: '',
    guardianPhone: '',
    emergencyContact: '',
    status: 'Active'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Residents
  const fetchResidents = async () => {
    try {
      const res = await api.get('/residents');
      setResidents(res.data);
      setFilteredResidents(res.data);
    } catch (err) {
      setError(handleApiError(err, 'Failed to fetch residents.'));
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Users for Dropdown 
  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users for dropdown', err);
    }
  };

  useEffect(() => {
    fetchResidents();
    fetchUsers();
  }, []);

  // Handle Search
  useEffect(() => {
    if (searchTerm) {
      const filtered = residents.filter(r => 
        (r.userId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.registerNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.department || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredResidents(filtered);
    } else {
      setFilteredResidents(residents);
    }
  }, [searchTerm, residents]);

  // Statistics
  const totalResidents = residents.length;
  const activeResidents = residents.filter(r => r.status === 'Active').length;
  const checkedOutResidents = residents.filter(r => r.status === 'Checked-Out').length;

  // Form Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      userId: '',
      registerNumber: '',
      phone: '',
      department: '',
      year: '',
      guardianName: '',
      guardianPhone: '',
      emergencyContact: '',
      status: 'Active'
    });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (resident) => {
    setEditingId(resident._id);
    setFormData({
      userId: resident.userId?._id || resident.userId || '',
      registerNumber: resident.registerNumber || '',
      phone: resident.phone || '',
      department: resident.department || '',
      year: resident.year || '',
      guardianName: resident.guardianName || '',
      guardianPhone: resident.guardianPhone || '',
      emergencyContact: resident.emergencyContact || '',
      status: resident.status || 'Active'
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      if (editingId) {
        await api.put(`/residents/${editingId}`, formData);
        showSuccessToast('Resident updated successfully!');
      } else {
        await api.post('/residents', formData);
        showSuccessToast('Resident added successfully!');
      }
      
      setIsModalOpen(false);
      fetchResidents();
    } catch (err) {
      setError(handleApiError(err, 'Failed to save resident.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (resident) => {
    setResidentToDelete(resident);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/residents/${residentToDelete._id}`);
      showSuccessToast('Resident deleted successfully!');
      setIsDeleteModalOpen(false);
      fetchResidents();
    } catch (err) {
      setError(handleApiError(err, 'Failed to delete resident.'));
    }
  };

  const showSuccessToast = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">Loading residents...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10 font-sans relative">
      
      {/* Success Toast */}
      {success && (
        <div className="fixed top-6 right-6 z-50 bg-white border-l-4 border-emerald-500 p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-3 animate-in fade-in slide-in-from-top-5">
          <CheckCircle2 className="text-emerald-500 w-6 h-6 shrink-0" />
          <p className="text-emerald-800 font-bold">{success}</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 sm:p-8 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Residents</h1>
            <p className="text-gray-500 mt-1">Manage hostel residents, their details and statuses.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search residents..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
              />
            </div>
            <button 
              onClick={openAddModal}
              className="w-full sm:w-auto flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5 active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              <span>Add Resident</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard icon={Users} label="Total Residents" value={totalResidents} color="bg-indigo-100" textColor="text-indigo-600" />
          <StatCard icon={UserCheck} label="Active Residents" value={activeResidents} color="bg-emerald-100" textColor="text-emerald-600" />
          <StatCard icon={UserMinus} label="Checked-Out" value={checkedOutResidents} color="bg-orange-100" textColor="text-orange-600" />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-2xl flex items-start gap-3 shadow-sm animate-in zoom-in-95">
            <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={20} />
            <p className="text-sm text-red-700 font-bold">{error}</p>
          </div>
        )}

        {/* Residents Table */}
        <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
          {filteredResidents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50/80 text-gray-500 text-sm border-b border-gray-100">
                    <th className="px-6 py-5 font-bold uppercase tracking-wider">Register No</th>
                    <th className="px-6 py-5 font-bold uppercase tracking-wider">Name</th>
                    <th className="px-6 py-5 font-bold uppercase tracking-wider">Dept / Year</th>
                    <th className="px-6 py-5 font-bold uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-5 font-bold uppercase tracking-wider">Room</th>
                    <th className="px-6 py-5 font-bold uppercase tracking-wider">Status</th>
                    <th className="px-6 py-5 font-bold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredResidents.map((r, i) => (
                    <tr key={r._id || i} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-gray-700">{r.registerNumber || '-'}</td>
                      <td className="px-6 py-4 font-extrabold text-gray-900">{r.userId?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-gray-600">
                        <span className="font-semibold">{r.department || '-'}</span> 
                        {r.year && <span className="text-gray-500 text-xs ml-2 bg-gray-100 px-2.5 py-1 rounded-full font-bold">{r.year} Yr</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-semibold">{r.phone || '-'}</td>
                      <td className="px-6 py-4 text-gray-600 font-semibold">{r.room?.roomNumber || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          r.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                          r.status === 'Checked-Out' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {r.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button 
                          onClick={() => openEditModal(r)}
                          className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          title="Edit Resident"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => confirmDelete(r)}
                          className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                          title="Delete Resident"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 flex flex-col items-center justify-center text-center bg-gray-50/30">
              <div className="bg-white p-5 rounded-full mb-5 shadow-sm border border-gray-100">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-gray-900 font-extrabold text-xl mb-2">No residents found</h3>
              <p className="text-gray-500 max-w-sm mb-6">There are no residents matching your criteria or the list is empty.</p>
              <button 
                onClick={openAddModal}
                className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add a new resident
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="relative z-10 inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full animate-in zoom-in-95 duration-200">
              <div className="bg-white px-6 pt-6 pb-6 sm:p-8 sm:pb-8 relative">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full p-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <X className="w-5 h-5" />
                </button>

                <h3 className="text-2xl font-extrabold text-gray-900 mb-6" id="modal-title">
                  {editingId ? 'Edit Resident Details' : 'Add New Resident'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    
                    {/* User Dropdown */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Linked User Account *</label>
                      <select 
                        name="userId"
                        value={formData.userId}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-700 transition-all"
                      >
                        <option value="">Select an existing user</option>
                        {users.map(u => (
                          <option key={u._id} value={u._id}>{u.name} ({u.email}) - {u.role}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Register Number *</label>
                      <input 
                        type="text" 
                        name="registerNumber"
                        value={formData.registerNumber}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. REG-2024-001"
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-gray-700 transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number *</label>
                      <input 
                        type="text" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. +1 234 567 8900"
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-gray-700 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Department *</label>
                      <input 
                        type="text" 
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. Computer Science"
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-gray-700 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Year *</label>
                      <input 
                        type="text" 
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. 1st, 2nd, 3rd"
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-gray-700 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Guardian Name</label>
                      <input 
                        type="text" 
                        name="guardianName"
                        value={formData.guardianName}
                        onChange={handleInputChange}
                        placeholder="Guardian's full name"
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-gray-700 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Guardian Phone</label>
                      <input 
                        type="text" 
                        name="guardianPhone"
                        value={formData.guardianPhone}
                        onChange={handleInputChange}
                        placeholder="Guardian's contact"
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-gray-700 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Emergency Contact</label>
                      <input 
                        type="text" 
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleInputChange}
                        placeholder="Emergency number"
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-gray-700 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Status</label>
                      <select 
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-700 transition-all"
                      >
                        <option value="Active">Active</option>
                        <option value="Checked-Out">Checked-Out</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-4 mt-8 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-colors focus:outline-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-70 shadow-lg shadow-indigo-600/30"
                    >
                      {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                      {editingId ? 'Update Resident' : 'Save Resident'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsDeleteModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm w-full animate-in zoom-in-95 duration-200">
              <div className="bg-white px-6 pt-6 pb-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-full bg-red-100 sm:mx-0 sm:h-12 sm:w-12">
                    <AlertCircle className="h-7 w-7 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-4 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-xl leading-6 font-extrabold text-gray-900" id="modal-title">
                      Delete Resident
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 font-medium">
                        Are you sure you want to delete <span className="font-bold text-gray-800">{residentToDelete?.userId?.name || 'this resident'}</span>? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="w-full inline-flex justify-center rounded-2xl border border-transparent shadow-md shadow-red-600/20 px-5 py-3 bg-red-600 text-base font-bold text-white hover:bg-red-700 focus:outline-none sm:w-auto sm:text-sm transition-colors"
                  >
                    Delete permanently
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-2xl border border-gray-300 shadow-sm px-5 py-3 bg-white text-base font-bold text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, textColor }) => (
  <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex items-center gap-5 transition-transform hover:-translate-y-1 duration-300">
    <div className={`p-4 rounded-2xl ${color} ${textColor}`}>
      <Icon className="w-7 h-7" />
    </div>
    <div>
      <p className="text-sm font-bold text-gray-500 tracking-wide mb-0.5">{label}</p>
      <p className="text-3xl font-black text-gray-900">{value}</p>
    </div>
  </div>
);

export default Residents;
