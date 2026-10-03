import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, AlertCircle, Eye, CreditCard, Search, Filter } from 'lucide-react';
import api, { handleApiError } from '../services/api';
import CreateBillModal from '../components/CreateBillModal';
import InvoiceModal from '../components/InvoiceModal';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  // Filtering & Stats
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Get current user role from the user object stored in localStorage
  const userStr = localStorage.getItem('user');
  const userRole = userStr ? (JSON.parse(userStr).role || 'resident') : 'resident';

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bills');
      setBills(response.data);
    } catch (err) {
      setError(handleApiError(err, 'Failed to fetch bills'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handlePayRazorpay = async (bill) => {
    try {
      setError('');
      // Load script
      const res = await loadRazorpayScript();
      if (!res) {
        setError('Razorpay SDK failed to load. Are you online?');
        return;
      }

      // Create Order on Backend
      const orderRes = await api.post(`/bills/${bill._id}/create-order`);
      const { order, key_id, mock } = orderRes.data;

      // Handle mock mode
      if (mock) {
        await api.post(`/bills/${bill._id}/verify-payment`, {
          razorpay_order_id: order.id,
          razorpay_payment_id: `mock_pay_${Date.now()}`,
          razorpay_signature: 'mock_sig'
        });
        fetchBills();
        alert('Mock Payment Successful (No Razorpay Keys Configured)');
        return;
      }

      // Initialize Razorpay Options
      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'Hostel Management System',
        description: `Payment for Bill #${bill._id}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            // Verify Signature on Backend
            await api.post(`/bills/${bill._id}/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            fetchBills(); // Refresh
            alert('Payment Successful!');
          } catch (err) {
            alert(handleApiError(err, 'Payment Verification Failed'));
          }
        },
        prefill: {
          name: bill.resident?.name || 'Resident',
          email: bill.resident?.email || 'resident@example.com',
        },
        theme: {
          color: '#4f46e5'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      setError(handleApiError(err, 'Failed to initiate payment. Check configuration.'));
    }
  };

  // Stats calculation
  const totalBills = bills.length;
  const paidBills = bills.filter(b => b.paymentStatus === 'Paid').length;
  const unpaidBills = bills.filter(b => b.paymentStatus === 'Unpaid').length;
  const overdueBills = bills.filter(b => b.paymentStatus === 'Overdue').length;
  const totalRevenue = bills.filter(b => b.paymentStatus === 'Paid').reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  const pendingAmount = bills.filter(b => b.paymentStatus !== 'Paid').reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

  const filteredBills = bills.filter(b => {
    const matchesStatus = filterStatus === 'All' || b.paymentStatus === filterStatus;
    const residentName = b.resident?.userId?.name || b.resident?.registerNumber || '';
    const matchesSearch = residentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b._id.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Billing & Payments</h1>
          <p className="text-sm text-gray-500 mt-1">Manage invoices and track payments</p>
        </div>
        {(userRole === 'admin' || userRole === 'staff') && (
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
          >
            <FileText size={16} />
            Generate Bill
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
          <AlertCircle className="text-red-500 mt-0.5" size={18} />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Total Bills</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{totalBills}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Paid</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{paidBills}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Unpaid</p>
          <p className="text-2xl font-bold text-amber-500 mt-1">{unpaidBills}</p>
        </div>
        {(userRole === 'admin' || userRole === 'staff') && (
          <>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">${totalRevenue}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 font-medium">Pending Amount</p>
              <p className="text-2xl font-bold text-red-500 mt-1">${pendingAmount}</p>
            </div>
          </>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by resident name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={18} className="text-gray-400" />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                <th className="p-4 font-medium">Invoice ID</th>
                <th className="p-4 font-medium">Resident</th>
                <th className="p-4 font-medium">Room</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Due Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">No bills found matching your criteria.</td>
                </tr>
              ) : (
                filteredBills.map(bill => (
                  <tr key={bill._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-xs font-mono text-gray-500">{bill._id.substring(0, 8)}...</td>
                    <td className="p-4 font-medium text-gray-900">{bill.resident?.userId?.name || bill.resident?.registerNumber || 'N/A'}</td>
                    <td className="p-4 text-gray-600 text-sm">{bill.room?.roomNumber || bill.resident?.room?.roomNumber || 'N/A'}</td>
                    <td className="p-4 font-bold text-indigo-600">${bill.totalAmount}</td>
                    <td className="p-4 text-sm text-gray-600">{new Date(bill.dueDate).toLocaleDateString()}</td>
                    <td className="p-4">
                      {bill.paymentStatus === 'Paid' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Paid</span>
                      ) : bill.paymentStatus === 'Overdue' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Overdue</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Unpaid</span>
                      )}
                    </td>
                    <td className="p-4 flex gap-2">
                      <button 
                        onClick={() => setSelectedInvoice(bill)}
                        className="text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                        title="View Invoice"
                      >
                        <Eye size={14} /> View
                      </button>
                      
                      {bill.paymentStatus !== 'Paid' && userRole === 'resident' && (
                        <button 
                          onClick={() => handlePayRazorpay(bill)}
                          className="text-xs font-medium text-white bg-indigo-500 hover:bg-indigo-600 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <CreditCard size={14} /> Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateBillModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onBillCreated={fetchBills} 
      />

      <InvoiceModal 
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        bill={selectedInvoice}
      />
    </div>
  );
};

export default Billing;
