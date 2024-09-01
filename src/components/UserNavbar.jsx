import React, { useState, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUser, FiLogOut, FiFileText, FiShoppingCart } from "react-icons/fi";
import { supabase } from '../services/supabase';

const UserNavbar = ({ session, userName, cartItemCount, openLoginModal, setIsCartOpen, scrollToSection, homeRef, aboutRef, menuRef, contactRef, notifications, setIsProfileOpen, handleTransactionHistoryClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleNavigation = useCallback((ref, section) => {
    if (location.pathname === '/fullmenu') {
      navigate('/', { state: { scrollTo: section } });
    } else {
      scrollToSection(ref);
    }
  }, [scrollToSection, navigate, location.pathname]);

  return (
    <>
      <nav className="bg-background/80 backdrop-blur-md py-4 px-6 md:px-10 flex items-center justify-between fixed top-0 left-0 right-0 z-50 shadow-md">
        <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
          <img src="/src/assets/logo.svg" alt="Logo" className="w-8 h-8" />
          <span className="text-2xl font-bold text-primary">Mas Pithik</span>
        </Link>
        <div className="flex items-center gap-6">
          <button onClick={() => handleNavigation(homeRef, 'home')} className="text-primary hover:text-accent transition-colors duration-200">Beranda</button>
          <button onClick={() => handleNavigation(aboutRef, 'about')} className="text-primary hover:text-accent transition-colors duration-200">Tentang</button>
          <button onClick={() => navigate('/fullmenu')} className="text-primary hover:text-accent transition-colors duration-200">Menu</button>
          <button onClick={() => handleNavigation(contactRef, 'contact')} className="text-primary hover:text-accent transition-colors duration-200">Kontak</button>
          {session ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 text-white bg-black hover:bg-gray-800 transition-colors duration-200 px-3 py-2 rounded-full"
              >
                <FiUser className="mr-2" />
                <span>{userName}</span>
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {notifications.length}
                  </span>
                )}
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-background rounded-md shadow-lg py-1">
                  <button
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-primary hover:bg-accent/10"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsProfileOpen(true);
                    }}
                  >
                    <FiUser className="mr-2" />
                    Profil
                  </button>
                  <button
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-primary hover:bg-accent/10"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleTransactionHistoryClick();
                    }}
                  >
                    <FiFileText className="mr-2" />
                    Riwayat Transaksi
                    {notifications.length > 0 && (
                      <span className="ml-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {notifications.length}
                      </span>
                    )}
                  </button>
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
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openLoginModal}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200"
            >
              Masuk
            </motion.button>
          )}
        </div>
      </nav>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 inline-flex items-center justify-center rounded-full bg-primary p-3 text-primary-foreground shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 z-50"
        onClick={() => setIsCartOpen(true)}
      >
        <FiShoppingCart size={24} />
        {cartItemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            {cartItemCount}
          </span>
        )}
      </motion.button>
    </>
  );
};

export default UserNavbar;