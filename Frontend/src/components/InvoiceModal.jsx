import React from 'react';
import { X, Printer } from 'lucide-react';

const InvoiceModal = ({ isOpen, onClose, bill }) => {
  if (!isOpen || !bill) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 print:p-0 print:bg-white print:block">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto print:shadow-none print:w-full print:max-w-none print:h-auto print:overflow-visible">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100 print:hidden">
          <h2 className="text-xl font-bold text-gray-800">Invoice Details</h2>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
              <Printer size={20} />
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-8 print:p-4">
          <div className="flex justify-between items-start mb-8 border-b pb-6">
            <div>
              <h1 className="text-3xl font-bold text-indigo-700">INVOICE</h1>
              <p className="text-gray-500 mt-1">#{bill._id}</p>
            </div>
            <div className="text-right">
              <h3 className="font-bold text-gray-800">Hostel Management System</h3>
              <p className="text-sm text-gray-600">123 University Drive</p>
              <p className="text-sm text-gray-600">City, State, 12345</p>
            </div>
          </div>

          <div className="flex justify-between mb-8">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Billed To</p>
              <h3 className="font-bold text-gray-800">{bill.resident?.userId?.name || bill.resident?.registerNumber || 'N/A'}</h3>
              <p className="text-sm text-gray-600">Room: {bill.room?.roomNumber || '—'}</p>
              <p className="text-sm text-gray-600">{bill.resident?.userId?.email || '—'}</p>
            </div>
            <div className="text-right space-y-1">
              <p><span className="text-sm font-medium text-gray-500">Invoice Date:</span> <span className="font-medium">{new Date(bill.createdAt).toLocaleDateString()}</span></p>
              <p><span className="text-sm font-medium text-gray-500">Due Date:</span> <span className="font-medium">{new Date(bill.dueDate).toLocaleDateString()}</span></p>
              <p className="mt-2">
                <span className="text-sm font-medium text-gray-500">Status: </span>
                <span className={`font-bold ${bill.paymentStatus === 'Paid' ? 'text-green-600' : bill.paymentStatus === 'Overdue' ? 'text-red-600' : 'text-amber-600'}`}>
                  {bill.paymentStatus.toUpperCase()}
                </span>
              </p>
            </div>
          </div>

          <table className="w-full text-left border-collapse mb-8">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-200">
                <th className="py-3 px-4 font-semibold text-gray-700">Description</th>
                <th className="py-3 px-4 font-semibold text-gray-700 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-3 px-4 text-gray-800">Room Fee</td>
                <td className="py-3 px-4 text-right text-gray-600">${bill.roomFee || 0}</td>
              </tr>
              {bill.utilityFee > 0 && (
                <tr>
                  <td className="py-3 px-4 text-gray-800">Utility Fee</td>
                  <td className="py-3 px-4 text-right text-gray-600">${bill.utilityFee}</td>
                </tr>
              )}
              {bill.serviceFee > 0 && (
                <tr>
                  <td className="py-3 px-4 text-gray-800">Service Fee</td>
                  <td className="py-3 px-4 text-right text-gray-600">${bill.serviceFee}</td>
                </tr>
              )}
              {bill.lateFee > 0 && (
                <tr>
                  <td className="py-3 px-4 text-gray-800">Late Fee</td>
                  <td className="py-3 px-4 text-right text-gray-600">${bill.lateFee}</td>
                </tr>
              )}
              {bill.discount > 0 && (
                <tr>
                  <td className="py-3 px-4 text-green-600">Discount</td>
                  <td className="py-3 px-4 text-right text-green-600">-${bill.discount}</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200">
                <td className="py-4 px-4 font-bold text-gray-800 text-right">Total</td>
                <td className="py-4 px-4 font-bold text-indigo-700 text-xl text-right">${bill.totalAmount}</td>
              </tr>
            </tfoot>
          </table>

          {bill.paymentStatus === 'Paid' && (
            <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-green-800 mb-8">
              <p className="font-bold">Payment Received on {new Date(bill.paidAt).toLocaleString()}</p>
              {bill.razorpayPaymentId && (
                <p className="text-sm mt-1 text-green-700">Transaction ID: {bill.razorpayPaymentId}</p>
              )}
            </div>
          )}
          
          <div className="text-center text-sm text-gray-500 mt-12 border-t pt-6">
            <p>Thank you for your payment.</p>
            <p>If you have any questions concerning this invoice, contact administration.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
