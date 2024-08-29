import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { FiEye, FiFileText, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showProofOfPayment, setShowProofOfPayment] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTransactions();
  }, [currentPage]);

  const getImageUrl = (imageUrl) => {
    if (imageUrl && imageUrl.startsWith('http')) {
      return imageUrl;
    } else if (imageUrl) {
      return supabase.storage.from('buktibyr').getPublicUrl(imageUrl).data.publicUrl;
    }
    return null;
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error, count } = await supabase
        .from('orders')
        .select('*, order_items(*, menu_items(title)), users(email), proof_of_payment_url', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (error) throw error;
      
      const processedData = data.map(transaction => ({
        ...transaction,
        proof_of_payment_url: getImageUrl(transaction.proof_of_payment_url)
      }));
      
      setTransactions(processedData);
      setTotalPages(Math.ceil(count / itemsPerPage));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Gagal memuat riwayat transaksi');
    } finally {
      setLoading(false);
    }
  };

  const downloadAllTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, menu_items(title)), users(email)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(data.map(transaction => ({
        ID: transaction.id,
        Tanggal: new Date(transaction.created_at).toLocaleString(),
        Total: `Rp ${transaction.total_amount.toLocaleString()}`,
        Status: transaction.status,
        'Status Pembayaran': transaction.payment_status,
        'Metode Pembayaran': transaction.payment_method,
        'Email Pengguna': transaction.users?.email,
        'Item': transaction.order_items.map(item => `${item.menu_items?.title} (x${item.quantity})`).join(', ')
      })));

      XLSX.utils.book_append_sheet(workbook, worksheet, "Transaksi");
      XLSX.writeFile(workbook, "riwayat_transaksi.xlsx");

      toast.success('Data transaksi berhasil diunduh');
    } catch (error) {
      console.error('Error downloading transactions:', error);
      toast.error('Gagal mengunduh data transaksi');
    } finally {
      setLoading(false);
    }
  };

  const renderTransactionDetails = (transaction) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold mb-4">Detail Transaksi</h3>
        <p><strong>ID Pesanan:</strong> {transaction.id}</p>
        <p><strong>Tanggal:</strong> {new Date(transaction.created_at).toLocaleString()}</p>
        <p><strong>Status:</strong> {transaction.status}</p>
        <p><strong>Status Pembayaran:</strong> {transaction.payment_status}</p>
        <p><strong>Metode Pembayaran:</strong> {transaction.payment_method}</p>
        <h4 className="font-bold mt-4 mb-2">Item:</h4>
        <ul>
        {transaction.order_items.map((item) => (
            <li key={item.id}>
              {item.menu_items?.title || 'Item Tidak Dikenal'} x{item.quantity} - Rp {item.price.toLocaleString()}
            </li>
          ))}
        </ul>
        <p className="font-bold mt-4">Total: Rp {transaction.total_amount.toLocaleString()}</p>
        
        <div className="mt-6 flex justify-end">
          <button onClick={() => setSelectedTransaction(null)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md">Tutup</button>
        </div>
      </div>
    </div>
  );

  const renderProofOfPayment = (transaction) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold mb-4">Bukti Pembayaran</h3>
        <p><strong>ID Pesanan:</strong> {transaction.id}</p>
        <p><strong>Metode Pembayaran:</strong> {transaction.payment_method}</p>
        
        {transaction.payment_method !== 'Bayar di Tempat' && transaction.proof_of_payment_url ? (
          <div className="mt-4">
            <img 
              src={transaction.proof_of_payment_url} 
              alt="Bukti Pembayaran" 
              className="max-w-full h-auto" 
            />
          </div>
        ) : transaction.payment_method === 'Bayar di Tempat' ? (
          <p className="mt-4"><em>Bayar di tempat - Tidak memerlukan bukti pembayaran</em></p>
        ) : (
          <p className="mt-4"><em>Bukti pembayaran belum diunggah</em></p>
        )}
        
        <div className="mt-6 flex justify-end">
          <button onClick={() => setShowProofOfPayment(false)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md">Tutup</button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div>Memuat...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Riwayat Transaksi</h2>
        <button
          onClick={downloadAllTransactions}
          className="bg-black border border-black hover:bg-transparent text-white hover:text-black font-bold py-2 px-4 rounded flex items-center"
        >
          <FiDownload className="mr-2" /> Download
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">ID Pesanan</th>
              <th className="p-2 text-left">Tanggal</th>
              <th className="p-2 text-left">Total</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Status Pembayaran</th>
              <th className="p-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="border-b">
                <td className="p-2">{transaction.id}</td>
                <td className="p-2">{new Date(transaction.created_at).toLocaleString()}</td>
                <td className="p-2">Rp {transaction.total_amount.toLocaleString()}</td>
                <td className="p-2">{transaction.status}</td>
                <td className="p-2">{transaction.payment_status}</td>
                <td className="p-2 flex">
                  <button
                    onClick={() => setSelectedTransaction(transaction)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                    title="Lihat Detail Transaksi"
                  >
                    <FiEye />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTransaction(transaction);
                      setShowProofOfPayment(true);
                    }}
                    className="text-green-500 hover:text-green-700 mr-2"
                    title="Lihat Bukti Pembayaran"
                  >
                    <FiFileText />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-center">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 rounded-l-md"
        >
          Sebelumnya
        </button>
        <span className="px-4 py-2 bg-gray-100">
          Halaman {currentPage} dari {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-200 rounded-r-md"
        >
          Selanjutnya
        </button>
      </div>
      {selectedTransaction && !showProofOfPayment && renderTransactionDetails(selectedTransaction)}
      {selectedTransaction && showProofOfPayment && renderProofOfPayment(selectedTransaction)}
    </div>
  );
};

export default TransactionHistory;