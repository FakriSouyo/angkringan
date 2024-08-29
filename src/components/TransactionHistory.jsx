import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

const TransactionHistory = ({ isOpen, onClose, session }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session && isOpen) {
      fetchTransactions();
    }
  }, [session, isOpen]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            menu_item_id,
            quantity,
            price,
            menu_items (title)
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Gagal memuat riwayat transaksi');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-yellow-500';
      case 'processing':
        return 'text-blue-500';
      case 'completed':
        return 'text-green-500';
      case 'cancelled':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'text-green-500';
      case 'unpaid':
        return 'text-red-500';
      case 'pending':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-primary">Riwayat Transaksi</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-primary">
                <FiX size={24} />
              </button>
            </div>
            {loading ? (
              <p className="text-center text-muted-foreground">Memuat transaksi...</p>
            ) : transactions.length === 0 ? (
              <p className="text-center text-muted-foreground">Tidak ada transaksi ditemukan.</p>
            ) : (
              <div className="space-y-6">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="border border-border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">Pesanan #{transaction.id}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">Status:</span>{' '}
                      <span className={`font-bold ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">Metode Pembayaran:</span> {transaction.payment_method}
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">Status Pembayaran:</span>{' '}
                      <span className={`font-bold ${getPaymentStatusColor(transaction.payment_status)}`}>
                        {transaction.payment_status}
                      </span>
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">Item:</span>
                      <ul className="list-disc list-inside">
                        {transaction.order_items.map((item, index) => (
                          <li key={index}>
                            {item.menu_items.title} x{item.quantity} - Rp {item.price.toLocaleString()}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="font-semibold text-right">
                      Total: Rp {transaction.total_amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TransactionHistory;