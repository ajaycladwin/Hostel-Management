import React, { useState, useEffect } from 'react';
import api, { handleApiError } from '../services/api';
import { 
  Plus, Edit2, Trash2, Home, Users, CheckCircle, 
  AlertTriangle, Wrench, X, Search, Filter, LogOut, UserPlus
} from 'lucide-react';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Modals state
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomModalMode, setRoomModalMode] = useState('add'); // 'add' or 'edit'
  const [currentRoom, setCurrentRoom] = useState({
    roomNumber: '',
    block: '',
    floor: '',
    capacity: '',
    status: 'Available'
  });

  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [allocateData, setAllocateData] = useState({ roomId: '', residentId: '' });

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutData, setCheckoutData] = useState({ roomId: '', residentId: '', residentName: '' });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteRoomId, setDeleteRoomId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsRes, residentsRes] = await Promise.all([
        api.get('/rooms'),
        api.get('/residents')
      ]);
      setRooms(roomsRes.data);
      setResidents(residentsRes.data);
      setError(null);
    } catch (err) {
      setError(handleApiError(err, 'Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    try {
      if (roomModalMode === 'add') {
        await api.post('/rooms', currentRoom);
        showSuccess('Room created successfully');
      } else {
        await api.put(`/rooms/${currentRoom._id}`, currentRoom);
        showSuccess('Room updated successfully');
      }
      setShowRoomModal(false);
      fetchData();
    } catch (err) {
      setError(handleApiError(err, 'Failed to save room'));
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteRoom = async () => {
    try {
      await api.delete(`/rooms/${deleteRoomId}`);
      showSuccess('Room deleted successfully');
      setShowDeleteModal(false);
      fetchData();
    } catch (err) {
      setError(handleApiError(err, 'Failed to delete room'));
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/rooms/allocate', allocateData);
      showSuccess('Resident allocated successfully');
      setShowAllocateModal(false);
      fetchData();
    } catch (err) {
      setError(handleApiError(err, 'Failed to allocate resident'));
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCheckout = async () => {
    try {
      await api.post('/rooms/checkout', checkoutData);
      showSuccess('Resident checked out successfully');
      setShowCheckoutModal(false);
      fetchData();
    } catch (err) {
      setError(handleApiError(err, 'Failed to checkout resident'));
      setTimeout(() => setError(''), 3000);
    }
  };

  // Stats calculation
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(r => r.status === 'Available').length;
  const fullRooms = rooms.filter(r => r.status === 'Full').length;
  const maintenanceRooms = rooms.filter(r => r.status === 'Maintenance').length;
  const occupiedRooms = totalRooms - availableRooms - maintenanceRooms; // Partial or full

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          room.block.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || room.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Available': return 'bg-green-100 text-green-800 border-green-200';
      case 'Full': return 'bg-red-100 text-red-800 border-red-200';
      case 'Maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading && rooms.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Rooms & Allocation</h1>
          <p className="text-gray-500 mt-1">Manage room availability, occupancy and resident allocation.</p>
        </div>
        <button 
          onClick={() => {
            setRoomModalMode('add');
            setCurrentRoom({ roomNumber: '', block: '', floor: '', capacity: '', status: 'Available' });
            setShowRoomModal(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Plus size={20} /> Add Room
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between animate-fade-in-down">
          <div className="flex items-center gap-2">
            <CheckCircle size={20} /> {successMsg}
          </div>
          <button onClick={() => setSuccessMsg('')}><X size={16} /></button>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between animate-fade-in-down">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} /> {error}
          </div>
          <button onClick={() => setError('')}><X size={16} /></button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><Home size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Total Rooms</p><p className="text-2xl font-bold text-gray-800">{totalRooms}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-green-100 p-3 rounded-lg text-green-600"><CheckCircle size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Available</p><p className="text-2xl font-bold text-gray-800">{availableRooms}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600"><Users size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Occupied</p><p className="text-2xl font-bold text-gray-800">{occupiedRooms}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-red-100 p-3 rounded-lg text-red-600"><AlertTriangle size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Full</p><p className="text-2xl font-bold text-gray-800">{fullRooms}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-yellow-100 p-3 rounded-lg text-yellow-600"><Wrench size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Maintenance</p><p className="text-2xl font-bold text-gray-800">{maintenanceRooms}</p></div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by room number or block..." 
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-500" />
          <select 
            className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Full">Full</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Room Grid */}
      {filteredRooms.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
          <Home className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900">No rooms found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRooms.map(room => (
            <div key={room._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group flex flex-col hover:-translate-y-1">
              
              {/* Card Header */}
              <div className="p-5 border-b border-gray-50 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{room.roomNumber}</h3>
                  <p className="text-sm text-gray-500">Block {room.block} • Floor {room.floor}</p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(room.status)}`}>
                  {room.status}
                </span>
              </div>
              
              {/* Card Body */}
              <div className="p-5 flex-grow space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 flex items-center gap-1"><Users size={16}/> Capacity</span>
                  <span className="font-medium text-gray-700">{room.capacity} Beds</span>
                </div>
                
                <div className="w-full bg-gray-100 rounded-full h-2.5 mb-1 overflow-hidden">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${room.status === 'Full' ? 'bg-red-500' : 'bg-indigo-500'}`}
                    style={{ width: `${(room.occupied / room.capacity) * 100}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{room.occupied} Occupied</span>
                  <span className="font-medium text-indigo-600">{room.capacity - room.occupied} Available</span>
                </div>

                {room.residents && room.residents.length > 0 && (
                  <div className="pt-4 border-t border-gray-50">
                    <p className="text-xs font-medium text-gray-500 mb-2">Current Residents:</p>
                    <div className="space-y-2">
                      {room.residents.map(res => (
                        <div key={res._id} className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 p-2 rounded-lg text-sm transition-colors border border-gray-100">
                          <span className="font-medium text-gray-700">{res.registerNumber}</span>
                          <button 
                            onClick={() => {
                              setCheckoutData({ roomId: room._id, residentId: res._id, residentName: res.registerNumber });
                              setShowCheckoutModal(true);
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors"
                            title="Checkout Resident"
                          >
                            <LogOut size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex gap-2">
                <button 
                  onClick={() => {
                    setCurrentRoom(room);
                    setRoomModalMode('edit');
                    setShowRoomModal(true);
                  }}
                  className="flex-1 flex justify-center items-center gap-1 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors py-1.5"
                >
                  <Edit2 size={16} /> Edit
                </button>
                
                {room.status !== 'Maintenance' && room.status !== 'Full' && (
                  <button 
                    onClick={() => {
                      setAllocateData({ roomId: room._id, residentId: '' });
                      setShowAllocateModal(true);
                    }}
                    className="flex-1 flex justify-center items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-colors py-1.5"
                  >
                    <UserPlus size={16} /> Allocate
                  </button>
                )}
                
                <button 
                  onClick={() => {
                    setDeleteRoomId(room._id);
                    setShowDeleteModal(true);
                  }}
                  className="flex justify-center items-center p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete Room"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Room Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-800">
                {roomModalMode === 'add' ? 'Create New Room' : 'Edit Room Details'}
              </h2>
              <button onClick={() => setShowRoomModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleRoomSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Number <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={currentRoom.roomNumber}
                  onChange={(e) => setCurrentRoom({...currentRoom, roomNumber: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="e.g. 101"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Block <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={currentRoom.block}
                    onChange={(e) => setCurrentRoom({...currentRoom, block: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="e.g. A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Floor <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={currentRoom.floor}
                    onChange={(e) => setCurrentRoom({...currentRoom, floor: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="e.g. 1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={currentRoom.capacity}
                    onChange={(e) => setCurrentRoom({...currentRoom, capacity: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="e.g. 2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    value={currentRoom.status}
                    onChange={(e) => setCurrentRoom({...currentRoom, status: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  >
                    <option value="Available">Available</option>
                    <option value="Maintenance">Maintenance</option>
                    {roomModalMode === 'edit' && <option value="Full">Full</option>}
                  </select>
                </div>
              </div>
              <div className="mt-8 flex gap-3 justify-end pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setShowRoomModal(false)}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-colors"
                >
                  {roomModalMode === 'add' ? 'Create Room' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Allocate Resident Modal */}
      {showAllocateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-800">Allocate Resident</h2>
              <button onClick={() => setShowAllocateModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAllocate} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Resident</label>
                <select 
                  required
                  value={allocateData.residentId}
                  onChange={(e) => setAllocateData({...allocateData, residentId: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="">-- Choose a resident --</option>
                  {residents
                    .filter(r => !r.room && r.status === 'Active') // Only show active residents without a room
                    .map(r => (
                      <option key={r._id} value={r._id}>
                        {r.registerNumber} {r.userId?.name ? `- ${r.userId.name}` : ''}
                      </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1"><AlertTriangle size={12}/> Only active residents without a current room are shown.</p>
              </div>
              <div className="mt-8 flex gap-3 justify-end pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setShowAllocateModal(false)}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!allocateData.residentId}
                  className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Allocate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-center p-6 transform transition-all">
            <div className="mx-auto w-14 h-14 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-5">
              <LogOut size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Checkout</h3>
            <p className="text-gray-500 text-sm mb-8">
              Are you sure you want to checkout resident <strong className="text-gray-800">{checkoutData.residentName}</strong>? This will remove them from the room and change their status to Checked-Out.
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setShowCheckoutModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleCheckout}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm transition-colors font-medium"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-center p-6 transform transition-all">
            <div className="mx-auto w-14 h-14 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-5">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Room?</h3>
            <p className="text-gray-500 text-sm mb-8">
              Are you sure you want to delete this room? This action cannot be undone. Make sure no residents are currently allocated.
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteRoom}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Rooms;
