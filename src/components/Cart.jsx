import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';
import Payment from './Payment';

const Cart = ({ isOpen, onClose, openLoginModal, session, cartItems, removeFromCart, clearCart }) => {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      calculateTotalAmount(cartItems);
    }
  }, [isOpen, cartItems]);

  const calculateTotalAmount = (items) => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotalAmount(total);
  };

  const handleRemoveItem = (id) => {
    removeFromCart(id);
    toast.success('Item removed from cart');
  };

  const handleUpdateQuantity = (id, change) => {
    const updatedCart = cartItems.map(item => {
      if (item.menu_item_id === id) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('storage'));
  };

  const handleOrder = async () => {
    if (!session) {
      openLoginModal();
      return;
    }

    try {
      // Create a new order
      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: session.user.id,
          total_amount: totalAmount,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Move cart items to order_items
      const orderItems = cartItems.map(item => ({
        order_id: data.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: orderItemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (orderItemsError) throw orderItemsError;

      // Clear the cart
      clearCart();

      setOrderId(data.id);
      setIsPaymentOpen(true);
      onClose(); // Close the cart modal
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
    }
  };

  return (
    <>
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
                <h2 className="text-2xl font-bold text-primary">Keranjang</h2>
                <button onClick={onClose} className="text-muted-foreground hover:text-primary">
                  <FiX size={24} />
                </button>
              </div>
              {!session ? (
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">Silakan login untuk melihat keranjang Anda.</p>
                  <button
                    onClick={openLoginModal}
                    className="bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition duration-300"
                  >
                    Login
                  </button>
                </div>
              ) : cartItems.length === 0 ? (
                <p className="text-center text-muted-foreground">Keranjang Anda kosong.</p>
              ) : (
                <>
                  <ul className="space-y-4 mb-4 max-h-60 overflow-y-auto">
                    {cartItems.map((item) => (
                      <li key={item.menu_item_id} className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Rp {item.price.toLocaleString()}
                          </p>
                          <div className="flex items-center mt-1">
                            <button
                              onClick={() => handleUpdateQuantity(item.menu_item_id, -1)}
                              className="bg-primary text-primary-foreground rounded-full p-1 hover:bg-primary/80 transition-colors duration-200"
                            >
                              <FiMinus size={16} />
                            </button>
                            <span className="mx-2">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.menu_item_id, 1)}
                              className="bg-primary text-primary-foreground rounded-full p-1 hover:bg-primary/80 transition-colors duration-200"
                            >
                              <FiPlus size={16} />
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.menu_item_id)}
                          className="text-red-500 hover:text-red-700 transition-colors duration-200"
                        >
                          <FiTrash2 size={20} />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-primary">Rp {totalAmount.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={handleOrder}
                      className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition duration-300 flex items-center justify-center"
                    >
                      Pesan Sekarang
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Payment 
        isOpen={isPaymentOpen} 
        onClose={() => {
          setIsPaymentOpen(false);
        }} 
        orderId={orderId}
        totalAmount={totalAmount}
      />
    </>
  );
};

export default Cart;