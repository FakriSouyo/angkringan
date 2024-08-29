import React, { useState, useEffect } from "react";
import { Element } from "react-scroll";
import { motion } from "framer-motion";
import { FiPlus, FiMinus, FiShoppingCart, FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

export default function Menu({ session, limit = 6, addToCart }) {
  const [menuItems, setMenuItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  async function fetchMenuItems() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('status', 'active')  // Hanya ambil item dengan status 'active'
        .limit(limit);
      
      if (error) throw error;
      
      const itemsWithImageUrls = data.map(item => ({
        ...item,
        image_url: getImageUrl(item.image_url)
      }));
      setMenuItems(itemsWithImageUrls);
      setQuantities(itemsWithImageUrls.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {}));
    } catch (error) {
      setError('Error fetching menu items');
      console.error('Error fetching menu items:', error);
      toast.error('Failed to load menu items. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  const getImageUrl = (imageUrl) => {
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    } else {
      return supabase.storage.from('menuimg').getPublicUrl(imageUrl).data.publicUrl;
    }
  };

  const handleIncrement = (id) => {
    setQuantities(prev => ({ ...prev, [id]: prev[id] + 1 }));
  };

  const handleDecrement = (id) => {
    setQuantities(prev => ({ ...prev, [id]: Math.max(0, prev[id] - 1) }));
  };

  const handleAddToCart = (id) => {
    const item = menuItems.find(item => item.id === id);
    const quantity = quantities[id];

    if (quantity > 0) {
      addToCart({
        menu_item_id: id,
        quantity: quantity,
        title: item.title,
        price: item.price
      });
      setQuantities(prev => ({ ...prev, [id]: 0 }));
      toast.success(`${quantity} ${item.title}(s) added to cart`);
    } else {
      toast.error('Please select a quantity greater than 0');
    }
  };

  if (loading) return <p>Loading menu...</p>;
  if (error) return <p>{error}</p>;

  return (
    <Element id="menu" className="bg-gradient-to-b from-background to-secondary py-8 sm:py-12 md:py-16 lg:py-24 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-6 sm:mb-8 md:mb-12 text-center"
        >
          Menu Kami
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-card rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
            >
              <img 
                src={item.image_url} 
                alt={item.title} 
                className="w-full h-36 sm:h-48 object-contain"
              />
              <div className="p-4 sm:p-6 flex-grow flex flex-col">
                <h3 className="text-lg sm:text-xl font-bold text-card-foreground mb-2">{item.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 flex-grow">{item.description}</p>
                <p className="text-primary font-bold text-base sm:text-lg mb-3 sm:mb-4">Rp {item.price.toLocaleString()}</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleDecrement(item.id)}
                      className="bg-primary text-primary-foreground rounded-full p-1 hover:bg-primary/80 transition-colors duration-200"
                    >
                      <FiMinus className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <span className="font-bold text-sm sm:text-base">{quantities[item.id]}</span>
                    <button 
                      onClick={() => handleIncrement(item.id)}
                      className="bg-primary text-primary-foreground rounded-full p-1 hover:bg-primary/80 transition-colors duration-200"
                    >
                      <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                  <button 
                    onClick={() => handleAddToCart(item.id)}
                    className="flex items-center space-x-1 sm:space-x-2 bg-primary text-primary-foreground px-3 py-1 sm:px-4 sm:py-2 rounded-full hover:bg-primary/80 transition-colors duration-200 text-sm sm:text-base"
                  >
                    <FiShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link 
            to="/full-menu"
            className="inline-flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-primary/80 transition-colors duration-200"
          >
            <span>Lihat Semua Menu</span>
            <FiArrowRight />
          </Link>
        </div>
      </div>
    </Element>
  );
}