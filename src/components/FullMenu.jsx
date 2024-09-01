import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { FiSearch, FiShoppingCart, FiPlus, FiMinus } from 'react-icons/fi';
import { motion } from "framer-motion";
import toast from 'react-hot-toast';

const FullMenu = ({ addToCart }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});

  const categories = ['Makanan', 'Minuman', 'Sate & Gorengan', 'Jajanan'];

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchTerm, selectedCategory, menuItems]);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('status', 'active');  // Hanya ambil item dengan status 'active'
      if (error) throw error;
      
      const itemsWithImageUrls = data.map((item) => ({
        ...item,
        image_url: getImageUrl(item.image_url)
      }));
  
      setMenuItems(itemsWithImageUrls);
      setQuantities(itemsWithImageUrls.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {}));
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to load menu items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imageUrl) => {
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    } else {
      return supabase.storage.from('menuimg').getPublicUrl(imageUrl).data.publicUrl;
    }
  };

  const filterItems = () => {
    let filtered = menuItems;
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredItems(filtered);
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

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-6 text-center">Semua Menu Kami</h1>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center">
        <div className="relative w-full sm:w-64 mb-4 sm:mb-0">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search menu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md"
          />
        </div>
        <div className="hidden sm:flex space-x-2 bg-gray-100 p-1 rounded-full">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-full transition-colors duration-200 ${
              selectedCategory === 'All' ? 'bg-primary text-white' : 'hover:bg-gray-200'
            }`}
          >
            Semua
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full transition-colors duration-200 ${
                selectedCategory === category ? 'bg-primary text-white' : 'hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:hidden border rounded-md px-4 py-2"
        >
          <option value="All">Kategori</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
          >
            <div className="bg-white p-4">
              <img 
                src={item.image_url} 
                alt={item.title} 
                className="w-full h-48 object-contain" // Kembalikan ke ukuran semula
              />
            </div>
            <div className="p-6 flex-grow flex flex-col bg-black text-white">
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-base text-gray-300 mb-4 flex-grow">{item.description}</p>
              <p className="font-bold text-lg mb-4">Rp {item.price.toLocaleString()}</p>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleDecrement(item.id)}
                    className="bg-white text-black rounded-full p-1 hover:bg-gray-200 transition-colors duration-200"
                  >
                    <FiMinus className="w-5 h-5" />
                  </button>
                  <span className="font-bold">{quantities[item.id]}</span>
                  <button 
                    onClick={() => handleIncrement(item.id)}
                    className="bg-white text-black rounded-full p-1 hover:bg-gray-200 transition-colors duration-200"
                  >
                    <FiPlus className="w-5 h-5" />
                  </button>
                </div>
                <button 
                  onClick={() => handleAddToCart(item.id)}
                  className="flex items-center space-x-2 bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
                >
                  <FiShoppingCart className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FullMenu;