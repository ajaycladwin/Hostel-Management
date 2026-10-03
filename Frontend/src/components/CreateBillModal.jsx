import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import api, { handleApiError } from '../services/api';

const CreateBillModal = ({ isOpen, onClose, onBillCreated }) => {
  const [residents, setResidents] = useState([]);
  const [formData, setFormData] = useState({
    resident: '',
    room: '',
    roomFee: 0,
    utilityFee: 0,
    serviceFee: 0,
    discount: 0,
    lateFee: 0,
    dueDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchResidents();
    }
  }, [isOpen]);

  const fetchResidents = async () => {
    try {
      const response = await api.get('/residents');
      setResidents(response.data);
    } catch (err) {
      setError(handleApiError(err, 'Failed to fetch residents'));
    }
  };

  const handleResidentChange = (e) => {
    const residentId = e.target.value;
    const resident = residents.find(r => r._id === residentId);
    setFormData(prev => ({
      ...prev,
      resident: residentId,
      room: resident?.room?._id || ''
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['roomFee', 'utilityFee', 'serviceFee', 'discount', 'lateFee'].includes(name) 
        ? Number(value) 
        : value
    }));
  };

  const totalPreview = 
    (formData.roomFee || 0) + 
    (formData.utilityFee || 0) + 
    (formData.serviceFee || 0) + 
    (formData.lateFee || 0) - 
    (formData.discount || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/bills', {
        ...formData,
        totalAmount: totalPreview
      });
      onBillCreated();
      onClose();
    } catch (err) {
      setError(handleApiError(err, 'Failed to create bill'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Generate New Bill</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Resident</label>
              <select 
                name="resident" 
                value={formData.resident}
                onChange={handleResidentChange}
                required
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Resident</option>
                {residents.map(r => (
                  <option key={r._id} value={r._id}>
                    {r.userId?.name || r.registerNumber} — Room {r.room?.roomNumber || 'No Room'}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <input 
                type="date" 
                name="dueDate" 
                value={formData.dueDate}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Room Fee ($)</label>
              <input 
                type="number" 
                name="roomFee" 
                value={formData.roomFee}
                onChange={handleChange}
                min="0"
                required
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Utility Fee ($)</label>
              <input 
                type="number" 
                name="utilityFee" 
                value={formData.utilityFee}
                onChange={handleChange}
                min="0"
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Service Fee ($)</label>
              <input 
                type="number" 
                name="serviceFee" 
                value={formData.serviceFee}
                onChange={handleChange}
                min="0"
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Late Fee ($)</label>
              <input 
                type="number" 
                name="lateFee" 
                value={formData.lateFee}
                onChange={handleChange}
                min="0"
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Discount ($)</label>
              <input 
                type="number" 
                name="discount" 
                value={formData.discount}
                onChange={handleChange}
                min="0"
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="mt-6 bg-indigo-50 p-4 rounded-lg flex justify-between items-center border border-indigo-100">
            <span className="font-medium text-indigo-900">Total Amount:</span>
            <span className="text-2xl font-bold text-indigo-700">${totalPreview}</span>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Generate Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBillModal;
