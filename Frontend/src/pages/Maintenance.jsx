import React, { useState, useEffect } from 'react';
import { Wrench, CheckCircle, Clock, AlertCircle, Plus, X, Activity } from 'lucide-react';
import api, { handleApiError } from '../services/api';

const Maintenance = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const userStr = localStorage.getItem('user');
  const userRole = userStr ? JSON.parse(userStr).role : 'resident';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Other',
    priority: 'Medium',
    // For admin/staff: optionally specify resident and room
    resident: '',
    room: ''
  });

  const [residents, setResidents] = useState([]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/maintenance');
      setRequests(response.data);
    } catch (err) {
      setError(handleApiError(err, 'Failed to fetch maintenance requests'));
    } finally {
      setLoading(false);
    }
  };

  const fetchResidents = async () => {
    if (userRole === 'admin' || userRole === 'staff') {
      try {
        const res = await api.get('/residents');
        setResidents(res.data);
      } catch (err) {
        console.error('Failed to fetch residents', err);
      }
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchResidents();
  }, []);

  const showSuccessMsg = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      // Use PATCH /:id/status endpoint
      await api.patch(`/maintenance/${id}/status`, { status });
      showSuccessMsg(`Request marked as "${status}"`);
      fetchRequests();
    } catch (err) {
      setError(handleApiError(err, 'Failed to update status'));
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleResidentChange = (e) => {
    const residentId = e.target.value;
    const resident = residents.find(r => r._id === residentId);
    setFormData(prev => ({
      ...prev,
      resident: residentId,
      room: resident?.room?._id || resident?.room || ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority
      };

      // Admin/staff must specify a resident
      if (userRole !== 'resident') {
        if (!formData.resident) {
          setError('Please select a resident');
          setSubmitting(false);
          return;
        }
        payload.resident = formData.resident;
        payload.room = formData.room;
      }

      await api.post('/maintenance', payload);
      showSuccessMsg('Maintenance request submitted successfully!');
      setShowModal(false);
      setFormData({ title: '', description: '', category: 'Other', priority: 'Medium', resident: '', room: '' });
      fetchRequests();
    } catch (err) {
      setError(handleApiError(err, 'Failed to submit maintenance request'));
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      Low: 'bg-green-100 text-green-700',
      Medium: 'bg-yellow-100 text-yellow-700',
      High: 'bg-red-100 text-red-700'
    };
    return <span className={`px-2 py-1 rounded text-xs font-semibold ${styles[priority] || 'bg-gray-100 text-gray-700'}`}>{priority}</span>;
  };

  const getStatusBadge = (status) => {
    const styles = {
      Pending: 'bg-orange-100 text-orange-700',
      'In Progress': 'bg-blue-100 text-blue-700',
      Completed: 'bg-green-100 text-green-700'
    };
    return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Maintenance Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage maintenance issues</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
        >
          <Plus size={16} />
          Submit Request
        </button>
      </div>

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-start gap-3">
          <CheckCircle className="text-green-500 mt-0.5" size={18} />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
          <AlertCircle className="text-red-500 mt-0.5" size={18} />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-lg"><Clock size={20} className="text-orange-600" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Pending</p>
            <p className="text-2xl font-bold text-gray-800">{requests.filter(r => r.status === 'Pending').length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg"><Activity size={20} className="text-blue-600" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">In Progress</p>
            <p className="text-2xl font-bold text-gray-800">{requests.filter(r => r.status === 'In Progress').length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg"><CheckCircle size={20} className="text-green-600" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Completed</p>
            <p className="text-2xl font-bold text-gray-800">{requests.filter(r => r.status === 'Completed').length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                <th className="p-4 font-medium">Issue</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Room</th>
                {(userRole === 'admin' || userRole === 'staff') && <th className="p-4 font-medium">Resident</th>}
                <th className="p-4 font-medium">Priority</th>
                <th className="p-4 font-medium">Status</th>
                {(userRole === 'admin' || userRole === 'staff') && <th className="p-4 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center">
                    <Wrench size={40} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 font-medium">No maintenance requests found</p>
                    <p className="text-sm text-gray-400 mt-1">Submit a request using the button above</p>
                  </td>
                </tr>
              ) : (
                requests.map(request => (
                  <tr key={request._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{request.title}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">{request.description}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{request.category || '—'}</td>
                    <td className="p-4 font-medium text-gray-700">{request.room?.roomNumber || '—'}</td>
                    {(userRole === 'admin' || userRole === 'staff') && (
                      <td className="p-4 text-sm text-gray-600">
                        {request.resident?.userId?.name || '—'}
                      </td>
                    )}
                    <td className="p-4">{getPriorityBadge(request.priority)}</td>
                    <td className="p-4">{getStatusBadge(request.status)}</td>
                    {(userRole === 'admin' || userRole === 'staff') && (
                      <td className="p-4">
                        {request.status !== 'Completed' && (
                          <div className="flex items-center gap-2">
                            {request.status === 'Pending' && (
                              <button
                                onClick={() => handleStatusUpdate(request._id, 'In Progress')}
                                className="text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors flex items-center gap-1"
                              >
                                <Clock size={12} /> Start
                              </button>
                            )}
                            <button
                              onClick={() => handleStatusUpdate(request._id, 'Completed')}
                              className="text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 px-2 py-1 rounded transition-colors flex items-center gap-1"
                            >
                              <CheckCircle size={12} /> Complete
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Wrench size={20} className="text-indigo-500" />
                Submit Maintenance Request
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

              {/* Admin/Staff: select resident */}
              {(userRole === 'admin' || userRole === 'staff') && (
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Resident *</label>
                  <select
                    value={formData.resident}
                    onChange={handleResidentChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="">Select Resident</option>
                    {residents.map(r => (
                      <option key={r._id} value={r._id}>
                        {r.userId?.name || r.registerNumber} — Room {r.room?.roomNumber || 'N/A'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Brief description of the issue"
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  placeholder="Detailed description of the issue..."
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm font-medium"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
