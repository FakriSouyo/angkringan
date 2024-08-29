import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { FiEye, FiCheck, FiX, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';

const PaymentManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showProofOfPayment, setShowProofOfPayment] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const getImageUrl = (imageUrl) => {
    if (imageUrl && imageUrl.startsWith('http')) {
      return imageUrl;
    } else if (imageUrl) {
      return supabase.storage.from('buktibyr').getPublicUrl(imageUrl).data.publicUrl;
    }
    return null;
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            menu_item_id,
            quantity,
            price,
            menu_items (id, title)
          ),
          proof_of_payment_url
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const processedData = data.map(order => ({
          ...order,
          proof_of_payment_url: getImageUrl(order.proof_of_payment_url)
        }));
        setOrders(processedData);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaymentStatus = async (orderId, newStatus, userId) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ payment_status: newStatus })
        .eq('id', orderId)
        .single();
      if (error) throw error;
      setOrders(orders.map(order => order.id === orderId ? { ...order, payment_status: newStatus } : order));
      toast.success(`Payment status updated to ${newStatus}`);
      
      // Send notification
      await sendNotification(userId, `Payment status for order #${orderId} updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus, userId) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
        .single();
      if (error) throw error;
      setOrders(orders.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
      toast.success(`Order status updated to ${newStatus}`);
      
      // Send notification
      await sendNotification(userId, `Order status for order #${orderId} updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const sendNotification = async (userId, message) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({ user_id: userId, message, read: false });
      if (error) throw error;
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const renderOrderDetails = (order) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold mb-4">Order Details</h3>
        <p><strong>Order ID:</strong> {order.id}</p>
        <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Payment Status:</strong> {order.payment_status}</p>
        <p><strong>Payment Method:</strong> {order.payment_method}</p>
        <h4 className="font-bold mt-4 mb-2">Items:</h4>
        {order.order_items && order.order_items.length > 0 ? (
          <ul className="list-disc list-inside">
            {order.order_items.map((item, index) => (
              <li key={index}>
                {item.menu_items.title} x{item.quantity} - Rp {item.price.toLocaleString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>No items in this order.</p>
        )}
        <p className="font-bold mt-4">Total: Rp {order.total_amount.toLocaleString()}</p>
        
        <div className="mt-6 flex justify-end">
          <button onClick={() => setSelectedOrder(null)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md">Close</button>
        </div>
      </div>
    </div>
  );

  const renderProofOfPayment = (order) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold mb-4">Proof of Payment</h3>
        <p><strong>Order ID:</strong> {order.id}</p>
        <p><strong>Payment Method:</strong> {order.payment_method}</p>
        
        {order.payment_method !== 'Bayar di Tempat' && order.proof_of_payment_url ? (
          <div className="mt-4">
            <img 
              src={order.proof_of_payment_url} 
              alt="Proof of Payment" 
              className="max-w-full h-auto" 
            />
          </div>
        ) : order.payment_method === 'Bayar di Tempat' ? (
          <p className="mt-4"><em>Pay at location - No proof of payment required</em></p>
        ) : (
          <p className="mt-4"><em>No proof of payment uploaded yet</em></p>
        )}
        
        <div className="mt-6 flex justify-end">
          <button onClick={() => setShowProofOfPayment(false)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md">Close</button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Pembayaran</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">ID Pesanan</th>
              <th className="p-2 text-left">Tanggal</th>
              <th className="p-2 text-left">Total</th>
              <th className="p-2 text-left">Status Order</th>
              <th className="p-2 text-left">Status Pembayaran</th>
              <th className="p-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="p-2">{order.id}</td>
                <td className="p-2">{new Date(order.created_at).toLocaleString()}</td>
                <td className="p-2">Rp {order.total_amount.toLocaleString()}</td>
                <td className="p-2">
                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value, order.user_id)}
                    className="border rounded p-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="p-2">
                  <select
                    value={order.payment_status}
                    onChange={(e) => handleUpdatePaymentStatus(order.id, e.target.value, order.user_id)}
                    className="border rounded p-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                  </select>
                </td>
                <td className="p-2 flex">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                    title="View Order Details"
                  >
                    <FiEye />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowProofOfPayment(true);
                    }}
                    className="text-green-500 hover:text-green-700 mr-2"
                    title="View Proof of Payment"
                  >
                    <FiFileText />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedOrder && !showProofOfPayment && renderOrderDetails(selectedOrder)}
      {selectedOrder && showProofOfPayment && renderProofOfPayment(selectedOrder)}
    </div>
  );
};

export default PaymentManagement;