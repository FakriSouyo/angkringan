import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiHome, FiList, FiDollarSign, FiClock, FiUser, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { supabase } from '../services/supabase';

const AdminNavbar = ({ userName, setActiveTab }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleNavigation = useCallback((path) => {
    navigate(path);
    setActiveTab(path.split('/').pop());
    setIsMobileMenuOpen(false);
  }, [navigate, setActiveTab]);

  const NavItems = ({ isMobile }) => (
    <>
      <button 
        onClick={() => handleNavigation('/admin/overview')} 
        className={`text-primary hover:text-accent transition-colors duration-200 ${isMobile ? 'w-full text-left px-4 py-2 hover:bg-black hover:text-white' : ''}`}
      >
        <FiHome className="inline-block mr-2" />Ringkasan
      </button>
      <button 
        onClick={() => handleNavigation('/admin/menu')} 
        className={`text-primary hover:text-accent transition-colors duration-200 ${isMobile ? 'w-full text-left px-4 py-2 hover:bg-black hover:text-white' : ''}`}
      >
        <FiList className="inline-block mr-2" />Manajemen Menu
      </button>
      <button 
        onClick={() => handleNavigation('/admin/payments')} 
        className={`text-primary hover:text-accent transition-colors duration-200 ${isMobile ? 'w-full text-left px-4 py-2 hover:bg-black hover:text-white' : ''}`}
      >
        <FiDollarSign className="inline-block mr-2" />Pembayaran
      </button>
      <button 
        onClick={() => handleNavigation('/admin/transactions')} 
        className={`text-primary hover:text-accent transition-colors duration-200 ${isMobile ? 'w-full text-left px-4 py-2 hover:bg-black hover:text-white' : ''}`}
      >
        <FiClock className="inline-block mr-2" />Riwayat Transaksi
      </button>
    </>
  );

  return (
    <>
      <nav className="bg-background/80 backdrop-blur-md py-4 px-6 md:px-10 flex items-center justify-between fixed top-0 left-0 right-0 z-50 shadow-md">
        <Link to="/admin" className="flex items-center gap-2 transition-transform hover:scale-105">
          <img src="/src/assets/logo.svg" alt="Logo" className="w-8 h-8" />
          <span className="text-2xl font-bold text-primary">Admin Dashboard</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <NavItems />
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200"
            >
              <FiUser className="mr-2" />
              <span>{userName}</span>
            </motion.button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-background rounded-md shadow-lg py-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-primary hover:bg-accent/10"
                >
                  <FiLogOut className="mr-2" />
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
        <button
          className="md:hidden text-primary"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-16 bg-background z-40 md:hidden"
          >
            <div className="flex flex-col items-start py-4">
              <NavItems isMobile={true} />
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-primary hover:text-white hover:bg-black transition-colors duration-200"
              >
                <FiLogOut className="inline-block mr-2" />
                Keluar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminNavbar;