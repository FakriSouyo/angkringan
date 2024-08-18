import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX, FiShoppingCart, FiUser, FiLogOut, FiFileText, FiSettings } from "react-icons/fi";
import { supabase } from '../services/supabase';
import Profile from './Profile';
import TransactionHistory from './TransactionHistory';

export default function Navbar({ session, setIsCartOpen, openLoginModal, cartItemCount, scrollToSection, homeRef, aboutRef, menuRef, contactRef, hasCartItems, isAdmin }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTransactionHistoryOpen, setIsTransactionHistoryOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (session) {
      fetchUserName();
    }
  }, [session]);

  const fetchUserName = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      setUserName(data.name || 'User');
    } catch (error) {
      console.error('Error fetching user name:', error);
      setUserName('User');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
    navigate('/');
  };

  const handleNavigation = (path, ref) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => scrollToSection(ref), 100);
    } else {
      scrollToSection(ref);
    }
    setIsMenuOpen(false);
  };

  const renderAdminNav = () => (
    <nav className="hidden md:flex items-center gap-6">
      <Link to="/admin" className="text-primary hover:text-accent transition-colors duration-200">
        Dashboard
      </Link>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-2 text-white bg-black hover:bg-gray-800 transition-colors duration-200 px-3 py-2 rounded-full"
        >
          <FiUser className="mr-2" />
          <span>{userName}</span>
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
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center w-full text-left px-4 py-2 text-sm text-primary hover:bg-accent/10"
            >
              <FiLogOut className="mr-2" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );

  const renderUserNav = () => (
    <nav className="hidden md:flex items-center gap-6">
      {['Home', 'About', 'Menu', 'Contact'].map((item) => (
        <button
          key={item}
          onClick={() => item === "Menu" ? navigate('/full-menu') : handleNavigation('/', eval(`${item.toLowerCase()}Ref`))}
          className="text-primary hover:text-accent transition-colors duration-200"
        >
          {item}
        </button>
      ))}
      {session ? (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 text-white bg-black hover:bg-gray-800 transition-colors duration-200 px-3 py-2 rounded-full"
          >
            <FiUser className="mr-2" />
            <span>{userName}</span>
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
                Profile
              </button>
              <button
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-primary hover:bg-accent/10 "
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsTransactionHistoryOpen(true);
                  }}
                >
                  <FiFileText className="mr-2" />
                  Transaction History
                </button>
              <button
                onClick={handleLogout}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-primary hover:bg-accent/10"
              >
                <FiLogOut className="mr-2" />
                Logout
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
          Login
        </motion.button>
      )}
    </nav>
  );

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-background/80 backdrop-blur-md py-4 px-6 md:px-10 flex items-center justify-between fixed top-0 left-0 right-0 z-50 shadow-md"
      >
        <Link to={isAdmin ? "/admin" : "/"} className="flex items-center gap-2 transition-transform hover:scale-105">
          <span className="text-2xl font-bold text-primary">Angkringan</span>
        </Link>
        {isAdmin ? renderAdminNav() : renderUserNav()}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="md:hidden text-primary"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </motion.button>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed top-[72px] left-0 right-0 bg-background/95 backdrop-blur-md p-4 shadow-lg z-40"
          >
            {isAdmin ? (
              <>
                <Link
                  to="/admin"
                  className="text-primary hover:text-accent block py-2 transition-colors duration-200 w-full text-left"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  className="flex items-center text-primary hover:text-accent py-2 transition-colors duration-200 w-full text-left"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsProfileOpen(true);
                  }}
                >
                  <FiUser className="mr-2" />
                  Profile 
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center text-primary hover:text-accent py-2 transition-colors duration-200 w-full text-left"
                >
                  <FiLogOut className="mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                {['Home', 'About', 'Menu', 'Contact'].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      if (item === "Menu") {
                        navigate('/full-menu');
                      } else {
                        handleNavigation('/', eval(`${item.toLowerCase()}Ref`));
                      }
                      setIsMenuOpen(false);
                    }}
                    className="text-primary hover:text-accent block py-2 transition-colors duration-200 w-full text-left"
                  >
                    {item}
                  </button>
                ))}
                {session ? (
                  <>
                    <button
                      className="flex items-center text-primary hover:text-accent py-2 transition-colors duration-200 w-full text-left"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsProfileOpen(true);
                      }}
                    >
                      <FiUser className="mr-2" />
                      Profile 
                    </button>
                   <button
                  className="flex items-center text-primary hover:text-accent  py-2 transition-colors duration-200 w-full text-left"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsTransactionHistoryOpen(true);
                  }}
                >
                  <FiFileText className="mr-2" />
                  Transaction History
                </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center text-primary hover:text-accent py-2 transition-colors duration-200 w-full text-left"
                    >
                      <FiLogOut className="mr-2" />
                      Logout
                    </button>
                  </>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      openLoginModal();
                      setIsMenuOpen(false);
                    }}
                    className="w-full mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200"
                  >
                    Login
                  </motion.button>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Cart Button (only for non-admin users) */}
      {!isAdmin && (
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
      )}

      <Profile 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        session={session} 
      />
 <TransactionHistory
        isOpen={isTransactionHistoryOpen}
        onClose={() => setIsTransactionHistoryOpen(false)}
        session={session}
      />
    </>
  );
}