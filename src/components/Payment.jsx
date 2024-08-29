import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUpload } from 'react-icons/fi';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

const Payment = ({ isOpen, onClose, orderId, totalAmount }) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [qrisCode, setQrisCode] = useState(null);
  const [proofOfPayment, setProofOfPayment] = useState(null);

  useEffect(() => {
    if (isOpen) {
      console.log("Payment opened. Order ID:", orderId, "Total Amount:", totalAmount);
      fetchPaymentMethods();
      fetchBankAccounts();
      fetchQrisCode();
      fetchOrderDetails(); // New function to fetch order details
    }
  }, [isOpen, orderId, totalAmount]);

  const fetchPaymentMethods = async () => {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('is_active', true);
    if (error) {
      toast.error('Failed to load payment methods');
    } else {
      setPaymentMethods(data);
    }
  };

  const fetchOrderDetails = async () => {
    try {
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
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;

      console.log("Order details:", data);
      console.log("Order items:", data.order_items);

      // Verify if the total amount matches
      const calculatedTotal = data.order_items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      console.log("Calculated total:", calculatedTotal, "Provided total:", totalAmount);

      if (calculatedTotal !== totalAmount) {
        console.warn("Total amount mismatch. Calculated:", calculatedTotal, "Provided:", totalAmount);
      }

    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const fetchBankAccounts = async () => {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*');
    if (error) {
      toast.error('Failed to load bank accounts');
    } else {
      setBankAccounts(data);
    }
  };

  const fetchQrisCode = async () => {
    const { data, error } = await supabase
      .from('qris_codes')
      .select('*')
      .eq('is_active', true)
      .single();
    if (error) {
      toast.error('Failed to load QRIS code');
    } else {
      setQrisCode(data);
    }
  };

  const handlePaymentMethodChange = (methodId) => {
    setSelectedMethod(methodId);
    setProofOfPayment(null);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setProofOfPayment(file);
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error('Please select a payment method');
      return;
    }

    if (selectedMethod !== 'Bayar di Tempat' && !proofOfPayment) {
      toast.error('Please upload proof of payment');
      return;
    }

    try {
      let proofUrl = null;
      if (proofOfPayment) {
        const { data, error } = await supabase.storage
          .from('buktibyr')
          .upload(`${orderId}_${Date.now()}.png`, proofOfPayment);
        if (error) throw error;
        proofUrl = data.path;
      }

      const { error } = await supabase
        .from('orders')
        .update({
          payment_method: selectedMethod,
          payment_status: selectedMethod === 'Bayar di Tempat' ? 'pending' : 'paid',
          proof_of_payment_url: proofUrl
        })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Proses pembayaran berhasil');
      onClose();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to process payment');
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
            className="bg-card p-6 rounded-lg shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-primary">Pembayaran</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-primary">
                <FiX size={24} />
              </button>
            </div>
            <div className="mb-4">
              <p className="font-semibold">Total: Rp {(Number(totalAmount) || 0).toLocaleString()}</p>
            </div>
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Pilih Metode Pembayaran:</h3>
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center mb-2">
                  <input
                    type="radio"
                    id={method.name}
                    name="paymentMethod"
                    value={method.name}
                    checked={selectedMethod === method.name}
                    onChange={() => handlePaymentMethodChange(method.name)}
                    className="mr-2"
                  />
                  <label htmlFor={method.name}>{method.name}</label>
                </div>
              ))}
            </div>

            {selectedMethod === 'Transfer Bank' && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Informasi Rekening:</h3>
                {bankAccounts.map((account) => (
                  <p key={account.id}>
                    {account.bank_name}: {account.account_number} (a.n. {account.account_name})
                  </p>
                ))}
              </div>
            )}

            {selectedMethod === 'QRIS' && qrisCode && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">QRIS Code:</h3>
                <img src={qrisCode.image_url} alt="QRIS Code" className="w-full max-w-xs mx-auto" />
              </div>
            )}

            {selectedMethod && selectedMethod !== 'Bayar di Tempat' && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Upload Bukti Pembayaran:</h3>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FiUpload className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 800x400px)</p>
                    </div>
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
                {proofOfPayment && (
                  <p className="mt-2 text-sm text-gray-500">File selected: {proofOfPayment.name}</p>
                )}
              </div>
            )}

            <button
              onClick={handlePayment}
              className={`w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition duration-300 ${
                (selectedMethod === 'Bayar di Tempat' || proofOfPayment) ? '' : 'opacity-50 cursor-not-allowed'
              }`}
              disabled={selectedMethod !== 'Bayar di Tempat' && !proofOfPayment}
            >
              Bayar Sekarang
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Payment;